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
    if (coopConfig.simulationCount > 1) {
      runCoopSimulation();
    } else {
      initCoopSimulation();

      if (!coopConfig.autoSimulation) {
        const avanzarBtn = document.createElement("button");
        avanzarBtn.classList.add("btn", "btn-primary", "m-2");
        avanzarBtn.innerHTML = `<i class="fas fa-forward"></i> Avanzar ronda`;
        avanzarBtn.addEventListener("click", () => avanzarRondaCoop());
        gameSection.appendChild(avanzarBtn);
      } else {
        const interval = setInterval(() => {
          avanzarRondaCoop();
          if (coopState.finalizado) clearInterval(interval);
        }, coopConfig.autoSimulationMs);
      }
    }
  });
  runSimDiv.appendChild(simCountInput);
  runSimDiv.appendChild(startBtn);
  gameSection.appendChild(runSimDiv);

  const avanzarBtn = document.createElement("button");
  avanzarBtn.classList.add("btn", "btn-primary", "m-2");
  avanzarBtn.innerHTML = `<i class="fas fa-forward"></i> Avanzar ronda`;
  avanzarBtn.addEventListener("click", () => avanzarRondaCoop());
  gameSection.appendChild(avanzarBtn);

  resetCoopSettings();
}

function resetCoopSettings() {
  document.getElementById("num_players").value = 2;
  document.getElementById("total_cards").value = 200;
  document.getElementById("cards_in_packet").value = 5;
  document.getElementById("cards_distribution").value = "uniforme";
  document.getElementById("cards_asignation").value = "optima";
  document.getElementById("cards_repeated").checked = true;
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
  const cardsRepeated = document.getElementById("cards_repeated").checked;
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
    cardsRepeated,
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
  document.getElementById("cards_repeated").checked = coopConfig.cardsRepeated;
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
    cardsDistribution,
    cardsAsignation,
    cardsRepeated,
    gameEnds,
    limitPackets,
    simulationSeed,
    simulationCount = 1,
  } = coopConfig;

  const t0 = performance.now();

  let packetsResults = [];
  let completionStats = [];

  for (let sim = 0; sim < simulationCount; sim++) {
    if (simulationSeed !== null) {
      Math.seedrandom(simulationSeed + sim);
    }

    const albums = Array.from({ length: numPlayers }, () => new Set());
    let packetsOpened = 0;
    let allCompleted = false;

    while (!allCompleted) {
      packetsOpened++;
      let packet = [];
      for (let i = 0; i < cardsInPacket; i++) {
        packet.push(Math.floor(Math.random() * totalCards));
      }

      packet.forEach((card) => {
        let assigned = false;

        if (cardsAsignation === "optima") {
          for (let i = 0; i < numPlayers; i++) {
            if (!albums[i].has(card)) {
              albums[i].add(card);
              assigned = true;
              break;
            }
          }
        }

        if (!assigned && cardsRepeated) {
          const randPlayer = Math.floor(Math.random() * numPlayers);
          albums[randPlayer].add(card);
        }
      });

      if (gameEnds === "llena_album") {
        allCompleted = albums.every((a) => a.size >= totalCards);
      } else if (gameEnds === "limite_sobres") {
        if (packetsOpened >= limitPackets) {
          allCompleted = true;
        }
      }
    }

    packetsResults.push(packetsOpened);
    completionStats.push(albums.map((a) => a.size));
  }

  const t1 = performance.now();
  const elapsed = (t1 - t0).toFixed(2);

  const avgPackets = (
    packetsResults.reduce((a, b) => a + b, 0) / simulationCount
  ).toFixed(2);
  const minPackets = Math.min(...packetsResults);
  const maxPackets = Math.max(...packetsResults);

  console.log(`Simulaciones completadas: ${simulationCount}`);
  console.log(`Promedio de sobres abiertos: ${avgPackets}`);
  console.log(`Mínimo: ${minPackets} | Máximo: ${maxPackets}`);

  for (let i = 0; i < numPlayers; i++) {
    const playerCompletion = completionStats.map((stat) => stat[i]);
    const avgCompletion = (
      playerCompletion.reduce((a, b) => a + b, 0) / simulationCount
    ).toFixed(2);
    console.log(
      `Jugador ${i + 1} - Promedio de figuritas: ${avgCompletion}/${totalCards}`
    );
  }

  console.log(`Tiempo total de simulación: ${elapsed} ms`);
}

function initCoopSimulation() {
  const { numPlayers, totalCards, simulationSeed } = coopConfig;

  if (simulationSeed !== null) {
    Math.seedrandom(simulationSeed);
  }

  coopState = {
    ronda: 0,
    sobresTotales: 0,
    albums: Array.from({ length: numPlayers }, () => new Set()),
    historialRondas: [],
    finalizado: false,
  };
}

function avanzarRondaCoop() {
  if (!coopState || coopState.finalizado) return;

  const {
    numPlayers,
    totalCards,
    cardsInPacket,
    cardsAsignation,
    cardsRepeated,
    gameEnds,
    limitPackets,
  } = coopConfig;

  const rondaActual = {
    sobres: [],
    asignaciones: [],
  };

  coopState.ronda++;

  for (let j = 0; j < numPlayers; j++) {
    const sobre = [];
    for (let i = 0; i < cardsInPacket; i++) {
      const card = Math.floor(Math.random() * totalCards);
      sobre.push(card);
    }
    rondaActual.sobres.push(sobre);
    coopState.sobresTotales++;
  }

  const pool = rondaActual.sobres.flat();

  const asignaciones = Array.from({ length: numPlayers }, () => []);

  pool.forEach((figu) => {
    let asignado = false;

    if (cardsAsignation === "optima") {
      for (let i = 0; i < numPlayers; i++) {
        if (!coopState.albums[i].has(figu)) {
          coopState.albums[i].add(figu);
          asignaciones[i].push(figu);
          asignado = true;
          break;
        }
      }
    }

    if (!asignado && cardsRepeated) {
      const rand = Math.floor(Math.random() * numPlayers);
      coopState.albums[rand].add(figu);
      asignaciones[rand].push(figu);
    }
  });

  rondaActual.asignaciones = asignaciones;
  coopState.historialRondas.push(rondaActual);

  const todosCompletos = coopState.albums.every((a) => a.size === totalCards);
  const sobresLimite =
    coopConfig.gameEnds === "limite_sobres" &&
    coopState.sobresTotales >= limitPackets;

  if (todosCompletos || sobresLimite) {
    coopState.finalizado = true;
    console.log("Fin de la simulación. Rondas:", coopState.ronda);
  }

  renderRonda(coopState.ronda, rondaActual);
}

function renderRonda(numRonda, ronda) {
  const output = document.getElementById("graphs");
  const rondaDiv = document.createElement("div");
  rondaDiv.classList.add("mb-3", "p-3", "border", "rounded");

  rondaDiv.innerHTML = `<h4>📦 Ronda ${numRonda}</h4>`;
  ronda.sobres.forEach((sobre, idx) => {
    rondaDiv.innerHTML += `<p><strong>Jugador ${
      idx + 1
    }</strong> abrió: [${sobre.join(", ")}]</p>`;
  });

  ronda.asignaciones.forEach((asig, idx) => {
    rondaDiv.innerHTML += `<p>→ Se asignó a Jugador ${idx + 1}: [${asig.join(
      ", "
    )}]</p>`;
  });

  output.appendChild(rondaDiv);
}

window.addEventListener("DOMContentLoaded", () => {
  selectMode("cooperativo");
  const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
  );
  tooltipTriggerList.forEach((el) => new bootstrap.Tooltip(el));
});
