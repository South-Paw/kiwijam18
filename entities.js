function makeEntity(pos) {
	let getPos = _=>pos;
	let setPos = newpos=>pos=newpos; 
	let move = _=>{};
	let draw = _=>{};

	return {getPos,setPos,move,draw};
	
}

function makePlayer(pos) {
	let {getPos,setPos} = makeEntity(pos)

	function draw(ctx) {
		ctx.beginPath();
		ctx.fillStyle="white";
		ctx.ellipse(pos[0],pos[1],20,20,0,0,Math.PI*2);
		ctx.fill();
	}

	function move() {
		
	}

	return {getPos,setPos,move,draw};	
}