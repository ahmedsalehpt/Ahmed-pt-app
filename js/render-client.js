function renderComplete() {
var prs = S.sessionPRs || [];
var prog = sessP();
return '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;padding:24px;background:var(--bg);text-align:center">' +
'<div style="font-size:64px;margin-bottom:16px">&#127942;</div>' +
'<div style="font-size:10px;letter-spacing:3px;color:var(--acc);font-weight:700;margin-bottom:8px">SESSION COMPLETE</div>' +
'<div style="font-size:32px;font-weight:900;color:#fff;margin-bottom:6px">' + (S.activeDay?S.activeDay.title||S.activeDay.name:'Session') + '</div>' +
'<div style="font-size:14px;color:var(--m1);margin-bottom:24px">' + prog.done + ' sets &bull; Week ' + S.week + '</div>' +
(prs.length > 0 ?
'<div style="background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.2);border-radius:14px;padding:16px;width:100%;margin-bottom:20px;max-width:400px">' +
'<div style="font-size:10px;font-weight:700;letter-spacing:2px;color:var(--amber);margin-bottom:10px">&#127942; NEW PERSONAL RECORDS</div>' +
prs.map(function(pr) {
return '<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.06)">' +
'<div style="font-size:12px;color:#fff">' + pr.exName + '</div>' +
'<div style="font-size:14px;font-weight:800;color:var(--amber)">' + pr.weight + S.unit + ' &times; ' + pr.reps + '</div></div>';
}).join('') + '</div>' : '') +
'<div style="width:100%;max-width:400px">' +
'<div style="font-size:13px;color:var(--m1);margin-bottom:8px;font-weight:600">Add a session note?</div>' +
'<textarea class="inp" id="complete_note" rows="3" placeholder="How did it feel? Any wins or struggles?" style="margin-bottom:14px;text-align:left"></textarea>' +
'<button class="btn btn-green" style="margin-bottom:8px" onclick="finishSession()">FINISH &#10003;</button>' +
'<button onclick="shareCompletion()" style="width:100%;padding:12px;background:transparent;border:1px solid var(--bdr);border-radius:12px;color:var(--m1);font-size:13px;cursor:pointer">&#128248; Share Progress</button>' +
'</div></div>';
}

function finishSession() {
try {
var note = document.getElementById('complete_note') ? document.getElementById('complete_note').value : '';
if (note && note.trim()) saveSessNote(note.trim(), 'client');
} catch(e) {}
S.sessionPRs = [];
S.newPR = null;
S.activeDay = null;
S.scr = 'client';
S.cTab = 'home';
R();
}
function shareCompletion() {
shareCard();
}

function shareCard() {
var d=getDay();
var dName=d?(d.name||d.title||d.tag):'Workout';
var pr=sessP();
var todayPRs=Object.values(S.prs).filter(function(p){return p.date===today();});
var text=dName+' done! Week '+S.week+' &#8212; '+pr.done+' sets completed'+(S.streak.cur>1?', '+S.streak.cur+' day streak':'')+(todayPRs.length?' &#127942; '+todayPRs.length+' new PR'+(todayPRs.length>1?'s':''):'')+'. Training with Ahmed PT &#8212; @Madridsta_ on Instagram';
if(navigator.share){navigator.share({title:'Ahmed PT &#8212; Session Complete',text:text}).catch(function(){});}
else{toast('Screenshot and share!','info');}
}
function doCompNote() {
var ta=document.getElementById('comp_note');
if(ta)saveSessNote(ta.value,'client');
toast('Session note saved!','ok');
var b=ta?ta.nextElementSibling:null;
if(b){b.textContent='Saved! ✓';setTimeout(function(){if(b)b.textContent='SAVE NOTE ✓';},2000);}
}

function renderHome() {
var hr = new Date().getHours();
var greet = hr<12?'Good morning':hr<17?'Good afternoon':'Good evening';
var cp = DB.get('cp_'+S.cid)||{};
var name = (cp.name||'').split(' ')[0] || 'there';
var todayIdx = getTodayWorkoutIdx();
var d = todayIdx >= 0 ? getDays()[todayIdx] : null;
var todaySession = null;
if (!d) {
var _sObj = DB.get('sessions_'+S.cid)||{};
var _tStr = today();
var _sArr = Object.values(_sObj);
for (var _si=0; _si<_sArr.length; _si++) {
if (_sArr[_si].date===_tStr && _sArr[_si].status==='upcoming') { todaySession=_sArr[_si]; break; }
}
}
var tNote = '';
var snKeys = Object.keys(S.sN).sort();
for (var i = snKeys.length-1; i >= 0; i--) { var sni = S.sN[snKeys[i]]; if (sni&&sni.trainer) { tNote=sni.trainer; break; } }

// Calorie data
var targets = DB.get('bio_'+S.cid) || {};
var macros = targets.macros || {};
var dateStr = today();
var nutData = DB.get('nutrition_'+S.cid) || {};
var todayNut = nutData[dateStr] || {meals:{},water:0};
var calToday = Object.values(todayNut.meals||{}).reduce(function(acc, meal) {
return acc + Object.values(meal||{}).reduce(function(s,item){ return s+(item.calories||0); }, 0);
}, 0);

return '<div class="hdr"><div class="hdr-top">' +
'<div><div class="hdr-sub">Ahmed PT</div><div class="hdr-title">' + greet + '</div></div>' +
'<div style="display:flex;align-items:center;gap:8px">' +
(S.streak.cur>0?'<span class="pill p-amber">&#128293; '+S.streak.cur+'</span>':'') +
'<button onclick="doLogout()" style="padding:5px 10px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);border-radius:8px;color:#f87171;font-size:10px;font-weight:700;cursor:pointer">&#128682; Logout</button>' +
'</div></div></div><div class="page">' +
'<div style="margin-bottom:14px">' +
'<div style="font-size:24px;font-weight:900;color:#fff;letter-spacing:-.5px">' + name + ' &#128075;</div>' +
'<div style="font-size:11px;color:var(--m1);margin-top:3px">'+new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})+'</div>' +
'</div>' +

// Training day OR session today OR rest day card
(d ? renderTodayWorkoutCard(d, todayIdx) : (todaySession ? renderTodaySessionCard(todaySession) : renderRestDayCard())) +

// Calorie mini-card if targets set
(macros.calories ? renderHomeCalsCard(calToday, macros) : '') +

// Recovery prompt
(function(){
var recAll=DB.get('recovery_'+S.cid)||{};
var todayRec=recAll[today()]||null;
return (!todayRec?'<div onclick="setCTab(&apos;recovery&apos;)" style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(99,102,241,.06);border:1px solid rgba(99,102,241,.2);border-radius:12px;margin-bottom:8px;cursor:pointer">' +
'<div style="font-size:28px">&#128526;</div>' +
'<div style="flex:1"><div style="font-size:13px;font-weight:700;color:#fff">Morning Check-In</div>' +
'<div style="font-size:11px;color:var(--m1)">How are you feeling today?</div></div>' +
'<div style="font-size:16px;color:var(--acc)">&#8594;</div></div>':'');
})() +

// Coach note
(tNote?'<div style="padding:12px 14px;background:rgba(99,102,241,.06);border-left:3px solid var(--blue);border-radius:0 10px 10px 0;margin-bottom:10px">' +
'<div style="font-size:9px;font-weight:700;letter-spacing:1.5px;color:var(--blue);margin-bottom:5px">COACH AHMED</div>' +
'<div style="font-size:12px;color:var(--m1);line-height:1.6;font-style:italic">'+tNote+'</div>' +
'</div>':'') +

// Upcoming sessions
(function(){
var sessObj=DB.get('sessions_'+S.cid)||{};
var upcoming=Object.values(sessObj).filter(function(s){return s.status==='upcoming';}).sort(function(a,b){return(a.date||'').localeCompare(b.date||'');}).slice(0,2);
if(!upcoming.length)return'';
return '<div onclick="S.cTab=\'sessions\';R()" style="background:var(--c1);border:1px solid var(--bdr);border-radius:14px;padding:14px;margin-bottom:10px;cursor:pointer">' +
'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">' +
'<div style="font-size:10px;font-weight:700;letter-spacing:2px;color:var(--m2)">UPCOMING SESSIONS</div>' +
'<div style="font-size:11px;color:var(--acc);font-weight:600">See all &#8594;</div>' +
'</div>' +
upcoming.map(function(s){
return '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--bdr);last-child:border-none">' +
'<div style="width:36px;height:36px;border-radius:10px;background:'+(s.type==='online'?'rgba(99,102,241,.15)':'rgba(16,185,129,.15)')+';display:flex;align-items:center;justify-content:center;font-size:16px">'+(s.type==='online'?'&#128187;':'&#127947;')+'</div>' +
'<div><div style="font-size:13px;font-weight:700;color:#fff">'+fmtD(s.date)+'</div>' +
'<div style="font-size:11px;color:var(--m1)">'+(s.time||'Time TBD')+'</div></div>' +
'</div>';
}).join('') +
'</div>';
})() +

// Quick action 2x2 grid
'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">' +
(function(){
var goals=DB.get('goals_'+S.cid)||[];
var active=goals.filter(function(g){return !g.achieved;});
return '<div onclick="setCTab(&apos;goals&apos;)" style="padding:12px;background:var(--c1);border:1px solid var(--bdr);border-radius:12px;cursor:pointer">' +
'<div style="font-size:24px;margin-bottom:4px">&#127919;</div>' +
'<div style="font-size:12px;font-weight:700;color:#fff">Goals</div>' +
'<div style="font-size:10px;color:var(--m1);margin-top:2px">'+(active.length?active.length+' active':'No goals yet')+'</div>' +
'</div>';
})() +
(function(){
var habitData=DB.get('habits_'+S.cid)||{list:[],logs:{}};
var list=habitData.list||[];
var todayLogs=(habitData.logs||{})[today()]||[];
return '<div onclick="setCTab(&apos;habits&apos;)" style="padding:12px;background:var(--c1);border:1px solid var(--bdr);border-radius:12px;cursor:pointer">' +
'<div style="font-size:24px;margin-bottom:4px">&#9989;</div>' +
'<div style="font-size:12px;font-weight:700;color:#fff">Habits</div>' +
'<div style="font-size:10px;color:var(--m1);margin-top:2px">'+(list.length?todayLogs.length+'/'+list.length+' done':'No habits yet')+'</div>' +
'</div>';
})() +
'<div onclick="setCTab(&apos;measurements&apos;)" style="padding:12px;background:var(--c1);border:1px solid var(--bdr);border-radius:12px;cursor:pointer">' +
'<div style="font-size:24px;margin-bottom:4px">&#128207;</div>' +
'<div style="font-size:12px;font-weight:700;color:#fff">Measurements</div>' +
'<div style="font-size:10px;color:var(--m1);margin-top:2px">Track your body</div>' +
'</div>' +
'<div onclick="setCTab(&apos;nutrition&apos;)" style="padding:12px;background:var(--c1);border:1px solid var(--bdr);border-radius:12px;cursor:pointer">' +
'<div style="font-size:24px;margin-bottom:4px">&#127869;</div>' +
'<div style="font-size:12px;font-weight:700;color:#fff">Nutrition</div>' +
'<div style="font-size:10px;color:var(--m1);margin-top:2px">Log your meals</div>' +
'</div></div>' +

'</div>' + cliNav();
}

function renderTodayWorkoutCard(d, idx) {
var prog = getProg();
var estMins = d.ex ? d.ex.reduce(function(t,ex){return t+(ex.sets||3)*4;},0) : 0;
var progress = sessP();
var hasStarted = progress.done > 0;
var isComplete = progress.total > 0 && progress.done >= progress.total;
var btnText, btnStyle, subText;
if (isComplete) {
btnText = 'WORKOUT COMPLETE &#10003;';
btnStyle = 'background:var(--green)';
subText = 'All ' + progress.total + ' sets done — great work!';
} else if (hasStarted) {
btnText = 'CONTINUE WORKOUT &#8594;';
btnStyle = 'background:var(--acc)';
subText = progress.done + ' / ' + progress.total + ' sets done';
} else {
btnText = 'START WORKOUT &#8594;';
btnStyle = 'background:var(--acc)';
subText = d.ex ? d.ex.length + ' exercises &bull; ~' + estMins + ' min' : '';
}
return '<div style="background:linear-gradient(135deg,rgba(99,102,241,.18),rgba(236,72,153,.08));border:1px solid rgba(99,102,241,.35);border-radius:16px;padding:18px;margin-bottom:12px">' +
'<div style="font-size:10px;font-weight:700;letter-spacing:2px;color:var(--acc);margin-bottom:8px">TODAY&#39;S WORKOUT</div>' +
'<div style="font-size:26px;font-weight:900;color:#fff;letter-spacing:-.5px;margin-bottom:4px">' + (d.title||d.name||'Workout') + '</div>' +
'<div style="font-size:12px;color:var(--m1);margin-bottom:10px">' + subText + '</div>' +
(hasStarted && !isComplete ? '<div style="background:rgba(0,0,0,.3);border-radius:6px;overflow:hidden;height:5px;margin-bottom:10px"><div style="height:100%;border-radius:6px;background:var(--acc);width:'+Math.round(progress.done/progress.total*100)+'%"></div></div>' : '') +
'<button class="btn" style="margin-bottom:0;font-size:15px;'+btnStyle+'" onclick="startWorkout(' + idx + ')">'+btnText+'</button>' +
'</div>';
}

function renderTodaySessionCard(s) {
return '<div onclick="S.cTab=\'sessions\';R()" style="background:linear-gradient(135deg,rgba(16,185,129,.15),rgba(16,185,129,.05));border:1px solid rgba(16,185,129,.35);border-radius:16px;padding:18px;margin-bottom:12px;cursor:pointer">' +
'<div style="font-size:10px;font-weight:700;letter-spacing:2px;color:#10b981;margin-bottom:8px">SESSION TODAY</div>' +
'<div style="font-size:26px;font-weight:900;color:#fff;letter-spacing:-.5px;margin-bottom:4px">'+(s.time||'Today')+'</div>' +
'<div style="font-size:12px;color:var(--m1);margin-bottom:12px">'+(s.note||'In-person session with your trainer')+(s.workoutName?' &bull; <span style="color:#818cf8">'+s.workoutName+'</span>':'')+'</div>' +
'<button class="btn" style="background:rgba(16,185,129,.2);border:1px solid rgba(16,185,129,.4);color:#10b981;margin-bottom:0;font-size:13px">VIEW SCHEDULE &#8594;</button>' +
'</div>';
}
function renderRestDayCard() {
return '<div style="background:var(--c1);border:1px solid var(--bdr);border-radius:14px;padding:16px;margin-bottom:12px">' +
'<div style="display:flex;align-items:center;gap:12px">' +
'<div style="font-size:36px">&#128564;</div>' +
'<div>' +
'<div style="font-size:17px;font-weight:800;color:#fff;margin-bottom:2px">Rest Day</div>' +
'<div style="font-size:12px;color:var(--m1)">Focus on sleep, hydration and nutrition today.</div>' +
'<div style="font-size:11px;color:var(--m2);margin-top:4px">No workout scheduled.</div>' +
'</div></div></div>';
}

function renderHomeCalsCard(calToday, macros) {
var target = macros.calories || 0;
if (!target) return '';
var remaining = target - calToday;
var pct = Math.min(100, Math.round(calToday / target * 100));
var over = remaining < 0;
return '<div style="background:var(--c1);border:1px solid var(--bdr);border-radius:14px;padding:14px;margin-bottom:10px;cursor:pointer" onclick="setCTab(&apos;nutrition&apos;)">' +
'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
'<div style="font-size:10px;font-weight:700;letter-spacing:2px;color:var(--m2)">CALORIES TODAY</div>' +
'<div style="font-size:11px;color:var(--acc);font-weight:600">Log food &#8594;</div>' +
'</div>' +
'<div style="display:flex;align-items:center;gap:12px">' +
'<div><div style="font-size:24px;font-weight:900;color:' + (over?'var(--red)':'#fff') + '">' + calToday + '</div>' +
'<div style="font-size:10px;color:var(--m1)">of ' + target + ' kcal</div></div>' +
'<div style="flex:1">' +
'<div style="height:8px;background:var(--m3);border-radius:4px;overflow:hidden;margin-bottom:4px">' +
'<div style="height:100%;width:' + pct + '%;background:' + (over?'var(--red)':'var(--green)') + ';border-radius:4px"></div></div>' +
'<div style="font-size:11px;color:var(--m1)">' + (over ? Math.abs(remaining) + ' kcal over' : remaining + ' kcal left') + '</div>' +
'</div></div></div>';
}

function renderClient() {
if(S.cTab!=='account') S.confirmDelete = false;
if(S.cTab==='home')return renderHome();
if(S.cTab==='workout')return renderWorkout();
if(S.cTab==='progress')return renderProgress();
if(S.cTab==='nutrition')return renderNutrition();
if(S.cTab==='goals')return renderGoals();
if(S.cTab==='habits')return renderHabits();
if(S.cTab==='recovery')return renderRecovery();
if(S.cTab==='measurements')return renderMeasurements();
if(S.cTab==='sessions')return renderMySess();
if(S.cTab==='account')return renderMyAcct();
if(S.cTab==='messages')return renderMsgs();
return renderHome();
}
function cliNav() {
var tabs=[
{id:'home',icon:'&#127968;',lbl:'Home'},
{id:'workout',icon:'&#128170;',lbl:'Workout'},
{id:'sessions',icon:'&#128197;',lbl:'Schedule'},
{id:'nutrition',icon:'&#127822;',lbl:'Nutrition'},
{id:'messages',icon:'&#128172;',lbl:'Coach',badge:S.unread}
];
var navOn=S.cTab;
if(navOn==='goals'||navOn==='habits'||navOn==='recovery'||navOn==='measurements'||navOn==='progress'||navOn==='account')navOn='home';
return '<nav class="bnav">'+tabs.map(function(t){
var on=navOn===t.id;
var color=on?'var(--acc)':'var(--m2)';
var click=t.id==='workout'?'S.wkDayOpen=null;S.cTab=\'workout\';R()':'S.cTab=\''+t.id+'\';R()';
return '<button class="nb" onclick="'+click+'" style="color:'+color+'">' +
'<span class="nbi">'+t.icon+'</span>'+t.lbl+
(t.badge&&t.badge>0?'<span class="nbd">'+t.badge+'</span>':'')+
'</button>';
}).join('')+'</nav>';
}

