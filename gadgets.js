function makeBrazier(pos, lit = false) {
  let age = 0;
  let frame = 0;
  let {
    getPos,
    setPos,
  } = makeEntity(pos);

  function flicker(a) {
    return (Math.sin(age / 100) + Math.sin(age / 180)) / 3;
  }

  function draw(ctx, lctx) {
    let [x, y] = getPos();
		frame = Math.floor(age/5)%3;

    if (lit) {
      ctx.drawSprite(Assets.brazierBurn, x, y, frame);

      let flip = 1;

      if (probability(0.5)) {
        flip = -flip
      };

      lctx.drawSprite(Assets.baseLight, x, y, randInt(8), (7 + flicker(age)) * flip);
    } else {
      ctx.drawSprite(Assets.brazierEmber, x, y, randInt(6));
    }
  }

  function move() {
    let p = getPos();
    age += 1;
    if (world.player.hasFire() && !lit) {
      if (vdistance(p, world.player.getPos()) < 100) {
        playSound(Assets.FireTorchLit);
        playSound(Assets.FireTorchLit, 2500);

        lit = true;
      }
    }
  }

  function blocking(atPos) {
    let d = vdistance(atPos, getPos());

    return d < 40;
  }

  let result = {
    getPos,
    setPos,
    move,
    blocking,
    draw
  };

  let [tx, ty] = gameToTile(pos);

  //this is bad don't blindly put in 9 tiles,  fix when not tired
  for (let x = -1; x < 2; x++) {
    for (let y = -1; y < 2; y++) {
      world.tileAt([tx + x, ty + y]).contents.push(result);
    }
  }

  return result;
}


function makeRat(pos) {
	let WALKING_SPEED = 5;
  let age = 0;
	let frame = 0;

	let UP = 0;
  let DOWN = 1;
  let LEFT = 2;
	let RIGHT = 3;
	let IDLE =4;

	let anims = [Assets.ratWalkUp, Assets.ratWalkDown, Assets.ratWalkLeft, Assets.ratWalkRight,Assets.ratIdle];

  let directions = [
    [0, -1],
    [0, 1],
    [-1, 0],
		[1, 0],
		[0,0]
  ];

	let direction = RIGHT;

	let characterBounding = [
    [0, -16],
    [0, 0],
  ];

  let {
    getPos,
    setPos,
    blocking
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


  function draw(ctx, lctx) {
    let [x, y] = getPos();

    ctx.drawSprite(anims[direction], x, y, frame);
  }

  function move() {
		age += 1;
		frame = Math.floor(age/20) & 1;

		let currentTile = gameToTile(getPos());
    let step = vscale(directions[direction], WALKING_SPEED);
    let p = vadd(getPos(), step);
    let boundingPos = characterBounding.map(v => vadd(p, v));
    if (!boundingPos.some(a => !world.isSpace(a))) {
      setPos(p);
    } else {
      direction = randInt(5);
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
			case IDLE:
			  if ( (age % 400) == 0) {
					direction=randInt(5);
				}
    }
		if (direction == IDLE) frame=1;
  }

  return {
    getPos,
    setPos,
    move,
    blocking,
    draw
  };
}


function makeKey(pos) {
  let collected = false;
  let {
    getPos,
    setPos,
    blocking
  } = makeEntity(pos);

  function draw(ctx, lctx) {
    if (collected) return
    let [x, y] = getPos();

    ctx.drawSprite(Assets.key, x, y);

  }

  function move() {
    if (collected) return;

    let p = getPos();

    if (vdistance(p, world.player.getPos()) < 64) {
      playSound(Assets.KeyPickup);
      inventory.keys += 1;
      collected = true;
    }
  }
  return {
    getPos,
    setPos,
    move,
    blocking,
    draw
  };
}

function makeMatch(pos) {
  let collected = false;
  let {
    getPos,
    setPos,
    blocking
  } = makeEntity(pos);

  function draw(ctx, lctx) {
    if (collected) return
    let [x, y] = getPos();

    ctx.drawSprite(Assets.match, x, y, 0, 0.6);
  }

  function move() {
    if (collected) return;

    let p = getPos();

    if (vdistance(p, world.player.getPos()) < 64) {
      playSound(Assets.KeyPickup);
      inventory.matches += 1;
      collected = true;
    }
  }
  return {
    getPos,
    setPos,
    move,
    blocking,
    draw
  };
}
