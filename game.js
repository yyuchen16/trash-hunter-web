"use strict";

const W = 450;
const H = 800;
const TILE_W = 48;
const TILE_H = 60;
const STACK_CAPACITY = 7;
const SHUFFLE_COST = 30;
const LEVEL3_TIME_LIMIT_MS = 60000;
const CITY_TIME_LIMIT_MS = 90000;
const SUPABASE_URL = "https://ujzzlmwuwywvhvczcuvo.supabase.co/rest/v1";
const SUPABASE_KEY = "sb_publishable_69O9uk7cWBD4JW5RaZMKNQ_SZRVCguM";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = true;

const loginNameInput = document.createElement("input");
const loginPasswordInput = document.createElement("input");
const loginInputRects = {
  name: { x: 70, y: 330, w: W - 140, h: 48 },
  password: { x: 70, y: 412, w: W - 140, h: 48 },
};

function setupLoginInput(input, type, label) {
  input.type = type;
  input.setAttribute("aria-label", label);
  input.autocapitalize = "none";
  input.autocomplete = type === "password" ? "current-password" : "username";
  input.spellcheck = false;
  Object.assign(input.style, {
    position: "fixed",
    zIndex: "10",
    opacity: "0.01",
    border: "0",
    padding: "0",
    margin: "0",
    background: "transparent",
    color: "transparent",
    caretColor: "transparent",
    outline: "none",
    fontSize: "16px",
    display: "none",
  });
  document.body.appendChild(input);
}

setupLoginInput(loginNameInput, "text", "name");
setupLoginInput(loginPasswordInput, "password", "password");

const assetPaths = {
  bg: "assets/backgroundbeach.jpg",
  storeBg: "assets/conveniencestore.jpg",
  nightBg: "assets/Nightmarket.png",
  map: "assets/map_background.png",
  title: "assets/titletrash.png",
  start: "assets/starttrash.png",
  level1: "assets/level1trash.png",
  level2: "assets/level2trash.png",
  trashcar: "assets/trashcar.png",
  gear: "assets/settings_gear.png",
  restart: "assets/restarttrash.png",
  win: ["assets/win1t.png", "assets/win2t.png", "assets/win3t.png"],
  lose: ["assets/lose1t.png", "assets/lose2t.png", "assets/lose3t.png", "assets/lose4t.png"],
  player: ["assets/girl1.png", "assets/girl2.png", "assets/girl3.png"],
  cards: Array.from({ length: 20 }, (_, i) => {
    const n = i + 1;
    const ext = n >= 16 ? "jpg" : "png";
    return `assets/card${n}tt.${ext}`;
  }),
};

const categoryByKind = {
  0: "paper", 1: "plastic", 2: "general", 3: "plastic", 4: "metal",
  5: "glass", 6: "general", 7: "metal", 8: "metal", 9: "general",
  10: "glass", 11: "paper", 12: "plastic", 13: "paper", 14: "glass",
  15: "hazard", 16: "food", 17: "hazard", 18: "food", 19: "hazard",
};

const categoryNames = {
  general: "一般垃圾",
  metal: "鐵鋁罐",
  plastic: "塑膠",
  paper: "紙類",
  glass: "玻璃",
  hazard: "有害垃圾",
  food: "廚餘",
};

const binOrder = ["general", "metal", "plastic", "paper", "glass", "hazard", "food"];
const binColors = {
  general: "#969696",
  metal: "#8da0b2",
  plastic: "#50a0ff",
  paper: "#d7ad59",
  glass: "#59bf97",
  hazard: "#f06262",
  food: "#77ad51",
};

const levelMapPos = {
  1: { x: 140, y: 625, label: "Tutorial" },
  2: { x: 285, y: 548, label: "Beach Challenge" },
  3: { x: 335, y: 420, label: "Convenience Store" },
  4: { x: 130, y: 185, label: "Night Market" },
};

const level3Tasks = { plastic: 4, paper: 2, food: 2, general: 2 };
const level3TaskOrder = ["plastic", "paper", "food", "general"];
const level3KindPools = {
  plastic: [1, 3, 12],
  paper: [0, 11, 13],
  food: [16, 18],
  general: [2, 6, 9],
};

const level2Layout = [
  [[57,95],[105,95],[297,95],[345,95],[57,155],[345,155],[57,215],[153,215],[249,215],[345,215],[153,275],[249,275],[105,365],[297,365],[153,425],[249,425],[57,485],[345,485]],
  [[129,95],[273,95],[57,125],[345,125],[57,185],[345,185],[177,245],[225,245],[129,395],[273,395],[57,491],[345,491]],
  [[57,95],[345,95],[57,155],[345,155],[57,215],[153,215],[249,215],[345,215],[153,215],[249,275],[105,365],[297,365],[153,425],[249,425],[57,497],[345,497]],
  [[177,245],[225,245],[129,395],[273,395],[57,503],[345,503]],
  [[153,215],[249,215],[153,275],[249,275],[105,365],[297,365],[153,425],[249,425],[57,509],[345,509]],
  [[177,245],[225,245],[129,395],[273,395],[57,515],[345,515]],
  [[153,215],[249,215],[153,275],[249,275],[105,365],[297,365],[153,425],[249,425],[57,521],[345,521]],
  [[177,245],[225,245],[129,395],[273,395],[57,527],[345,527]],
  [[153,215],[249,215],[153,275],[249,275],[105,365],[297,365],[153,425],[249,425],[57,533],[345,533]],
  [[177,245],[225,245],[129,395],[273,395],[57,539],[345,539]],
  [[153,215],[249,215],[153,275],[249,275],[105,365],[297,365],[153,425],[249,425],[57,545],[345,545]],
  [[177,245],[225,245],[129,395],[273,395]],
  [[153,215],[249,215],[153,275],[249,275],[105,365],[297,365],[153,425],[249,425]],
  [[177,245],[225,245],[129,395],[273,395]],
  [[153,215],[249,215],[153,275],[249,275],[105,365],[297,365],[153,425],[249,425]],
  [[177,245],[225,245],[129,395],[273,395]],
  [[153,215],[249,215],[153,275],[249,275],[105,365],[297,365],[153,425],[249,425]],
  [[177,245],[225,245],[129,395],[273,395]],
  [[153,215],[249,215],[153,275],[249,275],[105,365],[297,365],[153,425],[249,425]],
  [[129,185],[177,185],[225,185],[273,185],[129,245],[177,245],[225,245],[273,245],[177,305],[225,305],[81,335],[129,335],[273,335],[321,335],[81,395],[129,395],[177,395],[225,395],[273,395],[321,395],[129,455],[177,455],[225,455],[273,455]],
  [[105,155],[153,155],[201,155],[249,155],[297,155],[105,215],[153,215],[201,215],[249,215],[297,215],[57,305],[105,305],[153,305],[249,305],[297,305],[345,305],[57,365],[105,365],[153,365],[249,365],[297,365],[345,365],[57,425],[105,425],[153,425],[249,425],[297,425],[345,425],[105,485],[153,485],[249,485],[297,485]],
  [[81,275],[129,275],[177,275],[225,275],[273,275],[321,275],[129,335],[177,335],[225,335],[273,335],[177,395],[225,395],[177,455],[225,455],[177,515],[225,515]],
  [[201,305],[201,365],[201,425],[201,485]],
];

const cityLayout = [
  [[57,155],[105,155],[153,155],[249,155],[297,155],[345,155],[57,245],[105,245],[153,245],[249,245],[297,245],[345,245],[81,365],[129,365],[177,365],[225,365],[273,365],[321,365],[153,485],[249,485]],
  [[81,185],[129,185],[273,185],[321,185],[81,275],[129,275],[273,275],[321,275],[105,395],[153,395],[249,395],[297,395],[177,455],[225,455]],
  [[105,215],[297,215],[105,305],[297,305],[129,425],[273,425],[153,245],[249,245],[177,365],[225,365]],
  [[129,245],[273,245],[129,335],[273,335],[153,455],[249,455],[177,275],[225,275]],
  [[153,305],[249,305]],
];

