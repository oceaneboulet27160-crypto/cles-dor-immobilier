# Site Clés d'Or Immobilier

Site public : https://cles-dor-immobilier.netlify.app

Le site est hébergé sur Netlify. Chaque modification fusionnée sur la branche `main` de ce dépôt est mise en ligne automatiquement en une à deux minutes. Pour chaque pull request, Netlify publie aussi un aperçu, pour vérifier le résultat avant de fusionner.

## Modifier le site avec Claude Code

1. Ouvrir https://claude.ai/code et choisir le dépôt `lepatrimoinedumilitaire-png/site-cles-dor-immobilier`.
2. Écrire la demande en français (exemple : « Change le loyer du Cobalt à 820 €/mois »). Des photos peuvent être jointes.
3. Claude prépare une pull request ; vérifier l'aperçu Netlify, puis cliquer sur **Merge** dans GitHub.

## Où modifier quoi

| Je veux changer… | Fichier |
| --- | --- |
| Un bien (titre, lieu, loyer, prix, description, photos), en ajouter ou en retirer | `donnees.js` (liste `PROJETS`) |
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
- `vercel-build.sh` : prépare le site dans le dossier `public` lors de la mise en ligne (utilisé par Netlify via `netlify.toml`, et par Vercel via `vercel.json`). Ne pas modifier.

Les pages sont des ancres dans l'adresse : `#accueil`, `#biens`, `#projet-11`, `#investissement`, `#creation`, `#mentions-legales`, `#confidentialite`.

## Collaboration

Pour donner accès à quelqu'un : Settings → Collaborators de ce dépôt GitHub.
