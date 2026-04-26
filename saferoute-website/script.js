let polylines = [];

/* ===============================
   MAIN FUNCTION (BUTTON CLICK)
================================*/
function analyzeRoutes(futureMode) {
  const origin = document.getElementById("origin").value.trim();
  const destination = document.getElementById("destination").value.trim();

  if (!origin || !destination) {
    alert("Please enter both locations.");
    return;
  }

  // ✅ SHOW MAP + PANEL
  document.getElementById("resultsSection").classList.remove("hidden");

  drawFakeMap(origin, destination);
  renderFakeRoutes(futureMode);
  document.getElementById("map").style.opacity = "1";
}

/* ===============================
   DRAW GRID + ROUTE LINE
================================*/
function drawFakeMap(origin, destination) {
  const map = document.getElementById("map");
  map.innerHTML = ""; // clear only, no drawing
}

/* ===============================
   FAKE ROUTES DATA (7 ROUTES)
================================*/
function renderFakeRoutes(futureMode) {
  const routesList = document.getElementById("routesList");
  routesList.innerHTML = "";

  const routes = [
    { name: "Route A", time: "28 min", dist: "9.2 mi", score: 88 },
    { name: "Route B", time: "31 min", dist: "10.1 mi", score: 72 },
    { name: "Route C", time: "34 min", dist: "11.5 mi", score: 60 },
    { name: "Route D", time: "36 min", dist: "12.0 mi", score: 55 },
    { name: "Route E", time: "38 min", dist: "12.8 mi", score: 65 },
    { name: "Route F", time: "40 min", dist: "10.5 mi", score: 50 },
    { name: "Route G", time: "44 min", dist: "11.8 mi", score: 42 },
  ];

  routes.forEach((r, i) => {
    const level = getLevel(r.score);
    const cls = getClass(level);

    routesList.innerHTML += `
      <div class="route-card ${cls}">
        <h4>${r.name} ${i === 0 ? "— Best Choice" : ""}</h4>
        <p>⏱️ ${r.time} · 📍 ${r.dist}</p>
        <div class="score">${r.score}%</div>
        <p><strong>${level}</strong></p>
        <p>${getFactors(r.score, i, futureMode)}</p>
      </div>
    `;
  });

  showAgentInsight(routes, futureMode);
}

/* ===============================
   SAFETY LOGIC (UNCHANGED)
================================*/
function getLevel(score) {
  if (score >= 75) return "Low Risk";
  if (score >= 50) return "Medium Risk";
  return "High Risk";
}

function getClass(level) {
  if (level === "Low Risk") return "low";
  if (level === "Medium Risk") return "medium";
  return "high";
}

function getFactors(score, index, futureMode) {
  if (score >= 75) {
    return "Low crime area, good lighting, and active foot traffic.";
  }

  if (score >= 50) {
    return futureMode
      ? "Moderate risk because foot traffic is decreasing."
      : "Some darker areas and moderate activity.";
  }

  return futureMode
    ? "High risk due to low lighting and reduced activity."
    : "Higher risk area, low activity.";
}

/* ===============================
   AGENT BOX
================================*/
function showAgentInsight(routes, futureMode) {
  const agentBox = document.getElementById("agentBox");
  agentBox.classList.remove("hidden");

  if (futureMode) {
    agentBox.className = "agent-box alert";
    agentBox.innerHTML = `
      <h3>🤖 Agent Alert</h3>
      <p>Safety decreases in 30 minutes. Consider leaving earlier.</p>
    `;
  } else {
    agentBox.className = "agent-box";
    agentBox.innerHTML = `
      <h3>🤖 Smart Insight</h3>
      <p>Best route selected based on safety score.</p>
    `;
  }
}