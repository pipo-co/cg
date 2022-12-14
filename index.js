import * as THREE from './libs/three.module.js';

import { OrbitControls } from './libs/OrbitControls.js';

import { materials, textures, lerp, loadTexture } from './utils/utils.js';
import { Forklift } from './models/forklift.js';
import { Keyboard } from './models/keyboard.js';
import { Shelving } from './models/shelving.js';
import { Printer } from './models/printer.js';
import { shapes } from './utils/geometries.js';
import { GUI } from './libs/dat.gui.module.js';

let camera, scene, renderer, orbitCamera, controls;

let forklift, printer, shelving;

let grabbed = false;

let geometryCode;
let geometryRotation;
let geometryResolution;
let geometryHeight;
let geometryMaterial;

let geometryController = {
  geometryCode: 'B2',
  geometryRotation: Math.PI / 2,
  geometryResolution: 40,
  geometryHeight: 20,
  geometryMaterial: 'texture',
  textureRepetition: 1,
  textureChosen: 'black_marble',
  render: function () {
    renderGeometry();
  },
};

init();
animate();

function animate() {

  requestAnimationFrame(animate);
  forklift.updateCar();
  renderer.render(scene, camera);
}

function createCamera() {
  orbitCamera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
  orbitCamera.position.set(0, 100, 100);
  camera = orbitCamera;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(orbitCamera, renderer.domElement);
  controls.addEventListener('change', render);
  controls.minDistance = 50;
  controls.maxDistance = 300;
  controls.enablePan = false;
  controls.target.set(0, 20, 0);
  controls.update();
}

function createSpotLight(x, y, z) {
  const group = new THREE.Group();

  const geometry = new THREE.BoxGeometry(20, 1, 20);
  const material = new THREE.MeshBasicMaterial({ color: 0xBBBBBB });
  const cube = new THREE.Mesh(geometry, material);
  group.add(cube);

  const spotLight = new THREE.SpotLight(0xffffff, 1, 0, Math.PI / 4,  1);
  spotLight.target.position.set(x, 0 ,z);
  
  group.add(spotLight);
  scene.add(spotLight.target);

  group.position.set(x, y, z);

  scene.add(group);
}

function createLights() {

  const light = new THREE.AmbientLight(0x404040, 0.2); // soft white light
  scene.add(light);

  const lightAreaSideX = 800;
  const lightAreaSideZ = 200;
  const xCount = 3;
  const zCount = 2;

  for (let i = 0; i < xCount; i++) {
    for (let k = 0; k < zCount; k++) {

      const x = lerp(- (lightAreaSideX / 2 - 1), (lightAreaSideX / 2 - 1), i / (xCount - 1));
      const y = 250
      const z = lerp(- (lightAreaSideZ / 2 - 1), (lightAreaSideZ / 2 - 1), k / (zCount - 1));

      createSpotLight(x, y, z);
    }
  }
}

function bindKeys() {
  const keyboard = new Keyboard(document);

  keyboard.handlers['KeyW'] = {
    press: () => forklift.foward(),
    release: () => forklift.stopMovement()
  }
  keyboard.handlers['KeyS'] = {
    press: () => forklift.backward(),
    release: () => forklift.stopMovement()
  }
  keyboard.handlers['KeyA'] = {
    press: () => forklift.left(),
    release: () => forklift.stopRotation()
  }
  keyboard.handlers['KeyD'] = {
    press: () => forklift.right(),
    release: () => forklift.stopRotation()
  }
  keyboard.handlers['KeyE'] = {
    press: () => forklift.up(),
    release: () => forklift.stopLiftMovement()
  }
  keyboard.handlers['KeyQ'] = {
    press: () => forklift.down(),
    release: () => forklift.stopLiftMovement()
  }
  keyboard.handlers['KeyG'] = {
    press: () => takePieceAndRemove(),
    // release: () => forklift.stopLiftMovement()
  }
  keyboard.handlers['KeyP'] = {
    press: () => controls.zoomIn(),
    // release: () => forklift.stopLiftMovement()
  }
  keyboard.handlers['KeyO'] = {
    press: () => controls.zoomOut(),
    // release: () => forklift.stopLiftMovement()
  }
  keyboard.handlers['Digit1'] = {
    press: () => {
      camera = orbitCamera;
      orbitCamera.position.set(0, 100, 100);
      controls.target.set(0, 20, 0);
      controls.update();
    }
  }
  keyboard.handlers['Digit2'] = {
    press: () => {
      camera = orbitCamera;
      orbitCamera.position.set(0, 100, 100);
      controls.target.copy(printer.printer.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 50, 0)));
      controls.update();
    }
  }
  keyboard.handlers['Digit3'] = {
    press: () => {
      camera = orbitCamera;
      orbitCamera.position.set(0, 100, 100);
      controls.target.copy(shelving.object.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 50, 0)));
      controls.update();
    }
  }
  keyboard.handlers['Digit4'] = {
    press: () => camera = forklift.cameras.driver
  }
  keyboard.handlers['Digit5'] = {
    press: () => camera = forklift.cameras.back
  }
  keyboard.handlers['Digit6'] = {
    press: () => camera = forklift.cameras.side
  }
}

function createHelpers() {
  const axesHelper = new THREE.AxesHelper(15);
  scene.add(axesHelper);
}

