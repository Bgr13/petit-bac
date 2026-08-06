// ─── GAME CONFIGURATION ─────────────────────────────────────
const LEVELS = [
  { level:1,  fr:"Débutant",     en:"Beginner",     xpNeeded:0,    badge:"🌱" },
  { level:2,  fr:"Apprenti",     en:"Apprentice",   xpNeeded:100,  badge:"📖" },
  { level:3,  fr:"Lettré",       en:"Literate",     xpNeeded:300,  badge:"✏️" },
  { level:4,  fr:"Cultivé",      en:"Cultured",     xpNeeded:600,  badge:"🎓" },
  { level:5,  fr:"Expert",       en:"Expert",       xpNeeded:1000, badge:"🏅" },
  { level:6,  fr:"Maître",       en:"Master",       xpNeeded:1500, badge:"⭐" },
  { level:7,  fr:"Champion",     en:"Champion",     xpNeeded:2200, badge:"🏆" },
  { level:8,  fr:"Légende",      en:"Legend",       xpNeeded:3000, badge:"👑" },
  { level:9,  fr:"Grand Maître", en:"Grand Master", xpNeeded:4000, badge:"💎" },
  { level:10, fr:"Immortel",     en:"Immortal",     xpNeeded:6000, badge:"🔥" },
];
function getLevelName(lvl, lang) { return lvl[lang] || lvl.fr; }
function getLevelInfo(xp, lang) {
  let current = LEVELS[0];
  for (const l of LEVELS) { if (xp >= l.xpNeeded) current = l; else break; }
  const nextIdx = LEVELS.indexOf(current) + 1;
  const next = LEVELS[nextIdx] || null;
  const progress = next ? Math.round(((xp - current.xpNeeded) / (next.xpNeeded - current.xpNeeded)) * 100) : 100;
  const name = getLevelName(current, lang || "fr");
  const nextName = next ? getLevelName(next, lang || "fr") : null;
  return { ...current, name, xp, next: next ? { ...next, name: nextName } : null, progress };
}
function calcXpGain(score, won, roundsPlayed) {
  let xp = score * 3;
  if (won) xp += 50;
  xp += roundsPlayed * 5;
  return xp;
}

// ─── BADGES DÉBLOCABLES ───────────────────────────────────────────
// BADGE_DEFS imported from ./data/badges.js

