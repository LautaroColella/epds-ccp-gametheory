let coopConfig = {};
let currentMode = null;
let coopState = null;
let coopCurrentSimulation = 1;
let porcentajeChart = null;
let promedioChart = null;
let packetDistributionChart = null;
let progressChart = null;

const gameModesContent = {
  cooperativo: () => loadCoop(),
  competitivo: () => loadComp(),
  evolutivo: () => loadLearn(),
};

function selectMode(mode) {
  gameModesContent[mode];

  const gameSection = document.getElementById("game");
  gameSection.innerHTML = "";

  currentMode = mode;
  gameModesContent[mode]?.();
}

function loadCoop() {
  coopState = null;
  const gameSection = document.getElementById("game");

  const playersCount = document.createElement("h3");
  playersCount.classList.add("text-center");
  playersCount.textContent = "Jugadores: 2";
  playersCount.id = "playerCount";
  gameSection.appendChild(playersCount);

  const playersContainer = document.createElement("div");
  playersContainer.classList.add(
    "d-flex",
    "flex-row",
    "justify-content-center",
    "align-items-center",
    "flex-wrap",
    "gap-4",
    "p-5"
  );
  playersContainer.id = "players";
  gameSection.appendChild(playersContainer);

  const newPlayerBtn = document.createElement("button");
  newPlayerBtn.classList.add("btnAddPlayer", "d-block");
  newPlayerBtn.addEventListener("click", () => addPlayer());
  newPlayerBtn.innerHTML = `<span><i class="fas fa-plus fa-2x"></i><i class="fas fa-user fa-2x"></i></span>`;
  playersContainer.appendChild(newPlayerBtn);

  addPlayer(2);

  const bottomGameButtons = document.createElement("div");
  bottomGameButtons.classList.add(
    "d-flex",
    "justify-content-between",
    "position-sticky",
    "sticky-bottom"
  );
  bottomGameButtons.width = "100%";
  bottomGameButtons.id = "bottomGameButtons";

  const settingsBtn = document.createElement("button");
  settingsBtn.classList.add("btn", "btn-secondary");
  settingsBtn.innerHTML = `
    <i class="fas fa-gear"></i>
  `;
  settingsBtn.setAttribute("data-bs-toggle", "modal");
  settingsBtn.setAttribute("data-bs-target", "#coopSettingsModal");
  settingsBtn.style.zIndex = "2";
  settingsBtn.addEventListener("click", () => setLastCoopSettings());

  document.getElementById("saveCoopSettings").addEventListener("click", () => {
    if (!updateCoopSettings()) return;
    const modalEl = document.getElementById("coopSettingsModal");
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    modalInstance.hide();
  });

  const runSimDiv = document.createElement("div");
  runSimDiv.classList.add("d-flex");
  runSimDiv.style.zIndex = "2";

  const simCountTooltip = document.createElement("i");
  simCountTooltip.classList.add(
    "fas",
    "fa-question-circle",
    "text-muted",
    "mt-2",
    "me-1"
  );
  simCountTooltip.setAttribute("data-bs-toggle", "tooltip");
  simCountTooltip.title = "Número de simulaciones";

  const simCountInput = document.createElement("input");
  simCountInput.type = "number";
  simCountInput.id = "simulation_count";
  simCountInput.classList.add("form-control", "d-inline");
  simCountInput.value = "1";
  simCountInput.min = "1";
  simCountInput.max = "1000";
  simCountInput.required = true;
  simCountInput.style.width = "100px";

  const startBtn = document.createElement("button");
  startBtn.classList.add("btn", "btn-success");
  startBtn.innerHTML = `
  <i class="fas fa-play"></i>
  `;
  startBtn.addEventListener("click", () => {
    if (!updateCoopSettings()) return;
    runCoopSimulation();
  });
  runSimDiv.appendChild(simCountTooltip);
  runSimDiv.appendChild(simCountInput);
  runSimDiv.appendChild(startBtn);
  bottomGameButtons.appendChild(settingsBtn);
  bottomGameButtons.appendChild(runSimDiv);
  gameSection.appendChild(bottomGameButtons);

  resetCoopSettings();
}

