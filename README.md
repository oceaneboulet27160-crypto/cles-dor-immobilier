# Site Clés d'Or Immobilier

Site public : https://site-cles-dor-immobilier.vercel.app

Chaque modification envoyée sur la branche `main` de ce dépôt est mise en ligne automatiquement par Vercel (projet `site-cles-dor-immobilier`).

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

- `index.html` : styles, en-tête, pied de page et contenu des pages fixes.
- `app.js` : navigation entre les pages, carrousels, galeries, menu mobile, fenêtre de contact.
- `donnees.js` : les biens et les galeries.
- `vercel-build.sh` et `vercel.json` : préparation du site par Vercel lors de la mise en ligne (ne pas modifier).

Les pages sont des ancres dans l'adresse : `#accueil`, `#biens`, `#projet-11`, `#investissement`, `#creation`, `#mentions-legales`, `#confidentialite`.
