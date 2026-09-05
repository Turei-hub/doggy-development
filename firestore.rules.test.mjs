/**
 * Doggy Development — security rules test suite.
 *
 * The gallery's whole promise is that nothing a client submits can reach the
 * public site without you approving it. That promise lives in firestore.rules,
 * so it is worth being able to prove rather than trust. This file does that.
 *
 * Run it:
 *
 *   npm install
 *   npm test
 *
 * It boots the local Firestore emulator, replays every attack and every normal
 * action against your real rules file, and prints a pass/fail line for each.
 * Nothing touches your live project. Re-run it any time you change the rules.
 *
 * Your real admin UID is swapped for a test one, so it works before setup too.
 */

import { initializeTestEnvironment, assertFails, assertSucceeds }
  from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, addDoc,
         query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import fs from 'fs';

const PHOTO = 'data:image/jpeg;base64,' + 'A'.repeat(2000);
const BIG   = 'data:image/jpeg;base64,' + 'A'.repeat(410000);

const env = await initializeTestEnvironment({
  projectId: 'dd-test',
  firestore: { rules: fs.readFileSync('firestore.rules','utf8').replace(/'PASTE_YOUR_FIREBASE_UID_HERE'|'[A-Za-z0-9]{20,}'/g, "'ADMIN_UID_123'"), host:'127.0.0.1', port:8085 }
});

const pub   = env.unauthenticatedContext().firestore();
const admin = env.authenticatedContext('ADMIN_UID_123').firestore();
const rando = env.authenticatedContext('SOME_OTHER_USER').firestore();

// seed one approved + one pending, bypassing rules
await env.withSecurityRulesDisabled(async (c) => {
  const db = c.firestore();
  await setDoc(doc(db,'dogs/live1'),    { name:'Ruby', where:'Kelpie', story:'x', photo:PHOTO, status:'approved', created:new Date() });
  await setDoc(doc(db,'dogs/pending1'), { name:'Spam', where:'',       story:'', photo:PHOTO, status:'pending',  created:new Date() });
  await setDoc(doc(db,'bookings/probe1'), { name:'Probe', phone:'021 000 0000', status:'new', created:new Date() });
});

let pass=0, fail=0;
const t = async (name, fn) => {
  try { await fn(); console.log('  PASS  ' + name); pass++; }
  catch (e) { console.log('  FAIL  ' + name + '  → ' + (e.message||e).slice(0,110)); fail++; }
};

console.log('\nThe public can:');
await t('read an approved dog',
  () => assertSucceeds(getDoc(doc(pub,'dogs/live1'))));
await t('list approved dogs (query filtered on status)',
  () => assertSucceeds(getDocs(query(collection(pub,'dogs'), where('status','==','approved')))));
await t('submit a valid pending dog',
  () => assertSucceeds(addDoc(collection(pub,'dogs'),
        { name:'Bo', where:'Staffy', story:'hi', photo:PHOTO, status:'pending', created:serverTimestamp() })));

console.log('\nThe public CANNOT:');
await t('read a pending dog',
  () => assertFails(getDoc(doc(pub,'dogs/pending1'))));
await t('list every dog (unfiltered query)',
  () => assertFails(getDocs(collection(pub,'dogs'))));
await t('list pending dogs',
  () => assertFails(getDocs(query(collection(pub,'dogs'), where('status','==','pending')))));
await t('self-publish by submitting status approved',
  () => assertFails(addDoc(collection(pub,'dogs'),
        { name:'Evil', where:'', story:'', photo:PHOTO, status:'approved', created:serverTimestamp() })));
await t('approve an existing pending dog',
  () => assertFails(updateDoc(doc(pub,'dogs/pending1'), { status:'approved' })));
await t('delete a live dog',
  () => assertFails(deleteDoc(doc(pub,'dogs/live1'))));
await t('edit a live dog',
  () => assertFails(updateDoc(doc(pub,'dogs/live1'), { story:'defaced' })));
await t('submit an oversized photo',
  () => assertFails(addDoc(collection(pub,'dogs'),
        { name:'Big', where:'', story:'', photo:BIG, status:'pending', created:serverTimestamp() })));
await t('submit a non-image photo field (script payload)',
  () => assertFails(addDoc(collection(pub,'dogs'),
        { name:'X', where:'', story:'', photo:'javascript:alert(1)', status:'pending', created:serverTimestamp() })));
