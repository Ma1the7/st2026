import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const scenes = [];

function setupScene(canvas, builder, options = {}) {
  if (!canvas) return null;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(options.fog ?? 0x242521, options.fogDensity ?? 0.035);
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(...(options.camera ?? [8, 6, 9]));

  const hemi = new THREE.HemisphereLight(0xfff5e7, 0x25251f, 2.2);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffdfbd, 3.8);
  key.position.set(5, 10, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  scene.add(key);
  const fill = new THREE.PointLight(0x8f9f78, 18, 20, 2);
  fill.position.set(-5, 4, -3);
  scene.add(fill);

  const group = new THREE.Group();
  scene.add(group);
  builder(group, scene);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = false;
  controls.minDistance = options.minDistance ?? 6;
  controls.maxDistance = options.maxDistance ?? 18;
  controls.minPolarAngle = 0.55;
  controls.maxPolarAngle = 1.45;
  controls.autoRotate = options.autoRotate && !prefersReduced;
  controls.autoRotateSpeed = options.autoRotateSpeed ?? 0.65;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  const clock = new THREE.Clock();
  const animate = () => {
    const t = clock.getElapsedTime();
    if (!prefersReduced) group.rotation.y += Math.sin(t * 0.25) * 0.0008;
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };
  animate();
  scenes.push({ renderer, controls, group });
  return { renderer, controls, group };
}

function box(w, h, d, material, x = 0, y = 0, z = 0, parent) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y + h / 2, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

const tuff = new THREE.MeshStandardMaterial({ color: 0xb66f5f, roughness: 0.8, metalness: 0.02 });
const tuffLight = new THREE.MeshStandardMaterial({ color: 0xd39a82, roughness: 0.76 });
const dark = new THREE.MeshStandardMaterial({ color: 0x393b35, roughness: 0.9 });
const stone = new THREE.MeshStandardMaterial({ color: 0x9d7668, roughness: 0.9 });
const water = new THREE.MeshStandardMaterial({ color: 0x7b9489, roughness: 0.22, metalness: 0.18 });

function buildCascade(group) {
  const base = box(11, 0.45, 7.5, dark, 0, 0, 0, group);
  base.position.y = 0.2;
  for (let i = 0; i < 11; i++) {
    const y = i * 0.36;
    const w = 7.6 - i * 0.28;
    const z = -2.2 + i * 0.25;
    box(w, 0.32, 0.92, i % 2 ? tuffLight : tuff, 0, y + 0.45, z, group);
    const waterPlane = new THREE.Mesh(new THREE.BoxGeometry(w * 0.82, 0.05, 0.42), water);
    waterPlane.position.set(0, y + 0.79, z + 0.34);
    waterPlane.receiveShadow = true;
    group.add(waterPlane);
  }
  for (let i = 0; i < 8; i++) {
    const x = -3.6 + i * 1.03;
    box(0.35, 1.3 + (i % 3) * 0.35, 0.5, stone, x, 0.48, 2.15, group);
    box(0.32, 0.9 + ((i + 1) % 3) * 0.3, 0.48, tuffLight, x + 0.35, 0.48, 2.45, group);
  }
  const top = box(5.8, 0.7, 2.5, tuff, 0, 4.7, -1.3, group);
  const archMat = new THREE.MeshStandardMaterial({ color: 0x7c544c, roughness: 0.9 });
  for (let i = -2; i <= 2; i++) {
    const pillar = box(0.55, 2.1, 0.65, archMat, i * 1.05, 5.35, -1.1, group);
    pillar.rotation.z = (i % 2) * 0.03;
  }
  const ground = new THREE.Mesh(new THREE.CircleGeometry(7, 64), new THREE.MeshStandardMaterial({ color: 0x262822, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0.43;
  ground.receiveShadow = true;
  group.add(ground);
  group.rotation.x = -0.05;
}

function buildCity(group) {
  const ground = new THREE.Mesh(new THREE.BoxGeometry(13, 0.35, 9), new THREE.MeshStandardMaterial({ color: 0x292a25, roughness: 1 }));
  ground.position.y = 0.1;
  ground.receiveShadow = true;
  group.add(ground);
  const blocks = [
    [-4.2, 1.3, -2.5, 2.5, 2.2, 1.8], [-1.2, 2.3, -2.0, 2.0, 4.0, 1.7], [1.7, 1.1, -2.2, 2.7, 1.8, 2.0],
    [-4.0, 0.9, 0.8, 1.7, 1.4, 1.8], [-1.6, 1.4, 0.7, 2.3, 2.3, 2.1], [1.8, 2.6, 0.9, 2.4, 4.4, 1.9],
    [4.1, 1.0, -1.7, 1.5, 1.6, 1.7], [4.3, 1.7, 1.7, 1.7, 2.8, 1.6]
  ];
  blocks.forEach(([x, y, z, w, h, d], i) => {
    const m = i % 3 === 0 ? tuff : (i % 3 === 1 ? tuffLight : stone);
    box(w, h, d, m, x, y, z, group);
    const roof = box(w * 0.84, 0.18, d * 0.84, dark, x, y + h, z, group);
    roof.castShadow = true;
  });
  for (let x = -5; x <= 5; x += 1.3) {
    box(0.16, 0.7, 0.16, tuffLight, x, 0.45, 3.35, group);
  }
  const plaza = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 0.16, 48), tuffLight);
  plaza.position.set(0.1, 0.5, 3.1);
  plaza.receiveShadow = true;
  group.add(plaza);
  group.rotation.y = -0.45;
}

setupScene(document.getElementById('cascade3d'), buildCascade, { camera: [9, 7.5, 10], minDistance: 7, maxDistance: 17, autoRotate: true, autoRotateSpeed: 0.45, fog: 0x262721, fogDensity: 0.03 });
const city = setupScene(document.getElementById('city3d'), buildCity, { camera: [10, 7, 11], minDistance: 7, maxDistance: 19, autoRotate: true, autoRotateSpeed: 0.32, fog: 0x292a25, fogDensity: 0.026 });

document.getElementById('citySpin')?.addEventListener('click', (e) => {
  if (!city) return;
  city.controls.autoRotate = !city.controls.autoRotate;
  e.currentTarget.textContent = city.controls.autoRotate ? 'AUTO ↻' : 'MANUAL';
});
