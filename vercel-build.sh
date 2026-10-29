#!/bin/sh
# Construction pour Vercel : index.html est écrit sans en-tête de document
# (format des pages Claude) ; on l'enveloppe ici dans un document HTML complet.
set -e
rm -rf public
mkdir -p public
cp -R img fonts app.js donnees.js icones.js public/
{
  printf '<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<link rel="icon" href="img/logo.png">\n</head>\n<body>\n'
  cat index.html
  printf '\n</body>\n</html>\n'
} > public/index.html