await t('smuggle an extra field',
  () => assertFails(addDoc(collection(pub,'dogs'),
        { name:'X', where:'', story:'', photo:PHOTO, status:'pending', created:serverTimestamp(), isAdmin:true })));
await t('backdate the created timestamp',
  () => assertFails(addDoc(collection(pub,'dogs'),
        { name:'X', where:'', story:'', photo:PHOTO, status:'pending', created:new Date(0) })));
await t('submit an over-long story',
  () => assertFails(addDoc(collection(pub,'dogs'),
        { name:'X', where:'', story:'z'.repeat(400), photo:PHOTO, status:'pending', created:serverTimestamp() })));
await t('write anywhere else in the database',
  () => assertFails(setDoc(doc(pub,'settings/anything'), { x:1 })));

console.log('\nA signed-in non-admin CANNOT:');
await t('read the pending queue',
  () => assertFails(getDocs(query(collection(rando,'dogs'), where('status','==','pending')))));
await t('approve a dog',
  () => assertFails(updateDoc(doc(rando,'dogs/pending1'), { status:'approved' })));

console.log('\nBooking enquiries — the public can:');
await t('send an enquiry',
  () => assertSucceeds(addDoc(collection(pub,'bookings'),
        { name:'Sam', phone:'021 234 5678', email:'s@e.co.nz', suburb:'Milford',
          dog:'Ruby, kelpie', message:'hi', status:'new', created:serverTimestamp() })));
await t('send one with only a name and phone',
  () => assertSucceeds(addDoc(collection(pub,'bookings'),
        { name:'Jo', phone:'0211', status:'new', created:serverTimestamp() })));

console.log('\nBooking enquiries — the public CANNOT:');
await t('read anyone\'s enquiry (these hold names and phone numbers)',
  () => assertFails(getDocs(collection(pub,'bookings'))));
await t('read enquiries even when filtering, the way they can with dogs',
  () => assertFails(getDocs(query(collection(pub,'bookings'), where('status','==','new')))));
await t('read back the one they just sent',
  () => assertFails(getDoc(doc(pub,'bookings/anything'))));
await t('mark an enquiry handled',
  () => assertFails(updateDoc(doc(pub,'bookings/probe1'), { status:'done' })));
await t('delete an enquiry',
  () => assertFails(deleteDoc(doc(pub,'bookings/probe1'))));
await t('send one already marked handled',
  () => assertFails(addDoc(collection(pub,'bookings'),
        { name:'X', phone:'021', status:'done', created:serverTimestamp() })));
await t('send one with no phone number',
  () => assertFails(addDoc(collection(pub,'bookings'),
        { name:'X', phone:'', status:'new', created:serverTimestamp() })));
await t('smuggle an extra field into an enquiry',
  () => assertFails(addDoc(collection(pub,'bookings'),
        { name:'X', phone:'021', status:'new', created:serverTimestamp(), admin:true })));
await t('send a 5000-character message',
  () => assertFails(addDoc(collection(pub,'bookings'),
        { name:'X', phone:'021', message:'z'.repeat(5000), status:'new', created:serverTimestamp() })));

console.log('\nBooking enquiries — a signed-in non-admin CANNOT:');
await t('read the enquiries',
  () => assertFails(getDocs(collection(rando,'bookings'))));

console.log('\nBooking enquiries — the admin CAN:');
await t('read every enquiry',
  () => assertSucceeds(getDocs(collection(admin,'bookings'))));
await t('list new enquiries',
  () => assertSucceeds(getDocs(query(collection(admin,'bookings'), where('status','==','new')))));
await t('mark one handled',
  () => assertSucceeds(updateDoc(doc(admin,'bookings/probe1'), { status:'done' })));
await t('delete one',
  () => assertSucceeds(deleteDoc(doc(admin,'bookings/probe1'))));

console.log('\nThe admin CAN:');
await t('list pending dogs',
  () => assertSucceeds(getDocs(query(collection(admin,'dogs'), where('status','==','pending')))));
await t('list every dog',
  () => assertSucceeds(getDocs(collection(admin,'dogs'))));
await t('approve a pending dog',
  () => assertSucceeds(updateDoc(doc(admin,'dogs/pending1'), { status:'approved' })));
await t('publish a dog directly',
  () => assertSucceeds(addDoc(collection(admin,'dogs'),
        { name:'Moss', where:'Collie', story:'', photo:PHOTO, status:'approved', created:serverTimestamp() })));
await t('delete a dog',
  () => assertSucceeds(deleteDoc(doc(admin,'dogs/live1'))));

await env.cleanup();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