function resetCoopSettings() {
  document.getElementById("num_players").value = 2;
  document.getElementById("total_cards").value = 200;
  document.getElementById("cards_in_packet").value = 5;
  document.getElementById("cards_distribution").value = "uniforme";
  document.getElementById("cards_asignation").value = "optima";
  document.getElementById("auto_simulation").checked = false;
  document.getElementById("auto_simulation_ms").value = 500;
  document.getElementById("game_ends").value = "llena_album";
  document.getElementById("limit_packets").value = 1000;
  document.getElementById("simulation_seed").value = 0;

  const autoSpeedContainer = document.getElementById(
    "auto_simulation_speed_container"
  );
  const limitPacketsContainer = document.getElementById(
    "limit_packets_container"
  );

  if (autoSpeedContainer) autoSpeedContainer.classList.add("d-none");
  if (limitPacketsContainer) limitPacketsContainer.classList.add("d-none");

  const autoCheckbox = document.getElementById("auto_simulation");
  autoCheckbox.addEventListener("change", () => {
    autoSpeedContainer.classList.toggle("d-none", !autoCheckbox.checked);
  });

  const gameEndsSelect = document.getElementById("game_ends");
  gameEndsSelect.addEventListener("change", () => {
    const isLimit = gameEndsSelect.value === "limite_sobres";
    limitPacketsContainer.classList.toggle("d-none", !isLimit);
  });

  updateCoopSettings();
}

function updateCoopSettings() {
  const numPlayers = parseInt(document.getElementById("num_players").value, 10);
  const totalCards = parseInt(document.getElementById("total_cards").value, 10);
  const cardsInPacket = parseInt(
    document.getElementById("cards_in_packet").value,
    10
  );
  const cardsDistribution = document.getElementById("cards_distribution").value;
  const cardsAsignation = document.getElementById("cards_asignation").value;
  const autoSimulation = document.getElementById("auto_simulation").checked;
  const autoSimulationMs = parseInt(
    document.getElementById("auto_simulation_ms").value,
    10
  );
  const gameEnds = document.getElementById("game_ends").value;
  const limitPackets = parseInt(
    document.getElementById("limit_packets").value,
    10
  );
  const seedVal = parseInt(
    document.getElementById("simulation_seed").value,
    10
  );
  const simulationCount = parseInt(
    document.getElementById("simulation_count").value,
    10
  );

  if (isNaN(numPlayers) || numPlayers < 2 || numPlayers > 100) {
    alert(
      "El número de jugadores debe ser un número entero mayor o igual a 2 y menor que 100."
    );
    return false;
  }

  if (isNaN(totalCards) || totalCards <= 0) {
    alert(
      "El número total de figuritas debe ser un número entero mayor o igual a 0."
    );
    return false;
  }

  if (isNaN(cardsInPacket) || cardsInPacket <= 0) {
    alert(
      "El número de figuritas por sobre debe ser un número entero mayor o igual a 0."
    );
    return false;
  }

  if (autoSimulation && (isNaN(autoSimulationMs) || autoSimulationMs < 0)) {
    alert(
      "La velocidad de simulación debe ser un número entero mayor o igual a 0."
    );
    return false;
  }

  if (
    gameEnds === "limite_sobres" &&
    (isNaN(limitPackets) || limitPackets <= 0)
  ) {
    alert("El límite de sobres debe ser un número entero mayor o igual a 0.");
    return false;
  }

  if (isNaN(seedVal) || seedVal < 0) {
    alert("La semilla debe ser un número entero mayor o igual a 0.");
    return false;
  }

  coopConfig = {
    numPlayers,
    totalCards,
    cardsInPacket,
    cardsDistribution,
    cardsAsignation,
    autoSimulation,
    autoSimulationMs: autoSimulation ? autoSimulationMs : null,
    gameEnds,
    limitPackets: gameEnds === "limite_sobres" ? limitPackets : null,
    simulationSeed: seedVal === 0 ? null : seedVal,
    simulationCount:
      isNaN(simulationCount) || simulationCount < 1 || simulationCount > 10000
        ? 1
        : simulationCount,
  };

  const playersContainer = document.getElementById("players");
  playersContainer.innerHTML = "";

  const newPlayerBtn = document.createElement("button");
  newPlayerBtn.classList.add("btnAddPlayer", "d-block");
  newPlayerBtn.addEventListener("click", () => addPlayer());
  newPlayerBtn.innerHTML = `<span><i class="fas fa-plus fa-2x"></i><i class="fas fa-user fa-2x"></i></span>`;
  playersContainer.appendChild(newPlayerBtn);

  addPlayer(coopConfig.numPlayers);

  return true;
}

