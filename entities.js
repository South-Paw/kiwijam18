function makeEntity(pos) {
  let getPos = _ => pos;
  let setPos = newpos => pos = newpos;
  let move = _ => {};
  let draw = _ => {};

  return {
    getPos,
    setPos,
    move,
    draw
  };

}

function makePlayer(pos) {
  let WALKING_SPEED = 5;

  let {
    getPos,
    setPos
  } = makeEntity(pos)

  function draw(ctx) {
    ctx.beginPath();
    ctx.fillStyle = "white";
    pos = getPos();
    ctx.ellipse(pos[0], pos[1], 20, 20, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function move() {
		let p = getPos();

    // Move up
		if (input.isKeyDown(87)) {
			p = vadd([0, -WALKING_SPEED], p);
		}

    // Move down
    if (input.isKeyDown(83)) {
			p = vadd([0, WALKING_SPEED], p);
		}

    // Move left
    if (input.isKeyDown(65)) {
			p = vadd([-WALKING_SPEED, 0], p);
		}

    // Move right
    if (input.isKeyDown(68)) {
			p = vadd([WALKING_SPEED, 0], p);
		}

    setPos(p);
  }

  return {
    getPos,
    setPos,
    move,
    draw
  };
}