function openWorkoutDay(idx) {
S.wkDayOpen = idx; S.day = idx; S.cTab = 'workout'; R();
}
function renderWorkoutList(prog, days) {
var todayWd = new Date().getDay();
var cp = DB.get('cp_'+S.cid)||{};
var hdr = '<div class="hdr"><div class="hdr-top">' +
'<div><div class="hdr-sub">Training</div><div class="hdr-title">'+(prog?prog.name.split('-')[0].trim():'My Workouts')+'</div></div>' +
'<div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">' +
(S.streak.cur>0?'<span class="pill p-amber">&#128293; '+S.streak.cur+'</span>':'') +
'</div></div></div>';
if (!prog || !days.length) {
return hdr+'<div class="page"><div class="empty">No program yet.<br>Your trainer will set up your workouts.</div></div>'+cliNav();
}
// Current program days
var daysHtml = '<div style="font-size:10px;font-weight:700;letter-spacing:2px;color:var(--m2);margin-bottom:10px">YOUR PROGRAM</div>';
for (var di=0; di<days.length; di++) {
var dd = days[di];
var ac = dd.accent || 'var(--acc)';
var dName = dd.title || dd.name || dd.tag || ('Day '+(di+1));
var exCnt = (dd.ex||[]).length;
var wds = dd.weekdays||[];
var isTodayWd = wds.indexOf(todayWd) >= 0;
// Count total sets logged this week for this day
var setsThisWk = 0;
var pr2 = {done:0,total:0};
var savedDay = S.day;
S.day = di;
pr2 = sessP();
S.day = savedDay;
daysHtml += '<div onclick="openWorkoutDay('+di+')" style="display:flex;align-items:center;gap:13px;padding:14px 16px;background:var(--c1);border:1px solid var(--bdr);border-left:3px solid '+ac+';border-radius:0 14px 14px 0;margin-bottom:8px;cursor:pointer">' +
'<div style="width:44px;height:44px;border-radius:12px;background:'+ac+'22;display:flex;align-items:center;justify-content:center;font-size:22px">&#128170;</div>' +
'<div style="flex:1">' +
'<div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">' +
'<div style="font-size:15px;font-weight:800;color:#fff">'+dName+'</div>' +
(isTodayWd?'<span style="font-size:8px;background:'+ac+';color:#fff;padding:2px 6px;border-radius:5px;font-weight:800">TODAY</span>':'')+
'</div>' +
'<div style="font-size:11px;color:var(--m2)">'+exCnt+' exercise'+(exCnt===1?'':'s') +
(dd.sub?' &bull; '+dd.sub:'')+
(pr2.total>0?' &bull; <span style="color:'+ac+'">'+pr2.done+'/'+pr2.total+' sets this week</span>':'')+
'</div>' +
'</div>' +
'<div style="font-size:16px;color:var(--m2)">&#8250;</div>' +
'</div>';
}
// Recent workout history (last 5 logged days)
var histKeys = Object.keys(S.logs||{});
var recentMap = {};
for (var hk=0; hk<histKeys.length; hk++) {
var parts = histKeys[hk].split('_');
// key format: w{week}_d{day}_e{ei}_s{si}
if (parts.length < 2) continue;
var wIdx = parseInt((parts[0]||'').replace('w',''))||0;
var dIdx = parseInt((parts[1]||'').replace('d',''))||0;
var log = S.logs[histKeys[hk]];
if (!log || !log.done || !log.ts) continue;
var mapKey = wIdx+'_'+dIdx;
if (!recentMap[mapKey] || recentMap[mapKey].ts < log.ts) {
recentMap[mapKey] = {wIdx:wIdx, dIdx:dIdx, ts:log.ts, dayName:(days[dIdx]?days[dIdx].title||days[dIdx].name||days[dIdx].tag:'Workout')};
}
}
var histArr = Object.values(recentMap).sort(function(a,b){return b.ts-a.ts;}).slice(0,6);
var histHtml = '';
if (histArr.length) {
histHtml += '<div style="font-size:10px;font-weight:700;letter-spacing:2px;color:var(--m2);margin:16px 0 10px">RECENT HISTORY</div>';
for (var hi=0; hi<histArr.length; hi++) {
var h = histArr[hi];
var hDate = new Date(h.ts).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'});
var hDayName = h.dayName;
var hAc = (days[h.dIdx]&&days[h.dIdx].accent)||'var(--acc)';
histHtml += '<div onclick="S.week='+h.wIdx+';openWorkoutDay('+h.dIdx+')" style="display:flex;align-items:center;gap:12px;padding:11px 14px;background:var(--c1);border:1px solid var(--bdr);border-radius:12px;margin-bottom:6px;cursor:pointer">' +
'<div style="width:36px;height:36px;border-radius:9px;background:rgba(16,185,129,.08);display:flex;align-items:center;justify-content:center;font-size:16px">&#9989;</div>' +
'<div style="flex:1"><div style="font-size:13px;font-weight:600;color:var(--m1)">'+hDayName+'</div>' +
'<div style="font-size:10px;color:var(--m2)">Week '+h.wIdx+' &bull; '+hDate+'</div></div>' +
'<div style="font-size:14px;color:var(--m2)">&#8250;</div></div>';
}
}
return hdr+'<div class="page">'+daysHtml+histHtml+'</div>'+cliNav();
}
function renderWorkout() {
var prog=getProg();
var days=getDays();
// Show list if no day selected
if (S.wkDayOpen === null || S.wkDayOpen === undefined) {
return renderWorkoutList(prog, days);
}
var duration=getDurationWeeks(prog);
var wkPhase=((S.week-1)%4)+1;
var wk=WK[wkPhase]||WK[1];
var todayWd=new Date().getDay();
var todayDays=[];
for(var ti=0;ti<days.length;ti++){if(getDayScheduled(days[ti]).indexOf(todayWd)>=0)todayDays.push(ti);}
var isTrainingDay=todayDays.length>0;
var d=getDay();
var ac=d?(d.accent||'var(--acc)'):'var(--acc)';
var pr=sessP(), pct=pr.total>0?(pr.done/pr.total*100):0;
var cp=DB.get('cp_'+S.cid)||{};
var clientName=cp.name||'there';
var weekNav='<div style="display:flex;align-items:center;gap:6px;justify-content:center;margin-bottom:8px">' +
'<button onclick="if(S.week>1){setWk(S.week-1);}" style="width:30px;height:30px;border-radius:8px;background:var(--c2);border:1px solid var(--bdr);color:var(--m1);font-size:18px;cursor:pointer;line-height:1">&#8249;</button>' +
'<div style="text-align:center;min-width:110px">' +
'<div style="font-size:13px;font-weight:800;color:'+wk.c+'">WEEK '+S.week+' / '+duration+'</div>' +
'<div style="font-size:9px;color:var(--m1);letter-spacing:1px">'+wk.l+'</div>' +
'</div>' +
'<button onclick="if(S.week<'+duration+'){setWk(S.week+1);}" style="width:30px;height:30px;border-radius:8px;background:var(--c2);border:1px solid var(--bdr);color:var(--m1);font-size:18px;cursor:pointer;line-height:1">&#8250;</button>' +
'</div>';
var dayPills=days.length>0?'<div style="display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding:0 0 4px">' +
days.map(function(dd,i){
var on=i===S.day;
var isTodayDay=todayDays.indexOf(i)>=0;
var dName=dd.name||dd.title||dd.tag;
return '<button onclick="selDay('+i+')" style="flex-shrink:0;padding:5px 14px;border-radius:20px;border:'+(on?'2px solid '+(dd.accent||'var(--acc)'):'1px solid var(--bdr)')+';background:'+(on?(dd.accent||'var(--acc)')+'22':'transparent')+';color:'+(on?(dd.accent||'var(--acc)'):'var(--m1)')+';font-size:11px;font-weight:700;white-space:nowrap;cursor:pointer">'+dName+(isTodayDay?' &#128314;':'')+'</button>';
}).join('')+'</div>':'';
var hdr='<div class="hdr"><div class="hdr-top">' +
'<div style="display:flex;align-items:center;gap:8px">' +
'<button onclick="S.wkDayOpen=null;R()" style="width:30px;height:30px;border-radius:8px;background:var(--c2);border:1px solid var(--bdr);color:var(--m1);font-size:18px;cursor:pointer;line-height:1;flex-shrink:0">&#8249;</button>' +
'<div><div class="hdr-sub">Ahmed PT</div><div class="hdr-title">'+(prog?prog.name.split('-')[0].trim():'My Training')+'</div></div>' +
'</div>' +
'<div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">' +
(S.streak.cur>0?'<span class="pill p-amber">&#128293; '+S.streak.cur+'</span>':'') +
'<div style="display:flex;gap:3px"><button onclick="setUnit(\'kg\')" style="padding:2px 7px;border-radius:8px;border:1px solid '+(S.unit==='kg'?'var(--acc)':'var(--bdr)')+';background:'+(S.unit==='kg'?'rgba(99,102,241,.15)':'transparent')+';color:'+(S.unit==='kg'?'var(--acc)':'var(--m2)')+';font-size:10px;font-weight:700;cursor:pointer">KG</button>' +
'<button onclick="setUnit(\'lb\')" style="padding:2px 7px;border-radius:8px;border:1px solid '+(S.unit==='lb'?'var(--acc)':'var(--bdr)')+';background:'+(S.unit==='lb'?'rgba(99,102,241,.15)':'transparent')+';color:'+(S.unit==='lb'?'var(--acc)':'var(--m2)')+';font-size:10px;font-weight:700;cursor:pointer">LB</button></div>' +
'</div></div>' +
'<div style="padding:8px 14px 4px">'+weekNav+dayPills+'</div>' +
'</div>';
if(!prog||!days.length){
return hdr+'<div class="page"><div class="empty">No program yet.<br>Ahmed will set up your workouts.</div></div>'+cliNav();
}
if(!isTrainingDay&&S.cTab==='workout'&&todayDays.length===0&&S.day===S.day){
var viewingNonToday=true;
}
var pageBody='';
if(!d){
pageBody=renderRestDay(prog)+renderWeekStrip(prog);
}else{
var dName=d.name||d.title||d.tag;
var isActiveTodayDay=todayDays.indexOf(S.day)>=0;
pageBody=
'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px">' +
'<div><div style="font-size:24px;font-weight:800;color:#fff;letter-spacing:-.5px">'+dName+'</div>' +
'<div style="font-size:10px;color:var(--m2);letter-spacing:1px;text-transform:uppercase;margin-top:2px">'+(d.sub||'')+'</div>' +
'<div style="font-size:10px;color:var(--m1);margin-top:2px">'+((d.ex||[]).length)+' exercises &#183; '+wk.n+'</div>' +
'</div>' +
'<div style="text-align:right"><div style="font-size:22px;font-weight:900;color:'+ac+'">'+pr.done+'<span style="color:var(--m2)">/'+pr.total+'</span></div>' +
'<div style="width:80px;height:3px;background:var(--m3);border-radius:2px;margin-left:auto;margin-top:3px;overflow:hidden"><div style="height:100%;width:'+pct+'%;background:'+ac+';border-radius:2px;transition:width .3s"></div></div></div></div>' +
(!isActiveTodayDay?'<div style="padding:8px 12px;background:rgba(255,255,255,.04);border:1px solid var(--bdr);border-radius:9px;font-size:11px;color:var(--m2);margin-bottom:12px">&#128196; Viewing &#8212; this is not today\'s scheduled workout</div>':'') +
'<div id="motiv_card" style="background:linear-gradient(135deg,rgba(99,102,241,.15),rgba(236,72,153,.08));border:1px solid rgba(99,102,241,.25);border-radius:14px;padding:16px;margin-bottom:14px">' +
buildMotivInner(getDailyMotivation(d,S.streak.cur,S.week)) +
'</div>' +
(d.coach?'<div style="padding:8px 12px;background:'+ac+'0d;border-left:3px solid '+ac+';border-radius:0 8px 8px 0;margin-bottom:12px;font-size:11px;color:var(--m1);line-height:1.6"><strong style="color:'+ac+'">COACH: </strong>'+d.coach+'</div>':'') +
d.ex.map(function(ex,ei){return renderExCard(ex,ei,d);}).join('') +
renderSessNoteBox();
if(isActiveTodayDay){
setTimeout(function(){
generateWorkoutMessage(clientName, dName, d.ex, S.streak.cur, S.week, duration);
}, 200);
}
pageBody+=renderWeekStrip(prog);
}
return hdr+'<div class="page">'+pageBody+'</div>'+cliNav();
}

function renderExCard(origEx, ei, d) {
var ex=getEx(ei); if(!ex)return'';
var sc=origEx.sets||3;
var allDone=true;
for(var i=0;i<sc;i++){var l=getL(S.week,S.day,ei,i);if(!l||!l.done){allDone=false;break;}}
var isOpen=S.aSet&&S.aSet.ei===ei;
var exN=S.exN[ek(S.week,S.day,ei)]||null;
var hasN=exN&&(exN.client||exN.trainer);
var showNote=S.xNote===ei;
var showAlt=S.xAlt===ei;
var hasAlt=origEx.alt&&origEx.alt.length>0;
return '<div class="ex-card'+(allDone?' done':'')+'" id="exc_'+ei+'">' +
'<div class="ex-hdr" onclick="togNote('+ei+')">' +
'<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">' +
'<div style="flex:1;min-width:0">' +
'<div class="ex-name">'+ex.n+(ex.swapped?'<span style="font-size:9px;color:var(--amber);margin-left:5px">(swapped)</span>':'')+'</div>' +
'<div class="ex-info">' +
'<span class="pill p-blue" style="font-size:8px;margin-right:4px">'+(origEx.t||'')+'</span>' +
(origEx.ss?'<span style="font-size:8px;background:rgba(245,158,11,.15);color:var(--amber);border:1px solid rgba(245,158,11,.3);border-radius:5px;padding:1px 5px;margin-right:4px;font-weight:800">&#9889; SS</span>':'') +
'<span style="color:var(--m2)">'+origEx.r+' reps - '+sc+' sets - '+(origEx.rest||'')+'</span>' +
(hasN?'<span style="font-size:9px;color:var(--acc);margin-left:5px">&#128221;</span>':'') +
'</div>' +
(origEx.ss&&d.ex?'<div style="font-size:9px;color:var(--amber);margin-top:1px">SS with: '+d.ex.filter(function(e,idx){return idx!==ei&&e.ss===origEx.ss;}).map(function(xe){return xe.n;}).join(' + ')+'</div>':'') +
'</div>' +
'<div style="display:flex;gap:5px;align-items:center;flex-shrink:0">' +
(hasAlt?'<button class="pill p-amber" onclick="event.stopPropagation();togAlt('+ei+')" style="cursor:pointer">swap</button>':'') +
'<button onclick="event.stopPropagation();openYT(\''+ex.n.replace(/[^a-zA-Z0-9 ]/g,'').trim()+'\')" style="padding:3px 7px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);border-radius:7px;color:#f87171;font-size:9px;font-weight:700;cursor:pointer">YT ▶</button>' +
'<span style="font-size:12px;color:var(--m2)">'+(showNote?'▴':'▾')+'</span>' +
'</div></div></div>' +
'<div class="ex-cue'+(showNote?' show':'')+'">'+ex.note+'</div>' +
(exN&&exN.trainer?'<div style="padding:6px 13px 8px;border-left:3px solid var(--blue);margin:0 0 0 13px;background:rgba(99,102,241,.04);border-radius:0 6px 6px 0;font-size:11px;color:var(--m1);line-height:1.5;font-style:italic"><span style="font-weight:700;color:var(--blue);font-style:normal">Coach: </span>'+exN.trainer+'</div>':'') +
(showAlt&&hasAlt?'<div class="alt-wrap"><div style="font-size:9px;font-weight:700;letter-spacing:1.5px;color:var(--amber);margin-bottom:7px">SWAP EXERCISE</div>' +
'<button class="alt-btn" onclick="doSwap('+ei+',undefined)" style="'+(S.swaps[S.day+'_'+ei]===undefined?'background:rgba(245,158,11,.08);border-color:rgba(245,158,11,.3)':'')+'">'+origEx.n+' (original)</button>' +
origEx.alt.map(function(a,ai){return '<button class="alt-btn" onclick="doSwap('+ei+','+ai+')" style="'+(S.swaps[S.day+'_'+ei]===ai?'background:rgba(245,158,11,.08);border-color:rgba(245,158,11,.3)':'')+'">'+a+'</button>';}).join('') +
'</div>':'') +
'<div class="sets">'+Array.from({length:sc},function(_,si){
var lg=getL(S.week,S.day,ei,si),lgd=lg&&lg.done;
var isA=S.aSet&&S.aSet.ei===ei&&S.aSet.si===si;
return '<div style="display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer" onclick="openSet('+ei+','+si+')">' +
'<div class="sdot'+(lgd?' done':'')+(isA?' active':'')+'" style="border-color:'+(lgd?d.accent:isA?d.accent:'var(--bdr)')+';'+(lgd?'background:'+d.accent:'')+(isA&&!lgd?';color:'+d.accent:'')+'">'+(lgd?'✓':si+1)+'</div>' +
(lgd&&lg.weight?'<div class="sdot-w" style="color:'+d.accent+'">'+lg.weight+S.unit+'</div>':'') +
'</div>';
}).join('')+'</div>' +
(isOpen?renderLogPanel(ei,S.aSet.si,d):'') +
'<div style="border-top:1px solid var(--bdr)">' +
'<button onclick="event.stopPropagation();S.xNote=(S.xNote==='+ei+'?-1:'+ei+');R()" style="width:100%;padding:7px 12px;text-align:left;font-size:10px;font-weight:700;color:'+(hasN?d.accent:'var(--m2)')+';letter-spacing:1px;background:none;border:none;cursor:pointer">📝 '+(showNote?'HIDE':'NOTES')+(hasN&&!showNote?' (has notes)':'')+'</button>' +
(showNote?renderExNoteBox(ei,exN,d):'') +
'</div></div>';
}
function renderLogPanel(ei, si, d) {
var ex=getEx(ei); if(!ex)return'';
var lg=getL(S.week,S.day,ei,si)||{};
var prev=null;
for(var w=S.week-1;w>=1;w--){var pl=getL(w,S.day,ei,si);if(pl&&pl.done){prev={data:pl,week:w};break;}}
return '<div class="lpanel">' +
'<div class="lt" style="color:'+d.accent+'">SET '+(si+1)+' - '+ex.n.toUpperCase()+'</div>' +
(prev?'<div class="prev">Wk'+prev.week+': '+(prev.data.weight?'<strong>'+prev.data.weight+S.unit+'</strong>':'')+(prev.data.reps?' x '+prev.data.reps:'')+(prev.data.rpe?' - RPE '+prev.data.rpe:'')+'</div>':'') +
'<div class="two-col">' +
'<div><div class="lbl">Weight ('+S.unit+')</div><input class="inp" type="number" id="inp_w" value="'+((S.aSet&&S.aSet.pw!=null)?S.aSet.pw:(lg.weight||''))+'" placeholder="'+(prev&&prev.data.weight?prev.data.weight:'e.g. 60')+'" inputmode="decimal" onfocus="this.style.borderColor=\''+d.accent+'\'" onblur="this.style.borderColor=\'\'"></div>' +
'<div><div class="lbl">Reps done</div><input class="inp" type="number" id="inp_r" value="'+((S.aSet&&S.aSet.pr!=null)?S.aSet.pr:(lg.reps||''))+'" placeholder="'+(prev&&prev.data.reps?prev.data.reps:'e.g. 8')+'" inputmode="numeric" onfocus="this.style.borderColor=\''+d.accent+'\'" onblur="this.style.borderColor=\'\'"></div>' +
'</div>' +
'<div class="lbl">RPE</div>' +
'<div class="rpe-row">'+[1,2,3,4,5,6,7,8,9,10].map(function(v){
return '<button class="rpe-btn" onclick="var _w=document.getElementById(\'inp_w\'),_r=document.getElementById(\'inp_r\');if(S.aSet){S.aSet.pw=_w?_w.value:null;S.aSet.pr=_r?_r.value:null;}S.rpe='+(S.rpe===v?'null':v)+';R()" style="'+(S.rpe===v?'background:'+rpeC(v)+';color:#fff;border-color:transparent;':'')+'">'+v+'</button>';
}).join('')+(S.rpe?'<span style="font-size:11px;font-weight:700;color:'+rpeC(S.rpe)+';margin-left:4px">'+rpeN(S.rpe)+'</span>':'')+'</div>' +
'<div class="log-acts">' +
'<button class="btn btn-acc" style="flex:1;background:'+d.accent+';margin-bottom:0" onclick="doLog('+ei+','+si+')">✓ LOG SET</button>' +
(lg.done?'<button class="btn-sm btn-ghost" onclick="doClear('+ei+','+si+')" style="margin-bottom:0">✕</button>':'') +
'<button class="btn-sm btn-ghost" onclick="S.aSet=null;S.rpe=null;R()" style="margin-bottom:0">ESC</button>' +
'</div></div>';
}
function renderExNoteBox(ei, exN, d) {
var tN=exN&&exN.trainer?exN.trainer:'', cN=exN&&exN.client?exN.client:'';
return '<div style="padding:10px 13px;background:rgba(0,0,0,.2)">' +
(tN?'<div style="margin-bottom:7px"><div class="lbl" style="color:var(--blue)">AHMED&#39;S NOTE</div><div style="padding:7px 10px;background:rgba(99,102,241,.08);border-radius:8px;border:1px solid rgba(99,102,241,.15);font-size:11px;color:var(--m1)">'+tN+'</div></div>':'') +
(cN?'<div style="margin-bottom:7px"><div class="lbl" style="color:var(--green)">YOUR NOTE</div><div style="padding:7px 10px;background:rgba(16,185,129,.06);border-radius:8px;border:1px solid rgba(16,185,129,.15);font-size:11px;color:var(--m1)">'+cN+'</div></div>':'') +
'<div style="display:flex;gap:6px;align-items:flex-end">' +
'<textarea class="inp" id="exn_'+ei+'" rows="2" placeholder="Add a note..." style="flex:1;min-height:36px">'+cN+'</textarea>' +
'<button class="btn-sm btn-acc" onclick="doExNote('+ei+')">✓</button></div></div>';
}
function renderSessNoteBox() {
var k=sk(S.week,S.day), sn=S.sN[k]||{}, tN=sn.trainer||'', cN=sn.client||'', rating=sn.rating||0;
return '<div class="card" style="margin-top:12px"><div class="card-p">' +
'<div style="font-size:11px;font-weight:700;letter-spacing:1.5px;color:var(--m1);margin-bottom:10px;text-transform:uppercase">&#128203; Session Notes</div>' +
(tN?'<div style="margin-bottom:10px"><div class="lbl" style="color:var(--blue)">AHMED&#39;S FEEDBACK</div><div style="padding:8px 10px;background:rgba(99,102,241,.08);border:1px solid rgba(99,102,241,.15);border-radius:9px;font-size:11px;color:var(--m1);line-height:1.6">'+tN+'</div></div>':'') +
'<div class="lbl" style="color:var(--green)">YOUR NOTES</div>' +
'<textarea class="inp" id="sn_inp" rows="3" placeholder="How did the session go?" style="min-height:60px;margin-bottom:8px">'+cN+'</textarea>' +
'<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">' +
'<div class="lbl" style="margin-bottom:0">RATE SESSION:</div>' +
[1,2,3,4,5].map(function(v){return '<button onclick="doSessRating('+v+')" style="font-size:22px;background:none;border:none;cursor:pointer;padding:0;line-height:1;opacity:'+(v<=rating?'1':'.25')+'">'+(v<=rating?'&#11088;':'&#11088;')+'</button>';}).join('') +
(rating?'<span style="font-size:11px;color:var(--amber);font-weight:700">'+rating+'/5</span>':'') +
'</div>' +
'<button class="btn-sm btn-green" onclick="doSessNote()">Save &#10003;</button>' +
'</div></div>';
}
function doSessRating(v) {
var k=sk(S.week,S.day);
S.sN[k]=S.sN[k]||{};
S.sN[k].rating=v;
DB.set('sessnotes_'+S.cid,S.sN);
toast('Rated '+v+' stars','ok');
R();
}

