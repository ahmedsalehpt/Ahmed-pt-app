function renderLogin() {
var isT = S.lRole === 'trainer';
var tdata = localStorage.getItem('trainer') ? JSON.parse(localStorage.getItem('trainer')) : null;
var trainerName = tdata ? (tdata.name||'') : '';
return '<div class="login-wrap"><div class="login-box">' +
'<div class="login-logo">' +
'<div style="font-size:52px;margin-bottom:12px">&#128170;</div>' +
'<div style="font-size:9px;letter-spacing:3px;color:#ec4899;font-weight:700;margin-bottom:6px">PT MANAGER</div>' +
'<div style="font-size:28px;font-weight:800;color:#fff;letter-spacing:-.5px">'+(trainerName?'Welcome back':'Welcome')+'</div>' +
(trainerName?'<div style="font-size:13px;color:var(--m1);margin-top:4px">'+trainerName+'\'s training app</div>':'')+
'</div>' +
'<div class="role-grid">' +
'<div class="role-card' + (isT?' on':'') + '" onclick="S.lRole=\'trainer\';S.lMode=\'login\';R()">' +
'<div style="font-size:28px;margin-bottom:6px">&#128203;</div>' +
'<div style="font-size:13px;font-weight:700;color:#fff">Trainer</div>' +
'<div style="font-size:10px;color:var(--m1);margin-top:2px">Manage clients</div></div>' +
'<div class="role-card' + (!isT?' on':'') + '" onclick="S.lRole=\'client\';S.lMode=\'login\';R()">' +
'<div style="font-size:28px;margin-bottom:6px">&#128170;</div>' +
'<div style="font-size:13px;font-weight:700;color:#fff">Client</div>' +
'<div style="font-size:10px;color:var(--m1);margin-top:2px">Your training</div></div>' +
'</div>' +
(isT ? renderTrainerLogin() : renderClientLogin()) +
'</div></div>';
}
function renderTrainerLogin() {
if (S.lMode === 'trReg') {
return '<div style="padding-top:4px">' +
'<div style="font-size:11px;font-weight:700;letter-spacing:1px;color:var(--acc);margin-bottom:14px">CREATE TRAINER ACCOUNT</div>' +
'<div class="row"><div class="lbl">Your Name</div><input class="inp" id="tname" placeholder="e.g. Ahmed"></div>' +
'<div class="row"><div class="lbl">Email</div><input class="inp" id="temail" type="email" placeholder="you@email.com" autocomplete="email"></div>' +
'<div class="row"><div class="lbl">Password (min 6 chars)</div><input class="inp" id="tpass" type="password" placeholder="Choose a secure password" autocomplete="new-password"></div>' +
'<div class="row"><div class="lbl">Currency</div><select class="sel" id="tcurrency">'+CURRENCIES.map(function(c){return '<option value="'+c+'">'+c+' ('+currencySymbol(c)+')</option>';}).join('')+'</select></div>' +
'<div id="tcreate_err"></div>' +
'<button class="btn btn-green" onclick="doTCreate()">CREATE ACCOUNT &#10003;</button>' +
'<div style="font-size:10px;color:var(--m2);text-align:center;margin-top:6px">14-day free trial &#8212; no card required</div>' +
'<button onclick="S.lMode=\'login\';R()" style="width:100%;background:none;border:none;color:var(--m1);font-size:11px;cursor:pointer;padding:8px">Already have an account? Sign in</button>' +
'</div>';
}
return '<div class="row"><div class="lbl">Email</div>' +
'<input class="inp" id="temail_l" type="email" placeholder="you@email.com" autocomplete="email"></div>' +
'<div class="row"><div class="lbl">Password</div>' +
'<input class="inp" id="tpass_l" type="password" placeholder="Password" autocomplete="current-password"></div>' +
'<div id="tlogin_err"></div>' +
'<button class="btn btn-acc" onclick="doTEmailLogin()">SIGN IN &#8594;</button>' +
'<div style="margin-top:10px;text-align:center">' +
'<button onclick="S.lMode=\'trReg\';R()" style="font-size:11px;color:var(--acc);background:none;border:none;cursor:pointer;font-weight:700">Create a trainer&#39;s account &#8594;</button>' +
'</div>';
}
function renderClientLogin() {
var isSignup = S.lMode === 'signup';
var lastCode = '';
try { lastCode = localStorage.getItem('_last_trainer_code') || ''; } catch(e) {}
if (isSignup) {
return '<div class="row"><div class="lbl">Your Name</div>' +
'<input class="inp" id="cname" placeholder="e.g. Sarah"></div>' +
'<div class="row"><div class="lbl">Create a Password</div>' +
'<input class="inp" id="cpin" type="password" placeholder="Choose a password"></div>' +
'<div class="row"><div class="lbl">Trainer Invite Code</div>' +
'<input class="inp" id="cinvite" placeholder="Code from your trainer" value="'+lastCode+'" style="text-transform:lowercase"></div>' +
'<div id="clogin_err"></div>' +
'<button class="btn" style="background:var(--pink)" onclick="doClientSignup()">CREATE ACCOUNT &#8594;</button>' +
'<div style="text-align:center;margin-top:10px"><span style="font-size:11px;color:var(--m2)">Already have an account? </span><button onclick="S.lMode=\'login\';R()" style="font-size:11px;color:var(--acc);background:none;border:none;cursor:pointer;font-weight:700">Log in</button></div>';
}
return '<div class="row"><div class="lbl">Your Name</div>' +
'<input class="inp" id="cname" placeholder="e.g. Sarah"></div>' +
'<div class="row"><div class="lbl">Your Password</div>' +
'<input class="inp" id="cpin" type="password" placeholder="Your password"></div>' +
'<div id="clogin_err"></div>' +
'<button class="btn" style="background:var(--pink)" onclick="doCLogin()">START TRAINING &#8594;</button>' +
'<div style="text-align:center;margin-top:10px"><span style="font-size:11px;color:var(--m2)">New client? </span><button onclick="S.lMode=\'signup\';R()" style="font-size:11px;color:var(--acc);background:none;border:none;cursor:pointer;font-weight:700">Create account</button></div>';
}
function doClientSignup() {
var name = ((document.getElementById('cname')||{}).value||'').trim();
var pin = ((document.getElementById('cpin')||{}).value||'').trim();
var invite = ((document.getElementById('cinvite')||{}).value||'').trim().toLowerCase();
var errEl = document.getElementById('clogin_err');
function showErr(msg){if(errEl)errEl.innerHTML='<div class="err-msg">'+msg+'</div>';}
if (!name) { showErr('Enter your name'); return; }
if (pin.length < 1) { showErr('Enter a password'); return; }
if (!invite) { showErr('Enter the invite code from your trainer'); return; }
try { localStorage.setItem('_last_trainer_code', invite); } catch(e) {}
if (DB._fb) {
DB._fb.ref('trainer_codes/'+invite).once('value').then(function(snap) {
var trId = snap.val();
if (trId) {
DB._prefix = trId+'_'; DB._fbPath = 'trainers/'+trId; S.trId = trId;
_doSignupInNamespace(name, pin, invite, errEl);
} else {
_tryLegacySignup(name, pin, invite, errEl);
}
}).catch(function(){ _tryLegacySignup(name, pin, invite, errEl); });
} else {
_tryLegacySignup(name, pin, invite, errEl);
}
}
function _tryLegacySignup(name, pin, invite, errEl) {
var tdata = localStorage.getItem('trainer'); tdata = tdata ? JSON.parse(tdata) : {};
var tCode = (tdata.inviteCode||(tdata.name||'').toLowerCase().replace(/[^a-z0-9]/g,'')).toLowerCase();
if (!tCode || invite !== tCode) {
if(errEl) errEl.innerHTML='<div class="err-msg">Invalid invite code. Ask your trainer for their code.</div>'; return;
}
_doSignupInNamespace(name, pin, invite, errEl);
}
function _doSignupInNamespace(name, pin, invite, errEl) {
var nameLower = name.toLowerCase();
var pfx = DB._prefix;
var existing = Object.keys(localStorage).filter(function(k){return k.startsWith(pfx+'cp_');});
for (var i = 0; i < existing.length; i++) {
var raw = localStorage.getItem(existing[i]); if(!raw)continue;
var ec = JSON.parse(raw);
if (ec && ec.name && ec.name.toLowerCase() === nameLower) {
if(errEl) errEl.innerHTML='<div class="err-msg">Name already registered. Please log in instead.</div>'; return;
}
}
var cid = 'c' + Date.now();
DB.set('cp_'+cid, {name:name, pin:pin, balance:0, type:'in_person', joined:today()});
var tc = DB.get('tc') || {};
tc[cid] = {name:name, type:'in_person', balance:0, rate:0, joined:today(), lastActive:today()};
DB.set('tc', tc);
S.clients = tc;
enterClient(cid);
toast('Welcome '+name+'! Your trainer has been notified.', 'ok');
}

