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
let camFront = new THREE.Vector3(0, 0, -1);
cam.position.set(0, 0, 10);
cam.lookAt(cam.position.clone().add(camFront));

let cubes = new Array(conway.grid.length).fill(0).map(
  _z => new Array(conway.grid.length).fill(0).map(
    _y => new Array(conway.grid.length).fill(0).map(
      // I know this looks expensive but we had no choice in Vanilla JS
      _x => new THREE.LineSegments(undefined, undefined)
    )
  )
);

for (let z = 0; z < conway.grid.length; z += 1) {
  for (let y = 0; y < conway.grid[0].length; y += 1) {
    for (let x = 0; x < conway.grid[0][0].length; x += 1) {
      let geometry = new THREE.BoxGeometry();
      let edges = new THREE.EdgesGeometry(geometry);
      let material = new THREE.MeshBasicMaterial({ color: conway.grid[z][y][x] === 1 ? 0xFFFFFF : 0x202020 });
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
    conway.next();
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
    // @ts-ignore
    renderer.domElement.requestPointerLock();
  }
});

window.addEventListener('pointerlockchange', _ev => {
  if (document.pointerLockElement === renderer.domElement) {
    renderer.domElement.addEventListener('mousemove', handleMouse);
  } else {
    renderer.domElement.removeEventListener('mousemove', handleMouse);
  }
});

function render() {
  for (let z = 0; z < conway.grid.length; z += 1) {
    for (let y = 0; y < conway.grid[0].length; y += 1) {
      for (let x = 0; x < conway.grid[0][0].length; x += 1) {
        cubes[z][y][x].material.color.setHex(conway.grid[z][y][x] === 1 ? 0xFFFFFF : 0x202020);
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
