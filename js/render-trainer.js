function renderTrainer() {
if (S.vCli) return renderCliDetail();
if (S.tTab === 'dash') return renderDash();
if (S.tTab === 'clients') return renderClients();
if (S.tTab === 'chats') return renderTrainerChats();
if (S.tTab === 'sched') return renderSched();
if (S.tTab === 'finance') return renderFinance();
if (S.tTab === 'settings') return renderTrainerSettings();
return renderDash();
}
function trNav() { return renderSidebar(); }

function trTopBar(title) {
var totalUnread = Object.keys(S.clients).reduce(function(acc, cid) {
var msgs = DB.get('msgs_'+cid)||[];
return acc + msgs.filter(function(m){return m.from==='client'&&!m.read;}).length;
}, 0);
return '<div class="tr-topbar">' +
'<button onclick="S.sidebarOpen=true;R()" style="width:34px;height:34px;background:var(--c2);border:1px solid var(--bdr);border-radius:8px;color:#fff;font-size:18px;cursor:pointer;flex-shrink:0">&#9776;</button>' +
'<div style="font-size:16px;font-weight:800;color:#fff;flex:1;text-align:center">' + title + '</div>' +
'<div style="display:flex;align-items:center;gap:6px">' +
(totalUnread > 0 ? '<div style="position:relative"><button onclick="S.tTab=&quot;chats&quot;;S.sidebarOpen=false;R()" style="width:34px;height:34px;background:var(--c2);border:1px solid var(--bdr);border-radius:8px;color:var(--m1);font-size:16px;cursor:pointer">&#128172;</button><span style="position:absolute;top:-2px;right:-2px;background:var(--red);color:#fff;font-size:8px;font-weight:800;min-width:14px;height:14px;border-radius:7px;display:flex;align-items:center;justify-content:center;padding:0 3px">' + totalUnread + '</span></div>' : '') +
'<button onclick="openTrainerProfile()" style="width:34px;height:34px;background:rgba(99,102,241,.15);border:1px solid rgba(99,102,241,.25);border-radius:50%;color:var(--acc);font-size:14px;cursor:pointer">&#128100;</button>' +
'</div></div>';
}

function renderSidebar() {
if (!S.sidebarOpen) return '';
var page = S.tTab || 'dash';
var items = [
{id:'dash', icon:'&#128202;', lbl:'Dashboard'},
{id:'clients', icon:'&#128101;', lbl:'Clients'},
{id:'sched', icon:'&#128197;', lbl:'Schedule'},
{id:'finance', icon:'&#128176;', lbl:'Finance'},
{id:'chats', icon:'&#128172;', lbl:'Messages'},
{id:'settings', icon:'&#9881;', lbl:'Settings'}
];
return '<div class="sidebar-overlay" onclick="S.sidebarOpen=false;R()">' +
'<div class="sidebar" onclick="event.stopPropagation()">' +
'<div style="padding:18px 16px 12px;border-bottom:1px solid var(--bdr)">' +
'<div style="font-size:9px;letter-spacing:2px;color:var(--acc);font-weight:700;margin-bottom:2px">AHMED PT</div>' +
'<div style="font-size:20px;font-weight:900;color:#fff">Menu</div>' +
'</div>' +
'<div style="padding:8px 0;flex:1">' +
items.map(function(item) {
var on = page === item.id && !S.vCli;
return '<div class="sbr-item' + (on ? ' on' : '') + '" onclick="goSidebarTab(this)" data-tab="' + item.id + '">' +
'<span style="font-size:18px">' + item.icon + '</span>' +
'<span>' + item.lbl + '</span></div>';
}).join('') +
'</div>' +
'<div style="padding:12px;border-top:1px solid var(--bdr)">' +
'<div class="sbr-item" onclick="doLogout()" style="color:var(--red)">' +
'<span style="font-size:18px">&#128682;</span><span>Logout</span></div>' +
'</div></div></div>';
}

function goSidebarTab(el) {
var tab = el.getAttribute('data-tab');
S.tTab = tab; S.vCli = null; S.sidebarOpen = false;
R();
}

function getUpcoming() {
var all = [];
Object.keys(S.clients).forEach(function(cid) {
var c = S.clients[cid];
Object.values(c.sessions||{}).forEach(function(s){
if (s.status==='upcoming') {
var item = {clientId:cid, clientName:c.name, clientType:c.type||'inperson'};
Object.keys(s).forEach(function(k){ item[k]=s[k]; });
all.push(item);
}
});
});
return all.sort(function(a,b){ return ((a.date||'')+(a.time||'')).localeCompare((b.date||'')+(b.time||'')); });
}
function monthStats() {
var now = new Date();
var mn = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0');
var rev = 0, sessDone = 0, needPay = 0, alerts = [];
Object.keys(S.clients).forEach(function(cid) {
var c = S.clients[cid];
Object.values(c.payments||{}).forEach(function(p){ if(p.date&&p.date.startsWith(mn)) rev+=p.amount||0; });
Object.values(c.sessions||{}).forEach(function(s){ if(s.status==='done'&&s.doneAt&&new Date(s.doneAt).toISOString().startsWith(mn)) sessDone++; });
var bal = c.balance||0;
if (bal===0) { needPay++; alerts.push({cid:cid,name:c.name,type:'zero',msg:'No sessions left - needs payment'}); }
else if (bal<=2) alerts.push({cid:cid,name:c.name,type:'low',msg:'Only '+bal+' session'+(bal===1?'':'s')+' remaining'});
});
return {rev:rev, sessDone:sessDone, needPay:needPay, alerts:alerts};
}

function showUpgradeModal(reason) {
var reasons = {
clientLimit:{title:'Client Limit Reached',msg:'The free plan includes up to 3 clients. Upgrade to Pro for unlimited clients.',icon:'&#128101;'},
programBuilder:{title:'Pro Feature',msg:'The program builder is available on the Pro plan. Build and save unlimited custom programs.',icon:'&#128170;'},
paymentTracking:{title:'Pro Feature',msg:'Payment tracking and revenue analytics are available on the Pro plan.',icon:'&#128176;'},
analytics:{title:'Pro Feature',msg:'Detailed client analytics are available on the Pro plan.',icon:'&#128200;'},
trial:{title:'Upgrade to Pro',msg:'Keep all Pro features after your trial ends.',icon:'&#11088;'},
expired:{title:'Trial Expired',msg:'Upgrade to restore access to all Pro features.',icon:'&#9203;'}
};
var r=reasons[reason]||{title:'Pro Feature',msg:'Upgrade to unlock this feature.',icon:'&#11088;'};
var days=daysRemaining();
var trialMsg=S.sub.status==='trial'&&days>0?'<div style="font-size:12px;color:var(--amber);margin-bottom:16px">Trial ends in '+days+' day'+(days===1?'':'s')+'</div>':'';
showModal('<div class="modal-bg" onclick="closeModal()"><div class="modal-box" onclick="event.stopPropagation()">' +
'<div style="text-align:center;padding:10px 0 20px">' +
'<div style="font-size:48px;margin-bottom:12px">'+r.icon+'</div>' +
'<div style="font-size:20px;font-weight:800;color:#fff;margin-bottom:8px">'+r.title+'</div>' +
trialMsg +
'<div style="font-size:13px;color:var(--m1);line-height:1.6;margin-bottom:20px">'+r.msg+'</div>' +
'<div style="background:var(--c2);border-radius:12px;padding:14px;margin-bottom:14px;text-align:left">' +
'<div style="font-size:11px;font-weight:800;letter-spacing:1px;color:var(--acc);margin-bottom:8px">PRO PLAN &#8212; &#163;29/MONTH</div>' +
'<div style="font-size:12px;color:var(--m1);line-height:1.9">&#10003; Unlimited clients<br>&#10003; Full program builder<br>&#10003; Payment tracking<br>&#10003; Revenue analytics<br>&#10003; Saved templates<br>&#10003; Client messaging</div>' +
'</div>' +
'<button class="btn btn-acc" onclick="goToCheckout(\'pro\')" style="margin-bottom:8px">UPGRADE TO PRO &#8212; &#163;29/mo</button>' +
'<button class="btn btn-ghost" onclick="closeModal()">Maybe later</button>' +
'</div></div></div>');
}
function renderLockedFeature(feature) {
var names={paymentTracking:'Payment Tracking',analytics:'Analytics',programBuilder:'Program Builder',templates:'Program Templates',export:'Export'};
return '<div class="page"><div style="text-align:center;padding:48px 20px">' +
'<div style="font-size:48px;margin-bottom:16px">&#128274;</div>' +
'<div style="font-size:20px;font-weight:800;color:#fff;margin-bottom:8px">'+(names[feature]||'Pro Feature')+'</div>' +
'<div style="font-size:13px;color:var(--m1);line-height:1.6;margin-bottom:24px">This feature is available on the Pro plan.<br>Upgrade to unlock unlimited access.</div>' +
'<button class="btn btn-acc" onclick="showUpgradeModal(\''+feature+'\')" style="max-width:300px;margin:0 auto 8px">See Pro Features</button>' +
'<button class="btn btn-ghost" style="max-width:300px;margin:0 auto" onclick="S.tTab=\'dash\';R()">Back to Dashboard</button>' +
'</div></div>' + trNav();
}
function renderClientUpgrade() {
return '<div style="text-align:center;padding:28px 16px;background:linear-gradient(135deg,rgba(99,102,241,.08),rgba(236,72,153,.05));border:1px solid rgba(99,102,241,.2);border-radius:14px;margin-bottom:14px">' +
'<div style="font-size:36px;margin-bottom:10px">&#11088;</div>' +
'<div style="font-size:18px;font-weight:800;color:#fff;margin-bottom:8px">Premium Feature</div>' +
'<div style="font-size:13px;color:var(--m1);line-height:1.6;margin-bottom:16px">Unlock detailed progress charts, milestone badges, body composition tracking and more.</div>' +
'<div style="background:var(--c2);border-radius:12px;padding:12px 14px;margin-bottom:14px;text-align:left">' +
'<div style="font-size:11px;font-weight:800;letter-spacing:1px;color:var(--pink);margin-bottom:8px">PREMIUM &#8212; &#163;4.99/MONTH</div>' +
'<div style="font-size:12px;color:var(--m1);line-height:1.9">&#10003; Detailed progress analytics<br>&#10003; Milestone badges<br>&#10003; Body composition tracker<br>&#10003; Daily coaching tips<br>&#10003; Export progress<br>&#10003; Extended workout history</div>' +
'</div>' +
'<button class="btn" style="background:var(--pink);margin-bottom:8px" onclick="goToClientCheckout()">UPGRADE &#8212; &#163;4.99/mo</button>' +
'<div style="font-size:11px;color:var(--m2);margin-top:6px">Or ask Ahmed to include Premium in your package</div>' +
'</div>';
}
function renderSubBanner() {
var days=daysRemaining();
if (S.sub.status==='trial'&&days>0) {
return '<div style="background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.25);border-radius:10px;padding:10px 14px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center">' +
'<div><div style="font-size:12px;font-weight:700;color:var(--acc)">Pro Trial Active</div>' +
'<div style="font-size:10px;color:var(--m1)">'+days+' day'+(days===1?'':'s')+' remaining</div></div>' +
'<button class="btn-sm btn-acc" onclick="showUpgradeModal(\'trial\')">Upgrade</button></div>';
}
if (S.sub.status==='trial'&&days===0) {
return '<div class="alert alert-red" style="margin-bottom:14px">' +
'<div style="font-size:18px">&#9888;</div>' +
'<div style="flex:1"><div style="font-weight:700;font-size:13px;color:#fff">Trial Expired</div>' +
'<div style="font-size:11px;color:var(--m1)">Upgrade to keep Pro features</div></div>' +
'<button class="btn-sm btn-acc" onclick="showUpgradeModal(\'expired\')">Upgrade</button></div>';
}
if (S.sub.status==='active'&&days!==null&&days<=7) {
return '<div class="alert alert-amber" style="margin-bottom:14px">' +
'<div style="font-size:18px">&#9203;</div>' +
'<div style="flex:1"><div style="font-weight:700;font-size:13px;color:#fff">Renews in '+days+' day'+(days===1?'':'s')+'</div>' +
'<div style="font-size:11px;color:var(--m1)">Ensure payment method is up to date</div></div></div>';
}
return '';
}
function renderReferralCard() {
if (!S.referralCode) return '';
return '<div style="background:rgba(16,185,129,.06);border:1px solid rgba(16,185,129,.2);border-radius:12px;padding:12px 14px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center">' +
'<div><div style="font-size:9px;font-weight:800;letter-spacing:1.5px;color:var(--green);margin-bottom:4px">YOUR REFERRAL CODE</div>' +
'<div style="font-size:22px;font-weight:900;color:#fff;letter-spacing:4px">'+S.referralCode+'</div>' +
'<div style="font-size:10px;color:var(--m1);margin-top:2px">Both get 1 month free when a trainer signs up</div></div>' +
'<button class="btn-sm btn-green" onclick="copyReferralCode()">Copy</button>' +
'</div>';
}
function renderAIInsights() {
var cs=Object.entries(S.clients); if(!cs.length)return'';
var insights=[];
var best=null, bestStreak=0;
cs.forEach(function(e){var str=(e[1].streak||{}).cur||0;if(str>bestStreak){bestStreak=str;best=e;}});
if(best&&bestStreak>1)insights.push({c:'green',icon:'&#128293;',text:best[1].name+' is your most consistent client &#8212; '+bestStreak+'-day streak. Great work!'});
var falling=cs.filter(function(e){
var last=e[1].lastActive; if(!last)return false;
return(new Date(today())-new Date(last))/86400000>=5;
});
if(falling.length)insights.push({c:'amber',icon:'&#9888;',text:falling.map(function(e){return e[1].name;}).join(', ')+' &#8212; no training in 5+ days. Send a check-in message.'});
var noPay=cs.filter(function(e){return(e[1].balance||0)===0;});
if(noPay.length)insights.push({c:'red',icon:'&#128179;',text:noPay.map(function(e){return e[1].name;}).join(', ')+' &#8212; out of sessions. Request payment now.'});
var newClients=cs.filter(function(e){
var logs=DB.get('logs_'+e[0]);
return!logs||Object.keys(logs).length===0;
});
if(newClients.length)insights.push({c:'blue',icon:'&#128221;',text:newClients[0][1].name+(newClients.length>1?' and '+(newClients.length-1)+' others':'')+' &#8212; no workouts logged yet. Set up a program and send a message.'});
if(!insights.length)insights.push({c:'green',icon:'&#9989;',text:'All clients are active and sessions are up to date. Nice work!'});
return '<div class="sect">AI INSIGHTS</div>'+insights.map(function(ins){
var bc=ins.c==='green'?'rgba(16,185,129,.08)':ins.c==='red'?'rgba(239,68,68,.08)':ins.c==='blue'?'rgba(99,102,241,.08)':'rgba(245,158,11,.08)';
var bdr=ins.c==='green'?'rgba(16,185,129,.2)':ins.c==='red'?'rgba(239,68,68,.2)':ins.c==='blue'?'rgba(99,102,241,.2)':'rgba(245,158,11,.2)';
var tc=ins.c==='green'?'#34d399':ins.c==='red'?'#f87171':ins.c==='blue'?'#818cf8':'var(--amber)';
return '<div style="background:'+bc+';border:1px solid '+bdr+';border-radius:10px;padding:10px 13px;margin-bottom:8px;display:flex;gap:10px;align-items:flex-start">' +
'<div style="font-size:18px;flex-shrink:0">'+ins.icon+'</div>' +
'<div style="font-size:12px;color:'+tc+';line-height:1.5;font-weight:600">'+ins.text+'</div></div>';
}).join('');
}
function renderTrainerChats() {
var cs=Object.entries(S.clients);
var allChats=cs.map(function(e){
var cid=e[0], c=e[1];
var msgs=DB.get('msgs_'+cid)||[];
var last=msgs.length?msgs[msgs.length-1]:null;
var unread=msgs.filter(function(m){return m.from==='client'&&!m.read;}).length;
return {cid:cid,name:c.name,last:last,unread:unread};
}).filter(function(x){return x.last;}).sort(function(a,b){return(b.last?b.last.ts:0)-(a.last?a.last.ts:0);});
return trTopBar('Chats') +
'<div class="page">' +
(allChats.length===0?'<div class="empty">No messages yet.<br>Start a conversation from a client profile.</div>':
allChats.map(function(x){
return '<div class="ccard" onclick="openCli(\''+x.cid+'\');S.cliTab=\'chat\';R()" style="display:flex;align-items:center;gap:12px">' +
'<div style="width:40px;height:40px;border-radius:50%;background:rgba(99,102,241,.2);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:var(--acc);flex-shrink:0">'+x.name.charAt(0).toUpperCase()+'</div>' +
'<div style="flex:1;min-width:0">' +
'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px">' +
'<div class="cname" style="font-size:14px">'+x.name+'</div>' +
'<div style="font-size:10px;color:var(--m2)">'+fmtT(x.last.ts)+'</div></div>' +
'<div style="font-size:12px;color:var(--m1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:240px">'+(x.last.from==='trainer'?'You: ':'')+x.last.text+'</div>' +
'</div>' +
(x.unread>0?'<div style="width:18px;height:18px;border-radius:50%;background:var(--red);color:#fff;font-size:9px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0">'+x.unread+'</div>':'') +
'</div>';
}).join('')) +
'</div>' + trNav();
}
function renderDash() {
if (!S.dashCollapsed) S.dashCollapsed = {};
if (!S.incomeMonth) S.incomeMonth = getCurrentMonthKey();
return trTopBar('Dashboard') +
'<div class="page">' +
renderSubBanner() +
renderIncomeSection() +
renderTodaySessions() +
renderNeedsAttention() +
renderUpdatesFeed() +
'</div>' + trNav();
}

function getCurrentMonthKey() {
var n = new Date();
return n.getFullYear() + '-' + String(n.getMonth()+1).padStart(2,'0');
}

function getMonthsSinceJoining() {
var now = new Date();
var months = [];
var d = new Date(now.getFullYear(), now.getMonth() - 5, 1);
while (d <= now) {
var key = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0');
var label = d.toLocaleDateString('en-GB', {month:'short', year:'2-digit'});
months.push({key:key, label:label});
d.setMonth(d.getMonth() + 1);
}
return months.reverse();
}

function getIncomeStats(monthKey) {
var payments = [];
var total = 0, outstanding = 0, newClients = 0;
Object.keys(S.clients).forEach(function(cid) {
var c = S.clients[cid];
Object.values(c.payments || {}).forEach(function(p) {
if (p.date && p.date.startsWith(monthKey)) {
var row = {clientName:c.name, date:p.date, amount:p.amount||0, sessions:p.sessions||0, ts:p.ts||0};
payments.push(row);
total += p.amount || 0;
}
});
var bal = c.balance||0; if (bal < 0 && c.type !== 'online') outstanding += Math.abs(bal) * (c.rate||0);
});
payments.sort(function(a,b){ return (b.ts||0) - (a.ts||0); });
var ms = monthStats();
return {total:total, outstanding:outstanding, newClients:newClients, payments:payments, sessionsDone:ms.sessDone};
}

function toggleDashSection(key) {
if (!S.dashCollapsed) S.dashCollapsed = {};
S.dashCollapsed[key] = !S.dashCollapsed[key];
R();
}

function renderIncomeSection() {
var collapsed = S.dashCollapsed && S.dashCollapsed.income;
var stats = getIncomeStats(S.incomeMonth || getCurrentMonthKey());
var months = getMonthsSinceJoining();
return '<div class="dash-section">' +
'<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;cursor:pointer" onclick="toggleDashSection(&apos;income&apos;)">' +
'<div><div style="font-size:10px;font-weight:700;letter-spacing:2px;color:var(--m2)">INCOME THIS MONTH</div>' +
'<div style="font-size:20px;font-weight:800;color:var(--green);margin-top:2px">' +
currSym() + stats.total.toLocaleString() +
'<span style="font-size:12px;color:var(--m1);font-weight:400;margin-left:6px">' + stats.sessionsDone + ' sessions done</span>' +
'</div></div>' +
'<span style="font-size:18px;color:var(--m2)">' + (collapsed ? '&#9663;' : '&#9650;') + '</span>' +
'</div>' +
(!collapsed ?
'<div>' +
'<div style="display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;padding-bottom:8px;margin-bottom:10px">' +
months.map(function(m) {
var on = S.incomeMonth === m.key;
return '<button onclick="setIncomeMonth(this)" data-month="' + m.key + '" style="flex-shrink:0;padding:5px 12px;border-radius:20px;border:1px solid ' + (on?'var(--acc)':'var(--bdr)') + ';background:' + (on?'rgba(99,102,241,.15)':'transparent') + ';color:' + (on?'var(--acc)':'var(--m1)') + ';font-size:11px;font-weight:700;cursor:pointer">' + m.label + '</button>';
}).join('') + '</div>' +
'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">' +
'<div onclick="S.tTab=\'finance\';R()" style="background:var(--c2);border-radius:10px;padding:10px;text-align:center;cursor:pointer"><div style="font-size:18px;font-weight:800;color:var(--green)">' + currSym() + stats.total.toLocaleString() + '</div><div style="font-size:9px;color:var(--m2)">Received &#8594;</div></div>' +
'<div style="background:var(--c2);border-radius:10px;padding:10px;text-align:center"><div style="font-size:18px;font-weight:800;color:var(--amber)">' + currSym() + stats.outstanding.toLocaleString() + '</div><div style="font-size:9px;color:var(--m2)">Outstanding</div></div>' +
'</div>' +
(stats.payments.length > 0 ?
'<div style="font-size:10px;font-weight:700;letter-spacing:1.5px;color:var(--m2);margin-bottom:8px">PAYMENTS</div>' +
stats.payments.slice(0,6).map(function(p) {
return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--bdr)">' +
'<div><div style="font-size:12px;font-weight:600;color:#fff">' + p.clientName + '</div>' +
'<div style="font-size:10px;color:var(--m1)">' + (p.date ? fmtD(p.date) : '') + '</div></div>' +
'<div style="font-size:14px;font-weight:800;color:var(--green)">+' + currSym() + p.amount + '</div></div>';
}).join('') : '<div style="font-size:12px;color:var(--m2);padding:8px 0">No payments this month</div>') +
'</div>' : '') +
'</div><div style="height:1px;background:var(--bdr);margin-bottom:12px"></div>';
}

