# Site Clés d'Or Immobilier

Site public : https://cles-dor-immobilier.vercel.app

Le site est hébergé sur Vercel (projet `cles-dor-immobilier`). La mise en ligne se fait par Claude, qui publie directement sur Vercel : une modification faite seulement dans GitHub n'apparaît pas sur le site.

## Modifier le site avec Claude Code

1. Ouvrir https://claude.ai/code et choisir le dépôt `site-cles-dor-immobilier` (les connecteurs GitHub et Vercel doivent être actifs).
2. Écrire la demande en français (exemple : « Change le loyer du Cobalt à 820 €/mois »). Des photos peuvent être jointes.
3. Claude modifie le code, enregistre la modification dans ce dépôt (branche `main`) et publie sur Vercel.
4. Environ 2 minutes plus tard, la modification est en ligne. Recharger la page si besoin.

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

Les pages sont des ancres dans l'adresse : `#accueil`, `#biens`, `#projet-11`, `#investissement`, `#creation`, `#mentions-legales`, `#confidentialite`.

## Publication sur Vercel (pour Claude)

Le projet Vercel n'est pas relié à GitHub, et les photos (environ 38 Mo) sont trop lourdes pour être envoyées à chaque fois. Une publication envoie donc seulement ce qui change ; le reste est repris du site en ligne pendant la construction.

Avec l'outil Vercel `create_deployment` (projet `cles-dor-immobilier`, `target: "production"`) :

- `build.sh` : le contenu de `publication/build.sh` ;
- `fichiers.txt` : la liste de tous les fichiers du site, un par ligne (`index.html`, `app.js`, `donnees.js`, `icones.js`, `fonts/…`, `img/…`), à générer depuis le dépôt :
  `{ ls index.html app.js donnees.js icones.js; find fonts img -type f; } | sort`
- `src/<chemin>` : chaque fichier modifié ou ajouté (par exemple `src/donnees.js`, `src/index.html`, `src/img/APPART35/A.jpg`). Les fichiers texte peuvent être envoyés directement ; une photo s'envoie d'abord avec `upload_file`, puis se référence par son SHA1 et sa taille ;
- réglages du projet : `buildCommand: "sh build.sh"`, `outputDirectory: "public"`, `installCommand: ""`, `framework: null`.

Ensuite, vérifier dans le journal de construction la ligne « Fichiers envoyés : … ; repris du site en ligne : … » et que le site répond.

Une photo retirée de `fichiers.txt` disparaît du site à la publication suivante. Un fichier ajouté doit être à la fois dans `fichiers.txt` et dans `src/`.

`vercel.json` et `vercel-build.sh` servent seulement si le projet Vercel est un jour relié à GitHub. Ne pas les supprimer.

## Collaboration

Pour donner accès à quelqu'un : Settings → Collaborators de ce dépôt GitHub.
