import { tackFill, buildTackSVG } from "../shared/tack";

class NotePaperEl extends HTMLElement {
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

  private render() {
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
      ${isSheet
        ? `background: linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,240,0.98));
           border-radius: 6px;
           border: 1px solid rgba(0,0,0,0.08);
           /* ruled lines */
           background-image:
             linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,240,0.98)),
             repeating-linear-gradient(180deg, transparent 0 22px, rgba(0,0,0,0.06) 22px 23px);
           background-blend-mode: normal;
           background-size: 100% 100%, 100% 23px;`
        : `background-color: #fdf5e6;
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
}
customElements.define("note-paper", NotePaperEl);
