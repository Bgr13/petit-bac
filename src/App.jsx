import { useState, useEffect, useRef, useMemo, Component } from "react";
import { TRANSLATIONS } from "./data/translations.js";
import { BADGE_DEFS } from "./data/badges.js";
// BUG 1 FIX: Import Firebase npm modular API
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref as dbRef, set as dbSet, get as dbGet, update as dbUpdate, onValue as dbOnValue, query as dbQuery, orderByChild, equalTo, limitToLast } from "firebase/database";
import { getAuth, signInAnonymously } from "firebase/auth";

// ═══════════════════════════════════════════════════════════════════
//  LE PETIT BAC — Application mobile (App Store / Google Play)
//  Version : 1.0.0
//  Bundle ID (iOS) : com.petitbac.app
//  Package (Android) : com.petitbac.app
//  Auteur : Petit Bac Studios
//  Licence : Propriétaire — Tous droits réservés © 2024
//  Contact : contact@petitbac.app
//
//  Dépendances open-source :
//    • React (MIT) — facebook.github.io/react
//    • Firebase SDK (Apache 2.0) — firebase.google.com
//    • Web Audio API (W3C Standard)
//
//  Politique de confidentialité : https://petitbac.app/privacy
//  Conditions d'utilisation : https://petitbac.app/terms
//
//  Pour activer le multijoueur, voir GUIDE_FIREBASE.md
// ═══════════════════════════════════════════════════════════════════

// ─── CONFIG ──────────────────────────────────────────────────────
// Voir .env.example pour les variables d'environnement requises
const FIREBASE_CONFIG = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL:       import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};
const FIREBASE_READY = !!(
  FIREBASE_CONFIG.apiKey &&
  FIREBASE_CONFIG.apiKey !== "VOTRE_API_KEY" &&
  FIREBASE_CONFIG.apiKey !== "undefined"
);


// ─── INTERNATIONALISATION ────────────────────────────────────────
// TRANSLATIONS imported from ./data/translations.js
const _TRANS_PARTIAL = {
  fr: {
    ob_placeholder: "Ton prénom ou pseudo",
    // Misc
    loading: "Chargement...",
    searching: "Recherche d'adversaires...",
    xp: "XP",
    xp_gained: "XP gagnés",
    level: "Niv.",
    badge_unlocked: "BADGE DÉBLOQUÉ",
    tournament_rules_short: "Réponses uniques = +10pts • Faux = ❌ éliminé",
    tournament_prize: "Gagnant = 1 mois VIP offert !",
    inventif_desc: "Celui qui utilise les mots les plus longs et rares",
    fastest_desc: "Celui qui a trouvé le plus de réponses uniques",
    shuffle_teams: "Mélanger les équipes",
    choose_teams: "Choisir les équipes",
    cats_per_round: "Catégories par manche",
    team_red: "🔴 Équipe Rouge",
    team_blue: "🔵 Équipe Bleu",
    team_green: "🟢 Équipe Verte",
    assign_teams: "Former les équipes",
    vote_phase_title: "Vote — Catégorie perso",
    vote_validate: "Valider ✓",
    vote_reject: "Invalide ✗",
    vote_waiting: "En attente des votes…",
    vote_result_ok: "✅ Validée (majorité)",
    vote_result_tie: "⚖️ Égalité — 1 pt",
    vote_result_no: "❌ Refusée",
    vote_submit: "Confirmer mes votes",
    vote_info: "Votez pour valider les réponses des catégories créées par l'hôte",
    unlock_pro: "Débloquer PRO",
    en_ligne: "En ligne",
    vs_bots: "vs Bots",
    team_wins: "L'équipe gagne !",
    last_survivor: "Dernier survivant !",
    enemy_team: "Adversaires",
    your_team: "Ton équipe",
    eliminated: "éliminé(s)",
    room_not_found: "Salon introuvable. Vérifie le code.",
    firebase_connected: "Firebase connecté — multijoueur actif",
    stripe_test_mode: "Mode démo : abonnement activé pour la présentation !",
    tier_vip_f4: "Badge exclusif ★",
    tier_vip_f3: "Tournois VIP",
    tier_vip_f2: "12 thèmes exclusifs",
    tier_vip_f1: "Tout PRO +",
    tier_pro_f4: "Défi quotidien",
    tier_pro_f3: "Multijoueur illimité",
    tier_pro_f2: "10 thèmes",
    tier_pro_f1: "30 catégories",
    tier_free_f3: "Solo vs IA",
    tier_free_f2: "2 thèmes",
    tier_free_f1: "6 catégories",
    stripe_secure: "Paiement sécurisé par Stripe • Annulable à tout moment",
    per_month: "/mois",
    subscribe_btn: "S'abonner",
    privacy_title: "Politique de confidentialité",
    cgu_title: "Conditions d'utilisation",
    no_players: "Sois le premier à jouer !",
    leaderboard_title: "Classement Mondial",
    letter_chosen: "Lettre : {0} 🚀",
    spinner_rolling: "{0} tourne…",
    stop_btn2: "STOP !",
    go_btn: "C'est parti ! 🚀",
    its_your_turn: "🎲 C'est ton tour de lancer !",
    join_btn: "Rejoindre",
    salon_label: "Salon",
    players_count: "Joueurs",
    its_you_paren: "(toi)",
    daily_letter_desc: "Lettre : {0} · 1 round · Difficile",
    cancel3: "Annuler",
    subscriptions: "Abonnements",
    personalisation: "Personnalisation",
    save_btn: "Enregistrer",
    choose_color: "Couleur de fond",
    choose_emoji: "Choisis un emoji",
    photo_title: "📷 Photo de profil",
    app_name_fr: "Le Petit Bac",
    share_title: "🔗 Partager",
    on_it: "On s'en occupe au plus vite.",
    description: "Description",
    bug_desc_placeholder: "Décris le problème ici…",
    support: "Support",
    tournament_letter: "Lettre du tournoi :",
    solo_vs_ia2: "Solo vs IA",
    back_btn: "← Retour",
    your_name2: "Ton nom",
    your_profile2: "Ton profil",
    subscription: "Abonnement",
    pseudo_sub: "Ton nom en jeu",
    pseudo_label: "📛 Pseudo",
    country_label: "🌍 Pays",
    sounds_sub: "Effets sonores du jeu",
    sounds_label: "🔊 Sons",
    vibrations_sub: "Retour haptique sur les actions",
    vibrations: "📳 Vibrations",
    lang_selector_sub: "Interface language",
    lang_selector: "🌐 Langue / Language / Idioma",
    legal_contact_email: "support@petitbac.app",
    legal_contact: "Contact :",
    legal_react: "React (MIT) · Firebase (Apache 2.0)",
    legal_licenses: "Licences open source :",
    legal_version: "Version 1.0.0 · © 2024 Petit Bac Studios",
    go_home2: "🏠 Accueil",
    play_again2: "🔄 Rejouer",
    its_you: "C'est toi !",
    this_round: "Ce round",
    letter_label: "Lettre :",
    round_label: "Round",
    launch_btn: "🚀 Lancer",
    rounds_label: "Rounds",
    game_settings: "Paramètres de jeu",
    difficulty_label: "Difficulté",
    categories_label: "Catégories",
    search_ellipsis: "Recherche…",
    public_game: "Partie publique",
    multiplayer: "Multijoueur",
    app_logo2: "Bac",
    app_logo: "Petit",
    pro_required: "🔒 PRO requis",
    mort_subite: "Mort Subite",
    mode_2v2: "Mode 2v2",
    solo_vs_ia: "Solo vs IA",
    waiting_players_desc: "En attente de joueurs disponibles…",
    cancel2: "✕ Annuler",
    close2: "Fermer",
    waiting_players_short: "En attente de joueurs…",
    filled_all: "✅ J'ai tout rempli — Valider !",
    continue_btn: "Continuer",
    cancel: "Annuler",
    activate: "Activer",
    stay_free: "Rester gratuit",
    free_tier_status: "◇ Gratuit — Version de base",
    ob5_placeholder: "Ton prénom ou pseudo",
    tier_free_desc: "◇ 6 catégories · Solo vs IA · Multijoueur",
    tier_pro_desc: "◆ Tout le gratuit + 7 catégories bonus + Défi du jour",
    tier_vip_desc: "★ Tout le PRO + Catégories perso + Thèmes exclusifs",
    pro_advanced: "◆ PRO — Catégories avancées",
    vip_all_features: "★ VIP — Toutes les fonctionnalités",
    create_room_private: "Créer le salon 🔒",
    your_firstname: "Ton prénom",
    game_in_progress: "Partie déjà en cours",
    cat_custom: "Catégorie perso…",
    daily_exclusive: "4 catégories exclusives · Bot imbattable",
    solo_desc2: "Affronte 2 bots sur plusieurs rounds",
    mode_2v2_desc2: "Forme une équipe et cumule les points ensemble",
    tournament_title2: "Joue avec la lettre du tournoi !",
    online_desc2: "Joue contre des joueurs du monde entier",
    game_modes2: "Modes de jeu",
    points_rule2: "Règle des points",
    mort_desc2: "Une erreur = éliminé. Le dernier en vie gagne !",
    pts_invalid2: "invalide ou vide",
    tournament_label2: "🔥 Tournoi de la semaine",
    difficulty: "Difficulté",
    your_name: "Ton nom",
    vip_cats: "★ VIP — Catégories perso",
    room_code: "Code du salon",
    online_subtitle: "Crée ou rejoins un salon avec tes amis",
    create_room: "Créer un salon",
    waiting_players_min: "En attente d'au moins 2 joueurs…",
    waiting_players: "En attente de joueurs disponibles…",
    waiting_host: "En attente de l'hôte…",
    firebase_demo: "⚠️ Mode démonstration",
    firebase_demo_desc: "Firebase non configuré. Le multijoueur fonctionne en mode local.",
    host: "Hôte",
    play_online: "Jouer en ligne",
    share_code: "Partage ce code avec tes amis",
    searching_players: "Recherche de joueurs",
    join_with_code: "Rejoindre avec un code",
    private_room: "Salon privé",
    your_profile: "Ton profil",
    code_prompt: "Tu as un code de salon ? Entre-le ici",
    code_generated: "Un code unique sera généré — partage-le avec tes amis.",
    round_history: "Historique des rounds",
    trophies2: "🎖️ Trophées de la partie",
    congrats2: "Bravo, tu as gagné !",
    fav_cats2: "Catégories préférées",
    no_cats_yet: "Tes catégories préférées apparaîtront ici.",
    no_words_yet2: "Joue ta première partie pour voir tes mots !",
    legal_title: "📋 Le Petit Bac — Mentions légales",
    all_rights: "Tous droits réservés.",
    personal_data: "Données personnelles :",
    data_policy: "Seul ton pseudo et tes scores sont sauvegardés. Aucune donnée personnelle vendue à des tiers.",
    contact_label: "Contact :",
    category_col: "Catégorie",
    cumul_score: "Score cumulé",
    preferences: "Préférences",
    pro_themes_desc: "Violet, Océan, Forêt, Coucher de soleil",
    pro_themes_label: "★ PRO — Thèmes exclusifs",
    themes_title: "🎨 Thèmes",
    settings_title2: "⚙️ Paramètres",
    in_game_name: "Ton nom en jeu",
    used_matchmaking: "Utilisé pour le matchmaking",
    bug_category: "Catégorie du bug",
    bug_cat_other: "❓ Autre",
    badges_section: "Badges",
    bug_send: "Envoyer le rapport",
    bug_thanks: "Merci pour ton rapport !",
    bug_title: "🐛 Signaler un bug",
    rate_thanks: "Merci pour ta note !",
    rate_help: "Ta note nous aide à grandir !",
    rate_opinion: "Ton avis compte",
    rate_question: "Tu aimes Le Petit Bac ?",
    rate_validate: "Valider ma note",
    rate_title: "⭐ Noter le jeu",
    share_invite: "Invite tes amis",
    app_name_full: "Le Petit Bac",
    tier_unlock: "Débloque plus de catégories et de rounds",
    your_rank: "Ton rang",
    award_unique_desc: "réponses uniques",
    award_avglen_desc: "lettres en moyenne",
    award_filled_desc: "cases remplies",
    award_shared_desc: "fois le même mot",
    award_avg_desc: "pts moy par round",
    award_round_desc: "pts en un round",
    award_regular_desc: "Score le plus constant",
    matchmaking_country: "Rejoins des joueurs de",
    matchmaking_random: "aléatoirement",
    players_found: "Joueurs trouvés",
    waiting_min2: "En attente d'au moins 2 joueurs",
    round: "Round",
    time_left: "Temps",
    your_answer: "Ta réponse",
    validate: "Valider",
    history: "Historique",
    rank: "Rang",
    pts: "pts",
    you: "(toi)",
    bot: "Bot",
    letter: "Lettre",
    score: "Score",
    rounds: "rounds",
    leaderboard_my_rank: "Ta position : #{rank} • {xp} XP",
    leaderboard_my_rank_tournoi: "Ta position tournoi : #{rank}",
    tab_mondial: "🌍 Mondial",
    tab_tournoi: "🏆 Tournoi",
    no_tournoi_players: "Sois le premier à jouer ce tournoi !",
    no_global_players: "Aucun joueur encore",
    // Friends
    friends_title: "Amis",
    friends_count: "ami(s)",
    friends_tab: "Amis",
    add_tab: "Ajouter",
    requests_tab: "Demandes",
    no_friends: "Aucun ami pour l'instant",
    no_friends_hint: "Ajoute des amis via leur code unique !",
    my_code: "Mon code ami",
    copy: "Copier",
    copied: "Copié !",
    add_by_code: "Ajouter par code",
    enter_code: "Ex: PBXYZ123",
    scan_qr: "Scanner QR",
    add_friend_btn: "Envoyer la demande",
    add_self_error: "C'est ton propre code !",
    add_already_error: "Déjà ami avec cette personne !",
    add_not_found: "Code introuvable. Vérifie et réessaie.",
    add_sent: "Demande envoyée !",
    no_requests: "Pas de demandes en attente",
    wants_to_add: "veut vous ajouter",
    friends_btn: "👥 Amis",
    qr_not_supported: "Scan QR non supporté. Entre le code manuellement.",
    camera_denied: "Accès caméra refusé.",
    remove_friend: "Retirer",
    friend_added: "Ami ajouté !",
    friend_removed: "Ami retiré",
    offline_friends: "Mode hors-ligne : amis indisponibles",
  },
  en: {
    appName: "Le Petit Bac",
    nav_home: "Home",
    nav_play: "Play",
    nav_online: "Online",
    nav_rank: "Rankings",
    greeting: "Hello",
    ready: "Ready to play?",
    games_played: "game(s) played",
    victories: "win(s)",
    game_modes: "Game Modes",
    solo_title: "Solo vs AI",
    solo_desc: "Face 2 bots over multiple rounds",
    online_title: "Multiplayer",
    online_desc: "Play against players worldwide",
    mode_2v2_title: "2v2 Mode",
    mode_2v2_desc: "Team up and combine your scores",
    mort_title: "Sudden Death",
    mort_desc: "One mistake = eliminated. Last one standing wins!",
    points_rule: "Scoring Rules",
    pts_unique: "unique answer",
    pts_shared: "shared",
    pts_invalid: "invalid or blank",
    daily_label: "Daily Challenge",
    daily_done: "✓ Daily challenge done",
    daily_back: "Come back tomorrow!",
    daily_desc: "4 exclusive categories · Elite bot",
    daily_locked: "PRO required",
    tournament_label: "Weekly Tournament",
    tournament_title: "Play with the tournament letter!",
    tournament_ends: "Ends in",
    tournament_days: "day(s)",
    choose_difficulty: "Difficulty",
    choose_rounds: "Number of rounds",
    choose_categories: "Categories",
    start_game: "Start game",
    stop_btn: "STOP!",
    congrats: "Congratulations, you won!",
    good_game: "Good game!",
    podium: "Podium",
    trophies: "Game trophies",
    play_again: "Play again",
    go_home: "Home",
    profile_title: "Profile",
    stats_games: "Games",
    stats_wins: "Wins",
    stats_winrate: "Win rate",
    stats_best: "Best",
    stats_total: "Total pts",
    stats_avg: "Avg/game",
    fav_words: "Your favorite words",
    fav_cats: "Favorite categories",
    no_words_yet: "Play your first game to see your words!",
    settings_title: "Settings",
    settings_theme: "🎨 Theme",
    settings_sound: "🔊 Sounds",
    settings_sound_desc: "Game sound effects",
    settings_haptic: "📳 Vibrations",
    settings_haptic_desc: "Haptic feedback on actions",
    settings_country: "🌍 Country",
    settings_country_desc: "Used for matchmaking",
    settings_pseudo: "📛 Username",
    settings_pseudo_desc: "Your in-game name",
    settings_lang: "🌐 Language",
    settings_sub: "Subscription",
    upgrade_pro: "Upgrade to PRO →",
    manage_sub: "Manage subscription",
    share_game: "🔗 Share the game",
    rate_app: "⭐ Rate the app",
    report_bug: "🐛 Report a bug",
    edit_photo: "📷 Change profile photo",
    community: "Community",
    legal: "Legal information",
    close: "Close",
    free_label: "◇ Free",
    pro_label: "◆ PRO",
    vip_label: "★ VIP",
    easy: "Easy",
    medium: "Normal",
    hard: "Hard",
    award_fastest: "The fastest",
    award_creative: "Most creative",
    award_brave: "Most daring",
    award_stubborn: "The stubborn one",
    award_scholar: "The scholar",
    award_lucky: "The lucky one",
    award_regular: "The consistent one",
    ob1_title: "Welcome to Le Petit Bac!",
    ob1_desc: "The word game that brings friends together. Find a word per category starting with the drawn letter.",
    ob2_title: "The letter roulette",
    ob2_desc: "At the start of each round, a roulette spins. Your turn? Hit STOP! to pick the letter.",
    ob3_title: "Fill in the blanks",
    ob3_desc: "Write a word per category starting with the letter. Be quick — the timer is ticking!",
    ob4_title: "The scoring system",
    ob4_desc: "2 pts if unique · 1 pt if shared · 0 if invalid. Words must genuinely belong to the category!",
    ob5_title: "What's your name?",
    ob5_desc: "Choose your username to play.",
    ob_next: "Next →",
    ob_start: "Let's go!",
    ob_back: "← Back",
    ob_placeholder: "Your name or username",
    loading: "Loading...",
    searching: "Finding opponents...",
    xp: "XP",
    xp_gained: "XP earned",
    level: "Lv.",
    badge_unlocked: "BADGE UNLOCKED",
    tournament_rules_short: "Unique answers = +10pts • Wrong = ❌ eliminated",
    tournament_prize: "Winner = 1 month VIP free!",
    inventif_desc: "Player using the longest and rarest words",
    fastest_desc: "Player with most unique answers",
    shuffle_teams: "Shuffle teams",
    choose_teams: "Choose teams",
    cats_per_round: "Categories per round",
    team_red: "🔴 Red Team",
    team_blue: "🔵 Blue Team",
    team_green: "🟢 Green Team",
    assign_teams: "Form teams",
    vote_phase_title: "Vote — Custom category",
    vote_validate: "Valid ✓",
    vote_reject: "Invalid ✗",
    vote_waiting: "Waiting for votes…",
    vote_result_ok: "✅ Validated (majority)",
    vote_result_tie: "⚖️ Tie — 1 pt",
    vote_result_no: "❌ Rejected",
    vote_submit: "Submit my votes",
    vote_info: "Vote to validate answers for host's custom categories",
    unlock_pro: "Unlock PRO",
    en_ligne: "Online",
    vs_bots: "vs Bots",
    team_wins: "Team wins!",
    last_survivor: "Last survivor!",
    enemy_team: "Opponents",
    your_team: "Your team",
    eliminated: "eliminated",
    room_not_found: "Room not found. Check the code.",
    firebase_connected: "Firebase connected — multiplayer active",
    stripe_test_mode: "Demo mode: subscription activated for the presentation!",
    tier_vip_f4: "Exclusive badge ★",
    tier_vip_f3: "VIP tournaments",
    tier_vip_f2: "12 exclusive themes",
    tier_vip_f1: "All PRO +",
    tier_pro_f4: "Daily challenge",
    tier_pro_f3: "Unlimited multiplayer",
    tier_pro_f2: "10 themes",
    tier_pro_f1: "30 categories",
    tier_free_f3: "Solo vs AI",
    tier_free_f2: "2 themes",
    tier_free_f1: "6 categories",
    stripe_secure: "Secure payment by Stripe • Cancel anytime",
    per_month: "/month",
    subscribe_btn: "Subscribe",
    privacy_title: "Privacy Policy",
    cgu_title: "Terms of Service",
    no_players: "Be the first to play!",
    leaderboard_title: "World Rankings",
    letter_chosen: "Letter: {0} 🚀",
    spinner_rolling: "{0} is spinning…",
    stop_btn2: "STOP!",
    go_btn: "Let's go! 🚀",
    its_your_turn: "🎲 Your turn to spin!",
    join_btn: "Join",
    salon_label: "Room",
    players_count: "Players",
    its_you_paren: "(you)",
    daily_letter_desc: "Letter: {0} · 1 round · Hard",
    cancel3: "Cancel",
    subscriptions: "Subscriptions",
    personalisation: "Customization",
    save_btn: "Save",
    choose_color: "Background color",
    choose_emoji: "Choose an emoji",
    photo_title: "📷 Profile photo",
    app_name_fr: "Le Petit Bac",
    share_title: "🔗 Share",
    on_it: "We'll look into it shortly.",
    description: "Description",
    bug_desc_placeholder: "Describe the problem here…",
    support: "Support",
    tournament_letter: "Tournament letter:",
    solo_vs_ia2: "Solo vs AI",
    back_btn: "← Back",
    your_name2: "Your name",
    your_profile2: "Your profile",
    subscription: "Subscription",
    pseudo_sub: "Your in-game name",
    pseudo_label: "📛 Username",
    country_label: "🌍 Country",
    sounds_sub: "Game sound effects",
    sounds_label: "🔊 Sounds",
    vibrations_sub: "Haptic feedback on actions",
    vibrations: "📳 Vibrations",
    lang_selector_sub: "Interface language",
    lang_selector: "🌐 Language",
    legal_contact_email: "support@petitbac.app",
    legal_contact: "Contact:",
    legal_react: "React (MIT) · Firebase (Apache 2.0)",
    legal_licenses: "Open source licenses:",
    legal_version: "Version 1.0.0 · © 2024 Petit Bac Studios",
    go_home2: "🏠 Home",
    play_again2: "🔄 Play again",
    its_you: "That's you!",
    this_round: "This round",
    letter_label: "Letter:",
    round_label: "Round",
    launch_btn: "🚀 Start",
    rounds_label: "Rounds",
    game_settings: "Game settings",
    difficulty_label: "Difficulty",
    categories_label: "Categories",
    search_ellipsis: "Searching…",
    public_game: "Public game",
    multiplayer: "Multiplayer",
    app_logo2: "Bac",
    app_logo: "Little",
    pro_required: "🔒 PRO required",
    mort_subite: "Sudden Death",
    mode_2v2: "2v2 Mode",
    solo_vs_ia: "Solo vs AI",
    waiting_players_desc: "Waiting for available players…",
    cancel2: "✕ Cancel",
    close2: "Close",
    waiting_players_short: "Waiting for players…",
    filled_all: "✅ All filled — Submit!",
    continue_btn: "Continue",
    cancel: "Cancel",
    activate: "Activate",
    stay_free: "Stay free",
    free_tier_status: "◇ Free — Basic version",
    ob5_placeholder: "Your name or username",
    tier_free_desc: "◇ 6 categories · Solo vs AI · Multiplayer",
    tier_pro_desc: "◆ Everything in Free + 7 bonus categories + Daily challenge",
    tier_vip_desc: "★ Everything in PRO + Custom categories + Exclusive themes",
    pro_advanced: "◆ PRO — Advanced categories",
    vip_all_features: "★ VIP — All features",
    create_room_private: "Create private room 🔒",
    your_firstname: "Your first name",
    game_in_progress: "Game already in progress",
    cat_custom: "Custom category…",
    daily_exclusive: "4 exclusive categories · Elite bot",
    solo_desc2: "Face 2 bots over multiple rounds",
    mode_2v2_desc2: "Team up and combine your scores",
    tournament_title2: "Play with the tournament letter!",
    online_desc2: "Play against players worldwide",
    game_modes2: "Game modes",
    points_rule2: "Scoring rules",
    mort_desc2: "One mistake = eliminated. Last one standing wins!",
    pts_invalid2: "invalid or blank",
    tournament_label2: "🔥 Weekly tournament",
    difficulty: "Difficulty",
    your_name: "Your name",
    vip_cats: "★ VIP — Custom categories",
    room_code: "Room code",
    online_subtitle: "Create or join a room with your friends",
    create_room: "Create a room",
    waiting_players_min: "Waiting for at least 2 players…",
    waiting_players: "Waiting for available players…",
    waiting_host: "Waiting for the host…",
    firebase_demo: "⚠️ Demo mode",
    firebase_demo_desc: "Firebase not configured. Multiplayer runs in local mode.",
    host: "Host",
    play_online: "Play online",
    share_code: "Share this code with your friends",
    searching_players: "Finding players",
    join_with_code: "Join with a code",
    private_room: "Private room",
    your_profile: "Your profile",
    code_prompt: "Have a room code? Enter it here",
    code_generated: "A unique code will be generated — share it with your friends.",
    round_history: "Round history",
    trophies2: "🎖️ Game trophies",
    congrats2: "Congratulations, you won!",
    fav_cats2: "Favorite categories",
    no_cats_yet: "Your favorite categories will appear here.",
    no_words_yet2: "Play your first game to see your words!",
    legal_title: "📋 Le Petit Bac — Legal",
    all_rights: "All rights reserved.",
    personal_data: "Personal data:",
    data_policy: "Only your username and scores are saved. No personal data sold to third parties.",
    contact_label: "Contact:",
    category_col: "Category",
    cumul_score: "Total score",
    preferences: "Preferences",
    pro_themes_desc: "Purple, Ocean, Forest, Sunset",
    pro_themes_label: "★ PRO — Exclusive themes",
    themes_title: "🎨 Themes",
    settings_title2: "⚙️ Settings",
    in_game_name: "Your in-game name",
    used_matchmaking: "Used for matchmaking",
    bug_category: "Bug category",
    bug_cat_other: "❓ Other",
    badges_section: "Badges",
    bug_send: "Send report",
    bug_thanks: "Thanks for your report!",
    bug_title: "🐛 Report a bug",
    rate_thanks: "Thanks for your rating!",
    rate_help: "Your rating helps us grow!",
    rate_opinion: "Your opinion counts",
    rate_question: "Do you like Le Petit Bac?",
    rate_validate: "Submit rating",
    rate_title: "⭐ Rate the game",
    share_invite: "Invite your friends",
    app_name_full: "Le Petit Bac",
    tier_unlock: "Unlock more categories and rounds",
    your_rank: "Your rank",
    award_unique_desc: "unique answers",
    award_avglen_desc: "avg letters",
    award_filled_desc: "blanks filled",
    award_shared_desc: "same word as others",
    award_avg_desc: "avg pts per round",
    award_round_desc: "pts in one round",
    award_regular_desc: "Most consistent score",
    matchmaking_country: "Join players from",
    matchmaking_random: "randomly",
    players_found: "Players found",
    waiting_min2: "Waiting for at least 2 players",
    round: "Round",
    time_left: "Time",
    your_answer: "Your answer",
    validate: "Submit",
    history: "History",
    rank: "Rank",
    pts: "pts",
    you: "(you)",
    bot: "Bot",
    letter: "Letter",
    score: "Score",
    rounds: "rounds",
    leaderboard_my_rank: "Your rank: #{rank} • {xp} XP",
    leaderboard_my_rank_tournoi: "Your tournament rank: #{rank}",
    tab_mondial: "🌍 Global",
    tab_tournoi: "🏆 Tournament",
    no_tournoi_players: "Be the first to play this tournament!",
    no_global_players: "No players yet",
    // Friends
    friends_title: "Friends",
    friends_count: "friend(s)",
    friends_tab: "Friends",
    add_tab: "Add",
    requests_tab: "Requests",
    no_friends: "No friends yet",
    no_friends_hint: "Add friends using their unique code!",
    my_code: "My friend code",
    copy: "Copy",
    copied: "Copied!",
    add_by_code: "Add by code",
    enter_code: "e.g. PBXYZ123",
    scan_qr: "Scan QR",
    add_friend_btn: "Send request",
    add_self_error: "That's your own code!",
    add_already_error: "Already friends with this person!",
    add_not_found: "Code not found. Check and try again.",
    add_sent: "Request sent!",
    no_requests: "No pending requests",
    wants_to_add: "wants to add you",
    friends_btn: "👥 Friends",
    qr_not_supported: "QR scan not supported. Enter the code manually.",
    camera_denied: "Camera access denied.",
    remove_friend: "Remove",
    friend_added: "Friend added!",
    friend_removed: "Friend removed",
    offline_friends: "Offline mode: friends unavailable",
  },
};

// Hook global pour accéder aux traductions
function useT(lang) {
  return useMemo(() => (key, fallback) => {
    const t = TRANSLATIONS[lang] || TRANSLATIONS.fr;
    return t[key] || fallback || key;
  }, [lang]);
}

// ─── XP & NIVEAUX ────────────────────────────────────────────────
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

// ─── NORMALISATION (accents, casse, tirets) ────────────────────────
function normalizeWord(w) {
  return (w || "")
    .toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // accents
    .replace(/[-''\u2019\s]+/g, " ")                  // tirets/apostrophes → espace
    .trim();
}

// Collapse consecutive duplicate letters: "balle" -> "bale", "football" -> "fotbal"
function collapseDoubles(s) {
  return s.replace(/(.)\1+/g, "$1");
}

// ─── DICTIONNAIRE DE MOTS VALIDES (enrichi) ────────────────────────
const VALID_WORDS = {
  prenom:{
    A:["alice","alexis","adrien","amelie","anais","axel","alexandre","aurore","arnaud","aurelie","adele","armand","alicia","agathe","albert","alain","angele","antoine","ambre","ariane","alphonse","alma","alban","amandine","amina","anaelle","anatole","andrea","andy","angie","anissa","anna","anne","antoinette","apolline","ariel","arlette","armelle","arthur","ashley","astrid","aude","augustin","aurelia","aurora","ava","axelle","ayoub","aziz","achille"],
    B:["baptiste","beatrice","benjamin","brigitte","bertrand","bastien","barbara","benoit","brice","blanche","baudouin","benedite","bernadette","boris","brandon","bryan","berenice","blandine","beatrix","bilal","blake","bonnie","brenda","brennan","brett","brian","brianna","brunella","brunette","brunhilde","bruno","bryce","brynn","belinda","bela","beatriz","bastian","bastiano","bart","barnabe","balthazar","bahia","babette","bader","babila","babou","badis","baila","baina","baira","bako","baldomero","baldo","baldric","balthasar","bandia","baraka","barb","barbe","barbel","barri","barry","bartholomee","bartolomeo","bartolomeu","bartolommeo","basile","basilia","basilide","basilieu","basilio","basilisse","bassin","bastienne","batoul","baudoin","bayane","bayar","bayou","beathas","bedros","belkis","bella","belle","bellona","beltran","belu","benadette","bendicte","benedek","benedikte","benedikta","benilde","benita","benito","benne","bennie","benny","bente","benvinda","bergit","bernarda","bernardete","bernardino","bernardo","bernhard","bernice","bertha","bertille","beryl","beti","betina","beverly","bianca","bibia","bibiane","biguine","bilde","bilge","binta","bintou","birgit","birgitt","birgitte","bjarne","bjorn","blaise","baba","babatunde","benedicte","bo","bob","bogdan","bonita"],
    C:["camille","clement","clara","celine","charline","charlotte","christophe","coralie","cedric","clotilde","caroline","cecile","claude","colette","corinne","cyprien","carl","carla","carmen","cassandra","celestin","chloe","christian","christelle","clarisse","claudia","clemence","clothilde","cynthia","callum","calixte","caleb","caitlin","caia","caden","camelia","camil","camila","camilo","candice","candida","candide","capucine","cara","caren","carey","caridad","carina","carles","carlita","carlo","carlos","carlotta","carmel","carmela","carmelo","carol","carole","carolina","carolus","caron","casimir","cassandre","castor","catharina","catherine","catia","cato","cecilia","celestine","celie","cesar","chanda","chandra","chanel","chantal","chantale","chantalle","chante","chantel","chantell","chantelle","charlene","charlie","charly","charme","charna","charo","chaton","chayenne","chedli","cheikna","cheima","cherif","cheryl","chido","chimene","china","chioma","chloee","cho","chretien","christa","christel","christiana","christiane","christiano","christin","christina","christine","christoph","christos","ciel","cindy","circe","ciro","cladia","claie","claire","clairette","clare","clares","clarice","clarinda","clarisa","clarissa","clarita","claudel","claudette","claudiane","claudie","claudine","claudio","claudius","clea","clelia","clementine","cleophee","cleophas","cleotilde","clio","clover","cloya","coco","colby","collette","conchita","conor","consuela","consuelo","coral","coraline","corazon","cordelia","corentin","corin","corina","corinna","cornelia","cornelie","cornelio","cornelius","corrado","cosima","cosme","cosmo","costas","courtney","cristel","cristela","cristian","cristiana","cristiano","cristine","chrystel","cian","ciara"],
    D:["david","diane","dylan","delphine","damien","dorian","denis","dorothee","deborah","didier","dominique","daniel","danielle","daphne","dimitri","dolores","doriane","dalia","damaris","damiano","dana","danae","danica","danika","daniil","danila","danilo","danique","danita","danko","dannie","danny","dante","dara","darcy","daria","dariane","darien","darija","dariusz","darius","darko","darla","darlene","darren","darryl","darwin","dashiell","davia","davian","davide","davina","davit","dawn","daya","dayden","daylan","deandre","debby","debie","debora","deirdre","delia","delila","delilah","delina","delio","della","demelza","demetria","demetrios","dena","denholm","denia","denice","denim","denisa","denise","deniz","denny","denzil","desmond","devika","devina","devon","devorah","dex","dexter","dez","diallo","diamant","dian","diana","dianne","diara","diarra","dilnoza","dilorom","dima","dimitar","dimitra","dimitria","dimitriou","dimitrios","dimitriva","dina","dinah","dione","diora","diouma","dioussou","djemila","djenaba","djibril","djibriou","djimpa","djina","djinn","djoser","dolce","dolly","domenica","dominga","domingos","domingo","domitilla","domitille","donna","donnie","donovan","dora","doralice","doralia","doralie","doran","dorce","dorcia","dore","doreen","dorena","dorene","doria","dacia","dalila","damiaan","damla","danka"],
    E:["emma","emile","elisa","elodie","ethan","evan","elena","elise","edouard","eden","eleonore","estelle","eugenie","edgar","edith","elizabeth","elliot","elsa","elvire","emeline","emily","emmanuelle","enola","eric","erin","ernest","etienne","eva","evelyne","eamon","ebba","ebony","edia","edina","edna","edvard","edward","edwarda","edwige","efram","egon","eileen","eiren","elahe","elaia","elaine","elan","elana","elanor","elberta","eldora","eleanor","electra","eleni","elenoa","elga","eli","elia","elian","eliana","eliane","elianna","elias","elida","elie","elif","elijah","elimane","eline","elio","elion","elisha","elisia","eliss","elissa","elke","ella","ellina","ellinor","eloisa","eloise","elona","elonora","elora","elsie","elspeth","elvina","elwira","elysia","elyssa","elza","emelda","emeric","emida","emilia","emiliana","emiliano","emilio","emilou","emina","emir","emira","emlyn","emmalie","emmett","enny","enora","epiphane","erasme","erina","erinn","erwan","erwann","erwanna","esmeralda","esperanza","esra","essa","esther","estrella","eudes","eufemia","eugenia","eugenio","eunice","eulalie","euphemia","euphrasie","euphrosine","eurydice","evangelina","evandro","eveline","evelyn","evita","evora","evota"],
    F:["felix","florence","francois","fabrice","fanny","flavie","frederic","frederique","florian","faustine","fabien","fabiola","fantine","fatima","fatou","flora","flore","florent","florentin","fadi","fadia","fadila","fahed","fahima","faida","fairouz","faisa","faiza","faizan","fanta","fantin","fara","farah","farida","farina","faruk","fatiha","fatin","fatoumatou","fay","faye","fayrouz","felice","felicia","feliciana","feliciano","felicien","felicitas","felicity","felipa","feriel","fermina","fernanda","fernande","feroza","ferran","fidele","fifi","filippa","filippo","filomene","finbar","fionn","fionna","fiorella","firdaous","fisal","flaviano","fleur","florea","florentina","florentino","florenzo","floriana","florie","florinda","florinel","floris","florisa","fabienne","fabio","fabian","fabiana","fahad","faial","faik","faikah","faisal","fallon","falou","fanso","fantou","faraj","faranko","fares","fari","faris","fathia","fatimata","fatimatou","fausto","fauve","faven","faycel","faynne","ferhat","feria","fernand","fernando","ferraz","fex","fez","fiammetta","fieneke","fikri","filipa","filipp","findus","fintan","fiona","firmin","firmino","flavia","flaviana","flavio"],
    G:["gabriel","gaelle","gregoire","guilhem","guillaume","garance","gilles","genevieve","gladys","ghislain","gabin","gabriella","gabrielle","gaetan","gaspard","gaultier","gautier","geraldine","gerard","gertrude","ghislaine","gianni","ginevra","giulia","gonzague","grace","gwenaelle","gwendoline","gaby","gad","gada","gadiel","gaea","gaele","gaetane","gaia","gal","gala","galatea","galene","galia","galila","galina","gallien","galya","gamila","gareth","garnet","gauthier","gavril","gavrila","gavroche","gavriel","gaya","gel","gelila","gemma","gena","genard","genevieva","gennadiy","geronimo","gershom","gertruda","gina","gino","giordano","giorgi","giorgia","giovanna","giovanni","girard","giselda","gisele","gisella","giuliano","giulianna","giulietta","giuseppina","gladdie","gladio","glafira","gloriana","gloria","glorinda","glynnis","gordana","gorge","graciela","gracie","grazyna","grazia","graziano","greta","grete","gretel","gretl","grimard","griselda","grover","guadalupe","guanglin","gueorgui","guida","guiomar","gustave","guy","guyonne","gwenael","gwenola"],
    H:["hugo","helene","henri","hubert","hadrien","hippolyte","honore","hamza","hana","hanna","hannah","harmony","harriet","haydee","heloise","herve","hillary","hortense","huguette","habiba","habibo","habila","hachim","haciane","hadia","hadley","hafsa","hafsah","hagar","haidar","haidee","haifa","hailee","hailey","hailie","haleigh","haley","halim","halima","hali","hallie","hania","hanifa","hanin","hanno","hansine","harlan","harleen","harleigh","harlen","harley","harlow","harolde","harry","hartmann","harvey","hasan","hasna","hayley","hazel","heather","heba","hedvig","heidi","heinz","helaine","helam","helga","helvi","hemanth","henni","henning","henrika","henriette","henry","hermine","hernan","hetty","hilarion","hildegard","hillevi","hilmy","hoang","hoel","honoria","horatio","horatia","horace","hussein","hyacinthe","hyacintha","hypatia"],
    I:["ines","ivan","iris","isabelle","ilona","isidore","irene","ibrahima","ida","ilham","imane","imanol","inaya","indira","ingrid","irina","isadora","iain","iago","iana","ianca","iasmine","ibis","ibrahim","ibtissam","idali","idalia","idalie","idaly","idal","idana","idane","idara","idelle","idina","idoia","idris","iduna","ifigenia","igor","ihab","ikaika","iker","ikram","ilario","ilayda","ilda","ildiko","ileana","ilenia","ilias","ilinca","ilkka","illario","ilse","ilya","ilyane","ilyano","ilyasse","ilyona","imani","imara","imene","imerio","imke","imma","in","inca","indo","indra","ingeborg","ingo","ingold","ingra","ingram","ingvar","inigo","inke","ino","ioanis","iolanda","ione","iorwen","ira","iram","irane","irena","irisa","irka","irma","irmgard","isa","isaak","isaia","isako","isbel","isco","isha","iskra","isma","ismael","ismaela","isobel","isoka","isolde","isom","isra","issa","issam","itzel","ivana","ivania","ivanoe","ivanka","ivar","ivara","ivette","ivona","ivonne","iwanka"],
    J:["julien","justine","jean","julie","joachim","josephine","jacqueline","jordan","jessie","jimmy","jade","jake","james","jamil","jana","janine","jasmine","jason","jeanne","jenny","jeremy","jessica","joel","johanna","jonathan","jose","julia","juliette","jabari","jace","jacinda","jacinte","jacklyn","jacobus","jacopo","jada","jaden","jael","jaelle","jaimie","jairo","jaka","jamal","jameel","jamelia","jamelle","jameson","jami","jamia","jamila","jamine","janae","janique","janita","janis","janne","jannik","janny","jano","jansen","jaqui","jara","jared","jarlath","jaro","jarrid","jascha","jasha","jasmin","jasmina","jasna","jasper","javier","jayda","jayden","jaylan","jaylen","jaylin","jazmin","jazmyn","jean claude","jean luc","jean marc","jean paul","jean pierre","jeana","jeanette","jeanine","jeannie","jeannine","jeffery","jelena","jelisa","jelissa","jenessa","jenifer","jenilee","jenina","jenine","jenna","jennica","jennie","jennifer","jens","jenson","jeri","jerome","jerrie","jessamine","jessenia","jessiah","jesus","jillian","jim","jimena","joana","joanie","joanna","joanne","joaquim","joaquin","jocelyn","jodie","jody","joe","joelie","joelle","joerg","joeri","joetta","joey","johane","john","johnathan","johnnie","jonah","jonas","jonatan","jonatha","josefa","josefina","josefine","joseph","josepha","josephe","josie","josip","josue","jovana","joyce","juana","juanita","judita","juditha","jules","juliana","juliann","juliane","julio","julis","jurg","jurgen"],
    K:["kilian","karine","kevin","kim","kelly","killian","karim","karima","karl","katia","kendra","khalid","kyle","kacey","kaci","kacie","kade","kadeem","kadija","kaela","kaeli","kaelin","kaelyn","kahlil","kai","kaia","kailee","kailua","kaimi","kainat","kairi","kairo","kaisa","kaitlin","kaitlyn","kaja","kajetan","kajsa","kala","kalani","kalei","kalia","kalida","kalil","kalima","kalina","kalis","kalisha","kalla","kallie","kamara","kamden","kameko","kami","kamil","kamila","kamile","kamilia","kamilka","kamillo","kamran","kandice","kara","kareen","karelle","karen","kari","karin","karina","karisa","karissa","karla","karlos","karo","karolin","karolina","karoline","karoly","karsten","kasim","kasimir","kaspar","kassandra","kassia","kata","katarina","kate","katerina","katerine","katharina","katharine","katheleen","katherin","kathia","katinka","katja","katlin","katlyn","katrijn","katrina","katrine","katya","katy","kawan","kaya","kayden","kayla","kaylan","kaylee","kayleigh","kaylie","kaylin","kaylyn","kazimir","keiko","keilan","keiran","keith","kela","keli","kelin","kellan","kellen","kelley","kelli","kellie","kelsie","kelvin","kemal","kenji","kenna","kennedy","kennie","kenny","keo","keon","keren","kezia","khalida","khalil","kiana","kiara","kiko","kiley","kimi","kindra","kira","kirra","kirsten","kirsty","knud"],
    L:["lucas","lucie","lea","louise","lola","leon","laurie","laurent","laure","ludovic","lydia","laetitia","lana","lancelot","lara","larissa","lassana","laureline","leandro","lena","leo","leonce","leopold","lila","lilou","lina","lisa","lise","lisette","livia","loic","lorena","lorie","lorraine","lou","louisa","luca","lucette","lucian","lucile","luna","ladislava","ladislave","laela","laila","laina","laini","lais","lakshmi","lala"],
    M:["marie","maxime","mathieu","margot","marine","mathilde","manon","marc","melanie","melissa","michel","muriel","maeva","magali","malo","manoel","manuel","marceau","marco","margaux","mariana","marilyn","mario","marjorie","marlene","martial","martin","martine","maud","maxence","maximilien","maya","melodie","mia","mickael","mika","mikael","mila","milena","mireille","miriam","mona","morgane","moussa","mabel","mabeline","mabella","mabelle","mac","macaela"],
    N:["noa","noe","noel","noemie","nicolas","nathan","nathalie","nina","nadege","nadine","nadia","naomi","nassim","nassima","natalia","natasha","nayla","noah","nolan","nora","norbert","noura","nabiha","nabil","nabila","nabou","nachida","nada","nadal","nadir","nadiege","nadim","nadima","nadjia","nadka","nady","naemi","nagib","nahel","nahid","naida","naika","naila","naima","naira","nairi","nais","naiyah","naja","najat","najib","najiba","najma","nakia","nakita","nalani","nalia","nalida","nalini","namiko","nana","nane","nanee","nani","nanna","naouelle","nara","narayan","narcisa","narciso","narcisse","narda","natali","nathael","nathanael","nathania","naum","nava","naveah","nayara","nazanin","nazarena","nazareno","nazim","nazima","neha","neil","nel","nelda","neli","nelia","nelin","nell","nella","nellie","nelly","nelvin","nena","nenia","nesta","neva","nevada","nevena","neville","nia","niall","niamh","nicabar","niceta","nichola","nichole","nicola","nicolai","nicolaj","nicolaos","nicolasa","nicolo","nika","nikhil","nikita","nikki","niko","nikolaj","nikolaos","nikoletta","nikoline","nikos","nila","nilde","nilda","nilou","nils","ninette","nino","nior","nis","nisa","nives","noach","noela","noelie","noeline","noella","noelle","nohemy","noin","nolita","nona","nonette","noni","nonie","norah","noreen","norma","normann","norris","nour","nouredine","nourin","noury","noushin"],
    O:["oscar","olivier","odile","omar","ophelie","octave","olympe","oriane","ottilie","orlando"],
    P:["pierre","pauline","philippe","paul","patricia","pascal","perrine","priscilla","penelope","pablo","pamela","paola","patricio","patrice","paulette","pedro","peggy","phedre","philippa","philomene","pierrette","priya","prudence","pace","padma","paige","palmira","pam","pamelina","pascale","pascaline","pascalino","pascalito","pastor","patrizia","patrona","paula","paulina","paulino","paulo","pax","paxon","paxton","payal","paz","pegasus","penina","perla","permelia","pero","petra","petronela","petronella","petronille","phaedra","phillipa","phillippe","phillo","philomen","philomena","pia","pier","piera","pierce","piero","pietrina","pietrino","pilar","pippa","placid","placida","placide","placido","poldo","poli","polina","polixena","polly","polyxena","pompea","pompeo","poppy","pora","portia","praxede","praxedis","precious","prima","prisciliana","prisciliano","prosperine","protais"],
    R:["romain","raphael","rachel","remi","renaud","regine","rose","roxane","roland","rachid","raissa","rakia","rama","randa","raoul","raymond","rebecca","regis","reina","remy","rene","richard","rita","robert","roberto","robin","rodrigo","romeo","romuald","rosalie","rosine","roxanne","ruben","ruth","radek","radovan","raed","raelene","raelynn","raffaela","raffaele","rainer","raisa","rajan","rakesh","ralf","ramona","rangi","raquel","rascha","rashid","rasmus","ravi","ray","rayna","raynard","rayne","raynelle","raza","rebekah","reed","reeve","reid","reiko","renata","renate","renato","rende","renilde","renita","renke","rennard","reuben","reva","rex","rhea","rhiannon","rhianon","rhona","rhonda","rian","rico","rider","riley","rinat","rino","rio","ritchie","riva","rivka","rob","robbie","robbin","roberta","robine","robino","robison","robyn","rocco","rochelle","rocky","rod","roderick","rodolfo","rodrigue","roeland","roel","roger","rohan","roisi","roisin","rolando","romaine","romano","romantilde","ron","rona","ronald","ronaldo","roni","ronit","ronie","ronja","ronni","rosa","rosalba","rosalia","rosalind","rosaline","rosalinda","rosalinde","rosalita","rosalva","rosana","rosane","rosanna","rosario","roswitha","rowena","roxana","roxanna","roxi","roxy"],
    S:["sophie","simon","sarah","samuel","sebastien","salome","sandrine","stephane","stephanie","sylvie","sabrina","sacha","safia","salima","sami","samira","sandra","sandro","santiago","sara","sasha","selena","serge","serine","soline","solange","solenn","sonia","souad","stanislas","stella","sylvain","sabela","sabena","sabina","sabine","sabino","sabira","sachiko","sade","sadie","sadiku","sadika","saemundo","safi","safiya","saida","saif","saira","sakari","sakina","sakura","sala","salah","salam","salama","saleem","salem","sallie","salomea","salomee","salomeja","salomona","salone","saloni","samantha","samara","samaria","samaris","samba","sameh","sameera","samela","samella","samia","samiha","samiya","sanaa","sancia","sandie","sane","sanee","sanel","sangria","sannie","santana","santina","santino","santos","sanya","sarafina","saraina","saray","sari","sarika","sarina","sarita","sariya","saskia","satine","saul","saura","savannah","saverio","savina","savino","saviola","savitri","sawsan","seah","seana","sebastiana","sebastiano","selene","selima","selina","selinda","selita","selma","sema","semaj","sena","senan","sendoa","senna","septimia","seraphina","seraphine","serena","serina","sevim","seydi","seyhan","seyi","shahin","shahira","shahla","shahzad","shalini","shamara","shana","shanelle","shanie","shaniqua","shaniya","shanna","shannah","shannen","shannon","shantalle","shantanu","shantelle","shantel","sharia","sharifa","sharline","sharmaine","sharon","shawnda","shaylee","sheila","shelby","shell","shellie","shelly","shenan","sherin","sherri","sherry","sheyla","shirin","shirley","shola","sian","sianna","sibille","sibylle","sigrid","sigrun","sila","silke","silvana","silvano","silvia","silvio","simba","simeon","simona","sirena","sirine","siri","sissi","sky","skylar","sloane","sofi","sofia","sofian","sofiane","sofiya","soledad","sonja","sonny","sora","soraya","sorin","sorina","sorrel","soto","soukeyna","soumia","soumya","swann","sybille","sybil","sylvester","sylvia"],
    T:["thomas","theo","tina","thibault","tanguy","timothee","tristan","typhaine","tania","tatiana","teresa","therese","thierry","tiago","tim","timeo","tobias","tom","tony","tabitha","tacita","taini","taisiya","takahiro","takara","takahe","takaishi","takeshi","takia","takoda","takoua","takumi","talal","talata","talaya","talea","taleka","talem","talia","taliba","talib","talid","talika","talin","talinda","talisa","talitha","taliver","tallulah","tally","talma","tamara","tamari","tameka","tamela","tamera","tami","tamia","tamila","tammy","tamsin","tandra","tane","taneisha","tangie","tanisha","tanja","tanjia","tansy","tanveer","tanya","tanzila","tapias","taria","tariel","tarifa","tarik","tariku","tariq","tarisa","tarita","tarjan","tarkan","taro","tarot","tarquin","tarsisio","taryn","tasha","tasmin","tassinari","tatjana","tatum","tawanda","taya","taylar","taylor","tazia","tea","tegwen","teika","teishin","teja","teko","telma","tem","terencia","teresinha","terhi","terje","tess","tessa","tessie","teta","tewodros","tex","teyana","theano","thelma","theodora","theodore","theophile","theresa","thijs","thilda","thimo","thinley","thomasina","thore","tia","tiaan","tiana","tiasha","tiassa","tibalt","tiby","tiernan","tiffany","tihana","tiina","tilda","tillie","tilly","timm","timmo","timo","tindara","tine","tira","tirania","tirin","tirion","tiris","tirsa","tirza","tite","tito","titus","tiziana","tjerk","toby","toda","toja","tola","tomasa","tomasz","tomoko","tone","tora","tori","torrie","tory","tosia","tosja","toshio","tossy","tovi","trevelyan","tricia","trina","trinity","trisha","trixi","tulia","tullia","tullio","tuulikki","tyrone","tyson"],
    V:["victor","valerie","vincent","virginie","violette","veronique","valentin","vanessa","valentina","valentino","valerio","vanda","vera","veronica","vianney","victoria","victorien","violaine","viviane","vaia","vanille","venisha","vace","vada","vadim","valda","valene","valente","valenti","valentinos","valenza","valere","valeria","valeriane","valeska","valey","vali","valia","valida","valika","valin","valina","valisa","valla","vallie","valma","valois","valona","valor","valora","vandea","vania","vanja","vanna","vanny","vanya","varya","vasil","vasila","vasiliki","vasilis","vassia","vasso","veda","vedat","vedika","veit","vela","velda","veli","velika","venka","verena","verica","verka","verna","verona","vesta","vidal","vigor","viia","vika","vikash","vikta","viktoria","vilja","vilma","vilo","vilva","vince","vincenza","vincenzo","vinicia","vinicio","vinita","viola","violet","violeta","violett","vira","virgil","virginia","virginija","vito","vitoria","viya","vlad","vladimira","vlasta","vlatko"]
  },
  nom:{

    A:["adam","adams","adler","aguilar","ahmed","ali","almeida","alonso","alves","amara","amari","andre","andrei","andres","arnaud","arnault","artaud","aumont","auriol"],
    B:["bachelier","bachmann","bailly","baptiste","barbier","barbosa","bardin","bardot","baron","barry","basile","baumont","baudoin","baudouin"],
    C:["caballero","camus","caron","carpenter","carr","carrere","carter","cartier","casanova","castillo","catala","caumont","chabrol","charpentier","charton"],
    D:["dacosta","dahan","dahmani","daniel","danet","dauphin","daurat","de bruin","de jong","de vries","dupont","durand","dupuis","dubois","dumont","duval","duchamp"],
    E:["elbaz","elias","elie","ellenbogen","elloumi","elmaleh","eloy","escoffier","esteban","esteve","etienne"],
    F:["fabre","faure","faurie","fernandes","fernandez","ferrat","ferreira","ferrer","ferri","ferrier","ferro","ferry","fleury","flores","fontaine"],
    G:["gabriel","garcia","garnier","gauthier","gautier","gehin","germain","girard","giraudeau","girault","girod"],
    H:["haddad","hadjadj","halimi","hamid","hardy","harel","hartmann","haumont","hazard","helard","henaut","henriet","herard","herault"],
    I:["ibrahim","icard","imbert"],
    J:["jaccard","jacquet","jacquot","jaubert","jean","jerome"],
    K:["kahn","kamara","kante","keita","khoury","koné"],
    L:["laborde","lacombe","lacroix","lafon","laforet","lamarque","lamotte","lamy","laroche","larrieu","lasserre","laval","lavigne","le brun","le fur","le gall","lebas","lebeau","leblanc","lebrun","leclair","lecomte","leconte","ledoux","lefebvre","lefort","legrand","lehmann","lemaire","lemaitre","leon","leroux","leroy","lesage"],
    M:["machado","macias","macron","maille","maillard","mallet","mandel","marechal","marquet","marquez","martin","martineau","martinez","marty","mauboussin","mercier","merlin","mermoz","meyer","michaud","michel","morin","moreau","moulin","muller"],
    N:["nadeau","naimi","navarro","negrel","negroni","neveu","nicolas","noel","normand","nouveau"],
    O:["ollivier","olivier","ouedraogo","ouellet","ortega","ozil"],
    P:["pailler","paoli","paradis","parent","paris","parmentier","pascal","pasquier","pasteur","paul","paulin","payet","perez","perret","perrin","perron","petit","petitjean","picard","picasso","pierre","pietri","pinard","pinel"],
    R:["racine","ramos","raoul","raymond","reboul","regnault","renard","renaudin","renault","rene","richard","rigaud","robert","robin","rodrigues","rodriguez","roux"],
    S:["sabatier","salle","salles","salomon","sanchez","simon","simonet","soler"],
    T:["tabet","taillefer","tardif","tessier","testa","thierry","thomas","thomassin","thullier","toure","tournier","traore","tremblay"],
    V:["vaillant","vallet","vallee","vallier","verdier","verdon","vidal","vigier","vigne","vignes","villard","villeneuve","vinot","viollet"],},
  pays:{

    A:["allemagne","algerie","argentine","angola","arabie saoudite","australie","autriche","azerbaidjan","afghanistan","albanie","armenie","andorre","antigua","abkhazie","aceh","afrique du sud","anguilla","antarctique","antigua et barbuda","arabie","abissinie","açores","abyssinie"],
    B:["belgique","bresil","bulgarie","bolivie","botswana","bahrein","bangladesh","benin","birmanie","bielorussie","burkina faso","burundi","bahamas","barbade","belize","bhutan","bosnie","bosnie herzegovine","borneo","brunei","bhoutan"],
    C:["canada","chine","colombie","congo","cameroun","chili","coree","cote d ivoire","croatie","cuba","chypre","cambodge","cap vert","centrafrique","comores","cayman","costa rica","cook","coree du nord","coree du sud"],
    D:["danemark","djibouti","dominique"],
    E:["espagne","egypte","ethiopie","equateur","erythree","estonie","emirats arabes","el salvador","emirats","equatorial"],
    F:["france","finlande","fidji"],
    G:["grece","ghana","guatemala","guinee","georgie","gambie","grenade","gabon","gibraltar","grenadines","groenland","guadeloupe","guam","guinee bissau","guinee equatoriale","guyane","guyana"],
    H:["hongrie","haiti","honduras","hollande"],
    I:["italie","inde","irlande","iran","irak","israel","indonesie","islande"],
    J:["japon","jordanie","jamaique"],
    K:["kenya","kazakhstan","koweit","kirghizistan","kiribati","kosovo"],
    L:["liban","luxembourg","lettonie","libye","lituanie","laos","liberia","lesotho","liechtenstein"],
    M:["maroc","mexique","mali","madagascar","malaisie","mozambique","mauritanie","moldavie","mongolie","malawi","maldives","malte","mauritius","micronesia","monaco","montenegro","myanmar"],
    N:["nigeria","norvege","namibie","nicaragua","niger","nepal","nouvelle zelande","nauru","niue"],
    O:["oman","ouganda","ouzbékistan","ouzbekistan"],
    P:["portugal","pologne","perou","pakistan","palestine","panama","paraguay","philippines","palaos","papouasie","porto rico"],
    R:["russie","roumanie","rwanda","republique tcheque","republique dominicaine","republique centrafricaine"],
    S:["suede","suisse","senegal","syrie","soudan","somalie","slovaquie","slovenie","serbie","sri lanka","salvador","samoa","sao tome","seychelles","sierra leone","singapour","soudan du sud","saint christophe","saint marin"],
    T:["tunisie","thailande","turquie","taiwan","tanzanie","tchad","togo","tonga","trinite","turkmenistan","timor","timor oriental","thaïlande"],
    V:["venezuela","vietnam","vanuatu"],},
  ville:{

    A:["amsterdam","athenes","auckland","abidjan","accra","alger","amman","ankara","abuja","alexandrie","alicante","anvers","abu dhabi","addis abeba","antananarivo","asmara","astana","asuncion","atlanta","avignon","aarhus","aden","agadir","agra","ahmadabad","ahvaz","aix en provence","ajaccio","albi","alès","amiens","angers","angouleme","annecy","antibes","antony","arles","arras","aubagne","aulnay sous bois","aurillac","auxerre","avallon","avranches","asnières sur seine","argenteuil","agen","ales","asnieres sur seine","aubervilliers","arcueil","alfortville","andorra la vella","alençon","abbeville","agde","aix les bains","albert","amberieu en bugey","amboise","andresy","annonay","antheor","apt","arcachon","argentan","armentières","aubusson","auch","autun","anglet","aix en bains","annemasse","almeria","austin","alencon","armentieres","acapulco","aguascalientes","akron","akure","albacete","albuquerque","aleppo","allahabad","almaty","anchorage","ancona","andijan","aomori","apeldoorn","apia","appleton","aqaba","aracaju","arequipa","arkhangelsk","arnhem","arusha","ashgabat","astrakhan","aswan","augsburg","aurangabad","avarua","abomey","abeokuta","adana","adelaide","adrar","agboville","akola","akosombo","abadan","abancay","abéché","abilene","abomey calavi","acra","adélaïde","adjamé","agartala","agrigente","ahmedabad","aix la chapelle","aizawl","ajmer","alagoas","alameda","alep","algésiras","aligarh","alor setar","amadora","amarillo","amberg","ambon","amersfoort","amravati","amritsar","angkor","annaba","antioquia","antwerp","argel","asahikawa","ashkhabad","asnières","assiout","asyut","athi river","atyrau","abha","acarigua","achimota","adamawa","adis","akita","aklavik","aktobe","al ain","al basra","al hufuf","al jubail","al khobar","al madinah","al mawsil","al mukalla","al qahira","alagoinhas","alba iulia","alcala","alcazar","alcobendas","alcorcon","alcudia","aldaia","alegrete","alejandriya"],
    B:["berlin","barcelone","bruxelles","budapest","buenos aires","bagdad","beyrouth","bogota","bordeaux","boston","bangalore","bucarest","bali","baltimore","banjul","beijing","belfast","belo horizonte","birmingham","bratislava","brescia","brno","bruges","bujumbura","béziers","brest","besançon","blois","boulogne billancourt","boulogne sur mer","bourg en bresse","bourges","bayonne","beauvais","belfort","bergerac","béthune","biarritz","bondy","bressuire","besancon","beziers","bagnolet","brignoles","briancon","bar le duc","beaune","bethune","bobigny","bourg saint maurice","bressuires","brunoy","bry sur marne","bangkok","beirut","bologna","brisbane","brussels","bucharest","baton rouge","buffalo","bacolod","baguio","bahia","baku","bamako","banda aceh","bandar seri begawan","bandung","bangui","barranquilla","basra","batam","batna","bekasi","benghazi","beni mellal","bengaluru","benin city","beograd","bergen","bishkek","bissau","blantyre","bloemfontein","boa vista","bobo dioulasso","bogra","bonn","brasilia","bridgetown","brindisi","bristol","bursa","bacabal","bahia blanca","banska bystrica","baoding","baoji","baraki","baranquilla","barnaul","belgrade","belem","berne","bhopal","bhubaneswar","bikaner","bilbao","biratnagar","braga","bucaramanga","buenaventura","bulawayo","busan","bytom","băilești","baalbek","bagé","bakersfield","bari","baroda","barquisimeto","basel","batavia","batesville","beaumont","beira","benavente","bhiwandi","bilaspur","birjand","blackpool","bogotá","brazzaville","breda","burbank"],
    C:["cairo","chicago","casablanca","calcutta","cape town","caracas","chengdu","cologne","copenhague","cambridge","clermont ferrand","cardiff","changsha","chongqing","cleveland","colombo","conakry","cracovie","calgary","canberra","chiang mai","chisinau","ciudad de mexico","constanta","cordoba","curitiba","caen","calais","cannes","carcassonne","castres","chalons en champagne","chambery","chartres","chateauroux","cherbourg","cholet","colmar","compiegne","corbeil essonnes","creil","creteil","colombes","cergy","caluire et cuire","chelles","cayenne","cambrai","clichy","compiègne","conflans sainte honorine","courbevoie","croissy","créteil","châlon sur saone","châteauroux","chambéry","christchurch","charlotte","chattanooga","chesapeake","chula vista","cincinnati","colorado springs","columbus","corpus christi","cotonou","cebu","chandigarh","chiang rai","chittagong","coimbatore","cucuta","cadiz","cartagena","castellon","coruna","camala","cape coast","catania","cebu city","chiba","chihuahua","chitungwiza","ciudad juarez","coimbra","constantine","cagayan de oro","cali","calicut","campeche","chennai","ciudad bolivar","ciudad del este","ciudad de guatemala","ciudad guayana","cochabamba","cape coral","castellon de la plana","camaguey","can tho","cancun","canton","capetown","cartagena de indias","castries","catanzaro","civitavecchia"],
    D:["dubai","dublin","dakar","delhi","dar es salam","doha","djakarta","dusseldorf","denver","dacca","damas","daressalam","detroit","dhaka","douala","dnipro","dijon","dunkerque","draguignan","drancy","dax","digne les bains","dieppe","douai","dallas","dar es salaam","denpasar","dhanbad","djibouti","dodoma","dongguan","dortmund","dushanbe","davao","davao city","dehradun","deir ez zor","daegu","daejeon","dalian","damascus","debrecen","durban","duque de caxias","düsseldorf","damanhur","dangriga","darwin","diyarbakir","donetsk","dundee","dunedin"],
    E:["edinburgh","esbjerg","epinal","evreux","evry","echirolles","elbeuf","epernay","enghien les bains","el paso","eugene","eindhoven","ekaterinbourg","erbil","erfurt","essen","edirne","el aaiun","el fasher","el giza","el jadida","enugu","escondido","eskisehir","ecatepec","elbasan","ekurhuleni","eldoret","esmeraldas","evora"],
    F:["florence","francfort","fukuoka","freetown","fez","fortaleza","freiburg","frejus","fort de france","flers","fontainebleau","frontignan","fairbanks","fayetteville","fort worth","fresno","frankfurt","funchal","faisalabad","fuzhou","fort lauderdale","foz do iguacu","fribourg","fukushima"],
    G:["geneve","glasgow","guangzhou","guadalajara","gothenburg","grenoble","guayaquil","gwangju","gap","grasse","guéret","guingamp","givors","guerets","gueret","gainesville","garland","gilbert","glendale","grand rapids","greensboro","gibraltar","goma","gurugram","garoua","gaya","gbarnga","gijon","gorakhpur","gorongosa","gorontalo","gaborone","gaziantep","gdansk","genoa","george","gerusalemme","ghent","grenada","guernica","guadalupe","guntur","guiyang"],
    H:["helsinki","hambourg","ho chi minh","hong kong","houston","hyderabad","hanoi","harare","havane","hiroshima","haifa","harbin","honolulu","havre le havre","hyeres","hagondange","haguenau","hellemmes","hem","herouville saint clair","hyères","hartford","henderson","hialeah","hamburg","hanover","heidelberg","haiphong","hamamatsu","hangzhou","hefei"],
    I:["istanbul","izmir","islamabad","issy les moulineaux","istres","indianapolis","irvine","irving","ibadan","ife","ikeja","iloilo","imphal","incheon","indore","ipoh","iquique","iquitos","isfahan","iasi","ilorin","imus","inchon"],
    J:["jakarta","johannesburg","jerusalem","jeddah","joue les tours","joinville le pont","jackson","jacksonville","jersey city","jaipur","jinan","johor bahru","jinja","jos","juarez","jambi","jordan","jaffna","jalapa","jamshedpur","jaraguá do sul","joao pessoa","jubail","juneau"],
    K:["kiev","kinshasa","kuala lumpur","karachi","kaboul","katmandou","kampala","khartoum","kingston","kigali","kanpur","kobe","kourou","kansas city","knoxville","kabul","kaolack","kayseri","khulna","kisangani","kisumu","kitwe","kochi","kolkata","konya","kumasi","kunming","kwangju","kaduna","kharkiv","kagoshima","kaifeng","kairouan","kakamega","kalaburagi","kalinin","kano","karaj","karlsruhe","kashgar","kathmandu","katowice","kaunas","kemerovo","kimberley","king","kirtipur","klang","koforidua","komsomolsk","krasnoyarsk","kuching"],
    L:["londres","lisbonne","lagos","lima","lyon","la havane","lahore","ljubljana","libreville","lome","luanda","lusaka","la paz","lodz","los angeles","luxembourg","laval","le mans","le havre","lens","libourne","lille","limoges","lorient","lourdes","le tampon","levallois perret","la reunion","livry gargan","laon","le blanc mesnil","le puy en velay","longwy","luneville","la rochelle","la seyne sur mer","londre","latacunga","las vegas","lexington","lincoln","little rock","long beach","louisville","lancaster","lausanne","leeds","leicester","leiden","leon","lhasa","linz","liverpool","lubumbashi","lucknow","laos","larissa","lisbon","ljublana","lublin","lahsa","la ceiba","la serena","la vega","lampung","lanzhou","larache","laredo","larkana","latakia","leganés","leiria","lekki","loja"],
    M:["madrid","marseille","mumbai","milan","mexico","moscou","melbourne","montreal","manille","minneapolis","male","managua","maputo","maseru","medine","mogadiscio","monrovia","munich","muscat","medellin","minsk","monterrey","montevideo","metz","montauban","montbeliard","montpellier","mulhouse","mantes la jolie","meaux","montreuil","martigues","massy","maisons alfort","montbéliard","montluçon","montrouge","maubeuge","maubuisson","meyzieu","mogadishu","murcia","malaga","miami","milwaukee","madras","manila","mecca","medina","mombasa","maiduguri","makassar","malabo","malang","manaus","mandalay","manzini","maracaibo","maracay","marrakech","matola","mbabane","medan","meknes","mendoza","meru","miri","moroni","mosul","mount hagen","msunduzi","maceio","málaga","mataram","mauritius","mazatlan","mbeya","meknès","modena","monastir","morelia","moruga"],
    N:["new york","naples","nairobi","new delhi","nice","nagoya","nantes","nassau","niamey","nouakchott","noumea","nuremberg","new orleans","nimes","niort","nancy","noisy le grand","noisy le sec","narbonne","nashville","new haven","newark","norfolk","north las vegas","nagpur","narsingdi","navi mumbai","ndola","nicosia","ningbo","nurnberg","nablus","nakhon ratchasima","nanjing","nabeul","nacala","nanchang","napoli","natal","nay pyi taw","neptune","ngaoundéré"],
    O:["orléans","orsay","orleans","osaka","oslo","oakland","oklahoma city","omaha","orlando","oran","ouagadougou","oaxaca","obafemi awolowo","odessa","ogbomosho","omdurman","omsk","orange","olinda","olomouc","oporto","oradea","ostrava","oujda","oviedo"],
    P:["paris","prague","porto","pekin","perth","phnom penh","pretoria","panama","palermo","porto alegre","pune","pau","perigueux","perpignan","poissy","poitiers","pontoise","pantin","pessac","pierrefitte sur seine","pontault combault","puteaux","philadelphia","phoenix","pittsburgh","portland","palembang","pamplona","patna","pekanbaru","pereira","peshawar","podgorica","port elizabeth","port harcourt","port louis","port moresby","port of spain","porto novo","puebla","pusan","pyongyang","pont de claix","paderborn","palma de mallorca","patras","pensacola","peralillo","pernambuco","pingtung","piracicaba","pleven","plovdiv","poznań","pristina"],
    Q:["quimper","quimperlé","quimperle","quezon city","quito","qom","quetta","quezaltenango","qingdao","quebec"],
    R:["rome","rotterdam","rabat","rio de janeiro","riad","recife","reykjavik","riga","riyadh","rennes","reims","rouen","roubaix","rosny sous bois","rueil malmaison","rodez","romans sur isere","raleigh","richmond","riverside","rochester","rangoon","rawalpindi","resistencia","rio branco","rosario","roshd","rostov","routt","rub al khali","rustenburg","rybinsk"],
    S:["sydney","stockholm","seville","singapour","shanghai","sofia","saint petersbourg","san francisco","santiago","sao paulo","sarajevo","seoul","skopje","salzburg","san diego","san jose","santo domingo","sapporo","saint etienne","saint denis","saint nazaire","saint quentin","strasbourg","sarcelles","sevran","sete","saint brieuc","saint malo","saint maur des fosses","saint ouen","sartrouville","soissons","salon de provence","sucy en brie","sarreguemines","saumur","sens","seattle","sacramento","san antonio","santa ana","santa barbara","savannah","scottsdale","spokane","salt lake city","salta","salvador","san juan","san pablo","san pedro","sanaa","santa cruz","santiago de cuba","santo andre","santos","sao luis","semarang","sendai","sfax","shenzhen","shiraz","sikasso","singapore","sousse","surabaya","surat","suva","setif","shenyang","shijiazhuang","sholapur","sialkot","siliguri","sion","slough","songdo","speyer","springfield","srinagar","stavanger","stoke on trent","stuttgart","suez","sulaymaniyah","sunderland","surakarta"],
    T:["tokyo","tunis","toronto","teheran","taipei","tripoli","tachkent","tbilissi","thessalonique","tallinn","toulouse","toulon","tours","tourcoing","troyes","thionville","thiais","tarbes","thonon les bains","tampa","tempe","toledo","tucson","tulsa","tegucigalpa","tel aviv","thies","thimphu","tianjin","tijuana","tirana","tiruchirappalli","toliara","toluca","tombouctou","torino","tabriz","tahoua","taiyuan","takamatsu","tanga","tangier","tanta","tarawa","tashkent","tbilisi","thais","thes","tuxtla gutierrez","ternopil","tiaret","tiefa","tlemcen","toamasina","tokushima","trelew","trondheim","tuxtla"],
    U:["ulis","utrecht","ulan bator","umea","uagadugu","uberlandia","ulaanbaatar","uluru","umuahia","united arab emirates"],
    V:["vienne","vancouver","venise","varsovie","valence","vilnius","vladivostok","valenciennes","versailles","villeurbanne","vitry sur seine","vincennes","vaulx en velin","venissieux","vannes","villefranche sur saone","villeneuve saint georges","vichy","vienna","virginia beach","valencia","valladolid","vigo","vadodara","valletta","varanasi","varna","victoria","vientiane","visakhapatnam","volgograd","voronezh","vandoeuvre"],
    W:["washington","winnipeg","wuhan","warsaw","wichita","winston salem","worcester","windhoek","wroclaw","warri","wellington","wollongong"],
    X:["xi an","xiamen","xian"],
    Y:["yaounde","yangon","yerevan","yokohama","yakutsk","yekaterinburg","yola"],
    Z:["zurich","zagreb","zaria","zinder","zomba","zibo","zhengzhou","zaragoza","zanzibar"],},
  animal:{

    A:["aigle","alligator","ane","antilope","araignee","autruche","albatros","alpaga","anaconda","axolotl","abeille","anguille","agouti","alouette","amibe","anchois","anolis","ara","armadillo","aspic","accenteur","addax","agame","agami","aigrette","alcyon","alevin","alose","alyte","ambystome","amphibien","andrena","aoudad","apidae","arara","arapaima","archerfish","acanthocephale","achigan","abeille charpentiere","abeille sauvage","abyssal","achigan a grande bouche","acouchi","actinie","agrion","aigle botté","aigle de mer","aigle martial","aigle royal","aigrette blanche","aigrette garzette","aiguille de mer","aiguillat","aile de papillon","akita inu","albacore","albatros hurleur","alligator americain","alose feinte","alyte accoucheur"],
    B:["bison","baleine","boa","buffle","belier","bonobo","blaireau","belette","bernache","bichon","bigorneau","bouquetin","brebis","babouin","barbeau","barracuda","basilic","batracien","baudroie","becasse","becassine","blaireaux","blongios","bouc","bovide","brochet","brocket","bulbul","berger","burrowing owl","babouin olive","baleine a bec","baleine bleue","baleine de minke","baleine grise","barbe de chèvre","barbeau fluviatile","barracuda commun","batiste","bec croisé","bec en sabot","bécasseau","belette commune","bélier","biche","biset","blaireau européen","bec croises","becasseau","blaireau europeen"],
    C:["chat","chien","crocodile","cheval","cochon","chevre","colibri","castor","chameau","capybara","chouette","cobra","cougar","caille","caiman","cameleon","canard","carpe","cerf","chenille","chimpanze","chinchilla","civette","cloporte","coati","coccinelle","coquille","corail","coucou","coyote","crabe","crevette","cygne","calamar","calidris","caracal","caribou","caudate","celacanthe","cervide","cetace","chacal","chamois","chardonnet","chauvesouris","chevreuil","chipmunk","chrysalis","cicada","cistude","colombe","conure","copepode","coq","corbeau","cormorant","couleuvre","coypu","crapaud","criquet","campagnol","condor"],
    D:["dauphin","dromadaire","dindon","dingo","dugong","daim","daman","dendrobate","diable","dodo","dragon","dama","damaliscus","dard","dasypus","daurade","desman","dibatag","dibbler","dik dik","diodon","discus","doliol","dormouse","douroucouli","dromaius","duiker"],
    E:["elephant","ecureuil","emeu","elan","escargot","espadon","epervier","epaulard","eland","ecrevisse","egrefin","elasmobranches","elaphodus","elk","encornet","epine","epinoche","equide","erismature","esox","esturgeon","etourneau","etoile","eulaema","etoile de mer"],
    F:["flamant","fourmi","fennec","faucon","furet","faisan","felin","frelon","faon","fauvette","ferret","flamingo","flet","fourmilier","freux","friquet","fulmar","felid"],
    G:["gorille","girafe","guepard","grenouille","gnou","geai","gecko","gazelle","gelinotte","gibbon","goeland","guenon","guib","galago","gammare","gavial","genet","genette","gerenuk","germon","glouton","gobemouche","godwit","goliath","goret","grand duc","grillon","grizzli","grosbec","guillemot","griffon","giraffe"],
    H:["hippopotame","hibou","hyene","hamster","herisson","hippocampe","harfang","heron","hirondelle","homard","hornbill","houbara","huppe","hydre","hareng","harle","hase","heliconius","heloderm","heterocephale","hocheur","houppette","hyla","hermit crab"],
    I:["ibis","iguane","impala","isard"],
    J:["jaguar","jerboa","jaguarundi"],
    K:["kangourou","koala","kiwi","kodiak","kinkajou","kakapo","kob","komodo"],
    L:["lion","loup","lynx","lievre","lemur","lamantin","lezard","lapin","lamprey","langoustine","leopard","libellule","loir","lophophore","loutre","luciole","lamie","lamproie","lascar","laticauda","lecane","lemming","lepidoptere","leptailurus","licorne","limace","linotte","leptonycteris","lontra"],
    M:["marmotte","morse","mouton","macaque","mangouste","mante","mouflon","mouette","martin","mouffette","macareux","maki","mammifere","manate","mandrill","marsouin","marte","merle","mollusque","morue","murene","musaraigne","mustang","madreporaire","mamba","mammouth","maquereau","marouette","marsupial","martinets","moule","moustique","muride","murin","muscardin","mustela","melanocyte","mole"],
    N:["narval","nandou","nyala","numbat","nautile","nase","nauplius","nematode","nerite"],
    O:["orque","ours","ocelot","okapi","ornithorynque","outarde"],
    P:["panthere","perroquet","poulpe","panda","pingouin","pieuvre","phoque","python","paon","papillon","perche","pic","pie","pigeon","piranha","plie","pluvier","porc epic","poule","poussin","predateur","primate","puce","puma","pangolin"],
    R:["renard","rhinoceros","raton laveur","renne","requin","rossignol","ragondin","raie","rat","remora","reptile","rhinolophe","ricochet","roitelet","rouget","roussette","rascasse"],
    S:["serpent","singe","sanglier","scorpion","saumon","salamandre","sardine","sauterelle","souffleur","suricates","sarcelle","seche","serin","souslik","spheniscus","springbok","squale","sterne","sturnus"],
    T:["tigre","tortue","toucan","tatou","tapir","termite","truie","tanche","taon","taupe","thon","tilapia","titmouse","trogon","truite","tuatara","tupaia","turbot"],
    U:["urubu"],
    V:["vautour","vache","vison","vipere","vigogne","varan"],},
  fruit:{

    A:["abricot","ananas","artichaut","avocat","airelle","ail","asperge","anone","amande","arachide","arbouse","acai","ache","achillee","acore","agave","akee","alkekengi","allspice","aloe","altea","amelanchier","amygdale","anacardier","anis","anthemis","anthriscus","arnica","arroche","arrowroot","arugula","arum","annone","anonas","apocyn"],
    B:["banane","betterave","brocoli","bleuet","baie","basilic","badiane","bergamote","bigarade","bigarreau","bluet","boldo","bourse","busserole","bletis"],
    C:["cerise","carotte","clementine","concombre","coing","chou","citron","chataigne","canneberge","courgette","cassis","capres","celeri","champignon","coriandre","calamondine","camomille","capucine","cardamome","carob","cassave","cayenne","cedrela","chanvre","cherimole","chichoree","chicory","chirimoya","citronnelle","citrouille","cocotier","colocase","comfrey","corette","cornouille","corossol","courge","cresson","crosne","cubebe","cumin","cupuacu","cacao"],
    D:["datte","durian","daikon","damson"],
    E:["epinard","endive","edamame","estragon","echalote","epazote"],
    F:["figue","fraise","fenouil","framboise","feve","fenugrec","feijoa","fruit","fruit de la passion","figue de barbarie"],
    G:["groseille","goyave","gingembre","grenade","gombo","galanga","garance","gentiane","geranium","gesse","gland","glayeul","goji","gouet","genet","gracilaria"],
    H:["haricot","hibiscus","houblon","hysope"],
    I:["igname","icaque","ipomee"],
    J:["jujube","jackfruit","jasmin"],
    K:["kiwi","kumquat","kale","kafir"],
    L:["litchi","limette","laitue","laurier","lupin","lavande","lentille","lichi","longan","lotus"],
    M:["mangue","melon","myrtille","mure","mandarine","mais","mache","marjolaine","menthe","manioc","myrte","morelle","mouron","muguet","murier","muscade","melisse"],
    N:["noisette","nefle","navet","nectarine","noix de cajou","noix de coco","noix de muscade"],
    O:["olive","oignon","origan","oseille","orange"],
    P:["peche","poire","pasteque","poivron","poireau","pamplemousse","patate","pissenlit","prune","papaye","persil","piment","panais","physalis","plantain","poivre","pomelo","pomme","pomme cannelle","passion"],
    R:["raisin","radis","rhubarbe","romarin","ronces","rose","rucola"],
    S:["sureau","salsifis","sapote","soja","seigle","sarriette","sauge","safran","salsepareille","sarrasin"],
    T:["tomate","tangerine","truffe","thym","tamarin","tangelo","tapioca","taro","tilleul","tournesol","tussilage"],
    V:["vanille","vigne","valerian","veronique","violette"],},
  metier:{

    A:["architecte","avocat","astronaute","acteur","animateur","acrobate","ambulancier","analyste","anesthesiste","anthropologue","apiculteur","arbitre","archeologue","armurier","artisan","artiste","assureur","astronome","audiologiste","auditeur","auteur","acousticien","acupuncteur","administrateur","aeronaute","agent","agronome","ajusteur","alchimiste","alieniste","anatomiste","animalier","annotateur","apothicaire","apprenti","archiviste","arsenalier","astrophysicien","audioprothesiste","autoentrepreneur","aide soignant","accoucheur","acheteur","actuaire","agent artistique","agent immobilier","analyste financier","architecte naval"],
    B:["boulanger","biologiste","barman","boucher","bibliothecaire","botaniste","biochimiste","banquier","brasseur","briquetier","bronzier","bijoutier","brodeuse","berger","biophysicien","biopsychologiste","biscuitier","blanchisseur","boucanier","brossier","bucherons","buraliste","bibliothécaire","burgiste"],
    C:["chirurgien","comptable","charpentier","cardiologue","ceramiste","chimiste","choregraphe","coiffeur","consultant","cuisinier","caissier","capitaine","carreleur","chauffeur","chercheur","choriste","chroniqueur","cinematographe","clerc","clown","coach","colonel","comedien","commissaire","compositeur","concepteur","concierge","conducteur","conseiller","conservateur","controleur","copiste","correspondant","couturier","couvreur","cabliste","cachetier","cafetier","calligraphe","calorifugeur","cartographe","cartonnage","ceinturier","chapelier","charron","chasseur","chaudronnier","chocolatier","cirier","clinicien","cloisonneur","cordier","cordonnier","couteliere","coupeur","chasseur de tetes","coach sportif","commissaire priseur","cryptographe","curateur"],
    D:["dentiste","designer","diplomate","directeur","documentaliste","dermatologue","danseur","decorateur","detective","developpeur","dieteticien","distributeur","douanier","dj","dramaturge","demolisseur","dessinateur","discographe","disquaire","documentariste","doreur","dresseur","driver","directeur artistique"],
    E:["electricien","enseignant","economiste","ergotherapeute","ecrivain","educateur","endocrinologue","elagueur","emballeur","employe","encadreur","entrepreneur","epidemiologiste","espion","ethologue","ecologiste","editeur","electrotechnicien","emailleur","embaumeur","encarteur","equarrisseur","equiculteur","estheticien","estimateur","etherographe","evaluateur","evangeliste","excavateur","exportateur","ethnologue"],
    F:["footballeur","fleuriste","facteur","forgeron","formateur","fermier","financier","fiscaliste","fonctionnaire","forensicien","forestier","fabricant","fabuliste","facturiere","faiseur","farrier","faucheur","faussaire","ficeleur","filandier","filetier","fondeur","fournisseur","franchiseur","fripier","fromager","frotteur","fumiste","ferronnier"],
    G:["geologue","gynecologue","graphiste","garde","geometre","gardien","gendarme","gestionnaire","gouverneur","guide","guitariste","galeriste","gantier","garagiste","garcon","garde champetre","garnisseur","gazetier","geophysicien","glassier","gobeur","gouvernante","graveur","greffier","grenetier","grimpeur","geomaticien","genealogiste"],
    H:["historien","huissier","hotelier","hydraulicien","herboriste","humanitaire","hematologiste","heraldiste","horticulteur","horticulturiste","hospitalier","humaniste","humoriste","hydrologue"],
    I:["infirmier","ingenieur","inspecteur","illustrateur","immunologue","informaticien","instituteur","intendant","imprimeur","insectologiste","interlocuteur","intermediaire","inventeur","idolographe","iconographe"],
    J:["journaliste","juge","jardinier","joaillier","juriste","jaillisseur","jaugeur","jongleur"],
    K:["kinesitherapeute","kiosquier"],
    L:["libraire","logisticien","linguiste","laveur","luthier","laborantin","legiste","lieutenant","lapidaire","laudateur","liberaliste","lisseur","lithographe","livreur","lephographie","laqueur"],
    M:["medecin","macon","musicien","magistrat","maquettiste","maquilleur","mathematicien","maire","manager","marin","masseur","menuisier","meteorologue","metreur","militaire","modeliste","moniteur","monteur","marbrier","marbreur","marchand","maroquinier","mecanicien","mediateur","metteur","mineur","modeleur","marechal"],
    N:["notaire","nutritionniste","navigateur","neurologue","negociant","naturopathe","negociateur","numerologiste"],
    O:["opticien","orfevre","osteopathe","oto rhino laryngologiste"],
    P:["pharmacien","plombier","patissier","pediatre","photographe","pilote","pompier","professeur","psychiatre","psychologue","paysagiste","pecheur","peintre","plongeur","podologue","politicien","potier","precepteur","president","procureur","producteur","programmeur","promoteur","prospecteur","praticien","preleveur","prestidigitateur"],
    Q:["qualitologue"],
    R:["radiologue","realisateur","restaurateur","rhumatologue","receptionniste","redacteur","reporter","routier","repasseur","rhabilleur","rhapsodiste","robinettier","rondier"],
    S:["secretaire","sociologue","sapeur pompier","sculpteur","sommelier","styliste","sage femme","sauveteur","serrurier","serveur","soldat","soudeur","sportif","statisticien","steward","superviseur","sellier","sigilliste","silviculturiste","sinologue","soigneur","souffleur","sourcier","speleologue","sexologue"],
    T:["technicien","traducteur","taxidermiste","therapeute","tourneur","tailleur","tapissier","topographe","tuyauteur","tarificateur","taxateur","teinturier","torero","tractoriste","tricoteur"],
    U:["urologue"],
    V:["veterinaire","viticulteur","videoaste","violoniste","vendeur","veilleur","vernisseur","verrier","vigneron"],},
  celebrite:{

    A:["adele","albert einstein","audrey hepburn","arnold schwarzenegger","andy warhol","alain delon","amelie mauresmo","alexandre dumas","alexandre le grand","abraham lincoln","adam smith","agatha christie","agnes varda","aime cesaire","alain prost","albert camus","albrecht durer","alfred de musset","alfred hitchcock","alphonse daudet","amadou hampate ba","amelia earhart","anne frank","apollinaire","aragon","aristote","arthur conan doyle","astrid lindgren","augusto pinochet","abel tasman","adolphe hitler","armand depardieu","arnaud depardieu","arsene lupin","achille","ahanu","aristophane","alfred nobel","alexandre graham bell"],
    B:["beyonce","brad pitt","barack obama","bob marley","beethoven","bruce lee","brigitte bardot","bill gates","billie eilish","bryan adams","barbara","belmondo","bernardo bertolucci","bill murray","bob dylan","boris vian","bourvil","brassens","brel","briand","buster keaton","bjorn borg","bertolt brecht","balzac","baudelaire","blaise pascal","botticelli","ben franklin"],
    C:["cristiano ronaldo","charlie chaplin","celine dion","catherine deneuve","che guevara","christophe colomb","cleopatre","camus","caravage","cary grant","cesaire","charles aznavour","charles de gaulle","charles dickens","charles baudelaire","christophe","claude monet","claude francois","colette","cesar","cervantes","copernicus"],
    D:["drake","david bowie","dalida","david beckham","dali","dante","darwin","de gaulle","debussy","delacroix","depardieu","descartes","diderot","dostoievski","da vinci"],
    E:["elon musk","elvis presley","eminem","edith piaf","ed sheeran","einstein","emily bronte","erasme","ernest hemingway","euclide","euripide","edouard manet"],
    F:["freddie mercury","frank sinatra","franck ribery","florence nightingale","flaubert","francois hollande","francois mitterrand","francisco goya","frida kahlo","francois goya","feodor dostoievski","freud"],
    G:["gandhi","george clooney","gerard depardieu","gainsbourg","galileo","gauguin","gauss","gene kelly","george washington","georges clemenceau","georges pompidou","goethe","gorki","grace kelly","genghis khan","gutenberg"],
    H:["harry styles","halle berry","homer simpson","hemingway","harry potter","hannibal","harold lloyd","hector berlioz","henri matisse","henry ford","hippolyte taine","homer","horace","hugo","harry houdini","heraclite","hippocrate"],
    I:["idris elba","isabelle adjani","ice cube","ibsen","irene joliot curie","ion antonescu","ibn battuta"],
    J:["johnny depp","jay z","jennifer lopez","jules verne","joan of arc","james dean","jean cocteau","jean gabin","jean jaures","jean racine","jean zay","jimi hendrix","john lennon","jorge amado","jeanne d arc","jules cesar","joao miro"],
    K:["kim kardashian","katy perry","kanye west","keanu reeves","kobe bryant","kafka","kant","kepler","karl marx"],
    L:["lady gaga","leonardo dicaprio","lebron james","louis de funes","leonard de vinci","la fontaine","lacordaire","lamartine","lampedusa","lao tseu","lars von trier","lavoisier","le corbusier","leon blum","leonard bernstein","levi strauss","lorca","louis pasteur","leonard euler"],
    M:["madonna","michael jackson","messi","marilyn monroe","mozart","marcus aurelius","machiavel","malraux","mandela","manet","mao zedong","marie curie","marie antoinette","marivaux","marlene dietrich","marlon brando","marx","maupassant","mauriac","michelange","moliere","montaigne","montesquieu","moussorgski","marc aurele","martin luther king"],
    N:["nicki minaj","nelson mandela","natalie portman","napoleon","naomi campbell","neruda","newton","nietzsche","nijinski","nostradamus","nicolas machiavel","nikolai tesla"],
    O:["obama","omar sharif","orson welles"],
    P:["picasso","prince","penelope cruz","pharrell williams","pascal","pasteur","paul eluard","petraque","pissaro","platon","plutarque","poe","pompidou","proust","ptolemee","pythagore"],
    R:["rihanna","robin williams","ronaldo","roger federer","rembrandt","racine","rabelais","raspoutine","raymond aron","reagan","renoir","rimbaud","robespierre","rodin","ronsard","rousseau","rubens","rumi"],
    S:["shakira","steve jobs","serena williams","salvador dali","stromae","sade","saint exupery","saint just","saint saens","sartre","schubert","shakespeare","simon bolivar","socrate","sophocle","spinoza","staline","stendhal","strauss","sully prudhomme","stomae","simone de beauvoir","stefan zweig"],
    T:["taylor swift","tom hanks","tupac","tolkien","tchaikovski","thucydide","tite live","tolstoi","toulouse lautrec","tourgueniev","tzara","tyson","tesla"],
    V:["voltaire","vanessa paradis","viggo mortensen","venus williams","verlaine","verne","vinci","virgile","vivaldi","victor hugo"],
    W:["warhol","washington","winston churchill"],
    Z:["zidane","zola"],},
  sport:{

    A:["athletisme","aviron","alpinisme","aikido","acrobatie","aerobic","agility","arbalette","aquajogging","arts martiaux","autocross","agilite","auto cross","arbalete","air rifle","airsoft","alpine ski"],
    B:["basketball","boxe","baseball","badminton","biathlon","base ball","beach volley","billard","bobsleigh","bodyboard","bodybuilding","bowling","breakdance","bmx","boulisme","beachsoccer","bike polo"],
    C:["cyclisme","cricket","canoe","croquet","curling","canoekayak","crossfit","cross country","corso","capoeira","cheerleading"],
    D:["decathlon","danse sportive","dart","deltaplane","disc golf","discus","diving","dodgeball"],
    E:["escrime","equitation","endurance","escalade","exercise"],
    F:["football","formule 1","flechettes","full contact","fitboxe","fitness","floorball","footgolf","freestyle","freeski","foottennis"],
    G:["golf","gymnastique","goalball"],
    H:["hockey","handball","halteres","hippisme","hurling","hydroplane","hornuss"],
    I:["ice hockey","inline skating","ironman","indoor climbing","indoor cycling","iteration sportive"],
    J:["judo","jogging","jeu de boules","jetski","jiu jitsu","jonglerie","javelin","jorkyball"],
    K:["karate","kendo","kitesurf","kayak","kickboxing","korfball","kyokushin"],
    L:["lutte","lancer de javelot","luge","lacrosse","lancer"],
    M:["marathon","motocross","musculation","mma","muay thai","mountainbike","moto","mushing","mountaineering"],
    N:["natation","nage synchronisee","nordic"],
    O:["octopush","open water","orienteering"],
    P:["polo","patinage","parachutisme","petanque","plongeon","paddle","padel","paintball","parkour","pelote"],
    Q:["quidditch"],
    R:["rugby","rallye","raid","raquette","ring","rodeo","roller","rowing"],
    S:["ski","surf","squash","sumo","snowboard","skateboard","ski de fond","slackline","snorkeling","softball","speleologie","stand up paddle","swimming","savate","sepak takraw"],
    T:["tennis","tir a l arc","triathlon","taekwondo","tennis de table","tir","trampoline","trial","tchoukball"],
    V:["volleyball","velo","voile","vtt","voltige"],
    W:["wakeboard","water polo","wingsuit"],},
  objet:{

    A:["assiette","armoire","aspirateur","agenda","ampoule","ancre","agrafeuse","antenne","affiche","alambic","alene","anneaux","appareil","aquarium","arrosoir","astrolabe","abat jour","abri","accordeon","adapteur","adhesif","aiguille","alarme","album","allumette","altimetre"],
    B:["bureau","bouteille","balai","bague","baignoire","batterie","briquet","balle","baril","baton","biberon","boite","bol","boussole","bracelet","brosse","balance","balancier","baldaquin","balise","bandage","bandeau","banderole","baratte","barbele","barque","barricade","bechoir","bequille","berceau","bloc","bobine","bolide","bornes","botte","bouee","bourse","boutoir","brasero","bac","bagagerie","baguette"],
    C:["chaise","crayon","casserole","cafetiere","calculatrice","cadenas","calendrier","canape","casque","cle","clavier","couverts","canif","carafe","carnet","cartouche","ceinture","chaine","chapeau","chariot","chaussure","ciseau","coffre","couvercle","cabane","cageot","caisse","calebasse","camion","cantine","capote","capsule","cerclage","chemise","cible","cisaille","cloche","cloison","compas","compresseur","compteur","conduit","conteneur","cordon","crampon","crochet","culasse","casquette","charbon","charrue","chassis"],
    D:["dictionnaire","divan","douche","dalle","dessin","drap","dame","dard","davier","dais","damier","dart","detonateur","disque","domino","dossier","doublon","drapeau","dynamo","dalot"],
    E:["echarpe","ecran","enveloppe","echelle","epee","etiquette","egout","elastique","emetteur","empreinte","encre","engin","engrenage","entonnoir","eponge","equerre","etable","etain","etau","etoile","etui","eventail","egalite"],
    F:["fourchette","fenetre","frigo","flacon","flute","fusil","ficelle","fil","filtre","flambeau","fagot","falaise","fanfare","faucille","feuille","ficel","filet","flamme","fleau","fleche","flotteur","fosse","fourneau","fourreau","frein","fuseau"],
    G:["gant","guitare","grille","gobelet","gaffe","gamelle","gaine","galerie","galion","garrot","gateau","geode","gilet","girouette","glissiere","globe","godet","grappe","grenade","grue","grotte"],
    H:["horloge","hamac","hache","haie","harnais","herse","hotte","houe","housse","huile"],
    I:["imprimante","impermeable","icone"],
    J:["journal","jatte","jumelles","jauge","javelot","jersey","jeton","jonque"],
    K:["kayak"],
    L:["lampe","livre","lit","loupe","louche","lacet","landau","lanterne","lattes","lentille","lettre","levier","lien","lissoir","livret","locomotive","longue vue"],
    M:["miroir","montre","matelas","micro","machine","manche","mallette","marteau","masque","medaillon","moule","maillet","main","manchon","mandrin","manette","manivelle","margelle","marmite","masquette","masse","meche","meule","minaret","mitraille","moignon","monocle","moteur","moufle"],
    N:["nappe","notebook","noeud","nacelle","nasse","niveau","nœud"],
    O:["outil","objet de collection","oreillers"],
    P:["parapluie","plume","papier","porte","passeport","peigne","pendule","pince","palette","panier","parasol","pedale","peluche","pendentif","pieu","parachute","parchemin","pare choc","paroi","passoire","patin","pellicule","percoir","perforatrice","periscope","perle","phare","piston","pivot","planche","platine","plomb","pochette","pompe","pontage","poulie","prise"],
    R:["regle","radio","rasoir","refrigerateur","rideau","robinet","roue","raquette","rateau","registre","rempart","renflement","ressort","rivet","rondelle","rouleaux","ruban"],
    S:["stylo","sac","seau","serrure","savon","serviette","sonnette","sofa","selle","sablier","sachet","salamandre","sangle","sarbacane","scaphandre","sceau","seche cheveux","semelle","serpentin","sifflet","silicone","soc","socle","soufflet","soupape","soute","structure"],
    T:["table","telephone","tiroir","tabouret","tapis","tasse","thermometre","tambour","tamis","tenaille","thermos","timbre","tire bouchon","toise","toque","torche","tourniquet","trepied","trombone","truelle","tube","turbine"],
    U:["urn","ustensile"],
    V:["vase","voiture","valise","ventilateur","verre","ventouse","verrou","vitre","volet"],},
  film:{

    A:["avatar","avengers","amelie","alien","apocalypse now","amadeus","aladdin","arrival","a bout souffle","age de glace","amour","aquaman","astérix","asterix","annihilation","anna karenine","a beautiful mind","alien 3","all quiet on the western front"],
    B:["batman","braveheart","blade runner","bambi","beau geste","being john malkovich","belle et la bete","black swan","bladerunner","body double","bohemian rhapsody","boyhood","brazil","breakfast at tiffanys","ben hur","billy elliot","blade"],
    C:["casablanca","coco","crash","citizen kane","captain america","carrie","chinatown","chocolat","cleo","clerks","cliffhanger","clockwork orange","coda","collateral","candide","catch me if you can"],
    D:["dune","drive","django","dunkerque","daddy","dancer","dark knight","dead poets society","defenceless","deja vu","deliverance","detroit","die hard","daddy long legs","dancer in the dark"],
    E:["et","elysium","enfants du paradis","enigma"],
    F:["fight club","fantomas","forrest gump","fargo","finding nemo","face off","fahrenheit 451","fantaisie","flash","full metal jacket"],
    G:["gladiator","gravity","goodfellas","ghost","grease","gattaca","godfather","gone girl","gorillas in the mist","green book","guardians"],
    H:["her","heat","highlander","hugo","harlem nights","harry potter","hunger games","human centipede","harold et maude"],
    I:["inception","interstellar","intouchables"],
    J:["joker","jurassic park","jaws","jarmusch","jungle book"],
    K:["kill bill","kundun","kids","kong"],
    L:["la la land","lion","le parrain","le roi lion","les miserables","la haine","la vita e bella","lady bird","lamerica"],
    M:["matrix","mulan","manhattan","mission impossible","mad max","memento","moulin rouge","minority report","moonlight","mulholland drive"],
    N:["nope","nomadland","no country for old men","nightcrawler","noir","notebook"],
    O:["oldboy","orange mecanique","o brother"],
    P:["parasite","psycho","pulp fiction","pan","paris texas","pirates of the caribbean","piano"],
    R:["rocky","requiem","raiders of the lost ark","rain man","ran","rashomon","rear window","rebel without a cause","roma"],
    S:["scarface","shrek","schindlers list","speed","star wars","seven","shining","silence of the lambs","sus picion"],
    T:["titanic","tenet","the dark knight","taxi driver","thelma et louise","the godfather","three billboards","the truman show"],
    V:["vertigo","v pour vendetta","valerian"],},
  marque:{

    A:["apple","adidas","audi","amazon","airbus","armani","absolut","acne","airbnb","alfa romeo","allianz","allbirds","aldi","alessi","adolfo","aeropostale","aigle","ajinomoto","akira","alka seltzer","amc","amoco","aston martin","atari","abercrombie","acacius","adam et rope","ag","amadeus","arcteryx","awake ny"],
    B:["bmw","balenciaga","burberry","bose","bulgari","barbie","blackberry","babolat","bacardi","baidu","bally","banana republic","barilla","bata","benetton","bershka","bestseller","bic","birkenstock","blablacar","blancpain","blizzard","boeing","bosch","bottega veneta","bbc","be at tokyo","belstaff","berluti"],
    C:["chanel","coca cola","cartier","calvin klein","canon","carrefour","caterpillar","celine","cerrutti","cessna","chaumet","chopard","christian louboutin","citroen","clarins","clarks","columbia","comme des garcons","converse","corning","cacharel","camper","canada goose","courrèges","corthay"],
    D:["disney","dior","dolce gabbana","dacia","daewoo","danone","darty","dassault","dhl","diesel","dolce","domenico","dominos","doritos","dr martens","dreamworks","dunhill"],
    E:["emirates","essilor","ebay","electrolux","epson","esprit","etnies","everlane","ermenegildo zegna"],
    F:["ferrari","facebook","fendi","ford","fila","ferero","ferragamo","fiat","five guys","fred perry","frito lay","fusalp","freixenet","fenty"],
    G:["google","gucci","gap","gateway","gatorade","generali","givenchy","goyard","galeries lafayette","glenfield"],
    H:["h m","hermes","hp","huawei","harley davidson","hackett","hallmark","harman","head","heineken","henessy","hilton","hollister","honda","hugo boss"],
    I:["ikea","intel","instagram","imperial","in n out","innocent","interbrand","issey miyake"],
    J:["jaguar","jordan","jimmy choo","jacquemus","jean paul gaultier","jil sander","john lobb","johnnie walker","joop","julius","james"],
    K:["kenzo","kia","kappa","karen millen","karl lagerfeld","keen","kering","kipling","kiton","kleenex","kim jones"],
    L:["louis vuitton","lego","lacoste","louboutin","lg","labrador","lacor","laferrari","lafite","lamborghini","lane crawford","lanvin","lenovo","levis","lexus","lindt","loewe","l oreal","lululemon","longchamp"],
    M:["mercedes","mcdonalds","microsoft","moncler","mastercard","maison margiela","mango","marc jacobs","marina","marni","massimo dutti","maybach","miele","miss selfridge","missoni","mitsubishi","moet","moschino","mr porter","muji","mulberry"],
    N:["nike","netflix","nintendo","nestle","nars","nba","nfl","nikon","north face","nokia","new balance"],
    O:["omega","off white","ouibus","oysho"],
    P:["porsche","prada","puma","paypal","pepsi","patagonia","paul and shark","paul smith","peck","penhaligons","pepe jeans","peroni","peugeot","pfizer","piaget","polo","primark","procter","palace"],
    Q:["quiksilver","qu est ce que"],
    R:["rolex","renault","reebok","ralph lauren","red bull","red wing","reform","reiss","replay","revlon","ricoh","roberto cavalli","roca","rocky","rodenstock","roland","roots","roscoe","rowenta","royal","rains","rapha"],
    S:["samsung","sony","supreme","saint laurent","snapchat","salvatore ferragamo","seiko","sephora","shimano","siemens","skechers","starbucks","stella","stussy","subway","stella mccartney","stella artois"],
    T:["tesla","toyota","twitter","tiffany","tommy hilfiger","topshop","tory burch","total","ted baker","thom browne"],
    U:["uniqlo","ugg","under armour"],
    V:["versace","volkswagen","valentino","van cleef","viceroy","vans","vilebrequin","vuitton"],
    W:["woolrich","wrangler"],
    Y:["yamaha","ysl"],
    Z:["zadig et voltaire","zara","zimmermann"],},
  anatomie:{

    A:["artere","avant bras","abdomen","aisselle","alveole","anus","aorte","appendice","atlas","auriculaire","acetabulum","acromion","adenoide","adipeux","adrenal","afferent","aine","amygdale","arche","arcade","articulaire","articulation","astragale"],
    B:["biceps","bras","bronche","bassin","bouche","boite cranienne","bulbe"],
    C:["cote","crane","clavicule","coeur","colonne","colon","cornee","cubitus","cuisse","calcaneum","canal","canine","capillaire","capsule","cartilage","cavite","cerveau","cervelet","cervicale","cil","col","condyle","cortex","cou","coxal","carotide","cochlée"],
    D:["dos","duodenum","deltoid","dents","diaphragme","derme","deltoide","dermique","diencephale"],
    E:["epaule","estomac","epiderme","epine","epiphyse","epithelium","epididyme","extremite"],
    F:["femur","foie","front","fascia","falange","fibula","flanc","fontanelle"],
    G:["genou","glande","gorge","ganglion","glotte","gencive"],
    H:["humerus","hanche","hippocampe"],
    I:["intestin","index","ischio","iris"],
    J:["jugulaire","joue","jambe"],
    K:["kyste","keratine"],
    L:["langue","levre","lobe","ligament"],
    M:["molaire","muscle","machoire","membrane","menisque","moelle","maxillaire","metacarpe","metatarse","mitral","mollet","mamelons"],
    N:["nerf","nez","nuque","narine","nasal","naviculaire","nombril"],
    O:["os","oreille","omoplate","ovaire","orbite"],
    P:["poumon","pancreas","peau","pied","pouce","poignet","prostate","palais","paume","perinee","phalange","plante","parotide","patella","peronnier","pharynx","plexus","poitrine"],
    R:["rein","radius","rectum","rotule","rachis","retine"],
    S:["sternum","sourcil","sacrum","scapula","sinus","salive","sang","saphene","scrotum","septum","sesamoide","squelette","synovie"],
    T:["tibia","trachee","tendon","thyroide","tarse","tempe","temporal","testicule","thalamus","thorax","thymus"],
    V:["vertebre","veine","valve","ventricule","vagin","vaisseau","vesicule"],},
  musique:{

    A:["ac dc","adele","aya nakamura","abba","alpha blondy","amine","aerosmith","afrojack","air","akon","alice cooper","amadou et mariam","amy winehouse","angele","anitta","arctic monkeys","asaf avidan","asap rocky","audiophile"],
    B:["beatles","brel","beyonce","bob marley","booba","bigflo et oli","bjork","black eyed peas","black sabbath","blur","bon jovi","bruce springsteen","billie eilish","bach"],
    C:["chopin","coldplay","calogero","claude francois","christophe mae","camille","cardi b","childish gambino","chris brown","clean bandit","coltrane","cypress hill"],
    D:["drake","daft punk","dalida","david guetta","dire straits","disclosure","dj khaled","dj snake"],
    E:["eminem","ed sheeran","edith piaf","electric light orchestra","ella fitzgerald","elton john","enrique iglesias","eric clapton"],
    F:["fugees","florent pagny","frank sinatra","fleetwood mac","florence and the machine","foo fighters","frank ocean"],
    G:["gorillaz","green day","gainsbourg","george michael","guns n roses"],
    H:["hendrix","hans zimmer","hamza","harry styles","hermeto pascoal"],
    I:["inxs","indochine","imagine dragons","iron maiden"],
    J:["jay z","johnny hallyday","julien dore","james brown","jamiroquai","jean michel jarre","john coltrane","john legend"],
    K:["kendrick lamar","kraftwerk","kanye west","keane","khalid","kid cudi","koffee"],
    L:["led zeppelin","lorde","lomepal","lacrim","lauryn hill","leon bridges","les rita mitsouko","lizzo","logic","ludovico einaudi","le son du klaxon","lords"],
    M:["madonna","mozart","maes","mike brant","maroon 5","marvin gaye","mac miller","massive attack","metro boomin","miles davis","mogwai","moby","muse"],
    N:["nirvana","nicki minaj","nekfeu","ninho","nas","nine inch nails","notorious big"],
    O:["oasis","outkast","omega"],
    P:["pink floyd","pharrell","piaf","pascal obispo","pearl jam","pet shop boys","post malone","pretenders","prince"],
    R:["radiohead","rihanna","r kelly","raphael","rage against the machine","red hot chili peppers","rone"],
    S:["shakira","stromae","soprano","sting","sam smith","sex pistols","simon et garfunkel","simple minds","skepta","snoop dogg","summer"],
    T:["taylor swift","the weeknd","the police","toto","talking heads","tame impala","the cure","the doors","the national","thelonious monk","twenty one pilots"],
    V:["vianney","vivaldi","vald","vampire weekend"],},
  cuisine:{

    A:["aligot","andouillette","agneau","asperge","aubergine","aloo","adobo","anchoiade","achards","acras","ail","aioli","albufera","alcazar","alfredo","alicot","almondine","alouettes","amandine","amuse bouche","ananas","anchois","anglaise","antipasto","arancini","arista","armoricaine","arrabiata","artichaut","asado","assiette","atlantic","avgolemono"],
    B:["blanquette","bouillabaisse","boeuf","bruschetta","baklava","bechamel","brochette","bourguignon","babaganoush","bagna cauda","banh mi","barigoule","beignet","bearnaise","bibimbap","bisque","blini","bordelaise","bortsch","brandade","brioche","brunoise","bulgogi","burger","burrata","burek"],
    C:["cassoulet","crepe","creme brulee","carpaccio","choucroute","coq au vin","carbonara","curry","couscous","ceviche","chili","chow mein","clafoutis","compote","confit","consomme","coquilles","cotolette","cotriade","coulibiac","creme caramel","crepe suzette","croque monsieur","crudites","crumble","cuisine"],
    D:["daube","dim sum","dashi","dolma","danish","dorade","dumplings","daiquiri","dinde","dieppoise","diots","dolce","doria"],
    E:["escalope","empanada","enchilada","escargot","etouffee","entrecote","epinard","estouffade","etuvee"],
    F:["fondue","falafel","foie gras","friture","feuillete","fricassee","fajita","farce","fettuccine","financier","flammekueche","florentine","fricando","fritada","frito"],
    G:["gaspacho","gyoza","galette","goulash","gratin","gyros","gado gado","galantine","gamberoni","garbure","garbanzos","garganelli","garnish","gateau","gazpacho","genovese","glace","gnocchi","guacamole"],
    H:["hummus","hotpot","harira","hachis parmentier","halloumi","hamburger","harissa","hochepot","hollandaise","houmous"],
    I:["involtini","idli","injera","iskender"],
    J:["jambalaya","julienne","jerk","jiaozi"],
    K:["kebbeh","kimchi","kung pao","kefta","khachapuri","khao pad","kibbeh","kleiner"],
    L:["lasagne","lobster","langoustine","lentilles","lyonnaise","laksa","lardo","lapin","lardon","leche","lecso","linguine","lomo saltado"],
    M:["moussaka","madeleine","magret","meringue","mole","miso","mac and cheese","makis","manchego","mangue","mapo tofu","marengo","marinade","marmite","massala","matzah","mayonnaise","mechoui","menudo","merguez","migas","minestrone","moules","mousse","muffin","mulligatawny","musaka"],
    N:["naan","nouilles","nicoise","nougat","nachos","nasi goreng","navarin","nems"],
    O:["osso bucco","omelette","ossobuco","okra"],
    P:["paella","pizza","pho","pierogi","pot au feu","profiteroles","polenta","pad thai","pakora","paneer","panna cotta","panzanella","papillote","pastilla","pate","pavlova","peking duck","persillade","piccata","pissaladiere","pistou","poele","poivrade","polpette","pommes dauphine","pot roast","potee","praliné","pulled pork"],
    R:["risotto","ramen","ratatouille","rosbif","ravioli","ras el hanout","rendang","ribollita","rigatoni","rilettes","riz cantonais","rollmops","romesco","roti","rotisserie"],
    S:["sushi","soupe","steak","sashimi","saucisse","soufflé","salade","saltimbocca","samosa","sauce","sauerkraut","saumon","scaloppine","schnitzel","semifreddo","shakshuka","shawarma","smorgasbord","sofrito","sommelier","spaghetti","springroll","stroganoff","stuffing","sukiyaki"],
    T:["tiramisu","tagine","taco","tartare","tempura","tarte","taboule","tapas","tataki","teriyaki","tofu","tortilla","tourte","travers","truffe","tsukune"],
    V:["vichyssoise","volaille","veloute","vermicelle","vatapa","veau","viennoiserie","vinaigrette"],},
  vehicule:{

    A:["avion","autobus","automobile","ambulance","automoteur","airbus","aeroglisseur","aeronef","aeroplane","alfa romeo","amphibie","autocar","autochenille","autocross","automotrice","autoneige","aston martin","audi","atv","autogire","autogyro","autorail","avion cargo","avion de chasse","avion de ligne","avion furtif","avionnette","aviso"],
    B:["bateau","bus","bicyclette","berline","boeing","bulldozer","barque","bachot","baleiniere","benne","blindé","bombardier","brouette","bac","bagage","barge","bateau mouche","bateau pirate","bateau pompier","batiscaphe","bentley","beton","bielle","bimoteur","biplaces","biplans","bmw","bob","bobsleigh","bollard","breakdance","bugatti","buggy"],
    C:["camion","canoe","cabrio","caravane","catamaran","char","chariot","cab","cabriolet","canot","carriole","chalutier","chaloupe","charette","citerne","clipper","cockpit","container","corbillard","corvette","coupe","cable car","cadillac","caisson","calèche","camionnette","camping car","canot pneumatique","car","car de police","cargo","cargoboat","carrosse","catapulte"],
    D:["deltaplane","dirigeable","draisienne","dragster","drone","drakkar","dumper"],
    E:["escalator","embarcation","engin","excavateur"],
    F:["ferrari","fusee","funiculaire","fourgon","fregatte","frigat","formule un","fiat","ford","fourgonnette"],
    G:["go kart","gyropode","galere","gondole","grader","gyroplane","grue"],
    H:["helicoptere","hovercraft","hoverboard","half track","hot rod","hydrofoil","harley davidson","hydravion"],
    I:["isetta"],
    J:["jet","jeep","jonque","jet ski","jumbo jet"],
    K:["kayak","karting"],
    L:["limousine","locomotive","longboard","luge","landau","lamborghini","lancia","land rover","libelle"],
    M:["moto","metro","monorail","mehari","minibus","minivan","moissonneuse","monospace","monoplace","monoroue","motocross","motocyclette","motoneige","maclaren","maserati","mazda","mitsubishi","mobylette","moped","motorboat"],
    N:["navire","navette","nef"],
    O:["omnibus","overcraft"],
    P:["peugeot","planeur","pirogue","paquebot","porsche","patinette","pedalier","pelle","pick up","porte avion","pousse pousse","pedicab","parachute","patrol","peniche","petrolier","phantom","planche","planche a voile","pneumatique"],
    R:["renault","rame","remorque","radeau","roadster","rickshaw","remorqueur","rolls royce","roquette"],
    S:["scooter","sous marin","skate","snowmobile","segway","sidecar","speed boat","suv","semi remorque","skateboard","submarine","suzuki"],
    T:["train","tracteur","tramway","tricycle","tuk tuk","tank","taxi","teleferique","tout terrain","tractopelle","transatlantique","torpedo","trabant","trailer","tram","triporteur"],
    V:["voiture","velo","vespa","voilier","van","velocipede","viking","volkswagen"],},
  capital:{

    A:["alger","amman","astana","accra","andorre","asmara","abuja","abou dhabi","addis abeba","ankara","antananarivo","apia","asuncion","athenes","andorre la vieille"],
    B:["bagdad","berlin","berne","brasilia","bruxelles","budapest","bujumbura","bamako","bangui","banjul","beijing","belgrade","belmopan","bissau","bogota","bratislava","brazzaville","bridgetown","biskek"],
    C:["cairo","colombo","canberra","conakry","chisinau","copenhague","caracas","castries","ciudad de guatemala"],
    D:["dacca","doha","djouba","dodoma","dakar","dili","douchanbé"],
    E:["edinburgh","erevan"],
    F:["funafuti","freetown"],
    G:["guatemala city","georgetown","gaborone"],
    H:["helsinki","harare","havane","honiara"],
    I:["islamabad"],
    J:["jakarta","jerusalem","jamestown"],
    K:["kiev","kaboul","kampala","khartoum","kigali","kingston","kinshasa","kuala lumpur"],
    L:["lima","lisbonne","lome","libreville","lilongwe","luanda","lusaka","la paz"],
    M:["madrid","moscou","maputo","maseru","mogadiscio","monrovia","male","managua","manila","mbabane","minsk","montevideo","moroni","muscat"],
    N:["nairobi","nassau","niamey","ndjamiena","nukualofa","naypyidaw","new delhi","nicosia"],
    O:["oslo","ottawa","ouagadougou"],
    P:["paris","prague","pretoria","port au prince","port moresby","panama","palikir","phnom penh","porto novo"],
    R:["rabat","riad","rome","riga","reykjavik"],
    S:["seoul","stockholm","singapour","sarajevo","sofia","suva","san jose","santiago","santo domingo","sao tome","skopje"],
    T:["tokyo","tunis","teheran","tallinn","tirana","thimphu","tashkent","tbilissi","tegucigalpa","tripoli"],
    V:["varsovie","vienne","vilnius","vaduz","valleta"],
    W:["warsaw","windhoek"],
    Y:["yaounde"],},
  monument:{

    A:["acropole","arc de triomphe","alhambra","angkor","abbaye","agora","alcazar","amphitheatre","arche","arena","arenes","abbaye de westminster","acropolis","agios nikolaos","agra","ain ghazal","ajanta","akropolis","al aqsa","alcatraz","alta","alto douro","amiens","arc boutant"],
    B:["big ben","burj khalifa","basilique","belem tower","borobudur","beffroi","basilique saint pierre","berlin wall","blarney castle","blue mosque","buckingham palace","burj al arab"],
    C:["colisee","chapelle sixtine","cheops","cathedral","chichen itza","christ redempteur","citadelle","colonne","cordoue","crypte","carnac","cathédrale","cathedrales","catacombes","chateau de versailles","cheopse","chora","cistercien","cluny","colonne trajane","colosses","chateau versailles","cathedrale"],
    D:["dome du rocher","delphi","dolmen","dome des rochers","dome des invalides"],
    E:["empire state building","escorial","ephese","easter island"],
    F:["forum romain","forbidden city","fortification","fontaine de trevi"],
    G:["grande muraille","gaudi","grand canyon","grand palais","glacier","grotte","golden gate","great pyramid"],
    H:["hagia sofia","hanging gardens","hollywood","hradcany","hadrien","himeji","hongkong skyline"],
    I:["invalides"],
    J:["jungfrau","jardin","jerash"],
    K:["kremlin","krak des chevaliers","karnak","kilimanjaro","kaaba"],
    L:["louvre","la sagrada familia","leaning tower","leptis magna","luxor"],
    M:["machu picchu","mont saint michel","mausolee","mihrimah","minaret","moai","montserrat","mosquee","meridian","minar","mont olympe"],
    N:["notre dame","niagara","nazca"],
    O:["opera de sydney","oracle de delphes","obélisque"],
    P:["parthenon","pyramides de gizeh","palais royal","pantheon","pergame","pompei","pont du gard","pagode","palais du potala","palmyre","persepolis","petra","pyramides"],
    R:["reichstag","rialto","red fort","rempart","rialto bridge","robben island"],
    S:["sphinx","statue de la liberte","stonehenge","saint sophie","sagrada familia","sigiriya","sanctuaire","saint basile","serengeti","sistine"],
    T:["taj mahal","temple","tour","tour eiffel","thermopyles","tianmen","torii"],
    V:["vatican","versailles","victoria falls"],},
  langue:{

    A:["allemand","arabe","armenien","azeri","albanais","amharique","anglais","assamais","aymara","afrikaans","akan","amharic","aragonais"],
    B:["bengali","birman","bulgare","basque","bachkir","baloutche","bambara","belarusse","berbere","bosnien","breton","buryat"],
    C:["chinois","coreen","croate","catalan","cantonais","cebuano","chichewa","corse"],
    D:["danois","dari","dzongkha"],
    E:["espagnol","estonien","esperanto","ewe"],
    F:["francais","finnois","farsi","fidjien","filipin","flamand","frison","fulanien"],
    G:["grec","georgien","gallois","gaelique","guarani","gujarati","galicien"],
    H:["hindi","hongrois","hebrew","haoussa","hébreu","hebreux"],
    I:["italien","islandais","indonesien","igbo"],
    J:["japonais","javanais"],
    K:["kazakh","khmer","kirghiz","kannada","kinyarwanda","kongo","kurde"],
    L:["latin","letton","lituanien","luganda"],
    M:["mandarin","malagasy","malais","mongol","macedonien","malayalam","maltais","marathi"],
    N:["norvegien","nepalais","neerlandais"],
    O:["ourdou","oriya","occitan"],
    P:["polonais","persan","portugais","pashto","punjabi"],
    R:["russe","roumain"],
    S:["suedois","swahili","serbe","somali","sindhi","sinhala","slovaque","slovene"],
    T:["turc","tamoul","thai","tatar","telugu","tibetain","tigrigna"],
    V:["vietnamien","valencien"],},
  instrument:{

    A:["accordeon","alto","arpa","angklung","alphorn","appeau","accordina"],
    B:["banjo","basse","basson","balafon","berimbau","bodhran","bongo","bugle","bansuri","baryton","bassoon","bouzouki"],
    C:["cithare","clarinette","cor","cymbale","clavecin","cloches","contrebasse","cornemuse","cromorne","cajon","caixa","castagnettes","celesta","chalumeau","charango","chimes","cistre","clairon","clave","cloche","conga","congas","cuivre"],
    D:["dulcimer","didgeridoo","darbouka","djembe","derbouka","dhol","daf","dagomba","danse","dobro","domra","dordotche","dre"],
    E:["euphonium","epinette"],
    F:["flute","fifre","fife","flageolet"],
    G:["guitare","gong","glockenspiel","guimbarde","gaita","gamelan","geige","gopichand","guitare basse","guitare electrique"],
    H:["hautbois","harmonica","harpe","hang drum","helicon","harmonium"],
    I:["imbila","idakka","igil","ihu","irish flute","iya"],
    J:["jouhikko","jews harp"],
    K:["koto","kalimba","kora","kemane","kazoo","kecak","kendang","kettledrum","khomuz","kobza","komuz","krakevik"],
    L:["luth","lyre","lauto","leier","lirone","lituus","lur","lir"],
    M:["mandoline","maracas","mbira","melodeon","melodica"],
    N:["nyckelharpa","ngoni","nay"],
    O:["orgue","oud","ocarina"],
    P:["piano","piccolo","percussions","pipa","psalterion"],
    R:["rebab","recorder","rebec","rubab"],
    S:["saxo","sitar","synthetiseur","sarod","sanza","steel drum","santur","sarangi","serpent","shaker","shakuhachi","shenai","shofar","sousaphone","surbahar","svirel"],
    T:["trompette","tuba","tambour","theremin","triangle","trombone","tabla","tampura","tanbur","tar","tarogato","theorbe","tiple","toyama"],
    V:["violon","violoncelle","viole","viol","viola","vihuela","veena","viole de gambe"],},
  vetement:{

    A:["anorak","aube","abaya","afgha","amice","anorake"],
    B:["bikini","blouson","burqa","bermuda","body","bottes","bonnet","bandeau","beret","blouse","bodice","bolero","bombachas","boxer","brassiere","bustier"],
    C:["chemise","cravate","cape","corset","cagoule","calcon","cardigan","casquette","chaussettes","chaussure","ceinture","chapeau","caban","cache col","caftane","calceons","calotte","camiscole","camisole","capuche","cardigane","casaque","catogan","chale","chaussons","chiton","chlaine","choker","cilice","ciré","caftan","cire"],
    D:["doudoune","djellaba","debardeur","dastar","dashiki","decontracte","dos nu"],
    E:["echarpe","espadrille","epaulieres","epaulettes"],
    F:["foulard","frac","fanon"],
    G:["gilet","gants","guetres"],
    H:["hoodie","haori","habit","haïk","hautes chaussettes","haik"],
    I:["impermeable"],
    J:["jean","jupe","justaucorps","jogging","jambières"],
    K:["kimono","kaftan","kilt","kameez"],
    L:["lingerie","legging","lin","leg warmers"],
    M:["manteau","mariniere","mini jupe","mitaines","maillot","maillot de bain","mittelwäsche","mocassins"],
    N:["niqab"],
    O:["overall","overcoat","organza","ouatine","oreillette"],
    P:["pardessus","pull","parka","polo","peignoir","pantalon","pelerine","paletot","panache","pantalon large","parador","pareo","peigne","pelisse","peplos","perle","plastron"],
    R:["robe","redingote","raincoat","robe de chambre"],
    S:["sweat","smoking","salopette","short","slip","soutien gorge","sandales","sari","sarong","snood","sodder","sous pull"],
    T:["tee shirt","trench","tunique","tablier","toge","toga","turban","tuxedo"],
    V:["veste","voile","vest","veston"],},
  emotion:{

    A:["amour","angoisse","admiration","allegresse","affection","ardeur","amertume","accablement","agacement","aise","apaisement","apprehension","arrogance","assurance","attirance","attendrissement","audace","avanie","aversion","abnegation","affliction","agitation","abattement","affres","alarme","aliénation","anxiete","apitoiement","atrocite","attachement","alienation","abaissement","abrutissement","absurdite","accalmie","acceptation","acharnement","acrimonie","acuite","adoration","agonie","allalliegresse","ambivalence","animosite"],
    B:["bienveillance","bonheur","bonte","beaute","bienetre","beatitude","blessure","brutalite","bien-etre","bienfaisance","bien etre","bluffe"],
    C:["colere","crainte","curiosite","compassion","confiance","culpabilite","chagrin","consternation","contentement","courroux","cafard","calme","caprice","chaleur","charme","clemence","complicite","confusion","convoitise","cordialite","courage"],
    D:["desespoir","desir","deception","desarroi","detresse","douceur","dedain","dependance","deprime","deuil","dignite","discorde","disgrâce","douleur","delectation","delicatesse","desolation","devouement","decouragement","degoût","depression","deseperance","disgrace"],
    E:["enthousiasme","euphorie","effroi","ennui","emerveillement","embarras","emotion","empathie","enervement","envie","esperance","estime","etourdissement","exaltation","excitation","exasperation","extase","ebullition","eblouissement","elancement","elevation","epic","epuisement","epouvante"],
    F:["fierte","frustration","frayeur","fierete","fascination","fatigue","ferocite","finesse","frisson","fureur","ferveur","fidelite"],
    G:["gratitude","gene","genie","gaite","gêne","gloire","grace","grâce"],
    H:["honte","horreur","humilite","haine","harmonie","hargne","hardiesse","hebetement","hilarite","honneur","hesitation"],
    I:["inquietude","impatience","indignation","indifference","insouciance","intensite","ivresse","incredulite","incomprehension","impuissance","inertie","insatisfaction","intolerance"],
    J:["jalousie","joie","jubile","jouissance"],
    K:["kinesthesie","kif","kudos"],
    L:["larmes","lassitude","liberte","legerete","lenivement","langueur","loyaute"],
    M:["melancolie","mepris","malaise","mechancete","misere","modestie","morosité","morosite"],
    N:["nostalgie","nervosité","nonchalance"],
    O:["obstination","orgueil","outrage"],
    P:["peur","pitie","panique","paix","passion","peine","plaisir","prudence","perplexite"],
    R:["rage","rancune","regret","rancoeur","ravissement","recueillement","renonce","resignation","ressentiment"],
    S:["souffrance","satisfaction","stupeur","solitude","saintete","serenite","soulagement","surprise","sentiment"],
    T:["terreur","tendresse","timidite","tristesse","tourment","trouble","torpeur"],
    V:["vengeance","vertige","vexation","vanite","vaillance","vergogne","vigueur","vitalite"],},
  mythologie:{

    A:["apollo","aphrodite","ares","artemis","athena","achille","adonis","aedes","agamemnon","ajax","alceste","alecto","aletheia","amour","amphitrite","andromede","antee","arethuse","argonautes","ariadne","asclepios","atlas","acheron","adrastee","aeetes","aegee","aegis","aeole","agave","agenor","aglaope","aristee","astree"],
    B:["bacchus","bellerophon","briares","borée","boree"],
    C:["calypso","cerere","cronos","circe","centaure","cerberus","chimere","clytemnestre","cronus","cyclope","castor","cassandre","calliope","cerbere","centaures"],
    D:["dionysos","dedale","dieu","dryade","diana","dieux","diane","deimos"],
    E:["europe","echo","erebe","erinyes","eros","eurydice","euterpe","electre","endymion"],
    F:["faune","fates","furies"],
    G:["gaia","gorgone","gorgones","graces","gigantes"],
    H:["heracles","hermes","hades","hera","hydre","helios","hercule","hephaistos","hestia","hygie","hyperion","hypnos","helene"],
    I:["icare","iris","ithaque"],
    J:["jason","janus","jupiter","juno"],
    K:["kronos"],
    L:["lachesis","labyrinthe","laocoon","lethe","licorne"],
    M:["meduse","midas","minotaure","medee","mars","mercure","minerve","mnemosyne","morphee","muses"],
    N:["neptune","nike","narcisse","nymphes"],
    O:["orphee","odyssee","olympe","oracle"],
    P:["poseidon","pandore","persee","pegase","pluton","promethee","paris","penelope","persephone","polypheme"],
    R:["romulus","rhea","rhadamanthe"],
    S:["saturne","sphinx","sisyphe","sirenes","styx"],
    T:["titans","thesee","themis","triton","typhon","tiresias"],
    V:["venus","vulcain"],},
  espace:{

    A:["asteroide","astres","aurora","apogee","atmosphere","astre","astronomie","astrophysique","astronaute","alignement","anneau","amas","aurore","asterode","asteroides"],
    B:["big bang","binaire","boucle cosmique"],
    C:["comete","cosmos","ceinture de kuiper","constellation","cosmologie","corps celeste","crater"],
    D:["deimos","dwarf planet","distance astronomique","derive","debris","duree cosmique","densite","disque galactique"],
    E:["eclipse","exoplanete","equinoxe","etoile","expansion","eclipse totale"],
    F:["fusee","force gravitationnelle","fission"],
    G:["galaxie","gravite","geante rouge","gravitation"],
    H:["horizon des evenements"],
    I:["iss","impact meteoritique"],
    J:["jupiter"],
    K:["kepler"],
    L:["lune","lumiere","laser","luminosite"],
    M:["mars","meteore","milky way","magnitude","meteorite"],
    N:["nebuleuse","neutron","nasa","naine blanche","naine brune"],
    O:["orbite","onde gravitationnelle"],
    P:["pluton","planete","pulsar","parallaxe","perigee"],
    R:["rover","rotation","radiation"],
    S:["saturne","soleil","supernova","satellite","sonde"],
    T:["telescope","trou noir","transit"],
    U:["univers","uranus"],
    V:["venus","voie lactee"],},
  oceane:{

    A:["anemone","algue","anguille","anchois","abysses","atterissage","atoll","alcyone","ambre","ancolie marine"],
    B:["baleine","barracuda","benitier","bernacle","baleine bleue","baudroie"],
    C:["calamar","corail","crabe","crevette","coquillage","calmar","carpe","celacante","crustace","celacanthe","courant marin","coral"],
    D:["dauphin","dugong","delta","delphinapterus"],
    E:["epaulard","espadon","etoile de mer","ecosysteme marin"],
    F:["flet","fletan","fausse tortue","fond marin","fanon","faque","flottaison"],
    G:["grand requin","gobie","grotte sous-marine","grotte sous marine"],
    H:["homard","hippocampe","hareng","huitre"],
    I:["ichtyologie","ile","iguane marin"],
    J:["janthine"],
    K:["krill","kayak marin"],
    L:["langouste","lion de mer","lamproie","lamantin"],
    M:["maquereau","meduse","murene","morse","marsouin"],
    N:["narval","nautile","naufrage"],
    O:["octopus","orque"],
    P:["pieuvre","phoque","poisson clown","pingouin","plancton"],
    R:["raie","requin","rascasse","recif"],
    S:["sardine","saumon","seiche","sole","scaphandre"],
    T:["thon","tortue marine","turbot"],
    V:["vive","variete marine"],},
  medievale:{

    A:["armure","arbalete","abbaye","alchimiste","armoiries","assiegeant","autel","archange","arquebus","annales"],
    B:["banneret","beffroi","bouclier","buste","bastion","barde","beguinage","blason"],
    C:["cathedrale","chevalier","chatelain","cle de voute","chateau","chevauchee","clerc","croisade","couvents"],
    D:["donjon","drac","druide","duel","dame"],
    E:["ecuyer","epee","ecu","etendard","ecurie"],
    F:["feodalite","fort","faucon","feudalisme","fleche","fief"],
    G:["guildes","glaive","gargouille","gardes"],
    H:["heraut","haubert","hommage","herse"],
    I:["impot"],
    J:["joute","jeanne d arc"],
    K:["keep"],
    L:["lance","lutrin","luth","laique"],
    M:["merlin","manoir","maitre","monastere","motte","moine"],
    N:["noble","nef"],
    O:["oriflamme","ordre","oracle"],
    P:["palefroi","parchemin","page","pont levis","prieure"],
    R:["rempart","roi","roi arthur","relique"],
    S:["seigneur","serf","scribe","serment","siege"],
    T:["tour","templier","trone","tribut"],
    V:["vassal","vitrail","vicomte"],},
  technologie:{

    A:["algorithme","api","application","arduino","artificial intelligence","authentification","automatisation","antivirus","ascii","accelerateur"],
    B:["bluetooth","blockchain","base de donnees","binaire","bug","bande passante","bootloader"],
    C:["cloud","code","cpu","crypto","compilation","cybersecurite","compilateur","capteur","cryptographie"],
    D:["donnees","drone","debug","data","digital","disque dur"],
    E:["encryption","email","ethernet","electronique"],
    F:["firewall","fibre optique","framework"],
    G:["gps","gpu","github","graphique"],
    H:["hack","html","http","hardware"],
    I:["interface","intelligence artificielle","internet","inteligence artificielle"],
    J:["javascript","java"],
    K:["kotlin","kubernetes","kernel"],
    L:["linux","logiciel","langage"],
    M:["machine learning","microprocesseur","mongodb","megadonnees","memoire"],
    N:["navigation","network","nuage","numerique"],
    O:["open source","ordinateur"],
    P:["python","pixel","protocole","programmation","processeur"],
    R:["reseaux","reactjs","ram","robotique","resolution"],
    S:["serveur","smartphone","sql","systeme","streaming"],
    T:["technologie","terminal","transistor","traitement"],
    V:["virtual reality","virus","virtualisation"],},
  danse:{

    A:["adagio","arabesque","allegro","avant scene","afrobeat"],
    B:["ballet","bolero","breakdance","battement","barre","burlesque"],
    C:["cha cha","charleston","contemporaine","choreographie","cabaret","capoeira","cossack","country"],
    D:["disco","danse classique","danse moderne","danse africaine","danzon"],
    E:["entrechat","expression corporelle"],
    F:["flamenco","foxtrot","funk","fandango"],
    G:["glissade","gigue"],
    H:["hip hop","hula","hora"],
    I:["improvisation"],
    J:["jazz","jive"],
    K:["kizomba","kathak","kuduro"],
    L:["lindy hop","lambada","locking","leg warmers"],
    M:["mazurka","merengue","modern jazz","moonwalk","mouvements"],
    N:["neofolk","neosoul","ndombolo"],
    O:["oriental"],
    P:["paso doble","pirouette","pointe","popping","polka"],
    R:["reggaeton","rumba","rock"],
    S:["salsa","samba","swing","step","shuffle"],
    T:["tango","tap dance","tchoukball","tutting","twist"],
    V:["valse","voguing","vogue"],},
  architecture:{

    A:["arcade","arc boutant","abside","acrotere","atrium","avant corps","agora","appartement","arche","aretes"],
    B:["basilique","beffroi","beton","boiserie","balcon","baroque","bunker"],
    C:["chapelle","cloitre","coupole","cour","colonnade","corniche","creneau","colonne","cathedrale","chateau"],
    D:["dome","donjon","dallage","decor","dentelle"],
    E:["entablement","escalier","eglise"],
    F:["facade","fenetre","fronton","fresque","frise","fortification"],
    G:["gargouille","gothique","gratte ciel"],
    H:["hall","hospice","hotel"],
    I:["immeuble","igloo"],
    J:["jambage"],
    K:["kiosque"],
    L:["loggia","linteau","louvre"],
    M:["meneau","minaret","mansarde","modillon","modernisme"],
    N:["nef","narthex"],
    O:["ogive","obélisque"],
    P:["pilier","porche","podium","palais","portique","pagode"],
    R:["rotonde","rosace","rempart","romanesque"],
    S:["stupa","salle","soubassement","sanctuaire"],
    T:["tour","tribune","transept","tympan","temple"],
    U:["urbanisme"],
    V:["vault","voute","vestibule"],},
  sport_star:{

    A:["ali","alcaraz","agassi","anelka","ashe","auger aliassime"],
    B:["bolt","benzema","becker","beckham","bird","best","buffon","biles"],
    C:["cristiano","curry","cantona","carlos","cassius clay","clemson"],
    D:["djokovic","durant","deschamps","drogba","di stefano"],
    E:["eusebio","eto o"],
    F:["federer","figo"],
    G:["griezmann","gasquet","guardiola","grace"],
    H:["hamilton","henry","hatton","hamm"],
    I:["ibrahimovic"],
    J:["james lebron","jordan","jorginho","james"],
    K:["kylian","kobe","kante"],
    L:["lebron","lin","lewis","lewandowski"],
    M:["messi","mayweather","maldini","maradona","mourinho"],
    N:["nadal","neymar"],
    O:["owen","okoro"],
    P:["pele","pogba","platini"],
    R:["ronaldo","rafael","robinson","robben"],
    S:["schumacher","serena","salah","sneijder"],
    T:["tyson","totti"],
    V:["vieira","van basten","villa"],},
  personnage:{

    A:["anakin","aragorn","alice","astérix","asterix","ariel","aladdin"],
    B:["batman","bond","belle","bambi"],
    C:["cendrillon","captain jack","conan","capitaine haddock"],
    D:["darth vader","dumbledore","dory","don quichotte"],
    E:["elsa","ethan hunt","emma bovary"],
    F:["forrest","frodo","frollo"],
    G:["gandalf","groot","gollum","gaston"],
    H:["harry potter","hermione","hulk","hamlet"],
    I:["ironman"],
    J:["james bond","joker","jean valjean"],
    K:["king kong","katniss"],
    L:["leia","luke","legolas","lolita","lecter"],
    M:["matrice","moana","magneto","merlin"],
    N:["nemo","neo"],
    O:["obelix","ozymandias"],
    P:["potter","padme","pinocchio"],
    R:["rocky","rapunzel","romeo"],
    S:["simba","sherlock","scar","scarlett"],
    T:["thanos","thor","terminator"],
    V:["vaiana","voldemort"],},};

// Build lookup sets for each language
function buildSets(wordDict) {
  const sets = {};
  Object.entries(wordDict).forEach(([cat, byLetter]) => {
    sets[cat] = {};
    Object.entries(byLetter).forEach(([letter, words]) => {
      sets[cat][letter] = new Set(words.map(w => normalizeWord(w)));
    });
  });
  return sets;
}

function getSets(lang) {
  if (lang === "en") return VALID_SETS_EN;
  return VALID_SETS;
}


const VALID_WORDS_EN = {
  prenom:{
    A:["aaron","abby","abel","abigail","adam","adele","adrian","adriana","aiden","alan","alex","alexa","alexander","alexia","alice","alicia","alison","allison","amber","amelia","amy","andrew","andy","angela","anna","anne","anthony","ashley","austin","alyssa","april","aria","ariana","ariel","audrey","autumn","avery"],
    B:["barbara","benjamin","bethany","bianca","bobby","brandon","brian","brittany","brooke","bryan","brianna","beatrice","bella","blake","bonnie","brady","brantley","brayden","brenda","brett","bridget","britney","brock","brodie","brooklyn"],
    C:["caleb","cameron","chloe","christian","christopher","claire","cole","connie","cora","crystal","cynthia","callie","camille","caroline","carter","cassandra","cassidy","chad","charlie","chase","chelsea","chester","cody","colby","colin","colleen","conner","cooper","courtney"],
    D:["dakota","daniel","danielle","david","dawn","deborah","diana","dominic","donna","dylan","daisy","dallas","dalton","damian","damon","danika","daphne","darcy","darlene","darren","dawson","deanna","delaney","demi","denise","destiny","devlin","devin","dixie","dominique","donovan","dorian","dorothy","douglas","drew"],
    E:["eleanor","elizabeth","ella","emily","emma","eric","ethan","evan","evelyn","edgar","edith","elena","eli","elias","elijah","elise","eliza","ellie","elsie","emerson","emery","emilia","emilio","emmy","erica","erin","esther","eugenia"],
    F:["faith","fiona","frank","freddie","farrah","felix","finley","finn","flora","florence","floyd","frances","francesca","fredrick","freya"],
    G:["gabriel","george","georgia","grace","grant","gregory","gabrielle","gavin","gemma","gianna","gideon","gillian","gina","giovanna","giselle","glen","gloria","gordon","graham","grayson","guinevere","gunnar","gustavo","gwen"],
    H:["hailey","hannah","henry","holly","hunter","hadley","harley","harmony","harriet","hazel","heather","heidi","helen","hilary","holden","hope","houston","hudson","hugo","humphrey"],
    I:["ian","isabella","ivy","ignacio","iliana","imogen","india","ingrid","iris","irving","isabel","isadora","isaiah"],
    J:["jack","jackson","jacob","jake","james","jane","jason","jennifer","jessica","john","jonathan","jordan","joseph","julia","justin","jacinta","jasmine","jayden","jean","jenna","jerome","joel","johanna","jonah","jose","josie","joyce","julian","juliet","june"],
    K:["karen","kate","katherine","kaylee","kelly","kevin","kimberly","kylie","kai","kaley","kara","karla","katelyn","katrina","kayla","keira","keisha","kelsey","kendall","kendra","kenley","kennedy","kieran","kim","king"],
    L:["laura","lauren","leah","liam","lily","lisa","logan","lucy","luke","laila","lance","lane","latoya","leandra","leon","leticia","lewis","lia","lila","lincoln","lindsey","linnea","liza","lola","lora","lorena","lori","lorraine","lou","louisa","luc","lucia","lydia","lyric"],
    M:["madeleine","madison","margaret","mark","mary","matthew","michael","michelle","mike","molly","morgan","mabel","macy","mae","malachi","malcolm","malia","marcella","marco","marcos","marilyn","mario","marlene","marquise","mason","matilda","max","maxwell","maya","megan","melanie","melissa","mia","miles","miranda","miriam","mitchell","monica"],
    N:["natalie","nathan","nicholas","nicole","noah","nora","nancy","naomi","nathalie","neil","nelson","nerissa","nina","noelle","nolan"],
    O:["olivia","owen","ocean","octavia","odessa","olive","omar","orion","oscar","oswald"],
    P:["pamela","patrick","paul","peter","phillip","paige","paloma","parker","paula","penny","peyton","phoebe","pierce","pippa","porter","pressley","presley","priya"],
    Q:["quinn","quentin","queen"],
    R:["rachel","rebecca","richard","robert","ryan","rafferty","raina","ramona","rand","raven","ray","raymond","reagan","reed","reese","reid","remi","rhett","rhiannon","riley","rita","robyn","roman","rosa","roxanne","ruby","ruth"],
    S:["samantha","sarah","scott","sean","sierra","sophia","stephanie","steven","susan","sabrina","sage","saige","sandy","sara","savannah","scarlett","selena","selina","serenity","seth","sienna","simon","skai","skylar","sloane","stella","summer","sydney"],
    T:["taylor","thomas","timothy","tiffany","tyler","talia","tamara","tara","tatum","tess","theo","tia","tobias","toby","tonya","travis","trevor","trey","trinity","tristan","troy"],
    U:["ulysses","ursula","uma","unity"],
    V:["vanessa","victor","victoria","violet","valentina","valeria","valerie","venice","venus","veronica","vince","virginia","vivian","vladislav"],
    W:["william","wyatt","wade","wanda","warren","waverly","wendy","wes","weston","whitney","will","willow","winston","wren"],
    X:["xavier","xena","xiomara"],
    Y:["yara","yasmine","yolanda","yosef"],
    Z:["zachary","zoe","zayne","zelda","zion"]
  },
  pays:{

    A:["afghanistan","albania","algeria","andorra","angola","argentina","armenia","australia","austria","azerbaijan"],
    B:["bahamas","bahrain","bangladesh","barbados","belgium","belize","benin","bhutan","bolivia","bosnia","botswana","brazil","brunei","bulgaria","burkina faso","burundi"],
    C:["cambodia","cameroon","canada","cape verde","central african republic","chad","chile","china","colombia","comoros","congo","costa rica","croatia","cuba","cyprus"],
    D:["denmark","djibouti","dominica"],
    E:["ecuador","egypt","el salvador","eritrea","estonia","ethiopia"],
    F:["fiji","finland","france"],
    G:["gabon","gambia","georgia","germany","ghana","greece","grenada","guatemala","guinea","guyana"],
    H:["haiti","honduras","hungary"],
    I:["india","indonesia","iran","iraq","ireland","israel","italy"],
    J:["jamaica","japan","jordan"],
    K:["kazakhstan","kenya","kiribati","kuwait","kyrgyzstan"],
    L:["laos","latvia","lebanon","lesotho","liberia","libya","liechtenstein","lithuania","luxembourg"],
    M:["madagascar","malawi","malaysia","maldives","mali","malta","mauritania","mauritius","mexico","moldova","monaco","mongolia","montenegro","mozambique","myanmar"],
    N:["namibia","nauru","nepal","netherlands","nicaragua","niger","nigeria","norway","new zealand"],
    P:["pakistan","palau","palestine","panama","papua new guinea","paraguay","peru","philippines","poland","portugal"],
    R:["romania","russia","rwanda"],
    S:["samoa","saudi arabia","senegal","serbia","seychelles","sierra leone","singapore","slovakia","slovenia","somalia","south africa","spain","sri lanka","sudan","sweden","switzerland","syria"],
    T:["taiwan","tanzania","thailand","togo","tonga","trinidad","tunisia","turkey","turkmenistan"],
    U:["ukraine","united kingdom","united states","uruguay","uzbekistan"],
    V:["vanuatu","venezuela","vietnam"],
    Z:["zambia","zimbabwe"]
  },
  ville:{

    A:["amsterdam","athens","atlanta","austin","adelaide","algiers","ankara","abu dhabi","accra","addis ababa","alexandria","amman","antananarivo","asmara","astana","asuncion","auckland"],
    B:["barcelona","beijing","berlin","bogota","boston","brussels","budapest","buenos aires","baghdad","bangalore","bangkok","banjul","beirut","belo horizonte","birmingham","bishkek","bissau","blantyre","bratislava","brisbane","bristol","brno","bruges","bujumbura","bursa"],
    C:["cairo","calcutta","cape town","caracas","casablanca","chicago","colombo","copenhagen","calgary","canberra","cardiff","cebu","chandigarh","chengdu","chiang mai","chisinau","chittagong","christchurch","cologne"],
    D:["dakar","delhi","dhaka","doha","dubai","dublin","dallas","dar es salaam","denver","detroit","djakarta","djibouti","dodoma","dongguan","dortmund","dushanbe","durban"],
    E:["edinburgh","eindhoven"],
    F:["florence","frankfurt","freetown","fukuoka","fez"],
    G:["geneva","glasgow","guangzhou","guadalajara","gothenburg","guayaquil"],
    H:["hamburg","hanoi","harare","havana","helsinki","hong kong","houston","hyderabad","haifa"],
    I:["istanbul","islamabad"],
    J:["jakarta","jerusalem","johannesburg","jeddah"],
    K:["kabul","kampala","karachi","kathmandu","khartoum","kigali","kingston","kinshasa","kuala lumpur","kiev"],
    L:["lagos","lima","lisbon","london","los angeles","la paz","lahore","libreville","lome","luanda","lusaka","luxemburg"],
    M:["madrid","manila","marseille","medellin","milan","minsk","mogadishu","monrovia","montevideo","montreal","moscow","mumbai","munich"],
    N:["nairobi","nassau","niamey","new york","new delhi","nouakchott","naples"],
    O:["oslo","ottawa","osaka","ouagadougou"],
    P:["paris","phnom penh","prague","pretoria","panama city","palermo","porto"],
    Q:["quito","quezon city"],
    R:["rabat","reykjavik","riga","riyadh","rio de janeiro","rome","rotterdam","rangoon"],
    S:["santiago","sao paulo","sarajevo","seattle","seoul","shanghai","singapore","sofia","stockholm","sydney","salt lake city","san francisco","santo domingo"],
    T:["taipei","tashkent","tbilisi","tegucigalpa","tehran","tokyo","toronto","tripoli","tunis","tallinn"],
    U:["ulaanbaatar","utrecht"],
    V:["vancouver","vienna","vilnius","vladivostok","valencia"],
    W:["warsaw","washington","windhoek","wellington","wuhan"],
    X:["xian","xiamen"],
    Y:["yangon","yaounde","yerevan","yokohama"],
    Z:["zurich","zagreb","zanzibar"]
  },
  animal:{

    A:["aardvark","albatross","alligator","alpaca","anaconda","anemone","ant","antelope","ape","armadillo","axolotl"],
    B:["baboon","badger","barracuda","bat","bear","beaver","bee","bison","boa","bull","butterfly"],
    C:["caiman","camel","canary","capybara","cat","chameleon","cheetah","chimpanzee","chinchilla","clownfish","cobra","cod","condor","cormorant","cougar","coyote","crab","crane","crow","cuckoo","cuttlefish"],
    D:["deer","dolphin","donkey","dragonfly","duck","dugong"],
    E:["eagle","eel","elephant","elk","emu"],
    F:["falcon","ferret","flamingo","fox","frog"],
    G:["gazelle","gecko","giraffe","gnu","goat","gorilla","grasshopper","grizzly"],
    H:["hamster","hare","hawk","hedgehog","heron","hippopotamus","hornet","horse","hummingbird","hyena"],
    I:["ibis","iguana","impala"],
    J:["jaguar","jellyfish"],
    K:["kangaroo","kingfisher","koala","komodo"],
    L:["lemur","leopard","lion","lizard","llama","lobster","lynx"],
    M:["manatee","mandrill","manta ray","mongoose","monkey","moose","mole","mosquito","mouse","muskrat"],
    N:["narwhal","nightingale"],
    O:["octopus","ocelot","okapi","orangutan","orca","ostrich","otter","owl"],
    P:["panda","panther","parrot","peacock","pelican","penguin","pig","piranha","platypus","porcupine","python"],
    R:["rabbit","raccoon","rattlesnake","raven","rhinoceros","robin"],
    S:["salamander","salmon","sardine","scorpion","seahorse","seal","shark","shrimp","sloth","snail","snake","sparrow","spider","squid","stork","swan"],
    T:["tiger","toad","toucan","turtle"],
    V:["vulture"],
    W:["walrus","wasp","whale","wolf","woodpecker"],
    Z:["zebra"]
  },
  fruit:{

    A:["almond","apple","apricot","artichoke","asparagus","avocado"],
    B:["banana","basil","bean","beet","blackberry","blueberry","broccoli","brussels sprout"],
    C:["cabbage","carrot","cashew","cauliflower","celery","cherry","chestnut","chickpea","chili","cinnamon","clementine","coconut","corn","courgette","cucumber","currant"],
    D:["date","dill"],
    E:["eggplant","endive"],
    F:["fennel","fig"],
    G:["garlic","ginger","gooseberry","grape","grapefruit","guava"],
    H:["hazel","hibiscus"],
    I:["iceberg"],
    J:["jackfruit","jalapeno"],
    K:["kale","kiwi","kumquat"],
    L:["leek","lemon","lettuce","lime","lychee"],
    M:["mango","melon","mint","mushroom","mustard"],
    N:["nectarine","nut","nutmeg"],
    O:["olive","onion","orange"],
    P:["papaya","parsley","passion fruit","peach","pear","pepper","pineapple","plum","pomegranate","potato","pumpkin"],
    R:["radish","raisin","raspberry","rhubarb","rosemary"],
    S:["sage","spinach","strawberry","sunflower"],
    T:["tamarind","thyme","tomato","truffle","turnip"],
    V:["vanilla"],
    W:["walnut","watermelon"],
    Z:["zucchini"]
  },
  metier:{

    A:["accountant","actor","acrobat","acupuncturist","administrator","agronomist","analyst","anesthesiologist","animator","anthropologist","archaeologist","architect","archivist","artist","astronaut","astronomer","attorney","auditor","author"],
    B:["baker","banker","biologist","blacksmith","bodyguard","botanist","boxer","brewer","broker","builder","butcher"],
    C:["carpenter","cartographer","chef","chemist","cinematographer","clown","coach","comedian","composer","consultant","cook","counselor","curator","customs officer"],
    D:["dancer","decorator","dentist","designer","detective","developer","dietitian","diplomat","director","diver","doctor","driver"],
    E:["ecologist","economist","editor","electrician","engineer","entrepreneur","explorer","evangelist"],
    F:["farmer","firefighter","fisherman","florist","footballer","forester","forger","forensic scientist"],
    G:["gardener","geologist","geophysicist","glassblower","goldsmith","graphic designer","guide"],
    H:["historian","horticulturist","hotelier","hydraulic engineer"],
    I:["illustrator","immunologist","informatician","inspector","inventor"],
    J:["jeweler","journalist","judge","jurist"],
    K:["kinesiologist"],
    L:["lawyer","librarian","linguist","locksmith","logistician","luthier"],
    M:["magician","manager","marine biologist","mathematician","mechanic","medic","meteorologist","midwife","military","musician","mason"],
    N:["navigator","neurologist","notary","nutritionist"],
    O:["optician","orthopedist","osteopath"],
    P:["painter","pediatrician","pharmacist","photographer","physicist","pilot","plumber","poet","police officer","politician","priest","programmer","professor","psychiatrist","psychologist","pastry chef"],
    R:["radiologist","reporter","researcher","restaurateur"],
    S:["sailor","sculptor","secretary","singer","sociologist","soldier","sommelier","stylist","surgeon","surveyor"],
    T:["taxidermist","teacher","technician","therapist","translator","truck driver"],
    V:["veterinarian","videographer","violinist","viticulturist"],
    W:["waiter","welder","writer"]
  },
  celebrite:{

    A:["albert einstein","alexander the great","alfred hitchcock","amelia earhart","andy warhol","aristotle","arnold schwarzenegger","audrey hepburn","augustine"],
    B:["beethoven","beyonce","bill gates","bob dylan","bob marley","brad pitt","bruce lee","buster keaton","bach","balzac","baudelaire"],
    C:["charlie chaplin","chris rock","christopher columbus","cleopatra","cristiano ronaldo","celine dion"],
    D:["david bowie","david beckham","darwin","descartes","drake","da vinci"],
    E:["einstein","elon musk","elvis presley","eminem","erasmus","ernest hemingway"],
    F:["frank sinatra","freddie mercury","frida kahlo","florence nightingale"],
    G:["galileo","gandhi","george washington","george clooney","goethe","grace kelly"],
    H:["harry styles","halle berry","hemingway","henry ford","hitler","homer","hugo"],
    I:["isaac newton","isabelle adjani"],
    J:["james dean","jennifer lopez","jimi hendrix","john lennon","johnny depp","julius caesar"],
    K:["kanye west","keanu reeves","kim kardashian","kobe bryant","kafka","kant"],
    L:["lady gaga","lebron james","leonardo da vinci","leonardo dicaprio","lincoln","lorca"],
    M:["madonna","mahatma gandhi","mandela","mao zedong","marie curie","marilyn monroe","marlon brando","marx","michael jackson","michelangelo","moliere","mozart"],
    N:["napoleon","natalie portman","nelson mandela","newton","nietzsche","nicki minaj"],
    O:["obama","oprah winfrey"],
    P:["pablo picasso","pharrell williams","plato","prince","proust"],
    R:["rembrandt","rihanna","robin williams","roger federer","ronaldo","rousseau","rubens"],
    S:["salvador dali","serena williams","shakespeare","shakira","socrates","steve jobs","stromae"],
    T:["taylor swift","tolkien","tolstoy","tom hanks","tupac","tyson"],
    V:["venus williams","victor hugo","voltaire"],
    W:["walt disney","winston churchill","warhol"],
    Z:["zidane","zola"]
  },
  sport:{

    A:["acrobatics","aerobics","agility","aikido","alpine skiing","archery","athletics"],
    B:["badminton","baseball","basketball","beach volleyball","biathlon","billiards","bmx","bobsled","bodybuilding","bowling","boxing","breakdancing"],
    C:["canoeing","cheerleading","cricket","crossfit","curling","cycling"],
    D:["darts","decathlon","discus","diving","dodgeball"],
    E:["endurance","equestrian","escalade"],
    F:["fencing","fitness","floorball","football","freestyle skiing","full contact"],
    G:["golf","gymnastics"],
    H:["handball","hammer throw","high jump","hockey","horse racing","hurling","hurdles"],
    I:["ice hockey","indoor soccer"],
    J:["javelin","jiu jitsu","jogging","judo","jumping"],
    K:["karate","kayaking","kendo","kickboxing","kitesurfing"],
    L:["lacrosse","luge"],
    M:["marathon","mixed martial arts","motocross","mountain biking","muay thai"],
    N:["nordic skiing","netball"],
    O:["orienteering","open water swimming"],
    P:["paddle","paintball","parachuting","parkour","pole vault","polo"],
    R:["rafting","rallying","roller derby","rowing","rugby","running"],
    S:["sailing","skateboarding","skiing","skydiving","snowboarding","soccer","softball","squash","surfing","swimming"],
    T:["table tennis","taekwondo","tennis","track and field","triathlon","trampolining"],
    V:["volleyball"],
    W:["wakeboarding","water polo","weightlifting","wrestling"],},
  objet:{

    A:["alarm","album","anchor","antenna","anvil","armchair","astrolabe"],
    B:["backpack","bag","balance","ball","barrel","basket","battery","bell","blanket","book","bottle","box","bracelet","brush","bucket","bulb"],
    C:["cabinet","cage","calendar","camera","candle","carpet","chain","chair","clock","coat","comb","compass","computer","cup","curtain"],
    D:["desk","dial","dictionary","door","drawer","drum"],
    E:["envelope","eraser"],
    F:["fan","fork","frame","funnel","fridge","flashlight"],
    G:["glasses","glove","globe","guitar"],
    H:["hammer","handbag","helmet","hook","horn","hourglass"],
    I:["iron"],
    J:["jar","journal"],
    K:["kettle","key","knife"],
    L:["lamp","lantern","ladle","lens","lighter","lock"],
    M:["magnifier","mask","matches","mattress","mirror","mug"],
    N:["notebook","needle"],
    P:["pen","pencil","phone","pillow","plate","plug","poster","printer","purse"],
    R:["radio","razor","ruler"],
    S:["scissors","screwdriver","shield","sink","sofa","spoon","stapler","suitcase","sword"],
    T:["table","telescope","thermometer","ticket","torch","toothbrush"],
    U:["umbrella","urn"],
    V:["vase"],
    W:["wallet","watch","wheel"],},
  film:{

    A:["alien","amadeus","amelie","apocalypse now","avatar","avengers","a beautiful mind","arrival"],
    B:["bambi","batman","blade runner","braveheart","brazil","breakfast at tiffanys","black swan","bohemian rhapsody","boyhood"],
    C:["casablanca","chinatown","citizen kane","clockwork orange","coco","crash","captain america"],
    D:["dark knight","dead poets society","die hard","dune","drive","django"],
    E:["et","elysium","enigma"],
    F:["fargo","fight club","finding nemo","forrest gump","full metal jacket"],
    G:["ghostbusters","gladiator","gone with the wind","goodfellas","gravity","grease","green book"],
    H:["harry potter","heat","her","highlander","hugo","hunger games"],
    I:["inception","interstellar"],
    J:["jaws","joker","jurassic park"],
    K:["kill bill","king kong"],
    L:["la la land","lion","lord of the rings"],
    M:["mad max","manhattan","matrix","memento","minority report","moonlight","moulin rouge","mulan"],
    N:["nightcrawler","no country for old men","nope","nomadland","notebook"],
    O:["oldboy"],
    P:["parasite","piano","psycho","pulp fiction","pirates of the caribbean"],
    R:["rain man","raiders of the lost ark","rashomon","rear window","rocky","roma"],
    S:["scarface","schindlers list","seven","shining","silence of the lambs","star wars","shrek","speed"],
    T:["taxi driver","tenet","terminator","the godfather","titanic","thelma and louise"],
    V:["vertigo"],
    W:["whiplash"],},
  marque:{

    A:["adidas","airbnb","airbus","amazon","apple","armani","audi"],
    B:["balenciaga","bbc","benetton","bic","birkenstock","bmw","boeing","bosch","bulgari","burberry"],
    C:["canon","cartier","chanel","chopard","coca cola","columbia","converse"],
    D:["dhl","diesel","dior","disney"],
    E:["electrolux","emirates","epson"],
    F:["facebook","ferrari","fiat","ford","fendi"],
    G:["gap","google","gucci"],
    H:["harley davidson","heineken","hermes","hp","hugo boss","honda"],
    I:["ikea","instagram","intel"],
    J:["jaguar","jordan"],
    K:["kenzo","kia","kleenex"],
    L:["lacoste","lamborghini","lenovo","levis","lexus","lego","louboutin","louis vuitton"],
    M:["mastercard","mercedes","microsoft","moncler","muji","mcdonalds"],
    N:["nestle","netflix","nike","nintendo","nokia"],
    P:["pepsi","peugeot","porsche","prada","paypal","puma"],
    R:["ralph lauren","red bull","reebok","rolex","renault"],
    S:["samsung","sephora","sony","starbucks","supreme","snapchat"],
    T:["tesla","tiffany","tommy hilfiger","toyota","twitter"],
    U:["under armour","uniqlo"],
    V:["versace","volkswagen","vans"],
    Z:["zara"]
  },
  anatomie:{

    A:["abdomen","achilles tendon","aorta","appendix","arm","artery","atlas"],
    B:["backbone","bicep","bladder","blood","bone","brain","breast"],
    C:["capillary","cartilage","cavity","cerebellum","cervix","clavicle","colon","cornea","cortex"],
    D:["deltoid","diaphragm","duodenum"],
    E:["eardrum","elbow","epidermis","esophagus","eyelid"],
    F:["femur","fiber","fibula","finger","forehead"],
    G:["gallbladder","gland","groin"],
    H:["heart","heel","hip","humerus","hymen"],
    I:["intestine","iris"],
    J:["jaw","joint","jugular"],
    K:["kidney","kneecap"],
    L:["larynx","ligament","liver","lobe","lung"],
    M:["membrane","meniscus","mouth","muscle"],
    N:["nail","nerve","nose","nostril"],
    O:["ovary","organ"],
    P:["palm","pancreas","patella","pelvis","pharynx","placenta","prostate","pupil"],
    R:["radius","rectum","retina","rib"],
    S:["sacrum","scapula","shin","sinew","sinus","skeleton","skin","skull","spine","sternum","stomach"],
    T:["tendon","testis","thigh","thorax","tibia","tonsil","trachea"],
    U:["ulna","uterus"],
    V:["vein","vertebra","vocal cord"],
    W:["wrist"],},
  musique:{

    A:["abba","ac dc","adele","aerosmith","amy winehouse","arctic monkeys","asap rocky","aya nakamura"],
    B:["bach","beatles","beyonce","billie eilish","bjork","black sabbath","bob dylan","bob marley","bon jovi","bruce springsteen"],
    C:["cardi b","childish gambino","chris brown","coldplay","coltrane","cypress hill"],
    D:["daft punk","david bowie","dire straits","drake"],
    E:["ed sheeran","elton john","eminem","eric clapton","ella fitzgerald"],
    F:["fleetwood mac","florence and the machine","foo fighters","frank ocean","frank sinatra"],
    G:["george michael","gorillaz","green day","guns n roses"],
    H:["harry styles","hendrix","hans zimmer"],
    I:["imagine dragons","iron maiden"],
    J:["james brown","jamiroquai","jay z","john coltrane","john legend","johnny cash"],
    K:["kanye west","keane","kendrick lamar","kid cudi","khalid"],
    L:["lauryn hill","led zeppelin","leon bridges","lizzo","lorde"],
    M:["madonna","maroon 5","marvin gaye","massive attack","miles davis","muse","mozart","mac miller"],
    N:["nas","nirvana","notorious big"],
    O:["oasis"],
    P:["pearl jam","pink floyd","post malone","prince"],
    R:["radiohead","rage against the machine","red hot chili peppers","rihanna"],
    S:["sam smith","sex pistols","shakira","simple minds","snoop dogg","sting","stromae"],
    T:["talking heads","tame impala","taylor swift","the beatles","the cure","the doors","the police","twenty one pilots"],
    V:["vampire weekend"],
    W:["weeknd"],},
  cuisine:{

    A:["apple pie","asparagus","avocado toast"],
    B:["bacon","bagel","banana bread","barbecue","biryani","burrito","burger"],
    C:["caesar salad","cake","calamari","carbonara","casserole","cheesecake","chicken","chips","chowder","couscous","curry"],
    D:["dumplings","dim sum"],
    E:["eggs","enchilada"],
    F:["falafel","french fries","fish and chips"],
    G:["guacamole","gyoza"],
    H:["hamburger","hot dog","hummus"],
    I:["ice cream"],
    J:["jambalaya"],
    K:["kimchi","kebab"],
    L:["lasagna","lobster"],
    M:["mochi","moussaka","muffin"],
    N:["nachos","noodles"],
    P:["paella","pancakes","pasta","pho","pizza","pudding"],
    R:["ramen","risotto","roast"],
    S:["sashimi","spaghetti","steak","sushi","smoothie"],
    T:["tacos","tapas","tiramisu","toast"],
    W:["waffle","wrap"],},
  vehicule:{

    A:["airplane","ambulance","armored car"],
    B:["bicycle","boat","bus","bulldozer"],
    C:["cable car","camper","canoe","car","caravan","cargo ship","catamaran"],
    D:["dirigible","drone"],
    E:["excavator"],
    F:["ferry","fighter jet","forklift","freighter"],
    G:["go kart","glider"],
    H:["helicopter","hovercraft","hot air balloon"],
    I:["intercity train"],
    J:["jeep","jet","jet ski"],
    K:["kayak"],
    L:["limousine","locomotive"],
    M:["metro","minibus","moped","motorbike","motorcycle"],
    O:["ocean liner"],
    P:["parachute","pick up","plane","police car"],
    R:["rocket","rowboat","raft"],
    S:["scooter","ship","skateboard","submarine","suv","speedboat"],
    T:["tank","taxi","tractor","train","tram","truck"],
    U:["uber"],
    V:["van"],
    W:["watercraft"],},
  capital:{

    A:["abu dhabi","abuja","accra","addis ababa","algiers","amman","andorra la vella","ankara","antananarivo","apia","ashgabat","asuncion","astana","athens","asmara"],
    B:["baghdad","bamako","bangui","banjul","beijing","belgrade","belmopan","berlin","berne","bishkek","bissau","bogota","brasilia","bratislava","brazzaville","bridgetown","brussels","bujumbura","budapest"],
    C:["cairo","canberra","caracas","castries","chisinau","colombo","conakry","copenhagen"],
    D:["dakar","dhaka","dili","djibouti","dodoma","doha","douglas"],
    E:["edinburgh"],
    F:["freetown","funafuti"],
    G:["gaborone","georgetown","guatemala city"],
    H:["harare","havana","helsinki","honiara"],
    I:["islamabad"],
    J:["jakarta","jamestown","jerusalem"],
    K:["kabul","kampala","kathmandu","khartoum","kigali","kingston","kinshasa","kuala lumpur","kiev"],
    L:["la paz","libreville","lilongwe","lima","lisbon","lome","london","luanda","lusaka"],
    M:["madrid","male","managua","manila","maputo","maseru","mbabane","minsk","mogadishu","monrovia","montevideo","moroni","moscow","muscat"],
    N:["nairobi","nassau","naypyidaw","niamey","nicosia","ndjamena","new delhi","nukualofa"],
    O:["oslo","ottawa"],
    P:["palikir","panama city","paris","phnom penh","port au prince","port moresby","porto novo","prague","pretoria"],
    Q:["quito"],
    R:["rabat","reykjavik","riga","riyadh","rome"],
    S:["san jose","santiago","santo domingo","sao tome","sarajevo","seoul","singapore","skopje","sofia","stockholm","suva"],
    T:["taipei","tashkent","tbilisi","tegucigalpa","tehran","thimphu","tirana","tokyo","tripoli","tunis","tallinn"],
    V:["vaduz","valletta","vienna","vilnius"],
    W:["warsaw","washington","windhoek"],
    Y:["yangon","yaounde","yerevan"],},
  monument:{

    A:["acropolis","alhambra","angkor wat","arc de triomphe","arena di verona"],
    B:["big ben","borobudur","burj khalifa","buckingham palace"],
    C:["chichen itza","christ the redeemer","colosseum","church of the holy sepulchre"],
    E:["easter island","eiffel tower","empire state building"],
    F:["forbidden city"],
    G:["golden gate bridge","grand canyon","great pyramid","great wall of china"],
    H:["hagia sofia","hanging gardens"],
    K:["kaaba","kremlin"],
    L:["leaning tower of pisa","louvre"],
    M:["machu picchu","mont saint michel"],
    N:["notre dame","niagara falls"],
    P:["parthenon","petra","pyramids"],
    R:["red fort","reichstag"],
    S:["sagrada familia","sistine chapel","sphinx","statue of liberty","stonehenge"],
    T:["taj mahal"],
    V:["vatican"],
    W:["white house"],},
  langue:{

    A:["afrikaans","albanian","amharic","arabic","armenian"],
    B:["basque","belarusian","bengali","bosnian","breton","bulgarian","burmese"],
    C:["cantonese","catalan","chinese","croatian"],
    D:["danish","dari","dutch"],
    E:["english","esperanto","estonian"],
    F:["faroese","farsi","filipino","finnish","flemish","french","frisian"],
    G:["gaelic","galician","georgian","german","greek","guarani","gujarati"],
    H:["hausa","hebrew","hindi","hungarian"],
    I:["icelandic","igbo","indonesian","italian"],
    J:["japanese","javanese"],
    K:["kazakh","khmer","kinyarwanda","korean","kurdish","kyrgyz"],
    L:["latvian","latin","lithuanian"],
    M:["macedonian","malagasy","malay","maltese","mandarin","marathi","mongolian"],
    N:["nepali","norwegian"],
    P:["pashto","persian","polish","portuguese","punjabi"],
    R:["romanian","russian"],
    S:["serbian","sinhala","slovak","slovenian","somali","spanish","swahili","swedish"],
    T:["tamil","telugu","thai","tibetan","turkish","twi"],
    U:["ukrainian","urdu","uzbek"],
    V:["vietnamese"],
    W:["welsh"],
    Y:["yoruba"],},
  instrument:{

    A:["accordion","alpine horn"],
    B:["bagpipe","banjo","bass","bassoon","berimbau","bongo","bouzouki","bugle"],
    C:["castanets","cello","clarinet","clavichord","congas","cornet","cymbal"],
    D:["didgeridoo","djembe","double bass","drum","dulcimer"],
    E:["electric guitar"],
    F:["fiddle","flute"],
    G:["gamelan","guitar","gong","glockenspiel"],
    H:["harmonica","harmonium","harp","harpsichord","horn"],
    I:["irish flute"],
    K:["kalimba","kazoo","koto"],
    L:["lute","lyre"],
    M:["mandolin","marimba","melodica"],
    O:["oboe","organ"],
    P:["pan flute","piano","piccolo","pipe organ"],
    R:["recorder","rubab"],
    S:["saxophone","sitar","snare drum","steel drum","synthesizer"],
    T:["tabla","theremin","trombone","trumpet","tuba","triangle","tambourine"],
    U:["ukulele"],
    V:["vibraphone","viola","violin"],
    X:["xylophone"],
    Z:["zither"]
  },
  vetement:{

    A:["apron"],
    B:["bikini","blazer","blouse","boots","bow tie","bra","briefs"],
    C:["cape","cardigan","coat","corset","cravat"],
    D:["dress","denim"],
    E:["earring"],
    F:["fur coat"],
    G:["gloves"],
    H:["hat","hoodie","hijab"],
    J:["jacket","jeans"],
    K:["kaftan","kilt","kimono"],
    L:["leggings","linen"],
    M:["miniskirt","mittens","moccasins"],
    N:["niqab"],
    O:["overalls","overcoat"],
    P:["pants","parka","polo","poncho","pullover","pyjamas"],
    R:["raincoat","robe"],
    S:["sandals","sarong","scarf","shirt","shorts","skirt","sneakers","socks","suit","swimsuit","sweater"],
    T:["tights","top","trench coat","trousers","tuxedo"],
    U:["uniform"],
    V:["vest","veil"],
    W:["waistcoat"],},
  emotion:{

    A:["admiration","adoration","affection","agony","aggression","ambivalence","anger","anguish","anxiety","apathy","awe"],
    B:["bitterness","bliss","boredom","bravery"],
    C:["calmness","compassion","confidence","confusion","contempt","contentment","courage","cruelty","curiosity"],
    D:["delight","depression","desire","despair","disappointment","disgust","distress","doubt","dread"],
    E:["ecstasy","embarrassment","empathy","enthusiasm","envy","euphoria","excitement"],
    F:["fear","frustration","fury"],
    G:["gratitude","grief","guilt"],
    H:["happiness","hatred","horror","humility","hope"],
    I:["indignation","insecurity"],
    J:["jealousy","joy"],
    L:["loneliness","longing","love"],
    M:["melancholy","misery"],
    N:["nostalgia","nervousness"],
    P:["panic","passion","peace","pity","pride"],
    R:["rage","regret","relief","resentment"],
    S:["sadness","serenity","shame","shock","sorrow","sympathy","surprise"],
    T:["terror","tenderness","trust"],
    V:["vanity","vulnerability"],
    W:["wonder","wrath"],},
  mythologie:{

    A:["achilles","acheron","agamemnon","ajax","amphitrite","andromeda","antaeus","aphrodite","apollo","ares","argonauts","ariadne","artemis","asclepius","atlas"],
    B:["bacchus","bellerophon"],
    C:["calypso","cassandra","cerberus","chimera","circe","clytemnestra","cronos","cyclops"],
    D:["daedalus","diana","dionysus"],
    E:["echo","electra","eros","eurydice"],
    G:["gaia","gorgons"],
    H:["hades","helen","helios","hephaestus","hera","heracles","hercules","hermes","hestia","hydra","hyperion","hypnos"],
    I:["icarus","iris"],
    J:["jason","juno","jupiter"],
    K:["kronos"],
    L:["labyrinth","laocoon","lethe"],
    M:["mars","medusa","midas","minerva","minotaur","morpheus","muses","mercury","medea"],
    N:["narcissus","neptune","nike","nymphs"],
    O:["odyssey","olympus","oracle","orpheus"],
    P:["pandora","paris","pegasus","penelope","persephone","perseus","pluto","poseidon","prometheus"],
    R:["romulus"],
    S:["saturn","sirens","sisyphus","sphinx","styx"],
    T:["theseus","themis","titans","triton","typhon"],
    U:["ulysses"],
    V:["venus","vulcan"],
    Z:["zeus"]
  },
  espace:{

    A:["asteroid","astronaut","astronomy","atmosphere","aurora"],
    B:["big bang","black hole","binary star"],
    C:["comet","constellation","cosmos","crater"],
    E:["eclipse","exoplanet","event horizon"],
    G:["galaxy","gravity","gas giant"],
    I:["iss"],
    J:["jupiter"],
    K:["kepler"],
    L:["lunar eclipse","light year"],
    M:["mars","meteor","milky way","moon"],
    N:["nebula","neutron star","nasa"],
    O:["orbit"],
    P:["planet","pluto","pulsar"],
    R:["rocket","rover"],
    S:["satellite","saturn","solar system","space","star","supernova","sun"],
    T:["telescope"],
    U:["universe","uranus"],
    V:["venus"],
    W:["wormhole"],},
  oceane:{

    A:["abyss","algae","anchovy","anemone","atoll"],
    B:["barracuda","barnacle","beluga","blue whale"],
    C:["clam","clownfish","coral","coral reef","crab","crayfish"],
    D:["dolphin","dugong"],
    E:["eel"],
    F:["flatfish","flounder"],
    G:["grouper"],
    H:["haddock","herring","horseshoe crab"],
    I:["ichthyology"],
    J:["jellyfish"],
    K:["kelp","krill"],
    L:["lionfish","lobster","limpet"],
    M:["manatee","manta ray","marlin","mussel"],
    N:["narwhal","nautilus"],
    O:["octopus","orca","oyster"],
    P:["pelican","penguin","piranha","plankton","pufferfish"],
    R:["ray","reef","reef shark"],
    S:["salmon","sardine","seahorse","seal","seaweed","shark","shrimp","squid","starfish"],
    T:["tuna","turtle"],
    U:["urchin"],
    V:["viper fish"],
    W:["walrus","whale"],},
  medievale:{

    A:["abbey","alchemy","armor","arbalest","armory"],
    B:["ballista","banner","barricade","battering ram","blacksmith"],
    C:["castle","cathedral","catapult","chain mail","chivalry","chronicle","crusade"],
    D:["dragon","dubbing","drawbridge","dungeon"],
    E:["emblem","esquire","excalibur"],
    F:["feast","feudalism","fief","fortress"],
    G:["garrison","goblin","great hall","guild"],
    H:["heraldry","herald","homage"],
    I:["iron forge"],
    J:["joan of arc","jousting"],
    K:["keep","king","knight"],
    L:["lance","longbow"],
    M:["manor","merlin","moat","monastery","monk"],
    N:["nobleman","nun"],
    P:["page","parchment","pilgrimage","portcullis"],
    Q:["quill"],
    R:["relic","rampart"],
    S:["scroll","serf","shield","siege","squire","sword"],
    T:["templar","throne","tournament","trebuchet"],
    V:["vassal","vault"],
    W:["watchtower","warlord"],},
  technologie:{

    A:["algorithm","android","antivirus","api","app","artificial intelligence","ascii","automation"],
    B:["bandwidth","binary","bitcoin","blockchain","bluetooth","bug"],
    C:["chatbot","chip","cloud","code","compiler","cpu","cybersecurity","cryptocurrency"],
    D:["data","database","debug","digital","disk","drone"],
    E:["email","encryption","ethernet"],
    F:["firewall","framework"],
    G:["github","gps","gpu","graphics"],
    H:["hacking","hardware","html","http"],
    I:["internet","interface","ios"],
    J:["java","javascript"],
    K:["kernel","kubernetes"],
    L:["linux"],
    M:["machine learning","memory","microchip","monitor","motherboard"],
    N:["network","neural network"],
    O:["open source","operating system"],
    P:["pixel","processor","programming","protocol","python"],
    R:["ram","robot","router"],
    S:["server","silicon","smartphone","software","streaming"],
    T:["terminal","transistor"],
    U:["usb"],
    V:["virtual reality","virus"],
    W:["wifi","web","website"],},
  danse:{

    A:["adagio","arabesque","afrobeat"],
    B:["ballet","ballroom","bolero","breakdance"],
    C:["cha cha","charleston","contemporary","capoeira","cabaret"],
    D:["disco"],
    F:["flamenco","foxtrot","funk"],
    G:["gigue"],
    H:["hip hop","hula"],
    I:["improvisation"],
    J:["jazz","jive"],
    K:["kizomba","kuduro"],
    L:["lambada","lindy hop","locking"],
    M:["mazurka","merengue","modern dance","moonwalk"],
    P:["paso doble","pirouette","popping","polka"],
    R:["reggaeton","rock","rumba"],
    S:["salsa","samba","shuffle","step","swing"],
    T:["tango","tap dance","twist"],
    V:["vogue"],
    W:["waacking","waltz"],},
  architecture:{

    A:["abbey","amphitheater","arcade","arch","atrium"],
    B:["balcony","baroque","basilica","bunker"],
    C:["castle","cathedral","chapel","cloister","column","courtyard"],
    D:["dome","dungeon"],
    E:["escalator"],
    G:["gargoyle","gothic","glass tower"],
    I:["igloo"],
    K:["keep","kiosk"],
    M:["manor","mansion","minaret","modernism"],
    N:["nave"],
    P:["pagoda","palace","pillar","portal","portico"],
    R:["romanesque","rotunda","rampart"],
    S:["spire","stupa"],
    T:["temple","tower","transept"],
    V:["vault","vestibule","viaduct"],
    W:["window"],},
  sport_star:{

    A:["agassi","alcaraz","ali","anelka","ashe"],
    B:["beckham","becker","biles","bird","bolt","buffon"],
    C:["cantona","cristiano","curry","carlos","cassius clay"],
    D:["di stefano","djokovic","drogba","durant"],
    E:["eusebio"],
    F:["federer","figo"],
    G:["gasquet","griezmann","guardiola"],
    H:["hamilton","hamm","henry"],
    I:["ibrahimovic"],
    J:["james","jordan"],
    K:["kante","kobe","kylian"],
    L:["lebron","lewis","lewandowski"],
    M:["maldini","maradona","mayweather","messi","mourinho"],
    N:["nadal","neymar"],
    P:["pele","platini","pogba"],
    R:["robben","ronaldo"],
    S:["salah","schumacher","serena","sneijder"],
    T:["totti","tyson"],
    V:["van basten","vieira","villa"],
    Z:["zidane"]
  },
  personnage:{

    A:["aladdin","alice","anakin","aragorn","ariel","asterix"],
    B:["bambi","batman","belle"],
    C:["cinderella","captain america","conan"],
    D:["darth vader","don quixote","dory","dumbledore"],
    E:["elsa"],
    F:["forrest","frodo"],
    G:["gandalf","gollum","groot"],
    H:["hamlet","harry potter","hermione","hulk"],
    I:["iron man"],
    J:["james bond","joker","jean valjean"],
    K:["katniss","king kong"],
    L:["leia","legolas","luke"],
    M:["magneto","merlin","moana"],
    N:["nemo","neo"],
    P:["padme","peter pan","pinocchio"],
    R:["rapunzel","rocky","romeo"],
    S:["scarlett","sherlock","simba","snow white"],
    T:["terminator","thanos","thor"],
    V:["voldemort"],
    W:["wolverine"],}
};





// ── Build lookup sets AFTER all dictionaries are declared ──────
const VALID_SETS    = buildSets(VALID_WORDS);
const VALID_SETS_EN = buildSets(VALID_WORDS_EN);

// Fuzzy sets: compact (no spaces) + collapsed (doubles removed) — for tolerant matching
function buildFuzzySets(wordDict) {
  const sets = {};
  Object.entries(wordDict).forEach(([cat, byLetter]) => {
    sets[cat] = {};
    Object.entries(byLetter).forEach(([letter, words]) => {
      const normalized = words.map(w => normalizeWord(w));
      sets[cat][letter] = {
        compact: new Set(normalized.map(w => w.replace(/ /g, ""))),
        collapsed: new Set(normalized.map(w => collapseDoubles(w.replace(/ /g, "")))),
      };
    });
  });
  return sets;
}
const FUZZY_SETS    = buildFuzzySets(VALID_WORDS);
const FUZZY_SETS_EN = buildFuzzySets(VALID_WORDS_EN);

function getFuzzySets(lang) {
  if (lang === "en") return FUZZY_SETS_EN;
  return FUZZY_SETS;
}

// Returns true if the answer is valid for the category + letter
// Tolérant aux accents, tirets et apostrophes — mot complet requis (pas de correspondance partielle)
// ─── VALIDATION INTELLIGENTE ────────────────────────────────────

function looksLikeRealName(norm) {
  if (!norm || norm.length < 2) return false;
  if (norm.length > 25) return false; // trop long pour un prénom
  // Doit contenir au moins une voyelle
  if (!/[aeiouy]/.test(norm)) return false;
  // Pas plus de 3 consonnes consécutives
  if (/[^aeiouy]{4,}/.test(norm)) return false;
  // Pas de chiffres ni caractères spéciaux (hors espace/tiret)
  if (/[0-9@#$%^&*()+=[\]{}|<>]/.test(norm)) return false;
  // Minimum 2 chars
  return true;
}

// Catégories semi-ouvertes (validation phonétique en plus du dico)
const OPEN_CATS = new Set(["prenom","nom","espace","oceane","medievale","danse","architecture","sport_star","personnage"]);

// Returns true if the answer passes via collapsed-doubles only (not exact/compact)
function isApproxAnswer(answer, categoryId, letter, lang) {
  if (!answer?.trim() || !categoryId || !letter) return false;
  const norm = normalizeWord(answer);
  const nc = norm.replace(/ /g, "");
  const sets = getSets(lang);
  const set = sets[categoryId]?.[letter.toUpperCase()];
  if (!set) return false;
  if (set.has(norm)) return false; // exact match — not approximate
  const fset = getFuzzySets(lang)[categoryId]?.[letter.toUpperCase()];
  if (fset?.compact.has(nc)) return false; // compact match — not approximate
  return !!(fset?.collapsed.has(collapseDoubles(nc)));
}

function isValidAnswer(answer, categoryId, letter, lang) {
  if (!answer?.trim()) return false;
  const norm = normalizeWord(answer);
  const normLetter = normalizeWord(letter);
  // Doit commencer par la bonne lettre
  if (!norm.startsWith(normLetter)) return false;
  // Catégories daily : tout mot valide
  if (categoryId.startsWith("dc_")) return true;

  // Récupère UNIQUEMENT le dictionnaire de la langue active — pas de fallback cross-lang
  const sets = getSets(lang);
  const set = sets[categoryId]?.[letter.toUpperCase()];
  const fset = getFuzzySets(lang)[categoryId]?.[letter.toUpperCase()];
  const nc = norm.replace(/ /g, ""); // version compacte (sans espaces)
  const ncc = collapseDoubles(nc);   // version compacte + doublons écrasés

  // Catégories ouvertes : dico + validation phonétique
  if (OPEN_CATS.has(categoryId)) {
    if (set?.has(norm) || fset?.compact.has(nc) || fset?.collapsed.has(ncc)) return true;
    // Prénom : très souple — 3 lettres min., pas de chiffres ni caract. spéciaux,
    // pas plus de 4 consonnes consécutives. Tout prénom phonétiquement possible est accepté.
    if (categoryId === "prenom") {
      if (norm.length < 3 || norm.length > 30) return false;
      if (/[0-9@#$%^&*()+=[\]{}|<>]/.test(norm)) return false;
      if (/[^aeiouy]{5,}/.test(norm)) return false; // max 4 consonnes de suite
      return true;
    }
    return looksLikeRealName(norm);
  }

  // Toutes les autres catégories : STRICT — uniquement le dico de la langue active
  if (!set || set.size === 0) return false;
  // 1. Correspondance exacte
  if (set.has(norm)) return true;
  // 2. Mots composés sans tiret/espace : "jeanpierre" == "jean pierre"
  if (fset?.compact.has(nc)) return true;
  // 3. Double lettre simplifiée : "bale" accepté pour "balle" (donne 1pt)
  if (fset?.collapsed.has(ncc)) return true;
  return false;
}

const AI_ANSWERS = {
  prenom:{A:["alice","ambre","axel","adele","antoine","alexandre","amelie","anais"],B:["baptiste","bastien","brigitte","beatrice","benjamin"],C:["camille","clement","charlotte","colette","caroline","cedric"],D:["david","diane","dylan","delphine","damien"],E:["emma","emile","elisa","elodie","ethan","elena"],F:["felix","florian","fanny","flavie","frederic"],G:["gabriel","gaelle","gregoire","guilhem","gaetan"],H:["hugo","helene","henri","hubert","hadrien"],I:["ines","iris","ivan","ibrahima","ilona"],J:["julien","justine","jean","julie","jade"],K:["kilian","karine","kevin","kim","kelly"],L:["lucas","lucie","lea","louise","lola"],M:["marie","maxime","mathieu","margot","manon"],N:["noa","noe","noel","noemie","nicolas","nathan"],O:["oscar","olivier","odile","ophelie","olympe"],P:["pierre","pauline","philippe","paul","patricia"],Q:["quintino"],R:["romain","raphael","rachel","remi","renaud"],S:["sophie","simon","sarah","samuel","sebastien"],T:["thomas","theo","tina","thibault","tanguy"],U:["ugo","ulrik"],V:["victor","valerie","vincent","violette"],W:["william","wendy"],X:["xavier"],Y:["yasmine","yoann"],Z:["zoe","zadig"]},
  nom:{A:["ali","adam","adams","adler","aumont","antoine","amar","albert"],B:["baron","barry","bailly","bardin","bernard","bourgeois","blanc","brunet"],C:["carr","camus","caron","carter","christoph","chauvin","clement","collin"],D:["dahan","danet","duval","daniel","dupont","durand","dubois","dufour"],E:["elie","eloy","elbaz","elias","etienne","evrard"],F:["fabre","faure","ferri","ferro","fontaine","francois","fleury"],G:["gehin","girod","garcia","girard","gilles","guerin","guibert"],H:["hamid","hardy","harel","haddad","hubert","henry","herve"],I:["icard","imbert","ibrahim"],J:["jean","jerome","jaccard","jacquet","joubert","julien"],K:["kahn","kante","keita","klein"],L:["lamy","leon","lafon","laval","lucas","leroy","lefebvre"],M:["marty","meyer","morin","macias","martin","michel","moreau"],N:["noel","naimi","neveu","nadeau","nicolas","nadia"],O:["oudin","ory","oliveira","ochoa"],P:["paul","paoli","paris","payet","petit","perrier","picard"],Q:["quentin"],R:["rene","roux","ramos","raoul","renard","rolland","roger"],S:["salle","simon","soler","salles","schmitt","souza","sauvage"],T:["tabet","testa","toure","tardif","thomas","touret"],V:["vidal","vigne","vinot","vallet","vincent","vallee"]},
  pays:{A:["aceh","angola","arabie","açores","afghanistan","albanie","algerie","andorre","armenie","azerbaidjan","australie","autriche"],B:["benin","bresil","belize","bhutan","bahrein","bangladesh","bolivie","bosnie","botswana","bulgarie","burkina faso","burundi","bahamas","barbade"],C:["cuba","cook","chine","congo","cambodge","cameroun","canada","cap vert","centrafrique","chili","colombie","comores","cote divoire","croatie","chypre"],D:["danemark","djibouti","dominique","dominicaine"],E:["egypte","espagne","estonie","emirats","equateur","erythree","ethiopie","el salvador"],F:["fidji","france","finlande","formose"],G:["guam","grece","ghana","gabon","gambie","georgie","grenade","guatemala","guinee","guyane"],H:["haiti","hongrie","honduras","hollande"],I:["inde","iran","irak","italie","indonesie","irlande","islande","israel"],J:["japon","jordanie","jamaique"],K:["kenya","koweit","kosovo","kiribati","kazakhstan","kirghizistan"],L:["laos","liban","libye","liberia","lesotho","lettonie","liechtenstein","lituanie","luxembourg"],M:["mali","maroc","malte","malawi","madagascar","malaisie","maldives","mauritanie","maurice","mexique","moldavie","monaco","mongolie","montenegro","mozambique","myanmar"],N:["niue","niger","nepal","nauru","namibie","nicaragua","nigeria","norvege","nouvelle zelande"],O:["oman","ouganda","ouzbekistan"],P:["perou","panama","palaos","pologne","pakistan","palestine","papouasie","paraguay","philippines","portugal"],R:["russie","rwanda","roumanie","republique tcheque"],S:["suede","syrie","samoa","suisse","salvador","senegal","serbie","seychelles","sierra leone","singapour","slovaquie","slovenie","somalie","sri lanka","soudan"],T:["togo","tchad","tonga","timor","taiwan","tanzanie","thaïlande","trinite","tunisie","turquie","turkmenistan"],U:["ukraine","uruguay"],V:["vietnam","vanuatu","venezuela"],W:["wallis"],Y:["yemen"],Z:["zambie","zimbabwe"]},
  ville:{A:["apt","aden","agra","albi","amsterdam","athenes","ankara","abidjan","alexandrie","alger","amman","addis abeba","asmara","auckland","abu dhabi"],B:["bali","brno","baku","bonn","barcelone","berlin","bogota","buenos aires","bruxelles","budapest","bagdad","bangkok","beyrouth","bangalore","birmingham","brasilia","bridgetown","bruges"],C:["caen","cebu","cali","cairo","calcutta","caracas","casablanca","chicago","colombo","copenhague","calgary","cannes","canberra","chengdu","chisinau"],D:["dax","doha","dubai","dakar","delhi","dacca","dublin","dallas","dar es salam","djakarta","dortmund","dushanbe","durban"],E:["evry","erbil","essen","enugu","edimbourg","eindhoven"],F:["fez","flers","frejus","fresno","florence","francfort","fukuoka","freetown"],G:["gap","goma","gaya","gijon","geneve","glasgow","guangzhou","guadalajara","gothenburg"],H:["hem","hanoi","haifa","hefei","hambourg","harare","helsinki","hong kong","houston","hyderabad"],I:["ife","ipoh","iasi","imus","istanbul","islamabad"],J:["jos","jinan","jinja","jambi","jakarta","jerusalem","johannesburg"],K:["kiev","kobe","kano","kinshasa","kaboul","kampala","karachi","katmandou","khartoum","kigali","kingston","kuala lumpur"],L:["lima","lyon","lome","lodz","lagos","lisbonne","los angeles","la paz","lahore","libreville","luanda","lusaka"],M:["male","metz","meru","miri","madrid","manille","marseille","medellin","milan","moscou","mumbai","munich","montreal","mogadiscio","monrovia","montevideo"],N:["nice","nimes","niort","nancy","nairobi","nassau","niamey","nueva york","nouakchott"],O:["oslo","oran","omsk","orsay","osaka","ottawa","ouagadougou"],P:["pau","pune","paris","porto","pekin","phnom penh","prague","pretoria","panama","palerme"],Q:["quito","quezon"],R:["rome","riad","riga","rabat","reykjavik","rio de janeiro","rotterdam","rangoun"],S:["sete","sens","sfax","suva","santiago","sao paulo","sarajevo","seoul","shanghai","singapour","sofia","stockholm","sydney","salt lake city"],T:["thes","tokyo","tunis","tours","taipei","tbilisi","tegucigalpa","teheran","tripoli","toronto"],U:["ulaanbaatar","utrecht"],V:["vigo","vichy","varna","vienne","varsovie","vancouver","vladivostok"],W:["washington","winnipeg","wuhan","wellington"],X:["xian","xiamen"],Y:["yangon","yaounde","yerevan","yokohama"],Z:["zurich","zagreb"]},
  animal:{A:["ane","ara","aigle","amibe"],B:["boa","bouc","bison","biche"],C:["coq","chat","cerf","chien"],D:["daim","dodo","dama","dard"],E:["elk","emeu","elan","esox"],F:["faon","flet","furet","felin"],G:["gnou","geai","guib","gecko"],H:["hase","hyla","hibou","hyene"],I:["ibis","isard","iguane","impala"],J:["jaguar","jerboa","jaguarundi"],K:["kob","kiwi","koala","kodiak"],L:["lion","loup","lynx","loir"],M:["maki","mole","morse","mante"],N:["nase","nyala","narval","nandou"],O:["ours","orque","okapi","ocelot"],P:["pic","pie","paon","plie"],R:["rat","raie","renne","renard"],S:["singe","seche","serin","saumon"],T:["taon","thon","tigre","tatou"],V:["vache","vison","varan","vipere"]},
  fruit:{A:["ail","acai","ache","akee","abricot","amande","airelle","ananas","aneth","artichaut","asperge","avocat","anis"],B:["baie","bluet","boldo","banane","betterave","brocoli","bleuet","brugnon","basilic"],C:["chou","coing","carob","cumin","cerise","citron","coco","courge","concombre","canneberge","cassis","carotte","cannelle","ciboulette"],D:["datte","durian","daikon","damson","dill","douce"],E:["endive","epinard","edamame","epazote","estragon","eglantier"],F:["feve","figue","fruit","fraise","framboise","fenouil","fenugrec"],G:["goji","gombo","gesse","gland","groseille","grenade","gingembre","groseille rouge","guava"],H:["hysope","haricot","houblon","hibiscus","huile dolive"],I:["igname","icaque","ipomee"],J:["jujube","jasmin","jackfruit","jalapeno","julienne"],K:["kiwi","kale","kafir","kumquat","kaki"],L:["lupin","lichi","lotus","litchi","lime","lentille"],M:["mure","mais","melon","mache","mangue","mirabelle","myrtille","mandarine","menthe","morelle"],N:["nefle","navet","noisette","nectarine","noix","nori"],O:["orange","olive","oseille","origan","okra","oignon"],P:["peche","poire","prune","pomme","papaye","poivron","pamplemousse","patate","persil","physalis","pistache"],R:["rose","radis","raisin","ronces","rhubarbe","romarin","roquette"],S:["soja","sauge","sureau","sapote","sorbet","spinard"],T:["thym","taro","tomate","truffe","thé vert"],V:["vigne","vanille","valerian","violette","vesce"]},
  metier:{A:["agent","avocat","acteur","auteur","architecte","agronome","ambulancier","analyste","animateur","anthropologue","archaeologue","archiviste","astronaute","astronome"],B:["barman","berger","boucher","banquier","boulanger","biologiste","biochimiste","brodeur","briquetier"],C:["clerc","clown","coach","cirier","charpentier","chimiste","chirurgien","comptable","conseiller","cuisinier","courtier","cordonnier","cartographe"],D:["dj","doreur","driver","danseur","decorateur","dentiste","designer","detective","developpeur","directeur","diplomate","dieteticien"],E:["espion","employe","editeur","ecrivain","electricien","eleveur","ergonome","expert","ethnologue"],F:["facteur","fermier","faiseur","farrier","fleuriste","forgeron","fonctionnaire","formateur","fiscaliste"],G:["garde","guide","garcon","gobeur","geologue","geographe","graphiste","gestionnaire"],H:["huissier","hotelier","historien","humaniste","horloger","hydraulicien"],I:["infirmier","ingenieur","intendant","imprimeur","illustrateur","informaticien","inspecteur","installateur","instituteur"],J:["juge","juriste","jaugeur","jongleur","jardinier","joaillier","journaliste"],K:["kiosquier","kinesitherapeute"],L:["laveur","luthier","legiste","lisseur","libraire","linguiste","logisticien"],M:["macon","maire","marin","mineur","menuisier","medecin","meteorologue","militaire","musicien","maroquinier"],N:["notaire","negociant","navigateur","neurologue","nutritionniste"],O:["orfevre","opticien","osteopathe","oceanographe","orientaliste"],P:["pilote","potier","pompier","pecheur","peintre","pharmacien","photographe","physicien","plombier","professeur","psychiatre","psychologue","patissier","podologue"],Q:["qualitologue"],R:["routier","rondier","reporter","redacteur","radiologue","restaurateur","receptionniste"],S:["serveur","soudeur","sportif","steward","sculpteur","sociologue","sommelier","styliste","sage femme"],T:["torero","tourneur","tailleur","taxateur","technicien","therapeute","traducteur","trameur"],U:["urbaniste","urgentiste"],V:["vendeur","verrier","veilleur","vigneron","veterinaire","videographe"],W:["webmaster","webdesigner"],X:["xenobiologiste"],Y:["yogamaster"],Z:["zoologue","zoologiste"]},
  celebrite:{A:["adele","ahanu","aragon","achille"],B:["brel","briand","balzac","beyonce"],C:["camus","cesar","cesaire","colette"],D:["dali","drake","dante","dalida"],E:["eminem","erasme","euclide","einstein"],F:["freud","flaubert","frida kahlo","frank sinatra"],G:["gauss","gorki","gandhi","goethe"],H:["hugo","homer","horace","hannibal"],I:["ibsen","ice cube","idris elba","ibn battuta"],J:["jay z","jean zay","joao miro","james dean"],K:["kant","kafka","kepler","karl marx"],L:["lorca","lao tseu","lady gaga","lamartine"],M:["marx","messi","manet","mozart"],N:["neruda","newton","napoleon","nijinski"],O:["obama","omar sharif","orson welles"],P:["poe","prince","pascal","platon"],R:["rumi","rodin","racine","reagan"],S:["sade","sartre","stomae","shakira"],T:["tupac","tzara","tyson","tesla"],V:["verne","vinci","virgile","vivaldi"]},
  sport:{A:["aviron","aikido","aerobic","agility","athletisme","alpinisme","aquagym","auto moto"],B:["bmx","boxe","billard","bowling","badminton","baseball","basketball","biathlon","bodyboard","bodybuilding","breakdance"],C:["canoe","corso","cricket","croquet","cyclisme","cheerleading","curling","crossfit","capoeira"],D:["dart","discus","diving","decathlon","danse sportive","deltaplane"],E:["escrime","escalade","exercise","endurance","equitation","enduro"],F:["fitboxe","fitness","freeski","football","flechettes","frisbee","funambulisme"],G:["golf","goalball","gymnastique","glissade","grimpette"],H:["hockey","hurling","hornuss","handball","halterophilie","hippisme"],I:["ice hockey","inline skating","ironman","indoor climbing"],J:["judo","jetski","jogging","javelin","jiu jitsu","jumping"],K:["kendo","kayak","karate","kitesurf","kickboxing","korfball"],L:["luge","lutte","lancer","lacrosse","longboard","laser"],M:["mma","moto","mushing","marathon","muay thai","motocross","mountainbike"],N:["natation","nage synchronisee","nordic ski","nage libre"],O:["open water","orienteering"],P:["polo","padel","paddle","pelote","parachutisme","parkour","patinage","pentathlon","pêche"],Q:["quad"],R:["raid","ring","rugby","rodeo","rafting","rallye","roller","rowing"],S:["ski","surf","sumo","squash","skateboard","snowboard","savate"],T:["tir","trial","tennis","triathlon","tir a larc","tae kwondo","trampolino"],U:["ultimate frisbee"],V:["vtt","velo","voile","voltige","volleyball","varappe"],W:["wakeboard","water polo"],X:["xcountry"],Y:["yoga"],Z:["zumba"]},
  objet:{A:["abri","ancre","alene","album"],B:["bol","bac","bloc","balai"],C:["cle","canif","cible","chaise"],D:["drap","dame","dard","dais"],E:["epee","etau","etui","ecran"],F:["fil","frigo","flute","fusil"],G:["gant","grue","gaffe","gaine"],H:["haie","houe","hamac","hache"],I:["icone","imprimante","impermeable"],J:["jatte","jauge","jeton","jersey"],K:["kayak"],L:["lit","lien","lampe","livre"],M:["main","micro","moule","masse"],N:["nœud","nappe","noeud","nasse"],O:["outil","oreillers","objet de collection"],P:["pieu","plume","porte","pince"],R:["roue","regle","radio","rivet"],S:["sac","soc","seau","sofa"],T:["tube","table","tapis","tasse"],V:["vase","verre","vitre","volet"]},
  film:{A:["alien","amour","avatar","amelie","apocalypse now","arrival","a beautiful mind"],B:["bambi","blade","batman","brazil","boyhood","braveheart","black swan"],C:["coco","cleo","coda","crash","casablanca","citizen kane","clockwork orange"],D:["dune","drive","daddy","django","dark knight","dead poets society"],E:["et","enigma","elysium","enfants du paradis"],F:["fargo","flash","fantomas","face off","fight club","finding nemo"],G:["ghost","grease","gravity","gattaca","godfather","gladiator"],H:["her","heat","hugo","highlander","harry potter"],I:["inception","interstellar","intouchables"],J:["jaws","joker","jarmusch","jungle book","jurassic park"],K:["kids","kong","kundun","kill bill"],L:["lion","la haine","lamerica","lady bird","lord of the rings","la la land"],M:["mulan","matrix","mad max","memento","moonlight","moulin rouge"],N:["nope","noir","notebook","nomadland"],O:["oldboy","odyssee"],P:["pan","piano","psycho","parasite","pulp fiction"],R:["ran","roma","rocky","requiem","rear window","rain man"],S:["shrek","speed","seven","shining","schindler","scarface","star wars"],T:["tenet","titanic","taxi driver","the godfather","terminator"],V:["vertigo","valerian","v pour vendetta"]},
  marque:{A:["ag","amc","audi","acne"],B:["bmw","bic","bbc","bose"],C:["canon","chanel","celine","cessna"],D:["dhl","dior","dacia","darty"],E:["ebay","epson","esprit","etnies"],F:["ford","fila","fiat","fendi"],G:["gap","gucci","google","goyard"],H:["hp","h m","head","honda"],I:["ikea","intel","imperial","in n out"],J:["joop","james","jaguar","jordan"],K:["kia","keen","kenzo","kappa"],L:["lg","lego","lacor","levis"],M:["moet","muji","mango","marni"],N:["nba","nfl","nike","nars"],O:["omega","oysho","ouibus","off white"],P:["puma","peck","polo","prada"],R:["roca","rolex","reiss","ricoh"],S:["sony","seiko","stella","stussy"],T:["tesla","total","toyota","twitter"],V:["vans","versace","viceroy","vuitton"]},
  anatomie:{A:["anus","aine","aorte","atlas","abdomen","artere","articulation","auriculaire"],B:["bras","bulbe","biceps","bassin","bouche","bronche"],C:["cil","col","cou","cote","cerveau","colonne","cornee","cranie"],D:["dos","dents","derme","deltoid","diaphragme","duodenum"],E:["epine","epaule","estomac","epiderme","epiphyse","email"],F:["foie","femur","front","flanc","fibula"],G:["genou","gorge","glande","glotte","gencive"],H:["hanche","humerus","hippocampe"],I:["iris","index","ischio","intestin"],J:["joue","jambe","jugulaire"],K:["kyste","keratine"],L:["lobe","levre","langue","ligament","larynx","lombes"],M:["muscle","moelle","mitral","mollet","membrane","menisque"],N:["nez","nerf","nuque","nasal","nombril"],O:["oreille","ovaire","omoplat","organe"],P:["peau","pied","pouce","paume","pancreas","patella","pelvis"],Q:["quadriceps"],R:["rein","radius","rectum","rotule","retine"],S:["sang","sinus","sacrum","salive","sternum"],T:["tibia","tarse","tempe","tendon","thorax"],U:["ulna","uterus"],V:["veine","valve","vagin","vertebre"]},
  musique:{A:["abba","adele","akon","amy winehouse","arctic monkeys","asap rocky"],B:["brel","blur","bach","booba","beatles","beyonce","bob marley","bruce springsteen"],C:["chopin","camille","cardi b","coldplay","chris brown"],D:["drake","dalida","dj snake","daft punk","david bowie","dire straits"],E:["eminem","ed sheeran","edith piaf","elton john","ella fitzgerald"],F:["fugees","frank ocean","foo fighters","florent pagny","fleetwood mac"],G:["gorillaz","green day","gainsbourg","guns n roses","george michael"],H:["hamza","hendrix","hans zimmer","harry styles"],I:["inxs","indochine","iron maiden","imagine dragons"],J:["jay z","jamiroquai","julien dore","james brown","johnny cash","john legend"],K:["keane","khalid","koffee","kid cudi","kanye west"],L:["lorde","lizzo","logic","lords","lady gaga","lauryn hill","led zeppelin"],M:["maes","moby","muse","mozart","madonna","maroon 5","miles davis","mac miller"],N:["nas","ninho","nekfeu","nirvana","notorious big"],O:["oasis"],P:["piaf","prince","pharrell","pearl jam","post malone","pink floyd"],R:["rone","rihanna","r kelly","raphael","radiohead","rage against the machine"],S:["sting","skepta","summer","shakira","snoop dogg","sam smith","sex pistols"],T:["toto","the cure","the doors","the weeknd","talking heads","taylor swift"],U:["u2"],V:["vald","vianney","vivaldi","vampire weekend"],W:["weeknd"]},
  cuisine:{A:["ail","aloo","adobo","acras","aligot","artichaut","assiette"],B:["boeuf","blini","burek","bisque","baguette","boeuf bourguignon","baklava"],C:["crepe","curry","chili","confit","cassoulet","coquilles saint jacques","carpaccio"],D:["daube","dashi","dolma","dinde","dorade"],E:["etuvee","epinard","escalope","empanada"],F:["farce","frito","fondue","fajita","foie gras","felafel"],G:["gyoza","gyros","glace","gratin","gaspacho"],H:["hummus","hotpot","harira","harissa","hamburger"],I:["idli","injera","iskender","involtini"],J:["jerk","jiaozi","julienne","jambalaya"],K:["kefta","kebbeh","kimchi","kibbeh","kebab"],L:["laksa","lardo","lapin","leche","lasagne","lentille"],M:["mole","miso","makis","migas","moussaka","mousse"],N:["naan","nems","nougat","nachos"],O:["osso buco","omelette"],P:["pho","pate","pizza","poele","paella","pois chiches","polenta"],Q:["quiche"],R:["roti","ramen","rosbif","risotto","ratatouille"],S:["sushi","soupe","steak","sauce","saumon","salade"],T:["taco","tofu","tarte","tapas","tiramisu"],U:["udon"],V:["veau","vatapa","veloute","volaille"],W:["waffle","wok"],Y:["yaourt"],Z:["zaatar"]},
  vehicule:{A:["atv","audi","avion","aviso","ambulance","autobus","autocar"],B:["bus","bac","bmw","bob","bateau","bulldozer","bicyclette"],C:["cab","car","char","canoe","camion","cable car","catamaran"],D:["drone","dumper","drakkar","dragster","dirigeable"],E:["engin","escalator","excavateur","embarcation"],F:["fiat","ford","fusee","frigat","ferry"],G:["grue","galere","grader","go kart","gondole"],H:["hot rod","hydrofoil","hydravion","hovercraft","helicoptere"],I:["isetta"],J:["jet","jeep","jonque","jet ski"],K:["kayak","karting"],L:["luge","landau","lancia","libelle","limousine","locomotive"],M:["moto","metro","mazda","moped","minibus"],N:["nef","navire","navette"],O:["ocean liner"],P:["pelle","patrol","peugeot","planeur","parachute"],Q:["quad"],R:["rame","radeau","renault","remorque","rocket","raft"],S:["suv","skate","segway","suzuki","scooter","sous marin","speedboat"],T:["tank","taxi","tram","train","tracteur"],U:["uber"],V:["van","velo","vespa","viking"],W:["watercraft"],Z:["zeppelin"]},
  capital:{A:["apia","alger","amman","accra","abou dabi","abuja","addis abeba","andorre la vielle","ankara","antananarivo","ashgabat","assouan","astana","asmara","athens"],B:["berne","bagdad","berlin","bamako","banjul","bangui","belmopan","belgrade","beyrouth","bishkek","bissau","bogota","brasilia","bratislava","brazzaville","bridgetown","bruxelles","bujumbura","budapest"],C:["cairo","colombo","conakry","caracas","canberra","castries","chisinau","copenhague"],D:["doha","dili","dacca","dakar","dhaka","djibouti","dodoma","douglas"],E:["erevan","edinburgh"],F:["funafuti","freetown"],G:["gaborone","georgetown","guatemala city"],H:["harare","havane","honiara","helsinki"],I:["islamabad"],J:["jakarta","jerusalem","jamestown"],K:["kiev","kaboul","kigali","kampala","katmandou","khartoum","kingston","kinshasa","kuala lumpur"],L:["lima","lome","luanda","lusaka","la paz","libreville","lilongwe","lisbonne","londres","la valette"],M:["male","minsk","madrid","moscou","managua","manille","maputo","maseru","mbabane","mogadiscio","monrovia","montevideo","moroni","muscat"],N:["nassau","niamey","nairobi","nicosia","ndjamena","naypyidaw","nukualofa","nueva delhi"],O:["oslo","ottawa"],P:["paris","prague","panama","palikir","phnom penh","port au prince","port moresby","porto novo","pretoria"],Q:["quito"],R:["riad","rome","riga","rabat","reykjavik"],S:["suva","seoul","sofia","skopje","san jose","santiago","santo domingo","sao tome","sarajevo","singapour","stockholm","sucre"],T:["tokyo","tunis","tirana","teheran","taipei","tachkent","tbilissi","tegucigalpa","thimphu","tripoli","tallinn"],U:["ulu","ulaanbaatar"],V:["vaduz","vienne","vilnius","valleta"],W:["washington","windhoek","wellington"],Y:["yaounde","yangon"],Z:["zagreb","zamboanga"]},
  monument:{A:["agra","alta","agora","arche","alhambra","angkor","arc de triomphe"],B:["big ben","beffroi","basilique","borobudur","buckingham"],C:["chora","cluny","cheops","crypte","colisee","christ the redeemer"],D:["delphi","dolmen","dome du rocher","dome des rochers"],E:["ephese","escorial","easter island","empire state"],F:["forum romain","fortification","forbidden city","fontaine de trevi"],G:["gaudi","grotte","glacier","golden gate","grande pyramide","grande muraille"],H:["himeji","hadrien","hradcany","hollywood","hagia sophia"],I:["invalides"],J:["jardin","jerash","jungfrau"],K:["kaaba","karnak","kremlin","kilimanjaro"],L:["luxor","louvre","leptis magna","leaning tower"],M:["moai","minar","minaret","mosquee","machu picchu","mont saint michel"],N:["nazca","niagara","notre dame"],O:["olympe"],P:["petra","pompei","pagode","pergame","parthenon","pyramides"],Q:["qoqand"],R:["rialto","rempart","red fort","reichstag"],S:["sphinx","sistine","sigiriya","serengeti","stonehenge","sagrada familia","statue de la liberte"],T:["tour","torii","temple","tianmen","taj mahal"],V:["vatican","versailles","victoria falls"]},
  langue:{A:["akan","arabe","azeri","aymara","afrikaans","albanais","amharique","armenien"],B:["birman","basque","breton","buryat","bengali","bosnien","bulgare","bielorusse"],C:["corse","coreen","croate","chinois","catalan","cantonnais"],D:["dari","danois","dzongkha","dialecte"],E:["ewe","espagnol","estonien","esperanto","evenki"],F:["farsi","frison","finnois","fidjien","flamand","francais"],G:["grec","gallois","guarani","georgien","gujarati","gaelique"],H:["hindi","hebrew","hebreu","haoussa","hongrois"],I:["igbo","italien","islandais","indonesien"],J:["japonais","javanais"],K:["khmer","kongo","kurde","kazakh","kinyarwanda","kirghiz"],L:["latin","letton","luganda","lituanien","laotien"],M:["malais","mongol","maltais","marathi","macedonien","mandarin"],N:["nepalais","norvegien"],O:["ourdou","occitan"],P:["persan","pashto","punjabi","polonais","portugais"],Q:["quechua"],R:["russe","roumain"],S:["serbe","somali","sindhi","suedois","swahili","slovaque","slovene"],T:["turc","thai","tatar","tamoul","tibetain","telougou"],U:["ukrainien","uyghur"],V:["valencien","vietnamien"],W:["wolof","welsh"],X:["xhosa"],Y:["yoruba"],Z:["zoulou"]},
  instrument:{A:["alto","arpa","appeau","alphorn","accordeon"],B:["banjo","basse","bongo","bugle","basson","berimbau","bouzouki"],C:["cor","cajon","caixa","clave","clarinette","clavecin","cello"],D:["daf","dre","dhol","didgeridoo","djembe","dulcimer"],E:["epinette","euphonium"],F:["fife","flute","fifre","flageolet","fiddle"],G:["gong","gaita","geige","guitare","gamelan","glockenspiel"],H:["harpe","helicon","hautbois","harmonica","harmonium","harpsichord"],I:["imbila"],J:["jouhikko","jews harp"],K:["koto","kora","kazoo","kecak","kalimba"],L:["lur","lir","luth","lyre"],M:["mbira","maracas","melodeon","melodica","mandoline","marimba"],N:["nay","ngoni","nyckelharpa"],O:["orgue","oboe"],P:["pipa","piano","piccolo","psalterion","pan flute"],Q:["quena"],R:["rebab","rebec","rubab","recorder"],S:["saxo","sitar","sarod","sanza","synthé","steel drum"],T:["tar","tuba","tabla","tiple","trompette","trombone","triangle","tambour"],U:["ukulele"],V:["viol","viole","viola","veena","violon","vibraphone"],X:["xylophone"],Z:["zither"]},
  vetement:{A:["aube","abaya","afgha","amice"],B:["body","burqa","beret","boxer"],C:["cape","ciré","cire","caban"],D:["dastar","dos nu","dashiki","doudoune"],E:["echarpe","espadrille","epaulieres","epaulettes"],F:["frac","fanon","foulard"],G:["gilet","gants","guetres"],H:["haïk","haik","haori","habit"],I:["impermeable"],J:["jean","jupe","jogging","jambières"],K:["kilt","kimono","kaftan","kameez"],L:["lin","legging","lingerie","leg warmers"],M:["manteau","maillot","mitaines","mariniere"],N:["niqab"],O:["overall","overcoat"],P:["pull","polo","parka","pareo"],R:["robe","raincoat","redingote","robe de chambre"],S:["slip","sari","sweat","short"],T:["toge","toga","trench","turban"],V:["vest","veste","voile","veston"]},
  emotion:{A:["aise","amour","ardeur","audace"],B:["bonte","beaute","bluffe","bonheur"],C:["calme","colere","cafard","charme"],D:["desir","deuil","dedain","degoût"],E:["epic","ennui","envie","effroi"],F:["fierte","fureur","frayeur","fierete"],G:["gene","gêne","genie","gaite"],H:["honte","haine","hargne","horreur"],I:["ivresse","inertie","intensite","inquietude"],J:["joie","jubile","jalousie","jouissance"],K:["kinesthesie"],L:["larmes","liberte","loyaute","legerete"],M:["mepris","misere","malaise","modestie"],N:["nostalgie","nervosité","nonchalance"],O:["orgueil","outrage","obstination"],P:["peur","paix","pitie","peine"],R:["rage","regret","rancune","renonce"],S:["stupeur","solitude","saintete","serenite"],T:["terreur","trouble","torpeur","timidite"],V:["vanite","vertige","vigueur","vexation"]},
  mythologie:{A:["ares","ajax","aedes","amour"],B:["borée","boree","bacchus","briares"],C:["circe","cerere","cronos","cronus"],D:["dieu","diana","dieux","diane"],E:["echo","eros","erebe","europe"],F:["faune","fates","furies"],G:["gaia","graces","gorgone","gorgones"],H:["hera","hades","hydre","hygie"],I:["iris","icare","ithaque"],J:["juno","jason","janus","jupiter"],K:["kronos"],L:["lethe","laocoon","licorne","lachesis"],M:["mars","midas","medee","muses"],N:["nike","neptune","nymphes","narcisse"],O:["orphee","olympe","oracle","odyssee"],P:["paris","persee","pegase","pluton"],R:["rhea","romulus","rhadamanthe"],S:["styx","sphinx","saturne","sisyphe"],T:["titans","thesee","themis","triton"],V:["venus","vulcain"]},

  espace:{A:["amas","astre","astres","aurora"],B:["binaire","big bang","boucle cosmique"],C:["comete","cosmos","crater","cosmologie"],D:["derive","deimos","debris","disque galactique"],E:["etoile","eclipse","equinoxe","expansion"],F:["fusee","fission","force gravitationnelle"],G:["galaxie","gravite","gravitation","geante rouge"],H:["horizon des evenements"],I:["iss","impact meteoritique"],J:["jupiter"],K:["kepler"],L:["lune","laser","lumiere","luminosite"],M:["mars","meteore","milky way","magnitude"],N:["nasa","neutron","nebuleuse","naine brune"],O:["orbite","onde gravitationnelle"],P:["pluton","pulsar","planete","perigee"],R:["rover","rotation","radiation"],S:["sonde","soleil","saturne","supernova"],T:["transit","telescope","trou noir"],V:["venus","voie lactee"]},
  oceane:{A:["algue","atoll","ambre","anemone"],B:["baleine","benitier","bernacle","baudroie"],C:["crabe","carpe","coral","corail"],D:["delta","dugong","dauphin","delphinapterus"],E:["espadon","epaulard","etoile de mer","ecosysteme marin"],F:["flet","fanon","faque","fletan"],G:["gobie","grand requin","grotte sous-marine","grotte sous marine"],H:["homard","hareng","huitre","hippocampe"],I:["ile","ichtyologie","iguane marin"],J:["janthine"],K:["krill","kayak marin"],L:["lamproie","lamantin","langouste","lion de mer"],M:["morse","meduse","murene","marsouin"],N:["narval","nautile","naufrage"],O:["orque","octopus"],P:["phoque","pieuvre","pingouin","plancton"],R:["raie","recif","requin","rascasse"],S:["sole","saumon","seiche","sardine"],T:["thon","turbot","tortue marine"],V:["vive","variete marine"]},
  medievale:{A:["autel","armure","abbaye","annales"],B:["buste","barde","blason","beffroi"],C:["clerc","chateau","croisade","couvents"],D:["drac","duel","dame"],E:["ecu","epee","ecuyer","ecurie"],F:["fort","fief","faucon","fleche"],G:["glaive","gardes","guildes","gargouille"],H:["herse","heraut","haubert","hommage"],I:["impot"],J:["joute","jeanne d arc"],K:["keep"],L:["luth","lance","lutrin","laique"],M:["motte","moine","merlin","manoir"],N:["nef","noble"],O:["oriflamme","ordre"],P:["page","prieure","palefroi","parchemin"],R:["roi","rempart","relique","roi arthur"],S:["serf","siege","scribe","serment"],T:["tour","trone","tribut","templier"],V:["vassal","vitrail","vicomte"]},
  technologie:{A:["api","ascii","arduino","antivirus"],B:["bug","binaire","bluetooth","blockchain"],C:["cpu","code","cloud","crypto"],D:["data","drone","debug","donnees"],E:["email","ethernet","encryption","electronique"],F:["firewall","framework","fibre optique"],G:["gps","gpu","github","graphique"],H:["hack","html","http","hardware"],I:["internet","interface","inteligence artificielle","intelligence artificielle"],J:["java","javascript"],K:["kotlin","kernel","kubernetes"],L:["linux","langage","logiciel"],M:["mongodb","memoire","megadonnees","microprocesseur"],N:["nuage","network","numerique","navigation"],O:["ordinateur","open source"],P:["pixel","python","protocole","processeur"],R:["ram","reseaux","reactjs","robotique"],S:["sql","serveur","systeme","streaming"],T:["terminal","transistor","traitement","technologie"],V:["virus","virtualisation","virtual reality"]},
  danse:{A:["adagio","allegro","afrobeat","arabesque"],B:["barre","ballet","bolero","battement"],C:["cha cha","cabaret","cossack","country"],D:["disco","danzon","danse moderne","danse classique"],E:["entrechat","expression corporelle"],F:["funk","foxtrot","flamenco","fandango"],G:["gigue","glissade"],H:["hula","hora","hip hop"],I:["improvisation"],J:["jazz","jive"],K:["kathak","kuduro","kizomba"],L:["lambada","locking","lindy hop","leg warmers"],M:["mazurka","merengue","moonwalk","mouvements"],N:["neofolk","neosoul","ndombolo"],O:["oriental"],P:["polka","pointe","popping","pirouette"],R:["rock","rumba","reggaeton"],S:["step","salsa","samba","swing"],T:["tango","twist","tutting","tap dance"],V:["valse","vogue","voguing"]},
  architecture:{A:["agora","arche","arcade","abside"],B:["beton","balcon","bunker","beffroi"],C:["cour","cloitre","coupole","creneau"],D:["dome","decor","donjon","dallage"],E:["eglise","escalier","entablement"],F:["frise","facade","fenetre","fronton"],G:["gothique","gargouille","gratte ciel"],H:["hall","hotel","hospice"],I:["igloo","immeuble"],J:["jambage"],K:["kiosque"],L:["loggia","louvre","linteau"],M:["meneau","minaret","mansarde","modillon"],N:["nef","narthex"],O:["ogive","obélisque"],P:["pilier","porche","podium","palais"],R:["rosace","rotonde","rempart","romanesque"],S:["stupa","salle","sanctuaire","soubassement"],T:["tour","tympan","temple","tribune"],V:["vault","voute","vestibule"]},
  sport_star:{A:["ali","ashe","agassi","anelka"],B:["bolt","bird","best","biles"],C:["curry","carlos","cantona","clemson"],D:["durant","drogba","djokovic","deschamps"],E:["eto o","eusebio"],F:["figo","federer"],G:["grace","gasquet","griezmann","guardiola"],H:["hamm","henry","hatton","hamilton"],I:["ibrahimovic"],J:["james","jordan","jorginho","james lebron"],K:["kobe","kante","kylian"],L:["lin","lewis","lebron","lewandowski"],M:["messi","maldini","maradona","mourinho"],N:["nadal","neymar"],O:["owen","okoye"],P:["pele","pogba","platini"],R:["rafael","robben","ronaldo","robinson"],S:["salah","serena","sneijder","schumacher"],T:["tyson","totti"],V:["villa","vieira","van basten"]},
  personnage:{A:["alice","ariel","anakin","aragorn"],B:["bond","belle","bambi","batman"],C:["conan","cendrillon","captain jack","capitaine haddock"],D:["dory","dumbledore","darth vader","don quichotte"],E:["elsa","ethan hunt","emma bovary"],F:["frodo","frollo","forrest"],G:["groot","gollum","gaston","gandalf"],H:["hulk","hamlet","hermione","harry potter"],I:["ironman"],J:["joker","james bond","jean valjean"],K:["katniss","king kong"],L:["leia","luke","lolita","lecter"],M:["moana","merlin","matrice","magneto"],N:["neo","nemo"],O:["obelix","obiwan"],P:["padme","potter","pinocchio"],R:["rocky","romeo","rapunzel"],S:["scar","simba","sherlock","scarlett"],T:["thor","thanos","terminator"],V:["vaiana","voldemort"]},
};

const DAILY_CAT_WORDS = {};

function getAiAnswer(id, l, lang) {
  const dailyPool = DAILY_CAT_WORDS[id]?.[l] || [];
  if (dailyPool.length) return dailyPool[Math.floor(Math.random() * dailyPool.length)];
  // Use lang-specific word list if available
  if (lang === "en") {
    const enPool = [...(VALID_WORDS_EN[id]?.[l] || [])];
    if (enPool.length) return enPool[Math.floor(Math.random() * enPool.length)];
  }
  const pool = AI_ANSWERS[id]?.[l] || [];
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : "";
}

// ─── SCORE TOURNOI ────────────────────────────────────────────────────────
// Règles spéciales tournoi: unicité ++, vitesse ++, faux = disqualifié
function scoreAnswerTournoi(answer, allAnswers, categoryId, letter, lang, timeBonus) {
  if (!answer?.trim()) return { pts: -1, disqualified: true }; // vide = disqualifié
  if (!isValidAnswer(answer, categoryId, letter, lang)) return { pts: -2, disqualified: true }; // invalide = disqualifié
  const norm = normalizeWord(answer);
  const filled = allAnswers.map(a => a?.trim() ? normalizeWord(a) : "").filter(Boolean);
  const count = filled.filter(a => a === norm).length;
  // Unicité: seul à l'avoir = 10pts, 2 joueurs = 5pts, 3+ = 3pts
  let pts = count === 1 ? 10 : count === 2 ? 5 : 3;
  // Bonus vitesse: jusqu'à +5pts selon le temps restant
  if (timeBonus > 0) pts += Math.min(5, Math.round(timeBonus / 10));
  return { pts, disqualified: false };
}

function scoreAnswer(answer, allAnswers, categoryId, letter, lang) {
  if (!answer?.trim()) return 0;
  if (categoryId && letter && !isValidAnswer(answer, categoryId, letter, lang)) return -1;
  // Correspondance approximative (double lettre simplifiée) → plafonné à 1pt
  if (categoryId && letter && isApproxAnswer(answer, categoryId, letter, lang)) return 1;
  const norm = normalizeWord(answer);
  const nc = norm.replace(/ /g, "");
  // Comparer en forme compacte pour éviter "jean pierre" != "jeanpierre"
  const filled = allAnswers.map(a => a?.trim() ? normalizeWord(a).replace(/ /g, "") : "").filter(Boolean);
  const count = filled.filter(a => a === nc).length;
  return count === 1 ? 2 : count >= 2 ? 1 : 0;
}
function genCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

// ─── CSS ─────────────────────────────────────────────────────────
// Inject meta viewport to block zoom on iOS/Android
if (typeof document !== "undefined") {
  let mv = document.querySelector("meta[name=viewport]");
  if (!mv) { mv = document.createElement("meta"); mv.name = "viewport"; document.head.appendChild(mv); }
  mv.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no";
}

// ─── THÈMES ─────────────────────────────────────────────────────────
const THEMES = [
  { id:"light",   name:"Papier",      emoji:"📄", desc:"Blanc chaud & épuré",         preview:["#fafaf8","#4338ca","#18171a"], free:true  },
  { id:"dark",    name:"Minuit",       emoji:"🌑", desc:"Sombre & élégant",            preview:["#0c0c10","#818cf8","#e2e8f0"], free:true  },
  { id:"sakura",  name:"Sakura",       emoji:"🌸", desc:"Rose nacré japonais",         preview:["#fff0f6","#e879a0","#4a0028"], free:false },
  { id:"noir",    name:"Noir Absolu",  emoji:"🖤", desc:"AMOLED ultra sombre",         preview:["#000000","#facc15","#ffffff"], free:false },
  { id:"neon",    name:"Neon",         emoji:"⚡", desc:"Néon fluo sur fond sombre",   preview:["#0d0d1a","#39ff14","#ff0090"], free:false },
  { id:"sand",    name:"Sahara",       emoji:"🏜️", desc:"Sable doré & caramel",       preview:["#fef3c7","#d97706","#451a03"], free:false },
  { id:"nord",    name:"Nordique",     emoji:"🧊", desc:"Glace arctique & acier",      preview:["#ecf4f8","#5e81ac","#2e3440"], free:false },
  { id:"volcano", name:"Volcan",       emoji:"🌋", desc:"Magma rouge sang",            preview:["#1a0505","#ff3d00","#ffab40"], free:false },
  { id:"forest",  name:"Forêt",        emoji:"🌿", desc:"Vert profond & nature",       preview:["#0d1f0d","#4ade80","#bbf7d0"], free:false },
  { id:"ocean",   name:"Océan",        emoji:"🌊", desc:"Bleu abyssal & corail",       preview:["#020d18","#0ea5e9","#7dd3fc"], free:false },
  { id:"sunset",  name:"Coucher",      emoji:"🌅", desc:"Orange & violet crépuscule",  preview:["#1a0a1a","#f97316","#fbbf24"], free:false },
  { id:"galaxy",  name:"Galaxie",      emoji:"🌌", desc:"Violet cosmique étoilé",      preview:["#030014","#a855f7","#e879f9"], free:false },
];

const THEME_VARS = {
  light:{
    "--bg":"#F8FAFF","--sf":"#FFFFFF","--sf2":"#F0F4FF","--sf3":"#E8EEFF","--br":"#EDF2F7","--brh":"#CBD5E0",
    "--tx":"#2D3436","--txm":"#636E72","--txd":"#B2BEC3","--ac":"#6C5CE7","--acl":"#a855f7",
    "--acg":"rgba(108,92,231,0.15)","--acs":"rgba(108,92,231,0.08)","--ac-border":"rgba(108,92,231,0.25)",
    "--pk":"#FF6B8A","--pks":"rgba(255,107,138,0.1)",
    "--pro":"#0984e3","--prog":"rgba(9,132,227,0.1)","--vip":"#e17055","--vipg":"rgba(225,112,85,0.1)",
    "--gn":"#00B894","--gns":"rgba(0,184,148,0.1)","--gnb":"#00CEC9",
    "--yw":"#fdcb6e","--yws":"rgba(253,203,110,0.15)","--ywd":"#e0a800",
    "--rd":"#d63031","--rds":"rgba(214,48,49,0.08)","--or":"#e17055",
    "--r":"20px","--rs":"12px","--rm":"16px","--tr":"0.18s cubic-bezier(0.4,0,0.2,1)",
    "--s1":"0 2px 12px rgba(108,92,231,0.06),0 1px 3px rgba(0,0,0,0.04)","--s2":"0 4px 20px rgba(108,92,231,0.1),0 2px 6px rgba(0,0,0,0.06)","--s3":"0 12px 40px rgba(108,92,231,0.15),0 4px 12px rgba(0,0,0,0.08)",
    "--scard":"0 2px 20px rgba(108,92,231,0.08)","--spk":"0 8px 25px rgba(255,107,138,0.35)","--sac":"0 8px 25px rgba(108,92,231,0.35)",
    "--hdr-bg":"rgba(255,255,255,0.88)","--overlay-bg":"rgba(248,250,255,0.94)"
  },
  dark:{
    "--bg":"#0c0c10","--sf":"#16161d","--sf2":"#1e1e28","--sf3":"#26263a","--br":"#2e2e42","--brh":"#484870",
    "--tx":"#e2e8f0","--txm":"#94a3b8","--txd":"#64748b","--ac":"#818cf8","--acl":"#a5b4fc",
    "--acg":"rgba(129,140,248,0.18)","--acs":"rgba(129,140,248,0.1)","--ac-border":"rgba(129,140,248,0.3)",
    "--pk":"#f472b6","--pks":"rgba(244,114,182,0.12)",
    "--pro":"#38bdf8","--prog":"rgba(56,189,248,0.12)","--vip":"#fbbf24","--vipg":"rgba(251,191,36,0.12)",
    "--gn":"#4ade80","--gns":"rgba(74,222,128,0.12)","--gnb":"#34d399",
    "--yw":"#fbbf24","--yws":"rgba(251,191,36,0.12)","--ywd":"#fbbf24",
    "--rd":"#f87171","--rds":"rgba(248,113,113,0.12)","--or":"#fb923c",
    "--r":"20px","--rs":"12px","--rm":"16px","--tr":"0.15s cubic-bezier(0.4,0,0.2,1)",
    "--s1":"0 1px 6px rgba(0,0,0,0.35)","--s2":"0 3px 14px rgba(0,0,0,0.45)","--s3":"0 10px 32px rgba(0,0,0,0.55)",
    "--scard":"0 2px 12px rgba(0,0,0,0.35)","--spk":"0 8px 25px rgba(244,114,182,0.3)","--sac":"0 8px 25px rgba(129,140,248,0.3)",
    "--hdr-bg":"rgba(22,22,29,0.92)","--overlay-bg":"rgba(12,12,16,0.95)"
  },
  sakura:{
    "--bg":"#fff0f6","--sf":"#fff5f9","--sf2":"#ffe0ed","--sf3":"#ffc2d9","--br":"#ffadd2","--brh":"#f472b6",
    "--tx":"#4a0028","--txm":"#9d174d","--txd":"#db2777","--ac":"#e879a0","--acl":"#f472b6",
    "--acg":"rgba(232,121,160,0.15)","--acs":"rgba(232,121,160,0.08)","--ac-border":"rgba(232,121,160,0.3)",
    "--pro":"#0c6e9e","--prog":"rgba(12,110,158,0.09)","--vip":"#8a3a0a","--vipg":"rgba(138,58,10,0.09)",
    "--gn":"#166534","--gns":"rgba(22,101,52,0.09)","--yw":"#926208","--yws":"rgba(146,98,8,0.09)",
    "--rd":"#991b1b","--rds":"rgba(153,27,27,0.07)","--or":"#c2410c",
    "--r":"14px","--rs":"9px","--rm":"11px","--tr":"0.14s cubic-bezier(0.4,0,0.2,1)",
    "--s1":"0 1px 4px rgba(219,39,119,0.06)","--s2":"0 3px 10px rgba(219,39,119,0.07)","--s3":"0 10px 28px rgba(219,39,119,0.09)"
  },
  noir:{
    "--bg":"#000000","--sf":"#0a0a0a","--sf2":"#111111","--sf3":"#1a1a1a","--br":"#222222","--brh":"#333333",
    "--tx":"#ffffff","--txm":"#a0a0a0","--txd":"#606060","--ac":"#facc15","--acl":"#fde047",
    "--acg":"rgba(250,204,21,0.15)","--acs":"rgba(250,204,21,0.08)","--ac-border":"rgba(250,204,21,0.3)",
    "--pro":"#38bdf8","--prog":"rgba(56,189,248,0.1)","--vip":"#facc15","--vipg":"rgba(250,204,21,0.1)",
    "--gn":"#4ade80","--gns":"rgba(74,222,128,0.1)","--yw":"#facc15","--yws":"rgba(250,204,21,0.1)",
    "--rd":"#f87171","--rds":"rgba(248,113,113,0.1)","--or":"#fb923c",
    "--r":"14px","--rs":"9px","--rm":"11px","--tr":"0.14s cubic-bezier(0.4,0,0.2,1)",
    "--s1":"0 1px 4px rgba(0,0,0,0.5)","--s2":"0 3px 10px rgba(0,0,0,0.6)","--s3":"0 10px 28px rgba(0,0,0,0.7)"
  },
  neon:{
    "--bg":"#0d0d1a","--sf":"#111124","--sf2":"#16162e","--sf3":"#1c1c3a","--br":"#2a2a4a","--brh":"#39ff14",
    "--tx":"#e0e0ff","--txm":"#8080c0","--txd":"#4040a0","--ac":"#39ff14","--acl":"#7fff00",
    "--acg":"rgba(57,255,20,0.15)","--acs":"rgba(57,255,20,0.07)","--ac-border":"rgba(57,255,20,0.4)",
    "--pro":"#00cfff","--prog":"rgba(0,207,255,0.1)","--vip":"#ff0090","--vipg":"rgba(255,0,144,0.1)",
    "--gn":"#39ff14","--gns":"rgba(57,255,20,0.1)","--yw":"#ffe600","--yws":"rgba(255,230,0,0.1)",
    "--rd":"#ff3860","--rds":"rgba(255,56,96,0.1)","--or":"#ff6600",
    "--r":"14px","--rs":"9px","--rm":"11px","--tr":"0.14s cubic-bezier(0.4,0,0.2,1)",
    "--s1":"0 0 8px rgba(57,255,20,0.15)","--s2":"0 0 16px rgba(57,255,20,0.2)","--s3":"0 0 32px rgba(57,255,20,0.25)"
  },
  sand:{
    "--bg":"#fef3c7","--sf":"#fffbeb","--sf2":"#fde68a","--sf3":"#fcd34d","--br":"#f59e0b","--brh":"#d97706",
    "--tx":"#451a03","--txm":"#92400e","--txd":"#b45309","--ac":"#d97706","--acl":"#f59e0b",
    "--acg":"rgba(217,119,6,0.15)","--acs":"rgba(217,119,6,0.08)","--ac-border":"rgba(217,119,6,0.3)",
    "--pro":"#0c6e9e","--prog":"rgba(12,110,158,0.09)","--vip":"#7c3aed","--vipg":"rgba(124,58,237,0.09)",
    "--gn":"#166534","--gns":"rgba(22,101,52,0.09)","--yw":"#d97706","--yws":"rgba(217,119,6,0.09)",
    "--rd":"#991b1b","--rds":"rgba(153,27,27,0.07)","--or":"#c2410c",
    "--r":"14px","--rs":"9px","--rm":"11px","--tr":"0.14s cubic-bezier(0.4,0,0.2,1)",
    "--s1":"0 1px 4px rgba(180,83,9,0.08)","--s2":"0 3px 10px rgba(180,83,9,0.1)","--s3":"0 10px 28px rgba(180,83,9,0.12)"
  },
  nord:{
    "--bg":"#ecf4f8","--sf":"#ffffff","--sf2":"#ddeaf2","--sf3":"#c5dce9","--br":"#a8c8dd","--brh":"#5e81ac",
    "--tx":"#2e3440","--txm":"#4c566a","--txd":"#7b88a1","--ac":"#5e81ac","--acl":"#81a1c1",
    "--acg":"rgba(94,129,172,0.15)","--acs":"rgba(94,129,172,0.08)","--ac-border":"rgba(94,129,172,0.3)",
    "--pro":"#0c6e9e","--prog":"rgba(12,110,158,0.09)","--vip":"#8a3a0a","--vipg":"rgba(138,58,10,0.09)",
    "--gn":"#166534","--gns":"rgba(22,101,52,0.09)","--yw":"#926208","--yws":"rgba(146,98,8,0.09)",
    "--rd":"#991b1b","--rds":"rgba(153,27,27,0.07)","--or":"#c2410c",
    "--r":"14px","--rs":"9px","--rm":"11px","--tr":"0.14s cubic-bezier(0.4,0,0.2,1)",
    "--s1":"0 1px 4px rgba(46,52,64,0.06)","--s2":"0 3px 10px rgba(46,52,64,0.08)","--s3":"0 10px 28px rgba(46,52,64,0.1)"
  },
  volcano:{
    "--bg":"#1a0505","--sf":"#220a0a","--sf2":"#2d1010","--sf3":"#3d1515","--br":"#5c1a1a","--brh":"#ff3d00",
    "--tx":"#ffccbc","--txm":"#ff8a65","--txd":"#d84315","--ac":"#ff3d00","--acl":"#ff6e40",
    "--acg":"rgba(255,61,0,0.18)","--acs":"rgba(255,61,0,0.09)","--ac-border":"rgba(255,61,0,0.4)",
    "--pro":"#ffab40","--prog":"rgba(255,171,64,0.1)","--vip":"#ffd740","--vipg":"rgba(255,215,64,0.1)",
    "--gn":"#69f0ae","--gns":"rgba(105,240,174,0.1)","--yw":"#ffd740","--yws":"rgba(255,215,64,0.1)",
    "--rd":"#ff5252","--rds":"rgba(255,82,82,0.1)","--or":"#ff6d00",
    "--r":"14px","--rs":"9px","--rm":"11px","--tr":"0.14s cubic-bezier(0.4,0,0.2,1)",
    "--s1":"0 1px 4px rgba(255,61,0,0.15)","--s2":"0 3px 10px rgba(255,61,0,0.2)","--s3":"0 10px 28px rgba(255,61,0,0.25)"
  },
  forest:{
    "--bg":"#0d1f0d","--sf":"#122012","--sf2":"#173017","--sf3":"#1e401e","--br":"#2d5a2d","--brh":"#4ade80",
    "--tx":"#bbf7d0","--txm":"#86efac","--txd":"#4ade80","--ac":"#4ade80","--acl":"#86efac",
    "--acg":"rgba(74,222,128,0.18)","--acs":"rgba(74,222,128,0.09)","--ac-border":"rgba(74,222,128,0.4)",
    "--pro":"#34d399","--prog":"rgba(52,211,153,0.1)","--vip":"#fbbf24","--vipg":"rgba(251,191,36,0.1)",
    "--gn":"#4ade80","--gns":"rgba(74,222,128,0.12)","--yw":"#fbbf24","--yws":"rgba(251,191,36,0.1)",
    "--rd":"#f87171","--rds":"rgba(248,113,113,0.1)","--or":"#fb923c",
    "--r":"14px","--rs":"9px","--rm":"11px","--tr":"0.14s cubic-bezier(0.4,0,0.2,1)",
    "--s1":"0 1px 4px rgba(74,222,128,0.1)","--s2":"0 3px 10px rgba(74,222,128,0.15)","--s3":"0 10px 28px rgba(74,222,128,0.2)"
  },
  ocean:{
    "--bg":"#020d18","--sf":"#061220","--sf2":"#0a1a2e","--sf3":"#0e243e","--br":"#1a3a5c","--brh":"#0ea5e9",
    "--tx":"#e0f2fe","--txm":"#7dd3fc","--txd":"#38bdf8","--ac":"#0ea5e9","--acl":"#38bdf8",
    "--acg":"rgba(14,165,233,0.18)","--acs":"rgba(14,165,233,0.09)","--ac-border":"rgba(14,165,233,0.4)",
    "--pro":"#22d3ee","--prog":"rgba(34,211,238,0.1)","--vip":"#f0abfc","--vipg":"rgba(240,171,252,0.1)",
    "--gn":"#34d399","--gns":"rgba(52,211,153,0.1)","--yw":"#fbbf24","--yws":"rgba(251,191,36,0.1)",
    "--rd":"#f87171","--rds":"rgba(248,113,113,0.1)","--or":"#fb923c",
    "--r":"14px","--rs":"9px","--rm":"11px","--tr":"0.14s cubic-bezier(0.4,0,0.2,1)",
    "--s1":"0 1px 4px rgba(14,165,233,0.15)","--s2":"0 3px 10px rgba(14,165,233,0.2)","--s3":"0 10px 28px rgba(14,165,233,0.25)"
  },
  sunset:{
    "--bg":"#1a0a1a","--sf":"#220f22","--sf2":"#2e162e","--sf3":"#3d1f3d","--br":"#6b2d6b","--brh":"#f97316",
    "--tx":"#fde8d0","--txm":"#fbbf24","--txd":"#f97316","--ac":"#f97316","--acl":"#fb923c",
    "--acg":"rgba(249,115,22,0.18)","--acs":"rgba(249,115,22,0.09)","--ac-border":"rgba(249,115,22,0.4)",
    "--pro":"#e879f9","--prog":"rgba(232,121,249,0.1)","--vip":"#fbbf24","--vipg":"rgba(251,191,36,0.1)",
    "--gn":"#4ade80","--gns":"rgba(74,222,128,0.1)","--yw":"#fbbf24","--yws":"rgba(251,191,36,0.1)",
    "--rd":"#f87171","--rds":"rgba(248,113,113,0.1)","--or":"#fb923c",
    "--r":"14px","--rs":"9px","--rm":"11px","--tr":"0.14s cubic-bezier(0.4,0,0.2,1)",
    "--s1":"0 1px 4px rgba(249,115,22,0.15)","--s2":"0 3px 10px rgba(249,115,22,0.2)","--s3":"0 10px 28px rgba(249,115,22,0.25)"
  },
  galaxy:{
    "--bg":"#030014","--sf":"#080024","--sf2":"#0d0030","--sf3":"#120040","--br":"#2d1b69","--brh":"#a855f7",
    "--tx":"#f3e8ff","--txm":"#d8b4fe","--txd":"#c084fc","--ac":"#a855f7","--acl":"#c084fc",
    "--acg":"rgba(168,85,247,0.18)","--acs":"rgba(168,85,247,0.09)","--ac-border":"rgba(168,85,247,0.4)",
    "--pro":"#e879f9","--prog":"rgba(232,121,249,0.12)","--vip":"#fbbf24","--vipg":"rgba(251,191,36,0.1)",
    "--gn":"#4ade80","--gns":"rgba(74,222,128,0.1)","--yw":"#fbbf24","--yws":"rgba(251,191,36,0.1)",
    "--rd":"#f87171","--rds":"rgba(248,113,113,0.1)","--or":"#fb923c",
    "--r":"14px","--rs":"9px","--rm":"11px","--tr":"0.14s cubic-bezier(0.4,0,0.2,1)",
    "--s1":"0 0 8px rgba(168,85,247,0.2)","--s2":"0 0 20px rgba(168,85,247,0.25)","--s3":"0 0 40px rgba(168,85,247,0.3)"
  },
};

// Apply theme CSS variables dynamically
function applyTheme(themeId) {
  const base = THEME_VARS[themeId] || THEME_VARS.light;
  const vars = { ...base };
  // Calcul automatique des overlays de verre si non définis
  if (!vars["--hdr-bg"] || !vars["--overlay-bg"]) {
    const bg = vars["--bg"] || "#F8FAFF";
    const r = parseInt(bg.slice(1,3)||"F8", 16);
    const isDark = r < 60;
    if (!vars["--hdr-bg"]) {
      vars["--hdr-bg"] = isDark
        ? `rgba(${r},${parseInt(bg.slice(3,5)||"F8",16)},${parseInt(bg.slice(5,7)||"FF",16)},0.92)`
        : "rgba(255,255,255,0.88)";
    }
    if (!vars["--overlay-bg"]) {
      vars["--overlay-bg"] = isDark
        ? `rgba(${r},${parseInt(bg.slice(3,5)||"F8",16)},${parseInt(bg.slice(5,7)||"FF",16)},0.96)`
        : "rgba(248,250,255,0.94)";
    }
  }
  if (typeof document !== "undefined") {
    Object.entries(vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
  }
}

const css = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

/* ─── Mobile / iOS fixes ─── */
* { -webkit-tap-highlight-color: transparent; }
body { overscroll-behavior: none; -webkit-overflow-scrolling: touch; }
input, textarea, select { font-size: 16px !important; }
button { cursor: pointer; -webkit-appearance: none; }

/* ─── Safe Area iPhone X+ ─── */
.app{padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}
.bnav{padding-bottom:calc(10px + env(safe-area-inset-bottom))}
.hdr{padding-top:max(18px,calc(14px + env(safe-area-inset-top)));margin-top:0}
html{touch-action:manipulation;-ms-touch-action:manipulation}
input,select,textarea{font-size:16px !important;touch-action:manipulation}

:root{
  /* ── Palette Premium ── */
  --bg:#F8FAFF;
  --sf:#FFFFFF;
  --sf2:#F0F4FF;
  --sf3:#E8EEFF;

  /* ── Textes ── */
  --br:#EDF2F7;
  --brh:#CBD5E0;
  --tx:#2D3436;
  --txm:#636E72;
  --txd:#B2BEC3;

  /* ── Accent principal : violet/indigo vibrant ── */
  --ac:#6C5CE7;
  --acl:#a855f7;
  --acg:rgba(108,92,231,0.15);
  --acs:rgba(108,92,231,0.08);
  --ac-border:rgba(108,92,231,0.25);

  /* ── Accent secondaire : rose/coral ── */
  --pk:#FF6B8A;
  --pks:rgba(255,107,138,0.1);

  /* ── Success : vert menthe ── */
  --gn:#00B894;
  --gns:rgba(0,184,148,0.1);
  --gnb:#00CEC9;

  /* Couleurs fonctionnelles */
  --pro:#0984e3;--prog:rgba(9,132,227,0.1);
  --vip:#e17055;--vipg:rgba(225,112,85,0.1);
  --yw:#fdcb6e;--yws:rgba(253,203,110,0.15);
  --ywd:#e0a800;
  --rd:#d63031;--rds:rgba(214,48,49,0.08);
  --or:#e17055;

  /* Espacements & effets */
  --r:20px;--rs:12px;--rm:16px;--tr:0.18s cubic-bezier(0.4,0,0.2,1);
  --s1:0 2px 12px rgba(108,92,231,0.06),0 1px 3px rgba(0,0,0,0.04);
  --s2:0 4px 20px rgba(108,92,231,0.1),0 2px 6px rgba(0,0,0,0.06);
  --s3:0 12px 40px rgba(108,92,231,0.15),0 4px 12px rgba(0,0,0,0.08);
  --scard:0 2px 20px rgba(108,92,231,0.08);
  --spk:0 8px 25px rgba(255,107,138,0.35);
  --sac:0 8px 25px rgba(108,92,231,0.35);
}

body{font-family:"Nunito",sans-serif;background:var(--bg);color:var(--tx);min-height:100vh;min-height:100dvh;overflow-x:hidden;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}
.app{max-width:430px;margin:0 auto;min-height:100vh;min-height:100dvh;display:flex;flex-direction:column;background:var(--bg)}

/* ─── HEADER ─── */
.hdr{
  padding:18px 20px 16px;
  display:flex;align-items:center;justify-content:space-between;
  background:var(--hdr-bg, rgba(255,255,255,0.88));
  border-bottom:1px solid var(--br);
  flex-shrink:0;
  box-shadow:0 2px 20px rgba(0,0,0,0.06);
  backdrop-filter:blur(24px);
  -webkit-backdrop-filter:blur(24px);
  position:sticky;top:0;z-index:10;
}
.logo{
  font-size:22px;font-weight:900;letter-spacing:-.5px;color:var(--tx);
}
.logo span{
  background:linear-gradient(135deg,#6C5CE7,#FF6B8A);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}

/* ─── BOTTOM NAV ─── */
.bnav{
  display:flex;gap:2px;padding:10px 8px 12px;
  border-top:1px solid var(--br);
  background:var(--hdr-bg, rgba(255,255,255,0.92));
  backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);
  margin-top:auto;flex-shrink:0;
  box-shadow:0 -4px 28px rgba(0,0,0,0.08);
}
.nb{
  flex:1;padding:8px 4px 6px;border:none;background:transparent;
  color:var(--txm);border-radius:14px;font-family:inherit;
  font-size:10px;font-weight:700;cursor:pointer;
  transition:all var(--tr);display:flex;flex-direction:column;align-items:center;gap:4px;
  position:relative;
}
.nb::before{
  content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);
  width:0;height:3px;border-radius:0 0 3px 3px;
  background:linear-gradient(135deg,#6C5CE7,#a855f7);
  transition:all var(--tr);
}
.nb.active::before{width:28px}
.nb.active{color:var(--ac);font-weight:800}
.nb.active .ni{transform:scale(1.2);filter:drop-shadow(0 3px 6px rgba(108,92,231,0.4))}
.ni{font-size:20px;transition:all var(--tr)}

/* ─── CONTENT ─── */
.cnt{flex:1;padding:18px 16px;overflow-y:auto;padding-bottom:28px}

/* ─── CARDS ─── */
.card{
  background:var(--sf);border:1px solid var(--br);
  border-radius:var(--r);padding:20px 20px;margin-bottom:14px;
  box-shadow:var(--scard);transition:all var(--tr);
}
.ctitle{font-size:11px;font-weight:800;color:var(--txm);text-transform:uppercase;letter-spacing:1.6px;margin-bottom:16px}

/* ─── BOUTONS ─── */
.btn{
  display:inline-flex;align-items:center;justify-content:center;gap:8px;
  padding:16px 20px;border-radius:16px;font-family:inherit;
  font-size:15px;font-weight:800;cursor:pointer;
  transition:all var(--tr);border:none;width:100%;
  letter-spacing:.2px;
}
.bp{
  background:linear-gradient(135deg,#6C5CE7,#a855f7);
  color:#fff;box-shadow:var(--sac);
}
.bp:hover{
  transform:translateY(-2px) scale(1.01);
  box-shadow:0 12px 32px rgba(108,92,231,0.45);
}
.bp:active{transform:scale(0.97);box-shadow:0 4px 12px rgba(108,92,231,0.3)}
.bpro{
  background:linear-gradient(135deg,#0984e3,#74b9ff);
  color:#fff;box-shadow:0 8px 25px rgba(9,132,227,0.35);
}
.bpro:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(9,132,227,0.45)}
.bvip{
  background:linear-gradient(135deg,#e17055,#fdcb6e);
  color:#fff;box-shadow:0 8px 25px rgba(225,112,85,0.35);
}
.bvip:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(225,112,85,0.45)}
.bs{
  background:var(--sf);color:var(--ac);
  border:1.5px solid var(--ac-border);
  box-shadow:var(--s1);
}
.bs:hover{
  border-color:var(--ac);background:var(--acs);
  box-shadow:var(--s2);transform:translateY(-1px);
}
.btn:disabled{opacity:.38;cursor:default;transform:none!important;box-shadow:none}
.bsm{padding:10px 16px;font-size:13px;width:auto;border-radius:12px}

/* ─── BADGES TIER ─── */
.badge{display:inline-flex;align-items:center;gap:4px;padding:5px 12px;border-radius:20px;font-size:11px;font-weight:800;letter-spacing:.3px;cursor:pointer;border:none;font-family:inherit;transition:all var(--tr)}
.bfree{background:var(--gns);color:var(--gn);border:1.5px solid rgba(0,184,148,0.25)}
.bprobadge{background:var(--prog);color:var(--pro);border:1.5px solid rgba(9,132,227,0.25)}
.bvipbadge{background:var(--vipg);color:var(--vip);border:1.5px solid rgba(225,112,85,0.25)}

/* ─── DIFFICULTY BUTTONS ─── */
.dg{display:flex;gap:8px}
.db{
  flex:1;padding:13px 6px;border-radius:14px;
  border:1.5px solid var(--br);background:var(--sf);
  font-family:inherit;font-size:12px;font-weight:700;
  cursor:pointer;transition:all var(--tr);
  color:var(--txm);text-align:center;box-shadow:var(--s1);
}
.db.sel{color:#fff;border-color:transparent;box-shadow:var(--s2)}
.dd{width:10px;height:10px;border-radius:50%;margin:0 auto 6px}

/* ─── ROUNDS ─── */
.rounds-grid{display:flex;gap:8px}
.rb{
  flex:1;padding:14px 5px;border-radius:14px;
  border:1.5px solid var(--br);background:var(--sf);
  font-family:inherit;font-size:20px;font-weight:900;
  cursor:pointer;transition:all var(--tr);
  color:var(--txm);text-align:center;box-shadow:var(--s1);
}
.rb.sel{
  background:linear-gradient(135deg,#6C5CE7,#a855f7);
  border-color:transparent;color:#fff;
  box-shadow:var(--sac);transform:scale(1.04);
}

/* ─── CATEGORIES CHIPS ─── */
.cg{display:flex;flex-wrap:wrap;gap:8px}
.ct{
  display:flex;align-items:center;gap:5px;padding:8px 14px;
  border-radius:20px;border:1.5px solid var(--br);
  background:var(--sf);font-family:inherit;font-size:12px;
  color:var(--txm);cursor:pointer;transition:all var(--tr);
  box-shadow:var(--s1);font-weight:600;
}
.ct.on,.ct.ct-on{
  background:var(--acs);border-color:var(--ac);
  color:var(--ac);font-weight:800;
  box-shadow:0 4px 12px rgba(108,92,231,0.2);
}
.ct.pro-c{border-color:rgba(9,132,227,0.2)}.ct.pro-c.on{border-color:var(--pro);background:var(--prog);color:var(--pro)}
.ct.vip-c{border-color:rgba(225,112,85,0.2)}.ct.vip-c.on{border-color:var(--vip);background:var(--vipg);color:var(--vip)}

/* ─── INPUT ─── */
.inp{
  background:var(--sf2);border:1.5px solid var(--br);
  border-radius:14px;padding:14px 16px;
  font-family:inherit;font-size:16px;color:var(--tx);
  width:100%;transition:all var(--tr);outline:none;font-weight:600;
}
.inp:focus{
  border-color:var(--ac);
  box-shadow:0 0 0 4px rgba(108,92,231,0.12);
  background:var(--sf);
}
.inp::placeholder{color:var(--txd);font-weight:500}
select.inp{appearance:none;cursor:pointer}

/* ─── ONLINE MODE CARDS ─── */
.online-modes{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px}
.mode-card{
  padding:20px 14px;border-radius:var(--r);border:1.5px solid var(--br);
  background:var(--sf);cursor:pointer;transition:all var(--tr);
  text-align:center;box-shadow:var(--s1);
}
.mode-card:hover{border-color:var(--ac);box-shadow:var(--s2);transform:translateY(-2px)}
.mode-card.sel{
  border-color:var(--ac);background:var(--acs);
  box-shadow:0 6px 20px rgba(108,92,231,0.2);
}
.mode-icon{font-size:32px;margin-bottom:10px}
.mode-title{font-size:14px;font-weight:800;margin-bottom:4px;color:var(--tx)}
.mode-desc{font-size:11px;color:var(--txm);line-height:1.4;font-weight:600}

/* ─── ROOM CODE ─── */
.rc{
  font-family:inherit;font-size:40px;font-weight:900;text-align:center;
  letter-spacing:12px;color:var(--ac);padding:20px 0;
  background:linear-gradient(135deg,rgba(108,92,231,0.06),rgba(168,85,247,0.06));
  border-radius:var(--rm);margin:10px 0;
  border:2px dashed rgba(108,92,231,0.25);
}

/* ─── PLAYER ITEM ─── */
.pi{display:flex;align-items:center;gap:12px;padding:13px 15px;background:var(--sf2);border-radius:var(--rm);border:1.5px solid var(--br);margin-bottom:10px}
.pav{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;flex-shrink:0}
.pav-human{background:linear-gradient(135deg,#6C5CE7,#a855f7);color:#fff;box-shadow:0 4px 12px rgba(108,92,231,0.3)}
.pav-guest{background:var(--sf3);color:var(--txm)}
.pn{font-weight:700;font-size:14px;color:var(--tx)}.ps{font-size:11px;color:var(--txm);font-weight:600}
.hbadge{margin-left:auto;font-size:10px;padding:4px 10px;border-radius:20px;background:var(--acs);color:var(--ac);font-weight:800}
.rbadge{margin-left:auto;font-size:10px;padding:4px 10px;border-radius:20px;background:var(--gns);color:var(--gn);font-weight:800}
.wbadge{margin-left:auto;font-size:10px;padding:4px 10px;border-radius:20px;background:var(--yws);color:var(--ywd)}

/* ─── MATCHMAKING ─── */
.mm-box{text-align:center;padding:48px 24px}
.mm-spinner{
  width:60px;height:60px;
  border:3px solid var(--br);border-top-color:var(--ac);
  border-radius:50%;animation:spin 0.9s linear infinite;
  margin:0 auto 24px;
}
.mm-title{font-size:18px;font-weight:800;margin-bottom:8px;color:var(--tx)}
.mm-sub{font-size:13px;color:var(--txm);font-weight:600}
.mm-country{font-size:12px;color:var(--ac);margin-top:10px;font-weight:800}

/* ─── ROULETTE ─── */
.roul{
  position:fixed;inset:0;
  background:var(--overlay-bg, rgba(248,250,255,0.96));
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  z-index:200;backdrop-filter:blur(32px);-webkit-backdrop-filter:blur(32px);
  animation:fadeIn .2s ease;
}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.roul-title{
  font-size:13px;font-weight:800;color:var(--txm);
  letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;
}
.roul-turn{
  font-size:16px;color:var(--tx);margin-bottom:40px;
  text-align:center;padding:0 40px;font-weight:700;
}
.roul-drum{
  position:relative;width:220px;height:220px;
  display:flex;align-items:center;justify-content:center;margin-bottom:44px;
}
.roul-ring{
  position:absolute;inset:0;border-radius:50%;
  border:2px solid var(--ac);opacity:.2;
  animation:ringPulse 2s ease-in-out infinite;
}
@keyframes ringPulse{0%,100%{transform:scale(1);opacity:.2}50%{transform:scale(1.04);opacity:.35}}
.roul-ring2{
  position:absolute;inset:20px;border-radius:50%;
  border:1.5px dashed var(--acl);opacity:.15;
  animation:ringPulse 2s ease-in-out infinite reverse;
}
.roul-ring3{
  position:absolute;inset:40px;border-radius:50%;
  background:var(--acs);border:1px solid var(--ac-border);
}
.roul-l{
  font-family:inherit;font-size:110px;font-weight:900;
  line-height:1;user-select:none;position:relative;z-index:1;
  color:var(--ac);
  filter:drop-shadow(0 6px 24px rgba(108,92,231,0.4));
  text-shadow:none;
}
.roul-l.spin{animation:rSpin .07s linear infinite}
@keyframes rSpin{0%{opacity:.3;transform:scale(.8) rotate(-5deg)}50%{opacity:1;transform:scale(1.15) rotate(5deg)}100%{opacity:.3;transform:scale(.8) rotate(-5deg)}}
.roul-l.lock{animation:rLock .6s cubic-bezier(.34,1.56,.64,1) forwards}
@keyframes rLock{from{transform:scale(.1) rotate(-30deg);opacity:0}60%{transform:scale(1.15) rotate(5deg);opacity:1}to{transform:scale(1) rotate(0);opacity:1}}
.roul-btn{
  padding:18px 64px;
  background:linear-gradient(135deg,var(--ac),var(--acl));
  color:#fff;border:none;border-radius:50px;
  font-family:inherit;font-size:17px;font-weight:900;
  cursor:pointer;box-shadow:var(--sac);
  transition:all var(--tr);letter-spacing:.6px;
  animation:pBtn 2s ease-in-out infinite;
}
@keyframes pBtn{0%,100%{transform:scale(1);box-shadow:0 6px 24px rgba(108,92,231,0.35)}50%{transform:scale(1.03);box-shadow:0 10px 36px rgba(108,92,231,0.55)}}
.roul-btn:active{transform:scale(0.97)!important;animation:none}
.roul-btn:disabled{opacity:.4;animation:none;cursor:default;transform:none}
.roul-waiting{
  padding:16px 40px;background:var(--sf);color:var(--txm);
  border:1.5px solid var(--br);border-radius:50px;
  font-family:inherit;font-size:14px;font-weight:700;box-shadow:var(--s1);
}

/* ─── GAME SCREEN ─── */
.gwrap{display:flex;flex-direction:column;height:100vh;height:100dvh;overflow:hidden;background:var(--bg)}
.ghdr{
  padding:14px 18px;border-bottom:1px solid var(--br);
  display:flex;align-items:center;gap:14px;flex-shrink:0;
  background:var(--hdr-bg, rgba(255,255,255,0.9));
  backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);
  box-shadow:0 2px 20px rgba(0,0,0,0.07);
}
.glbadge{
  font-size:30px;font-weight:900;
  background:var(--acs);
  border:2px solid var(--ac-border);border-radius:14px;
  padding:6px 16px;box-shadow:0 4px 16px rgba(108,92,231,0.2);
  color:var(--ac);min-width:56px;text-align:center;
}
.tbar-w{flex:1;min-width:0}
.tbar{height:8px;background:var(--sf3);border-radius:8px;overflow:hidden}
.tfill{
  height:100%;border-radius:8px;
  transition:width 1s linear,background-color .4s;
  box-shadow:0 0 10px currentColor;
}
.ttxt{font-size:13px;font-weight:900;color:var(--txm);margin-top:4px;text-align:right;letter-spacing:-.3px}
.round-badge{font-size:12px;color:var(--txm);text-align:right;line-height:1.6;flex-shrink:0;font-weight:800}

/* ─── CATEGORY LIST ─── */
.catlist{flex:1;overflow-y:auto;overflow-x:hidden;padding:12px 14px 8px;display:flex;flex-direction:column;gap:10px}
.catrow{
  display:flex;align-items:center;gap:12px;
  background:var(--sf);border:1.5px solid var(--br);
  border-radius:18px;padding:0 14px 0 12px;
  min-height:62px;transition:all var(--tr);
  box-shadow:var(--s1);
}
.catrow.active{
  border-color:var(--ac);background:var(--sf);
  box-shadow:0 6px 20px rgba(108,92,231,0.18);
  transform:scale(1.015);
}
.catrow.past-valid{border-color:rgba(0,184,148,0.35);background:rgba(0,184,148,0.04)}
.catrow.past-shared{border-color:rgba(253,203,110,0.4);background:rgba(253,203,110,0.04)}
.catrow.past-invalid{border-color:rgba(214,48,49,0.25);background:rgba(214,48,49,0.04)}
.catrow.past-empty{opacity:.4}
.cat-emoji{font-size:22px;flex-shrink:0;width:28px;text-align:center}
.cat-label{
  font-size:11px;color:var(--txm);font-weight:800;
  flex-shrink:0;width:80px;letter-spacing:.2px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
  text-transform:uppercase;
}
.cat-input{
  flex:1;background:transparent;border:none;outline:none;
  font-family:inherit;font-size:16px;color:var(--tx);
  padding:14px 0;min-width:0;touch-action:manipulation;font-weight:700;
}
.cat-input::placeholder{color:var(--txd);font-size:14px;font-weight:500}
.cat-pts{font-family:inherit;font-size:13px;font-weight:800;flex-shrink:0;min-width:28px;text-align:right}
.cat-pts.v2{color:var(--gn)}.cat-pts.v1{color:var(--ywd)}.cat-pts.vm{color:var(--rd)}.cat-pts.v0{color:var(--txd)}

/* ─── ROUND SEPARATORS ─── */
.round-sep{
  font-size:10px;font-weight:800;color:var(--txm);
  letter-spacing:1.2px;padding:12px 2px 4px;
  text-transform:uppercase;display:flex;align-items:center;gap:8px;
}
.round-sep-line{flex:1;height:1px;background:var(--br)}
.round-total-chip{
  font-family:inherit;font-size:11px;color:var(--ywd);
  background:var(--yws);border:1px solid rgba(253,203,110,0.3);
  border-radius:20px;padding:3px 10px;font-weight:800;
}

/* ─── PAST CAT ROW ─── */
.catrow-past{
  display:flex;align-items:center;gap:10px;background:var(--sf);
  border:1.5px solid var(--br);border-radius:14px;
  padding:10px 14px 10px 12px;opacity:.7;
}
.past-answer{flex:1;font-size:13px;color:var(--txd);font-weight:600}
.past-answer.v2{color:var(--gn);font-weight:700}.past-answer.v1{color:var(--ywd);font-weight:700}
.past-answer.vm{color:var(--rd);text-decoration:line-through}.past-answer.v0{color:var(--txd);font-style:italic}

/* ─── SUBMIT BAR ─── */
.sbar{
  padding:12px 16px 20px;border-top:1px solid var(--br);
  background:var(--hdr-bg, rgba(255,255,255,0.95));flex-shrink:0;
  backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);
}
.sbtn{
  width:100%;padding:18px;
  background:linear-gradient(135deg,#6C5CE7,#a855f7);
  color:#fff;border:none;border-radius:18px;
  font-family:inherit;font-size:17px;font-weight:900;
  cursor:pointer;box-shadow:var(--sac);
  transition:all var(--tr);letter-spacing:.5px;
  touch-action:manipulation;
}
.sbtn:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(108,92,231,0.5)}
.sbtn:active{transform:scale(0.97);opacity:.9}
.sbtn:disabled{opacity:.3;cursor:default;box-shadow:none;transform:none}

/* ─── DONE BAR ─── */
.done-bar{
  display:flex;gap:6px;padding:10px 16px;
  border-bottom:1px solid var(--br);
  background:var(--sf2);flex-shrink:0;flex-wrap:wrap;
}
.done-chip{
  font-size:10px;padding:4px 10px;border-radius:20px;
  border:1.5px solid var(--br);color:var(--txm);
  font-weight:700;background:var(--sf);
}
.done-chip.done{
  background:var(--gns);border-color:rgba(0,184,148,0.3);color:var(--gn);
}

/* ─── RESULTS OVERLAY ─── */
.rov{
  position:fixed;inset:0;
  background:var(--overlay-bg, rgba(248,250,255,0.88));
  display:flex;align-items:flex-end;justify-content:center;
  z-index:150;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
}
.rpanel{
  background:var(--sf);border:1px solid var(--br);
  border-radius:32px 32px 0 0;padding:8px 20px 32px;
  width:100%;max-width:430px;max-height:90vh;overflow-y:auto;
  animation:mUp .3s cubic-bezier(.34,1.2,.64,1);
  box-shadow:0 -8px 48px rgba(0,0,0,0.12);
}
/* Handle bar iOS style */
.rpanel::before,.modal::before{
  content:'';display:block;width:40px;height:4px;
  background:var(--brh);border-radius:2px;
  margin:0 auto 20px;
}

/* ─── SCORES TABLE ─── */
.stable{width:100%;border-collapse:collapse;margin-bottom:16px}
.stable th{
  background:var(--sf2);padding:10px 12px;
  font-size:10px;font-weight:800;color:var(--txm);
  text-align:center;letter-spacing:1px;
  border:1.5px solid var(--br);text-transform:uppercase;
}
.stable td{
  padding:10px 12px;border:1.5px solid var(--br);
  text-align:center;font-size:12px;color:var(--tx);background:var(--sf);
  font-weight:600;
}
.stable tr:nth-child(even) td{background:var(--sf2)}
.td-player{text-align:left!important;font-weight:800}
.td-pts{font-family:inherit;font-weight:800;font-size:12px}
.pts-2{color:var(--gn)}.pts-1{color:var(--ywd)}.pts-0{color:var(--txd)}
.td-total{font-family:inherit;font-weight:900;color:var(--ac);font-size:14px}

/* ─── SCORE ROW ─── */
.srow{
  display:flex;align-items:center;gap:14px;
  padding:16px 18px;background:var(--sf);
  border-radius:18px;border:1.5px solid var(--br);
  margin-bottom:10px;box-shadow:var(--s1);
  transition:all var(--tr);
}
.srow.win{
  border-color:var(--ac-border);
  background:linear-gradient(135deg,var(--acs),rgba(168,85,247,0.06));
  box-shadow:var(--s2);
}
.srank{font-size:20px;font-weight:900;width:32px;color:var(--txm);flex-shrink:0}
.sname{flex:1;font-weight:700;font-size:15px;color:var(--tx)}
.spts{font-size:22px;font-weight:900;color:var(--ac)}

/* ─── HERO SECTION ─── */
.hero{text-align:center;padding:24px 0 18px}
.htitle{
  font-size:36px;font-weight:900;letter-spacing:-1.5px;margin-bottom:8px;
  background:linear-gradient(135deg,var(--ac) 0%,var(--acl) 50%,var(--pk,#FF6B8A) 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  background-size:200% 200%;
  animation:gradientShift 6s ease infinite;
}
.hsub{
  color:var(--txm);font-size:13px;line-height:1.7;font-weight:600;
  max-width:280px;margin:0 auto;
}
.sgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
.scard{
  background:var(--sf);border:1.5px solid var(--br);
  border-radius:20px;padding:18px 12px;text-align:center;
  box-shadow:var(--scard);transition:all var(--tr);
}
.scard:hover{transform:translateY(-2px);box-shadow:var(--s2)}
.snum{font-size:30px;font-weight:900;color:var(--ac);letter-spacing:-.5px}
.slbl{font-size:10px;color:var(--txm);margin-top:4px;font-weight:800;text-transform:uppercase;letter-spacing:.8px}

/* ─── MODAL ─── */
.mov{
  position:fixed;inset:0;
  background:var(--overlay-bg, rgba(248,250,255,0.85));
  display:flex;align-items:flex-end;justify-content:center;
  z-index:100;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
}
.modal{
  background:var(--sf);border:1px solid var(--br);
  border-radius:32px 32px 0 0;padding:8px 22px 36px;
  width:100%;max-width:430px;
  animation:mUp .3s cubic-bezier(.34,1.15,.64,1);
  box-shadow:0 -8px 48px rgba(0,0,0,0.12);
}
@keyframes mUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
.mtitle{font-size:20px;font-weight:900;margin-bottom:6px}
.msub{color:var(--txm);font-size:13px;margin-bottom:18px;font-weight:600}
.tcards{display:flex;flex-direction:column;gap:10px;margin-bottom:18px}
.tcard{
  padding:16px 18px;border-radius:16px;border:1.5px solid var(--br);
  cursor:pointer;transition:all var(--tr);background:var(--sf);box-shadow:var(--s1);
}
.tcard:hover{box-shadow:var(--s2);transform:translateY(-2px)}
.tc-pro.tsel{border-color:var(--pro);background:var(--prog)}
.tc-vip.tsel{border-color:var(--vip);background:var(--vipg)}
.tc-free.tsel{border-color:var(--ac);background:var(--acs)}
.tn{font-weight:800;font-size:15px;margin-bottom:2px}
.tp{font-size:12px;color:var(--txm);margin-bottom:6px;font-weight:600}
.tf{font-size:11px;color:var(--txm);line-height:1.8;white-space:pre-line;font-weight:600}

/* ─── FIREBASE BANNER ─── */
.fb-banner{
  background:rgba(225,112,85,0.07);border:1.5px solid rgba(225,112,85,0.2);
  border-radius:var(--rm);padding:14px 16px;margin-bottom:16px;
}
.fb-title{font-size:12px;font-weight:800;color:var(--or);margin-bottom:4px}
.fb-desc{font-size:11px;color:var(--txm);line-height:1.6;font-weight:600}

.div{height:1px;background:var(--br);margin:14px 0}

/* ─── XP BAR ─── */
.xp-bar-wrap{display:flex;align-items:center;gap:8px;padding:8px 18px 0;flex-shrink:0}
.xp-label{font-size:10px;color:var(--txm);font-weight:800;white-space:nowrap}
.xp-bar{flex:1;height:6px;background:var(--sf3);border-radius:6px;overflow:hidden}
.xp-fill{
  height:100%;
  background:linear-gradient(90deg,#6C5CE7,#a855f7,#FF6B8A);
  border-radius:6px;transition:width 1s cubic-bezier(0.4,0,0.2,1);
  box-shadow:0 0 8px rgba(108,92,231,0.5);
  animation:xpShimmer 2s ease-in-out infinite;
}
@keyframes xpShimmer{0%,100%{opacity:1}50%{opacity:.85}}

/* ─── LEVEL CHIP ─── */
.level-chip{
  display:inline-flex;align-items:center;gap:5px;
  padding:5px 12px;
  background:linear-gradient(135deg,rgba(108,92,231,0.1),rgba(168,85,247,0.1));
  border:1.5px solid var(--ac-border);
  border-radius:20px;font-size:11px;font-weight:800;color:var(--ac);
  cursor:pointer;white-space:nowrap;
  box-shadow:0 2px 8px rgba(108,92,231,0.15);
}

/* ─── ANIMATIONS ─── */
@keyframes bounce{0%{transform:scale(0.5);opacity:0}60%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
@keyframes slideDown{from{transform:translateX(-50%) translateY(-20px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}
@keyframes fadeInUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}

/* ─── FRIENDS ─── */
.friend-status-err{color:var(--rd,#e74c3c);font-size:13px;font-weight:700;margin-bottom:10px;padding:8px 12px;background:var(--rds,rgba(231,76,60,.08));border-radius:10px}
.friend-status-ok{color:var(--gn,#00b894);font-size:13px;font-weight:700;margin-bottom:10px;padding:8px 12px;background:var(--gns,rgba(0,184,148,.08));border-radius:10px}

/* ─── POINTS PILLS ─── */
.pts-pill{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:800}
.pts-pill-gn{background:var(--gns);color:var(--gn)}
.pts-pill-yw{background:var(--yws);color:var(--ywd)}
.pts-pill-rd{background:var(--rds);color:var(--rd)}

/* ─── TOURNAMENT CARD ─── */
.tournament-card{
  border-radius:22px;padding:20px 20px;
  background:linear-gradient(135deg,#FF6B8A,#e84393,#d63081);
  color:#fff;margin-bottom:12px;cursor:pointer;
  transition:all var(--tr);border:none;width:100%;text-align:left;
  box-shadow:var(--spk);position:relative;overflow:hidden;
}
.tournament-card::after{
  content:'🏆';position:absolute;right:-8px;bottom:-12px;
  font-size:80px;opacity:.12;
}
.tournament-card:hover{transform:translateY(-3px);box-shadow:0 14px 40px rgba(255,107,138,0.5)}
.tournament-letter{
  font-family:inherit;font-size:48px;font-weight:900;line-height:1;
  text-shadow:0 4px 12px rgba(0,0,0,0.2);margin-bottom:8px;display:block;
}

/* ─── AVATAR BUTTON ─── */
.avatar-btn{
  width:44px;height:44px;border-radius:50%;border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  font-size:18px;font-weight:900;transition:all var(--tr);flex-shrink:0;
  background:linear-gradient(135deg,#6C5CE7,#a855f7);color:#fff;
  box-shadow:0 4px 16px rgba(108,92,231,0.4);
}
.avatar-btn:hover{transform:scale(1.08);box-shadow:0 6px 20px rgba(108,92,231,0.5)}
.avatar-btn:active{transform:scale(0.95)}

/* ─── PROFILE PANEL ─── */
.profile-ov{
  position:fixed;inset:0;
  background:rgba(0,0,0,0.55);
  z-index:200;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
  display:flex;flex-direction:column;justify-content:flex-end;
  animation:fadeIn .2s ease;
}
.profile-panel{
  background:var(--sf);border-radius:32px 32px 0 0;
  padding:0 0 40px;max-height:93vh;overflow-y:auto;
  animation:mUp .32s cubic-bezier(.34,1.1,.64,1);
  box-shadow:0 -12px 60px rgba(0,0,0,0.2);
}
.profile-hero{
  background:linear-gradient(150deg,#4f35d4,#6C5CE7,#a855f7);
  padding:36px 22px 30px;border-radius:32px 32px 0 0;
  color:#fff;display:flex;align-items:center;gap:18px;
}
.profile-avatar-lg{
  width:72px;height:72px;border-radius:50%;
  background:rgba(255,255,255,0.2);
  border:3px solid rgba(255,255,255,0.5);
  display:flex;align-items:center;justify-content:center;
  font-size:32px;font-weight:900;flex-shrink:0;
  box-shadow:0 4px 16px rgba(0,0,0,0.15);
}
.profile-name{font-size:22px;font-weight:900;letter-spacing:-.3px}
.profile-sub{font-size:13px;opacity:.8;margin-top:3px;font-weight:600}
.profile-body{padding:22px 20px}
.profile-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:22px}
.pstat{
  background:var(--sf2);border:1.5px solid var(--br);
  border-radius:18px;padding:14px 8px;text-align:center;
}
.pstat-num{font-size:22px;font-weight:900;color:var(--ac)}
.pstat-lbl{font-size:10px;color:var(--txm);margin-top:3px;font-weight:800;letter-spacing:.5px;text-transform:uppercase}
.profile-section{margin-bottom:18px}
.profile-section-title{font-size:11px;font-weight:800;color:var(--txm);text-transform:uppercase;letter-spacing:1.2px;margin-bottom:12px}
.word-chips{display:flex;flex-wrap:wrap;gap:7px}
.word-chip{
  padding:6px 13px;border-radius:20px;
  background:var(--acs);border:1.5px solid var(--ac-border);
  color:var(--ac);font-size:12px;font-weight:800;
}
.cat-rank{
  display:flex;align-items:center;gap:12px;padding:10px 14px;
  background:var(--sf2);border-radius:14px;
  border:1.5px solid var(--br);margin-bottom:8px;
}
.cat-rank-bar{flex:1;height:6px;background:var(--br);border-radius:3px;overflow:hidden}
.cat-rank-fill{
  height:100%;border-radius:3px;
  background:linear-gradient(90deg,#6C5CE7,#a855f7);
}

/* ─── GAME MODE CARDS (HOME) ─── */
.mode-grid{display:flex;flex-direction:column;gap:14px;margin-bottom:16px}
.game-mode-card{
  border-radius:24px;padding:22px 20px;cursor:pointer;
  display:flex;align-items:center;gap:18px;
  border:none;width:100%;text-align:left;
  transition:all 0.2s cubic-bezier(0.4,0,0.2,1);
  position:relative;overflow:hidden;
}
.game-mode-card::before{
  content:'';position:absolute;inset:0;
  background:linear-gradient(160deg,rgba(255,255,255,0.18) 0%,rgba(255,255,255,0) 60%);
  pointer-events:none;
}
.game-mode-card:active{transform:scale(0.97)!important}
.game-mode-card:hover{transform:translateY(-3px);filter:brightness(1.08)}
.gmc-solo{
  background:linear-gradient(135deg,#4f35d4,#6C5CE7,#8b5cf6);
  color:#fff;box-shadow:0 12px 36px rgba(108,92,231,0.45);
}
.gmc-online{
  background:linear-gradient(135deg,#0284c7,#0ea5e9,#38bdf8);
  color:#fff;box-shadow:0 12px 36px rgba(14,165,233,0.4);
}
.gmc-2v2{
  background:linear-gradient(135deg,#ea580c,#f97316,#fb923c);
  color:#fff;box-shadow:0 12px 36px rgba(249,115,22,0.4);
}
.gmc-mort{
  background:linear-gradient(135deg,#be123c,#e11d48,#f43f5e);
  color:#fff;box-shadow:0 12px 36px rgba(225,29,72,0.4);
}
.gmc-icon{
  font-size:42px;flex-shrink:0;
  filter:drop-shadow(0 4px 12px rgba(0,0,0,0.25));
  animation:iconBob 3s ease-in-out infinite;
}
@keyframes iconBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
.gmc-title{font-size:18px;font-weight:900;letter-spacing:-.3px;margin-bottom:5px;line-height:1.2}
.gmc-desc{font-size:12px;opacity:.88;line-height:1.5;font-weight:600}
.gmc-badge{
  position:absolute;top:14px;right:14px;
  background:rgba(255,255,255,0.2);
  border:1px solid rgba(255,255,255,0.28);
  border-radius:20px;padding:5px 11px;
  font-size:10px;font-weight:800;letter-spacing:.5px;
  backdrop-filter:blur(8px);
}

/* ─── UTILITIES ─── */
.txm{color:var(--txm);font-size:11px;font-weight:600}.tc{text-align:center}
.row{display:flex;align-items:center}.gap8{gap:8px}.jb{justify-content:space-between}
.mt8{margin-top:8px}.mt10{margin-top:10px}.mb8{margin-bottom:8px}.mb10{margin-bottom:10px}.mb12{margin-bottom:12px}
.pulse{animation:pulse 2s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
.spin{animation:s 0.8s linear infinite;display:inline-block}
@keyframes s{to{transform:rotate(360deg)}}
@keyframes spin{to{transform:rotate(360deg)}}

/* ─── DAILY CHALLENGE CARD ─── */
.daily-card{
  border-radius:22px;padding:20px 20px;margin-bottom:14px;
  position:relative;overflow:hidden;
  border:none;width:100%;text-align:left;cursor:pointer;
  transition:all var(--tr);
}
.daily-card:hover{transform:translateY(-3px)}
.daily-card-bg{
  background:linear-gradient(135deg,#4c1d95,#6C5CE7,#a855f7,#FF6B8A);
  color:#fff;box-shadow:0 12px 40px rgba(108,92,231,0.4);
  background-size:300% 300%;
  animation:gradientShift 8s ease infinite;
}
@keyframes gradientShift{
  0%{background-position:0% 50%}
  50%{background-position:100% 50%}
  100%{background-position:0% 50%}
}
.daily-card-done{background:var(--sf2);border:1.5px solid var(--br);cursor:default}
.daily-card:hover.daily-card-done{transform:none;filter:none}
.daily-star{
  position:absolute;top:12px;right:16px;
  font-size:32px;opacity:.2;
  animation:starFloat 4s ease-in-out infinite;
}
@keyframes starFloat{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-6px) rotate(15deg)}}
.daily-label{font-size:10px;font-weight:800;letter-spacing:1.8px;text-transform:uppercase;opacity:.8;margin-bottom:5px}
.daily-title{font-size:20px;font-weight:900;letter-spacing:-.3px;margin-bottom:4px}
.daily-sub{font-size:12px;opacity:.85;font-weight:600}
.daily-cats{display:flex;gap:7px;margin-top:12px;flex-wrap:wrap}
.daily-cat-chip{
  background:rgba(255,255,255,0.18);
  border-radius:20px;padding:4px 11px;font-size:11px;font-weight:700;
  border:1px solid rgba(255,255,255,0.2);
  backdrop-filter:blur(4px);
}
.daily-cat-chip-done{
  background:var(--sf);border:1px solid var(--br);
  border-radius:20px;padding:4px 11px;font-size:11px;font-weight:700;color:var(--txm);
}
.daily-score{font-family:inherit;font-size:24px;font-weight:900;color:var(--ac);margin-top:6px}
.daily-letter-badge{
  font-family:inherit;font-size:56px;font-weight:900;line-height:1;
  opacity:.2;position:absolute;right:18px;bottom:12px;
  background:linear-gradient(135deg,#fff,rgba(255,255,255,0.5));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}

/* ─── THEME SWITCHER ─── */
.theme-switcher{display:flex;gap:7px;padding:2px}
.theme-dot{
  width:26px;height:26px;border-radius:50%;cursor:pointer;
  border:2px solid transparent;transition:all var(--tr);flex-shrink:0;
  box-shadow:var(--s1);
}
.theme-dot.active{border-color:var(--ac);transform:scale(1.18);box-shadow:0 0 0 3px rgba(108,92,231,0.2)}
.theme-dot:hover{transform:scale(1.12)}

/* ─── SETTINGS ─── */
.settings-row{
  display:flex;align-items:center;justify-content:space-between;
  padding:14px 0;border-bottom:1px solid var(--br);
}
.settings-row:last-child{border-bottom:none}
.settings-label{font-size:14px;font-weight:700;color:var(--tx)}
.settings-sub{font-size:11px;color:var(--txm);margin-top:2px;font-weight:600}
.toggle{
  width:48px;height:28px;background:var(--br);border-radius:20px;
  cursor:pointer;position:relative;transition:background var(--tr);
  border:none;flex-shrink:0;
}
.toggle.on{background:linear-gradient(135deg,#6C5CE7,#a855f7)}
.toggle-knob{
  position:absolute;top:4px;left:4px;width:20px;height:20px;
  background:#fff;border-radius:50%;transition:transform var(--tr);
  box-shadow:0 2px 6px rgba(0,0,0,0.2);
}
.toggle.on .toggle-knob{transform:translateX(20px)}
`;

// ─── RETOUR HAPTIQUE ─────────────────────────────────────────────
const Haptics = {
  enabled: true,
  light()  { if (!this.enabled) return; try { if (window.navigator?.vibrate) window.navigator.vibrate(10); } catch { /* ignore */ } },
  medium() { if (!this.enabled) return; try { if (window.navigator?.vibrate) window.navigator.vibrate(20); } catch { /* ignore */ } },
  heavy()  { if (!this.enabled) return; try { if (window.navigator?.vibrate) window.navigator.vibrate([30,10,30]); } catch { /* ignore */ } },
  success(){ if (!this.enabled) return; try { if (window.navigator?.vibrate) window.navigator.vibrate([10,50,10]); } catch { /* ignore */ } },
  error()  { if (!this.enabled) return; try { if (window.navigator?.vibrate) window.navigator.vibrate([50,30,50]); } catch { /* ignore */ } },
};

// ─── UTILITAIRE PARTAGE ──────────────────────────────────────────
async function shareApp() {
  const shareData = {
    title: "Le Petit Bac",
    text: "Joue au Petit Bac avec moi ! Le meilleur jeu de mots sur mobile 🎯",
    url: "https://apps.apple.com/app/le-petit-bac",
  };
  try {
    if (navigator.share) { await navigator.share(shareData); return true; }
    else { await navigator.clipboard.writeText(shareData.url + " — " + shareData.text); return "copied"; }
  } catch { return false; }
}

// ─── UTILS ───────────────────────────────────────────────────────
/** Sanitize a user-visible name before writing to Firebase or displaying */
function sanitizeName(name) {
  if (!name || typeof name !== "string") return "Joueur";
  return name.trim().replace(/\s+/g, " ").slice(0, 20) || "Joueur";
}

// ─── FIREBASE (npm modular API — BUG 1 FIX) ──────────────────────
const FB = (() => {
  let db = null;
  let auth = null;
  if (FIREBASE_READY) {
    try {
      const app = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApps()[0];
      db   = getDatabase(app);
      auth = getAuth(app);
    } catch (e) {
      console.warn("Firebase init failed, using local mode:", e);
    }
  }

  // ── Fallback local (même appareil) ──────────────────────────
  const local = { rooms: {}, listeners: {} };

  return {
    db,  // Exposed for direct modular API usage (Leaderboard etc.)

    async signIn() {
      if (auth) {
        try {
          const result = await signInAnonymously(auth);
          return { uid: result.user.uid };
        } catch { /* ignore */ }
      }
      return { uid: "local_" + Math.random().toString(36).substring(2, 9) };
    },

    async createRoom(code, data) {
      if (db) {
        await dbSet(dbRef(db, "rooms/" + code), data);
        return code;
      }
      local.rooms[code] = JSON.parse(JSON.stringify(data));
      return code;
    },

    async getRoom(code) {
      if (db) {
        try {
          const snap = await dbGet(dbRef(db, "rooms/" + code));
          return snap.val();
        } catch (e) {
          if (e.code === "PERMISSION_DENIED") {
            throw new Error("Accès Firebase refusé. Configure les règles: rules > rooms > .read: true", { cause: e });
          }
          throw e;
        }
      }
      return local.rooms[code] ? JSON.parse(JSON.stringify(local.rooms[code])) : null;
    },

    async updateRoom(code, updates) {
      if (db) {
        await dbUpdate(dbRef(db, "rooms/" + code), updates);
        return;
      }
      if (!local.rooms[code]) return;
      local.rooms[code] = { ...local.rooms[code], ...updates };
      if (local.listeners[code]) local.listeners[code](JSON.parse(JSON.stringify(local.rooms[code])));
    },

    listenRoom(code, cb) {
      if (db) {
        const roomRef = dbRef(db, "rooms/" + code);
        const unsubscribe = dbOnValue(roomRef, snap => { if (snap.val()) cb(snap.val()); });
        return unsubscribe;
      }
      local.listeners[code] = cb;
      if (local.rooms[code]) cb(JSON.parse(JSON.stringify(local.rooms[code])));
      return () => { delete local.listeners[code]; };
    },

    async findPublicRoom(preferredCountry) {
      const isJoinable = (room) =>
        room.type === "public" &&
        room.status === "waiting" &&
        Object.keys(room.players || {}).length < 6;

      if (db) {
        const roomsRef = dbRef(db, "rooms");
        const waitingQuery = dbQuery(roomsRef, orderByChild("status"), equalTo("waiting"));
        const snap = await dbGet(waitingQuery);
        const rooms = Object.entries(snap.val() || {});
        // Prefer same-country rooms first, then fall back to any
        const sameCountry = rooms.find(([, r]) => isJoinable(r) && r.country === preferredCountry);
        if (sameCountry) return sameCountry[0];
        const any = rooms.find(([, r]) => isJoinable(r));
        return any ? any[0] : null;
      }
      const localRooms = Object.entries(local.rooms);
      const sameCountry = localRooms.find(([, r]) => isJoinable(r) && r.country === preferredCountry);
      if (sameCountry) return sameCountry[0];
      const any = localRooms.find(([, r]) => isJoinable(r));
      return any ? any[0] : null;
    },

    // ── FRIENDS ─────────────────────────────────────────────────
    async getFriendCode(uid) {
      // Try local storage first (works offline)
      let localCode = null;
      try { localCode = localStorage.getItem("pb_friendcode"); } catch { /* ignore */ }

      if (db) {
        try {
          const snap = await dbGet(dbRef(db, `users/${uid}/friendCode`));
          if (snap.val()) {
            // Ensure local is synced
            try { localStorage.setItem("pb_friendcode", snap.val()); } catch { /* ignore */ }
            return snap.val();
          }
        } catch { /* ignore */ }
        // Generate new code
        const code = "PB" + Math.random().toString(36).substring(2, 8).toUpperCase();
        try {
          await dbSet(dbRef(db, `users/${uid}/friendCode`), code);
          await dbSet(dbRef(db, `friendCodes/${code}`), uid);
          try { localStorage.setItem("pb_friendcode", code); } catch { /* ignore */ }
        } catch (e) { console.warn("FB friendCode write failed:", e); }
        return code;
      }
      // Offline: generate and persist locally
      if (localCode) return localCode;
      const code = "PB" + Math.random().toString(36).substring(2, 8).toUpperCase();
      try { localStorage.setItem("pb_friendcode", code); } catch { /* ignore */ }
      return code;
    },

    async syncUserProfile(uid, name, xp) {
      if (!db || !uid) return;
      try {
        await dbUpdate(dbRef(db, `users/${uid}`), { name: name || "Joueur", xp: xp || 0, updatedAt: Date.now() });
      } catch { /* ignore */ }
    },

    async lookupByFriendCode(code) {
      if (!db) return null;
      try {
        const snap = await dbGet(dbRef(db, `friendCodes/${code}`));
        return snap.val(); // uid or null
      } catch { return null; }
    },

    async sendFriendRequest(fromUid, fromName, toUid) {
      if (!db) throw new Error("offline");
      await dbSet(dbRef(db, `friendRequests/${toUid}/${fromUid}`), {
        name: fromName || "Joueur", sentAt: Date.now()
      });
    },

    async acceptFriendRequest(myUid, fromUid) {
      if (!db) return;
      const [theirSnap, mySnap] = await Promise.all([
        dbGet(dbRef(db, `users/${fromUid}`)),
        dbGet(dbRef(db, `users/${myUid}`)),
      ]);
      const them = theirSnap.val() || {};
      const me = mySnap.val() || {};
      await Promise.all([
        dbSet(dbRef(db, `friends/${myUid}/${fromUid}`), { name: them.name || "Joueur", xp: them.xp || 0, addedAt: Date.now() }),
        dbSet(dbRef(db, `friends/${fromUid}/${myUid}`), { name: me.name || "Joueur", xp: me.xp || 0, addedAt: Date.now() }),
        dbSet(dbRef(db, `friendRequests/${myUid}/${fromUid}`), null),
      ]);
    },

    async rejectFriendRequest(myUid, fromUid) {
      if (!db) return;
      await dbSet(dbRef(db, `friendRequests/${myUid}/${fromUid}`), null);
    },

    listenFriendRequests(uid, cb) {
      if (!db) { cb({}); return () => {}; }
      try {
        const ref = dbRef(db, `friendRequests/${uid}`);
        const unsub = dbOnValue(ref, snap => cb(snap.val() || {}));
        return unsub;
      } catch { cb({}); return () => {}; }
    },

    listenFriends(uid, cb) {
      if (!db) { cb({}); return () => {}; }
      try {
        const ref = dbRef(db, `friends/${uid}`);
        const unsub = dbOnValue(ref, snap => cb(snap.val() || {}));
        return unsub;
      } catch { cb({}); return () => {}; }
    },

    async removeFriend(myUid, friendUid) {
      if (!db) return;
      await Promise.all([
        dbSet(dbRef(db, `friends/${myUid}/${friendUid}`), null),
        dbSet(dbRef(db, `friends/${friendUid}/${myUid}`), null),
      ]);
    },
  };
})();

// ─── APP ─────────────────────────────────────────────────────────
// ─── ANALYTICS ──────────────────────────────────────────────────────
function logEvent(eventName, params) {
  try {
    if (import.meta.env.DEV) {
      console.log("[Analytics]", eventName, params);
    }
  } catch { /* ignore */ }
}

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

// ─── SOUND FX ─────────────────────────────────────────────────────────────
// Singleton AudioContext — évite la limite mobile (~6 contextes simultanés)
let _audioCtx = null;
function getAudioCtx() {
  if (!_audioCtx || _audioCtx.state === "closed") {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Résoudre la suspension auto sur iOS/Chrome (requiert un geste utilisateur au préalable)
  if (_audioCtx.state === "suspended") {
    _audioCtx.resume().catch(() => {});
  }
  return _audioCtx;
}

const SoundFX = {
  play: (sound) => {
    try {
      if (typeof AudioContext === "undefined" && typeof webkitAudioContext === "undefined") return;
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const sounds = {
        tick:  { freq: 800, dur: 0.05, type: "sine"    },
        lock:  { freq: 523, dur: 0.15, type: "triangle" },
        stop:  { freq: 392, dur: 0.3,  type: "square"  },
        win:   { freq: 659, dur: 0.4,  type: "sine"    },
        wrong: { freq: 200, dur: 0.2,  type: "sawtooth" },
        badge: { freq: 880, dur: 0.3,  type: "sine"    },
      };
      const s = sounds[sound] || sounds.tick;
      osc.type = s.type;
      osc.frequency.setValueAtTime(s.freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + s.dur);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + s.dur);
    } catch { /* ignore */ }
  }
};

// ─── ERROR BOUNDARY ───────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    if (import.meta.env.DEV) console.error("[ErrorBoundary]", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
          minHeight:"100dvh", background:"#F8FAFF", padding:"32px 20px", fontFamily:"Nunito,sans-serif", textAlign:"center" }}>
          <div style={{ fontSize:48, marginBottom:16 }}>😵</div>
          <div style={{ fontSize:20, fontWeight:800, color:"#2D3436", marginBottom:8 }}>Oups, quelque chose a planté</div>
          <div style={{ fontSize:14, color:"#636E72", marginBottom:24, maxWidth:300 }}>
            Une erreur inattendue s'est produite. Vos données locales sont intactes.
          </div>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            style={{ background:"#6C5CE7", color:"#fff", border:"none", borderRadius:16, padding:"14px 28px",
              fontSize:15, fontWeight:800, cursor:"pointer" }}>
            Relancer l'app
          </button>
          {import.meta.env.DEV && this.state.error && (
            <pre style={{ marginTop:24, fontSize:11, color:"#d63031", textAlign:"left",
              background:"#fff", padding:12, borderRadius:8, maxWidth:"100%", overflow:"auto" }}>
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [tab, setTab] = useState("home");
  const [screen, setScreen] = useState("home");
  const [tier, setTier] = useState("free"); // TIER.FREE = "free"
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem("pb_theme") || "light"; } catch { return "light"; } });
  const [lang, setLang] = useState(() => {
    try {
      if (typeof localStorage !== "undefined") return localStorage.getItem("pb_lang") || "fr";
    } catch { /* ignore */ }
    return "fr";
  });
  const t = useT(lang);
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("pb_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        return { difficulty:"medium", categories:FREE_CATS.map(c=>c.id), customCategories:[], playerName:"", country:"France", totalRounds:5, soundEnabled:true, ...parsed };
      }
    } catch { /* ignore */ }
    const savedName = localStorage.getItem("pb_name") || "";
    return { difficulty:"medium", categories:FREE_CATS.map(c=>c.id), customCategories:[], playerName:savedName, country:"France", totalRounds:5, soundEnabled:true };
  });
  const [gameState, setGameState] = useState(null);
  // BUG 3 FIX: Initialize from localStorage
  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem("pb_stats");
      return saved ? JSON.parse(saved) : { played: 0, won: 0, best: 0, total: 0, streak: 0, totalWords: 0, uniqueWords: 0 };
    } catch {
      return { played: 0, won: 0, best: 0, total: 0, streak: 0, totalWords: 0, uniqueWords: 0 };
    }
  });
  const [xp, setXp] = useState(() => {
    try { return Number(localStorage.getItem("pb_xp")) || 0; } catch { return 0; }
  });
  const [unlockedBadges, setUnlockedBadges] = useState(() => {
    try {
      const saved = localStorage.getItem("pb_badges");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [newBadges, setNewBadges] = useState([]); // badges just unlocked → show notification
  const [showTier, setShowTier] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => { try { const n = localStorage.getItem('pb_name'); return !n || !n.trim(); } catch { return true; } });
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [dailyPlayed, setDailyPlayed] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pb_daily")); } catch { return null; }
  });
  const [showBugReport, setShowBugReport] = useState(false);
  const [showRateApp, setShowRateApp] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showProfilePhoto, setShowProfilePhoto] = useState(false);
  const [showLegal, setShowLegal] = useState(null); // "cgu" | "privacy" | null
  const [profilePhoto, setProfilePhoto] = useState(() => { try { return JSON.parse(localStorage.getItem("pb_photo")); } catch { return null; } }); // { type, data/emoji, bg }
  const [uid, setUid] = useState(null);
  // Friends system
  const [myFriendCode, setMyFriendCode] = useState(() => {
    try { return localStorage.getItem("pb_friendcode") || ""; } catch { return ""; }
  });
  const [friends, setFriends] = useState({});
  const [friendRequests, setFriendRequests] = useState({});
  const [showFriends, setShowFriends] = useState(false);
  // Profile data
  const [wordHistory, setWordHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pb_words") || "[]"); } catch { return []; }
  });
  const [catHistory, setCatHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pb_cats") || "{}"); } catch { return {}; }
  });

  // Inject global CSS once on mount — not in render to avoid re-processing on every state change
  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
    return () => { try { document.head.removeChild(styleEl); } catch { /* ignore */ } };
  }, []);

  // Memoize heavy computations that depend on stable values
  const levelInfo = useMemo(() => getLevelInfo(xp || 0, lang), [xp, lang]);
  const tournament = useMemo(() => getTournamentWeek(), []);
  const daily = useMemo(() => getDailyChallenge(), []);

  const signedInRef = useRef(false);
  useEffect(() => {
    if (signedInRef.current) return; // Guard against StrictMode double-invoke
    signedInRef.current = true;
    FB.signIn().then(u => setUid(u.uid));
  }, []);

  // Apply theme whenever it changes
  useEffect(() => { applyTheme(theme); }, [theme]);

  // Persist language preference (in-memory for web, localStorage for native)
  useEffect(() => {
    try {
      if (typeof localStorage !== "undefined") localStorage.setItem("pb_lang", lang);
    } catch { /* ignore */ }
    try { document.documentElement.lang = lang; } catch { /* ignore */ }
  }, [lang]);

  // Sauvegarder settings (nom, pays, difficulté...) à chaque changement
  useEffect(() => {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("pb_settings", JSON.stringify(settings));
        if (settings.playerName) localStorage.setItem("pb_name", settings.playerName);
      }
    } catch { /* ignore */ }
  }, [settings]);

  useEffect(() => {
    try {
      if (typeof localStorage !== "undefined") localStorage.setItem("pb_theme", theme);
    } catch { /* ignore */ }
  }, [theme]);

  // ── Friend system initialization ──────────────────────────────
  // Intentional: runs once on uid change; ongoing name/xp sync is handled by the effect below
  useEffect(() => {
    if (!uid) return;
    FB.getFriendCode(uid).then(code => {
      setMyFriendCode(code);
      FB.syncUserProfile(uid, settings.playerName, xp);
    });
    // Listen for incoming friend requests in real-time
    const unsubReq = FB.listenFriendRequests(uid, setFriendRequests);
    // Listen for friend list in real-time
    const unsubFriends = FB.listenFriends(uid, setFriends);
    return () => { unsubReq(); unsubFriends(); };
  }, [uid]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync player name/XP to Firebase users profile
  useEffect(() => {
    if (!uid || !myFriendCode) return;
    FB.syncUserProfile(uid, settings.playerName, xp);
  }, [settings.playerName, xp, uid, myFriendCode]);

  function goSetup(mode) { setGameState({ mode }); setScreen("setup"); }
  function goOnline(mode) {
    setGameState({ mode });
    setScreen("online");
  }

  function startTournamentGame() {
    const tournament = getTournamentWeek(); // recompute to avoid stale value after midnight
    const activeCats = tournament.cats;
    const players = [
      { id: uid || "human", name: settings.playerName || "Joueur", isBot: false, answers: {}, done: false },
    ];
    setGameState({
      mode: "tournoi",
      difficulty: "hard",
      totalTime: DIFFICULTY.hard.time,
      timeLeft: DIFFICULTY.hard.time,
      categories: activeCats,
      players,
      totalRounds: 1,
      currentRound: 1,
      spinnerIndex: 0,
      rounds: [],
      letter: tournament.letter,
      answers: Object.fromEntries(activeCats.map(c => [c.id, ""])),
      phase: "playing",
      cumulativeScores: { [uid || "human"]: 0 },
      myId: uid || "human",
      isTournoi: true,
      weekNum: tournament.weekNum,
      lang: lang,
    });
    setScreen("game");
  }

  function startDailyChallenge() {
    const daily = getDailyChallenge(); // recompute to avoid stale value after midnight
    const { cats, letter } = daily;
    // Daily uses special categories + hard difficulty + 1 round
    const activeCats = cats.map(c => ({ ...c, tier: "pro" }));
    const players = [
      { id: "human", name: settings.playerName, isBot: false, answers: {}, done: false },
      { id: "bot0",  name: "Bot Elite",          isBot: true,  answers: {}, done: false },
    ];
    setGameState({
      mode: "daily",
      difficulty: "hard",
      totalTime: DIFFICULTY.hard.time,
      timeLeft: DIFFICULTY.hard.time,
      categories: activeCats,
      players,
      totalRounds: 1,
      currentRound: 1,
      spinnerIndex: 0,
      rounds: [],
      letter,
      answers: Object.fromEntries(activeCats.map(c => [c.id, ""])),
      phase: "playing",
      cumulativeScores: Object.fromEntries(players.map(p => [p.id, 0])),
      myId: "human",
      isDaily: true,
      lang: lang,
      dailyLetter: letter,
    });
    setScreen("game");
  }

  function startSoloGame(cfg) {
    const activeCats = cfg.categories.map(id =>
      [...ALL_BASE, ...cfg.customCategories].find(c => c.id === id)
    ).filter(Boolean);
    const humanId = uid || "human";
    const is2v2 = cfg.mode === "2v2";
    const isMort = cfg.mode === "mort";

    // Mort subite: 4 joueurs (plus de challenge)
    // 2v2: 4 joueurs en 2 équipes
    // Noms des bots supplémentaires
    const BOT_NAMES = [...AI_NAMES, "Bot Sam", "Bot Léa", "Bot Tom"];

    const players = is2v2 || isMort ? [
      { id: humanId, name: cfg.playerName, isBot: false, answers: {}, done: false, eliminated: false },
      { id: "bot0", name: BOT_NAMES[0], isBot: true, answers: {}, done: false, eliminated: false },
      { id: "bot1", name: BOT_NAMES[1], isBot: true, answers: {}, done: false, eliminated: false },
      { id: "bot2", name: BOT_NAMES[2], isBot: true, answers: {}, done: false, eliminated: false },
      { id: "bot3", name: BOT_NAMES[3], isBot: true, answers: {}, done: false, eliminated: false },
      { id: "bot4", name: BOT_NAMES[4], isBot: true, answers: {}, done: false, eliminated: false },
    ] : [
      { id: humanId, name: cfg.playerName, isBot: false, answers: {}, done: false },
      { id: "bot0", name: BOT_NAMES[0], isBot: true, answers: {}, done: false },
      { id: "bot1", name: BOT_NAMES[1], isBot: true, answers: {}, done: false },
    ];

    // Équipes 2v2: formées aléatoirement au début de partie
    let teams = null;
    if (is2v2) {
      const allIds = [...players.map(p => p.id)];
      // Mélange Fisher-Yates
      for (let i = allIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allIds[i], allIds[j]] = [allIds[j], allIds[i]];
      }
      const half = Math.ceil(allIds.length / 2);
      teams = { team0: allIds.slice(0, half), team1: allIds.slice(half) };
    }


    // Mort Subite: tirer les catégories actives de ce 1er round
    const mortCatCount = isMort && cfg.mortCatCount ? cfg.mortCatCount : null;
    function pickMortCats(pool, n) {
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, Math.min(n, shuffled.length));
    }
    const activeCategories = mortCatCount ? pickMortCats(activeCats, mortCatCount) : activeCats;

    setGameState({
      mode: cfg.mode || "solo",
      difficulty: cfg.difficulty,
      totalTime: DIFFICULTY[cfg.difficulty].time,
      timeLeft: DIFFICULTY[cfg.difficulty].time,
      categories: activeCats,         // pool complet
      activeCategories,               // catégories jouées ce round
      mortCatCount,                   // nb cats/manche pour mort subite
      players,
      totalRounds: cfg.totalRounds,
      currentRound: 1,
      spinnerIndex: 0,
      rounds: [],
      letter: null,
      answers: Object.fromEntries(activeCategories.map(c => [c.id, ""])),
      phase: "roulette",
      cumulativeScores: Object.fromEntries(players.map(p => [p.id, 0])),
      myId: humanId,
      teams: teams,
      lang: lang,
      usedLetters: [],
    });
    setScreen("game");
    logEvent("game_start", { uid, mode: cfg.mode, difficulty: cfg.difficulty });
  }

  function enterOnlineGame(roomCode, roomData) {
    const allCats = (roomData.settings.categories || []).map(id =>
      ALL_BASE.find(c => c.id === id)
    ).filter(Boolean);
    // Mort subite: appliquer les catégories actives du 1er round si broadcastées
    const activeCatIds = roomData.activeCategoryIds;
    const activeCats = activeCatIds
      ? activeCatIds.map(id => ALL_BASE.find(c => c.id === id)).filter(Boolean)
      : allCats;
    setGameState({
      mode: roomData.settings?.gameMode || "online",
      roomCode,
      difficulty: roomData.settings.difficulty || "medium",
      totalTime: DIFFICULTY[roomData.settings.difficulty || "medium"].time,
      timeLeft: DIFFICULTY[roomData.settings.difficulty || "medium"].time,
      categories: allCats,
      activeCategories: activeCats,
      players: Object.values(roomData.players || {}).map(p => ({ ...p, id: p.uid || p.id })),
      totalRounds: roomData.settings.totalRounds || 5,
      currentRound: 1,
      spinnerIndex: roomData.spinnerIndex || 0,
      spinnerOrder: roomData.spinnerOrder || null,
      rounds: [],
      letter: null,
      answers: Object.fromEntries(activeCats.map(c => [c.id, ""])),
      phase: "roulette",
      cumulativeScores: roomData.cumulativeScores || {},
      myId: uid,
      // Utiliser les équipes broadcastées par l'hôte via Firebase (évite la divergence 2v2)
      teams: roomData.teams || (roomData.settings?.gameMode === "2v2" ? (() => {
        const playerIds = Object.keys(roomData.players || {});
        const half = Math.ceil(playerIds.length / 2);
        return { team0: playerIds.slice(0, half), team1: playerIds.slice(half) };
      })() : null),
      isHost: roomData.hostId === uid,
      lang: lang, // BUG 6 FIX: include lang in online game state
      usedLetters: roomData.usedLetters || [], // BUG 3 FIX: restaurer les lettres déjà utilisées
      mortCatCount: roomData.settings?.mortCatCount || null, // Mort subite: nb cats/manche
    });
    setScreen("game");
  }

  // BUG 2 FIX: handleGameEnd updates stats, XP, badges and persists to localStorage
  function handleGameEnd(gs) {
    setGameState(gs);
    setScreen("results");

    const myId = gs.myId || uid || "human";
    const myScore = gs.cumulativeScores?.[myId] || 0;
    const allScores = Object.values(gs.cumulativeScores || {});
    const maxScore = Math.max(...allScores);
    const won = myScore >= maxScore && allScores.filter(s => s === maxScore).length === 1;

    // Collect words submitted this game
    const newWords = [];
    (gs.rounds || []).forEach(round => {
      Object.entries(round.answers || {}).forEach(([, catAnswers]) => {
        const a = catAnswers?.[myId];
        if (a?.trim()) newWords.push(a.trim().toLowerCase());
      });
    });
    const wordsThisGame = newWords.length;

    // Update word history
    setWordHistory(prev => {
      const next = [...prev, ...newWords].slice(-200);
      try { localStorage.setItem("pb_words", JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });

    // Update category history
    const catCounts = {};
    (gs.categories || []).forEach(c => { catCounts[c.id] = (catCounts[c.id] || 0) + 1; });
    setCatHistory(prev => {
      const next = { ...prev };
      Object.entries(catCounts).forEach(([id, n]) => { next[id] = (next[id] || 0) + n; });
      try { localStorage.setItem("pb_cats", JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });

    setStats(prev => {
      const newStreak = won ? (prev.streak || 0) + 1 : 0;
      const updated = {
        played: (prev.played || 0) + 1,
        won: (prev.won || 0) + (won ? 1 : 0),
        best: Math.max(prev.best || 0, myScore),
        total: (prev.total || 0) + myScore,
        streak: newStreak,
        totalWords: (prev.totalWords || 0) + wordsThisGame,
        uniqueWords: (prev.uniqueWords || 0) + new Set(newWords).size,
      };
      try { localStorage.setItem("pb_stats", JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });

    const xpGain = calcXpGain(myScore, won, gs.totalRounds || 1);
    const newXp = (xp || 0) + xpGain;
    setXp(() => {
      try { localStorage.setItem("pb_xp", String(newXp)); } catch { /* ignore */ }
      return newXp;
    });

    // Vérifier les badges APRÈS la mise à jour de stats (pas d'imbrication setStats → évite stale closure)
    // On utilise les stats finales déjà calculées plutôt que les passer via setStats imbriqué
    // Réutiliser `won` calculé plus haut pour éviter toute divergence entre les deux endroits
    const finalStats = {
      played: (stats.played || 0) + 1,
      won: (stats.won || 0) + (won ? 1 : 0),
      best: Math.max(stats.best || 0, myScore),
      total: (stats.total || 0) + myScore,
      streak: won ? (stats.streak || 0) + 1 : 0,
      totalWords: (stats.totalWords || 0) + newWords.length,
      uniqueWords: (stats.uniqueWords || 0) + new Set(newWords).size,
    };
    setUnlockedBadges(prev => {
      const newlyUnlockedDefs = BADGE_DEFS.filter(b =>
        !prev.includes(b.id) && b.check(finalStats)
      );
      if (newlyUnlockedDefs.length > 0) {
        const newlyUnlocked = newlyUnlockedDefs.map(b => b.id);
        const updated = [...new Set([...prev, ...newlyUnlocked])];
        try { localStorage.setItem("pb_badges", JSON.stringify(updated)); } catch { /* ignore */ }
        setNewBadges(newlyUnlockedDefs);
        setTimeout(() => setNewBadges([]), 4000);
        return updated;
      }
      return prev;
    });

    // Mark daily as played
    if (gs.isDaily) {
      const { todayKey } = getDailyChallenge();
      const entry = { todayKey, score: myScore };
      setDailyPlayed(entry);
      try { localStorage.setItem("pb_daily", JSON.stringify(entry)); } catch { /* ignore */ }
    }

    // Sauvegarder score tournoi dans Firebase
    if (gs.isTournoi && uid && FB.db) {
      try {
        const weekKey = "week_" + gs.weekNum;
        dbSet(dbRef(FB.db, `tournoi/${weekKey}/${uid}`), {
          name: settings.playerName || "Joueur",
          score: myScore,
          xp: newXp,
          updatedAt: Date.now(),
        });
      } catch { /* ignore */ }
    }

    logEvent("game_end", { uid, mode: gs.mode, score: myScore, won });

    // ROOM CLEANUP FIX: marquer la room comme terminée pour éviter qu'elle
    // apparaisse dans le matchmaking et pollue findPublicRoom.
    if (gs.roomCode && FB.db) {
      try {
        FB.updateRoom(gs.roomCode, { status: "finished", finishedAt: Date.now() }).catch(() => {});
      } catch { /* ignore */ }
    }
  }

  return (
    <ErrorBoundary>
      <div className="app">
        {screen === "home"    && <HomeScreen
          onSolo={() => goSetup("solo")}
          onOnline={() => goOnline("solo")}
          on2v2={() => goSetup("2v2")}
          onMort={() => goSetup("mort")}
          onOnline2v2={() => goOnline("2v2")}
          onOnlineMort={() => goOnline("mort")}
          onDaily={startDailyChallenge}
          onTournoi={() => startTournamentGame()}
          stats={stats} tier={tier} xp={xp}
          onTier={() => setShowTier(true)}
          onProfile={() => setShowProfile(true)}
          onSettings={() => setShowSettings(true)}
          playerName={settings.playerName}
          dailyPlayed={dailyPlayed}
          profilePhoto={profilePhoto}
          onShare={() => setShowShare(true)}
          lang={lang}
          daily={daily}
          tournament={tournament}
          levelInfo={levelInfo}
        />}
        {screen === "setup"   && <SetupScreen mode={gameState?.mode} settings={settings} setSettings={setSettings} onStart={startSoloGame} onBack={() => setScreen("home")} tier={tier} onTier={() => setShowTier(true)} lang={lang} />}
        {screen === "online"  && <OnlineScreen uid={uid} settings={settings} setSettings={setSettings} onEnterGame={enterOnlineGame} onBack={() => setScreen("home")} tier={tier} lang={lang} gameMode={gameState?.mode} />}
        {screen === "game"    && gameState && <GameScreen gameState={gameState} setGameState={setGameState} uid={uid} lang={lang} onEndGame={handleGameEnd} />}
        {screen === "results" && gameState && <FinalResultsScreen gameState={gameState} onPlayAgain={() => {
            const m = gameState?.mode;
            if (m === "tournoi") startTournamentGame();
            else if (m === "daily") startDailyChallenge();
            else if (gameState?.roomCode) setScreen("online");
            else setScreen("setup");
          }} onHome={() => setScreen("home")} uid={uid} lang={lang} />}
        {screen !== "game" && <BottomNav tab={tab} setTab={setTab} setScreen={setScreen} setGameState={setGameState} onLeaderboard={() => setShowLeaderboard(true)} lang={lang} />}
      </div>
      {showTier && <TierModal current={tier} onSelect={t => { setTier(t); setShowTier(false); }} onClose={() => setShowTier(false)} lang={lang} />}
      {showProfile && <ProfilePanel stats={stats} xp={xp} playerName={settings.playerName} wordHistory={wordHistory} catHistory={catHistory} tier={tier} unlockedBadges={unlockedBadges} onClose={() => setShowProfile(false)} onLeaderboard={() => { setShowProfile(false); setShowLeaderboard(true); }} onThemes={() => { setShowProfile(false); setShowThemes(true); }} onEditProfile={() => { setShowProfile(false); setShowProfilePhoto(true); }}
          onShare={() => { setShowProfile(false); setShowShare(true); }}
          onRateApp={() => { setShowProfile(false); setShowRateApp(true); }}
          onBugReport={() => { setShowProfile(false); setShowBugReport(true); }}
          onFriends={() => { setShowProfile(false); setShowFriends(true); }}
          friendRequestCount={Object.keys(friendRequests).length}
          lang={lang} />}
      {showFriends && <FriendsPanel
          uid={uid}
          myFriendCode={myFriendCode}
          playerName={settings.playerName}
          friends={friends}
          friendRequests={friendRequests}
          onClose={() => setShowFriends(false)}
          onRefresh={() => {}}
          lang={lang}
        />}
      {showOnboarding && <OnboardingScreen onDone={(name) => {
          const finalName = name || t("ob5_placeholder","Joueur");
          setSettings(s => ({ ...s, playerName: finalName }));
          // BUG 10 FIX: persist name to localStorage
          try { localStorage.setItem("pb_name", finalName); } catch { /* ignore */ }
          setShowOnboarding(false);
        }} lang={lang} />}
      {showLeaderboard && <LeaderboardScreen onClose={() => setShowLeaderboard(false)} playerName={settings.playerName} xp={xp} uid={uid} tier={tier} lang={lang} />}
      {showThemes && <ThemesScreen current={theme} onSelect={t => { setTheme(t); applyTheme(t); setShowThemes(false); }} onClose={() => setShowThemes(false)} tier={tier} onTier={() => { setShowThemes(false); setShowTier(true); }} lang={lang} />}
      {newBadges.length > 0 && <BadgeNotification badges={newBadges} lang={lang} />}
      {showSettings && <SettingsPanel
        settings={settings} setSettings={setSettings}
        theme={theme} onThemeChange={th => { setTheme(th); applyTheme(th); }}
        lang={lang} setLang={setLang}
        tier={tier} onTier={() => { setShowSettings(false); setShowTier(true); }}
        onClose={() => setShowSettings(false)}
          onShowLegal={(type) => { setShowSettings(false); setShowLegal(type); }}
        onBugReport={() => { setShowSettings(false); setShowBugReport(true); }}
        onRateApp={() => { setShowSettings(false); setShowRateApp(true); }}
        onShare={() => { setShowSettings(false); setShowShare(true); }}
        onEditProfile={() => { setShowSettings(false); setShowProfilePhoto(true); }}
      />}
      {showBugReport && <BugReportModal onClose={() => setShowBugReport(false)} lang={lang} />}
      {showRateApp && <RateAppModal onClose={() => setShowRateApp(false)} lang={lang} />}
      {showShare && <ShareModal onClose={() => setShowShare(false)} lang={lang} />}
      {showLegal && <LegalModal onClose={() => setShowLegal(null)} lang={lang} type={showLegal} />}
      {showProfilePhoto && <ProfilePhotoModal
        onClose={() => setShowProfilePhoto(false)}
        onSave={p => { setProfilePhoto(p); try { localStorage.setItem("pb_photo", JSON.stringify(p)); } catch { /* ignore */ } }}
        currentPhoto={profilePhoto?.emoji || ""}
        playerName={settings.playerName}
        lang={lang}
      />}
    </ErrorBoundary>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────
function HomeScreen({ onSolo, onOnline, on2v2, onMort, onOnline2v2, onDaily, onTournoi, stats, tier, onTier, onProfile, onSettings, playerName, xp, dailyPlayed, profilePhoto, lang, daily, tournament, levelInfo }) {
  const t = useT(lang || "fr");
  const bc = tier === TIER.VIP ? "bvipbadge" : tier === TIER.PRO ? "bprobadge" : "bfree";
  const bl = tier === TIER.VIP ? t("vip_label") : tier === TIER.PRO ? t("pro_label") : "◇";
  const initials = (playerName || "J").charAt(0).toUpperCase();
  const canPro = tier === TIER.PRO || tier === TIER.VIP;
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timerId = setInterval(() => setTick(n => n + 1), 1000);
    return () => clearInterval(timerId);
  }, []);
  const alreadyPlayed = dailyPlayed?.todayKey === daily.todayKey;
  // Recalculer les compteurs de temps à chaque tick (daily/tournament sont figés par useMemo)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const liveDaily = useMemo(() => getDailyChallenge(), [tick]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const liveTournament = useMemo(() => getTournamentWeek(), [tick]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div className="hdr">
        <div className="logo">{"Petit"}<span>{t("app_logo2","Bac")}</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button className={`badge ${bc}`} onClick={onTier} style={{ fontFamily: "inherit" }}>{bl}</button>
          <button onClick={onSettings} style={{ width: 34, height: 34, borderRadius: "50%", border: "1.5px solid var(--br)", background: "var(--sf)", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>⚙️</button>
          <button className="avatar-btn" onClick={onProfile} style={{
            background: profilePhoto?.type === "emoji" ? profilePhoto.bg :
                       profilePhoto?.type === "photo" ? "transparent" : "linear-gradient(135deg,var(--ac),var(--acl))",
            overflow: profilePhoto?.type === "photo" ? "hidden" : undefined,
            padding: 0,
          }}>
            {profilePhoto?.type === "photo" ?
              <img src={profilePhoto.data} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="avatar"/> :
              profilePhoto?.type === "emoji" ? profilePhoto.emoji : initials}
          </button>
        </div>
      </div>

      <div className="cnt">
        {/* Greeting + Level + XP */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-.5px" }}>
                {t("greeting")}, {playerName || t("ob5_placeholder","Joueur")} 👋
              </div>
              <div style={{ fontSize: 13, color: "var(--txm)", marginTop: 2 }}>
                {stats.played > 0 ? `${stats.played} partie${stats.played > 1 ? "s" : ""} · ${stats.won} victoire${stats.won > 1 ? "s" : ""}` : t("ready","Prêt à jouer ?")}
              </div>
            </div>
            <button className="level-chip" onClick={onProfile}>
              {levelInfo.badge} {t("level","Niv.")} {levelInfo.level}
            </button>
          </div>
          {/* XP Bar */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--txm)", marginBottom: 4 }}>
              <span>{levelInfo.name}</span>
              <span>{xp} / {levelInfo.next?.xpNeeded || "MAX"} XP</span>
            </div>
            <div className="xp-bar"><div className="xp-fill" style={{ width: `${levelInfo.progress}%` }} /></div>
          </div>
        </div>

        {/* Quick stats */}
        {stats.played > 0 && (
          <div className="sgrid" style={{ marginBottom: 18 }}>
            {[
              [t("stats_games"), stats.played],
              [t("stats_wins"), stats.won],
              [t("stats_best"), stats.best + " " + t("pts","pts")],
              [t("stats_total"), stats.total + " " + t("pts","pts")]
            ].map(([l, v]) => (
              <div key={l} className="scard"><div className="snum">{v}</div><div className="slbl">{l}</div></div>
            ))}
          </div>
        )}

        {/* Daily Challenge Card */}
        <button
          className={`daily-card ${alreadyPlayed ? "daily-card-done" : "daily-card-bg"}`}
          onClick={alreadyPlayed ? undefined : (canPro ? onDaily : onTier)}
        >
          <div className="daily-star">⭐</div>
          {!alreadyPlayed && <div className="daily-letter-badge">{daily.letter}</div>}
          <div className={alreadyPlayed ? "" : ""} style={{ color: alreadyPlayed ? "var(--tx)" : "#fff" }}>
            <div className="daily-label" style={{ color: alreadyPlayed ? "var(--txm)" : undefined }}>
              {alreadyPlayed ? t("daily_done") : "⭐ " + t("daily_label")}
            </div>
            <div className="daily-title" style={{ color: alreadyPlayed ? "var(--tx)" : undefined }}>
              {alreadyPlayed ? t("daily_back") : t("daily_letter_desc",`${t("letter_label","Lettre :")} ${daily.letter} · 1 round · ${t("hard","Difficile")}`).replace("{0}", daily.letter)}
            </div>
            {alreadyPlayed && dailyPlayed?.score !== undefined
              ? <div className="daily-score">{dailyPlayed?.score} pts</div>
              : !alreadyPlayed && <div className="daily-sub">{t("daily_exclusive")}</div>
            }
            <div className="daily-cats">
              {daily.cats.map(c => (
                <span key={c.id} className={alreadyPlayed ? "daily-cat-chip-done" : "daily-cat-chip"}>
                  {c.emoji} {getCatLabel(c.id, lang || "fr")}
                </span>
              ))}
            </div>
            {!alreadyPlayed && (
              <div style={{ marginTop:6, fontSize:11, fontFamily:"monospace", opacity:.85, display:"flex", alignItems:"center", gap:4 }}>
                ⏱ {String(liveDaily.hoursLeft).padStart(2,"0")}:{String(liveDaily.minsLeft).padStart(2,"0")}:{String(liveDaily.secsLeft).padStart(2,"0")}
              </div>
            )}
            {!canPro && !alreadyPlayed && (
              <div style={{ marginTop: 8, fontSize: 11, opacity: .8 }}>{t("pro_required")}</div>
            )}
          </div>
        </button>

        {/* Weekly Tournament Card */}
        <button className="tournament-card" onClick={canPro ? onTournoi : onTier}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize: 10, opacity: .8, letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>{t("tournament_label2")}</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{t("tournament_title2")}</div>
              <div style={{ fontSize: 11, opacity: .85, marginBottom:6 }}>
                {liveTournament.daysLeft > 0 ? `${liveTournament.daysLeft} ${t("tournament_days","jours restants")}` : `${String(liveTournament.hoursLeft).padStart(2,"0")}h${String(liveTournament.minsLeft).padStart(2,"0")}m`}
              </div>
              <div style={{ fontSize:11, background:"rgba(255,255,255,0.15)", borderRadius:8, padding:"4px 8px", marginBottom:4 }}>
                🏆 {t("tournament_prize","Gagnant = 1 mois VIP offert !")}
              </div>
              <div style={{ fontSize:10, opacity:.75 }}>
                ⚡ {t("tournament_rules_short","Réponses uniques = +10pts • Faux = ❌ éliminé")}
              </div>
            </div>
            <div className="tournament-letter">{tournament.letter}</div>
          </div>
          {!canPro && <div style={{ marginTop:8, fontSize:11, opacity:.8 }}>🔒 {t("pro_required")}</div>}
        </button>

        {/* Game modes */}
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--txm)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>{t("game_modes2")}</div>
        <div className="mode-grid">

          {/* Solo vs IA */}
          <button className="game-mode-card gmc-solo" onClick={onSolo}>
            <div className="gmc-icon">🤖</div>
            <div>
              <div className="gmc-title">{t("solo_vs_ia")}</div>
              <div className="gmc-desc">{t("solo_desc2")}</div>
            </div>
          </button>

          {/* En ligne */}
          <button className="game-mode-card gmc-online" onClick={onOnline}>
            <div className="gmc-icon">🌐</div>
            <div>
              <div className="gmc-title">{t("multiplayer")}</div>
              <div className="gmc-desc">{t("online_desc2")}</div>
            </div>
          </button>

          {/* 2v2 */}
          <div className="game-mode-card gmc-2v2" style={{ cursor:"default" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
              <div className="gmc-icon">🤝</div>
              <div style={{ flex:1 }}>
                <div className="gmc-title">{t("mode_2v2")}</div>
                <div className="gmc-desc">{t("mode_2v2_desc2")}</div>
              </div>
            </div>
            {canPro ? (
              <div style={{ display:"flex", gap:6 }}>
                <button className="btn bs" style={{ flex:1, fontSize:11, padding:"7px 4px", background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.3)", color:"#fff" }} onClick={on2v2}>
                  🤖 {t("vs_bots","vs Bots")}
                </button>
                <button className="btn bp" style={{ flex:1, fontSize:11, padding:"7px 4px", background:"rgba(255,255,255,0.25)", border:"1px solid rgba(255,255,255,0.5)", color:"#fff" }} onClick={onOnline2v2}>
                  🌍 {t("en_ligne","En ligne")}
                </button>
              </div>
            ) : (
              <button className="btn bs" style={{ width:"100%", fontSize:11, padding:"6px", background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.3)", color:"#fff" }} onClick={onTier}>
                🔒 {t("unlock_pro","Débloquer PRO")}
              </button>
            )}
          </div>

          {/* Mort subite */}
          <button className="game-mode-card gmc-mort" onClick={canPro ? onMort : onTier}>
            <div className="gmc-icon">💀</div>
            <div>
              <div className="gmc-title">{t("mort_subite")}</div>
              <div className="gmc-desc">{t("mort_desc2")}</div>
            </div>
            {!canPro && <span className="gmc-badge">{t("pro_label")}</span>}
          </button>

        </div>

        {/* Points reminder */}
        <div style={{ padding: "12px 14px", background: "var(--sf)", border: "1.5px solid var(--br)", borderRadius: "var(--rm)", marginTop: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--txm)", marginBottom: 5, textTransform: "uppercase", letterSpacing: ".5px" }}>{t("points_rule2")}</div>
          <div style={{ fontSize: 12, color: "var(--txm)", lineHeight: 1.7 }}>
            <span style={{ color: "var(--gn)", fontWeight: 700 }}>2 pts</span> {t("pts_unique")} ·{" "}
            <span style={{ color: "var(--yw)", fontWeight: 700 }}>1 pt</span> {t("pts_shared")} ·{" "}
            <span style={{ color: "var(--rd)", fontWeight: 700 }}>0</span> {t("pts_invalid2")}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PROFILE PANEL ────────────────────────────────────────────────
// ─── FRIENDS PANEL ────────────────────────────────────────────────
function FriendsPanel({ uid, myFriendCode, playerName, friends, friendRequests, onClose, onRefresh, lang }) {
  const t = useT(lang || "fr");
  const [tab, setTab] = useState("friends"); // friends | add | requests
  const [addCode, setAddCode] = useState("");
  const [addStatus, setAddStatus] = useState(null); // null | sending | sent | error | self | already
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [copied, setCopied] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const requestCount = Object.keys(friendRequests || {}).length;
  const friendList = Object.entries(friends || {}).map(([fuid, data]) => ({ uid: fuid, ...data }))
    .sort((a, b) => (b.xp || 0) - (a.xp || 0));

  // Generate QR code asynchronously using the qrcode package
  useEffect(() => {
    if (!myFriendCode) return;
    import("qrcode").then(mod => {
      const QRCode = mod.default || mod;
      QRCode.toDataURL(myFriendCode, {
        width: 200, margin: 2,
        color: { dark: "#18171a", light: "#ffffff" },
        errorCorrectionLevel: "M",
      }).then(url => setQrDataUrl(url)).catch(() => {});
    }).catch(() => {});
  }, [myFriendCode]);

  // Cleanup camera on unmount
  useEffect(() => () => stopScanner(), []);

  function stopScanner() {
    if (streamRef.current) { streamRef.current.getTracks().forEach(tr => tr.stop()); streamRef.current = null; }
    if (scanIntervalRef.current) { clearInterval(scanIntervalRef.current); scanIntervalRef.current = null; }
    setScanning(false);
  }

  async function startScanner() {
    if (typeof window === "undefined" || !("BarcodeDetector" in window)) {
      alert(t("qr_not_supported"));
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setScanning(true);
      setTimeout(() => {
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
        scanIntervalRef.current = setInterval(async () => {
          if (!videoRef.current) return;
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const raw = barcodes[0].rawValue.trim().toUpperCase();
              setAddCode(raw);
              setAddStatus(null);
              stopScanner();
            }
          } catch { /* ignore */ }
        }, 500);
      }, 400);
    } catch {
      alert(t("camera_denied"));
    }
  }

  async function handleAddFriend() {
    const code = addCode.trim().toUpperCase();
    if (!code) return;
    if (code === myFriendCode) { setAddStatus("self"); return; }
    setAddStatus("sending");
    try {
      const targetUid = await FB.lookupByFriendCode(code);
      if (!targetUid) { setAddStatus("error"); return; }
      if (targetUid === uid) { setAddStatus("self"); return; }
      // Check not already friends
      if (friends && friends[targetUid]) { setAddStatus("already"); return; }
      await FB.sendFriendRequest(uid, playerName || "Joueur", targetUid);
      setAddStatus("sent");
      setAddCode("");
    } catch {
      setAddStatus("error");
    }
  }

  async function handleAccept(fromUid) {
    await FB.acceptFriendRequest(uid, fromUid);
    onRefresh();
  }
  async function handleReject(fromUid) {
    await FB.rejectFriendRequest(uid, fromUid);
    onRefresh();
  }
  async function handleRemove(friendUid) {
    await FB.removeFriend(uid, friendUid);
    onRefresh();
  }

  function handleCopy() {
    navigator.clipboard?.writeText(myFriendCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Fallback for non-secure contexts
      try {
        const ta = document.createElement("textarea");
        ta.value = myFriendCode;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch { /* ignore */ }
    });
  }

  return (
    <div className="profile-ov" onClick={onClose}>
      <div className="profile-panel" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="profile-hero" style={{ padding: "28px 22px 24px" }}>
          <div style={{ flex: 1 }}>
            <div className="profile-name">👥 {t("friends_title")}</div>
            <div className="profile-sub">{friendList.length} {t("friends_count")}</div>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,.18)", border: "none", borderRadius: 12,
            color: "#fff", padding: "8px 14px", cursor: "pointer", fontWeight: 900, fontSize: 16
          }}>✕</button>
        </div>

        <div className="profile-body">
          {/* Tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {[
              { id: "friends", label: `👥 ${t("friends_tab")}` },
              { id: "add", label: `➕ ${t("add_tab")}` },
              { id: "requests", label: null },
            ].map(tb => (
              <button key={tb.id}
                className={`btn ${tab === tb.id ? "bp" : "bs"}`}
                style={{ flex: 1, fontSize: 12, padding: "10px 6px", position: "relative" }}
                onClick={() => setTab(tb.id)}>
                {tb.id === "requests" ? (
                  <>
                    🔔 {t("requests_tab")}
                    {requestCount > 0 && (
                      <span style={{
                        position: "absolute", top: -7, right: -5,
                        background: "#e74c3c", color: "#fff", borderRadius: "50%",
                        width: 20, height: 20, fontSize: 10, fontWeight: 900,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 2px 8px rgba(231,76,60,.4)",
                      }}>{requestCount}</span>
                    )}
                  </>
                ) : tb.label}
              </button>
            ))}
          </div>

          {/* ── FRIENDS LIST ── */}
          {tab === "friends" && (
            friendList.length === 0 ? (
              <div style={{ textAlign: "center", padding: "44px 20px", color: "var(--txm)" }}>
                <div style={{ fontSize: 52, marginBottom: 14 }}>👥</div>
                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6, color: "var(--tx)" }}>{t("no_friends")}</div>
                <div style={{ fontSize: 13 }}>{t("no_friends_hint")}</div>
                <button className="btn bp" style={{ marginTop: 20 }} onClick={() => setTab("add")}>
                  ➕ {t("add_friend_btn")}
                </button>
              </div>
            ) : (
              <>
                {friendList.map(f => (
                  <div key={f.uid} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 14px", background: "var(--sf2)",
                    borderRadius: 16, border: "1.5px solid var(--br)", marginBottom: 10,
                  }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: "50%",
                      background: "var(--acs)", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 20, fontWeight: 900, color: "var(--ac)",
                    }}>{(f.name || "?").charAt(0).toUpperCase()}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name || "Joueur"}</div>
                      <div style={{ fontSize: 11, color: "var(--txm)", marginTop: 2 }}>{f.xp || 0} XP</div>
                    </div>
                    <button
                      onClick={() => handleRemove(f.uid)}
                      style={{
                        background: "none", border: "1.5px solid var(--br)",
                        borderRadius: 10, padding: "6px 10px",
                        cursor: "pointer", color: "var(--txm)", fontSize: 12, flexShrink: 0,
                      }}
                      title={t("remove_friend")}
                    >✕</button>
                  </div>
                ))}
              </>
            )
          )}

          {/* ── ADD FRIEND ── */}
          {tab === "add" && (
            <>
              {/* My code + QR */}
              <div className="profile-section">
                <div className="profile-section-title">{t("my_code")}</div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                  {/* QR Code */}
                  <div style={{
                    background: "#fff", borderRadius: 20, padding: 14,
                    boxShadow: "0 6px 24px rgba(0,0,0,.12)",
                  }}>
                    {qrDataUrl
                      ? <img src={qrDataUrl} alt="QR Code" style={{ width: 160, height: 160, display: "block", borderRadius: 8 }} />
                      : <div style={{ width: 160, height: 160, display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa", fontSize: 13 }}>⏳</div>
                    }
                  </div>
                  {/* Text code + copy */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    background: "var(--sf2)", border: "1.5px solid var(--br)",
                    borderRadius: 16, padding: "12px 16px", width: "100%",
                  }}>
                    <span style={{
                      flex: 1, fontFamily: "JetBrains Mono, monospace", fontWeight: 900,
                      fontSize: 18, letterSpacing: 3, color: "var(--ac)", textAlign: "center",
                    }}>{myFriendCode || "…"}</span>
                    <button
                      onClick={handleCopy}
                      style={{
                        background: copied ? "var(--ac)" : "var(--acs)",
                        border: "none", borderRadius: 10,
                        padding: "8px 12px", cursor: "pointer",
                        color: copied ? "#fff" : "var(--ac)",
                        fontWeight: 800, fontSize: 12, flexShrink: 0,
                        transition: "all .2s",
                      }}
                    >{copied ? `✓ ${t("copied")}` : `📋 ${t("copy")}`}</button>
                  </div>
                </div>
              </div>

              {/* Add by code input */}
              <div className="profile-section">
                <div className="profile-section-title">{t("add_by_code")}</div>
                {/* QR scanner viewport */}
                {scanning && (
                  <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", marginBottom: 12, aspectRatio: "1 / 1" }}>
                    <video ref={videoRef} autoPlay playsInline muted
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    {/* Overlay reticle */}
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{
                        width: "58%", height: "58%",
                        border: "2.5px solid rgba(255,255,255,.9)",
                        borderRadius: 12,
                        boxShadow: "0 0 0 9999px rgba(0,0,0,.45)",
                      }} />
                    </div>
                    <button onClick={stopScanner} style={{
                      position: "absolute", top: 10, right: 10,
                      background: "rgba(0,0,0,.6)", border: "none",
                      borderRadius: 10, color: "#fff", padding: "6px 10px",
                      cursor: "pointer", fontWeight: 700,
                    }}>✕</button>
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <input
                    value={addCode}
                    onChange={e => { setAddCode(e.target.value.toUpperCase()); setAddStatus(null); }}
                    onKeyDown={e => { if (e.key === "Enter") handleAddFriend(); }}
                    placeholder={t("enter_code")}
                    maxLength={12}
                    style={{
                      flex: 1, background: "var(--sf2)", border: "1.5px solid var(--br)",
                      borderRadius: 12, padding: "12px 14px", color: "var(--tx)",
                      fontFamily: "JetBrains Mono, monospace", fontWeight: 700,
                      fontSize: 14, outline: "none",
                    }}
                  />
                  {!scanning && (
                    <button
                      onClick={startScanner}
                      title={t("scan_qr")}
                      style={{
                        background: "var(--sf2)", border: "1.5px solid var(--br)",
                        borderRadius: 12, padding: "0 14px",
                        cursor: "pointer", fontSize: 22, flexShrink: 0,
                      }}>📷</button>
                  )}
                </div>
                {/* Status messages */}
                {addStatus === "self"    && <div className="friend-status-err">{t("add_self_error")}</div>}
                {addStatus === "already" && <div className="friend-status-err">{t("add_already_error")}</div>}
                {addStatus === "error"   && <div className="friend-status-err">{t("add_not_found")}</div>}
                {addStatus === "sent"    && <div className="friend-status-ok">✅ {t("add_sent")}</div>}
                <button
                  className="btn bp"
                  onClick={handleAddFriend}
                  disabled={addStatus === "sending" || !addCode.trim()}
                  style={{ marginTop: 4 }}>
                  {addStatus === "sending" ? "⏳" : `➕ ${t("add_friend_btn")}`}
                </button>
              </div>
            </>
          )}

          {/* ── FRIEND REQUESTS ── */}
          {tab === "requests" && (
            Object.entries(friendRequests || {}).length === 0 ? (
              <div style={{ textAlign: "center", padding: "44px 20px", color: "var(--txm)" }}>
                <div style={{ fontSize: 52, marginBottom: 14 }}>🔔</div>
                <div style={{ fontWeight: 800, fontSize: 15, color: "var(--tx)" }}>{t("no_requests")}</div>
              </div>
            ) : Object.entries(friendRequests).map(([fromUid, req]) => (
              <div key={fromUid} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 14px", background: "var(--sf2)",
                borderRadius: 16, border: "1.5px solid var(--br)", marginBottom: 10,
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: "50%",
                  background: "var(--acs)", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, fontWeight: 900, color: "var(--ac)",
                }}>{(req.name || "?").charAt(0).toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{req.name || "Joueur"}</div>
                  <div style={{ fontSize: 11, color: "var(--txm)", marginTop: 2 }}>{t("wants_to_add")}</div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => handleAccept(fromUid)}
                    style={{
                      background: "#00b894", border: "none", borderRadius: 10,
                      padding: "8px 12px", cursor: "pointer",
                      color: "#fff", fontWeight: 900, fontSize: 15,
                    }}>✓</button>
                  <button
                    onClick={() => handleReject(fromUid)}
                    style={{
                      background: "none", border: "1.5px solid var(--br)",
                      borderRadius: 10, padding: "8px 12px",
                      cursor: "pointer", color: "var(--txm)", fontSize: 14,
                    }}>✕</button>
                </div>
              </div>
            ))
          )}

          <button className="btn bs" style={{ marginTop: 4 }} onClick={onClose}>{t("close")}</button>
        </div>
      </div>
    </div>
  );
}

function ProfilePanel({ stats, playerName, wordHistory, catHistory, tier, onClose, xp, unlockedBadges, onLeaderboard, onThemes, onEditProfile, onShare, onRateApp, onBugReport, onFriends, friendRequestCount, lang }) {
  const t = useT(lang || "fr");
  const initials = (playerName || "J").charAt(0).toUpperCase();
  const tierLabel = tier === TIER.VIP ? "VIP ★" : tier === TIER.PRO ? "PRO ◆" : t("free_label","◇");
  const winRate = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
  const levelInfo = getLevelInfo(xp || 0, lang);

  // Top 5 most used words
  const wordCount = {};
  wordHistory.forEach(w => { if (w) wordCount[w] = (wordCount[w] || 0) + 1; });
  const topWords = Object.entries(wordCount).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([w]) => w);

  // Top categories
  const topCats = Object.entries(catHistory).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxCat = topCats[0]?.[1] || 1;
  const catMap = {};
  [...FREE_CATS, ...PRO_CATS].forEach(c => { catMap[c.id] = c; });

  return (
    <div className="profile-ov" onClick={onClose}>
      <div className="profile-panel" onClick={e => e.stopPropagation()}>
        {/* Hero */}
        <div className="profile-hero">
          <div className="profile-avatar-lg">{initials}</div>
          <div style={{ flex: 1 }}>
            <div className="profile-name">{playerName || t("ob5_placeholder","Joueur")}</div>
            <div className="profile-sub">{tierLabel} · {levelInfo.badge} {levelInfo.name}</div>
            {/* XP Progress bar */}
            <div style={{ marginTop: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, opacity: .75, marginBottom: 4 }}>
                <span>{xp} XP</span>
                {levelInfo.next && <span>→ {levelInfo.next.name} ({levelInfo.next.xpNeeded} XP)</span>}
              </div>
              <div style={{ height: 4, background: "rgba(255,255,255,0.2)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${levelInfo.progress}%`, background: "#fff", borderRadius: 4, transition: "width 0.8s ease" }} />
              </div>
            </div>
          </div>
        </div>

        <div className="profile-body">
          {/* Stats */}
          <div className="profile-stats">
            <div className="pstat">
              <div className="pstat-num">{stats.played}</div>
              <div className="pstat-lbl">{t("stats_games")}</div>
            </div>
            <div className="pstat">
              <div className="pstat-num">{stats.won}</div>
              <div className="pstat-lbl">{t("stats_wins")}</div>
            </div>
            <div className="pstat">
              <div className="pstat-num">{winRate}%</div>
              <div className="pstat-lbl">{t("stats_winrate")}</div>
            </div>
            <div className="pstat">
              <div className="pstat-num">{stats.best}</div>
              <div className="pstat-lbl">{t("stats_best")}</div>
            </div>
            <div className="pstat">
              <div className="pstat-num">{stats.total}</div>
              <div className="pstat-lbl">{t("stats_total")}</div>
            </div>
            <div className="pstat">
              <div className="pstat-num">{stats.played > 0 ? Math.round(stats.total / stats.played) : 0}</div>
              <div className="pstat-lbl">{t("stats_avg")}</div>
            </div>
          </div>

          {/* Top words */}
          {topWords.length > 0 && (
            <div className="profile-section">
              <div className="profile-section-title">{t("fav_words")}</div>
              <div className="word-chips">
                {topWords.map(w => <span key={w} className="word-chip">{w}</span>)}
              </div>
            </div>
          )}
          {topWords.length === 0 && (
            <div className="profile-section">
              <div className="profile-section-title">{t("fav_words")}</div>
              <div style={{ fontSize: 13, color: "var(--txm)", fontStyle: "italic" }}>
                {t("no_words_yet2")}
              </div>
            </div>
          )}

          {/* Favorite categories */}
          <div className="profile-section">
            <div className="profile-section-title">{t("fav_cats2")}</div>
            {topCats.length > 0 ? topCats.map(([catId, count]) => {
              const cat = catMap[catId];
              if (!cat) return null;
              return (
                <div key={catId} className="cat-rank">
                  <span style={{ fontSize: 16 }}>{cat.emoji}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{getCatLabel(cat.id, lang || "fr")}</span>
                  <div className="cat-rank-bar">
                    <div className="cat-rank-fill" style={{ width: `${(count / maxCat) * 100}%` }} />
                  </div>
                  <span style={{ fontSize: 11, color: "var(--txm)", fontFamily: "JetBrains Mono, monospace", minWidth: 24, textAlign: "right" }}>{count}</span>
                </div>
              );
            }) : (
              <div style={{ fontSize: 13, color: "var(--txm)", fontStyle: "italic" }}>
                {t("no_cats_yet")}
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="profile-section">
            <div className="profile-section-title">{t("badges_section","Badges")} ({unlockedBadges?.length || 0}/{BADGE_DEFS.length})</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {BADGE_DEFS.map(b => {
                const unlocked = unlockedBadges?.includes(b.id);
                return (
                  <div key={b.id} title={b.desc} style={{
                    width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, background: unlocked ? "var(--acs)" : "var(--sf2)",
                    border: `1.5px solid ${unlocked ? "var(--ac-border,rgba(67,56,202,0.2))" : "var(--br)"}`,
                    opacity: unlocked ? 1 : 0.3, cursor: "default",
                  }}>
                    {b.icon}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8, marginBottom: 10, marginTop: 4 }}>
            <button className="btn bs" style={{ flex: 1, fontSize: 12 }} onClick={onLeaderboard}>🏆 {t("nav_rank")}</button>
            <button className="btn bs" style={{ flex: 1, fontSize: 12 }} onClick={onThemes}>{t("themes_title")}</button>
          </div>
          {/* Friends */}
          <button className="btn bs mb8" style={{ marginBottom: 8, position: "relative" }} onClick={onFriends}>
            {t("friends_btn")}
            {friendRequestCount > 0 && (
              <span style={{
                position: "absolute", top: -6, right: -4,
                background: "#e74c3c", color: "#fff", borderRadius: "50%",
                width: 20, height: 20, fontSize: 10, fontWeight: 900,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 8px rgba(231,76,60,.4)",
              }}>{friendRequestCount}</span>
            )}
          </button>
          {/* Profile photo */}
          <button className="btn bs mb8" style={{ marginBottom: 8 }} onClick={onEditProfile}>
            {t("edit_photo")}
          </button>

          {/* Community */}
          <div className="ctitle" style={{ marginTop: 16 }}>{t("community")}</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button className="btn bs" style={{ flex: 1, fontSize: 12 }} onClick={onShare}>
              {t("share_game")}
            </button>
            <button className="btn bs" style={{ flex: 1, fontSize: 12 }} onClick={onRateApp}>
              {t("rate_app")}
            </button>
          </div>
          <button className="btn bs mb8" style={{ marginBottom: 16 }} onClick={onBugReport}>
            {t("bug_title")}
          </button>

          {/* Legal */}
          <div className="ctitle">{t("legal")}</div>
          <div className="card" style={{ padding: "12px 14px", marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: "var(--txm)", lineHeight: 1.8 }}>
              <div style={{ fontWeight: 700, marginBottom: 6, color: "var(--tx)" }}>{t("legal_title")}</div>
              <div>{t("legal_version")}</div>
              <div>{t("all_rights")}</div>
              <div style={{ marginTop: 8 }}>
                <span style={{ fontWeight: 600 }}>{t("legal_licenses")}</span>
              </div>
              <div>{t("legal_react")}</div>
              <div style={{ marginTop: 4 }}>
                <span style={{ fontWeight: 600 }}>{t("personal_data")}</span>
              </div>
              <div>{t("data_policy")}</div>
              <div style={{ marginTop: 4 }}>
                <span style={{ fontWeight: 600 }}>{t("legal_contact")}</span> {t("legal_contact_email")}
              </div>
            </div>
          </div>

          <button className="btn bs" onClick={onClose}>{t("close")}</button>
        </div>
      </div>
    </div>
  );
}

// ─── ONLINE SCREEN ────────────────────────────────────────────────
function OnlineScreen({
  uid, settings, setSettings, onEnterGame, onBack, lang, gameMode
}) {
  const t = useT(lang || "fr");
  const [step, setStep] = useState("choose");   // choose | configure | matchmaking | private_create | private_join | waiting
  const [playerName, setPlayerName] = useState(settings.playerName);
  const [country, setCountry] = useState(settings.country || "France");
  const [roomCode, setRoomCode] = useState(null);
  // Config hôte (peut être modifié dans l'étape "configure")
  const [hostDiff, setHostDiff] = useState(settings.difficulty || "medium");
  const [hostRounds, setHostRounds] = useState(settings.totalRounds || 5);
  const [hostCats, setHostCats] = useState(settings.categories || []);
  // Fallback uid si Firebase auth pas encore prête — stable via state initializer
  const [generatedId] = useState(() => "local_" + Math.random().toString(36).substring(2, 9));
  const myUid = uid || generatedId;
  const [joinCode, setJoinCode] = useState("");
  const [roomData, setRoomData] = useState(null);
  const [customTeams, setCustomTeams] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const unsubRef = useRef(null);

  function cleanup() { if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; } }

  // Retirer le joueur de la room Firebase avant de quitter la salle d'attente
  // pour éviter les joueurs fantômes (ghost players) qui gonflent le compteur
  async function leaveRoom() {
    if (roomCode && myUid && FB.db) {
      try {
        const room = await FB.getRoom(roomCode);
        if (room && room.status === "waiting") {
          const updatedPlayers = { ...(room.players || {}) };
          delete updatedPlayers[myUid];
          const updatedScores = { ...(room.cumulativeScores || {}) };
          delete updatedScores[myUid];
          // Si plus aucun joueur (hôte parti seul), supprimer la room entièrement
          if (Object.keys(updatedPlayers).length === 0) {
            await FB.updateRoom(roomCode, { status: "finished", finishedAt: Date.now() });
          } else {
            // Passer l'hôte au prochain joueur si c'est moi qui pars
            const wasHost = room.hostId === myUid;
            const nextHostId = wasHost ? Object.keys(updatedPlayers)[0] : room.hostId;
            const nextPlayers = wasHost
              ? { ...updatedPlayers, [nextHostId]: { ...updatedPlayers[nextHostId], isHost: true } }
              : updatedPlayers;
            await FB.updateRoom(roomCode, {
              players: nextPlayers,
              cumulativeScores: updatedScores,
              ...(wasHost ? { hostId: nextHostId } : {}),
            });
          }
        }
      } catch { /* ignore — ne pas bloquer la navigation */ }
    }
  }

  useEffect(() => cleanup, []);

  async function doMatchmaking(retries = 0) {
    if (retries > 3) { setError(t("room_not_found","Impossible de trouver une salle. Réessaie.")); setLoading(false); return; }
    setLoading(true); setError("");
    try {
      const existingCode = await FB.findPublicRoom(country);
      if (existingCode) {
        // Join existing room — re-fetch to confirm it is still waiting (could have started)
        const room = await FB.getRoom(existingCode);
        if (!room || room.status !== "waiting") {
          // Salle démarrée entre-temps : en créer une nouvelle
          setError("");
          return doMatchmaking(retries + 1);
        }
        await FB.updateRoom(existingCode, {
          players: { ...room.players, [myUid]: { uid: myUid, name: sanitizeName(playerName), country, isHost: false, ready: false, connected: true } },
        });
        setRoomCode(existingCode);
        setStep("waiting");
        unsubRef.current = FB.listenRoom(existingCode, rd => {
          setRoomData(rd);
          if (rd.status === "playing") { cleanup(); onEnterGame(existingCode, rd); }
        });
      } else {
        // Create public room
        const code = genCode();
        const newRoom = {
          code, type: "public", country,
          hostId: myUid, status: "waiting",
          settings: { difficulty: settings.difficulty, categories: settings.categories, totalRounds: settings.totalRounds, gameMode: gameMode || "solo", mortCatCount: settings.mortCatCount || 3 },
          players: { [myUid]: { uid: myUid, name: sanitizeName(playerName), country, isHost: true, ready: true, connected: true } },
          currentRound: 0, spinnerIndex: 0, phase: "waiting",
          cumulativeScores: { [myUid]: 0 },
        };
        await FB.createRoom(code, newRoom);
        setRoomCode(code);
        setStep("waiting");
        unsubRef.current = FB.listenRoom(code, rd => {
          setRoomData(rd);
          if (rd.status === "playing") { cleanup(); onEnterGame(code, rd); }
        });
        // Vrai matchmaking Firebase — pas de simulation
      }
    } catch (e) { cleanup(); setError(e.message); }
    setLoading(false);
  }

  async function createPrivate() {
    setLoading(true); setError("");
    try {
      const code = genCode();
      const finalCats = hostCats.length > 0 ? hostCats : settings.categories;
      const newRoom = {
        code, type: "private", country,
        hostId: myUid, status: "waiting",
        settings: { difficulty: hostDiff, categories: finalCats, totalRounds: hostRounds, gameMode: gameMode || "solo", mortCatCount: settings.mortCatCount || 3 },
        players: { [myUid]: { uid: myUid, name: sanitizeName(playerName), country, isHost: true, ready: true, connected: true } },
        currentRound: 0, spinnerIndex: 0, phase: "waiting",
        cumulativeScores: { [myUid]: 0 },
      };
      await FB.createRoom(code, newRoom);
      setRoomCode(code);
      setStep("waiting");
      unsubRef.current = FB.listenRoom(code, rd => {
        setRoomData(rd);
        if (rd.status === "playing") { cleanup(); onEnterGame(code, rd); }
      });
    } catch (e) { setError(e.message); }
    setLoading(false);
  }

  async function joinPrivate() {
    const code = joinCode.trim().toUpperCase();
    if (code.length < 4) return;
    setLoading(true); setError("");
    try {
      // Attendre que Firebase soit prêt (max 3s)
      let room = null;
      let attempts = 0;
      while (attempts < 3) {
        try {
          room = await FB.getRoom(code);
          break;
        } catch (e) {
          if (e.message && e.message.includes("PERMISSION_DENIED")) {
            throw new Error("⚠️ Firebase: configure les règles sur firebase.google.com → Realtime Database → Rules → .read: true", { cause: e });
          }
          if (attempts === 2) throw e;
          await new Promise(r => setTimeout(r, 1000));
          attempts++;
        }
      }
      if (!room) {
        throw new Error(t("room_not_found", "Salon introuvable. Vérifie le code (4 lettres majuscules)."));
      }
      if (room.status !== "waiting") {
        throw new Error(t("game_in_progress", "La partie a déjà commencé."));
      }
      const myPlayer = { uid: myUid, name: sanitizeName(playerName || settings.playerName), country, isHost: false, ready: true, connected: true };
      await FB.updateRoom(code, {
        players: { ...room.players, [myUid]: myPlayer },
        cumulativeScores: { ...(room.cumulativeScores || {}), [myUid]: 0 },
      });
      setRoomCode(code);
      setStep("waiting");
      unsubRef.current = FB.listenRoom(code, rd => {
        if (!rd) return;
        setRoomData(rd);
        if (rd.status === "playing") { cleanup(); onEnterGame(code, rd); }
      });
    } catch (e) {
      setError(e.message || t("room_not_found", "Impossible de rejoindre. Réessaie."));
    }
    setLoading(false);
  }

  async function startGame() {
    if (!roomCode) return;
    const room = await FB.getRoom(roomCode);
    if (!room) return;
    const playerIds = Object.keys(room.players || {});
    const spinnerOrder = [...playerIds].sort(() => Math.random() - 0.5);

    // Équipes 2v2: si l'hôte a fait des assignations manuelles, les utiliser
    // Sinon mélanger aléatoirement
    let teams2v2 = null;
    if (gameMode === "2v2") {
      if (customTeams && Object.keys(customTeams).length > 0) {
        // Convertir les assignments en groupes d'équipes
        const tg = { team0: [], team1: [], team2: [] };
        Object.entries(customTeams).forEach(([key, pid]) => {
          const teamId = key.split("_")[0];
          if (tg[teamId]) tg[teamId].push(pid);
        });
        // Ne garder que les équipes non-vides
        teams2v2 = Object.fromEntries(Object.entries(tg).filter(([, v]) => v.length > 0));
      } else {
        const shuffled = [...playerIds].sort(() => Math.random() - 0.5);
        const half = Math.ceil(shuffled.length / 2);
        teams2v2 = { team0: shuffled.slice(0, half), team1: shuffled.slice(half) };
      }
    }

    // Pour mort subite: choisir les catégories actives du 1er round
    const mortCatCountOnline = room.settings?.mortCatCount || null;
    const allCatIds = room.settings?.categories || [];
    let firstRoundCatIds = allCatIds;
    if (room.settings?.gameMode === "mort" && mortCatCountOnline) {
      const shuffled = [...allCatIds].sort(() => Math.random() - 0.5);
      firstRoundCatIds = shuffled.slice(0, Math.min(mortCatCountOnline, shuffled.length));
    }

    // phase: "roulette" → déclenche la roulette de lettre
    await FB.updateRoom(roomCode, {
      status: "playing",
      phase: "roulette",
      spinnerOrder,
      spinnerIndex: 0,
      currentRound: 1,
      letter: null,
      startedAt: Date.now(),
      activeCategoryIds: firstRoundCatIds,
      ...(teams2v2 ? { teams: teams2v2 } : {}),
    });
  }

  const players = roomData ? Object.values(roomData.players || {}) : [];
  const isHost = roomData?.hostId === myUid || roomData?.hostId === uid;

  if (step === "choose") return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh" }}>
      <div className="hdr">
        <button className="btn bs bsm" onClick={onBack} style={{ width: "auto" }}>{t("ob_back")}</button>
        <span style={{ fontWeight: 700, fontSize: 14 }}>{t("play_online")}</span>
        <div style={{ width: 55 }} />
      </div>
      <div className="cnt">
        {!FIREBASE_READY && (
          <div className="fb-banner">
            <div className="fb-title">{t("firebase_demo")}</div>
            <div className="fb-desc">{t("firebase_demo_desc")}</div>
          </div>
        )}
        {FIREBASE_READY && (
          <div style={{ padding:"8px 12px", background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.25)", borderRadius:"var(--rs)", marginBottom:10, fontSize:11, color:"var(--gn)", display:"flex", alignItems:"center", gap:6 }}>
            <span>🟢</span> {t("firebase_connected","Firebase connecté — multijoueur actif")}
          </div>
        )}
        <div className="card">
          <div className="ctitle">{t("your_profile2")}</div>
          <input className="inp mb8" style={{ marginBottom: 8 }} value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder={t("your_firstname")} maxLength={20} />
          <select className="inp" value={country} onChange={e => setCountry(e.target.value)}>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="online-modes">
          <div className="mode-card" onClick={() => { setSettings(s => ({ ...s, playerName, country })); doMatchmaking(); setStep("matchmaking"); }}>
            <div className="mode-icon">🌍</div>
            <div className="mode-title">{t("public_game")}</div>
            <div className="mode-desc">{t("matchmaking_country")} {country} {t("matchmaking_random")}</div>
          </div>
          <div className="mode-card" onClick={() => setStep("configure")}>
            <div className="mode-icon">🔒</div>
            <div className="mode-title">{t("private_room")}</div>
            <div className="mode-desc">{t("online_subtitle")}</div>
          </div>
        </div>
        <div className="mode-card" style={{ textAlign: "left", display: "flex", alignItems: "center", gap: 14 }} onClick={() => setStep("private_join")}>
          <div style={{ fontSize: 28 }}>🎟️</div>
          <div><div className="mode-title">{t("join_with_code")}</div><div className="mode-desc">{t("code_prompt")}</div></div>
        </div>
      </div>
    </div>
  );

  if (step === "matchmaking") return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh" }}>
      <div className="hdr">
        <button className="btn bs bsm" onClick={() => { leaveRoom(); cleanup(); setStep("choose"); }} style={{ width: "auto" }}>{t("cancel2")}</button>
        <span style={{ fontWeight: 700, fontSize: 14 }}>{t("search_ellipsis")}</span>
        <div style={{ width: 55 }} />
      </div>
      <div className="cnt">
        {error && <div style={{ padding: "10px 14px", background: "rgba(248,113,113,.1)", border: "1px solid rgba(248,113,113,.25)", borderRadius: "var(--rs)", marginBottom: 12, fontSize: 12, color: "var(--rd)" }}>{error}</div>}
        <div className="mm-box">
          <div className="mm-spinner" />
          <div className="mm-title">{t("searching_players")}</div>
          <div className="mm-sub">{t("waiting_players_desc")}</div>
          <div className="mm-country">📍 {country}</div>
        </div>
        {roomCode && (
          <div className="card">
            <div className="ctitle">{t("players_found")} ({players.length})</div>
            {players.map(p => (
              <div key={p.uid} className="pi">
                <div className={`pav ${p.uid === myUid || p.uid === uid ? "pav-human" : "pav-guest"}`}>{p.name[0]}</div>
                <div><div className="pn">{p.name}</div><div className="ps">{p.country}</div></div>
                {p.isHost && <span className="hbadge">{t("host")}</span>}
                {p.ready && !p.isHost && <span className="rbadge">{t("ready")}</span>}
              </div>
            ))}
            {isHost && players.length >= 2 && (
              <button className="btn bp mt10" style={{ marginTop: 10 }} onClick={startGame}>🚀 Lancer ({players.length} joueurs)</button>
            )}
            {isHost && players.length < 2 && <p className="txm tc mt10" style={{ marginTop: 10 }}>{t("waiting_players_min")}</p>}
          </div>
        )}
      </div>
    </div>
  );

  if (step === "configure") return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh" }}>
      <div className="hdr">
        <button className="btn bs bsm" onClick={() => setStep("choose")} style={{ width: "auto" }}>{t("ob_back")}</button>
        <span style={{ fontWeight: 700, fontSize: 14 }}>⚙️ {t("game_settings","Paramètres")}</span>
        <div style={{ width: 55 }} />
      </div>
      <div className="cnt">
        <div className="card">
          <div className="ctitle">{t("your_name2","Ton nom")}</div>
          <input className="inp" value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder={t("your_firstname","Prénom")} maxLength={20} />
        </div>

        <div className="card">
          <div className="ctitle">{t("difficulty_label","Difficulté")}</div>
          <div className="dg">
            {Object.entries(DIFFICULTY).map(([k, d]) => (
              <button key={k} className={`db ${hostDiff === k ? "sel" : ""}`}
                style={hostDiff === k ? { background: d.color, borderColor: "transparent" } : {}}
                onClick={() => setHostDiff(k)}>
                <div className="dd" style={{ background: d.color }} />
                {t(k, k)}
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="ctitle">{t("rounds_label","Manches")}</div>
          <div className="rounds-grid">
            {[3, 5, 10].map(n => (
              <button key={n} className={`rb ${hostRounds === n ? "sel" : ""}`} onClick={() => setHostRounds(n)}>{n}</button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="ctitle">{t("categories_label","Catégories")} ({hostCats.length || ALL_BASE.length})</div>
          <div className="cg">
            {ALL_BASE.map(cat => {
              const sel = hostCats.length === 0 || hostCats.includes(cat.id);
              return (
                <button key={cat.id} className={`ct ${sel ? "ct-on" : ""}`}
                  onClick={() => {
                    if (hostCats.length === 0) {
                      // Tout sélectionné → décocher cette catégorie
                      setHostCats(ALL_BASE.map(c => c.id).filter(id => id !== cat.id));
                    } else if (sel) {
                      const next = hostCats.filter(id => id !== cat.id);
                      setHostCats(next.length === 0 ? ALL_BASE.map(c => c.id) : next);
                    } else {
                      setHostCats([...hostCats, cat.id]);
                    }
                  }}>
                  {cat.emoji} {getCatLabel(cat.id, lang || "fr")}
                </button>
              );
            })}
          </div>
        </div>

        <button className="btn bp" onClick={() => setStep("private_create")}>
          {t("continue_btn","Continuer")} →
        </button>
      </div>
    </div>
  );

  if (step === "private_create" || step === "private_join") return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh" }}>
      <div className="hdr">
        <button className="btn bs bsm" onClick={() => { cleanup(); setStep(step === "private_create" ? "configure" : "choose"); }} style={{ width: "auto" }}>{t("ob_back")}</button>
        <span style={{ fontWeight: 700, fontSize: 14 }}>{t("private_room")}</span>
        <div style={{ width: 55 }} />
      </div>
      <div className="cnt">
        {error && <div style={{ padding: "10px 14px", background: "rgba(248,113,113,.1)", border: "1px solid rgba(248,113,113,.25)", borderRadius: "var(--rs)", marginBottom: 12, fontSize: 12, color: "var(--rd)" }}>{error}</div>}
        {step === "private_create" ? (
          <div className="card">
            <div className="ctitle">{t("create_room","Créer un salon")}</div>
            <div style={{ fontSize: 12, color: "var(--txm)", marginBottom: 12 }}>
              <span>⚡ {t(hostDiff, hostDiff)} · 🔄 {hostRounds} {t("rounds_label","manches")} · 🗂 {hostCats.length || ALL_BASE.length} {t("categories_label","catégories")}</span>
            </div>
            <button className="btn bp" onClick={createPrivate} disabled={loading}>
              {loading ? <span className="spin">⟳</span> : t("create_room_private","Créer le salon")}
            </button>
          </div>
        ) : (
          <div className="card">
            <div className="ctitle">{t("join_with_code","Rejoindre avec un code")}</div>
            <input className="inp" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="Ex: AB3C" maxLength={4}
              style={{ fontFamily: "'DM Mono',monospace", fontSize: 24, letterSpacing: 8, textAlign: "center", marginBottom: 12 }} />
            <button className="btn bp" onClick={joinPrivate} disabled={joinCode.length < 4 || loading}>
              {loading ? <span className="spin">⟳</span> : t("join_btn","Rejoindre")}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (step === "waiting") return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh" }}>
      <div className="hdr">
        <button className="btn bs bsm" onClick={() => { leaveRoom(); cleanup(); setStep("choose"); }} style={{ width: "auto" }}>✕</button>
        <span style={{ fontWeight: 700, fontSize: 14 }}>{roomData?.type === "private" ? t("private_room") : "🌍 Public"} · {gameMode === "2v2" ? "🤝 2v2" : gameMode === "mort" ? "💀 Mort Subite" : "🌍 Multijoueur"}</span>
        <div style={{ width: 40 }} />
      </div>
      <div className="cnt">
        {roomData?.type === "private" && (
          <div className="card">
            <div className="ctitle">{t("room_code")}</div>
            <div className="rc">{roomCode}</div>
            <p className="txm tc">{t("share_code")}</p>
          </div>
        )}
        <div className="card">
          <div className="ctitle row jb" style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{t("players_count")} ({players.length}/6)</span>
            {!isHost && <span className="pulse txm">{t("waiting_host")}</span>}
          </div>
          {/* Liste joueurs — mode standard ou haut du 2v2 */}
          {gameMode !== "2v2" && players.map(p => (
            <div key={p.uid} className="pi">
              <div className={`pav ${p.uid === myUid || p.uid === uid ? "pav-human" : "pav-guest"}`}>{(p.name || "?")[0]}</div>
              <div><div className="pn">{p.name}{p.uid === myUid || p.uid === uid ? " " + t("its_you_paren","(toi)") : ""}</div><div className="ps">📍 {p.country}</div></div>
              {p.isHost && <span className="hbadge">{t("host")}</span>}
              {!p.isHost && p.ready && <span className="rbadge">{t("ready")}</span>}
              {!p.isHost && !p.ready && <span className="wbadge pulse">…</span>}
            </div>
          ))}

          {/* ── Éditeur d'équipes 2v2 (hôte seulement) ── */}
          {gameMode === "2v2" && (() => {
            const TEAM_DEFS = [
              { key: "team0", label: t("team_red","🔴 Équipe Rouge"), color: "#ef4444" },
              { key: "team1", label: t("team_blue","🔵 Équipe Bleu"),  color: "#3b82f6" },
              { key: "team2", label: t("team_green","🟢 Équipe Verte"), color: "#22c55e" },
            ];
            // Assignment: playerId → teamKey
            const assigned = customTeams || {};
            const unassigned = players.filter(p => !Object.values(assigned).includes(p.uid));
            function assignPlayer(uid, teamKey) {
              setCustomTeams(prev => {
                const n = {...(prev||{})};
                // Remove uid from all team slots
                Object.keys(n).forEach(k => { if (n[k] === uid) delete n[k]; });
                // Add to new slot only if assigning to a real team (not "none")
                if (teamKey !== "none") n[teamKey + "_" + uid] = uid;
                return n;
              });
            }
            const teamGroups = {};
            TEAM_DEFS.forEach(td => {
              teamGroups[td.key] = players.filter(p => {
                return Object.entries(assigned).some(([k, v]) => k.startsWith(td.key) && v === p.uid);
              });
            });
            return (
              <div>
                <div style={{ fontSize: 11, color: "var(--txm)", marginBottom: 8 }}>
                  {isHost ? t("assign_teams","Placez chaque joueur dans une équipe") : t("waiting_host","En attente de l'hôte…")}
                </div>
                {TEAM_DEFS.map(td => (
                  <div key={td.key} style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: td.color, marginBottom: 4 }}>{td.label}</div>
                    <div style={{ minHeight: 36, background: td.color + "15", borderRadius: 8, border: `1px dashed ${td.color}40`, padding: "4px 8px", display:"flex", flexWrap:"wrap", gap:4 }}>
                      {teamGroups[td.key].map(p => (
                        <span key={p.uid} style={{ fontSize: 12, padding: "2px 8px", background: td.color + "30", borderRadius: 12, color: td.color }}>
                          {p.name}
                          {isHost && <button onClick={() => assignPlayer(p.uid, "none")} style={{ marginLeft:4, background:"none", border:"none", cursor:"pointer", color:td.color }}>✕</button>}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {unassigned.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 11, color: "var(--txm)", marginBottom: 4 }}>Joueurs non assignés :</div>
                    {unassigned.map(p => (
                      <div key={p.uid} className="pi" style={{ alignItems:"center" }}>
                        <div className={`pav ${p.uid === myUid ? "pav-human" : "pav-guest"}`}>{(p.name||"?")[0]}</div>
                        <div style={{ flex:1 }}><div className="pn">{p.name}</div></div>
                        {isHost && TEAM_DEFS.map(td => (
                          <button key={td.key} onClick={() => assignPlayer(p.uid, td.key)}
                            style={{ marginLeft:4, padding:"2px 8px", fontSize:11, background: td.color+"20", border:`1px solid ${td.color}60`, borderRadius:10, cursor:"pointer", color:td.color }}>
                            {td.label.split(" ")[1]}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {isHost && (
            <button className="btn bp mt10" style={{ marginTop: 10 }} onClick={startGame} disabled={players.length < 2}>
              {players.length < 2 ? t("waiting_players_short","En attente…") : `🚀 ${t("launch_btn","Lancer")} (${players.length})`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SETUP ────────────────────────────────────────────────────────
function SetupScreen({
  mode, settings, setSettings, onStart, onBack, tier, onTier, lang
}) {
  const t = useT(lang || "fr");
  const [name, setName] = useState(settings.playerName);
  const [diff, setDiff] = useState(settings.difficulty);
  const [cats, setCats] = useState(settings.categories);
  const [cword, setCword] = useState("");
  const [customCats, setCustomCats] = useState(settings.customCategories || []);
  const [rounds, setRounds] = useState(settings.totalRounds || 5);
  // Mort Subite: nombre de catégories jouées par manche (3 ou 5)
  const [mortCatCount, setMortCatCount] = useState(settings.mortCatCount || 3);
  const canPro = tier === TIER.PRO || tier === TIER.VIP;
  const canVip = tier === TIER.VIP;
  const roundsOpts = ROUNDS_OPTIONS[tier] || [5];

  function toggleCat(id, ct) {
    if (ct === "pro" && !canPro) { onTier(); return; }
    if (ct === "vip" && !canVip) { onTier(); return; }
    setCats(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  }
  function addCat() {
    if (!cword.trim()) return;
    const nc = { id: `c_${Date.now()}`, label: cword.trim(), emoji: "✏️", tier: "vip", custom: true };
    setCustomCats(p => [...p, nc]); setCats(p => [...p, nc.id]); setCword("");
  }
  function go() {
    if (!cats.length) return;
    const cfg = { mode, playerName: name, difficulty: diff, totalRounds: rounds, categories: cats, customCategories: customCats, mortCatCount };
    setSettings(s => ({ ...s, ...cfg }));
    onStart(cfg);
  }

  // Intentional: only reset rounds when tier changes; rounds/roundsOpts are derived from tier
  useEffect(() => { if (!roundsOpts.includes(rounds)) setRounds(roundsOpts[0]); }, [tier]); // eslint-disable-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  // Auto-expand categories when tier upgrades (derived state on tier change — intentional setState in effect)
  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    const freIds = FREE_CATS.map(c => c.id);
    const onlyFree = cats.length > 0 && cats.every(id => freIds.includes(id));
    if (canPro && onlyFree) setCats(ALL_BASE.map(c => c.id));
  }, [canPro]);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh" }}>
      <div className="hdr">
        <button className="btn bs bsm" onClick={onBack} style={{ width: "auto" }}>{t("back_btn")}</button>
        <span style={{ fontWeight: 700, fontSize: 14 }}>
          {/* BUG 5 FIX: dynamic title based on mode */}
          {({ solo: t("solo_vs_ia2"), "2v2": t("mode_2v2"), mort: t("mort_subite"), online: t("play_online") }[mode] || t("solo_vs_ia2"))}
        </span>
        <div style={{ width: 55 }} />
      </div>
      <div className="cnt" style={{ overflowY: "auto" }}>
        <div className="card">
          <div className="ctitle">{t("your_name2")}</div>
          <input className="inp" value={name} onChange={e => setName(e.target.value)} placeholder={t("ob5_placeholder", "Comment t'appelles-tu ?")} />
        </div>
        <div className="card">
          <div className="ctitle">{t("difficulty")}</div>
          <div className="dg">{Object.entries(DIFFICULTY).map(([k, d]) => (
            <button key={k} className={`db ${diff === k ? "sel" : ""}`}
              style={diff === k ? { background: d.color + "22", borderColor: d.color, color: d.color } : {}} onClick={() => setDiff(k)}>
              <div className="dd" style={{ background: d.color }} />{d.label}
              <div style={{ fontSize: 10, marginTop: 2, opacity: .7 }}>{d.time}s</div>
            </button>
          ))}</div>
        </div>
        {mode !== "mort" && (
          <div className="card">
            <div className="ctitle">{t("rounds_label")}</div>
            <div className="rounds-grid">{roundsOpts.map(r => (
              <button key={r} className={`rb ${rounds === r ? "sel" : ""}`} onClick={() => setRounds(r)}>{r}</button>
            ))}</div>
          </div>
        )}
        {mode === "mort" && (
          <div className="card">
            <div className="ctitle">{t("cats_per_round","Catégories par manche")}</div>
            <p style={{ fontSize: 11, color: "var(--txm)", marginBottom: 8 }}>
              💀 {t("mort_desc2","Une erreur = éliminé. Le dernier en vie gagne !")}
            </p>
            <div className="rounds-grid">{[3, 5].map(n => (
              <button key={n} className={`rb ${mortCatCount === n ? "sel" : ""}`} onClick={() => setMortCatCount(n)}>
                {n}
              </button>
            ))}</div>
          </div>
        )}
        <div className="card">
          <div className="ctitle">{t("choose_categories")} ({cats.length})</div>
          <div className="cg">{[...ALL_BASE, ...customCats].map(cat => {
            const on = cats.includes(cat.id);
            const cc = cat.tier === "pro" ? "pro-c" : cat.tier === "vip" ? "vip-c" : "";
            const locked = (cat.tier === "pro" && !canPro) || (cat.tier === "vip" && !canVip);
            return (
              <button key={cat.id} className={`ct ${cc} ${on ? "on" : ""}`} onClick={() => toggleCat(cat.id, cat.tier)}>
                {cat.emoji} {getCatLabel(cat.id, lang || "fr")}{locked && <span style={{ fontSize: 8, opacity: .6 }}>{cat.tier === "pro" ? " PRO" : " VIP"}</span>}
              </button>
            );
          })}</div>
          <div className="div" />
          {canVip ? (
            <div className="row gap8">
              <input className="inp" value={cword} onChange={e => setCword(e.target.value)} placeholder={t("cat_custom")} onKeyDown={e => e.key === "Enter" && addCat()} style={{ flex: 1 }} />
              <button className="btn bp bsm" onClick={addCat} style={{ width: "auto" }}>+</button>
            </div>
          ) : (
            <button className="btn bvip bsm" onClick={onTier} style={{ width: "auto" }}>{t("vip_cats")}</button>
          )}
        </div>
        <button className="btn bp" onClick={go} disabled={!cats.length}>{t("launch_btn")}</button>
        <div style={{ height: 18 }} />
      </div>
    </div>
  );
}

// ─── ROULETTE ─────────────────────────────────────────────────────
function LetterRoulette({
  players, spinnerIndex, spinnerOrder, currentRound, totalRounds, myId, onLetterChosen, lang,
  forcedLetter, // lettre reçue depuis Firebase pour les non-spinners
  isOnline,     // true si partie en ligne (attend forcedLetter, pas de stop aléatoire local)
  usedLetters,  // lettres déjà utilisées dans cette partie — exclues du tirage
}) {
  const t = useT(lang || "fr");
  const [cur, setCur] = useState("A");
  const [locked, setLocked] = useState(false);
  const [lockedL, setLockedL] = useState(null);
  const ivRef = useRef(null);
  const lockedRef = useRef(false);

  // Pool de lettres disponibles (sans les lettres déjà utilisées)
  const availableAlphabet = ALPHABET.filter(l => !(usedLetters || []).includes(l));
  const pool = availableAlphabet.length > 0 ? availableAlphabet : ALPHABET;
  // Keep a ref to always have the latest pool inside the setInterval closure
  const poolRef = useRef(pool);
  poolRef.current = pool;

  const spinnerId = spinnerOrder ? spinnerOrder[spinnerIndex % spinnerOrder.length] : players[spinnerIndex % players.length]?.id;
  const spinner = players.find(p => p.id === spinnerId || p.uid === spinnerId) || players[0];
  const isMyTurn = spinner?.id === myId || spinner?.uid === myId;

  useEffect(() => {
    ivRef.current = setInterval(() => {
      setCur(poolRef.current[Math.floor(Math.random() * poolRef.current.length)]);
      SoundFX.play("tick");
    }, 75);
    // Non-spinner en solo : stop aléatoire local
    // En ligne non-spinner : attendre forcedLetter depuis Firebase (ne pas faire de stop aléatoire)
    if (!isMyTurn && !isOnline) {
      setTimeout(() => { if (!lockedRef.current) doStop(poolRef.current[Math.floor(Math.random() * poolRef.current.length)]); }, 1400 + Math.random() * 800);
    }
    return () => clearInterval(ivRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Quand Firebase envoie la vraie lettre (mode online non-spinner)
  useEffect(() => {
    if (forcedLetter && !isMyTurn && !lockedRef.current) {
      doStop(forcedLetter);
    }
  }, [forcedLetter]); // eslint-disable-line react-hooks/exhaustive-deps

  function doStop(forceLetter) {
    if (lockedRef.current) return;
    lockedRef.current = true;
    clearInterval(ivRef.current);
    const fl = forceLetter || cur;
    setCur(fl); setLocked(true); setLockedL(fl);
    SoundFX.play("lock");
    Haptics.success();
    setTimeout(() => onLetterChosen(fl), 900);
  }

  return (
    <div className="roul">
      <div className="roul-title">{t("round_label")} {currentRound} / {totalRounds}</div>
      <div className="roul-turn">
        {isMyTurn ? t("its_your_turn") : `🎲 ${spinner?.name || t("nav_play","Joueur")} ${t("spinner_rolling","{0} tourne…").replace("{0}","")}`}
      </div>
      <div className="roul-drum">
        <div className="roul-ring" /><div className="roul-ring2" /><div className="roul-ring3" />
        <div className={`roul-l ${locked ? "lock" : "spin"}`}>{locked ? lockedL : cur}</div>
      </div>
      {isMyTurn
        ? <button className="roul-btn" onClick={() => doStop()} disabled={locked}>{locked ? t("go_btn") : t("stop_btn2")}</button>
        : <div className="roul-waiting pulse">{locked ? t("letter_chosen").replace("{0}", lockedL || "") : `${spinner?.name} tourne…`}</div>
      }
    </div>
  );
}

// ─── GAME SCREEN ──────────────────────────────────────────────────
function GameScreen({
  gameState, setGameState, uid, lang, onEndGame
}) {
  const t = useT(lang || "fr");
  const timerRef = useRef(null);
  const aiRef = useRef(false);
  const doneRef = useRef(false);
  const inputRefs = useRef({});
  const { letter, categories, difficulty, players, phase, currentRound, totalRounds, spinnerIndex, myId } = gameState;
  // En mort subite, on joue uniquement les catégories actives du round courant
  const activeCategories = gameState.activeCategories || categories;
  const dc = DIFFICULTY[difficulty];


  // ── Listener Firebase pour sync lettre (mode online) ──────────
  // Toutes les mises à jour passent par un seul setGameState fonctionnel
  // pour éviter les stale closures et le reset du timer.
  useEffect(() => {
    if (!gameState.roomCode) return;
    const unsubscribe = FB.listenRoom(gameState.roomCode, (room) => {
      if (!room) return;
      setGameState(g => {
        let next = g;
        // Sync retour à la roulette (nouvelle manche – signal de l'hôte)
        if (room.phase === "roulette" && g.phase !== "roulette") {
          // Mort subite: reconstruire les catégories actives depuis les IDs broadcastés par l'hôte
          const nextActiveCats = room.activeCategoryIds
            ? room.activeCategoryIds.map(id => (g.categories || []).find(c => c.id === id)).filter(Boolean)
            : (g.activeCategories || g.categories || []);
          next = { ...next, phase: "roulette",
            spinnerOrder: room.spinnerOrder || g.spinnerOrder,
            spinnerIndex: room.spinnerIndex != null ? room.spinnerIndex : g.spinnerIndex,
            currentRound: room.currentRound || g.currentRound,
            pendingLetter: null,
            letter: null,
            usedLetters: room.usedLetters || g.usedLetters || [],
            activeCategories: nextActiveCats,
            answers: Object.fromEntries(nextActiveCats.map(c => [c.id, ""])),
            players: g.players.map(p => ({ ...p, answers: {}, done: false })),
          };
        }
        // Transition roulette → playing : stocker pendingLetter pour LetterRoulette
        // (LetterRoulette va appeler onLetterChosen qui transition réellement vers playing)
        // Ne PAS changer phase ici pour ne pas sauter l'animation de la roulette
        if (room.letter && room.letter !== g.pendingLetter && g.phase === "roulette") {
          next = { ...next, pendingLetter: room.letter };
        }
        // Sync lettre si déjà en playing (pas de reset timer !)
        if (g.phase === "playing" && room.letter && room.letter !== g.letter) {
          next = { ...next, letter: room.letter };
        }
        // Réponses des autres joueurs pendant le round (ne touche pas au timer)
        if (room.playerAnswers && g.phase === "playing") {
          const updatedPlayers = g.players.map(p => ({
            ...p,
            answers: room.playerAnswers?.[p.id || p.uid] || p.answers,
            done: room.playerDone?.[p.id || p.uid] ?? p.done,
          }));
          next = { ...next, players: updatedPlayers };
        }
        // ── BUG 1+4 FIX: fin de round signalée par Firebase ──────────
        // Sync toutes les réponses finales puis déclencher computeRoundScores
        // sur TOUS les clients simultanément via la phase "round_ended_sync"
        if (room.phase === "round_ended" && g.phase === "playing") {
          const updatedPlayers = g.players.map(p => {
            if (p.isBot) {
              // Générer les réponses des bots si pas encore fait
              const a = {};
              (g.activeCategories || g.categories || []).forEach(cat => {
                a[cat.id] = p.answers?.[cat.id] || getAiAnswer(cat.id, g.letter, g.lang || "fr");
              });
              return { ...p, answers: a, done: true };
            }
            const pid = p.id || p.uid;
            return { ...p, answers: room.playerAnswers?.[pid] || p.answers || {}, done: true };
          });
          next = { ...next, players: updatedPlayers, phase: "round_ended_sync" };
        }
        return next;
      });
    });
    return () => { if (unsubscribe) unsubscribe(); };
  }, [gameState.mode, gameState.roomCode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── BUG 1+4 FIX: déclencher computeRoundScores sur tous les clients ──
  useEffect(() => {
    if (gameState.phase !== "round_ended_sync") return;
    computeRoundScores(gameState);
  }, [gameState.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { aiRef.current = false; doneRef.current = false; }, [currentRound]);

  useEffect(() => {
    if (phase !== "playing" || !letter || aiRef.current) return;
    aiRef.current = true;
    players.filter(p => p.isBot).forEach((bot, bi) => {
      setTimeout(() => {
        if (doneRef.current) return;
        const a = {}; activeCategories.forEach(cat => { a[cat.id] = getAiAnswer(cat.id, letter, gameState?.lang || lang); });
        setGameState(g => ({ ...g, players: g.players.map(p => p.id === bot.id ? { ...p, answers: a, done: true } : p) }));
      }, dc.aiDelay + bi * 700 + Math.random() * 900);
    });
    timerRef.current = setInterval(() => {
      setGameState(g => {
        if (g.timeLeft <= 1) { clearInterval(timerRef.current); return { ...g, timeLeft: 0 }; }
        return { ...g, timeLeft: g.timeLeft - 1 };
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, letter, currentRound]); // Intentional: omit players/lang/dc to avoid timer reset on every re-render

  useEffect(() => {
    if (gameState.timeLeft <= 0 && phase === "playing" && !doneRef.current) handleStop();
  }, [gameState.timeLeft, phase]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleStop() {
    if (doneRef.current) return;
    doneRef.current = true; clearInterval(timerRef.current);
    SoundFX.play("stop");
    Haptics.heavy();
    const finalPlayers = gameState.players.map(p => {
      if (!p.isBot) return p;
      const a = {}; activeCategories.forEach(cat => { a[cat.id] = p.answers?.[cat.id] || getAiAnswer(cat.id, gameState.letter, gameState?.lang || lang); });
      return { ...p, answers: a, done: true };
    });
    // En mode online: pousser les réponses d'abord, puis signaler la fin du round.
    // Séparer les deux écritures évite que les autres clients reçoivent "round_ended"
    // avant d'avoir les réponses du joueur (race condition).
    if (gameState.roomCode && gameState.myId) {
      // Lire les réponses depuis le state fonctionnel pour éviter la stale closure
      setGameState(g => {
        const latestAnswers = g.answers || {};
        const myId = g.myId;
        // Mark local human player as done immediately (UI feedback)
        const updatedPlayers = g.players.map(p =>
          (p.id === myId || p.uid === myId) ? { ...p, done: true } : p
        );
        // Pousser les réponses sur Firebase puis signaler la fin du round.
        // RACE CONDITION FIX: seul le premier joueur à finir écrit "round_ended".
        // Les autres joueurs ne font qu'écrire leurs réponses — le listener Firebase
        // détecte "round_ended" et déclenche computeRoundScores côté local.
        FB.updateRoom(g.roomCode, {
          [`playerAnswers/${myId}`]: latestAnswers,
          [`playerDone/${myId}`]: true,
        }).then(() => {
          // Vérifier si la room est déjà en round_ended avant d'écrire
          return FB.getRoom(g.roomCode).then(room => {
            if (room && room.phase === "playing") {
              return FB.updateRoom(g.roomCode, {
                phase: "round_ended",
                roundEndedAt: Date.now(),
              });
            }
            // Déjà round_ended (un autre joueur plus rapide) — pas d'écriture
          });
        }).catch(() => {});
        return { ...g, players: updatedPlayers };
      });
      // Le listener Firebase synce les réponses de tous et déclenche computeRoundScores
      return;
    }
    // Mode offline uniquement
    computeRoundScores({ ...gameState, players: finalPlayers });
  }

  function computeRoundScores(gs) {
    const roundScores = {};
    gs.players.forEach(p => { roundScores[p.id] = 0; });
    const roundAnswers = {};
    const roundValidity = {};

    // En mort subite, utiliser les catégories actives du round
    const catsToScore = gs.activeCategories || gs.categories;

    catsToScore.forEach(cat => {
      // BUG 4 FIX: each player's answer comes from p.answers for bots and online players,
      // and from gs.answers only for the local human player
      const myId = gs.myId;
      const allAns = gs.players.map(p => {
        if (p.isBot) return p.answers?.[cat.id] || "";
        if (p.id === myId) return gs.answers?.[cat.id] || "";
        return p.answers?.[cat.id] || ""; // other online human players
      });
      roundAnswers[cat.id] = {};
      roundValidity[cat.id] = {};
      gs.players.forEach(p => {
        const mine = (p.isBot || p.id !== myId)
          ? (p.answers?.[cat.id] || "")
          : (gs.answers?.[cat.id] || "");
        const rawPts = gs.isTournoi
          ? scoreAnswerTournoi(mine, allAns, cat.id, gs.letter, gs.lang || "fr", 0)
          : scoreAnswer(mine, allAns, cat.id, gs.letter, gs.lang || "fr");
        const pts = typeof rawPts === "object" ? (rawPts.pts ?? 0) : rawPts;
        roundScores[p.id] += pts > 0 ? pts : 0;
        roundAnswers[cat.id][p.id] = mine;
        roundValidity[cat.id][p.id] = pts;
      });
    });

    // ── Mode Mort Subite ─────────────────────────────────────
    // UNE seule erreur (réponse invalide OU vide) = éliminé immédiatement
    let eliminatedIds = [];
    if (gs.mode === "mort") {
      const activeCatsForRound = gs.activeCategories || gs.categories;
      gs.players.forEach(p => {
        if (p.eliminated) return; // déjà éliminé
        const hasError = activeCatsForRound.some(cat => {
          const v = roundValidity[cat.id]?.[p.id];
          const ans = roundAnswers[cat.id]?.[p.id] || "";
          return !ans.trim() || v === -1; // vide OU invalide
        });
        if (hasError) eliminatedIds.push(p.id);
      });
    }

    // ── Mode 2v2 ─────────────────────────────────────────────
    // Équipes dynamiques: moitié gauche vs moitié droite
    let teamScores = null;
    if (gs.mode === "2v2") {
      const playerIds = gs.players.map(p => p.id);
      const half = Math.ceil(playerIds.length / 2);
      const teams = gs.teams || {
        team0: playerIds.slice(0, half),
        team1: playerIds.slice(half),
      };
      teamScores = {};
      Object.entries(teams).forEach(([teamId, memberIds]) => {
        teamScores[teamId] = memberIds.reduce((sum, pid) => sum + (roundScores[pid] || 0), 0);
      });
    }

    const newCumulative = {};
    gs.players.forEach(p => {
      newCumulative[p.id] = (gs.cumulativeScores[p.id] || 0) + roundScores[p.id];
    });

    // Joueurs restants en mort subite
    const activePlayers = gs.mode === "mort"
      ? gs.players.filter(p => !p.eliminated && !eliminatedIds.includes(p.id))
      : gs.players;

    // Mort Subite: on continue jusqu'au dernier survivant (ignore totalRounds)
    const isLast = gs.mode === "mort"
      ? activePlayers.length <= 1
      : gs.currentRound >= gs.totalRounds;

    const updatedPlayers = gs.players.map(p => ({
      ...p,
      eliminated: p.eliminated || eliminatedIds.includes(p.id),
    }));

    const roundData = {
      letter: gs.letter,
      answers: roundAnswers,
      scores: roundScores,
      validity: roundValidity,
      eliminated: eliminatedIds,
      teamScores,
      activeCategories: gs.activeCategories || gs.categories,
    };

    // Vérifier si une phase de vote VIP est nécessaire (catégories custom)
    const customCatsInRound = (gs.activeCategories || gs.categories).filter(c => c.custom);
    const needsVote = customCatsInRound.length > 0;

    const newGs = {
      ...gs,
      players: updatedPlayers,
      rounds: [...gs.rounds, roundData],
      cumulativeScores: newCumulative,
      currentRoundData: roundData,
      phase: needsVote ? "vote_phase" : (isLast ? "final_results" : "round_results"),
      teamScores: teamScores || gs.teamScores,
      _pendingIsLast: isLast,
    };
    setGameState(newGs);
    if (!needsVote && isLast) setTimeout(() => onEndGame(newGs), 0);
  }

  function upd(id, v) { setGameState(g => ({ ...g, answers: { ...g.answers, [id]: v } })); }
  const allFilled = activeCategories.every(cat => gameState.answers[cat.id]?.trim().length > 0);

  if (phase === "roulette") {
    const spinnerIdForRender = gameState.spinnerOrder
      ? gameState.spinnerOrder[spinnerIndex % gameState.spinnerOrder.length]
      : players[spinnerIndex % players.length]?.id;
    const amSpinner = spinnerIdForRender === (myId || uid) ||
      players.find(p => p.id === spinnerIdForRender)?.uid === (myId || uid);
    return (
      <LetterRoulette
        players={players} spinnerIndex={spinnerIndex}
        spinnerOrder={gameState.spinnerOrder} currentRound={currentRound} totalRounds={totalRounds}
        myId={myId || uid}
        forcedLetter={gameState.pendingLetter}
        isOnline={!!gameState.roomCode}
        usedLetters={gameState.usedLetters || []}
        onLetterChosen={async l => {
          // Mettre à jour l'état local (transition roulette → playing)
          setGameState(g => ({ ...g, letter: l, pendingLetter: l, phase: "playing", timeLeft: g.totalTime, usedLetters: [...(g.usedLetters || []), l] }));
          // En mode online: SEUL le spinner publie la lettre sur Firebase
          if (gameState.roomCode && amSpinner) {
            try {
              await FB.updateRoom(gameState.roomCode, {
                letter: l,
                phase: "playing",
                letterChosenAt: Date.now(),
                usedLetters: [...(gameState.usedLetters || []), l], // BUG 3 FIX: persister les lettres utilisées
              });
            } catch { /* ignore */ }
          }
        }}
      lang={lang} />
    );
  }

  if (phase === "vote_phase") {
    return (
      <VotePhase
        gameState={gameState}
        onVoteDone={updatedGs => {
          setGameState(updatedGs);
          if (updatedGs._pendingIsLast) setTimeout(() => onEndGame(updatedGs), 0);
        }}
        lang={lang}
      />
    );
  }

  if (phase === "round_results") {
    return (
    <RoundResultsOverlay gameState={gameState} onNext={() => {
      // Calculer le prochain état ici pour pouvoir écrire sur Firebase
      let nextActiveCats = gameState.activeCategories || gameState.categories;
      if (gameState.mode === "mort" && gameState.mortCatCount) {
        const pool = gameState.categories;
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        nextActiveCats = shuffled.slice(0, Math.min(gameState.mortCatCount, shuffled.length));
      }
      const nextRound = gameState.currentRound + 1;
      const activePlayers = gameState.players.filter(p => !p.eliminated);
      // En mode online, spinnerOrder contient TOUS les joueurs (y compris éliminés) — utiliser sa longueur comme modulo
      // pour éviter un index hors-bornes qui saute des spinners ou lève une exception côté LetterRoulette.
      const spinnerPoolLength = gameState.spinnerOrder ? gameState.spinnerOrder.length : activePlayers.length;
      const nextSpinner = spinnerPoolLength > 0 ? (gameState.spinnerIndex + 1) % spinnerPoolLength : 0;
      setGameState(g => ({
        ...g,
        currentRound: nextRound,
        spinnerIndex: nextSpinner,
        letter: null,
        pendingLetter: null, // FIX: reset pour que forcedLetter ne rejoue pas l'ancienne lettre
        activeCategories: nextActiveCats,
        answers: Object.fromEntries(nextActiveCats.map(c => [c.id, ""])),
        players: g.players.map(p => ({ ...p, answers: {}, done: false })),
        phase: "roulette",
        timeLeft: g.totalTime,
      }));
      // En mode online: l'hôte broadcast la nouvelle manche à tous les clients
      if (gameState.roomCode && gameState.isHost) {
        FB.updateRoom(gameState.roomCode, {
          phase: "roulette",
          currentRound: nextRound,
          spinnerIndex: nextSpinner,
          letter: null,
          playerAnswers: null,
          playerDone: null,
          // Mort subite: syncer les catégories actives du prochain round
          activeCategoryIds: nextActiveCats.map(c => c.id),
          // Syncer les lettres déjà utilisées pour que LetterRoulette les exclue côté clients
          usedLetters: [...(gameState.usedLetters || []), gameState.letter].filter(Boolean),
        }).catch(() => {});
      }
    }} lang={lang} />
  );
  }

  if (phase === "final_results") return null;

  const pct = (gameState.timeLeft / gameState.totalTime) * 100;
  const tc = pct > 50 ? "var(--gn)" : pct > 25 ? "var(--yw)" : "var(--rd)";
  const myId2 = gameState.myId || uid || "human";

  return (
    <div className="gwrap">
      {/* Header: lettre + timer + round */}
      <div className="ghdr">
        <div className="glbadge">{letter}</div>
        <div className="tbar-w">
          <div className="tbar"><div className="tfill" style={{ width: `${pct}%`, background: tc }} /></div>
          <div className="ttxt" style={{ color: tc }}>{gameState.timeLeft}s</div>
        </div>
        <div className="round-badge">{t("round_label")}<br /><strong>{currentRound}/{totalRounds}</strong></div>
      </div>

      {/* Scrollable category list */}
      <div className="catlist">

        {/* ── Current round inputs EN HAUT ── */}
        {activeCategories.map((cat, i) => {
          const val = gameState.answers[cat.id] || "";
          const filled = val.trim().length > 0;
          return (
            <div key={cat.id} className={`catrow ${filled ? "active" : ""}`}
              onClick={() => inputRefs.current[cat.id]?.focus()}>
              <span className="cat-emoji">{cat.emoji}</span>
              <span className="cat-label">{getCatLabel(cat.id, lang || "fr")}{cat.custom ? " ✏️" : ""}</span>
              <input
                ref={el => inputRefs.current[cat.id] = el}
                className="cat-input"
                value={val}
                onChange={e => upd(cat.id, e.target.value)}
                placeholder={`${letter}…`}
                autoComplete="off" autoCorrect="off" autoCapitalize="characters" spellCheck="false"
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    const nx = activeCategories[i + 1];
                    if (nx) inputRefs.current[nx.id]?.focus();
                    else inputRefs.current[cat.id]?.blur();
                  }
                }}
              />
              <span className="cat-pts v0">—</span>
            </div>
          );
        })}

        {/* ── Past rounds EN BAS (lecture seule) ── */}
        {gameState.rounds.map((rd, ri) => {
          const rdCats = rd.activeCategories || categories;
          const roundTotal = rdCats.reduce((s, cat) => {
            const v = rd.validity?.[cat.id]?.[myId2] ?? 0;
            return s + (v > 0 ? v : 0);
          }, 0);
          return (
            <div key={ri}>
              <div className="round-sep">
                <span>{t("round_label")} {ri + 1} — {rd.letter}</span>
                <div className="round-sep-line" />
                <span className="round-total-chip">{roundTotal}{t("pts","pts")}</span>
              </div>
              {rdCats.map(cat => {
                const ans = rd.answers?.[cat.id]?.[myId2] || "";
                const v = rd.validity?.[cat.id]?.[myId2] ?? 0;
                const vc = !ans ? "v0" : v === -1 ? "vm" : v === 2 ? "v2" : v === 1 ? "v1" : "v0";
                return (
                  <div key={cat.id} className="catrow-past">
                    <span className="cat-emoji">{cat.emoji}</span>
                    <span className="cat-label">{getCatLabel(cat.id, lang || "fr")}</span>
                    <span className={`past-answer ${vc}`}>
                      {ans || "—"}{ans && v !== -1 && <span style={{ fontSize: 10, opacity: .7 }}> +{Math.max(0, v)}</span>}
                      {ans && v === -1 && <span style={{ fontSize: 10 }}> ❌</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Stop bar */}
      <div className="sbar">
        {allFilled ? (
          <button className="sbtn" style={{ background: "var(--gn)", boxShadow: "0 0 24px rgba(74,222,128,0.35)", letterSpacing: 1 }} onClick={handleStop}>
            {t("filled_all")}
          </button>
        ) : (
          <button className="sbtn" onClick={handleStop}>{t("stop_btn")}</button>
        )}
      </div>
    </div>
  );
}

// ─── VOTE PHASE (catégories custom VIP) ──────────────────────────
// Quand une ou plusieurs catégories custom sont jouées, les joueurs votent
// simultanément pour valider les réponses des autres.
// Règles :
//   • Majorité pour = réponse validée (points normaux)
//   • Égalité = 1 pt seulement
//   • Majorité contre = 0 pt
// L'auteur de la réponse NE vote PAS sur sa propre réponse.
function VotePhase({ gameState, onVoteDone, lang }) {
  const t = useT(lang || "fr");
  const { players, currentRoundData, myId } = gameState;
  const customCats = (gameState.activeCategories || gameState.categories).filter(c => c.custom);

  // votes[catId][targetPlayerId] = "yes" | "no"  (votes du joueur local)
  const [votes, setVotes] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Init bot votes (aléatoires — 70% oui, 30% non)
  useEffect(() => {
    const botVotes = {};
    players.filter(p => p.isBot).forEach(bot => {
      customCats.forEach(cat => {
        players.filter(p => p.id !== bot.id).forEach(target => {
          const ans = currentRoundData.answers?.[cat.id]?.[target.id] || "";
          if (!ans.trim()) return; // skip blank answers — no vote needed
          const key = `${bot.id}:${cat.id}:${target.id}`;
          botVotes[key] = Math.random() > 0.3 ? "yes" : "no";
        });
      });
    });
    setVotes(prev => ({ ...prev, ...botVotes })); // eslint-disable-line react-hooks/set-state-in-effect
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function castVote(catId, targetId, v) {
    setVotes(prev => ({ ...prev, [`${myId}:${catId}:${targetId}`]: v }));
  }

  // Vérifier si le joueur humain a voté sur toutes les réponses non-vides des autres
  const pendingHumanVotes = customCats.flatMap(cat =>
    players
      .filter(p => p.id !== myId)
      .filter(p => (currentRoundData.answers?.[cat.id]?.[p.id] || "").trim())
      .filter(p => !votes[`${myId}:${cat.id}:${p.id}`])
  );
  const canSubmit = pendingHumanVotes.length === 0;

  function applyVotesAndFinish() {
    setSubmitted(true);
    // Recalculer les scores pour les catégories custom
    const updatedCumulative = { ...gameState.cumulativeScores };
    const updatedRoundData = { ...currentRoundData };

    customCats.forEach(cat => {
      players.forEach(target => {
        const ans = currentRoundData.answers?.[cat.id]?.[target.id] || "";
        if (!ans.trim()) return; // réponse vide — pas de vote
        // Compter les votes de tous les joueurs SAUF l'auteur
        const voters = players.filter(p => p.id !== target.id);
        const yesVotes = voters.filter(v => {
          const key = `${v.id}:${cat.id}:${target.id}`;
          return votes[key] === "yes";
        }).length;
        const noVotes = voters.length - yesVotes;
        let catPts;
        if (yesVotes > noVotes) {
          // Majorité pour → points normaux (déjà calculés, on les garde)
          catPts = currentRoundData.validity?.[cat.id]?.[target.id] ?? 0;
          catPts = catPts > 0 ? catPts : 0;
        } else if (yesVotes === noVotes) {
          catPts = 1; // Égalité → 1 pt
        } else {
          catPts = 0; // Majorité contre → 0 pt
        }
        // Remplacer le score existant pour cette cat par le résultat du vote
        const oldPts = currentRoundData.validity?.[cat.id]?.[target.id] ?? 0;
        const diff = catPts - (oldPts > 0 ? oldPts : 0);
        updatedCumulative[target.id] = (updatedCumulative[target.id] || 0) + diff;
        // Stocker le résultat du vote pour l'affichage
        if (!updatedRoundData.voteResults) updatedRoundData.voteResults = {};
        if (!updatedRoundData.voteResults[cat.id]) updatedRoundData.voteResults[cat.id] = {};
        updatedRoundData.voteResults[cat.id][target.id] = { yesVotes, noVotes, catPts };
      });
    });

    const nextPhase = gameState._pendingIsLast ? "final_results" : "round_results";
    const updatedGs = {
      ...gameState,
      cumulativeScores: updatedCumulative,
      currentRoundData: updatedRoundData,
      phase: nextPhase,
    };
    onVoteDone(updatedGs);
  }

  return (
    <div className="rov">
      <div className="rpanel">
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
          🗳️ {t("vote_phase_title","Vote — Catégorie perso")}
        </div>
        <div style={{ fontSize: 11, color: "var(--txm)", marginBottom: 14 }}>
          {t("vote_info","Votez pour valider les réponses des catégories créées par l'hôte")}
        </div>

        {customCats.map(cat => (
          <div key={cat.id} style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
              {cat.emoji} {cat.label}
            </div>
            {players.map(target => {
              const ans = currentRoundData.answers?.[cat.id]?.[target.id] || "";
              if (!ans.trim()) return null;
              const isMe = target.id === myId;
              const myVote = votes[`${myId}:${cat.id}:${target.id}`];
              // Compter les votes déjà enregistrés (bots)
              const voters = players.filter(p => p.id !== target.id);
              const yesCount = voters.filter(v => votes[`${v.id}:${cat.id}:${target.id}`] === "yes").length;
              const noCount = voters.filter(v => votes[`${v.id}:${cat.id}:${target.id}`] === "no").length;
              return (
                <div key={target.id} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 10px", marginBottom: 6,
                  background: "var(--sf2)",
                  borderRadius: 10, border: "1px solid var(--br)"
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: "var(--txm)" }}>
                      {target.isBot ? "🤖" : "👤"} {target.name}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{ans}</div>
                  </div>
                  {isMe ? (
                    <span style={{ fontSize: 11, color: "var(--txm)", fontStyle: "italic" }}>
                      (ta réponse)
                    </span>
                  ) : submitted ? (
                    <span style={{ fontSize: 11, color: "var(--txm)" }}>
                      {yesCount > noCount ? t("vote_result_ok","✅") : yesCount === noCount ? t("vote_result_tie","⚖️ 1pt") : t("vote_result_no","❌")}
                    </span>
                  ) : (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => castVote(cat.id, target.id, "yes")}
                        style={{
                          padding: "4px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer",
                          background: myVote === "yes" ? "rgba(74,222,128,0.25)" : "var(--sf2)",
                          border: myVote === "yes" ? "1px solid #4ade80" : "1px solid var(--br)",
                          color: myVote === "yes" ? "#4ade80" : "inherit",
                        }}>
                        {t("vote_validate","✓")}
                      </button>
                      <button
                        onClick={() => castVote(cat.id, target.id, "no")}
                        style={{
                          padding: "4px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer",
                          background: myVote === "no" ? "rgba(248,113,113,0.25)" : "var(--sf2)",
                          border: myVote === "no" ? "1px solid #f87171" : "1px solid var(--br)",
                          color: myVote === "no" ? "#f87171" : "inherit",
                        }}>
                        {t("vote_reject","✗")}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {!submitted && (
          <button
            className="btn bp"
            onClick={applyVotesAndFinish}
            disabled={!canSubmit}
            style={{ marginTop: 8 }}>
            {canSubmit ? t("vote_submit","Confirmer mes votes") : `${pendingHumanVotes.length} vote(s) restant(s)`}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── ROUND RESULTS ────────────────────────────────────────────────
function RoundResultsOverlay({
  gameState, onNext, lang
}) {
  const t = useT(lang || "fr");
  const { players, currentRoundData, cumulativeScores, currentRound, totalRounds } = gameState;
  if (!currentRoundData) return null;
  // Utiliser les catégories du round (peut être un sous-ensemble en mort subite)
  const roundCats = currentRoundData.activeCategories || gameState.activeCategories || gameState.categories;
  const { letter, answers: rAns, scores: rScores } = currentRoundData;
  const sorted = [...players].sort((a, b) => (cumulativeScores[b.id] || 0) - (cumulativeScores[a.id] || 0));
  const max = cumulativeScores[sorted[0]?.id] || 0;

  return (
    <div className="rov">
      <div className="rpanel">
        <div className="row jb" style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{t("round")} {currentRound} — {t("round_history")}</div>
            <div style={{ fontSize: 11, color: "var(--txm)", marginTop: 2 }}>{t("letter_label","Lettre :")} <strong style={{ color: "var(--ac)" }}>{letter}</strong></div>
          </div>
          <div style={{ fontSize: 11, color: "var(--txm)" }}>{currentRound}/{totalRounds}</div>
        </div>
        <div style={{ overflowX: "auto", marginBottom: 14 }}>
          <table className="stable">
            <thead><tr>
              <th style={{ textAlign: "left" }}>{t("category_col")}</th>
              {players.map(p => <th key={p.id}>{p.isBot ? "🤖" : "👤"} {p.name.split(" ")[0]}</th>)}
            </tr></thead>
            <tbody>
              {roundCats.map(cat => {
                const allAns = players.map(p => rAns[cat.id]?.[p.id] || "");
                const voteResult = currentRoundData.voteResults?.[cat.id];
                return (
                  <tr key={cat.id}>
                    <td className="td-player">
                      {cat.emoji} {getCatLabel(cat.id, lang || "fr")}
                      {cat.custom && <span style={{ fontSize: 9, opacity: .7 }}> 🗳️</span>}
                    </td>
                    {players.map(p => {
                      const ans = rAns[cat.id]?.[p.id] || "";
                      let pts = currentRoundData.validity?.[cat.id]?.[p.id] ?? scoreAnswer(ans, allAns, cat.id, letter, gameState?.lang);
                      // Pour les cats custom: afficher le résultat du vote
                      if (cat.custom && voteResult?.[p.id] !== undefined) {
                        pts = voteResult[p.id].catPts;
                      }
                      const invalid = pts === -1 || (cat.custom && voteResult?.[p.id]?.catPts === 0 && ans.trim());
                      const cc = pts === 2 ? "pts-2" : pts === 1 ? "pts-1" : "pts-0";
                      const voteInfo = cat.custom && voteResult?.[p.id];
                      return (
                        <td key={p.id}>
                          <div style={{ fontSize: 11, textDecoration: invalid ? "line-through" : "none", color: invalid ? "var(--rd)" : "inherit" }}>
                            {ans || <em style={{ color: "var(--txm)" }}>—</em>}
                          </div>
                          <div className={`td-pts ${cc}`}>
                            {invalid ? "❌" : `+${Math.max(0,pts)}pt`}
                          </div>
                          {voteInfo && (
                            <div style={{ fontSize: 9, color: "var(--txm)" }}>
                              {voteInfo.yesVotes}✓ {voteInfo.noVotes}✗
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              <tr>
                <td className="td-player" style={{ color: "var(--txm)", fontSize: 10 }}>{t("this_round")}</td>
                {players.map(p => <td key={p.id} className="td-total">+{rScores[p.id] || 0}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="ctitle">{t("cumul_score")}</div>
        {sorted.map((p, i) => (
          <div key={p.id} className={`srow ${cumulativeScores[p.id] === max ? "win" : ""}`}>
            <div className="srank">{i + 1}</div>
            <div className="sname">{p.isBot ? "🤖" : "👤"} {p.name}{cumulativeScores[p.id] === max ? " ⚡" : ""}</div>
            <div className="spts">{cumulativeScores[p.id] || 0}pts</div>
          </div>
        ))}
        {/* XP gained this round */}
        {(() => {
          // Use myId from gameState (set correctly for both solo and online modes)
          const humanId = gameState.myId || players.find(p=>!p.isBot)?.id || "";
          return (
            <div style={{ textAlign: "center", padding: "8px 0", fontSize: 13, color: "var(--ac)", fontWeight: 700 }}>
              +{calcXpGain(currentRoundData?.scores?.[humanId] || 0, false, gameState.totalRounds || 1)} {t("xp")} ⚡
            </div>
          );
        })()}
        {/* BUG 8 FIX: use t("round_label") instead of hardcoded "Round" */}
        <button className="btn bp" style={{ marginTop: 8 }} onClick={onNext}>
          ▶ {t("round_label")} {currentRound + 1} / {totalRounds}
        </button>
      </div>
    </div>
  );
}

// ─── FINAL RESULTS ────────────────────────────────────────────────
function FinalResultsScreen({ gameState, onPlayAgain, onHome, uid, lang }) {
  const t = useT(lang || "fr");
  const { players, cumulativeScores, rounds, totalRounds } = gameState;
  const sorted = [...players].sort((a, b) => (cumulativeScores[b.id] || 0) - (cumulativeScores[a.id] || 0));
  const max = cumulativeScores[sorted[0]?.id] || 0;
  const myId = gameState.myId || uid;
  const myScore = cumulativeScores[myId] || 0;
  // Victoire exclusive : mon score est le max ET personne d'autre n'a le même score
  const allScores = Object.values(cumulativeScores || {});
  const iWon = myScore === max && allScores.filter(s => s === max).length === 1;

  // ── Compute awards per player ────────────────────────────────────
  function computeAwards() {
    if (!rounds || rounds.length === 0) return [];

    const awards = [];

    // Helper: get all answers for a player across all rounds
    const allAnswers = (pid) => rounds.flatMap(r =>
      Object.values(r.answers || {}).map(catAnswers => catAnswers?.[pid] || "")
    ).filter(a => a?.trim());

    // Helper: get validity scores for a player
    const allValidity = (pid) => rounds.flatMap(r =>
      Object.entries(r.validity || {}).map(([, catV]) => catV?.[pid] ?? 0)
    );

    // 1. 🏆 Meilleur score → winner (already shown)
    // 2. ⚡ Le plus rapide → player who called STOP most often (whichever had most unique answers = proxy)
    const uniqueCountByPlayer = {};
    players.forEach(p => {
      uniqueCountByPlayer[p.id] = allValidity(p.id).filter(v => v === 2).length;
    });
    const fastestId = Object.entries(uniqueCountByPlayer).sort((a,b) => b[1]-a[1])[0]?.[0];
    const fastest = players.find(p => p.id === fastestId);
    if (fastest) awards.push({ player: fastest, icon: "⚡", title: t("award_fastest"), desc: `${uniqueCountByPlayer[fastestId]} ${t("award_unique_desc")}` });

    // 3. 🎨 Le plus inventif → most different words (longest avg word)
    const avgWordLen = {};
    players.forEach(p => {
      const words = allAnswers(p.id).filter(w => w.trim());
      avgWordLen[p.id] = words.length > 0 ? words.reduce((s,w) => s + w.length, 0) / words.length : 0;
    });
    const inventifId = Object.entries(avgWordLen).sort((a,b) => b[1]-a[1])[0]?.[0];
    const inventif = players.find(p => p.id === inventifId);
    if (inventif && inventifId !== fastestId) {
      // BUG 9 FIX: use t("award_avglen_desc") instead of hardcoded French
      awards.push({ player: inventif, icon: "🎨", title: t("award_creative"), desc: `${avgWordLen[inventifId].toFixed(1)} ${t("award_avglen_desc")}` });
    }

    // 4. 🦁 Le plus courageux → most answers submitted (never left blank)
    const filledCount = {};
    players.forEach(p => { filledCount[p.id] = allAnswers(p.id).length; });
    const courageuxId = Object.entries(filledCount).sort((a,b) => b[1]-a[1])[0]?.[0];
    const courageux = players.find(p => p.id === courageuxId);
    if (courageux) awards.push({ player: courageux, icon: "🦁", title: t("award_brave"), desc: `${filledCount[courageuxId]} ${t("award_filled_desc")}` });

    // 5. 💀 La tête de mule → most shared answers (same word as others)
    const sharedCount = {};
    players.forEach(p => { sharedCount[p.id] = allValidity(p.id).filter(v => v === 1).length; });
    const teteMuleId = Object.entries(sharedCount).sort((a,b) => b[1]-a[1])[0]?.[0];
    const teteMule = players.find(p => p.id === teteMuleId);
    if (teteMule) awards.push({ player: teteMule, icon: "💀", title: t("award_stubborn"), desc: `${sharedCount[teteMuleId]} ${t("award_shared_desc")}` });

    // 6. 🌟 L'érudit → best average score per round
    const avgScore = {};
    players.forEach(p => {
      const roundScores = rounds.map(r => r.scores?.[p.id] || 0);
      avgScore[p.id] = roundScores.length > 0 ? roundScores.reduce((s,v)=>s+v,0)/roundScores.length : 0;
    });
    const eruditId = Object.entries(avgScore).sort((a,b) => b[1]-a[1])[0]?.[0];
    const erudit = players.find(p => p.id === eruditId);
    if (erudit) awards.push({ player: erudit, icon: "🌟", title: t("award_scholar"), desc: `${avgScore[eruditId].toFixed(1)} ${t("award_avg_desc")}` });

    // 7. 😅 Le chanceux → best single round score
    let bestRound = { pid: null, score: 0 };
    rounds.forEach(r => {
      players.forEach(p => {
        const s = r.scores?.[p.id] || 0;
        if (s > bestRound.score) bestRound = { pid: p.id, score: s };
      });
    });
    const chanceux = players.find(p => p.id === bestRound.pid);
    if (chanceux && bestRound.pid !== eruditId) {
      awards.push({ player: chanceux, icon: "😅", title: t("award_lucky"), desc: `${bestRound.score} ${t("award_round_desc")}` });
    }

    // 8. 🔥 Le régulier → smallest score variance
    const variance = {};
    players.forEach(p => {
      const scores = rounds.map(r => r.scores?.[p.id] || 0);
      const mean = scores.reduce((s,v)=>s+v,0)/Math.max(scores.length,1);
      variance[p.id] = scores.reduce((s,v) => s + Math.pow(v - mean, 2), 0) / Math.max(scores.length,1);
    });
    const regulierId = Object.entries(variance).sort((a,b) => a[1]-b[1])[0]?.[0];
    const regulier = players.find(p => p.id === regulierId);
    if (regulier && players.length > 1) {
      awards.push({ player: regulier, icon: "🔥", title: t("award_regular"), desc: t("award_regular_desc") });
    }

    // Deduplicate players in awards (1 award per player max, prioritize)
    const seen = new Set();
    return awards.filter(a => {
      if (seen.has(a.player.id)) return false;
      seen.add(a.player.id);
      return true;
    });
  }

  const awards = useMemo(() => computeAwards(), [rounds, players, myId, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Classements spéciaux ───────────────────────────────────
  const rankingFastest = useMemo(() => [...players]
    .filter(p => !p.eliminated)
    .map(p => {
      // Plus rapide = celui qui a appelé STOP (le plus de réponses uniques = proxy)
      const uniqueCount = (rounds || []).reduce((sum, r) => {
        return sum + Object.entries(r.validity || {}).filter(([, cv]) => cv?.[p.id] === 2).length;
      }, 0);
      return { ...p, uniqueCount };
    })
    .sort((a, b) => b.uniqueCount - a.uniqueCount), [players, rounds]);

  const rankingInventif = useMemo(() => [...players]
    .filter(p => !p.eliminated)
    .map(p => {
      // Plus inventif = mots les plus longs en moyenne
      const answers = (rounds || []).flatMap(r =>
        Object.values(r.answers || {}).map(ca => ca?.[p.id] || "")
      ).filter(a => a.trim());
      const avgLen = answers.length ? answers.reduce((s, a) => s + a.length, 0) / answers.length : 0;
      return { ...p, avgLen: Math.round(avgLen * 10) / 10 };
    })
    .sort((a, b) => b.avgLen - a.avgLen), [players, rounds]);

  const rankingScore = useMemo(() => [...players]
    .map(p => ({ ...p, score: gameState.cumulativeScores[p.id] || 0 }))
    .sort((a, b) => b.score - a.score), [players, gameState.cumulativeScores]);

  const [activeTab, setActiveTab] = useState("scores");
  const podium = sorted.slice(0, 3);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
      <div className="hdr">
        <div className="logo">{iWon ? "🏆 Victoire !" : t("round_history")}</div>
        <span style={{ fontSize: 12, color: "var(--txm)" }}>{totalRounds} rounds</span>
      </div>
      <div className="cnt">

        {/* ── Win/Loss banner ── */}
        {iWon ? (
          <div style={{ textAlign: "center", padding: "18px 0 10px" }}>
            <div style={{ fontSize: 52, marginBottom: 8 }}>🎉</div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.5px" }}>{t("congrats2")}</div>
            <div style={{ fontSize: 13, color: "var(--txm)", marginTop: 4 }}>
              {myScore} pts · +{calcXpGain(myScore, true, totalRounds)} {t("xp")}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "14px 0 8px" }}>
            <div style={{ fontSize: 36, marginBottom: 6 }}>💪</div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{t("good_game")}</div>
            <div style={{ fontSize: 13, color: "var(--txm)", marginTop: 3 }}>
              +{calcXpGain(myScore, false, totalRounds)} {t("xp_gained","XP gagnés")}
            </div>
          </div>
        )}

        {/* ── ONGLETS CLASSEMENTS ── */}
        <div style={{ display:"flex", gap:4, marginBottom:12, background:"var(--sf2)", borderRadius:"var(--rs)", padding:4 }}>
          {[["scores","🏆"],["fastest","⚡"],["inventif","🎨"],["awards","🥇"]].map(([id, icon]) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              flex:1, padding:"8px 4px", fontSize:12, fontWeight: activeTab===id?700:500,
              background: activeTab===id?"var(--sf)":"transparent",
              color: activeTab===id?"var(--ac)":"var(--txm)",
              border:"none", borderRadius:"var(--rs)", cursor:"pointer",
              boxShadow: activeTab===id?"var(--s1)":"none",
              transition:"all var(--tr)",
            }}>{icon}</button>
          ))}
        </div>

        {/* ── PODIUM (scores) ── */}
        {activeTab === "scores" && podium.length >= 2 && (
          <div className="card" style={{ padding: "20px 16px 16px" }}>
            <div className="ctitle" style={{ textAlign: "center" }}>{t("podium")}</div><div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 8, marginBottom: 16 }}>
              {/* 2nd place */}
              {podium[1] && (
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ fontSize: 28, marginBottom: 4 }}>{podium[1].isBot ? "🤖" : "👤"}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--tx)", marginBottom: 6, lineHeight: 1.2 }}>
                    {podium[1].name.split(" ")[0]}
                    {podium[1].id === myId && <div style={{ fontSize: 10, color: "var(--ac)" }}>{t("you")}</div>}
                  </div>
                  <div style={{
                    height: 70, background: "linear-gradient(180deg,#9ca3af,#6b7280)",
                    borderRadius: "8px 8px 0 0", display: "flex", alignItems: "center",
                    justifyContent: "center", flexDirection: "column", color: "#fff",
                  }}>
                    <div style={{ fontSize: 20 }}>🥈</div>
                    <div style={{ fontSize: 12, fontWeight: 700, marginTop: 2 }}>{cumulativeScores[podium[1].id] || 0}pts</div>
                  </div>
                </div>
              )}
              {/* 1st place */}
              {podium[0] && (
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ fontSize: 32, marginBottom: 4 }}>{podium[0].isBot ? "🤖" : "👤"}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "var(--tx)", marginBottom: 6, lineHeight: 1.2 }}>
                    {podium[0].name.split(" ")[0]}
                    {podium[0].id === myId && <div style={{ fontSize: 10, color: "var(--ac)" }}>{t("you")}</div>}
                  </div>
                  <div style={{
                    height: 96, background: "linear-gradient(180deg,#f59e0b,#d97706)",
                    borderRadius: "8px 8px 0 0", display: "flex", alignItems: "center",
                    justifyContent: "center", flexDirection: "column", color: "#fff",
                    boxShadow: "0 4px 16px rgba(245,158,11,0.4)",
                  }}>
                    <div style={{ fontSize: 26 }}>🥇</div>
                    <div style={{ fontSize: 14, fontWeight: 800, marginTop: 2 }}>{cumulativeScores[podium[0].id] || 0}pts</div>
                  </div>
                </div>
              )}
              {/* 3rd place */}
              {podium[2] && (
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div style={{ fontSize: 26, marginBottom: 4 }}>{podium[2].isBot ? "🤖" : "👤"}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--tx)", marginBottom: 6, lineHeight: 1.2 }}>
                    {podium[2].name.split(" ")[0]}
                    {podium[2].id === myId && <div style={{ fontSize: 10, color: "var(--ac)" }}>{t("you")}</div>}
                  </div>
                  <div style={{
                    height: 52, background: "linear-gradient(180deg,#b45309,#92400e)",
                    borderRadius: "8px 8px 0 0", display: "flex", alignItems: "center",
                    justifyContent: "center", flexDirection: "column", color: "#fff",
                  }}>
                    <div style={{ fontSize: 16 }}>🥉</div>
                    <div style={{ fontSize: 11, fontWeight: 700, marginTop: 1 }}>{cumulativeScores[podium[2].id] || 0}pts</div>
                  </div>
                </div>
              )}
            </div>
            {/* Base line */}
            <div style={{ height: 3, background: "var(--sf3)", borderRadius: 3 }} />
          </div>
        )}

        {/* ── TROPHÉES INDIVIDUELS ── */}
        {awards.length > 0 && (
          <div className="card">
            <div className="ctitle">{t("trophies2")}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {awards.map((a, i) => {
                const isMe = a.player.id === myId;
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 14px",
                    background: isMe ? "var(--acs)" : "var(--sf2)",
                    border: `1.5px solid ${isMe ? "rgba(67,56,202,0.25)" : "var(--br)"}`,
                    borderRadius: "var(--rm)",
                    transition: "all var(--tr)",
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, fontSize: 22,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "var(--sf)", border: "1.5px solid var(--br)",
                      flexShrink: 0,
                    }}>{a.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: isMe ? "var(--ac)" : "var(--tx)" }}>
                        {a.title}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--txm)", marginTop: 1 }}>{a.desc}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "var(--tx)" }}>
                        {a.player.isBot ? "🤖" : "👤"} {a.player.name.split(" ")[0]}
                      </div>
                      {isMe && <div style={{ fontSize: 10, color: "var(--ac)", fontWeight: 600 }}>{t("its_you")}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── CLASSEMENT SCORES ── */}
        {activeTab === "scores" && (
          <div className="card">
            <div className="ctitle" style={{ marginBottom:10 }}>🏆 {t("leaderboard_title","Classement")}</div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {rankingScore.map((p, i) => (
                <div key={p.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:"var(--rs)", background: p.id===myId?"var(--acs)":"var(--sf2)", border: p.id===myId?"1.5px solid var(--ac-border)":"1px solid var(--br)" }}>
                  <div style={{ width:28, textAlign:"center", fontWeight:800, fontSize:15, color:i===0?"#fbbf24":i===1?"#94a3b8":i===2?"#cd7f32":"var(--txm)" }}>
                    {i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`}
                  </div>
                  <div style={{ flex:1, fontWeight: p.id===myId?700:500 }}>{p.name}{p.id===myId?` ${t("its_you_paren","(toi)")}`:""}  {p.eliminated?"💀":""}</div>
                  <div style={{ fontWeight:800, color:"var(--ac)", fontFamily:"monospace" }}>{p.score} pts</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CLASSEMENT RAPIDITÉ ── */}
        {activeTab === "fastest" && (
          <div className="card">
            <div className="ctitle" style={{ marginBottom:6 }}>⚡ {t("award_fastest","Le plus rapide")}</div>
            <div style={{ fontSize:12, color:"var(--txm)", marginBottom:10 }}>{t("fastest_desc","Celui qui a trouvé le plus de réponses uniques")}</div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {rankingFastest.map((p, i) => (
                <div key={p.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:"var(--rs)", background: p.id===myId?"var(--acs)":"var(--sf2)" }}>
                  <div style={{ width:28, textAlign:"center", fontWeight:800, fontSize:16, color:i===0?"#fbbf24":i===1?"#94a3b8":"var(--txm)" }}>{i===0?"⚡":i===1?"🔥":`#${i+1}`}</div>
                  <div style={{ flex:1, fontWeight: p.id===myId?700:500 }}>{p.name}</div>
                  <div style={{ fontWeight:700, color:"var(--ac)", fontFamily:"monospace" }}>{p.uniqueCount} uniques</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CLASSEMENT CRÉATIVITÉ ── */}
        {activeTab === "inventif" && (
          <div className="card">
            <div className="ctitle" style={{ marginBottom:6 }}>🎨 {t("award_creative","Le plus inventif")}</div>
            <div style={{ fontSize:12, color:"var(--txm)", marginBottom:10 }}>{t("inventif_desc","Celui qui utilise les mots les plus longs et rares")}</div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {rankingInventif.map((p, i) => (
                <div key={p.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:"var(--rs)", background: p.id===myId?"var(--acs)":"var(--sf2)" }}>
                  <div style={{ width:28, textAlign:"center", fontWeight:800, fontSize:16, color:i===0?"#fbbf24":i===1?"#94a3b8":"var(--txm)" }}>{i===0?"🎨":i===1?"✨":`#${i+1}`}</div>
                  <div style={{ flex:1, fontWeight: p.id===myId?700:500 }}>{p.name}</div>
                  <div style={{ fontWeight:700, color:"var(--ac)", fontFamily:"monospace" }}>∅ {p.avgLen} lettres</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── AWARDS ── */}
        {activeTab === "awards" && awards.length > 0 && (
          <div className="card">
            <div className="ctitle">{t("trophies2")}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {awards.map((a, i) => {
                const isMe = a.player.id === myId;
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 14px",
                    background: isMe ? "var(--acs)" : "var(--sf2)",
                    border: `1.5px solid ${isMe ? "rgba(67,56,202,0.25)" : "var(--br)"}`,
                    borderRadius: "var(--rm)",
                  }}>
                    <div style={{ width:44, height:44, borderRadius:12, fontSize:22, display:"flex", alignItems:"center", justifyContent:"center", background:"var(--sf)", border:"1.5px solid var(--br)", flexShrink:0 }}>{a.icon}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:13, color: isMe?"var(--ac)":"var(--tx)" }}>{a.title}</div>
                      <div style={{ fontSize:11, color:"var(--txm)", marginTop:1 }}>{a.desc}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontWeight:700, fontSize:13 }}>{a.player.isBot?"🤖":"👤"} {a.player.name.split(" ")[0]}</div>
                      {isMe && <div style={{ fontSize:10, color:"var(--ac)", fontWeight:600 }}>{t("its_you")}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        
        {/* ── Historique rounds ── */}
        <div className="card">
          <div className="ctitle">{t("round_history")}</div>
          {rounds.map((r, ri) => (
            <div key={ri} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: "var(--txm)", marginBottom: 5 }}>
                Round {ri + 1} — <strong style={{ color: "var(--ac)" }}>{r.letter}</strong>
              </div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {players.map(p => (
                  <div key={p.id} style={{
                    fontSize: 12, background: p.id === myId ? "var(--acs)" : "var(--sf2)",
                    borderRadius: "var(--rs)", padding: "4px 9px",
                    border: `1px solid ${p.id === myId ? "rgba(67,56,202,0.2)" : "var(--br)"}`,
                  }}>
                    {p.name.split(" ")[0]} <span style={{ color: "var(--ac)", fontWeight: 700 }}>+{r.scores?.[p.id] || 0}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button className="btn bp mb8" style={{ marginBottom: 8 }} onClick={onPlayAgain}>{t("play_again2")}</button>
        <button className="btn bs" onClick={onHome}>{t("go_home2")}</button>
        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}

// ─── ONBOARDING ──────────────────────────────────────────────────
function OnboardingScreen({ onDone, lang }) {
  const t = useT(lang || "fr");
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const nameInputRef = useRef(null);
  const steps = [
    { icon: "🎯", title: t("ob1_title"), desc: t("ob1_desc"), action: t("ob_next") },
    { icon: "🎰", title: t("ob2_title"), desc: t("ob2_desc"), action: t("ob_next") },
    { icon: "✍️", title: t("ob3_title"), desc: t("ob3_desc"), action: t("ob_next") },
    { icon: "🏆", title: t("ob4_title"), desc: t("ob4_desc"), action: t("ob_next") },
    { icon: "👤", title: t("ob5_title"), desc: t("ob5_desc"), action: t("ob_start"), input: true },
  ];
  const s = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--bg)", zIndex: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      {/* Progress dots */}
      <div style={{ display: "flex", gap: 6, marginBottom: 40 }}>
        {steps.map((_, i) => (
          <div key={i} style={{ width: i === step ? 20 : 6, height: 6, borderRadius: 3, background: i === step ? "var(--ac)" : "var(--br)", transition: "all 0.3s" }} />
        ))}
      </div>

      {/* Card */}
      <div style={{ textAlign: "center", maxWidth: 340 }}>
        <div style={{ fontSize: 72, marginBottom: 24, animation: "bounce 0.5s ease" }}>{s.icon}</div>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.5px", marginBottom: 12, color: "var(--tx)" }}>{s.title}</div>
        <div style={{ fontSize: 15, color: "var(--txm)", lineHeight: 1.6, marginBottom: 32 }}>{s.desc}</div>

        {s.input && (
          <input
            ref={nameInputRef}
            className="inp"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t("ob5_placeholder")}
            maxLength={20}
            style={{ marginBottom: 16, textAlign: "center", fontSize: 18, fontWeight: 600, border: name.trim() ? "1.5px solid var(--ac)" : "1.5px solid var(--rd)" }}
            autoFocus
          />
        )}

        <button
          className="btn bp"
          onClick={() => {
            if (isLast) {
              if (!name.trim()) {
                nameInputRef.current?.focus();
                return;
              }
              onDone(name.trim());
            } else {
              setStep(s => s + 1);
            }
          }}
          style={{ fontSize: 16, padding: "15px 32px" }}
        >
          {s.action}
        </button>

        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} style={{ background: "none", border: "none", color: "var(--txm)", marginTop: 14, cursor: "pointer", fontSize: 13 }}>{t("back_btn")}</button>
        )}
      </div>
    </div>
  );
}

// ─── LEADERBOARD ──────────────────────────────────────────────────
function LeaderboardScreen({ onClose, xp, playerName, lang, uid }) {
  const t = useT(lang || "fr");
  const [tab, setTab] = useState("global");
  const [entries, setEntries] = useState([]);
  const [tournoiEntries, setTournoiEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const tournament = useMemo(() => getTournamentWeek(), []); // eslint-disable-line react-hooks/exhaustive-deps
  const levelInfo = getLevelInfo(xp || 0, lang);
  const [, setTick] = useState(0);

  // Timer temps réel
  useEffect(() => {
    const id = setInterval(() => setTick(n => n+1), 1000);
    return () => clearInterval(id);
  }, []);

  // Charger classements Firebase (modular API)
  // Sauvegarder le profil dans le leaderboard uniquement si XP ou nom a changé (évite les écritures inutiles)
  const leaderboardWrittenRef = useRef({ xp: -1, name: "" });
  useEffect(() => {
    if (!uid || !FB.db) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEntries(getMockLeaderboard(uid, playerName, xp, levelInfo));
      setTournoiEntries([]);
      setLoading(false);
      return;
    }
    // N'écrire que si les valeurs ont changé depuis la dernière ouverture
    const didChange = leaderboardWrittenRef.current.xp !== (xp || 0) ||
                      leaderboardWrittenRef.current.name !== sanitizeName(playerName);
    if (didChange) {
      leaderboardWrittenRef.current = { xp: xp || 0, name: sanitizeName(playerName) };
      try {
        dbSet(dbRef(FB.db, "leaderboard/" + uid), {
          name: sanitizeName(playerName),
          xp: xp || 0,
          badge: levelInfo.badge,
          country: "🌍",
          updatedAt: Date.now(),
        });
      } catch { /* ignore */ }
    }

    let isMounted = true;
    const loadData = async () => {
      if (!isMounted) return;
      setLoading(true);
      try {
        // Classement global
        const snap = await dbGet(dbQuery(dbRef(FB.db, "leaderboard"), orderByChild("xp"), limitToLast(50)));
        const data = snap.val() || {};
        const list = Object.entries(data)
          .map(([id, v]) => ({ ...v, id, isMe: id === uid }))
          .sort((a, b) => b.xp - a.xp);
        if (isMounted) setEntries(list);
        // Classement tournoi de la semaine
        const weekKey = "week_" + tournament.weekNum;
        const tSnap = await dbGet(dbQuery(dbRef(FB.db, "tournoi/" + weekKey), orderByChild("score"), limitToLast(50)));
        const tData = tSnap.val() || {};
        const tList = Object.entries(tData)
          .map(([id, v]) => ({ ...v, id, isMe: id === uid }))
          .sort((a, b) => b.score - a.score);
        if (isMounted) setTournoiEntries(tList);
      } catch {
        if (isMounted) setEntries(getMockLeaderboard(uid, playerName, xp, levelInfo));
        if (isMounted) setTournoiEntries([]);
      }
      if (isMounted) setLoading(false);
    };
    loadData();

    // Listener temps réel pour le tournoi (modular API)
    let tournoiUnsub = null;
    try {
      const weekKey = "week_" + tournament.weekNum;
      tournoiUnsub = dbOnValue(dbQuery(dbRef(FB.db, "tournoi/" + weekKey), orderByChild("score"), limitToLast(50)), snap => {
        if (!isMounted) return;
        const data = snap.val() || {};
        const list = Object.entries(data)
          .map(([id, v]) => ({ ...v, id, isMe: id === uid }))
          .sort((a, b) => b.score - a.score);
        setTournoiEntries(list);
      });
    } catch { /* ignore */ }
    return () => { isMounted = false; if (tournoiUnsub) tournoiUnsub(); };
  }, [uid, xp, playerName]); // eslint-disable-line react-hooks/exhaustive-deps

  const myRank = entries.findIndex(e => e.isMe) + 1;
  const myTournoiRank = tournoiEntries.findIndex(e => e.isMe) + 1;

  return (
    <div className="profile-ov" onClick={onClose}>
      <div className="profile-panel" onClick={e => e.stopPropagation()}>
        <div style={{ background:"linear-gradient(135deg,var(--ac),var(--acl))", padding:"22px 20px 18px", borderRadius:"24px 24px 0 0", color:"#fff" }}>
          <div style={{ fontSize:11, opacity:.7, letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>🏆 {t("nav_rank")}</div>
          <div style={{ fontSize:20, fontWeight:800 }}>{t("leaderboard_title","Classement")}</div>
          {myRank > 0 && tab === "global" && (
            <div style={{ fontSize:13, opacity:.85, marginTop:4 }}>{t("leaderboard_my_rank","Ta position : #{rank} • {xp} XP").replace("{rank}", myRank).replace("{xp}", (xp||0).toLocaleString())}</div>
          )}
          {myTournoiRank > 0 && tab === "tournoi" && (
            <div style={{ fontSize:13, opacity:.85, marginTop:4 }}>{t("leaderboard_my_rank_tournoi","Ta position tournoi : #{rank}").replace("{rank}", myTournoiRank)}</div>
          )}
        </div>

        {/* Onglets */}
        <div style={{ display:"flex", borderBottom:"1px solid var(--br)", background:"var(--sf)" }}>
          {[["global", t("tab_mondial","🌍 Mondial")],["tournoi", t("tab_tournoi","🏆 Tournoi")]].map(([id,label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              flex:1, padding:"12px 8px", fontSize:13, fontWeight: tab===id?700:500,
              color: tab===id?"var(--ac)":"var(--txm)",
              borderBottom: tab===id?"2px solid var(--ac)":"2px solid transparent",
              background:"none", border:"none", cursor:"pointer",
            }}>{label}</button>
          ))}
        </div>

        <div className="profile-body">

          {/* Tournoi de la semaine */}
          {tab === "tournoi" && (
            <div className="card" style={{ background:"linear-gradient(135deg,rgba(99,102,241,.1),rgba(139,92,246,.06))", border:"1px solid rgba(99,102,241,.2)", marginBottom:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:800 }}>🏆 Lettre : {tournament.letter}</div>
                  <div style={{ fontSize:11, color:"var(--txm)", marginTop:2 }}>
                    {tournament.daysLeft > 0 ? `${tournament.daysLeft} jours restants` : `${String(tournament.hoursLeft).padStart(2,"0")}h${String(tournament.minsLeft).padStart(2,"0")}m`}
                  </div>
                  <div style={{ fontSize:11, color:"var(--ac)", fontWeight:700, marginTop:4 }}>🎁 Gagnant = 1 mois VIP offert !</div>
                </div>
                <div style={{ fontSize:42, fontWeight:900, fontFamily:"monospace", color:"var(--ac)", opacity:.4 }}>{tournament.letter}</div>
              </div>
            </div>
          )}

          {/* Liste classement */}
          {loading ? (
            <div style={{ textAlign:"center", padding:"30px 0", color:"var(--txm)" }}>⏳ Chargement...</div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {(tab === "global" ? entries : tournoiEntries).map((entry, i) => (
                <div key={entry.id || i} style={{
                  display:"flex", alignItems:"center", gap:10,
                  padding:"10px 12px", borderRadius:"var(--r)",
                  background: entry.isMe ? "var(--acs)" : i < 3 ? "var(--sf2)" : "var(--sf)",
                  border: entry.isMe ? "1.5px solid var(--ac)" : "1px solid var(--br)",
                }}>
                  <div style={{ width:28, textAlign:"center", fontWeight:800, fontSize:14,
                    color: i===0?"#fbbf24":i===1?"#94a3b8":i===2?"#cd7f32":"var(--txm)" }}>
                    {i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`}
                  </div>
                  <div style={{ fontSize:20 }}>{entry.badge || "⭐"}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight: entry.isMe?700:500, color:"var(--tx)" }}>
                      {entry.name}{entry.isMe ? " (toi)" : ""}
                    </div>
                    <div style={{ fontSize:11, color:"var(--txm)" }}>{entry.country || "🌍"}</div>
                  </div>
                  <div style={{ fontSize:13, fontWeight:700, color:"var(--ac)", fontFamily:"monospace" }}>
                    {tab === "global" ? `${(entry.xp||0).toLocaleString()} XP` : `${entry.score||0} pts`}
                  </div>
                </div>
              ))}
              {(tab === "global" ? entries : tournoiEntries).length === 0 && (
                <div style={{ textAlign:"center", padding:"30px 0", color:"var(--txm)" }}>
                  <div style={{ fontSize:36, marginBottom:8 }}>🏆</div>
                  <div>{tab === "tournoi" ? t("no_tournoi_players","Sois le premier à jouer ce tournoi !") : t("no_global_players","Aucun joueur encore")}</div>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ padding:"12px 16px", borderTop:"1px solid var(--br)" }}>
          <button className="btn bs" onClick={onClose}>{t("close","Fermer")}</button>
        </div>
      </div>
    </div>
  );
}

function getMockLeaderboard(uid, playerName, xp, levelInfo) {
  const mock = [
    { name:"Sophie L.", xp:8420, country:"🇫🇷", badge:"🔥", id:"m1" },
    { name:"Karim B.",  xp:7650, country:"🇲🇦", badge:"👑", id:"m2" },
    { name:"Lucas M.",  xp:6890, country:"🇧🇪", badge:"💎", id:"m3" },
    { name:"Marie D.",  xp:5920, country:"🇫🇷", badge:"⭐", id:"m4" },
    { name:"Amara S.",  xp:5100, country:"🇨🇮", badge:"🏆", id:"m5" },
    { name:"Thomas R.", xp:4380, country:"🇨🇭", badge:"🏅", id:"m6" },
    { name:"Lina K.",   xp:3750, country:"🇩🇿", badge:"🎓", id:"m7" },
    { name:"Julien F.", xp:2900, country:"🇫🇷", badge:"✏️", id:"m8" },
  ];
  const player = { name: playerName||"Toi", xp: xp||0, country:"🌍", badge: levelInfo.badge, id: uid||"me", isMe:true };
  return [...mock, player].sort((a,b) => b.xp - a.xp);
}

function ThemesScreen({
  current, onSelect, onClose, tier, onTier, lang
}) {
  const t = useT(lang || "fr");
  const canPro = tier === TIER.PRO || tier === TIER.VIP;
  return (
    <div className="profile-ov" onClick={onClose}>
      <div className="profile-panel" onClick={e => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg,#7c3aed,#4338ca)", padding: "24px 20px 20px", borderRadius: "24px 24px 0 0", color: "#fff" }}>
          <div style={{ fontSize: 11, opacity: .7, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{t("preferences")}</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{t("themes_title")}</div>
        </div>
        <div className="profile-body">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
            {THEMES.map(thm => {
              const locked = !thm.free && !canPro;
              const active = thm.id === current;
              return (
                <div key={thm.id} onClick={() => locked ? onTier() : onSelect(thm.id)} style={{
                  borderRadius: "var(--rm)", overflow: "hidden", cursor: "pointer",
                  border: active ? "2.5px solid var(--ac)" : "1.5px solid var(--br)",
                  boxShadow: active ? "0 0 0 3px var(--acg)" : "var(--s1)",
                  transition: "all 0.15s", opacity: locked ? 0.7 : 1,
                }}>
                  {/* Color preview */}
                  <div style={{ display: "flex", height: 44 }}>
                    {thm.preview.map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
                  </div>
                  <div style={{ padding: "6px 8px", background: thm.preview[0], display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: thm.preview[2] }}>{thm.name}</span>
                    {locked && <span style={{ fontSize: 9, background: "rgba(0,0,0,0.1)", padding: "1px 5px", borderRadius: 10, color: thm.preview[2] }}>{t("pro_label")}</span>}
                    {active && <span style={{ fontSize: 10 }}>✓</span>}
                  </div>
                </div>
              );
            })}
          </div>
          {!canPro && (
            <div style={{ padding: "12px 14px", background: "var(--vipg)", borderRadius: "var(--rm)", border: "1.5px solid rgba(146,64,14,0.2)", marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--vip)", marginBottom: 3 }}>{t("pro_themes_label")}</div>
              <div style={{ fontSize: 11, color: "var(--txm)" }}>{t("pro_themes_desc")}</div>
            </div>
          )}
          <button className="btn bs" onClick={onClose}>{t("close")}</button>
        </div>
      </div>
    </div>
  );
}

// ─── BADGE NOTIFICATION ───────────────────────────────────────────
function BadgeNotification({
  badges, lang
}) {
  const t = useT(lang || "fr");
  return (
    <div style={{
      position: "fixed", top: 60, left: "50%", transform: "translateX(-50%)",
      zIndex: 500, display: "flex", flexDirection: "column", gap: 8, alignItems: "center",
    }}>
      {badges.map(b => (
        <div key={b.id} style={{
          background: "linear-gradient(135deg, #4338ca, #7c3aed)",
          color: "#fff", borderRadius: 50, padding: "10px 20px",
          display: "flex", alignItems: "center", gap: 10,
          boxShadow: "0 6px 20px rgba(67,56,202,0.35)",
          animation: "slideDown 0.4s cubic-bezier(.34,1.2,.64,1)",
          whiteSpace: "nowrap",
        }}>
          <span style={{ fontSize: 22 }}>{b.icon}</span>
          <div>
            <div style={{ fontSize: 10, opacity: .8, letterSpacing: 1 }}>{t("badge_unlocked")}</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{b.name}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── SETTINGS PANEL ──────────────────────────────────────────────
function SettingsPanel({ settings, setSettings, theme, onThemeChange, lang, setLang, tier, onTier, onClose, onBugReport, onRateApp, onShare, onEditProfile, onShowLegal }) {
  const t = useT(lang || "fr");
  const THEME_DOTS = [
    { id: "light",   color: "#4338ca", bg: "#fafaf8", label: "📄 Papier" },
    { id: "dark",    color: "#818cf8", bg: "#0c0c10", label: "🌑 Minuit" },
    { id: "sakura",  color: "#e879a0", bg: "#fff0f6", label: "🌸 Sakura",     pro: true },
    { id: "noir",    color: "#facc15", bg: "#000000", label: "🖤 Noir",       pro: true },
    { id: "neon",    color: "#39ff14", bg: "#0d0d1a", label: "⚡ Néon",       pro: true },
    { id: "sand",    color: "#d97706", bg: "#fef3c7", label: "🏜️ Sahara",    pro: true },
    { id: "nord",    color: "#5e81ac", bg: "#ecf4f8", label: "🧊 Nordique",   pro: true },
    { id: "volcano", color: "#ff3d00", bg: "#1a0505", label: "🌋 Volcan",     pro: true },
  ];
  const canPro = tier === TIER.PRO || tier === TIER.VIP;

  return (
    <div className="profile-ov" onClick={onClose}>
      <div className="profile-panel" onClick={e => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg,#1c1917,#292524)", padding: "22px 20px 18px", borderRadius: "24px 24px 0 0", color: "#fff" }}>
          <div style={{ fontSize: 11, opacity: .65, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{t("preferences")}</div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{t("settings_title2")}</div>
        </div>
        <div className="profile-body">

          {/* Theme selector */}
          <div style={{ marginBottom: 20 }}>
            <div className="profile-section-title">{t("settings_theme")}</div>
            <div className="theme-switcher" style={{ flexWrap: "wrap", gap: 8 }}>
              {THEME_DOTS.map(thm => {
                const locked = thm.pro && !canPro;
                return (
                  <div key={thm.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div
                      className={`theme-dot ${theme === thm.id ? "active" : ""}`}
                      style={{ background: `linear-gradient(135deg, ${thm.bg} 50%, ${thm.color} 50%)`, width: 36, height: 36, opacity: locked ? 0.4 : 1 }}
                      onClick={() => locked ? onTier() : onThemeChange(thm.id)}
                      title={thm.label + (locked ? " (PRO)" : "")}
                    />
                    <span style={{ fontSize: 9, color: "var(--txm)", fontWeight: 500 }}>
                      {thm.label}{locked ? " 🔒" : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Settings toggles */}
          <div className="card" style={{ padding: "8px 14px", marginBottom: 12 }}>
            <div className="settings-row">
              <div>
                <div className="settings-label">{t("sounds_label")}</div>
                <div className="settings-sub">{t("sounds_sub")}</div>
              </div>
              <button
                className={`toggle ${settings.soundEnabled !== false ? "on" : ""}`}
                onClick={() => setSettings(s => ({ ...s, soundEnabled: !s.soundEnabled }))}
              >
                <div className="toggle-knob" />
              </button>
            </div>
            <div className="settings-row">
              <div>
                <div className="settings-label">{t("country_label")}</div>
                <div className="settings-sub">{t("settings_country_desc")}</div>
              </div>
              <select
                className="inp"
                style={{ width: 130, fontSize: 13, padding: "6px 10px" }}
                value={settings.country || "France"}
                onChange={e => setSettings(s => ({ ...s, country: e.target.value }))}
              >
                {["France","Belgique","Suisse","Canada","Maroc","Algérie","Tunisie","Sénégal","Côte d'Ivoire","Autre"].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="settings-row">
              <div>
                <div className="settings-label">{t("pseudo_label")}</div>
                <div className="settings-sub">{t("pseudo_sub")}</div>
              </div>
              <input
                className="inp"
                style={{ width: 130, fontSize: 13, padding: "6px 10px" }}
                value={settings.playerName || ""}
                onChange={e => setSettings(s => ({ ...s, playerName: e.target.value }))}
                maxLength={16}
              />
            </div>
          </div>

          {/* Subscription */}
          <div style={{ padding: "12px 14px", background: "var(--acs)", borderRadius: "var(--rm)", border: "1.5px solid var(--ac-border,rgba(67,56,202,0.2))", marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{t("subscription")}</div>
            <div style={{ fontSize: 12, color: "var(--txm)", marginBottom: 8 }}>
              {tier === TIER.VIP ? t("vip_all_features") : tier === TIER.PRO ? t("pro_advanced") : t("free_tier_status","◇ Gratuit — Version de base")}
            </div>
            <button className="btn bp bsm" onClick={onTier} style={{ width: "auto", fontSize: 12 }}>
              {tier === TIER.FREE ? t("upgrade_pro") : t("manage_sub")}
            </button>
          </div>

          {/* Language selector */}
          <div className="card" style={{ padding: "8px 14px", marginBottom: 12 }}>
            <div className="settings-row">
              <div>
                <div className="settings-label">{t("settings_lang")}</div>
                <div className="settings-sub">{t("lang_selector_sub")}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {[["fr","🇫🇷"],["en","🇬🇧"]].map(([l, flag]) => (
                  <button key={l} onClick={() => setLang(l)} style={{
                    width: 38, height: 34, borderRadius: "var(--rs)",
                    border: `2px solid ${lang===l?"var(--ac)":"var(--br)"}`,
                    background: lang===l?"var(--acs)":"var(--sf)",
                    cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center",
                    justifyContent: "center",
                  }}>{flag}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Haptic feedback toggle */}
          <div className="card" style={{ padding: "8px 14px", marginBottom: 12 }}>
            <div className="settings-row">
              <div>
                <div className="settings-label">{t("vibrations")}</div>
                <div className="settings-sub">{t("vibrations_sub")}</div>
              </div>
              <button
                className={`toggle ${settings.hapticEnabled !== false ? "on" : ""}`}
                onClick={() => {
                  const newVal = settings.hapticEnabled === false ? true : false;
                  setSettings(s => ({ ...s, hapticEnabled: newVal }));
                  Haptics.enabled = newVal;
                }}
              >
                <div className="toggle-knob" />
              </button>
            </div>
          </div>

          {/* Profile photo */}
          <button className="btn bs mb8" style={{ marginBottom: 8 }} onClick={onEditProfile}>
            {t("edit_photo")}
          </button>

          {/* Community */}
          <div className="ctitle" style={{ marginTop: 16 }}>{t("community")}</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button className="btn bs" style={{ flex: 1, fontSize: 12 }} onClick={onShare}>{t("share_game")}</button>
            <button className="btn bs" style={{ flex: 1, fontSize: 12 }} onClick={onRateApp}>{t("rate_app")}</button>
          </div>
          <button className="btn bs mb8" style={{ marginBottom: 16 }} onClick={onBugReport}>{t("bug_title")}</button>

          {/* Legal */}
          <div className="ctitle">{t("legal")}</div>
          <div className="card" style={{ padding: "12px 14px", marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: "var(--txm)", lineHeight: 1.8 }}>
              <div style={{ fontWeight: 700, marginBottom: 6, color: "var(--tx)" }}>{t("legal_title")}</div>
              <div>{t("legal_version")}</div>
              <div>{t("all_rights")}</div>
              <div style={{ marginTop: 8 }}>
                <span style={{ fontWeight: 600 }}>{t("legal_licenses")}</span>
              </div>
              <div>{t("legal_react")}</div>
              <div style={{ marginTop: 4 }}>
                <span style={{ fontWeight: 600 }}>{t("personal_data")}</span>
              </div>
              <div>{t("data_policy")}</div>
              <div style={{ marginTop: 4 }}>
                <span style={{ fontWeight: 600 }}>{t("legal_contact")}</span> {t("legal_contact_email")}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--br)" }}>
            <div style={{ fontSize: 11, color: "var(--txd)", marginBottom: 8, textAlign: "center" }}>
              Le Petit Bac v1.0.0
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button onClick={() => onShowLegal("cgu")} style={{ background: "none", border: "none", fontSize: 11, color: "var(--txm)", cursor: "pointer", textDecoration: "underline" }}>{t("cgu_title","CGU")}</button>
              <span style={{ color: "var(--txd)", fontSize: 11 }}>·</span>
              <button onClick={() => onShowLegal("privacy")} style={{ background: "none", border: "none", fontSize: 11, color: "var(--txm)", cursor: "pointer", textDecoration: "underline" }}>{t("privacy_title","Confidentialité")}</button>
            </div>
          </div>
          <button className="btn bs" style={{ marginTop: 12 }} onClick={onClose}>{t("close")}</button>
        </div>
      </div>
    </div>
  );
}

// ─── BUG REPORT ──────────────────────────────────────────────────
function BugReportModal({
  onClose, lang
}) {
  const t = useT(lang || "fr");
  const [category, setCategory] = useState("gameplay");
  const [desc, setDesc] = useState("");
  const [sent, setSent] = useState(false);

  function submit() {
    if (!desc.trim()) return;
    if (import.meta.env.DEV) console.log("Bug report:", { category, desc, timestamp: new Date().toISOString() });
    setSent(true);
    Haptics.success();
    setTimeout(onClose, 2000);
  }

  return (
    <div className="profile-ov" onClick={onClose}>
      <div className="profile-panel" onClick={e => e.stopPropagation()}>
        <div style={{ background:"linear-gradient(135deg,#b91c1c,#dc2626)", padding:"22px 20px 18px", borderRadius:"24px 24px 0 0", color:"#fff" }}>
          <div style={{ fontSize:11, opacity:.7, letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>{t("support")}</div>
          <div style={{ fontSize:20, fontWeight:800 }}>{t("bug_title")}</div>
        </div>
        <div className="profile-body">
          {sent && (
            <div style={{ textAlign:"center", padding:"30px 0" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
              <div style={{ fontSize:16, fontWeight:700 }}>{t("bug_thanks")}</div>
              <div style={{ fontSize:13, color:"var(--txm)", marginTop:6 }}>{t("on_it")}</div>
            </div>
          )}
          {!sent && (
            <div>
              <div className="ctitle" style={{ marginBottom:10 }}>{t("bug_category")}</div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:14 }}>
                {[["gameplay","🎮 Gameplay"],["ui","🖼 Interface"],["scoring","📊 Scores"],["crash","💥 Crash"],["other", t("bug_cat_other","❓ Autre")]].map(([id, label]) => (
                  <button key={id} onClick={() => setCategory(id)} style={{
                    padding:"7px 12px", borderRadius:20,
                    border: category===id ? "1.5px solid var(--ac)" : "1.5px solid var(--br)",
                    background: category===id ? "var(--acs)" : "var(--sf)",
                    color: category===id ? "var(--ac)" : "var(--txm)",
                    fontWeight: category===id ? 700 : 500,
                    fontSize:12, cursor:"pointer", fontFamily:"inherit",
                  }}>{label}</button>
                ))}
              </div>
              <div className="ctitle" style={{ marginBottom:8 }}>{t("description")}</div>
              <textarea
                className="inp"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder={t("bug_desc_placeholder")}
                style={{ minHeight:120, resize:"none", marginBottom:14, lineHeight:1.5 }}
              />
              <button className="btn bp" onClick={submit} style={{ background:"linear-gradient(135deg,#b91c1c,#dc2626)" }}>
                {t("bug_send")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// ─── RATE APP MODAL ───────────────────────────────────────────────
function RateAppModal({
  onClose, lang
}) {
  const t = useT(lang || "fr");
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [done, setDone] = useState(false);

  function submit() {
    if (stars === 0) return;
    Haptics.success();
    setDone(true);
    // In production: redirect to App Store / Play Store
    if (stars >= 4) {
      setTimeout(() => {
        const storeUrl = /iPhone|iPad/.test(navigator.userAgent)
          ? "https://apps.apple.com/app/le-petit-bac"
          : "https://play.google.com/store/apps/details?id=com.petitbac.app";
        window.open(storeUrl, "_blank");
        onClose();
      }, 1500);
    } else {
      setTimeout(onClose, 2000);
    }
  }

  return (
    <div className="profile-ov" onClick={onClose}>
      <div className="profile-panel" onClick={e => e.stopPropagation()}>
        <div style={{ background:"linear-gradient(135deg,#d97706,#f59e0b)", padding:"22px 20px 18px", borderRadius:"24px 24px 0 0", color:"#fff" }}>
          <div style={{ fontSize:11, opacity:.7, letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>{t("rate_opinion")}</div>
          <div style={{ fontSize:20, fontWeight:800 }}>{t("rate_title")}</div>
        </div>
        <div className="profile-body" style={{ textAlign:"center" }}>
          {done ? (
            <div style={{ padding:"30px 0" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🙏</div>
              <div style={{ fontSize:16, fontWeight:700 }}>{t("rate_thanks")}</div>
              <div style={{ fontSize:13, color:"var(--txm)", marginTop:6 }}>
                {stars >= 4 ? "..." : "..."}
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontSize:18, fontWeight:700, marginBottom:6 }}>{t("rate_question")}</div>
              <div style={{ fontSize:13, color:"var(--txm)", marginBottom:24 }}>{t("rate_help")}</div>
              <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:24 }}>
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => setStars(s)} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
                    style={{ fontSize:40, background:"none", border:"none", cursor:"pointer", transition:"transform 0.15s",
                      transform:(hover||stars)>=s?"scale(1.2)":"scale(1)", filter:(hover||stars)>=s?"none":"grayscale(1)" }}>⭐</button>
                ))}
              </div>
              <div style={{ fontSize:13, color:"var(--txm)", marginBottom:20, minHeight:20 }}>
                {stars===1?"😔":stars===2?"😐":stars===3?"🙂":stars===4?"😊":stars===5?"🤩":""}
              </div>
              <button className="btn bp" onClick={submit} disabled={stars===0}
                style={{ background:"linear-gradient(135deg,#d97706,#f59e0b)" }}>{t("rate_validate")}</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SHARE MODAL ─────────────────────────────────────────────────
function ShareModal({
  onClose, lang
}) {
  const t = useT(lang || "fr");
  const [copied, setCopied] = useState(false);
  const url = "https://petitbac.app";
  const text = t("share_invite") + " 🎯";

  async function handleShare() {
    const result = await shareApp();
    if (result === "copied") { setCopied(true); setTimeout(() => setCopied(false), 2000); }
    Haptics.success();
  }

  return (
    <div className="profile-ov" onClick={onClose}>
      <div className="profile-panel" onClick={e => e.stopPropagation()}>
        <div style={{ background:"linear-gradient(135deg,#4338ca,#7c3aed)", padding:"22px 20px 18px", borderRadius:"24px 24px 0 0", color:"#fff" }}>
          <div style={{ fontSize:11, opacity:.7, letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>{t("share_invite")}</div>
          <div style={{ fontSize:20, fontWeight:800 }}>{t("share_title")}</div>
        </div>
        <div className="profile-body">
          <div style={{ textAlign:"center", marginBottom:20 }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🎯</div>
            <div style={{ fontSize:16, fontWeight:700 }}>{t("app_name_fr")}</div>
            <div style={{ fontSize:13, color:"var(--txm)", marginTop:4 }}>{text}</div>
          </div>
          <div style={{ display:"flex", gap:8, marginBottom:12 }}>
            <button className="btn bp" style={{ flex:1 }} onClick={handleShare}>
              {copied ? "✅ " + t("close") : "📤 " + t("share_game")}
            </button>
          </div>
          <div style={{ display:"flex", gap:8, marginBottom:16 }}>
            {[["📲","WhatsApp",`https://wa.me/?text=${encodeURIComponent(text+" "+url)}`],
              ["🐦","Twitter",`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`],
              ["📘","Facebook",`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`]
            ].map(([icon,name,link]) => (
              <a key={name} href={link} target="_blank" rel="noopener noreferrer"
                style={{ flex:1, padding:"10px 6px", background:"var(--sf2)", border:"1.5px solid var(--br)",
                  borderRadius:"var(--rm)", textAlign:"center", textDecoration:"none", color:"var(--tx)" }}
                onClick={() => Haptics.light()}>
                <div style={{ fontSize:22 }}>{icon}</div>
                <div style={{ fontSize:11, marginTop:3, fontWeight:600 }}>{name}</div>
              </a>
            ))}
          </div>
          <button className="btn bs" onClick={onClose}>{t("close")}</button>
        </div>
      </div>
    </div>
  );
}

// ─── PROFILE PHOTO MODAL ──────────────────────────────────────────
function ProfilePhotoModal({ onClose, onSave, currentPhoto, playerName, lang }) {
  const t = useT(lang || "fr");
  const [tab, setTab] = useState("avatar"); // avatar | emoji
  const [selectedEmoji, setSelectedEmoji] = useState(currentPhoto || "");
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const AVATARS = ["🎯","🏆","⭐","🔥","💎","👑","🦁","🐺","🦊","🐯","🦅","🚀","⚡","💫","🌟","🎭","🎨","🎸","🎮","🏅"];
  const COLORS = ["#4338ca","#dc2626","#16a34a","#d97706","#7c3aed","#0284c7","#be185d","#0f766e"];
  const [bgColor, setBgColor] = useState("#4338ca");

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  function save() {
    if (preview) { onSave({ type:"photo", data:preview }); }
    else if (selectedEmoji) { onSave({ type:"emoji", emoji:selectedEmoji, bg:bgColor }); }
    else { onSave(null); }
    Haptics.success();
    onClose();
  }

  const initials = (playerName || "J").charAt(0).toUpperCase();

  return (
    <div className="profile-ov" onClick={onClose}>
      <div className="profile-panel" onClick={e => e.stopPropagation()}>
        <div style={{ background:"linear-gradient(135deg,#4338ca,#7c3aed)", padding:"22px 20px 18px", borderRadius:"24px 24px 0 0", color:"#fff" }}>
          <div style={{ fontSize:11, opacity:.7, letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>{t("personalisation")}</div>
          <div style={{ fontSize:20, fontWeight:800 }}>{t("photo_title")}</div>
        </div>
        <div className="profile-body">
          {/* Preview */}
          <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
            <div style={{ width:80, height:80, borderRadius:"50%", overflow:"hidden", border:"3px solid var(--ac)",
              background:preview?"transparent":bgColor, display:"flex", alignItems:"center", justifyContent:"center",
              fontSize: selectedEmoji ? 36 : 32, fontWeight:800, color:"#fff" }}>
              {preview ? <img src={preview} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="preview"/> :
               selectedEmoji || initials}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display:"flex", gap:6, marginBottom:16 }}>
            {[["avatar","🎭 Avatar"],["photo","📷 Photo"]].map(([id,label]) => (
              <button key={id} onClick={() => setTab(id)} style={{
                flex:1, padding:"9px", borderRadius:"var(--rm)",
                border:`1.5px solid ${tab===id?"var(--ac)":"var(--br)"}`,
                background:tab===id?"var(--acs)":"var(--sf)",
                color:tab===id?"var(--ac)":"var(--txm)",
                fontWeight:tab===id?700:500, fontSize:13, cursor:"pointer", fontFamily:"inherit",
              }}>{label}</button>
            ))}
          </div>

          {tab === "avatar" && (
            <>
              <div className="ctitle">{t("choose_emoji")}</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:14 }}>
                {AVATARS.map(e => (
                  <button key={e} onClick={() => { setSelectedEmoji(e); setPreview(null); }} style={{
                    width:44, height:44, borderRadius:12, fontSize:22, border:`2px solid ${selectedEmoji===e?"var(--ac)":"var(--br)"}`,
                    background:selectedEmoji===e?"var(--acs)":"var(--sf2)", cursor:"pointer",
                  }}>{e}</button>
                ))}
              </div>
              <div className="ctitle">{t("choose_color")}</div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
                {COLORS.map(c => (
                  <div key={c} onClick={() => setBgColor(c)} style={{
                    width:32, height:32, borderRadius:"50%", background:c, cursor:"pointer",
                    border:`3px solid ${bgColor===c?"var(--tx)":"transparent"}`,
                  }}/>
                ))}
              </div>
            </>
          )}

          {tab === "photo" && (
            <div style={{ textAlign:"center", marginBottom:16 }}>
              {/* Deux inputs séparés : l'un avec capture (caméra), l'autre sans (galerie) */}
              <input ref={fileRef} type="file" accept="image/*" capture="user" onChange={handleFile} style={{ display:"none" }} />
              <input ref={el => { if (el) el._galleryRef = true; }} id="pb-gallery-input" type="file" accept="image/*" onChange={handleFile} style={{ display:"none" }} />
              <button className="btn bp" onClick={() => fileRef.current?.click()} style={{ marginBottom:8 }}>{t("photo_title")}</button>
              <button className="btn bs" onClick={() => document.getElementById("pb-gallery-input")?.click()}>🖼 {t("legal_licenses","Galerie")}</button>
            </div>
          )}

          <button className="btn bp" onClick={save}>{t("save_btn")}</button>
        </div>
      </div>
    </div>
  );
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────
// ─── LEGAL MODAL ─────────────────────────────────────────────────
function LegalModal({ onClose, lang, type }) {
  const t = useT(lang || "fr");
  const APP_NAME = "Le Petit Bac";
  const EMAIL = "support@petitbac.app";
  const DATE = "1er janvier 2025";

  const cgu = `
CONDITIONS GÉNÉRALES D'UTILISATION — ${APP_NAME}
Dernière mise à jour : ${DATE}

1. OBJET
Les présentes CGU régissent l'utilisation de l'application ${APP_NAME}, jeu de mots multijoueur disponible sur le web.

2. ACCÈS AU SERVICE
L'accès est gratuit dans sa version de base. Des fonctionnalités supplémentaires sont disponibles via abonnement PRO (4,99€/mois) ou VIP (14,99€/mois), résiliables à tout moment.

3. COMPTE UTILISATEUR
Aucune création de compte n'est requise. Un identifiant anonyme est généré automatiquement à la première utilisation.

4. RÈGLES D'UTILISATION
Il est interdit d'utiliser le service pour diffuser des contenus illicites, haineux ou offensants. Tout comportement abusif entraîne la suspension du service.

5. PROPRIÉTÉ INTELLECTUELLE
L'application, son code, ses graphismes et son contenu sont la propriété exclusive de ${APP_NAME}. Toute reproduction est interdite sans autorisation.

6. RESPONSABILITÉ
Le service est fourni "tel quel". Nous ne garantissons pas une disponibilité ininterrompue.

7. CONTACT
${EMAIL}
  `;

  const privacy = `
POLITIQUE DE CONFIDENTIALITÉ — ${APP_NAME}
Dernière mise à jour : ${DATE}

1. DONNÉES COLLECTÉES
• Identifiant anonyme généré localement (aucun email, aucun mot de passe)
• Pseudonyme choisi par l'utilisateur
• Score XP et statistiques de jeu
• Données de jeu (parties jouées, mots saisis)

2. UTILISATION DES DONNÉES
Les données sont utilisées uniquement pour :
• Afficher le classement mondial
• Sauvegarder la progression
• Améliorer l'expérience de jeu

3. STOCKAGE
Les données sont stockées sur Firebase (Google Cloud, Europe) et en local sur votre appareil.

4. PARTAGE
Aucune donnée n'est vendue à des tiers. Le classement public affiche uniquement le pseudonyme et le score XP.

5. VOS DROITS (RGPD)
Vous pouvez demander la suppression de vos données à tout moment en contactant : ${EMAIL}

6. COOKIES
L'application utilise le stockage local (localStorage) pour sauvegarder vos préférences. Aucun cookie publicitaire.

7. CONTACT DPO
${EMAIL}
  `;

  const content_text = type === "cgu" ? cgu : privacy;
  const title = type === "cgu" ? t("cgu_title","Conditions d'utilisation") : t("privacy_title","Politique de confidentialité");

  return (
    <div className="profile-ov" onClick={onClose}>
      <div className="profile-panel" onClick={e => e.stopPropagation()}>
        <div style={{ background: "var(--sf2)", padding: "20px 20px 16px", borderRadius: "24px 24px 0 0", borderBottom: "1px solid var(--br)" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--tx)" }}>{title}</div>
        </div>
        <div className="profile-body">
          <pre style={{
            fontSize: 12, lineHeight: 1.7, color: "var(--txm)",
            whiteSpace: "pre-wrap", wordBreak: "break-word",
            fontFamily: "inherit",
          }}>{content_text}</pre>
        </div>
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--br)" }}>
          <button className="btn bp" onClick={onClose}>{t("close","Fermer")}</button>
        </div>
      </div>
    </div>
  );
}

function BottomNav({ tab, setTab, setScreen, setGameState, onLeaderboard, lang }) {
  const t = useT(lang || "fr");
  return (
    <nav className="bnav">
      <button className={`nb ${tab==="home"?"active":""}`} onClick={() => { setTab("home"); setScreen("home"); }}>
        <span className="ni">🏠</span>{t("nav_home")}
      </button>
      {/* Aller en setup solo — initialiser gameState avec mode="solo" sans spreader un état potentiellement null */}
      <button className={`nb ${tab==="play"?"active":""}`} onClick={() => {
        setTab("play");
        if (setGameState) setGameState({ mode: "solo" });
        setScreen("setup");
      }}>
        <span className="ni">🎮</span>{t("nav_play")}
      </button>
      <button className={`nb ${tab==="online"?"active":""}`} onClick={() => { setTab("online"); setScreen("online"); }}>
        <span className="ni">🌐</span>{t("nav_online")}
      </button>
      <button className={`nb ${tab==="rank"?"active":""}`} onClick={() => { setTab("rank"); onLeaderboard(); }}>
        <span className="ni">🏆</span>{t("nav_rank")}
      </button>
    </nav>
  );
}

// ─── TIER MODAL ───────────────────────────────────────────────────
function TierModal({
  current, onSelect, onClose, lang
}) {
  const t = useT(lang || "fr");
  const [sel, setSel] = useState(current);
  const [loading, setLoading] = useState(false);

  const tiers = [
    {
      id: TIER.FREE, name: t("free_label","Gratuit"), price: "0€",
      cls: "tc-free", period: "",
      features: [t("tier_free_f1","6 catégories"), t("tier_free_f2","2 thèmes"), t("tier_free_f3","Solo vs IA")],
      stripe: null,
    },
    {
      id: TIER.PRO, name: "PRO ◆", price: "4,99€",
      cls: "tc-pro", period: t("per_month","/mois"),
      features: [t("tier_pro_f1","30 catégories"), t("tier_pro_f2","10 thèmes"), t("tier_pro_f3","Multijoueur illimité"), t("tier_pro_f4","Défi quotidien")],
      stripe: "https://buy.stripe.com/test_00waEW85F1dE1fZ7Wj6g800",
    },
    {
      id: TIER.VIP, name: "VIP ★", price: "14,99€",
      cls: "tc-vip", period: t("per_month","/mois"),
      features: [t("tier_vip_f1","Tout PRO +"), t("tier_vip_f2","12 thèmes exclusifs"), t("tier_vip_f3","Tournois VIP"), t("tier_vip_f4","Badge exclusif ★")],
      stripe: "https://buy.stripe.com/test_8x2dR8gCbbSi0bVdgD6g801",
    },
  ];

  function handleSelect(tier_item) {
    if (tier_item.id === TIER.FREE) {
      onSelect(TIER.FREE);
      onClose();
      return;
    }
    // Ouvrir Stripe dans un nouvel onglet
    if (tier_item.stripe && tier_item.stripe.includes("buy.stripe.com") && !tier_item.stripe.includes("test_")) {
      setLoading(true);
      window.open(tier_item.stripe, "_blank");
      // Simuler l'activation après 2s (mode démo)
      setTimeout(() => { onSelect(tier_item.id); onClose(); }, 1500);
      setTimeout(() => { setLoading(false); }, 2000);
    } else {
      // Mode démo: activer directement
      onSelect(tier_item.id);
      onClose();
    }
    logEvent("subscription_click", { tier: tier_item.id });
  }

  return (
    <div className="mov" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 360, borderRadius: 20, overflow: "hidden" }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#7c3aed,#4338ca)", padding: "20px 20px 16px", color: "#fff" }}>
          <div style={{ fontSize: 11, opacity: .7, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>💎 {t("subscriptions","Abonnements")}</div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{t("tier_unlock","Débloquer l'accès complet")}</div>
        </div>

        {/* Tiers */}
        <div style={{ padding: "16px 16px 8px" }}>
          {tiers.map(tier_item => (
            <div
              key={tier_item.id}
              onClick={() => setSel(tier_item.id)}
              style={{
                marginBottom: 10, padding: "14px 16px", borderRadius: 14, cursor: "pointer",
                border: sel === tier_item.id ? "2px solid var(--ac)" : "1.5px solid var(--br)",
                background: sel === tier_item.id ? "var(--acs)" : "var(--sf2)",
                transition: "all 0.15s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ fontSize: 16, fontWeight: 800,
                  color: tier_item.id === TIER.VIP ? "var(--vip)" : tier_item.id === TIER.PRO ? "var(--pro)" : "var(--tx)"
                }}>{tier_item.name}</div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "var(--ac)" }}>{tier_item.price}</span>
                  <span style={{ fontSize: 11, color: "var(--txm)" }}>{tier_item.period}</span>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {tier_item.features.map((f, i) => (
                  <span key={i} style={{ fontSize: 11, background: "var(--sf3)", padding: "2px 8px", borderRadius: 99, color: "var(--txm)" }}>✓ {f}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ padding: "0 16px 20px" }}>
          <button
            className={`btn ${sel === TIER.VIP ? "bvip" : sel === TIER.PRO ? "bpro" : "bp"} mb8`}
            style={{ marginBottom: 8 }}
            onClick={() => handleSelect(tiers.find(ti => ti.id === sel))}
            disabled={loading}
          >
            {loading ? "⏳ " + t("loading","Chargement...") :
             sel === current ? t("continue_btn","Continuer") :
             sel === TIER.FREE ? t("stay_free","Rester gratuit") :
             t("subscribe_btn","S'abonner") + " " + (sel === TIER.PRO ? "PRO" : "VIP")}
          </button>
          <button className="btn bs" onClick={onClose}>{t("cancel3","Annuler")}</button>
          <div style={{ textAlign: "center", marginTop: 10, fontSize: 10, color: "var(--txd)" }}>
            {t("stripe_secure","Paiement sécurisé par Stripe • Annulable à tout moment")}
          </div>
        </div>
      </div>
    </div>
  );
}
