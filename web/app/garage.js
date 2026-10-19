import {cleanItem} from './domain.js';

// Catalog identity is taken from the selected release, never from editable form fields.
export const RELEASE_FIELDS = ['name','brand','series','releaseYear','productCode','collectorNumber','seriesNumber','manNumber','catalogReleaseId','catalogCastingId'];
export function prepareGarageItem(input,{existing=null,selected=null}={}) {
  if (!existing && (!selected?.catalogReleaseId || !selected?.catalogCastingId)) {
    throw new Error('Choose a release from the catalog before adding it to your garage.');
  }
  const identity=existing||selected;
  const next={...input,valuationMode:input.valuationMode??existing?.valuationMode??'manual',id:existing?.id||'',added:existing?.added||''};
  if (identity.catalogReleaseId) for (const field of RELEASE_FIELDS) next[field]=identity[field]??'';
  else {next.catalogReleaseId='';next.catalogCastingId='';}
  return cleanItem(next);
}
