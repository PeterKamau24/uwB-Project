console.log("JS LOADED");

// ---------------- SAFETY CALCULATION ----------------
function calculateSafety(route) {
  let risk =
    route.crime * 0.5 +
    (route.crowd === "low" ? 2 : 0) +
    (route.lighting === "low" ? 2 : 0) +
    (route.time === "night" ? 1 : 0);

  let score = 100 - risk * 10;
  if (score < 0) score = 0;

  return Math.round(score);
}

// ---------------- LABEL ----------------
function getSafetyLabel(score) {
  if (score >= 80) return "🟢 Safe Route";
  if (score >= 60) return "🟡 Moderate Risk";
  return "🔴 High Risk";
}

// ---------------- COLOR ----------------
function getCardColor(score) {
  if (score >= 80) return "#e8f5e9";   // green
  if (score >= 60) return "#fffde7";   // yellow
  return "#ffebee";                   // red
}

// ---------------- EXPLANATION ----------------
function getRiskExplanation(route) {
  let reasons = [];

  if (route.crime > 5) reasons.push("high crime area");
  if (route.crowd === "low") reasons.push("low foot traffic");
  if (route.lighting === "low") reasons.push("poor lighting");
  if (route.time === "night") reasons.push("late-night conditions");

  if (reasons.length === 0) {
    return "This route appears safe with good conditions.";
  }

  return "Higher risk due to " + reasons.join(", ");
}

// ---------------- PREDICTION ----------------
function predictFuture(route) {
  let futureRoute = { ...route };

  futureRoute.time = "night";

  if (futureRoute.crowd === "high") futureRoute.crowd = "medium";
  else if (futureRoute.crowd === "medium") futureRoute.crowd = "low";

  if (futureRoute.lighting === "high") futureRoute.lighting = "medium";
  else if (futureRoute.lighting === "medium") futureRoute.lighting = "low";

  return futureRoute;
}

// ---------------- MAIN ----------------
function loadRoutes() {
  const routes = [
    {
      name: "Route A: Campus → Library",
      duration: "25 min",
      crime: 2,
      crowd: "high",
      lighting: "high",
      time: "day",
    },
    {
      name: "Route B: Campus → Downtown",
      duration: "30 min",
      crime: 6,
      crowd: "low",
      lighting: "low",
      time: "night",
    },
    {
      name: "Route C: Campus → Mall",
      duration: "28 min",
      crime: 3,
      crowd: "medium",
      lighting: "high",
      time: "day",
    },
  ];

  const container = document.getElementById("routes-container");
  container.innerHTML = "";

  let bestRoute = null;
  let bestScore = -1;

  routes.forEach((route) => {
    const score = calculateSafety(route);
    const label = getSafetyLabel(score);
    const explanation = getRiskExplanation(route);

    const futureRoute = predictFuture(route);
    const futureScore = calculateSafety(futureRoute);

    const combinedScore = (score + futureScore) / 2;

    if (combinedScore > bestScore) {
      bestScore = combinedScore;
      bestRoute = { ...route, score };
    }

    let warning = "";
    if (futureScore < score) {
      warning = "⚠️ This route becomes less safe soon";
    }

    container.innerHTML += `
      <div class="card" style="background:${getCardColor(score)};">
        <h3>${route.name}</h3>
        <p>⏱️ ${route.duration}</p>

        <p>${label}</p>
        <p>Safety Score: ${score}%</p>
        <p>🧠 ${explanation}</p>

        ${warning ? `<p>${warning}</p>` : ""}

        <hr>

        <p>🔮 In 30 mins:</p>
        <p>Safety Score: ${futureScore}%</p>
      </div>
    `;
  });

  if (bestRoute) {
    container.innerHTML =
      `
      <div class="card" style="background:#c8e6c9; border:2px solid green;">
        <h2>🏆 Best Route (Smart Choice)</h2>
        <p>${bestRoute.name}</p>
        <p>Balances current and future safety</p>
      </div>
      ` + container.innerHTML;
  }
}