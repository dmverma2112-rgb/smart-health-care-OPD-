Smart Healthcare & OPD System - ALAG ALAG code (sirf HTML + CSS + JavaScript)

  user/    -> Patient website   (user/index.html, user/user.js, user/qr.js)
  admin/   -> Broker admin site (admin/index.html, admin/admin.js)
  shared/  -> dono ka common code (common.js = data/helpers, style.css = design)

Chalane ka tarika (zaroori): VS Code me poora folder kholein, "Live Server" extension se
  user/index.html  aur  admin/index.html  dono ko kholein (dono ek hi address 127.0.0.1:5500 par).
Isi se admin me kiya badlav user site par turant dikhta hai (data browser localStorage me saath me rehta hai).

Admin PIN: 1234 (admin/admin.js ke upar PIN badlein)
Patient: Patient Login se account banayein (mobile + 4 digit PIN), phir Book OPD.
Hospital: user site 'Hospital Register' se apply -> Admin 'Hospitals' me Approve -> patients ko dikhta hai.
Payment: broker ke UPI par (Admin Settings me UPI ID). Admin 'Settlement' me commission aur hospital ko dene wali raqam.
Note: ye demo hai - data aur PIN browser me rehte hain. Asli use ke liye backend (Flask + MySQL) aur payment gateway chahiye.
