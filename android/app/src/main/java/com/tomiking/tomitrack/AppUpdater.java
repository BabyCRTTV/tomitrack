package com.tomiking.tomitrack;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.webkit.WebView;
import androidx.core.content.FileProvider;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

/** Downloads only this repository's stable APKs; Android always owns installation approval. */
public final class AppUpdater {
    private static final String RELEASE_API="https://api.github.com/repos/BabyCRTTV/tomitrack/releases/latest";
    private static final long CHECK_INTERVAL=24L*60L*60L*1000L;
    private final Activity activity;
    private final WebView web;
    private final SharedPreferences prefs;
    private final ExecutorService executor=Executors.newSingleThreadExecutor();
    private final AtomicBoolean busy=new AtomicBoolean(false);
    private final String installedVersion;
    private volatile boolean destroyed=false,autoAttempted=false,waitingForPermission=false;
    private volatile Candidate candidate;
    private volatile String state="idle",message="",latestVersion="";
    private volatile int progress=0;
    private volatile File readyFile;
    private static final class Candidate {
        final String version,url,sha256; final long size;
        Candidate(String version,String url,String digest,long size){this.version=version;this.url=url;this.sha256=digest.substring(7).toLowerCase(Locale.US);this.size=size;}
    }
    public AppUpdater(Activity activity,WebView web){
        this.activity=activity;this.web=web;this.prefs=activity.getSharedPreferences("app-updates",Activity.MODE_PRIVATE);
        String version="0.0.0";try{version=activity.getPackageManager().getPackageInfo(activity.getPackageName(),0).versionName;}catch(Exception ignored){}
        installedVersion=version;
        File dir=new File(activity.getCacheDir(),"updates");File[] files=dir.listFiles();
        if(files!=null)for(File f:files)if(f.isFile()&&System.currentTimeMillis()-f.lastModified()>7L*CHECK_INTERVAL)f.delete();
    }
    public String snapshot(){
        JSONObject obj=new JSONObject();try{obj.put("status",state);obj.put("message",message);obj.put("progress",progress);obj.put("installedVersion",installedVersion);obj.put("latestVersion",latestVersion);obj.put("available",candidate!=null);obj.put("downloaded",readyFile!=null&&readyFile.isFile());obj.put("autoCheck",prefs.getBoolean("auto-check",true));}catch(Exception ignored){}
        return obj.toString();
    }
    private void emit(String next,String text,int percent){
        state=next;message=text;progress=percent;final String json=snapshot();
        if(destroyed)return;
        activity.runOnUiThread(()->{if(!destroyed&&web.getUrl()!=null&&web.getUrl().startsWith("https://appassets.androidplatform.net/assets/web/app/"))web.evaluateJavascript("window.dispatchEvent(new CustomEvent('tomitrack:update',{detail:"+json+"}));",null);});
    }
    public void setAutoCheck(boolean enabled){prefs.edit().putBoolean("auto-check",enabled).apply();emit(state,message,progress);}
    public void maybeAutoCheck(){
        if(autoAttempted||!prefs.getBoolean("auto-check",true))return;
        autoAttempted=true;
        if(System.currentTimeMillis()-prefs.getLong("last-check",0)>=CHECK_INTERVAL)check();
    }
    public void check(){
        if(destroyed||!busy.compareAndSet(false,true))return;
        executor.execute(()->{
            candidate=null;readyFile=null;waitingForPermission=false;
            prefs.edit().putLong("last-check",System.currentTimeMillis()).apply();
            emit("checking","Checking the latest TomiTrack release…",0);
            try{
                HttpURLConnection connection=connect(RELEASE_API,true);
                String text;
                try(InputStream in=connection.getInputStream()){text=readLimited(in,2*1024*1024);}finally{connection.disconnect();}
                JSONObject release=new JSONObject(text);
                if(release.optBoolean("draft")||release.optBoolean("prerelease"))throw new IOException("No stable release is available.");
                String version=UpdatePolicy.version(release.getString("tag_name"));latestVersion=version;
                if(!UpdatePolicy.newer(version,installedVersion)){candidate=null;emit("current","You are using the latest version.",0);}
                else{
                    JSONArray assets=release.getJSONArray("assets");Candidate found=null;
                    for(int i=0;i<assets.length();i++){JSONObject asset=assets.getJSONObject(i);String name=asset.optString("name"),url=asset.optString("browser_download_url"),digest=asset.optString("digest");long size=asset.optLong("size");if(UpdatePolicy.asset("v"+version,name,url,size,digest)){found=new Candidate(version,url,digest,size);break;}}
                    if(found==null){candidate=null;throw new IOException("The new APK is not ready yet. Try again shortly.");}
                    candidate=found;emit("available","TomiTrack "+version+" is ready to download.",0);
                }
            }catch(Exception e){emit("error",friendly(e,"Could not check for updates. Please try again later."),0);}
            finally{busy.set(false);}
        });
    }
    public void downloadAndInstall(){
        Candidate update=candidate;
        if(update==null||destroyed||!busy.compareAndSet(false,true))return;
        executor.execute(()->{
            readyFile=null;
            File dir=new File(activity.getCacheDir(),"updates"),partial=new File(dir,"update.pending.apk"),complete=new File(dir,"TomiTrack-update.apk");
            try{
                if(!dir.exists()&&!dir.mkdirs())throw new IOException("Could not prepare the download folder.");
                emit("downloading","Downloading TomiTrack "+update.version+"…",0);
                HttpURLConnection connection=connect(update.url,false);
                MessageDigest digest=MessageDigest.getInstance("SHA-256");long total=0,lastProgress=0;
                try(InputStream in=connection.getInputStream();OutputStream out=new FileOutputStream(partial)){
                    byte[] buffer=new byte[32768];int count;
                    while((count=in.read(buffer))!=-1){
                        if(destroyed||Thread.currentThread().isInterrupted())throw new InterruptedIOException();
                        total+=count;if(total>update.size||total>UpdatePolicy.MAX_APK_BYTES)throw new IOException("The APK size did not match the release.");
                        out.write(buffer,0,count);digest.update(buffer,0,count);
                        long now=System.currentTimeMillis();if(now-lastProgress>300){lastProgress=now;emit("downloading","Downloading update…",(int)(total*100/update.size));}
                    }
                }finally{connection.disconnect();}
                if(total!=update.size||!hex(digest.digest()).equals(update.sha256))throw new IOException("The download could not be verified. Please download it again.");
                verifyPackage(partial,update.version);
                if(complete.exists()&&!complete.delete())throw new IOException("Could not replace the previous download.");
                if(!partial.renameTo(complete))throw new IOException("Could not finish the download.");
                readyFile=complete;emit("ready","Verified update. Opening Android installation…",100);
                activity.runOnUiThread(this::installReady);
            }catch(Exception e){partial.delete();emit("error",friendly(e,"Could not download the update. Please try again."),0);}
            finally{busy.set(false);}
        });
    }
    private void verifyPackage(File file,String expectedVersion)throws Exception{
        PackageManager pm=activity.getPackageManager();int flags=Build.VERSION.SDK_INT>=28?PackageManager.GET_SIGNING_CERTIFICATES:PackageManager.GET_SIGNATURES;
        PackageInfo downloaded=pm.getPackageArchiveInfo(file.getAbsolutePath(),flags),installed=pm.getPackageInfo(activity.getPackageName(),flags);
        if(downloaded==null||!activity.getPackageName().equals(downloaded.packageName)||!expectedVersion.equals(downloaded.versionName))throw new IOException("This file is not the expected TomiTrack update.");
        long nextCode=Build.VERSION.SDK_INT>=28?downloaded.getLongVersionCode():downloaded.versionCode;
        long oldCode=Build.VERSION.SDK_INT>=28?installed.getLongVersionCode():installed.versionCode;
        if(nextCode<=oldCode)throw new IOException("This APK is not newer than the installed app.");
        Set<String> next=signatures(downloaded),old=signatures(installed);
        if(next.isEmpty()||!next.equals(old))throw new IOException("The update signature does not match this installation. Open the official downloads page for help.");
    }
    private Set<String> signatures(PackageInfo info)throws Exception{
        Signature[] signatures=Build.VERSION.SDK_INT>=28?(info.signingInfo==null?null:info.signingInfo.getApkContentsSigners()):info.signatures;
        Set<String> result=new HashSet<>();if(signatures!=null)for(Signature s:signatures)result.add(hex(MessageDigest.getInstance("SHA-256").digest(s.toByteArray())));return result;
    }
    private void installReady(){
        if(destroyed||readyFile==null||!readyFile.isFile())return;
        try{
            if(Build.VERSION.SDK_INT>=26&&!activity.getPackageManager().canRequestPackageInstalls()){
                waitingForPermission=true;emit("permission","Allow updates from TomiTrack in Android settings, then return here. Your collection stays in place.",100);
                activity.startActivity(new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,Uri.parse("package:"+activity.getPackageName())));return;
            }
            waitingForPermission=false;
            // Revalidate after returning from Android settings before granting temporary read access.
            Candidate update=candidate;if(update==null)throw new IOException("Check for updates again before installing.");
            verifyPackage(readyFile,update.version);
            Uri uri=FileProvider.getUriForFile(activity,activity.getPackageName()+".updates",readyFile);
            Intent install=new Intent(Intent.ACTION_VIEW);install.setDataAndType(uri,"application/vnd.android.package-archive");install.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            emit("installing","Confirm Update in Android. Your collection and settings are kept.",100);
            activity.startActivity(install);
        }catch(Exception e){emit("error",friendly(e,"Android could not open the installer. Use the official APK download instead."),100);}
    }
    public void onResume(){
        if("installing".equals(state)&&!waitingForPermission)emit("ready","You can reopen the Android installer when you are ready.",100);
        if(waitingForPermission){waitingForPermission=false;if(Build.VERSION.SDK_INT>=26&&activity.getPackageManager().canRequestPackageInstalls())installReady();else emit("ready","Installation permission was not granted. You can try again or use the official download page.",100);}
    }
    public void resumeInstall(){activity.runOnUiThread(this::installReady);}
    public void destroy(){destroyed=true;executor.shutdownNow();}
    private HttpURLConnection connect(String address,boolean api)throws Exception{
        String url=address;
        for(int redirects=0;redirects<6;redirects++){
            if(!UpdatePolicy.downloadHost(url))throw new IOException("The update download host is not trusted.");
            HttpURLConnection c=(HttpURLConnection)new URL(url).openConnection();c.setInstanceFollowRedirects(false);c.setConnectTimeout(15000);c.setReadTimeout(30000);c.setRequestProperty("User-Agent","TomiTrack-Android/"+installedVersion);c.setRequestProperty("Accept",api?"application/vnd.github+json":"application/octet-stream");
            int code=c.getResponseCode();
            if(code>=300&&code<400){String location=c.getHeaderField("Location");c.disconnect();if(location==null)throw new IOException("Invalid update redirect.");url=new URL(new URL(url),location).toString();continue;}
            if(code!=200){c.disconnect();throw new IOException(code==403||code==429?"Update checks are temporarily rate limited. Try again later.":"Update server is unavailable. Try again later.");}
            return c;
        }
        throw new IOException("Too many update redirects.");
    }
    private static String readLimited(InputStream in,int limit)throws IOException{
        ByteArrayOutputStream out=new ByteArrayOutputStream();byte[] buffer=new byte[8192];int count;
        while((count=in.read(buffer))!=-1){if(out.size()+count>limit)throw new IOException("The release response was too large.");out.write(buffer,0,count);}return out.toString(StandardCharsets.UTF_8.name());
    }
    private static String friendly(Exception error,String fallback){return error instanceof IOException&&error.getMessage()!=null?error.getMessage():fallback;}
    private static String hex(byte[] bytes){StringBuilder s=new StringBuilder();for(byte b:bytes)s.append(String.format(Locale.US,"%02x",b&255));return s.toString();}
}
