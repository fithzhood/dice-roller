// Lancia Dadi — vanilla JS. All state in one plain object.
'use strict';

const state = { count: 2, sides: 6, values: [], rolling: false };

const el = {
  dice: document.getElementById('dice'),
  total: document.getElementById('total'),
  roll: document.getElementById('roll'),
  countChips: Array.from(document.querySelectorAll('#count-chips .chip')),
  typeChips: Array.from(document.querySelectorAll('#type-chips .chip'))
};

// which of the 9 grid cells (0-8) show a pip, per die value (d6 only)
const PIPS = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8]
};

function randValues() {
  return Array.from({ length: state.count }, () => 1 + Math.floor(Math.random() * state.sides));
}

function renderDie(value) {
  const die = document.createElement('div');
  die.className = 'die' + (state.rolling ? ' rolling' : '');
  if (state.sides === 6) {
    const on = PIPS[value] || [];
    for (let i = 0; i < 9; i++) {
      const cell = document.createElement('span');
      cell.className = 'pip' + (on.includes(i) ? '' : ' off');
      die.appendChild(cell);
    }
  } else {
    die.classList.add('num');
    die.textContent = value;
  }
  return die;
}

function renderDice() {
  el.dice.innerHTML = '';
  state.values.forEach(v => el.dice.appendChild(renderDie(v)));
}

function updateTotal() {
  if (!state.values.length) { el.total.innerHTML = 'Totale <b>—</b>'; return; }
  const sum = state.values.reduce((a, b) => a + b, 0);
  const label = state.count > 1 ? 'Totale' : 'Risultato';
  el.total.innerHTML = `${label} <b>${sum}</b>`;
}

function roll() {
  if (state.rolling) return;
  state.rolling = true;
  el.roll.disabled = true;
  if (navigator.vibrate) navigator.vibrate(25);

  let ticks = 0;
  const maxTicks = 10;                       // ~600ms of shuffling
  clearInterval(state._timer);
  state._timer = setInterval(() => {
    state.values = randValues();
    renderDice();
    el.total.innerHTML = 'Totale <b>…</b>';
    if (++ticks >= maxTicks) {
      clearInterval(state._timer);
      state.rolling = false;
      state.values = randValues();
      renderDice();
      updateTotal();
      el.roll.disabled = false;
      if (navigator.vibrate) navigator.vibrate([15, 40, 15]);
    }
  }, 60);
}

// Config change: reflect it immediately with a fresh (non-animated) roll.
function setActive(group, active) {
  group.forEach(c => c.classList.toggle('active', c === active));
}
function quietRoll() {
  state.values = randValues();
  renderDice();
  updateTotal();
}

el.countChips.forEach(c => c.addEventListener('click', () => {
  setActive(el.countChips, c);
  state.count = parseInt(c.dataset.count, 10);
  quietRoll();
}));
el.typeChips.forEach(c => c.addEventListener('click', () => {
  setActive(el.typeChips, c);
  state.sides = parseInt(c.dataset.sides, 10);
  quietRoll();
}));
el.roll.addEventListener('click', roll);

quietRoll();   // initial state
