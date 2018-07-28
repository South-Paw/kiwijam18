function initInput(){
	window.usingTouch=false;
	let touchCountDown=0;

	let keyboardState = {};
  let keysDown = {};

	let touchKeyState = {};
	let touchKeysDown = {};
	
document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

function keyDownHandler(event) {
	keyboardState[event.keyCode] = true;
	keysDown[event.keyCode] = true;
}

function keyUpHandler(event) {
	keyboardState[event.keyCode] = false;
}

function isKeyDown(keyCode) {
	return (keyboardState[keyCode] ? true : false) ||
				 (touchKeyState[keyCode] ? true : false)
		  ;
}

function keyWentDown(keyCode) {
	return (keysDown[keyCode] ? true : false) ||
	       (touchKeysDown[keyCode] ? true : false);
}

function flushKeysDown() {
	keysDown = {};
	touchKeysDown = {};
	if (touchCountDown>0) {
		touchCountDown-=1;
	}
	window.usingTouch=(touchCountDown>0);
}

let mainElement=document.querySelector("#main");

mainElement.addEventListener("touchstart", touchStartHandler);
mainElement.addEventListener("touchend", touchHandler);
mainElement.addEventListener("touchcancel", touchHandler);
mainElement.addEventListener("touchmove", touchHandler);

function localCoordinates([x, y]) {
	return [x / mainElement.clientWidth * mainElement.width, y / mainElement.clientHeight * mainElement.height];
}

window.touchList=[];

function wasdTouch(touch) {

	let [dx,dy]=vdiff(touch,[200,900]);
	
	//note=JSON.stringify({dx,dy});

	if (vlength([dx,dy]) > 300) return [];
	if (vlength([dx,dy]) < 50) return [];

	result =[];

	if (dy<-25) result.push(87);
	if (dy>25) result.push(83); 
	if (dx<-25) result.push(65);
	if (dx>25) result.push(68);

	return result;
}

function touchButton(keycode,pos,radius) {
	return touch=>vdistance(pos,touch)<radius?[keycode]:[];
}
let touchMappers =[wasdTouch,touchButton(32,[0,0],200), touchButton(69,[1820,980],100)];

function flatten(array) {  //there's a method for this, except for edge.
	return array.reduce( (a,v)=>a.concat(v),[]);
	
}

function touchStartHandler(e){
	window.touchList=e.touches;	
	e.preventDefault();

	for (let touch of e.changedTouches) {
		let pos = localCoordinates([touch.clientX,touch.clientY]);
		let keyCodes = touchMappers.map(a=>a(pos));
		note=JSON.stringify(flatten(keyCodes));
		flatten(keyCodes).forEach(a=>touchKeysDown[a]=true);
 	}

	touchKeyState={};
	for (let touch of e.touches) {
		let pos = localCoordinates([touch.clientX,touch.clientY]);

		let keyCodes = touchMappers.map(a=>a(pos));
		for (let keyCode of flatten(keyCodes)) {
			touchKeyState[keyCode]=true;
		}
	}
	touchCountDown=200;
}

function touchHandler(e){
	touchCountDown=200;
	window.touchList=e.touches;

	touchKeyState={};
	for (let touch of e.touches) {
		let pos = localCoordinates([touch.clientX,touch.clientY]);
		let keyCodes = touchMappers.map(a=>a(pos))		
		note=JSON.stringify(keyCodes) + "   ***   " + JSON.stringify(flatten(keyCodes)) ;

		for (let keyCode of flatten(keyCodes)) {
			touchKeyState[keyCode]=true;
		}
 	}

	e.preventDefault();
}
window.input = {
	isKeyDown,
	keyWentDown,
	flushKeysDown
};

};
