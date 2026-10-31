// =====================================================================
// Fonctionnement du site Clés d'Or Immobilier : navigation entre les pages,
// carrousels, galeries photo, menu mobile et fenêtre de contact.
// Le contenu (textes, biens, photos) se modifie dans index.html et donnees.js.
// =====================================================================
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' }[c]));
  const icone = (nom, cls = '', taille = 24) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${taille}" height="${taille}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${nom} ${cls}">${window.ICONES[nom] || ''}</svg>`;
  const img = (p) => 'img/' + p;
  const projet = (id) => window.PROJETS.find((p) => String(p.id) === String(id));
  // Filigrane « VENDU » posé sur une photo (le conteneur doit être en position relative)
  const filigrane = (taille) => `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.2);pointer-events:none"><span style="transform:rotate(-18deg);border:3px solid #931313;color:#931313;background:rgba(255,255,255,.85);padding:.2em .8em;font-size:${taille};font-weight:800;letter-spacing:.25em;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,.15)">VENDU</span></div>`;
  const venteBien = (id) => (window.A_VENDRE || []).find((p) => String(p.id) === String(id));
  const ABS = 'position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0';
  const BOUTON_BASE = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive";

  let minuteurs = [];
  const arreterMinuteurs = () => { minuteurs.forEach(clearInterval); minuteurs = []; };

  // ---------------------------------------------------------------- glisser
  // Gère le glissement au doigt / à la souris d'une piste de diapositives.
  function glisser(zone, piste, getIndex, aller) {
    let x0 = null, dx = 0, actif = false;
    zone.setAttribute('data-glisse', '');
    const pos = (e) => (e.touches ? e.touches[0] : e).clientX;
    const debut = (e) => { x0 = pos(e); dx = 0; actif = true; zone.dataset.glisseEnCours = '1'; };
    const bouge = (e) => {
      if (!actif) return;
      dx = pos(e) - x0;
      piste.style.transition = 'none';
      piste.style.transform = `translateX(calc(-${getIndex() * 100}% + ${dx}px))`;
    };
    const fin = () => {
      if (!actif) return;
      actif = false; delete zone.dataset.glisseEnCours;
      piste.style.transition = '';
      if (dx > 50) aller(getIndex() - 1);
      else if (dx < -50) aller(getIndex() + 1);
      else aller(getIndex());
    };
    zone.addEventListener('mousedown', (e) => { e.preventDefault(); debut(e); });
    window.addEventListener('mousemove', bouge);
    window.addEventListener('mouseup', fin);
    zone.addEventListener('touchstart', debut, { passive: true });
    zone.addEventListener('touchmove', bouge, { passive: true });
    zone.addEventListener('touchend', fin);
    // un glissement ne doit pas ouvrir le lien de la diapositive
    zone.addEventListener('click', (e) => { if (Math.abs(dx) > 5) { e.preventDefault(); e.stopPropagation(); } }, true);
  }

  const placer = (piste, i, duree) => {
    piste.style.transition = `transform ${duree} ease-out`;
    piste.style.transform = `translateX(calc(-${i * 100}% + 0px))`;
  };
  const points = (n, i, label) => Array.from({ length: n }, (_, k) =>
    `<button data-point="${k}" class="h-2 rounded-full transition-all duration-300 ${k === i ? 'w-8 bg-primary' : 'w-2 bg-foreground/20 hover:bg-foreground/40'}" aria-label="${label} ${k + 1}"></button>`).join('');

  // ------------------------------------------------- carrousel « en vedette »
  function carrouselVedette(hote) {
    const liste = window.VEDETTE.map(projet).filter(Boolean);
    const n = liste.length;
    let i = 0;
    const mod = (k) => ((k % n) + n) % n;
    const lignes = (p, mobile) => `
      <div class="flex items-center gap-2 text-foreground/70 text-sm">${icone('map-pin', 'text-primary flex-shrink-0', 16)}${esc(p.lieu)}</div>
      <div class="flex items-center gap-2 text-foreground/70 text-sm">${icone('calendar', 'text-primary flex-shrink-0', 16)}${esc(p.annee)}</div>
      <div class="flex items-center gap-2 text-foreground/70 text-sm">${icone('maximize', 'text-primary flex-shrink-0', 16)}${esc(p.surface)}</div>`;
    const cote = (p, sens) => `
      <div class="w-64 lg:w-80 flex-shrink-0 ${sens === 'prec' ? '-mr-4 lg:-mr-6' : '-ml-4 lg:-ml-6'} self-center transition-all duration-500" style="transform:translateX(${sens === 'prec' ? '-30%' : '30%'})">
        <div class="cursor-pointer group transition-all duration-500" data-aller="${sens}"><div class="overflow-hidden rounded-xl bg-card transition-all duration-500 opacity-50 hover:opacity-70"><div class="relative h-48 lg:h-56 overflow-hidden"><img src="${img(p.image)}" alt="${esc(p.titre)}" class="w-full h-full object-cover" draggable="false"/></div><div class="p-4"><h3 class="font-semibold text-base text-foreground mb-2 line-clamp-1">${esc(p.titre)}</h3><div class="flex items-center gap-2 text-foreground/60 text-sm">${icone('map-pin', 'flex-shrink-0', 14)}<span class="line-clamp-1">${esc(p.lieu)}</span></div></div></div></div>
      </div>`;
    const bureau = () => {
      const p = liste[i];
      return `<div class="flex items-stretch justify-center">
        ${cote(liste[mod(i - 1)], 'prec')}
        <button data-aller="prec" class="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center bg-card border border-border rounded-full shadow-lg hover:bg-muted transition-colors" aria-label="Projet precedent">${icone('chevron-left', 'w-5 h-5 text-foreground')}</button>
        <div class="w-[420px] lg:w-[500px] flex-shrink-0 z-10 mx-4 lg:mx-8 transition-all duration-500"><a class="block" href="#projet-${p.id}"><div class="group overflow-hidden rounded-xl bg-card shadow-2xl transition-all duration-500 cursor-pointer h-full flex flex-col border border-border/50"><div class="relative h-56 lg:h-72 overflow-hidden flex-shrink-0"><img src="${img(p.image)}" alt="${esc(p.titre)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" draggable="false"/></div><div class="p-6 flex flex-col flex-grow"><h3 class="font-semibold text-xl text-foreground mb-4 line-clamp-2">${esc(p.titre)}</h3><div class="space-y-3 mb-6">${lignes(p)}</div><div class="mt-auto"><span class="block w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-all text-center">Voir le projet</span></div></div></div></a></div>
        <button data-aller="suiv" class="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center bg-card border border-border rounded-full shadow-lg hover:bg-muted transition-colors" aria-label="Projet suivant">${icone('chevron-right', 'w-5 h-5 text-foreground')}</button>
        ${cote(liste[mod(i + 1)], 'suiv')}
      </div>`;
    };
    const diapos = liste.map((p) => `<div class="w-full flex-shrink-0 px-2"><a href="#projet-${p.id}"><div class="group overflow-hidden rounded-lg bg-card shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col max-w-md mx-auto"><div class="relative h-56 overflow-hidden flex-shrink-0"><img src="${img(p.image)}" alt="${esc(p.titre)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" draggable="false"/></div><div class="p-6 flex flex-col flex-grow"><h3 class="font-semibold text-lg text-foreground mb-3 line-clamp-2 min-h-[3.5rem]">${esc(p.titre)}</h3><div class="space-y-3 mb-6">${lignes(p)}</div><div class="mt-auto"><span class="block w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:bg-opacity-90 transition-all text-sm text-center">Voir le projet</span></div></div></div></a></div>`).join('');

    hote.outerHTML = `<div data-vedette><div class="hidden md:block relative" data-bureau></div><div class="md:hidden relative px-6"><div class="relative cursor-grab active:cursor-grabbing select-none overflow-hidden" data-zone><div class="flex transition-transform duration-500 ease-out" data-piste>${diapos}</div></div><p class="text-center text-foreground/40 text-sm mt-4">Glissez pour voir plus</p></div></div>`;
    const racine = $('[data-vedette]');
    const piste = $('[data-piste]', racine), zone = $('[data-zone]', racine);
    const aller = (k) => { i = mod(k); $('[data-bureau]', racine).innerHTML = bureau(); placer(piste, i, '500ms'); };
    racine.addEventListener('click', (e) => {
      const b = e.target.closest('[data-aller]');
      if (b) aller(i + (b.dataset.aller === 'prec' ? -1 : 1));
    });
    glisser(zone, piste, () => i, aller);
    aller(0);
    minuteurs.push(setInterval(() => { if (!zone.dataset.glisseEnCours) aller(i + 1); }, 5000));
  }

  // ------------------------------------------- galeries de la page Création
  function carrouselCreation(hote, cle) {
    const liste = (window.GALERIES_CREATION[cle] || []);
    const n = liste.length;
    let i = 0;
    const mod = (k) => ((k % n) + n) % n;
    const cote = (it, sens) => `<div data-aller="${sens}" class="w-64 lg:w-80 flex-shrink-0 ${sens === 'prec' ? '-mr-4 lg:-mr-6' : '-ml-4 lg:-ml-6'} self-center cursor-pointer transition-all duration-500" style="transform:translateX(${sens === 'prec' ? '-30%' : '30%'})"><div class="overflow-hidden rounded-xl bg-card transition-all duration-500 opacity-50 hover:opacity-70"><div class="relative h-48 lg:h-56 overflow-hidden"><img alt="${esc(it.titre)}" draggable="false" class="object-cover" style="${ABS}" src="${img(it.image)}"/></div><div class="p-4"><p class="font-semibold text-base text-foreground line-clamp-1">${esc(it.titre)}</p></div></div></div>`;
    const bureau = () => {
      const it = liste[i];
      const centre = `<div class="w-[420px] lg:w-[560px] flex-shrink-0 z-10 mx-4 lg:mx-8 transition-all duration-500"><div class="overflow-hidden rounded-xl bg-card shadow-2xl border border-border/50 h-full flex flex-col"><div class="relative h-56 lg:h-80 overflow-hidden flex-shrink-0"><img alt="${esc(it.titre)}" draggable="false" class="object-cover" style="${ABS}" src="${img(it.image)}"/></div><div class="p-6 flex flex-col flex-grow"><h4 class="font-semibold text-xl text-foreground mb-2">${esc(it.titre)}</h4><p class="text-sm text-muted-foreground">${i + 1} / ${n}</p></div></div></div>`;
      if (n < 2) return `<div class="flex items-stretch justify-center">${centre}</div>`;
      return `<div class="flex items-stretch justify-center">${cote(liste[mod(i - 1)], 'prec')}<button data-aller="prec" class="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center bg-card border border-border rounded-full shadow-lg hover:bg-muted transition-colors" aria-label="Image précédente">${icone('chevron-left', 'w-5 h-5 text-foreground')}</button>${centre}<button data-aller="suiv" class="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center bg-card border border-border rounded-full shadow-lg hover:bg-muted transition-colors" aria-label="Image suivante">${icone('chevron-right', 'w-5 h-5 text-foreground')}</button>${cote(liste[mod(i + 1)], 'suiv')}</div>`;
    };
    const diapos = liste.map((it) => `<div class="w-full flex-shrink-0 px-1"><div class="bg-card rounded-xl shadow-lg overflow-hidden border border-border"><div class="relative h-[220px]"><img alt="${esc(it.titre)}" class="object-contain p-2" style="${ABS}" src="${img(it.image)}" draggable="false"/></div><div class="px-3 pb-2 text-center"><p class="text-xs font-semibold text-foreground">${esc(it.titre)}</p></div></div></div>`).join('');
    const id = 'galerie-' + cle;
    hote.outerHTML = `<div id="${id}"><div class="hidden md:block relative" data-bureau></div><div class="md:hidden relative px-4"><div class="relative cursor-grab active:cursor-grabbing select-none overflow-hidden" data-zone><div class="flex transition-transform duration-500 ease-out" data-piste>${diapos}</div></div>${n > 1 ? '<p class="text-center text-foreground/40 text-xs mt-3">Glissez pour voir plus</p>' : ''}</div>${n > 1 ? '<div class="flex justify-center gap-2 mt-4" data-points></div>' : ''}</div>`;
    const racine = document.getElementById(id);
    const piste = $('[data-piste]', racine), zone = $('[data-zone]', racine), pts = $('[data-points]', racine);
    const aller = (k) => {
      i = mod(k);
      $('[data-bureau]', racine).innerHTML = bureau();
      placer(piste, i, '500ms');
      if (pts) pts.innerHTML = points(n, i, "Aller à l'image");
    };
    racine.addEventListener('click', (e) => {
      const b = e.target.closest('[data-aller]'), p = e.target.closest('[data-point]');
      if (b) aller(i + (b.dataset.aller === 'prec' ? -1 : 1));
      else if (p) aller(+p.dataset.point);
    });
    if (n > 1) glisser(zone, piste, () => i, (k) => aller(Math.max(0, Math.min(n - 1, k))));
    aller(0);
  }

  // ------------------------------------------------------- témoignages
  function temoignages(section) {
    const piste = $('.flex.transition-transform', section);
    const zone = piste.parentElement;
    const pts = $$('button[aria-label^="Aller au témoignage"]', section);
    const n = piste.children.length;
    let i = 0;
    const aller = (k) => {
      i = ((k % n) + n) % n;
      placer(piste, i, '500ms');
      pts.forEach((b, k2) => { b.className = `h-2 rounded-full transition-all duration-300 ${k2 === i ? 'w-8 bg-primary' : 'w-2 bg-foreground/20 hover:bg-foreground/40'}`; });
    };
    $('button[aria-label="Témoignage précédent"]', section).addEventListener('click', () => aller(i - 1));
    $('button[aria-label="Témoignage suivant"]', section).addEventListener('click', () => aller(i + 1));
    pts.forEach((b, k) => b.addEventListener('click', () => aller(k)));
    glisser(zone, piste, () => i, aller);
    minuteurs.push(setInterval(() => { if (!zone.dataset.glisseEnCours) aller(i + 1); }, 6000));
  }

  // --------------------------------------------------- page « Biens »
  function pageBiens() {
    const cartes = window.PROJETS.map((p) => p.enCours
      ? `<div class="bg-card rounded-lg overflow-hidden shadow-md opacity-60"><div class="relative h-48 md:h-56 lg:h-64 overflow-hidden bg-muted flex items-center justify-center"><div class="text-center px-6"><div class="inline-block bg-primary/10 text-primary text-xs md:text-sm font-semibold px-4 py-2 rounded-full mb-3">En cours</div><p class="text-muted-foreground text-sm">Projet en cours de realisation</p></div></div><div class="p-4 md:p-5 lg:p-6"><h3 class="font-serif text-lg md:text-xl lg:text-2xl font-bold text-foreground mb-2">${esc(p.titre)}</h3><p class="text-xs md:text-sm text-muted-foreground">${esc(p.resume)}</p></div></div>`
      : `<a class="group bg-card rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300" href="#projet-${p.id}"><div class="relative h-48 md:h-56 lg:h-64 overflow-hidden"><img alt="${esc(p.titre)}" class="object-cover group-hover:scale-105 transition-transform duration-300" style="${ABS}" src="${img(p.image)}" loading="lazy"/></div><div class="p-4 md:p-5 lg:p-6"><div class="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mb-2"><span>${esc(p.lieu)}</span><span>•</span><span>${esc(p.annee)}</span></div><h3 class="font-serif text-lg md:text-xl lg:text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">${esc(p.titre)}</h3><p class="text-xs md:text-sm text-muted-foreground mb-3">${esc(p.resume)}</p><div class="flex items-center justify-between"><span class="text-xs md:text-sm font-semibold text-primary">${esc(p.type)}</span><span class="text-xs md:text-sm text-primary group-hover:translate-x-1 transition-transform">Voir le projet →</span></div></div></a>`).join('');
    return {
      classe: 'min-h-screen bg-background pt-20 md:pt-24',
      html: `<div class="container mx-auto px-4 md:px-6 py-8 md:py-12 lg:py-16"><div class="text-center mb-8 md:mb-12 lg:mb-16"><h1 class="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 md:mb-4">Nos Réalisations</h1><p class="text-muted-foreground text-sm md:text-base lg:text-lg max-w-2xl mx-auto">Découvrez nos projets de rénovation et de transformation de bâtisses normandes authentiques. Chaque projet est unique et reflète notre savoir-faire.</p></div><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">${cartes}</div></div>`
    };
  }

  // ------------------------------------------------- page « À vendre »
  function pageVentes() {
    const biens = window.A_VENDRE || [];
    const cartes = biens.map((p) => `<a class="group bg-card rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300" href="#vente-${p.id}"><div class="relative h-48 md:h-56 lg:h-64 overflow-hidden"><img alt="${esc(p.titre)}" class="object-cover group-hover:scale-105 transition-transform duration-300" style="${ABS}" src="${img(p.image)}" loading="lazy"/>${p.vendu ? filigrane('1.75rem') : ''}</div><div class="p-4 md:p-5 lg:p-6"><div class="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mb-2"><span>${esc(p.lieu)}</span>${p.surface ? `<span>•</span><span>${esc(p.surface)}</span>` : ''}</div><h3 class="font-serif text-lg md:text-xl lg:text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">${esc(p.titre)}</h3><p class="text-xs md:text-sm text-muted-foreground mb-3">${esc(p.resume)}</p><div class="flex items-center justify-between"><span class="text-xs md:text-sm font-semibold text-primary">${esc(p.prix || p.type)}</span><span class="text-xs md:text-sm text-primary group-hover:translate-x-1 transition-transform">Voir le bien →</span></div></div></a>`).join('');
    const vide = `<div class="text-center bg-card rounded-lg shadow-md max-w-2xl mx-auto p-8 md:p-12"><p class="font-serif text-xl md:text-2xl font-bold text-foreground mb-3">Aucun bien à vendre pour le moment</p><p class="text-muted-foreground text-sm md:text-base mb-6">De nouveaux biens arrivent régulièrement. Contactez-nous pour être informé en priorité.</p><button data-contact class="${BOUTON_BASE} bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-6 py-5 text-sm">Nous contacter</button></div>`;
    return {
      classe: 'min-h-screen bg-background pt-20 md:pt-24',
      html: `<div class="container mx-auto px-4 md:px-6 py-8 md:py-12 lg:py-16"><div class="text-center mb-8 md:mb-12 lg:mb-16"><h1 class="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 md:mb-4">À Vendre</h1><p class="text-muted-foreground text-sm md:text-base lg:text-lg max-w-2xl mx-auto">Découvrez nos biens actuellement en vente : des logements de caractère, rénovés avec soin et prêts à vivre ou à louer.</p></div>${biens.length ? `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">${cartes}</div>` : vide}</div>`
    };
  }

  // ------------------------------------------------- fiche d'un bien
  function pageProjet(p, vente = false) {
    const photos = p.photos && p.photos.length ? p.photos : [];
    const n = photos.length;
    const val = (v) => esc(v || '-');
    const fiches = vente ? [
      ['euro', 'Prix', p.prix], ['ruler', 'Surface', p.surface], ['house', 'Pièces', p.pieces],
      ['house', 'Chambres', p.chambres], ['sparkles', 'Salles de bain', p.sallesDeBain], ['zap', 'DPE', p.dpe]
    ] : [
      ['ruler', 'Surface', p.surface], ['calendar', 'Annee', p.annee], ['calendar', 'Duree travaux', p.dureeTravaux],
      ['house', 'Loyer', p.loyer], ['euro', 'Prix achat', p.prixAchat], ['hammer', 'Cout travaux', p.coutTravaux]
    ];
    // pdf : document à télécharger (ex. projections 3D), chemin sans « img/ » ; pdfTitre : texte du bouton
    const lienPdf = (cls) => p.pdf ? `<a href="${img(p.pdf)}" target="_blank" rel="noopener noreferrer" style="border:1px solid currentColor" class="${BOUTON_BASE} text-primary hover:bg-primary/10 h-9 px-4 ${cls}">${esc(p.pdfTitre || 'Voir le document (PDF)')}</a>` : '';
    const contacter = vente ? 'Nous contacter pour ce bien' : 'Nous contacter pour un projet similaire';
    const fichesMobile = fiches.map(([ic, l, v]) => `<div class="border border-border rounded-lg p-2.5 bg-muted/30"><div class="flex items-center gap-1.5 mb-0.5">${icone(ic, 'w-3.5 h-3.5 text-primary')}<p class="text-[10px] text-muted-foreground">${l}</p></div><p class="text-xs font-semibold">${val(v)}</p></div>`).join('');
    const fichesBureau = fiches.map(([ic, l, v]) => `<div class="border border-border rounded-lg p-3 bg-muted/30"><div class="flex items-center gap-2 mb-1">${icone(ic, 'w-4 h-4 text-primary')}<p class="text-xs text-muted-foreground">${l}</p></div><p class="text-sm font-semibold">${val(v)}</p></div>`).join('');
    const titre = esc(p.titre), description = esc(p.description);
    const principale = n ? img(photos[0]) : 'img/placeholder.svg';
    // photosEntieres : la photo est montrée en entier (fond neutre autour) au lieu d'être recadrée
    const cadrage = p.photosEntieres ? 'object-contain bg-muted' : 'object-cover';
    return {
      classe: 'min-h-screen bg-background pt-20 md:pt-24',
      html: `<div class="container mx-auto px-4 md:px-6 py-6 md:py-8 lg:py-12"><button data-retour class="${BOUTON_BASE} hover:text-accent-foreground dark:hover:bg-accent/50 h-9 px-4 py-2 has-[>svg]:px-3 mb-4 md:mb-6 text-xs md:text-sm hover:bg-muted">${icone('arrow-left', 'w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2')}${vente ? 'Retour aux biens à vendre' : 'Retour aux projets'}</button><div class="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12"><div class="lg:col-span-2 space-y-6 md:space-y-8">
        <div class="md:hidden relative"><div class="relative overflow-hidden rounded-lg shadow-lg" data-zone><div class="flex" data-piste style="transition:transform 0.3s ease-out">${photos.map((ph, k) => `<img src="${img(ph)}" alt="${titre} ${k + 1}" draggable="false" class="w-full h-auto aspect-[4/3] ${cadrage} flex-shrink-0"/>`).join('')}</div>${p.vendu ? filigrane('2rem') : ''}<button data-photo-prec class="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full">${icone('chevron-left', 'w-5 h-5')}</button><button data-photo-suiv class="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full">${icone('chevron-right', 'w-5 h-5')}</button><div data-compteur class="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">1 / ${n}</div></div><div class="flex justify-center items-center gap-1 mt-2" data-tirets></div>
          <div class="mt-4 space-y-1"><h1 class="font-serif text-xl font-bold text-foreground">${titre}</h1><p class="text-sm font-medium text-primary">${esc(p.type)}</p><div class="flex items-center gap-1.5 text-xs text-muted-foreground">${icone('map-pin', 'w-3 h-3')}<span>${esc(p.lieu)}</span></div></div>
          <div class="mt-4 border-t border-border pt-4"><h2 class="font-serif text-lg font-bold mb-2">Description</h2><p class="text-sm text-muted-foreground leading-relaxed">${description}</p></div>
          <div class="mt-4 grid grid-cols-2 gap-2">${fichesMobile}</div>
          <button data-contact class="${BOUTON_BASE} bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 has-[>svg]:px-3 w-full mt-4 text-xs py-3">${contacter}</button>${lienPdf('w-full mt-2 text-xs py-3')}</div>
        <div class="hidden md:flex gap-4"><div class="flex-1 relative"><img data-principale src="${principale}" alt="${titre}" class="w-full h-auto aspect-[4/3] ${cadrage} rounded-lg shadow-lg"/>${p.vendu ? filigrane('3rem') : ''}</div><div class="relative w-28 lg:w-32 aspect-[4/3]"><div class="h-full overflow-y-auto flex flex-col gap-2 p-1 scrollbar-hide">${photos.map((ph, k) => `<img data-vignette="${k}" src="${img(ph)}" alt="${titre} ${k + 1}" loading="lazy" class="w-full aspect-[4/3] object-cover rounded shadow-md hover:shadow-lg transition-all cursor-pointer flex-shrink-0 "/>`).join('')}</div></div></div>
      </div><div class="hidden md:block space-y-6"><div><h1 class="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-3">${titre}</h1><p class="text-base font-semibold text-primary mb-2">${esc(p.type)}</p><div class="flex items-center gap-2 text-sm text-muted-foreground">${icone('map-pin', 'w-4 h-4')}<span>${esc(p.lieu)}</span></div></div><div class="grid grid-cols-2 gap-3">${fichesBureau}</div></div></div>
      <div class="hidden md:block mt-8 lg:mt-12 border-t border-border pt-6 lg:pt-8"><div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6"><div class="lg:flex-1 lg:max-w-3xl"><h2 class="font-serif text-xl lg:text-2xl font-bold mb-3 lg:mb-4">${vente ? 'Description du bien' : 'Description du projet'}</h2><p class="text-sm lg:text-base text-muted-foreground leading-relaxed">${description}</p></div><div class="lg:flex-shrink-0 flex flex-col gap-3"><button data-contact class="${BOUTON_BASE} bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 has-[>svg]:px-3 w-full lg:w-auto text-sm py-5 lg:py-6 lg:px-8">${contacter}</button>${lienPdf('w-full lg:w-auto text-sm py-5 lg:py-6 lg:px-8')}</div></div></div></div>`,
      apres: (racine) => {
        let i = 0;
        const piste = $('[data-piste]', racine), zone = $('[data-zone]', racine);
        const aller = (k) => {
          if (!n) return;
          i = Math.max(0, Math.min(n - 1, k));
          piste.style.transition = 'transform 0.3s ease-out';
          piste.style.transform = `translateX(calc(-${i * 100}% + 0px))`;
          $('[data-compteur]', racine).textContent = `${i + 1} / ${n}`;
          $('[data-photo-prec]', racine).hidden = i === 0;
          $('[data-photo-suiv]', racine).hidden = i === n - 1;
          const tiret = (k2, cls, w) => `<div ${k2 != null ? `data-tiret="${k2}"` : ''} style="width:${w}px" class="h-0.5 rounded-full transition-all duration-200 ${cls}"></div>`;
          $('[data-tirets]', racine).innerHTML =
            (i > 0 ? tiret(i - 1, 'cursor-pointer bg-muted-foreground/30', 8) : tiret(null, 'cursor-pointer bg-muted-foreground/10', 8)) +
            tiret(null, 'bg-primary/70', 16) +
            (i < n - 1 ? tiret(i + 1, 'cursor-pointer bg-muted-foreground/30', 8) : tiret(null, 'cursor-pointer bg-muted-foreground/10', 8));
          $('[data-principale]', racine).src = img(photos[i]);
          $$('[data-vignette]', racine).forEach((v) => {
            const actif = +v.dataset.vignette === i;
            v.classList.toggle('ring-2', actif);
            v.classList.toggle('ring-primary', actif);
          });
        };
        racine.addEventListener('click', (e) => {
          const t = e.target;
          if (t.closest('[data-photo-prec]')) aller(i - 1);
          else if (t.closest('[data-photo-suiv]')) aller(i + 1);
          else if (t.closest('[data-tiret]')) aller(+t.closest('[data-tiret]').dataset.tiret);
          else if (t.closest('[data-vignette]')) aller(+t.closest('[data-vignette]').dataset.vignette);
          else if (t.closest('[data-retour]')) location.hash = vente ? '#a-vendre' : '#biens';
        });
        if (n > 1) glisser(zone, piste, () => i, aller);
        aller(0);
      }
    };
  }

  // ------------------------------------------------------- navigation
  function afficher() {
    arreterMinuteurs();
    let h = decodeURIComponent(location.hash.slice(1)) || 'accueil';
    let ancre = null;
    if (h === 'notre-histoire') { h = 'accueil'; ancre = 'notre-histoire'; }
    const main = $('#page');
    let m, vue = null;
    if ((m = h.match(/^projet-(\d+)$/)) && projet(m[1])) vue = pageProjet(projet(m[1]));
    else if (h === 'biens') vue = pageBiens();
    else if ((m = h.match(/^vente-(\d+)$/)) && venteBien(m[1])) vue = pageProjet(venteBien(m[1]), true);
    else if (h === 'a-vendre') vue = pageVentes();
    else {
      const t = document.getElementById('page-' + h) || document.getElementById('page-accueil');
      vue = { classe: t.dataset.classe, html: t.innerHTML };
    }
    main.className = vue.classe;
    main.innerHTML = vue.html;
    if (vue.apres) vue.apres(main);
    const v = $('[data-carrousel="vedette"]', main);
    if (v) carrouselVedette(v);
    $$('[data-carrousel]', main).forEach((el) => carrouselCreation(el, el.dataset.carrousel));
    const t = $('[data-temoignages]', main);
    if (t) temoignages(t);
    fermerMenu();
    if (ancre) document.getElementById(ancre).scrollIntoView();
    else window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', afficher);

  // ---------------------------------------------------------- en-tête
  const entete = $('header');
  const majEntete = () => {
    const bas = window.scrollY > 50;
    entete.classList.toggle('bg-white/90', !bas); entete.classList.toggle('backdrop-blur-sm', !bas);
    entete.classList.toggle('bg-white', bas); entete.classList.toggle('shadow-md', bas);
  };
  window.addEventListener('scroll', majEntete, { passive: true });

  // menu mobile
  const boutonMenu = $('header nav > button.lg\\:hidden');
  let menu = null;
  function fermerMenu() {
    if (menu) { menu.remove(); menu = null; boutonMenu.innerHTML = icone('menu', '', 20); }
  }
  boutonMenu.setAttribute('aria-label', 'Menu');
  boutonMenu.addEventListener('click', () => {
    if (menu) return fermerMenu();
    const liens = $$('header nav .hidden.lg\\:flex a').map((a) => `<a class="text-xs md:text-sm font-medium text-[#213B58] hover:text-[#931313] transition-colors" href="${a.getAttribute('href')}">${a.innerHTML}</a>`).join('');
    menu = document.createElement('div');
    menu.className = 'absolute top-full left-0 right-0 bg-white border-t border-gray-200 lg:hidden';
    menu.innerHTML = `<div class="flex flex-col p-3 md:p-4 gap-3">${liens}<button data-contact class="w-full bg-[#931313] text-white px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-medium hover:bg-[#7a1010] transition-all">Contactez-nous</button></div>`;
    boutonMenu.after(menu);
    boutonMenu.innerHTML = icone('x', '', 20);
  });
  window.ICONES.x = window.ICONES.x || '<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>';
  document.addEventListener('click', (e) => { if (menu && e.target.closest('header a')) fermerMenu(); });

  // ------------------------------------------------ fenêtre de contact
  const contact = $('#contact');
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-contact]')) { e.preventDefault(); fermerMenu(); contact.hidden = false; }
    else if (e.target.closest('[data-fermer]')) contact.hidden = true;
    else if (e.target.closest('a[href="#"]')) e.preventDefault();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') contact.hidden = true; });

  majEntete();
  afficher();
})();
