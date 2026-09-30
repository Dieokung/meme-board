# มีมบอร์ด (Google Login + หลังบ้าน + พรีวิวแชร์)
แพ็กเกจ Firebase Spark (ฟรี) ก็พอ — รูปถูกย่อ ≤900px แล้วเก็บใน Firestore (GIF จะเป็นภาพนิ่ง)

## ตั้งค่า Firebase (ครั้งเดียว)
1. console.firebase.google.com → Add project
2. Project settings → Your apps → Web (</>) → คัดลอก config ไปใส่ `config.js` + ใส่อีเมลแอดมินใน `ADMIN_EMAIL`
3. Authentication → Sign-in method → เปิด **Google**
4. Firestore Database → Create database → แท็บ Rules → วาง `firestore.rules` (แก้ `your-email@gmail.com` เป็นอีเมลแอดมิน) → Publish
5. Authentication → Settings → Authorized domains → เพิ่มโดเมนเว็บของคุณ

## Deploy บน Vercel (แนะนำ — จำเป็นถ้าอยากได้พรีวิวรูปตอนแชร์ LINE/Facebook)
1. อัปโหลดโฟลเดอร์นี้ขึ้น GitHub แล้ว Import ที่ vercel.com (หรือ `npx vercel`)
2. Settings → Environment Variables เพิ่ม `FIREBASE_PROJECT_ID` (projectId) และ `FIREBASE_API_KEY` (apiKey) แล้ว Redeploy
3. ลิงก์แชร์จะเป็น `https://โดเมน/m/รหัสมีม`

โฮสต์ที่อื่น (Netlify/Firebase Hosting): ตั้ง `SHARE_VIA_API = false` ใน `config.js` — ลิงก์จะเป็น `meme.html?id=...` ใช้ได้แต่ไม่มีรูปพรีวิว
ทดสอบในเครื่อง: `npx serve .` แล้วเปิด http://localhost:3000 (ห้ามเปิดแบบ file://)

## สิ่งที่ป้องกันไว้ใน rules
- ไลก์/รายงาน: 1 คน 1 ครั้งต่อมีม (เอกสารแยก id = memeId_uid) และตัวนับแก้ได้ทีละ 1 พร้อมเอกสารของตัวเองเท่านั้น
- โพสต์ได้ทุก ≥60 วินาที/คน · ผู้ถูกแบนโพสต์/ไลก์/คอมเมนต์/รายงานไม่ได้
- ถูกรายงานครบ 3 คน = ซ่อนจากฟีดอัตโนมัติ (แอดมินตรวจเหตุผลและล้างได้ที่ admin.html)

## หมายเหตุ
- ข้อมูลโครงสร้างใหม่ (likeCount/reportCount) ใช้ร่วมกับมีมจากชุดเก่าไม่ได้ ให้ลบมีมเก่าก่อน
- แท็ก/โปรไฟล์/"ของฉัน" อ่านได้สูงสุด 200/100 ใบต่อการค้น (ไม่ต้องสร้าง index เพิ่ม)
- ชื่อ/รูปผู้โพสต์ส่งมาจากฝั่งผู้ใช้ จึงปลอมได้ในทางเทคนิค (แก้จริงต้องใช้ Cloud Functions)