function doLogBW() {
var d=(document.getElementById('bw_d')||{}).value||today();
var v=parseFloat((document.getElementById('bw_v')||{}).value||'');
var u=(document.getElementById('bw_u')||{}).value||'kg';
if(!v||v<=0){toast('Enter your weight','err');return;}
var arr=DB.get('bodyweight_'+S.cid)||[];
arr=arr.filter(function(e){return e.date!==d;});
arr.push({date:d,weight:v,unit:u});
arr.sort(function(a,b){return a.date.localeCompare(b.date);});
DB.set('bodyweight_'+S.cid,arr);
logActivity('weight', (DB.get('cp_'+S.cid)||{}).name+' logged weight: '+v+u, 'body');
toast('Weight logged','ok'); R();
}
function renderBWSection() {
var arr=DB.get('bodyweight_'+S.cid)||[];
var max=0, min=99999;
arr.forEach(function(e){if(e.weight>max)max=e.weight;if(e.weight<min)min=e.weight;});
var range=max-min||1;
return '<div class="sect">BODY WEIGHT</div>' +
'<div class="card"><div class="card-p">' +
'<div style="display:grid;grid-template-columns:1fr 1fr 70px;gap:8px;margin-bottom:8px">' +
'<div><div class="lbl">Date</div><input class="inp" id="bw_d" type="date" value="'+today()+'" style="margin-bottom:0"></div>' +
'<div><div class="lbl">Weight</div><input class="inp" id="bw_v" type="number" placeholder="e.g. 75" inputmode="decimal" style="margin-bottom:0"></div>' +
'<div><div class="lbl">Unit</div><select class="sel" id="bw_u" style="margin-bottom:0"><option value="kg">kg</option><option value="lb">lb</option></select></div>' +
'</div>' +
'<button class="btn-sm btn-green" onclick="doLogBW()">Log Weight +</button>' +
'</div></div>' +
(arr.length?'<div style="padding:4px 0">'+arr.slice(-10).reverse().map(function(e){
var pct=range>0?Math.round((e.weight-min)/range*80)+10:50;
return '<div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid var(--bdr)">' +
'<div style="min-width:74px;font-size:11px;color:var(--m1)">'+fmtD(e.date)+'</div>' +
'<div style="flex:1;height:5px;background:var(--m3);border-radius:3px"><div style="height:100%;width:'+pct+'%;background:var(--green);border-radius:3px;transition:width .3s"></div></div>' +
'<div style="min-width:52px;text-align:right;font-size:14px;font-weight:800;color:#fff">'+e.weight+'<span style="font-size:10px;color:var(--m1)">'+e.unit+'</span></div>' +
'</div>';
}).join('')+'</div>':'');
}
function renderProgress() {
return '<div class="hdr"><div class="hdr-top">' +
'<div><div class="hdr-sub">Ahmed PT</div><div class="hdr-title">Progress</div></div>' +
'</div></div><div class="page">' +
renderStreakCard() +
renderPRMiniBoard() +
renderProgressSection() +
renderMeasurementsSummary() +
renderHistorySummary() +
'</div>' + cliNav();
}

function renderStreakCard() {
var d14 = get14();
return '<div class="sk-card" style="margin-bottom:14px">' +
'<div class="sk-nums">' +
'<div><div class="sk-n">'+S.streak.cur+'</div><div class="sk-l">Streak &#128293;</div></div>' +
'<div><div class="sk-n">'+S.streak.best+'</div><div class="sk-l">Best &#127942;</div></div>' +
'</div>' +
'<div style="font-size:10px;color:var(--m1);margin-bottom:8px;font-weight:600;letter-spacing:1px">LAST 14 DAYS</div>' +
'<div class="sk-days">'+d14.map(function(dt){
var isT=dt===today(), had=hadSess(dt)||(S.streak.lastDate===dt);
return '<div class="sk-day '+(isT?'today':had?'done':'miss')+'">' +
'<div style="font-size:7px;color:var(--m1)">'+new Date(dt+'T12:00:00').toLocaleDateString('en-GB',{weekday:'short'}).slice(0,1)+'</div>' +
'<div style="font-size:12px">'+(isT?'&#128205;':had?'&#9989;':'&#183;')+'</div>' +
'<div style="font-size:7px;color:var(--m2)">'+new Date(dt+'T12:00:00').getDate()+'</div>' +
'</div>';
}).join('')+'</div></div>';
}

function renderPRMiniBoard() {
var prs = Object.values(S.prs).sort(function(a,b){ return new Date(b.date||0)-new Date(a.date||0); });
if (!prs.length) return '';
var collapsed = S.prBoardCollapsed;
return '<div style="background:linear-gradient(135deg,rgba(245,158,11,.06),rgba(239,68,68,.03));border:1px solid rgba(245,158,11,.15);border-radius:12px;padding:12px;margin-bottom:14px">' +
'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:' + (collapsed?'0':'10px') + ';cursor:pointer" onclick="S.prBoardCollapsed=!S.prBoardCollapsed;R()">' +
'<div style="font-size:10px;font-weight:700;letter-spacing:2px;color:var(--amber)">&#127942; PERSONAL RECORDS</div>' +
'<span style="font-size:14px;color:var(--m2)">' + (collapsed?'&#9663;':'&#9650;') + '</span>' +
'</div>' +
(!collapsed ?
'<div style="display:flex;flex-direction:column;gap:6px">' +
prs.slice(0, S.prShowAll ? prs.length : Math.min(5, prs.length)).map(function(pr) {
return '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.04)">' +
'<div style="font-size:12px;font-weight:600;color:#fff">' + pr.exName + '</div>' +
'<div style="text-align:right"><div style="font-size:13px;font-weight:800;color:var(--amber)">' + pr.weight + S.unit + ' &times; ' + pr.reps + '</div>' +
'<div style="font-size:9px;color:var(--m2)">~' + Math.round(pr.est||0) + S.unit + ' 1RM</div></div></div>';
}).join('') +
(prs.length > 5 ? '<button onclick="S.prShowAll=!S.prShowAll;R()" style="font-size:11px;color:var(--m1);background:none;border:none;cursor:pointer;padding:4px 0">' + (S.prShowAll?'Show less &#9650;':'See all '+prs.length+' records &#9660;') + '</button>' : '') +
'</div>' : '') +
'</div>';
}

function buildCliProgData() {
return buildProgData(S.logs, S.cid);
}
function renderProgressSection() {
var pd = buildCliProgData();
if (!pd.length) return '<div style="padding:12px 0;font-size:12px;color:var(--m2)">Log sessions to see weight progression.</div>';
var showing = S.progShowAll ? pd.length : Math.min(3, pd.length);
return '<div style="margin-bottom:14px">' +
'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">' +
'<div style="font-size:10px;font-weight:700;letter-spacing:2px;color:var(--m2)">WEIGHT PROGRESSION</div>' +
(pd.length > 3 ? '<button onclick="S.progShowAll=!S.progShowAll;R()" style="font-size:11px;color:var(--acc);background:none;border:none;cursor:pointer">' + (S.progShowAll?'Show less':'See all '+pd.length+' &#9660;') + '</button>' : '') +
'</div>' +
pd.slice(0, showing).map(function(p){ return renderPBar(p, S.unit); }).join('') +
'</div>';
}

function renderMeasurementsSummary() {
var entries = DB.get('measurements_'+S.cid) || [];
var latest = entries[entries.length-1];
if (!latest) {
return '<div style="background:var(--c1);border:1px solid var(--bdr);border-radius:12px;padding:12px;margin-bottom:14px;cursor:pointer" onclick="openLogMeasurements()">' +
'<div style="font-size:10px;font-weight:700;letter-spacing:2px;color:var(--m2);margin-bottom:4px">MEASUREMENTS</div>' +
'<div style="font-size:12px;color:var(--m1)">Tap to log your first measurements</div>' +
'</div>';
}
var fields = [{k:'weight',l:'Weight'},{k:'waist',l:'Waist'},{k:'chest',l:'Chest'}];
return '<div style="background:var(--c1);border:1px solid var(--bdr);border-radius:12px;padding:12px;margin-bottom:14px">' +
'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
'<div style="font-size:10px;font-weight:700;letter-spacing:2px;color:var(--m2)">MEASUREMENTS</div>' +
'<button onclick="openLogMeasurements()" style="font-size:11px;color:var(--acc);background:none;border:none;cursor:pointer">+ Log</button>' +
'</div>' +
'<div style="display:flex;gap:8px">' +
fields.map(function(f) {
var v = latest[f.k];
return v ? '<div style="flex:1;text-align:center;background:var(--c2);border-radius:8px;padding:8px">' +
'<div style="font-size:16px;font-weight:800;color:#fff">' + v + '</div>' +
'<div style="font-size:9px;color:var(--m2)">' + f.l + '</div></div>' : '';
}).join('') +
'</div><div style="font-size:10px;color:var(--m2);margin-top:8px;text-align:right">' + fmtD(latest.date) + '</div></div>';
}

function renderHistorySummary() {
var ss = buildHistoryMap();
var entries = Object.entries(ss).reverse();
if (!entries.length) return '';
var showing = S.histShowAll ? entries.length : Math.min(3, entries.length);
return '<div>' +
'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">' +
'<div style="font-size:10px;font-weight:700;letter-spacing:2px;color:var(--m2)">HISTORY</div>' +
(entries.length > 3 ? '<button onclick="S.histShowAll=!S.histShowAll;R()" style="font-size:11px;color:var(--acc);background:none;border:none;cursor:pointer">' + (S.histShowAll?'Less':'See all '+entries.length+' &#9660;') + '</button>' : '') +
'</div>' +
entries.slice(0,showing).map(function(e) {
var s = e[1];
var prog = getProg(), dn = parseInt((s.d||'d0').replace('d','')), di = prog&&prog.days?prog.days[dn]:null;
var sn = S.sN[s.w+'_'+s.d];
return '<div class="card"><div class="card-p" style="padding:10px 12px">' +
'<div style="display:flex;justify-content:space-between;align-items:center">' +
'<div><div style="font-size:13px;font-weight:700;color:#fff">' + (di?di.title||di.name:'Session') + '</div>' +
'<div style="font-size:10px;color:var(--m1)">Wk' + (s.w||'').replace('w','') + ' &bull; ' + s.sets + ' sets</div></div>' +
'</div>' +
(sn&&sn.trainer?'<div style="font-size:10px;color:var(--m1);padding:5px 0;border-top:1px solid var(--bdr);margin-top:6px">Ahmed: ' + sn.trainer.substring(0,60) + (sn.trainer.length>60?'...':'') + '</div>':'') +
'</div></div>';
}).join('') + '</div>';
}

function buildHistoryMap() {
var ss = {};
Object.keys(S.logs).forEach(function(k) {
var l=S.logs[k]; if(!l||!l.done)return;
var p=k.split('_'); if(p.length<3)return;
var k2=p[0]+'_'+p[1];
if(!ss[k2])ss[k2]={w:p[0],d:p[1],sets:0,exs:{}};
ss[k2].sets++;ss[k2].exs[p[2]]=1;
});
return ss;
}

function renderHistLog() {
var ss={};
Object.keys(S.logs).forEach(function(k){
var l=S.logs[k]; if(!l||!l.done)return;
var p=k.split('_'), k2=p[0]+'_'+p[1];
if(!ss[k2])ss[k2]={w:p[0],d:p[1],sets:0,exs:{}};
ss[k2].sets++; ss[k2].exs[p[2]]=1;
});
var entries=Object.entries(ss);
if(!entries.length)return'';
return '<div class="sect">📋 HISTORY</div>'+entries.reverse().slice(0,8).map(function(e){
var s=e[1];
var dn=parseInt(s.d.replace('d','')), wn=parseInt(s.w.replace('w',''));
var prog=getProg(), di=prog&&prog.days?prog.days[dn]:null;
var sn=S.sN[s.w+'_'+s.d];
return '<div class="card"><div class="card-p">' +
'<div style="display:flex;justify-content:space-between;margin-bottom:6px">' +
'<div style="font-weight:700;font-size:13px;color:#fff">'+(di?di.title:'Session')+'</div>' +
'<div style="text-align:right"><div style="font-size:11px;font-weight:700;color:'+(di?di.accent||'var(--acc)':'var(--acc)')+'">Week '+wn+'</div>' +
'<div style="font-size:10px;color:var(--m1)">'+s.sets+' sets - '+Object.keys(s.exs).length+' exercises</div></div></div>' +
(sn&&sn.client?'<div style="font-size:11px;color:var(--m1);padding:5px 8px;background:rgba(16,185,129,.05);border-radius:7px;border-left:2px solid var(--green)">"'+sn.client+'"</div>':'') +
(sn&&sn.trainer?'<div style="font-size:11px;color:var(--m1);padding:5px 8px;background:rgba(99,102,241,.05);border-radius:7px;border-left:2px solid var(--acc);margin-top:4px">Ahmed: '+sn.trainer+'</div>':'') +
'</div></div>';
}).join('');
}

function renderMySess() {
var tc=DB.get('tc')||{};
var c=tc[S.cid]||{};
var isOnline=c.type==='online';
var now=new Date();
var dow=now.getDay();
var weekStartDate=new Date(now);
weekStartDate.setDate(now.getDate()-((dow+6)%7));
var sessObj=DB.get('sessions_'+S.cid)||{};
var allSessArr=Object.values(sessObj).sort(function(a,b){return(a.date||'').localeCompare(b.date||'');});
var upcoming=allSessArr.filter(function(s){return s.status==='upcoming';});
var done=allSessArr.filter(function(s){return s.status==='done';});
var days=getDays();
var todayStr=today();
var sessDateSet={};
for(var i=0;i<allSessArr.length;i++){if(allSessArr[i].date)sessDateSet[allSessArr[i].date]=true;}
var workoutWdMap={};
for(var di=0;di<days.length;di++){var wdsArr=days[di].weekdays||[];for(var wi=0;wi<wdsArr.length;wi++){workoutWdMap[wdsArr[wi]]={day:days[di],idx:di};}}
var DAY_LETTERS=['M','T','W','T','F','S','S'];
var weekStripHtml='<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:14px">';
for(var d=0;d<7;d++){
var cellDate=new Date(weekStartDate);
cellDate.setDate(weekStartDate.getDate()+d);
var cellDs=cellDate.toISOString().split('T')[0];
var isToday=cellDs===todayStr;
var cellWd=cellDate.getDay();
var hasSess=!!sessDateSet[cellDs];
var hasWk=!!(workoutWdMap[cellWd]);
var dotBg=hasSess?'#10b981':(hasWk&&isOnline?'#6366f1':'rgba(0,0,0,0)');
var cellClickable = (isOnline && hasWk) || (!isOnline && hasSess);
var cellClick = '';
if (isOnline && hasWk) { cellClick = ' onclick="openWorkoutDay('+workoutWdMap[cellWd].idx+')"'; }
else if (!isOnline && hasSess) { cellClick = ' onclick="S.cTab=\'sessions\';R()"'; }
weekStripHtml+='<div'+cellClick+' style="text-align:center;padding:7px 2px 8px;border-radius:10px;'+(cellClickable?'cursor:pointer;':'')+';background:'+(isToday?'rgba(99,102,241,.18)':'transparent')+';border:1.5px solid '+(isToday?'var(--acc)':cellClickable?'rgba(255,255,255,.1)':'transparent')+'">' +
'<div style="font-size:9px;color:'+(isToday?'var(--acc)':'var(--m2)')+';font-weight:700;margin-bottom:4px">'+DAY_LETTERS[d]+'</div>' +
'<div style="font-size:15px;font-weight:800;color:'+(isToday?'var(--acc)':'#fff')+';margin-bottom:5px">'+cellDate.getDate()+'</div>' +
'<div style="width:6px;height:6px;border-radius:50%;background:'+dotBg+';margin:0 auto"></div>' +
'</div>';
}
weekStripHtml+='</div>';
var legendHtml='<div style="display:flex;gap:12px;flex-wrap:wrap">';
if(!isOnline)legendHtml+='<div style="display:flex;align-items:center;gap:5px"><div style="width:7px;height:7px;border-radius:50%;background:#10b981"></div><span style="font-size:10px;color:var(--m2)">Session booked</span></div>';
if(isOnline&&days.length)legendHtml+='<div style="display:flex;align-items:center;gap:5px"><div style="width:7px;height:7px;border-radius:50%;background:#6366f1"></div><span style="font-size:10px;color:var(--m2)">Workout day</span></div>';
legendHtml+='<div style="display:flex;align-items:center;gap:5px"><div style="width:14px;height:14px;border-radius:4px;border:1.5px solid var(--acc)"></div><span style="font-size:10px;color:var(--m2)">Today</span></div>';
legendHtml+='</div>';
var html='<div class="hdr"><div class="hdr-top">' +
'<div><div class="hdr-sub">'+(isOnline?'Online Program':'In-Person')+'</div>' +
'<div class="hdr-title">My Schedule</div></div></div></div>' +
'<div class="page">' +
'<div style="background:var(--c1);border:1px solid var(--bdr);border-radius:16px;padding:16px;margin-bottom:14px">' +
'<div style="font-size:10px;font-weight:700;letter-spacing:1.5px;color:var(--m2);margin-bottom:12px">' +
now.toLocaleDateString('en-GB',{month:'long',year:'numeric'}).toUpperCase()+' &mdash; THIS WEEK</div>' +
weekStripHtml+legendHtml+'</div>';
if(isOnline){html+=_renderOnlineSchedList(days,todayStr,workoutWdMap,now,upcoming,done);html+=_renderAIReminder();}
else{html+=_renderInPersonSessions(upcoming,done,now);}
html+='</div>'+cliNav();
return html;
}

