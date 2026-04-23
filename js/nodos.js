import { fetchTodaySummaries } from "./api.js";

function getNodeStatusClass(status) {
  if (status === "online") return "status-online";
  if (status === "warning") return "status-warning";
  return "status-offline";
}

function buildNodeStats(summaries) {
  const nodes = {};

  summaries.forEach(s => {
    if (!nodes[s.node_id]) {
      nodes[s.node_id] = {
        node_id: s.node_id,
        entries_total: 0,
        exits_total: 0,
        entries_current: 0,
        exits_current: 0,
        occupancy_estimated: 0,
        status: s.status || "online",
        refresh_rate: s.refresh_rate ?? "-",
        device_temp: s.device_temp ?? "-",
        latency_ms: s.latency_ms ?? "-"
      };
    }

    nodes[s.node_id].entries_total += Number(s.in_count);
    nodes[s.node_id].exits_total += Number(s.out_count);
    nodes[s.node_id].occupancy_estimated += Number(s.in_count) - Number(s.out_count);

    nodes[s.node_id].entries_current = Number(s.in_count);
    nodes[s.node_id].exits_current = Number(s.out_count);
    nodes[s.node_id].status = s.status || "online";
    nodes[s.node_id].refresh_rate = s.refresh_rate ?? "-";
    nodes[s.node_id].device_temp = s.device_temp ?? "-";
    nodes[s.node_id].latency_ms = s.latency_ms ?? "-";
  });

  Object.values(nodes).forEach(node => {
    if (node.occupancy_estimated < 0) node.occupancy_estimated = 0;
  });

  return Object.values(nodes).sort((a, b) => a.node_id.localeCompare(b.node_id));
}

export function renderNodosPanel() {
  const panel = document.getElementById("panel-nodos");

  panel.innerHTML = `
    <div class="nodes-grid" id="nodesGrid"></div>
  `;
}

export async function updateNodosPanel() {
  const grid = document.getElementById("nodesGrid");
  if (!grid) return;

  try {
    const summaries = await fetchTodaySummaries();
    const nodeStats = buildNodeStats(summaries);

    if (!nodeStats.length) {
      grid.innerHTML = `<div class="placeholder">No hay datos de nodos todavía.</div>`;
      return;
    }

    grid.innerHTML = "";

    nodeStats.forEach(node => {
      const card = document.createElement("div");
      card.className = "node-card";

      card.innerHTML = `
        <div class="node-header">
          <div class="node-name">${node.node_id}</div>
          <div class="node-status ${getNodeStatusClass(node.status)}">${node.status}</div>
        </div>

        <div class="node-kpis">
          <div class="node-mini">
            <div class="node-mini-title">Entradas totales</div>
            <div class="node-mini-value">${node.entries_total}</div>
          </div>

          <div class="node-mini">
            <div class="node-mini-title">Entradas actuales</div>
            <div class="node-mini-value">${node.entries_current}</div>
          </div>

          <div class="node-mini">
            <div class="node-mini-title">Salidas totales</div>
            <div class="node-mini-value">${node.exits_total}</div>
          </div>

          <div class="node-mini">
            <div class="node-mini-title">Salidas actuales</div>
            <div class="node-mini-value">${node.exits_current}</div>
          </div>
        </div>

        <div class="node-section-title">Resumen</div>
        <div class="node-detail-row">
          <div>Ocupación estimada</div>
          <div><strong>${node.occupancy_estimated}</strong></div>
        </div>

        <div class="node-section-title">Estado técnico</div>
        <div class="node-detail-row">
          <div>Temperatura</div>
          <div>${node.device_temp}</div>
        </div>
        <div class="node-detail-row">
          <div>FPS / Refresh rate</div>
          <div>${node.refresh_rate}</div>
        </div>
        <div class="node-detail-row">
          <div>Latencia (ms)</div>
          <div>${node.latency_ms}</div>
        </div>
      `;

      grid.appendChild(card);
    });
  } catch (error) {
    console.error("Error cargando nodos:", error);
    grid.innerHTML = `<div class="placeholder">Error cargando nodos.</div>`;
  }
}