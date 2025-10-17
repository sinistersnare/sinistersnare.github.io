import { tackFill, buildTackSVG } from "../shared/tack";

/**
 * <tack-scatter> renders a few decorative tacks around the edges of
 * its box (like real corkboard pins). It does not intercept clicks on the host,
 * only on the pins themselves. Use it as a child
 * inside the corkboard surface for ambient decor.
 *
 * Attributes:
 * - count: number of tacks (default 3)
 * - max: optional upper bound for count (default 24)
 * - colors: comma-separated list from the tack color map (e.g., "red,blue")
 * - seed: optional integer for deterministic positions
 * - placement: "edge" (default) or "random"
 * - inset: percent inset from the container edge (default 2.5)
 * - jitter: percent jitter along the edge direction (default 2)
 * - distribute: "even" (default) or "random" along the perimeter
 */
class TackScatterEl extends HTMLElement {
  private shadow: ShadowRoot;
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() { return ["count", "max", "colors", "seed", "layer", "placement", "inset", "jitter", "distribute"]; }

  connectedCallback() { this.render(); }
  attributeChangedCallback() { this.render(); }

  private seededRandom(seed: number) {
    // Simple LCG for determinism
    let s = seed >>> 0;
    return () => {
      s = (1664525 * s + 1013904223) >>> 0;
      return s / 0xffffffff;
    };
  }

  private render() {
    const max = Math.max(1, parseInt(this.getAttribute("max") || "24", 10) || 24);
    const count = Math.max(1, Math.min(max, parseInt(this.getAttribute("count") || "3", 10) || 3));
    const colorList = (this.getAttribute("colors") || "red,blue,green,yellow,purple")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
    const seedAttr = this.getAttribute("seed");
    const rand = seedAttr ? this.seededRandom(parseInt(seedAttr, 10) || 1) : Math.random;

    const placement = (this.getAttribute("placement") || "edge").toLowerCase();
    const insetPct = Math.max(0, Math.min(10, parseFloat(this.getAttribute("inset") || "2.5")));
    const jitterPct = Math.max(0, Math.min(20, parseFloat(this.getAttribute("jitter") || "2")));
    const distribute = (this.getAttribute("distribute") || "even").toLowerCase();

    const map = (val: number, inMin: number, inMax: number, outMin: number, outMax: number) =>
      outMin + (outMax - outMin) * ((val - inMin) / (inMax - inMin));

    const makeEdgePoint = (t: number) => {
      // t in [0,1): walk perimeter: top (L->R), right (T->B), bottom (R->L), left (B->T)
      const inset = insetPct;
      const innerMin = inset;
      const innerMax = 100 - inset;
      const seg = t * 4;
      const segIdx = Math.floor(seg);
      const segT = seg - segIdx;
      const jitter = (rand() - 0.5) * 2 * jitterPct;
      let x = 50, y = 50;
      if (segIdx === 0) { x = map(segT, 0, 1, innerMin, innerMax) + jitter; y = innerMin; }
      else if (segIdx === 1) { x = innerMax; y = map(segT, 0, 1, innerMin, innerMax) + jitter; }
      else if (segIdx === 2) { x = map(segT, 0, 1, innerMax, innerMin) + jitter; y = innerMax; }
      else { x = innerMin; y = map(segT, 0, 1, innerMax, innerMin) + jitter; }
      x = Math.max(innerMin, Math.min(innerMax, x));
      y = Math.max(innerMin, Math.min(innerMax, y));
      return { x, y };
    };

    const pins = Array.from({ length: count }).map((_, i) => {
      let x: number, y: number;
      if (placement === "edge") {
        const t = distribute === "even" ? (i + 0.5) / count : rand();
        const pt = makeEdgePoint(t);
        x = pt.x; y = pt.y;
      } else {
        x = 8 + rand() * 84; // margin from edges
        y = 6 + rand() * 88;
      }
      const rot = (rand() - 0.5) * 18; // small rotation
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

    // Add click-to-reposition handlers on each pin
    const pinsEls = this.shadow.querySelectorAll<HTMLElement>(".pin");
    pinsEls.forEach((el) => {
      el.addEventListener("click", (ev) => {
        ev.stopPropagation();
        // Reposition this one pin respecting placement
        let x: number, y: number;
        if ((this.getAttribute("placement") || "edge").toLowerCase() === "edge") {
          const t = rand();
          const pt = makeEdgePoint(t);
          x = pt.x; y = pt.y;
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
}

customElements.define("tack-scatter", TackScatterEl);
