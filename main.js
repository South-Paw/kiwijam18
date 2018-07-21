"use strict"

var levelNumber = 0;

window.lookupTable = [
  [34, 35, 46, 47],
  [56, 57, 68, 69],
  [76, 77, 88, 89],
  [104, 105, 116, 117],
  [52, 53, 64, 65],
  [98, 99, 110, 111],
  [28, 29, 40, 41],
  [102, 103, 114, 115],
  [80, 81, 92, 93],
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

  // see pixel colors
  // console.log(pixels);

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

var editing = true;
var paletteTileSize = tileSize / 2;
var paletteX = 0;
var paletteY = 1;
var paletteWidth = 12;
var paletteHeight = 32;
var entities = [];

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

  function initLevel1() {
    loadLevel(levels.level1);
    //add entities
    let player = makePlayer([300, 300]);
    entities.push(player);
    world.player = player;

    entities.push(makeMinotaur([400, 300]));
    setViewPosition(tileToGame([30, 20]));

  }

  function initTutorial() {
    loadLevel(levels.tutorial);
    let player = makePlayer([394, 430]);
    entities.push(player);
    world.player = player;

  }
  let allLevels = [initTutorial, initLevel1, initLevel1, initLevel1, initLevel1];

  function startLevel(n = 0) {

    n %= allLevels.length;

    let worldSize = 30;
    entities = [];

    allLevels[n]();
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
  let particles = [];

  window.particles = particles;

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
    } else {


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
      console.log("level num ", levelNumber);
    }
    if (!editing) {
      desiredViewPosition = world.player.getPos();
    }
    panView();
    for (let ent of entities) {
      ent.move();
    }
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

  }

  function drawView() {

    let [vx, vy] = viewPosition;
    let cw = canvas.width;
    let ch = canvas.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    lctx.setTransform(1, 0, 0, 1, 0, 0);
    lctx.fillStyle = "black";
    lctx.fillRect(0, 0, lightOverlay.width, lightOverlay.height);

    ctx.translate(cw / 2 - vx, ch / 2 - vy);
    lctx.translate(cw / 2 - vx, ch / 2 - vy);

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

    if (selectedTile) {
      let [x, y] = tileToGame(selectedTile);
      //ctx.drawSprite(Assets.blockSelect,x,y);
    }

    for (let ent of entities) {
      ent.draw(ctx, lctx);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    drawOverlay();

    if (!editing) {
      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(lightOverlay, 0, 0);
      ctx.globalCompositeOperation = "source-over";
    }
    ctx.font = "20px sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = "black";
    ctx.fillText(note, 131, 51);
    ctx.fillStyle = "white";
    ctx.fillText(note, 130, 50);



  }

  function triWave(x, p) {
    let hp = p / 2;
    return 1 / hp * (hp - Math.abs((x % p) - hp));
  }


  function waitForImages() {
    if (imagesPending.length === 0) {

      gameMode = initializeGame;
    }
  }

  waitForImages.draw = function() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    let y = 50;
    for (let f of imagesPending) {
      ctx.fillText(f, 10, y);
      y += 15;
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

  let lastTime = performance.now();

  function update() {
    let thisTime = performance.now();
    let diff = thisTime - lastTime;
    let ticks = Math.round(diff / 16);
    lastTime = thisTime;
    if (ticks > 10) ticks = 10;
    for (let i = 0; i < ticks; i++) {
      gameMode();
      flushKeysDown();
    }
    if (gameMode.draw) gameMode.draw();
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
    //   if (!pattern) pattern =ctx.createPattern(Assets.Dirt,"repeat");

    // ctx.fillStyle=pattern
    ctx.fillStyle = "green";
    ctx.fillRect(left, top, width, height);

    //ctx.drawSprite(Assets.blocks,100,100,2);
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
