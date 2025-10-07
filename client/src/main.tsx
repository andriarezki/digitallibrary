import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Configure Chart.js fonts globally before any charts are rendered
import { Chart as ChartJS } from 'chart.js';

// Set Poppins as default font for all Chart.js elements
ChartJS.defaults.font.family = 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif';
ChartJS.defaults.font.size = 12;
ChartJS.defaults.font.weight = 500;
ChartJS.defaults.color = 'rgb(71, 85, 105)'; // slate-600

createRoot(document.getElementById("root")!).render(<App />);
