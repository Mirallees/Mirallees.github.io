const NUM_PLAYERS = 3;
const TOTAL_SPOTS = 10;

const players = [];
for (let i = 0; i < NUM_PLAYERS; i++) {
  players.push({
    position: 0,
    action: null,
    heart: false,
    eliminated: false
  });
}

let bag = ['black1', 'black2', 'black3', 'red'];
let usedDice = [];
let accumulatedDice = [];

const diceFaces = {
  black1: [1,1,1,1,2,2],
  black2: [1,1,1,1,0,0],
  black3: [1,1,0,0,0,0],
  red: [1,1,1,1,1,0]
};

function setAction(index, action) {
  if (!players[index].eliminated)
    players[index].action = action;
}

function rollDie(name) {
  const faces = diceFaces[name];
  return faces[Math.floor(Math.random() * faces.length)];
}

function drawFromBag() {
  if (bag.length === 0) {
    bag = ['black1', 'black2', 'black3', 'red'];
    usedDice = [];
  }
  const index = Math.floor(Math.random() * bag.length);
  const chosen = bag.splice(index, 1)[0];
  usedDice.push(chosen);
  accumulatedDice.push(chosen);
  return chosen;
}

function updateDieDisplay(die, value) {
  const display = document.getElementById('die-display');
  let color = die.startsWith('black') ? '⚫' : '🔴';
  display.textContent = `Dado: ${color} (${value})`;
}

function nextTurn() {
  for (let p of players) {
    if (p.action === null && !p.eliminated) {
      alert("Todos deben elegir acción antes de continuar.");
      return;
    }
  }

  logMessage("<hr><strong>Comienza nuevo turno</strong>");

  const drawnDie = drawFromBag();
  const valueDrawn = rollDie(drawnDie);
  updateDieDisplay(drawnDie, valueDrawn);
  logMessage(`Dado sacado: ${drawnDie} = ${valueDrawn}`);

  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    if (player.eliminated) continue;

    if (player.action === 'stop') {
      if (drawnDie === 'red' && !player.heart) {
        player.heart = true;
        logMessage(`Jugador ${i + 1} obtiene corazón ❤️`);
      }
    } else if (player.action === 'walk') {
      if (drawnDie.startsWith('black')) {
        let total = 0;
        for (let d of accumulatedDice) {
          if (d.startsWith('black')) {
            let val = rollDie(d);
            if (val > 0) total += val;
          }
        }
        player.position += total;
        logMessage(`Jugador ${i + 1} avanza ${total}`);
      } else if (drawnDie === 'red') {
        if (player.heart) {
          player.heart = false;
          logMessage(`Jugador ${i + 1} pierde su corazón ❌`);
        } else {
          let total = 0;
          for (let d of accumulatedDice) {
            let val = rollDie(d);
            if (d.startsWith('black') && val === 0) continue;
            total += val;
          }
          player.position = Math.max(0, player.position - total);
          logMessage(`Jugador ${i + 1} retrocede ${total}`);
        }
      }
    }

    if (player.position >= TOTAL_SPOTS) {
      player.eliminated = true;
      logMessage(`🎉 Jugador ${i + 1} ¡ha ganado!`);
      alert("¡¡¡Felicidades!!!! Has Ganado al Escondite Inglés Regular 🎉");
    }

    updatePlayer(i);
  }

  if (drawnDie === 'red') {
    accumulatedDice = [];
  }

  for (let p of players) {
    p.action = null;
  }
}

function updatePlayer(index) {
  const player = players[index];
  const path = document.getElementById('path' + (index + 1));
  const heartDiv = document.getElementById('heart' + (index + 1));

  path.innerHTML = '';
  for (let i = 0; i <= TOTAL_SPOTS; i++) {
    const spot = document.createElement('div');
    spot.style.top = `${(TOTAL_SPOTS - i) * 35}px`;
    path.appendChild(spot);

    if (player.position === i) {
      const token = document.createElement('div');
      token.className = `token player${index + 1}`;
      token.textContent = player.heart ? "❤️" : "";
      spot.appendChild(token);
    }
  }

  heartDiv.textContent = player.heart ? "❤️" : "❌";
}

function logMessage(msg) {
  document.getElementById('log').innerHTML += "<br>" + msg;
}

for (let i = 0; i < NUM_PLAYERS; i++) {
  updatePlayer(i);
}