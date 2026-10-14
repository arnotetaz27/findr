# Find/r

Agence de placement 2.0 : chaque candidat passe **un seul entretien** avec Lisa (IA), puis voit les postes qui lui correspondent et peut postuler.

## Structure

- `public/index.html` : le site (page de présentation, compte, CV, entretien, relecture, tableau de bord).
- `api/ai.js` : pont vers l'IA. Vérifie la connexion, limite l'usage, appelle l'API d'Anthropic. La clé reste côté serveur.
- `api/config.js` : donne au site l'adresse et la clé publique de Supabase.
- `supabase/schema.sql` : tables et règles de sécurité de la base de données.
- `prototype/` : le prototype d'origine (référence uniquement).

## Mise en route

Voir **[SETUP.md](SETUP.md)**.
