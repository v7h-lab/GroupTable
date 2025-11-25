
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Ensure body has gray background
document.body.style.backgroundColor = '#f9fafb';
document.documentElement.style.backgroundColor = '#f9fafb';

createRoot(document.getElementById("root")!).render(<App />);
