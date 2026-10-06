// ===== ADMIN (Broker) SITE: hospitals approve/add, bookings, live token, settlement, settings =====
var PIN="1234"; // yahan apna PIN badlein
var TABS=["hosp","book","live","sett","set"];
function unlock(){if($("pin").value==PIN){try{sessionStorage.setItem("opd_adm","1")}catch(e){}enter()}else $("e0").textContent="Galat PIN."}
function enter(){$("lock").classList.add("hide");$("app").classList.remove("hide");$("anav").classList.remove("hide");go("hosp")}
function logout(){try{sessionStorage.removeItem("opd_adm")}catch(e){}location.reload()}
function go(v){TABS.forEach(function(s){$(s).classList.toggle("hide",s!=v)});
document.querySelectorAll("#anav button[data-v]").forEach(function(b){b.classList.toggle("on",b.dataset.v==v)});
load();renderAll();if(v=="set")fillSet();scrollTo(0,0)}
document.querySelectorAll("#anav button[data-v]").forEach(function(b){b.onclick=function(){go(b.dataset.v)}});
function renderAll(){hospT();bookT();liveT();settT()}
// ---------- hospitals ----------
function hospT(){$("htbl").innerHTML='<tr><th>Hospital</th><th>Area, Phone</th><th>Fee</th><th>Doctors</th><th>Status</th><th></th></tr>'+HOSP.map(function(h){
return '<tr><td>'+esc(h.name)+'</td><td>'+esc(h.area)+'<br><small>'+esc(h.phone)+'</small></td><td>'+rs(h.fee)+'</td><td>'+h.docs.length+'</td><td>'+h.status+'</td><td>'
+(h.status!="approved"?'<button class="btn mini" onclick="hSet('+h.id+',1)">Approve</button> ':'<button class="btn alt mini" onclick="hSet('+h.id+',0)">Band karein</button> ')
+(h.status=="pending"?'<button class="btn alt mini" onclick="hSet('+h.id+',0)">Reject</button> ':'')+'<button class="btn alt mini" onclick="hDel('+h.id+')">Hataein</button></td></tr>'}).join("")}
function hSet(id,ok){load();HOSP.forEach(function(h){if(h.id==id)h.status=ok?"approved":"rejected"});saveH();renderAll()}
function hDel(id){if(!confirm("Is hospital ko hata dein?"))return;load();HOSP=HOSP.filter(function(h){return h.id!=id});saveH();renderAll()}
function addHosp(){load();var n=$("an").value.trim(),ar=$("aa").value.trim(),p=$("ap").value.trim(),fs=$("af").value,e=$("eh"),
d=$("ad").value.split("\n").map(function(s){return s.trim()}).filter(Boolean);
if(n.length<3)return e.textContent="Hospital ka naam likhiye.";
if(!ar)return e.textContent="Area / City likhiye.";
if(!/^\d{10}$/.test(p))return e.textContent="Sahi 10 digit phone number daaliye.";
if(fs===""||+fs<0)return e.textContent="Consultation fee daaliye.";
if(!d.length||d.some(function(x){var q=x.split("|");return q.length<2||!q[0].trim()||!q[1].trim()}))return e.textContent="Har doctor ki line 'Naam | Department' format me likhiye.";
if(HOSP.some(function(x){return x.name.toLowerCase()==n.toLowerCase()}))return e.textContent="Is naam ka hospital pehle se hai.";
HOSP.push({id:Date.now(),name:n,area:ar,phone:p,fee:+fs,docs:d,status:"approved"});saveH();e.textContent="";["an","aa","ap","af","ad"].forEach(function(i){$(i).value=""});renderAll()}
// ---------- bookings ----------
function bookT(){var f=$("fh"),cur=f.value;f.innerHTML='<option value="">Sab hospitals</option>'+HOSP.map(function(h){return '<option>'+esc(h.name)+'</option>'}).join("");f.value=cur;
var l=aps.filter(function(a){return!f.value||a.hosp==f.value}).sort(function(a,b){return(a.date+a.time)<(b.date+b.time)?-1:1});
$("tbl").innerHTML='<tr><th>Token</th><th>Patient</th><th>Mobile</th><th>Hospital, Doctor</th><th>Date, Time</th><th>Status</th><th></th></tr>'+(l.length?l.map(function(a){return '<tr><td>'+a.token+'</td><td>'+esc(a.name)+' ('+a.age+')</td><td>'+esc(a.mobile)+'</td><td>'+esc(a.hosp||"")+'<br><small>'+esc(a.doc)+' ('+esc(a.dept)+')</small></td><td>'+a.date+', '+a.time+'</td><td>'+st(a)+'</td><td><button class="btn alt mini" onclick="bdel('+a.id+')">Hataein</button></td></tr>'}).join(""):'<tr><td colspan="7">Abhi koi booking nahi. "Demo data daalein" dabayein.</td></tr>')}
function bdel(id){load();aps=aps.filter(function(a){return a.id!=id});saveAps();renderAll()}
function clearAp(){if(!confirm("Saari bookings hata dein?"))return;aps=[];saveAps();renderAll()}
function seed(){load();var N=["Ramesh Kumar","Sunita Devi","Amit Yadav","Pooja Mishra","Imran Ali","Kavita Joshi"],d=docs();if(!d.length)return;
N.forEach(function(n,i){var x=d[i%d.length],t=cfg.slots[Math.floor(i/d.length)%cfg.slots.length];
if(aps.some(function(a){return a.doc==x.n&&a.hosp==x.h&&a.date==today()&&a.time==t&&a.status!="cancelled"}))return;
aps.push({id:Date.now()+i,name:n,mobile:"98"+(10000000+i*1111111),age:22+i*7,gender:i%2?"Female":"Male",hosp:x.h,fee:hf(x.h),paid:true,paidAmt:hf(x.h),dept:x.d,doc:x.n,date:today(),time:t,
token:aps.filter(function(a){return a.doc==x.n&&a.hosp==x.h&&a.date==today()}).length+1,wait:0})});saveAps();renderAll()}
// ---------- live token ----------
function liveT(){$("ctl").innerHTML=docs().map(function(d,i){return '<div class="tk"><b>'+(nowTok(d.n,d.h)||"-")+'</b><div><strong>'+esc(d.n)+'</strong> ['+esc(d.h)+'] (Aaj ke token: '+maxTok(d.n,d.h)+')<br><button class="btn alt mini" onclick="bump('+i+',-1)">◀ Piche</button> <button class="btn mini" onclick="bump('+i+',1)">Agla token ▶</button> <button class="btn alt mini" onclick="bump('+i+',0)">Reset</button></div></div>'}).join("")||"<p>Koi approved hospital nahi.</p>"}
function bump(i,x){load();var d=docs()[i],k=d.n+"|"+d.h+"|"+today();NOW[k]=x?Math.max(0,Math.min(maxTok(d.n,d.h),nowTok(d.n,d.h)+x)):0;saveNow();liveT()}
// ---------- settlement ----------
function settT(){var L={};aps.forEach(function(a){if(!a.paid||!a.hosp)return;var r=L[a.hosp]||(L[a.hosp]={c:0,n:0});r.c++;r.n+=a.paidAmt-(a.refund||0)});
var tn=0,tc=0,rows=Object.keys(L).map(function(k){var c=Math.round(L[k].n*cfg.commission/100);tn+=L[k].n;tc+=c;return '<tr><td>'+esc(k)+'</td><td>'+L[k].c+'</td><td>'+rs(L[k].n)+'</td><td>'+rs(c)+'</td><td>'+rs(L[k].n-c)+'</td></tr>'}).join("");
$("ltbl").innerHTML='<tr><th>Hospital</th><th>Paid bookings</th><th>Net collected</th><th>Commission ('+cfg.commission+'%)</th><th>Hospital ko dena</th></tr>'+(rows||'<tr><td colspan="5">Abhi koi paid booking nahi.</td></tr>');
$("lsum").innerHTML="Broker ki kamai: <strong>"+rs(tc)+"</strong> | Hospitals ko settlement: <strong>"+rs(tn-tc)+"</strong>";
var P=Object.keys(PT);$("ptbl").innerHTML='<tr><th>Naam</th><th>Mobile</th><th>Umar</th><th>Bookings</th></tr>'+(P.length?P.map(function(m){var p=PT[m];return '<tr><td>'+esc(p.name)+'</td><td>'+esc(m)+'</td><td>'+p.age+'</td><td>'+aps.filter(function(a){return a.mobile==m}).length+'</td></tr>'}).join(""):'<tr><td colspan="4">Abhi koi patient registered nahi.</td></tr>')}
// ---------- settings ----------
function fillSet(){$("cn").value=cfg.name;$("cc").value=cfg.color;$("ctg").value=cfg.tag;$("cd").value=cfg.depts.join(", ");$("cm").value=cfg.mins;$("cf1").value=cfg.fee;$("cp").value=cfg.cancelPct;$("cmm").value=cfg.commission;$("cu").value=cfg.upi}
function saveSet(){load();var c=Object.assign({},cfg);c.name=$("cn").value||DEF.name;c.color=$("cc").value;c.tag=$("ctg").value;
c.depts=$("cd").value.split(",").map(function(s){return s.trim()}).filter(Boolean);c.mins=+$("cm").value||8;c.fee=+$("cf1").value||0;
c.cancelPct=Math.min(100,Math.max(0,+$("cp").value||0));c.commission=Math.min(90,Math.max(0,+$("cmm").value||0));c.upi=$("cu").value.trim()||DEF.upi;
sv("opd_cfg",c);load();theme();renderAll();alert("Save ho gaya.")}
function resetAll(){if(confirm("Sab kuch reset hoga (settings, hospitals, patients, bookings). Pakka?")){["opd_cfg","opd_aps","opd_h","opd_pt","opd_me","opd_now"].forEach(function(k){try{localStorage.removeItem(k)}catch(e){}});location.reload()}}
window.onData=function(){if(!$("app").classList.contains("hide"))renderAll()};
theme();try{if(sessionStorage.getItem("opd_adm"))enter()}catch(e){}
