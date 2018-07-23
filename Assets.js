imageList = [
  "baseLight.png|8",
  "baseLight2.png|8",
  "walls.png|12|32",
  "minotaur/minotaurWalkLeft.png|6|1|[64,192]",
  "minotaur/minotaurWalkRight.png|6|1|[64,192]",
  "minotaur/minotaurWalkUp.png|4|1|[64,192]",
  "minotaur/minotaurWalkDown.png|4|1|[64,192]",
  "minotaur/minotaurWalkLeftEyes.png|6|1|[64,192]",
  "minotaur/minotaurWalkRightEyes.png|6|1|[64,192]",
  "minotaur/minotaurWalkDownEyes.png|4|1|[64,192]",
  "character/playerWalkLeft.png|4|1|[64,192]",
  "character/playerWalkRight.png|4|1|[64,192]",
  "character/playerWalkUp.png|4|1|[64,192]",
  "character/playerWalkDown.png|4|1|[64,192]",
  "character/death.png|5|2|[64,192]",
  "rat/ratWalkDown.png|2|1|[32,56]",
  "rat/ratWalkUp.png|2|1|[32,56]",
  "rat/ratWalkLeft.png|2|1|[32,56]",
  "rat/ratWalkRight.png|2|1|[32,56]",
  "rat/ratIdle.png|2|1|[32,56]",
  "trapdoor/trapdoor.png",
  "trapdoor/doorHatch.png|4|1|[64,128]",
  "match.png|1",
  "key.png|1",
  "controls.png|1",
  "gate/gateFrameTop.png",
  "gate/gateFrameBottom.png",
  "gate/gateFrameLeft.png",
  "gate/gateFrameRight.png",
  "gate/gateHorizontal.png|6",
  "gate/gateVertical.png|6",
  "particle.png|1",
  "brazier/brazierBurn.png|3|1|[64,138]",
  "brazier/brazierEmber.png|3|2|[64,138]"
].map(imageDetailsFromString);

var soundList = [
  // soundtrack
  "DungeonGameAtmosphere.mp3",
  // player clean
  "FootstepClean1.ogg",
  "FootstepClean2.ogg",
  "FootstepClean3.ogg",
  "FootstepClean4.ogg",
  "FootstepClean5.ogg",
  "FootstepClean6.ogg",
  "FootstepClean7.ogg",
  "FootstepClean8.ogg",
  "FootstepClean9.ogg",
  "FootstepClean10.ogg",
  // minotaur
  "MinotaurFootstep1.ogg",
  "MinotaurFootstep2.ogg",
  "MinotaurFootstep3.ogg",
  "MinotaurFootstep4.ogg",
  "MinotaurFootstep5.ogg",
  "MinotaurFootstep6.ogg",
  "MinotaurFootstep7.ogg",
  "MinotaurFootstep8.ogg",
  "MinotaurFootstep9.ogg",
  "MinotaurFootstep10.ogg",
  // match
  "LightingAMatch1.ogg",
  "LightingAMatch2.ogg",
  // brazier
  "FireTorchLit.ogg",
  // key
  "KeyPickup.ogg",
  // door
  "KeyUnlockDoor.ogg", // unused
  // trapdoor
  "TrapDoorOpen1.ogg",
  "TrapDoorOpen2.ogg",
  // death sounds
  "MonsterKillYou1.ogg", // unused
  "MonsterKillYou2.ogg", // unused
  "MonsterKillYou3.ogg", // unused
];

var assetsPending = [];

var Assets = {};

var audioContext = new AudioContext();

function loadImage(url) {
  assetsPending.push(url);

  var result = new Image();
  result.onload = e => assetsPending.splice(assetsPending.indexOf(url), 1);
  result.src = url;

  let name = url.slice(url.lastIndexOf("/") + 1);

  Assets[name.replace(/\.[^/.]+$/, "")] = result;
  return result;
}

function imageDetailsFromString(s) {
  let [name, framesWide = 1, framesHigh = 1, handle = "null"] = s.split("|");
  name = "images/" + name;
  return {
    name,
    framesWide: parseInt(framesWide),
    framesHigh: parseInt(framesHigh),
    handle: JSON.parse(handle)
  }
}

function playSound(buffer, offset = 0) {
  if (Array.isArray(buffer)) {
    return playSound(buffer[randInt(buffer.length)], offset);
  }
  var source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start(0, offset);
  return source;
}

var audioLoops = [];

