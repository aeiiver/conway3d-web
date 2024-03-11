/// <reference path="./node_modules/@types/three/index.d.ts" />

// @ts-ignore We won't investigate
import WebGL from 'three/addons/capabilities/WebGL.js';
import * as THREE from 'three';

import conway from 'conway';

if (!WebGL.isWebGLAvailable()) {
  const warningDiv = WebGL.getWebGLErrorMessage();
  document.body.appendChild(warningDiv);
  throw new Error(warningDiv.innerText);
}

let width = window.innerWidth;
let height = window.innerHeight;

let renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

let fov = 90;
let near = 1;
let far = 1000;

let mouseSens = 0.05;
let yaw = -90;
let pitch = 0;

let scene = new THREE.Scene();
let cam = new THREE.PerspectiveCamera(fov, width / height, near, far);
let camSpeed = new THREE.Vector3();
let camAccel = 0.1;

let con = conway.init(20, 20, 20);
conway.populate(con, 0.5);

let camFront = new THREE.Vector3(con.width, con.height, con.depth);
cam.position.set(con.width, con.height, con.depth * 2.5);
cam.lookAt(camFront);

/** @type {THREE.LineSegments<THREE.EdgesGeometry<THREE.BoxGeometry>, THREE.MeshBasicMaterial, THREE.Object3DEventMap>[][][]} */
let cubes = new Array(con.depth).fill(0).map(
  _z => new Array(con.height).fill(0).map(
    _y => new Array(con.width).fill(0).map(
      _x => new THREE.LineSegments()
    )
  )
);

{
  let geometry = new THREE.BoxGeometry(con.width*2, con.height*2, con.depth*2);
  let edges = new THREE.EdgesGeometry(geometry);
  let material = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
  let cube = new THREE.LineSegments(edges, material);
  scene.add(cube);

  cube.translateZ(con.depth - 1);
  cube.translateY(con.height - 1);
  cube.translateX(con.width - 1);
}

let hexAlive = 0xFFFFFF;

for (let z = 0; z < con.depth; z += 1) {
  for (let y = 0; y < con.height; y += 1) {
    for (let x = 0; x < con.width; x += 1) {
      if (con.grid[z][y][x] === 'dead')
        continue;

      let geometry = new THREE.BoxGeometry();
      let edges = new THREE.EdgesGeometry(geometry);
      let material = new THREE.MeshBasicMaterial({ color: hexAlive });
      let cube = new THREE.LineSegments(edges, material);
      scene.add(cube);

      cubes[z][y][x] = cube;
      cubes[z][y][x].translateZ(z*2);
      cubes[z][y][x].translateY(y*2);
      cubes[z][y][x].translateX(x*2);
    }
  }
}

/**
 * @param {KeyboardEvent} ev
 */
function keyMove(ev) {
  if (ev.code === 'Escape')
    document.exitPointerLock();
  if (ev.code === 'KeyW')
    camSpeed.z = -camAccel;
  if (ev.code === 'KeyS')
    camSpeed.z = camAccel;
  if (ev.code === 'KeyA')
    camSpeed.x = -camAccel;
  if (ev.code === 'KeyD')
    camSpeed.x = camAccel;
  if (ev.code === 'Space')
    camSpeed.y = camAccel;
  if (ev.ctrlKey)
    camSpeed.y = -camAccel;
  if (ev.code === 'KeyN')
    conway.next(con);
  if (ev.code === 'KeyR') {
    conway.reset(con);
    conway.populate(con, 0.5);
  }
}
window.addEventListener('keypress', keyMove);

window.addEventListener('keyup', ev => {
  if (ev.code === 'KeyW')
    camSpeed.z -= -camAccel;
  if (ev.code === 'KeyS')
    camSpeed.z -= camAccel;
  if (ev.code === 'KeyA')
    camSpeed.x -= -camAccel;
  if (ev.code === 'KeyD')
    camSpeed.x -= camAccel;
  if (ev.code === 'Space')
    camSpeed.y -= camAccel;
  if (ev.ctrlKey)
    camSpeed.y -= -camAccel;
});

/**
 * @param {number} x
 */
function rads(x) {
  return x * Math.PI / 180;
}

let XX = width / 2;
let YY = height / 2;

/**
 * @param {MouseEvent} ev
 */
function handleMouse(ev) {
  XX += ev.movementX;
  YY += ev.movementY;
  let deltaX = ev.movementX * mouseSens;
  let deltaY = -ev.movementY * mouseSens;
  yaw += deltaX;
  pitch += deltaY;
  if (pitch > 89.0) pitch = 89.0;
  if (pitch < -89.0) pitch = -89.0;

  cam.lookAt(cam.position.clone().add(new THREE.Vector3(
    Math.cos(rads(yaw) * Math.cos(rads(pitch))),
    Math.sin(rads(pitch)),
    Math.sin(rads(yaw) * Math.cos(rads(pitch))),
  ).normalize()));
}

renderer.domElement.addEventListener('click', async _ev => {
  if (!document.pointerLockElement) {
    await renderer.domElement.requestPointerLock();
  }
});

document.addEventListener('pointerlockchange', _ev => {
  if (document.pointerLockElement === renderer.domElement) {
    renderer.domElement.addEventListener('mousemove', handleMouse);
  } else {
    renderer.domElement.removeEventListener('mousemove', handleMouse);
  }
});

function render() {
  for (let z = 0; z < con.depth; z += 1) {
    for (let y = 0; y < con.height; y += 1) {
      for (let x = 0; x < con.width; x += 1) {
        if (con.grid[z][y][x] === 'alive') {
          cubes[z][y][x].material.color.setHex(hexAlive);
          cubes[z][y][x].visible = true;
        } else {
          cubes[z][y][x].visible = false;
        }
      }
    }
  }

  cam.translateX(camSpeed.x);
  cam.translateY(camSpeed.y);
  cam.translateZ(camSpeed.z);

  renderer.render(scene, cam);
  requestAnimationFrame(render);
}
render();