function setLastCoopSettings() {
  if (!coopConfig) return;

  document.getElementById("num_players").value = coopConfig.numPlayers;
  document.getElementById("total_cards").value = coopConfig.totalCards;
  document.getElementById("cards_in_packet").value = coopConfig.cardsInPacket;
  document.getElementById("cards_distribution").value =
    coopConfig.cardsDistribution;
  document.getElementById("cards_asignation").value =
    coopConfig.cardsAsignation;
  document.getElementById("auto_simulation").checked =
    coopConfig.autoSimulation;
  document.getElementById("auto_simulation_ms").value =
    coopConfig.autoSimulationMs;
  document.getElementById("game_ends").value = coopConfig.gameEnds;
  document.getElementById("limit_packets").value = coopConfig.limitPackets;
  document.getElementById("simulation_seed").value =
    coopConfig.simulationSeed ?? 0;

  document
    .getElementById("auto_simulation_speed_container")
    .classList.toggle("d-none", !coopConfig.autoSimulation);
  document
    .getElementById("limit_packets_container")
    .classList.toggle("d-none", coopConfig.gameEnds !== "limite_sobres");
}

function addPlayer(quantity = 1) {
  const playersContainer = document.getElementById("players");

  for (let i = 0; i < quantity; i++) {
    const usedIds = Array.from(
      playersContainer.querySelectorAll(".coopPlayer")
    ).map((el) => parseInt(el.dataset.playerId, 10));

    let newId = 1;
    while (usedIds.includes(newId)) {
      newId++;
    }

    const newPlayer = document.createElement("div");
    newPlayer.classList.add("coopPlayer");
    newPlayer.dataset.playerId = newId;
    newPlayer.innerHTML = `
    <span>
      <button class="btn btn-sm delPlayer d-block"><i class="fas fa-ban"></i></button>
    </span>
    <i class="fas fa-user fa-2x"></i>Bot ${newId}
    `;
    playersContainer.appendChild(newPlayer);

    const deleteBtn = newPlayer.querySelector(".delPlayer");
    deleteBtn.addEventListener("click", () => deleteCoopPlayer(newId));
  }

  updatePlayerCount();
}

function deleteCoopPlayer(id) {
  const playerElement = document.querySelector(
    `.coopPlayer[data-player-id="${id}"]`
  );
  if (playerElement) {
    playerElement.remove();
    updatePlayerCount();
  }
}

function updatePlayerCount() {
  const playersContainer = document.getElementById("players");
  const count = playersContainer.childElementCount - 1;
  const countDisplay = document.getElementById("playerCount");
  const numPlayersInput = document.getElementById("num_players");

  if (countDisplay) countDisplay.textContent = `Jugadores: ${count}`;
  if (numPlayersInput) numPlayersInput.value = count;

  coopConfig.numPlayers = count;
}

function runCoopSimulation() {
  const { simulationCount } = coopConfig;

  coopState = {
    simulations: [],
    ended: false,
  };

  document.querySelector(".btnAddPlayer").classList.remove("d-block");
  document.querySelector(".btnAddPlayer").classList.add("d-none");
  document.querySelectorAll(".delPlayer").forEach((delButton) => {
    delButton.classList.remove("d-block");
    delButton.classList.add("d-none");
  });

  let loadingContainer = document.getElementById("loadingBarContainer");
  if (!loadingContainer) {
    loadingContainer = document.createElement("div");
    loadingContainer.id = "loadingBarContainer";
    loadingContainer.innerHTML = `
      <div id="loadingBar" class="progress" style="height: 25px;">
        <div id="loadingBarFill" class="progress-bar progress-bar-striped progress-bar-animated bg-info"
             role="progressbar" style="width: 0%">
          0%
        </div>
      </div>
      <p id="simProgressText" style="text-align: center; margin-top: 5px;">Simulación 0 de ${simulationCount}</p>
    `;
    loadingContainer.style.marginTop = "1rem";
    document.getElementById("game").appendChild(loadingContainer);
  }

  const loadingBarFill = document.getElementById("loadingBarFill");
  const simProgressText = document.getElementById("simProgressText");
  loadingContainer.style.display = "block";

  const worker = new Worker("coopWorker.js");

  worker.postMessage({ config: coopConfig });

  worker.onmessage = function (e) {
    if (e.data.progress !== undefined) {
      const percent = Math.round((e.data.progress / simulationCount) * 100);
      loadingBarFill.style.width = `${percent}%`;
      loadingBarFill.textContent = `${percent}%`;
      simProgressText.textContent = `Simulación ${e.data.progress} de ${simulationCount}`;
    }

    if (e.data.done) {
      loadingContainer.style.display = "none";

      coopState.simulations = e.data.simulations;
      coopCurrentSimulation = 1;
      endOfCoopSimulation(coopState);
      renderRound(coopCurrentSimulation);

      worker.terminate();
    }
  };
}

