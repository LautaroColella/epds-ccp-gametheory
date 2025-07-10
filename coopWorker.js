importScripts(
  "https://cdnjs.cloudflare.com/ajax/libs/seedrandom/3.0.5/seedrandom.min.js"
);

self.onmessage = function (e) {
  const { config } = e.data;
  const {
    numPlayers,
    totalCards,
    cardsInPacket,
    gameEnds,
    limitPackets,
    simulationSeed,
    simulationCount = 1,
  } = config;

  const simulations = [];

  for (let sim = 0; sim < simulationCount; sim++) {
    if (simulationSeed !== null) {
      Math.seedrandom(simulationSeed + sim);
    }

    const albums = Array.from({ length: numPlayers }, () => new Set());
    let sobresTotales = 0;
    let ended = false;

    while (!ended) {
      const pool = [];

      for (let j = 0; j < numPlayers; j++) {
        for (let k = 0; k < cardsInPacket; k++) {
          const figu = Math.floor(Math.random() * totalCards);

          if (!albums[j].has(figu)) {
            albums[j].add(figu);
          } else {
            pool.push(figu);
          }
        }

        sobresTotales++;
      }

      for (const figu of pool) {
        for (let j = 0; j < numPlayers; j++) {
          if (!albums[j].has(figu)) {
            albums[j].add(figu);
            break;
          }
        }
      }

      const allFull = albums.every((a) => a.size === totalCards);
      const limit =
        gameEnds === "limite_sobres" && sobresTotales >= limitPackets;

      if (allFull || limit) ended = true;
    }

    const porcentajePorJugador = albums.map((set) => set.size / totalCards);
    const completados = albums.map((set) => set.size === totalCards);

    simulations.push({
      sobresTotales,
      porcentajePorJugador,
      completados,
    });

    self.postMessage({ progress: sim + 1 });
  }

  self.postMessage({ done: true, simulations });
};
