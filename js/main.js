import * as THREE from "https://unpkg.com/three@0.126.0/build/three.module.js";
import { GLTFLoader } from "https://unpkg.com/three@0.126.0/examples/jsm/loaders/GLTFLoader.js";

const THREEJS = window.MINDAR.IMAGE.THREE;

async function startAR() {

  const mindARThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.body,
    imageTargetSrc: "assets/targets/businesscard.mind",
  });

  const { renderer, scene, camera } = mindARThree;

  // VALO
  const light = new THREEJS.HemisphereLight(0xffffff, 0xbbbbff, 1);
  scene.add(light);

  // ANCHOR
  const anchor = mindARThree.addAnchor(0);

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
  const mixer = new THREEJS.AnimationMixer(robot);
  const idle = mixer.clipAction(gltf.animations[2]);
  idle.play();

  // 📝 TEKSTI (nimi + rooli)
  const createText = (text, y) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 512;
    canvas.height = 256;

    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText(text, 50, 150);

    const texture = new THREEJS.CanvasTexture(canvas);

    const material = new THREEJS.MeshBasicMaterial({ map: texture, transparent: true });
    const geometry = new THREEJS.PlaneGeometry(1, 0.5);

    const mesh = new THREEJS.Mesh(geometry, material);
    mesh.position.set(0, y, 0);

    return mesh;
  };

  // Kortin tiedot
  const nameText = createText("Ronja Grohn", 0.8);
  const roleText = createText("Engineering student", 0.4);

  anchor.group.add(nameText);
  anchor.group.add(roleText);

  await mindARThree.start();

  renderer.setAnimationLoop(() => {
    mixer.update(0.016);

    // pieni pyöritys
    robot.rotation.y += 0.01;

    renderer.render(scene, camera);
  });
}

startAR();