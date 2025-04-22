import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { LocationProvider } from "./contexts/LocationContext";

createRoot(document.getElementById("root")!).render(
  <LocationProvider>
    <App />
  </LocationProvider>
);
