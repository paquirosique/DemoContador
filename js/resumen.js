import { fetchOverview, fetchTodaySummaries, buildOccupancySeries, getOccupancyStatus, MAX_CAPACITY } from "./api.js";

let occupancyChart = null;

export function renderResumenPanel() {
  const panel = document.getElementById("panel-resumen");

  panel.innerHTML = `
    <div class="summary-layout">

      <div class="kpi-card">
        <div class="kpi-top">
          <div class="occupancy-ring" id="occupancyRing">
            <div class="occupancy-ring-inner">
              <div class="occupancy-percent-big" id="occupancyPercentBig">0%</div>
              <div class="occupancy-status-big" id="occupancyStatusBig">Sin datos</div>
            </div>
          </div>
        </div>

        <div class="kpi-sections">
          <div class="kpi-row">
            <div>
              <div class="kpi-title">Ocupación actual</div>
              <div class="kpi-value" id="occupancyCurrent">0</div>
            </div>
            <div class="kpi-subvalue">personas</div>
          </div>

          <div class="kpi-row">
            <div>
              <div class="kpi-title">Visitantes totales acumulados</div>
              <div class="kpi-value" id="visitorsTotal">0</div>
            </div>
            <div class="kpi-subvalue">personas</div>
          </div>

          <div class="kpi-row">
            <div>
              <div class="kpi-title">Entradas</div>
              <div class="kpi-split">
                <div class="mini-box">
                  <div class="mini-title">Totales</div>
                  <div class="mini-value" id="entriesTotal">0</div>
                </div>
                <div class="mini-box">
                  <div class="mini-title">Actuales</div>
                  <div class="mini-value" id="entriesCurrent">0</div>
                </div>
              </div>
            </div>
          </div>

          <div class="kpi-row">
            <div>
              <div class="kpi-title">Salidas</div>
              <div class="kpi-split">
                <div class="mini-box">
                  <div class="mini-title">Totales</div>
                  <div class="mini-value" id="exitsTotal">0</div>
                </div>
                <div class="mini-box">
                  <div class="mini-title">Actuales</div>
                  <div class="mini-value" id="exitsCurrent">0</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <div>
            <div class="chart-title">Rendimiento diario</div>
            <div class="chart-subtitle">Histórico de ocupación</div>
          </div>
          <div class="toolbar">
            <button id="resetResumenZoom">Reset zoom</button>
          </div>
        </div>

        <div class="chart-canvas-wrap">
          <canvas id="occupancyChart"></canvas>
        </div>
      </div>

    </div>
  `;

  occupancyChart = new Chart(document.getElementById("occupancyChart"), {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "Ocupación",
        data: [],
        backgroundColor: "rgba(255,59,127,0.10)",
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.25,
        fill: false,
        segment: {
          borderColor: ctx => {
            const value = ctx.p1.parsed.y;
            const percent = (value / MAX_CAPACITY) * 100;
            if (percent < 40) return "#22c55e";
            if (percent < 70) return "#f59e0b";
            if (percent < 90) return "#f97316";
            return "#ef4444";
          }
        },
        pointBackgroundColor: ctx => {
          const value = ctx.raw;
          const percent = (value / MAX_CAPACITY) * 100;
          if (percent < 40) return "#22c55e";
          if (percent < 70) return "#f59e0b";
          if (percent < 90) return "#f97316";
          return "#ef4444";
        },
        pointBorderColor: ctx => {
          const value = ctx.raw;
          const percent = (value / MAX_CAPACITY) * 100;
          if (percent < 40) return "#22c55e";
          if (percent < 70) return "#f59e0b";
          if (percent < 90) return "#f97316";
          return "#ef4444";
        }
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: { display: false },
        zoom: {
          pan: { enabled: true, mode: "x" },
          zoom: {
            wheel: { enabled: true },
            pinch: { enabled: true },
            mode: "x"
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Ocupación" }
        }
      }
    }
  });

  document.getElementById("resetResumenZoom").addEventListener("click", () => {
    occupancyChart.resetZoom();
  });
}

export async function updateResumenPanel() {
  const [overview, summaries] = await Promise.all([
    fetchOverview(),
    fetchTodaySummaries()
  ]);

  const latestByNode = {};
  summaries.forEach(s => latestByNode[s.node_id] = s);

  let entriesCurrent = 0;
  let exitsCurrent = 0;

  Object.values(latestByNode).forEach(s => {
    entriesCurrent += Number(s.in_count);
    exitsCurrent += Number(s.out_count);
  });

  const occupancyCurrent = Number(overview.current_occupancy || 0);
  const occupancyPercent = Math.max(0, Math.min(100, Math.round((occupancyCurrent / MAX_CAPACITY) * 100)));
  const status = getOccupancyStatus(occupancyPercent);

  document.getElementById("occupancyPercentBig").innerText = occupancyPercent + "%";
  document.getElementById("occupancyStatusBig").innerText = status.text;
  document.getElementById("occupancyStatusBig").style.color = status.color;

  const ring = document.getElementById("occupancyRing");
  ring.style.borderColor = status.ring;
  ring.style.boxShadow = `0 0 0 4px ${status.ring}22`;

  document.getElementById("occupancyCurrent").innerText = occupancyCurrent;
  document.getElementById("visitorsTotal").innerText = overview.entries_today;
  document.getElementById("entriesTotal").innerText = overview.entries_today;
  document.getElementById("entriesCurrent").innerText = entriesCurrent;
  document.getElementById("exitsTotal").innerText = overview.exits_today;
  document.getElementById("exitsCurrent").innerText = exitsCurrent;

  occupancyChart.data.labels = summaries.map(s => new Date(s.timestamp).toLocaleTimeString());
  occupancyChart.data.datasets[0].data = buildOccupancySeries(summaries);
  occupancyChart.update();
}