function renderTodaySessions() {
var collapsed = S.dashCollapsed && S.dashCollapsed.sessions;
var todaySess = getUpcoming().filter(function(s){ return s.date === today(); });
return '<div class="dash-section">' +
'<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0">' +
'<div style="display:flex;align-items:center;gap:8px">' +
'<div style="font-size:10px;font-weight:700;letter-spacing:2px;color:var(--m2)">TODAY&#39;S SESSIONS</div>' +
'<span style="background:var(--acc);color:#fff;font-size:9px;font-weight:800;padding:2px 7px;border-radius:10px">' + todaySess.length + '</span>' +
'</div>' +
'<div style="display:flex;gap:8px;align-items:center">' +
'<button onclick="goTab(&apos;sched&apos;)" style="font-size:11px;color:var(--acc);font-weight:600;background:none;border:none;cursor:pointer">All &#8594;</button>' +
'<button onclick="toggleDashSection(&apos;sessions&apos;)" style="font-size:16px;color:var(--m2);background:none;border:none;cursor:pointer">' + (collapsed?'&#9663;':'&#9650;') + '</button>' +
'</div></div>' +
(!collapsed ?
(todaySess.length === 0 ?
'<div style="padding:10px 0;font-size:12px;color:var(--m2)">No sessions today. <button onclick="openBookSess(null)" style="color:var(--acc);background:none;border:none;cursor:pointer;font-size:12px;font-weight:600">Book one?</button></div>' :
'<div style="margin-bottom:4px">' +
todaySess.map(function(s) {
var c = S.clients[s.clientId] || {};
return '<div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--bdr);cursor:pointer" onclick="openCli(\''+s.clientId+'\')">' +
'<div style="min-width:44px;text-align:center"><div style="font-size:12px;font-weight:700;color:#fff">' + (s.time||'--') + '</div></div>' +
'<div style="width:8px;height:8px;border-radius:50%;flex-shrink:0;background:' + (c.type==='online'?'var(--blue)':'var(--green)') + '"></div>' +
'<div style="flex:1"><div style="font-size:13px;font-weight:600;color:#fff">' + c.name + '</div>' +
'<div style="font-size:10px;color:var(--m1)">' + (c.type==='online'?'Online':'In Person') + (s.workoutName?' &bull; '+s.workoutName:'') + '</div></div>' +
'<button onclick="event.stopPropagation();confirmDone(\''+s.clientId+'\',\''+s.id+'\')" style="padding:5px 10px;background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.2);border-radius:8px;color:var(--green);font-size:10px;font-weight:700;cursor:pointer">Done &#10003;</button>' +
'</div>';
}).join('') + '</div>') : '') +
'</div><div style="height:1px;background:var(--bdr);margin-bottom:12px"></div>';
}

function renderNeedsAttention() {
var items = [];
Object.keys(S.clients).forEach(function(cid) {
var c = S.clients[cid];
var bal = c.balance || 0;
if (c.type !== 'online') {
if (bal <= 0) {
items.push({type:'unpaid',cid:cid,name:c.name,msg:'No sessions remaining'});
} else if (bal <= 2) {
items.push({type:'low',cid:cid,name:c.name,msg:bal+' session'+(bal===1?'':'s')+' left'});
}
}
var last = c.lastActive;
if (last) {
var daysSince = Math.floor((Date.now() - new Date(last).getTime()) / 86400000);
if (daysSince >= 5) {
items.push({type:'inactive',cid:cid,name:c.name,msg:'No activity in '+daysSince+' days'});
}
}
});
if (items.length === 0) return '';
return '<div class="dash-section">' +
'<div style="font-size:10px;font-weight:700;letter-spacing:2px;color:var(--m2);margin-bottom:8px">NEEDS ATTENTION</div>' +
items.slice(0,4).map(function(item) {
var icon = item.type==='unpaid'?'&#128679;':item.type==='low'?'&#9888;&#65039;':'&#128164;';
var action = item.type==='inactive'?'Message':'Remind';
var actionOnclick = item.type==='inactive' ?
'onclick="openQuickMsg(this.getAttribute(&apos;data-cid&apos;))" data-cid="'+item.cid+'"' :
'onclick="sendPayReminder(this.getAttribute(&apos;data-cid&apos;))" data-cid="'+item.cid+'"';
return '<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:rgba(255,255,255,.02);border:1px solid var(--bdr);border-radius:10px;margin-bottom:6px;cursor:pointer" onclick="openCliById(this)" data-cid="' + item.cid + '">' +
'<span style="font-size:16px">' + icon + '</span>' +
'<div style="flex:1"><div style="font-size:12px;font-weight:700;color:#fff">' + item.name + '</div>' +
'<div style="font-size:10px;color:var(--m1)">' + item.msg + '</div></div>' +
'<button ' + actionOnclick + ' style="padding:5px 10px;background:transparent;border:1px solid var(--bdr);border-radius:8px;color:var(--m1);font-size:10px;font-weight:700;cursor:pointer" onclick="event.stopPropagation()">' + action + '</button>' +
'</div>';
}).join('') +
'</div><div style="height:1px;background:var(--bdr);margin-bottom:12px"></div>';
}

function openCliById(el) {
var cid = el.getAttribute('data-cid');
if (cid) openCli(cid);
}


function _openCliTab(cid, tab) {
S.vCli = cid; S.cliTab = tab || 'overview';
loadCliDetail(cid);
setupMsgListener(cid, 'trainer');
R();
}

function renderUpdatesFeed() {
// Gather activities from all clients
var allEvents = [];
var cids = Object.keys(S.clients || {});
for (var ci = 0; ci < cids.length; ci++) {
var cid = cids[ci];
var clientName = (S.clients[cid] || {}).name || 'Client';
var acts = DB.get('activity_log_'+cid) || [];
for (var ai = 0; ai < acts.length; ai++) {
allEvents.push({cid: cid, clientName: clientName, ts: acts[ai].ts, text: acts[ai].text, type: acts[ai].type, navTab: acts[ai].navTab});
}
}
// Also include workout completions from workoutFeed
var wf = S.workoutFeed || [];
for (var wi = 0; wi < wf.length; wi++) {
allEvents.push({cid: wf[wi].cid, clientName: wf[wi].clientName, ts: wf[wi].ts, text: (wf[wi].clientName||'Client') + ' finished ' + (wf[wi].dayName||'a workout'), type: 'workout', navTab: 'log'});
}
allEvents.sort(function(a,b){ return (b.ts||0) - (a.ts||0); });
allEvents = allEvents.slice(0, 15);
var typeIcon = {weight: '&#9878;', food: '&#127828;', workout: '&#127947;', habit: '&#9989;', goal: '&#127919;'};
var typeColor = {weight: '#6366f1', food: '#10b981', workout: '#f59e0b', habit: '#34d399', goal: '#ec4899'};
if (allEvents.length === 0) {
return '<div class="dash-section">' + renderAIInsights() + '</div>';
}
return '<div class="dash-section">' +
'<div style="font-size:10px;font-weight:700;letter-spacing:2px;color:var(--m2);margin-bottom:8px">CLIENT ACTIVITY</div>' +
allEvents.map(function(n) {
var icon = typeIcon[n.type] || '&#128203;';
var color = typeColor[n.type] || 'var(--acc)';
return '<div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.04);cursor:pointer" onclick="_openCliTab(\''+n.cid+'\',\''+(n.navTab||'overview')+'\')">' +
'<div style="width:34px;height:34px;border-radius:50%;background:'+color+'22;border:1.5px solid '+color+'44;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">'+icon+'</div>' +
'<div style="flex:1;min-width:0">' +
'<div style="font-size:12px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+n.text+'</div>' +
'<div style="font-size:10px;color:var(--m1)">'+n.clientName+' &bull; '+getTimeAgo(n.ts)+'</div>' +
'</div>' +
'<div style="font-size:11px;color:var(--m2)">&#8594;</div>' +
'</div>';
}).join('') +
'</div>';
}

function sendPayReminder(cid) {
var c = S.clients[cid] || {};
openQuickMsg(cid);
}

function logActivity(type, text, navTab) {
// Called from client-side: logs an activity event readable by trainer
if (!S.cid) return;
var arr = DB.get('activity_log_'+S.cid) || [];
arr.unshift({ts: Date.now(), type: type, text: text, navTab: navTab || '', cid: S.cid});
if (arr.length > 50) arr = arr.slice(0, 50);
DB.set('activity_log_'+S.cid, arr);
}

function getTimeAgo(ts) {
if (!ts) return '';
var diff = Date.now() - ts;
var mins = Math.floor(diff / 60000);
if (mins < 60) return mins + 'm ago';
var hrs = Math.floor(diff / 3600000);
if (hrs < 24) return hrs + 'h ago';
return Math.floor(diff / 86400000) + 'd ago';
}

function sessRow(s) {
return '<div class="si">' +
'<div class="si-time"><div class="si-th">'+(s.time||'&#8211;:&#8211;')+'</div><div class="si-td">'+fmtD(s.date)+'</div></div>' +
'<div class="si-dot" style="background:'+(s.clientType==='online'?'#6366f1':'#10b981')+'"></div>' +
'<div class="si-info"><div class="si-name">'+(s.clientName||'')+'</div>' +
'<div class="si-meta">'+(s.clientType==='online'?'Online':'In Person')+(s.note?' &#8212; '+s.note:'')+'</div></div>' +
'<div style="display:flex;gap:4px">' +
'<button class="btn-sm" style="background:var(--green)" onclick="confirmDone(\''+s.clientId+'\',\''+s.id+'\')">Done</button>' +
'<button style="width:26px;height:26px;border-radius:7px;background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.2);color:#818cf8;font-size:12px;cursor:pointer" onclick="openEditSess(\''+s.clientId+'\',\''+s.id+'\')">&#9998;</button>' +
'<button style="width:26px;height:26px;border-radius:7px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);color:#f87171;font-size:12px;cursor:pointer" onclick="deleteSessConfirm(\''+s.clientId+'\',\''+s.id+'\')">&#215;</button>' +
'</div></div>';
}

function renderClients() {
if (!S.clientFilter) S.clientFilter = 'all';
var cs = Object.entries(S.clients);
var allCount = cs.length;
var inpCount = cs.filter(function(e){return e[1].type==='inperson';}).length;
var onlineCount = cs.filter(function(e){return e[1].type==='online';}).length;
var unpaidCount = cs.filter(function(e){return (e[1].balance||0)<=0 && e[1].type!=='online';}).length;
var filtered = cs.filter(function(e) {
if (S.clientFilter === 'inperson') return e[1].type === 'inperson';
if (S.clientFilter === 'online') return e[1].type === 'online';
if (S.clientFilter === 'unpaid') return (e[1].balance||0) <= 0 && e[1].type !== 'online';
return true;
});
var filters = [
{id:'all',lbl:'All ('+allCount+')'},
{id:'inperson',lbl:'In Person ('+inpCount+')'},
{id:'online',lbl:'Online ('+onlineCount+')'},
{id:'unpaid',lbl:'Unpaid ('+unpaidCount+')'}
];
return trTopBar('Clients') +
'<div style="display:flex;border-bottom:1px solid var(--bdr);background:rgba(7,7,14,.94);position:sticky;top:52px;z-index:80;overflow-x:auto;scrollbar-width:none">' +
filters.map(function(f) {
var on = S.clientFilter === f.id;
return '<button onclick="S.clientFilter=\'' + f.id + '\';R()" style="flex-shrink:0;padding:10px 12px;border:none;border-bottom:2px solid ' + (on?'var(--acc)':'transparent') + ';background:transparent;color:' + (on?'var(--acc)':'var(--m1)') + ';font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap">' + f.lbl + '</button>';
}).join('') + '</div>' +
'<div class="page">' +
'<div style="display:flex;justify-content:flex-end;margin-bottom:12px">' +
'<button class="btn-sm btn-green" onclick="openAddClient()">+ Add Client</button></div>' +
(filtered.length === 0 ? '<div class="empty">No clients in this filter.</div>' : '') +
filtered.map(function(e) {
var cid = e[0], c = e[1];
var bal = c.balance || 0;
var isOnline = c.type === 'online';
var hasWallet = !isOnline && !c.rate && (c.walletCredit||0) > 0;
var isActive = c.active !== false;
var balDisplay = isOnline ?
'<span class="pill ' + (isActive?'p-green':'p-gray') + '">' + (isActive?'Active':'Inactive') + '</span>' :
!isActive ? '<span class="pill p-gray">Inactive</span>' :
hasWallet ? '<span class="pill p-amber">' + currSym(cid) + (c.walletCredit||0) + ' credit</span><span class="pill p-red" style="font-size:9px">No rate set</span>' :
!c.rate ? '<span class="pill p-gray">No rate set</span>' :
'<span class="pill ' + (bal<=0?'p-red':bal<=2?'p-amber':'p-green') + '">' + (bal<=0?'No sessions':bal+' sessions') + '</span>';
return '<div class="ccard" onclick="openCli(\''+cid+'\')">' +
'<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">' +
'<div style="display:flex;align-items:center;gap:8px">' +
'<div style="width:38px;height:38px;border-radius:50%;background:' + (isOnline?'rgba(99,102,241,.3)':'rgba(16,185,129,.3)') + ';display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;color:#fff;flex-shrink:0">' + c.name.charAt(0).toUpperCase() + '</div>' +
'<div><div class="cname" style="margin-bottom:2px">' + c.name + '</div>' +
'<span class="pill ' + (isOnline?'p-blue':'p-green') + '" style="font-size:9px">' + (isOnline?'&#127760; Online':'&#127947; In Person') + '</span></div></div>' +
'<div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">' + balDisplay +
(c.msgCount > 0 ? '<span class="pill p-red">&#128172; ' + c.msgCount + '</span>' : '') +
'</div></div>' +
'<div class="cmeta">' +
(c.rate ? '<span>' + currSym(cid) + c.rate + (isOnline?'/mo':'/sess') + '</span>' : '') +
'<span>Last: ' + (c.lastActive ? fmtD(c.lastActive) : 'Never') + '</span>' +
(c.streak&&c.streak.cur>2 ? '<span style="color:var(--amber)">&#128293; ' + c.streak.cur + '</span>' : '') +
'</div>' +
'<div style="display:flex;gap:6px;margin-top:8px;border-top:1px solid var(--bdr);padding-top:8px">' +
'<button onclick="event.stopPropagation();openQuickMsg(\''+cid+'\')" style="flex:1;padding:6px;background:var(--c2);border:1px solid var(--bdr);border-radius:8px;color:var(--m1);font-size:10px;font-weight:700;cursor:pointer">&#128172; Msg</button>' +
(isOnline ? '' : '<button onclick="event.stopPropagation();openBookSess(\'' + cid + '\')" style="flex:1;padding:6px;background:var(--c2);border:1px solid var(--bdr);border-radius:8px;color:var(--m1);font-size:10px;font-weight:700;cursor:pointer">&#128197; Book</button>') +
'<button onclick="event.stopPropagation();openQuickPay(\'' + cid + '\')" style="flex:1;padding:6px;background:var(--c2);border:1px solid var(--bdr);border-radius:8px;color:var(--m1);font-size:10px;font-weight:700;cursor:pointer">&#128176; Pay</button>' +
'</div></div>';
}).join('') +
'</div>' + trNav();
}

function renderSched() {
if (!S.schedDate) S.schedDate = today();
if (!S.schedView) S.schedView = 'week';
return trTopBar('Schedule') +
'<div style="display:flex;align-items:center;justify-content:space-between;padding:9px 14px;background:rgba(7,7,14,.94);position:sticky;top:52px;z-index:80;border-bottom:1px solid var(--bdr)">' +
'<div style="display:flex;gap:4px">' +
['day','week','month'].map(function(v) {
var on = S.schedView === v;
return '<button onclick="S.schedView=\'' + v + '\';R()" style="padding:5px 12px;border-radius:8px;border:1px solid ' + (on?'var(--acc)':'var(--bdr)') + ';background:' + (on?'rgba(99,102,241,.15)':'transparent') + ';color:' + (on?'var(--acc)':'var(--m1)') + ';font-size:11px;font-weight:700;cursor:pointer">' + v.charAt(0).toUpperCase() + v.slice(1) + '</button>';
}).join('') + '</div>' +
'<button class="btn-sm" style="background:var(--pink)" onclick="openBookSess(null)">+ Book</button>' +
'</div>' +
'<div class="page">' +
(S.schedView === 'day' ? renderDayView() : '') +
(S.schedView === 'week' ? renderWeekView() : '') +
(S.schedView === 'month' ? renderMonthView() : '') +
'</div>' + trNav();
}

function getAllSessions() {
var all = [];
Object.keys(S.clients).forEach(function(cid) {
var c = S.clients[cid];
Object.values(c.sessions||{}).forEach(function(s) {
var item = {clientId:cid, clientName:c.name, clientType:c.type||'inperson'};
Object.keys(s).forEach(function(k){ item[k]=s[k]; });
all.push(item);
});
});
return all;
}

function renderDateNav() {
return '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">' +
'<button onclick="changeSchedDate(-1)" style="background:var(--c2);border:1px solid var(--bdr);border-radius:8px;padding:6px 14px;color:var(--tx);cursor:pointer;font-size:16px">&#8249;</button>' +
'<div style="font-size:14px;font-weight:700;color:#fff">' + (S.schedDate===today()?'Today &mdash; ':'') + fmtD(S.schedDate) + '</div>' +
'<button onclick="changeSchedDate(1)" style="background:var(--c2);border:1px solid var(--bdr);border-radius:8px;padding:6px 14px;color:var(--tx);cursor:pointer;font-size:16px">&#8250;</button>' +
'</div>';
}

function changeSchedDate(delta) {
var d = new Date(S.schedDate + 'T12:00:00');
d.setDate(d.getDate() + delta);
S.schedDate = d.toISOString().split('T')[0];
R();
}

function changeSchedMonth(delta) {
var d = new Date(S.schedDate + 'T12:00:00');
d.setMonth(d.getMonth() + delta);
d.setDate(1);
S.schedDate = d.toISOString().split('T')[0];
R();
}

function renderDayView() {
var allSess = getAllSessions().filter(function(s){ return s.date === S.schedDate; });
allSess.sort(function(a,b){ return (a.time||'').localeCompare(b.time||''); });
var hours = [];
for (var h = 6; h <= 21; h++) hours.push(h);
return renderDateNav() +
'<div style="position:relative">' +
hours.map(function(h) {
var sess = allSess.filter(function(s){ return s.time && parseInt(s.time.split(':')[0]) === h; });
return '<div style="display:flex;gap:10px;min-height:48px;border-bottom:1px solid rgba(255,255,255,.03)">' +
'<div style="min-width:40px;text-align:right;font-size:10px;color:var(--m2);padding-top:4px">' + String(h).padStart(2,'0') + ':00</div>' +
'<div style="flex:1;padding:2px 0">' +
sess.map(function(s) {
var c = S.clients[s.clientId] || {};
return '<div onclick="openCli(\''+s.clientId+'\')" style="padding:6px 10px;background:' + (s.clientType==='online'?'rgba(99,102,241,.15)':'rgba(16,185,129,.15)') + ';border-left:3px solid ' + (s.clientType==='online'?'var(--blue)':'var(--green)') + ';border-radius:0 8px 8px 0;margin-bottom:3px;cursor:pointer">' +
'<div style="font-size:12px;font-weight:700;color:#fff">' + (c.name||'Client') + '</div>' +
'<div style="font-size:10px;color:var(--m1)">' + (s.workoutName||s.clientType==='online'?'Online':'In Person') + '</div></div>';
}).join('') + '</div></div>';
}).join('') + '</div>';
}

