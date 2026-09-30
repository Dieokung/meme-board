const { cleanId, getMeme } = require('./_lib');
module.exports = async (req, res) => {
  const f = await getMeme(cleanId(req.query.id));
  const m = ((f && f.img && f.img.stringValue) || '').match(/^data:(image\/[\w+.-]+);base64,(.+)$/);
  if (!m || (f.hidden && f.hidden.booleanValue)) return res.status(404).end();
  res.setHeader('Content-Type', m[1]);
  res.setHeader('Cache-Control', 'public, s-maxage=86400, max-age=3600');
  res.send(Buffer.from(m[2], 'base64'));
};
