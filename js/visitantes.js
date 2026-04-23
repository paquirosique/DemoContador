import { fetchOverview, fetchTodaySummaries, buildOccupancySeries } from "./api.js";

let visitorsChart = null;

export function renderVisitantesPanel() {
  const panel = document.getElementById("panel-visitantes");

  panel.innerHTML = `
    <div class="visitors-layout">

      <div class="visitors-side">
        <div class="visitor-big-card">
          <div class="visitor-big-number" id="visitorsOccupancyNow">0</div>
          <div class="visitor-big-label">people</div>
          <div class="visitor-big-subtitle">Current Occupancy</div>
        </div>

        <div class="visitor-big-card secondary">
          <div class="visitor-big-number" id="visitorsOccupancyTotal">0</div>
          <div class="visitor-big-label">people</div>
          <div class="visitor-big-subtitle">Total Visitors</div>
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <div>
            <div class="chart-title">Visitor Counts</div>
            <div class="chart-subtitle">Occupancy history</div>
          </div>
          <div class="toolbar">
            <button id="resetVisitorsZoom">Reset zoom</button>
          </div>
        </div>

        <div class="chart-canvas-wrap">
          <canvas id="visitorsChart"></canvas>
        </div>
      </div>

    </div>
  `;

  visitorsChart = new Chart(document.getElementById("visitorsChart"), {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "Occupancy",
        data: [],
        borderColor: "#49c5b6",
        backgroundColor: "rgba(73, 197, 182, 0.35)",
        fill: true,
        tension: 0.42,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: {
          display: false
        },
        zoom: {
          pan: {
            enabled: true,
            mode: "x"
          },
          zoom: {
            wheel: {
              enabled: true
            },
            pinch: {
              enabled: true
            },
            mode: "x"
          }
        },
        tooltip: {
          backgroundColor: "rgba(31,41,55,0.95)",
          titleColor: "#fff",
          bodyColor: "#fff",
          displayColors: false
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: "#6b7280",
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 8
          },
          border: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(107,114,128,0.15)"
          },
          ticks: {
            color: "#6b7280"
          },
          border: {
            display: false
          },
          title: {
            display: true,
            text: "No. of visitors",
            color: "#6b7280",
            font: {
              size: 12,
              weight: "normal"
            }
          }
        }
      }
    }
  });

  document.getElementById("resetVisitorsZoom").addEventListener("click", () => {
    visitorsChart.resetZoom();
  });
}

export async function updateVisitantesPanel() {
  const [overview, summaries] = await Promise.all([
    fetchOverview(),
    fetchTodaySummaries()
  ]);

  document.getElementById("visitorsOccupancyNow").innerText = overview.current_occupancy;
  document.getElementById("visitorsOccupancyTotal").innerText = overview.entries_today;

  const occupancySeries = buildOccupancySeries(summaries);

  visitorsChart.data.labels = summaries.map(s =>
    new Date(s.timestamp).toLocaleTimeString()
  );
  visitorsChart.data.datasets[0].data = occupancySeries;
  visitorsChart.update();
}