function renderWeekView() {
var d = new Date(S.schedDate + 'T12:00:00');
var dow = d.getDay();
var mon = new Date(d); mon.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
var days = [];
for (var i = 0; i < 7; i++) {
var day = new Date(mon); day.setDate(mon.getDate() + i);
days.push(day.toISOString().split('T')[0]);
}
var allSess = getAllSessions();
var monD = new Date(days[0]+'T12:00:00');
var sunD = new Date(days[6]+'T12:00:00');
return '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
'<button onclick="changeSchedDate(-7)" style="background:var(--c2);border:1px solid var(--bdr);border-radius:8px;padding:6px 12px;color:var(--tx);cursor:pointer">&#8249;</button>' +
'<div style="font-size:13px;font-weight:700;color:#fff">' + monD.toLocaleDateString('en-GB',{day:'numeric',month:'short'}) + ' &ndash; ' + sunD.toLocaleDateString('en-GB',{day:'numeric',month:'short'}) + '</div>' +
'<button onclick="changeSchedDate(7)" style="background:var(--c2);border:1px solid var(--bdr);border-radius:8px;padding:6px 12px;color:var(--tx);cursor:pointer">&#8250;</button>' +
'</div>' +
'<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:14px">' +
days.map(function(dateStr) {
var isToday = dateStr === today();
var isSelected = dateStr === S.schedDate;
var daySess = allSess.filter(function(s){ return s.date === dateStr; });
var d2 = new Date(dateStr + 'T12:00:00');
return '<div onclick="setSchedDay(this)" data-date="' + dateStr + '"" style="background:' + (isSelected?'var(--acc)':isToday?'rgba(99,102,241,.1)':'var(--c2)') + ';border:1px solid ' + (isToday?'var(--acc)':'var(--bdr)') + ';border-radius:10px;padding:7px 4px;text-align:center;cursor:pointer;min-height:64px">' +
'<div style="font-size:9px;color:' + (isSelected?'rgba(255,255,255,.7)':'var(--m2)') + '">' + ['Su','Mo','Tu','We','Th','Fr','Sa'][d2.getDay()] + '</div>' +
'<div style="font-size:15px;font-weight:800;color:#fff;margin:3px 0">' + d2.getDate() + '</div>' +
daySess.slice(0,3).map(function(s) {
return '<div style="height:4px;border-radius:2px;background:' + (s.clientType==='online'?'var(--blue)':'var(--green)') + ';margin:1px 2px"></div>';
}).join('') +
(daySess.length > 3 ? '<div style="font-size:8px;color:' + (isSelected?'rgba(255,255,255,.6)':'var(--m2)') + '">+' + (daySess.length-3) + '</div>' : '') +
'</div>';
}).join('') + '</div>' +
'<div style="font-size:10px;font-weight:700;letter-spacing:2px;color:var(--m2);margin-bottom:8px">' + fmtD(S.schedDate).toUpperCase() + '</div>' +
renderDaySessionList(S.schedDate);
}

function renderDaySessionList(dateStr) {
var sessions = getAllSessions().filter(function(s){ return s.date === dateStr; });
sessions.sort(function(a,b){ return (a.time||'').localeCompare(b.time||''); });
if (sessions.length === 0) return '<div style="font-size:12px;color:var(--m2);padding:12px 0">No sessions this day.</div>';
return '<div class="card"><div class="card-p">' + sessions.map(function(s){ return sessRow(s); }).join('') + '</div></div>';
}

function renderMonthView() {
var d = new Date(S.schedDate + 'T12:00:00');
var year = d.getFullYear(), month = d.getMonth();
var firstDay = new Date(year, month, 1);
var lastDay = new Date(year, month + 1, 0);
var allSess = getAllSessions();
var startDow = firstDay.getDay();
var cells = [];
for (var i = 0; i < startDow; i++) cells.push(null);
for (var day = 1; day <= lastDay.getDate(); day++) cells.push(day);
while (cells.length % 7 !== 0) cells.push(null);
return '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
'<button onclick="changeSchedMonth(-1)" style="background:var(--c2);border:1px solid var(--bdr);border-radius:8px;padding:5px 12px;color:var(--tx);cursor:pointer">&#8249;</button>' +
'<div style="font-size:14px;font-weight:700;color:#fff">' + d.toLocaleDateString('en-GB',{month:'long',year:'numeric'}) + '</div>' +
'<button onclick="changeSchedMonth(1)" style="background:var(--c2);border:1px solid var(--bdr);border-radius:8px;padding:5px 12px;color:var(--tx);cursor:pointer">&#8250;</button>' +
'</div>' +
'<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:4px">' +
['Su','Mo','Tu','We','Th','Fr','Sa'].map(function(l){ return '<div style="text-align:center;font-size:9px;color:var(--m2);font-weight:700;padding:4px">' + l + '</div>'; }).join('') + '</div>' +
'<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px">' +
cells.map(function(day) {
if (!day) return '<div></div>';
var dateStr = year + '-' + String(month+1).padStart(2,'0') + '-' + String(day).padStart(2,'0');
var isToday = dateStr === today();
var daySess = allSess.filter(function(s){ return s.date === dateStr; });
return '<div onclick="setSchedDay(this)" data-date="' + dateStr + '"" style="background:' + (isToday?'rgba(99,102,241,.15)':'var(--c2)') + ';border:1px solid ' + (isToday?'var(--acc)':'var(--bdr)') + ';border-radius:8px;padding:5px;text-align:center;min-height:42px;cursor:pointer">' +
'<div style="font-size:12px;font-weight:700;color:' + (isToday?'var(--acc)':'#fff') + '">' + day + '</div>' +
daySess.slice(0,2).map(function(s) {
return '<div style="height:3px;border-radius:2px;background:' + (s.clientType==='online'?'var(--blue)':'var(--green)') + ';margin-top:2px"></div>';
}).join('') + '</div>';
}).join('') + '</div>';
}

function renderTrainerSettings() {
var tdata = DB.get('trainer') || {};
var code = tdata.inviteCode || (tdata.name||'trainer').toLowerCase().replace(/[^a-z0-9]/g,'');
var curr = tdata.currency || 'GBP';
return trTopBar('Settings') +
'<div class="page">' +
'<div class="card" style="margin-bottom:12px">' +
'<div style="font-size:11px;font-weight:700;letter-spacing:1.5px;color:var(--m2);margin-bottom:12px">TRAINER PROFILE</div>' +
'<div style="font-size:18px;font-weight:800;color:#fff;margin-bottom:4px">' + (tdata.name||'Trainer') + '</div>' +
(tdata.email?'<div style="font-size:11px;color:var(--m1);margin-bottom:8px">'+tdata.email+'</div>':'')+
'<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:14px">' +
'<span class="pill p-blue">'+curr+' '+currencySymbol(curr)+'</span>' +
(tdata.uid?'<span class="pill p-gray" style="font-size:9px">ID: '+tdata.uid.substring(0,10)+'...</span>':'')+
'</div>'+
'<div class="lbl" style="margin-bottom:6px">PREFERRED CURRENCY</div>' +
'<div style="display:flex;gap:8px;align-items:center">' +
'<select class="sel" id="tr_currency" style="flex:1">'+CURRENCIES.map(function(c){return '<option value="'+c+'"'+(c===curr?' selected':'')+'>'+c+' ('+currencySymbol(c)+')</option>';}).join('')+'</select>' +
'<button class="btn-sm" style="background:var(--acc)" onclick="saveTrainerCurrency()">Save</button>' +
'</div>' +
'</div>' +
'<div class="card" style="margin-bottom:12px">' +
'<div style="font-size:11px;font-weight:700;letter-spacing:1.5px;color:var(--m2);margin-bottom:12px">CLIENT INVITE</div>' +
'<div style="font-size:11px;color:var(--m1);margin-bottom:8px">Share this code with clients so they can create their account.</div>' +
'<div style="background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.3);border-radius:10px;padding:14px;text-align:center;margin-bottom:12px">' +
'<div style="font-size:9px;letter-spacing:2px;color:var(--acc);font-weight:700;margin-bottom:4px">YOUR INVITE CODE</div>' +
'<div style="font-size:28px;font-weight:900;color:#fff;letter-spacing:3px" id="invite_code_disp">' + code + '</div>' +
'</div>' +
'<div style="font-size:11px;font-weight:700;letter-spacing:1px;color:var(--m2);margin-bottom:6px">CHANGE INVITE CODE</div>' +
'<div style="display:flex;gap:8px">' +
'<input class="inp" id="new_invite_code" placeholder="Custom code (letters/numbers)" style="flex:1;text-transform:lowercase">' +
'<button class="btn-sm" style="background:var(--acc)" onclick="saveInviteCode()">Save</button>' +
'</div>' +
'</div>' +
'<div class="card" style="margin-bottom:12px">' +
'<div style="font-size:11px;font-weight:700;letter-spacing:1.5px;color:var(--m2);margin-bottom:12px">AI FEATURES (ANTHROPIC API)</div>' +
'<div style="font-size:11px;color:var(--m1);line-height:1.6;margin-bottom:10px">Required for: AI food description, photo calorie counting. Get a key at console.anthropic.com.</div>' +
'<div style="font-size:11px;font-weight:700;letter-spacing:1px;color:var(--m2);margin-bottom:6px">API KEY</div>' +
'<div style="display:flex;gap:8px;margin-bottom:4px">' +
'<input class="inp" id="anthropic_key_input" type="password" placeholder="sk-ant-..." value="' + (DB.get('anthropic_key')||'') + '" style="flex:1;font-family:monospace;font-size:11px">' +
'<button class="btn-sm" style="background:var(--acc)" onclick="saveApiKey()">Save</button>' +
'</div>' +
(DB.get('anthropic_key') ? '<div style="font-size:10px;color:var(--green);margin-top:2px">&#10003; API key is set</div>' : '<div style="font-size:10px;color:var(--amber);margin-top:2px">No key set yet</div>') +
'</div>' +
'<div class="card" style="margin-bottom:12px">' +
'<div style="font-size:11px;font-weight:700;letter-spacing:1.5px;color:var(--m2);margin-bottom:12px">PENDING SIGNUPS</div>' +
renderPendingSignups() +
'</div>' +
'<button class="btn" style="background:var(--red);margin-top:8px" onclick="doLogout()">&#128682; Logout</button>' +
'</div>' + trNav();
}
function saveInviteCode() {
var code = ((document.getElementById('new_invite_code')||{}).value||'').trim().toLowerCase().replace(/[^a-z0-9]/g,'');
if (!code) { toast('Enter a valid code','err'); return; }
var tdata = DB.get('trainer') || {};
var oldCode = tdata.inviteCode;
tdata.inviteCode = code;
DB.set('trainer', tdata);
if (DB._fb && S.trId) {
DB._fb.ref('trainer_codes/'+code).set(S.trId).catch(function(){});
if (oldCode && oldCode !== code) DB._fb.ref('trainer_codes/'+oldCode).remove().catch(function(){});
}
toast('Invite code updated: ' + code, 'ok');
R();
}
function saveTrainerCurrency() {
var cur = ((document.getElementById('tr_currency')||{}).value)||'GBP';
var tdata = DB.get('trainer') || {};
tdata.currency = cur;
DB.set('trainer', tdata);
toast('Currency set to '+cur+' '+currencySymbol(cur), 'ok');
R();
}
function saveApiKey() {
var key = ((document.getElementById('anthropic_key_input')||{}).value||'').trim();
if (!key) { toast('Enter an API key','err'); return; }
DB.set('anthropic_key', key);
toast('API key saved','ok');
R();
}
function renderPendingSignups() {
var pending = [];
Object.keys(localStorage).forEach(function(k) {
if (k.startsWith('pending_signup_')) {
try { var v = JSON.parse(localStorage.getItem(k)); if(v) pending.push({key:k, data:v}); } catch(e) {}
}
});
if (pending.length === 0) return '<div style="font-size:12px;color:var(--m2)">No pending signups.</div>';
return pending.map(function(p) {
return '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--bdr)">' +
'<div style="flex:1"><div style="font-size:13px;font-weight:600;color:#fff">' + p.data.name + '</div>' +
'<div style="font-size:10px;color:var(--m1)">' + (p.data.date||'') + '</div></div>' +
'<button onclick="approvePending(\''+p.key+'\')" style="padding:5px 10px;background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.3);border-radius:8px;color:var(--green);font-size:10px;font-weight:700;cursor:pointer">Approve</button>' +
'<button onclick="declinePending(\''+p.key+'\')" style="padding:5px 10px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:8px;color:var(--red);font-size:10px;font-weight:700;cursor:pointer">Decline</button>' +
'</div>';
}).join('');
}
function approvePending(key) {
try {
var v = JSON.parse(localStorage.getItem(key));
if (!v) return;
var cid = 'c' + Date.now();
DB.set('cp_' + cid, {name:v.name, pin:v.pin, balance:0, type:'in_person', joined:today()});
var tc = DB.get('tc') || {};
tc[cid] = {name:v.name, type:'in_person', balance:0, rate:0, joined:today(), lastActive:today()};
DB.set('tc', tc); S.clients = tc;
localStorage.removeItem(key);
toast(v.name + ' approved and added!', 'ok'); R();
} catch(e) { toast('Error approving signup','err'); }
}
function declinePending(key) {
localStorage.removeItem(key);
toast('Signup declined','ok'); R();
}
function renderFinance() {
if (!canUse('paymentTracking')) return renderLockedFeature('paymentTracking');
var cs = Object.entries(S.clients);
var now = new Date();
var mn = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0');
var totalRev = 0, allRev = 0;
var rows = cs.map(function(e){ var cid=e[0],c=e[1];
var rev=0;
Object.values(c.payments||{}).forEach(function(p){if(p.date&&p.date.startsWith(mn))rev+=p.amount||0; allRev+=p.amount||0;});
totalRev+=rev;
return {cid:cid, name:c.name, type:c.type, rate:c.rate||0, rev:rev, balance:c.balance||0};
});
return trTopBar('Finance') + '<div class="page">' +
'<div class="sgrid">' +
'<div class="scard"><div class="sv" style="color:var(--green)">'+totalRev.toLocaleString()+'</div><div class="sl">This Month</div></div>' +
'<div class="scard"><div class="sv" style="color:var(--amber)">'+allRev.toLocaleString()+'</div><div class="sl">All Time</div></div>' +
'<div class="scard"><div class="sv" style="color:var(--blue)">'+cs.length+'</div><div class="sl">Clients</div></div>' +
'<div class="scard"><div class="sv" style="color:var(--red)">'+rows.filter(function(c){return c.balance<=0;}).length+'</div><div class="sl">Owe Payment</div></div>' +
'</div>' +
'<div class="sect">PER CLIENT - '+fmtMon(today())+'</div>' +
(rows.length===0?'<div class="empty">Add clients to see breakdown.</div>':'') +
rows.map(function(c){ return '<div class="ccard" onclick="openCli(\''+c.cid+'\')">' +
'<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:5px">' +
'<div class="cname">'+c.name+'</div>' +
'<div style="font-size:16px;font-weight:800;color:var(--green)">'+c.rev.toLocaleString()+'</div></div>' +
'<div class="cmeta"><span>Rate: '+(c.rate?currSym(c.cid)+c.rate+'/sess':'not set')+'</span>' +
'<span class="pill '+(c.balance===0?'p-red':c.balance<=2?'p-amber':'p-green')+'">'+c.balance+' remaining</span></div></div>'; }).join('') +
'<div class="sect">LOG PAYMENT</div><div class="card"><div class="card-p">' +
'<div class="row"><div class="lbl">Client</div><select class="sel" id="fp_cli">'+cs.map(function(e){return '<option value="'+e[0]+'">'+e[1].name+'</option>';}).join('')+'</select></div>' +
'<div class="row"><div class="lbl">Amount</div><input class="inp" id="fp_amt" type="number" placeholder="e.g. 240" inputmode="decimal"></div>' +
'<button class="btn btn-green" onclick="doFinPay()">LOG PAYMENT ✓</button>' +
'</div></div></div>' + trNav();
}

function openAddClient() {
var tdata = DB.get('trainer') || {};
var trCurr = tdata.currency || 'GBP';
showModal('<div class="modal-bg" onclick="closeModal()"><div class="modal-box" onclick="event.stopPropagation()">' +
'<div class="modal-title">Add Client <button onclick="closeModal()" style="font-size:22px;color:var(--m1);cursor:pointer">&#215;</button></div>' +
'<div class="row"><div class="lbl">Name</div><input class="inp" id="nc_n" placeholder="e.g. Sarah" oninput="var u=document.getElementById(\'nc_u\');if(u&&!u._edited)u.value=this.value.toLowerCase().replace(/[^a-z0-9]/g,\'_\').replace(/_+/g,\'_\').replace(/^_|_$/g,\'\')"></div>' +
'<div class="row"><div class="lbl">Username (client uses this to log in)</div><input class="inp" id="nc_u" placeholder="e.g. sarah_jones" autocomplete="off" style="text-transform:lowercase" oninput="this._edited=true;this.value=this.value.toLowerCase().replace(/[^a-z0-9_]/g,\'\')"></div>' +
'<div class="row"><div class="lbl">Type</div><select class="sel" id="nc_t" onchange="updateAddClientType()"><option value="inperson">In-Person</option><option value="online">Online</option></select></div>' +
'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">' +
'<div><div class="lbl">Currency</div><select class="sel" id="nc_c" style="margin-bottom:0">'+CURRENCIES.map(function(c){return '<option'+(c===trCurr?' selected':'')+'>'+c+'</option>';}).join('')+'</select></div>' +
'<div><div class="lbl" id="nc_rate_lbl">Rate per session</div><input class="inp" id="nc_r" type="number" placeholder="e.g. 60" inputmode="decimal" style="margin-bottom:0"></div>' +
'</div>' +
'<div class="row"><div class="lbl">Password</div><input class="inp" id="nc_p" type="password" placeholder="Client login password"></div>' +
'<div style="border-top:1px solid var(--bdr);margin:12px 0 12px;padding-top:12px">' +
'<div style="font-size:10px;font-weight:700;letter-spacing:1.5px;color:var(--acc);margin-bottom:10px">INTAKE QUESTIONNAIRE</div>' +
'<div class="row"><div class="lbl">Primary Goal</div><select class="sel" id="nc_goal"><option value="">Select goal...</option><option value="lose_fat">Lose Fat</option><option value="build_muscle">Build Muscle</option><option value="tone">Tone &amp; Lean Up</option><option value="strength">Get Stronger</option><option value="fitness">General Fitness</option><option value="sport">Sport Performance</option><option value="rehab">Rehabilitation</option></select></div>' +
'<div class="row"><div class="lbl">Experience Level</div><select class="sel" id="nc_exp"><option value="beginner">Beginner (0-1 yr)</option><option value="intermediate">Intermediate (1-3 yrs)</option><option value="advanced">Advanced (3+ yrs)</option></select></div>' +
'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">' +
'<div><div class="lbl">Current Body Weight</div><input class="inp" id="nc_bw" type="number" placeholder="e.g. 80" inputmode="decimal" style="margin-bottom:0"></div>' +
'<div><div class="lbl">Target Weight (optional)</div><input class="inp" id="nc_tw" type="number" placeholder="e.g. 75" inputmode="decimal" style="margin-bottom:0"></div>' +
'</div>' +
'<div class="row"><div class="lbl">Injuries / Limitations (optional)</div><input class="inp" id="nc_inj" placeholder="e.g. Lower back pain, bad knees"></div>' +
'</div>' +
'<div id="nc_err"></div>' +
'<button class="btn btn-green" onclick="doAddClient()">ADD CLIENT &#8594;</button>' +
'<button class="btn btn-ghost" onclick="closeModal()">Cancel</button>' +
'</div></div>');
}
function updateAddClientType() {
var t = (document.getElementById('nc_t')||{}).value;
var lbl = document.getElementById('nc_rate_lbl');
if (lbl) lbl.textContent = t === 'online' ? 'Rate per month' : 'Rate per session';
}
function doAddClient() {
if (!canAddClient()) { showUpgradeModal('clientLimit'); return; }
var name = ((document.getElementById('nc_n')||{}).value||'').trim();
var username = ((document.getElementById('nc_u')||{}).value||'').trim().toLowerCase();
var type = (document.getElementById('nc_t')||{}).value||'inperson';
var curr = (document.getElementById('nc_c')||{}).value||'GBP';
var rate = parseFloat((document.getElementById('nc_r')||{}).value||'0')||0;
var password = ((document.getElementById('nc_p')||{}).value||'').trim();
var goal = (document.getElementById('nc_goal')||{}).value||'';
var exp = (document.getElementById('nc_exp')||{}).value||'beginner';
var bw = parseFloat((document.getElementById('nc_bw')||{}).value||'0')||0;
var tw = parseFloat((document.getElementById('nc_tw')||{}).value||'0')||0;
var inj = ((document.getElementById('nc_inj')||{}).value||'').trim();
var err = document.getElementById('nc_err');
if (!name) { if(err) err.innerHTML='<div class="err-msg">Enter client name</div>'; return; }
if (!username) { if(err) err.innerHTML='<div class="err-msg">Enter a username for the client</div>'; return; }
if (!/^[a-z0-9_]{2,20}$/.test(username)) { if(err) err.innerHTML='<div class="err-msg">Username must be 2-20 characters: letters, numbers, _ only</div>'; return; }
if (password.length < 4) { if(err) err.innerHTML='<div class="err-msg">Password must be at least 4 characters</div>'; return; }
// Check username uniqueness globally
var allKeys = Object.keys(localStorage);
for (var i = 0; i < allKeys.length; i++) {
var k = allKeys[i];
if (k.indexOf('cp_') < 0) continue;
var raw = localStorage.getItem(k); if (!raw) continue;
var ec; try { ec = JSON.parse(raw); } catch(e) { continue; }
if (ec && ec.username && ec.username === username) { if(err) err.innerHTML='<div class="err-msg">Username already taken. Choose a different one.</div>'; return; }
}
var cid = 'c' + Date.now();
var intake = {goal:goal, experience:exp, bodyWeight:bw||null, targetWeight:tw||null, injuries:inj||null, addedAt:Date.now()};
var data = {name:name, username:username, type:type, currency:curr, rate:rate, pin:password, unit:'kg', week:1, currentProgId:null, intake:intake};
DB.set('cp_'+cid, data);
S.clients[cid] = {name:name, username:username, type:type, currency:curr, rate:rate, balance:0, streak:{cur:0}, msgCount:0, sessions:{}, payments:{}};
DB.set('tc', S.clients);
DB.set('sessions_'+cid, {});
DB.set('payments_'+cid, {});
DB.set('msgs_'+cid, []);
closeModal();
toast(name+' added! Login: '+username, 'ok');
setTimeout(function(){ openAddProg(cid); }, 400);
R();
}

