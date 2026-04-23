import { renderResumenPanel, updateResumenPanel } from "./resumen.js";
import { renderVisitantesPanel, updateVisitantesPanel } from "./visitantes.js";
import { renderNodosPanel, updateNodosPanel } from "./nodos.js";
import { renderTecnicoPanel, updateTecnicoPanel } from "./tecnico.js";

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));

    tab.classList.add("active");
    document.getElementById("panel-" + tab.dataset.tab).classList.add("active");
  });
});

renderResumenPanel();
renderVisitantesPanel();
renderNodosPanel();
renderTecnicoPanel();

async function updateAll() {
  await updateResumenPanel();
  await updateVisitantesPanel();
  await updateNodosPanel();
  await updateTecnicoPanel();
}

updateAll();
setInterval(updateAll, 5000);