function makeEntity(pos) {
  let getPos = _ => pos;
  let setPos = newpos => pos = newpos;
  let move = _ => {};
  let draw = _ => {};
  let blocking = gamePos => false;

  return {
    getPos,
    setPos,
    blocking,
    move,
    draw
  };
}

function makeMinotaur(pos) {
  let WALKING_SPEED = 2.5;
  let UP = 0;
  let DOWN = 1;
  let LEFT = 2;
  let RIGHT = 3;

  let directions = [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0]
	];

  let anims = [Assets.minotaurWalkUp, Assets.minotaurWalkDown, Assets.minotaurWalkLeft, Assets.minotaurWalkRight];
  let eyes = [null, Assets.minotaurWalkDownEyes, Assets.minotaurWalkLeftEyes, Assets.minotaurWalkRightEyes];

  let direction = RIGHT;
  let age = 0;
  let frame = 0;

  let characterBounding = [
    [0, -40],
    [0, -6],
  ];

  let footstepSounds = [
    Assets.MinotaurFootstep1,
    Assets.MinotaurFootstep2,
    Assets.MinotaurFootstep3,
    Assets.MinotaurFootstep4,
    Assets.MinotaurFootstep5,
    Assets.MinotaurFootstep6,
    Assets.MinotaurFootstep7,
    Assets.MinotaurFootstep8,
    Assets.MinotaurFootstep9,
    Assets.MinotaurFootstep10,
  ];

  let {
    blocking,
    getPos,
    setPos
  } = makeEntity(pos)

  function look(way) {
    let here = getPos();
    let candidate = vadd(here, vscale(directions[way], 60));
    return world.isSpace(candidate);
  }

  function consider(way) {
    if (look(way)) {
      if (probability(0.002)) {
        direction = way;
      }
    }
  }

  function drawEyes(ctx) {
    let [x, y] = getPos();
    ctx.drawSprite(eyes[direction], x, y, frame);
  }

  function draw(ctx, lctx) {
    let [x, y] = getPos();
    ctx.drawSprite(anims[direction], x, y, frame);
  }

  function move() {
    age += 1;
    let currentTile = gameToTile(getPos());
    let step = vscale(directions[direction], WALKING_SPEED);
    let p = vadd(getPos(), step);
    let boundingPos = characterBounding.map(v => vadd(p, v));
    if (!boundingPos.some(a => !world.isSpace(a))) {
      setPos(p);
    } else {
      direction = randInt(4);
    }
    switch (direction) {
      case DOWN:
      case UP:
        consider(LEFT);
        consider(RIGHT);
        break;

      case LEFT:
      case RIGHT:
        consider(UP);
        consider(DOWN);
        break;
    }
    frame = Math.floor((age / 10) % anims[direction].framesWide);

    // very loud and it will always play...
    // if ((age % 60) === 0) {
    //   playSound(footstepSounds[randInt(footstepSounds.length)]);
    // }
  }

  let result = {
    getPos,
    setPos,
    blocking,
    drawEyes,
    move,
    draw
  };

	minotaurs.push(result);
  
  return result;
}

