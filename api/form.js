module.exports = function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }
  const tip = String(req.query.tip || '').replace(/[^a-z-]/g, '');
  const dest = tip ? `/tesekkurler.html?tip=${tip}` : '/tesekkurler.html';
  res.redirect(302, dest);
};
