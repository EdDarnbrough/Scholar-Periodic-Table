(() => {
  // ========= CONFIG (edit these) =========
  const TABLE_SELECTOR = "#gsc_a_t";   // e.g. "#reportTable"
  const TEXT_SELECTOR = "a.gsc_a_at"; 
  const COUNT_MODE = "names";      // "names" (recommended) or "symbols"
  const INCLUDE_ONE_LETTER_SYMBOLS = false; // symbols mode can be noisy
  const EXCLUDE_SYMBOLS = new Set(["He","In","As","At","Am","No"]); // symbols-mode noise reducers
  // Color thresholds: 1 green, 2 yellow, 3 orange, 4+ red
  // ======================================

  // --- periodic table positions (period, group). Groups 1..18 ---
  const POS = [
    // Period 1
    ["H",1,1], ["He",1,18],
    // Period 2
    ["Li",2,1],["Be",2,2],["B",2,13],["C",2,14],["N",2,15],["O",2,16],["F",2,17],["Ne",2,18],
    // Period 3
    ["Na",3,1],["Mg",3,2],["Al",3,13],["Si",3,14],["P",3,15],["S",3,16],["Cl",3,17],["Ar",3,18],
    // Period 4
    ["K",4,1],["Ca",4,2],["Sc",4,3],["Ti",4,4],["V",4,5],["Cr",4,6],["Mn",4,7],["Fe",4,8],["Co",4,9],["Ni",4,10],["Cu",4,11],["Zn",4,12],["Ga",4,13],["Ge",4,14],["As",4,15],["Se",4,16],["Br",4,17],["Kr",4,18],
    // Period 5
    ["Rb",5,1],["Sr",5,2],["Y",5,3],["Zr",5,4],["Nb",5,5],["Mo",5,6],["Tc",5,7],["Ru",5,8],["Rh",5,9],["Pd",5,10],["Ag",5,11],["Cd",5,12],["In",5,13],["Sn",5,14],["Sb",5,15],["Te",5,16],["I",5,17],["Xe",5,18],
    // Period 6 (La placeholder in main table)
    ["Cs",6,1],["Ba",6,2],["La",6,3],["Hf",6,4],["Ta",6,5],["W",6,6],["Re",6,7],["Os",6,8],["Ir",6,9],["Pt",6,10],["Au",6,11],["Hg",6,12],["Tl",6,13],["Pb",6,14],["Bi",6,15],["Po",6,16],["At",6,17],["Rn",6,18],
    // Period 7 (Ac placeholder in main table)
    ["Fr",7,1],["Ra",7,2],["Ac",7,3],["Rf",7,4],["Db",7,5],["Sg",7,6],["Bh",7,7],["Hs",7,8],["Mt",7,9],["Ds",7,10],["Rg",7,11],["Cn",7,12],["Nh",7,13],["Fl",7,14],["Mc",7,15],["Lv",7,16],["Ts",7,17],["Og",7,18],
  ];

  // f-block shown as separate rows aligned under groups 4..17
  const LANTHANIDES = ["Ce","Pr","Nd","Pm","Sm","Eu","Gd","Tb","Dy","Ho","Er","Tm","Yb","Lu"]; // row 8
  const ACTINIDES   = ["Th","Pa","U","Np","Pu","Am","Cm","Bk","Cf","Es","Fm","Md","No","Lr"]; // row 9

  // Element names (lowercase) for name-counting
  const NAMES = new Map([
    ["H","hydrogen"],["He","helium"],["Li","lithium"],["Be","beryllium"],["B","boron"],["C","carbon"],["N","nitrogen"],["O","oxygen"],["F","fluorine"],["Ne","neon"],
    ["Na","sodium"],["Mg","magnesium"],["Al","aluminium"],["Si","silicon"],["P","phosphorus"],["S","sulfur"],["Cl","chlorine"],["Ar","argon"],
    ["K","potassium"],["Ca","calcium"],["Sc","scandium"],["Ti","titanium"],["V","vanadium"],["Cr","chromium"],["Mn","manganese"],["Fe","iron"],["Co","cobalt"],["Ni","nickel"],["Cu","copper"],["Zn","zinc"],
    ["Ga","gallium"],["Ge","germanium"],["As","arsenic"],["Se","selenium"],["Br","bromine"],["Kr","krypton"],
    ["Rb","rubidium"],["Sr","strontium"],["Y","yttrium"],["Zr","zirconium"],["Nb","niobium"],["Mo","molybdenum"],["Tc","technetium"],["Ru","ruthenium"],["Rh","rhodium"],["Pd","palladium"],["Ag","silver"],["Cd","cadmium"],
    ["In","indium"],["Sn","tin"],["Sb","antimony"],["Te","tellurium"],["I","iodine"],["Xe","xenon"],
    ["Cs","cesium"],["Ba","barium"],["La","lanthanum"],["Ce","cerium"],["Pr","praseodymium"],["Nd","neodymium"],["Pm","promethium"],["Sm","samarium"],["Eu","europium"],["Gd","gadolinium"],["Tb","terbium"],["Dy","dysprosium"],["Ho","holmium"],["Er","erbium"],["Tm","thulium"],["Yb","ytterbium"],["Lu","lutetium"],
    ["Hf","hafnium"],["Ta","tantalum"],["W","tungsten"],["Re","rhenium"],["Os","osmium"],["Ir","iridium"],["Pt","platinum"],["Au","gold"],["Hg","mercury"],["Tl","thallium"],["Pb","lead"],["Bi","bismuth"],["Po","polonium"],["At","astatine"],["Rn","radon"],
    ["Fr","francium"],["Ra","radium"],["Ac","actinium"],["Th","thorium"],["Pa","protactinium"],["U","uranium"],["Np","neptunium"],["Pu","plutonium"],["Am","americium"],["Cm","curium"],["Bk","berkelium"],["Cf","californium"],["Es","einsteinium"],["Fm","fermium"],["Md","mendelevium"],["No","nobelium"],["Lr","lawrencium"],
    ["Rf","rutherfordium"],["Db","dubnium"],["Sg","seaborgium"],["Bh","bohrium"],["Hs","hassium"],["Mt","meitnerium"],["Ds","darmstadtium"],["Rg","roentgenium"],["Cn","copernicium"],["Nh","nihonium"],["Fl","flerovium"],["Mc","moscovium"],["Lv","livermorium"],["Ts","tennessine"],["Og","oganesson"]
  ]);

  const ALL_SYMBOLS = new Set([
    ...POS.map(x => x[0]),
    ...LANTHANIDES,
    ...ACTINIDES
  ]);

  function escRe(s){ return s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"); }

  function countMatches(text, re) {
    let c = 0; re.lastIndex = 0;
    while (re.exec(text)) c++;
    return c;
  }

  function countElements(text) {
  const counts = new Map();
  let hay = String(text || "");

  // Helps with "UO 2" → "UO2"
  hay = hay.replace(/([A-Za-z])\s+(\d)/g, "$1$2");

  const ALL_SYMBOLS = new Set([
    ...POS.map(x => x[0]),
    ...LANTHANIDES,
    ...ACTINIDES
  ]);

  const escRe = s => s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");

  const add = (sym, inc = 1) => counts.set(sym, (counts.get(sym) || 0) + inc);

  // 1) Count element NAMES (safe, low-noise)
  for (const sym of ALL_SYMBOLS) {
    const name = NAMES.get(sym);
    if (!name) continue;
    const re = new RegExp(`\\b${escRe(name)}\\b`, "gi");
    const m = hay.match(re);
    if (m && m.length) add(sym, m.length);
  }

  // 2) Count multi-element FORMULAS like UO2, Fe2O3, NaCl (requires at least 2 symbols)
  // This avoids false hits like "Interaction" → "In"
  const formulaRe = /\b(?:[A-Z][a-z]?\d*){2,}\b/g;
  const formulas = hay.match(formulaRe) || [];
  for (const f of formulas) {
    // Extract each element symbol (ignore numbers)
    const parts = f.match(/[A-Z][a-z]?/g) || [];
    for (const sym of parts) {
      if (ALL_SYMBOLS.has(sym)) add(sym, 1); // count mention-per-formula occurrence
    }
  }

  // 3) Count selected standalone SYMBOLS (whitelist to avoid noise)
  const STANDALONE = ["U", "He"]; // add more if you want
  for (const sym of STANDALONE) {
    if (!ALL_SYMBOLS.has(sym)) continue;
    // token-ish match (won't match inside words)
    const re = new RegExp(`\\b${escRe(sym)}\\b`, "g");
    const m = hay.match(re);
    if (m && m.length) add(sym, m.length);
  }

  return counts;
}


  function bucketColor(n) {
    // 0 -> grey, 1 -> green, 2 -> yellow, 3 -> orange, 4+ -> red
    if (!n) return "c0";
    if (n === 1) return "c1";
    if (n === 2) return "c2";
    if (n === 3) return "c3";
    return "c4";
  }

  function makePanel() {
    let panel = document.getElementById("tm-ptable-panel");
    if (panel) return panel;

    panel = document.createElement("div");
    panel.id = "tm-ptable-panel";
    panel.style.cssText = `
      position: fixed; top: 16px; right: 16px;
      width: 980px; max-width: calc(100vw - 32px);
      z-index: 2147483647; background: #fff;
      border: 1px solid rgba(0,0,0,.2); border-radius: 14px;
      box-shadow: 0 12px 34px rgba(0,0,0,.28);
      padding: 10px 10px 12px;
      font: 12px/1.3 system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      overflow: auto;
    `;

    const style = document.createElement("style");
    style.textContent = `
      #tm-ptable { display: grid; grid-template-columns: repeat(18, 1fr); gap: 6px; }
      .tm-el {
        border: 1px solid rgba(0,0,0,.15);
        border-radius: 10px;
        padding: 8px 6px;
        min-height: 46px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        user-select: none;
      }
      .tm-sym { font-weight: 800; font-size: 14px; }
      .tm-name { font-size: 11px; opacity: .85; }
      .tm-count { margin-top: 4px; font-size: 11px; opacity: .85; }
      /* 0 grey, 1 green, 2 yellow, 3 orange, 4 red */
      .c0 { background: #f3f4f6; }
      .c1 { background: #86efac; }
      .c2 { background: #fde68a; }
      .c3 { background: #fdba74; }
      .c4 { background: #fca5a5; }
      #tm-legend { display:flex; gap:8px; align-items:center; flex-wrap: wrap; color:#333; }
      .tm-chip { display:flex; gap:6px; align-items:center; border:1px solid rgba(0,0,0,.12); border-radius:999px; padding:4px 8px; background:#fff; }
      .tm-dot { width:12px; height:12px; border-radius:999px; border:1px solid rgba(0,0,0,.15); }
      .tm-dot.c0{ background:#f3f4f6;} .tm-dot.c1{ background:#86efac;}
      .tm-dot.c2{ background:#fde68a;} .tm-dot.c3{ background:#fdba74;}
      .tm-dot.c4{ background:#fca5a5;}
    `;
    document.head.appendChild(style);

    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:8px;">
        <div style="font-weight:800;">Periodic table mention heatmap</div>
        <div style="display:flex;gap:6px;align-items:center;">
          <button id="tm-ptable-refresh" style="padding:6px 8px;border:1px solid #ddd;border-radius:10px;background:#f7f7f7;cursor:pointer;">Refresh</button>
          <button id="tm-ptable-close" style="padding:6px 10px;border:1px solid #ddd;border-radius:10px;background:#f7f7f7;cursor:pointer;">✕</button>
        </div>
      </div>

      <div id="tm-legend" style="margin-bottom:10px;">
        <span style="opacity:.85;">Mode: <b>${COUNT_MODE}</b> • Source: <code>${TABLE_SELECTOR}</code></span>
        <span class="tm-chip"><span class="tm-dot c0"></span>0</span>
        <span class="tm-chip"><span class="tm-dot c1"></span>1</span>
        <span class="tm-chip"><span class="tm-dot c2"></span>2</span>
        <span class="tm-chip"><span class="tm-dot c3"></span>3</span>
        <span class="tm-chip"><span class="tm-dot c4"></span>4+</span>
        <span id="tm-ptable-note" style="margin-left:auto;opacity:.85;"></span>
      </div>

      <div id="tm-ptable"></div>
    `;

    document.body.appendChild(panel);
    panel.querySelector("#tm-ptable-close").onclick = () => panel.remove();

    return panel;
  }

  function elementTileHTML(sym, period, group, count) {
    const name = NAMES.get(sym) || "";
    const cls = bucketColor(count);
    const title = `${sym}${name ? " – " + name : ""}\nMentions: ${count || 0}`;
    const gridRow = period;       // main table uses rows 1..7
    const gridCol = group;        // columns 1..18
    return `
      <div class="tm-el ${cls}" title="${title.replace(/"/g,'&quot;')}"
           style="grid-row:${gridRow};grid-column:${gridCol};">
        <div class="tm-sym">${sym}</div>
        ${COUNT_MODE === "names" && name ? `<div class="tm-name">${name}</div>` : ``}
        <div class="tm-count">× ${count || 0}</div>
      </div>
    `;
  }

  function fBlockTileHTML(sym, row, colStartIndex, idx, count) {
    const name = NAMES.get(sym) || "";
    const cls = bucketColor(count);
    const title = `${sym}${name ? " – " + name : ""}\nMentions: ${count || 0}`;
    // Align under groups 4..17 => col = 4 + idx
    const gridRow = row;
    const gridCol = colStartIndex + idx; // 4 + idx
    return `
      <div class="tm-el ${cls}" title="${title.replace(/"/g,'&quot;')}"
           style="grid-row:${gridRow};grid-column:${gridCol};">
        <div class="tm-sym">${sym}</div>
        ${COUNT_MODE === "names" && name ? `<div class="tm-name">${name}</div>` : ``}
        <div class="tm-count">× ${count || 0}</div>
      </div>
    `;
  }

  function render(counts) {
    const panel = makePanel();
    const note = panel.querySelector("#tm-ptable-note");
    const holder = panel.querySelector("#tm-ptable");

    // Build tiles
    let html = `<div id="tm-ptable" style="display:grid;grid-template-columns:repeat(18, 1fr);gap:6px;">`;

    for (const [sym, period, group] of POS) {
      html += elementTileHTML(sym, period, group, counts.get(sym) || 0);
    }

    // Add f-block rows 8 and 9
    // (row 8 = lanthanides, row 9 = actinides)
    const colStart = 4;
    LANTHANIDES.forEach((sym, i) => { html += fBlockTileHTML(sym, 8, colStart, i, counts.get(sym) || 0); });
    ACTINIDES.forEach((sym, i) => { html += fBlockTileHTML(sym, 9, colStart, i, counts.get(sym) || 0); });

    html += `</div>`;
    holder.outerHTML = html;

    const totalMentions = Array.from(counts.values()).reduce((a,b)=>a+b,0);
    const nonZero = Array.from(counts.entries()).filter(([,v])=>v>0).length;
    note.textContent = `Found ${totalMentions} mentions across ${nonZero} elements. Hover tiles for details.`;

    panel.querySelector("#tm-ptable-refresh").onclick = () => run();
  }

  function run() {
    const table = document.querySelector(TABLE_SELECTOR);
    if (!table) {
      const panel = makePanel();
      panel.querySelector("#tm-ptable-note").textContent = `No table found for selector: ${TABLE_SELECTOR}`;
      return;
    }
   const text = Array.from(table.querySelectorAll(TEXT_SELECTOR))
  .map(el => el.innerText || el.textContent || "")
  .join(" ");

    const counts = countElements(text);
    render(counts);
  }

  run();
})();
