# Mise en ligne de Find/r : guide pas à pas

Compte environ 30 minutes. Tu auras besoin de ton compte GitHub (déjà fait) et de créer trois comptes : Supabase, Anthropic et Vercel. Les trois ont un usage gratuit ou à très faible coût pour démarrer.

> **Règle d'or : ne colle jamais une clé secrète dans GitHub, dans un message ou dans le code.** Elles vont uniquement dans les réglages de Vercel (étape 4).

## 1. Supabase (comptes et base de données)

1. Va sur **supabase.com**, clique sur **Start your project** et connecte-toi avec GitHub.
2. **New project**. Nom : `findr`. Choisis un mot de passe de base de données (garde-le dans ton gestionnaire de mots de passe). **Region** : Europe (Zurich ou Francfort).
3. Une fois le projet prêt, ouvre **SQL Editor** > **New query**. Copie-colle tout le contenu du fichier `supabase/schema.sql` du dépôt, puis clique sur **Run**. Tu dois voir « Success ».
4. **Authentication** > **Sign In / Providers** > **Email**. Pour tes premiers tests, désactive **Confirm email** (sinon chaque inscription demande de cliquer sur un lien reçu par e-mail). Réactive-le avant d'ouvrir au public.
5. **Project Settings** > **API** (ou **API Keys**). Note trois valeurs :
   - **Project URL** (`https://xxxx.supabase.co`)
   - **anon / public key**
   - **service_role key** (secrète : jamais dans le navigateur ni dans GitHub)

## 2. Anthropic (l'IA)

1. Va sur **console.anthropic.com** et crée un compte.
2. **Billing** : ajoute un moyen de paiement et un petit crédit (10 à 20 $ suffisent pour tester). Fixe une **limite de dépense mensuelle** basse.
3. **API Keys** > **Create Key**. Nom : `findr`. Copie la clé tout de suite (elle ne s'affiche qu'une fois).

## 3. Vercel (l'hébergement)

1. Va sur **vercel.com** et connecte-toi avec GitHub.
2. **Add New** > **Project**. Importe le dépôt `findr` (autorise Vercel à accéder à ce dépôt si on te le demande).
3. **Framework Preset** : `Other`. Ne change rien d'autre, **mais ne clique pas encore sur Deploy** : passe d'abord à l'étape 4.

## 4. Variables secrètes (dans Vercel)

Dans l'écran d'import, ouvre **Environment Variables** et ajoute ces quatre lignes (nom, puis valeur) :

| Nom | Valeur |
|---|---|
| `SUPABASE_URL` | le Project URL de l'étape 1 |
| `SUPABASE_ANON_KEY` | la clé anon |
| `SUPABASE_SERVICE_KEY` | la clé service_role |
| `ANTHROPIC_API_KEY` | la clé de l'étape 2 |

Optionnel : `AI_DAILY_LIMIT` (nombre maximum d'appels IA par candidat et par jour, 200 par défaut ; un entretien complet en utilise environ 35).

Clique ensuite sur **Deploy**. Au bout d'une minute, Vercel te donne une adresse du type `findr-xxxx.vercel.app`.

## 5. Premier test

1. Ouvre l'adresse dans **Chrome ou Edge**.
2. Crée un compte, dépose un CV, passe l'entretien (autorise le micro).
3. Vérifie que le tableau de bord s'affiche. Recharge la page : tu dois rester connecté et retrouver ton profil.

## 6. Si quelque chose ne marche pas

| Symptôme | Cause probable |
|---|---|
| « Le service de comptes n'est pas configuré » | `SUPABASE_URL` ou `SUPABASE_ANON_KEY` manquante. Corrige-la dans Vercel > Settings > Environment Variables, puis **Redeploy**. |
| La lecture du CV échoue | `ANTHROPIC_API_KEY` manquante, ou pas de crédit sur la console Anthropic. |
| « Ta session a expiré » | Reconnecte-toi. |
| Le profil ne se sauvegarde pas | Le fichier `schema.sql` n'a pas été exécuté en entier. |

Après toute modification des variables, Vercel demande un **Redeploy** (Deployments > ... > Redeploy).

## 7. Avant d'ouvrir au public

- Réactiver la confirmation de l'e-mail (étape 1.4).
- Rédiger une politique de confidentialité et un consentement clair (entretiens et CV = données sensibles, nLPD / RGPD).
- Régler le domaine (`findr.ch` par exemple) dans Vercel > Settings > Domains.
- Surveiller les coûts sur la console Anthropic.
