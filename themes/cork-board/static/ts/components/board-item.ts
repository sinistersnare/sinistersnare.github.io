class BoardItemEl extends HTMLElement {
  constructor() {
    super();
    // Apply styles directly for encapsulation
    this.style.display = "block";
    this.style.transition = "transform 0.2s ease-in-out, z-index 0s 0.1s";
  }

  connectedCallback() {
    // Generate a random rotation between -4 and 4 degrees
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
}
customElements.define("board-item", BoardItemEl);
