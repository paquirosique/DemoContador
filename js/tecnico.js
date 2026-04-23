export function renderTecnicoPanel() {
  const panel = document.getElementById("panel-tecnico");
  if (!panel) return;

  panel.innerHTML = `
    <div class="placeholder">
      Aquí añadiremos la vista técnica.
    </div>
  `;
}

export async function updateTecnicoPanel() {
  // De momento vacío
}