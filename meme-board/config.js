// ใส่ค่าจาก Firebase Console > Project settings > Your apps (Web)
export const firebaseConfig = {
  apiKey: "AIzaSyCICpAZTn3V270vrIpW1MXjyovcVWsLins",
  authDomain: "meme-board-60017.firebaseapp.com",
  projectId: "meme-board-60017",
  storageBucket: "meme-board-60017.firebasestorage.app",
  messagingSenderId: "97802846779",
  appId: "1:97802846779:web:64e25ca10c72a77067121e",
  measurementId: "G-WXLKGTQLF7"
};

export const ADMIN_EMAIL = "epicepic940@gmail.com"; // ต้องตรงกับอีเมลที่ใช้สิทธิ์ Admin
export const TAGS = ["ออฟฟิศ", "แมว", "การเมือง", "เกม", "ความรัก", "ชีวิตประจำวัน", "อื่นๆ"];
// true = ลิงก์แชร์เป็น /m/ID (พรีวิวใน LINE/Facebook ได้ ต้องโฮสต์บน Vercel)
// false = ใช้ meme.html?id=ID (โฮสต์ที่ไหนก็ได้ แต่ไม่มีรูปพรีวิว)
export const SHARE_VIA_API = true;