const level3Layout = [
  [[57,165],[129,165],[201,165],[273,165],[345,165],[57,235],[129,235],[201,235],[273,235],[345,235],[57,305],[129,305],[201,305],[273,305],[345,305],[57,375],[129,375],[201,375],[273,375],[345,375],[57,445],[129,445],[201,445],[273,445],[345,445],[57,515],[129,515],[201,515],[273,515],[345,515]],
];

const images = {};
let loaded = 0;
let total = 0;
let lastTime = 0;
let mouse = { x: 0, y: 0 };
const keysDown = new Set();
let audioReady = false;
let musicEnabled = true;
let currentMusicName = "";
let playerName = localStorage.getItem("trashHunterPlayerName") || "";
let authMode = "login";
let authMessage = "";
let loginName = playerName || "";
let loginPassword = "";
let loginFocus = "name";
let tutorialPage = 0;
let settingsOpen = false;
let rankingRecords = [];
let rankingMessage = "";

loginNameInput.addEventListener("focus", () => {
  loginFocus = "name";
});
loginPasswordInput.addEventListener("focus", () => {
  loginFocus = "password";
});
loginNameInput.addEventListener("input", () => {
  loginName = loginNameInput.value.slice(0, 20);
  if (loginNameInput.value !== loginName) loginNameInput.value = loginName;
});
loginPasswordInput.addEventListener("input", () => {
  loginPassword = loginPasswordInput.value.slice(0, 32);
  if (loginPasswordInput.value !== loginPassword) loginPasswordInput.value = loginPassword;
});

const audio = {
  bgm: new Audio("music/disco.mp3"),
  map: new Audio("music/mapmusic.mp3"),
  shuffle: new Audio("music/shufflecards.mp3"),
};

audio.bgm.loop = true;
audio.map.loop = true;
audio.bgm.volume = 0.45;
audio.map.volume = 0.42;
audio.shuffle.volume = 0.75;

const game = {
  state: "loading",
  previousState: "start",
  score: 0,
  level: 1,
  selectedMapLevel: 1,
  cleared: new Set(),
  mapMessage: "",
  mapMessageUntil: 0,
  tiles: [],
  stack: [],
  askingCategory: false,
  pendingTriple: null,
  pendingCategory: null,
  message: "",
  messageUntil: 0,
  endResult: "win",
  playerFrame: 0,
  mapPlayerX: levelMapPos[1].x,
  mapPlayerY: levelMapPos[1].y - 28,
  mapFacing: 1,
  mapWalkTimer: 0,
  mapWalkIndex: 0,
  cityTimeLeftMs: CITY_TIME_LIMIT_MS,
  level3TimeLeftMs: LEVEL3_TIME_LIMIT_MS,
  level3Progress: { plastic: 0, paper: 0, food: 0, general: 0 },
  leaderboardStage: "",
  leaderboardRecords: [],
  leaderboardMessage: "",
  scoreSubmitted: false,
  tutorialActive: false,
};

function loadImage(key, src) {
  total += 1;
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      loaded += 1;
      images[key] = img;
      resolve();
    };
    img.onerror = () => {
      loaded += 1;
      images[key] = null;
      resolve();
    };
    img.src = src;
  });
}

async function loadAssets() {
  const jobs = [
    loadImage("bg", assetPaths.bg),
    loadImage("storeBg", assetPaths.storeBg),
    loadImage("nightBg", assetPaths.nightBg),
    loadImage("map", assetPaths.map),
    loadImage("title", assetPaths.title),
    loadImage("start", assetPaths.start),
    loadImage("level1", assetPaths.level1),
    loadImage("level2", assetPaths.level2),
    loadImage("trashcar", assetPaths.trashcar),
    loadImage("gear", assetPaths.gear),
    loadImage("restart", assetPaths.restart),
    ...assetPaths.win.map((p, i) => loadImage(`win${i}`, p)),
    ...assetPaths.lose.map((p, i) => loadImage(`lose${i}`, p)),
    ...assetPaths.player.map((p, i) => loadImage(`player${i}`, p)),
    ...assetPaths.cards.map((p, i) => loadImage(`card${i}`, p)),
  ];
  await Promise.all(jobs);
  game.state = "login";
  requestAnimationFrame(loop);
}

function drawLoading() {
  ctx.fillStyle = "#78b9dd";
  ctx.fillRect(0, 0, W, H);
  drawText("Loading...", 32, W / 2, H / 2 - 20, "#233");
  drawText(`${loaded} / ${total}`, 22, W / 2, H / 2 + 24, "#233");
}

function drawText(text, size, x, y, color = "#282828", align = "center", bold = false) {
  ctx.font = `${bold ? "700 " : ""}${size}px "Microsoft JhengHei", "Noto Sans TC", Arial`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function drawPixel(text, size, x, y, color = "#282828", align = "center") {
  ctx.font = `700 ${size}px Consolas, monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(255,255,255,.82)";
  ctx.fillText(text, x + 2, y + 2);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function roundRect(x, y, w, h, r, fill, stroke, line = 2) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = line;
    ctx.stroke();
  }
}

function drawImageFit(img, x, y, w, h) {
  if (img) ctx.drawImage(img, x, y, w, h);
  else roundRect(x, y, w, h, 6, "#ddd", "#555", 2);
}

function syncLoginDomInputs() {
  if (loginNameInput.value !== loginName) loginNameInput.value = loginName;
  if (loginPasswordInput.value !== loginPassword) loginPasswordInput.value = loginPassword;
}

function setLoginInputCss(input, rect) {
  const canvasRect = canvas.getBoundingClientRect();
  const scaleX = canvasRect.width / W;
  const scaleY = canvasRect.height / H;
  input.style.left = `${canvasRect.left + rect.x * scaleX}px`;
  input.style.top = `${canvasRect.top + rect.y * scaleY}px`;
  input.style.width = `${rect.w * scaleX}px`;
  input.style.height = `${rect.h * scaleY}px`;
}

function updateLoginDomInputs() {
  const show = game.state === "login" && !settingsOpen;
  for (const input of [loginNameInput, loginPasswordInput]) {
    input.style.display = show ? "block" : "none";
  }
  if (!show) return;
  syncLoginDomInputs();
  setLoginInputCss(loginNameInput, loginInputRects.name);
  setLoginInputCss(loginPasswordInput, loginInputRects.password);
}

function focusLoginDomInput(field) {
  loginFocus = field;
  syncLoginDomInputs();
  const input = field === "name" ? loginNameInput : loginPasswordInput;
  input.focus({ preventScroll: true });
  input.setSelectionRange(input.value.length, input.value.length);
}

function blurLoginDomInputs() {
  loginNameInput.blur();
  loginPasswordInput.blur();
}

function unlockAudio() {
  if (audioReady) return;
  audioReady = true;
  for (const sound of [audio.bgm, audio.map, audio.shuffle]) {
    sound.load();
  }
  updateMusicForState();
}

function stopMusic() {
  audio.bgm.pause();
  audio.map.pause();
  currentMusicName = "";
}

function playMusic(name) {
  if (!audioReady || !musicEnabled) return;
  if (currentMusicName === name) return;

  stopMusic();
  const track = audio[name];
  if (!track) return;
  track.currentTime = 0;
  track.play().catch(() => {});
  currentMusicName = name;
}

function updateMusicForState() {
  if (!audioReady || !musicEnabled) {
    stopMusic();
    return;
  }

  if (game.state === "map" || game.state === "start") {
    playMusic("map");
  } else if (game.state === "play" || game.state === "end") {
    playMusic("bgm");
  } else {
    stopMusic();
  }
}

function toggleMusic() {
  musicEnabled = !musicEnabled;
  updateMusicForState();
}

function playShuffleSound() {
  if (!audioReady || !musicEnabled) return;
  audio.shuffle.currentTime = 0;
  audio.shuffle.play().catch(() => {});
}

function ensurePlayerName() {
  if (playerName) return playerName;
  const typed = window.prompt("請輸入排行榜名稱（1-20字）", "Player");
  playerName = (typed || "Player").trim().slice(0, 20) || "Player";
  localStorage.setItem("trashHunterPlayerName", playerName);
  return playerName;
}

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function registerPlayer(name, password) {
  const cleanName = name.trim().slice(0, 20);
  if (!cleanName || password.length < 1) throw new Error("請輸入名稱和密碼");
  const passwordHash = await sha256(password);
  await supabaseFetch("/players", {
    method: "POST",
    body: JSON.stringify({
      player_name: cleanName,
      password_hash: passwordHash,
    }),
  });
  return cleanName;
}

async function loginPlayer(name, password) {
  const cleanName = name.trim().slice(0, 20);
  if (!cleanName || password.length < 1) throw new Error("請輸入名稱和密碼");
  const query = new URLSearchParams({
    select: "player_name,password_hash",
    player_name: `eq.${cleanName}`,
    limit: "1",
  });
  const rows = await supabaseFetch(`/players?${query.toString()}`);
  if (!rows.length) throw new Error("找不到玩家，請先註冊");
  const passwordHash = await sha256(password);
  if (rows[0].password_hash !== passwordHash && rows[0].password_hash !== "web-player") {
    throw new Error("密碼錯誤");
  }
  return cleanName;
}

function finishAuth(name) {
  playerName = name;
  loginName = name;
  loginPassword = "";
  localStorage.setItem("trashHunterPlayerName", playerName);
  authMessage = "";
  syncLoginDomInputs();
  blurLoginDomInputs();
  game.state = "map";
}

function stageName() {
  return levelMapPos[game.selectedMapLevel]?.label || `Level ${game.selectedMapLevel}`;
}

function supabaseHeaders(extra = {}) {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

async function supabaseFetch(path, options = {}) {
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: supabaseHeaders(options.headers || {}),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Supabase ${response.status}`);
  }
  const text = await response.text();
  if (!text.trim()) return [];
  return JSON.parse(text);
}

