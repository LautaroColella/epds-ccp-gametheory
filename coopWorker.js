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
    cardsAsignation,
  } = config;

  const simulations = [];

  for (let sim = 0; sim < simulationCount; sim++) {
    if (simulationSeed !== null) {
      Math.seedrandom(simulationSeed + sim);
    }

    const albums = Array.from({ length: numPlayers }, () => new Set());
    const packetsPerPlayer = Array(numPlayers).fill(0);
    const progressHistory = [];
    let sobresTotales = 0;
    let ended = false;

    while (!ended) {
      const pool = [];
      let anyPlayerNeedsCards = false;

      for (let j = 0; j < numPlayers; j++) {
        if (albums[j].size < totalCards) {
          anyPlayerNeedsCards = true;
          break;
        }
      }

      if (!anyPlayerNeedsCards) {
        ended = true;
        break;
      }

      for (let j = 0; j < numPlayers; j++) {
        if (albums[j].size >= totalCards) continue;

        packetsPerPlayer[j]++;

        for (let k = 0; k < cardsInPacket; k++) {
          const figu = Math.floor(Math.random() * totalCards);

          if (!albums[j].has(figu)) {
            albums[j].add(figu);
          } else {
            pool.push(figu);
          }
        }

        sobresTotales++;

        const currentCompletion = albums.map((a) => a.size / totalCards);
        const overallCompletion =
          currentCompletion.reduce((sum, p) => sum + p, 0) / numPlayers;
        const completionPercent = Math.floor(overallCompletion * 100);

        if (
          !progressHistory.some((entry) => entry.percent === completionPercent)
        ) {
          progressHistory.push({
            percent: completionPercent,
            packets: sobresTotales,
            completion: currentCompletion,
          });
        }

        // Check packet limit
        if (gameEnds === "limite_sobres" && sobresTotales >= limitPackets) {
          ended = true;
          break;
        }
      }

      if (ended) break;

      // Distribute duplicates based on strategy
      for (const figu of pool) {
        let assigned = false;

        if (cardsAsignation === "optima") {
          // Optimal: Player closest to completion
          let bestPlayer = -1;
          let maxCards = -1;
          for (let j = 0; j < numPlayers; j++) {
            if (!albums[j].has(figu) && albums[j].size > maxCards) {
              bestPlayer = j;
              maxCards = albums[j].size;
            }
          }
          if (bestPlayer !== -1) {
            albums[bestPlayer].add(figu);
            assigned = true;
          }
        } else if (cardsAsignation === "turno") {
          // Turn-based: First eligible player
          for (let j = 0; j < numPlayers; j++) {
            if (!albums[j].has(figu)) {
              albums[j].add(figu);
              assigned = true;
              break;
            }
          }
        } else if (cardsAsignation === "aleatoria") {
          // Random: Any eligible player
          const candidates = [];
          for (let j = 0; j < numPlayers; j++) {
            if (!albums[j].has(figu)) candidates.push(j);
          }
          if (candidates.length > 0) {
            const randomPlayer =
              candidates[Math.floor(Math.random() * candidates.length)];
            albums[randomPlayer].add(figu);
            assigned = true;
          }
        } else if (cardsAsignation === "equitativa") {
          // Equitable: Player with fewest cards
          let minCards = totalCards;
          let bestPlayer = -1;
          for (let j = 0; j < numPlayers; j++) {
            if (!albums[j].has(figu) && albums[j].size < minCards) {
              bestPlayer = j;
              minCards = albums[j].size;
            }
          }
          if (bestPlayer !== -1) {
            albums[bestPlayer].add(figu);
            assigned = true;
          }
        }
      }

      // Final completion check
      const allFull = albums.every((a) => a.size === totalCards);
      if (allFull) ended = true;
    }

    simulations.push({
      sobresTotales,
      porcentajePorJugador: albums.map((set) => set.size / totalCards),
      completados: albums.map((set) => set.size === totalCards),
      packetsPerPlayer, // For Graph 1
      progressHistory, // For Graph 2
    });

    self.postMessage({
      progress: sim + 1,
      currentSim: simulations[sim], // Send intermediate data
    });
  }

  self.postMessage({
    done: true,
    simulations,
    finalAverages: calculateAverages(simulations),
  });
};

function calculateAverages(simulations) {
  // Calculate accumulated averages for Graph 2
  const avgProgress = {};
  simulations.forEach((sim) => {
    sim.progressHistory.forEach((entry) => {
      if (!avgProgress[entry.packets]) {
        avgProgress[entry.packets] = {
          sum: Array(sim.porcentajePorJugador.length).fill(0),
          count: 0,
        };
      }
      entry.completion.forEach((p, i) => {
        avgProgress[entry.packets].sum[i] += p;
      });
      avgProgress[entry.packets].count++;
    });
  });

  return {
    packetsPerPlayer: simulations
      .reduce((acc, sim) => {
        sim.packetsPerPlayer.forEach((p, i) => {
          acc[i] = (acc[i] || 0) + p;
        });
        return acc;
      }, [])
      .map((sum) => sum / simulations.length),

    progressHistory: Object.entries(avgProgress)
      .map(([packets, data]) => ({
        packets: parseInt(packets),
        avgCompletion: data.sum.map((sum) => sum / data.count),
      }))
      .sort((a, b) => a.packets - b.packets),
  };
}
