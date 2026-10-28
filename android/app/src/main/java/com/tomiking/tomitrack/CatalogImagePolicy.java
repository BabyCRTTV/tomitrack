package com.tomiking.tomitrack;

import java.net.URI;
/** Source-only image access for the packaged app. No general browsing/network bridge. */
public final class CatalogImagePolicy {
    private CatalogImagePolicy() {}
    public static boolean allows(String value) {
        try {
            URI u=new URI(value);
            if(!"https".equals(u.getScheme())||u.getUserInfo()!=null||u.getPort()!=-1||u.getFragment()!=null)return false;
            String p=u.getRawPath(),host=u.getHost();
            if(p==null||p.matches("(?i).*%(2f|5c|2e).*"))return false;
            if("static.wikia.nocookie.net".equals(host))return p.matches("/hotwheels/images/[a-f0-9]/[a-f0-9]{2}/[^/]+(?:/revision/latest(?:/scale-to-width-down/[0-9]+)?)?");
            if("www.matchboyz.com".equals(host))return u.getRawQuery()==null&&p.matches("/images/photos/2026/(?:thumbnail/)?basic-[a-z0-9-]+_[0-9]+_3_[0-9]+\\.jpg");
            if("www.bamca.org".equals(host))return u.getRawQuery()==null&&p.matches("(?i)/pic/(?:man(?:/var)?|prod/[a-z]+)/[\\w.-]+\\.(?:jpe?g|png|webp)");
            if("www.takaratomy.co.jp".equals(host))return u.getRawQuery()==null&&p.matches("(?i)/products/tomica/new/images/[\\w/-]+\\.(?:jpe?g|png|gif|webp)");
            if("minicar.tomytec.co.jp".equals(host)&&"/common/api/image.php".equals(p))return u.getRawQuery()!=null&&u.getRawQuery().matches("(?:jancode=[0-9]{13}&num=[0-9]{1,2}|num=[0-9]{1,2}&jancode=[0-9]{13})");
        } catch(Exception ignored) {}
        return false;
    }
}
