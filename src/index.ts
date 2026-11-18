import "./card/cumulative-comparison-chart";
import { buildEntitySuggestion } from "./card/picker-preview";

window.customCards = window.customCards ?? [];
window.customCards.push({
  type: "energy-horizon-card",
  name: "Energy Horizon",
  description:
    "Visualize energy consumption by comparing current and reference period trends.",
  preview: true,
  documentationURL: "https://github.com/hello-sebastian/Energy-Horizon",
  // Suggest the card in the "By entity" view for entities with a supported
  // unit (kWh/Wh/MWh/m³/l). Synchronous, total, non-throwing (research R1).
  getEntitySuggestion: (hass, entityId) => buildEntitySuggestion(hass, entityId)
});

