package com.tomiking.tomitrack;
import org.junit.Test;
import static org.junit.Assert.*;
public class CatalogImagePolicyTest {
 @Test public void allowsReviewedImageEndpoints(){
  assertTrue(CatalogImagePolicy.allows("https://static.wikia.nocookie.net/hotwheels/images/a/ab/Car.jpg/revision/latest/scale-to-width-down/640?cb=123"));
  assertTrue(CatalogImagePolicy.allows("https://www.bamca.org/pic/man/var/s_mb947-19.jpg"));
  assertTrue(CatalogImagePolicy.allows("https://www.takaratomy.co.jp/products/tomica/new/images/2609/pic_01.webp"));
  assertTrue(CatalogImagePolicy.allows("https://minicar.tomytec.co.jp/common/api/image.php?jancode=4543736340195&num=1"));
 }
 @Test public void rejectsOtherNetworkAccess(){
  for(String u:new String[]{"http://www.bamca.org/pic/man/var/a.jpg","https://www.bamca.org/cgi-bin/lineup.cgi","https://www.bamca.org.evil.test/pic/man/var/a.jpg","https://user@www.bamca.org/pic/man/var/a.jpg","https://www.bamca.org:8443/pic/man/var/a.jpg","https://minicar.tomytec.co.jp/common/api/image.php?jancode=4543736340195&num=1&redirect=https://evil.test","https://www.takaratomy.co.jp/products/tomica/new/images/%2e%2e/a.jpg","javascript:alert(1)"})assertFalse(u,CatalogImagePolicy.allows(u));
 }
}