function _ensureFirebaseReady(errEl) {
if (!window.firebase) { if(errEl)errEl.innerHTML='<div class="err-msg">Firebase SDK not loaded. Check your internet connection and reload.</div>'; return false; }
if (!firebase.apps || !firebase.apps.length) {
try { firebase.initializeApp(FB_CONFIG); DB._fb = firebase.database(); } catch(e) {}
}
if (!firebase.auth) { if(errEl)errEl.innerHTML='<div class="err-msg">Firebase Auth not loaded. Reload the page and try again.</div>'; return false; }
return true;
}
function _fbAuthErrMsg(e) {
if (e.code === 'auth/configuration-not-found') return 'Email/Password sign-in is not enabled. Go to Firebase Console &rarr; Authentication &rarr; Sign-in methods and enable Email/Password.';
if (e.code === 'auth/email-already-in-use') return 'This email already has an account. Sign in instead.';
if (e.code === 'auth/user-not-found') return 'No account found with that email.';
if (e.code === 'auth/wrong-password') return 'Incorrect password.';
if (e.code === 'auth/invalid-email') return 'Invalid email address.';
if (e.code === 'auth/too-many-requests') return 'Too many attempts. Try again later.';
return e.message || 'Authentication failed.';
}
function doTCreate() {
var name = ((document.getElementById('tname')||{}).value||'').trim();
var email = ((document.getElementById('temail')||{}).value||'').trim();
var pass = ((document.getElementById('tpass')||{}).value||'');
var currency = ((document.getElementById('tcurrency')||{}).value)||'GBP';
var refCode = ((document.getElementById('t_refcode')||{}).value||'').trim().toUpperCase();
var errEl = document.getElementById('tcreate_err');
function showErr(m){if(errEl)errEl.innerHTML='<div class="err-msg">'+m+'</div>';}
if (!name) { showErr('Enter your name'); return; }
if (!email || email.indexOf('@') < 0) { showErr('Enter a valid email'); return; }
if (pass.length < 6) { showErr('Password must be at least 6 characters'); return; }
if (!_ensureFirebaseReady(errEl)) return;
if(errEl) errEl.innerHTML='<div style="font-size:11px;color:var(--m1);padding:6px">Creating account...</div>';
firebase.auth().createUserWithEmailAndPassword(email, pass).then(function(cred) {
_setupTrainerSession(cred.user.uid, name, email, currency, refCode);
}).catch(function(e) {
showErr(_fbAuthErrMsg(e));
});
}
function doTEmailLogin() {
var email = ((document.getElementById('temail_l')||{}).value||'').trim();
var pass = ((document.getElementById('tpass_l')||{}).value||'');
var errEl = document.getElementById('tlogin_err');
function showErr(m){if(errEl)errEl.innerHTML='<div class="err-msg">'+m+'</div>';}
if (!email) { showErr('Enter your email'); return; }
if (!pass) { showErr('Enter your password'); return; }
if (!_ensureFirebaseReady(errEl)) return;
if(errEl) errEl.innerHTML='<div style="font-size:11px;color:var(--m1);padding:6px">Signing in...</div>';
firebase.auth().signInWithEmailAndPassword(email, pass).then(function(cred) {
var uid = cred.user.uid;
DB._prefix = uid+'_'; DB._fbPath = 'trainers/'+uid; S.trId = uid;
if (!firebase.apps.length) firebase.initializeApp(FB_CONFIG);
DB._fb = firebase.database();
DB.set('sess', {role:'trainer', trId:uid});
if(errEl) errEl.innerHTML='<div style="font-size:11px;color:var(--m1);padding:6px">Loading your data...</div>';
syncFromFirebase(function() { _enterTrainerWithId(uid); });
}).catch(function(e) {
showErr(_fbAuthErrMsg(e));
});
}
function _setupTrainerSession(uid, name, email, currency, refCode) {
DB._prefix = uid+'_'; DB._fbPath = 'trainers/'+uid; S.trId = uid;
// Reuse legacy invite code so existing clients still work
var legacyT = null;
try { var _lt = localStorage.getItem('trainer'); legacyT = _lt ? JSON.parse(_lt) : null; } catch(e) {}
var inviteCode = (legacyT && legacyT.inviteCode) ? legacyT.inviteCode : _genInviteCode(name);
var tdata = {name:name, email:email, uid:uid, currency:currency, inviteCode:inviteCode, joined:today()};
DB.set('trainer', tdata);
if (DB._fb) DB._fb.ref('trainer_codes/'+inviteCode).set(uid).catch(function(){});
DB.set('sess', {role:'trainer', trId:uid});
_enterTrainerWithId(uid);
setTimeout(function(){ setupReferral(uid, name, refCode||null); }, 1000);
toast('Account created! Share invite code: '+inviteCode, 'ok');
}
function _genInviteCode(name) {
var pre = (name||'PT').replace(/[^a-zA-Z]/g,'').toUpperCase().substring(0,4)||'PT';
return pre+(Math.floor(Math.random()*9000+1000)).toString();
}
function _enterTrainerWithId(uid) {
S.role='trainer'; S.scr='trainer'; S.tTab='dash'; S.trId=uid;
loadAll();
S.referralCode = DB.get('referral_code') || null;
loadSubscription();
setupRealtimeSync(function() { loadAll(); R(); });
R();
}
function doTLogin() {
var pin = ((document.getElementById('tpin')||{}).value||'').trim();
var st = localStorage.getItem('trainer'); st = st ? JSON.parse(st) : null;
var errEl = document.getElementById('tlogin_err');
if (!st) { if(errEl) errEl.innerHTML='<div class="err-msg">No account yet</div>'; return; }
if (st.pin !== pin) { if(errEl) errEl.innerHTML='<div class="err-msg">Incorrect PIN</div>'; return; }
DB._prefix = ''; DB._fbPath = 'ahmedpt'; S.trId = st.uid || null;
DB.set('sess', {role:'trainer', trId: S.trId||null});
_enterTrainerWithId(S.trId||'legacy');
}
function enterTrainer() {
var tdata = DB.get('trainer')||{}; S.trId = tdata.uid||null;
S.role='trainer'; S.scr='trainer'; S.tTab='dash';
DB.set('sess', {role:'trainer', trId:S.trId});
loadAll();
S.referralCode = DB.get('referral_code') || null;
loadSubscription();
R();
}
function doCLogin() {
var name = ((document.getElementById('cname')||{}).value||'').trim().toLowerCase();
var pass = ((document.getElementById('cpin')||{}).value||'').trim();
var errEl = document.getElementById('clogin_err');
function showErr(m){if(errEl)errEl.innerHTML='<div class="err-msg">'+m+'</div>';}
if (!name) { showErr('Enter your name'); return; }
if (!pass) { showErr('Enter your password'); return; }
// Search every localStorage key across all trainer namespaces
var allKeys = Object.keys(localStorage);
var matchCid = null;
var matchPrefix = null;
var matchFbPath = null;
for (var i=0; i<allKeys.length; i++) {
var k = allKeys[i];
var cpIdx = k.indexOf('cp_');
if (cpIdx < 0) continue;
var raw = localStorage.getItem(k); if(!raw) continue;
var c; try { c = JSON.parse(raw); } catch(e){ continue; }
if (c && c.name && c.name.toLowerCase() === name && c.pin === pass) {
matchCid = k.substring(cpIdx+3);
matchPrefix = k.substring(0, cpIdx);
// Determine fbPath from prefix
if (matchPrefix === '') {
matchFbPath = 'ahmedpt';
} else {
// prefix is "{uid}_"
var uid = matchPrefix.replace(/_$/,'');
matchFbPath = 'trainers/'+uid;
}
break;
}
}
if (!matchCid) { showErr('Name or password not found. Ask your trainer if you need a new account.'); return; }
DB._prefix = matchPrefix;
DB._fbPath = matchFbPath;
if (matchPrefix !== '') {
S.trId = matchPrefix.replace(/_$/,'');
}
enterClient(matchCid);
}
function enterClient(cid) {
var cp = DB.get('cp_' + cid) || {};
S.role='client'; S.scr='client'; S.cid=cid; S.cTab='home';
S.unit=cp.unit||'kg'; S.week=cp.week||1;
S.nutriDate=today();
S.logs=DB.get('logs_'+cid)||{};
S.exN=DB.get('exnotes_'+cid)||{};
S.sN=DB.get('sessnotes_'+cid)||{};
S.msgs=DB.get('msgs_'+cid)||[];
S.streak=DB.get('streak_'+cid)||{cur:0,best:0,lastDate:null};
S.prs=DB.get('prs_'+cid)||{};
S.unread=S.msgs.filter(function(m){return m.from==='trainer'&&!m.read;}).length;
DB.set('sess', {role:'client', cid:cid, trId:S.trId||null});
loadClientPremium(cid);
setupMsgListener(cid, 'client');
R();
}
function doLogout() {
teardownMsgListener();
teardownRealtimeSync();
S.role=null; S.scr='login'; S.cid=null; S.vCli=null; S.trId=null;
S.logs={}; S.msgs=[]; S.streak={cur:0,best:0,lastDate:null}; S.prs={};
DB._prefix=''; DB._fbPath='ahmedpt';
DB.del('sess'); R();
}
function setupMsgListener(cid, role) {
teardownMsgListener();
if (!DB._fb) return;
var ref = DB._fb.ref(DB._fbPath+'/msgs_' + cid);
S._msgListenerCid = cid;
S._msgListenerRef = ref;
S._msgListenerFn = function(snap) {
var msgs = snap.val() || [];
if (!Array.isArray(msgs)) msgs = [];
try { localStorage.setItem(DB._prefix+'msgs_' + cid, JSON.stringify(msgs)); } catch(e) {}
if (role === 'client' && S.cid === cid) {
var prevLen = S.msgs.length;
S.msgs = msgs;
S.unread = msgs.filter(function(m){ return m.from === 'trainer' && !m.read; }).length;
if (msgs.length !== prevLen) { R(); }
} else if (role === 'trainer') {
var prevTrainerLen = ((S.cliData[cid] || {}).messages || []).length;
if (!S.cliData[cid]) S.cliData[cid] = {};
S.cliData[cid].messages = msgs;
if (msgs.length !== prevTrainerLen && S.vCli === cid && S.cliTab === 'chat') { R(); }
}
};
ref.on('value', S._msgListenerFn);
}
function teardownMsgListener() {
if (S._msgListenerRef && S._msgListenerFn) {
try { S._msgListenerRef.off('value', S._msgListenerFn); } catch(e) {}
}
S._msgListenerRef = null; S._msgListenerFn = null; S._msgListenerCid = null;
}
