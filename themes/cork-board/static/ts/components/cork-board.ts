class CorkBoardEl extends HTMLElement {
  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.innerHTML = `
      <style>
        :host { display: block; position: relative; z-index: 1; min-height: 90vh; }
        .container {
          display: flex;
          flex-wrap: wrap;
          gap: 100px; /* Increased gap for better spacing */
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
}
customElements.define("cork-board", CorkBoardEl);

