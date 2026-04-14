import { GLTFLoader } from "https://unpkg.com/three@0.126.0/examples/jsm/loaders/GLTFLoader.js";

// WAIT FOR MINDAR
function waitForMindAR() {
  return new Promise((resolve) => {
    const check = () => {
      if (window.MINDAR && window.MINDAR.IMAGE) {
        resolve();
      } else {
        requestAnimationFrame(check);
      }
    };
    check();
  });
}

await waitForMindAR();

const THREE = window.MINDAR.IMAGE.THREE;

// 🚀 KÄYNNISTÄ SUORAAN
startAR();

async function startAR() {

  console.log("STARTING AR");

  const mindARThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.querySelector("#ar-container"),
    imageTargetSrc: "assets/targets/businesscard.mind",
  });

  const { renderer, scene, camera } = mindARThree;

  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  scene.add(light);

  const anchor = mindARThree.addAnchor(0);

  const loader = new GLTFLoader();

  const gltf = await new Promise((resolve, reject) => {
    loader.load("assets/models/RobotExpressive.glb", resolve, undefined, reject);
  });

  const robot = gltf.scene;
  robot.scale.set(0.4, 0.4, 0.4);
  robot.position.set(0, -0.3, 0);

  anchor.group.add(robot);

  const mixer = new THREE.AnimationMixer(robot);
  const idle = mixer.clipAction(gltf.animations[2]);
  idle.play();

  const createText = (text, y) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 512;
    canvas.height = 256;

    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText(text, 50, 150);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const geometry = new THREE.PlaneGeometry(1, 0.5);

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, y, 0);

    return mesh;
  };

  anchor.group.add(createText("Ronja Grohn", 0.8));
  anchor.group.add(createText("Engineering student", 0.4));

  await mindARThree.start();

  renderer.setAnimationLoop(() => {
    mixer.update(0.016);
    robot.rotation.y += 0.01;
    renderer.render(scene, camera);
  });
}