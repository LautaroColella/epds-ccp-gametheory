let coopConfig = {};
let currentMode = null;

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
  playersCount.textContent = "Jugadores: 0";
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
  gameSection.appendChild(settingsBtn);
  resetCoopSettings();
  document.getElementById("saveCoopSettings").addEventListener("click", () => {
    if (!updateCoopSettings()) return;
    const modalEl = document.getElementById("coopSettingsModal");
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    modalInstance.hide();
  });

  const startBtn = document.createElement("button");
  startBtn.classList.add(
    "btn",
    "btn-success",
    "position-sticky",
    "sticky-bottom"
  );
  startBtn.innerHTML = `
  <i class="fas fa-play"></i>
  `;
  startBtn.style.zIndex = "2";
  startBtn.style.left = "100%";
  gameSection.appendChild(startBtn);
}

function resetCoopSettings() {
  document.getElementById("num_players").value = 5;
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
  };

  return true;
}

function addPlayer() {
  const playersContainer = document.getElementById("players");
  const newPlayerBtn = document.createElement("button");

  newPlayerBtn.classList.add("btnAddPlayer");
  newPlayerBtn.addEventListener("click", () => addPlayer());

  newPlayerBtn.innerHTML = `<span><i class="fas fa-plus fa-2x"></i><i class="fas fa-user fa-2x"></i></span>`;

  playersContainer.insertBefore(
    newPlayerBtn,
    playersContainer.lastElementChild
  );

  updatePlayerCount();
}

function updatePlayerCount() {
  const playersContainer = document.getElementById("players");
  const count = playersContainer.childElementCount - 1;
  const countDisplay = document.getElementById("playerCount");

  if (countDisplay) countDisplay.textContent = `Jugadores: ${count}`;
}

window.addEventListener("DOMContentLoaded", () => {
  selectMode("cooperativo");
  const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
  );
  tooltipTriggerList.forEach((el) => new bootstrap.Tooltip(el));
});
