import { tackFill, buildTackSVG } from "../shared/tack";

class ProfileCardEl extends HTMLElement {
  static get observedAttributes() { return ["tack"]; }

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
}

customElements.define("profile-card", ProfileCardEl);
