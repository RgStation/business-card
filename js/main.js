import { GLTFLoader } from "https://unpkg.com/three@0.126.0/examples/jsm/loaders/GLTFLoader.js";

const THREE = window.MINDAR.IMAGE.THREE;

const startButton = document.querySelector("#startButton");

startButton.addEventListener("click", async () => {
  startButton.style.display = "none";

  // 🔥 iOS kamera fix
  try {
  await navigator.mediaDevices.getUserMedia({ video: true });
  console.log("CAMERA OK");
} catch (e) {
  console.error("CAMERA ERROR:", e);
}

  startAR();
});

async function startAR() {

  console.log("Starting AR");

  const mindARThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.body,
    imageTargetSrc: "assets/targets/businesscard.mind",
  });

  const { renderer, scene, camera } = mindARThree;

  // VALO
  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  scene.add(light);

  // ANCHOR
  const anchor = mindARThree.addAnchor(0);

  // 🔍 DEBUG
  anchor.onTargetFound = () => {
    console.log("TARGET FOUND");
  };

  anchor.onTargetLost = () => {
    console.log("TARGET LOST");
  };

  // 🤖 ROBOTTI
  const loader = new GLTFLoader();
  const gltf = await new Promise(resolve => {
    loader.load("assets/models/RobotExpressive.glb", resolve);
  });

  const robot = gltf.scene;
  robot.scale.set(0.4, 0.4, 0.4);
  robot.position.set(0, -0.3, 0);

  anchor.group.add(robot);

  // 🔄 ANIMAATIO
  const mixer = new THREE.AnimationMixer(robot);
  const idle = mixer.clipAction(gltf.animations[2]);
  idle.play();

  // 📝 TEKSTI
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

  const nameText = createText("Ronja Grohn", 0.8);
  const roleText = createText("Engineering student", 0.4);

  anchor.group.add(nameText);
  anchor.group.add(roleText);

  await mindARThree.start();

  renderer.setAnimationLoop(() => {
    mixer.update(0.016);
    robot.rotation.y += 0.01;
    renderer.render(scene, camera);
  });
}