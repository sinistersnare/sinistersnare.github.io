// Import and register the web components
import "./components/cork-board.ts";
import "./components/board-item.ts";
import "./components/polaroid-card.ts";
import "./components/note-paper.ts";
import "./components/tack-pin.ts";
import "./components/profile-card.ts";
import "./components/tack-scatter.ts";

// Add the htmx type definitions for TypeScript
declare const htmx: any;

document.body.addEventListener("htmx:beforeRequest", (event: any) => {
  // Prevent the actual HTTP request
  event.preventDefault();

  const requestedPath = event.detail.pathInfo.path;
  let responseHTML = "";

  // Client-side router to generate content
  switch (requestedPath) {
    case "/about":
      responseHTML = `
                <div class="content-wrapper">
                    <button class="close-btn" onclick="htmx.find('#content-pane').innerHTML=''">×</button>
                    <h2>About Me</h2>
                    <p>This is where the detailed about me section would go...</p>
                </div>`;
      break;
    case "/portfolio":
      responseHTML = `
                <div class="content-wrapper">
                    <button class="close-btn" onclick="htmx.find('#content-pane').innerHTML=''">×</button>
                    <h2>My Portfolio</h2>
                    <p>Here I would list my projects, including the data visualization platform built with React and @finos/perspective.</p>
                </div>`;
      break;
    case "/club":
      responseHTML = `
                <div class="content-wrapper">
                    <button class="close-btn" onclick="htmx.find('#content-pane').innerHTML=''">×</button>
                    <h2>The Independent Labor Club</h2>
                    <p>Details about the club's founding, mission, and upcoming events.</p>
                </div>`;
      break;
    default:
      responseHTML = `
                <div class="content-wrapper">
                    <button class="close-btn" onclick="htmx.find('#content-pane').innerHTML=''">×</button>
                    <h2>Not Found</h2>
                </div>`;
  }

  // Manually swap into the content pane
  const target = event.detail.target as HTMLElement | null;
  if (target) {
    target.innerHTML = responseHTML;
    // Let htmx scan/process any new content if needed
    if (typeof (htmx as any)?.process === "function") {
      (htmx as any).process(target);
    }
  }
});