function _renderOnlineSchedList(days,todayStr,workoutWdMap,now,upcoming,done){
upcoming=upcoming||[]; done=done||[];
var sessDateMap={};
for(var si=0;si<upcoming.length;si++){var sv=upcoming[si];if(sv.date)sessDateMap[sv.date]=sv;}
var noProg=!days.length;
var out='';
if(upcoming.length){
out+='<div style="font-size:10px;font-weight:700;letter-spacing:2px;color:var(--m2);margin-bottom:10px">UPCOMING CALLS / SESSIONS</div>';
for(var ui=0;ui<upcoming.length;ui++){
var us=upcoming[ui];
var msUntil=new Date(us.date+'T12:00:00')-now;
var daysUntil=Math.round(msUntil/86400000);
var when=daysUntil<=0?'Today':daysUntil===1?'Tomorrow':'In '+daysUntil+' days';
var whenColor=daysUntil<=0?'var(--green)':daysUntil<=1?'var(--green)':daysUntil<=3?'var(--amber)':'var(--m2)';
var isCall=us.callType==='weekly_call';
var sessIcon=isCall?'&#128222;':'&#127947;';
var sessLabel=isCall?'Weekly Call':'In-Person Session';
out+='<div style="background:var(--c1);border:1px solid var(--bdr);border-left:3px solid '+(isCall?'#6366f1':'#10b981')+';border-radius:0 14px 14px 0;padding:14px 16px;margin-bottom:8px">' +
'<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
'<div>' +
'<div style="font-size:9px;color:'+whenColor+';font-weight:800;letter-spacing:1.5px;margin-bottom:5px">'+when.toUpperCase()+'</div>' +
'<div style="font-size:20px;font-weight:900;color:#fff;letter-spacing:-.5px;margin-bottom:3px">'+fmtD(us.date)+'</div>' +
'<div style="font-size:12px;color:var(--m1)">'+(us.time||'Time TBD')+' &bull; '+sessLabel+'</div>' +
(us.topics?'<div style="margin-top:6px;font-size:11px;color:var(--m2);background:rgba(99,102,241,.08);border:1px solid rgba(99,102,241,.2);border-radius:8px;padding:6px 10px">'+us.topics+'</div>':'')+
(us.note&&!us.topics?'<div style="font-size:11px;color:var(--m2);margin-top:4px">'+us.note+'</div>':'')+
'</div>' +
'<div style="width:46px;height:46px;border-radius:13px;background:'+(isCall?'rgba(99,102,241,.12)':'rgba(16,185,129,.12)')+';display:flex;align-items:center;justify-content:center;font-size:24px">'+sessIcon+'</div>' +
'</div></div>';
}
}
if(noProg&&!upcoming.length){
return '<div style="text-align:center;padding:26px 20px;background:var(--c1);border:1px solid var(--bdr);border-radius:14px;margin-bottom:12px">' +
'<div style="font-size:36px;margin-bottom:8px">&#128197;</div>' +
'<div style="font-size:15px;font-weight:700;color:#fff;margin-bottom:6px">No program assigned yet</div>' +
'<div style="font-size:12px;color:var(--m1)">Your trainer will set up your online training plan.</div></div>';
}
if(!noProg){
out+='<div style="font-size:10px;font-weight:700;letter-spacing:2px;color:var(--m2);margin-bottom:10px;margin-top:'+(upcoming.length?'14px':'0')+'">NEXT 7 DAYS</div>';
for(var i=0;i<7;i++){
var dt=new Date(now);
dt.setDate(now.getDate()+i);
var ds=dt.toISOString().split('T')[0];
var wd=dt.getDay();
var isToday=ds===todayStr;
var entry=workoutWdMap[wd]||null;
var isWorkout=!!entry;
var bg=isToday&&isWorkout?'rgba(99,102,241,.12)':'var(--c1)';
var bdr=isToday?'1px solid rgba(99,102,241,.4)':'1px solid var(--bdr)';
var icon=isWorkout?'&#128170;':'&#128564;';
var label=isWorkout?(entry.day.title||entry.day.name||'Workout'):'Rest Day';
var labelColor=isWorkout?'#fff':'var(--m2)';
var dayLabel=isToday?'Today':dt.toLocaleDateString('en-GB',{weekday:'long'});
var dateLabel=dt.toLocaleDateString('en-GB',{day:'numeric',month:'short'});
var exCount=(isWorkout&&entry.day.ex)?entry.day.ex.length:0;
var clickAttr=isWorkout?' onclick="selDay('+entry.idx+')"':'';
out+='<div'+clickAttr+' style="display:flex;align-items:center;gap:12px;padding:12px 14px;background:'+bg+';border:'+bdr+';border-radius:12px;margin-bottom:6px;'+(isWorkout?'cursor:pointer':'')+'">' +
'<div style="width:42px;height:42px;border-radius:11px;background:'+(isWorkout?'rgba(99,102,241,.15)':'rgba(255,255,255,.04)')+';display:flex;align-items:center;justify-content:center;font-size:20px">'+icon+'</div>' +
'<div style="flex:1">' +
'<div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">' +
'<div style="font-size:14px;font-weight:'+(isWorkout?'800':'600')+';color:'+labelColor+'">'+label+'</div>' +
(isToday?'<span style="font-size:8px;background:var(--acc);color:#fff;padding:2px 6px;border-radius:5px;font-weight:800;letter-spacing:.5px">TODAY</span>':'')+
'</div>' +
'<div style="font-size:11px;color:var(--m2)">'+dayLabel+' &bull; '+dateLabel+'</div>' +
(exCount?'<div style="font-size:10px;color:var(--acc);margin-top:2px">'+exCount+' exercise'+(exCount===1?'':'s')+'</div>':'')+
'</div>' +
(isWorkout?'<div style="font-size:14px;color:var(--acc)">&#8594;</div>':'')+
'</div>';
}
}
return out;
}

function _renderAIReminder(){
var goals=DB.get('goals_'+S.cid)||[];
var hd=DB.get('habits_'+S.cid)||{list:[],logs:{}};
var list=hd.list||[];
var todayLogs=((hd.logs||{})[today()])||[];
var activeGoals=goals.filter(function(g){return !g.achieved;});
var undone=list.filter(function(h){return todayLogs.indexOf(h.id)<0;});
var streak=(S.streak&&S.streak.cur)||0;
var lines=[];
if(streak>=21){lines.push('&#128293; <strong>'+streak+'-day streak.</strong> You\'re in the top 1% of people who show up consistently. Protect it today.');}
else if(streak>=7){lines.push('&#128293; <strong>'+streak+' days straight.</strong> One week of consistency is where habits are born. Keep going.');}
else if(streak>=3){lines.push('&#9889; <strong>'+streak+' in a row.</strong> The momentum is building &mdash; don\'t break the chain today.');}
if(list.length>0){
var doneCnt=list.length-undone.length;
if(undone.length===0){lines.push('&#9989; All '+list.length+' habit'+(list.length===1?'':'s')+' ticked off today &mdash; that\'s what elite consistency looks like.');}
else{lines.push('&#128203; '+doneCnt+'/'+list.length+' habits done. Still to go: '+undone.slice(0,2).map(function(h){return h.icon+' '+h.name;}).join(', ')+(undone.length>2?' &amp; more':'')+'. Finish strong.');}
}
if(activeGoals.length){lines.push('&#127919; Working towards: <em>'+activeGoals[0].text+'</em>. Every session is a step closer. Don\'t let today be a step back.');}
if(!lines.length){lines.push('&#128170; Stay consistent with your program. Small daily efforts compound into the results you\'re chasing.');}
return '<div style="background:linear-gradient(135deg,rgba(99,102,241,.1),rgba(236,72,153,.06));border:1px solid rgba(99,102,241,.25);border-radius:16px;padding:16px;margin-top:6px">' +
'<div style="font-size:9px;font-weight:700;letter-spacing:1.5px;color:var(--acc);margin-bottom:10px">&#129504; COACH AI &bull; DAILY INSIGHT</div>' +
'<div style="display:flex;flex-direction:column;gap:7px">' +
lines.map(function(line){return '<div style="font-size:12px;color:var(--m1);line-height:1.7;padding:9px 11px;background:rgba(255,255,255,.03);border-radius:9px">'+line+'</div>';}).join('')+
'</div></div>';
}

function _renderInPersonSessions(upcoming,done,now){
var tc=DB.get('tc')||{};
var c=tc[S.cid]||{};
var balance=c.balance||0;
var totalSessions=done.length+upcoming.length;
var summaryHtml='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">' +
'<div style="background:var(--c1);border:1px solid var(--bdr);border-radius:12px;padding:12px;text-align:center">' +
'<div style="font-size:28px;font-weight:900;color:var(--green)">'+done.length+'</div>' +
'<div style="font-size:10px;color:var(--m2);margin-top:3px;letter-spacing:.5px">SESSIONS DONE</div>' +
'</div>' +
'<div style="background:var(--c1);border:1px solid var(--bdr);border-radius:12px;padding:12px;text-align:center">' +
'<div style="font-size:28px;font-weight:900;color:'+(balance<=0?'var(--amber)':'#818cf8')+'">'+Math.max(0,balance)+'</div>' +
'<div style="font-size:10px;color:var(--m2);margin-top:3px;letter-spacing:.5px">SESSIONS LEFT</div>' +
'</div>' +
'</div>';
if(!upcoming.length&&!done.length){
return summaryHtml+'<div style="text-align:center;padding:30px 20px;background:var(--c1);border:1px solid var(--bdr);border-radius:14px;margin-bottom:12px">' +
'<div style="font-size:40px;margin-bottom:10px">&#128197;</div>' +
'<div style="font-size:16px;font-weight:700;color:#fff;margin-bottom:6px">No sessions booked yet</div>' +
'<div style="font-size:12px;color:var(--m1)">Your trainer will book your sessions. Check back soon.</div></div>';
}
var out=summaryHtml;
if(upcoming.length){
out+='<div style="font-size:10px;font-weight:700;letter-spacing:2px;color:var(--m2);margin-bottom:10px">UPCOMING SESSIONS</div>';
for(var i=0;i<upcoming.length;i++){
var s=upcoming[i];
var msUntil=new Date(s.date+'T12:00:00')-now;
var daysUntil=Math.round(msUntil/86400000);
var when=daysUntil<=0?'Today':daysUntil===1?'Tomorrow':'In '+daysUntil+' days';
var whenColor=daysUntil<=0?'var(--green)':daysUntil<=1?'var(--green)':daysUntil<=3?'var(--amber)':'var(--m2)';
out+='<div style="background:var(--c1);border:1px solid var(--bdr);border-left:3px solid #10b981;border-radius:0 14px 14px 0;padding:14px 16px;margin-bottom:8px">' +
'<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
'<div>' +
'<div style="font-size:9px;color:'+whenColor+';font-weight:800;letter-spacing:1.5px;margin-bottom:5px">'+when.toUpperCase()+'</div>' +
'<div style="font-size:20px;font-weight:900;color:#fff;letter-spacing:-.5px;margin-bottom:3px">'+fmtD(s.date)+'</div>' +
'<div style="font-size:12px;color:var(--m1)">'+(s.time||'Time TBD')+(s.note?' &bull; '+s.note:'')+'</div>' +
(s.workoutName?'<div style="margin-top:6px;display:inline-flex;align-items:center;gap:5px;padding:3px 9px;background:rgba(99,102,241,.12);border:1px solid rgba(99,102,241,.25);border-radius:8px"><span style="font-size:11px">&#128170;</span><span style="font-size:11px;font-weight:700;color:#818cf8">'+s.workoutName+'</span></div>':'')+
'</div>' +
'<div style="width:46px;height:46px;border-radius:13px;background:rgba(16,185,129,.12);display:flex;align-items:center;justify-content:center;font-size:24px">&#127947;</div>' +
'</div></div>';
}
}
if(done.length){
out+='<div style="font-size:10px;font-weight:700;letter-spacing:2px;color:var(--m2);margin-bottom:8px;margin-top:6px">COMPLETED ('+done.length+')</div>';
out+='<div style="background:var(--c1);border:1px solid var(--bdr);border-radius:12px;overflow:hidden">';
for(var j=0;j<Math.min(done.length,5);j++){
var ds=done[j];
var notLast=j<Math.min(done.length,5)-1;
out+='<div style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-bottom:'+(notLast?'1px solid var(--bdr)':'none')+';opacity:.65">' +
'<div style="width:32px;height:32px;border-radius:8px;background:rgba(16,185,129,.08);display:flex;align-items:center;justify-content:center;font-size:14px">&#9989;</div>' +
'<div style="flex:1"><div style="font-size:13px;font-weight:600;color:var(--m1)">'+fmtD(ds.date)+'</div>' +
(ds.note?'<div style="font-size:10px;color:var(--m2)">'+ds.note+'</div>':'')+
'</div></div>';
}
out+='</div>';
}
return out;
}

function renderMyAcct() {
if (S.confirmDelete) {
return '<div class="hdr"><div class="hdr-top">' +
'<div><div class="hdr-sub">My Account</div><div class="hdr-title">Delete Account</div></div></div></div>' +
'<div class="page" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;gap:16px;text-align:center">' +
'<div style="font-size:48px">⚠️</div>' +
'<div style="font-size:18px;font-weight:800;color:#fff">Delete your account?</div>' +
'<div style="font-size:13px;color:var(--m1);max-width:280px">This will permanently delete all your data including training logs, sessions, and messages. This cannot be undone.</div>' +
'<button class="btn" style="background:#ef4444;max-width:280px" onclick="confirmDeleteMyAccount()">YES, DELETE MY ACCOUNT</button>' +
'<button class="btn" style="background:var(--card);max-width:280px" onclick="cancelDeleteMyAccount()">Cancel</button>' +
'</div>' + cliNav();
}
return '<div class="hdr"><div class="hdr-top">' +
'<div><div class="hdr-sub">My Account</div><div class="hdr-title">Account</div></div></div></div>' +
'<div class="page" id="acct_page"><div class="big-bal">' +
'<div style="font-size:10px;color:var(--m1);letter-spacing:2px;margin-bottom:8px">SESSIONS REMAINING</div>' +
'<div id="bal_num" style="font-size:70px;font-weight:900;line-height:1;color:var(--green)">-</div>' +
'<div id="bal_msg" style="font-size:12px;color:var(--m1);margin-top:8px">Loading…</div></div>' +
'<div id="next_sess"></div>' +
'<div class="sect">PAYMENT RECEIPTS</div>' +
'<div id="pay_list"><div class="empty">Loading…</div></div>' +
'<div style="padding:20px 0 8px;text-align:center">' +
'<button onclick="deleteMyAccount()" style="background:none;border:none;color:#ef4444;font-size:12px;cursor:pointer;padding:8px 16px;opacity:0.7">Delete Account</button>' +
'</div>' +
'</div>' + cliNav();
}
function renderMyAcctData() {
var balEl=document.getElementById('bal_num');
var msgEl=document.getElementById('bal_msg');
var nextEl=document.getElementById('next_sess');
var payEl=document.getElementById('pay_list');
var trainerClients=DB.get('tc')||{};
var clientData=trainerClients[S.cid]||{};
var bal=clientData.balance||0;
if(balEl){balEl.textContent=bal;balEl.style.color=bal===0?'var(--red)':bal<=2?'var(--amber)':'var(--green)';}
if(msgEl){
if(bal===0)msgEl.textContent='No sessions left - please arrange payment with Ahmed';
else if(bal<=2)msgEl.textContent='Only '+bal+' session'+(bal===1?'':'s')+' left - time to top up';
else msgEl.textContent='You have '+bal+' session'+(bal===1?'':'s')+' with Ahmed';
}
var sessions=Object.values(DB.get('sessions_'+S.cid)||{}).filter(function(s){return s.status==='upcoming';}).sort(function(a,b){return(a.date||'').localeCompare(b.date||'');});
if(nextEl&&sessions.length>0){var s=sessions[0];nextEl.innerHTML='<div style="padding:13px;background:rgba(236,72,153,.06);border:1px solid rgba(236,72,153,.15);border-radius:13px;text-align:center;margin-bottom:14px"><div style="font-size:10px;color:var(--pink);font-weight:700;letter-spacing:1px;margin-bottom:6px">NEXT SESSION</div><div style="font-size:20px;font-weight:800;color:#fff">'+fmtD(s.date)+(s.time?' at '+s.time:'')+'</div><div style="font-size:12px;color:var(--m1);margin-top:4px">'+(s.type==='online'?'Online':'In Person')+(s.note?' - '+s.note:'')+'</div></div>';}
var pays=Object.values(DB.get('payments_'+S.cid)||{}).sort(function(a,b){return b.ts-a.ts;});
if(payEl){
if(!pays.length){payEl.innerHTML='<div class="empty">No payment receipts yet.</div>';}
else payEl.innerHTML='<div class="card"><div class="card-p">'+pays.map(function(p){
return '<div class="pay-row"><div><div style="font-size:14px;font-weight:800;color:var(--green)">+'+p.sessions+' session'+(p.sessions===1?'':'s')+' added</div><div class="pay-info">'+fmtD(p.date)+(p.note?' - '+p.note:'')+'</div></div></div>';
}).join('')+'</div></div>';
}
}

