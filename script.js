var DEF={name:"Smart Healthcare & OPD System",tag:"No long queues. Get your OPD slip and token from home. Choose your doctor and arrive on time.",color:"#0f766e",mins:8,fee:300,hospital:"City Care Hospital",hospitals:["City Care Hospital | Civil Lines | citycare@upi | 300","Shanti Hospital | Station Road | shanti@upi | 250"],cancelPct:20,upi:"hospital@upi",
depts:["General Medicine","ENT","Orthopedic","Pediatrics","Dermatology"],
docs:["Dr. A. Sharma | General Medicine","Dr. R. Verma | General Medicine","Dr. S. Khan | ENT","Dr. P. Singh | Orthopedic","Dr. N. Gupta | Pediatrics","Dr. M. Rao | Dermatology"],
slots:["09:00","10:00","11:00","12:00","14:00","15:00","16:00"]};
// AI (demo): keyword scoring. In the real project this will be replaced by a scikit-learn model.
// NOTE: keywords below are kept as typed by users (Hindi/Hinglish + English) so matching works unchanged.
var KW={"General Medicine":"bukhar fever cold khansi cough sardi thakan weakness pet stomach sugar bp headache sirdard ulti loose","ENT":"kaan ear gala throat naak nose sinus tonsil sunai","Orthopedic":"haddi bone ghutna knee kamar back joint jodo fracture chot shoulder kandha","Pediatrics":"bachcha baby child bachche infant teeka vaccine","Dermatology":"skin twacha daane rash kharish itching khujli pimple acne baal hair"};
function ld(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}
function sv(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
var $=function(i){return document.getElementById(i)};
var cfg=Object.assign({},DEF,ld("opd_cfg",{})),aps=ld("opd_aps",[]),B={};
function docs(){return cfg.docs.map(function(l){var p=l.split("|");return{n:p[0].trim(),d:(p[1]||"").trim(),h:(p[2]||"").trim()}})}
function today(){return new Date().toISOString().slice(0,10)}
function theme(){document.documentElement.style.setProperty("--brand",cfg.color);$("hn").textContent=cfg.name;$("hh").textContent=hosps().length>1?hosps().length+" hospitals":hosps()[0].name;$("ht").textContent=hosps().length>1?cfg.name:hosps()[0].name;$("hs").textContent=cfg.tag;document.title=cfg.name;renderHosps();feeBar()}
function stats(){var t=aps.filter(function(a){return a.date==today()&&a.status!="cancelled"}).length;
$("stats").innerHTML=[[cfg.depts.length,"Departments"],[docs().length,"Doctors"],[t,"Today's appointments"],[aps.filter(function(a){return a.status!="cancelled"}).length,"Total patients"]].map(function(x){return '<div class="box"><b>'+x[0]+'</b>'+x[1]+'</div>'}).join("")}
function go(v){["home","book","admin"].forEach(function(s){$(s).classList.toggle("hide",s!=v)});
document.querySelectorAll("nav button").forEach(function(b){b.classList.toggle("on",b.dataset.v==v)});
if(v=="home")stats();if(v=="admin"&&!$("panel").classList.contains("hide"))renderAdmin();scrollTo(0,0)}
document.querySelectorAll("nav button").forEach(function(b){b.onclick=function(){go(b.dataset.v)}});
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function suggest(){var t=$("sym").value.toLowerCase(),best=null,bs=0;
cfg.depts.forEach(function(d){var w=(KW[d]||d.toLowerCase()).split(" "),s=0;w.forEach(function(k){if(k&&t.indexOf(k)>-1)s++});if(s>bs){bs=s;best=d}});
var b=$("aiBox");if(best){b.classList.remove("hide");b.textContent="AI suggestion: "+best+" department";B.sug=best}else{b.classList.add("hide");B.sug=null}}
$("sym").oninput=suggest;
function next1(){var n=$("pn").value.trim(),m=$("pm").value.trim(),a=+$("pa").value,e=$("e1");
if(!B.hosp)return e.textContent="Please select a hospital from above first.";
if(n.length<2)return e.textContent="Please enter your name.";
if(!/^[6-9]\d{9}$/.test(m))return e.textContent="Please enter a valid 10-digit mobile number.";
if(!a||a<0||a>120)return e.textContent="Please enter a valid age.";
e.textContent="";B.p={name:n,mobile:m,age:a,gender:$("pg").value};B.dept=null;B.doc=null;
$("depts").innerHTML=cfg.depts.map(function(d){return '<button class="chip'+(d==B.sug?' sel':'')+'" data-d="'+esc(d)+'">'+esc(d)+(d==B.sug?' (AI)':'')+'</button>'}).join("");
if(B.sug)B.dept=B.sug;
$("s2").classList.remove("off");$("depts").querySelectorAll(".chip").forEach(function(c){c.onclick=function(){pickDept(c.dataset.d)}});
if(B.dept)pickDept(B.dept);$("s2").scrollIntoView({behavior:"smooth"})}
function pickDept(d){B.dept=d;B.doc=null;$("depts").querySelectorAll(".chip").forEach(function(c){c.classList.toggle("sel",c.dataset.d==d)});
var l=docs().filter(function(x){return x.d==d&&(!x.h||x.h==B.hosp.name)});
$("docs").innerHTML=l.length?l.map(function(x){return '<button class="chip" data-n="'+esc(x.n)+'">'+esc(x.n)+'</button>'}).join(""):'<span class="err">There is no doctor in this department. Please ask the admin to add one.</span>';
$("s3").classList.remove("off");$("s4").classList.add("off");
$("docs").querySelectorAll(".chip").forEach(function(c){c.onclick=function(){pickDoc(c.dataset.n)}})}
function pickDoc(n){B.doc=n;$("docs").querySelectorAll(".chip").forEach(function(c){c.classList.toggle("sel",c.dataset.n==n)});
$("s4").classList.remove("off");$("dt").min=today();if(!$("dt").value)$("dt").value=today();
$("tm").innerHTML=cfg.slots.map(function(s){return '<option>'+s+'</option>'}).join("")}
function confirmBook(){var d=$("dt").value,t=$("tm").value,e=$("e4");
if(!B.doc)return e.textContent="Please select a doctor.";
if(!d||d<today())return e.textContent="Please select today's date or a future date.";
if(aps.some(function(a){return a.doc==B.doc&&a.date==d&&a.time==t&&a.hosp==B.hosp.name&&a.status!="cancelled"}))return e.textContent="This slot is already booked. Please choose another time.";
e.textContent="";
var n=aps.filter(function(a){return a.doc==B.doc&&a.date==d&&a.hosp==B.hosp.name}).length+1;
var ap=Object.assign({id:Date.now(),hosp:B.hosp.name,fee:B.hosp.fee,upi:B.hosp.upi,dept:B.dept,doc:B.doc,date:d,time:t,token:n},B.p);
ap.wait=estWait(ap);aps.push(ap);sv("opd_aps",aps);payStep(ap)}
function showParchi(a){["s1","s2","s3","s4"].forEach(function(i){$(i).classList.add("hide")});$("s5").classList.remove("hide");
$("parchi").innerHTML='<div class="parchi"><h2>'+esc(a.hosp||cfg.hospital)+'</h2><p style="text-align:center;margin:0">Digital OPD Slip</p><p style="text-align:center;margin:10px 0 0">Token number</p><div class="token">'+a.token+'</div>'
+'<dl><dt>Patient</dt><dd>'+esc(a.name)+'</dd><dt>Age / Gender</dt><dd>'+a.age+' / '+esc(a.gender)+'</dd><dt>Mobile</dt><dd>'+esc(a.mobile)+'</dd><dt>Department</dt><dd>'+esc(a.dept)+'</dd><dt>Doctor</dt><dd>'+esc(a.doc)+'</dd><dt>Date, Time</dt><dd>'+a.date+', '+a.time+'</dd><dt>Estimated wait</dt><dd>'+(a.token-1)*cfg.mins+' minutes</dd><dt>Payment</dt><dd>'+st(a)+'</dd></dl><small>Slip ID: '+a.id+'</small></div>'}
function resetBook(){B={};["s1","s2","s3","s4"].forEach(function(i){$(i).classList.remove("hide")});["s2","s3","s4"].forEach(function(i){$(i).classList.add("off")});$("s5").classList.add("hide");["pn","pm","pa","sym"].forEach(function(i){$(i).value=""});$("aiBox").classList.add("hide");scrollTo(0,0)}
function unlock(){if($("pin").value=="1234"){$("lock").classList.add("hide");$("panel").classList.remove("hide");renderAdmin();fillCfg()}else $("e0").textContent="Wrong PIN."}
function renderAdmin(){var f=$("fd"),cur=f.value;f.innerHTML='<option value="">All departments</option>'+cfg.depts.map(function(d){return '<option>'+esc(d)+'</option>'}).join("");f.value=cur;
var l=aps.filter(function(a){return!f.value||a.dept==f.value}).sort(function(a,b){return(a.date+a.time)<(b.date+b.time)?-1:1});
$("tbl").innerHTML='<tr><th>Token</th><th>Patient</th><th>Mobile</th><th>Department</th><th>Doctor</th><th>Date, Time</th><th>Status</th><th></th></tr>'+(l.length?l.map(function(a){return '<tr><td>'+a.token+'</td><td>'+esc(a.name)+' ('+a.age+')</td><td>'+esc(a.mobile)+'</td><td>'+esc(a.dept)+'</td><td>'+esc(a.doc)+(a.hosp?'<br><small>'+esc(a.hosp)+'</small>':'')+'</td><td>'+a.date+', '+a.time+'</td><td>'+st(a)+'</td><td><button class="btn alt mini" onclick="del('+a.id+')">Remove</button></td></tr>'}).join(""):'<tr><td colspan="8">No appointments yet. Click "Add demo data".</td></tr>')}
function del(id){aps=aps.filter(function(a){return a.id!=id});sv("opd_aps",aps);renderAdmin()}
function clearAp(){aps=[];sv("opd_aps",aps);renderAdmin()}
function seed(){var N=["Ramesh Kumar","Sunita Devi","Amit Yadav","Pooja Mishra","Imran Ali","Kavita Joshi"],d=docs();
N.forEach(function(n,i){var x=d[i%d.length];aps.push({id:Date.now()+i,name:n,mobile:"98"+(10000000+i*1111111),age:22+i*7,gender:i%2?"Female":"Male",hosp:hosps()[0].name,fee:hosps()[0].fee,dept:x.d,doc:x.n,date:today(),time:cfg.slots[i%cfg.slots.length],token:aps.filter(function(a){return a.doc==x.n&&a.date==today()}).length+1})});
sv("opd_aps",aps);renderAdmin()}
function fillCfg(){$("cn").value=cfg.name;$("cc").value=cfg.color;$("ctg").value=cfg.tag;$("cd").value=cfg.depts.join(", ");$("cdoc").value=cfg.docs.join("\n");$("cm").value=cfg.mins;$("cf1").value=cfg.fee;$("cp").value=cfg.cancelPct;$("cu").value=cfg.upi;$("ch").value=cfg.hospitals.join("\n")}
function saveCfg(){cfg.name=$("cn").value||DEF.name;cfg.color=$("cc").value;cfg.tag=$("ctg").value;
cfg.depts=$("cd").value.split(",").map(function(s){return s.trim()}).filter(Boolean);
cfg.docs=$("cdoc").value.split("\n").map(function(s){return s.trim()}).filter(Boolean);cfg.mins=+$("cm").value||8;cfg.fee=+$("cf1").value||0;cfg.cancelPct=Math.min(100,Math.max(0,+$("cp").value||0));cfg.upi=$("cu").value.trim()||DEF.upi;cfg.hospitals=$("ch").value.split("\n").map(function(s){return s.trim()}).filter(Boolean);if(!cfg.hospitals.length)cfg.hospitals=DEF.hospitals;cfg.hospital=hosps()[0].name;
sv("opd_cfg",cfg);theme();stats();renderAdmin();alert("Saved.")}
function resetAll(){if(confirm("Both settings and appointments will be reset. Are you sure?")){try{localStorage.removeItem("opd_cfg");localStorage.removeItem("opd_aps")}catch(e){}location.reload()}}
theme();stats();

// ===== Waiting-time estimate (JS formula; change per-patient minutes here) =====
var AVG={"General Medicine":9,"ENT":7,"Orthopedic":10,"Pediatrics":8,"Dermatology":6};
function estWait(a){var ahead=aps.filter(function(x){return x.doc==a.doc&&x.date==a.date&&x.time<a.time&&x.status!="cancelled"}).length,h=+a.time.slice(0,2);
return Math.round(ahead*(AVG[a.dept]||cfg.mins)*(h>=10&&h<=12?1.15:1))}

// ===== Chatbot (keyword intents; add new question-answers in INTENTS) =====
var INTENTS=[
["greet","hello hi namaste hey"],["book","book booking appointment parchi register token"],
["doctors","doctor doctors dr"],["depts","department departments opd treatment"],
["hosp","hospital hospitals aspatal"],["fee","fee charge paisa rupaye amount payment refund cancel"],["wait","wait waiting line kitni der"],["timing","timing time slot kab baje khula"],["thanks","thanks shukriya dhanyavad bye"]];
function bot(t){t=t.toLowerCase();
if(/seene|chest|saans|breath|behosh|unconscious|khoon|bleeding|heart attack|stroke|lakwa/.test(t))return"This could be an emergency. Do not wait for the OPD. Call 112 immediately or go to the nearest emergency room.";
var best=null,bs=0;INTENTS.forEach(function(i){var s=0;i[1].split(" ").forEach(function(k){if(t.split(/\W+/).indexOf(k)>-1)s++});if(s>bs){bs=s;best=i[0]}});
var d=null,ds=0;cfg.depts.forEach(function(x){var s=0;(KW[x]||"").split(" ").forEach(function(k){if(k&&t.indexOf(k)>-1)s++});if(s>ds){ds=s;d=x}});
if(ds>0&&best!="doctors"&&best!="depts")return"Based on your symptoms, the "+d+" department would be suitable. Select this department in Book OPD. This is only a suggestion; consulting a doctor is necessary.";
var R={greet:"Hello! Ask about booking, doctors, timings, or describe your symptoms.",
book:"On the home page, click 'Book OPD': complete registration, then choose the department, doctor, date and time. At the end you will get a token and a digital slip.",
doctors:"Doctors: "+cfg.docs.join("; "),depts:"Departments: "+cfg.depts.join(", "),
wait:"The slip shows the estimated waiting time. It depends on the number of patients ahead of you with your doctor.",
fee:"Fee: "+hosps().map(function(x){return x.name+" "+rs(x.fee)}).join(", ")+" (via UPI QR). If you cancel, a "+cfg.cancelPct+"% charge is deducted and the rest is refunded.",hosp:"Hospitals: "+hosps().map(function(x){return x.name+(x.area?" ("+x.area+")":"")}).join("; ")+". In Book OPD, select the hospital first.",timing:"Time slots: "+cfg.slots.join(", "),thanks:"You're welcome. Stay healthy!"};
return R[best]||"Sorry, I didn't understand. Ask about booking, doctors, departments, timings, or describe your symptoms (e.g. ear pain)."}
(function(){var d=document.createElement("div");d.id="cb";d.className="noprint";
d.innerHTML='<div id="cw"><h4>AI Assistant</h4><div id="cm" aria-live="polite"><div>Hello! Ask about booking, doctors, timings, or describe your symptoms.</div></div><div class="chips" id="cq" style="padding:0 10px 8px"></div><form id="cf"><input id="ci" placeholder="Type here..." aria-label="Message"><button class="btn mini">Send</button></form></div><button id="ct">🤖 AI Assistant</button>';
document.body.appendChild(d);
function add(t,c){var m=document.createElement("div");m.textContent=t;if(c)m.className=c;$("cm").appendChild(m);$("cm").scrollTop=1e9}
$("ct").onclick=function(){$("cw").classList.toggle("on")};
function ask(t){add(t,"me");add(bot(t))}
["Doctors list","Time slots","Ear pain","How to book"].forEach(function(q){var b=document.createElement("button");b.type="button";b.className="chip sq";b.textContent=q;b.onclick=function(){ask(q)};$("cq").appendChild(b)});
$("cf").onsubmit=function(e){e.preventDefault();var t=$("ci").value.trim();if(!t)return;$("ci").value="";ask(t)}})();


// ===== Dark mode =====
(function(){var r=document.documentElement,b=$("dm");
function dark(){return r.dataset.theme?r.dataset.theme=="dark":matchMedia("(prefers-color-scheme:dark)").matches}
function paint(){b.textContent=dark()?"☀️":"🌙"}
try{var t=localStorage.getItem("opd_theme");if(t)r.dataset.theme=t}catch(e){}
paint();
b.onclick=function(){var t=dark()?"light":"dark";r.dataset.theme=t;try{localStorage.setItem("opd_theme",t)}catch(e){}paint()}})();

// ===== View token number (by mobile) =====
function findTok(){var m=$("tk").value.trim(),o=$("tkr");
if(!/^\d{10}$/.test(m)){o.innerHTML='<p class="err">Please enter a valid 10-digit mobile number.</p>';return}
var l=aps.filter(function(a){return a.mobile==m&&a.date>=today()});
o.innerHTML=l.length?l.map(function(a){return '<div class="tk"><b>'+a.token+'</b><div><strong>'+esc(a.name)+'</strong><br>'+esc(a.doc)+' ('+esc(a.dept)+')<br>'+a.date+', '+a.time+(a.wait!=null?' | Estimated wait: '+a.wait+' min':'')+'<br>'+st(a)+tkLive(a)+(a.status=="cancelled"?'':'<br><button class="btn alt mini" onclick="cancelAp('+a.id+')">Cancel booking</button>')+'</div></div>'}).join(""):'<p class="err">No upcoming appointment found for this number.</p>'}

function openChat(){$("cw").classList.add("on");$("ci").focus()}


// ===== Currently running token (Live) =====
var NOW=ld("opd_now",{});
function nowTok(d){return NOW[d+"|"+today()]||0}
function maxTok(d){return aps.filter(function(a){return a.doc==d&&a.date==today()&&a.status!="cancelled"}).reduce(function(m,a){return Math.max(m,a.token)},0)}
function board(){$("board").innerHTML=docs().map(function(d){var n=nowTok(d.n),t=maxTok(d.n);
return '<div class="tk"><b>'+(n||"-")+'</b><div><strong>'+esc(d.n)+'</strong> ('+esc(d.d)+')<br>'+(n?'Token '+n+' is currently running':'Not started yet')+(t?' | Total today: '+t:'')+'</div></div>'}).join("")}
function tkLive(a){if(a.date!=today())return"";var n=nowTok(a.doc);
return'<br>Currently running token: <strong>'+(n||"-")+'</strong> | '+(a.token>n?'Tokens before you: '+(a.token-n-1):'Your turn has come')}
function ctl(){$("ctl").innerHTML=docs().map(function(d,i){return '<div class="tk"><b>'+(nowTok(d.n)||"-")+'</b><div><strong>'+esc(d.n)+'</strong> (Today\'s tokens: '+maxTok(d.n)+')<br><button class="btn alt mini" onclick="bump('+i+',-1)">◀ Back</button> <button class="btn mini" onclick="bump('+i+',1)">Next token ▶</button> <button class="btn alt mini" onclick="bump('+i+',0)">Reset</button></div></div>'}).join("")}
function bump(i,x){var d=docs()[i].n,k=d+"|"+today();NOW[k]=x?Math.max(0,Math.min(maxTok(d),nowTok(d)+x)):0;sv("opd_now",NOW);ctl();board()}
var _st=stats;stats=function(){_st();board()};
var _ra=renderAdmin;renderAdmin=function(){_ra();ctl()};
addEventListener("storage",function(){NOW=ld("opd_now",{});aps=ld("opd_aps",[]);board()});
board();


// ===== UPI payment QR + Booking cancel (with charge) =====
var CUR=null;
function rs(n){return"₹"+n}
function upiLink(a){return"upi://pay?pa="+encodeURIComponent(a.upi)+"&pn="+encodeURIComponent(a.hosp)+"&am="+a.fee+"&cu=INR&tn="+encodeURIComponent("OPD Token "+a.token)}
function st(a){return a.status=="cancelled"?"Cancelled (Charge "+rs(a.charge)+", Refund "+rs(a.refund)+")":a.fee?(a.paid?"Paid "+rs(a.paidAmt):"Payment pending"):"Free"}
function hideSteps(){["s0","s1","s2","s3","s4","s5","s6"].forEach(function(i){$(i).classList.add("hide")})}
function payStep(a){CUR=a;if(!a.fee)return showParchi(a);hideSteps();$("s6").classList.remove("hide");var l=upiLink(a);
$("pay").innerHTML='<p><strong>'+esc(a.hosp)+'</strong></p><p>Token <strong>'+a.token+'</strong> | '+esc(a.doc)+' | '+a.date+', '+a.time+'</p><div style="text-align:center"><div class="qr">'+(window.makeQR?makeQR(l):"")+'</div><p>Scan and pay <strong>'+rs(a.fee)+'</strong><br><small>UPI ID: '+esc(a.upi)+'</small></p><a class="btn alt mini" href="'+esc(l)+'">Open UPI app on phone</a></div>'
+'<label for="utr">UPI reference / UTR number (12 digits, optional)</label><input id="utr" inputmode="numeric" maxlength="12"><div class="err" id="e6"></div>'
+'<p style="color:var(--mute);font-size:.9rem">Cancellation policy: if you cancel the booking, '+cfg.cancelPct+'% ('+rs(Math.round(a.fee*cfg.cancelPct/100))+') will be deducted and the rest will be refunded.</p>'
+'<button class="btn" onclick="paid()">I have paid</button> <button class="btn alt" onclick="cancelAp(CUR.id)">Cancel</button>'}
function paid(){var u=$("utr").value.trim();if(u&&!/^\d{12}$/.test(u))return $("e6").textContent="UTR must be 12 digits.";
CUR.paid=true;CUR.paidAmt=CUR.fee;if(u)CUR.utr=u;sv("opd_aps",aps);$("s6").classList.add("hide");showParchi(CUR)}
function cancelAp(id){var a=aps.filter(function(x){return x.id==id})[0];if(!a||a.status=="cancelled")return;
var c=a.paid?Math.round(a.paidAmt*cfg.cancelPct/100):0,r=a.paid?a.paidAmt-c:0;
if(!confirm(a.paid?"If you cancel, a cancellation charge of "+rs(c)+" ("+cfg.cancelPct+"%) will be deducted.\nRefund: "+rs(r)+"\nAre you sure you want to cancel?":"Cancel the booking? Payment has not been made, so no charge will apply."))return;
a.status="cancelled";a.charge=c;a.refund=r;sv("opd_aps",aps);
if(CUR&&CUR.id==id&&(!$("s5").classList.contains("hide")||!$("s6").classList.contains("hide"))){hideSteps();$("s5").classList.remove("hide");$("cxl").classList.add("hide");
$("parchi").innerHTML='<div class="parchi"><h2>Booking Cancelled</h2><p style="text-align:center;margin:0">'+esc(a.hosp||cfg.hospital)+'</p><dl><dt>Token</dt><dd>'+a.token+'</dd><dt>Doctor</dt><dd>'+esc(a.doc)+'</dd><dt>Paid</dt><dd>'+rs(a.paid?a.paidAmt:0)+'</dd><dt>Cancel charge</dt><dd>'+rs(c)+'</dd><dt>Refund</dt><dd>'+rs(r)+'</dd></dl><small>The refund will be processed from the hospital desk.</small></div>'}
if(/^\d{10}$/.test($("tk").value.trim()))findTok();
if(!$("panel").classList.contains("hide"))renderAdmin();stats()}
var _sp2=showParchi;showParchi=function(a){CUR=a;_sp2(a);$("cxl").classList.toggle("hide",a.status=="cancelled")};
var _rb=resetBook;resetBook=function(){_rb();$("s6").classList.add("hide");$("cxl").classList.remove("hide")};

function feeBar(){var m=cfg.fee?"Consultation fee: <strong>"+rs(cfg.fee)+"</strong> (payment via UPI QR after booking). If you cancel, "+cfg.cancelPct+"% ("+rs(Math.round(cfg.fee*cfg.cancelPct/100))+") will be charged.":"Consultation fee: <strong>Free</strong>";
$("feeBar").innerHTML="🏥 "+esc(cfg.hospital)+" | "+m;$("fee4").innerHTML="Payable amount: <strong>"+(cfg.fee?rs(cfg.fee):"Free")+"</strong>"+(cfg.fee?". The UPI QR for ₹"+cfg.fee+" will appear as soon as you confirm.":"")}
feeBar();


// ===== Patient chooses the hospital =====
function hosps(){var r=cfg.hospitals.map(function(l){var p=l.split("|").map(function(s){return s.trim()});return{name:p[0],area:p[1]||"",upi:p[2]||cfg.upi,fee:p[3]?+p[3]||0:cfg.fee}}).filter(function(x){return x.name});
return r.length?r:[{name:cfg.hospital,area:"",upi:cfg.upi,fee:cfg.fee}]}
function renderHosps(){var l=hosps();if(B.hosp&&!l.some(function(x){return x.name==B.hosp.name}))B.hosp=null;if(!B.hosp&&l.length==1)B.hosp=l[0];
$("hosps").innerHTML=l.map(function(x,i){return '<button class="chip'+(B.hosp&&B.hosp.name==x.name?' sel':'')+'" data-i="'+i+'">'+esc(x.name)+(x.area?' ('+esc(x.area)+')':'')+' | '+(x.fee?rs(x.fee):'Free')+'</button>'}).join("");
$("hosps").querySelectorAll(".chip").forEach(function(c){c.onclick=function(){B.hosp=hosps()[+c.dataset.i];B.dept=null;B.doc=null;["s2","s3","s4"].forEach(function(i){$(i).classList.add("off")});renderHosps();feeBar()}})}
function feeBar(){var h=B.hosp,t;
if(h)t="🏥 <strong>"+esc(h.name)+"</strong>"+(h.area?" ("+esc(h.area)+")":"")+" | Consultation fee: <strong>"+(h.fee?rs(h.fee):"Free")+"</strong>"+(h.fee?" (via UPI QR). If you cancel, "+cfg.cancelPct+"% ("+rs(Math.round(h.fee*cfg.cancelPct/100))+") will be charged.":"");
else t="Please choose your hospital first. The fee will be shown according to the hospital.";
$("feeBar").innerHTML=t;$("fee4").innerHTML=h?"Payable amount: <strong>"+(h.fee?rs(h.fee):"Free")+"</strong>"+(h.fee?". The UPI QR for "+rs(h.fee)+" will appear as soon as you confirm.":""):""}
var _sp3=showParchi;showParchi=function(a){_sp3(a);$("s0").classList.add("hide")};
var _rb2=resetBook;resetBook=function(){_rb2();$("s0").classList.remove("hide");renderHosps();feeBar()};
renderHosps();feeBar();
