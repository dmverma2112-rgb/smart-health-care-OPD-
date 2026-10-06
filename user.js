// ===== USER (Patient) SITE: account, hospital chunna, booking, UPI payment, cancel, chatbot =====
var B={},ME=ld("opd_me",null),CUR=0;
var AVG={"General Medicine":9,"ENT":7,"Orthopedic":10,"Pediatrics":8,"Dermatology":6};
var KW={"General Medicine":"bukhar fever cold khansi cough sardi thakan weakness pet stomach sugar bp headache sirdard ulti loose","ENT":"kaan ear gala throat naak nose sinus tonsil sunai","Orthopedic":"haddi bone ghutna knee kamar back joint jodo fracture chot shoulder kandha","Pediatrics":"bachcha baby child bachche infant teeka vaccine","Dermatology":"skin twacha daane rash kharish itching khujli pimple acne baal hair"};
function me(){return ME&&PT[ME]?PT[ME]:null}
function go(v){["home","book","acct","hreg"].forEach(function(s){$(s).classList.toggle("hide",s!=v)});
document.querySelectorAll("nav button").forEach(function(b){b.classList.toggle("on",b.dataset.v==v)});
if(v=="home")home();if(v=="book")gate();if(v=="acct")acctView();scrollTo(0,0)}
document.querySelectorAll("nav button").forEach(function(b){b.onclick=function(){go(b.dataset.v)}});
// ---------- home ----------
function home(){$("ht").textContent=cfg.name;$("hs").textContent=cfg.tag;
var n=aps.filter(function(a){return a.date==today()&&a.status!="cancelled"}).length;
$("stats").innerHTML=[[hosps().length,"Hospitals"],[docs().length,"Doctors"],[n,"Aaj ki appointments"],[Object.keys(PT).length,"Registered patients"]].map(function(x){return '<div class="box"><b>'+x[0]+'</b>'+x[1]+'</div>'}).join("");
$("board").innerHTML=docs().map(function(d){var c=nowTok(d.n,d.h),t=maxTok(d.n,d.h);return '<div class="tk"><b>'+(c||"-")+'</b><div><strong>'+esc(d.n)+'</strong> ('+esc(d.d)+', '+esc(d.h)+')<br>'+(c?'Abhi token '+c+' chal raha hai':'Abhi shuru nahi hua')+(t?' | Aaj total: '+t:'')+'</div></div>'}).join("")||"<p>Abhi koi hospital available nahi.</p>"}
function cards(l,cx){return l.map(function(a){return '<div class="tk"><b>'+a.token+'</b><div><strong>'+esc(a.hosp||"")+'</strong><br>'+esc(a.doc)+' ('+esc(a.dept)+')<br>'+a.date+', '+a.time+(a.wait!=null?' | Andaza wait: '+a.wait+' min':'')+'<br>'+st(a)+tkLive(a)+(cx&&a.status!="cancelled"?'<br><button class="btn alt mini" onclick="cancelAp('+a.id+')">Booking cancel karein</button>':'')+'</div></div>'}).join("")}
function findTok(){var m=$("tk").value.trim(),o=$("tkr");if(!/^\d{10}$/.test(m)){o.innerHTML='<p class="err">Sahi 10 digit mobile number daaliye.</p>';return}
var l=aps.filter(function(a){return a.mobile==m&&a.date>=today()&&a.status!="cancelled"});o.innerHTML=l.length?cards(l,false):'<p class="err">Is number par koi upcoming appointment nahi mili.</p>'}
// ---------- patient account ----------
function navLabel(){document.querySelector('nav button[data-v="acct"]').textContent=me()?"👤 "+me().name.split(" ")[0]:"Patient Login"}
function regPt(){load();var n=$("rn").value.trim(),m=$("rm").value.trim(),a=+$("ra").value,p=$("rp").value,e=$("ere");
if(n.length<2)return e.textContent="Naam likhiye.";
if(!/^[6-9]\d{9}$/.test(m))return e.textContent="Sahi 10 digit mobile number daaliye.";
if(!a||a<0||a>120)return e.textContent="Sahi umar daaliye.";
if(!/^\d{4}$/.test(p))return e.textContent="PIN 4 digit ka hona chahiye.";
if(PT[m])return e.textContent="Is number se account pehle se hai, Login karein.";
PT[m]={name:n,mobile:m,age:a,gender:$("rg").value,pin:p};savePT();ME=m;sv("opd_me",ME);e.textContent="";acctView()}
function loginPt(){load();var m=$("lm").value.trim(),p=$("lp").value,e=$("elg");
if(!PT[m]||PT[m].pin!=p)return e.textContent="Mobile ya PIN galat hai.";
e.textContent="";ME=m;sv("opd_me",ME);acctView()}
function logoutPt(){ME=null;sv("opd_me",null);B={};acctView()}
function acctView(){var p=me();$("aout").classList.toggle("hide",!!p);$("ain").classList.toggle("hide",!p);navLabel();if(!p)return;
$("aname").textContent="Namaste, "+p.name;$("ainfo").textContent="Mobile: "+p.mobile+" | Umar: "+p.age+" | "+p.gender;
var l=aps.filter(function(a){return a.mobile==ME});$("mine").innerHTML=l.length?cards(l,true):"Abhi koi booking nahi."}
// ---------- booking ----------
function gate(){var p=me();$("needLogin").classList.toggle("hide",!!p);$("flow").classList.toggle("hide",!p);$("feeBar").classList.toggle("hide",!p);
if(p){$("pinfo").textContent=p.name+" | "+p.age+" saal | "+p.gender+" | "+p.mobile;renderHosps();feeBar()}}
function renderHosps(){var l=hosps();if(B.hosp&&!l.some(function(x){return x.name==B.hosp.name}))B.hosp=null;if(!B.hosp&&l.length==1)B.hosp=l[0];
$("hl").innerHTML=l.length?l.map(function(x,i){return '<button class="chip'+(B.hosp&&B.hosp.name==x.name?' sel':'')+'" data-i="'+i+'">'+esc(x.name)+(x.area?' ('+esc(x.area)+')':'')+' | '+(x.fee?rs(x.fee):'Free')+'</button>'}).join(""):'<span class="err">Abhi koi hospital available nahi.</span>';
$("hl").querySelectorAll(".chip").forEach(function(c){c.onclick=function(){B.hosp=hosps()[+c.dataset.i];B.dept=null;B.doc=null;["s2","s3","s4"].forEach(function(i){$(i).classList.add("off")});renderHosps();feeBar()}})}
function feeBar(){var h=B.hosp,t;
if(h)t="🏥 <strong>"+esc(h.name)+"</strong>"+(h.area?" ("+esc(h.area)+")":"")+" | Consultation fee: <strong>"+(h.fee?rs(h.fee):"Free")+"</strong>"+(h.fee?" (UPI QR se). Cancel karne par "+cfg.cancelPct+"% ("+rs(Math.round(h.fee*cfg.cancelPct/100))+") charge katega.":"");
else t="Pehle apna hospital chuniye. Fee hospital ke hisaab se dikhegi.";
$("feeBar").innerHTML=t;$("fee4").innerHTML=h?"Payable amount: <strong>"+(h.fee?rs(h.fee):"Free")+"</strong>"+(h.fee?". Confirm karte hi "+rs(h.fee)+" ka UPI QR dikhega.":""):""}
function deptsFor(){var s={},r=[];docs().forEach(function(x){if(B.hosp&&x.h==B.hosp.name&&!s[x.d]){s[x.d]=1;r.push(x.d)}});return r.length?r:cfg.depts}
function suggest(){var t=$("sym").value.toLowerCase(),best=null,bs=0;
deptsFor().forEach(function(d){var s=0;(KW[d]||d.toLowerCase()).split(" ").forEach(function(k){if(k&&t.indexOf(k)>-1)s+=d=="Pediatrics"?2:1});if(s>bs){bs=s;best=d}});
var b=$("aiBox");if(best){b.classList.remove("hide");b.textContent="AI suggestion: "+best+" department";B.sug=best}else{b.classList.add("hide");B.sug=null}}
$("sym").oninput=suggest;
function next1(){var e=$("e1"),p=me();if(!B.hosp)return e.textContent="Pehle upar se hospital chuniye.";
e.textContent="";B.p={name:p.name,mobile:p.mobile,age:p.age,gender:p.gender};B.dept=null;B.doc=null;var ds=deptsFor();
$("dl").innerHTML=ds.map(function(d){return '<button class="chip'+(d==B.sug?' sel':'')+'" data-d="'+esc(d)+'">'+esc(d)+(d==B.sug?' (AI)':'')+'</button>'}).join("");
$("s2").classList.remove("off");$("s3").classList.add("off");$("s4").classList.add("off");
$("dl").querySelectorAll(".chip").forEach(function(c){c.onclick=function(){pickDept(c.dataset.d)}});
if(B.sug&&ds.indexOf(B.sug)>-1)pickDept(B.sug);$("s2").scrollIntoView({behavior:"smooth"})}
function pickDept(d){B.dept=d;B.doc=null;$("dl").querySelectorAll(".chip").forEach(function(c){c.classList.toggle("sel",c.dataset.d==d)});
var l=docs().filter(function(x){return x.d==d&&x.h==B.hosp.name});
$("vl").innerHTML=l.length?l.map(function(x){return '<button class="chip" data-n="'+esc(x.n)+'">'+esc(x.n)+'</button>'}).join(""):'<span class="err">Is department me doctor nahi hai.</span>';
$("s3").classList.remove("off");$("s4").classList.add("off");$("vl").querySelectorAll(".chip").forEach(function(c){c.onclick=function(){pickDoc(c.dataset.n)}})}
function pickDoc(n){B.doc=n;$("vl").querySelectorAll(".chip").forEach(function(c){c.classList.toggle("sel",c.dataset.n==n)});
$("s4").classList.remove("off");$("dt").min=today();if(!$("dt").value)$("dt").value=today();$("tm").innerHTML=cfg.slots.map(function(s){return '<option>'+s+'</option>'}).join("")}
function estWait(a){var ah=aps.filter(function(x){return x.doc==a.doc&&x.hosp==a.hosp&&x.date==a.date&&x.time<a.time&&x.status!="cancelled"}).length,h=+a.time.slice(0,2);return Math.round(ah*(AVG[a.dept]||cfg.mins)*(h>=10&&h<=12?1.15:1))}
function confirmBook(){load();var d=$("dt").value,t=$("tm").value,e=$("e4");
if(!B.doc)return e.textContent="Doctor chuniye.";
if(!d||d<today())return e.textContent="Aaj ya aage ki date chuniye.";
if(aps.some(function(a){return a.doc==B.doc&&a.hosp==B.hosp.name&&a.date==d&&a.time==t&&a.status!="cancelled"}))return e.textContent="Ye slot book ho chuka hai, dusra time chuniye.";
e.textContent="";var n=aps.filter(function(a){return a.doc==B.doc&&a.hosp==B.hosp.name&&a.date==d}).length+1;
var ap=Object.assign({id:Date.now(),hosp:B.hosp.name,fee:B.hosp.fee,dept:B.dept,doc:B.doc,date:d,time:t,token:n},B.p);
ap.wait=estWait(ap);aps.push(ap);saveAps();payStep(ap)}
// ---------- UPI payment, parchi, cancel ----------
function hideSteps(){["s0","s1","s2","s3","s4","s5","s6"].forEach(function(i){$(i).classList.add("hide")})}
function upiLink(a){return"upi://pay?pa="+encodeURIComponent(cfg.upi)+"&pn="+encodeURIComponent(cfg.name)+"&am="+a.fee+"&cu=INR&tn="+encodeURIComponent("OPD Token "+a.token)}
function payStep(a){CUR=a.id;if(!a.fee)return showParchi(a);hideSteps();$("s6").classList.remove("hide");var l=upiLink(a);
$("pay").innerHTML='<p><strong>'+esc(a.hosp)+'</strong></p><p>Token <strong>'+a.token+'</strong> | '+esc(a.doc)+' | '+a.date+', '+a.time+'</p><div style="text-align:center"><div class="qr">'+(window.makeQR?makeQR(l):"")+'</div><p>Scan karke <strong>'+rs(a.fee)+'</strong> pay karein<br><small>UPI ID: '+esc(cfg.upi)+' ('+esc(cfg.name)+')</small></p><a class="btn alt mini" href="'+esc(l)+'">Phone me UPI app kholein</a></div>'
+'<label for="utr">UPI reference / UTR number (12 digit, optional)</label><input id="utr" inputmode="numeric" maxlength="12"><div class="err" id="e6"></div>'
+'<p style="color:var(--mute);font-size:.9rem">Payment platform ke UPI par aata hai, hospital ko platform settle karta hai.<br>Cancellation policy: booking cancel karne par '+cfg.cancelPct+'% ('+rs(Math.round(a.fee*cfg.cancelPct/100))+') katega, baaki refund hoga.</p>'
+'<button class="btn" onclick="paid()">Payment kar diya</button> <button class="btn alt" onclick="cancelAp(CUR)">Cancel</button>'}
function paid(){var u=$("utr").value.trim();if(u&&!/^\d{12}$/.test(u))return $("e6").textContent="UTR 12 digit ka hona chahiye.";
load();var a=byId(CUR);if(!a)return;a.paid=true;a.paidAmt=a.fee;if(u)a.utr=u;saveAps();showParchi(a)}
function showParchi(a){CUR=a.id;hideSteps();$("s5").classList.remove("hide");$("cxl").classList.toggle("hide",a.status=="cancelled");
$("parchi").innerHTML='<div class="parchi"><h2>'+esc(a.hosp)+'</h2><p style="text-align:center;margin:0">Digital OPD Parchi</p><p style="text-align:center;margin:10px 0 0">Token number</p><div class="token">'+a.token+'</div>'
+'<dl><dt>Patient</dt><dd>'+esc(a.name)+'</dd><dt>Age / Gender</dt><dd>'+a.age+' / '+esc(a.gender)+'</dd><dt>Mobile</dt><dd>'+esc(a.mobile)+'</dd><dt>Department</dt><dd>'+esc(a.dept)+'</dd><dt>Doctor</dt><dd>'+esc(a.doc)+'</dd><dt>Date, Time</dt><dd>'+a.date+', '+a.time+'</dd><dt>Andaza wait</dt><dd>'+a.wait+' minute</dd><dt>Payment</dt><dd>'+st(a)+'</dd></dl><small>Parchi ID: '+a.id+' | Booked via '+esc(cfg.name)+'</small></div>'}
function cancelAp(id){load();var a=byId(id);if(!a||a.status=="cancelled"||!me()||a.mobile!=ME)return;
var c=a.paid?Math.round(a.paidAmt*cfg.cancelPct/100):0,r=a.paid?a.paidAmt-c:0;
if(!confirm(a.paid?"Cancel karne par "+rs(c)+" ("+cfg.cancelPct+"%) cancellation charge katega.\nRefund: "+rs(r)+"\nPakka cancel karein?":"Booking cancel karein? Payment nahi hui, koi charge nahi lagega."))return;
a.status="cancelled";a.charge=c;a.refund=r;saveAps();
if(CUR==id&&(!$("s5").classList.contains("hide")||!$("s6").classList.contains("hide"))){hideSteps();$("s5").classList.remove("hide");$("cxl").classList.add("hide");
$("parchi").innerHTML='<div class="parchi"><h2>Booking Cancelled</h2><p style="text-align:center;margin:0">'+esc(a.hosp)+'</p><dl><dt>Token</dt><dd>'+a.token+'</dd><dt>Doctor</dt><dd>'+esc(a.doc)+'</dd><dt>Paid</dt><dd>'+rs(a.paid?a.paidAmt:0)+'</dd><dt>Cancel charge</dt><dd>'+rs(c)+'</dd><dt>Refund</dt><dd>'+rs(r)+'</dd></dl><small>Refund hospital desk se process hoga.</small></div>'}
home();if(!$("acct").classList.contains("hide"))acctView()}
function resetBook(){B={};["s0","s1"].forEach(function(i){$(i).classList.remove("hide")});["s2","s3","s4"].forEach(function(i){$(i).classList.remove("hide");$(i).classList.add("off")});$("s5").classList.add("hide");$("s6").classList.add("hide");
$("sym").value="";$("aiBox").classList.add("hide");gate();scrollTo(0,0)}
// ---------- hospital registration (admin approve karega) ----------
function regHosp(){load();var n=$("hn1").value.trim(),ar=$("ha").value.trim(),p=$("hp").value.trim(),fs=$("hfee").value,e=$("eh"),
d=$("hd").value.split("\n").map(function(s){return s.trim()}).filter(Boolean);
if(n.length<3)return e.textContent="Hospital ka naam likhiye.";
if(!ar)return e.textContent="Area / City likhiye.";
if(!/^\d{10}$/.test(p))return e.textContent="Sahi 10 digit phone number daaliye.";
if(fs===""||+fs<0)return e.textContent="Consultation fee daaliye (free ho to 0).";
if(!d.length||d.some(function(x){var q=x.split("|");return q.length<2||!q[0].trim()||!q[1].trim()}))return e.textContent="Har doctor ki line 'Naam | Department' format me likhiye.";
if(HOSP.some(function(x){return x.name.toLowerCase()==n.toLowerCase()}))return e.textContent="Is naam ka hospital pehle se hai.";
HOSP.push({id:Date.now(),name:n,area:ar,phone:p,fee:+fs,docs:d,status:"pending"});saveH();e.textContent="";
$("hok").innerHTML='<div class="ai">Registration mil gaya. Broker approve karega tabhi patients ko dikhega.</div>';["hn1","ha","hp","hfee","hd"].forEach(function(i){$(i).value=""})}
// ---------- AI chatbot ----------
var INTENTS=[["greet","hello hi namaste hey"],["book","book booking appointment parchi register token"],["doctors","doctor doctors dr"],["depts","department departments opd treatment"],["hosp","hospital hospitals aspatal"],["fee","fee charge paisa rupaye amount payment refund cancel"],["wait","wait waiting line kitni der"],["timing","timing time slot kab baje khula"],["thanks","thanks shukriya dhanyavad bye"]];
function bot(t){t=t.toLowerCase();
if(/seene|chest|saans|breath|behosh|unconscious|khoon|bleeding|heart attack|stroke|lakwa/.test(t))return"Ye emergency ho sakti hai. OPD ka intezaar na karein, turant 112 par call karein ya nazdiki emergency me jayein.";
var best=null,bs=0;INTENTS.forEach(function(i){var s=0;i[1].split(" ").forEach(function(k){if(t.split(/\W+/).indexOf(k)>-1)s++});if(s>bs){bs=s;best=i[0]}});
var d=null,ds=0;cfg.depts.forEach(function(x){var s=0;(KW[x]||"").split(" ").forEach(function(k){if(k&&t.indexOf(k)>-1)s+=x=="Pediatrics"?2:1});if(s>ds){ds=s;d=x}});
if(ds>0&&best!="doctors"&&best!="depts")return"Aapki takleef ke hisaab se "+d+" department theek rahega. Book OPD me ye department chunein. Ye sirf suggestion hai, doctor ki salah zaroori hai.";
var R={greet:"Namaste! Booking, hospitals, doctors, fees ya apni takleef puchiye.",book:"Pehle Patient Login me account banayein, phir Book OPD: hospital, department, doctor, date/time chunein, UPI se payment karein aur token/parchi payein.",
doctors:"Doctors: "+docs().map(function(x){return x.n+" ("+x.d+", "+x.h+")"}).join("; "),depts:"Departments: "+cfg.depts.join(", "),
hosp:"Hospitals: "+hosps().map(function(x){return x.name+(x.area?" ("+x.area+")":"")}).join("; "),
fee:"Fee: "+hosps().map(function(x){return x.name+" "+rs(x.fee)}).join(", ")+" (UPI QR se). Cancel karne par "+cfg.cancelPct+"% charge katta hai, baaki refund hota hai.",
wait:"Parchi me andaza wait time dikhta hai. Ye aapke doctor ke paas aapse pehle ke patients par depend karta hai.",timing:"Time slots: "+cfg.slots.join(", "),thanks:"Aapka swagat hai. Swasth rahiye!"};
return R[best]||"Maaf kijiye, samajh nahi paya. Booking, hospitals, doctors, fees puchiye ya apni takleef likhiye (jaise: kaan dard)."}
(function(){var d=document.createElement("div");d.id="cb";d.className="noprint";
d.innerHTML='<div id="cw"><h4>AI Assistant</h4><div id="cm" aria-live="polite"><div>Namaste! Booking, hospitals, doctors, fees ya apni takleef puchiye.</div></div><div class="chips" id="cq" style="padding:0 10px 8px"></div><form id="cf"><input id="ci" placeholder="Yahan likhiye..." aria-label="Message"><button class="btn mini">Bhejein</button></form></div><button id="ct">🤖 AI Assistant</button>';document.body.appendChild(d);
function add(t,c){var m=document.createElement("div");m.textContent=t;if(c)m.className=c;$("cm").appendChild(m);$("cm").scrollTop=1e9}
function ask(t){add(t,"me");add(bot(t))}
$("ct").onclick=function(){$("cw").classList.toggle("on")};
["Hospitals list","Doctors list","Fee kitni hai","Kaan dard"].forEach(function(q){var b=document.createElement("button");b.type="button";b.className="chip sq";b.textContent=q;b.onclick=function(){ask(q)};$("cq").appendChild(b)});
$("cf").onsubmit=function(e){e.preventDefault();var t=$("ci").value.trim();if(!t)return;$("ci").value="";ask(t)}})();
function openChat(){$("cw").classList.add("on");$("ci").focus()}
// ---------- start ----------
window.onData=function(){ME=ld("opd_me",null);home();navLabel();if(!$("acct").classList.contains("hide"))acctView();if(!$("book").classList.contains("hide"))gate()};
theme();home();navLabel();
