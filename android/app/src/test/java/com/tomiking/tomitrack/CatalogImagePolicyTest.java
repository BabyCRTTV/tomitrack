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
 @Test public void allowsOnlyReviewedMatchboyzPhotoPaths(){
  assertTrue(CatalogImagePolicy.allows("https://www.matchboyz.com/images/photos/2026/basic-2015-ford-f-150_10123_3_10313.jpg"));
  assertTrue(CatalogImagePolicy.allows("https://www.matchboyz.com/images/photos/2026/thumbnail/basic-2015-ford-f-150_10123_3_10313.jpg"));
  for(String u:new String[]{"https://www.matchboyz.com/images/photos/2022/basic-car_1_3_2.jpg","https://www.matchboyz.com/images/photos/2026/basic-car_1_11_2.jpg","https://www.matchboyz.com/images/photos/2026/basic-car_1_3_2.jpg?redirect=1","https://www.matchboyz.com.evil.test/images/photos/2026/basic-car_1_3_2.jpg","https://user@www.matchboyz.com/images/photos/2026/basic-car_1_3_2.jpg","https://www.matchboyz.com/images/photos/2026/%2e%2e/basic-car_1_3_2.jpg","https://www.matchboyz.com/matchbox-by-year/2026/basic"})assertFalse(u,CatalogImagePolicy.allows(u));
 }
 @Test public void allowsOnlyOfficialMallImagePaths(){
  assertTrue(CatalogImagePolicy.allows("https://takaratomymall.jp/img/goods/L/4904810950936_250ef9442d0248f4bc2b5a29990801fc.jpg"));
  for(String u:new String[]{"https://takaratomymall.jp/shop/g/g4904810950936/","https://takaratomymall.jp/img/goods/L/4904810950936_250ef9442d0248f4bc2b5a29990801fc.jpg?redirect=1","https://takaratomymall.jp.evil.test/img/goods/L/4904810950936_250ef9442d0248f4bc2b5a29990801fc.jpg"})assertFalse(u,CatalogImagePolicy.allows(u));
 }
 @Test public void rejectsOtherNetworkAccess(){
  for(String u:new String[]{"http://www.bamca.org/pic/man/var/a.jpg","https://www.bamca.org/cgi-bin/lineup.cgi","https://www.bamca.org.evil.test/pic/man/var/a.jpg","https://user@www.bamca.org/pic/man/var/a.jpg","https://www.bamca.org:8443/pic/man/var/a.jpg","https://minicar.tomytec.co.jp/common/api/image.php?jancode=4543736340195&num=1&redirect=https://evil.test","https://www.takaratomy.co.jp/products/tomica/new/images/%2e%2e/a.jpg","javascript:alert(1)"})assertFalse(u,CatalogImagePolicy.allows(u));
 }
}
