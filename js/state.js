var S = {
scr: 'login',
role: null, cid: null, trId: null, lRole: 'trainer', lMode: 'login',
tTab: 'dash', vCli: null, cliTab: 'log',
cTab: 'home',
day: 0, week: 1, unit: 'kg',
aSet: null, xNote: -1, xAlt: -1, rpe: null, swaps: {},
logs: {}, exN: {}, sN: {}, msgs: [], streak: {cur:0,best:0,lastDate:null}, prs: {},
clients: {}, unread: 0, expS: {}, cliData: {},
restTimer: {secs:0, iv:null},
sub: {plan:'pro', status:'trial', trialEndsAt:null, currentPeriodEnd:null},
clientPremium: false,
referralCode: null,
newPR: null,
nutriDate: null,
addFoodMeal: null,
sidebarOpen: false,
schedDate: null,
schedView: 'week',
clientFilter: 'all',
_msgListenerRef: null, _msgListenerFn: null, _msgListenerCid: null,
_aiFood: null, _photoData: null, _photoResult: null, _editFoodIdx: null,
dashCollapsed: {},
incomeMonth: null
};

function getPlan() { return PLANS[S.sub.plan] || PLANS.free; }
function trialExpired() { return S.sub.trialEndsAt ? Date.now() > S.sub.trialEndsAt : false; }
function canUse(feature) {
if (S.sub.status === 'trial' && !trialExpired()) return true;
return getPlan().features[feature] === true;
}
function canAddClient() {
if (S.sub.status === 'trial' && !trialExpired()) return true;
return Object.keys(S.clients).length < getPlan().clientLimit;
}
function daysRemaining() {
var end = S.sub.status === 'trial' ? S.sub.trialEndsAt : S.sub.currentPeriodEnd;
if (!end) return null;
return Math.max(0, Math.ceil((end - Date.now()) / 86400000));
}
function clientHasPremium() { return S.clientPremium === true; }
function generateReferralCode(name) {
var prefix = name.replace(/[^a-zA-Z]/g,'').toUpperCase().substring(0,3) || 'APT';
var suffix = Math.floor(Math.random() * 900 + 100).toString();
return prefix + suffix;
}
function loadSubscription() {
var cached = DB.get('sub_cache');
if (cached) S.sub = cached;
if (!DB._fb) return;
var tr = DB.get('trainer'); var uid = tr ? tr.uid : null; if (!uid) return;
var subRef = DB.fbRef('sub');
if (!subRef) return;
subRef.once('value').then(function(snap) {
var sub = snap.val();
if (sub) { S.sub = sub; DB.set('sub_cache', sub); }
else {
var trial = {plan:'pro',status:'trial',trialEndsAt:Date.now()+1209600000,currentPeriodEnd:null,updatedAt:Date.now()};
S.sub = trial; subRef.set(trial).catch(function(){}); DB.set('sub_cache', trial);
}
S.referralCode = DB.get('referral_code') || null;
R();
}).catch(function(){});
}
function loadClientPremium(cid) {
var cached = DB.get('premium_' + cid);
if (cached !== null) S.clientPremium = !!cached;
if (!DB._fb) return;
var premRef = DB.fbRef('cprem_'+cid);
if(!premRef)return;
premRef.once('value').then(function(snap) {
var p = snap.val();
if (p && p.active) {
S.clientPremium = !p.expiresAt || p.expiresAt > Date.now();
if (!S.clientPremium) premRef.child('active').set(false).catch(function(){});
} else { S.clientPremium = false; }
DB.set('premium_' + cid, S.clientPremium); R();
}).catch(function(){});
}
function setupReferral(uid, name, usedCode) {
var code = generateReferralCode(name);
S.referralCode = code; DB.set('referral_code', code);
if (!DB._fb) return;
DB._fb.ref('referrals/' + code).set({trainerUid:uid,trainerName:name,createdAt:Date.now()}).catch(function(){});
DB._fb.ref('trainerConfig/referralCode').set(code).catch(function(){});
if (usedCode) DB._fb.ref('referrals/' + usedCode + '/usedBy/' + uid).set(Date.now()).catch(function(){});
}
function trackUsage(event) {
if (!DB._fb) return;
var tr = DB.get('trainer'); var uid = tr ? tr.uid : null; if (!uid) return;
var month = new Date().toISOString().substring(0,7);
var upd = {}; upd[event] = firebase.database.ServerValue.increment(1); upd.lastSeen = Date.now();
DB._fb.ref('analytics/' + uid + '/' + month).update(upd).catch(function(){});
}
function goToCheckout(plan) {
var url = CHECKOUT_URLS[plan + '_monthly'];
if (url && url.indexOf('YOUR') === -1) window.open(url, '_blank');
else toast('Contact Ahmed to upgrade your plan', 'info');
}
function goToClientCheckout() {
var url = CHECKOUT_URLS['client_premium'];
if (url && url.indexOf('YOUR') === -1) window.open(url, '_blank');
else toast('Contact Ahmed to upgrade', 'info');
}
function toggleClientPremium(cid, currentlyActive) {
var ns = {active:!currentlyActive,grantedBy:'trainer',expiresAt:null,updatedAt:Date.now()};
var tpRef = DB.fbRef('cprem_'+cid); if (tpRef) tpRef.set(ns).catch(function(){});
DB.set('premium_' + cid, !currentlyActive);
if (S.cliData[cid]) S.cliData[cid].premium = ns;
toast(!currentlyActive ? 'Premium granted to client' : 'Premium revoked', 'ok'); R();
}
function copyReferralCode() {
if (S.referralCode && navigator.clipboard) { navigator.clipboard.writeText(S.referralCode); toast('Referral code copied', 'ok'); }
}
