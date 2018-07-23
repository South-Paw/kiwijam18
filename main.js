"use strict"

var levelNumber = 0;

window.lookupTable = [
  [34, 35, 46, 47],
  [84, 85, 96, 97],
  [76, 77, 88, 89],
  [104, 105, 116, 117],
  [52, 53, 64, 65],
  [98, 99, 110, 111],
  [28, 29, 40, 41],
  [102, 103, 114, 115],
  [24, 25, 36, 37],
  [78, 79, 90, 91],
  [32, 33, 44, 45],
  [54, 55, 66, 67],
  [26, 27, 38, 39],
  [74, 75, 86, 87],
  [30, 31, 42, 43],
  [60, 61, 72, 73],
];

function getImageData() {
  let image = document.querySelector('#mapimg');
  let canvas = document.createElement('canvas');

  canvas.width = image.width;
  canvas.height = image.height;

  let ctx = canvas.getContext('2d');

  ctx.drawImage(image, 0, 0);

  let imageData = ctx.getImageData(0, 0, image.width, image.height);

  let pixels = new Uint32Array(imageData.data.buffer);

  readImage(image, pixels);
}

function readImage(image, pixels) {
  const solidColor = 4286578688;

  function pixsampler(x, y) {
    if (pixels[y * image.width + x] === solidColor) return 77;
    return randInt(17) + 1;
  }

  function isWall([x, y]) {
    return (pixels[y * image.width + x] === solidColor);
  }

  function getCode([x, y]) {
    let accumlator = 0;

    if (isWall([x, y - 1])) accumlator += 1;
    if (isWall([x, y + 1])) accumlator += 8;
    if (isWall([x - 1, y])) accumlator += 2;
    if (isWall([x + 1, y])) accumlator += 4;

    return accumlator;
  }

  const w = image.width * 2;
  const h = image.height * 2;

  let newWorld = makeWorld(w, h);

  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      let tileposition = [Math.floor(x / 2), Math.floor(y / 2)];

      let index = ((y & 1) << 1) + (x & 1);
      let code = getCode(tileposition);

      if (isWall(tileposition)) {
        newWorld.tileAt([x, y]).floorType = lookupTable[code][index];
      } else {
        newWorld.tileAt([x, y]).floorType = randInt(17) + 1;
      }
    }
  }

  let level = getLevel(newWorld);

  console.log(JSON.stringify(level));

  loadLevel(level);
}

window.getImageData = getImageData;

window.onload = init;
var note = "";
var tileSize = 64;
var ticker = 0;
var editing = false;
var paletteTileSize = tileSize / 2;
var paletteX = 0;
var paletteY = 1;
var paletteWidth = 12;
var paletteHeight = 32;
var entities = [];
var minotaurs = [];

var lightOverlay = document.createElement("canvas");

function gameToTile(gamePos) {
  return gamePos.map(a => Math.round(a / tileSize));
}

function tileToGame(tilePos) {
  return tilePos.map(a => a * tileSize + 0.5);
}

function toggleFullScreen() {
  var canvas = document.querySelector("#main");
  var reqFullScreen = canvas.requestFullscreen || canvas.mozRequestFullScreen || canvas.webkitRequestFullScreen;

  if (document.fullScreenElement || document.webkitFullScreenElement || document.mozFullScreenElement || document.msFullScreenElement) {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  } else {
    if (canvas.requestFullscreen) {
      canvas.requestFullscreen();
    } else if (canvas.mozRequestFullScreen) {
      canvas.mozRequestFullScreen();
    } else if (canvas.webkitRequestFullScreen) {
      canvas.webkitRequestFullScreen();
    } else if (canvas.msRequestFullscreen) {
      canvas.msRequestFullscreen();
    }
  }
}

