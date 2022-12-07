import './style.css'
import * as THREE from 'three'
import * as dat from 'lil-gui'
import gsap from 'gsap'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'  
import { CubeTexture } from 'three'

/**
 * Debug
 */
const gui = new dat.GUI();

let speed = Math.random()*0.2;

const parameters = {
    material1Color : '#dedede',
    material2Color : '#b0bdbf',
    resetRandomSpeed : () => {
        speed = Math.random()*0.2;
    },
    normalScale : 1
};

gui.addColor(parameters, 'material1Color')
    .onChange(() =>
    {
        material.color.set(parameters.material1Color);
    })
    .name('ringsColor');
gui.addColor(parameters, 'material2Color')
    .onChange(() =>
    {
        material2.color.set(parameters.material2Color);
    })
    .name('torusColor');


/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Light
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
const pointLight = new THREE.PointLight(0xffffff, 0.5);
pointLight.position.x = 2;
pointLight.position.y = 3;
pointLight.position.z = 4;
scene.add(ambientLight, pointLight);

/**
 * Objects
 */
// Texture
const loadingManger  = new THREE.LoadingManager();
loadingManger.onLoad = () =>{ console.log("loaded"); };
loadingManger.onProgress = () =>{ console.log("Progress"); };
loadingManger.onError = () =>{ console.log("error"); };
const textureLoader = new THREE.TextureLoader(loadingManger);
const colorTexture = textureLoader.load('./textures/plaster_grey_04_ao_2k.jpg');
const normalTexture = textureLoader.load('./textures/plaster_grey_04_nor_dx_2k.jpg');

/**
 * environmentMap
 */
const CubeTextureLoader = new THREE.CubeTextureLoader(loadingManger);
const environmentMap = CubeTextureLoader.load([
    '/textures/environment/px.png',
    '/textures/environment/nx.png',
    '/textures/environment/py.png',
    '/textures/environment/ny.png',
    '/textures/environment/pz.png',
    '/textures/environment/nz.png'
]);
scene.background = environmentMap;

// Material
const material2 = new THREE.MeshStandardMaterial({});
material2.normalMap = normalTexture;
material2.color.set(parameters.material2Color);
material2.metalness = 0.25;
material2.roughness = 0.1395;
material2.normalScale.set(parameters.normalScale, parameters.normalScale);
//material2.map = colorTexture;

const material = new THREE.MeshStandardMaterial();
material.color.set(parameters.material1Color);
material.metalness = 1;
material.roughness = 0.1395;

// environment map to material
material.envMap = environmentMap;
material2.envMap = environmentMap;

gui.add(material, 'metalness', 0, 1, 0.0001).name('ringsMetalness');
gui.add(material, 'roughness', 0, 1, 0.0001).name('ringsRoughness');
gui.add(material2, 'metalness', 0, 1, 0.0001).name('TorusKnotMetalness');
gui.add(material2, 'roughness', 0, 1, 0.0001).name('TorusKnotRoughness');
gui.add(parameters, 'normalScale', 0, 2, 0.001)
    .onChange( () => {
        material2.normalScale.set(parameters.normalScale, parameters.normalScale);
    });

// Objects
const torus = new THREE.Mesh(
    new THREE.TorusGeometry(3, 0.05, 16, 64),
    material
);
torus.rotation.x = Math.PI*0.75;
torus.rotation.y = Math.PI*0.75;

const torus2 = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.025, 16, 50),
    material
);

const torus3 = new THREE.Mesh(
    new THREE.TorusGeometry(1.5, 0.075, 16, 50),
    material
);
torus3.rotation.x = Math.PI*0.75;
torus3.rotation.y = Math.PI*0.75;

const torus4 = new THREE.Mesh(
    new THREE.TorusGeometry(2.2, 0.12, 16, 50),
    material
);
torus4.rotation.x = Math.PI*0.25;
torus4.rotation.y = Math.PI*0.25;

const torus5 = new THREE.Mesh(
    new THREE.TorusGeometry(4, 0.1, 16, 32),
    material
);
torus5.rotation.x = Math.PI*0.25;
torus5.rotation.y = Math.PI*0.25;

const torusKnot = new THREE.Mesh(
    new THREE.TorusKnotGeometry( 0.5, 0.2, 122, 32 ),
    material2
);

scene.add(torus,torus2, torus3, torus4, torus5, torusKnot);

//const sectionMeshes = [ mesh1 ]


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Group
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 6;
cameraGroup.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    //alpha: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * controls
 */
 const controls = new OrbitControls(camera, canvas);
 controls.enableDamping = true;
 controls.enableZoom = false;

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    //Objects
    torusKnot.rotation.y = elapsedTime * 0.5;
    torusKnot.rotation.x = elapsedTime * 0.5;
    
    torus.rotation.y = Math.sin(elapsedTime*speed) * Math.PI * 2 -  Math.PI * 0.25;
    torus.rotation.x = Math.sin(elapsedTime*speed) * Math.PI * 2 -  Math.PI * 0.25;
    torus2.rotation.y = Math.sin(elapsedTime*speed) * Math.PI * 2 ;
    //torus2.rotation.x = Math.sin(elapsedTime*speed) * Math.PI * 2 ;
    torus3.rotation.y = Math.sin(elapsedTime*speed) * Math.PI * 2 ;
    torus3.rotation.x = Math.sin(elapsedTime*speed) * Math.PI * 2 ;
    torus4.rotation.y = Math.sin(elapsedTime*speed) * Math.PI * 2 -  Math.PI * 0.25;
    torus4.rotation.x = Math.cos(elapsedTime*speed) * Math.PI * 2 -  Math.PI * 0.25
    torus5.rotation.y = Math.sin(elapsedTime*speed) * Math.PI * 2 -  Math.PI * 0.75;
    torus5.rotation.x = Math.cos(elapsedTime*speed) * Math.PI * 2 -  Math.PI * 0.75;

    //controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

gui.add(parameters, 'resetRandomSpeed');

tick();