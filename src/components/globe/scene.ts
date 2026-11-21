import * as THREE from "three";

export interface GlobeOptions {
  /** Flat array of [lat*10, lon*10, …] land points. */
  points: number[];
  markers: { lat: number; lon: number }[];
  reducedMotion: boolean;
}

export function latLonToVec3(lat: number, lon: number, radius = 1): [number, number, number] {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return [-radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta)];
}

const POINT_VERTEX = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute float aKind;
  uniform float uTime;
  uniform float uScale;
  varying float vKind;
  varying float vPulse;
  varying float vEdge;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * normalize(position));
    vEdge = clamp(n.z, 0.0, 1.0);
    vKind = aKind;
    vPulse = 0.5 + 0.5 * sin(uTime * 1.4 + aPhase);
    float size = aSize * (aKind > 0.5 ? (0.85 + 0.55 * vPulse) : 1.0);
    gl_PointSize = size * uScale / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const POINT_FRAGMENT = /* glsl */ `
  precision mediump float;
  uniform vec3 uLand;
  uniform vec3 uMarker;
  varying float vKind;
  varying float vPulse;
  varying float vEdge;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.12, d);
    float marker = step(0.5, vKind);
    vec3 color = mix(uLand, uMarker, marker);
    float alpha = core * mix(0.5 + 0.5 * vEdge, 0.7 + 0.3 * vPulse, marker);
    gl_FragColor = vec4(color, alpha);
  }
`;

const ATMOSPHERE_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ATMOSPHERE_FRAGMENT = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  varying vec3 vNormal;
  void main() {
    float rim = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.6);
    gl_FragColor = vec4(uColor, clamp(rim, 0.0, 1.0) * 0.7);
  }
