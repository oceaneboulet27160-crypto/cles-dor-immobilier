#!/bin/sh
# Commande de construction exécutée par Vercel lors d'une publication.
# - Les fichiers envoyés avec la publication sont dans src/ (fichiers modifiés ou nouvelles photos).
# - Tous les autres fichiers listés dans fichiers.txt sont repris du site actuellement en ligne.
# - index.html (écrit sans en-tête de document) est enveloppé dans un document HTML complet.
set -e
SRC="https://cles-dor-immobilier.vercel.app"
rm -rf public
mkdir -p public
n_envoyes=0
n_repris=0
while IFS= read -r f; do
  [ -z "$f" ] && continue
  [ "$f" = "index.html" ] && [ -f src/index.html ] && continue
  mkdir -p "public/$(dirname "$f")"
  if [ -f "src/$f" ]; then
    cp "src/$f" "public/$f"
    n_envoyes=$((n_envoyes+1))
  else
    curl -fsSL --retry 3 -o "public/$f" "$SRC/$f"
    n_repris=$((n_repris+1))
  fi
done < fichiers.txt
if [ -f src/index.html ]; then
  {
    printf '<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<link rel="icon" href="img/logo.png">\n</head>\n<body>\n'
    cat src/index.html
    printf '\n</body>\n</html>\n'
  } > public/index.html
  n_envoyes=$((n_envoyes+1))
fi
echo "Fichiers envoyés : $n_envoyes ; repris du site en ligne : $n_repris"
