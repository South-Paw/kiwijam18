
{const top=0,parent=c=>(c+1>>>1)-1,left=c=>(c<<1)+1,right=c=>c+1<<1;class PriorityQueue{constructor(c=(d,e)=>d>e){this._heap=[],this._comparator=c}size(){return this._heap.length}isEmpty(){return 0==this.size()}peek(){return this._heap[top]}push(...c){return c.forEach(d=>{this._heap.push(d),this._siftUp()}),this.size()}pop(){const c=this.peek(),d=this.size()-1;return d>top&&this._swap(top,d),this._heap.pop(),this._siftDown(),c}replace(c){const d=this.peek();return this._heap[top]=c,this._siftDown(),d}_greater(c,d){return this._comparator(this._heap[c],this._heap[d])}_swap(c,d){[this._heap[c],this._heap[d]]=[this._heap[d],this._heap[c]]}_siftUp(){for(let c=this.size()-1;c>top&&this._greater(c,parent(c));)this._swap(c,parent(c)),c=parent(c)}_siftDown(){for(let d,c=top;left(c)<this.size()&&this._greater(left(c),c)||right(c)<this.size()&&this._greater(right(c),c);)d=right(c)<this.size()&&this._greater(right(c),left(c))?right(c):left(c),this._swap(c,d),c=d}}window.PriorityQueue=PriorityQueue}

/*
function PriorityQueue() {
   this.base = [];
}

PriorityQueue.prototype.push = function (value,priority) {
  this.base.push({value,priority});

  this.base.sort((a,b)=>b.priority-a.priority);
}

PriorityQueue.prototype.pop = function() {
  return this.base.pop().value;
}

PriorityQueue.prototype.isEmpty = function () {
  return this.base.length===0;
}
*/
function aStar(start,goal,costFunction) {
  function asInt([x,y]) {
    return (y<<16)+x;
  }
  function fromInt(i) {
    return [i&0xffff,i>>16];
  }
  function manhattenD([x1,y1],[x2,y2]) {
    return Math.abs(x1-x2)+Math.abs(y1-y2);
  }
  function diagD([x1,y1],[x2,y2]) {
    return Math.max(Math.abs(x1-x2),Math.abs(y1-y2));
  }
  function cost(i) {
    return costFunction(fromInt(i));
  }
/*
  function neighbours(i) {
    let [x,y]=fromInt(i);
    let [a,b,c,d] = [ [x-1,y], [x+1,y], [x, y-1], [x,y+1] ];


    return [ a,b,c,d ]
          //.sort( (p,q)=>manhattenD(p,goal)-manhattenD(q,goal) )
          .map(asInt);
  }
*/
  let startInt=asInt(start);
  let goalInt=asInt(goal);

  let closedSet = new Set();


  let fScore = new Map();
  fScore.set(startInt,manhattenD(start,goal));


  let openSet =  new PriorityQueue((a,b) => fScore.get(a) < fScore.get(b));

  openSet.push(startInt)


  let cameFrom = new Map();

 /*
  function bestOpen() {

    //console.log("findBest from ",Array.from(openSet).map(a=>[fromInt(a),fScore.get(a)]));
    let bestScore = Infinity;
    let best=undefined;
    for (let i of openSet) {

      let currentScore = fScore.get(i)
      if (currentScore < bestScore)  {
        best=i;
        bestScore=currentScore;
      }
    }

    //console.log("best is",fromInt(best),fScore.get(best) );
    return best;
  }
*/

  let gScore = new Map();
  gScore.set(startInt,0);
  function gScoreAt(i) {
    if (gScore.has(i)) return gScore.get(i);
    return Infinity;
  }

  function path(from) {
    let result = [fromInt(from)];
    let bail = 0;
    while (cameFrom.has(from)) {
      if (bail++ > 1000) {console.log("bailing path()"); return}
      from=cameFrom.get(from);
      result.push(fromInt(from));
    }

    return result;
  }

  let closestDistance = Infinity;
  let closestSoFar = startInt;

  function tryNeighbour(neighbour,from) {
    if (closedSet.has(neighbour)) return;
    if (cost(neighbour) > 65536) return;

    let maybe = gScore.get(from) + cost(neighbour);
    if (maybe >= gScoreAt(neighbour)) {
      return;  //we can already get to neighbour with a better or equal path
    }

    cameFrom.set(neighbour,from);
    gScore.set(neighbour,maybe);
    let remaining = diagD(fromInt(neighbour),goal);
    fScore.set(neighbour, (maybe/2) + remaining)
    openSet.push(neighbour);

    if (remaining < closestDistance) {
      closestSoFar=neighbour;
      closestDistance=remaining;
    }
  }

  let bail = 0;
  while (! openSet.isEmpty() ) {
    if (bail++ > 1000000) {
      console.log("bailing astar");
      return
    }
    let current=openSet.pop();

    if (current === goalInt) {
      //console.log("path found after "+bail+" steps");
      return path(current)
    }

    closedSet.add(current);

    tryNeighbour(current+1,current);
    tryNeighbour(current-1,current);
    tryNeighbour(current+65536,current);
    tryNeighbour(current-65536,current);
  }

  return path(closestSoFar);

}