function openCli(cid) {
S.vCli=cid; S.cliTab='overview';
loadCliDetail(cid);
setupMsgListener(cid, 'trainer');
R();
}

function renderCliDetail() {
var cid = S.vCli;
var c = S.clients[cid]; if (!c) { S.vCli=null; return renderClients(); }
var cd = S.cliData[cid] || {};
var cp = DB.get('cp_'+cid) || {};
var tabs = [{id:'overview',icon:'&#128100;',lbl:'Profile'},{id:'training',icon:'&#128170;',lbl:'Training'},{id:'health',icon:'&#129367;',lbl:'Health'},{id:'account',icon:'&#128180;',lbl:'Account'}];
var initials = c.name.split(' ').map(function(w){return (w[0]||'').toUpperCase();}).join('').slice(0,2);
var hdr = '<div class="hdr" style="padding-bottom:0">' +
'<div class="hdr-top">' +
'<button onclick="S.vCli=null;R()" style="font-size:13px;color:var(--m1);font-weight:600;background:none;border:none;cursor:pointer">&#8592; Back</button>' +
'<div style="display:flex;align-items:center;gap:8px">' +
'<div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;color:#fff;flex-shrink:0">'+initials+'</div>' +
'<span style="font-size:16px;font-weight:800;color:#fff">'+c.name+'</span>' +
'</div>' +
'<div style="display:flex;gap:5px">' +
'<button onclick="openEditClient(\''+cid+'\')" style="width:30px;height:30px;border-radius:8px;background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.2);color:#818cf8;font-size:13px;cursor:pointer">&#9998;</button>' +
'<button onclick="deleteClientConfirm(\''+cid+'\')" style="width:30px;height:30px;border-radius:8px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);color:#f87171;font-size:13px;cursor:pointer">&#128465;</button>' +
'</div>' +
'</div>' +
'<div style="display:flex;gap:6px;padding:10px 16px 12px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none">' +
tabs.map(function(t){
var on=S.cliTab===t.id;
return '<button onclick="S.cliTab=\''+t.id+'\';R()" style="padding:7px 16px;border-radius:20px;border:1px solid '+(on?'var(--acc)':'rgba(255,255,255,.1)')+';background:'+(on?'var(--acc)':'rgba(255,255,255,.04)')+';color:'+(on?'#fff':'var(--m1)')+';font-size:12px;font-weight:700;white-space:nowrap;cursor:pointer">'+t.icon+' '+t.lbl+'</button>';
}).join('') +
'</div>' +
'</div>';
var body = '';
if (S.cliTab==='overview') body = renderCliOverview(cid, cd, c, cp);
else if (S.cliTab==='training') body = renderCliTraining(cid, cd, c, cp);
else if (S.cliTab==='health') body = renderCliHealth(cid, c, cd);
else if (S.cliTab==='account') body = renderCliAccount(cid, cd, c);
var nav = '<nav class="bnav"><button class="nb" onclick="S.vCli=null;R()"><span class="nbi">&#8592;</span>Back</button>' +
tabs.map(function(t){
var badge = t.id==='account'&&c.msgCount>0?'<span class="nbd">'+c.msgCount+'</span>':'';
return '<button class="nb'+(S.cliTab===t.id?' on':'')+'" onclick="S.cliTab=\''+t.id+'\';R()"><span class="nbi">'+t.icon+'</span>'+t.lbl+badge+'</button>';
}).join('')+'</nav>';
return hdr+'<div class="page">'+body+'</div>'+nav;
}

function renderCliOverview(cid, cd, c, cp) {
var initials = c.name.split(' ').map(function(w){return (w[0]||'').toUpperCase();}).join('').slice(0,2);
var bal = c.balance||0;
var walletCredit = c.walletCredit||0;
var noRate = !c.rate;
var sessions = buildSessLog(cd.logs||{}, cid);
var totalSess = sessions.length;
var streak = (c.streak&&c.streak.cur)||0;
var progs = getProgs(cid);
var curPid = cp.currentProgId;
var balColor = noRate?'var(--m2)':bal===0?'var(--red)':bal<=2?'var(--amber)':'var(--green)';
var balVal = noRate&&walletCredit>0?currSym(cid)+walletCredit:noRate?'--':bal+'';
var balSub = noRate&&walletCredit>0?'WALLET CREDIT':noRate?'SET RATE':bal===0?'NEEDS PAYMENT':bal<=2?'RUNNING LOW':'SESSIONS LEFT';
var upcomingSess = Object.values(c.sessions||{}).filter(function(s){return s.status==='upcoming';}).sort(function(a,b){return (a.date||'').localeCompare(b.date||'');}).slice(0,3);
var bw = cp.bodyWeight||(cp.intake&&cp.intake.bodyWeight)||'';
var tw = cp.targetWeight||(cp.intake&&cp.intake.targetWeight)||'';
var goal = cp.goal||(cp.intake&&cp.intake.goal)||'';
var exp = cp.exp||(cp.intake&&cp.intake.experience)||'';
var injuries = cp.injuries||(cp.intake&&cp.intake.injuries)||'';
var html = '';
html += '<div style="background:linear-gradient(135deg,rgba(99,102,241,.13),rgba(139,92,246,.07));border:1px solid rgba(99,102,241,.22);border-radius:18px;padding:20px;margin-bottom:14px">';
html += '<div style="display:flex;align-items:center;gap:14px;margin-bottom:18px">';
html += '<div style="width:70px;height:70px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:900;color:#fff;flex-shrink:0;box-shadow:0 4px 20px rgba(99,102,241,.35)">'+initials+'</div>';
html += '<div style="flex:1">';
html += '<div style="font-size:22px;font-weight:900;color:#fff;margin-bottom:4px">'+c.name+'</div>';
if (cp.username) html += '<div style="font-size:11px;color:var(--m2);margin-bottom:6px">Login: <span style="color:var(--acc);font-weight:700">@'+cp.username+'</span></div>';
html += '<div style="display:flex;gap:5px;flex-wrap:wrap">';
html += '<span style="padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;background:'+(c.type==='online'?'rgba(99,102,241,.2)':'rgba(16,185,129,.2)')+';color:'+(c.type==='online'?'#818cf8':'#34d399')+'">'+(c.type==='online'?'Online':'In Person')+'</span>';
if (goal) html += '<span style="padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;background:rgba(245,158,11,.15);color:var(--amber)">'+goal+'</span>';
if (c.rate) html += '<span style="padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;background:rgba(255,255,255,.07);color:var(--m1)">'+currSym(cid)+c.rate+'/sess</span>';
html += '</div></div></div>';
html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">';
html += '<div style="text-align:center;background:rgba(0,0,0,.25);border-radius:12px;padding:13px 6px"><div style="font-size:30px;font-weight:900;color:#6366f1;line-height:1">'+totalSess+'</div><div style="font-size:8px;color:var(--m2);font-weight:700;margin-top:4px;letter-spacing:.5px">SESSIONS DONE</div></div>';
html += '<div style="text-align:center;background:rgba(0,0,0,.25);border-radius:12px;padding:13px 6px"><div style="font-size:30px;font-weight:900;color:'+(streak>0?'var(--amber)':'var(--m2)')+';line-height:1">'+streak+'</div><div style="font-size:8px;color:var(--m2);font-weight:700;margin-top:4px;letter-spacing:.5px">'+(streak>0?'&#128293; STREAK':'STREAK')+'</div></div>';
html += '<div style="text-align:center;background:rgba(0,0,0,.25);border-radius:12px;padding:13px 6px"><div style="font-size:'+(balVal.length>5?'16':'28')+'px;font-weight:900;color:'+balColor+';line-height:1.1">'+balVal+'</div><div style="font-size:8px;color:var(--m2);font-weight:700;margin-top:4px;letter-spacing:.5px">'+balSub+'</div></div>';
html += '</div></div>';
html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px">';
html += '<button onclick="S.cliTab=\'account\';S.acSub=\'chat\';R()" style="padding:11px 6px;border-radius:12px;background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.2);color:#818cf8;font-size:11px;font-weight:700;cursor:pointer;text-align:center">&#128172; Message'+(c.msgCount>0?'<br><span style="font-size:10px;color:var(--amber)">'+c.msgCount+' new</span>':'')+'</button>';
html += '<button onclick="openBookSess(\''+cid+'\')" style="padding:11px 6px;border-radius:12px;background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.2);color:var(--green);font-size:11px;font-weight:700;cursor:pointer;text-align:center">&#128197; Book<br>Session</button>';
html += '<button onclick="S.cliTab=\'account\';S.acSub=\'pay\';R()" style="padding:11px 6px;border-radius:12px;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.2);color:var(--amber);font-size:11px;font-weight:700;cursor:pointer;text-align:center">&#128176; Log<br>Payment</button>';
html += '</div>';
if (bw||tw||exp||injuries||c.lastActive) {
html += '<div class="sect">PERSONAL DETAILS</div><div class="card"><div class="card-p">';
html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
if (bw) html += '<div style="padding:10px;background:var(--c2);border-radius:10px"><div style="font-size:8px;color:var(--m2);font-weight:700;letter-spacing:.5px;margin-bottom:3px">CURRENT WEIGHT</div><div style="font-size:18px;font-weight:800;color:#fff">'+bw+' <span style="font-size:11px;color:var(--m1)">'+(c.unit||'kg')+'</span></div></div>';
if (tw) html += '<div style="padding:10px;background:var(--c2);border-radius:10px"><div style="font-size:8px;color:var(--m2);font-weight:700;letter-spacing:.5px;margin-bottom:3px">TARGET WEIGHT</div><div style="font-size:18px;font-weight:800;color:var(--acc)">'+tw+' <span style="font-size:11px;color:var(--m1)">'+(c.unit||'kg')+'</span></div></div>';
if (exp) html += '<div style="padding:10px;background:var(--c2);border-radius:10px"><div style="font-size:8px;color:var(--m2);font-weight:700;letter-spacing:.5px;margin-bottom:3px">EXPERIENCE</div><div style="font-size:13px;font-weight:700;color:#fff">'+exp+'</div></div>';
if (c.lastActive) html += '<div style="padding:10px;background:var(--c2);border-radius:10px"><div style="font-size:8px;color:var(--m2);font-weight:700;letter-spacing:.5px;margin-bottom:3px">LAST ACTIVE</div><div style="font-size:13px;font-weight:700;color:#fff">'+fmtD(c.lastActive)+'</div></div>';
html += '</div>';
if (injuries) html += '<div style="margin-top:10px;padding:10px 12px;background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.15);border-radius:10px"><div style="font-size:8px;color:var(--red);font-weight:700;letter-spacing:.5px;margin-bottom:4px">&#9888; INJURIES / NOTES</div><div style="font-size:12px;color:var(--m1)">'+injuries+'</div></div>';
html += '</div></div>';
}
html += '<div class="sect">UPCOMING SESSIONS</div>';
if (upcomingSess.length>0) {
html += '<div class="card"><div class="card-p" style="padding:8px">';
html += upcomingSess.map(function(s){
return '<div style="display:flex;align-items:center;gap:10px;padding:9px;border-radius:10px;background:var(--c2);margin-bottom:6px">' +
'<div style="width:38px;height:38px;border-radius:10px;background:'+(c.type==='online'?'rgba(99,102,241,.15)':'rgba(16,185,129,.15)')+';display:flex;align-items:center;justify-content:center;font-size:18px">'+(c.type==='online'?'&#128187;':'&#127947;')+'</div>' +
'<div style="flex:1"><div style="font-size:13px;font-weight:700;color:#fff">'+fmtD(s.date)+'</div><div style="font-size:11px;color:var(--m1);margin-top:1px">'+(s.time||'Time TBD')+(s.note?' &#183; '+s.note:'')+'</div></div>' +
'<button class="btn-sm btn-green" onclick="confirmDone(\''+cid+'\',\''+s.id+'\')">Done</button>' +
'</div>';
}).join('');
html += '</div></div>';
} else {
html += '<div class="card"><div class="card-p" style="text-align:center;padding:20px 16px">' +
'<div style="font-size:32px;margin-bottom:8px">&#128197;</div>' +
'<div style="font-size:13px;color:var(--m1);margin-bottom:12px">No upcoming sessions scheduled</div>' +
'<button class="btn btn-acc" style="font-size:12px" onclick="openBookSess(\''+cid+'\')">+ Book Session</button>' +
'</div></div>';
}
if (progs.length>0) {
html += '<div class="sect">PROGRAMS</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">';
html += progs.map(function(p){
var on=p.id===curPid;
return '<span style="display:inline-flex;align-items:center">' +
'<button onclick="switchProg(\''+cid+'\',\''+p.id+'\')" style="padding:7px 12px;border-radius:12px 0 0 12px;border:1px solid '+(on?'var(--acc)':'var(--bdr)')+';border-right:none;background:'+(on?'rgba(99,102,241,.12)':'transparent')+';color:'+(on?'var(--acc)':'var(--m1)')+';font-size:11px;font-weight:700;cursor:pointer">'+(on?'&#10003; ':'')+p.name+'</button>' +
'<button onclick="editProg(\''+cid+'\',\''+p.id+'\')" style="padding:7px 9px;border-radius:0 12px 12px 0;border:1px solid '+(on?'var(--acc)':'var(--bdr)')+';background:'+(on?'rgba(99,102,241,.12)':'transparent')+';color:'+(on?'var(--acc)':'var(--m1)')+';font-size:11px;cursor:pointer">&#9998;</button>' +
'</span>';
}).join('');
html += '<button onclick="openAddProg(\''+cid+'\')" style="padding:7px 12px;border-radius:12px;border:1px dashed var(--bdr);background:transparent;color:var(--m2);font-size:11px;font-weight:700;cursor:pointer">+ Add</button>';
html += '</div>';
} else {
html += '<button onclick="openAddProg(\''+cid+'\')" style="width:100%;padding:12px;border-radius:12px;border:1px dashed var(--acc);background:rgba(99,102,241,.05);color:var(--acc);font-size:12px;font-weight:700;cursor:pointer;margin-bottom:14px">+ Add Training Program for '+c.name+'</button>';
}
html += '<div class="sect">COACHING NOTE</div><div class="card"><div class="card-p">';
html += '<textarea class="inp" id="tr_note" rows="3" placeholder="Training notes, form cues, next steps..." style="min-height:70px;margin-bottom:8px">'+getLatTrNote(cid,cd)+'</textarea>';
html += '<button class="btn-sm btn-acc" onclick="saveTrNote(\''+cid+'\')">Send to Client &#10003;</button>';
html += '</div></div>';
return html;
}

function renderCliTraining(cid, cd, c, cp) {
var sub = S.trSub||'programs';
var html = '<div style="display:flex;gap:6px;margin-bottom:14px;overflow-x:auto;scrollbar-width:none">';
html += '<button onclick="S.trSub=\'programs\';R()" style="flex-shrink:0;padding:7px 16px;border-radius:20px;border:1px solid '+(sub==='programs'?'var(--acc)':'rgba(255,255,255,.1)')+';background:'+(sub==='programs'?'var(--acc)':'rgba(255,255,255,.04)')+';color:'+(sub==='programs'?'#fff':'var(--m1)')+';font-size:12px;font-weight:700;cursor:pointer">&#128170; Programs</button>';
html += '<button onclick="S.trSub=\'log\';R()" style="flex-shrink:0;padding:7px 16px;border-radius:20px;border:1px solid '+(sub==='log'?'var(--acc)':'rgba(255,255,255,.1)')+';background:'+(sub==='log'?'var(--acc)':'rgba(255,255,255,.04)')+';color:'+(sub==='log'?'#fff':'var(--m1)')+';font-size:12px;font-weight:700;cursor:pointer">&#128203; Workout Log</button>';
html += '<button onclick="S.trSub=\'stats\';R()" style="flex-shrink:0;padding:7px 16px;border-radius:20px;border:1px solid '+(sub==='stats'?'var(--acc)':'rgba(255,255,255,.1)')+';background:'+(sub==='stats'?'var(--acc)':'rgba(255,255,255,.04)')+';color:'+(sub==='stats'?'#fff':'var(--m1)')+';font-size:12px;font-weight:700;cursor:pointer">&#128200; Progress</button>';
html += '</div>';
if (sub==='programs') return html + renderCliPrograms(cid, cd, c);
if (sub==='log') return html + renderCliLog(cid, cd, c);
return html + renderCliProg(cid, cd, c);
}
function renderCliPrograms(cid, cd, c) {
var progs = getProgs(cid);
var cp2 = DB.get('cp_'+cid)||{};
var curPid = cp2.currentProgId||null;
var html = '';
if (progs.length > 0) {
html += '<div class="sect" style="margin-top:0">PROGRAMS</div>';
html += progs.map(function(p) {
var on = p.id === curPid;
var days = p.days || [];
return '<div style="background:var(--c1);border:1px solid '+(on?'var(--acc)':'var(--bdr)')+';border-radius:14px;padding:14px 16px;margin-bottom:10px">' +
'<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">' +
'<div>' +
'<div style="font-size:15px;font-weight:800;color:#fff;margin-bottom:3px">'+p.name+'</div>' +
'<div style="font-size:11px;color:var(--m2)">'+days.length+' day'+(days.length===1?'':'s')+(p.duration?' &bull; '+p.duration+' weeks':'')+' '+(on?'<span style="color:var(--acc);font-weight:700">&bull; Active</span>':'')+'</div>' +
'</div>' +
'<div style="display:flex;gap:6px">' +
(!on?'<button onclick="switchProg(\''+cid+'\',\''+p.id+'\')" style="padding:5px 10px;border-radius:8px;background:rgba(99,102,241,.12);border:1px solid rgba(99,102,241,.25);color:#818cf8;font-size:11px;font-weight:700;cursor:pointer">Set Active</button>':'') +
'<button onclick="editProg(\''+cid+'\',\''+p.id+'\')" style="width:30px;height:30px;border-radius:8px;background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.2);color:#818cf8;font-size:13px;cursor:pointer">&#9998;</button>' +
'</div></div>' +
(days.length?'<div style="display:flex;gap:5px;flex-wrap:wrap">'+days.map(function(d){
return '<span style="padding:3px 9px;border-radius:8px;background:rgba(255,255,255,.05);border:1px solid var(--bdr);font-size:10px;font-weight:700;color:var(--m1)">'+(d.title||d.tag||'Day')+'</span>';
}).join('')+'</div>':'')+
'</div>';
}).join('');
html += '<button onclick="openAddProg(\''+cid+'\')" style="width:100%;padding:11px;border-radius:12px;border:1px dashed var(--bdr);background:transparent;color:var(--m2);font-size:12px;font-weight:700;cursor:pointer;margin-bottom:14px">+ Add Another Program</button>';
} else {
html += '<div style="text-align:center;padding:30px 20px;background:var(--c1);border:1px solid var(--bdr);border-radius:14px;margin-bottom:14px">' +
'<div style="font-size:40px;margin-bottom:10px">&#128170;</div>' +
'<div style="font-size:15px;font-weight:700;color:#fff;margin-bottom:6px">No program yet</div>' +
'<div style="font-size:12px;color:var(--m1);margin-bottom:16px">Build a custom training program for '+c.name+'</div>' +
'<button onclick="openAddProg(\''+cid+'\')" class="btn btn-acc" style="font-size:12px">+ Build Training Program</button>' +
'</div>';
}
html += '<div class="sect">COACHING NOTE</div><div class="card"><div class="card-p">';
html += '<textarea class="inp" id="tr_note" rows="3" placeholder="Training notes, form cues, next steps..." style="min-height:70px;margin-bottom:8px">'+getLatTrNote(cid,cd)+'</textarea>';
html += '<button class="btn-sm btn-acc" onclick="saveTrNote(\''+cid+'\')">Send to Client &#10003;</button>';
html += '</div></div>';
return html;
}

function renderCliHealth(cid, c, cd) {
var sub = S.hlSub||'nutr';
var html = '<div style="display:flex;gap:6px;margin-bottom:14px">';
html += '<button onclick="S.hlSub=\'nutr\';R()" style="padding:7px 16px;border-radius:20px;border:1px solid '+(sub==='nutr'?'var(--acc)':'rgba(255,255,255,.1)')+';background:'+(sub==='nutr'?'var(--acc)':'rgba(255,255,255,.04)')+';color:'+(sub==='nutr'?'#fff':'var(--m1)')+';font-size:12px;font-weight:700;cursor:pointer">&#129367; Nutrition</button>';
html += '<button onclick="S.hlSub=\'check\';R()" style="padding:7px 16px;border-radius:20px;border:1px solid '+(sub==='check'?'var(--acc)':'rgba(255,255,255,.1)')+';background:'+(sub==='check'?'var(--acc)':'rgba(255,255,255,.04)')+';color:'+(sub==='check'?'#fff':'var(--m1)')+';font-size:12px;font-weight:700;cursor:pointer">&#128164; Check-in</button>';
html += '</div>';
if (sub==='nutr') return html + renderCliNutr(cid, c);
return html + renderCliCheckin(cid, c);
}

