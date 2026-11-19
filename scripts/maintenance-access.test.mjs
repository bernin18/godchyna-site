import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifyMaintenanceAdmin } from '../src/maintenanceAccess.ts';

test('anonymous visitor never receives the site',async()=>{
  assert.equal(await verifyMaintenanceAdmin(null,async()=>{throw Error('must not call')},async()=>{throw Error('must not call')}),false);
});
test('authenticated ordinary user remains in maintenance',async()=>{
  assert.equal(await verifyMaintenanceAdmin('viewer',async()=>({id:'viewer'}),async()=>'user'),false);
});
test('verified admin can enter',async()=>{
  assert.equal(await verifyMaintenanceAdmin('admin-id',async()=>({id:'admin-id'}),async id=>id==='admin-id'?'admin':null),true);
});
test('a stale session cannot borrow another users admin role',async()=>{
  assert.equal(await verifyMaintenanceAdmin('old-id',async()=>({id:'new-id'}),async()=>{throw Error('must not look up another identity')}),false);
});
test('expired sessions, missing profiles and network errors fail closed',async()=>{
  assert.equal(await verifyMaintenanceAdmin('id',async()=>null,async()=>'admin'),false);
  assert.equal(await verifyMaintenanceAdmin('id',async()=>({id:'id'}),async()=>null),false);
  assert.equal(await verifyMaintenanceAdmin('id',async()=>{throw Error('network')},async()=>'admin'),false);
  assert.equal(await verifyMaintenanceAdmin('id',async()=>({id:'id'}),async()=>{throw Error('profile error')}),false);
});