function loopSound(buffer, offset = 0) {
  var source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  source.connect(audioContext.destination);
  source.start(0, offset);
  audioLoops.push(source);
  return source;
}

function stopAudioLoops() {
  for (let s of audioLoops) {
    s.stop();
  }
  audioLoops = [];
}

function loadSound(url) {
  var onError = a => (console.log(a));
  assetsPending.push(url);
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';
  let name = url.slice(url.lastIndexOf("/") + 1).replace(/\.[^/.]+$/, "");
  Assets[name] = audioContext.createBuffer(1, 1, 44100); //temporary null buffer until loaded
  // Decode asynchronously
  request.onload = function() {
    console.log(name + " loaded");
    audioContext.decodeAudioData(request.response, function(buffer) {
      assetsPending.splice(assetsPending.indexOf(url), 1);
      Assets[name] = buffer;
    }, onError);
  }
  request.send();
}


function loadAssets() {

  for (let i of imageList) {
    console.log(i);
    let image = loadImage(i.name);
    image.framesWide = i.framesWide;
    image.framesHigh = i.framesHigh;
    if (i.handle) image.handle = i.handle;
  }

  for (let s of soundList) {
    loadSound("sounds/" + s);
  }


}

loadAssets();

function scaledImage(image, w, h = w) {
  var result = document.createElement("canvas");

  result.width = w;
  result.height = h;

  let ctx = result.getContext("2d");

  ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, w, h);
  return result;
}

function workingImage(from, paddingLeft = 0, paddingTop = paddingLeft, paddingRight = paddingLeft, paddingBottom = paddingTop) {
  var result = document.createElement("canvas");

  result.width = from.width + paddingLeft + paddingRight;
  result.height = from.width + paddingTop + paddingBottom;


  let ctx = result.getContext("2d");
  ctx.drawImage(from, paddingLeft, paddingTop);
  return result;
}

function blankCanvas(w, h = w) {
  var result = document.createElement("canvas");
  result.width = w;
  result.height = h;
  return result;
}


CanvasRenderingContext2D.prototype.drawSprite = function(image, x, y, frame = 0, scale = 1) {
  if (image === null) return;
  let frameWidth = image.width;
  let frameHeight = image.height;
  let oy = 0;
  let ox = 0;
  if (image.framesWide) {
    frameWidth = image.width / image.framesWide;
    oy = Math.floor(frame / image.framesWide);
  }
  if (image.framesHigh) {
    frameHeight = image.height / image.framesHigh;
    ox = frame % image.framesWide;
  }

  let [hx, hy] = image.handle || [frameWidth / 2, frameHeight / 2];
  this.drawImage(image, ox * frameWidth, oy * frameHeight, frameWidth, frameHeight, x - hx * scale, y - hy * scale, frameWidth * scale, frameHeight * scale);

}


CanvasRenderingContext2D.prototype.circle = function(x, y, radius) {
  this.beginPath();
  this.ellipse(x, y, radius, radius, 0, 0, Math.PI * 2);
}


function moveDefaultParticle() {
  let delta = vdiff(this.position, this.lastPosition);
  this.lastPosition = this.position;
  this.position = vadd(this.position, vscale(delta, 0.99));

  this.age += 1;

  if (this.age > 30) {

    if (probability(0.05)) this.dead = true;
  }
  // console.log("particle end", this);

}

function drawDefaultParticle(ctx) {
  let [x, y] = this.position;
  ctx.drawSprite(this.image, x, y)
}

function makeDefaultParticle(state) {
  let lastPosition = state.pos;
  let position = vadd(lastPosition, [(Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5]);

  let {
    image = Assets.particle, age = 0
  } = state;
  let dead = false;

  return {
    position,
    lastPosition,
    image,
    dead,
    age,
    move: moveDefaultParticle,
    draw: drawDefaultParticle,
  }
}

function particleSystem(count, state, makeParticle = makeDefaultParticle) {
  var points = [];
  for (let i of intRange(0, count)) {
    points.push(makeParticle(state));
  }

  function draw(ctx) {
    ctx.globalCompositeOperation = "lighter";
    for (let p of points) {
      p.draw(ctx);
    }
    ctx.globalCompositeOperation = "source-over";
  }

  function move() {
    for (let p of points) {
      p.move();
    }
    points = points.filter(a => a.dead == false);

  }

  function isActive() {
    return points.length > 0;
  }
  return {
    move,
    draw,
    isActive
  };
}
