import * as THREE from '../build/three.module.js';

const Z_AXIS = new THREE.Vector3(0, 0, 1);

const FULL_ROTATION = Math.PI * 2;

export function createStarSpline(n=7) {
    
    const points = []

    for (let i = 0; i < n * 2; i++) {
        const l = i % 2 == 0 ? 30 : 50;
        const a = i / n * Math.PI;
        points.push(new THREE.Vector3(Math.cos(a) * l, Math.sin(a) * l, 0));
    }

    return new THREE.CatmullRomCurve3(points, true);
}

export function extrutionSplines(baseSpline, splineCount, offset, theta) {

    const splines = [];

    for (let i = 0; i < splineCount; i++) {

      // clonar
      const points = [];
      const offsetVec = new THREE.Vector3(0, 0, i * offset);

      for (const p of baseSpline.points) {
          const point = p.clone().applyAxisAngle(Z_AXIS, theta * i).add(offsetVec);
          points.push(point);
      }

      const spline = new THREE.CatmullRomCurve3(points, true);
      splines.push(spline);
  }
  return splines;
}

export function createRotationSpline() {
  const curve = new THREE.SplineCurve( [
    new THREE.Vector3( 0, 0, 0 ),
    new THREE.Vector3( 30, 0, 0 ),
    new THREE.Vector3( 10, 0, 5 ),
    new THREE.Vector3( 10, 0, 7 ),
    new THREE.Vector3( 20, 0, 12 ),
    new THREE.Vector3( 20, 0, 24 ),
    new THREE.Vector3( 15, 0, 28 ),
    new THREE.Vector3( 5, 0, 35 )
  ] );
  return curve;
}

export function rotationSplines(baseSpline, splineCount) {

  const splines = [];

  for (let i = 0; i < splineCount + 1; i++) {

    const theta = FULL_ROTATION / splineCount;
    // clonar
    const points = [];

    for (const p of baseSpline.points) {
        const point = p.clone().applyAxisAngle(Z_AXIS, theta * i);
        points.push(point);
    }

    const spline = new THREE.CatmullRomCurve3(points, true);
    splines.push(spline);
}
return splines;
}

/**
 * Zips any number of arrays. It will always zip() the largest array returning undefined for shorter arrays.
 * @param  {...Array<any>} arrays 
 */
export function* zip(...arrays){
    const minLength = arrays.reduce((min, curIterable) => curIterable.length < min ? curIterable.length: min, 100000);
    for (let i = 0; i < minLength; i++) {
      yield arrays.map(array => array[i]);
    }
  }

export function setMaterials(){
    const materials = {};
    materials[ 'wireframe' ] = new THREE.MeshBasicMaterial( { wireframe: true } );
    materials[ 'flat' ] = new THREE.MeshPhongMaterial( { specular: 0x000000, flatShading: true, side: THREE.DoubleSide } );
    materials[ 'smooth' ] = new THREE.MeshLambertMaterial( { side: THREE.DoubleSide } );
    materials[ 'glossy' ] = new THREE.MeshPhongMaterial( { side: THREE.DoubleSide } );

  return materials;
}

export function setRotations(){
    const rotations = {};
    rotations[ 'Pi' ] = Math.PI;
    rotations[ 'Pi/2' ] = Math.PI / 2;
    rotations[ 'Pi/4' ] = Math.PI / 4;
    rotations[ 'Pi/8' ] = Math.PI / 8;

    return rotations;
}