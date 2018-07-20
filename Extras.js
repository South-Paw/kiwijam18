var min = Math.min;
var max = Math.max;
let median = (a, b, c) => max(min(a, b), min(max(a, b), c));

function randInt(below) {
  return Math.floor(Math.random() * below);
}

function randFloat(scale = 1.0, offset = 0) {
  return Math.random() * scale + offset;
}

function probability(amount = 0.5) {
  return Math.random() < amount;
}

function* intRange(start, end) {
  let current = start;
  while (current < end) {
    yield current++;
  }
}


var identityfn = a => a;



function randomPoint(scale = 1.0, offset = [0, 0, 0]) {
  return offset.map(a => randFloat(scale, a));
}


var vop = op => ((a, b) => (a.map((v, i) => op(v, b[i]))));
var vdiff = vop((a, b) => a - b);
var vequals = (a, b) => {
  return (vdiff(a, b).reduce((c, d) => c + Math.abs(d), 0)) === 0;
}
var vadd = vop((a, b) => a + b);
var vdot = (a, b) => a.reduce((ac, av, i) => ac += av * b[i], 0);
var vlength = a => Math.sqrt(vdot(a, a));
var vscale = (a, b) => a.map(v => v * b);
var vdistance = (a, b) => vlength(vdiff(a, b));
var project = (point, matrix) => matrix.map(p => vdot(p, [...point, 1]));
var transpose = matrix => (matrix.reduce(($, row) => row.map((_, i) => [...($[i] || []), row[i]]), []));
var multiply = (a, b, ...rest) => (!b) ? a : multiply(a.map((p => transpose(b).map(q => vdot(p, q)))), ...rest);

var scaleMatrix = (x = 1, y = x, z = x) => [
  [x, 0, 0, 0],
  [0, y, 0, 0],
  [0, 0, z, 0],
  [0, 0, 0, 1]
];
var translationMatrix = (x = 0, y = 0, z = 0) => [
  [1, 0, 0, x],
  [0, 1, 0, y],
  [0, 0, 1, z],
  [0, 0, 0, 1]
];

function rotationMatrix(...xyz) {
  let [cx, cy, cz] = xyz.map(Math.cos);
  let [sx, sy, sz] = xyz.map(Math.sin);

  let rx = [
    [1, 0, 0, 0],
    [0, cx, -sx, 0],
    [0, sx, cx, 0],
    [0, 0, 0, 1]
  ];
  let ry = [
    [cy, 0, sy, 0],
    [0, 1, 0, 0],
    [-sy, 0, cy, 0],
    [0, 0, 0, 1]
  ];
  let rz = [
    [cz, -sz, 0, 0],
    [sz, cz, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ];

  return multiply(rx, ry, rz);
}


function pTime(fn) {
  let start = performance.now();
  fn();
  let end = performance.now();

  return (end - start)
}


function easeOutElastic(t) {
  var p = 0.3;
  return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
}
