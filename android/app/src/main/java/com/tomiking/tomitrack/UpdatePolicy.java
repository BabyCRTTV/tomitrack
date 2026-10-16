package com.tomiking.tomitrack;

import java.net.URI;
import java.util.regex.Pattern;

/** Pure update policy, shared by the native updater and its JVM tests. */
public final class UpdatePolicy {
    private UpdatePolicy() {}
    public static final long MAX_APK_BYTES = 100L * 1024L * 1024L;
    private static final Pattern VERSION = Pattern.compile("(?:v)?[0-9]{1,5}\\.[0-9]{1,5}\\.[0-9]{1,5}");
    public static String version(String value) {
        if (value == null || !VERSION.matcher(value).matches()) throw new IllegalArgumentException("Invalid stable release version");
        return value.startsWith("v") ? value.substring(1) : value;
    }
    public static boolean newer(String candidate, String installed) {
        String[] a=version(candidate).split("\\."), b=version(installed).split("\\.");
        for(int i=0;i<3;i++){int x=Integer.parseInt(a[i]),y=Integer.parseInt(b[i]);if(x!=y)return x>y;}
        return false;
    }
    public static boolean asset(String tag,String name,String url,long size,String digest) {
        try {
            String v=version(tag);
            if(!name.equals("TomiTrack-"+v+"-early-access.apk")&&!name.equals("TomiTrack-"+v+".apk"))return false;
            if(!url.equals("https://github.com/BabyCRTTV/tomitrack/releases/download/v"+v+"/"+name))return false;
            return size>0 && size<=MAX_APK_BYTES && digest!=null && digest.matches("sha256:[0-9a-fA-F]{64}");
        } catch(Exception e){return false;}
    }
    public static boolean downloadHost(String url) {
        try {
            URI uri=new URI(url);String host=uri.getHost();
            return "https".equals(uri.getScheme()) && uri.getUserInfo()==null && (uri.getPort()==-1||uri.getPort()==443) &&
                ("github.com".equals(host)||"api.github.com".equals(host)||"release-assets.githubusercontent.com".equals(host)||"objects.githubusercontent.com".equals(host)||"github-releases.githubusercontent.com".equals(host));
        } catch(Exception e){return false;}
    }
}