function endOfCoopSimulation(coopState) {
  const gameSection = document.getElementById("game");
  document.getElementById("bottomGameButtons").classList.add("d-none");

  const coopBottomButtons = document.createElement("div");
  const simDiv = document.createElement("div");
  const simBackDiv = document.createElement("div");
  const simMiddleDiv = document.createElement("div");
  const simNextDiv = document.createElement("div");

  const currentSimInput = document.createElement("input");
  currentSimInput.type = "number";
  currentSimInput.id = "coop_current_simulation";
  currentSimInput.classList.add("form-control", "d-inline", "ms-1", "me-1");
  currentSimInput.value = "1";
  currentSimInput.min = "1";
  currentSimInput.max = `${coopState.simulations.length}`;
  currentSimInput.required = true;
  currentSimInput.style.width = "100px";

  coopBottomButtons.classList.add(
    "position-sticky",
    "sticky-bottom",
    "d-flex",
    "flex-row",
    "justify-content-between",
    "align-items-center"
  );
  coopBottomButtons.style.zIndex = "2";

  simDiv.classList.add("d-flex", "flex-row");
  simMiddleDiv.classList.add("ms-3", "me-3");

  const simBackbackBtn = document.createElement("button");
  simBackbackBtn.classList.add("btn", "btn-success", "me-1");
  simBackbackBtn.innerHTML = `
  <i class="fas fa-backward-fast"></i>
  `;
  simBackbackBtn.addEventListener("click", () => {
    currentSimInput.value = 1;
    currentSimInput.dispatchEvent(new Event("input"));
  });

  const simBackBtn = document.createElement("button");
  simBackBtn.classList.add("btn", "btn-success");
  simBackBtn.innerHTML = `
  <i class="fas fa-backward-step"></i>
  `;
  simBackBtn.addEventListener("click", () => {
    currentSimInput.value = Math.max(1, parseInt(currentSimInput.value) - 1);
    currentSimInput.dispatchEvent(new Event("input"));
  });

  const simNextnextBtn = document.createElement("button");
  simNextnextBtn.classList.add("btn", "btn-success");
  simNextnextBtn.innerHTML = `
  <i class="fas fa-forward-fast"></i>
  `;
  simNextnextBtn.addEventListener("click", () => {
    currentSimInput.value = currentSimInput.max;
    currentSimInput.dispatchEvent(new Event("input"));
  });

  const simNextBtn = document.createElement("button");
  simNextBtn.classList.add("btn", "btn-success", "me-1");
  simNextBtn.innerHTML = `
    <i class="fas fa-forward-step"></i>
    `;
  simNextBtn.addEventListener("click", () => {
    currentSimInput.value = Math.min(
      parseInt(currentSimInput.max),
      parseInt(currentSimInput.value) + 1
    );
    currentSimInput.dispatchEvent(new Event("input"));
  });

  const currentSimText = document.createElement("p");
  currentSimText.classList.add("d-inline");
  currentSimText.textContent = "Simulación";

  const totalSimsText = document.createElement("p");
  totalSimsText.classList.add("d-inline");
  totalSimsText.textContent = `de ${coopState.simulations.length}`;

  currentSimInput.addEventListener(
    "input",
    debounce((e) => {
      const value = parseInt(e.target.value, 10);
      const min = parseInt(e.target.min, 10);
      const max = parseInt(e.target.max, 10);

      if (isNaN(value) || value < min || value > max) {
        alert(`La simulación debe ser un número entre ${min} y ${max}`);
        e.target.value = coopCurrentSimulation;
        return;
      }
      if (value === coopCurrentSimulation) return;
      coopCurrentSimulation = value;

      renderRound(coopCurrentSimulation);
    }, 1500)
  );

  simBackDiv.appendChild(simBackbackBtn);
  simBackDiv.appendChild(simBackBtn);
  simMiddleDiv.appendChild(currentSimText);
  simMiddleDiv.appendChild(currentSimInput);
  simMiddleDiv.appendChild(totalSimsText);
  simNextDiv.appendChild(simNextBtn);
  simNextDiv.appendChild(simNextnextBtn);
  simDiv.appendChild(simBackDiv);
  simDiv.appendChild(simMiddleDiv);
  simDiv.appendChild(simNextDiv);

  const goBackBtn = document.createElement("button");
  goBackBtn.classList.add("btn", "btn-secondary");
  goBackBtn.addEventListener("click", () => {
    document.getElementById("bottomGameButtons").classList.remove("d-none");
    document.getElementById("bottomGameButtons").classList.add("d-flex");
    document.querySelector(".btnAddPlayer").classList.remove("d-none");
    document.querySelector(".btnAddPlayer").classList.add("d-block");
    document.querySelectorAll(".delPlayer").forEach((delButton) => {
      delButton.classList.remove("d-none");
      delButton.classList.add("d-block");
    });
    coopBottomButtons.remove();
  });
  goBackBtn.innerHTML = `<span><i class="fas fa-door-open"></i> Reiniciar</span>`;

  coopBottomButtons.appendChild(goBackBtn);
  coopBottomButtons.appendChild(simDiv);
  gameSection.appendChild(coopBottomButtons);
}