function renderCliAccount(cid, cd, c) {
var sub = S.acSub||'pay';
var chatBadge = c.msgCount>0?'<span class="nbd" style="margin-left:4px">'+c.msgCount+'</span>':'';
var html = '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">';
html += '<button onclick="S.acSub=\'pay\';R()" style="padding:7px 16px;border-radius:20px;border:1px solid '+(sub==='pay'?'var(--acc)':'rgba(255,255,255,.1)')+';background:'+(sub==='pay'?'var(--acc)':'rgba(255,255,255,.04)')+';color:'+(sub==='pay'?'#fff':'var(--m1)')+';font-size:12px;font-weight:700;cursor:pointer">&#128180; Payments</button>';
html += '<button onclick="S.acSub=\'sess\';R()" style="padding:7px 16px;border-radius:20px;border:1px solid '+(sub==='sess'?'var(--acc)':'rgba(255,255,255,.1)')+';background:'+(sub==='sess'?'var(--acc)':'rgba(255,255,255,.04)')+';color:'+(sub==='sess'?'#fff':'var(--m1)')+';font-size:12px;font-weight:700;cursor:pointer">&#128197; Sessions</button>';
html += '<button onclick="S.acSub=\'chat\';R()" style="padding:7px 16px;border-radius:20px;border:1px solid '+(sub==='chat'?'var(--acc)':'rgba(255,255,255,.1)')+';background:'+(sub==='chat'?'var(--acc)':'rgba(255,255,255,.04)')+';color:'+(sub==='chat'?'#fff':'var(--m1)')+';font-size:12px;font-weight:700;cursor:pointer">&#128172; Chat'+chatBadge+'</button>';
html += '</div>';
if (sub==='pay') return html + renderCliPay(cid, cd, c);
if (sub==='sess') return html + renderCliSess(cid, cd, c);
return html + renderCliChat(cid, cd, c);
}

function buildSessLog(logs, cid) {
var sess = {}, progs = getProgs(cid), cp = getProg(cid);
Object.keys(logs).forEach(function(key) {
var l = logs[key]; if (!l||!l.done) return;
var p = key.split('_');
var w=parseInt(p[0].replace('w','')),d=parseInt(p[1].replace('d','')),ei=parseInt(p[2].replace('e','')),si=parseInt(p[3].replace('s',''));
var k2='w'+w+'_d'+d;
var day = cp && cp.days ? cp.days[d] : null;
if (!sess[k2]) sess[k2]={w:w,d:d,day:day,exLogs:{},sk:k2,ts:l.ts||0};
if (!sess[k2].exLogs[ei]) sess[k2].exLogs[ei]={ex:day&&day.ex?day.ex[ei]:null,sets:{}};
sess[k2].exLogs[ei].sets[si]=l;
if((l.ts||0)>sess[k2].ts)sess[k2].ts=l.ts;
});
return Object.values(sess).sort(function(a,b){return b.ts-a.ts;});
}

function renderCliLog(cid, cd, c) {
var sessions = buildSessLog(cd.logs||{}, cid);
return (sessions.length===0?'<div class="empty">No workouts logged yet.<br>Data appears here as '+c.name+' trains.</div>':
sessions.map(function(s){ return renderSessCard(s,cid,cd); }).join('')) +
'<div class="sect">COACHING NOTE</div><div class="card"><div class="card-p">' +
'<div class="lbl" style="margin-bottom:6px">Feedback - saved to '+c.name+'</div>' +
'<textarea class="inp" id="tr_note" rows="3" placeholder="Training notes, form cues, next steps..." style="min-height:70px;margin-bottom:8px">'+getLatTrNote(cid,cd)+'</textarea>' +
'<button class="btn-sm btn-acc" onclick="saveTrNote(\''+cid+'\')">Send to Client ✓</button>' +
'</div></div>';
}
function getLatTrNote(cid, cd) {
var sn = cd.sessNotes || {};
var notes = Object.values(sn).map(function(n){return n.trainer||'';}).filter(Boolean);
return notes.length ? notes[notes.length-1] : '';
}
function saveTrNote(cid) {
var ta = document.getElementById('tr_note'); if (!ta||!ta.value.trim()) return;
var sn = DB.get('sessnotes_'+cid) || {};
var keys = Object.keys(sn).sort();
var key = keys.length ? keys[keys.length-1] : 'w1_d0';
sn[key] = sn[key]||{}; sn[key].trainer=ta.value; sn[key].trainerTs=Date.now();
DB.set('sessnotes_'+cid, sn);
if (S.cliData[cid]) S.cliData[cid].sessNotes=sn;
var cnn = S.clients[cid]?S.clients[cid].name:'client';
toast('Note saved for '+cnn, 'ok');
}
function renderSessCard(sess, cid, cd) {
var isExp = S.expS[sess.sk];
var di = sess.day;
var setCnt = Object.values(sess.exLogs).reduce(function(t,e){return t+Object.keys(e.sets).length;},0);
var sn = cd.sessNotes && cd.sessNotes[sess.sk];
var accent = di?(di.accent||'#6366f1'):'#6366f1';
return '<div class="card" style="border-color:'+(isExp?accent:'var(--bdr)')+';margin-bottom:8px">' +
'<div style="padding:12px 13px;cursor:pointer;display:flex;justify-content:space-between;align-items:center" onclick="S.expS[\''+sess.sk+'\']=!S.expS[\''+sess.sk+'\'];R()">' +
'<div><div style="font-weight:800;font-size:14px;color:'+accent+'">'+(di?di.title:'Session')+' <span style="font-size:11px;color:var(--m1);font-weight:400">Wk'+sess.w+'</span>' +
(sn&&sn.rating?'<span style="font-size:11px;color:var(--amber);margin-left:6px">'+('&#11088;').repeat(sn.rating)+'</span>':'')+'</div>' +
'<div style="font-size:10px;color:var(--m1);margin-top:2px">'+setCnt+' sets'+(sess.ts?' &#183; '+fmtD(new Date(sess.ts).toISOString().split('T')[0]):'')+'</div></div>' +
'<span style="font-size:14px;color:var(--m2)">'+(isExp?'&#9652;':'&#9662;')+'</span></div>' +
(isExp?'<div style="padding:12px 13px;border-top:1px solid var(--bdr)">' +
Object.keys(sess.exLogs).sort(function(a,b){return parseInt(a)-parseInt(b);}).map(function(ei){
var exLog=sess.exLogs[ei], ex=exLog.ex;
if(!ex)return'';
var lName=Object.values(exLog.sets)[0]?(Object.values(exLog.sets)[0].exName||ex.n):ex.n;
var sets=Object.keys(exLog.sets).sort(function(a,b){return parseInt(a)-parseInt(b);});
return '<div style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid var(--bdr)">' +
'<div style="font-weight:600;font-size:12px;color:#fff;margin-bottom:5px">'+lName+'</div>' +
'<div style="display:flex;gap:5px;flex-wrap:wrap">'+sets.map(function(si){
var lg=exLog.sets[si]; if(!lg||!lg.done) return '';
return '<span class="pill p-green">S'+(parseInt(si)+1)+' '+(lg.weight?'<strong>'+lg.weight+'kg</strong>':'')+
(lg.reps?' x '+lg.reps:'')+(lg.rpe?'<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:'+rpeC(lg.rpe)+';margin-left:2px;vertical-align:middle"></span>':'')+'</span>';
}).join('')+'</div></div>';
}).join('') +
(sn&&sn.client?'<div style="margin-top:6px;padding:7px 10px;background:rgba(16,185,129,.06);border-radius:8px;border-left:2px solid var(--green)"><div style="font-size:9px;font-weight:700;color:var(--green);margin-bottom:2px">CLIENT NOTE</div><div style="font-size:11px;color:var(--m1)">"'+sn.client+'"</div></div>':'') +
'<div style="display:flex;gap:6px;align-items:flex-end;margin-top:10px">' +
'<textarea class="inp" id="sn_'+sess.sk+'" rows="2" placeholder="Coaching note..." style="flex:1;min-height:36px">'+(sn&&sn.trainer?sn.trainer:'')+'</textarea>' +
'<button class="btn-sm btn-acc" onclick="saveSNT(\''+cid+'\',\''+sess.sk+'\')">✓</button></div>' +
'</div>':'') + '</div>';
}
function saveSNT(cid, snKey) {
var ta=document.getElementById('sn_'+snKey); if(!ta)return;
var sn=DB.get('sessnotes_'+cid)||{};
sn[snKey]=sn[snKey]||{}; sn[snKey].trainer=ta.value; sn[snKey].trainerTs=Date.now();
DB.set('sessnotes_'+cid,sn);
if(S.cliData[cid])S.cliData[cid].sessNotes=sn;
toast('Note saved','ok');
}

function buildProgData(logs, cid) {
var ex={}, progs=getProgs(cid);
Object.keys(logs).forEach(function(key){
var l=logs[key]; if(!l||!l.done||!l.weight)return;
var p=key.split('_');
var w=parseInt(p[0].replace('w','')),d=parseInt(p[1].replace('d','')),ei=parseInt(p[2].replace('e',''));
var exName=l.exName;
if(!exName){for(var pi=0;pi<progs.length;pi++){var pr=progs[pi];if(pr.days&&pr.days[d]&&pr.days[d].ex&&pr.days[d].ex[ei]){exName=pr.days[d].ex[ei].n;break;}}}
if(!exName)return;
var k=exName.replace(/[^a-zA-Z0-9]/g,'_');
if(!ex[k])ex[k]={name:exName,bw:{}};
var wt=parseFloat(l.weight)||0;
if(!ex[k].bw[w]||wt>ex[k].bw[w])ex[k].bw[w]=wt;
});
return Object.values(ex).filter(function(e){return Object.keys(e.bw).length>0;});
}
function renderPBar(pd, unit) {
var ws=Object.entries(pd.bw).sort(function(a,b){return parseInt(a)-parseInt(b);});
if(!ws.length)return'';
var mx=Math.max.apply(null,ws.map(function(x){return x[1];}));
var lw=ws[ws.length-1][1],fw=ws[0][1],imp=lw>fw;
return '<div class="card"><div class="card-p">' +
'<div style="display:flex;justify-content:space-between;margin-bottom:8px">' +
'<div style="font-weight:700;font-size:12px;color:#fff">'+pd.name+'</div>' +
(imp?'<span style="font-size:10px;color:var(--green);font-weight:700">+'+(lw-fw).toFixed(1)+unit+' ⇧</span>':'')+'</div>' +
ws.map(function(e){ var wn=e[0],wt=e[1];
var pct=mx>0?(wt/mx)*100:0, isPR=wt===mx&&ws.length>1;
var wkc=(WK[wn]||{}).c||'#fff';
return '<div class="pr-brow"><span style="font-size:10px;font-weight:700;width:18px;flex-shrink:0;color:'+wkc+'">'+wn+'</span>' +
'<div class="pr-bg"><div class="pr-fill" style="width:'+pct+'%;background:'+(isPR?'var(--amber)':'var(--green)')+'"></div></div>' +
'<span class="pr-val">'+wt+unit+(isPR?'<span class="pr-tag">PR</span>':'')+'</span></div>';
}).join('')+'</div></div>';
}
function renderCliProg(cid, cd, c) {
var prs=Object.values(cd.prs||{});
var pd=buildProgData(cd.logs||{},cid);
var cu=c.unit||'kg';
return (prs.length?'<div class="sect">🏆 PERSONAL RECORDS</div>'+prs.map(function(pr){
return '<div class="card"><div class="card-p" style="display:flex;justify-content:space-between;align-items:center">' +
'<div><div style="font-weight:600;font-size:13px;color:#fff">'+pr.exName+'</div><div style="font-size:10px;color:var(--m1)">'+fmtD(pr.date)+'</div></div>' +
'<div style="text-align:right"><div style="font-size:15px;font-weight:800;color:var(--amber)">'+pr.weight+cu+' x '+pr.reps+'</div>' +
'<div style="font-size:10px;color:var(--m2)">~'+Math.round(pr.est)+cu+' 1RM</div></div></div></div>';
}).join(''):'') +
'<div class="sect">WEIGHT PROGRESSION</div>' +
(pd.length===0?'<div class="empty">No weight data yet.</div>':pd.map(function(p){return renderPBar(p,cu);}).join(''));
}

function renderCliSess(cid, cd, c) {
var sessions=Object.values(c.sessions||{}).sort(function(a,b){return(b.date||'').localeCompare(a.date||'');});
return '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' +
'<div class="sect" style="margin:0">SESSIONS</div>' +
'<button class="btn-sm" style="background:var(--pink)" onclick="openBookSess(\''+cid+'\')">+ Book</button></div>' +
(sessions.length===0?'<div class="empty">No sessions yet.</div>':
'<div class="card"><div class="card-p">'+sessions.map(function(s){
var done=s.status==='done';
return '<div class="si">' +
'<div class="si-time"><div class="si-th">'+(s.time||'&#8211;')+'</div><div class="si-td">'+fmtD(s.date)+'</div></div>' +
'<div class="si-dot" style="background:'+(done?'#2d3748':c.type==='online'?'#6366f1':'#10b981')+'"></div>' +
'<div class="si-info"><div class="si-name" style="color:'+(done?'var(--m2)':'#fff')+'">'+(done?'Done':'Upcoming')+'</div>' +
'<div class="si-meta">'+(c.type==='online'?'Online':'In Person')+(s.workoutName?' &#8212; &#128170; '+s.workoutName:s.note?' &#8212; '+s.note:'')+'</div></div>' +
'<div style="display:flex;gap:4px">' +
(!done?'<button class="btn-sm" style="background:var(--green)" onclick="confirmDone(\''+cid+'\',\''+s.id+'\')">Done</button>':'') +
(!done?'<button style="width:26px;height:26px;border-radius:7px;background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.2);color:#818cf8;font-size:12px;cursor:pointer" onclick="openEditSess(\''+cid+'\',\''+s.id+'\')">&#9998;</button>':'') +
'<button style="width:26px;height:26px;border-radius:7px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);color:#f87171;font-size:12px;cursor:pointer" onclick="deleteSessConfirm(\''+cid+'\',\''+s.id+'\')">&#215;</button>' +
'</div>' +
'</div>';
}).join('')+'</div></div>');
}

function renderPremiumToggle(cid, cd) {
var premData = (cd&&cd.premium)||{};
var active = premData.active===true && (!premData.expiresAt||premData.expiresAt>Date.now());
return '<div class="sect">CLIENT PREMIUM</div>' +
'<div class="card"><div class="card-p">' +
'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
'<div><div style="font-size:13px;font-weight:700;color:#fff">Premium Access</div>' +
'<div style="font-size:11px;color:var(--m1);margin-top:2px">Badges, detailed analytics, body tracking &amp; more</div></div>' +
'<span class="pill '+(active?'p-green':'p-gray')+'">'+(active?'Active':'Inactive')+'</span>' +
'</div>' +
'<button class="btn '+(active?'btn-red':'btn-acc')+' btn-sm" style="width:100%;padding:9px;font-size:12px" onclick="toggleClientPremium(\''+cid+'\','+active+')">'+
(active?'Revoke Premium':'Grant Premium (Free)')+'</button>' +
'</div></div>';
}
function renderCliPay(cid, cd, c) {
var isOnline=c.type==='online';
var bal=c.balance||0;
var wallet=c.walletCredit||0;
var pays=Object.values(cd.payments||{}).sort(function(a,b){return b.ts-a.ts;});
var alertHtml='';
if(isOnline){
if(wallet>0)alertHtml='<div style="background:rgba(99,102,241,.08);border:1px solid rgba(99,102,241,.2);border-radius:10px;padding:12px 14px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center">' +
'<div style="font-size:12px;color:var(--m1)">Wallet Balance</div>' +
'<div style="font-size:16px;font-weight:800;color:var(--acc)">'+currSym(cid)+wallet+'</div></div>';
} else {
if(bal<=2)alertHtml='<div class="alert alert-'+(bal===0?'red':'amber')+'">' +
'<div style="font-size:20px">'+(bal===0?'&#128680;':'&#9888;&#65039;')+'</div>' +
'<div style="flex:1"><div style="font-weight:700;font-size:13px;color:#fff">'+(bal===0?'No sessions left':'Running low')+'</div>' +
'<div style="font-size:11px;color:var(--m1)">Send a payment reminder</div></div>' +
'<button class="btn-sm btn-red" onclick="sendPayReminder(\''+cid+'\')">Remind</button></div>';
}
var payHistoryRows=pays.map(function(p){
var detail='';
if(isOnline){
var parts=[];
if(p.monthsCovered>0)parts.push(p.monthsCovered+' month'+(p.monthsCovered>1?'s':''));
if(p.inPersonCovered>0)parts.push(p.inPersonCovered+' in-person sess.');
if(p.walletRemainder>0)parts.push(currSym(cid)+p.walletRemainder+' surplus');
detail=parts.length?parts.join(' + '):'stored to wallet';
} else {
detail=(p.sessions||0)+' session'+((p.sessions||0)===1?'':'s')+' added';
}
return '<div class="pay-row"><div><div class="pay-amt">+'+currSym(cid)+p.amount+'</div>' +
'<div class="pay-info">'+fmtD(p.date)+' - '+detail+(p.note?' - '+p.note:'')+'</div></div></div>';
}).join('');
var rateHint=isOnline?
'<div style="font-size:11px;color:var(--m1);margin-bottom:10px;padding:7px 10px;background:var(--c2);border-radius:8px">' +
(c.rate?'Monthly: '+currSym(cid)+c.rate+'/month':'No monthly rate set') +
(c.inPersonRate?' &bull; In-person: '+currSym(cid)+c.inPersonRate+'/session':'') +
'</div>' :
'<div style="font-size:11px;color:var(--m1);margin-bottom:10px;padding:7px 10px;background:var(--c2);border-radius:8px">Rate: '+currSym(cid)+(c.rate||0)+'/session &mdash; amount &divide; rate = sessions added</div>';
return alertHtml +
'<div class="sect">PAYMENT HISTORY</div>' +
(pays.length===0?'<div class="empty">No payments yet.</div>':
'<div class="card"><div class="card-p">'+payHistoryRows+'</div></div>') +
'<div class="sect">LOG PAYMENT</div><div class="card"><div class="card-p">' +
'<div class="row"><div class="lbl">Amount ('+currSym(cid)+')</div><input class="inp" id="pp_amt" type="number" placeholder="e.g. 240" inputmode="decimal"></div>' +
'<div class="row"><div class="lbl">Note (optional)</div><input class="inp" id="pp_note" placeholder="e.g. Bank transfer"></div>' +
rateHint +
'<button class="btn btn-green" onclick="doCliPay(\''+cid+'\')">LOG PAYMENT &#10003;</button>' +
'</div></div>' +
renderPremiumToggle(cid, cd);
}
function doCliPay(cid) {
var amt=parseFloat((document.getElementById('pp_amt')||{}).value||'0')||0;
var note=((document.getElementById('pp_note')||{}).value||'').trim();
if(!amt){toast('Enter payment amount','err');return;}
logPay(cid,amt,note);
loadCliDetail(cid); R();
}
function sendPayReminder(cid) {
var c=S.clients[cid]||{};
var bal=c.balance||0;
var msg='Hi '+c.name+', just a reminder you have '+bal+' session'+(bal===1?'':'s')+' remaining. Please arrange payment when convenient. Thank you!';
sendMsg(msg,'trainer',cid);
toast('Reminder sent','ok');
}

