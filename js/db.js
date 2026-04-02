var FB_CONFIG = {
apiKey: "AIzaSyBdCybj28adk2cmfFkMsmNwsKRWuOE3Bcc",
authDomain: "ahmed-pt-app-1ef9a.firebaseapp.com",
databaseURL: "https://ahmed-pt-app-1ef9a-default-rtdb.europe-west1.firebasedatabase.app",
projectId: "ahmed-pt-app-1ef9a",
storageBucket: "ahmed-pt-app-1ef9a.firebasestorage.app",
messagingSenderId: "195787613775",
appId: "1:195787613775:web:bca16867212fcee9c02c3a"
};
var FB_LOCAL_ONLY = ['sess'];

var DB = {
_fb: null,
_prefix: '',
_fbPath: 'ahmedpt',
get: function(k) {
try { var v = localStorage.getItem(DB._prefix+k); return v ? JSON.parse(v) : null; } catch(e) { return null; }
},
set: function(k, v) {
try { localStorage.setItem(DB._prefix+k, JSON.stringify(v)); } catch(e) {}
if (DB._fb && FB_LOCAL_ONLY.indexOf(k) === -1) {
DB._fb.ref(DB._fbPath+'/'+k).set(v).catch(function(){});
}
},
del: function(k) {
try { localStorage.removeItem(DB._prefix+k); } catch(e) {}
if (DB._fb && FB_LOCAL_ONLY.indexOf(k) === -1) {
DB._fb.ref(DB._fbPath+'/'+k).remove().catch(function(){});
}
},
fbRef: function(path) {
return DB._fb ? DB._fb.ref(DB._fbPath+'/'+path) : null;
}
};

function syncFromFirebase(callback) {
try {
if (!window.firebase) { toast('Offline mode - no sync', 'info'); callback(); return; }
if (!firebase.apps.length) firebase.initializeApp(FB_CONFIG);
DB._fb = firebase.database();
var done = false;
var timer = setTimeout(function() {
if (!done) { done = true; toast('Sync timed out - offline mode', 'err'); callback(); }
}, 6000);
DB._fb.ref(DB._fbPath).once('value').then(function(snap) {
if (done) return;
done = true; clearTimeout(timer);
var data = snap.val() || {};
var count = Object.keys(data).length;
Object.keys(data).forEach(function(k) {
if (FB_LOCAL_ONLY.indexOf(k) === -1) {
try { localStorage.setItem(DB._prefix+k, JSON.stringify(data[k])); } catch(e) {}
}
});
toast(count > 0 ? 'Synced from cloud (' + count + ' items)' : 'Connected - no cloud data yet', 'ok');
callback();
}).catch(function(err) {
if (!done) {
done = true; clearTimeout(timer);
toast('Firebase error: ' + (err.message || err.code || 'check rules'), 'err');
callback();
}
});
} catch(e) { toast('Firebase init error: ' + e.message, 'err'); callback(); }
}
