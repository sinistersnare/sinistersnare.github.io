import { tackFill, buildTackSVG } from "../shared/tack";

class CompactCardEl extends HTMLElement {
  static get observedAttributes() {
    return ["tack"];
  }

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
    const tackColor = tackFill(this.getAttribute("tack"), "purple");
    this.shadow.innerHTML = `
      <style>
        :host { display: inline-block; color: inherit; text-decoration: none; }
        .card {
          position: relative;
          width: 146px;
          background: #fff;
          border-radius: 8px;
          border: 1px solid rgba(0,0,0,0.08);
          box-shadow: 0 5px 12px rgba(0,0,0,0.14);
          padding: 12px 10px 14px 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .tack { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); }
        .tack svg { width: 18px; height: 26px; filter: drop-shadow(0 3px 4px rgba(0,0,0,0.35)); }

        .avatar {
          width: 58px; height: 58px;
          background: #eee;
          border: 1px solid #d0d0d0;
          border-radius: 8px;
          overflow: hidden;
          display: block;
        }
        ::slotted(img[slot="avatar"]) {
          width: 100%; height: 100%; object-fit: cover; display: block; border-radius: 8px;
        }

        .info { text-align: center; max-width: 100%; }
        .name {
          font-family: "Fleur De Leah", cursive;
          font-weight: 400;
          font-size: 1.25rem;
          line-height: 1.05;
          margin: 0;
          word-break: break-word;
        }
        .subtitle { font-size: 0.78rem; color: #555; margin-top: 2px; }

        @media (max-width: 480px) {
          .card { width: 132px; padding: 10px 8px 12px 8px; gap: 5px; }
          .avatar { width: 52px; height: 52px; }
          .name { font-size: 1.15rem; }
          .subtitle { font-size: 0.72rem; }
        }
        @media (max-width: 400px) {
          .card { width: 120px; padding: 8px 6px 10px 6px; gap: 4px; }
          .avatar { width: 48px; height: 48px; }
          .name { font-size: 1.05rem; }
          .subtitle { font-size: 0.68rem; }
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
}

customElements.define("compact-card", CompactCardEl);
