import { tackFill, buildTackSVG } from "../shared/tack";

class PolaroidCardEl extends HTMLElement {
  static get observedAttributes() { return ["pin", "tack"]; }

  private shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  private render() {
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
}

customElements.define("polaroid-card", PolaroidCardEl);