// ─── TOURNOI HEBDOMADAIRE ─────────────────────────────────────────
function getTournamentWeek() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const week = Math.floor((now - start) / (7 * 24 * 60 * 60 * 1000));
  const letters = "ABCDEFGHIJKLMNOPRSTV";
  const letter = letters[week % letters.length];

  // 7 catégories communes à tous les joueurs cette semaine
  // Déterminées par le numéro de semaine → identiques pour tout le monde
  const allCats = [...FREE_CATS, ...PRO_CATS];
  const weekCats = [];
  for (let i = 0; i < 7; i++) {
    weekCats.push(allCats[(week * 7 + i) % allCats.length]);
  }

  // Timer jusqu'au lundi prochain à 00:00
  const dayOfWeek = now.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);
  const msLeft = nextMonday - now;
  const daysLeft = Math.floor(msLeft / 86400000);
  const hoursLeft = Math.floor((msLeft % 86400000) / 3600000);
  const minsLeft = Math.floor((msLeft % 3600000) / 60000);
  const secsLeft = Math.floor((msLeft % 60000) / 1000);

  return {
    letter,
    weekNum: week,
    cats: weekCats,
    endsIn: daysLeft,
    msLeft, daysLeft, hoursLeft, minsLeft, secsLeft,
  };
}
function getDailyChallenge() {
  const now = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const pool = DAILY_CAT_POOL;
  const cats = [];
  for (let i = 0; i < 4; i++) {
    cats.push(pool[(dayOfYear * 4 + i) % pool.length]);
  }
  const letters = "ABCDEFGHIJKLMNOPRSTV";
  const letter = letters[dayOfYear % letters.length];
  const todayKey = `daily_${now.getFullYear()}_${dayOfYear}`;

  // Calculer le temps restant jusqu'à minuit
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const msLeft = midnight - now;
  const hoursLeft = Math.floor(msLeft / 3600000);
  const minsLeft = Math.floor((msLeft % 3600000) / 60000);
  const secsLeft = Math.floor((msLeft % 60000) / 1000);

  return { cats, letter, todayKey, dayOfYear, msLeft, hoursLeft, minsLeft, secsLeft };
}
// ─── CAT_LABELS — Traductions des catégories ─────────────────────────────
const CAT_LABELS = {
  prenom:       { fr:"Prénom",           en:"First Name",     es:"Nombre"          },
  nom:          { fr:"Nom de famille",   en:"Last Name",      es:"Apellido"        },
  pays:         { fr:"Pays",             en:"Country",        es:"País"            },
  ville:        { fr:"Ville",            en:"City",           es:"Ciudad"          },
  animal:       { fr:"Animal",           en:"Animal",         es:"Animal"          },
  fruit:        { fr:"Fruit",            en:"Fruit",          es:"Fruta"           },
  metier:       { fr:"Métier",           en:"Job",            es:"Profesión"       },
  celebrite:    { fr:"Célébrité",        en:"Celebrity",      es:"Celebridad"      },
  sport:        { fr:"Sport",            en:"Sport",          es:"Deporte"         },
  objet:        { fr:"Objet",            en:"Object",         es:"Objeto"          },
  film:         { fr:"Film",             en:"Movie",          es:"Película"        },
  marque:       { fr:"Marque",           en:"Brand",          es:"Marca"           },
  anatomie:     { fr:"Anatomie",         en:"Anatomy",        es:"Anatomía"        },
  musique:      { fr:"Musique",          en:"Music",          es:"Música"          },
  cuisine:      { fr:"Cuisine",          en:"Food",           es:"Comida"          },
  vehicule:     { fr:"Véhicule",         en:"Vehicle",        es:"Vehículo"        },
  capital:      { fr:"Capitale",         en:"Capital",        es:"Capital"         },
  monument:     { fr:"Monument",         en:"Monument",       es:"Monumento"       },
  langue:       { fr:"Langue",           en:"Language",       es:"Idioma"          },
  instrument:   { fr:"Instrument",       en:"Instrument",     es:"Instrumento"     },
  vetement:     { fr:"Vêtement",         en:"Clothing",       es:"Ropa"            },
  emotion:      { fr:"Émotion",          en:"Emotion",        es:"Emoción"         },
  mythologie:   { fr:"Mythologie",       en:"Mythology",      es:"Mitología"       },
  espace:       { fr:"Espace",           en:"Space",          es:"Espacio"         },
  oceane:       { fr:"Vie marine",       en:"Sea Life",       es:"Vida marina"     },
  medievale:    { fr:"Moyen Âge",        en:"Middle Ages",    es:"Edad Media"      },
  technologie:  { fr:"Technologie",      en:"Technology",     es:"Tecnología"      },
  danse:        { fr:"Danse",            en:"Dance",          es:"Baile"           },
  architecture: { fr:"Architecture",     en:"Architecture",   es:"Arquitectura"    },
  sport_star:   { fr:"Sportif célèbre",  en:"Sports Star",    es:"Deportista"      },
  personnage:   { fr:"Personnage",       en:"Character",      es:"Personaje"       },
};

