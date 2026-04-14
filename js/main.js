import { ARButton } from "https://unpkg.com/three@0.126.0/examples/jsm/webxr/ARButton.js";

let camera, scene, renderer;

init();

function init() {

  const container = document.createElement("div");
  document.body.appendChild(container);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 100);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  container.appendChild(renderer.domElement);

  // 🤖 ROBOTTI
  const loader = new THREE.GLTFLoader();
  loader.load(
    "assets/models/RobotExpressive.glb",
    (gltf) => {
      const robot = gltf.scene;
      robot.scale.set(0.4,0.4,0.4);
      robot.position.set(0,0,-2);
      scene.add(robot);
    }
  );

  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  scene.add(light);

  const button = ARButton.createButton(renderer);
  document.body.appendChild(button);

  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
}