function renderMsgs() {
readMsgs(S.cid,'client');
return '<div class="hdr"><div class="hdr-top">' +
'<div><div class="hdr-sub">Messages</div><div class="hdr-title">Ahmed</div></div></div></div>' +
'<div class="page">' +
'<div class="chat-wrap" id="msgList">' +
(S.msgs.length===0?'<div class="empty">No messages yet.<br>Ahmed&#39;s replies appear here.</div>':'') +
S.msgs.map(function(m){
var isMe=m.from==='client';
return '<div class="chat-msg '+(isMe?'from-me':'from-them')+'">' +
'<div class="bubble">'+m.text+'</div>' +
'<div class="chat-ts">'+(isMe?'You':'Ahmed')+' - '+fmtT(m.ts)+'</div></div>';
}).join('')+'</div>' +
'<div class="chat-bar">' +
'<textarea class="chat-ta" id="cl_msg" placeholder="Message Ahmed..." rows="1"></textarea>' +
'<button class="chat-send" onclick="doCliMsg()">➤</button></div>' +
'</div>' + cliNav();
}
function doCliMsg(){var ta=document.getElementById('cl_msg');if(!ta||!ta.value.trim())return;sendMsg(ta.value,'client',null);ta.value='';R();}

function setWk(w){S.week=w;S.aSet=null;var cp=DB.get('cp_'+S.cid)||{};cp.week=w;DB.set('cp_'+S.cid,cp);R();}
function setUnit(u){S.unit=u;var cp=DB.get('cp_'+S.cid)||{};cp.unit=u;DB.set('cp_'+S.cid,cp);R();}
function selDay(i){S.day=i;S.aSet=null;S.cTab='workout';R();}
function togNote(ei){S.xNote=(S.xNote===ei?-1:ei);R();}
function togAlt(ei){S.xAlt=(S.xAlt===ei?-1:ei);R();}
function doSwap(ei,idx){S.swaps[S.day+'_'+ei]=idx;S.xAlt=-1;R();}
function openSet(ei,si){
if(S.aSet&&S.aSet.ei===ei&&S.aSet.si===si){S.aSet=null;S.rpe=null;}
else{S.aSet={ei:ei,si:si};var lg=getL(S.week,S.day,ei,si);S.rpe=lg?lg.rpe:null;}
R();
setTimeout(function(){var el=document.getElementById('exc_'+ei);if(el){var lp=el.querySelector('.lpanel');if(lp)lp.scrollIntoView({behavior:'smooth',block:'nearest'});}},60);
}
function openYT(n){window.open('https://www.youtube.com/results?search_query='+encodeURIComponent(n+' exercise form tutorial'),'_blank');}
function doLog(ei,si){
var w=(document.getElementById('inp_w')||{}).value;
var r=(document.getElementById('inp_r')||{}).value;
var wasAlreadyDone=!!(getL(S.week,S.day,ei,si)||{}).done;
saveLog(ei,si,w,r,S.rpe);
S.aSet=null;S.rpe=null;
var d=getDay();
var ex=getEx(ei);
if(ex&&ex.rest&&!wasAlreadyDone)startRest(ex.rest);
var sc=d&&d.ex[ei]?d.ex[ei].sets||3:3;
var pr=sessP();
if(!wasAlreadyDone&&pr.total>0&&pr.done>=pr.total){
stopRest();
S.scr='complete';
R();
return;
}
R();
if(!wasAlreadyDone&&!S.newPR&&si+1<sc)setTimeout(function(){S.aSet={ei:ei,si:si+1};S.rpe=null;R();},150);
}
function doClear(ei,si){delLog(ei,si);S.aSet=null;S.rpe=null;R();}
function doExNote(ei){var ta=document.getElementById('exn_'+ei);if(!ta)return;saveExNote(ei,ta.value,'client');R();}
function doSessNote(){var ta=document.getElementById('sn_inp');if(!ta)return;saveSessNote(ta.value,'client');var b=ta.nextElementSibling;if(b){b.textContent='Saved!';setTimeout(function(){b.textContent='Save ✓';},2000);}}


// ===== NUTRITION HELPERS =====
function getNutrDate(){return S.nutriDate||today();}
function getNutriData(cid,date){
var all=DB.get('nutrition_'+(cid||S.cid))||{};
var d=all[date||getNutrDate()];
if(!d)d={meals:{breakfast:[],lunch:[],dinner:[],snacks:[]},water:0};
if(!d.meals)d.meals={breakfast:[],lunch:[],dinner:[],snacks:[]};
return d;
}
function saveNutriData(data){
var all=DB.get('nutrition_'+S.cid)||{};
all[getNutrDate()]=data;
DB.set('nutrition_'+S.cid,all);
}
function getMacroTargets(){
var bio=DB.get('bio_'+S.cid)||{};
return bio.macros||{calories:2000,protein:150,carbs:220,fat:65};
}
function calcNutrTotals(data){
var t={calories:0,protein:0,carbs:0,fat:0};
var types=['breakfast','lunch','dinner','snacks'];
for(var mi=0;mi<types.length;mi++){
var items=data.meals[types[mi]]||[];
for(var ii=0;ii<items.length;ii++){
t.calories+=items[ii].calories||0;t.protein+=items[ii].protein||0;
t.carbs+=items[ii].carbs||0;t.fat+=items[ii].fat||0;
}
}
return t;
}


// ===== NUTRITION UI HELPERS =====
function renderCalRing(done,target,color){
var pct=target>0?Math.min(done/target,1):0;
var r=54,cx=64,cy=64,circ=2*Math.PI*r;
var dash=circ*pct,gap=circ-dash;
return '<svg width="128" height="128" viewBox="0 0 128 128">'+
'<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="12"/>'+
'<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="'+color+'" stroke-width="12" stroke-dasharray="'+dash.toFixed(1)+' '+gap.toFixed(1)+'" stroke-dashoffset="'+(circ/4).toFixed(1)+'" stroke-linecap="round"/>'+
'<text x="'+cx+'" y="'+(cy-6)+'" text-anchor="middle" font-size="22" font-weight="900" fill="#fff">'+Math.round(done)+'</text>'+
'<text x="'+cx+'" y="'+(cy+12)+'" text-anchor="middle" font-size="10" fill="rgba(255,255,255,.5)">of '+target+'</text>'+
'<text x="'+cx+'" y="'+(cy+26)+'" text-anchor="middle" font-size="9" fill="'+color+'">kcal</text>'+
'</svg>';
}
function renderMacroBar(name,done,target,color){
var pct=target>0?Math.min(done/target*100,100):0;
return '<div style="margin-bottom:10px">'+
'<div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:4px">'+
'<span style="font-weight:700;color:'+color+'">'+name+'</span>'+
'<span style="color:var(--m1)">'+Math.round(done)+'g / '+target+'g</span></div>'+
'<div style="height:6px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden">'+
'<div style="height:100%;width:'+pct+'%;background:'+color+';border-radius:3px"></div></div></div>';
}
function renderWaterDots(water){
var h='<div style="display:flex;gap:5px;flex-wrap:wrap;justify-content:center">';
for(var i=0;i<8;i++){
var filled=i<water;
h+='<div onclick="doLogWater('+(i+1)+')" style="width:32px;height:40px;border-radius:6px 6px 10px 10px;border:2px solid '+(filled?'var(--blue)':'rgba(255,255,255,.15)')+';background:'+(filled?'rgba(99,102,241,.25)':'transparent')+';cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px">'+(filled?'&#128167;':'')+'</div>';
}
return h+'</div>';
}
function doLogWater(glasses){
var data=getNutriData(null,getNutrDate());
data.water=glasses;saveNutriData(data);
toast(glasses+' glasses logged','ok');R();
}


// ===== FOOD LOGGING =====
function renderMealSection(meal,items){
var labels={breakfast:'&#9728; Breakfast',lunch:'&#127860; Lunch',dinner:'&#127762; Dinner',snacks:'&#127830; Snacks'};
var mealCals=0;
for(var i=0;i<items.length;i++)mealCals+=items[i].calories||0;
return '<div style="margin-bottom:14px">'+
'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'+
'<div style="font-size:11px;font-weight:700;letter-spacing:1px;color:var(--m1)">'+labels[meal]+'</div>'+
'<div style="display:flex;align-items:center;gap:8px">'+
(mealCals>0?'<span style="font-size:10px;color:var(--m2)">'+mealCals+' kcal</span>':'')+
'<button onclick="openAddFood(\''+meal+'\')" style="padding:3px 8px;background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.2);border-radius:7px;color:var(--green);font-size:10px;font-weight:700;cursor:pointer">+ Add</button>'+
'</div></div>'+
(items.length===0?'<div style="font-size:11px;color:var(--m2);padding:6px 0">Nothing logged yet</div>':
items.map(function(item,idx){
return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;background:var(--c1);border:1px solid var(--bdr);border-radius:9px;margin-bottom:5px">'+
'<div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+item.name+'</div>'+
'<div style="font-size:10px;color:var(--m2);margin-top:1px">'+item.calories+'kcal &#183; P:'+item.protein+'g C:'+item.carbs+'g F:'+item.fat+'g</div></div>'+
'<div style="display:flex;gap:4px;flex-shrink:0;margin-left:8px">'+
'<button onclick="openEditFood(\''+meal+'\','+idx+')" style="width:22px;height:22px;border-radius:6px;background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.2);color:#818cf8;font-size:11px;cursor:pointer">&#9998;</button>'+
'<button onclick="doDeleteFood(\''+meal+'\','+idx+')" style="width:22px;height:22px;border-radius:6px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.15);color:#f87171;font-size:12px;cursor:pointer">&#215;</button>'+
'</div>'+
'</div>';
}).join(''))+
'</div>';
}
function openAddFood(meal){
S.addFoodMeal=meal;
var labels={breakfast:'Breakfast',lunch:'Lunch',dinner:'Dinner',snacks:'Snacks'};
showModal('<div class="modal-bg" onclick="closeModal()"><div class="modal-box" onclick="event.stopPropagation()">'+
'<div class="modal-title">Add to '+(labels[meal]||meal)+' <button onclick="closeModal()" style="font-size:22px;color:var(--m1);cursor:pointer">&#215;</button></div>'+
'<div class="row"><div class="lbl">Food Name</div><input class="inp" id="af_name" placeholder="e.g. Chicken breast 150g"></div>'+
'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">'+
'<div><div class="lbl">Calories (kcal)</div><input class="inp" id="af_cal" type="number" inputmode="decimal" placeholder="250" style="margin-bottom:0"></div>'+
'<div><div class="lbl">Protein (g)</div><input class="inp" id="af_p" type="number" inputmode="decimal" placeholder="35" style="margin-bottom:0"></div>'+
'</div>'+
'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">'+
'<div><div class="lbl">Carbs (g)</div><input class="inp" id="af_c" type="number" inputmode="decimal" placeholder="0" style="margin-bottom:0"></div>'+
'<div><div class="lbl">Fat (g)</div><input class="inp" id="af_f" type="number" inputmode="decimal" placeholder="5" style="margin-bottom:0"></div>'+
'</div>'+
'<button class="btn btn-green" onclick="doAddFood()">ADD &#10003;</button>'+
'<button class="btn btn-ghost" onclick="closeModal()">Cancel</button>'+
'</div></div>');
setTimeout(function(){var el=document.getElementById('af_name');if(el)el.focus();},100);
}
function doAddFood(){
var name=((document.getElementById('af_name')||{}).value||'').trim();
var cal=parseFloat((document.getElementById('af_cal')||{}).value||'0')||0;
var p=parseFloat((document.getElementById('af_p')||{}).value||'0')||0;
var c=parseFloat((document.getElementById('af_c')||{}).value||'0')||0;
var f=parseFloat((document.getElementById('af_f')||{}).value||'0')||0;
if(!name){toast('Enter a food name','err');return;}
var data=getNutriData(null,getNutrDate());
var meal=S.addFoodMeal||'snacks';
if(!data.meals[meal])data.meals[meal]=[];
data.meals[meal].push({name:name,calories:cal,protein:p,carbs:c,fat:f,ts:Date.now()});
saveNutriData(data);
logActivity('food', (DB.get('cp_'+S.cid)||{}).name+' logged food: '+name+(cal?' ('+cal+' kcal)':''), 'nutrition');
closeModal();toast(name+' added','ok');R();
}
function doDeleteFood(meal,idx){
var data=getNutriData(null,getNutrDate());
if(data.meals[meal])data.meals[meal].splice(idx,1);
saveNutriData(data);R();
}
function openEditFood(meal,idx){
var data=getNutriData(null,getNutrDate());
var item=(data.meals[meal]||[])[idx];
if(!item){toast('Item not found','err');return;}
S.addFoodMeal=meal;
S._editFoodIdx=idx;
var labels={breakfast:'Breakfast',lunch:'Lunch',dinner:'Dinner',snacks:'Snacks'};
showModal('<div class="modal-bg" onclick="closeModal()"><div class="modal-box" onclick="event.stopPropagation()">'+
'<div class="modal-title">Edit '+(labels[meal]||meal)+' item <button onclick="closeModal()" style="font-size:22px;color:var(--m1);cursor:pointer">&#215;</button></div>'+
'<div class="row"><div class="lbl">Food Name</div><input class="inp" id="af_name" value="'+item.name+'" placeholder="e.g. Chicken breast 150g"></div>'+
'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">'+
'<div><div class="lbl">Calories (kcal)</div><input class="inp" id="af_cal" type="number" inputmode="decimal" value="'+(item.calories||0)+'" style="margin-bottom:0"></div>'+
'<div><div class="lbl">Protein (g)</div><input class="inp" id="af_p" type="number" inputmode="decimal" value="'+(item.protein||0)+'" style="margin-bottom:0"></div>'+
'</div>'+
'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">'+
'<div><div class="lbl">Carbs (g)</div><input class="inp" id="af_c" type="number" inputmode="decimal" value="'+(item.carbs||0)+'" style="margin-bottom:0"></div>'+
'<div><div class="lbl">Fat (g)</div><input class="inp" id="af_f" type="number" inputmode="decimal" value="'+(item.fat||0)+'" style="margin-bottom:0"></div>'+
'</div>'+
'<button class="btn btn-acc" onclick="doEditFood()">SAVE CHANGES &#10003;</button>'+
'<button class="btn btn-ghost" onclick="closeModal()">Cancel</button>'+
'</div></div>');
setTimeout(function(){var el=document.getElementById('af_name');if(el)el.focus();},100);
}
function doEditFood(){
var name=((document.getElementById('af_name')||{}).value||'').trim();
var cal=parseFloat((document.getElementById('af_cal')||{}).value||'0')||0;
var p=parseFloat((document.getElementById('af_p')||{}).value||'0')||0;
var c=parseFloat((document.getElementById('af_c')||{}).value||'0')||0;
var f=parseFloat((document.getElementById('af_f')||{}).value||'0')||0;
if(!name){toast('Enter a food name','err');return;}
var meal=S.addFoodMeal||'snacks';
var idx=S._editFoodIdx;
var data=getNutriData(null,getNutrDate());
if(!data.meals[meal]||idx===undefined||idx===null){toast('Could not find item','err');return;}
var old=data.meals[meal][idx]||{};
data.meals[meal][idx]={name:name,calories:cal,protein:p,carbs:c,fat:f,ts:old.ts||Date.now(),edited:Date.now()};
saveNutriData(data);
S._editFoodIdx=null;
closeModal();toast(name+' updated','ok');R();
}


// ===== RENDER NUTRITION PAGE =====
function renderNutrition(){
var date=getNutrDate();
var data=getNutriData(null,date);
var targets=getMacroTargets();
var totals=calcNutrTotals(data);
var prev=new Date(date+'T12:00:00');prev.setDate(prev.getDate()-1);
var prevStr=prev.toISOString().split('T')[0];
var next=new Date(date+'T12:00:00');next.setDate(next.getDate()+1);
var nextStr=next.toISOString().split('T')[0];
var isToday=date===today();
var coachNote=(DB.get('nutr_notes_'+S.cid)||{})[date]||'';
return '<div class="hdr"><div class="hdr-top">'+
'<div><div class="hdr-sub">Ahmed PT</div><div class="hdr-title">Nutrition</div></div>'+
'<button onclick="openMacroCalc()" style="padding:5px 10px;background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.2);border-radius:8px;color:var(--acc);font-size:10px;font-weight:700;cursor:pointer">&#128200; Targets</button>'+
'</div></div>'+
'<div class="page">'+
'<div style="display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:14px">'+
'<button onclick="S.nutriDate=\''+prevStr+'\';R()" style="width:30px;height:30px;border-radius:8px;background:var(--c2);border:1px solid var(--bdr);color:var(--m1);font-size:18px;cursor:pointer;line-height:1">&#8249;</button>'+
'<div style="text-align:center;min-width:120px"><div style="font-size:13px;font-weight:800;color:#fff">'+(isToday?'Today':fmtD(date))+'</div></div>'+
(!isToday?'<button onclick="S.nutriDate=\''+nextStr+'\';R()" style="width:30px;height:30px;border-radius:8px;background:var(--c2);border:1px solid var(--bdr);color:var(--m1);font-size:18px;cursor:pointer;line-height:1">&#8250;</button>':'<div style="width:30px"></div>')+
'</div>'+
'<div class="card"><div class="card-p">'+
'<div style="display:flex;align-items:center;gap:16px;margin-bottom:14px">'+
renderCalRing(totals.calories,targets.calories,'var(--green)')+
'<div style="flex:1">'+
renderMacroBar('Protein',totals.protein,targets.protein,'#818cf8')+
renderMacroBar('Carbs',totals.carbs,targets.carbs,'#34d399')+
renderMacroBar('Fat',totals.fat,targets.fat,'#f59e0b')+
'</div></div>'+
'<div style="border-top:1px solid var(--bdr);padding-top:12px">'+
'<div style="font-size:10px;font-weight:700;letter-spacing:1.5px;color:var(--m2);margin-bottom:8px">WATER</div>'+
renderWaterDots(data.water||0)+
'<div style="font-size:10px;color:var(--m2);text-align:center;margin-top:6px">'+(data.water||0)+' / 8 glasses</div>'+
'</div></div></div>'+
(coachNote?'<div style="padding:10px 14px;background:rgba(99,102,241,.06);border-left:3px solid var(--blue);border-radius:0 10px 10px 0;margin-bottom:14px">'+
'<div style="font-size:9px;font-weight:700;letter-spacing:1.5px;color:var(--blue);margin-bottom:4px">AHMED&#39;S NOTE</div>'+
'<div style="font-size:12px;color:var(--m1);line-height:1.6">'+coachNote+'</div></div>':'')+
'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">'+
'<button onclick="openDescribeFood(null)" style="display:flex;align-items:center;gap:8px;padding:12px;background:rgba(99,102,241,.08);border:1px dashed rgba(99,102,241,.3);border-radius:12px;color:var(--acc);font-size:12px;font-weight:700;cursor:pointer">'+
'<span style="font-size:20px">&#129302;</span><div style="text-align:left"><div>Describe Food</div><div style="font-size:9px;color:var(--m2);font-weight:400;margin-top:1px">AI estimates calories</div></div></button>'+
'<button onclick="openPhotoCalorie()" style="display:flex;align-items:center;gap:8px;padding:12px;background:rgba(16,185,129,.06);border:1px dashed rgba(16,185,129,.25);border-radius:12px;color:var(--green);font-size:12px;font-weight:700;cursor:pointer">'+
'<span style="font-size:20px">&#128248;</span><div style="text-align:left"><div>Photo Calories</div><div style="font-size:9px;color:var(--m2);font-weight:400;margin-top:1px">AI photo analysis</div></div></button>'+
'</div>'+
renderMealSection('breakfast',data.meals.breakfast||[])+
renderMealSection('lunch',data.meals.lunch||[])+
renderMealSection('dinner',data.meals.dinner||[])+
renderMealSection('snacks',data.meals.snacks||[])+
'</div>'+cliNav();
}


