// themes/cork-board/static/ts/components/cork-board.ts
var CorkBoardEl = class extends HTMLElement {
  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.innerHTML = `
      <style>
        :host { display: block; position: relative; z-index: 1; }
        .container {
          display: flex;
          flex-wrap: wrap;
          gap: 40px; /* Increased gap for better spacing */
          justify-content: center;
          align-items: space-around;
          padding: 3rem;
        }

        /* Responsive scale-down to preserve visible frame edges */
        @media (max-width: 768px) {
          .container { padding: 2rem 1rem; gap: 28px; }
          :host { display: block; }
          .container { transform: scale(0.92); transform-origin: top center; }
        }
        @media (max-width: 480px) {
          .container { padding: 1.25rem 0.5rem; gap: 20px; }
          .container { transform: scale(0.86); }
        }
      </style>
      <div class="container">
        <slot></slot>
      </div>
    `;
  }
};
customElements.define("cork-board", CorkBoardEl);

// themes/cork-board/static/ts/components/board-item.ts
var BoardItemEl = class extends HTMLElement {
  constructor() {
    super();
    this.style.display = "block";
    this.style.transition = "transform 0.2s ease-in-out, z-index 0s 0.1s";
  }
  connectedCallback() {
    const randomRotation = Math.random() * 8 - 4;
    this.style.transform = `rotate(${randomRotation}deg)`;
    this.addEventListener("mouseenter", () => {
      this.style.transform = `rotate(${randomRotation}deg) scale(1.05) translateY(-5px)`;
      this.style.zIndex = "10";
    });
    this.addEventListener("mouseleave", () => {
      this.style.transform = `rotate(${randomRotation}deg) scale(1)`;
      this.style.zIndex = "1";
    });
  }
};
customElements.define("board-item", BoardItemEl);

// themes/cork-board/static/ts/shared/tack.ts
var TACK_COLOR_MAP = {
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  yellow: "#eab308",
  purple: "#a855f7"
};
function tackFill(color, defaultColor = "green") {
  const key = (color || "").toLowerCase();
  return TACK_COLOR_MAP[key] || TACK_COLOR_MAP[defaultColor];
}
function buildTackSVG(fill, className) {
  const cls = className ? ` class="${className}"` : "";
  return `
    <svg${cls} viewBox="0 0 24 28" aria-hidden="true">
      <g>
        <!-- head -->
        <circle cx="12" cy="8" r="6" fill="${fill}" />
        <!-- rim highlight -->
        <circle cx="12" cy="8" r="6.8" fill="none" stroke="rgba(0,0,0,0.18)" stroke-width="0.8" />
        <!-- neck -->
        <rect x="10" y="13.2" width="4" height="3.2" rx="1.2" fill="${fill}" />
        <!-- needle (slight gradient via stroke opacity) -->
        <path d="M12 16.4 L12 26" stroke="#9aa1a8" stroke-width="1.4" stroke-linecap="round" />
        <path d="M12 16.4 L12 26" stroke="#6b7280" stroke-width="0.6" stroke-linecap="round" />
      </g>
    </svg>
  `;
}

// themes/cork-board/static/ts/components/polaroid-card.ts
var PolaroidCardEl = class extends HTMLElement {
  static get observedAttributes() {
    return ["pin", "tack"];
  }
  shadow;
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.render();
  }
  attributeChangedCallback() {
    this.render();
  }
  render() {
    const pin = (this.getAttribute("pin") || "top").toLowerCase();
    const showPin = pin !== "none";
    const tackColor = tackFill(this.getAttribute("tack"), "red");
    this.shadow.innerHTML = `
      <style>
        :host {
          display: block;
          width: 220px;
          color: inherit;
          text-decoration: none;
          will-change: transform;
        }
        .frame {
          background: #fff;
          border-radius: 6px;
          box-shadow: 0 8px 16px rgba(0,0,0,0.15);
          padding: 12px 12px 48px 12px;
          position: relative;
        }
        .tack { position: absolute; top: -8px; left: 50%; transform: translateX(-50%); display: ${showPin ? "block" : "none"}; }
        .tack svg { width: 18px; height: 26px; filter: drop-shadow(0 3px 3px rgba(0,0,0,0.3)); }
        .image {
          width: 100%;
          height: 160px;
          background: #e8e8e8;
          border: 1px solid #d0d0d0;
          display: block;
          overflow: hidden;
        }
        ::slotted(img[slot="image"]) {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .caption {
          margin-top: 12px;
          text-align: center;
          font-family: 'Courier New', monospace;
          font-size: 1rem;
          color: #222;
        }
      </style>
      <div class="frame">
        <span class="tack" aria-hidden="true">${buildTackSVG(tackColor)}</span>
        <div class="image">
          <slot name="image"></slot>
        </div>
        <div class="caption">
          <slot name="caption"></slot>
        </div>
      </div>
    `;
  }
};
customElements.define("polaroid-card", PolaroidCardEl);

