package com.tomiking.tomitrack;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.webkit.*;
import android.widget.Toast;
import androidx.webkit.WebViewAssetLoader;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public class MainActivity extends Activity {
    private WebView web;
    private AppUpdater updater;
    private ValueCallback<Uri[]> fileCallback;
    private String pendingExport;
    private static final int PICK_FILE=100, SAVE_FILE=101;
    private static final String HOST="appassets.androidplatform.net";
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        web = new WebView(this);
        setContentView(web);
        // Respect status/navigation bars and Android 15 enforced edge-to-edge.
        web.setOnApplyWindowInsetsListener((v,insets)->{v.setPadding(insets.getSystemWindowInsetLeft(),insets.getSystemWindowInsetTop(),insets.getSystemWindowInsetRight(),insets.getSystemWindowInsetBottom());return insets;});
        web.requestApplyInsets();
        web.setBackgroundColor(0xfff8f7f3);
        web.getSettings().setJavaScriptEnabled(true);
        web.getSettings().setDomStorageEnabled(true);
        web.getSettings().setAllowFileAccess(false);
        web.getSettings().setAllowContentAccess(true);
        web.getSettings().setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        web.addJavascriptInterface(new ExportBridge(),"TomiTrackNative");
        final WebViewAssetLoader loader=new WebViewAssetLoader.Builder().addPathHandler("/assets/",new WebViewAssetLoader.AssetsPathHandler(this)).build();
        web.setWebViewClient(new WebViewClient(){
            @Override public void onPageFinished(WebView view,String url){if(updater!=null&&url.startsWith("https://"+HOST+"/assets/web/app/"))updater.maybeAutoCheck();}
            @Override public WebResourceResponse shouldInterceptRequest(WebView view,WebResourceRequest request){
                if(HOST.equals(request.getUrl().getHost()))return loader.shouldInterceptRequest(request.getUrl());
                String authHost = getString(R.string.auth_host);
                if(!authHost.isEmpty() && "https".equals(request.getUrl().getScheme()) && authHost.equals(request.getUrl().getHost()))return null;
                return new WebResourceResponse("text/plain","UTF-8",new java.io.ByteArrayInputStream(new byte[0]));
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){
                Uri uri=request.getUrl();
                if("https".equals(uri.getScheme())&&HOST.equals(uri.getHost()))return false;
                if("https".equals(uri.getScheme()))try{startActivity(new Intent(Intent.ACTION_VIEW,uri));}catch(Exception e){Toast.makeText(MainActivity.this,"No browser available",Toast.LENGTH_SHORT).show();}
                return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient(){
            @Override public boolean onShowFileChooser(WebView view,ValueCallback<Uri[]> callback,FileChooserParams params){
                if(fileCallback!=null)fileCallback.onReceiveValue(null);
                fileCallback=callback;
                Intent intent=new Intent(Intent.ACTION_OPEN_DOCUMENT);intent.addCategory(Intent.CATEGORY_OPENABLE);
                String[] types=params.getAcceptTypes();
                boolean json=false;for(String type:types)if(type.contains("json"))json=true;
                intent.setType(json?"application/json":"image/*");
                try{startActivityForResult(intent,PICK_FILE);}catch(Exception e){fileCallback.onReceiveValue(null);fileCallback=null;return false;}return true;
            }
        });
        updater=new AppUpdater(this,web);
        web.loadUrl("https://"+HOST+"/assets/web/app/index.html");
    }
    public class ExportBridge {
        @JavascriptInterface public String getUpdateState(){return updater==null?"{}":updater.snapshot();}
        @JavascriptInterface public void checkForUpdates(){if(updater!=null)updater.check();}
        @JavascriptInterface public void downloadAndInstallUpdate(){if(updater!=null)updater.downloadAndInstall();}
        @JavascriptInterface public void resumeUpdateInstall(){if(updater!=null)updater.resumeInstall();}
        @JavascriptInterface public void setUpdateChecks(boolean enabled){if(updater!=null)updater.setAutoCheck(enabled);}
        @JavascriptInterface public void setTheme(String theme) {
            if(!"dark".equals(theme) && !"light".equals(theme))return;
            runOnUiThread(()->{
                boolean dark="dark".equals(theme);
                int background=dark?0xff10171f:0xfff8fafb;
                web.setBackgroundColor(background);
                getWindow().setStatusBarColor(background);
                getWindow().setNavigationBarColor(background);
                View decor=getWindow().getDecorView();
                int flags=decor.getSystemUiVisibility();
                int lightBars=View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR|View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
                decor.setSystemUiVisibility(dark?(flags&~lightBars):(flags|lightBars));
            });
        }
        @JavascriptInterface public void saveFile(String name,String content,String mime) {
            if(content.length()>50000000)return;
            runOnUiThread(()->{
                if(pendingExport!=null){Toast.makeText(MainActivity.this,"Finish the current export first",Toast.LENGTH_SHORT).show();return;}
                pendingExport=content;
                Intent intent=new Intent(Intent.ACTION_CREATE_DOCUMENT);intent.addCategory(Intent.CATEGORY_OPENABLE);intent.setType("text/csv".equals(mime)?"text/csv":"application/json");intent.putExtra(Intent.EXTRA_TITLE,name.replaceAll("[^a-zA-Z0-9._-]","_"));
                try{startActivityForResult(intent,SAVE_FILE);}catch(Exception e){pendingExport=null;Toast.makeText(MainActivity.this,"Could not open file picker",Toast.LENGTH_LONG).show();}
            });
        }
    }
    @Override protected void onActivityResult(int request,int result,Intent intent){
        super.onActivityResult(request,result,intent);
        if(request==PICK_FILE&&fileCallback!=null){fileCallback.onReceiveValue(result==RESULT_OK&&intent!=null&&intent.getData()!=null?new Uri[]{intent.getData()}:null);fileCallback=null;}
        if(request==SAVE_FILE){String content=pendingExport;pendingExport=null;if(result==RESULT_OK&&intent!=null&&intent.getData()!=null&&content!=null){try(OutputStream out=getContentResolver().openOutputStream(intent.getData())){if(out==null)throw new Exception("No output stream");out.write(content.getBytes(StandardCharsets.UTF_8));Toast.makeText(this,"Backup saved",Toast.LENGTH_SHORT).show();}catch(Exception e){Toast.makeText(this,"Could not save file",Toast.LENGTH_LONG).show();}}}
    }
    @Override public void onBackPressed(){web.evaluateJavascript("(()=>{const d=document.querySelector('dialog[open]');if(d){d.close();return true;}return false;})()",result->{if(!"true".equals(result)){if(web.canGoBack())web.goBack();else super.onBackPressed();}});}
    @Override protected void onResume(){super.onResume();if(updater!=null)updater.onResume();}
    @Override protected void onDestroy(){if(updater!=null)updater.destroy();if(fileCallback!=null)fileCallback.onReceiveValue(null);web.removeJavascriptInterface("TomiTrackNative");web.destroy();super.onDestroy();}
}
