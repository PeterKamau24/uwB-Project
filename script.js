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

  drawFakeMap(origin, destination);
  renderFakeRoutes(futureMode);
}

/* ===============================
   DRAW GRID + ROUTE LINE
================================*/
function drawFakeMap(origin, destination) {
  const map = document.getElementById("map");

  // CLEAR previous
  map.innerHTML = "";

  // GRID BACKGROUND
  map.style.background =
    "linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)";
  map.style.backgroundSize = "40px 40px";
  map.style.position = "relative";

  // START POINT
  const start = document.createElement("div");
  start.style.position = "absolute";
  start.style.width = "16px";
  start.style.height = "16px";
  start.style.borderRadius = "50%";
  start.style.background = "black";
  start.style.left = "20%";
  start.style.top = "60%";

  // END POINT
  const end = document.createElement("div");
  end.style.position = "absolute";
  end.style.width = "16px";
  end.style.height = "16px";
  end.style.borderRadius = "50%";
  end.style.background = "black";
  end.style.left = "75%";
  end.style.top = "30%";

  // LABELS
  const startLabel = document.createElement("div");
  startLabel.innerText = origin;
  startLabel.style.position = "absolute";
  startLabel.style.left = "20%";
  startLabel.style.top = "60%";
  startLabel.style.transform = "translate(-50%, -180%)";
  startLabel.style.fontWeight = "600";

  const endLabel = document.createElement("div");
  endLabel.innerText = destination;
  endLabel.style.position = "absolute";
  endLabel.style.left = "75%";
  endLabel.style.top = "30%";
  endLabel.style.transform = "translate(-50%, -180%)";
  endLabel.style.fontWeight = "600";

  // ROUTE LINE
  const line = document.createElement("div");
  line.style.position = "absolute";
  line.style.height = "5px";
  line.style.background = "linear-gradient(90deg, #22c55e, #2563eb)";
  line.style.borderRadius = "10px";

  // CALCULATE EXACT POSITION
  const mapRect = map.getBoundingClientRect();

  const x1 = mapRect.width * 0.2;
  const y1 = mapRect.height * 0.6;

  const x2 = mapRect.width * 0.75;
  const y2 = mapRect.height * 0.3;

  const dx = x2 - x1;
  const dy = y2 - y1;

  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  line.style.width = length + "px";
  line.style.left = x1 + "px";
  line.style.top = y1 + "px";
  line.style.transform = `rotate(${angle}deg)`;
  line.style.transformOrigin = "left center";

  // MOVING DOT (CAR EFFECT)
  const dot = document.createElement("div");
  dot.style.position = "absolute";
  dot.style.width = "12px";
  dot.style.height = "12px";
  dot.style.borderRadius = "50%";
  dot.style.background = "#2563eb";
  dot.style.boxShadow = "0 0 8px rgba(37,99,235,0.7)";

  let progress = 0;

  function animate() {
    progress += 0.003;
    if (progress > 1) progress = 0;

    dot.style.left = x1 + dx * progress + "px";
    dot.style.top = y1 + dy * progress + "px";

    requestAnimationFrame(animate);
  }

  animate();

  // APPEND ALL
  map.appendChild(line);
  map.appendChild(dot);
  map.appendChild(start);
  map.appendChild(end);
  map.appendChild(startLabel);
  map.appendChild(endLabel);
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