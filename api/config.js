// Renvoie la configuration publique (l'URL et la clé "anon" de Supabase sont faites pour être publiques).
module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({
    url: process.env.SUPABASE_URL || '',
    anon: process.env.SUPABASE_ANON_KEY || ''
  });
};
