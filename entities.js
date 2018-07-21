function makeEntity(pos) {
  let getPos = _ => pos;
  let setPos = newpos => pos = newpos;
  let move = _ => {};
  let draw = _ => {};
  let blocking = (x, y) => {
    false
  };

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
  let age = 0;
  let frame = 0;
  let anim = Assets.minotaurWalkLeft;
  let {
    getPos,
    setPos
  } = makeEntity(pos)

  function draw(ctx, lctx) {
    let [x, y] = getPos();
    ctx.drawSprite(anim, x, y, frame);
  }

  function move() {
    age += 1;
    frame = Math.floor((age / 10) % 6);

  }
  return {
    getPos,
    setPos,
    move,
    draw
  };
}

function makePlayer(pos) {
  let WALKING_SPEED = 5;
  let walkAnim = Assets.playerWalkLeft;
  let age = 0;
  let frame = 0;

  let {
    getPos,
    setPos
  } = makeEntity(pos);

  let characterBounding = [
    [0, -64],
    [0, 0],
  ];

  function draw(ctx, lctx) {
    let [x, y] = getPos();

    ctx.drawSprite(walkAnim, x, y, frame);

    lctx.drawSprite(Assets.baseLight, x, y - 64, randInt(8));

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

    let boundingPosUD = characterBounding.map(v => vadd(p, v)).map(p => gameToTile(p));

    if (!boundingPosUD.some(a => world.tileAt(a).floorType > 24)) {
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

    let boundingPosLR = characterBounding.map(v => vadd(p, v)).map(p => gameToTile(p));

    if (!boundingPosLR.some(a => world.tileAt(a).floorType > 24)) {
      setPos(p);
    }
  }

  return {
    getPos,
    setPos,
    move,
    draw
  };
}
