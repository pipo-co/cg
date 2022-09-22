import * as THREE from '../build/three.module.js';


import { GUI } from '../examples/jsm/libs/lil-gui.module.min.js';

import { OrbitControls } from '../examples/jsm/controls/OrbitControls.js';
import { GeneratedGeometry } from './geometries.js'
import { setMaterials, setRotations } from './utils.js'

let camera, scene, renderer, controls;

let geometryCode;
let geometryHeight;
let geometryRotation;
let geometryResolution;
let geometryMaterial;

let geometryController = {
  geometryCode: 'B2',
  geometryHeight: 100,
  geometryRotation: Math.PI / 2,
  geometryResolution: 40,
  geometryMaterial: 'glossy'
};

let meshiMesh;
const materials = setMaterials();
const rotations = setRotations();

init();
animate();

function init() {

    camera = new THREE.PerspectiveCamera(33, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 1000;

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    // controls.addEventListener('change', render);
    controls.minDistance = 50;
    controls.maxDistance = 1000;
    controls.enablePan = false;
    controls.target.set(0, 20, 0);
    controls.update();

    function addLight(...pos) {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(...pos);
        scene.add(light);
    }
    addLight(-1, 2, 4);
    addLight(2, -2, 3);

    const axesHelper = new THREE.AxesHelper(15);
    scene.add(axesHelper);

    document.body.style.touchAction = 'none';

    window.addEventListener('resize', onWindowResize);

    setupGui();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

//

function setupGui() {

  const gui = new GUI();
  gui.add( geometryController, 'geometryCode', [ 'B2', 'A3' ] ).name( 'Select Geometry' ).onChange( render );
  gui.add( geometryController, 'geometryHeight', [ 100, 200 ] ).name( 'Select Height' ).onChange( render );
  gui.add( geometryController, 'geometryRotation', [ 'Pi', 'Pi/2', 'Pi/4', 'Pi/8' ] ).name( 'Select Rotation' ).onChange( render );
  gui.add( geometryController, 'geometryResolution', [ 40, 60, 80 ] ).name( 'Select Resolution' ).onChange( render );
  gui.add( geometryController, 'geometryMaterial', [ 'wireframe', 'flat', 'smooth', 'glossy' ] ).name( 'Select Material' ).onChange( render );

}

function animate() {

    requestAnimationFrame(animate);
    // controls.update();
    render();

}

function render() {

    if (geometryController.geometryCode !== geometryCode || 
        geometryController.geometryCode !== geometryHeight ||  
        geometryController.geometryRotation !== geometryRotation || 
        geometryController.geometryResolution !== geometryResolution || 
        geometryController.geometryMaterial !== geometryMaterial) {
        
          geometryCode = geometryController.geometryCode;
          geometryMaterial = geometryController.geometryMaterial;
          geometryHeight = geometryController.geometryHeight;
          geometryRotation = geometryController.geometryRotation;
          geometryResolution = geometryController.geometryResolution;
      
          renderGeometry()
      }
  
    renderer.render(scene, camera);
}

function renderGeometry() {

  // debugger;
  if ( meshiMesh !== undefined ) {

      meshiMesh.geometry.dispose();
      scene.remove( meshiMesh );

  }

  const geometry = new GeneratedGeometry(geometryController.geometryCode, geometryController.geometryHeight, rotations[geometryController.geometryRotation], geometryController.geometryResolution);

  meshiMesh = new THREE.Mesh( geometry, materials[ geometryController.geometryMaterial ] );

  scene.add( meshiMesh );
}