async function ensureSupabasePlayer(name) {
  const passwordHash = await sha256("web-player");
  await supabaseFetch("/players?on_conflict=player_name", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({
      player_name: name,
      password_hash: passwordHash,
    }),
  });
}

async function loadLeaderboard(stage) {
  const query = new URLSearchParams({
    select: "player_name,score",
    stage: `eq.${stage}`,
    order: "score.desc,created_at.asc",
    limit: "5",
  });
  const rows = await supabaseFetch(`/scores?${query.toString()}`);
  return rows.map((row) => ({
    name: row.player_name || "Player",
    score: Number(row.score) || 0,
  }));
}

function localLeaderboardKey(stage) {
  return `trashHunterLeaderboard:${stage}`;
}

function saveLocalScore(stage, name, score) {
  const key = localLeaderboardKey(stage);
  const rows = JSON.parse(localStorage.getItem(key) || "[]");
  const existing = rows.find((row) => row.name === name);
  if (existing) existing.score = Math.max(existing.score, score);
  else rows.push({ name, score });
  rows.sort((a, b) => b.score - a.score);
  localStorage.setItem(key, JSON.stringify(rows.slice(0, 5)));
  return rows.slice(0, 5);
}

async function submitScore(stage, score) {
  const name = playerName || ensurePlayerName();
  game.leaderboardStage = stage;
  game.leaderboardMessage = "Saving score...";

  try {
    await ensureSupabasePlayer(name);

    const existingQuery = new URLSearchParams({
      select: "score",
      player_name: `eq.${name}`,
      stage: `eq.${stage}`,
      limit: "1",
    });
    const existing = await supabaseFetch(`/scores?${existingQuery.toString()}`);
    const best = existing.length ? Number(existing[0].score) || 0 : -Infinity;

    if (score > best) {
      await supabaseFetch("/scores?on_conflict=player_name,stage", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({
          player_name: name,
          stage,
          score,
        }),
      });
    }

    game.leaderboardRecords = await loadLeaderboard(stage);
    game.leaderboardMessage = "Online leaderboard";
  } catch (error) {
    game.leaderboardRecords = saveLocalScore(stage, name, score);
    game.leaderboardMessage = "Local leaderboard";
  }
}

async function loadOverallRankings() {
  rankingMessage = "Loading rankings...";
  game.state = "rankings";
  try {
    const query = new URLSearchParams({
      select: "player_name,stage,score",
      order: "score.desc,created_at.asc",
      limit: "50",
    });
    const rows = await supabaseFetch(`/scores?${query.toString()}`);
    rankingRecords = rows.map((row) => ({
      name: row.player_name || "Player",
      stage: row.stage || "-",
      score: Number(row.score) || 0,
    }));
    rankingMessage = "Online rankings";
  } catch (error) {
    rankingRecords = [];
    rankingMessage = "Cannot load online rankings";
  }
}

function drawImageCentered(img, cx, cy, w, h, flipX = false) {
  if (!img) {
    roundRect(cx - w / 2, cy - h / 2, w, h, 6, "#ddd", "#555", 2);
    return;
  }
  ctx.save();
  if (flipX) {
    ctx.translate(cx, cy);
    ctx.scale(-1, 1);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
  } else {
    ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
  }
  ctx.restore();
}

function currentMapLevel() {
  for (const n of [1, 2, 3, 4]) {
    if (!game.cleared.has(n)) return n;
  }
  return 4;
}

function startLevel(mapLevel = 1) {
  game.state = "play";
  game.selectedMapLevel = mapLevel;
  game.level = mapLevel === 2 ? 3 : mapLevel === 1 ? 1 : 2;
  game.score = 0;
  game.stack = [];
  if (mapLevel === 1) {
    game.tiles = generateTutorialTiles();
  } else if (mapLevel === 2) {
    game.tiles = generateLevel3Tiles();
  } else if (mapLevel === 3) {
    game.tiles = generateTilesFromLayout(limitLayout(level2Layout, 90), 20);
  } else {
    game.tiles = generateTilesFromLayout(cityLayout, 20);
  }
  game.askingCategory = false;
  game.pendingTriple = null;
  game.pendingCategory = null;
  game.message = "";
  game.cityTimeLeftMs = CITY_TIME_LIMIT_MS;
  game.level3TimeLeftMs = LEVEL3_TIME_LIMIT_MS;
  game.level3Progress = { plastic: 0, paper: 0, food: 0, general: 0 };
  game.leaderboardStage = "";
  game.leaderboardRecords = [];
  game.leaderboardMessage = "";
  game.scoreSubmitted = false;
  if (mapLevel === 1) {
    game.tutorialActive = true;
    tutorialPage = 0;
  } else {
    game.tutorialActive = false;
  }
}

function generateTutorialTiles() {
  const kinds = [];
  for (let kind = 0; kind < 3; kind++) kinds.push(kind, kind, kind, kind, kind, kind);
  shuffle(kinds);
  const positions = [];
  const centerX = W / 2;
  const centerY = 400;
  for (const oy of [-2, 0, 2]) {
    for (const ox of [-2, 0, 2]) {
      positions.push([0, centerX + ox * TILE_W - TILE_W / 2, centerY + oy * TILE_H - TILE_H / 2]);
    }
  }
  for (const oy of [-2, 0, 2]) {
    for (const ox of [-2, 0, 2]) {
      positions.push([1, centerX + ox * TILE_W - TILE_W / 2, centerY + oy * TILE_H - TILE_H / 2 + 6]);
    }
  }
  return positions.map(([layer, x, y], i) => createTile(i, kinds[i], layer, x, y));
}

