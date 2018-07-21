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
	let WALKING_SPEED = 5;
	let UP=0;
	let DOWN=1;
	let LEFT=2;
	let RIGHT=3;

	let directions = [ [0,-1], [0,1], [-1,0], [1,0]]
	let anims=[Assets.minotaurWalkUp,Assets.minotaurWalkDown,Assets.minotaurWalkLeft,Assets.minotaurWalkRight];
	let direction = RIGHT;
  let age = 0;
  let frame = 0;

	let characterBounding = [
    [0, -40],
    [0, -6],
  ];

  let {
		blocking,
    getPos,
    setPos
  } = makeEntity(pos)

	function look(way) {
		let here=getPos();
		let candidate=vadd(here,vscale(directions[way],60));
		return world.isSpace(candidate);
	}

  function draw(ctx, lctx) {
    let [x, y] = getPos();
    ctx.drawSprite(anims[direction], x, y, frame);
  }

  function move() {
    age += 1;
 		let currentTile=gameToTile(getPos());
		let step=vscale(directions[direction],WALKING_SPEED);
		let p=vadd(getPos(),step);
		let boundingPos = characterBounding.map(v => vadd(p, v));
    if (!boundingPos.some(a => !world.isSpace(a))) {
      setPos(p);
    } else {
			direction=randInt(4);
		}
		frame = Math.floor((age / 10) % anims[direction].framesWide);

  }
  return {
    getPos,
		setPos,
		blocking,
    move,
    draw
  };
}

function makePlayer(pos) {
  let WALKING_SPEED = 5;
  let INITIAL_MATCH_LIFE = 1000;
  let walkAnim = Assets.playerWalkLeft;
  let age = 0;
  let frame = 0;
  let matchLife = 0;


  let {
		getPos,
		blocking,
    setPos
  } = makeEntity(pos);

  let characterBounding = [
    [0, -40],
    [0, -6],
  ];

  let burnFunction = a => Math.sin(a * a * 3) + (Math.sin(a * 80) + Math.sin(a * 100)) * (a * 0.1);

  function draw(ctx, lctx) {
    let [x, y] = getPos();

    ctx.drawSprite(walkAnim, x, y, frame);

    let matchLevel = matchLife / INITIAL_MATCH_LIFE;

    lctx.drawSprite(Assets.baseLight, x, y - 64, randInt(8), 5 * burnFunction(matchLevel) + 1);

    // debug player bounding using circles

    // let bounding = characterBounding.map(v => vadd(getPos(), v));
    //
    // for ([x, y] of bounding) {
    //   ctx.beginPath();
    //   ctx.circle(x, y, 5);
    //   ctx.fillStyle = 'red';
    //   ctx.fill();
    // }
  }

  function lightMatch() {
    if (gameState.matches > 0 && !editing) {
      matchLife = INITIAL_MATCH_LIFE;
      gameState.matches -= 1;
    }
  }

  function move() {
    let p = getPos();
    age += 1;

    let walking = false;

    // Move up
    if (input.isKeyDown(87)) {
      p = vadd([0, -WALKING_SPEED], p);
      walkAnim = Assets.playerWalkUp;
      walking = true;
    }

    // Move down
    if (input.isKeyDown(83)) {
      p = vadd([0, WALKING_SPEED], p);
      walkAnim = Assets.playerWalkDown;
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
      walking = true;
    }

    // Move right
    if (input.isKeyDown(68)) {
      p = vadd([WALKING_SPEED, 0], p);
      walkAnim = Assets.playerWalkRight;
      walking = true;
    }

    if (walking) {
      frame = Math.floor((age / 10) % 4);
    }

		let boundingPosLR = characterBounding.map(v => vadd(p, v));
    if (!boundingPosLR.some(a => !world.isSpace(a))) {
      setPos(p);
    }

    if (input.keyWentDown(69)) {
      lightMatch();
    }

    if (matchLife > 0) {
      matchLife -= 1;
    }
  }

  return {
    getPos,
		setPos,
		blocking,
    move,
    draw
  };
}