// themes/cork-board/static/ts/components/note-paper.ts
var NotePaperEl = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  static get observedAttributes() {
    return ["thumbtack", "variant"];
  }
  connectedCallback() {
    this.render();
  }
  attributeChangedCallback() {
    this.render();
  }
  render() {
    const tackType = this.getAttribute("thumbtack") || "green";
    const variant = (this.getAttribute("variant") || "note").toLowerCase();
    const fill = tackFill(tackType, "green");
    const tackSVG = buildTackSVG(fill, "tack");
    if (!this.shadowRoot) return;
    const isSheet = variant === "sheet";
    const hostBase = `
      display: block;
      position: relative;
      padding: 2.5rem 1.5rem 1.5rem 1.5rem;
      box-shadow: 0 4px 10px rgba(0,0,0,0.2);
      width: ${isSheet ? "320px" : "280px"};
      ${isSheet ? `background: linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,240,0.98));
           border-radius: 6px;
           border: 1px solid rgba(0,0,0,0.08);
           /* ruled lines */
           background-image:
             linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,240,0.98)),
             repeating-linear-gradient(180deg, transparent 0 22px, rgba(0,0,0,0.06) 22px 23px);
           background-blend-mode: normal;
           background-size: 100% 100%, 100% 23px;` : `background-color: #fdf5e6;
           /* torn edge */
           clip-path: polygon(0% 0%, 100% 0%, 100% 85%, 95% 100%, 0% 95%);`}
    `;
    this.shadowRoot.innerHTML = `
      <style>
        :host { ${hostBase} }
        .tack {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 22px;
          height: 28px;
          z-index: 10;
          filter: drop-shadow(0 3px 4px rgba(0,0,0,0.35));
        }
        .content {
          font-family: 'Courier New', monospace, sans-serif;
          color: #333;
        }
        ::slotted(h3) {
          margin-top: 0;
          font-size: 1.35rem;
          border-bottom: 1px solid #ddd;
          padding-bottom: 0.5rem;
        }
        ::slotted(ul) {
          padding-left: 1.2rem;
          line-height: 1.6;
          margin: 0.25rem 0 0;
        }
        ::slotted(li) { margin: 0.1rem 0; }
        ::slotted(a) { color: inherit; text-decoration: none; }
        ::slotted(a:hover) { text-decoration: underline; }
      </style>
      ${tackSVG}
      <div class="content">
        <slot></slot>
      </div>
    `;
  }
};
customElements.define("note-paper", NotePaperEl);

// themes/cork-board/static/ts/components/tack-pin.ts
var TackPinEl = class extends HTMLElement {
  static get observedAttributes() {
    return ["color"];
  }
  shadow;
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.render();
  }
  attributeChangedCallback() {
    this.render();
  }
  render() {
    const fill = tackFill(this.getAttribute("color"), "green");
    this.shadow.innerHTML = `
      <style>
        :host { position: absolute; top: -10px; left: 50%; transform: translateX(-50%); z-index: 10; display: block; }
        svg { width: 22px; height: 28px; filter: drop-shadow(0 3px 4px rgba(0,0,0,0.35)); }
      </style>
      ${buildTackSVG(fill)}
    `;
  }
};
customElements.define("tack-pin", TackPinEl);

// themes/cork-board/static/ts/components/profile-card.ts
var ProfileCardEl = class extends HTMLElement {
  static get observedAttributes() {
    return ["tack"];
  }
  shadow;
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.render();
  }
  attributeChangedCallback() {
    this.render();
  }
  render() {
    const tackColor = tackFill(this.getAttribute("tack"), "red");
    this.shadow.innerHTML = `
      <style>
        :host { display: block; width: 340px; color: inherit; text-decoration: none; }
        .card {
          position: relative;
          background: #fff;
          border-radius: 8px;
          border: 1px solid rgba(0,0,0,0.08);
          box-shadow: 0 8px 16px rgba(0,0,0,0.15);
          padding: 16px 16px 18px 16px;
          display: grid;
          grid-template-columns: 100px 1fr;
          grid-gap: 14px;
        }
        .tack { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); }
          .tack svg { width: 20px; height: 28px; filter: drop-shadow(0 3px 4px rgba(0,0,0,0.35)); }

        .avatar {
          width: 100px; height: 100px;
          background: #eee;
          border: 1px solid #d0d0d0;
          border-radius: 6px;
          display: block;
        }
        ::slotted(img[slot="avatar"]) { width: 100%; height: 100%; object-fit: cover; display: block; border-radius: 6px; }

        .info { display: flex; flex-direction: column; justify-content: center; }
        .name { font-family: "Fleur De Leah", cursive; font-weight: 400; font-size: 2rem; line-height: 1.1; margin: 0 0 0.25rem 0; }
        .subtitle { font-size: 0.95rem; color: #555; }

        @media (max-width: 480px) {
          :host { width: 300px; }
          .card { grid-template-columns: 84px 1fr; }
          .avatar { width: 84px; height: 84px; }
          .name { font-size: 1.75rem; }
        }
      </style>
      <div class="card">
        <span class="tack" aria-hidden="true">${buildTackSVG(tackColor)}</span>
        <div class="avatar">
          <slot name="avatar"></slot>
        </div>
        <div class="info">
          <div class="name"><slot name="name"></slot></div>
          <div class="subtitle"><slot name="subtitle"></slot></div>
        </div>
      </div>
    `;
  }
};
customElements.define("profile-card", ProfileCardEl);