function init() {
  window.world = makeWorld(30, 30, 64);

  window.isPlayerDead = false;

  window.inventory = {
    matches: 0,
    keys: 0,
    // gems: 0,
  };

  var canvas = document.querySelector("#main");
  lightOverlay.width = canvas.width;
  lightOverlay.height = canvas.height;

  var ctx = canvas.getContext("2d");
  var lctx = lightOverlay.getContext("2d");

  ctx.moveTo(10, 10);
  ctx.lineTo(1920, 1080);
  ctx.lineTo(1920, 0);
  ctx.lineTo(0, 0);
  ctx.lineTo(0, 1080);
  ctx.lineTo(1920, 1080);
  ctx.lineTo(0, 0);

  ctx.stroke();

  window.keyboardState = {};
  window.keysDown = {};

  canvas.addEventListener("mousemove", canvasMouseMove);
  canvas.addEventListener("mousedown", canvasMouseDown);
  canvas.addEventListener("mouseup", canvasMouseUp);
  canvas.addEventListener("contextmenu", e => e.preventDefault())

  document.addEventListener('keydown', keyDownHandler);
  document.addEventListener('keyup', keyUpHandler);

  window.gameMode = waitForImages;

  requestAnimationFrame(update);

  function screenToCanvas([x, y]) {
    return [x / canvas.clientWidth * canvas.width, y / canvas.clientHeight * canvas.height];
  }

  let viewPosition = [3000, 3000];
  let desiredViewPosition = [960 + tileSize * 300, 540 + tileSize * 300];

  function loadLevel(data) {
    world = makeWorld(data.width, data.height);

    if (world.map.length !== data.tiles.length) {
      console.error("Map was Wrong size!");
      return;
    }

    for (let i = 0; i < world.map.length; i++) {
      world.map[i].floorType = data.tiles[i];
    }
  }

  function getLevel(aWorld = world) {
    let [width, height] = aWorld.getSize();
    let tiles = aWorld.map.map(a => a.floorType);

    return {
      width,
      height,
      tiles
    };
  }
  window.loadLevel = loadLevel;

  window.getLevel = getLevel;

  function initTutorial() {
    loadLevel(levels.tutorial);

    inventory.matches = 0;
    inventory.keys = 0;

    let player = makePlayer([394, 430]);
    entities.push(player);

    entities.push(makeBrazier([990, 420]));
    entities.push(makeRat([400, 520]));

    entities.push(makeMatch([610, 420]));

    entities.push(makeTrapdoor([250, 928]));

    let key = makeKey([1310, 610]);
    entities.push(key);


    entities.push(makeGate([18, 12], false)) //false = is not horizontal
    world.player = player;
  }

  function initLevel1() {
    loadLevel(levels.level1);

    inventory.matches += 3;
    inventory.keys = 0;

    let player = makePlayer([300, 300]);
    entities.push(player);
    world.player = player;

    entities.push(makeBrazier([544, 544], true));
    entities.push(makeBrazier([544, 3870]));
    entities.push(makeBrazier([990, 5418]));
    entities.push(makeBrazier([1060, 1576]));
    entities.push(makeBrazier([2084, 544]));
    entities.push(makeBrazier([2464, 3619]));
    entities.push(makeBrazier([2848, 4900]));
    entities.push(makeBrazier([3110, 1056]));
    entities.push(makeBrazier([3424, 2336]));
    entities.push(makeBrazier([3490, 3360]));
    entities.push(makeBrazier([4400, 4400]));
    entities.push(makeBrazier([5152, 670]));
    entities.push(makeBrazier([5540, 5540]));
    entities.push(makeBrazier([5540, 2080]));
    entities.push(makeBrazier([5664, 4126]));

    entities.push(makeGate([10, 50], false)); //vert
    entities.push(makeGate([29, 54], true)); //hori
    entities.push(makeGate([32, 64], false)); //vert
    entities.push(makeGate([41, 82], true)); //hori
    entities.push(makeGate([46, 32], false)); //ver
    entities.push(makeGate([49, 42], true)); //vert
    entities.push(makeGate([66, 75], false)); //vert
    entities.push(makeGate([70, 20], false)); //vert
    entities.push(makeGate([73, 32], true)); //hori
    entities.push(makeGate([80, 85], false)); //vert
    entities.push(makeGate([81, 80], true)); //hori
    entities.push(makeGate([92, 83], false)); //vert
    entities.push(makeGate([93, 81], true)); //hori
    entities.push(makeGate([93, 87], true)); //hori
    entities.push(makeGate([95, 44], true)); //hori

    entities.push(makeMatch([1050, 1690]));
    entities.push(makeMatch([990, 5536]));
    entities.push(makeMatch([3424, 2464]));
    entities.push(makeMatch([5664, 4256]));
    entities.push(makeMatch([2080, 674]));
    entities.push(makeMatch([544, 674]));

    entities.push(makeKey([280, 1050]));
    entities.push(makeKey([224, 5664]));
    entities.push(makeKey([1180, 4257]));
    entities.push(makeKey([2690, 2600]));
    entities.push(makeKey([2910, 260]));
    entities.push(makeKey([3620, 5020]));
    entities.push(makeKey([4250, 3490]));
    entities.push(makeKey([4700, 2750]));
    entities.push(makeKey([5760, 3350]));
    entities.push(makeKey([4600, 5790]));
    entities.push(makeKey([6690, 4290]));
    entities.push(makeKey([6690, 290]));


    entities.push(makeMinotaur([4100, 1450]));
    entities.push(makeMinotaur([1700, 4250]));

    entities.push(makeTrapdoor([6688, 5856]));

    setViewPosition(tileToGame([30, 20]));
  }

  function initLevel2() {
    loadLevel(levels.level2);

    inventory.matches += 3;
    inventory.keys = 0;

    let player = makePlayer([300, 300]);
    entities.push(player);
    world.player = player;

    entities.push(makeBrazier([544, 544], true));
    entities.push(makeBrazier([544, 2330]));
    entities.push(makeBrazier([544, 6300]));
    entities.push(makeBrazier([1950, 3870]));
    entities.push(makeBrazier([2720, 1440]));
    entities.push(makeBrazier([2720, 5530]));
    entities.push(makeBrazier([4510, 4510]));
    entities.push(makeBrazier([4640, 2590]));
    entities.push(makeBrazier([5920, 2590]));
    entities.push(makeBrazier([6300, 544]));
    entities.push(makeBrazier([6300, 6300]));

    entities.push(makeGate([7, 30], true)); //hori
    entities.push(makeGate([9, 64], true)); //hori
    entities.push(makeGate([18, 84], false)); //vert
    entities.push(makeGate([25, 50], true)); //hori
    entities.push(makeGate([59, 56], true)); //hori
    entities.push(makeGate([64, 20], false)); //vert
    entities.push(makeGate([67, 34], true)); //hori
    entities.push(makeGate([68, 94], false)); //vert
    entities.push(makeGate([72, 91], false)); //vert
    entities.push(makeGate([78, 36], false)); //vert
    entities.push(makeGate([91, 34], true)); //hori
    entities.push(makeGate([92, 94], false)); //vert
    entities.push(makeGate([92, 98], false)); //vert
    entities.push(makeGate([95, 92], true)); //hori
    entities.push(makeGate([101, 92], true)); //hori

    entities.push(makeMatch([544, 6428]));
    entities.push(makeMatch([2720, 1568]));
    entities.push(makeMatch([4510, 4638]));
    entities.push(makeMatch([6300, 672]));

    entities.push(makeKey([510, 1590]));
    entities.push(makeKey([224, 4235]));
    entities.push(makeKey([1400, 5150]));
    entities.push(makeKey([2200, 3360]));
    entities.push(makeKey([3230, 1880]));
    entities.push(makeKey([4000, 580]));
    entities.push(makeKey([4900, 290]));
    entities.push(makeKey([5150, 1700]));
    entities.push(makeKey([4830, 3770]));
    entities.push(makeKey([3740, 6170]));
    entities.push(makeKey([3490, 6050]));
    entities.push(makeKey([2330, 6560]));

    entities.push(makeMinotaur([2710, 5730]));
    entities.push(makeMinotaur([4000, 2210]));

    entities.push(makeTrapdoor([6558, 6688]));

    setViewPosition(tileToGame([30, 20]));
  }

  function initLevel3() {
    loadLevel(levels.level3);

    inventory.matches += 3;
    inventory.keys = 0;

    let player = makePlayer([300, 300]);
    entities.push(player);
    world.player = player;

    entities.push(makeBrazier([544, 544], true));
    entities.push(makeBrazier([926, 4256]));
    entities.push(makeBrazier([1310, 2720]));
    entities.push(makeBrazier([2340, 800]));
    entities.push(makeBrazier([2976, 3616]));
    entities.push(makeBrazier([2976, 6300]));
    entities.push(makeBrazier([3870, 1950]));
    entities.push(makeBrazier([4256, 5020]));
    entities.push(makeBrazier([5020, 670]));
    entities.push(makeBrazier([5410, 2976]));
    entities.push(makeBrazier([6300, 6300]));

    entities.push(makeGate([5, 48], true)); //hori
    entities.push(makeGate([30, 10], false)); //vert
    entities.push(makeGate([29, 94], false)); //vert
    entities.push(makeGate([31, 94], true)); //hori
    entities.push(makeGate([40, 57], false)); //vert
    entities.push(makeGate([52, 98], false)); //vert
    entities.push(makeGate([81, 52], true)); //hori
    entities.push(makeGate([90, 48], false)); //vert
    entities.push(makeGate([94, 44], false)); //vert
    entities.push(makeGate([97, 88], true)); //hori
    entities.push(makeGate([97, 90], true)); //hori
    entities.push(makeGate([97, 92], true)); //hori

    entities.push(makeMatch([926, 4384]));
    entities.push(makeMatch([2340, 928]));
    entities.push(makeMatch([2976, 6428]));
    entities.push(makeMatch([5020, 798]));

    entities.push(makeKey([2330, 1570]));
    entities.push(makeKey([3100, 1190]));
    entities.push(makeKey([800, 6180]));
    entities.push(makeKey([2080, 5560]));
    entities.push(makeKey([2590, 4380]));
    entities.push(makeKey([4510, 6300]));
    entities.push(makeKey([5530, 5530]));
    entities.push(makeKey([6560, 5790]));
    entities.push(makeKey([5920, 3490]));
    entities.push(makeKey([4900, 3740]));
    entities.push(makeKey([3680, 3230]));
    entities.push(makeKey([4760, 2340]));
    entities.push(makeKey([6300, 2460]));
    entities.push(makeKey([2080, 6560]));


    entities.push(makeMinotaur([930, 4130]));
    entities.push(makeMinotaur([3870, 1830]));
    entities.push(makeMinotaur([4260, 4900]));

    entities.push(makeTrapdoor([6304, 6688]));

    setViewPosition(tileToGame([30, 20]));
  }

  let allLevels = [
    initTutorial,
    initLevel1,
    initLevel2,
    initLevel3
  ];

  function addRats() {
    let [w, h] = world.getSize();
    let ratCount = Math.floor((w * h) / 150);

    for (let i = 0; i < ratCount; i++) {
      let pos = [randInt(w * tileSize), randInt(h * tileSize)];

      if (world.isSpace(pos)) {
        entities.push(makeRat(pos));
      }
    }
  }


  function startLevel(n = 0) {
    stopAudioLoops();
    n %= allLevels.length;

    let worldSize = 30;
    entities = [];
    minotaurs = [];

    allLevels[n]();

    addRats();

    loopSound(Assets.DungeonGameAtmosphere);

    world.success = false;
    gameMode = mainGame;
  }

  function setTile(pos, type) {
    world.tileAt(pos).floorType = type;
  }

  function clearTile(pos) {
    setTile(pos, 0);
  }

  setViewPosition(tileToGame([500, 500]));

  function setViewPosition([x, y]) {
    let hw = canvas.width / 2
    let hh = canvas.height / 2
    let [maxX, maxY] = vscale(world.getSize(), tileSize);
    maxX -= tileSize;
    maxY -= tileSize;
    x = median(x, hw, maxX - hw);
    y = median(y, hh, maxY - hh);
    desiredViewPosition = [x, y];
  }

  window.setViewPosition = setViewPosition;

  let dragFunction = null;

  let mouseTile = [-1, -1];
  let selectedTile = undefined;
  let swapList = [];

  window.particles = [];

  function canvasToGame(canvasPos) {
    let canvasTopLeft = vdiff([canvas.width / 2, canvas.height / 2], viewPosition);
    let gamePos = vdiff(canvasPos, canvasTopLeft);
    return gamePos;
  }

  function canvasMouseMove(e) {
    let canvasPos = screenToCanvas([e.offsetX, e.offsetY]);
    let gamePos = canvasToGame(canvasPos);
    let tilePos = gameToTile(gamePos);

    note = JSON.stringify({
      gamePos,
      tilePos
    });

    let buttons = e.buttons;

    if (typeof dragFunction === "function") {
      dragFunction({
        canvasPos,
        gamePos,
        tilePos,
        buttons
      })
    }

    mouseTile = tilePos;
  }

  function canvasMouseUp(e) {
    let canvasPos = screenToCanvas([e.offsetX, e.offsetY]);
    let gamePos = canvasToGame(canvasPos);
    let tilePos = gameToTile(gamePos);
    if (e.button === 1) onMiddleUp({
      canvasPos,
      gamePos,
      tilePos
    })
  }

  function canvasMouseDown(e) {
    let canvasPos = screenToCanvas([e.offsetX, e.offsetY]);
    let gamePos = canvasToGame(canvasPos);
    let tilePos = gameToTile(gamePos);

    if (editing) {
      let px = Math.floor(canvasPos[0] / paletteTileSize);
      let py = Math.floor(canvasPos[1] / paletteTileSize);
      if (px < paletteWidth && py < paletteHeight) {
        paletteX = px;
        paletteY = py;
        console.log("tile " + (paletteY * paletteWidth + paletteX));
        return;
      }
      if (e.button === 0) {
        let t = paletteY * paletteWidth + paletteX;
        setTile(tilePos, t);
      }
      if (e.button === 2) {
        setTile(tilePos, 0);
      }
    }
    switch (gameMode) {
      case mainGame:
        if (e.button === 1) onMiddleDown({
          canvasPos,
          gamePos,
          tilePos
        });
        if (e.button === 0) mouseDown({
          canvasPos,
          gamePos,
          tilePos
        })
        break;
    }
  }

  function keyDownHandler(event) {
    keyboardState[event.keyCode] = true;
    keysDown[event.keyCode] = true;
  }

  function keyUpHandler(event) {
    keyboardState[event.keyCode] = false;
  }

  function isKeyDown(keyCode) {
    return (keyboardState[keyCode] ? true : false);
  }

  function keyWentDown(keyCode) {
    return (keysDown[keyCode] ? true : false);
  }

  function flushKeysDown() {
    keysDown = {};
  }

  window.input = {
    isKeyDown,
    keyWentDown,
    flushKeysDown
  };

  let dragStartState;
  let dragDelta = [0, 0];

  function onMiddleDown(e) {
    switch (gameMode) {
      case mainGame:
        dragStartState = {
          viewPosition,
          downPos: e.canvasPos
        };
        setViewPosition(viewPosition);

        dragFunction = onMiddleDrag;

        break;
      case levelSuccess:

        break;
    }
  }

  function onMiddleUp(e) {}

  function onMiddleDrag(e) {
    let delta = vdiff(dragStartState.downPos, e.canvasPos);

    if ((e.buttons & 6) === 0) {
      dragDelta = vscale(calculateViewVector(), 50);
      let newPos = vadd(viewPosition, dragDelta).map(Math.floor);
      setViewPosition(newPos);
      dragFunction = null;
    } else {
      let newPos = vadd(dragStartState.viewPosition, delta);
      dragDelta = vdiff(newPos, viewPosition);
      setViewPosition(vadd(viewPosition, dragDelta));
      viewPosition = desiredViewPosition;
    }
  }

  function mouseDown(e) {
    let tileHere = world.tileAt(e.tilePos);
    console.log(e.tilePos)
  }

  var viewHistory = [0, 0];

  function panView() {
    let togo = vdiff(desiredViewPosition, viewPosition);
    let delta = vscale(togo, 0.04);
    let d = vlength(delta);
    if (d > 0) {
      if (d < 3) delta = vscale(delta, 3 / d);
      viewPosition = vadd(viewPosition, delta)
    }
    if (vlength(togo) < 2) viewPosition = desiredViewPosition;
    viewHistory.push(viewPosition);
    viewHistory = viewHistory.slice(-5);
  }

  function calculateViewVector() {
    let start = viewHistory[0];
    let end = viewHistory[viewHistory.length - 1];
    let d = vdiff(end, start);
    return vscale(d, 1 / (2 * viewHistory.length));
  }

  function isBeside(a = [NaN, NaN], b = [NaN, NaN]) {
    if (!a || !b) return;
    let d = vdiff(a, b).map(Math.abs).map(Math.floor);
    return (d[0] + d[1]) === 1;
  }

  window.isBeside = isBeside;

  function manhattenD([x1, y1], [x2, y2]) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }

  let path = [];

  function mainUpdate() {
    if (input.keyWentDown(48)) {
      levelNumber++;
      startLevel(levelNumber);
    }

    if (input.keyWentDown(32)) {
      if (world.player.isDead()) {
        inventory = {
          matches: 0,
          keys: 0
        };
        isPlayerDead = false;

        startLevel(levelNumber);
      } else {
        world.player.die();
      }
    }

    if (!editing) {
      desiredViewPosition = world.player.getPos();
    }

    panView();

    for (let ent of entities) {
      ent.move();
    }

    entities.sort((a, b) => (a.getPos()[1] - b.getPos()[1]));

    if (editing) {
      if (input.keyWentDown(68)) {
        paletteX = (paletteX + 1) % paletteWidth;
      }

      if (input.keyWentDown(65)) {
        paletteX -= 1;
        if (paletteX < 0) paletteX += paletteWidth;
      }

      if (input.keyWentDown(83)) {
        paletteY = (paletteY + 1) % paletteHeight;
      }

      if (input.keyWentDown(87)) {
        paletteY -= 1;
        if (paletteY < 0) paletteY += paletteHeight;
      }
    }
  }

  function drawEditor() {
    let s = paletteTileSize;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, paletteWidth * s, paletteHeight * s);
    ctx.drawImage(Assets.walls, 0, 0, paletteWidth * s, paletteHeight * s);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.beginPath();

    ctx.rect(paletteX * s, paletteY * s, s, s);
    ctx.stroke();
    ctx.lineWidth = 1;
  }

  function drawLighting() {
    var lc = lightOverlay.getContext("2d");
    lc.setTransform(1, 0, 0, 1, 0, 0);
    lc.fillStyle = "black";
    lc.fillRect(0, 0, lightOverlay.width, lightOverlay.height);

    let [vx, vy] = viewPosition;
    let cw = canvas.width;
    let ch = canvas.height;
    lc.translate(cw / 2 - vx, ch / 2 - vy);

    let p = world.player.getPos();
  }

  function drawOverlay() {
    let offset = 60;

    // draw matches
    for (let i = 1; i < inventory.matches + 1; i++) {
      ctx.drawSprite(Assets.match, 1920 - (offset * i), 1080 - offset, 0, 0.6);
    }

    // draw keys
    for (let i = 1; i < inventory.keys + 1; i++) {
      ctx.drawSprite(Assets.key, 1920 - (offset * i), 1080 - (offset + 100), 0, 0.8);
    }

    let s = 1 + Math.sin(ticker / 100) * 0.05;
    ctx.drawSprite(Assets.controls, 200, 900, 0, s * 0.35);
  }

  function applyGameSpace(context) {
    let [vx, vy] = viewPosition;
    let cw = canvas.width;
    let ch = canvas.height;

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.translate(cw / 2 - vx, ch / 2 - vy);
  }

  function drawView() {

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    //clear lightmap
    lctx.setTransform(1, 0, 0, 1, 0, 0);
    lctx.globalCompositeOperation = "source-over";
    lctx.fillStyle = "black";
    lctx.fillRect(0, 0, lightOverlay.width, lightOverlay.height);

    applyGameSpace(ctx);
    applyGameSpace(lctx);
    lctx.globalCompositeOperation = "lighter";

    let [vx, vy] = viewPosition;
    let cw = canvas.width;
    let ch = canvas.height;
    world.draw(ctx, [vx - cw / 2, vy - ch / 2, cw, ch]);

    //draw tile under mouse
    if (!dragFunction) {
      let [x, y] = tileToGame(mouseTile);
      //ctx.drawSprite(Assets.blockHover,x,y);
      let w = tileSize / 2;
      ctx.beginPath();
      ctx.rect(x - w, y - w, tileSize, tileSize);
      ctx.stroke();
    }

    if (editing && selectedTile) {
      let [x, y] = tileToGame(selectedTile);
      //ctx.drawSprite(Assets.blockSelect,x,y);
    }

    for (let ent of entities) {
      ent.draw(ctx, lctx);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    if (!editing) {
      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(lightOverlay, 0, 0);
      ctx.globalCompositeOperation = "source-over";
    }

    applyGameSpace(ctx);

    for (let m of minotaurs) {
      m.drawEyes(ctx);
    }

    drawParticles();

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    drawOverlay();
  }

  function triWave(x, p) {
    let hp = p / 2;
    return 1 / hp * (hp - Math.abs((x % p) - hp));
  }

  function waitForImages() {
    if (assetsPending.length === 0) {
      gameMode = initializeGame;
    }
  }

  waitForImages.draw = function() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    let y = 50;
    for (let f of assetsPending) {
      ctx.fillText(f, 10, y);
      y += 15;
    }
  }

  function drawParticles() {
    for (let p of particles) {
      p.draw(ctx);
    }
  }

  function moveParticles() {
    for (let p of particles) {
      p.move();
    }
    particles = particles.filter(a => a.isActive());
  }

  function setView() {

  }

  let successAge = 0;

  function completeLevel() {
    successAge = 0;
    gameMode = levelSuccess;
  }
  window.completeLevel = completeLevel;

  function initializeGame() {
    startLevel(0);
  }

  function mainGame(ticks) {
    mainUpdate();

    if (input.keyWentDown(192)) {
      editing = !editing;
    }
  }

  mainGame.draw = function() {
    drawView();

    if (editing) drawEditor();
  }

  function levelSuccess(ticks) {
    successAge += 1;
    if (successAge > 100) {
      levelNumber++;
      startLevel(levelNumber);
    }
  }

  levelSuccess.draw = function() {
    drawView();

    if (editing) drawEditor();
  }

  let lastTime = performance.now();

  function update() {
    let thisTime = performance.now();
    let diff = thisTime - lastTime;
    let ticks = Math.round(diff / 16);
    lastTime = thisTime;
    if (ticks > 10) ticks = 10;
    ticker += ticks;
    for (let i = 0; i < ticks; i++) {
      gameMode();
      moveParticles();
      flushKeysDown();
    }

    if (gameMode.draw) gameMode.draw();

    ctx.font = "20px sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = "black";
    //  ctx.fillText(note, 131, 51);
    ctx.fillStyle = "white";
    //  ctx.fillText(note, 130, 50);

    requestAnimationFrame(update);
  }
}