function init() {

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa0a0a0);
  // scene.fog = new THREE.Fog(0xa0a0a0, 10, 500);

  createHelpers();

  createCamera();
  createLights();

  const size = 10;
  const divisions = 10;

  const gridHelper = new THREE.GridHelper(size, divisions, 0x440000, 0x008800);
  scene.add(gridHelper);

  printer = new Printer();
  scene.add(printer.printer);

  shelving = new Shelving();
  scene.add(shelving.object);

  forklift = new Forklift({
    position: new THREE.Vector3(0, 0, 0),
    ratio: window.innerWidth / window.innerHeight,
    carWidth: 30,
    carLength: 60,
    liftHeight: 100
  });
  scene.add(forklift.car);

  bindKeys();

  createWalls(scene);

  //

  window.addEventListener('resize', onWindowResize);

  render();

  setupGui();

}
function createWalls(scene) {
  const warehouse = new THREE.Group();
  const wall_side = 3000;
  const plane = new THREE.BoxGeometry( wall_side, wall_side, 1);

  const floor_texture = loadTexture('StoneTilesFloor01_1K_BaseColor.png');
  floor_texture.repeat.set( 20, 20 );
  const floor_normal_texture = loadTexture('StoneTilesFloor01_1K_Normal.png');
  floor_normal_texture.repeat.set( 20, 20 );
  const floor_material = new THREE.MeshPhongMaterial({ map : floor_texture, normalMap: floor_normal_texture});

  const floor = new THREE.Mesh( plane, floor_material );
  floor.rotation.x = - Math.PI / 2;
  floor.position.y = 0;
  floor.receiveShadow = true;
  warehouse.add(floor);


  const wall_texture = loadTexture('CorrugatedMetalPanel02_1K_BaseColor.png');
  wall_texture.repeat.set( 20, 20 );
  const wall_normal_texture = loadTexture('CorrugatedMetalPanel02_1K_Normal.png');
  wall_normal_texture.repeat.set( 20, 20 );

  const wall_material = new THREE.MeshPhongMaterial({ map : wall_texture, normalMap: wall_normal_texture });
  const walls = new THREE.Group();

  const wall_1 = new THREE.Mesh( plane, wall_material );
  wall_1.rotation.x = - Math.PI;
  wall_1.position.y = wall_side/2;
  wall_1.position.z = 300;
  wall_1.receiveShadow = true;
  walls.add(wall_1);

  const wall_2 = new THREE.Mesh( plane, wall_material );
  wall_2.rotation.x = - Math.PI;
  wall_2.position.y = wall_side/2;
  wall_2.position.z = -300;
  wall_2.receiveShadow = true;
  walls.add(wall_2);

  const wall_3 = new THREE.Mesh( plane, wall_material );
  wall_3.rotation.x = - Math.PI;
  wall_3.rotation.y = Math.PI / 2;
  wall_3.position.x = -500;
  wall_3.position.y = wall_side/2;
  wall_3.receiveShadow = true;
  walls.add(wall_3);

  const wall_4 = new THREE.Mesh( plane, wall_material );
  wall_4.rotation.x = - Math.PI;
  wall_4.rotation.y = Math.PI / 2;
  wall_4.position.x = 500;
  wall_4.position.y = wall_side/2;
  wall_4.receiveShadow = true;
  walls.add(wall_4);

  warehouse.add(walls);

  scene.add(warehouse);
}

function setupGui() {
  var gui = new GUI();

  var geometry = gui.addFolder('Geometries');
  geometry.add(geometryController, 'geometryCode', Object.keys(shapes)).name('Code').listen();
  geometry.add(geometryController, 'geometryRotation', 0, Math.PI * 2).name('Rotation').listen();
  geometry.add(geometryController, 'geometryResolution', 10, 60).name('Resolution').listen();
  geometry.add(geometryController, 'geometryHeight', 10, 30).name('Height').listen();
  geometry.add(geometryController, 'geometryMaterial', Object.keys(materials)).name('Material').listen();
  geometry.add(geometryController, 'textureChosen', Object.keys(textures)).name('Texture').listen();
  geometry.add(geometryController, 'textureRepetition', 1, 20).name('Repetition').listen();

  geometry.open();

  gui.add(geometryController, 'render');
  // gui.remove(geometryController, 'render');
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  render();

}

function render() {

  if (geometryController.geometryCode !== geometryCode ||
    geometryController.geometryRotation !== geometryRotation ||
    geometryController.geometryResolution !== geometryResolution ||
    geometryController.geometryHeight !== geometryHeight ||
    geometryController.geometryMaterial !== geometryMaterial) {

    geometryCode = geometryController.geometryCode;
    geometryRotation = geometryController.geometryRotation;
    geometryResolution = geometryController.geometryResolution;
    geometryHeight = geometryController.geometryHeight;
    geometryMaterial = geometryController.geometryMaterial;
  }

  renderer.render(scene, camera);
}

function renderGeometry() {
  printer.renderPiece(geometryController);
}

function takePieceAndRemove() {
  let piece;
  if (grabbed) {
    const liftV3 = forklift.components.lift.getWorldPosition(new THREE.Vector3());
    piece = forklift.getPiece();
    if (shelving.dropPiece(piece, liftV3)) {
      forklift.removePiece();
      grabbed = false;
    }
  }
  else {
    piece = printer.takePiece();
    if (forklift.grab(piece, printer.piecePosition, printer.maxPieceHeight)) {
      grabbed = true;
      printer.removePiece();
    }
  }
}