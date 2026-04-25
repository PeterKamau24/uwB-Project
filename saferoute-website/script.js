let map;
let directionsService;
let polylines = [];

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 47.6062, lng: -122.3321 },
    zoom: 11,
  });

  directionsService = new google.maps.DirectionsService();
}

function analyzeRoutes(future = false) {
  const origin = document.getElementById("origin").value;
  const destination = document.getElementById("destination").value;

  directionsService.route(
    {
      origin,
      destination,
      travelMode: "DRIVING",
      provideRouteAlternatives: true,
    },
    (res, status) => {
      if (status !== "OK") return alert("Error loading routes");

      renderRoutes(res.routes.slice(0, 3), future);
    }
  );
}

function renderRoutes(routes, future) {
  clearMap();

  let list = document.getElementById("routesList");
  list.innerHTML = "";

  let best = null;
  let worst = null;

  routes.forEach((route, i) => {
    let score = 85 - i * 20;

    if (future) score -= 15;

    let level =
      score >= 70 ? "Low Risk" :
      score >= 50 ? "Medium Risk" : "High Risk";

    if (!best || score > best.score) best = { name: `Route ${i+1}`, score };
    if (!worst || score < worst.score) worst = { name: `Route ${i+1}`, score };

    drawRoute(route, level);

    list.innerHTML += `
      <div class="route-card ${getClass(level)}">
        <h4>Route ${i+1}</h4>
        <p>${route.legs[0].duration.text}</p>
        <div class="score">${score}%</div>
        <p>${level}</p>
      </div>
    `;
  });

  showAgent(best, worst, future);
}

function drawRoute(route, level) {
  const color =
    level === "Low Risk" ? "green" :
    level === "Medium Risk" ? "orange" : "red";

  const polyline = new google.maps.Polyline({
    path: route.overview_path,
    strokeColor: color,
    strokeWeight: 5,
    map,
  });

  polylines.push(polyline);
}

function clearMap() {
  polylines.forEach(p => p.setMap(null));
  polylines = [];
}

function getClass(level) {
  if (level === "Low Risk") return "low";
  if (level === "Medium Risk") return "medium";
  return "high";
}

function showAgent(best, worst, future) {
  const box = document.getElementById("agentBox");

  if (future) {
    box.className = "agent-box alert";
    box.innerHTML = `
      ⚠️ Route becomes unsafe → Switch to ${best.name}
    `;
  } else {
    box.className = "agent-box";
    box.innerHTML = `
      🤖 Best option: ${best.name}
    `;
  }
}
