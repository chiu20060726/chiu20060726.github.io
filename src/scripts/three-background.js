import * as THREE from 'three';

const container = document.getElementById('three-root');

if (container) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xdfe5ff, 12, 42);

  const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 14);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 0.65);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xffffff, 0.65);
  keyLight.position.set(6, 8, 4);
  scene.add(keyLight);

  const fillLight = new THREE.PointLight(0x8fa7ff, 0.55, 30);
  fillLight.position.set(-6, -4, 6);
  scene.add(fillLight);

  const knotGeometry = new THREE.TorusKnotGeometry(3.2, 0.7, 140, 22);
  const knotMaterial = new THREE.MeshStandardMaterial({
    color: 0x6c5ce7,
    metalness: 0.35,
    roughness: 0.25,
    emissive: 0x1f144a
  });
  const knot = new THREE.Mesh(knotGeometry, knotMaterial);
  scene.add(knot);

  const orbGroup = new THREE.Group();
  const orbMaterial = new THREE.MeshStandardMaterial({
    color: 0x7ed6ff,
    roughness: 0.4,
    metalness: 0.2,
    emissive: 0x0b2d50
  });

  for (let i = 0; i < 12; i += 1) {
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.35, 24, 24), orbMaterial);
    const radius = 6 + Math.random() * 4;
    const angle = (i / 12) * Math.PI * 2;
    orb.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 4, Math.sin(angle) * radius);
    orbGroup.add(orb);
  }
  scene.add(orbGroup);

  const starGeometry = new THREE.BufferGeometry();
  const starCount = 220;
  const starPositions = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i += 1) {
    starPositions[i * 3] = (Math.random() - 0.5) * 40;
    starPositions[i * 3 + 1] = (Math.random() - 0.5) * 30;
    starPositions[i * 3 + 2] = -10 - Math.random() * 30;
  }

  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

  const stars = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.08,
      opacity: 0.6,
      transparent: true
    })
  );
  scene.add(stars);

  const clock = new THREE.Clock();
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const renderScene = () => {
    renderer.render(scene, camera);
  };

  const animate = () => {
    const elapsed = clock.getElapsedTime();
    knot.rotation.x = elapsed * 0.25;
    knot.rotation.y = elapsed * 0.35;
    orbGroup.rotation.y = elapsed * 0.15;
    stars.rotation.y = elapsed * 0.03;
    renderScene();
    requestAnimationFrame(animate);
  };

  if (prefersReducedMotion.matches) {
    renderScene();
  } else {
    animate();
  }

  const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderScene();
  };

  window.addEventListener('resize', handleResize);
}
