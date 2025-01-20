import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from './App';
import "./index.css";

// Add logging to debug mounting issues
const rootElement = document.getElementById("root");
console.log("Root element found:", rootElement);

if (!rootElement) {
  console.error("Failed to find root element - check if index.html has a div with id='root'");
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);
console.log("React root created successfully");

root.render(
  <StrictMode>
    <App/>
  </StrictMode>,
);
console.log("Initial render completed");