function makeBrazier(pos) {
  let age = 0;
  let frame = 0;
  let {
    getPos,
		setPos,
		
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
	function blocking(atPos) {
		let d = vdistance(atPos,getPos());

		return d<40;
	}
	
	let result= {
    getPos,
    setPos,
		move,
		blocking,
    draw
	};
	
	let [tx,ty]=gameToTile(pos);
	
	//this is bad don't blindly put in 9 tiles,  fix when not tired
	for (let x=-1; x<2;x++) {
		for (let y=-1; y<2;y++) {
			world.tileAt([tx+x,ty+y]).contents.push(result);
		}
	}
	
  return result; 
}


function makeRat(pos) {
  let age = 0;
  let frame = 0;
  let {
    getPos,
		setPos,
		blocking
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
		blocking,
    draw
  };
}
