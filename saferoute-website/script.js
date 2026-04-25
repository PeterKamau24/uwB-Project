function loadRoutes(future) {

  const routes = [
    { name: "Route A", score: 82 },
    { name: "Route B", score: 58 },
    { name: "Route C", score: 32 }
  ];

  const container = document.getElementById("routes");
  container.innerHTML = "";

  let best = routes[0];
  let worst = routes[2];

  routes.forEach((r, i) => {

    let score = r.score;
    if (future) score -= 10;

    let level =
      score >= 70 ? "low" :
      score >= 50 ? "medium" : "high";

    container.innerHTML += `
      <div class="card ${level}">
        <h4>${r.name}</h4>
        <div class="score">${score}%</div>
        <p>${level.toUpperCase()} RISK</p>
      </div>
    `;
  });

  const agent = document.getElementById("agent");

  if (future) {
    agent.className = "agent alert";
    agent.innerHTML = `
      ⚠️ Route C becomes unsafe in 30 mins → Switch to Route A
    `;
  } else {
    agent.className = "agent";
    agent.innerHTML = `
      🤖 Best option: Route A
    `;
  }
}