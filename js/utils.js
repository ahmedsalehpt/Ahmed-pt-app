function parseRest(s) {
if (!s) return 90;
var str = String(s).trim().toLowerCase();
if (str.indexOf('min') !== -1) return (parseInt(str) || 1) * 60;
if (/^\d+m$/.test(str)) return parseInt(str) * 60;
return parseInt(str) || 90;
}
function startRest(restStr) {
stopRest();
var secs = parseRest(restStr);
if (!secs) return;
S.restTimer.secs = secs;
var el = document.getElementById('rest-banner');
if (el) el.style.display = 'block';
tickRest();
S.restTimer.iv = setInterval(tickRest, 1000);
}
function stopRest() {
if (S.restTimer.iv) { clearInterval(S.restTimer.iv); S.restTimer.iv = null; }
S.restTimer.secs = 0;
var el = document.getElementById('rest-banner');
if (el) el.style.display = 'none';
}
function tickRest() {
var el = document.getElementById('rest-banner');
if (!el) { stopRest(); return; }
if (S.restTimer.secs <= 0) {
el.className = 'rb-red rb-pulse';
el.innerHTML = '&#9200; REST DONE &#8212; Tap to dismiss';
if (S.restTimer.iv) { clearInterval(S.restTimer.iv); S.restTimer.iv = null; }
return;
}
var m = Math.floor(S.restTimer.secs / 60);
var sec = S.restTimer.secs % 60;
var ts = m > 0 ? m + ':' + (sec < 10 ? '0' : '') + sec : sec + 's';
el.className = S.restTimer.secs > 30 ? 'rb-green' : 'rb-amber';
el.innerHTML = '&#9201; REST: ' + ts + ' &#8212; Tap to skip';
S.restTimer.secs--;
}
function dismissRest() { stopRest(); }

var _toastT = null;
function toast(msg, type) {
var el = document.getElementById('toast');
if (!el) return;
el.textContent = msg;
el.className = 'toast-bar t-' + (type || 'ok');
el.style.display = 'block';
clearTimeout(_toastT);
_toastT = setTimeout(function() { el.style.display = 'none'; }, 3000);
}

function showModal(html) {
var m = document.getElementById('modal');
if (m) m.innerHTML = html;
}
function closeModal() {
var m = document.getElementById('modal');
if (m) m.innerHTML = '';
}

