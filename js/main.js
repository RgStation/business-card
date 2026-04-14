import { GLTFLoader } from "https://unpkg.com/three@0.126.0/examples/jsm/loaders/GLTFLoader.js";

// 🔥 WAIT FOR MINDAR (FIX)
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

console.log("MindAR loaded:", window.MINDAR);

const THREE = window.MINDAR.IMAGE.THREE;

const startButton = document.querySelector("#startButton");

startButton.addEventListener("click", async () => {
  console.log("BUTTON CLICKED");

  startButton.style.display = "none";

  try {
    await startAR();
  } catch (e) {
    console.error("AR ERROR:", e);
    alert("AR failed: " + e.message);
  }
});

async function startAR() {

  console.log("START AR FUNCTION");

  const container = document.querySelector("#ar-container");

  const mindARThree = new window.MINDAR.IMAGE.MindARThree({
    container: container,
    imageTargetSrc: "assets/targets/businesscard.mind",
  });

  const { renderer, scene, camera } = mindARThree;

  // 💡 LIGHT
  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  scene.add(light);

  // 🎯 ANCHOR
  const anchor = mindARThree.addAnchor(0);

  let robot;

  // 🔍 DEBUG target
  anchor.onTargetFound = () => {
    console.log("TARGET FOUND");
    if (robot) robot.visible = true;
  };

  anchor.onTargetLost = () => {
    console.log("TARGET LOST");
    if (robot) robot.visible = false;
  };

  // 🤖 LOAD MODEL
  const loader = new GLTFLoader();

  const gltf = await new Promise((resolve, reject) => {
    loader.load(
      "assets/models/RobotExpressive.glb",
      resolve,
      undefined,
      reject
    );
  });

  robot = gltf.scene;
  robot.scale.set(0.4, 0.4, 0.4);
  robot.position.set(0, -0.3, 0);
  robot.visible = false;

  anchor.group.add(robot);

  // 🎬 ANIMATION
  const mixer = new THREE.AnimationMixer(robot);
  const idle = mixer.clipAction(gltf.animations[2]);
  idle.play();

  // 📝 TEXT
  const createText = (text, y) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 512;
    canvas.height = 256;

    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText(text, 50, 150);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true
    });

    const geometry = new THREE.PlaneGeometry(1, 0.5);
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(0, y, 0);

    return mesh;
  };

  const nameText = createText("Ronja Grohn", 0.8);
  const roleText = createText("Engineering student", 0.4);

  anchor.group.add(nameText);
  anchor.group.add(roleText);

  // 🚀 START AR
  console.log("Starting MindAR...");
  await mindARThree.start();
  console.log("MindAR STARTED");

  renderer.setAnimationLoop(() => {
    mixer.update(0.016);
    if (robot) robot.rotation.y += 0.01;
    renderer.render(scene, camera);
  });
}