function renderCliCheckin(cid, c) {
var all = DB.get('recovery_' + cid) || {};
var keys = Object.keys(all).sort().reverse().slice(0, 30);
if (keys.length === 0) {
return '<div class="empty">No check-ins logged yet.<br>Client uses the Check-in tab on their Home screen.</div>';
}
var todayKey = today();
var todayRec = all[todayKey];
var html = '';
if (todayRec) {
var avgT = Math.round(((todayRec.sleep||0) + (10-(todayRec.soreness||5)) + (todayRec.energy||0) + (todayRec.mood||0)) / 4);
html += '<div style="background:rgba(16,185,129,.05);border:1px solid rgba(16,185,129,.2);border-radius:14px;padding:14px;margin-bottom:14px">' +
'<div style="font-size:9px;font-weight:700;letter-spacing:1.5px;color:var(--green);margin-bottom:12px">TODAY&#39;S CHECK-IN &#10003;</div>' +
'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
'<div style="text-align:center;padding:10px;background:rgba(255,255,255,.03);border-radius:10px"><div style="font-size:22px;margin-bottom:4px">&#128564;</div><div style="font-size:10px;color:var(--m2)">Sleep</div><div style="font-size:26px;font-weight:900;color:#3b82f6">' + (todayRec.sleep||0) + '</div><div style="font-size:9px;color:var(--m2)">/10</div></div>' +
'<div style="text-align:center;padding:10px;background:rgba(255,255,255,.03);border-radius:10px"><div style="font-size:22px;margin-bottom:4px">&#128137;</div><div style="font-size:10px;color:var(--m2)">Soreness</div><div style="font-size:26px;font-weight:900;color:var(--red)">' + (todayRec.soreness||0) + '</div><div style="font-size:9px;color:var(--m2)">/10</div></div>' +
'<div style="text-align:center;padding:10px;background:rgba(255,255,255,.03);border-radius:10px"><div style="font-size:22px;margin-bottom:4px">&#9889;</div><div style="font-size:10px;color:var(--m2)">Energy</div><div style="font-size:26px;font-weight:900;color:var(--amber)">' + (todayRec.energy||0) + '</div><div style="font-size:9px;color:var(--m2)">/10</div></div>' +
'<div style="text-align:center;padding:10px;background:rgba(255,255,255,.03);border-radius:10px"><div style="font-size:22px;margin-bottom:4px">&#128512;</div><div style="font-size:10px;color:var(--m2)">Mood</div><div style="font-size:26px;font-weight:900;color:var(--green)">' + (todayRec.mood||0) + '</div><div style="font-size:9px;color:var(--m2)">/10</div></div>' +
'</div>' +
'<div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.06);text-align:center">' +
'<span style="font-size:11px;color:var(--m2)">Readiness score: </span>' +
'<span style="font-size:15px;font-weight:800;color:' + (avgT>=7?'var(--green)':avgT>=5?'var(--amber)':'var(--red)') + '">' + avgT + '/10</span>' +
'</div></div>';
}
html += '<div style="font-size:10px;font-weight:700;letter-spacing:1.5px;color:var(--m2);margin-bottom:10px">HISTORY</div>';
html += keys.filter(function(k){ return k !== todayKey; }).map(function(k) {
var r = all[k];
var avg = Math.round(((r.sleep||0) + (10-(r.soreness||5)) + (r.energy||0) + (r.mood||0)) / 4);
var col = avg >= 7 ? 'var(--green)' : avg >= 5 ? 'var(--amber)' : 'var(--red)';
return '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--c1);border:1px solid var(--bdr);border-radius:10px;margin-bottom:6px">' +
'<div style="flex:1">' +
'<div style="font-size:12px;font-weight:600;color:#fff;margin-bottom:3px">' + fmtD(k) + '</div>' +
'<div style="display:flex;gap:8px;font-size:10px;color:var(--m2)">' +
'<span>&#128564; ' + (r.sleep||0) + '</span>' +
'<span>&#128137; ' + (r.soreness||0) + '</span>' +
'<span>&#9889; ' + (r.energy||0) + '</span>' +
'<span>&#128512; ' + (r.mood||0) + '</span>' +
'</div></div>' +
'<div style="text-align:center">' +
'<div style="font-size:20px;font-weight:900;color:' + col + '">' + avg + '</div>' +
'<div style="font-size:9px;color:var(--m2)">/ 10</div>' +
'</div></div>';
}).join('');
return html;
}
function renderCliChat(cid, cd, c) {
readMsgs(cid,'trainer');
var msgs=cd.messages?Object.values(cd.messages).sort(function(a,b){return a.ts-b.ts;}):[];
return '<div class="chat-wrap" id="msgList">' +
(msgs.length===0?'<div class="empty">No messages yet.</div>':'') +
msgs.map(function(m){
var isMe=m.from==='trainer';
return '<div class="chat-msg '+(isMe?'from-me':'from-them')+'">' +
'<div class="bubble">'+m.text+'</div>' +
'<div class="chat-ts">'+(isMe?'You':c.name)+' - '+fmtT(m.ts)+'</div></div>';
}).join('') + '</div>' +
'<div class="chat-bar">' +
'<textarea class="chat-ta" id="tr_msg" placeholder="Message '+c.name+'..." rows="1"></textarea>' +
'<button class="chat-send" onclick="doTrMsg(\''+cid+'\')">➤</button></div>';
}
function doTrMsg(cid) {
var ta=document.getElementById('tr_msg'); if(!ta||!ta.value.trim())return;
sendMsg(ta.value,'trainer',cid); ta.value='';
loadCliDetail(cid); R();
}

function doFinPay() {
var cid=(document.getElementById('fp_cli')||{}).value;
var amt=parseFloat((document.getElementById('fp_amt')||{}).value||'0')||0;
if(!cid||!amt){toast('Select client and enter amount','err');return;}
logPay(cid,amt,'');
document.getElementById('fp_amt').value='';
}

function openBookSess(cid) {
var cs=Object.entries(S.clients);
var selCid=cid||(cs.length?cs[0][0]:'');
var selClient=S.clients[selCid]||{};
var isOnline=selClient.type==='online';
showModal('<div class="modal-bg" onclick="closeModal()"><div class="modal-box" onclick="event.stopPropagation()">' +
'<div class="modal-title">Book Session <button onclick="closeModal()" style="font-size:22px;color:var(--m1);cursor:pointer">&#215;</button></div>' +
'<div class="row"><div class="lbl">Client</div><select class="sel" id="bs_c" onchange="onBsClientChange()">'+cs.map(function(e){return '<option value="'+e[0]+'"'+(cid&&cid===e[0]?' selected':'')+'>'+e[1].name+'</option>';}).join('')+'</select></div>' +
'<div id="bs_calltype_row" class="row" style="display:'+(isOnline?'block':'none')+'"><div class="lbl">Session Type</div><select class="sel" id="bs_calltype" onchange="onBsCallTypeChange()"><option value="weekly_call">Weekly Call</option><option value="inperson">In-Person Session</option></select></div>' +
'<div class="row"><div class="lbl">Date</div><input class="inp" id="bs_d" type="date" value="'+today()+'" onchange="autoDetectBsWorkout()"></div>' +
'<div class="row"><div class="lbl">Time</div><input class="inp" id="bs_t" type="time" value="10:00"></div>' +
'<div id="bs_wk_row" class="row" style="display:'+(isOnline?'none':'block')+'"><div class="lbl">Link Workout (optional)</div><select class="sel" id="bs_wk">'+_getBsWorkoutOpts(cid)+'</select></div>' +
'<div id="bs_topics_row" class="row" style="display:'+(isOnline?'block':'none')+'"><div class="lbl">Topics / Notes</div><textarea class="inp" id="bs_topics" rows="3" placeholder="What to discuss in this call..." style="resize:vertical;min-height:70px"></textarea></div>' +
'<div id="bs_note_row" class="row"><div class="lbl">Note (optional)</div><input class="inp" id="bs_n" placeholder="e.g. Legs day"></div>' +
'<div class="row"><div class="lbl">Repeat</div><select class="sel" id="bs_rpt" onchange="togRecur()"><option value="none">No Repeat</option><option value="7">Weekly</option><option value="14">Every 2 Weeks</option><option value="30">Monthly</option></select></div>' +
'<div id="bs_rpt_row" style="display:none" class="row"><div class="lbl">Number of Sessions</div><input class="inp" id="bs_cnt" type="number" value="4" min="2" max="52" inputmode="numeric"></div>' +
'<button class="btn btn-pink" style="background:var(--pink)" onclick="doBookSess()">BOOK &#8594;</button>' +
'<button class="btn btn-ghost" onclick="closeModal()">Cancel</button>' +
'</div></div>');
autoDetectBsWorkout();
}
function onBsClientChange() {
var cidEl=document.getElementById('bs_c'); if(!cidEl)return;
var cid=cidEl.value;
var c=S.clients[cid]||{};
var isOnline=c.type==='online';
var calltypeRow=document.getElementById('bs_calltype_row');
var wkRow=document.getElementById('bs_wk_row');
var topicsRow=document.getElementById('bs_topics_row');
if(calltypeRow)calltypeRow.style.display=isOnline?'block':'none';
if(wkRow)wkRow.style.display=isOnline?'none':'block';
if(topicsRow)topicsRow.style.display=isOnline?'block':'none';
var wkEl=document.getElementById('bs_wk'); if(wkEl)wkEl.innerHTML=_getBsWorkoutOpts(cid);
autoDetectBsWorkout();
}
function onBsCallTypeChange() {
var calltype=(document.getElementById('bs_calltype')||{}).value||'weekly_call';
var wkRow=document.getElementById('bs_wk_row');
var topicsRow=document.getElementById('bs_topics_row');
var isCall=calltype==='weekly_call';
if(wkRow)wkRow.style.display=isCall?'none':'block';
if(topicsRow)topicsRow.style.display=isCall?'block':'none';
}
function _getBsWorkoutOpts(cid) {
var prog=getProg(cid);
if(!prog||!prog.days||!prog.days.length)return '<option value="">&#8212; No program assigned &#8212;</option>';
var WD_NAMES=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
var opts='<option value="">&#8212; Auto-detect / None &#8212;</option>';
for(var di=0;di<prog.days.length;di++){
var d=prog.days[di];
var wdStr=(d.weekdays||[]).map(function(w){return WD_NAMES[w];}).join(', ');
opts+='<option value="'+di+'">'+(d.title||d.tag||'Workout '+(di+1))+(wdStr?' ('+wdStr+')':'')+' &#8212; '+(d.ex?d.ex.length:0)+' exercises</option>';
}
return opts;
}
function refreshBsWorkouts() {
onBsClientChange();
}
function autoDetectBsWorkout() {
var cidEl=document.getElementById('bs_c'); if(!cidEl)return;
var dateEl=document.getElementById('bs_d'); if(!dateEl||!dateEl.value)return;
var wkEl=document.getElementById('bs_wk'); if(!wkEl)return;
if(wkEl.value!=='')return; // already manually selected
var cid=cidEl.value;
var wd=new Date(dateEl.value+'T12:00:00').getDay();
var prog=getProg(cid);
if(!prog||!prog.days)return;
for(var di=0;di<prog.days.length;di++){
var wds=prog.days[di].weekdays||[];
if(wds.indexOf(wd)>=0){wkEl.value=String(di);return;}
}
}
function togRecur() {
var v=(document.getElementById('bs_rpt')||{}).value;
var row=document.getElementById('bs_rpt_row');
if(row)row.style.display=(v&&v!=='none')?'block':'none';
}
function doBookSess() {
var cid=(document.getElementById('bs_c')||{}).value;
var date=(document.getElementById('bs_d')||{}).value;
var time=(document.getElementById('bs_t')||{}).value;
var note=((document.getElementById('bs_n')||{}).value||'').trim();
var rpt=(document.getElementById('bs_rpt')||{}).value||'none';
var cnt=parseInt((document.getElementById('bs_cnt')||{}).value)||4;
var wkIdxStr=((document.getElementById('bs_wk')||{}).value||'');
var callType=((document.getElementById('bs_calltype')||{}).value||'');
var topics=((document.getElementById('bs_topics')||{}).value||'').trim();
if(!cid||!date){toast('Select client and date','err');return;}
var c=S.clients[cid]||{};
var prog=getProg(cid);
function _buildSessData(dateStr){
var base={date:dateStr,time:time,type:c.type||'inperson',note:note};
if(c.type==='online'&&callType){
base.callType=callType;
if(callType==='weekly_call'&&topics)base.topics=topics;
}
var resolvedIdx=wkIdxStr!==''?parseInt(wkIdxStr):null;
if(resolvedIdx===null&&prog&&prog.days&&callType!=='weekly_call'){
var wd=new Date(dateStr+'T12:00:00').getDay();
for(var di=0;di<prog.days.length;di++){
if((prog.days[di].weekdays||[]).indexOf(wd)>=0){resolvedIdx=di;break;}
}
}
if(resolvedIdx!==null&&prog&&prog.days&&prog.days[resolvedIdx]){
base.workoutDayIdx=resolvedIdx;
base.workoutName=prog.days[resolvedIdx].title||prog.days[resolvedIdx].tag||'Workout';
}
return base;
}
if(rpt==='none'){
bookSess(cid,_buildSessData(date));
}else{
var days=parseInt(rpt);
var d=new Date(date+'T12:00:00');
for(var i=0;i<cnt;i++){
var ds=d.toISOString().split('T')[0];
bookSess(cid,_buildSessData(ds));
d.setDate(d.getDate()+days);
}
toast(cnt+' sessions booked','ok');
}
closeModal(); R();
}
function confirmDone(cid, sessId) {
var c=S.clients[cid]||{};
showModal('<div class="modal-bg" onclick="closeModal()"><div class="modal-box" onclick="event.stopPropagation()">' +
'<div style="text-align:center;padding:20px 0">' +
'<div style="font-size:48px;margin-bottom:12px">&#9989;</div>' +
'<div style="font-size:20px;font-weight:800;color:#fff;margin-bottom:8px">'+c.name+'</div>' +
'<div style="font-size:13px;color:var(--m1);margin-bottom:6px">Mark session as completed?</div>' +
'<div style="font-size:13px;color:var(--amber);font-weight:700;margin-bottom:20px">1 session will be deducted</div></div>' +
'<button class="btn btn-green" onclick="doDone(\''+cid+'\',\''+sessId+'\')">YES - DONE &#10003;</button>' +
'<button class="btn btn-ghost" onclick="closeModal()">Cancel</button>' +
'</div></div>');
}
function doDone(cid,sessId){completeSess(cid,sessId);closeModal();R();}

function openEditSess(cid, sessId) {
var local=DB.get('sessions_'+cid)||{};
var s=local[sessId]; if(!s)return;
showModal('<div class="modal-bg" onclick="closeModal()"><div class="modal-box" onclick="event.stopPropagation()">' +
'<div class="modal-title">Edit Session <button onclick="closeModal()" style="font-size:22px;color:var(--m1);cursor:pointer">&#215;</button></div>' +
'<div class="row"><div class="lbl">Date</div><input class="inp" id="es_d" type="date" value="'+(s.date||today())+'"></div>' +
'<div class="row"><div class="lbl">Time</div><input class="inp" id="es_t" type="time" value="'+(s.time||'10:00')+'"></div>' +
'<div class="row"><div class="lbl">Note (optional)</div><input class="inp" id="es_n" value="'+(s.note||'')+'" placeholder="e.g. Legs day"></div>' +
'<button class="btn btn-acc" onclick="doEditSess(\''+cid+'\',\''+sessId+'\')">SAVE CHANGES &#10003;</button>' +
'<button class="btn btn-ghost" onclick="closeModal()">Cancel</button>' +
'</div></div>');
}
function doEditSess(cid, sessId) {
var date=(document.getElementById('es_d')||{}).value||today();
var time=(document.getElementById('es_t')||{}).value||'';
var note=((document.getElementById('es_n')||{}).value||'').trim();
var local=DB.get('sessions_'+cid)||{};
if(local[sessId]){local[sessId].date=date;local[sessId].time=time;local[sessId].note=note;}
DB.set('sessions_'+cid,local);
if(!S.clients[cid])S.clients[cid]={};
S.clients[cid].sessions=local;
DB.set('tc',S.clients);
closeModal(); toast('Session updated','ok'); R();
}
function deleteSessConfirm(cid, sessId) {
showModal('<div class="modal-bg" onclick="closeModal()"><div class="modal-box" onclick="event.stopPropagation()">' +
'<div style="text-align:center;padding:20px 0">' +
'<div style="font-size:48px;margin-bottom:12px">&#128465;</div>' +
'<div style="font-size:18px;font-weight:800;color:#fff;margin-bottom:8px">Delete Session?</div>' +
'<div style="font-size:13px;color:var(--m1);margin-bottom:20px">This cannot be undone.</div></div>' +
'<button class="btn btn-red" onclick="doDeleteSess(\''+cid+'\',\''+sessId+'\')">YES, DELETE</button>' +
'<button class="btn btn-ghost" onclick="closeModal()">Cancel</button>' +
'</div></div>');
}
function doDeleteSess(cid, sessId) {
var local=DB.get('sessions_'+cid)||{};
delete local[sessId];
DB.set('sessions_'+cid,local);
if(!S.clients[cid])S.clients[cid]={};
S.clients[cid].sessions=local;
DB.set('tc',S.clients);
closeModal(); toast('Session deleted','ok'); R();
}

function deleteClientConfirm(cid) {
var c=S.clients[cid]||{};
showModal('<div class="modal-bg" onclick="closeModal()"><div class="modal-box" onclick="event.stopPropagation()">' +
'<div style="text-align:center;padding:20px 0">' +
'<div style="font-size:48px;margin-bottom:12px">&#9888;&#65039;</div>' +
'<div style="font-size:18px;font-weight:800;color:#fff;margin-bottom:8px">Remove '+c.name+'?</div>' +
'<div style="font-size:13px;color:var(--m1);margin-bottom:6px">All sessions, payments, and logs will be permanently deleted.</div>' +
'<div style="font-size:11px;color:var(--red);margin-bottom:20px;font-weight:700">This cannot be undone.</div></div>' +
'<button class="btn btn-red" onclick="doDeleteClient(\''+cid+'\')">YES, REMOVE CLIENT</button>' +
'<button class="btn btn-ghost" onclick="closeModal()">Cancel</button>' +
'</div></div>');
}
function doDeleteClient(cid) {
var c=S.clients[cid]||{};
delete S.clients[cid];
DB.set('tc',S.clients);
var keys=['cp_','logs_','sessions_','payments_','msgs_','streak_','prs_','exnotes_','sessnotes_','progs_','premium_'];
keys.forEach(function(pfx){DB.del(pfx+cid);});
S.vCli=null;
closeModal();
toast((c.name||'Client')+' removed','ok');
R();
}

function openEditClient(cid) {
var c=S.clients[cid]||{};
var cp=DB.get('cp_'+cid)||{};
var isOnline=c.type==='online';
var isActive=c.active!==false;
showModal('<div class="modal-bg" onclick="closeModal()"><div class="modal-box" onclick="event.stopPropagation()">' +
'<div class="modal-title">Edit Client <button onclick="closeModal()" style="font-size:22px;color:var(--m1);cursor:pointer">&#215;</button></div>' +
'<div class="row"><div class="lbl">Name</div><input class="inp" id="ec_n" value="'+(c.name||'')+'"></div>' +
'<div class="row"><div class="lbl">Type</div><select class="sel" id="ec_t" onchange="updateEditClientType()"><option value="inperson"'+(c.type==='inperson'?' selected':'')+'>In-Person</option><option value="online"'+(c.type==='online'?' selected':'')+'>Online</option></select></div>' +
'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">' +
'<div><div class="lbl">Currency</div><select class="sel" id="ec_c" style="margin-bottom:0">'+CURRENCIES.map(function(cur){return '<option'+(cur===(c.currency||'GBP')?' selected':'')+'>'+cur+'</option>';}).join('')+'</select></div>' +
'<div><div class="lbl" id="ec_rate_lbl">'+(isOnline?'Rate per month':'Rate per session')+'</div><input class="inp" id="ec_r" type="number" value="'+(c.rate||'')+'" inputmode="decimal" style="margin-bottom:0"></div>' +
'</div>' +
'<div id="ec_inperson_rate_row" class="row" style="display:'+(isOnline?'block':'none')+'"><div class="lbl">In-Person Session Rate (optional)</div><input class="inp" id="ec_ipr" type="number" value="'+(c.inPersonRate||'')+'" inputmode="decimal" placeholder="Leave blank if included in monthly"></div>' +
'<div class="row"><div class="lbl">Status</div>' +
'<div style="display:flex;gap:8px">' +
'<button id="ec_act_on" onclick="setEditActive(true)" style="flex:1;padding:8px;border-radius:10px;border:1.5px solid '+(isActive?'var(--green)':'var(--bdr)')+';background:'+(isActive?'rgba(16,185,129,.12)':'transparent')+';color:'+(isActive?'var(--green)':'var(--m1)')+';font-size:12px;font-weight:700;cursor:pointer">&#10003; Active</button>' +
'<button id="ec_act_off" onclick="setEditActive(false)" style="flex:1;padding:8px;border-radius:10px;border:1.5px solid '+(!isActive?'var(--red)':'var(--bdr)')+';background:'+(!isActive?'rgba(239,68,68,.12)':'transparent')+';color:'+(!isActive?'var(--red)':'var(--m1)')+';font-size:12px;font-weight:700;cursor:pointer">&#215; Inactive</button>' +
'</div></div>' +
'<input type="hidden" id="ec_active" value="'+(isActive?'1':'0')+'">' +
'<div class="row"><div class="lbl">New Password (leave blank to keep)</div><input class="inp" id="ec_p" type="password" placeholder="Min 4 characters"></div>' +
'<div id="ec_err"></div>' +
'<button class="btn btn-acc" onclick="doEditClient(\''+cid+'\')">SAVE CHANGES &#10003;</button>' +
'<button class="btn btn-ghost" onclick="closeModal()">Cancel</button>' +
'</div></div>');
}
function setEditActive(val) {
var hidEl=document.getElementById('ec_active'); if(hidEl)hidEl.value=val?'1':'0';
var onBtn=document.getElementById('ec_act_on');
var offBtn=document.getElementById('ec_act_off');
if(onBtn){onBtn.style.borderColor=val?'var(--green)':'var(--bdr)';onBtn.style.background=val?'rgba(16,185,129,.12)':'transparent';onBtn.style.color=val?'var(--green)':'var(--m1)';}
if(offBtn){offBtn.style.borderColor=!val?'var(--red)':'var(--bdr)';offBtn.style.background=!val?'rgba(239,68,68,.12)':'transparent';offBtn.style.color=!val?'var(--red)':'var(--m1)';}
}
function updateEditClientType() {
var t=(document.getElementById('ec_t')||{}).value;
var lbl=document.getElementById('ec_rate_lbl');
var iprRow=document.getElementById('ec_inperson_rate_row');
if(lbl)lbl.textContent=t==='online'?'Rate per month':'Rate per session';
if(iprRow)iprRow.style.display=t==='online'?'block':'none';
}
function doEditClient(cid) {
var name=((document.getElementById('ec_n')||{}).value||'').trim();
var type=(document.getElementById('ec_t')||{}).value||'inperson';
var curr=(document.getElementById('ec_c')||{}).value||'GBP';
var rate=parseFloat((document.getElementById('ec_r')||{}).value||'0')||0;
var inPersonRate=parseFloat((document.getElementById('ec_ipr')||{}).value||'0')||0;
var password=((document.getElementById('ec_p')||{}).value||'').trim();
var activeVal=((document.getElementById('ec_active')||{}).value||'1')==='1';
var err=document.getElementById('ec_err');
if(!name){if(err)err.innerHTML='<div class="err-msg">Name is required</div>';return;}
if(password&&password.length<4){if(err)err.innerHTML='<div class="err-msg">Password must be at least 4 characters</div>';return;}
if(S.clients[cid]){S.clients[cid].name=name;S.clients[cid].type=type;S.clients[cid].currency=curr;S.clients[cid].rate=rate;S.clients[cid].active=activeVal;
if(type==='online'&&inPersonRate>0)S.clients[cid].inPersonRate=inPersonRate;
else if(type==='online')delete S.clients[cid].inPersonRate;
}
var walletMsg = '';
if(type!=='online' && rate > 0 && S.clients[cid] && (S.clients[cid].walletCredit || 0) > 0) {
var credit = S.clients[cid].walletCredit;
var sessFromCredit = Math.floor(credit / rate);
var remainder = Math.round((credit - sessFromCredit * rate) * 100) / 100;
if(sessFromCredit > 0) {
S.clients[cid].balance = (S.clients[cid].balance || 0) + sessFromCredit;
S.clients[cid].walletCredit = remainder;
walletMsg = ' - ' + sessFromCredit + ' sessions from ' + currSym(cid) + credit + ' credit';
}
}
DB.set('tc',S.clients);
var cp=DB.get('cp_'+cid)||{};
cp.name=name;cp.type=type;cp.currency=curr;cp.rate=rate;cp.active=activeVal;
if(type==='online'&&inPersonRate>0)cp.inPersonRate=inPersonRate; else delete cp.inPersonRate;
if(password)cp.pin=password;
DB.set('cp_'+cid,cp);
closeModal(); toast(name+' updated' + walletMsg, 'ok'); R();
}

