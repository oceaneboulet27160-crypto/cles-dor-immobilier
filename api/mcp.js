// =====================================================================
// Serveur MCP du site Clés d'Or Immobilier
// Permet à Claude (ou tout client MCP) d'interroger les réalisations et
// les biens à vendre du site. Lecture seule : rien n'est modifié.
// Adresse : https://cles-dor-immobilier.vercel.app/api/mcp
// Les données viennent de donnees.js (les mêmes que celles du site).
// =====================================================================
const path = require('path');

const SITE = 'https://cles-dor-immobilier.vercel.app';
const NOM = "Clés d'Or Immobilier";

function donnees() {
  global.window = global.window || {};
  require(path.join(__dirname, '..', 'donnees.js'));
  return {
    projets: (global.window.PROJETS || []).filter((p) => !p.enCours),
    enCours: (global.window.PROJETS || []).filter((p) => p.enCours),
    ventes: global.window.A_VENDRE || []
  };
}

const sansAccent = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const nombre = (s) => { const n = parseInt(String(s || '').replace(/[^\d]/g, ''), 10); return Number.isFinite(n) ? n : null; };
const photo = (p) => `${SITE}/img/${p}`;

function resumeRealisation(p) {
  return { id: p.id, nom: p.titre, lieu: p.lieu, annee: p.annee, type: p.type, surface: p.surface, loyer: p.loyer,
    prixAchat: p.prixAchat, coutTravaux: p.coutTravaux, dureeTravaux: p.dureeTravaux, resume: p.resume,
    lien: `${SITE}/#projet-${p.id}` };
}
function detailRealisation(p) {
  return { ...resumeRealisation(p), description: p.description, vignette: photo(p.image),
    photos: (p.photos || []).map(photo), nombrePhotos: (p.photos || []).length };
}
function resumeVente(v) {
  return { id: v.id, nom: v.titre, lieu: v.lieu, type: v.type, prix: v.prix, surface: v.surface, pieces: v.pieces,
    chambres: v.chambres, sallesDeBain: v.sallesDeBain, dpe: v.dpe, statut: v.vendu ? 'vendu' : 'à vendre',
    resume: v.resume, lien: `${SITE}/#vente-${v.id}` };
}
function detailVente(v) {
  return { ...resumeVente(v), description: v.description, vignette: photo(v.image), photos: (v.photos || []).map(photo),
    document: v.pdf ? { titre: v.pdfTitre || 'Document PDF', lien: photo(v.pdf) } : null };
}
function trouver(liste, cle) {
  const k = sansAccent(cle).trim();
  return liste.find((p) => String(p.id) === k) || liste.find((p) => sansAccent(p.titre) === k)
    || liste.find((p) => sansAccent(p.titre).includes(k));
}
function filtrer(liste, a, champs) {
  return liste.filter((p) =>
    (!a.ville || sansAccent(p.lieu).includes(sansAccent(a.ville))) &&
    (!a.type || sansAccent(p.type).includes(sansAccent(a.type))) &&
    (!a.annee || String(p.annee) === String(a.annee)) &&
    (!a.texte || champs.some((c) => sansAccent(p[c]).includes(sansAccent(a.texte)))));
}

