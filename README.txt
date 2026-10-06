Smart Healthcare & OPD System - sirf HTML + CSS + JavaScript (Python ya server ki zaroorat nahi)

Chalane ke liye: index.html par double-click karein (Chrome/Edge).
VS Code me: folder kholein, index.html par Right-click > Open with Live Server (optional).

Files:
  index.html  - page ka dhancha
  style.css   - design aur colors
  script.js   - saara logic: booking, token, parchi, admin, chatbot, wait-time

Admin Panel PIN: 1234 (script.js me unlock() ke andar badlein)
Data aapke browser me (localStorage) save hota hai. Admin Panel me hospital ka naam,
color, departments, doctors badal sakte hain.

Dark mode: header ka 🌙 button. Token: parchi me, aur Home par mobile number se 'Token dekhein'.
AI Assistant: neeche '🤖 AI Assistant' button.
Live token: Admin Panel > 'Live token control' se 'Agla token' dabayein, Home par 'Abhi chal raha token' dikhega.
UPI QR: Admin Panel me 'Hospital UPI ID', fee aur cancel charge % badlein. QR offline bhi banta hai (qr.js).
Cancel: parchi, ya Home par mobile number se token dekhkar 'Booking cancel karein'.
Hospitals: Admin Panel me har line 'Naam | Area | UPI ID | Fee'. Patient booking me pehle hospital chunta hai.
Doctor ko kisi ek hospital tak limit karne ke liye line me teesra hissa likhein: 'Dr. X | ENT | Shanti Hospital'. Na likhein to sab hospitals me dikhega.
