// ใส่ค่าจาก Firebase Console > Project settings > Your apps (Web)
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  appId: "YOUR_APP_ID"
};
export const ADMIN_EMAIL = "your-email@gmail.com"; // ต้องตรงกับใน firestore.rules
export const TAGS = ["ออฟฟิศ", "แมว", "การเมือง", "เกม", "ความรัก", "ชีวิตประจำวัน", "อื่นๆ"];
// true = ลิงก์แชร์เป็น /m/ID (พรีวิวใน LINE/Facebook ได้ ต้องโฮสต์บน Vercel)
// false = ใช้ meme.html?id=ID (โฮสต์ที่ไหนก็ได้ แต่ไม่มีรูปพรีวิว)
export const SHARE_VIA_API = true;
