import * as THREE from 'three';

const container = document.getElementById('three-root');

if (container) {
  const scene = new THREE.Scene();
  // Dark mode fog to match the CSS --bg color
  scene.fog = new THREE.FogExp2(0x09090b, 0.015);

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 10);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0); // Transparent background
  container.appendChild(renderer.domElement);

  // Dynamic Starry Sky
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 3000; // Massive amount of stars
  const starPositions = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);
  const starSizes = new Float32Array(starCount);

  const color1 = new THREE.Color(0xa78bfa); // Purple
  const color2 = new THREE.Color(0x2dd4bf); // Teal
  const color3 = new THREE.Color(0xffffff); // White

  for (let i = 0; i < starCount; i += 1) {
    // Spread stars widely across the view
    starPositions[i * 3] = (Math.random() - 0.5) * 100;
    starPositions[i * 3 + 1] = (Math.random() - 0.5) * 100;
    starPositions[i * 3 + 2] = 5 - Math.random() * 80; // Spread from front to back

    // Mix colors for stars (mostly white/purple, some teal)
    let mixedColor;
    const rand = Math.random();
    if (rand > 0.8) {
      mixedColor = color2;
    } else if (rand > 0.5) {
      mixedColor = color1.clone().lerp(color3, Math.random());
    } else {
      mixedColor = color3;
    }
    
    starColors[i * 3] = mixedColor.r;
    starColors[i * 3 + 1] = mixedColor.g;
    starColors[i * 3 + 2] = mixedColor.b;

    // Randomize star sizes slightly
    starSizes[i] = Math.random() * 2.5 + 0.5;
  }

  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
  starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));

  // Custom shader material for stars to use individual sizes and make them glowing dots
  const starsMaterial = new THREE.PointsMaterial({
    size: 0.12,
    vertexColors: true,
    opacity: 0.9,
    transparent: true,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending, // Makes stars glow when they overlap
    depthWrite: false
  });
  
  const stars = new THREE.Points(starGeometry, starsMaterial);
  scene.add(stars);

  // Mouse tracking for parallax
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;
  
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  const onDocumentMouseMove = (event) => {
    mouseX = (event.clientX - windowHalfX) * 0.0015;
    mouseY = (event.clientY - windowHalfY) * 0.0015;
  };

  document.addEventListener('mousemove', onDocumentMouseMove);

  const clock = new THREE.Clock();
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let animationFrameId;

  const renderScene = () => {
    renderer.render(scene, camera);
  };

  const animate = () => {
    const elapsed = clock.getElapsedTime();
    
    // Smooth mouse target tracking
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    // Continuous slow rotation for the starry sky + mouse parallax
    stars.rotation.y = elapsed * 0.03 + targetX;
    stars.rotation.x = elapsed * 0.01 + targetY;
    stars.rotation.z = elapsed * 0.005;

    // Subtle camera drift based on mouse
    camera.position.x += (mouseX * 3 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 3 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    renderScene();
    animationFrameId = requestAnimationFrame(animate);
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

  const cleanup = () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    window.removeEventListener('resize', handleResize);
    document.removeEventListener('mousemove', onDocumentMouseMove);
    renderer.dispose();
    starGeometry.dispose();
    starsMaterial.dispose();
    container.replaceChildren();
  };

  window.addEventListener('pagehide', cleanup);
}
