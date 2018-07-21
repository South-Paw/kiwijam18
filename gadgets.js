function makeBrazier(pos) {
 	let age=0;
	let frame=0;
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
		age+=1;
		let walking=false;

		
    // Move up
    if (input.isKeyDown(87)) {
			p = vadd([0, -WALKING_SPEED], p);
			walkAnim=Assets.playerWalkUp;
			walking=true;
    }

    // Move down
    if (input.isKeyDown(83)) {
			p = vadd([0, WALKING_SPEED], p);
			walkAnim=Assets.playerWalkDown;
			walking=true;
    }

    // Move left
    if (input.isKeyDown(65)) {
			p = vadd([-WALKING_SPEED, 0], p);
			walkAnim=Assets.playerWalkLeft;
			walking=true;
    }

    // Move right
    if (input.isKeyDown(68)) {
			p = vadd([WALKING_SPEED, 0], p);
			walkAnim=Assets.playerWalkRight;
			walking=true;
		
    }

		if (walking) {
			frame = Math.floor((age/10) % 4);
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
