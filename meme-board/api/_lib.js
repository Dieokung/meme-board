exports.esc = s => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
exports.cleanId = v => String(v || '').replace(/[^\w-]/g, '');
exports.getMeme = async id => {
  if (!id) return null;
  const u = `https://firestore.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/databases/(default)/documents/memes/${id}?key=${process.env.FIREBASE_API_KEY}`;
  const r = await fetch(u);
  return r.ok ? (await r.json()).fields : null;
};
