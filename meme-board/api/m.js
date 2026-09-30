// หน้าที่ crawler ของ LINE/Facebook อ่าน: ใส่ OG tags แล้วพาคนจริงไป meme.html
const { esc, cleanId, getMeme } = require('./_lib');
module.exports = async (req, res) => {
  const id = cleanId(req.query.id), f = await getMeme(id), base = `https://${req.headers.host}`;
  const show = f && !f.hidden?.booleanValue;
  const cap = (show && f.caption?.stringValue) || 'มีมจากมีมบอร์ด';
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=300');
  res.send(`<!doctype html><html lang="th"><head><meta charset="utf-8"><title>${esc(cap)}</title>
<meta property="og:title" content="${esc(cap)}"><meta property="og:type" content="article"><meta property="og:url" content="${base}/m/${id}">
${show ? `<meta property="og:image" content="${base}/api/img?id=${id}"><meta name="twitter:card" content="summary_large_image">` : ''}
<meta http-equiv="refresh" content="0;url=/meme.html?id=${id}"></head><body><script>location.replace('/meme.html?id=${id}')</script></body></html>`);
};
