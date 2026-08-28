import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const canvas = document.getElementById('scene-canvas');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function applyFallbackBackground() {
  if (!canvas) return;
  canvas.style.background =
    'radial-gradient(60% 50% at 18% 10%, rgba(56, 189, 248, 0.16), transparent 60%),' +
    'radial-gradient(55% 55% at 85% 30%, rgba(139, 92, 246, 0.16), transparent 62%),' +
    'radial-gradient(50% 45% at 50% 90%, rgba(244, 114, 182, 0.1), transparent 60%),' +
    'linear-gradient(180deg, #05070d, #0a0f1c)';
}

if (!canvas || prefersReducedMotion || !window.WebGLRenderingContext) {
  applyFallbackBackground();
} else {
  try {
    initScene(canvas);
  } catch (err) {
    applyFallbackBackground();
  }
}

function makeDotTexture() {
  const size = 64;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.35, 'rgba(255,255,255,0.7)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(c);
  texture.needsUpdate = true;
  return texture;
}

function initScene(canvasEl) {
  const lowEnd = window.innerWidth < 720 || (navigator.hardwareConcurrency || 4) <= 2;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvasEl,
    antialias: !lowEnd,
    alpha: true,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowEnd ? 1.4 : 1.9));

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05070d, 0.05);

  const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 120);
  camera.position.set(0, 0, 15);

  const C1 = 0x38bdf8;
  const C2 = 0x8b5cf6;
  const C3 = 0xf472b6;
  const dotTexture = makeDotTexture();

  // ---- Layered starfield ----
  const layerConfig = lowEnd
    ? [[500, 0.09, 30, C1, 0.5], [320, 0.14, 22, C2, 0.55], [140, 0.2, 16, C3, 0.45]]
    : [[1300, 0.09, 40, C1, 0.55], [850, 0.14, 30, C2, 0.6], [350, 0.22, 20, C3, 0.5]];

  const layers = layerConfig.map(([count, size, spread, color, opacity]) => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * spread * 2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread * 1.3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread - 4;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      size,
      color,
      map: dotTexture,
      alphaTest: 0.02,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(geo, mat);
    points.userData.baseOpacity = opacity;
    scene.add(points);
    return points;
  });

  // ---- Wireframe centerpiece ----
  const core = new THREE.Group();
  const coreOffsetX = window.innerWidth > 1100 ? 3.4 : 0;
  scene.add(core);

  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(3.6, 1),
    new THREE.MeshBasicMaterial({ color: C1, wireframe: true, transparent: true, opacity: 0.32 }),
  );
  const knot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1.9, 0.42, lowEnd ? 80 : 150, lowEnd ? 8 : 12),
    new THREE.MeshBasicMaterial({ color: C2, wireframe: true, transparent: true, opacity: 0.26 }),
  );
  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(5.4, 0.012, 6, 128),
    new THREE.MeshBasicMaterial({ color: C3, transparent: true, opacity: 0.5 }),
  );
  halo.rotation.x = Math.PI / 2.3;
  core.add(shell, knot, halo);
  if (window.innerWidth < 720) {
    core.scale.setScalar(0.5);
  }

  // ---- Orbiting satellites ----
  const satGeometries = [
    new THREE.OctahedronGeometry(0.36),
    new THREE.TetrahedronGeometry(0.4),
    new THREE.BoxGeometry(0.5, 0.5, 0.5),
  ];
  const satColors = [C1, C2, C3];
  const satellites = [];
  const satCount = lowEnd ? 5 : 10;

  for (let i = 0; i < satCount; i += 1) {
    const mesh = new THREE.Mesh(
      satGeometries[i % satGeometries.length],
      new THREE.MeshBasicMaterial({
        color: satColors[i % satColors.length],
        wireframe: true,
        transparent: true,
        opacity: 0.42,
      }),
    );
    mesh.userData = {
      radius: 6.5 + Math.random() * 4.5,
      angle: Math.random() * Math.PI * 2,
      speed: (Math.random() * 0.35 + 0.12) * (Math.random() < 0.5 ? -1 : 1),
      yOffset: (Math.random() - 0.5) * 7,
      spin: Math.random() * 0.5 + 0.2,
    };
    scene.add(mesh);
    satellites.push(mesh);
  }

  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  resize();
  window.addEventListener('resize', resize);

  const pointer = { x: 0, y: 0 };
  const eased = { x: 0, y: 0 };
  window.addEventListener('pointermove', (event) => {
    pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
    pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  let scrollFrac = 0;
  let easedScroll = 0;
  function readScroll() {
    const max = document.body.scrollHeight - window.innerHeight;
    scrollFrac = max > 0 ? window.scrollY / max : 0;
  }
  window.addEventListener('scroll', readScroll, { passive: true });
  readScroll();

  let running = true;
  document.addEventListener('visibilitychange', () => {
    running = document.visibilityState === 'visible';
    if (running) {
      lastTime = performance.now();
      requestAnimationFrame(animate);
    }
  });

  let lastTime = performance.now();

  function animate(now) {
    if (!running) return;
    requestAnimationFrame(animate);

    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    eased.x += (pointer.x - eased.x) * 0.04;
    eased.y += (pointer.y - eased.y) * 0.04;
    easedScroll += (scrollFrac - easedScroll) * 0.06;

    camera.position.x = eased.x * 2.2;
    camera.position.y = -eased.y * 1.6 - easedScroll * 3.2;
    camera.position.z = 15 - easedScroll * 8.5;
    camera.lookAt(0, -easedScroll * 2.2, 0);

    const heroFade = Math.max(0, 1 - easedScroll * 5.5);
    shell.material.opacity = 0.32 * heroFade;
    knot.material.opacity = 0.26 * heroFade;
    halo.material.opacity = 0.5 * heroFade;
    core.visible = heroFade > 0.01;

    core.position.x = coreOffsetX;
    core.position.y = -easedScroll * 5;
    core.rotation.y += dt * 0.11;
    core.rotation.x = Math.sin(now * 0.00018) * 0.2 + easedScroll * 0.8;
    shell.rotation.z += dt * 0.06;
    knot.rotation.x += dt * 0.15;
    knot.rotation.y -= dt * 0.08;
    halo.rotation.z += dt * 0.22;
    const pulse = 1 + Math.sin(now * 0.001) * 0.03;
    shell.scale.setScalar(pulse);

    satellites.forEach((mesh) => {
      const u = mesh.userData;
      u.angle += dt * u.speed * 0.3;
      mesh.position.set(
        Math.cos(u.angle) * u.radius,
        u.yOffset + Math.sin(now * 0.0004 + u.angle) * 0.6,
        Math.sin(u.angle) * u.radius,
      );
      mesh.rotation.x += dt * u.spin;
      mesh.rotation.y += dt * u.spin * 0.7;
      mesh.material.opacity = 0.42 * (1 - easedScroll * 0.65);
    });

    layers.forEach((points, i) => {
      points.rotation.y += dt * (0.008 + i * 0.004);
      points.rotation.x = eased.y * 0.04;
      points.material.opacity = points.userData.baseOpacity * (1 - easedScroll * 0.3);
    });

    renderer.render(scene, camera);
  }

  requestAnimationFrame(animate);
}