function renderRound(simulation) {
  const sim = coopState.simulations[simulation - 1];

  // 1. Prepare all chart data first
  const chartData = {
    // Current simulation completion data
    currentCompletion: {
      labels: sim.porcentajePorJugador.map((_, i) => `Player ${i + 1}`),
      data: sim.porcentajePorJugador.map((p) => Math.round(p * 100)),
      backgroundColor: "rgba(54, 162, 235, 0.7)",
      borderColor: "rgba(54, 162, 235, 1)",
    },

    // Average completion data
    averageCompletion: {
      labels: Array(coopConfig.numPlayers)
        .fill()
        .map((_, i) => `Player ${i + 1}`),
      data: calculateAccumulatedAverages(simulation),
      backgroundColor: "rgba(255, 99, 132, 0.7)",
      borderColor: "rgba(255, 99, 132, 1)",
    },

    // Packet distribution data
    packetDistribution: {
      labels: sim.packetsPerPlayer.map((_, i) => `Player ${i + 1}`),
      data: sim.packetsPerPlayer,
      backgroundColor: "rgba(75, 192, 192, 0.7)",
      borderColor: "rgba(75, 192, 192, 1)",
    },

    // Progress charts data
    progressCharts: {
      current: prepareCurrentProgressData(sim),
      average: prepareAverageProgressData(simulation),
    },
  };

  // 2. Set up HTML structure
  setupChartsHTML();

  // 3. Render all charts
  renderAllCharts(chartData);

  function calculateAccumulatedAverages(simulation) {
    const averages = [];
    for (let i = 0; i < coopConfig.numPlayers; i++) {
      let sum = 0;
      for (let j = 0; j < simulation; j++) {
        sum += coopState.simulations[j].porcentajePorJugador[i];
      }
      averages.push(Math.round((sum / simulation) * 100));
    }
    return averages;
  }

  function prepareCurrentProgressData(sim) {
    const progress = [...sim.progressHistory];
    progress.push({
      percent: Math.round(
        (sim.porcentajePorJugador.reduce((a, b) => a + b, 0) /
          (coopConfig.numPlayers * 100)) *
          100
      ),
      packets: sim.sobresTotales,
      completion: sim.porcentajePorJugador,
    });

    return progress
      .map((entry) => ({
        packets: entry.packets,
        completion:
          (entry.completion.reduce((a, b) => a + b, 0) /
            entry.completion.length) *
          100,
      }))
      .sort((a, b) => a.packets - b.packets);
  }

  function prepareAverageProgressData(simulation) {
    const progressData = {};

    for (let i = 0; i < simulation; i++) {
      const sim = coopState.simulations[i];
      const finalEntry = {
        percent: Math.round(
          (sim.porcentajePorJugador.reduce((a, b) => a + b, 0) /
            (coopConfig.numPlayers * 100)) *
            100
        ),
        packets: sim.sobresTotales,
        completion: sim.porcentajePorJugador,
      };
      const allEntries = [...sim.progressHistory, finalEntry];

      allEntries.forEach((entry) => {
        const percent = Math.min(100, Math.round(entry.percent));
        if (!progressData[percent]) {
          progressData[percent] = {
            totalCompletion: 0,
            totalPackets: 0,
            count: 0,
          };
        }
        const avgCompletion =
          entry.completion.reduce((sum, p) => sum + p, 0) /
          entry.completion.length;
        progressData[percent].totalCompletion += avgCompletion;
        progressData[percent].totalPackets += entry.packets;
        progressData[percent].count++;
      });
    }

    return Object.entries(progressData)
      .map(([percent, data]) => ({
        avgPackets: Math.round(data.totalPackets / data.count),
        avgCompletion: (data.totalCompletion / data.count) * 100,
      }))
      .sort((a, b) => a.avgPackets - b.avgPackets);
  }

  function setupChartsHTML() {
    document.getElementById("graphs").innerHTML = `
    <div class="row mt-3">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">Current Simulation: Album Completion</div>
          <div class="card-body">
            <canvas id="chartPorcentajeLlenado"></canvas>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">Average Completion</div>
          <div class="card-body">
            <canvas id="chartAverageLlenado"></canvas>
          </div>
        </div>
      </div>
    </div>
    <div class="row mt-3">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">Current Simulation: Packets Used</div>
          <div class="card-body">
            <canvas id="chartPacketDistribution"></canvas>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">Current Simulation Progress</div>
          <div class="card-body">
            <canvas id="currentProgressChart"></canvas>
          </div>
        </div>
      </div>
    </div>
    <div class="row mt-3">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">Cumulative Average Progress</div>
          <div class="card-body">
            <canvas id="avgProgressChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  `;
  }

  function renderAllCharts(chartData) {
    // Destroy old charts if they exist
    [
      porcentajeChart,
      promedioChart,
      packetDistributionChart,
      progressChart,
    ].forEach((chart) => chart && chart.destroy());

    // Chart 1: Current simulation completion
    porcentajeChart = createBarChart(
      "chartPorcentajeLlenado",
      chartData.currentCompletion,
      { yMax: 100, yCallback: (v) => `${v}%` }
    );

    // Chart 2: Average completion
    promedioChart = createBarChart(
      "chartAverageLlenado",
      chartData.averageCompletion,
      { yMax: 100, yCallback: (v) => `${v}%` }
    );

    // Chart 3: Packet distribution
    packetDistributionChart = createBarChart(
      "chartPacketDistribution",
      chartData.packetDistribution,
      {}
    );

    // Chart 4: Current progress
    createLineChart(
      "currentProgressChart",
      chartData.progressCharts.current,
      "Completion %",
      "rgb(75, 192, 192)",
      coopConfig.limitPackets
    );

    // Chart 5: Average progress
    createLineChart(
      "avgProgressChart",
      chartData.progressCharts.average,
      "Avg Completion %",
      "rgb(153, 102, 255)",
      coopConfig.limitPackets
    );
  }

  function createBarChart(
    canvasId,
    { labels, data, backgroundColor, borderColor },
    options = {}
  ) {
    return new Chart(document.getElementById(canvasId).getContext("2d"), {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: options.label || "",
            data,
            backgroundColor,
            borderColor,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: options.yMax,
            ticks: { callback: options.yCallback },
          },
        },
      },
    });
  }

  function createLineChart(canvasId, data, label, borderColor, packetLimit) {
    return new Chart(document.getElementById(canvasId).getContext("2d"), {
      type: "line",
      data: {
        labels: data.map((d) => d.packets || d.avgPackets),
        datasets: [
          {
            label,
            data: data.map((d) => d.completion || d.avgCompletion),
            borderColor,
            borderWidth: 2,
            tension: 0.1,
            pointRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            min: 0,
            max: 100,
            ticks: { callback: (v) => `${v}%` },
          },
          x: {
            min: 0,
            max: packetLimit * 1.05,
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) =>
                `${ctx.parsed.y.toFixed(1)}% at ${ctx.parsed.x} packets`,
            },
          },
        },
      },
    });
  }
}

function debounce(func, delay = 1000) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
}

window.addEventListener("DOMContentLoaded", () => {
  selectMode("cooperativo");
  const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
  );
  tooltipTriggerList.forEach((el) => new bootstrap.Tooltip(el));
});