function generateTilesFromLayout(layout, typeCount) {
  const totalPositions = layout.reduce((sum, layer) => sum + layer.length, 0);
  const totalTriplets = Math.floor(totalPositions / 3);
  const baseTriplets = Math.floor(totalTriplets / typeCount);
  const extraTriplets = totalTriplets % typeCount;
  const tripletsPerKind = Array(typeCount).fill(baseTriplets);
  const extraKinds = Array.from({ length: typeCount }, (_, i) => i);
  shuffle(extraKinds);
  for (let i = 0; i < extraTriplets; i++) tripletsPerKind[extraKinds[i]] += 1;

  const kinds = [];
  tripletsPerKind.forEach((count, kind) => {
    for (let i = 0; i < count * 3; i++) kinds.push(kind);
  });
  shuffle(kinds);

  const tiles = [];
  let idx = 0;
  layout.forEach((positions, layer) => {
    positions.forEach(([x, y]) => {
      tiles.push(createTile(idx, kinds[idx], layer, x, y));
      idx += 1;
    });
  });
  return tiles;
}

function generateLevel3Tiles() {
  const kinds = [];
  for (const [category, count] of Object.entries(level3Tasks)) {
    const pool = level3KindPools[category];
    for (let i = 0; i < count; i++) kinds.push(pool[i % pool.length], pool[i % pool.length], pool[i % pool.length]);
  }
  shuffle(kinds);
  const positions = level3Layout.flatMap((layerPositions, layer) => layerPositions.map(([x, y]) => [layer, x, y]));
  return kinds.map((kind, i) => createTile(i, kind, positions[i][0], positions[i][1], positions[i][2]));
}

function limitLayout(layout, maxPositions) {
  const limited = [];
  let remaining = maxPositions;
  for (const layer of layout) {
    if (remaining <= 0) break;
    const part = layer.slice(0, remaining);
    if (part.length) limited.push(part);
    remaining -= part.length;
  }
  return limited;
}

function createTile(id, kind, layer, x, y) {
  return {
    id,
    kind,
    layer,
    x,
    y,
    drawX: x,
    drawY: y,
    w: TILE_W,
    h: TILE_H,
    alive: true,
    state: "board",
    target: null,
  };
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function getStackLayout() {
  return { x: 29, y: H - 106 - 50, firstX: 57, firstY: H - 106 - 50 + 16 };
}

function reserveStack(kind) {
  const layout = getStackLayout();
  const category = categoryByKind[kind] || "general";
  let insertAt = game.stack.length;
  for (let i = game.stack.length - 1; i >= 0; i--) {
    if ((categoryByKind[game.stack[i].kind] || "general") === category) {
      insertAt = i + 1;
      break;
    }
  }
  const slot = game.stack.length;
  const item = {
    kind,
    x: layout.firstX + slot * 48,
    y: layout.firstY,
    visible: true,
  };
  game.stack.splice(insertAt, 0, item);
  relayoutStack();
  return item;
}

function findTriple() {
  const counts = new Map();
  for (const item of game.stack) {
    const category = categoryByKind[item.kind] || "general";
    const list = counts.get(category) || [];
    list.push(item);
    counts.set(category, list);
    if (list.length >= 3) return list.slice(0, 3);
  }
  return null;
}

function askCategory(triple) {
  game.askingCategory = true;
  game.pendingTriple = triple;
  game.pendingCategory = categoryByKind[triple[0].kind] || "general";
  game.message = "";
}

function answerCategory(category) {
  const correct = game.pendingCategory;
  if (category === correct) {
    game.score += 10;
    if (game.level === 3 && Object.prototype.hasOwnProperty.call(game.level3Progress, correct)) {
      game.level3Progress[correct] = Math.min(level3Tasks[correct], game.level3Progress[correct] + 1);
    }
    flashMessage("答對了！+10", 1200);
  } else {
    game.score -= 5;
    if (game.level === 3) {
      game.level3TimeLeftMs = Math.max(0, game.level3TimeLeftMs - 8000);
      flashMessage(`分類錯誤：正確是 ${categoryNames[correct]}，-5分，-8秒`, 1500);
    } else if (game.selectedMapLevel === 4) {
      game.cityTimeLeftMs = Math.max(0, game.cityTimeLeftMs - 5000);
      flashMessage(`分類錯誤：正確是 ${categoryNames[correct]}，-5分，-5秒`, 1500);
    } else {
      flashMessage(`分類錯誤：正確是 ${categoryNames[correct]}，-5分`, 1500);
    }
  }

  const remove = new Set(game.pendingTriple);
  game.stack = game.stack.filter((item) => !remove.has(item));
  relayoutStack();
  game.askingCategory = false;
  game.pendingTriple = null;
  game.pendingCategory = null;
  if (game.level === 3 && level3TaskOrder.every((cat) => game.level3Progress[cat] >= level3Tasks[cat])) {
    finishLevel("win");
    return;
  }
  checkClearOrLose();
}

function relayoutStack() {
  const layout = getStackLayout();
  game.stack.forEach((item, i) => {
    item.x = layout.firstX + i * 48;
    item.y = layout.firstY;
  });
}

function flashMessage(text, ms) {
  game.message = text;
  game.messageUntil = performance.now() + ms;
}

function checkClearOrLose() {
  if (game.tiles.every((t) => !t.alive) && game.stack.length === 0) {
    finishLevel("win");
  } else if (game.stack.length >= STACK_CAPACITY) {
    game.endResult = "lose";
    game.state = "end";
  }
}

function finishLevel(result) {
  if (result === "win") {
    game.cleared.add(game.selectedMapLevel);
    const next = currentMapLevel();
    const nextPos = levelMapPos[next] || levelMapPos[4];
    game.mapPlayerX = nextPos.x;
    game.mapPlayerY = nextPos.y - 28;
  }
  game.endResult = result;
  if (result === "win" && !game.scoreSubmitted) {
    game.scoreSubmitted = true;
    game.leaderboardStage = stageName();
    game.leaderboardRecords = [];
    game.leaderboardMessage = "Saving score...";
    game.state = "leaderboard";
    submitScore(stageName(), game.score);
  } else {
    game.state = "end";
  }
}

function drawStart(time) {
  drawImageFit(images.bg, 0, 0, W, H);
  drawImageFit(images.title, -25, -50, 500, 500);

  const centerX = W / 2;
  const centerY = H / 2 + 40;
  const radius = 100;
  const frameIndex = Math.floor(time / 200) % 3;
  const circleAngle = time * 0.0015;
  for (let i = 0; i < 4; i++) {
    const angle = circleAngle + (i - 1.5) * 0.5;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    const flip = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) <= Math.PI;
    drawImageCentered(images[`player${(frameIndex + i) % 3}`], x, y, 100, 100, flip);
  }

  const buttonRect = getStartButtonRect();
  const hovering = pointInRect(mouse, buttonRect);
  const scale = hovering ? 0.8 : 0.7;
  drawImageCentered(images.start, W / 2, H - 140, 500 * scale, 500 * scale);
}

