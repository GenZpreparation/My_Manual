import {
  Scene, PerspectiveCamera, WebGLRenderer, Group, Mesh, Points, Clock,
  MeshBasicMaterial, PointsMaterial, BufferGeometry, BufferAttribute,
  TorusKnotGeometry, IcosahedronGeometry, TorusGeometry, OctahedronGeometry,
} from "three";

// Sirf jo classes chahiye wahi import hoti hai (poori three.js nahi) -> chhota bundle.
// Ye file HeroScene.js se idle time pe lazy load hoti hai.
export function startScene(mount) {
  const isMobile = window.innerWidth < 768;
  let w = mount.clientWidth;
  let h = mount.clientHeight;

  const scene = new Scene();
  const camera = new PerspectiveCamera(45, w / h, 0.1, 100);
  camera.position.set(0, 0, 9.5);

  const renderer = new WebGLRenderer({ antialias: !isMobile, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
  renderer.setSize(w, h);
  mount.appendChild(renderer.domElement);

  const group = new Group();
  scene.add(group);

  // warm-white / black: light theme me kaala, dark theme me warm white
  const themed = [];
  const track = (mat, light, dark) => (themed.push([mat, light, dark]), mat);
  const applyTheme = () => {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    themed.forEach(([m, l, d]) => m.color.setHex(dark ? d : l));
  };
  const wire = (color, opacity, dark = 0xf3eee2) =>
    track(new MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity }), color, dark);
  const ringMat = (c, d) => track(new MeshBasicMaterial({ color: c, transparent: true, opacity: 0.5 }), c, d);

  const knot = new Mesh(new TorusKnotGeometry(1.8, 0.46, isMobile ? 80 : 140, 14, 2, 3), wire(0x1c1812, 0.34));
  const crystal = new Mesh(new IcosahedronGeometry(1.05, 1), wire(0x6b6455, 0.7, 0xb5ac98));
  const ringA = new Mesh(new TorusGeometry(3.7, 0.014, 8, 180), ringMat(0x1c1812, 0xf3eee2));
  const ringB = new Mesh(new TorusGeometry(4.4, 0.01, 8, 180), ringMat(0x6b6455, 0xb5ac98));
  ringA.rotation.x = Math.PI / 2.6;
  ringB.rotation.set(Math.PI / 1.9, 0.5, 0);
  group.add(knot, crystal, ringA, ringB);

  const shards = [];
  const shardGeo = new OctahedronGeometry(0.24, 0);
  const shardMat = wire(0x1c1812, 0.8);
  for (let i = 0; i < (isMobile ? 5 : 9); i++) {
    const m = new Mesh(shardGeo, shardMat);
    m.userData = { a: (i / 9) * Math.PI * 2, r: 3.2 + Math.random() * 1.6, s: 0.25 + Math.random() * 0.4, y: (Math.random() - 0.5) * 3 };
    shards.push(m);
    group.add(m);
  }

  const count = isMobile ? 90 : 220;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 4.5 + Math.random() * 5;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
    pos[i * 3 + 2] = r * Math.cos(ph) - 2;
  }
  const pGeo = new BufferGeometry();
  pGeo.setAttribute("position", new BufferAttribute(pos, 3));
  const particles = new Points(
    pGeo,
    track(new PointsMaterial({ color: 0x1c1812, size: 0.05, transparent: true, opacity: 0.6 }), 0x1c1812, 0xf3eee2)
  );
  scene.add(particles);

  applyTheme();
  const themeObs = new MutationObserver(applyTheme);
  themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let visible = true;
  let frameId;
  const clock = new Clock();

  const animate = () => {
    frameId = requestAnimationFrame(animate);
    if (!visible) return;
    const t = clock.getElapsedTime();
    const sp = Math.min(window.scrollY / (h || 1), 1);

    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;

    knot.rotation.x = t * 0.12 + pointer.y * 0.6;
    knot.rotation.y = t * 0.18 + pointer.x * 0.8 + sp * 3;
    crystal.rotation.y = -t * 0.35;
    crystal.rotation.x = t * 0.2;
    crystal.scale.setScalar(1 + Math.sin(t * 1.6) * 0.06);
    ringA.rotation.z = t * 0.25;
    ringB.rotation.z = -t * 0.18;

    shards.forEach((m) => {
      const d = m.userData;
      const a = d.a + t * d.s * 0.4;
      m.position.set(Math.cos(a) * d.r, d.y + Math.sin(t * d.s * 2 + d.a) * 0.5, Math.sin(a) * d.r);
      m.rotation.x = t * d.s * 2;
      m.rotation.y = t * d.s * 1.5;
    });

    particles.rotation.y = t * 0.03 + sp * 0.8;
    group.position.y = sp * 2.2;
    group.scale.setScalar(1 - sp * 0.35);
    camera.position.x = pointer.x * 1.2;
    camera.position.y = pointer.y * 0.9;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  };
  animate();

  const onPointer = (e) => {
    pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    pointer.ty = -(e.clientY / window.innerHeight - 0.5) * 2;
  };
  const onResize = () => {
    w = mount.clientWidth;
    h = mount.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
  io.observe(mount);
  window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("resize", onResize);

  return () => {
    cancelAnimationFrame(frameId);
    io.disconnect();
    themeObs.disconnect();
    window.removeEventListener("pointermove", onPointer);
    window.removeEventListener("resize", onResize);
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) o.material.dispose();
    });
    renderer.dispose();
    if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
  };
}
