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
    setPos(vadd([0.1, 0.2], p));

  }

  return {
    getPos,
    setPos,
    move,
    draw
  };
}