function getCatLabel(catId, lang) {
  // D'abord dans CAT_LABELS (catégories standards)
  if (CAT_LABELS[catId]) {
    return CAT_LABELS[catId]?.[lang || "fr"] || CAT_LABELS[catId]?.fr || catId;
  }
  // Ensuite dans DAILY_CAT_POOL (catégories défi du jour)
  const daily = DAILY_CAT_POOL.find(c => c.id === catId);
  if (daily) return daily.label;
  // Fallback: nettoyer l'ID (dc_mythologie → Mythologie)
  return catId.replace(/^dc_/, "").replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

const FREE_CATS = [
  { id: "prenom",  emoji: "👤", tier: "free" },
  { id: "pays",    emoji: "🌍", tier: "free" },
  { id: "ville",   emoji: "🏙️", tier: "free" },
  { id: "animal",  emoji: "🐾", tier: "free" },
  { id: "fruit",   emoji: "🍎", tier: "free" },
  { id: "metier",  emoji: "💼", tier: "free" },
];
const PRO_CATS = [
  { id: "celebrite",   emoji: "⭐", tier: "pro" },
  { id: "sport",       emoji: "🏅", tier: "pro" },
  { id: "objet",       emoji: "📦", tier: "pro" },
  { id: "film",        emoji: "🎬", tier: "pro" },
  { id: "marque",      emoji: "🛍️", tier: "pro" },
  { id: "anatomie",    emoji: "🫀", tier: "pro" },
  { id: "musique",     emoji: "🎵", tier: "pro" },
  { id: "cuisine",     emoji: "🍽️", tier: "pro" },
  { id: "vehicule",    emoji: "🚗", tier: "pro" },
  { id: "capital",     emoji: "🏛️", tier: "pro" },
  { id: "monument",    emoji: "🗼", tier: "pro" },
  { id: "langue",      emoji: "🗣️", tier: "pro" },
  { id: "instrument",  emoji: "🎸", tier: "pro" },
  { id: "vetement",    emoji: "👗", tier: "pro" },
  { id: "emotion",     emoji: "😤", tier: "pro" },
  { id: "mythologie",  emoji: "⚡", tier: "pro" },
  { id: "espace",      emoji: "🚀", tier: "pro" },
  { id: "oceane",      emoji: "🐠", tier: "pro" },
  { id: "medievale",   emoji: "⚔️", tier: "pro" },
  { id: "technologie", emoji: "💻", tier: "pro" },
  { id: "danse",       emoji: "💃", tier: "pro" },
  { id: "architecture",emoji: "🏰", tier: "pro" },
  { id: "sport_star",  emoji: "🏆", tier: "pro" },
  { id: "personnage",  emoji: "🎭", tier: "pro" },
];
const ALL_BASE = [...FREE_CATS, ...PRO_CATS];
const ROUNDS_OPTIONS = { free: [5], pro: [5, 10], vip: [5, 10, 15, 20] };
const DIFFICULTY = {
  easy:   { label: "Facile",    time: 120, aiDelay: 4500, color: "#4ade80" },
  medium: { label: "Moyen",     time: 60,  aiDelay: 2000, color: "#facc15" },
  hard:   { label: "Difficile", time: 30,  aiDelay: 800,  color: "#f87171" },
};
const AI_NAMES = ["Bot Alex", "Bot Maya", "Bot Léo"];
const COUNTRIES = ["France","Belgique","Suisse","Canada","Maroc","Algérie","Tunisie","Sénégal","Côte d'Ivoire","Autre"];


// ─── TIERS ──────────────────────────────────────────────────────────────
const TIER = { FREE: "free", PRO: "pro", VIP: "vip" };

// ─── ALPHABET ─────────────────────────────────────────────────────────────
const ALPHABET = "ABCDEFGHIJKLMNOPRSTV".split("");

// ─── DAILY_CAT_POOL ───────────────────────────────────────────────────────
const DAILY_CAT_POOL = [
  { id: "dc_emotion",      label: "Émotion",            emoji: "😤" },
  { id: "dc_super",        label: "Super-héros",         emoji: "🦸" },
  { id: "dc_mythologie",   label: "Mythologie",          emoji: "⚡" },
  { id: "dc_espace",       label: "Espace",              emoji: "🚀" },
  { id: "dc_sport_star",   label: "Sportif célèbre",     emoji: "⚽" },
  { id: "dc_film_perso",   label: "Personnage de film",  emoji: "🎬" },
  { id: "dc_couleur_rare", label: "Couleur rare",        emoji: "🎨" },
  { id: "dc_oceane",       label: "Vie marine",          emoji: "🐠" },
  { id: "dc_medievale",    label: "Moyen Âge",           emoji: "⚔️" },
  { id: "dc_cuisine_monde",label: "Plat du monde",       emoji: "🌍" },
  { id: "dc_danse",        label: "Danse",               emoji: "💃" },
  { id: "dc_meteo",        label: "Météo",               emoji: "⛈️" },
  { id: "dc_architecture", label: "Architecture",        emoji: "🏛️" },
  { id: "dc_personnage",   label: "Personnage BD",       emoji: "🦸" },
  { id: "dc_informatique", label: "Informatique",        emoji: "💻" },
  { id: "dc_mode",         label: "Mode & Luxe",         emoji: "👗" },
  { id: "dc_science",      label: "Science",             emoji: "🔬" },
  { id: "dc_religion",     label: "Religion",            emoji: "⛪" },
  { id: "dc_art",          label: "Art & Peinture",      emoji: "🖼️" },
  { id: "dc_histoire",     label: "Histoire",            emoji: "📜" },
];


export {
  LEVELS, getLevelName, getLevelInfo, calcXpGain,
  getTournamentWeek, getDailyChallenge,
  CAT_LABELS, getCatLabel,
  FREE_CATS, PRO_CATS, ALL_BASE,
  ROUNDS_OPTIONS, DIFFICULTY, AI_NAMES, COUNTRIES,
  TIER, ALPHABET, DAILY_CAT_POOL,
};