function openTrainerProfile() {
var tr=DB.get('trainer')||{};
showModal('<div class="modal-bg" onclick="closeModal()"><div class="modal-box" onclick="event.stopPropagation()">' +
'<div class="modal-title">My Profile <button onclick="closeModal()" style="font-size:22px;color:var(--m1);cursor:pointer">&#215;</button></div>' +
'<div style="text-align:center;margin-bottom:20px">' +
'<div style="width:64px;height:64px;border-radius:50%;background:rgba(99,102,241,.2);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;color:var(--acc);margin:0 auto 10px">'+((tr.name||'A').charAt(0).toUpperCase())+'</div>' +
'<div style="font-size:16px;font-weight:700;color:#fff">'+(tr.name||'Trainer')+'</div>' +
'<div style="font-size:11px;color:var(--m2);margin-top:3px">Ahmed Personal Training</div>' +
'</div>' +
(S.referralCode?'<div style="background:rgba(99,102,241,.08);border:1px solid rgba(99,102,241,.2);border-radius:10px;padding:12px;margin-bottom:16px;text-align:center">' +
'<div style="font-size:9px;letter-spacing:2px;color:var(--m2);font-weight:700;margin-bottom:4px">YOUR REFERRAL CODE</div>' +
'<div style="font-size:22px;font-weight:900;color:var(--acc);letter-spacing:3px">'+S.referralCode+'</div>' +
'<button onclick="copyReferralCode()" style="margin-top:6px;padding:4px 12px;border-radius:8px;background:rgba(99,102,241,.15);border:1px solid rgba(99,102,241,.3);color:var(--acc);font-size:10px;font-weight:700;cursor:pointer">COPY CODE</button>' +
'</div>':'') +
'<div style="border-top:1px solid var(--bdr);padding-top:14px">' +
'<div class="row"><div class="lbl">Display Name</div><input class="inp" id="tp_n" value="'+(tr.name||'')+'"></div>' +
'<div class="row"><div class="lbl">New PIN (leave blank to keep)</div><input class="inp" id="tp_p" type="tel" maxlength="4" placeholder="4 digits" inputmode="numeric"></div>' +
'<div style="border-top:1px solid var(--bdr);margin:12px 0;padding-top:12px">' +
'<div style="font-size:10px;font-weight:700;letter-spacing:1.5px;color:var(--acc);margin-bottom:8px">AI MESSAGES (ANTHROPIC API)</div>' +
'<div class="row"><div class="lbl">Anthropic API Key</div><input class="inp" id="tp_ak" value="'+(DB.get('anthropic_key')||'')+'" placeholder="sk-ant-..." type="password"></div>' +
'<div style="font-size:10px;color:var(--m2);margin-bottom:10px;line-height:1.5">Powers personalised AI workout messages for clients. Leave blank to use built-in messages. Key is stored locally on this device only.</div>' +
'</div>' +
'<div id="tp_err"></div>' +
'<button class="btn btn-acc" onclick="doSaveProfile()">SAVE &#10003;</button>' +
'</div>' +
'<div style="border-top:1px solid var(--bdr);margin-top:16px;padding-top:14px">' +
'<div style="font-size:10px;font-weight:700;letter-spacing:1.5px;color:var(--red);margin-bottom:8px">DANGER ZONE</div>' +
'<div style="font-size:11px;color:var(--m2);margin-bottom:10px;line-height:1.5">Clear all client data from this account. Use this if wrong data was migrated. Your trainer profile and login are kept &mdash; only clients, sessions, payments and programs are removed.</div>' +
'<button class="btn" style="background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:#f87171;font-size:12px;font-weight:700" onclick="confirmClearAccountData()">&#128465; Clear All Client Data</button>' +
'</div>' +
'<button class="btn btn-ghost" onclick="closeModal()">Cancel</button>' +
'</div></div>');
}
function doSaveProfile() {
var name=((document.getElementById('tp_n')||{}).value||'').trim();
var pin=((document.getElementById('tp_p')||{}).value||'').trim();
var apiKey=((document.getElementById('tp_ak')||{}).value||'').trim();
var err=document.getElementById('tp_err');
if(!name){if(err)err.innerHTML='<div class="err-msg">Name is required</div>';return;}
if(pin&&pin.length<4){if(err)err.innerHTML='<div class="err-msg">PIN must be 4 digits</div>';return;}
var tr=DB.get('trainer')||{};
tr.name=name;
if(pin)tr.pin=pin;
DB.set('trainer',tr);
if(apiKey)DB.set('anthropic_key',apiKey);
else if(!apiKey&&DB.get('anthropic_key'))DB.del('anthropic_key');
closeModal(); toast('Profile updated','ok'); R();
}

function confirmClearAccountData() {
showModal('<div class="modal-bg" onclick="closeModal()"><div class="modal-box" onclick="event.stopPropagation()">' +
'<div style="text-align:center;padding:10px 0 20px">' +
'<div style="font-size:48px;margin-bottom:12px">&#9888;&#65039;</div>' +
'<div style="font-size:18px;font-weight:800;color:#f87171;margin-bottom:8px">Clear All Client Data?</div>' +
'<div style="font-size:13px;color:var(--m1);line-height:1.6;margin-bottom:20px">This will permanently delete all clients, sessions, payments, programs and activity logs from this account.<br><strong style="color:#fff">This cannot be undone.</strong></div>' +
'<button class="btn" style="background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.4);color:#f87171;font-weight:800;margin-bottom:8px" onclick="doClearAccountData()">YES, DELETE EVERYTHING</button>' +
'<button class="btn btn-ghost" onclick="closeModal()">Cancel</button>' +
'</div></div></div>');
}
function doClearAccountData() {
var uid = S.trId;
var prefix = uid ? uid+'_' : '';
var WIPE_KEYS = ['tc','sub','referral_code','activity_log'];
var WIPE_PFX = ['cp_','logs_','progs_','sessions_','payments_','habits_','goals_','nots_','msgs_','activity_log_','bio_','program_'];
var all = Object.keys(localStorage);
var removed = 0;
for (var i=0; i<all.length; i++) {
var k = all[i];
// Only touch keys belonging to this account's namespace
var bare = prefix && k.indexOf(prefix)===0 ? k.slice(prefix.length) : (prefix?null:k);
if (bare === null) continue;
var shouldWipe = WIPE_KEYS.indexOf(bare) >= 0;
if (!shouldWipe) {
for (var j=0; j<WIPE_PFX.length; j++) {
if (bare.indexOf(WIPE_PFX[j]) === 0) { shouldWipe = true; break; }
}
}
if (shouldWipe) { localStorage.removeItem(k); removed++; }
}
// Also wipe from Firebase under this account's path
if (DB._fb && uid) {
var wipePaths = ['tc','activity_log'];
for (var w=0; w<wipePaths.length; w++) {
DB._fb.ref('trainers/'+uid+'/'+wipePaths[w]).remove().catch(function(){});
}
}
S.clients = {};
closeModal();
toast('Account data cleared (' + removed + ' records removed)', 'ok');
setTimeout(function(){ R(); }, 300);
}
function openQuickMsg(cid) {
var c=S.clients[cid]||{};
showModal('<div class="modal-bg" onclick="closeModal()"><div class="modal-box" onclick="event.stopPropagation()">' +
'<div class="modal-title">&#128172; Message '+c.name+' <button onclick="closeModal()" style="font-size:22px;color:var(--m1);cursor:pointer">&#215;</button></div>' +
'<div class="row"><textarea class="inp" id="qm_txt" rows="3" placeholder="Type a message..."></textarea></div>' +
'<button class="btn btn-acc" onclick="doQuickMsg(\''+cid+'\')">SEND &#8594;</button>' +
'<button class="btn btn-ghost" onclick="closeModal()">Cancel</button>' +
'</div></div>');
setTimeout(function(){var el=document.getElementById('qm_txt');if(el)el.focus();},100);
}
function doQuickMsg(cid) {
var txt=((document.getElementById('qm_txt')||{}).value||'').trim();
if(!txt){toast('Enter a message','err');return;}
sendMsg(txt,'trainer',cid);
if(S.cliData[cid])S.cliData[cid].messages=DB.get('msgs_'+cid)||{};
closeModal(); toast('Sent to '+((S.clients[cid]||{}).name||'client'),'ok');
}
function openQuickPay(cid) {
var c=S.clients[cid]||{};
var isOnline=c.type==='online';
var hasWallet=(c.walletCredit||0)>0;
var noRate=!c.rate;
var rateNote;
if (isOnline) {
rateNote = c.rate ?
'<div style="font-size:11px;color:var(--m1);margin-bottom:8px;padding:8px 11px;background:var(--c2);border-radius:9px">Monthly subscription: <strong>'+currSym(cid)+c.rate+'/month</strong>'+(c.inPersonRate?' &bull; In-person: <strong>'+currSym(cid)+c.inPersonRate+'/session</strong>':'')+'</div>' :
'<div style="font-size:11px;color:var(--amber);padding:9px 11px;background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);border-radius:9px;margin-bottom:12px">&#9888; No monthly rate set. Edit client to set rates.</div>';
} else {
rateNote = c.rate ?
'<div style="font-size:11px;color:var(--m1);margin-bottom:12px">'+currSym(cid)+c.rate+'/session &mdash; sessions added = amount &divide; rate</div>' :
'<div style="font-size:11px;color:var(--amber);padding:9px 11px;background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);border-radius:9px;margin-bottom:12px">&#9888; No session rate set &mdash; payment will be stored as credit.</div>';
}
var walletNote = hasWallet ?
'<div style="font-size:11px;color:var(--acc);margin-bottom:8px">Wallet balance: <strong>'+currSym(cid)+(c.walletCredit||0)+'</strong></div>' : '';
showModal('<div class="modal-bg" onclick="closeModal()"><div class="modal-box" onclick="event.stopPropagation()">' +
'<div class="modal-title">&#128176; Payment &mdash; '+c.name+' <button onclick="closeModal()" style="font-size:22px;color:var(--m1);cursor:pointer">&#215;</button></div>' +
rateNote + walletNote +
'<div class="row"><div class="lbl">Amount ('+currSym(cid)+')</div><input class="inp" id="qp_amt" type="number" placeholder="e.g. 240" inputmode="decimal"></div>' +
'<div class="row"><div class="lbl">Note (optional)</div><input class="inp" id="qp_note" placeholder="e.g. Bank transfer"></div>' +
'<button class="btn btn-green" onclick="doQuickPay(\''+cid+'\')">LOG PAYMENT &#10003;</button>' +
(!c.rate?'<button class="btn btn-acc" style="margin-bottom:8px" onclick="closeModal();openEditClient(\''+cid+'\')">&#9998; Set Rate</button>':'') +
'<button class="btn btn-ghost" onclick="closeModal()">Cancel</button>' +
'</div></div>');
}
function doQuickPay(cid) {
var amt=parseFloat((document.getElementById('qp_amt')||{}).value||'');
var note=((document.getElementById('qp_note')||{}).value||'').trim();
if(!amt||amt<=0){toast('Enter a valid amount','err');return;}
logPay(cid,amt,note);
closeModal();
}

function openAddProg(cid) {
if (!canUse('programBuilder')) { showUpgradeModal('programBuilder'); return; }
var saved=DB.get('prog_templates')||[];
showModal('<div class="modal-bg" onclick="closeModal()"><div class="modal-box" onclick="event.stopPropagation()">' +
'<div class="modal-title">Add Program <button onclick="closeModal()" style="font-size:22px;color:var(--m1);cursor:pointer">&#215;</button></div>' +
(saved.length>0?'<div class="sect" style="margin-top:0">YOUR SAVED PROGRAMS</div>'+
saved.map(function(t,i){
return '<div style="display:flex;gap:8px;margin-bottom:8px">' +
'<button class="btn btn-acc" style="flex:1;text-align:left;display:flex;justify-content:space-between;align-items:center;margin-bottom:0" onclick="useTemplate(\''+cid+'\','+i+')">' +
'<div><div style="font-size:13px;font-weight:700">'+t.name+'</div>' +
'<div style="font-size:10px;opacity:.7">'+(t.days?t.days.length:0)+' days</div></div><span>&#8594;</span></button>' +
'<button onclick="delTemplate('+i+')" style="padding:8px 10px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);border-radius:8px;color:#f87171;cursor:pointer;font-size:12px">&#215;</button></div>';
}).join('')+'<div class="sect">BUILD FROM SCRATCH</div>':'<div class="sect" style="margin-top:0">BUILD FROM SCRATCH</div>') +
'<div class="row"><div class="lbl">Program Name</div><input class="inp" id="np_name" placeholder="e.g. Strength Block Phase 2"></div>' +
'<button class="btn btn-acc" style="margin-bottom:8px" onclick="startBuilder(\''+cid+'\')">BUILD CUSTOM PROGRAM &#8594;</button>' +
'<button class="btn btn-ghost" onclick="closeModal()">Cancel</button>' +
'</div></div>');
}

function useTemplate(cid, idx) {
var saved=DB.get('prog_templates')||[];
var t=saved[idx]; if(!t)return;
var prog=JSON.parse(JSON.stringify(t));
prog.id='prog_'+Date.now(); prog.created=Date.now();
if(!prog.duration)prog.duration=4;
saveProg(cid,prog);
}
function delTemplate(idx) {
var saved=DB.get('prog_templates')||[];
saved.splice(idx,1); DB.set('prog_templates',saved);
toast('Template deleted','ok');
if(S.vCli)openAddProg(S.vCli); else closeModal();
}
function saveProg(cid,prog) {
if(!prog.startDate)prog.startDate=Date.now();
var progs=getProgs(cid); progs.push(prog);
DB.set('progs_'+cid,progs);
var cp=DB.get('cp_'+cid)||{}; cp.currentProgId=prog.id;
DB.set('cp_'+cid,cp);
closeModal(); toast(prog.name+' added','ok'); R();
}
function switchProg(cid,pid) {
var cp=DB.get('cp_'+cid)||{}; cp.currentProgId=pid;
DB.set('cp_'+cid,cp);
var prog=getProgById(pid,cid);
toast('Switched to '+(prog?prog.name:'program'),'ok'); R();
}
function getProgById(pid,cid) {
var progs=getProgs(cid);
for(var i=0;i<progs.length;i++){if(progs[i].id===pid)return progs[i];}
return null;
}
function editProg(cid,pid) {
var prog=getProgById(pid,cid);
if(!prog){toast('Program not found','err');return;}
_bp.cid=cid; _bp.prog=JSON.parse(JSON.stringify(prog)); _bp.editId=pid;
showBuilder();
}

