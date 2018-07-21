function makeBrazier(pos) {
  let age = 0;
  let frame = 0;
  let {
    getPos,
    setPos
  } = makeEntity(pos);

	function flicker(a) {
		return (Math.sin(age/100)+Math.sin(age/180))/3;
	}
  function draw(ctx, lctx) {
    let [x, y] = getPos();

    ctx.drawSprite(Assets.brazierBurn, x, y, randInt(3));
    lctx.drawSprite(Assets.baseLight, x, y, randInt(8),7+flicker(age));

  }

  function move() {
    let p = getPos();
    age += 1;
  }

  return {
    getPos,
    setPos,
    move,
    draw
  };
}


function makeRat(pos) {
  let age = 0;
  let frame = 0;
  let {
    getPos,
    setPos
  } = makeEntity(pos)

  function draw(ctx, lctx) {
    let [x, y] = getPos();

    lctx.drawSprite(Assets.baseLight, x, y, randInt(8));

  }

  function move() {
    let p = getPos();
    age += 1;

  }
  return {
    getPos,
    setPos,
    move,
    draw
  };
}
