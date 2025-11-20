class CorkBoardEl extends HTMLElement {
  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.innerHTML = `
      <style>
        :host { display: block; position: relative; z-index: 1; }
        .container {
          display: flex;
          flex-wrap: wrap;
          gap: 100px; /* Increased gap for better spacing */
          justify-content: center;
          align-items: space-around;
        }

        /* Inline header mode: compact, single-row, scrollable on overflow */
        :host([mode="inline"]) .container {
          gap: 10px;
          flex-wrap: nowrap;
          align-items: center;
          justify-content: center; /* center items */
          padding: 6px 8px;
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

        /* Do NOT scale the inline header mode; keep natural size */
        @media (max-width: 768px) {
          :host([mode="inline"]) .container { transform: none; padding: 6px 8px; gap: 8px; }
        }
        @media (max-width: 480px) {
          :host([mode="inline"]) .container { transform: none; padding: 4px 6px; gap: 6px; }
        }
      </style>
      <div class="container">
        <slot></slot>
      </div>
    `;
  }
}
customElements.define("cork-board", CorkBoardEl);