function today() { return new Date().toISOString().split('T')[0]; }
function fmtD(d) {
if (!d) return '';
try { return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', {weekday:'short', day:'numeric', month:'short'}); }
catch(e) { return d; }
}
function fmtT(ts) {
if (!ts) return '';
return new Date(ts).toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'});
}
function fmtMon(d) {
if (!d) return '';
try { return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', {month:'long', year:'numeric'}); }
catch(e) { return d; }
}
function rpeC(r) {
if (!r) return '#4a5568';
if (r <= 5) return '#10b981';
if (r <= 7) return '#d97706';
if (r === 8) return '#ea580c';
return '#dc2626';
}
function rpeN(r) {
if (!r) return '';
var names = ['','Easy','Easy','Easy','Easy','Easy','Moderate','Hard','V.Hard','Near Max','MAX'];
return names[r] || '';
}

function getCurr(cid) {
var id = cid || S.vCli || S.cid;
var tdata = DB.get('trainer') || {};
var trainerCurr = tdata.currency || 'GBP';
if (!id) return trainerCurr;
var c = S.clients[id] || {};
return c.currency || trainerCurr;
}
function currSym(cid) {
return currencySymbol(getCurr(cid));
}

function getProg(cid) {
var id = cid || S.cid;
var cp = id ? DB.get('cp_' + id) : null;
var pid = cp ? cp.currentProgId : null;
var progs = getProgs(id);
if (pid) {
for (var i = 0; i < progs.length; i++) { if (progs[i].id === pid) return progs[i]; }
}
return progs[0] || null;
}
function getProgs(cid) {
var id = cid || S.cid;
return DB.get('progs_' + id) || [];
}
function getDays(cid) { var p = getProg(cid); return p ? p.days || [] : []; }
function getDay() { return getDays()[S.day] || null; }
function getEx(ei) {
var d = getDay(); if (!d) return null;
var ex = d.ex[ei]; if (!ex) return null;
var sw = S.swaps[S.day + '_' + ei];
if (sw !== undefined && ex.alt && ex.alt[sw]) {
return {n:ex.alt[sw], t:ex.t, m:ex.m, sets:ex.sets, r:ex.r, rest:ex.rest, note:ex.note, alt:ex.alt, swapped:true, orig:ex.n};
}
return ex;
}
function lk(w,d,e,s) { return 'w'+w+'_d'+d+'_e'+e+'_s'+s; }
function ek(w,d,e) { return 'w'+w+'_d'+d+'_e'+e; }
function sk(w,d) { return 'w'+w+'_d'+d; }
function getL(w,d,e,s) { return S.logs[lk(w,d,e,s)] || null; }
function sessP() {
var d = getDay(); if (!d || !d.ex) return {done:0, total:0};
var done = 0, total = 0;
d.ex.forEach(function(ex, ei) {
var sc = ex.sets || 3; total += sc;
for (var i = 0; i < sc; i++) { var l = getL(S.week,S.day,ei,i); if (l && l.done) done++; }
});
return {done:done, total:total};
}
function updStreak() {
var t = today(), s = S.streak;
if (s.lastDate === t) return;
var y = new Date(); y.setDate(y.getDate() - 1);
var ys = y.toISOString().split('T')[0];
var cur = s.lastDate === ys ? (s.cur || 0) + 1 : 1;
S.streak = {cur:cur, best:Math.max(cur, s.best||0), lastDate:t};
}
function chkPR(ei, weight, reps) {
var ex = getEx(ei); if (!ex || !weight) return;
var k = ex.n.replace(/[^a-zA-Z0-9]/g, '_');
var wt = parseFloat(weight)||0, rp = parseInt(reps)||0;
if (wt <= 0) return;
var est = wt * (1 + rp / 30);
var x = S.prs[k];
if (!x || est > (x.est||0)) {
S.prs[k] = {weight:wt, reps:rp, est:est, date:today(), exName:ex.n};
// Collect for session completion display only
if (!S.sessionPRs) S.sessionPRs = [];
var already = S.sessionPRs.some(function(p){ return p.exName === ex.n; });
if (!already) S.sessionPRs.push({exName:ex.n, weight:wt, reps:rp, est:Math.round(est)});
DB.set('prs_'+S.cid, S.prs);
if (DB._fb) DB._fb.ref('clients/'+S.cid+'/prs/'+k).set(S.prs[k]);
// No mid-workout popup - show at session completion
}
}

function renderPROverlay() {
var pr = S.newPR; if (!pr) return;
var existing = document.getElementById('pr_overlay');
if (existing) existing.parentNode.removeChild(existing);
var el = document.createElement('div');
el.id = 'pr_overlay';
el.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:500;display:flex;align-items:center;justify-content:center;flex-direction:column;padding:24px;text-align:center';
el.innerHTML =
'<div style="font-size:72px;margin-bottom:8px">&#127942;</div>' +
'<div style="font-size:10px;letter-spacing:4px;font-weight:800;color:var(--amber);margin-bottom:10px">NEW PERSONAL RECORD</div>' +
'<div style="font-size:26px;font-weight:900;color:#fff;margin-bottom:6px">'+pr.exName+'</div>' +
'<div style="font-size:48px;font-weight:900;color:var(--amber);line-height:1;margin-bottom:6px">'+pr.weight+S.unit+' &#215; '+pr.reps+'</div>' +
'<div style="font-size:13px;color:var(--m1);margin-bottom:6px">Estimated 1RM: '+pr.est+S.unit+'</div>' +
'<div style="font-size:12px;color:var(--m2);margin-bottom:24px;max-width:280px;line-height:1.7">You just proved what you\'re capable of.<br>Screenshot this. Remember this moment. &#128293;</div>' +
'<div style="font-size:9px;color:var(--m2);letter-spacing:3px;margin-bottom:16px">AHMED PERSONAL TRAINING &#183; @Madridsta_</div>' +
'<button id="pr_share_btn" style="padding:14px 28px;background:var(--amber);color:#000;border:none;border-radius:12px;font-size:15px;font-weight:800;cursor:pointer;margin-bottom:10px">&#128248; Share This PR</button>' +
'<button id="pr_cont_btn" style="padding:10px 20px;background:transparent;border:1px solid var(--bdr);color:var(--m1);border-radius:10px;font-size:13px;cursor:pointer">Continue Training</button>';
document.body.appendChild(el);
document.getElementById('pr_share_btn').onclick = function(){ dismissPR(true); };
document.getElementById('pr_cont_btn').onclick = function(){ dismissPR(false); };
}
function dismissPR(share) {
var pr = S.newPR;
if (share && pr) {
if (navigator.share) {
navigator.share({title:'New PR - Ahmed PT', text:'Just hit a new PR on '+pr.exName+': '+pr.weight+S.unit+' x '+pr.reps+' reps. Estimated 1RM: '+pr.est+S.unit+'. Training with Ahmed PT - @Madridsta_ on Instagram.'}).catch(function(){});
} else { toast('Screenshot and share!','info'); }
}
S.newPR = null;
var el = document.getElementById('pr_overlay');
if (el) el.parentNode.removeChild(el);
R();
}
function get14() {
var days = [];
for (var i = 13; i >= 0; i--) {
var dt = new Date(); dt.setDate(dt.getDate() - i);
days.push(dt.toISOString().split('T')[0]);
}
return days;
}
var WD_NAMES=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
function getTodayWorkoutIdx() {
var wd=new Date().getDay();
var days=getDays();
for(var i=0;i<days.length;i++){
var d=days[i];
if(d.weekdays&&d.weekdays.indexOf(wd)>=0)return i;
}
return -1;
}
function getDailyMotivation(d, streak, weekNum) {
if(!d)return'';
var tag=(d.tag||'').toLowerCase();
var phase=((weekNum-1)%4)+1;
var pool=[];
if(streak>=30)pool.push('30 days straight. You are literally built different. This is what elite looks like.');
else if(streak>=14)pool.push('Two weeks solid. Most people quit by now. You didn\'t. That\'s everything.');
else if(streak>=7)pool.push('A full week without missing. Consistency is your superpower right now. Protect it.');
else if(streak>=3)pool.push('Three in a row. The momentum is real. Don\'t let it slip today.');
else if(streak===1)pool.push('You showed up yesterday. Let\'s make it two. One session at a time.');
else pool.push('Every session is a vote for the person you\'re becoming. Cast it today.');
if(tag.indexOf('push')>=0||tag.indexOf('chest')>=0){
pool.push('Push day. Every controlled rep is sculpting the physique you\'re working towards.');
pool.push('Chest and shoulders today. Full range, slow eccentric. Make it count.');
}else if(tag.indexOf('pull')>=0||tag.indexOf('back')>=0){
pool.push('Pull day. The back you build today is the foundation for everything else.');
pool.push('Lats, rear delts, biceps. Train the back like it deserves to be trained.');
}else if(tag.indexOf('leg')>=0||tag.indexOf('lower')>=0||tag.indexOf('squat')>=0){
pool.push('Leg day. The ones who skip this stay average. You\'re not average.');
pool.push('Lower body session. Full depth. Drive through heels. Champions are made here.');
}else if(tag.indexOf('glute')>=0||tag.indexOf('hip')>=0){
pool.push('Glute day. Mind-muscle connection is everything. Feel every single rep.');
}else if(tag.indexOf('full')>=0){
pool.push('Full body today. Hit every muscle, leave nothing in the tank.');
}else{
pool.push('Today\'s session is a deposit into your future self. Make it a big one.');
}
if(phase===1)pool.push('Foundation week. Perfect form over everything today. The weight follows the technique.');
else if(phase===2)pool.push('Volume week. Your body is adapting fast. Push a little more than last week.');
else if(phase===3)pool.push('Intensity week. This is where real growth happens. Embrace the challenge.');
else if(phase===4)pool.push('Overload week. Final push of the block. Give everything you have today.');
return pool[Math.floor(Date.now()/86400000)%pool.length];
}
function _syncBP() {
if(!_bp.prog)return;
_bp.prog.days.forEach(function(d,di){
var tagEl=document.getElementById('bd_tag_'+di);
var titleEl=document.getElementById('bd_title_'+di);
var subEl=document.getElementById('bd_sub_'+di);
var coachEl=document.getElementById('bd_coach_'+di);
if(tagEl&&tagEl.value.trim())d.tag=tagEl.value.trim();
if(titleEl&&titleEl.value.trim())d.title=titleEl.value.trim();
if(subEl)d.sub=subEl.value;
if(coachEl)d.coach=coachEl.value;
});
var durEl=document.getElementById('bp_dur');
if(durEl)_bp.prog.duration=parseInt(durEl.value)||4;
}
function toggleBPDay(di,wd){
_syncBP();
var d=_bp.prog.days[di]; if(!d)return;
d.weekdays=d.weekdays||[];
var idx=d.weekdays.indexOf(wd);
if(idx>=0)d.weekdays.splice(idx,1);
else{d.weekdays.push(wd);d.weekdays.sort();}
showBuilder();
}
function setBPAccent(di,color){
_syncBP();
_bp.prog.days[di].accent=color;
showBuilder();
}
function getDayScheduled(d) { return d.scheduledDays || d.weekdays || []; }
function getDurationWeeks(prog) { return prog ? (prog.durationWeeks || prog.duration || 4) : 4; }
function getNextScheduledDay(prog) {
if (!prog) return null;
var days = prog.days || [];
var wd = new Date().getDay();
var best = null, bestDiff = 99;
for (var i = 0; i < days.length; i++) {
var sched = getDayScheduled(days[i]);
for (var j = 0; j < sched.length; j++) {
var diff = (sched[j] - wd + 7) % 7;
if (diff > 0 && diff < bestDiff) { bestDiff = diff; best = {day: days[i], dayIdx: i, diff: diff, wd: sched[j]}; }
}
}
return best;
}
function getCurrentWeek(cid) {
var prog = getProg(cid); if (!prog) return S.week;
if (!prog.startDate) return S.week;
var daysSince = Math.floor((Date.now() - prog.startDate) / 86400000);
return Math.min(Math.max(1, Math.floor(daysSince / 7) + 1), getDurationWeeks(prog));
}
function hasDayLog(weekNum, dayIdx) {
var prefix = 'w' + weekNum + '_d' + dayIdx + '_';
return Object.keys(S.logs).some(function(k) { return k.indexOf(prefix) === 0 && S.logs[k] && S.logs[k].done; });
}
function generateWorkoutMessage(clientName, dayName, exercises, streak, weekNum, totalWeeks) {
var cacheKey = 'msg_' + S.cid + '_' + today();
var cached = DB.get(cacheKey);
if (cached) { showMotivCard(cached); return; }
var apiKey = DB.get('anthropic_key') || '';
var exList = (exercises || []).slice(0, 4).map(function(e) { return e.n; }).join(', ');
var streakLine = streak > 2 ? 'They are on a ' + streak + ' day training streak &#8212; acknowledge it.' : '';
var prompt = 'You are a motivational personal trainer. Write a short punchy message (2-3 sentences max) for a client named ' + clientName + ' who is about to start their ' + dayName + ' workout. They are on week ' + weekNum + ' of ' + totalWeeks + '. ' + streakLine + ' Main exercises: ' + exList + '. Be energetic, specific, make them feel unstoppable. No generic gym quotes. Under 40 words.';
if (!apiKey) { showMotivCard(getFallbackMsg(clientName, dayName, streak, weekNum)); return; }
fetch('https://api.anthropic.com/v1/messages', {
method: 'POST',
headers: {'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true'},
body: JSON.stringify({model: 'claude-haiku-4-5-20251001', max_tokens: 100, messages: [{role: 'user', content: prompt}]})
}).then(function(r) { return r.json(); }).then(function(data) {
var msg = data.content && data.content[0] ? data.content[0].text : null;
if (msg) { DB.set(cacheKey, msg); showMotivCard(msg); }
else { showMotivCard(getFallbackMsg(clientName, dayName, streak, weekNum)); }
}).catch(function() { showMotivCard(getFallbackMsg(clientName, dayName, streak, weekNum)); });
}
function getFallbackMsg(name, dayName, streak, weekNum) {
var msgs = [
name + ' &#8212; Week ' + weekNum + ', ' + dayName + '. You already showed up. That\'s 90% of it.',
'Week ' + weekNum + '. ' + dayName + '. Every rep today is an investment in the person you\'re becoming.',
name + ', your future self is watching. Make them proud today. Let\'s go.'
];
if (streak > 2) msgs.unshift(name + ', ' + streak + ' days straight. Most people don\'t get here. Keep building.');
return msgs[Math.floor(Date.now() / 86400000) % msgs.length];
}
function showMotivCard(msg) {
var el = document.getElementById('motiv_card');
if (el) el.innerHTML = buildMotivInner(msg);
}
function buildMotivInner(msg) {
return '<div style="font-size:9px;font-weight:700;letter-spacing:2px;color:var(--acc);margin-bottom:8px">AHMED SAYS</div>' +
'<div style="font-size:15px;font-weight:600;color:#fff;line-height:1.5">' + msg + '</div>' +
'<button onclick="shareMessage(\''+msg.replace(/'/g,'&#39;')+'\')" style="margin-top:10px;padding:5px 12px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);border-radius:20px;color:var(--m1);font-size:10px;font-weight:700;cursor:pointer">&#8679; Share</button>';
}
function shareMessage(msg) {
if (navigator.share) {
navigator.share({title: 'Ahmed PT', text: msg + '\n\n&#8212; Ahmed PT &#183; @Madridsta_ on Instagram'}).catch(function(){});
} else { toast('Screenshot and share!', 'info'); }
}
function renderWeekStrip(prog) {
if (!prog || !prog.days || !prog.days.length) return '';
var wd = new Date().getDay();
var dayLabels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
var cells = '';
for (var i = 0; i < 7; i++) {
var isToday = i === wd;
var dayDays = [];
for (var j = 0; j < prog.days.length; j++) {
if (getDayScheduled(prog.days[j]).indexOf(i) >= 0) dayDays.push({idx: j, day: prog.days[j]});
}
var isRest = dayDays.length === 0;
var isDone = false;
var accentColor = 'var(--m2)';
var label = '';
if (!isRest) {
var dd = dayDays[0];
var dName = dd.day.name || dd.day.tag || ('Day '+(dd.idx+1));
label = dName.length > 5 ? dName.slice(0,5) : dName;
accentColor = dd.day.accent || 'var(--acc)';
isDone = hasDayLog(S.week, dd.idx);
}
cells += '<div style="flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 2px;border-radius:8px;background:'+(isToday?'rgba(99,102,241,.1)':'transparent')+';border:'+(isToday?'1px solid rgba(99,102,241,.3)':'1px solid transparent')+'">' +
'<div style="font-size:8px;font-weight:700;color:'+(isToday?'var(--acc)':'var(--m2)')+'">'+dayLabels[i].toUpperCase()+'</div>' +
'<div style="font-size:14px">'+(isToday?'&#128314;':isDone?'&#9989;':isRest?'&#183;':'&#8226;')+'</div>' +
'<div style="font-size:8px;font-weight:600;color:'+(isRest?'var(--m2)':accentColor)+';text-align:center;white-space:nowrap;overflow:hidden;max-width:36px">'+( isRest?'Rest':label)+'</div>' +
'</div>';
}
return '<div style="background:var(--c1);border:1px solid var(--bdr);border-radius:12px;padding:10px;margin-bottom:14px">' +
'<div style="font-size:9px;font-weight:700;letter-spacing:1.5px;color:var(--m2);margin-bottom:8px">THIS WEEK</div>' +
'<div style="display:flex;gap:2px">' + cells + '</div>' +
'</div>';
}
function renderRestDay(prog) {
var next = getNextScheduledDay(prog);
var cp = DB.get('cp_' + S.cid) || {};
var name = cp.name || 'there';
var tips = [
'Rest days are where the gains are made. Your muscles grow during recovery, not during the workout.',
'Active recovery tip: a 20-minute walk today will improve tomorrow\'s performance significantly.',
'Hydration and sleep are doing the work right now. Fuel your body, rest your body.',
'Your CNS is recovering today. Tomorrow you\'ll be stronger than you were yesterday.',
'Use today to foam roll, stretch, and mentally prep. The next session is going to be great.'
];
var tip = tips[Math.floor(Date.now() / 86400000) % tips.length];
return '<div style="text-align:center;padding:28px 20px 20px">' +
'<div style="font-size:52px;margin-bottom:12px">&#128564;</div>' +
'<div style="font-size:22px;font-weight:900;color:#fff;margin-bottom:4px">Rest Day</div>' +
'<div style="font-size:13px;color:var(--m1);margin-bottom:20px">' + name + ', recovery is part of the program.</div>' +
(S.streak.cur > 0 ? '<span class="pill p-amber" style="font-size:13px;padding:6px 16px;margin-bottom:20px;display:inline-block">&#128293; ' + S.streak.cur + ' Day Streak &#8212; Keep it going!</span>' : '') +
'</div>' +
(next ? '<div style="background:rgba(99,102,241,.06);border:1px solid rgba(99,102,241,.15);border-radius:12px;padding:14px;margin-bottom:14px;text-align:center">' +
'<div style="font-size:9px;font-weight:700;letter-spacing:1.5px;color:var(--acc);margin-bottom:6px">NEXT WORKOUT</div>' +
'<div style="font-size:18px;font-weight:800;color:#fff;margin-bottom:4px">' + (next.day.name || next.day.title || next.day.tag) + '</div>' +
'<div style="font-size:12px;color:var(--m1)">'+WD_NAMES[next.wd]+' &#8212; in ' + next.diff + ' day' + (next.diff === 1 ? '' : 's') + '</div>' +
'</div>' : '') +
'<div style="background:rgba(245,158,11,.05);border-left:3px solid var(--amber);border-radius:0 10px 10px 0;padding:12px 14px;margin-bottom:14px">' +
'<div style="font-size:9px;font-weight:700;letter-spacing:1.5px;color:var(--amber);margin-bottom:5px">RECOVERY TIP</div>' +
'<div style="font-size:12px;color:var(--m1);line-height:1.6">' + tip + '</div>' +
'</div>';
}
function hadSess(d) {
return Object.keys(S.logs).some(function(k) {
var l = S.logs[k];
return l && l.done && l.ts && new Date(l.ts).toISOString().split('T')[0] === d;
});
}

function saveLog(ei, si, weight, reps, rpe) {
var ex = getEx(ei); if (!ex) return;
var data = {weight:weight, reps:reps, rpe:rpe, done:true, ts:Date.now(), exName:ex.n};
var key = lk(S.week, S.day, ei, si);
S.logs[key] = data;
chkPR(ei, weight, reps);
updStreak();
DB.set('logs_' + S.cid, S.logs);
DB.set('streak_' + S.cid, S.streak);
DB.set('prs_' + S.cid, S.prs);
trackUsage('sessionsLogged');
var _d = getDay(); var _cpN = (DB.get('cp_'+S.cid)||{}).name || 'Client';
var _dayName = _d ? (_d.title || _d.name || _d.tag || 'workout') : 'workout';
logActivity('workout', _cpN + ' logged ' + ex.n + ' in ' + _dayName, 'log');
}
function delLog(ei, si) {
var key = lk(S.week, S.day, ei, si);
delete S.logs[key];
DB.set('logs_' + S.cid, S.logs);
}
function saveExNote(ei, text, from) {
var key = ek(S.week, S.day, ei);
S.exN[key] = S.exN[key] || {};
S.exN[key][from] = text;
DB.set('exnotes_' + S.cid, S.exN);
}
function saveSessNote(text, from) {
var key = sk(S.week, S.day);
S.sN[key] = S.sN[key] || {};
S.sN[key][from] = text;
DB.set('sessnotes_' + S.cid, S.sN);
}
function sendMsg(text, from, tCid) {
var cid = tCid || S.cid;
var msg = {id:'m'+Date.now(), text:text.trim(), from:from, ts:Date.now(), read:false};
var msgs = DB.get('msgs_' + cid) || [];
msgs.push(msg);
DB.set('msgs_' + cid, msgs);
if (from === 'client' && cid === S.cid) S.msgs = msgs;
if (from === 'trainer' && S.cliData[cid]) {
S.cliData[cid].messages = S.cliData[cid].messages || {};
S.cliData[cid].messages[msg.id] = msg;
}
trackUsage('messagesSent');
}
function readMsgs(cid, role) {
var other = role === 'trainer' ? 'client' : 'trainer';
var msgs = DB.get('msgs_' + cid) || [];
var chg = false;
msgs.forEach(function(m) { if (m.from === other && !m.read) { m.read = true; chg = true; } });
if (chg) DB.set('msgs_' + cid, msgs);
if (role === 'client') S.unread = msgs.filter(function(m){ return m.from === 'trainer' && !m.read; }).length;
}
function bookSess(cid, data) {
var id = 's' + Date.now();
var sess = {id:id, status:'upcoming', created:Date.now()};
Object.keys(data).forEach(function(k){ sess[k] = data[k]; });
var local = DB.get('sessions_' + cid) || {};
local[id] = sess;
DB.set('sessions_' + cid, local);
if (!S.clients[cid]) S.clients[cid] = {};
S.clients[cid].sessions = local;
DB.set('tc', S.clients);
toast('Session booked', 'ok');
}
function completeSess(cid, sessId) {
var local = DB.get('sessions_' + cid) || {};
if (local[sessId]) { local[sessId].status = 'done'; local[sessId].doneAt = today(); }
DB.set('sessions_' + cid, local);
// Always sync in-memory sessions from the DB object so renderSched stays accurate
if (!S.clients[cid]) S.clients[cid] = {};
S.clients[cid].sessions = local;
var bal = (S.clients[cid].balance || 0) - 1;
S.clients[cid].balance = bal;
DB.set('tc', S.clients);
logActivity('session', (S.clients[cid].name||'Client')+' completed a session'+(local[sessId]&&local[sessId].date?' on '+fmtD(local[sessId].date):''), 'sessions');
toast('Session completed - 1 session deducted', 'ok');
}
function logPay(cid, amount, note) {
var c = S.clients[cid] || {};
var rate = c.rate || 0;
var isOnline = c.type === 'online';
var pay = {id:'p'+Date.now(), amount:amount, date:today(), ts:Date.now(), note:note||''};
if (!S.clients[cid]) S.clients[cid] = {};
if (isOnline) {
// Online clients: payment goes into wallet; split against monthly rate + in-person sessions
pay.sessions = 0;
var remaining = amount;
var monthsCovered = 0;
var inPersonCovered = 0;
if (rate > 0) {
monthsCovered = Math.floor(remaining / rate);
remaining = Math.round((remaining - monthsCovered * rate) * 100) / 100;
}
var ipr = c.inPersonRate || 0;
if (ipr > 0 && remaining > 0) {
inPersonCovered = Math.floor(remaining / ipr);
remaining = Math.round((remaining - inPersonCovered * ipr) * 100) / 100;
}
pay.monthsCovered = monthsCovered;
pay.inPersonCovered = inPersonCovered;
pay.walletRemainder = remaining;
S.clients[cid].walletCredit = Math.round(((S.clients[cid].walletCredit || 0) + amount) * 100) / 100;
var toastMsg = 'Payment logged';
if (monthsCovered > 0) toastMsg += ' - ' + monthsCovered + ' month' + (monthsCovered > 1 ? 's' : '') + ' subscription';
if (inPersonCovered > 0) toastMsg += ' + ' + inPersonCovered + ' in-person session' + (inPersonCovered > 1 ? 's' : '');
if (remaining > 0) toastMsg += ' (' + currSym(cid) + remaining + ' surplus)';
toast(toastMsg, 'ok');
} else if (rate > 0) {
var sessions = Math.round(amount / rate);
pay.sessions = sessions;
S.clients[cid].balance = (S.clients[cid].balance || 0) + sessions;
toast('Payment logged - +' + sessions + ' sessions added', 'ok');
} else {
pay.sessions = 0;
pay.walletCredit = amount;
S.clients[cid].walletCredit = (S.clients[cid].walletCredit || 0) + amount;
toast('Payment stored as credit - set a session rate to convert to sessions', 'info');
}
var pays = DB.get('payments_' + cid) || {};
pays[pay.id] = pay;
DB.set('payments_' + cid, pays);
if (!S.clients[cid].payments) S.clients[cid].payments = {};
S.clients[cid].payments[pay.id] = pay;
DB.set('tc', S.clients);
trackUsage('paymentsLogged');
R();
}