function makePlayer(pos) {
  let WALKING_SPEED = 5;
  let INITIAL_MATCH_LIFE = 1000;
	let walkAnim = Assets.playerWalkLeft;
	let timeOfDeath =0;
  let age = 0;
  let frame = 0;
  let matchLife = 0;
  let matchPos = [-32, -86];

  let {
    getPos,
    blocking,
    setPos
  } = makeEntity(pos);

  let characterBounding = [
    [0, -40],
    [0, -6],
  ];

  let footstepSounds = [
    Assets.FootstepClean1,
    Assets.FootstepClean2,
    Assets.FootstepClean3,
    Assets.FootstepClean4,
    Assets.FootstepClean5,
    Assets.FootstepClean6,
    Assets.FootstepClean7,
    Assets.FootstepClean8,
    Assets.FootstepClean9,
    Assets.FootstepClean10,
  ];

  let matchSounds = [
    Assets.LightingAMatch1,
    Assets.LightingAMatch2,
  ];

  let burnFunction = a => Math.sin(a * a * 3) + (Math.sin(a * 80) + Math.sin(a * 100)) * (a * 0.1);

  function matchBrightness() {
    let matchLevel = matchLife / INITIAL_MATCH_LIFE;
    return burnFunction(matchLevel);
  }

  function draw(ctx, lctx) {
    let [x, y] = getPos();

    if (timeOfDeath >0) {
			ctx.drawSprite(Assets.death, x, y, frame);
			lctx.drawSprite(Assets.baseLight2, x, y - 64, randInt(8),  1);
		} else {
			ctx.drawSprite(walkAnim, x, y, frame);
			lctx.drawSprite(Assets.baseLight2, x, y - 64, randInt(8), 4 * matchBrightness() + 1);
		}

    // debug player bounding using circles

    // let bounding = characterBounding.map(v => vadd(getPos(), v));
    //
    // for ([x, y] of bounding) {
    //   ctx.beginPath();
    //   ctx.circle(x, y, 5);
    //   ctx.fillStyle = 'red';
    //   ctx.fill();
    // }
    /*
    		{
    			let [cx,cy]=vadd(matchPos,getPos());
    			ctx.fillStyle="red";
    			ctx.circle(cx,cy,3);
    			ctx.fill();

    		}
    		*/
  }

  function lightMatch() {
    if (inventory.matches > 0) {
      matchLife = INITIAL_MATCH_LIFE;
      playSound(matchSounds[randInt(matchSounds.length)]);
      inventory.matches -= 1;
    }
  }

  function move() {
    let p = getPos();
    age += 1;

		if (timeOfDeath > 0) {
			return;
		}
    let walking = false;

    // Move up
    if (input.isKeyDown(87)) {
      p = vadd([0, -WALKING_SPEED], p);
      walkAnim = Assets.playerWalkUp;
      matchPos = [-24, -86];

      walking = true;
    }

    // Move down
    if (input.isKeyDown(83)) {
      p = vadd([0, WALKING_SPEED], p);
      walkAnim = Assets.playerWalkDown;
      matchPos = [32, -86];

      walking = true;
    }

    let boundingPosUD = characterBounding.map(v => vadd(p, v));
    if (!boundingPosUD.some(a => !world.isSpace(a))) {
      setPos(p);
    }

    p = getPos();

    // Move left
    if (input.isKeyDown(65)) {
      p = vadd([-WALKING_SPEED, 0], p);
      walkAnim = Assets.playerWalkLeft;
      matchPos = [-32, -86];
      walking = true;
    }

    // Move right
    if (input.isKeyDown(68)) {
      p = vadd([WALKING_SPEED, 0], p);
      walkAnim = Assets.playerWalkRight;
      matchPos = [32, -86];

      walking = true;
    }

    if (walking) {
      frame = Math.floor((age / 10) % 4);

      if ((age % 30) === 0) {
        playSound(footstepSounds[randInt(footstepSounds.length)]);
      }
    }

    let boundingPosLR = characterBounding.map(v => vadd(p, v));
    if (!boundingPosLR.some(a => !world.isSpace(a))) {
      setPos(p);
    }

    if (input.keyWentDown(69)) {
      lightMatch();
    }

    if (matchLife > 0) {
      matchLife -= 1; {
        pos = vadd(matchPos, getPos());
        particles.push(particleSystem(Math.floor(0.8 + 10 * matchBrightness()), {
          pos
        }, makeMatchParticle));
      }
    }
  }

  function makeMatchParticle(state) {
    let lastPosition = state.pos;
    let position = vadd(lastPosition, [(Math.random() - 0.5) * 0.15, (Math.random() - 0.9) * 1.5]);

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

  function hasFire() {
    return matchLife > 0;
  }

  function die() {
		timeOfDeath=age;

    console.log('player ded');
  }

  return {
    getPos,
    setPos,
    blocking,
    hasFire,
    die,
    move,
    draw
  };
}