function drawLogin() {
  drawImageFit(images.bg, 0, 0, W, H);
  ctx.fillStyle = "rgba(255,245,218,.82)";
  ctx.fillRect(0, 0, W, H);
  roundRect(38, 165, W - 76, 500, 18, "#fff8e0", "#463723", 4);
  drawPixel("TRASH HUNTER", 30, W / 2, 225, "#463723");
  drawPixel(authMode === "login" ? "LOGIN" : "REGISTER", 22, W / 2, 268, "#463723");

  roundRect(70, 330, W - 140, 48, 8, "#fff", loginFocus === "name" ? "#2e8a67" : "#5a4b32", 3);
  drawText("NAME", 20, 70, 306, "#8a7b66", "left");
  drawText(loginName, 22, 84, 354, "#222", "left");
  if (loginFocus === "name") drawText("|", 24, 84 + Math.min(250, loginName.length * 13), 354, "#222", "left");

  roundRect(70, 412, W - 140, 48, 8, "#fff", loginFocus === "password" ? "#2e8a67" : "#5a4b32", 3);
  drawText("PASSWORD", 20, 70, 388, "#8a7b66", "left");
  drawText("*".repeat(loginPassword.length), 22, 84, 436, "#222", "left");
  if (loginFocus === "password") drawText("|", 24, 84 + Math.min(250, loginPassword.length * 13), 436, "#222", "left");

  if (authMessage) drawText(authMessage, 15, W / 2, 485, "#b84536");

  roundRect(125, 515, W - 250, 52, 10, "#f5c640", "#463723", 3);
  drawPixel(authMode === "login" ? "LOGIN" : "REGISTER", 21, W / 2, 541, "#463723");
  roundRect(125, 578, W - 250, 42, 10, "#ffebaa", "#5a4b32", 2);
  drawPixel(authMode === "login" ? "REGISTER" : "BACK", 16, W / 2, 599, "#463723");
  roundRect(125, 630, W - 250, 42, 10, "#ffebaa", "#5a4b32", 2);
  drawPixel("QUICK START", 16, W / 2, 651, "#463723");
}

function getStartButtonRect() {
  return { x: W / 2 - 175, y: H - 140 - 175, w: 350, h: 350 };
}

function drawMap() {
  drawImageFit(images.map, 0, 0, W, H);
  drawRankingsButton();
  const current = currentMapLevel();
  for (const [key, pos] of Object.entries(levelMapPos)) {
    const n = Number(key);
    const unlocked = n === 1 || game.cleared.has(n - 1);
    const cleared = game.cleared.has(n);
    const hover = distance(mouse.x, mouse.y, pos.x, pos.y) <= 24;
    const fill = cleared ? "#66cd78" : unlocked ? (hover ? "#ffdf5c" : "#f2c641") : "#888";
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 28, 0, Math.PI * 2);
    ctx.fillStyle = "#463723";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 24, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    drawPixel(String(n), 22, pos.x, pos.y, "#463723");
    if (n === current) {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y - 54, 17, 0, Math.PI * 2);
      ctx.fillStyle = "#d22824";
      ctx.fill();
      drawPixel("!", 28, pos.x, pos.y - 55, "#fff");
    }
    const labelW = n === 3 ? 150 : 118;
    const labelY = pos.y + 48;
    roundRect(pos.x - labelW / 2, labelY - 14, labelW, 28, 7, "#fff8e0", "#463723", 2);
    drawText(pos.label, 15, pos.x, labelY, "#463723", "center", true);
  }
  drawImageCentered(
    images[`player${game.mapWalkIndex}`],
    game.mapPlayerX,
    game.mapPlayerY - 50,
    100,
    100,
    game.mapFacing < 0
  );
  if (game.mapMessage && performance.now() < game.mapMessageUntil) {
    roundRect(35, 44, 380, 54, 10, "#fff", "#555", 2);
    drawText(game.mapMessage, 20, W / 2, 71, "#333");
  }
}

function drawRankingsButton() {
  const r = { x: W - 150, y: 18, w: 128, h: 42 };
  roundRect(r.x, r.y, r.w, r.h, 8, pointInRect(mouse, r) ? "#ffdf5c" : "#f5c640", "#463723", 3);
  drawPixel("RANKINGS", 17, r.x + r.w / 2, r.y + r.h / 2, "#463723");
}

function drawTutorial() {
  ctx.fillStyle = "rgba(0,0,0,.55)";
  ctx.fillRect(0, 0, W, H);
  roundRect(38, 250, W - 76, 300, 3, "rgba(255,248,224,.96)", "#463723", 3);
  drawText("新手提示", 27, W / 2, 292, "#463723", "center", true);
  if (tutorialPage === 0) {
    drawText("點選垃圾卡牌，把垃圾送進下方垃圾車。", 19, W / 2, 342, "#6f6659");
    drawText("集滿三個同類垃圾後，選對分類可加 10 分。", 19, W / 2, 376, "#6f6659");
    for (let i = 0; i < 3; i++) roundRect(112 + i * 34, 418, 24, 38, 4, "#ffdf63", "#463723", 3);
    ctx.strokeStyle = "#463723";
    ctx.lineWidth = 6;
    line(224, 438, 285, 438);
    ctx.beginPath();
    ctx.moveTo(285, 438);
    ctx.lineTo(266, 425);
    ctx.lineTo(266, 451);
    ctx.closePath();
    ctx.fillStyle = "#463723";
    ctx.fill();
    roundRect(313, 407, 74, 46, 4, "#397a38", "#463723", 3);
    ctx.beginPath();
    ctx.arc(330, 459, 7, 0, Math.PI * 2);
    ctx.arc(369, 459, 7, 0, Math.PI * 2);
    ctx.fillStyle = "#463723";
    ctx.fill();
    drawText("三張同類", 17, 139, 486, "#8a7b66");
    drawText("選分類", 17, 350, 486, "#8a7b66");
    drawSmallButton(72, 492, 118, 42, "SKIP");
    drawSmallButton(W - 190, 492, 118, 42, "NEXT");
  } else {
    drawText("若暫時卡住，可以使用洗牌。", 21, W / 2, 354, "#6f6659");
    drawText("點右上角的洗牌按鈕，重新排列卡牌。", 19, W / 2, 390, "#6f6659");
    drawSmallButton(W / 2 - 76, 430, 152, 52, "SHUFFLE -30");
    roundRect(W / 2 - 76, 496, 152, 42, 7, pointInRect(mouse, { x: W / 2 - 76, y: 496, w: 152, h: 42 }) ? "#ff6b61" : "#e94b43", "#463723", 3);
    drawPixel("START", 20, W / 2, 517, "#fff");
  }
}

function drawSmallButton(x, y, w, h, label) {
  roundRect(x, y, w, h, 7, pointInRect(mouse, { x, y, w, h }) ? "#ffdf5c" : "#f5c640", "#463723", 3);
  drawPixel(label, 18, x + w / 2, y + h / 2, "#463723");
}

function drawPlay() {
  drawImageFit(currentLevelBg(), 0, 0, W, H);
  drawPlayHud();

  for (const tile of game.tiles) {
    if (tile.alive) drawTile(tile);
  }

  drawStack();

  if (game.askingCategory) {
    ctx.fillStyle = "rgba(0,0,0,.36)";
    ctx.fillRect(0, 0, W, H);
    roundRect(38, 188, 374, 82, 4, "#101224", "#fff8e0", 3);
    drawText("三個同類垃圾", 22, W / 2, 220, "#eeeeee", "center", true);
    drawText("請選擇正確分類", 22, W / 2, 250, "#f4d34d", "center", true);
    drawPendingTriple();
    drawText("這三個垃圾屬於哪一類？", 30, W / 2, 510, "#fff", "center", true);
    drawBins();
  }

  if (game.message && performance.now() < game.messageUntil) {
    roundRect(25, 95, 400, 60, 12, "#fff", "#555", 2);
    drawText(game.message, 20, W / 2, 125, "#333");
  }
}

function currentLevelBg() {
  if (game.selectedMapLevel === 3) return images.storeBg || images.bg;
  if (game.selectedMapLevel === 4) return images.nightBg || images.bg;
  return images.bg;
}

