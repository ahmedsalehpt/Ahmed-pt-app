function loadAll() {
S.clients = DB.get('tc') || {};
Object.keys(S.clients).forEach(function(cid) {
var c = S.clients[cid];
c.sessions = DB.get('sessions_' + cid) || {};
c.payments = DB.get('payments_' + cid) || {};
var msgs = DB.get('msgs_' + cid) || [];
c.msgCount = msgs.filter(function(m){ return m.from === 'client' && !m.read; }).length;
});
}
function loadCliDetail(cid) {
var msgs = DB.get('msgs_' + cid) || [];
var msgsObj = {};
msgs.forEach(function(m){ msgsObj[m.id || ('m'+m.ts)] = m; });
S.cliData[cid] = {
logs: DB.get('logs_' + cid) || {},
prs: DB.get('prs_' + cid) || {},
streak: DB.get('streak_' + cid) || {},
sessNotes: DB.get('sessnotes_' + cid) || {},
exNotes: DB.get('exnotes_' + cid) || {},
sessions: DB.get('sessions_' + cid) || {},
payments: DB.get('payments_' + cid) || {},
messages: msgsObj
};
if (S.clients[cid]) {
S.clients[cid].sessions = S.cliData[cid].sessions;
S.clients[cid].payments = S.cliData[cid].payments;
}
}

function R() {
var app = document.getElementById('app');
if (!app) return;
try {
var html = '';
if (S.scr === 'login') html = renderLogin();
else if (S.scr === 'trainer') html = renderTrainer();
else if (S.scr === 'client') html = renderClient();
else if (S.scr === 'complete') html = renderComplete();
app.innerHTML = html;
if (S.newPR) renderPROverlay();
var ml = document.getElementById('msgList');
if (ml) setTimeout(function(){ ml.scrollTop = ml.scrollHeight; }, 50);
var d = getDay();
if (d && d.accent) document.documentElement.style.setProperty('--acc', d.accent);
if (S.scr === 'client') {
// sessions now rendered inline, no async load needed
if (S.cTab === 'account') setTimeout(renderMyAcctData, 50);
}
} catch(e) {
app.innerHTML = '<div style="padding:20px;color:#f87171;background:#07070e;min-height:100vh;font-family:monospace">' +
'<div style="font-size:16px;font-weight:700;margin-bottom:8px">Error</div>' +
'<div style="font-size:12px;word-break:break-all">' + (e.message || String(e)) + '</div>' +
'<button onclick="location.reload()" style="margin-top:16px;padding:10px 20px;background:#6366f1;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px">Reload</button></div>';
}
}

function init() {
try {
var rawSess = localStorage.getItem('sess'); // read unscoped always
var sess = rawSess ? JSON.parse(rawSess) : null;
if (sess && sess.trId && sess.trId !== 'legacy') {
DB._prefix = sess.trId+'_';
DB._fbPath = 'trainers/'+sess.trId;
S.trId = sess.trId;
}
if (sess && sess.role === 'trainer') {
S.role='trainer'; S.scr='trainer'; S.tTab='dash';
try { loadAll(); } catch(e) { S.clients={}; }
} else if (sess && sess.role === 'client' && sess.cid) {
try {
var cp = DB.get('cp_' + sess.cid);
if (cp) {
S.role='client'; S.scr='client'; S.cid=sess.cid;
S.unit=cp.unit||'kg'; S.week=cp.week||1;
S.logs=DB.get('logs_'+sess.cid)||{};
S.exN=DB.get('exnotes_'+sess.cid)||{};
S.sN=DB.get('sessnotes_'+sess.cid)||{};
S.msgs=DB.get('msgs_'+sess.cid)||[];
S.streak=DB.get('streak_'+sess.cid)||{cur:0,best:0,lastDate:null};
S.prs=DB.get('prs_'+sess.cid)||{};
S.unread=S.msgs.filter(function(m){return m.from==='trainer'&&!m.read;}).length;
} else { S.scr='login'; }
} catch(e) { S.scr='login'; }
} else { S.scr='login'; }
} catch(e) { S.scr='login'; }
try { R(); } catch(e) {
var app=document.getElementById('app');
if(app) app.innerHTML='<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;background:#07070e;color:#fff;flex-direction:column;gap:12px;text-align:center"><div style="font-size:48px">🏋</div><div style="font-size:9px;letter-spacing:3px;color:#ec4899;font-weight:700">AHMED PERSONAL TRAINING</div><div style="font-size:24px;font-weight:800">Error loading</div><div style="font-size:13px;color:#8892a4">'+e.message+'</div><button onclick="localStorage.clear();location.reload()" style="padding:12px 24px;background:#6366f1;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;margin-top:8px">Reset & Reload</button></div>';
}
}
// Called once all three Firebase SDK scripts have loaded
window._trySetupFirebase = function() {
if (!window._fbAppLoaded || !window._fbDbLoaded || !window._fbAuthLoaded) return;
syncFromFirebase(function() {
if (S.role === 'trainer') {
loadSubscription();
} else if (S.role === 'client' && S.cid) {
loadClientPremium(S.cid);
setupMsgListener(S.cid, 'client');
}
});
};

function startApp() {
// Render immediately from localStorage — never waits for Firebase
try { init(); } catch(e) {
var app = document.getElementById('app');
if (app) app.innerHTML = '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;background:#07070e;color:#fff;flex-direction:column;gap:12px;text-align:center"><div style="font-size:48px">&#127947;</div><div style="font-size:24px;font-weight:800">Error loading</div><div style="font-size:13px;color:#8892a4">' + e.message + '</div><button onclick="location.reload()" style="padding:12px 24px;background:#6366f1;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;margin-top:8px">Reload</button></div>';
}
// Firebase sync happens separately via _trySetupFirebase once SDKs finish loading
}

// #app div is already in the DOM when this script runs (scripts load after it in body)
startApp();