`;

/**
 * Mounts the WebGL globe into `container` and returns a function that
 * releases every GPU resource, listener and observer it created.
 * The render loop only runs while the globe is on screen and the tab is
 * visible; with reduced motion it renders single frames on demand.
 */
export function mountGlobe(container: HTMLElement, options: GlobeOptions): () => void {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  canvas.style.touchAction = "pan-y";
  canvas.setAttribute("aria-hidden", "true");
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0, 4.6);

  const globe = new THREE.Group();
  globe.rotation.set(0.3, -2.97, 0); // open on South and East Asia (about 80°E)
  scene.add(globe);

  const disposables: { dispose(): void }[] = [];
  const track = <T extends { dispose(): void }>(item: T): T => {
    disposables.push(item);
    return item;
  };

  // Solid core hides the far side of the globe.
  const core = new THREE.Mesh(track(new THREE.SphereGeometry(0.985, 48, 48)), track(new THREE.MeshBasicMaterial({ color: 0x24102a })));
  globe.add(core);

  const landCount = options.points.length / 2;
  const total = landCount + options.markers.length;
  const positions = new Float32Array(total * 3);
  const sizes = new Float32Array(total);
  const phases = new Float32Array(total);
  const kinds = new Float32Array(total);
  for (let i = 0; i < landCount; i += 1) {
    positions.set(latLonToVec3(options.points[i * 2] / 10, options.points[i * 2 + 1] / 10), i * 3);
    sizes[i] = 10.5;
    phases[i] = 0;
    kinds[i] = 0;
  }
  options.markers.forEach((marker, j) => {
    const i = landCount + j;
    positions.set(latLonToVec3(marker.lat, marker.lon, 1.012), i * 3);
    sizes[i] = 30;
    phases[i] = j * 1.7;
    kinds[i] = 1;
  });
  const geometry = track(new THREE.BufferGeometry());
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute("aKind", new THREE.BufferAttribute(kinds, 1));
  const pointMaterial = track(
    new THREE.ShaderMaterial({
      vertexShader: POINT_VERTEX,
      fragmentShader: POINT_FRAGMENT,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uScale: { value: 1 },
        uLand: { value: new THREE.Color(0xdcc898) },
        uMarker: { value: new THREE.Color(0xf0a030) },
      },
    }),
  );
  globe.add(new THREE.Points(geometry, pointMaterial));

  const atmosphere = new THREE.Mesh(
    track(new THREE.SphereGeometry(1.16, 48, 48)),
    track(
      new THREE.ShaderMaterial({
        vertexShader: ATMOSPHERE_VERTEX,
        fragmentShader: ATMOSPHERE_FRAGMENT,
        side: THREE.BackSide,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        uniforms: { uColor: { value: new THREE.Color(0xc77a2a) } },
      }),
    ),
  );
  scene.add(atmosphere);

  // Sparse drifting motes around the globe.
  const moteCount = 160;
  const motePositions = new Float32Array(moteCount * 3);
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < moteCount; i += 1) {
    const r = 1.35 + rand() * 1.5;
    const t = rand() * Math.PI * 2;
    const p = Math.acos(2 * rand() - 1);
    motePositions.set([r * Math.sin(p) * Math.cos(t), r * Math.cos(p), r * Math.sin(p) * Math.sin(t)], i * 3);
  }
  const moteGeometry = track(new THREE.BufferGeometry());
  moteGeometry.setAttribute("position", new THREE.BufferAttribute(motePositions, 3));
  const motes = new THREE.Points(moteGeometry, track(new THREE.PointsMaterial({ color: 0xdcc898, size: 0.012, transparent: true, opacity: 0.55, depthWrite: false })));
  scene.add(motes);

  let frame = 0;
  let running = false;
  let visible = true;
  let velocity = options.reducedMotion ? 0 : 0.0016;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let lastTime = performance.now();
  let elapsed = 0;

  const render = () => {
    pointMaterial.uniforms.uTime.value = elapsed;
    renderer.render(scene, camera);
  };

  const tick = (now: number) => {
    const dt = Math.min(64, now - lastTime);
    lastTime = now;
    elapsed += dt / 1000;
    if (!dragging) {
      globe.rotation.y += velocity * (dt / 16.67);
      velocity += ((options.reducedMotion ? 0 : 0.0016) - velocity) * 0.02;
    }
    motes.rotation.y -= 0.0002 * (dt / 16.67);
    render();
    frame = running ? requestAnimationFrame(tick) : 0;
  };

  const start = () => {
    if (running || options.reducedMotion || !visible || document.visibilityState !== "visible") return;
    running = true;
    lastTime = performance.now();
    frame = requestAnimationFrame(tick);
  };
  const stop = () => {
    running = false;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };

  const resize = () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width === 0 || height === 0) return;
    const ratio = Math.min(window.devicePixelRatio || 1, width < 640 ? 1.5 : 2);
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    pointMaterial.uniforms.uScale.value = (height * ratio) / 620;
    if (!running) render();
  };

  const onPointerDown = (event: PointerEvent) => {
    dragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent) => {
    if (!dragging) return;
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;
    globe.rotation.y += dx * 0.005;
    globe.rotation.x = Math.max(-0.9, Math.min(0.9, globe.rotation.x + dy * 0.003));
    velocity = dx * 0.0006;
    if (!running) render();
  };
  const onPointerUp = (event: PointerEvent) => {
    dragging = false;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  };
  const onVisibility = () => (document.visibilityState === "visible" ? start() : stop());
  const onContextLost = (event: Event) => {
    event.preventDefault();
    stop();
  };

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("webglcontextlost", onContextLost);
  document.addEventListener("visibilitychange", onVisibility);

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start();
    else stop();
  });
  intersection.observe(container);

  resize();
  render();
  start();

  return () => {
    stop();
    resizeObserver.disconnect();
    intersection.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerup", onPointerUp);
    canvas.removeEventListener("pointercancel", onPointerUp);
    canvas.removeEventListener("webglcontextlost", onContextLost);
    disposables.forEach((item) => item.dispose());
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
  };
}