function drawPlayHud() {
  if (game.level === 3) {
    roundRect(8, 14, 142, 76, 0, "rgba(18,24,34,.45)", null, 0);
    drawPixel(`SCORE ${game.score}`, 21, 15, 30, "#fff", "left");
    drawPixel(`TIME ${Math.ceil(game.level3TimeLeftMs / 1000).toString().padStart(2, "0")}`, 21, 15, 66, "#fff", "left");
    drawLevelBadge(images.level2);
    let x = 18;
    for (const category of level3TaskOrder) {
      const done = game.level3Progress[category] >= level3Tasks[category];
      roundRect(x, 120, 96, 32, 5, done ? "#4b9669" : "#fff8e0", done ? "#ffdc78" : "#5f4b37", 2);
      drawText(`${categoryNames[category]} ${game.level3Progress[category]}/${level3Tasks[category]}`, 13, x + 48, 136, done ? "#fff" : "#372d23");
      x += 104;
    }
  } else if (game.selectedMapLevel === 4) {
    roundRect(8, 14, 142, 76, 0, "rgba(255,248,224,.54)", null, 0);
    drawPixel(`SCORE ${game.score}`, 21, 15, 30, "#fff", "left");
    drawPixel(`TIME ${Math.ceil(game.cityTimeLeftMs / 1000).toString().padStart(2, "0")}`, 21, 15, 66, "#ffe882", "left");
    drawLevelBadge(images.level2);
  } else {
    drawPixel(`SCORE ${game.score}`, 24, 24, 52, "#111", "left");
    drawLevelBadge(game.level === 1 ? images.level1 : images.level2);
  }
  drawShuffleButton();
}

function drawLevelBadge(img) {
  drawImageFit(img, 100, -26, 250, 250);
}

function drawShuffleButton() {
  const r = { x: W - 116, y: 18, w: 96, h: 36 };
  const enabled = game.score >= SHUFFLE_COST;
  roundRect(r.x, r.y, r.w, r.h, 4, enabled ? (pointInRect(mouse, r) ? "#ffdf5c" : "#f2c641") : "#afa89b", enabled ? "#503c23" : "#69645c", 3);
  drawText("SHUFFLE -30", 14, r.x + r.w / 2, r.y + r.h / 2, enabled ? "#503c23" : "#f5f0e1", "center", true);
}

function drawTile(tile) {
  const img = images[`card${tile.kind}`];
  drawImageFit(img, tile.x, tile.y, TILE_W, TILE_H);
  if (!isTileClickable(tile)) {
    ctx.fillStyle = "rgba(0,0,0,.42)";
    ctx.fillRect(tile.x, tile.y, TILE_W, TILE_H);
  } else if (pointInRect(mouse, tile)) {
    ctx.strokeStyle = "#fff57a";
    ctx.lineWidth = 3;
    ctx.strokeRect(tile.x + 1, tile.y + 1, TILE_W - 2, TILE_H - 2);
  }
}

