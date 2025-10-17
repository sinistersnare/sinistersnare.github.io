import { tackFill, buildTackSVG } from "../shared/tack";

class TackPinEl extends HTMLElement {
  static get observedAttributes() { return ["color"]; }

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
    const fill = tackFill(this.getAttribute("color"), "green");
    this.shadow.innerHTML = `
      <style>
        :host { position: absolute; top: -10px; left: 50%; transform: translateX(-50%); z-index: 10; display: block; }
        svg { width: 22px; height: 28px; filter: drop-shadow(0 3px 4px rgba(0,0,0,0.35)); }
      </style>
      ${buildTackSVG(fill)}
    `;
  }
}

customElements.define("tack-pin", TackPinEl);