// ------------------------------------------------------------ outils
const OUTILS = [
  { name: 'rechercher_realisations',
    description: "Liste les réalisations (appartements rénovés) de Clés d'Or Immobilier, avec filtres facultatifs. Renvoie nom, lieu, année, type, surface, loyer, prix d'achat, coût des travaux et lien vers la fiche.",
    inputSchema: { type: 'object', properties: {
      ville: { type: 'string', description: 'Ville ou secteur, ex. « Dieppe », « Rouen », « Hôtel de Ville »' },
      type: { type: 'string', description: 'Type de bien, ex. « T2 », « Studio », « duplex »' },
      annee: { type: 'string', description: 'Année de réalisation, ex. « 2025 »' },
      texte: { type: 'string', description: 'Mot à chercher dans le nom, le résumé ou la description, ex. « verrière »' } } } },
  { name: 'details_realisation',
    description: "Fiche complète d'une réalisation : description, chiffres, liens des photos. Accepte le nom (ex. « Océan », « Le Toucan ») ou le numéro.",
    inputSchema: { type: 'object', properties: { nom: { type: 'string', description: 'Nom ou numéro de la réalisation' } }, required: ['nom'] } },
  { name: 'biens_a_vendre',
    description: "Liste les biens de la page « À vendre » : prix, surface, pièces, chambres, salles de bain, DPE, statut (à vendre ou vendu).",
    inputSchema: { type: 'object', properties: {
      inclure_vendus: { type: 'boolean', description: 'Inclure aussi les biens marqués vendus (par défaut : oui)' } } } },
  { name: 'details_bien_a_vendre',
    description: "Fiche complète d'un bien à vendre : description, caractéristiques, photos et document PDF éventuel (projections 3D). Accepte le nom (ex. « La Vaupalière ») ou le numéro.",
    inputSchema: { type: 'object', properties: { nom: { type: 'string', description: 'Nom ou numéro du bien' } }, required: ['nom'] } },
  { name: 'statistiques',
    description: "Chiffres clés calculés sur les réalisations : nombre de projets par ville, par type et par année, surfaces, loyers, prix d'achat et coûts des travaux (totaux et moyennes).",
    inputSchema: { type: 'object', properties: {
      ville: { type: 'string', description: 'Limiter les calculs à une ville, ex. « Rouen »' } } } },
  { name: 'infos_agence',
    description: "Coordonnées et présentation de Clés d'Or Immobilier et de Show Must Go Home (contact, réseaux sociaux, pages du site).",
    inputSchema: { type: 'object', properties: {} } }
];

function moyenne(t) { return t.length ? Math.round(t.reduce((a, b) => a + b, 0) / t.length) : null; }
function compter(liste, f) { const r = {}; liste.forEach((p) => { const k = f(p) || 'non précisé'; r[k] = (r[k] || 0) + 1; }); return r; }
function villeDe(lieu) { const l = String(lieu || ''); const m = l.split(',').pop().trim(); return /rouen/i.test(l) ? 'Rouen' : /dieppe/i.test(l) ? 'Dieppe' : m; }

function executer(nom, a = {}) {
  const d = donnees();
  switch (nom) {
    case 'rechercher_realisations': {
      const r = filtrer(d.projets, a, ['titre', 'resume', 'description', 'lieu', 'type']);
      return { nombre: r.length, realisations: r.map(resumeRealisation), projetsEnCours: d.enCours.length };
    }
    case 'details_realisation': {
      const p = trouver(d.projets, a.nom);
      if (!p) return { erreur: `Aucune réalisation trouvée pour « ${a.nom} ».`, noms: d.projets.map((x) => x.titre) };
      return detailRealisation(p);
    }
    case 'biens_a_vendre': {
      const r = d.ventes.filter((v) => a.inclure_vendus !== false || !v.vendu);
      return { nombre: r.length, biens: r.map(resumeVente), page: `${SITE}/#a-vendre` };
    }
    case 'details_bien_a_vendre': {
      const v = trouver(d.ventes, a.nom);
      if (!v) return { erreur: `Aucun bien à vendre trouvé pour « ${a.nom} ».`, noms: d.ventes.map((x) => x.titre) };
      return detailVente(v);
    }
    case 'statistiques': {
      const r = a.ville ? d.projets.filter((p) => sansAccent(p.lieu).includes(sansAccent(a.ville))) : d.projets;
      const val = (k) => r.map((p) => nombre(p[k])).filter((n) => n);
      const loyers = val('loyer'), achats = val('prixAchat'), travaux = val('coutTravaux'), surfaces = val('surface');
      return {
        perimetre: a.ville || 'toutes les villes', nombreRealisations: r.length,
        parVille: compter(r, (p) => villeDe(p.lieu)), parType: compter(r, (p) => p.type), parAnnee: compter(r, (p) => p.annee),
        surface: { totale_m2: surfaces.reduce((x, y) => x + y, 0), moyenne_m2: moyenne(surfaces) },
        loyer: { renseignes: loyers.length, moyen_euros_mois: moyenne(loyers), total_euros_mois: loyers.reduce((x, y) => x + y, 0) },
        prixAchat: { renseignes: achats.length, moyen_euros: moyenne(achats), total_euros: achats.reduce((x, y) => x + y, 0) },
        coutTravaux: { renseignes: travaux.length, moyen_euros: moyenne(travaux), total_euros: travaux.reduce((x, y) => x + y, 0) },
        note: "Calculs sur les valeurs renseignées dans les fiches (« - » est ignoré)."
      };
    }
    case 'infos_agence':
      return {
        nom: NOM, activite: "Rénovation et réhabilitation de bâtisses normandes, investissement immobilier clef en main, gestion locative.",
        telephone: '07 64 46 24 58', email: 'Clesdorimmobilier@gmail.com', adresse: 'Rouen, 76000 Seine-Maritime, Normandie',
        site: 'https://clés-dor-immobilier.com',
        pages: { accueil: `${SITE}/#accueil`, realisations: `${SITE}/#biens`, aVendre: `${SITE}/#a-vendre`,
          investissement: `${SITE}/#investissement`, creation: `${SITE}/#creation` },
        collaboration: { nom: 'Show Must Go Home', role: "Conception et décoration d'intérieur (moodboards, projections 3D, plans)",
          instagram: 'https://www.instagram.com/show_must_go_home', tiktok: 'https://www.tiktok.com/@show_must_go_home' },
        chiffres: { realisationsEnLigne: d.projets.length, biensAVendre: d.ventes.filter((v) => !v.vendu).length }
      };
    default:
      return null;
  }
}