// ===== MACRO CALCULATOR =====
function openMacroCalc(){
var bio=DB.get('bio_'+S.cid)||{};
showModal('<div class="modal-bg" onclick="closeModal()"><div class="modal-box" onclick="event.stopPropagation()">'+
'<div class="modal-title">Macro Calculator <button onclick="closeModal()" style="font-size:22px;color:var(--m1);cursor:pointer">&#215;</button></div>'+
'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">'+
'<div><div class="lbl">Weight (kg)</div><input class="inp" id="mc_w" type="number" value="'+(bio.weight||'')+'" placeholder="80" inputmode="decimal" style="margin-bottom:0"></div>'+
'<div><div class="lbl">Height (cm)</div><input class="inp" id="mc_h" type="number" value="'+(bio.height||'')+'" placeholder="175" inputmode="numeric" style="margin-bottom:0"></div>'+
'</div>'+
'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">'+
'<div><div class="lbl">Age</div><input class="inp" id="mc_age" type="number" value="'+(bio.age||'')+'" placeholder="25" inputmode="numeric" style="margin-bottom:0"></div>'+
'<div><div class="lbl">Sex</div><select class="sel" id="mc_sex" style="margin-bottom:0">'+
'<option value="m"'+(bio.sex==="m"?" selected":"")+'>Male</option>'+
'<option value="f"'+(bio.sex==="f"?" selected":"")+'>Female</option>'+
'</select></div></div>'+
'<div class="row"><div class="lbl">Activity Level</div>'+
'<select class="sel" id="mc_act">'+
'<option value="1.2"'+(bio.activity==="1.2"?" selected":"")+'>Sedentary (no exercise)</option>'+
'<option value="1.375"'+(bio.activity==="1.375"?" selected":"")+'>Lightly active (1-3 days/wk)</option>'+
'<option value="1.55"'+(bio.activity==="1.55"?" selected":"")+'>Moderately active (3-5 days/wk)</option>'+
'<option value="1.725"'+(bio.activity==="1.725"?" selected":"")+'>Very active (6-7 days/wk)</option>'+
'</select></div>'+
'<div class="row"><div class="lbl">Goal</div>'+
'<select class="sel" id="mc_goal">'+
'<option value="cut"'+(bio.goal==="cut"?" selected":"")+'>Cut (lose fat, -300 kcal)</option>'+
'<option value="maintain"'+(bio.goal==="maintain"?" selected":"")+'>Maintain</option>'+
'<option value="bulk"'+(bio.goal==="bulk"?" selected":"")+'>Bulk (+300 kcal)</option>'+
'</select></div>'+
'<div id="mc_result"></div>'+
'<button class="btn btn-acc" onclick="doCalcMacros()">CALCULATE &#128200;</button>'+
'<button class="btn btn-ghost" onclick="closeModal()">Cancel</button>'+
'</div></div>');
}
function doCalcMacros(){
var w=parseFloat((document.getElementById('mc_w')||{}).value||'0');
var h=parseFloat((document.getElementById('mc_h')||{}).value||'0');
var age=parseInt((document.getElementById('mc_age')||{}).value||'0');
var sex=(document.getElementById('mc_sex')||{}).value||'m';
var act=parseFloat((document.getElementById('mc_act')||{}).value||'1.55');
var goal=(document.getElementById('mc_goal')||{}).value||'maintain';
if(!w||!h||!age){toast('Fill in all fields','err');return;}
var bmr=sex==='m'?(10*w+6.25*h-5*age+5):(10*w+6.25*h-5*age-161);
var tdee=Math.round(bmr*act);
var cals=goal==='cut'?tdee-300:goal==='bulk'?tdee+300:tdee;
var protein=Math.round(w*2.2);
var fat=Math.round(cals*0.25/9);
var carbs=Math.round((cals-protein*4-fat*9)/4);
if(carbs<0)carbs=0;
var bio=DB.get('bio_'+S.cid)||{};
bio.weight=w;bio.height=h;bio.age=age;bio.sex=sex;bio.activity=String(act);bio.goal=goal;
bio.macros={calories:cals,protein:protein,carbs:carbs,fat:fat};
DB.set('bio_'+S.cid,bio);
var res=document.getElementById('mc_result');
if(res){
res.innerHTML='<div style="background:var(--c2);border-radius:12px;padding:14px;margin-bottom:14px">'+
'<div style="text-align:center;margin-bottom:12px">'+
'<div style="font-size:11px;font-weight:700;letter-spacing:1.5px;color:var(--acc);margin-bottom:4px">YOUR DAILY TARGETS</div>'+
'<div style="font-size:32px;font-weight:900;color:#fff" id="mc_cals_disp">'+cals+'<span style="font-size:14px;color:var(--m1)"> kcal</span></div>'+
'<div style="font-size:10px;color:var(--m2)">TDEE '+tdee+' &#183; '+(goal==='cut'?'-300 cut':goal==='bulk'?'+300 bulk':'maintain')+'&nbsp;&mdash;&nbsp;adjust below to customise</div></div>'+
'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px">'+
'<div style="text-align:center;padding:10px 6px;background:rgba(129,140,248,.1);border-radius:10px">'+
'<input id="mc_adj_p" type="number" inputmode="decimal" value="'+protein+'" oninput="recalcMacroCals()" style="width:100%;background:none;border:none;font-size:20px;font-weight:900;color:#818cf8;text-align:center;padding:0">'+
'<div style="font-size:9px;color:var(--m2);margin-top:2px">PROTEIN (g)</div></div>'+
'<div style="text-align:center;padding:10px 6px;background:rgba(52,211,153,.1);border-radius:10px">'+
'<input id="mc_adj_c" type="number" inputmode="decimal" value="'+carbs+'" oninput="recalcMacroCals()" style="width:100%;background:none;border:none;font-size:20px;font-weight:900;color:#34d399;text-align:center;padding:0">'+
'<div style="font-size:9px;color:var(--m2);margin-top:2px">CARBS (g)</div></div>'+
'<div style="text-align:center;padding:10px 6px;background:rgba(245,158,11,.1);border-radius:10px">'+
'<input id="mc_adj_f" type="number" inputmode="decimal" value="'+fat+'" oninput="recalcMacroCals()" style="width:100%;background:none;border:none;font-size:20px;font-weight:900;color:var(--amber);text-align:center;padding:0">'+
'<div style="font-size:9px;color:var(--m2);margin-top:2px">FAT (g)</div></div>'+
'</div>'+
'<button class="btn btn-green" onclick="applyAdjMacros()" style="margin-top:4px">APPLY AS TARGET &#10003;</button>'+
'</div>';
}
}
function recalcMacroCals() {
var p=parseFloat((document.getElementById('mc_adj_p')||{}).value||'0')||0;
var c=parseFloat((document.getElementById('mc_adj_c')||{}).value||'0')||0;
var f=parseFloat((document.getElementById('mc_adj_f')||{}).value||'0')||0;
var total=Math.round(p*4+c*4+f*9);
var el=document.getElementById('mc_cals_disp');
if(el)el.innerHTML=total+'<span style="font-size:14px;color:var(--m1)"> kcal</span>';
}
function applyAdjMacros() {
var p=parseFloat((document.getElementById('mc_adj_p')||{}).value||'0')||0;
var c=parseFloat((document.getElementById('mc_adj_c')||{}).value||'0')||0;
var f=parseFloat((document.getElementById('mc_adj_f')||{}).value||'0')||0;
var cals=Math.round(p*4+c*4+f*9);
var bio=DB.get('bio_'+S.cid)||{};
bio.macros={calories:cals,protein:p,carbs:c,fat:f};
DB.set('bio_'+S.cid,bio);
closeModal();toast('Targets saved!','ok');R();
}


// ===== GOALS =====
function renderGoals(){
var goals=DB.get('goals_'+S.cid)||[];
var active=goals.filter(function(g){return !g.achieved;});
var achieved=goals.filter(function(g){return g.achieved;});
return '<div class="hdr"><div class="hdr-top">'+
'<div><div class="hdr-sub">My Goals</div><div class="hdr-title">Goals</div></div>'+
'<button onclick="openAddGoal()" class="btn-sm btn-acc">+ Goal</button>'+
'</div></div>'+
'<div class="page">'+
'<div class="sect" style="margin-top:0">ACTIVE GOALS</div>'+
(active.length===0?'<div class="empty">No active goals.<br>Set a goal and work towards it.</div>':
active.map(function(g){
return '<div style="background:var(--c1);border:1px solid var(--bdr);border-radius:12px;padding:12px;margin-bottom:8px">'+
'<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">'+
'<div style="flex:1"><div style="font-size:14px;font-weight:700;color:#fff;margin-bottom:3px">'+g.text+'</div>'+
(g.category?'<span class="pill p-blue" style="font-size:9px">'+g.category+'</span>':'')+
'<div style="font-size:10px;color:var(--m2);margin-top:4px">Set '+fmtD(g.date)+'</div></div>'+
'<div style="display:flex;gap:5px">'+
'<button onclick="achieveGoal(\''+g.id+'\')" style="padding:4px 8px;background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.2);border-radius:7px;color:var(--green);font-size:10px;font-weight:700;cursor:pointer">&#9989;</button>'+
'<button onclick="deleteGoal(\''+g.id+'\')" style="padding:4px 8px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.15);border-radius:7px;color:#f87171;font-size:10px;cursor:pointer">&#215;</button>'+
'</div></div></div>';
}).join(''))+
(achieved.length?'<div class="sect">ACHIEVED &#127942;</div>'+
achieved.map(function(g){
return '<div style="background:rgba(16,185,129,.04);border:1px solid rgba(16,185,129,.15);border-radius:12px;padding:12px;margin-bottom:8px;opacity:.7">'+
'<div style="display:flex;justify-content:space-between;align-items:center">'+
'<div><div style="font-size:13px;font-weight:600;color:var(--green);text-decoration:line-through">'+g.text+'</div>'+
'<div style="font-size:10px;color:var(--m2);margin-top:3px">Achieved '+fmtD(g.achievedDate)+'</div></div>'+
'<div style="font-size:24px">&#127942;</div></div></div>';
}).join(''):'')+
'</div>'+cliNav();
}
function openAddGoal(){
showModal('<div class="modal-bg" onclick="closeModal()"><div class="modal-box" onclick="event.stopPropagation()">'+
'<div class="modal-title">Add Goal <button onclick="closeModal()" style="font-size:22px;color:var(--m1);cursor:pointer">&#215;</button></div>'+
'<div class="row"><div class="lbl">Goal</div><textarea class="inp" id="ag_text" rows="3" placeholder="e.g. Deadlift 200kg, Lose 10kg..."></textarea></div>'+
'<div class="row"><div class="lbl">Category</div>'+
'<select class="sel" id="ag_cat">'+
'<option value="">General</option>'+
'<option value="Strength">Strength</option>'+
'<option value="Body">Body Composition</option>'+
'<option value="Cardio">Cardio</option>'+
'<option value="Habit">Habit</option>'+
'<option value="Nutrition">Nutrition</option>'+
'</select></div>'+
'<button class="btn btn-acc" onclick="doAddGoal()">ADD GOAL &#10003;</button>'+
'<button class="btn btn-ghost" onclick="closeModal()">Cancel</button>'+
'</div></div>');
}
function doAddGoal(){
var text=((document.getElementById('ag_text')||{}).value||'').trim();
var cat=(document.getElementById('ag_cat')||{}).value||'';
if(!text){toast('Enter a goal','err');return;}
var goals=DB.get('goals_'+S.cid)||[];
goals.push({id:'g'+Date.now(),text:text,category:cat,date:today(),achieved:false});
DB.set('goals_'+S.cid,goals);
closeModal();toast('Goal added!','ok');R();
}
function achieveGoal(id){
var goals=DB.get('goals_'+S.cid)||[];
for(var i=0;i<goals.length;i++){if(goals[i].id===id){goals[i].achieved=true;goals[i].achievedDate=today();break;}}
DB.set('goals_'+S.cid,goals);toast('Goal achieved! &#127942;','ok');R();
}
function deleteGoal(id){
var goals=DB.get('goals_'+S.cid)||[];
goals=goals.filter(function(g){return g.id!==id;});
DB.set('goals_'+S.cid,goals);toast('Goal removed','ok');R();
}


// ===== HABITS =====
var HABIT_PRESETS=[
{name:'Drink 2L water',icon:'&#128167;',cat:'Health'},
{name:'Hit protein target',icon:'&#129385;',cat:'Nutrition'},
{name:'8 hours sleep',icon:'&#128564;',cat:'Recovery'},
{name:'10,000 steps',icon:'&#128694;',cat:'Cardio'},
{name:'No alcohol',icon:'&#128683;',cat:'Health'},
{name:'Take supplements',icon:'&#128138;',cat:'Health'},
{name:'Meditate 10 min',icon:'&#129504;',cat:'Mindset'},
{name:'Cold shower',icon:'&#128703;',cat:'Recovery'}
];
function renderHabits(){
var hd=DB.get('habits_'+S.cid)||{list:[],logs:{}};
var list=hd.list||[];
var logs=hd.logs||{};
var todayLogs=logs[today()]||[];
var week7=[];
for(var i=6;i>=0;i--){
var dt=new Date();dt.setDate(dt.getDate()-i);
var ds=dt.toISOString().split('T')[0];
week7.push({date:ds,count:(logs[ds]||[]).length,total:list.length});
}
return '<div class="hdr"><div class="hdr-top">'+
'<div><div class="hdr-sub">Daily Habits</div><div class="hdr-title">Habits</div></div>'+
'<button onclick="openAddHabit()" class="btn-sm btn-acc">+ Habit</button>'+
'</div></div>'+
'<div class="page">'+
(list.length>0?'<div class="card" style="margin-bottom:14px"><div class="card-p">'+
'<div style="font-size:9px;font-weight:700;letter-spacing:1.5px;color:var(--m2);margin-bottom:10px">LAST 7 DAYS</div>'+
'<div style="display:flex;gap:4px;justify-content:space-between">'+week7.map(function(d){
var pct=d.total>0?Math.round(d.count/d.total*100):0;
var isTd=d.date===today();
return '<div style="flex:1;text-align:center">'+
'<div style="height:40px;background:rgba(255,255,255,.04);border-radius:5px;overflow:hidden;position:relative;margin-bottom:4px">'+
'<div style="position:absolute;bottom:0;left:0;right:0;height:'+pct+'%;background:'+(isTd?'var(--acc)':'var(--green)')+';border-radius:5px 5px 0 0"></div></div>'+
'<div style="font-size:8px;color:'+(isTd?'var(--acc)':'var(--m2)')+'">'+new Date(d.date+'T12:00:00').toLocaleDateString('en-GB',{weekday:'short'}).slice(0,1)+'</div>'+
'</div>';
}).join('')+'</div></div></div>':'')+
(list.length===0?'<div class="empty">No habits yet.<br>Add habits to track daily consistency.</div>':
'<div class="sect" style="margin-top:0">TODAY&#39;S HABITS</div>'+
list.map(function(h){
var done=todayLogs.indexOf(h.id)>=0;
return '<div onclick="toggleHabit(\''+h.id+'\')" style="display:flex;align-items:center;gap:12px;padding:13px;background:var(--c1);border:1.5px solid '+(done?'var(--green)':'var(--bdr)')+';border-radius:12px;margin-bottom:8px;cursor:pointer">'+
'<div style="font-size:24px">'+h.icon+'</div>'+
'<div style="flex:1"><div style="font-size:14px;font-weight:700;color:'+(done?'var(--green)':'#fff')+'">'+h.name+'</div>'+
(h.cat?'<div style="font-size:10px;color:var(--m2)">'+h.cat+'</div>':'')+
'</div>'+
'<div style="width:26px;height:26px;border-radius:50%;border:2px solid '+(done?'var(--green)':'var(--bdr)')+';background:'+(done?'var(--green)':'transparent')+';display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;flex-shrink:0">'+(done?'&#10003;':'')+'</div>'+
'</div>';
}).join(''))+
'</div>'+cliNav();
}
function toggleHabit(id){
var hd=DB.get('habits_'+S.cid)||{list:[],logs:{}};
if(!hd.logs)hd.logs={};
var tl=hd.logs[today()]||[];
var idx=tl.indexOf(id);
if(idx>=0)tl.splice(idx,1);else tl.push(id);
hd.logs[today()]=tl;
DB.set('habits_'+S.cid,hd);R();
}
function openAddHabit(){
showModal('<div class="modal-bg" onclick="closeModal()"><div class="modal-box" onclick="event.stopPropagation()">'+
'<div class="modal-title">Add Habit <button onclick="closeModal()" style="font-size:22px;color:var(--m1);cursor:pointer">&#215;</button></div>'+
'<div class="sect" style="margin-top:0">QUICK ADD</div>'+
'<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px">'+
HABIT_PRESETS.map(function(p){
return '<button onclick="doAddHabitPreset(\''+p.name+'\',\''+p.icon+'\',\''+p.cat+'\')" style="padding:6px 10px;background:var(--c2);border:1px solid var(--bdr);border-radius:9px;color:var(--m1);font-size:11px;font-weight:600;cursor:pointer">'+p.icon+' '+p.name+'</button>';
}).join('')+
'</div>'+
'<div class="sect">CUSTOM</div>'+
'<div class="row"><div class="lbl">Habit Name</div><input class="inp" id="ah_name" placeholder="e.g. Morning walk"></div>'+
'<button class="btn btn-acc" onclick="doAddHabit()">ADD &#10003;</button>'+
'<button class="btn btn-ghost" onclick="closeModal()">Cancel</button>'+
'</div></div>');
}
function doAddHabitPreset(name,icon,cat){
var hd=DB.get('habits_'+S.cid)||{list:[],logs:{}};
if(!hd.list)hd.list=[];
hd.list.push({id:'h'+Date.now(),name:name,icon:icon,cat:cat});
DB.set('habits_'+S.cid,hd);closeModal();toast('Habit added','ok');R();
}
function doAddHabit(){
var name=((document.getElementById('ah_name')||{}).value||'').trim();
if(!name){toast('Enter a habit name','err');return;}
var hd=DB.get('habits_'+S.cid)||{list:[],logs:{}};
if(!hd.list)hd.list=[];
hd.list.push({id:'h'+Date.now(),name:name,icon:'&#10003;',cat:''});
DB.set('habits_'+S.cid,hd);closeModal();toast('Habit added','ok');R();
}


