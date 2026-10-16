package com.tomiking.tomitrack;
import org.junit.Test;
import static org.junit.Assert.*;

public class UpdatePolicyTest {
    private final String hash="sha256:"+new String(new char[64]).replace('\0','a');
    @Test public void numericVersionsPreventDowngrades(){assertTrue(UpdatePolicy.newer("v0.2.10","0.2.9"));assertTrue(UpdatePolicy.newer("1.0.0","0.99.99"));assertFalse(UpdatePolicy.newer("0.2.0","0.2.0"));assertFalse(UpdatePolicy.newer("0.1.9","0.2.0"));}
    @Test public void rejectsPrereleaseAndMalformedVersions(){for(String v:new String[]{"v0.2.1-beta","v0.2","1.2.3/evil","-1.0.0","999999999.0.0"}){try{UpdatePolicy.version(v);fail(v);}catch(IllegalArgumentException expected){}}}
    @Test public void acceptsOnlyExactRepositoryApkAndDigest(){assertTrue(UpdatePolicy.asset("v0.2.1","TomiTrack-0.2.1-early-access.apk","https://github.com/BabyCRTTV/tomitrack/releases/download/v0.2.1/TomiTrack-0.2.1-early-access.apk",1400000,hash));assertTrue(UpdatePolicy.asset("v0.2.1","TomiTrack-0.2.1.apk","https://github.com/BabyCRTTV/tomitrack/releases/download/v0.2.1/TomiTrack-0.2.1.apk",1400000,hash));}
    @Test public void rejectsWrongProjectWrongNameBadDigestOrSize(){String url="https://github.com/BabyCRTTV/tomitrack/releases/download/v0.2.1/TomiTrack-0.2.1.apk";assertFalse(UpdatePolicy.asset("v0.2.1","TomiTrack-0.2.1.apk",url.replace("tomitrack/","other/"),5,hash));assertFalse(UpdatePolicy.asset("v0.2.1","evil.apk",url,5,hash));assertFalse(UpdatePolicy.asset("v0.2.1","TomiTrack-0.2.1.apk",url,0,hash));assertFalse(UpdatePolicy.asset("v0.2.1","TomiTrack-0.2.1.apk",url,UpdatePolicy.MAX_APK_BYTES+1,hash));assertFalse(UpdatePolicy.asset("v0.2.1","TomiTrack-0.2.1.apk",url,5,"not-a-hash"));assertFalse(UpdatePolicy.asset("v0.2.1","TomiTrack-0.2.1.apk",url+"?redirect=evil",5,hash));}
    @Test public void redirectPolicyAllowsOfficialHostsOnly(){assertTrue(UpdatePolicy.downloadHost("https://release-assets.githubusercontent.com/file?token=temporary"));assertTrue(UpdatePolicy.downloadHost("https://objects.githubusercontent.com/file"));for(String url:new String[]{"http://github.com/file","https://github.com.evil.test/file","https://user:password@github.com/file","https://github.com:8443/file","file:///tmp/file.apk","https://evil.githubusercontent.com/file"})assertFalse(url,UpdatePolicy.downloadHost(url));}
}
