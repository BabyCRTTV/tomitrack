import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareGarageItem} from '../web/app/garage.js';
import {cleanItem,validateBackup} from '../web/app/domain.js';
const selected={name:'Catalog Skyline',brand:'Tomica',series:'Mainline',releaseYear:2025,productCode:'TM-1',catalogReleaseId:'tm-release',catalogCastingId:'tm-casting'};
test('new garage entries require a selected catalog release, even with forged hidden fields',()=>{
  assert.throws(()=>prepareGarageItem({...selected,quantity:1}),/Choose a release/);
  assert.throws(()=>prepareGarageItem({name:'Custom',quantity:1},{selected:{catalogReleaseId:'fake'}}),/Choose a release/);
});
test('catalog identity survives form tampering while per-copy details remain editable',()=>{
  const copy=prepareGarageItem({name:'Custom car',brand:'Other',catalogReleaseId:'forged',catalogCastingId:'forged',productCode:'fake',quantity:2,color:'Inspected blue',paid:4,notes:'Shelf A'},{selected});
  assert.equal(copy.name,selected.name);assert.equal(copy.brand,selected.brand);assert.equal(copy.catalogReleaseId,selected.catalogReleaseId);assert.equal(copy.catalogCastingId,selected.catalogCastingId);assert.equal(copy.productCode,selected.productCode);
  assert.equal(copy.quantity,2);assert.equal(copy.color,'Inspected blue');assert.equal(copy.notes,'Shelf A');
  const edited=prepareGarageItem({...copy,id:'another',name:'Renamed',catalogReleaseId:'another',quantity:3},{existing:copy});
  assert.equal(edited.id,copy.id);assert.equal(edited.added,copy.added);assert.equal(edited.name,copy.name);assert.equal(edited.quantity,3);
});
test('existing legacy copies and backups remain editable without inventing catalog links',()=>{
  const old=cleanItem({name:'Earlier model',brand:'Mini GT',quantity:1,notes:'Keep me'});
  const edited=prepareGarageItem({...old,quantity:2,catalogReleaseId:'forged'},{existing:old});
  assert.equal(edited.id,old.id);assert.equal(edited.catalogReleaseId,'');assert.equal(edited.quantity,2);
  assert.deepEqual(validateBackup({format:'tomitrack',schema:1,items:[edited]}).items,[edited]);
});
test('two copies of one catalog release retain separate collection identities',()=>{
  const a=prepareGarageItem({quantity:1,id:'injected'},{selected}),b=prepareGarageItem({quantity:1,id:'injected'},{selected});
  assert.notEqual(a.id,b.id);assert.equal(a.catalogReleaseId,b.catalogReleaseId);
});