// --------------------------------------------------- protocole MCP
const VERSIONS = ['2025-06-18', '2025-03-26', '2024-11-05'];

function repondre(msg) {
  const { id, method, params = {} } = msg;
  if (id === undefined || id === null) return null;                // notification : pas de réponse
  const ok = (result) => ({ jsonrpc: '2.0', id, result });
  const ko = (code, message) => ({ jsonrpc: '2.0', id, error: { code, message } });
  switch (method) {
    case 'initialize':
      return ok({
        protocolVersion: VERSIONS.includes(params.protocolVersion) ? params.protocolVersion : VERSIONS[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: 'cles-dor-immobilier', title: NOM, version: '1.0.0' },
        instructions: "Données du site Clés d'Or Immobilier (réalisations, biens à vendre, chiffres). Réponds en français ; cite le lien de la fiche quand c'est utile."
      });
    case 'ping': return ok({});
    case 'tools/list': return ok({ tools: OUTILS });
    case 'tools/call': {
      if (!OUTILS.some((o) => o.name === params.name)) return ko(-32602, `Outil inconnu : ${params.name}`);
      try {
        const r = executer(params.name, params.arguments || {});
        return ok({ content: [{ type: 'text', text: JSON.stringify(r, null, 2) }], structuredContent: r, isError: !!(r && r.erreur) });
      } catch (e) {
        return ok({ content: [{ type: 'text', text: 'Erreur : ' + e.message }], isError: true });
      }
    }
    case 'resources/list': return ok({ resources: [] });
    case 'prompts/list': return ok({ prompts: [] });
    default: return ko(-32601, `Méthode non prise en charge : ${method}`);
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Mcp-Session-Id, Mcp-Protocol-Version, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method === 'GET') {
    // Pas de flux d'événements : le serveur répond seulement aux requêtes POST.
    return res.status(405).setHeader('Allow', 'POST').json({ info: `Serveur MCP ${NOM}. Utilisez POST (JSON-RPC).`, outils: OUTILS.map((o) => o.name) });
  }
  if (req.method !== 'POST') return res.status(405).end();
  let corps = req.body;
  if (typeof corps === 'string') { try { corps = JSON.parse(corps); } catch { corps = null; } }
  if (!corps) return res.status(400).json({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'JSON invalide' } });
  const reponses = (Array.isArray(corps) ? corps : [corps]).map(repondre).filter(Boolean);
  if (!reponses.length) return res.status(202).end();
  return res.status(200).json(Array.isArray(corps) ? reponses : reponses[0]);
};

module.exports.executer = executer;
module.exports.OUTILS = OUTILS;
