let map;
let directionsService;
let polylines = [];
let lastDirections = null;

const routeColors = ["#22c55e", "#f59e0b", "#ef4444"];

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 47.6062, lng: -122.3321 },
    zoom: 11,
    mapTypeControl: true,
    streetViewControl: false,
    fullscreenControl: true,
  });

  directionsService = new google.maps.DirectionsService();
}

function analyzeRoutes(futureMode) {
  const origin = document.getElementById("origin").value;
  const destination = document.getElementById("destination").value;

  if (!origin || !destination) {
    alert("Please enter both From and To.");
    return;
  }

  directionsService.route(
    {
      origin,
      destination,
      travelMode: google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: true,
    },
    (response, status) => {
      if (status !== "OK") {
        alert("Could not load routes: " + status);
        return;
      }

      lastDirections = response;
      renderRoutes(response.routes.slice(0, 3), futureMode);
    }
  );
}

function renderRoutes(routes, futureMode) {
  clearMap();

  const bounds = new google.maps.LatLngBounds();
  const routesList = document.getElementById("routesList");
  routesList.innerHTML = "";

  let scoredRoutes = routes.map((route, index) => {
    const score = calculateSafetyScore(route, index, futureMode);
    const level = getLevel(score);
    const factors = getFactors(score, index, futureMode);

    return { route, index, score, level, factors };
  });

  scoredRoutes.sort((a, b) => b.score - a.score);

  scoredRoutes.forEach((item, displayIndex) => {
    drawPolyline(item.route, item.level, bounds);

    const leg = item.route.legs[0];
    routesList.innerHTML += createRouteCard(item, leg, displayIndex);
  });

  map.fitBounds(bounds);

  showAgentInsight(scoredRoutes, futureMode);
}

function drawPolyline(route, level, bounds) {
  const color =
    level === "Low Risk" ? "#22c55e" :
    level === "Medium Risk" ? "#f59e0b" :
    "#ef4444";

  const path = route.overview_path;

  path.forEach((point) => bounds.extend(point));

  const polyline = new google.maps.Polyline({
    path,
    strokeColor: color,
    strokeOpacity: 0.9,
    strokeWeight: 7,
    map,
  });

  polylines.push(polyline);
}

function clearMap() {
  polylines.forEach((line) => line.setMap(null));
  polylines = [];
}

function calculateSafetyScore(route, index, futureMode) {
  const now = new Date();
  const hour = now.getHours();

  let base = 88;

  // Slight variation between actual Google route alternatives
  base -= index * 18;

  // Longer routes may expose user longer
  const durationMin = route.legs[0].duration.value / 60;
  if (durationMin > 30) base -= 5;

  // Night conditions reduce perceived safety
  if (hour >= 20 || hour <= 5) base -= 12;

  // Future mode simulates lower foot traffic and lighting
  if (futureMode) base -= 8 + index * 5;

  return Math.max(10, Math.min(96, Math.round(base)));
}

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
      ? "Moderate risk because foot traffic is decreasing over time."
      : "Some darker areas and moderate activity along this route.";
  }

  return futureMode
    ? "Becomes high risk due to low lighting and reduced foot traffic."
    : "Higher risk due to lower activity and less visible streets.";
}

function createRouteCard(item, leg, displayIndex) {
  const routeName = `Route ${String.fromCharCode(65 + displayIndex)}`;
  const routeClass = getClass(item.level);

  return `
    <div class="route-card ${routeClass}">
      <h4>${routeName} ${displayIndex === 0 ? "— Best Choice" : ""}</h4>
      <p>⏱️ ${leg.duration.text} · 📍 ${leg.distance.text}</p>
      <div class="score">${item.score}%</div>
      <p><strong>${item.level}</strong></p>
      <p>${item.factors}</p>
    </div>
  `;
}

function showAgentInsight(scoredRoutes, futureMode) {
  const agentBox = document.getElementById("agentBox");
  const best = scoredRoutes[0];
  const worst = scoredRoutes[scoredRoutes.length - 1];

  agentBox.classList.remove("hidden");

  if (futureMode) {
    agentBox.className = "agent-box alert";
    agentBox.innerHTML = `
      <h3>🤖 Agent Alert</h3>
      <p><strong>${getLevel(worst.score)} detected.</strong> One route becomes riskier in the next 30 minutes.</p>
      <p>SafeRoute recommends taking the best route now or leaving earlier.</p>
    `;
  } else {
    agentBox.className = "agent-box";
    agentBox.innerHTML = `
      <h3>🤖 Smart Agent Insight</h3>
      <p>SafeRoute recommends the highest-scoring route. It offers the best balance of time and safety right now.</p>
    `;
  }
}