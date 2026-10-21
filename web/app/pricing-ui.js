import {convertedMsrp} from './pricing-core.js';
import {priceScope,priceSnapshot,quote} from './pricing.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const usd=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
const basis=q=>q.kind==='sold-average'?'Sold-price average':q.kind==='listing-average'?'Current listing average':q.kind==='historical-listing-average'?'Historical listing average':q.kind==='msrp-rule'?'MSRP growth basis':'No usable price';
export function catalogMarketPrice(id){
 if(!Object.hasOwn(priceScope,id))return '';
 const q=marketQuote(id);
 return `<button type="button" class="catalog-market-price" data-catalog-market-price="${esc(id)}" aria-label="Market Price ${q.amount===null?'unavailable':esc(usd(q.amount))}; view pricing details"><span>Market Price</span><strong>${q.amount===null?'Unavailable':esc(usd(q.amount))}</strong></button>`;
}
// Catalog references use boxed condition; a loose sale must never override boxed pricing.
function marketQuote(id){return quote(id,'Boxed');}

export function priceBadges(id){
 if(!Object.hasOwn(priceScope,id))return '';
 const p=priceSnapshot(),m=p.msrp[id],groups=['Boxed','Sealed','Loose'].map(c=>quote(id,c));
 const q=marketQuote(id),listed=['listing-average','historical-listing-average'].includes(q.kind);
 const formula=q.kind==='msrp-rule'?`<p><strong>MSRP growth basis.</strong> An MSRP-based pricing reference with annual growth applies where comparable market evidence is insufficient. Release age: ${q.years} calendar years; no condition adjustment.</p><p>USD conversion uses the reference rate dated ${esc(q.fxDate)}.</p>`:'';
 const listingEvidence=listed?`<p><strong>${esc(basis(q))}.</strong> ${esc(q.condition)} · ${q.sampleCount} independent sellers · ${esc(q.confidence)} evidence. Range ${usd(q.low)}–${usd(q.high)}; average ${usd(q.amount)}. ${q.excludedCount} outliers excluded. Item-price observations ${esc(q.oldestPriceAt?.slice(0,10))}–${esc(q.newestPriceAt?.slice(0,10))}.</p><p>Latest observation per listing and one comparable per seller. Current listings were verified within 30 days; historical listing prices within 180 days. Boxed/unopened asks share a group; loose listings stay separate. Shipping/tax are not added. Built-in shipping/import fees can affect asks, and accepted offers can be lower.</p>`:'';
 return `<section class="release-pricing" aria-label="Release pricing"><div class="price-badges"><button type="button" class="price-badge" data-price-panel="estimate" aria-expanded="false"><span>Market Price <strong>${q.amount===null?'Unavailable':esc(usd(q.amount))}</strong></span></button><button type="button" class="price-badge" data-price-panel="msrp" aria-expanded="false"><span>MSRP <strong>${m?usd(convertedMsrp(p,id)):'Not recorded'}</strong></span></button></div><div class="price-evidence" data-price-evidence="estimate" hidden>${formula}${listingEvidence}<p>Prices are indicative and actual selling prices can vary. Catalog prices use the boxed reference condition; linked collection copies use their saved condition. Every model uses the same priority: verified recent sold averages, then current listing averages, then historical listing prices, then an MSRP-based pricing reference with 10% annual growth. Sold averages require 3 exact-variant/condition single-item sales in 180 days. Listing averages require 3 independent sellers. Hidden accepted offers are never recorded as sold prices; active Best Offer asks are labeled as listings. With 5+ observations, interquartile-range outliers are removed.</p>${groups.filter(q=>q.kind==='sold-average'&&q.amount!==null).map(q=>`<p><strong>${q.condition}: ${usd(q.amount)}</strong> · ${q.sampleCount} comparable sales · ${q.excludedCount} outliers excluded</p>`).join('')||'<p>No condition currently has enough confirmed sales for a sold-price average.</p>'}<p>Price snapshot ${esc(p.asOf.slice(0,10))}. Prices check automatically every 48 hours while online; manual sync is in My garage.</p></div><div class="price-evidence" data-price-evidence="msrp" hidden>${m?`<p>Manufacturer-published Japan list price: <strong>${usd(convertedMsrp(p,id))} USD</strong>, converted from the tax-inclusive Japanese manufacturer price. FX date ${esc(p.fx.date)}. Recorded ${esc(m.observedAt.slice(0,10))}; not necessarily the historical launch price or a resale price.</p>`:'<p>No usable manufacturer price is published for this reference.</p>'}</div></section>`;
}
export function togglePricePanel(button){
 const kind=button.dataset.pricePanel;if(!kind)return false;
 const section=button.closest('.release-pricing'),open=button.getAttribute('aria-expanded')!=='true';
 for(const b of section.querySelectorAll('[data-price-panel]'))b.setAttribute('aria-expanded',String(open&&b===button));
 for(const p of section.querySelectorAll('[data-price-evidence]'))p.hidden=!(open&&p.dataset.priceEvidence===kind);
 return true;
}
