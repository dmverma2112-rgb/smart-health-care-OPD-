// ===== SHARED: data, helpers (user aur admin dono use karte hain) =====
var $=function(i){return document.getElementById(i)};
function ld(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}
function sv(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function rs(n){return"₹"+n}
function today(){var d=new Date();return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2)}
var DEF={name:"Smart Healthcare & OPD System",tag:"Lambi line nahi, ghar baithe OPD parchi aur token. Apna hospital aur doctor chunein aur time par aayein.",color:"#0f766e",mins:8,fee:300,cancelPct:20,commission:10,upi:"hospital@upi",
depts:["General Medicine","ENT","Orthopedic","Pediatrics","Dermatology"],slots:["09:00","10:00","11:00","12:00","14:00","15:00","16:00"]};
// Sample hospitals (placeholder). Asli hospital Admin panel se jodein.
var DEFH=[{id:1,name:"City Care Hospital",area:"Civil Lines",phone:"9000000001",fee:300,status:"approved",docs:["Dr. A. Sharma | General Medicine","Dr. S. Khan | ENT","Dr. P. Singh | Orthopedic"]},
{id:2,name:"Shanti Hospital",area:"Station Road",phone:"9000000002",fee:250,status:"approved",docs:["Dr. R. Verma | General Medicine","Dr. N. Gupta | Pediatrics","Dr. M. Rao | Dermatology"]}];
var cfg,aps,HOSP,PT,NOW;
function load(){cfg=Object.assign({},DEF,ld("opd_cfg",{}));aps=ld("opd_aps",[]);HOSP=ld("opd_h",null)||DEFH;PT=ld("opd_pt",{});NOW=ld("opd_now",{})}
load();
function saveAps(){sv("opd_aps",aps)}function saveH(){sv("opd_h",HOSP)}function savePT(){sv("opd_pt",PT)}function saveNow(){sv("opd_now",NOW)}
function byId(i){return aps.filter(function(a){return a.id==i})[0]}
function hosps(){return HOSP.filter(function(h){return h.status=="approved"}).map(function(h){return{name:h.name,area:h.area,fee:h.fee}})}
function hf(n){return(hosps().filter(function(z){return z.name==n})[0]||{}).fee||0}
function docs(){var r=[];HOSP.forEach(function(h){if(h.status!="approved")return;h.docs.forEach(function(l){var p=l.split("|");r.push({n:p[0].trim(),d:(p[1]||"").trim(),h:h.name})})});return r}
function st(a){return a.status=="cancelled"?"Cancelled (Charge "+rs(a.charge)+", Refund "+rs(a.refund)+")":a.fee?(a.paid?"Paid "+rs(a.paidAmt):"Payment pending"):"Free"}
function nowTok(d,h){return NOW[d+"|"+h+"|"+today()]||0}
function maxTok(d,h){return aps.filter(function(a){return a.doc==d&&a.hosp==h&&a.date==today()&&a.status!="cancelled"}).reduce(function(m,a){return Math.max(m,a.token)},0)}
function tkLive(a){if(a.date!=today())return"";var n=nowTok(a.doc,a.hosp);return'<br>Abhi chal raha token: <strong>'+(n||"-")+'</strong> | '+(a.token>n?'Aapse pehle: '+(a.token-n-1)+' token':'Aapka number aa chuka hai')}
function theme(){document.documentElement.style.setProperty("--brand",cfg.color);if($("hn"))$("hn").textContent=cfg.name}
(function(){var r=document.documentElement,b=$("dm");if(!b)return;
function dk(){return r.dataset.theme?r.dataset.theme=="dark":matchMedia("(prefers-color-scheme:dark)").matches}
function paint(){b.textContent=dk()?"☀️":"🌙"}
try{var t=localStorage.getItem("opd_theme");if(t)r.dataset.theme=t}catch(e){}paint();
b.onclick=function(){var t=dk()?"light":"dark";r.dataset.theme=t;try{localStorage.setItem("opd_theme",t)}catch(e){}paint()}})();
// dusre tab/page (user <-> admin) me change hone par live refresh
addEventListener("storage",function(){load();theme();if(window.onData)onData()});