// ===== RECOVERY =====
function renderRecovery(){
var all=DB.get('recovery_'+S.cid)||{};
var todayRec=all[today()]||null;
var keys=Object.keys(all).sort().reverse().slice(0,7);
return '<div class="hdr"><div class="hdr-top">'+
'<div><div class="hdr-sub">Recovery</div><div class="hdr-title">Recovery</div></div>'+
'</div></div>'+
'<div class="page">'+
(!todayRec?
'<div style="background:var(--c1);border:1.5px solid rgba(99,102,241,.3);border-radius:14px;padding:18px;margin-bottom:14px;text-align:center">'+
'<div style="font-size:36px;margin-bottom:8px">&#128526;</div>'+
'<div style="font-size:16px;font-weight:800;color:#fff;margin-bottom:4px">Morning Check-In</div>'+
'<div style="font-size:12px;color:var(--m1);margin-bottom:16px">How are you feeling today?</div>'+
'<button class="btn btn-acc" style="max-width:240px;margin:0 auto" onclick="openCheckin()">CHECK IN &#8594;</button>'+
'</div>':
'<div style="background:rgba(16,185,129,.05);border:1px solid rgba(16,185,129,.2);border-radius:14px;padding:14px;margin-bottom:14px">'+
'<div style="font-size:9px;font-weight:700;letter-spacing:1.5px;color:var(--green);margin-bottom:12px">TODAY&#39;S CHECK-IN &#10003;</div>'+
'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'+
'<div style="text-align:center;padding:10px;background:rgba(255,255,255,.03);border-radius:10px"><div style="font-size:22px;margin-bottom:4px">&#128564;</div><div style="font-size:11px;color:var(--m2);margin-bottom:3px">Sleep</div><div style="font-size:28px;font-weight:900;color:var(--blue)">'+todayRec.sleep+'</div><div style="font-size:9px;color:var(--m2)">/10</div></div>'+
'<div style="text-align:center;padding:10px;background:rgba(255,255,255,.03);border-radius:10px"><div style="font-size:22px;margin-bottom:4px">&#128137;</div><div style="font-size:11px;color:var(--m2);margin-bottom:3px">Soreness</div><div style="font-size:28px;font-weight:900;color:var(--red)">'+todayRec.soreness+'</div><div style="font-size:9px;color:var(--m2)">/10</div></div>'+
'<div style="text-align:center;padding:10px;background:rgba(255,255,255,.03);border-radius:10px"><div style="font-size:22px;margin-bottom:4px">&#9889;</div><div style="font-size:11px;color:var(--m2);margin-bottom:3px">Energy</div><div style="font-size:28px;font-weight:900;color:var(--amber)">'+todayRec.energy+'</div><div style="font-size:9px;color:var(--m2)">/10</div></div>'+
'<div style="text-align:center;padding:10px;background:rgba(255,255,255,.03);border-radius:10px"><div style="font-size:22px;margin-bottom:4px">&#128512;</div><div style="font-size:11px;color:var(--m2);margin-bottom:3px">Mood</div><div style="font-size:28px;font-weight:900;color:var(--green)">'+todayRec.mood+'</div><div style="font-size:9px;color:var(--m2)">/10</div></div>'+
'</div></div>')+
(keys.length?'<div class="sect">RECENT</div>'+
keys.map(function(k){
var r=all[k];
var avg=Math.round(((r.sleep||0)+(10-(r.soreness||5))+(r.energy||0)+(r.mood||0))/4);
return '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:var(--c1);border:1px solid var(--bdr);border-radius:10px;margin-bottom:6px">'+
'<div style="font-size:12px;color:var(--m1)">'+fmtD(k)+'</div>'+
'<div style="display:flex;gap:10px;align-items:center">'+
'<span style="font-size:10px;color:var(--m2)">Sleep:'+r.sleep+' Energy:'+r.energy+'</span>'+
'<span style="font-size:14px;font-weight:800;color:'+(avg>=7?'var(--green)':avg>=5?'var(--amber)':'var(--red)')+'">'+avg+'/10</span>'+
'</div></div>';
}).join(''):'')+
'</div>'+cliNav();
}
function sliderUpd(el, valId, color) {
var val = parseInt(el.value);
var pct = Math.round((val - 1) / 9 * 100);
el.style.background = 'linear-gradient(to right,' + color + ' ' + pct + '%,rgba(255,255,255,.15) ' + pct + '%)';
var vEl = document.getElementById(valId);
if (vEl) vEl.textContent = val;
}
function openCheckin(){
showModal('<div class="modal-bg" onclick="closeModal()"><div class="modal-box" onclick="event.stopPropagation()">'+
'<div class="modal-title">Morning Check-In <button onclick="closeModal()" style="font-size:22px;color:var(--m1);cursor:pointer">&#215;</button></div>'+
'<div style="font-size:12px;color:var(--m1);margin-bottom:16px">Rate 1 (poor) to 10 (excellent)</div>'+
'<div style="margin-bottom:16px">'+
'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><div style="font-size:13px;font-weight:700;color:#fff">&#128564; Sleep Quality</div><span id="ci_sleep_v" style="font-size:16px;font-weight:900;color:var(--blue)">5</span></div>'+
'<input type="range" id="ci_sleep" min="1" max="10" value="5" oninput="sliderUpd(this,\'ci_sleep_v\',\'#3b82f6\')" style="width:100%;background:linear-gradient(to right,#3b82f6 44.4%,rgba(255,255,255,.15) 44.4%)">'+
'<div style="display:flex;justify-content:space-between;font-size:9px;color:var(--m2);margin-top:3px"><span>1</span><span>5</span><span>10</span></div>'+
'</div>'+
'<div style="margin-bottom:16px">'+
'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><div style="font-size:13px;font-weight:700;color:#fff">&#128137; Muscle Soreness</div><span id="ci_sore_v" style="font-size:16px;font-weight:900;color:var(--red)">5</span></div>'+
'<input type="range" id="ci_sore" min="1" max="10" value="5" oninput="sliderUpd(this,\'ci_sore_v\',\'#ef4444\')" style="width:100%;background:linear-gradient(to right,#ef4444 44.4%,rgba(255,255,255,.15) 44.4%)">'+
'<div style="display:flex;justify-content:space-between;font-size:9px;color:var(--m2);margin-top:3px"><span>1</span><span>5</span><span>10</span></div>'+
'</div>'+
'<div style="margin-bottom:16px">'+
'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><div style="font-size:13px;font-weight:700;color:#fff">&#9889; Energy Level</div><span id="ci_energy_v" style="font-size:16px;font-weight:900;color:var(--amber)">5</span></div>'+
'<input type="range" id="ci_energy" min="1" max="10" value="5" oninput="sliderUpd(this,\'ci_energy_v\',\'#f59e0b\')" style="width:100%;background:linear-gradient(to right,#f59e0b 44.4%,rgba(255,255,255,.15) 44.4%)">'+
'<div style="display:flex;justify-content:space-between;font-size:9px;color:var(--m2);margin-top:3px"><span>1</span><span>5</span><span>10</span></div>'+
'</div>'+
'<div style="margin-bottom:16px">'+
'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><div style="font-size:13px;font-weight:700;color:#fff">&#128512; Mood</div><span id="ci_mood_v" style="font-size:16px;font-weight:900;color:var(--green)">5</span></div>'+
'<input type="range" id="ci_mood" min="1" max="10" value="5" oninput="sliderUpd(this,\'ci_mood_v\',\'#10b981\')" style="width:100%;background:linear-gradient(to right,#10b981 44.4%,rgba(255,255,255,.15) 44.4%)">'+
'<div style="display:flex;justify-content:space-between;font-size:9px;color:var(--m2);margin-top:3px"><span>1</span><span>5</span><span>10</span></div>'+
'</div>'+
'<button class="btn btn-acc" onclick="doCheckin()">SAVE &#10003;</button>'+
'<button class="btn btn-ghost" onclick="closeModal()">Cancel</button>'+
'</div></div>');
}
function doCheckin(){
var sleep=parseInt((document.getElementById('ci_sleep')||{}).value||'5');
var sore=parseInt((document.getElementById('ci_sore')||{}).value||'5');
var energy=parseInt((document.getElementById('ci_energy')||{}).value||'5');
var mood=parseInt((document.getElementById('ci_mood')||{}).value||'5');
var all=DB.get('recovery_'+S.cid)||{};
all[today()]={sleep:sleep,soreness:sore,energy:energy,mood:mood,ts:Date.now()};
DB.set('recovery_'+S.cid,all);
closeModal();toast('Check-in saved!','ok');R();
}


// ===== MEASUREMENTS =====
function renderMeasurements(){
var all=DB.get('measurements_'+S.cid)||[];
var latest=all.length?all[all.length-1]:null;
var prev=all.length>1?all[all.length-2]:null;
var fields=[
{key:'weight',label:'Weight',unit:'kg',icon:'&#9878;'},
{key:'chest',label:'Chest',unit:'cm',icon:'&#128137;'},
{key:'waist',label:'Waist',unit:'cm',icon:'&#128098;'},
{key:'hips',label:'Hips',unit:'cm',icon:'&#128104;'},
{key:'arms',label:'Arms',unit:'cm',icon:'&#128170;'},
{key:'thighs',label:'Thighs',unit:'cm',icon:'&#129463;'}
];
return '<div class="hdr"><div class="hdr-top">'+
'<div><div class="hdr-sub">Body</div><div class="hdr-title">Measurements</div></div>'+
'<button onclick="openLogMeasurements()" class="btn-sm btn-acc">+ Log</button>'+
'</div></div>'+
'<div class="page">'+
(latest?'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">'+
fields.map(function(f){
var val=latest[f.key];
var pv=prev?prev[f.key]:null;
var diff=(val&&pv)?(parseFloat(val)-parseFloat(pv)):null;
return '<div style="background:var(--c1);border:1px solid var(--bdr);border-radius:12px;padding:13px">'+
'<div style="font-size:18px;margin-bottom:4px">'+f.icon+'</div>'+
'<div style="font-size:11px;color:var(--m2);margin-bottom:4px">'+f.label+'</div>'+
(val?'<div style="font-size:24px;font-weight:900;color:#fff">'+val+'<span style="font-size:11px;color:var(--m2)"> '+f.unit+'</span></div>':'<div style="font-size:16px;color:var(--m2)">-</div>')+
(diff!==null?'<div style="font-size:10px;font-weight:700;color:'+(diff<0?'var(--green)':diff>0?'var(--red)':'var(--m2)')+'">'+( diff>0?'+':'')+diff.toFixed(1)+f.unit+'</div>':'')+
'</div>';
}).join('')+'</div>':
'<div class="empty">No measurements yet.<br>Log your first measurement to track progress.</div>')+
(all.length>0?'<div class="sect">HISTORY</div>'+
all.slice(-5).reverse().map(function(m){
return '<div style="padding:10px 12px;background:var(--c1);border:1px solid var(--bdr);border-radius:10px;margin-bottom:6px">'+
'<div style="font-size:11px;color:var(--m1);margin-bottom:6px;font-weight:700">'+fmtD(m.date)+'</div>'+
'<div style="display:flex;gap:12px;flex-wrap:wrap">'+
fields.filter(function(f){return m[f.key];}).map(function(f){
return '<div><span style="font-size:10px;color:var(--m2)">'+f.label+': </span><span style="font-size:11px;font-weight:700;color:#fff">'+m[f.key]+f.unit+'</span></div>';
}).join('')+
'</div></div>';
}).join(''):'')+
'</div>'+cliNav();
}
function openLogMeasurements(){
var latest=(DB.get('measurements_'+S.cid)||[]).slice(-1)[0]||{};
showModal('<div class="modal-bg" onclick="closeModal()"><div class="modal-box" onclick="event.stopPropagation()">'+
'<div class="modal-title">Log Measurements <button onclick="closeModal()" style="font-size:22px;color:var(--m1);cursor:pointer">&#215;</button></div>'+
'<div class="row"><div class="lbl">Date</div><input class="inp" id="lm_date" type="date" value="'+today()+'"></div>'+
'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">'+
'<div><div class="lbl">Weight (kg)</div><input class="inp" id="lm_w" type="number" value="'+(latest.weight||'')+'" placeholder="80" inputmode="decimal" style="margin-bottom:0"></div>'+
'<div><div class="lbl">Chest (cm)</div><input class="inp" id="lm_chest" type="number" value="'+(latest.chest||'')+'" placeholder="100" inputmode="decimal" style="margin-bottom:0"></div>'+
'</div>'+
'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">'+
'<div><div class="lbl">Waist (cm)</div><input class="inp" id="lm_waist" type="number" value="'+(latest.waist||'')+'" placeholder="85" inputmode="decimal" style="margin-bottom:0"></div>'+
'<div><div class="lbl">Hips (cm)</div><input class="inp" id="lm_hips" type="number" value="'+(latest.hips||'')+'" placeholder="95" inputmode="decimal" style="margin-bottom:0"></div>'+
'</div>'+
'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">'+
'<div><div class="lbl">Arms (cm)</div><input class="inp" id="lm_arms" type="number" value="'+(latest.arms||'')+'" placeholder="35" inputmode="decimal" style="margin-bottom:0"></div>'+
'<div><div class="lbl">Thighs (cm)</div><input class="inp" id="lm_thighs" type="number" value="'+(latest.thighs||'')+'" placeholder="55" inputmode="decimal" style="margin-bottom:0"></div>'+
'</div>'+
'<button class="btn btn-acc" onclick="doLogMeasurements()">SAVE &#10003;</button>'+
'<button class="btn btn-ghost" onclick="closeModal()">Cancel</button>'+
'</div></div>');
}
function doLogMeasurements(){
var date=(document.getElementById('lm_date')||{}).value||today();
var flds=[['w','weight'],['chest','chest'],['waist','waist'],['hips','hips'],['arms','arms'],['thighs','thighs']];
var entry={date:date,ts:Date.now()};
for(var i=0;i<flds.length;i++){
var v=parseFloat((document.getElementById('lm_'+flds[i][0])||{}).value||'');
if(v)entry[flds[i][1]]=v;
}
var all=DB.get('measurements_'+S.cid)||[];
all=all.filter(function(m){return m.date!==date;});
all.push(entry);
all.sort(function(a,b){return a.date.localeCompare(b.date);});
DB.set('measurements_'+S.cid,all);
closeModal();toast('Measurements saved!','ok');R();
}


// ===== TRAINER NUTRITION NOTES =====
function renderCliNutr(cid, c){
var allNotes=DB.get('nutr_notes_'+cid)||{};
var allNutr=DB.get('nutrition_'+cid)||{};
var today_str=today();
var todayData=allNutr[today_str]||{meals:{breakfast:[],lunch:[],dinner:[],snacks:[]},water:0};
var todayTotals={calories:0,protein:0,carbs:0,fat:0};
var types=['breakfast','lunch','dinner','snacks'];
for(var mi=0;mi<types.length;mi++){
var items=(todayData.meals&&todayData.meals[types[mi]])||[];
for(var ii=0;ii<items.length;ii++){
todayTotals.calories+=items[ii].calories||0;
todayTotals.protein+=items[ii].protein||0;
todayTotals.carbs+=items[ii].carbs||0;
todayTotals.fat+=items[ii].fat||0;
}
}
var bio=DB.get('bio_'+cid)||{};
var targets=bio.macros||null;
var recentDates=Object.keys(allNutr).sort().reverse().slice(0,5);
var existingNote=allNotes[today_str]||'';
return '<div class="sect" style="margin-top:0">TODAY&#39;S NUTRITION &#8212; '+c.name+'</div>'+
'<div class="card"><div class="card-p">'+
'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">'+
'<div style="text-align:center;padding:10px;background:rgba(255,255,255,.03);border-radius:10px"><div style="font-size:20px;font-weight:900;color:var(--green)">'+todayTotals.calories+'</div><div style="font-size:9px;color:var(--m2)">Calories</div>'+(targets?'<div style="font-size:9px;color:var(--m2)">/ '+targets.calories+' target</div>':'')+'</div>'+
'<div style="text-align:center;padding:10px;background:rgba(255,255,255,.03);border-radius:10px"><div style="font-size:20px;font-weight:900;color:#818cf8">'+todayTotals.protein+'g</div><div style="font-size:9px;color:var(--m2)">Protein</div>'+(targets?'<div style="font-size:9px;color:var(--m2)">/ '+targets.protein+'g target</div>':'')+'</div>'+
'</div>'+
'<div class="lbl">SEND NUTRITION NOTE TO '+c.name.toUpperCase()+'</div>'+
'<textarea class="inp" id="nn_txt" rows="3" placeholder="e.g. Great macros today! Try to add more protein at breakfast...">'+existingNote+'</textarea>'+
'<button class="btn btn-acc" style="margin-top:8px" onclick="doSendNutrNote(\''+cid+'\')">SEND NOTE &#10003;</button>'+
'</div></div>'+
(targets?'<div class="sect">MACRO TARGETS</div>'+
'<div class="card"><div class="card-p">'+
'<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px">'+
'<div style="text-align:center"><div style="font-size:16px;font-weight:900;color:var(--green)">'+targets.calories+'</div><div style="font-size:9px;color:var(--m2)">kcal</div></div>'+
'<div style="text-align:center"><div style="font-size:16px;font-weight:900;color:#818cf8">'+targets.protein+'g</div><div style="font-size:9px;color:var(--m2)">protein</div></div>'+
'<div style="text-align:center"><div style="font-size:16px;font-weight:900;color:#34d399">'+targets.carbs+'g</div><div style="font-size:9px;color:var(--m2)">carbs</div></div>'+
'<div style="text-align:center"><div style="font-size:16px;font-weight:900;color:var(--amber)">'+targets.fat+'g</div><div style="font-size:9px;color:var(--m2)">fat</div></div>'+
'</div></div></div>':
'<div style="font-size:11px;color:var(--m2);padding:8px;margin-bottom:10px">No macro targets set yet. Client sets these in the Nutrition tab.</div>')+
(recentDates.length?'<div class="sect">RECENT LOGS</div>'+
recentDates.map(function(d){
var dd=allNutr[d];
var dc={calories:0,protein:0};
var typ=['breakfast','lunch','dinner','snacks'];
for(var i=0;i<typ.length;i++){var it=(dd.meals&&dd.meals[typ[i]])||[];for(var j=0;j<it.length;j++){dc.calories+=it[j].calories||0;dc.protein+=it[j].protein||0;}}
return '<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 12px;background:var(--c1);border:1px solid var(--bdr);border-radius:10px;margin-bottom:6px">'+
'<div style="font-size:12px;color:var(--m1)">'+fmtD(d)+'</div>'+
'<div style="display:flex;gap:12px"><span style="font-size:12px;font-weight:700;color:var(--green)">'+dc.calories+' kcal</span><span style="font-size:12px;color:#818cf8">'+dc.protein+'g protein</span></div>'+
'</div>';
}).join(''):
'<div class="empty">No nutrition logs yet.</div>');
}
function doSendNutrNote(cid){
var txt=((document.getElementById('nn_txt')||{}).value||'').trim();
if(!txt){toast('Enter a note','err');return;}
var all=DB.get('nutr_notes_'+cid)||{};
all[today()]=txt;
DB.set('nutr_notes_'+cid,all);
toast('Nutrition note sent to client','ok');
}

