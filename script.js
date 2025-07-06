let coopConfig = {};
let currentMode = null;
let coopState = null;

const gameModesContent = {
  cooperativo: () => loadCoop(),
  competitivo: () => loadComp(),
  evolutivo: () => loadLearn(),
};

function selectMode(mode) {
  if (mode === currentMode) {
    alert("Ya estas en este modo");
    return;
  }

  gameModesContent[mode];

  const gameSection = document.getElementById("game");
  gameSection.innerHTML = "";

  currentMode = mode;
  gameModesContent[mode]?.();
}

function loadCoop() {
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
  newPlayerBtn.classList.add("btnAddPlayer");
  newPlayerBtn.addEventListener("click", () => addPlayer());
  newPlayerBtn.innerHTML = `<span><i class="fas fa-plus fa-2x"></i><i class="fas fa-user fa-2x"></i></span>`;
  playersContainer.appendChild(newPlayerBtn);

  addPlayer(2);

  const settingsBtn = document.createElement("button");
  settingsBtn.classList.add(
    "btn",
    "btn-secondary",
    "position-sticky",
    "sticky-bottom"
  );
  settingsBtn.innerHTML = `
    <i class="fas fa-gear"></i>
  `;
  settingsBtn.setAttribute("data-bs-toggle", "modal");
  settingsBtn.setAttribute("data-bs-target", "#coopSettingsModal");
  settingsBtn.style.zIndex = "2";
  settingsBtn.id = "coopSettingsBtn";
  settingsBtn.addEventListener("click", () => setLastCoopSettings());

  gameSection.appendChild(settingsBtn);
  document.getElementById("saveCoopSettings").addEventListener("click", () => {
    if (!updateCoopSettings()) return;
    const modalEl = document.getElementById("coopSettingsModal");
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    modalInstance.hide();
  });

  const runSimDiv = document.createElement("div");
  runSimDiv.classList.add("position-sticky", "sticky-bottom");
  runSimDiv.style.zIndex = "2";
  runSimDiv.style.left = "100%";
  runSimDiv.style.display = "inline-block";
  runSimDiv.id = "runSimDiv";

  const simCountInput = document.createElement("input");
  simCountInput.type = "number";
  simCountInput.id = "simulation_count";
  simCountInput.classList.add("form-control", "position-absolute", "d-inline");
  simCountInput.value = "1";
  simCountInput.min = "1";
  simCountInput.max = "1000";
  simCountInput.required = true;
  simCountInput.style.width = "100px";
  simCountInput.style.right = "38px";

  const startBtn = document.createElement("button");
  startBtn.classList.add("btn", "btn-success");
  startBtn.innerHTML = `
  <i class="fas fa-play"></i>
  `;
  startBtn.addEventListener("click", () => {
    if (!updateCoopSettings()) return;
    runCoopSimulation();
  });
  runSimDiv.appendChild(simCountInput);
  runSimDiv.appendChild(startBtn);
  gameSection.appendChild(runSimDiv);

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
  newPlayerBtn.classList.add("btnAddPlayer");
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
      <button class="btn btn-sm editPlayer"><i class="fas fa-edit"></i></button>
      <button class="btn btn-sm delPlayer"><i class="fas fa-ban"></i></button>
    </span>
    <i class="fas fa-user fa-2x"></i>Bot ${newId}
    `;
    playersContainer.appendChild(newPlayer);

    const editBtn = newPlayer.querySelector(".editPlayer");
    const deleteBtn = newPlayer.querySelector(".delPlayer");
    editBtn.addEventListener("click", () => editCoopPlayer(newId));
    deleteBtn.addEventListener("click", () => deleteCoopPlayer(newId));
  }

  updatePlayerCount();
}

function editCoopPlayer(id) {
  console.log(id);
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
  const {
    numPlayers,
    totalCards,
    cardsInPacket,
    cardsAsignation,
    gameEnds,
    limitPackets,
    simulationSeed,
    simulationCount = 1,
  } = coopConfig;

  const t0 = performance.now();

  coopState = {
    simulations: [],
    finalizado: false,
  };

  for (let sim = 0; sim < simulationCount; sim++) {
    if (simulationSeed !== null) {
      Math.seedrandom(simulationSeed + sim);
    }

    const albums = Array.from({ length: numPlayers }, () => new Set());
    const historialRondas = [];
    let sobresTotales = 0;
    let finalizado = false;

    while (!finalizado) {
      const ronda = {
        sobres: [],
        asignaciones: [],
        usadasDelPool: [],
        poolFinal: [],
        estadoAlbums: [],
      };

      const pool = [];

      for (let j = 0; j < numPlayers; j++) {
        const sobre = [];
        const asignadas = [];

        for (let k = 0; k < cardsInPacket; k++) {
          const figu = Math.floor(Math.random() * totalCards);
          sobre.push(figu);

          if (!albums[j].has(figu)) {
            albums[j].add(figu);
            asignadas.push(figu);
          } else {
            pool.push(figu);
          }
        }

        ronda.sobres.push(sobre);
        ronda.asignaciones.push(asignadas);
        sobresTotales++;
      }

      const poolUsadas = Array.from({ length: numPlayers }, () => []);

      for (let i = 0; i < pool.length; i++) {
        const figu = pool[i];
        let usada = false;

        for (let j = 0; j < numPlayers; j++) {
          if (!albums[j].has(figu)) {
            albums[j].add(figu);
            poolUsadas[j].push(figu);
            usada = true;
            break;
          }
        }

        if (!usada) {
          ronda.poolFinal.push(figu);
        }
      }

      ronda.usadasDelPool = poolUsadas;
      ronda.estadoAlbums = albums.map((set) => new Set(set));
      historialRondas.push(ronda);

      const todosCompletos = albums.every((a) => a.size === totalCards);
      const limite =
        gameEnds === "limite_sobres" && sobresTotales >= limitPackets;

      if (todosCompletos || limite) finalizado = true;
    }

    coopState.simulations.push({
      rondas: historialRondas,
      sobresTotales,
      final: albums.map((set) => new Set(set)),
    });
  }

  const t1 = performance.now();
  console.log(
    `✅ ${simulationCount} simulaciones completadas en ${(t1 - t0).toFixed(
      2
    )} ms.`
  );

  endOfCoopSimulation(coopState);
}

function endOfCoopSimulation(coopState) {
  const gameSection = document.getElementById("game");
  document.getElementById("runSimDiv").style.display = "none";
  document.getElementById("coopSettingsBtn").style.display = "none";

  const coopBottomButtons = document.createElement("div");
  const roundDiv = document.createElement("div");
  const roundBackDiv = document.createElement("div");
  const roundMiddleDiv = document.createElement("div");
  const roundNextDiv = document.createElement("div");
  const simDiv = document.createElement("div");
  const simBackDiv = document.createElement("div");
  const simMiddleDiv = document.createElement("div");
  const simNextDiv = document.createElement("div");

  coopBottomButtons.classList.add(
    "position-sticky",
    "sticky-bottom",
    "d-flex",
    "flex-row",
    "justify-content-around",
    "align-items-center"
  );
  coopBottomButtons.style.zIndex = "2";

  roundDiv.classList.add("d-flex", "flex-row");
  simDiv.classList.add("d-flex", "flex-row");
  roundMiddleDiv.classList.add("ms-3", "me-3");
  simMiddleDiv.classList.add("ms-3", "me-3");

  const roundBackbackBtn = document.createElement("button");
  roundBackbackBtn.classList.add("btn", "btn-success", "me-1");
  roundBackbackBtn.innerHTML = `
  <i class="fas fa-backward-fast"></i>
  `;
  roundBackbackBtn.addEventListener("click", () => {
    renderRound(coopCurrentSimulation, 0);
  });

  const roundBackBtn = document.createElement("button");
  roundBackBtn.classList.add("btn", "btn-success");
  roundBackBtn.innerHTML = `
  <i class="fas fa-backward-step"></i>
  `;
  roundBackBtn.addEventListener("click", () => {
    renderRound(
      coopCurrentSimulation,
      coopCurrentRound === 1 ? coopCurrentRound : coopCurrentRound - 1
    );
  });

  const roundNextnextBtn = document.createElement("button");
  roundNextnextBtn.classList.add("btn", "btn-success");
  roundNextnextBtn.innerHTML = `
  <i class="fas fa-forward-fast"></i>
  `;
  roundNextnextBtn.addEventListener("click", () => {
    renderRound(
      coopCurrentSimulation,
      coopState.simulations[/* cambiar por variable coopCurrentSimulation */ 0]
        .rondas.length
    );
  });

  const roundNextBtn = document.createElement("button");
  roundNextBtn.classList.add("btn", "btn-success", "me-1");
  roundNextBtn.innerHTML = `
    <i class="fas fa-forward-step"></i>
    `;
  roundNextBtn.addEventListener("click", () => {
    renderRound(
      coopCurrentSimulation,
      coopCurrentRound ===
        coopState
          .simulations[/* cambiar por variable coopCurrentSimulation */ 0]
          .rondas.length
        ? coopCurrentRound
        : coopCurrentRound + 1
    );
  });

  const currentRoundText = document.createElement("p");
  currentRoundText.classList.add("d-inline");
  currentRoundText.textContent = "Ronda";

  const totalRoundsText = document.createElement("p");
  totalRoundsText.classList.add("d-inline");
  totalRoundsText.textContent = `de ${coopState.simulations[/* cambiar por variable coopCurrentSimulation */ 0].rondas.length}`;

  const currentRoundInput = document.createElement("input");
  currentRoundInput.type = "number";
  currentRoundInput.id = "coop_current_round";
  currentRoundInput.classList.add("form-control", "d-inline", "ms-1", "me-1");
  currentRoundInput.value = "1";
  currentRoundInput.min = "1";
  currentRoundInput.max = `${coopState.simulations[/* cambiar por variable coopCurrentSimulation */ 0].rondas.length}`;
  currentRoundInput.required = true;
  currentRoundInput.style.width = "100px";

  roundBackDiv.appendChild(roundBackbackBtn);
  roundBackDiv.appendChild(roundBackBtn);
  roundMiddleDiv.appendChild(currentRoundText);
  roundMiddleDiv.appendChild(currentRoundInput);
  roundMiddleDiv.appendChild(totalRoundsText);
  roundNextDiv.appendChild(roundNextBtn);
  roundNextDiv.appendChild(roundNextnextBtn);
  roundDiv.appendChild(roundBackDiv);
  roundDiv.appendChild(roundMiddleDiv);
  roundDiv.appendChild(roundNextDiv);

  const simBackbackBtn = document.createElement("button");
  simBackbackBtn.classList.add("btn", "btn-success", "me-1");
  simBackbackBtn.innerHTML = `
  <i class="fas fa-backward-fast"></i>
  `;
  simBackbackBtn.addEventListener("click", () => {
    renderRound(0, 0);
  });

  const simBackBtn = document.createElement("button");
  simBackBtn.classList.add("btn", "btn-success");
  simBackBtn.innerHTML = `
  <i class="fas fa-backward-step"></i>
  `;
  simBackBtn.addEventListener("click", () => {
    renderRound(
      coopCurrentSimulation === 1
        ? coopCurrentSimulation
        : coopCurrentSimulation - 1,
      0
    );
  });

  const simNextnextBtn = document.createElement("button");
  simNextnextBtn.classList.add("btn", "btn-success");
  simNextnextBtn.innerHTML = `
  <i class="fas fa-forward-fast"></i>
  `;
  simNextnextBtn.addEventListener("click", () => {
    renderRound(coopState.simulations.length, 0);
  });

  const simNextBtn = document.createElement("button");
  simNextBtn.classList.add("btn", "btn-success", "me-1");
  simNextBtn.innerHTML = `
    <i class="fas fa-forward-step"></i>
    `;
  simNextBtn.addEventListener("click", () => {
    renderRound(
      coopCurrentSimulation === coopState.simulations.length
        ? coopCurrentSimulation
        : coopCurrentSimulation + 1,
      0
    );
  });

  const currentSimText = document.createElement("p");
  currentSimText.classList.add("d-inline");
  currentSimText.textContent = "Simulación";

  const totalSimsText = document.createElement("p");
  totalSimsText.classList.add("d-inline");
  totalSimsText.textContent = `de ${coopState.simulations.length}`;

  const currentSimInput = document.createElement("input");
  currentSimInput.type = "number";
  currentSimInput.id = "coop_current_round";
  currentSimInput.classList.add("form-control", "d-inline", "ms-1", "me-1");
  currentSimInput.value = "1";
  currentSimInput.min = "1";
  currentSimInput.max = `${coopState.simulations.length}`;
  currentSimInput.required = true;
  currentSimInput.style.width = "100px";

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

  coopBottomButtons.appendChild(roundDiv);
  coopBottomButtons.appendChild(simDiv);
  gameSection.appendChild(coopBottomButtons);
}

function renderRound(simulation, round) {
  console.log("Rendering round: ", simulation, round);
}

window.addEventListener("DOMContentLoaded", () => {
  selectMode("cooperativo");
  const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
  );
  tooltipTriggerList.forEach((el) => new bootstrap.Tooltip(el));
});