function isTileClickable(tile) {
  if (!tile.alive || tile.state !== "board") return false;
  for (const other of game.tiles) {
    if (!other.alive || other.state !== "board" || other.layer <= tile.layer) continue;
    if (rectsOverlap(tile, other)) return false;
  }
  return true;
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function drawStack() {
  const layout = getStackLayout();
  drawImageFit(images.trashcar, layout.x, layout.y, 392, 106);
  for (const item of game.stack) {
    drawImageFit(images[`card${item.kind}`], item.x, item.y, TILE_W, TILE_H);
  }
}

function getBins() {
  const bins = [];
  const binW = 126;
  const binH = 58;
  const gapX = 9;
  const gapY = 12;
  const columns = 3;
  const startX = 27;
  const startY = 535;
  for (let i = 0; i < binOrder.length; i++) {
    const row = Math.floor(i / columns);
    let col = i % columns;
    if (binOrder[i] === "food") col = 1;
    bins.push({ category: binOrder[i], x: startX + col * (binW + gapX), y: startY + row * (binH + gapY), w: binW, h: binH });
  }
  return bins;
}

function drawBins() {
  for (const bin of getBins()) {
    const hover = pointInRect(mouse, bin);
    roundRect(bin.x + 5, bin.y + 5, bin.w, bin.h, 6, "rgba(20,25,25,.88)", null, 0);
    roundRect(bin.x, bin.y, bin.w, bin.h, 6, brighten(binColors[bin.category], hover ? 28 : 0), "#f5f5dc", 3);
    drawCategoryIcon(bin.category, bin.x + 28, bin.y + bin.h / 2);
    drawText(categoryNames[bin.category], 18, bin.x + 55, bin.y + bin.h / 2, "#fff", "left", true);
  }
}

function drawPendingTriple() {
  if (!game.pendingTriple) return;
  const cardW = 78;
  const cardH = 96;
  const gap = 16;
  const totalW = cardW * 3 + gap * 2;
  const startX = (W - totalW) / 2;
  const y = 300;
  game.pendingTriple.slice(0, 3).forEach((item, i) => {
    const x = startX + i * (cardW + gap);
    roundRect(x + 5, y + 6, cardW, cardH, 6, "rgba(20,22,20,.85)", null, 0);
    roundRect(x, y, cardW, cardH, 6, "#ffde23", null, 0);
    roundRect(x + 5, y + 5, cardW - 10, cardH - 10, 4, "#ebeada", null, 0);
    drawImageFit(images[`card${item.kind}`], x + 15, y + 12, TILE_W + 10, TILE_H + 12);
  });
}

function drawCategoryIcon(category, cx, cy) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#284532";
  ctx.fillStyle = "#efffde";
  ctx.lineWidth = 3;
  if (category === "general") {
    drawText("♻", 27, cx, cy + 1, "#284532", "center", true);
  } else if (category === "metal") {
    roundRect(cx - 8, cy - 14, 16, 28, 4, "#e4edf0", "#284532", 2);
    ctx.fillStyle = "#58aa5c";
    ctx.beginPath();
    ctx.arc(cx, cy + 2, 5, 0, Math.PI * 2);
    ctx.fill();
  } else if (category === "plastic") {
    ctx.beginPath();
    ctx.moveTo(cx, cy - 16);
    ctx.lineTo(cx - 16, cy + 12);
    ctx.lineTo(cx + 16, cy + 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    drawPixel("1", 15, cx, cy + 2, "#284532");
  } else if (category === "paper") {
    roundRect(cx - 12, cy - 15, 21, 28, 2, "#fff4ce", "#284532", 2);
    for (let i = 0; i < 3; i++) {
      line(cx - 8, cy - 5 + i * 7, cx + 5, cy - 5 + i * 7);
    }
  } else if (category === "glass") {
    roundRect(cx - 10, cy - 8, 20, 24, 5, "#bcefdc", "#284532", 2);
    roundRect(cx - 5, cy - 15, 10, 8, 2, "#cff7e8", "#284532", 2);
  } else if (category === "hazard") {
    ctx.strokeStyle = "#284532";
    ctx.lineWidth = 6;
    line(cx - 12, cy - 12, cx + 12, cy + 12);
    line(cx + 12, cy - 12, cx - 12, cy + 12);
    ctx.strokeStyle = "#ff3030";
    ctx.lineWidth = 3;
    line(cx - 12, cy - 12, cx + 12, cy + 12);
    line(cx + 12, cy - 12, cx - 12, cy + 12);
  } else if (category === "food") {
    ctx.fillStyle = "#e7f3b7";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2, 10, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    roundRect(cx - 3, cy - 16, 6, 7, 2, "#284532", null, 0);
  }
  ctx.restore();
}

function line(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawEnd(time) {
  drawImageFit(images.bg, 0, 0, W, H);
  const frames = game.endResult === "win" ? assetPaths.win : assetPaths.lose;
  const key = game.endResult === "win" ? `win${Math.floor(time / 140) % frames.length}` : `lose${Math.floor(time / 140) % frames.length}`;
  drawImageFit(images[key], 25, 70, 400, 400);
  drawPixel(`SCORE ${game.score}`, 28, W / 2, 465, "#223");
  drawLeaderboardPanel();
  drawImageCentered(images.restart, W / 2, H - 110, 310, 310);
}

function drawLeaderboardPanel() {
  if (game.endResult !== "win") return;
  roundRect(52, 505, 346, 120, 10, "rgba(255,248,224,.92)", "#463723", 3);
  drawText(game.leaderboardStage || "Leaderboard", 18, W / 2, 526, "#463723", "center", true);
  drawText(game.leaderboardMessage || "Saving score...", 13, W / 2, 548, "#5c4a32");

  if (!game.leaderboardRecords.length) {
    drawText("Loading...", 16, W / 2, 586, "#463723");
    return;
  }

  game.leaderboardRecords.slice(0, 3).forEach((record, i) => {
    const y = 572 + i * 18;
    drawText(`${i + 1}. ${record.name}`, 15, 82, y, "#463723", "left", true);
    drawText(String(record.score), 15, 365, y, "#463723", "right", true);
  });
}

function drawLeaderboardScreen() {
  drawImageFit(images.bg, 0, 0, W, H);
  ctx.fillStyle = "rgba(255,248,224,.82)";
  ctx.fillRect(0, 0, W, H);

  roundRect(28, 138, W - 56, 560, 18, "#fff8e0", "#463723", 4);
  drawPixel("LEADERBOARD", 31, W / 2, 205, "#463723");
  drawText(game.leaderboardStage || "Tutorial", 24, W / 2, 270, "#8a7b66");
  drawPixel(`YOUR SCORE ${game.score}`, 24, W / 2, 318, "#2e7d57");

  const records = game.leaderboardRecords.length
    ? game.leaderboardRecords
    : [{ name: playerName || "Guest", score: game.score }];

  records.slice(0, 7).forEach((record, i) => {
    const y = 380 + i * 46;
    const isMine = (record.name || "Guest") === (playerName || "Guest") && Number(record.score) === game.score;
    roundRect(58, y - 24, W - 116, 40, 6, isMine || i === 0 ? "#ffdf63" : "#fff3c8", isMine ? "#2e8a67" : "#b78a38", 3);
    drawPixel(`${i + 1}.`, 20, 84, y - 2, "#463723");
    drawText((record.name || "Guest").slice(0, 12), 21, 154, y - 2, "#8a7b66", "left");
    drawPixel(String(record.score ?? 0), 20, 348, y - 2, "#463723", "right");
  });

  if (!game.leaderboardRecords.length && game.leaderboardMessage) {
    drawText(game.leaderboardMessage, 15, W / 2, 450, "#8a7b66");
  }

  drawSmallButton(W / 2 - 95, 616, 190, 48, "CONTINUE");
}

function drawRankings() {
  drawImageFit(images.map, 0, 0, W, H);
  ctx.fillStyle = "rgba(255,245,218,.92)";
  ctx.fillRect(0, 0, W, H);
  roundRect(30, 74, W - 60, 620, 16, "#fff8e0", "#463723", 4);
  drawPixel("RANKINGS", 32, W / 2, 119, "#463723");
  drawText(rankingMessage || "玩家最高分排行", 18, W / 2, 162, "#463723");
  if (!rankingRecords.length) {
    drawPixel("NO RECORDS YET", 22, W / 2, 320, "#785a41");
  } else {
    rankingRecords.slice(0, 9).forEach((record, i) => {
      const y = 205 + i * 43;
      roundRect(54, y - 18, W - 108, 36, 7, i % 2 ? "#fff3c8" : "#ffebaa", "#785a41", 2);
      drawPixel(`${i + 1}.`, 17, 76, y, "#463723");
      drawText(record.name.slice(0, 10), 17, 104, y, "#463723", "left", true);
      drawText(record.stage, 15, 228, y, "#463723", "left");
      drawPixel(String(record.score), 17, 360, y, "#463723");
    });
  }
  drawSmallButton(W / 2 - 90, H - 92, 180, 46, "BACK TO MAP");
}

function drawSettings() {
  ctx.fillStyle = "rgba(0,0,0,.42)";
  ctx.fillRect(0, 0, W, H);
  roundRect(55, 230, W - 110, 330, 10, "#fff8e0", "#463723", 3);
  drawPixel("SETTINGS", 28, W / 2, 275, "#463723");
  drawSmallButton(W / 2 - 105, 335, 210, 46, musicEnabled ? "MUSIC ON" : "MUSIC OFF");
  if (game.state !== "map" && game.state !== "login" && game.state !== "rankings") {
    drawSmallButton(W / 2 - 105, 405, 210, 46, "BACK TO MAP");
  }
  drawSmallButton(W / 2 - 105, 475, 210, 46, "LOG OUT");
}

function update(dt) {
  if (game.message && performance.now() >= game.messageUntil) game.message = "";
  updateMapPlayer(dt);
  if (game.state !== "play" || game.askingCategory) return;

  if (game.level === 3) {
    game.level3TimeLeftMs = Math.max(0, game.level3TimeLeftMs - dt);
    if (game.level3TimeLeftMs <= 0) {
      game.endResult = "lose";
      game.state = "end";
    }
  } else if (game.selectedMapLevel === 4) {
    game.cityTimeLeftMs = Math.max(0, game.cityTimeLeftMs - dt);
    if (game.cityTimeLeftMs <= 0) {
      game.endResult = "lose";
      game.state = "end";
    }
  }
}

function updateMapPlayer(dt) {
  if (game.state !== "map") return;

  let moveX = 0;
  let moveY = 0;
  if (keysDown.has("arrowright") || keysDown.has("d")) moveX += 1;
  if (keysDown.has("arrowleft") || keysDown.has("a")) moveX -= 1;
  if (keysDown.has("arrowdown") || keysDown.has("s")) moveY += 1;
  if (keysDown.has("arrowup") || keysDown.has("w")) moveY -= 1;

  if (moveX === 0 && moveY === 0) {
    game.mapWalkTimer = 0;
    game.mapWalkIndex = 0;
    return;
  }

  const length = Math.hypot(moveX, moveY) || 1;
  moveX /= length;
  moveY /= length;
  game.mapPlayerX = Math.max(28, Math.min(W - 28, game.mapPlayerX + moveX * 0.25 * dt));
  game.mapPlayerY = Math.max(70, Math.min(H - 18, game.mapPlayerY + moveY * 0.25 * dt));

  if (moveX < 0) game.mapFacing = -1;
  else if (moveX > 0) game.mapFacing = 1;

  game.mapWalkTimer += dt;
  if (game.mapWalkTimer >= 200) {
    game.mapWalkTimer = 0;
    game.mapWalkIndex = (game.mapWalkIndex + 1) % 3;
  }
}

function loop(time) {
  const dt = time - lastTime;
  lastTime = time;
  update(dt);

  if (game.state === "loading") drawLoading();
  else if (game.state === "login") drawLogin();
  else if (game.state === "start") drawStart(time);
  else if (game.state === "map") drawMap(time);
  else if (game.state === "rankings") drawRankings();
  else if (game.state === "play") drawPlay(time);
  else if (game.state === "leaderboard") drawLeaderboardScreen();
  else if (game.state === "end") drawEnd(time);

  updateMusicForState();
  drawGear();
  if (game.tutorialActive) drawTutorial();
  if (settingsOpen) drawSettings();
  updateLoginDomInputs();
  requestAnimationFrame(loop);
}

function drawGear() {
  ctx.beginPath();
  ctx.arc(W - 37, 87, 23, 0, Math.PI * 2);
  ctx.fillStyle = "#463723";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(W - 37, 87, 20, 0, Math.PI * 2);
  ctx.fillStyle = "#ffe696";
  ctx.fill();
  drawImageFit(images.gear, W - 52, 72, 30, 30);
  if (!musicEnabled) {
    ctx.strokeStyle = "#d53c36";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(W - 51, 73);
    ctx.lineTo(W - 23, 101);
    ctx.stroke();
  }
}

function canvasPoint(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (clientX - rect.left) * W / rect.width,
    y: (clientY - rect.top) * H / rect.height,
  };
}

function pointInRect(p, r) {
  return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
}

function distance(x1, y1, x2, y2) {
  return Math.hypot(x1 - x2, y1 - y2);
}

function brighten(hex, amount) {
  const n = Number.parseInt(hex.slice(1), 16);
  const r = Math.min(255, (n >> 16) + amount);
  const g = Math.min(255, ((n >> 8) & 255) + amount);
  const b = Math.min(255, (n & 255) + amount);
  return `rgb(${r},${g},${b})`;
}

canvas.addEventListener("mousemove", (event) => {
  mouse = canvasPoint(event.clientX, event.clientY);
});

canvas.addEventListener("click", async (event) => {
  unlockAudio();
  mouse = canvasPoint(event.clientX, event.clientY);

  if (distance(mouse.x, mouse.y, W - 37, 87) <= 24) {
    settingsOpen = !settingsOpen;
    return;
  }

  if (settingsOpen) {
    if (pointInRect(mouse, { x: W / 2 - 105, y: 335, w: 210, h: 46 })) toggleMusic();
    else if (pointInRect(mouse, { x: W / 2 - 105, y: 405, w: 210, h: 46 })) {
      game.state = "map";
      settingsOpen = false;
    } else if (pointInRect(mouse, { x: W / 2 - 105, y: 475, w: 210, h: 46 })) {
      localStorage.removeItem("trashHunterPlayerName");
      playerName = "";
      game.state = "login";
      settingsOpen = false;
    } else {
      settingsOpen = false;
    }
    return;
  }

  if (game.tutorialActive) {
    if (tutorialPage === 0 && pointInRect(mouse, { x: 72, y: 492, w: 118, h: 42 })) game.tutorialActive = false;
    else if (tutorialPage === 0 && pointInRect(mouse, { x: W - 190, y: 492, w: 118, h: 42 })) tutorialPage = 1;
    else if (tutorialPage === 1 && pointInRect(mouse, { x: W / 2 - 76, y: 496, w: 152, h: 42 })) game.tutorialActive = false;
    return;
  }

  if (game.state === "login") {
    if (pointInRect(mouse, { x: 70, y: 330, w: W - 140, h: 48 })) {
      focusLoginDomInput("name");
      return;
    }
    if (pointInRect(mouse, { x: 70, y: 412, w: W - 140, h: 48 })) {
      focusLoginDomInput("password");
      return;
    }
    if (pointInRect(mouse, { x: 125, y: 515, w: W - 250, h: 52 })) {
      blurLoginDomInputs();
      try {
        const loggedIn = authMode === "login"
          ? await loginPlayer(loginName, loginPassword)
          : await registerPlayer(loginName, loginPassword);
        finishAuth(loggedIn);
      } catch (error) {
        authMessage = error.message || "登入失敗";
      }
    } else if (pointInRect(mouse, { x: 125, y: 578, w: W - 250, h: 42 })) {
      authMode = authMode === "login" ? "register" : "login";
      authMessage = "";
      focusLoginDomInput(loginFocus);
    } else if (pointInRect(mouse, { x: 125, y: 630, w: W - 250, h: 42 })) {
      blurLoginDomInputs();
      finishAuth("Player");
    }
    return;
  }

  if (game.state === "start") {
    game.state = "map";
    game.tutorialActive = true;
    tutorialPage = 0;
    return;
  }

  if (game.state === "map") {
    if (pointInRect(mouse, { x: W - 150, y: 18, w: 128, h: 42 })) {
      await loadOverallRankings();
      return;
    }
    for (const [key, pos] of Object.entries(levelMapPos)) {
      const n = Number(key);
      if (distance(mouse.x, mouse.y, pos.x, pos.y) <= 28) {
        if (n === 1 || game.cleared.has(n - 1)) startLevel(n);
        else {
          game.mapMessage = "請先完成前一關";
          game.mapMessageUntil = performance.now() + 1500;
        }
      }
    }
    return;
  }

  if (game.state === "rankings") {
    if (pointInRect(mouse, { x: W / 2 - 90, y: H - 92, w: 180, h: 46 })) game.state = "map";
    return;
  }

  if (game.state === "leaderboard") {
    if (pointInRect(mouse, { x: W / 2 - 95, y: 616, w: 190, h: 48 })) game.state = "map";
    return;
  }

  if (game.state === "end") {
    if (pointInRect(mouse, { x: W / 2 - 175, y: H - 145 - 175, w: 350, h: 350 })) game.state = "map";
    return;
  }

  if (game.state !== "play") return;

  if (game.askingCategory) {
    const bin = getBins().find((b) => pointInRect(mouse, b));
    if (bin) answerCategory(bin.category);
    return;
  }

  if (pointInRect(mouse, { x: W - 116, y: 18, w: 96, h: 36 })) {
    if (game.score < SHUFFLE_COST) {
      flashMessage("需要 30 分才能洗牌", 1200);
      return;
    }
    game.score -= SHUFFLE_COST;
    const liveTiles = game.tiles.filter((tile) => tile.alive);
    const kinds = liveTiles.map((tile) => tile.kind);
    shuffle(kinds);
    liveTiles.forEach((tile, i) => {
      tile.kind = kinds[i];
    });
    playShuffleSound();
    flashMessage("已洗牌：-30", 1000);
    return;
  }

  const clicked = [...game.tiles]
    .sort((a, b) => b.layer - a.layer)
    .find((tile) => tile.alive && isTileClickable(tile) && pointInRect(mouse, tile));
  if (clicked) {
    if (game.stack.length >= STACK_CAPACITY) {
      game.endResult = "lose";
      game.state = "end";
      return;
    }
    clicked.alive = false;
    reserveStack(clicked.kind);
    const triple = findTriple();
    if (triple) askCategory(triple);
    else checkClearOrLose();
  }
});

window.addEventListener("keydown", async (event) => {
  if (game.state === "login") {
    const fromLoginInput = event.target === loginNameInput || event.target === loginPasswordInput;
    if (event.key === "Tab") {
      event.preventDefault();
      focusLoginDomInput(loginFocus === "name" ? "password" : "name");
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      blurLoginDomInputs();
      try {
        const loggedIn = authMode === "login"
          ? await loginPlayer(loginName, loginPassword)
          : await registerPlayer(loginName, loginPassword);
        finishAuth(loggedIn);
      } catch (error) {
        authMessage = error.message || "登入失敗";
      }
      return;
    }
    if (fromLoginInput) return;
    if (event.key === "Backspace") {
      event.preventDefault();
      if (loginFocus === "name") loginName = loginName.slice(0, -1);
      else loginPassword = loginPassword.slice(0, -1);
      syncLoginDomInputs();
      return;
    }
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      if (loginFocus === "name") loginName = (loginName + event.key).slice(0, 20);
      else loginPassword = (loginPassword + event.key).slice(0, 32);
      syncLoginDomInputs();
      return;
    }
  }

  keysDown.add(event.key.toLowerCase());
  if (event.key === "F11" || (event.key === "Enter" && event.altKey)) {
    event.preventDefault();
    await toggleFullscreen();
  }
});

window.addEventListener("keyup", (event) => {
  keysDown.delete(event.key.toLowerCase());
});

window.addEventListener("blur", () => {
  keysDown.clear();
});

async function toggleFullscreen() {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen().catch(() => {});
    document.body.classList.add("fullscreen");
  } else {
    await document.exitFullscreen().catch(() => {});
    document.body.classList.remove("fullscreen");
  }
}

document.addEventListener("fullscreenchange", () => {
  document.body.classList.toggle("fullscreen", Boolean(document.fullscreenElement));
});

drawLoading();
loadAssets();
