/** Only source-image endpoints used by the reviewed public catalog. */
export function allowedCatalogImage(value){
 try{
  const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||u.port||u.hash||/%(?:2f|5c|2e)/i.test(u.pathname))return false;
  if(u.hostname==='static.wikia.nocookie.net')return /^\/hotwheels\/images\/[a-f0-9]\/[a-f0-9]{2}\/[^/]+(?:\/revision\/latest(?:\/scale-to-width-down\/\d+)?)?$/.test(u.pathname);
  if(u.hostname==='www.matchboyz.com')return /^\/images\/photos\/2026\/(?:thumbnail\/)?basic-[a-z0-9-]+_\d+_3_\d+\.jpg$/.test(u.pathname)&&!u.search;
  if(u.hostname==='takaratomymall.jp')return /^\/img\/goods\/L\/\d{13}_[a-f0-9]{32}\.jpg$/.test(u.pathname)&&!u.search;
  if(u.hostname==='www.bamca.org')return /^\/pic\/(?:man(?:\/var)?|prod\/[a-z]+)\/[\w.-]+\.(?:jpe?g|png|webp)$/i.test(u.pathname)&&!u.search;
  if(u.hostname==='www.takaratomy.co.jp')return /^\/products\/tomica\/new\/images\/[\w/-]+\.(?:jpe?g|png|gif|webp)$/i.test(u.pathname)&&!u.search;
  if(u.hostname==='minicar.tomytec.co.jp')return u.pathname==='/common/api/image.php'&&/^\d{13}$/.test(u.searchParams.get('jancode')||'')&&/^\d{1,2}$/.test(u.searchParams.get('num')||'')&&[...u.searchParams.keys()].every(k=>['jancode','num'].includes(k));
 }catch{}
 return false;
}
