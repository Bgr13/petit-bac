// ─── THEMES ─────────────────────────────────────────────────────
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

// ─── RETOUR HAPTIQUE ─────────────────────────────────────────────

export { THEMES, THEME_VARS, applyTheme };
