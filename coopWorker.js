importScripts(
  "https://cdnjs.cloudflare.com/ajax/libs/seedrandom/3.0.5/seedrandom.min.js"
);

self.onmessage = function (e) {
  const { config } = e.data;
  const {
    numPlayers,
    totalCards,
    cardsInPacket,
    cardsAsignation,
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
    const roundHistory = [];
    let sobresTotales = 0;
    let ended = false;

    while (!ended) {
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
      ronda.estadoAlbums = albums.map((set) => Array.from(set));
      roundHistory.push(ronda);

      const allFull = albums.every((a) => a.size === totalCards);
      const limit =
        gameEnds === "limite_sobres" && sobresTotales >= limitPackets;

      if (allFull || limit) ended = true;
    }

    simulations.push({
      rondas: roundHistory,
      sobresTotales,
      final: albums.map((set) => Array.from(set)),
    });

    self.postMessage({ progress: sim + 1 });
  }

  self.postMessage({ done: true, simulations });
};
