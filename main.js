"use strict"
window.onload = init;
var note = "";
var tileSize = 64;

var editing = true;
var paletteX = 0;
var paletteY = 1;
var paletteWidth=8;
var paletteHeight=15;
var entities = [];

var lightOverlay = document.createElement("canvas");

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
  let world = makeWorld(30, 30, 64);

  window.world = world;
  var canvas = document.querySelector("#main");
  lightOverlay.width=canvas.width;
  lightOverlay.height=canvas.height;

  var ctx = canvas.getContext("2d");

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


  function startLevel(n = 1) {
    let worldSize = 30;

    world = makeWorld(worldSize);
    entities = [];
    let player = makePlayer([300, 300]);
    entities.push(player);
    world.player=player;

    setViewPosition(tileToGame([30, 20]));


    for (let tx of intRange(1, worldSize - 1)) {
      for (let ty of intRange(1, worldSize - 1)) {
        setTile([tx, ty], randInt(4));
      }
    }

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

  function gameToTile(gamePos) {
    return gamePos.map(a => Math.round(a / tileSize));
  }

  function tileToGame(tilePos) {
    return tilePos.map(a => a * tileSize + 0.5);
  }

  function canvasMouseMove(e) {
    let canvasPos = screenToCanvas([e.offsetX, e.offsetY]);
    let gamePos = canvasToGame(canvasPos);
    let tilePos = gameToTile(gamePos);
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
      let px=Math.floor(canvasPos[0]/tileSize);
      let py=Math.floor(canvasPos[1]/tileSize);
      if (px<paletteWidth && py<paletteHeight) {
        paletteX=px;
        paletteY=py;
        return;
      }
      if (e.button ===0 ) {
        let t= paletteY*paletteWidth+paletteX;
        setTile(tilePos, t);
      }
      if (e.button ===2 ) {
        setTile(tilePos, 0);
      }
      
    }
    switch (gameMode) {
      case mainGame:
        if (e.button === 1 ) onMiddleDown({
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

  window.input = { isKeyDown, keyWentDown, flushKeysDown };

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
    if (!editing) {
      desiredViewPosition=world.player.getPos();
    }
    panView();
    for (let ent of entities) {
      ent.move();
    }
    if (editing) {
      if (input.keyWentDown(68)) {
        paletteX=(paletteX+1)%paletteWidth;
      }
      if (input.keyWentDown(65)) {
        paletteX-=1; if (paletteX<0)paletteX+=paletteWidth;
      }
      if (input.keyWentDown(83)) {
        paletteY=(paletteY+1)%paletteHeight;
      }
      if (input.keyWentDown(87)) {
        paletteY-=1; if (paletteY<0)paletteY+=paletteHeight;
      }

    }
  }

  function drawEditor() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(Assets.tiles, 0, 0);
    ctx.strokeStyle="white";
    ctx.lineWidth=3;
    ctx.beginPath();
    ctx.rect(paletteX*tileSize,paletteY*tileSize,tileSize,tileSize);
    ctx.stroke();
    ctx.lineWidth=1;
  }

  function drawLighting() {
    var lc = lightOverlay.getContext("2d");
    lc.setTransform(1, 0, 0, 1, 0, 0);
    lc.fillStyle="black";
    lc.fillRect(0,0,lightOverlay.width,lightOverlay.height);

    let [vx, vy] = viewPosition;
    let cw = canvas.width;
    let ch = canvas.height;
    lc.translate(cw / 2 - vx, ch / 2 - vy);

    let p=world.player.getPos();
    lc.fillStyle="grey";
    lc.beginPath();
    let r=+randInt(10)+randInt(10)+randInt(10);
    lc.ellipse(p[0],p[1],100+r,100+r,0,0,Math.PI*2);
    lc.fill();
  
    r*=0.75;
    lc.fillStyle="white";
    lc.beginPath();
    lc.ellipse(p[0],p[1],75+r,75+r,0,0,Math.PI*2);
    lc.fill();
    
  }

  function drawView() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    let [vx, vy] = viewPosition;
    let cw = canvas.width;
    let ch = canvas.height;
    ctx.translate(cw / 2 - vx, ch / 2 - vy);
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
      ent.draw(ctx);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    if (!editing) {
      drawLighting();
      ctx.globalCompositeOperation="multiply";
      ctx.drawImage(lightOverlay,0,0);
      ctx.globalCompositeOperation="source-over";
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
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    let y = 50;
    for (let f of imagesPending) {
      ctx.fillText(f, 10, y);
      y += 15;
    }
    if (imagesPending.length === 0) {

      gameMode = initializeGame;
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
    startLevel(1);
  }

  function mainGame() {
    mainUpdate();
    drawView();
    if (editing) drawEditor();
  }

  function update() {
    gameMode();
    flushKeysDown();
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
    ctx.fillText(JSON.stringify({
      tileLeft,
      tileTop,
      tileWidth,
      tileHeight
    }), 10, 100);
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
        ctx.drawSprite(Assets.tiles, tx, ty, tile.floorType)
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
  let wall =false;
  return {
    floorType,
    contents,
    busy,
    render,
    wall
  };
}
