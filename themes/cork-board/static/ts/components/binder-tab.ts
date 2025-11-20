import { tackFill, buildTackSVG } from "../shared/tack";

class BinderTabEl extends HTMLElement {
  static get observedAttributes() { return ["tack", "color"]; }

  private shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.render();
  }

  attributeChangedCallback() { this.render(); }

  private render() {
    const hasTack = this.hasAttribute("tack");
    const tackColor = tackFill(this.getAttribute("tack"), "yellow");
    const stickyColor = tackFill(this.getAttribute("color"), "yellow");
    // Simple luminance heuristic for text color contrast
    const rgb = stickyColor.replace("#", "");
    const r = parseInt(rgb.substring(0,2),16);
    const g = parseInt(rgb.substring(2,4),16);
    const b = parseInt(rgb.substring(4,6),16);
    const luminance = (0.299*r + 0.587*g + 0.114*b) / 255;
    const fgColor = luminance > 0.6 ? "#222" : "#fdfdfd";
    this.shadow.innerHTML = `
      <style>
        :host {
          display: block;
          width: 64px;
          min-height: 86px;
          color: black;
          --tab-fg: ${fgColor};
        }
        .wrap {
          position: relative;
        }
  .tack { z-index: 1; position: absolute; top: -0.8rem; left: 50%; transform: translateX(-50%); }
  .tack svg { width: 18px; height: 26px; filter: drop-shadow(0 3px 4px rgba(0,0,0,0.35)); }

        /* Sticky note flag body (vertical) */
        .sticky {
          position: relative;
          background: ${stickyColor};
          border-radius: 4px;
          box-shadow: 0 8px 14px rgba(0,0,0,0.18);
          padding: 0.4rem 0.4rem 0.55rem 0.4rem;
          min-height: 86px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        /* Adhesive shine strip */
        .sticky::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 6px;
          background: linear-gradient(180deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1));
          border-radius: 4px 4px 0 0;
          opacity: 0.8;
        }
        /* Triangle tip at the bottom for vertical flag */
        .sticky::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: -12px;
          transform: translateX(-50%);
          border-width: 12px 10px 0 10px;
          border-style: solid;
          border-color: ${stickyColor} transparent transparent transparent;
          filter: drop-shadow(0 3px 3px rgba(0,0,0,0.12));
        }
        :host(:hover) .sticky { box-shadow: 0 10px 18px rgba(0,0,0,0.22); }

        /* Content now provided by external anchor wrapping component */
  ::slotted(*) { color: var(--tab-fg); font-weight: 700; font-size: 0.85rem; line-height: 1.15; }

        /* Even more compact on narrow screens */
        @media (max-width: 480px) {
          :host { width: 58px; min-height: 78px; }
          .sticky { min-height: 78px; padding: 0.35rem 0.35rem 0.5rem 0.35rem; }
          .tack { top: -0.65rem; }
          .tack svg { width: 15px; height: 22px; }
          ::slotted(*) { font-size: 0.78rem; }
        }
        @media (max-width: 400px) {
          :host { width: 54px; min-height: 72px; }
          .sticky { min-height: 72px; padding: 0.3rem 0.3rem 0.45rem 0.3rem; }
          ::slotted(*) { font-size: 0.72rem; }
        }
      </style>
      <div class="wrap">
        ${hasTack ? `<span class="tack" aria-hidden="true">${buildTackSVG(tackColor)}</span>` : ""}
        <div class="sticky" part="sticky">
          <slot></slot>
        </div>
      </div>
    `;
  }
}

customElements.define("binder-tab", BinderTabEl);