function openPhotoCalorie() {
showModal('<div class="modal-bg" onclick="closeModal()"><div class="modal-box" onclick="event.stopPropagation()">' +
'<div class="modal-title">Photo Calorie Count</div>' +
'<div style="padding:12px;background:rgba(245,158,11,.06);border:1px solid rgba(245,158,11,.15);border-radius:10px;margin-bottom:16px">' +
'<div style="font-size:11px;font-weight:700;color:var(--amber);margin-bottom:4px">&#9888;&#65039; Accuracy Disclaimer</div>' +
'<div style="font-size:11px;color:var(--m1);line-height:1.6">Photo estimates are approximate. Portion sizes, cooking methods, and hidden ingredients affect calories in ways photos cannot show. Always verify.</div>' +
'</div>' +
'<input type="file" id="photo_input" accept="image/*" capture="environment" style="display:none" onchange="handlePhotoUpload(event)">' +
'<button class="btn btn-acc" style="margin-bottom:8px" onclick="document.getElementById(&apos;photo_input&apos;).click()">&#128248; Take / Choose Photo</button>' +
'<div id="photo_preview" style="display:none;margin-bottom:14px"><img id="photo_img" style="width:100%;border-radius:12px;max-height:200px;object-fit:cover"></div>' +
'<div id="photo_questions" style="display:none">' +
'<div class="sect" style="margin-top:0">REFINE ESTIMATE</div>' +
'<div class="row"><div class="lbl">Cooking method</div><select class="sel" id="pq_cook"><option value="grilled">Grilled / Baked</option><option value="fried">Fried</option><option value="raw">Raw / No cooking</option><option value="boiled">Boiled / Steamed</option><option value="unknown">Not sure</option></select></div>' +
'<div class="row"><div class="lbl">Oils / Butter added?</div><select class="sel" id="pq_oil"><option value="none">None</option><option value="light">Light (1 tsp)</option><option value="moderate">Moderate (1-2 tbsp)</option><option value="heavy">Heavy</option></select></div>' +
'<div class="row"><div class="lbl">Sauces / Dressings</div><input class="inp" id="pq_sauces" placeholder="e.g. ketchup, mayo, dressing"></div>' +
'<div class="row"><div class="lbl">Portion size</div><select class="sel" id="pq_portion"><option value="small">Small</option><option value="normal">Normal</option><option value="large">Large</option><option value="double">Double</option></select></div>' +
'<div class="row"><div class="lbl">Add to meal</div><select class="sel" id="pq_meal"><option value="breakfast">Breakfast</option><option value="lunch">Lunch</option><option value="dinner">Dinner</option><option value="snacks">Snacks</option></select></div>' +
'<div id="photo_result" style="display:none;margin-top:12px"></div>' +
'<button class="btn btn-acc" id="analyze_btn" onclick="analyzePhoto()" style="display:none">ANALYZE NOW &#129302;</button>' +
'</div>' +
'<button class="btn btn-ghost" onclick="closeModal()">Cancel</button>' +
'</div></div>');
}

function handlePhotoUpload(event) {
var file = event.target.files[0];
if (!file) return;
var reader = new FileReader();
reader.onload = function(e) {
S._photoData = e.target.result.split(',')[1];
var prev = document.getElementById('photo_preview');
var img = document.getElementById('photo_img');
var qs = document.getElementById('photo_questions');
var btn = document.getElementById('analyze_btn');
if (prev) { prev.style.display='block'; img.src=e.target.result; }
if (qs) qs.style.display='block';
if (btn) btn.style.display='block';
};
reader.readAsDataURL(file);
}

function getVal(id) {
var el = document.getElementById(id);
return el ? el.value : '';
}

function analyzePhoto() {
var cook = getVal('pq_cook');
var oil = getVal('pq_oil');
var sauces = getVal('pq_sauces');
var portion = getVal('pq_portion');
var resultEl = document.getElementById('photo_result');
var btn = document.getElementById('analyze_btn');
if (resultEl) { resultEl.style.display='block'; resultEl.innerHTML='<div style="text-align:center;padding:12px;color:var(--m1);font-size:12px">Analyzing... &#129302;</div>'; }
if (btn) btn.disabled=true;
var ctx = 'Cooking: ' + cook + '. Oil: ' + oil + (sauces?'. Sauces: '+sauces:'') + '. Portion: ' + portion + '.';
var apiKey = DB.get('anthropic_key') || '';
if (!apiKey) {
if (resultEl) resultEl.innerHTML='<div style="color:var(--amber);font-size:12px;padding:8px;background:rgba(245,158,11,.08);border-radius:8px">API key not set. Go to Settings to add your Anthropic API key.</div>';
if (btn) btn.disabled=false;
return;
}
var prompt = 'Analyze this food photo and estimate nutrition. Context: ' + ctx + ' Respond in JSON only: {foodName, calories, protein, carbs, fat, confidence (low/medium/high), notes}';
fetch('https://api.anthropic.com/v1/messages', {
method:'POST',
headers:{'Content-Type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01'},
body:JSON.stringify({
model:'claude-haiku-4-5-20251001',
max_tokens:300,
messages:[{role:'user',content:[
{type:'image',source:{type:'base64',media_type:'image/jpeg',data:S._photoData}},
{type:'text',text:prompt}
]}]
})
}).then(function(r){return r.json();}).then(function(data){
var text = data.content&&data.content[0]?data.content[0].text:'{}';
try {
var clean = text.replace(/```json|```/g,'').trim();
var result = JSON.parse(clean);
S._photoResult = result;
if (resultEl) {
resultEl.innerHTML = '<div style="background:var(--c2);border-radius:12px;padding:14px;margin-bottom:10px">' +
'<div style="font-size:15px;font-weight:800;color:#fff;margin-bottom:8px">' + (result.foodName||'Food') + '</div>' +
'<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px;margin-bottom:10px">' +
['calories','protein','carbs','fat'].map(function(k) {
var cols={calories:'var(--green)',protein:'#6366f1',carbs:'#10b981',fat:'var(--amber)'};
return '<div style="text-align:center;background:var(--c1);border-radius:8px;padding:8px 4px"><div style="font-size:16px;font-weight:800;color:'+cols[k]+'">'+(result[k]||0)+'</div><div style="font-size:8px;color:var(--m2)">'+(k==='calories'?'kcal':'g')+'</div><div style="font-size:8px;color:var(--m2)">'+k+'</div></div>';
}).join('') + '</div>' +
'<div style="padding:8px;background:rgba(245,158,11,.06);border-radius:8px;font-size:10px;color:var(--amber)">Confidence: '+(result.confidence||'?')+' &bull; '+(result.notes||'')+'</div></div>' +
'<button class="btn btn-green" style="margin-bottom:0" onclick="addPhotoMeal()">Add to Log</button>';
}
} catch(e) {
if (resultEl) resultEl.innerHTML='<div style="color:var(--red);font-size:12px">Could not parse result. Try again.</div>';
}
if (btn) btn.disabled=false;
}).catch(function(e) {
if (resultEl) resultEl.innerHTML='<div style="color:var(--red);font-size:12px">Analysis failed. Check connection.</div>';
if (btn) btn.disabled=false;
});
}

function addPhotoMeal() {
var r = S._photoResult;
if (!r) return;
var mealType = getVal('pq_meal') || 'snacks';
var data = getNutriData(null, getNutrDate());
if (!data.meals[mealType]) data.meals[mealType] = [];
data.meals[mealType].push({name:r.foodName||'Photo meal',calories:r.calories||0,protein:r.protein||0,carbs:r.carbs||0,fat:r.fat||0,fromPhoto:true,ts:Date.now()});
saveNutriData(data);
closeModal();
toast('Meal added from photo', 'ok');
S._photoResult=null; S._photoData=null;
R();
}
function openDescribeFood(meal) {
S.addFoodMeal = meal || 'snacks';
S._aiFood = {meal: meal || 'snacks', phase: 'input'};
var labels = {breakfast:'Breakfast',lunch:'Lunch',dinner:'Dinner',snacks:'Snacks'};
showModal('<div class="modal-bg" onclick="closeModal()"><div class="modal-box" onclick="event.stopPropagation()">' +
'<div class="modal-title">&#129302; AI Calorie Estimator <button onclick="closeModal()" style="font-size:22px;color:var(--m1);cursor:pointer">&#215;</button></div>' +
'<div style="font-size:11px;color:var(--m1);margin-bottom:12px;line-height:1.6">Describe what you ate. Include portion size and how it was prepared if you know.</div>' +
'<div class="row"><div class="lbl">What did you eat?</div>' +
'<textarea class="inp" id="ai_food_desc" rows="3" placeholder="e.g. Two scrambled eggs on two slices of toast, cooked with a little butter"></textarea></div>' +
'<div class="row"><div class="lbl">Add to</div>' +
'<select class="sel" id="ai_food_meal">' +
'<option value="breakfast"' + (meal==='breakfast'?' selected':'') + '>&#9728; Breakfast</option>' +
'<option value="lunch"' + (meal==='lunch'?' selected':'') + '>&#127860; Lunch</option>' +
'<option value="dinner"' + (meal==='dinner'?' selected':'') + '>&#127762; Dinner</option>' +
'<option value="snacks"' + (meal==='snacks'?' selected':'') + '>&#127830; Snacks</option>' +
'</select></div>' +
'<div id="ai_food_area"></div>' +
'<button class="btn btn-acc" id="ai_food_btn" onclick="analyzeDescribedFood()">ESTIMATE CALORIES &#129302;</button>' +
'<button class="btn btn-ghost" onclick="closeModal()">Cancel</button>' +
'</div></div>');
setTimeout(function(){var el=document.getElementById('ai_food_desc');if(el)el.focus();},100);
}
function analyzeDescribedFood() {
var desc = ((document.getElementById('ai_food_desc')||{}).value||'').trim();
if (!desc) { toast('Describe your food first','err'); return; }
var apiKey = DB.get('anthropic_key') || '';
var area = document.getElementById('ai_food_area');
var btn = document.getElementById('ai_food_btn');
if (!apiKey) {
if (area) area.innerHTML = '<div style="color:var(--amber);font-size:12px;padding:10px;background:rgba(245,158,11,.08);border-radius:8px;margin-bottom:10px">&#9888; No API key set. Ask your trainer to add an Anthropic API key in Settings, or add it yourself if you have one.</div>';
return;
}
if (area) area.innerHTML = '<div style="text-align:center;padding:12px;color:var(--m1);font-size:12px">Thinking... &#129302;</div>';
if (btn) btn.disabled = true;
if (!S._aiFood) S._aiFood = {};
S._aiFood.desc = desc;
S._aiFood.phase = 'input';
var promptText = 'A user says they ate: "' + desc + '".' +
'\n\nIf the description gives enough info to estimate calories (food type, rough amount, how it was cooked), respond with ONLY this JSON:' +
'\n{"type":"nutrition","foodName":"...","calories":0,"protein":0,"carbs":0,"fat":0,"notes":"brief explanation"}' +
'\n\nIf you need ONE clarifying question (about oil/butter, sauces, portion size, or cooking method) to improve accuracy, respond with ONLY:' +
'\n{"type":"question","question":"your question here"}' +
'\n\nJSON only, no extra text.';
fetch('https://api.anthropic.com/v1/messages', {
method:'POST',
headers:{'Content-Type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01'},
body:JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:250,messages:[{role:'user',content:promptText}]})
}).then(function(r){return r.json();}).then(function(d){
var text = d.content&&d.content[0]?d.content[0].text:'{}';
try {
var result = JSON.parse(text.replace(/```json|```/g,'').trim());
if (result.type === 'question') {
S._aiFood.phase = 'question';
S._aiFood.question = result.question;
if (area) area.innerHTML =
'<div style="background:rgba(99,102,241,.08);border:1px solid rgba(99,102,241,.25);border-radius:10px;padding:12px;margin-bottom:10px">' +
'<div style="font-size:9px;font-weight:700;letter-spacing:1.5px;color:var(--acc);margin-bottom:6px">&#129302; QUICK QUESTION</div>' +
'<div style="font-size:13px;color:#fff;margin-bottom:10px">' + result.question + '</div>' +
'<textarea class="inp" id="ai_food_answer" rows="2" placeholder="e.g. No oil, just grilled dry"></textarea>' +
'</div>';
if (btn) { btn.innerHTML = 'CALCULATE &#129302;'; btn.disabled=false; btn.setAttribute('onclick','analyzeWithAnswer()'); }
} else if (result.type === 'nutrition') {
showNutritionResult(result, area, btn);
} else {
if (area) area.innerHTML = '<div style="color:var(--red);font-size:12px">Could not estimate. Try describing in more detail.</div>';
if (btn) btn.disabled=false;
}
} catch(e) {
if (area) area.innerHTML = '<div style="color:var(--red);font-size:12px">Could not parse result. Try again.</div>';
if (btn) btn.disabled=false;
}
}).catch(function(){
if (area) area.innerHTML = '<div style="color:var(--red);font-size:12px">Analysis failed. Check your connection.</div>';
if (btn) btn.disabled=false;
});
}
function analyzeWithAnswer() {
var answer = ((document.getElementById('ai_food_answer')||{}).value||'').trim();
var area = document.getElementById('ai_food_area');
var btn = document.getElementById('ai_food_btn');
var apiKey = DB.get('anthropic_key') || '';
if (!answer) { toast('Please answer the question','err'); return; }
if (!apiKey) return;
if (area) area.innerHTML += '<div style="text-align:center;padding:8px;color:var(--m1);font-size:12px">Calculating... &#129302;</div>';
if (btn) btn.disabled=true;
var promptText = 'Food description: "' + (S._aiFood.desc||'') + '".' +
'\nClarification - Q: "' + (S._aiFood.question||'') + '" A: "' + answer + '".' +
'\n\nRespond with ONLY this JSON:' +
'\n{"type":"nutrition","foodName":"...","calories":0,"protein":0,"carbs":0,"fat":0,"notes":"..."}' +
'\n\nJSON only.';
fetch('https://api.anthropic.com/v1/messages', {
method:'POST',
headers:{'Content-Type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01'},
body:JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:250,messages:[{role:'user',content:promptText}]})
}).then(function(r){return r.json();}).then(function(d){
var text = d.content&&d.content[0]?d.content[0].text:'{}';
try {
var result = JSON.parse(text.replace(/```json|```/g,'').trim());
showNutritionResult(result, area, btn);
} catch(e) {
if (area) area.innerHTML = '<div style="color:var(--red);font-size:12px">Could not parse result. Try again.</div>';
if (btn) btn.disabled=false;
}
}).catch(function(){
if (area) area.innerHTML = '<div style="color:var(--red);font-size:12px">Analysis failed.</div>';
if (btn) btn.disabled=false;
});
}
function showNutritionResult(result, area, btn) {
S._aiFood = S._aiFood || {};
S._aiFood.phase = 'result';
S._aiFood.result = result;
var cols = {calories:'var(--green)',protein:'#6366f1',carbs:'#10b981',fat:'var(--amber)'};
var macroBoxes = ['calories','protein','carbs','fat'].map(function(k) {
return '<div style="text-align:center;background:var(--c1);border-radius:8px;padding:8px 4px">' +
'<div style="font-size:16px;font-weight:800;color:'+cols[k]+'">'+(result[k]||0)+'</div>' +
'<div style="font-size:8px;color:var(--m2)">'+(k==='calories'?'kcal':'g')+'</div>' +
'<div style="font-size:8px;color:var(--m2)">'+k+'</div></div>';
}).join('');
if (area) area.innerHTML =
'<div style="background:var(--c2);border-radius:12px;padding:14px;margin-bottom:10px">' +
'<div style="font-size:14px;font-weight:800;color:#fff;margin-bottom:8px">' + (result.foodName||'Food') + '</div>' +
'<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px;margin-bottom:10px">' + macroBoxes + '</div>' +
(result.notes?'<div style="font-size:10px;color:var(--m2);line-height:1.5">' + result.notes + '</div>':'') +
'</div>';
if (btn) {
btn.innerHTML = 'ADD TO LOG &#10003;';
btn.disabled=false;
btn.style.background='var(--green)';
btn.setAttribute('onclick','addDescribedMeal()');
}
}
function addDescribedMeal() {
var r = S._aiFood && S._aiFood.result;
if (!r) return;
var mealType = getVal('ai_food_meal') || (S._aiFood && S._aiFood.meal) || 'snacks';
var data = getNutriData(null, getNutrDate());
if (!data.meals[mealType]) data.meals[mealType] = [];
data.meals[mealType].push({name:r.foodName||'AI meal',calories:r.calories||0,protein:r.protein||0,carbs:r.carbs||0,fat:r.fat||0,fromAI:true,ts:Date.now()});
saveNutriData(data);
closeModal();
toast((r.foodName||'Meal') + ' added','ok');
S._aiFood = null;
R();
}

function addToCalendar(evt) {
var startDt = evt.date + 'T' + (evt.time||'10:00') + ':00';
var endH = Math.min(23, parseInt((evt.time||'10:00').split(':')[0])+1);
var endDt = evt.date + 'T' + String(endH).padStart(2,'0') + ':00:00';
var nl = '\r\n';
var ics = 'BEGIN:VCALENDAR' + nl + 'VERSION:2.0' + nl + 'BEGIN:VEVENT' + nl +
'SUMMARY:' + (evt.title||'Training Session') + nl +
'DTSTART:' + startDt.replace(/[-:]/g,'') + 'Z' + nl +
'DTEND:' + endDt.replace(/[-:]/g,'') + 'Z' + nl +
'DESCRIPTION:' + (evt.notes||'') + nl +
'BEGIN:VALARM' + nl + 'TRIGGER:-PT60M' + nl + 'ACTION:DISPLAY' + nl + 'DESCRIPTION:Session in 1 hour' + nl + 'END:VALARM' + nl +
'END:VEVENT' + nl + 'END:VCALENDAR';
var blob = new Blob([ics],{type:'text/calendar'});
var url = URL.createObjectURL(blob);
var a = document.createElement('a');
a.href=url; a.download='session.ics';
document.body.appendChild(a); a.click(); document.body.removeChild(a);
setTimeout(function(){URL.revokeObjectURL(url);},2000);
toast('Calendar file downloaded', 'ok');
}

function parseTime(timeStr) {
var parts = (timeStr||'').split(':');
return parseInt(parts[0]||0)*60 + parseInt(parts[1]||0);
}

function detectClash(forCid, date, time) {
if (!time) return [];
var clashes = [];
var bookTime = parseTime(time);
Object.keys(S.clients).forEach(function(cid) {
var c = S.clients[cid];
Object.values(c.sessions||{}).forEach(function(s) {
if (s.date===date && s.status==='upcoming' && s.time) {
var sessTime = parseTime(s.time);
if (Math.abs(bookTime - sessTime) < 60) {
clashes.push({clientId:cid, clientName:c.name, time:s.time});
}
}
});
});
return clashes;
}

function getDateOffset(days) {
var d = new Date(); d.setDate(d.getDate()+days);
return d.toISOString().split('T')[0];
}


function renderPhotoCalButton() {
return '<button onclick="openPhotoCalorie()" style="display:flex;align-items:center;gap:8px;width:100%;padding:12px;background:rgba(99,102,241,.08);border:1px dashed rgba(99,102,241,.3);border-radius:12px;color:var(--acc);font-size:13px;font-weight:700;cursor:pointer;margin-bottom:14px">' +
'<span style="font-size:20px">&#128248;</span>' +
'<div style="text-align:left"><div>Count Calories from Photo</div>' +
'<div style="font-size:10px;color:var(--m2);font-weight:400;margin-top:1px">AI estimate &bull; results may vary</div></div></button>';
}

function setIncomeMonth(el) {
S.incomeMonth = el.getAttribute('data-month');
R();
}

function setSchedDay(el) {
S.schedDate = el.getAttribute('data-date');
S.schedView = 'day';
R();
}

function goTab(tab) {
S.tTab = tab; S.vCli = null; R();
}

function setCTab(tab) { S.cTab = tab; R(); }

function startWorkout(dayIdx) {
if (dayIdx >= 0) { S.day = dayIdx; S.wkDayOpen = dayIdx; }
S.cTab = 'workout';
R();
}

function setClientFilter(f) { S.clientFilter = f; R(); }

function setSchedView(v) { S.schedView = v; R(); }