var _bp={cid:null,prog:null,editId:null}, _bpDay=0, _bpEditEx=null, _bpDrag=null, _bpDragOver=null;
// Touch drag handlers (attached once at load)
document.addEventListener('touchmove', function(e){
  if (!_bpDrag) return;
  e.preventDefault();
  var t = e.touches[0];
  var el = document.elementFromPoint(t.clientX, t.clientY);
  while (el && !('bpei' in (el.dataset||{}))) el = el.parentElement;
  if (el && el.dataset) {
    var ndi=parseInt(el.dataset.bpdi), nei=parseInt(el.dataset.bpei);
    if (!_bpDragOver || _bpDragOver.di!==ndi || _bpDragOver.ei!==nei) {
      _bpDragOver = {di:ndi, ei:nei};
      document.querySelectorAll('[data-bpei]').forEach(function(r){ r.style.borderTop=''; r.style.opacity='1'; });
      var tEl = document.querySelector('[data-bpdi="'+ndi+'"][data-bpei="'+nei+'"]');
      if (tEl) tEl.style.borderTop = '2px solid #6366f1';
      var dEl = document.querySelector('[data-bpdi="'+_bpDrag.di+'"][data-bpei="'+_bpDrag.ei+'"]');
      if (dEl) dEl.style.opacity = '0.4';
    }
  }
}, {passive:false});
document.addEventListener('touchend', function(){
  if (!_bpDrag) return;
  if (_bpDragOver && _bpDrag.di===_bpDragOver.di && _bpDrag.ei!==_bpDragOver.ei) {
    var di=_bpDrag.di, ex=_bp.prog.days[di].ex;
    var item=ex.splice(_bpDrag.ei,1)[0];
    var t=_bpDragOver.ei; if (_bpDrag.ei<t) t--;
    ex.splice(t,0,item);
  }
  _bpDrag=null; _bpDragOver=null; showBuilder();
});
function startBuilder(cid) {
if (!canUse('programBuilder')) { showUpgradeModal('programBuilder'); return; }
var name=((document.getElementById('np_name')||{}).value||'').trim();
if(!name){toast('Enter a program name first','err');return;}
_bp.cid=cid; _bp.prog={id:'prog_'+Date.now(),name:name,days:[],duration:4,created:Date.now()};
showBuilder();
}
function showBuilder() {
_syncBP();
var p=_bp.prog;
var dur=p.duration||4;
var accs=['#ef4444','#10b981','#3b82f6','#a855f7','#ec4899','#f59e0b'];
showModal('<div class="modal-bg"><div class="modal-box" style="max-height:94vh">' +
'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">' +
'<div style="font-size:18px;font-weight:800;color:#fff">'+p.name+'</div>' +
'<div style="display:flex;gap:6px"><button class="btn-sm btn-green" onclick="doSaveBuilder()">Save &#10003;</button>' +
'<button class="btn-sm btn-ghost" onclick="closeModal()">Cancel</button></div></div>' +
'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">' +
'<div><div class="lbl">Program Duration</div>' +
'<select class="sel" id="bp_dur" style="margin-bottom:0">' +
[1,2,3,4,5,6,7,8,9,10,11,12].map(function(n){return '<option value="'+n+'"'+(n===dur?' selected':'')+'>'+(n===1?'1 Week (no repeat)':n+' Weeks')+'</option>';}).join('') +
'</select></div>' +
'<div style="display:flex;align-items:flex-end"><div style="font-size:10px;color:var(--m1);line-height:1.5">1 Week = single run, no repeat. 2&ndash;12 Weeks = program cycles through. Logs saved per week.</div></div>' +
'</div>' +
p.days.map(function(d,di){
var wds=d.weekdays||[];
return '<div style="background:var(--c2);border:1.5px solid '+(d.accent||'var(--bdr)')+';border-radius:12px;padding:12px;margin-bottom:10px">' +
'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">' +
'<div style="font-size:11px;font-weight:700;color:'+(d.accent||'var(--acc)')+'">WORKOUT '+(di+1)+'</div>' +
'<div style="display:flex;gap:6px">' +
'<button onclick="_syncBP();duplicateDay('+di+')" style="color:var(--amber);font-size:11px;font-weight:700;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.2);border-radius:7px;padding:3px 8px;cursor:pointer">Copy</button>' +
'<button onclick="_syncBP();removeDay('+di+')" style="color:var(--red);font-size:18px;background:none;border:none;cursor:pointer">&#215;</button>' +
'</div></div>' +
'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">' +
'<div><div class="lbl">Short Name</div><input class="inp" id="bd_tag_'+di+'" value="'+d.tag+'" placeholder="e.g. Push" style="margin-bottom:0;font-size:13px"></div>' +
'<div><div class="lbl">Full Name</div><input class="inp" id="bd_title_'+di+'" value="'+d.title+'" placeholder="e.g. Upper Push" style="margin-bottom:0;font-size:13px"></div>' +
'</div>' +
'<div style="margin-bottom:8px"><div class="lbl">Description (optional)</div><input class="inp" id="bd_sub_'+di+'" value="'+(d.sub||'')+'" placeholder="e.g. Chest / Shoulders / Triceps" style="margin-bottom:0;font-size:12px"></div>' +
'<div style="margin-bottom:8px"><div class="lbl">Coach Note (shown in workout)</div><input class="inp" id="bd_coach_'+di+'" value="'+(d.coach||'')+'" placeholder="e.g. Focus on slow eccentrics today" style="margin-bottom:0;font-size:12px"></div>' +
'<div style="margin-bottom:8px"><div class="lbl">Training Days</div>' +
'<div style="display:flex;gap:5px;flex-wrap:wrap">' +
['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(function(n,i){
var on=wds.indexOf(i)>=0;
return '<button onclick="toggleBPDay('+di+','+i+')" style="padding:4px 9px;border-radius:8px;border:'+(on?'1.5px solid '+(d.accent||'var(--acc)'):'1px solid var(--bdr)')+';background:'+(on?(d.accent||'var(--acc)')+'22':'transparent')+';color:'+(on?(d.accent||'var(--acc)'):'var(--m1)')+';font-size:10px;font-weight:700;cursor:pointer">'+n+'</button>';
}).join('') +
'</div></div>' +
'<div style="margin-bottom:8px"><div class="lbl">Colour</div>' +
'<div style="display:flex;gap:6px">' +
accs.map(function(c){return '<button onclick="setBPAccent('+di+',\''+c+'\')" style="width:22px;height:22px;border-radius:50%;background:'+c+';border:'+(d.accent===c?'3px solid #fff':'2px solid transparent')+';cursor:pointer"></button>';}).join('') +
'</div></div>' +
_buildExList(d, di) +
'<button onclick="_syncBP();openAddEx('+di+')" style="width:100%;padding:7px;background:rgba(99,102,241,.06);border:1px dashed rgba(99,102,241,.25);border-radius:8px;color:var(--acc);font-size:11px;font-weight:700;margin-top:8px;cursor:pointer">+ Add Exercise</button>' +
'</div>';
}).join('') +
'<button onclick="_syncBP();addDay()" style="width:100%;padding:10px;background:rgba(16,185,129,.06);border:1px dashed rgba(16,185,129,.25);border-radius:10px;color:var(--green);font-size:12px;font-weight:700;margin-bottom:12px;cursor:pointer">+ Add Workout Day</button>' +
'</div></div>');
}
var _accs=['#ef4444','#10b981','#3b82f6','#a855f7','#ec4899','#f59e0b'];
function addDay() {
_syncBP();
var di=_bp.prog.days.length;
_bp.prog.days.push({tag:'Day '+(di+1),title:'New Workout',sub:'',accent:_accs[di%6],ex:[],weekdays:[]});
showBuilder();
}
function removeDay(di){_syncBP();_bpEditEx=null;_bp.prog.days.splice(di,1);showBuilder();}
function duplicateDay(di){
var copy=JSON.parse(JSON.stringify(_bp.prog.days[di]));
copy.weekdays=[];
_bp.prog.days.push(copy);
showBuilder();
}
function removeEx(di,ei){_bpEditEx=null;_bp.prog.days[di].ex.splice(ei,1);showBuilder();}
function saveExEdit(di,ei) {
var sEl=document.getElementById('bpex_sets_'+di+'_'+ei);
var rEl=document.getElementById('bpex_r_'+di+'_'+ei);
if(sEl){var s=parseInt(sEl.value);if(s>0)_bp.prog.days[di].ex[ei].sets=s;}
if(rEl&&rEl.value.trim())_bp.prog.days[di].ex[ei].r=rEl.value.trim();
_bpEditEx=null;showBuilder();
}
function bpDS(di,ei,e){ _syncBP(); _bpDrag={di:di,ei:ei}; e.dataTransfer.effectAllowed='move'; }
function bpDO(di,ei,e){ e.preventDefault(); e.dataTransfer.dropEffect='move'; _bpDragOver={di:di,ei:ei}; }
function bpDrop(di,e){ e.preventDefault();
  if(_bpDrag&&_bpDragOver&&_bpDrag.di===di&&_bpDragOver.di===di&&_bpDrag.ei!==_bpDragOver.ei){
    var ex=_bp.prog.days[di].ex;
    var item=ex.splice(_bpDrag.ei,1)[0];
    var t=_bpDragOver.ei; if(_bpDrag.ei<t)t--;
    ex.splice(t,0,item);
  }
  _bpDrag=null; _bpDragOver=null; showBuilder();
}
function bpDEnd(){ _bpDrag=null; _bpDragOver=null; }
function bpTS(di,ei,e){ e.stopPropagation(); _syncBP(); _bpDrag={di:di,ei:ei}; }
function linkSS(di, ei) {
var exArr = _bp.prog.days[di].ex;
if (ei+1 >= exArr.length) return;
var ssId = 'ss_'+Date.now();
exArr[ei].ss = ssId;
exArr[ei+1].ss = ssId;
showBuilder();
}
function unlinkSS(di, ei) {
var exArr = _bp.prog.days[di].ex;
var ssId = exArr[ei].ss;
if (!ssId) return;
for (var i=0; i<exArr.length; i++) { if (exArr[i].ss===ssId) delete exArr[i].ss; }
showBuilder();
}
function _buildExList(d, di) {
if (!d.ex || !d.ex.length) return '<div style="font-size:11px;color:var(--m2);padding:4px 0">No exercises yet &#8212; add some below</div>';
var out = '';
var i = 0;
while (i < d.ex.length) {
var ex = d.ex[i];
if (ex.ss) {
var ssId = ex.ss;
var grp = '<div style="border:1.5px solid rgba(245,158,11,.4);border-radius:10px;padding:8px 8px 2px;margin-bottom:6px;background:rgba(245,158,11,.04)">';
grp += '<div style="font-size:8px;font-weight:800;letter-spacing:1.5px;color:var(--amber);margin-bottom:6px">&#9889; SUPERSET &#8212; no rest between exercises</div>';
while (i < d.ex.length && d.ex[i].ss === ssId) {
var ssx = d.ex[i]; var sei = i;
var ssEditing = _bpEditEx && _bpEditEx.di === di && _bpEditEx.ei === sei;
if (ssEditing) {
grp += '<div style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,.05)">' +
'<div style="font-size:12px;font-weight:600;color:#fff;margin-bottom:6px">'+ssx.n+'</div>' +
'<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">' +
'<input id="bpex_sets_'+di+'_'+sei+'" type="number" value="'+ssx.sets+'" min="1" max="20" style="width:56px;background:var(--c2);border:1.5px solid var(--acc);border-radius:6px;color:#fff;font-size:13px;padding:4px 8px;text-align:center">' +
'<span style="color:var(--m1);font-size:11px">sets</span>' +
'<input id="bpex_r_'+di+'_'+sei+'" type="text" value="'+ssx.r+'" style="width:72px;background:var(--c2);border:1.5px solid var(--acc);border-radius:6px;color:#fff;font-size:13px;padding:4px 8px;text-align:center">' +
'<span style="color:var(--m1);font-size:11px">reps</span>' +
'<button onclick="saveExEdit('+di+','+sei+')" style="padding:4px 12px;background:var(--acc);color:#fff;border:none;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer">Save</button>' +
'<button onclick="_bpEditEx=null;showBuilder()" style="padding:4px 8px;background:none;border:1px solid var(--bdr);border-radius:6px;color:var(--m1);font-size:11px;cursor:pointer">Cancel</button>' +
'</div></div>';
} else {
grp += '<div style="display:flex;gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.05)">' +
'<div style="flex:1"><div style="font-size:12px;font-weight:600;color:#fff">'+ssx.n+'</div>' +
'<div style="font-size:10px;color:var(--m1)">'+ssx.sets+' sets &#8212; '+ssx.r+'</div></div>' +
'<button onclick="_syncBP();_bpEditEx={di:'+di+',ei:'+sei+'};showBuilder()" style="font-size:13px;color:var(--m1);background:none;border:none;cursor:pointer;padding:2px 4px" title="Edit sets/reps">&#9998;</button>' +
'<button onclick="_syncBP();unlinkSS('+di+','+sei+')" style="font-size:9px;color:var(--amber);background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.25);border-radius:6px;padding:2px 7px;cursor:pointer">unlink</button>' +
'<button onclick="_syncBP();removeEx('+di+','+sei+')" style="color:var(--red);background:none;border:none;cursor:pointer;font-size:16px">&#215;</button>' +
'</div>';
}
i++;
}
grp += '</div>';
out += grp;
} else {
var isEditing = _bpEditEx && _bpEditEx.di === di && _bpEditEx.ei === i;
if (isEditing) {
out += '<div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05)">' +
'<div style="font-size:12px;font-weight:600;color:#fff;margin-bottom:6px">'+ex.n+'</div>' +
'<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">' +
'<input id="bpex_sets_'+di+'_'+i+'" type="number" value="'+ex.sets+'" min="1" max="20" style="width:56px;background:var(--c2);border:1.5px solid var(--acc);border-radius:6px;color:#fff;font-size:13px;padding:4px 8px;text-align:center">' +
'<span style="color:var(--m1);font-size:11px">sets</span>' +
'<input id="bpex_r_'+di+'_'+i+'" type="text" value="'+ex.r+'" style="width:72px;background:var(--c2);border:1.5px solid var(--acc);border-radius:6px;color:#fff;font-size:13px;padding:4px 8px;text-align:center">' +
'<span style="color:var(--m1);font-size:11px">reps</span>' +
'<button onclick="saveExEdit('+di+','+i+')" style="padding:4px 12px;background:var(--acc);color:#fff;border:none;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer">Save</button>' +
'<button onclick="_bpEditEx=null;showBuilder()" style="padding:4px 8px;background:none;border:1px solid var(--bdr);border-radius:6px;color:var(--m1);font-size:11px;cursor:pointer">Cancel</button>' +
'</div></div>';
} else {
out += '<div draggable="true" data-bpdi="'+di+'" data-bpei="'+i+'" ' +
'ondragstart="bpDS('+di+','+i+',event)" ondragover="bpDO('+di+','+i+',event)" ' +
'ondrop="bpDrop('+di+',event)" ondragend="bpDEnd()" ' +
'style="display:flex;gap:6px;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.05)">' +
'<span ontouchstart="bpTS('+di+','+i+',event)" style="cursor:grab;touch-action:none;color:var(--m2);font-size:15px;padding:0 3px;user-select:none;flex-shrink:0">&#8942;&#8942;</span>' +
'<div style="flex:1"><div style="font-size:12px;font-weight:600;color:#fff">'+ex.n+'</div>' +
'<div style="font-size:10px;color:var(--m1)">'+ex.sets+' sets &#8212; '+ex.r+'</div></div>';
if (i+1 < d.ex.length && !d.ex[i+1].ss) {
out += '<button onclick="_syncBP();linkSS('+di+','+i+')" title="Pair these two as a superset" style="font-size:9px;color:var(--m2);background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:6px;padding:2px 7px;cursor:pointer;white-space:nowrap">&#8646; SS</button>';
}
out += '<button onclick="_syncBP();_bpEditEx={di:'+di+',ei:'+i+'};showBuilder()" style="font-size:13px;color:var(--m1);background:none;border:none;cursor:pointer;padding:2px 4px" title="Edit sets/reps">&#9998;</button>' +
'<button onclick="_syncBP();removeEx('+di+','+i+')" style="color:var(--red);background:none;border:none;cursor:pointer;font-size:16px">&#215;</button>' +
'</div>';
}
i++;
}
}
return out;
}
function filterEx(val) {
var q=(val||'').toLowerCase().trim();
var box=document.getElementById('ae_suggestions');
if(!box)return;
if(!q){box.innerHTML='';box.style.display='none';return;}
var matches=EX_LIB.filter(function(e){return e.n.toLowerCase().indexOf(q)>=0||e.m.toLowerCase().indexOf(q)>=0;}).slice(0,8);
if(!matches.length){box.innerHTML='';box.style.display='none';return;}
box.innerHTML=matches.map(function(e){
var safe=e.n.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
return '<button onclick="pickEx(\''+safe+'\')" style="display:block;width:100%;text-align:left;padding:9px 12px;background:var(--c2);border:none;border-bottom:1px solid var(--bdr);color:var(--tx);font-size:13px;font-weight:600;cursor:pointer">'+e.n+'<span style="font-size:10px;color:var(--m1);margin-left:6px">'+e.m+'</span></button>';
}).join('');
box.style.display='block';
}
function pickEx(name) {
var ex=null;
for(var i=0;i<EX_LIB.length;i++){if(EX_LIB[i].n===name){ex=EX_LIB[i];break;}}
if(!ex)return;
var box=document.getElementById('ae_suggestions');if(box){box.innerHTML='';box.style.display='none';}
var nEl=document.getElementById('ae_n');if(nEl)nEl.value=ex.n;
var sEl=document.getElementById('ae_s');if(sEl)sEl.value=ex.sets;
var rEl=document.getElementById('ae_r');if(rEl)rEl.value=ex.r;
}
function openAddEx(di) {
_bpDay=di;
_stageEx=[];
S._exCat='All';
showAddExModal();
}
function showAddExModal() {
var di=_bpDay;
var cats=['All','Chest','Back','Legs','Shoulders','Arms','Core','Finisher'];
var activeCat=S._exCat||'All';
var catMap={Chest:['chest','pec'],Back:['back','lat','trap','row'],Legs:['quad','glute','hamstring','calf','leg','thigh','squat','lunge','hip'],Shoulders:['delt','shoulder','rotator'],Arms:['bicep','tricep','forearm','brach','curl','press','close grip'],Core:['core','abs','oblique','back extension'],Finisher:['finisher']};
var filtered=activeCat==='All'?EX_LIB:EX_LIB.filter(function(e){
if(activeCat==='Finisher')return e.t==='Finisher';
var kws=catMap[activeCat]||[];
var mLow=e.m.toLowerCase();
return kws.some(function(k){return mLow.indexOf(k)>=0;});
});
var stageHtml='';
if(_stageEx.length>0){
stageHtml='<div style="background:rgba(99,102,241,.08);border:1px solid rgba(99,102,241,.2);border-radius:10px;padding:10px;margin-bottom:12px">' +
'<div style="font-size:9px;font-weight:800;letter-spacing:1.5px;color:var(--acc);margin-bottom:8px">&#128203; QUEUED — '+_stageEx.length+' exercise'+(_stageEx.length>1?'s':'')+' to add</div>' +
_stageEx.map(function(e,qi){
return '<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,.05)">' +
'<div style="flex:1;font-size:11px;color:#fff;font-weight:600">'+e.n+'</div>' +
'<input type="number" value="'+e.sets+'" min="1" max="10" style="width:34px;padding:3px;background:var(--c2);border:1px solid var(--bdr);border-radius:6px;color:#fff;font-size:11px;text-align:center" onchange="_stageEx['+qi+'].sets=parseInt(this.value)||3">' +
'<span style="font-size:9px;color:var(--m2)">sets</span>' +
'<input value="'+e.r+'" style="width:48px;padding:3px;background:var(--c2);border:1px solid var(--bdr);border-radius:6px;color:#fff;font-size:11px;text-align:center" onchange="_stageEx['+qi+'].r=this.value">' +
'<span style="font-size:9px;color:var(--m2)">reps</span>' +
'<button onclick="_stageEx.splice('+qi+',1);showAddExModal()" style="color:var(--red);background:none;border:none;cursor:pointer;font-size:15px;line-height:1">&#215;</button>' +
'</div>';
}).join('') +
'<button class="btn btn-acc" onclick="doAddMultiEx()" style="width:100%;padding:10px;font-size:13px;font-weight:800;margin-top:4px">Add '+_stageEx.length+' Exercise'+(_stageEx.length>1?'s':'')+' to Workout &#10003;</button>' +
'</div>';
}
var catHtml='<div style="display:flex;gap:4px;overflow-x:auto;padding:2px 0 10px;scrollbar-width:none;-webkit-overflow-scrolling:touch;flex-shrink:0">' +
cats.map(function(cat){var on=cat===activeCat;return '<button onclick="S._exCat=\''+cat+'\';showAddExModal()" style="padding:5px 12px;border-radius:20px;border:1px solid '+(on?'var(--acc)':'rgba(255,255,255,.1)')+';background:'+(on?'var(--acc)':'transparent')+';color:'+(on?'#fff':'var(--m1)')+';font-size:10px;font-weight:700;white-space:nowrap;cursor:pointer">'+cat+'</button>';}).join('') +
'</div>';
var gridHtml='<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;max-height:240px;overflow-y:auto;-webkit-overflow-scrolling:touch;margin-bottom:10px">' +
filtered.map(function(e){
var safe=e.n.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
var staged=_stageEx.some(function(s){return s.n===e.n;});
return '<button onclick="stageEx(\''+safe+'\')" style="padding:9px 8px;border-radius:10px;border:1px solid '+(staged?'var(--acc)':'var(--bdr)')+';background:'+(staged?'rgba(99,102,241,.14)':'var(--c2)')+';text-align:left;cursor:pointer;transition:all .15s">' +
'<div style="font-size:11px;font-weight:700;color:'+(staged?'#818cf8':'#fff')+';margin-bottom:2px">'+(staged?'&#10003; ':'')+e.n+'</div>' +
'<div style="font-size:9px;color:var(--m2)">'+e.m+'</div>' +
'</button>';
}).join('') +
'</div>';
var customHtml='<div style="border-top:1px solid var(--bdr);padding-top:10px">' +
'<div style="font-size:9px;font-weight:700;letter-spacing:1.5px;color:var(--m2);margin-bottom:8px">CUSTOM EXERCISE</div>' +
'<div style="display:grid;grid-template-columns:1fr auto auto;gap:6px;align-items:end;margin-bottom:6px">' +
'<div><div class="lbl" style="font-size:9px">Name</div><input class="inp" id="ae_n" placeholder="Exercise name" style="margin-bottom:0;font-size:12px" autocomplete="off" oninput="filterEx(this.value)"><div id="ae_suggestions" style="display:none;border:1px solid var(--bdr);border-radius:0 0 8px 8px;overflow:hidden;margin-top:-2px;max-height:160px;overflow-y:auto"></div></div>' +
'<div><div class="lbl" style="font-size:9px">Sets</div><input class="inp" id="ae_s" type="number" value="3" style="margin-bottom:0;width:50px;font-size:12px" inputmode="numeric"></div>' +
'<div><div class="lbl" style="font-size:9px">Reps</div><input class="inp" id="ae_r" placeholder="8-12" style="margin-bottom:0;width:60px;font-size:12px"></div>' +
'</div>' +
'<button class="btn btn-ghost" onclick="doAddCustomEx()" style="width:100%;padding:9px;font-size:12px">+ Add Custom Exercise</button>' +
'</div>';
showModal('<div class="modal-bg" onclick="closeModal()"><div class="modal-box" onclick="event.stopPropagation()" style="max-height:94vh;overflow-y:auto">' +
'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">' +
'<div style="font-size:16px;font-weight:800;color:#fff">Add Exercises</div>' +
'<button onclick="showBuilder()" style="font-size:12px;color:var(--m1);background:none;border:none;cursor:pointer">&#8592; Back</button>' +
'</div>' +
stageHtml +
catHtml +
gridHtml +
customHtml +
'</div></div>');
}
var _stageEx=[];
function stageEx(name) {
var ex=null;
for(var i=0;i<EX_LIB.length;i++){if(EX_LIB[i].n===name){ex=EX_LIB[i];break;}}
if(!ex)return;
for(var j=0;j<_stageEx.length;j++){if(_stageEx[j].n===name){_stageEx.splice(j,1);showAddExModal();return;}}
_stageEx.push({n:ex.n,sets:ex.sets,r:ex.r,t:ex.t,m:ex.m,rest:ex.rest,note:ex.note||'',alt:ex.alt||[]});
showAddExModal();
}
function doAddMultiEx() {
if(!_stageEx.length){toast('Select at least one exercise','err');return;}
for(var i=0;i<_stageEx.length;i++){_bp.prog.days[_bpDay].ex.push(_stageEx[i]);}
_stageEx=[];
showBuilder();
}
function doAddCustomEx() {
var n=((document.getElementById('ae_n')||{}).value||'').trim();
var sets=parseInt((document.getElementById('ae_s')||{}).value)||3;
var r=((document.getElementById('ae_r')||{}).value||'8-12').trim();
if(!n){toast('Enter exercise name','err');return;}
_bp.prog.days[_bpDay].ex.push({n:n,sets:sets,r:r,t:'Compound',m:'',rest:'90s',note:'',alt:[]});
showBuilder();
}
function _syncSessProg(cid, prog) {
var sessObj=DB.get('sessions_'+cid)||{};
var changed=false;
var keys=Object.keys(sessObj);
for(var i=0;i<keys.length;i++){
var s=sessObj[keys[i]];
if(s.status!=='upcoming'||!s.date)continue;
var wd=new Date(s.date+'T12:00:00').getDay();
var matched=false;
for(var di=0;di<prog.days.length;di++){
var wds=prog.days[di].weekdays||[];
if(wds.indexOf(wd)>=0){
s.workoutDayIdx=di;
s.workoutName=prog.days[di].title||prog.days[di].tag||'Workout';
changed=true;matched=true;break;
}
}
if(!matched&&s.workoutDayIdx!==undefined){delete s.workoutDayIdx;delete s.workoutName;changed=true;}
}
if(changed)DB.set('sessions_'+cid,sessObj);
}
function doSaveBuilder() {
_syncBP();
var prog=_bp.prog, cid=_bp.cid;
if(!prog.days.length){toast('Add at least one training day','err');return;}
var progs=getProgs(cid);
if(_bp.editId){
var idx=-1;
for(var i=0;i<progs.length;i++){if(progs[i].id===_bp.editId){idx=i;break;}}
if(idx>=0)progs[idx]=prog;else progs.push(prog);
_bp.editId=null;
DB.set('progs_'+cid,progs);
_syncSessProg(cid,prog);
closeModal(); toast(prog.name+' updated!','ok'); R();
}else{
progs.push(prog);
DB.set('progs_'+cid,progs);
var cp=DB.get('cp_'+cid)||{}; cp.currentProgId=prog.id;
DB.set('cp_'+cid,cp);
var templates=DB.get('prog_templates')||[];
templates.push(JSON.parse(JSON.stringify(prog)));
DB.set('prog_templates',templates);
_syncSessProg(cid,prog);
trackUsage('programsCreated');
closeModal(); toast(prog.name+' saved as template!','ok'); R();
}
}
