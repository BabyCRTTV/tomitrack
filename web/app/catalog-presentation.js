import presentation from './catalog/presentation-data.js';
import {allowedCatalogImage} from './catalog-image-policy.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export {presentation};
export function englishRelease(release,seriesName){return {...release,seriesName,...presentation.translations[release.id]};}
/** Display-only overlay: never rewrite private collection snapshots or custom names. */
export function displayName(item){const t=presentation.translations[item.catalogReleaseId];return t&&item.name===t.originalName?t.name:item.name;}
export function displaySeries(item){const t=presentation.translations[item.catalogReleaseId];return t&&item.series===t.originalSeriesName?t.seriesName:item.series;}
export function displayColor(item){const t=presentation.translations[item.catalogReleaseId];return t&&item.color===t.originalColor?t.color:item.color;}
export function catalogPhoto(id){const photo=presentation.images[id];return photo&&allowedCatalogImage(photo.url)?photo:null;}
export function photoMarkup(item,{detail=false}={}){
 const id=item.catalogReleaseId||item.id,photo=catalogPhoto(id),name=displayName(item)||item.name||'Catalog release';
 const label=photo?.kind==='casting-reference'?'Casting reference':'Source photo';
 return `<span class="catalog-photo ${photo?'has-source':'photo-pending'}" role="group" aria-label="${esc(photo?label:'Photo pending')}">${photo?`<img src="${esc(detail&&allowedCatalogImage(photo.originalUrl)?photo.originalUrl:photo.url)}" ${photo.fallbackUrl&&allowedCatalogImage(photo.fallbackUrl)?`data-photo-fallback="${esc(photo.fallbackUrl)}"`:""} alt="${esc(name)} · ${label.toLowerCase()}" loading="${detail?'eager':'lazy'}" decoding="async" referrerpolicy="no-referrer">`:''}<span class="photo-fallback"><strong>${esc(item.productCode||item.brand||'TomiTrack')}</strong><span>${esc(name)}</span><small>${photo?'Photo unavailable':'Photo pending'}</small></span>${photo?`<span class="photo-kind">${label}</span>`:''}</span>`;
}
export function photoAttribution(id){const p=catalogPhoto(id);if(!p)return '<p class="small muted">A verified source photo has not been linked yet.</p>';return `<p class="photo-attribution small muted">${esc(p.kind==='casting-reference'?'Same casting; pictured color, year or decoration may differ.':'Source reference photo; confirm the pictured variant against your item.')} <a href="${esc(p.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(p.credit)} ↗</a>${p.originalUrl?` · <a href="${esc(p.originalUrl)}" target="_blank" rel="noopener noreferrer">Original resolution ↗</a>`:''}<br>Image rights remain with the source owner.</p>`;}
export function installPhotoFallbacks(root){root.addEventListener('error',e=>{const image=e.target;if(image?.tagName!=='IMG'||!image.closest('.catalog-photo'))return;const fallback=image.dataset.photoFallback;if(fallback&&allowedCatalogImage(fallback)){delete image.dataset.photoFallback;image.src=fallback;return}image.closest('.catalog-photo').classList.add('photo-failed');},true);}