// themes/cork-board/static/ts/components/tack-scatter.ts
var TackScatterEl = class extends HTMLElement {
  shadow;
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }
  static get observedAttributes() {
    return ["count", "max", "colors", "seed", "layer", "placement", "inset", "jitter", "distribute"];
  }
  connectedCallback() {
    this.render();
  }
  attributeChangedCallback() {
    this.render();
  }
  seededRandom(seed) {
    let s = seed >>> 0;
    return () => {
      s = 1664525 * s + 1013904223 >>> 0;
      return s / 4294967295;
    };
  }
  render() {
    const max = Math.max(1, parseInt(this.getAttribute("max") || "24", 10) || 24);
    const count = Math.max(1, Math.min(max, parseInt(this.getAttribute("count") || "3", 10) || 3));
    const colorList = (this.getAttribute("colors") || "red,blue,green,yellow,purple").split(",").map((s) => s.trim()).filter(Boolean);
    const seedAttr = this.getAttribute("seed");
    const rand = seedAttr ? this.seededRandom(parseInt(seedAttr, 10) || 1) : Math.random;
    const placement = (this.getAttribute("placement") || "edge").toLowerCase();
    const insetPct = Math.max(0, Math.min(10, parseFloat(this.getAttribute("inset") || "2.5")));
    const jitterPct = Math.max(0, Math.min(20, parseFloat(this.getAttribute("jitter") || "2")));
    const distribute = (this.getAttribute("distribute") || "even").toLowerCase();
    const map = (val, inMin, inMax, outMin, outMax) => outMin + (outMax - outMin) * ((val - inMin) / (inMax - inMin));
    const makeEdgePoint = (t) => {
      const inset = insetPct;
      const innerMin = inset;
      const innerMax = 100 - inset;
      const seg = t * 4;
      const segIdx = Math.floor(seg);
      const segT = seg - segIdx;
      const jitter = (rand() - 0.5) * 2 * jitterPct;
      let x = 50, y = 50;
      if (segIdx === 0) {
        x = map(segT, 0, 1, innerMin, innerMax) + jitter;
        y = innerMin;
      } else if (segIdx === 1) {
        x = innerMax;
        y = map(segT, 0, 1, innerMin, innerMax) + jitter;
      } else if (segIdx === 2) {
        x = map(segT, 0, 1, innerMax, innerMin) + jitter;
        y = innerMax;
      } else {
        x = innerMin;
        y = map(segT, 0, 1, innerMax, innerMin) + jitter;
      }
      x = Math.max(innerMin, Math.min(innerMax, x));
      y = Math.max(innerMin, Math.min(innerMax, y));
      return { x, y };
    };
    const pins = Array.from({ length: count }).map((_, i) => {
      let x, y;
      if (placement === "edge") {
        const t = distribute === "even" ? (i + 0.5) / count : rand();
        const pt = makeEdgePoint(t);
        x = pt.x;
        y = pt.y;
      } else {
        x = 8 + rand() * 84;
        y = 6 + rand() * 88;
      }
      const rot = (rand() - 0.5) * 18;
      const color = colorList[Math.floor(rand() * colorList.length)] || "green";
      const fill = tackFill(color, "green");
      const svg = buildTackSVG(fill);
      return `<div class="pin" style="left:${x}%; top:${y}%; transform: translate(-50%, -50%) rotate(${rot}deg);">${svg}</div>`;
    }).join("");
    this.shadow.innerHTML = `
      <style>
        /* Default: sit under the board content */
        :host { position: absolute; inset: 0; pointer-events: none; display: block; z-index: 0; }
        /* Opt-in to layer above by setting layer="over" */
        :host([layer="over"]) { z-index: 1000; }
        :host([layer="under"]) { z-index: 0; }
        .pin { position: absolute; filter: drop-shadow(0 3px 4px rgba(0,0,0,0.35)); pointer-events: auto; }
        .pin svg { width: 18px; height: 26px; }
      </style>
      ${pins}
    `;
    const pinsEls = this.shadow.querySelectorAll(".pin");
    pinsEls.forEach((el) => {
      el.addEventListener("click", (ev) => {
        ev.stopPropagation();
        let x, y;
        if ((this.getAttribute("placement") || "edge").toLowerCase() === "edge") {
          const t = rand();
          const pt = makeEdgePoint(t);
          x = pt.x;
          y = pt.y;
        } else {
          x = 8 + rand() * 84;
          y = 6 + rand() * 88;
        }
        const rot = (rand() - 0.5) * 18;
        el.style.left = `${x}%`;
        el.style.top = `${y}%`;
        el.style.transform = `translate(-50%, -50%) rotate(${rot}deg)`;
      }, { passive: true });
    });
  }
};
customElements.define("tack-scatter", TackScatterEl);
//# sourceMappingURL=bundle.js.map
