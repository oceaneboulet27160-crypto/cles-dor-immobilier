# Site Clés d'Or Immobilier

Site public : https://clés-dor-immobilier.com (aussi https://cles-dor-immobilier.vercel.app)

Le site est hébergé sur Vercel (projet `cles-dor-immobilier`), relié à ce dépôt GitHub. Chaque modification enregistrée sur la branche `main` est mise en ligne automatiquement en une à deux minutes.

## Modifier le site avec Claude Code

1. Ouvrir https://claude.ai/code et choisir le dépôt `oceaneboulet27160-crypto/cles-dor-immobilier`.
2. Écrire la demande en français (exemple : « Change le loyer du Cobalt à 820 €/mois »). Des photos peuvent être jointes.
3. Claude modifie le code et l'enregistre sur la branche `main` de ce dépôt.
4. Vercel publie automatiquement : environ 2 minutes plus tard, la modification est en ligne. Recharger la page si besoin.

## Où modifier quoi

| Je veux changer… | Fichier |
| --- | --- |
| Un bien (titre, lieu, loyer, prix, description, photos), en ajouter ou en retirer | `donnees.js` (liste `PROJETS`) |
| Un bien à vendre (page « À vendre »), en ajouter ou en retirer, le marquer vendu | `donnees.js` (liste `A_VENDRE`) |
| Les biens du carrousel « Projets en vedette » de l'accueil | `donnees.js` (liste `VEDETTE`) |
| Les images des galeries de la page Création | `donnees.js` (`GALERIES_CREATION`) |
| Les textes de l'accueil, Investissement clef en main, Création, mentions légales, confidentialité | `index.html` (une balise `<template id="page-…">` par page) |
| L'en-tête, le pied de page, la fenêtre « Contactez-nous » | `index.html` |
| Les photos | dossier `img/` (une photo de bien : `img/APPART<numéro>/…`) |

Les chemins de photos dans `donnees.js` s'écrivent sans `img/` (exemple : `APPART11/A.jpg`).
Avant d'ajouter une photo, réduisez-la à 1024 pixels de large environ pour que le site reste rapide.

## Fonctionnement

Site statique sans framework : HTML, CSS (feuille Tailwind déjà générée, reprise de l'ancien site) et JavaScript.

- `index.html` : styles, en-tête, pied de page et contenu des pages fixes. Il est écrit sans en-tête de document (`<!doctype>`, `<head>`) : la mise en ligne l'ajoute.
- `app.js` : navigation entre les pages, carrousels, galeries, menu mobile, fenêtre de contact.
- `donnees.js` : les biens et les galeries.

Les pages sont des ancres dans l'adresse : `#accueil`, `#biens`, `#projet-11`, `#a-vendre`, `#vente-1`, `#investissement`, `#creation`, `#mentions-legales`, `#confidentialite`.

## Publication

`vercel.json` indique à Vercel comment construire le site : il lance `vercel-build.sh`, qui prépare le dossier `public` (copie des fichiers et ajout de l'en-tête de document à `index.html`). Ne pas modifier ces deux fichiers.

## Collaboration

Pour donner accès à quelqu'un : Settings → Collaborators de ce dépôt GitHub.
