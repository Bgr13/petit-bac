export const BADGE_DEFS = [
  { id: "first_win",    icon: "🏆", name: "Première victoire",    desc: "Gagne ta première partie",          check: (s) => s.won >= 1 },
  { id: "ten_games",    icon: "🎮", name: "Accro",                desc: "Joue 10 parties",                   check: (s) => s.played >= 10 },
  { id: "fifty_games",  icon: "🎯", name: "Vétéran",              desc: "Joue 50 parties",                   check: (s) => s.played >= 50 },
  { id: "perfect",      icon: "💯", name: "Parfait",              desc: "Score 20pts dans une partie",        check: (s) => s.best >= 20 },
  { id: "streak3",      icon: "🔥", name: "En feu",               desc: "3 victoires d'affilée",             check: (s) => s.streak >= 3 },
  { id: "streak5",      icon: "⚡", name: "Inarrêtable",          desc: "5 victoires d'affilée",             check: (s) => s.streak >= 5 },
  { id: "champion",     icon: "👑", name: "Champion",             desc: "100 parties jouées",                check: (s) => s.played >= 100 },
  { id: "wordsmith",    icon: "📚", name: "Érudit",               desc: "200 mots valides soumis",           check: (s) => (s.totalWords || 0) >= 200 },
  { id: "unique100",    icon: "🦄", name: "Unique",               desc: "100 réponses uniques",              check: (s) => (s.uniqueWords || 0) >= 100 },
];
