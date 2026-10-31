#!/bin/sh
# Construction pour Vercel : index.html est écrit sans en-tête de document
# (format des pages Claude) ; on l'enveloppe ici dans un document HTML complet.
set -e
rm -rf public
mkdir -p public
cp -R img fonts app.js donnees.js icones.js manifest.webmanifest sw.js apple-touch-icon.png apple-touch-icon-precomposed.png public/
{
  printf '<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<link rel="icon" href="img/logo.png">\n<link rel="manifest" href="manifest.webmanifest">\n<meta name="theme-color" content="#193550">\n<link rel="apple-touch-icon" href="img/app/apple-touch-icon.png">\n<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-title" content="Clés d'\''Or">\n<meta name="apple-mobile-web-app-status-bar-style" content="default">\n</head>\n<body>\n'
  cat index.html
  printf '\n</body>\n</html>\n'
} > public/index.html