function makeWorld(width = 512, height = width, tileSize = 64) {
  let OutOfBounds = makeCell(1);
  let map = Array.from(intRange(0, width * height), a => makeCell());

  function tileAt([x, y]) {
    if ((x < 0) || (y < 0) || (x >= width) || (y >= height)) return OutOfBounds;
    let result = map[width * y + x];
    if (!result) console.log({
      x,
      y
    })
    return result;
  }

  function isSpace(gamePos) {
    let tilePos = gameToTile(gamePos);
    let tile = tileAt(tilePos);
    let floor = tile.floorType < 24;
    if (floor) {
      for (let e of tile.contents) {
        if (e.blocking(gamePos)) return false;
      }
    }
    return floor;
  }

  function getSize() {
    return [width, height]
  }

  for (let tx of intRange(0, width)) {
    tileAt([tx, 0]).floorType = 1;
    tileAt([tx, height - 1]).floorType = 1;
  }

  for (let ty of intRange(0, width)) {
    tileAt([0, ty]).floorType = 1;
    tileAt([width - 1, ty]).floorType = 1;
  }

  let pattern;

  function draw(ctx, region) {
    let [left, top, width, height] = region;

    ctx.fillStyle = "green";
    ctx.fillRect(left, top, width, height);

    ctx.fillStyle = "white";
    let [tileLeft, tileTop, tileWidth, tileHeight] = region.map(a => Math.floor(a / tileSize + 0.5));
    for (let ty of intRange(tileTop - 1, tileTop + tileHeight + 3)) {
      for (let tx of intRange(tileLeft - 1, tileLeft + tileWidth + 3)) {
        drawTile(tx, ty);
      }
    }

    function tileToGame(tilePos) {
      return tilePos.map(a => a * tileSize + 0.5);
    }

    function drawTile(x, y) {
      let tile = tileAt([x, y]);
      let [tx, ty] = tileToGame([x, y])
      if (tile.render && tile.floorType > 0) {
        ctx.drawSprite(Assets.walls, tx, ty, tile.floorType)
      }
    }
  }
  return {
    map,
    draw,
    tileAt,
    isSpace,
    getSize
  };
}

function randFloor() {
  let r = randInt(5) + 1;
  if (r == 1) r = 6;
  return r;
}

function makeCell(floorType = randFloor()) {
  let contents = [];
  let busy = false;
  let render = true;
  let wall = false;
  return {
    floorType,
    contents,
    busy,
    render,
    wall
  };
}
