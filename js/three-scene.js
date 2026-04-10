// ===== MOZART GPU — Three.js Scenes =====
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ===== Dev-only logging =====
const _DEV = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
const _log = _DEV ? console.log.bind(console) : () => {};
const _err = _DEV ? console.error.bind(console) : () => {};

// ===== Shared =====
const PARTICLE_VERTEX = `
  uniform float size;
  uniform float sizeAttenuation;
  varying float vFogDist;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (sizeAttenuation / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    vFogDist = -mvPosition.z;
  }
`;
const PARTICLE_FRAGMENT = `
  uniform vec3 color;
  uniform vec3 fogColor;
  uniform float fogNear;
  uniform float fogFar;
  varying float vFogDist;
  void main() {
    vec2 c = gl_PointCoord - vec2(0.5);
    if (dot(c, c) > 0.25) discard;
    float fogFactor = smoothstep(fogNear, fogFar, vFogDist);
    vec3 col = mix(color, fogColor, fogFactor);
    gl_FragColor = vec4(col, 1.0 - fogFactor * 0.8);
  }
`;

function createScene(canvas, container, opts = {}) {
  const { fov=60, cameraPos=[0,5,20], fogColor=0x110011, fogNear=0, fogFar=15, clearColor=0x110011, useWindowSize=false } = opts;
  const w = useWindowSize ? window.innerWidth : (container.clientWidth || window.innerWidth);
  const h = useWindowSize ? window.innerHeight : (container.clientHeight || window.innerHeight);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);
  const camera = new THREE.PerspectiveCamera(fov, w/h, 0.1, 1000);
  camera.position.set(...cameraPos);
  const renderer = new THREE.WebGLRenderer({ canvas, powerPreference:'high-performance', antialias:false });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(clearColor, 1);
  return { scene, camera, renderer };
}

function observeVisibility(canvas, state) {
  const obs = new IntersectionObserver(e => { state.visible = e[0].isIntersecting; }, { threshold: 0.1 });
  obs.observe(canvas);
  return obs;
}

function handleResize(renderer, camera, container) {
  const w = container.clientWidth || window.innerWidth;
  const h = container.clientHeight || window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

function waveDisplacement(x, y, amplitude, frequency, iterations) {
  let z = 0;
  for (let i = 0; i < iterations; i++) {
    const f = frequency * (i + 1), d = 1 / (i + 1);
    z += Math.sin(x * f) * Math.cos(y * f * 0.7) * d;
    z += Math.cos(x * f * 0.8) * Math.sin(y * f) * d * 0.5;
  }
  return z * amplitude;
}

function makePMat(color, size, fogCol, fogN, fogF) {
  return new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(color) },
      size: { value: size },
      sizeAttenuation: { value: 170 },
      fogColor: { value: new THREE.Color(fogCol || 0x0D0517) },
      fogNear: { value: fogN != null ? fogN : 5 },
      fogFar: { value: fogF != null ? fogF : 30 },
    },
    vertexShader: PARTICLE_VERTEX,
    fragmentShader: PARTICLE_FRAGMENT,
    transparent: true,
  });
}

// Breathing particle shader — radial wave from center outward
const BREATHE_VERTEX = `
  uniform float size;
  uniform float sizeAttenuation;
  uniform float uTime;
  varying float vBreath;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    float radDist = length(position);
    float wave = sin(uTime * 0.8 - radDist * 2.0);
    vBreath = (wave * 0.25 + 0.75) * (sin(uTime * 3.0 + position.x * 5.0 + position.z * 4.0) * 0.08 + 0.92);

    gl_PointSize = size * (0.88 + wave * 0.12) * (sizeAttenuation / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const BREATHE_FRAGMENT = `
  uniform vec3 color;
  uniform vec3 glowColor;
  varying float vBreath;
  void main() {
    vec2 pt = gl_PointCoord - vec2(0.5);
    float pDist = length(pt);
    if (pDist > 0.5) discard;

    float core = smoothstep(0.5, 0.05, pDist);
    float glow = smoothstep(0.5, 0.15, pDist) - core;

    vec3 finalColor = mix(color, glowColor, glow * vBreath * 0.7);
    float alpha = core * vBreath + glow * vBreath * 0.5;

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

// ================================================================
//  MASTER LOOP — single rAF drives all scenes
// ================================================================
const _scenes = [];
function registerScene(renderFn) {
  _scenes.push(renderFn);
}

function masterLoop() {
  requestAnimationFrame(masterLoop);
  for (const render of _scenes) render();
}

function makeBreatheMat(color, glowColor, size) {
  return new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(color) },
      glowColor: { value: new THREE.Color(glowColor) },
      size: { value: size },
      sizeAttenuation: { value: 170 },
      uTime: { value: 0 },
    },
    vertexShader: BREATHE_VERTEX,
    fragmentShader: BREATHE_FRAGMENT,
    transparent: true,
    depthWrite: false,
  });
}


// ================================================================
//  SCENE 1: HERO — RTX 5090 GLB → particle cloud
// ================================================================
function initHeroScene() {
  const container = document.querySelector('.hero-canvas');
  if (!container) return;
  container.style.background = 'none';
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
  container.appendChild(canvas);

  const w = window.innerWidth, h = window.innerHeight;
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0D0517, 15, 60);
  const camera = new THREE.PerspectiveCamera(45, w/h, 0.1, 1000);
  camera.position.set(0, 0.3, 4.5);
  const renderer = new THREE.WebGLRenderer({ canvas, powerPreference:'high-performance', antialias:false });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x0D0517, 1);

  const state = { visible: true, time: 0 };
  observeVisibility(canvas, state);

  let mouseX = 0, mouseY = 0;
  let mouseScreenX = 0, mouseScreenY = 0; // pixel coords for repulsion
  window.addEventListener('mousemove', e => {
    mouseX = (e.clientX / w - 0.5) * 2;
    mouseY = (e.clientY / h - 0.5) * 2;
    const rect = canvas.getBoundingClientRect();
    mouseScreenX = e.clientX - rect.left;
    mouseScreenY = e.clientY - rect.top;
  });

  const gpuGroup = new THREE.Group();
  scene.add(gpuGroup);

  // (no external particles — clean GPU only)

  // Load GLB model
  new GLTFLoader().load('models/gpu-hero-model.glb', gltf => {
    const allVerts = [];
    gltf.scene.traverse(child => {
      if (child.isMesh && child.geometry) {
        child.updateWorldMatrix(true, false);
        const pos = child.geometry.attributes.position;
        const mx = child.matrixWorld;
        for (let i = 0; i < pos.count; i++) {
          const v = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i)).applyMatrix4(mx);
          allVerts.push(v.x, v.y, v.z);
        }
      }
    });

    // Collect ALL vertices, separate spinning parts (Blade, blade_holder)
    // Only actual spinning blades — NOT fins (heatsink ribs) or cylinders (radiators)
    const fanMeshNames = new Set(['Blade', 'blade_holder', 'Cylinder001', 'Cylinder001_1', 'Cylinder002', 'Cylinder002_1']);
    // Skip fins (heatsink radiator ribs behind fans — 95K verts of visual noise)
    const skipMeshes = new Set(['fins']);
    const bodyVerts = [];
    const fanWorldVerts = []; // all fan verts in world coords

    gltf.scene.traverse(child => {
      if (!child.isMesh || !child.geometry) return;
      if (skipMeshes.has(child.name)) return; // skip radiators
      child.updateWorldMatrix(true, false);
      const pos = child.geometry.attributes.position;
      const mx = child.matrixWorld;
      const target = fanMeshNames.has(child.name) ? fanWorldVerts : bodyVerts;
      for (let i = 0; i < pos.count; i++) {
        const v = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i)).applyMatrix4(mx);
        target.push(v.x, v.y, v.z);
      }
    });

    // Global bbox for normalization
    const totalLen = bodyVerts.length + fanWorldVerts.length;
    const allV = new Float32Array(totalLen);
    let offset = 0;
    for (let i = 0; i < bodyVerts.length; i++) allV[offset++] = bodyVerts[i];
    for (let i = 0; i < fanWorldVerts.length; i++) allV[offset++] = fanWorldVerts[i];
    const tg = new THREE.BufferGeometry();
    tg.setAttribute('position', new THREE.BufferAttribute(allV, 3));
    tg.computeBoundingBox();
    const bb = tg.boundingBox, ctr = new THREE.Vector3(), sz = new THREE.Vector3();
    bb.getCenter(ctr); bb.getSize(sz);
    const sc = 4 / Math.max(sz.x, sz.y, sz.z);

    function processVerts(arr, maxCount) {
      const total = arr.length / 3;
      const count = Math.min(total, maxCount);
      const fp = new Float32Array(count * 3);
      const step = total / count;
      for (let i = 0; i < count; i++) {
        const idx = Math.floor(i * step) * 3;
        fp[i*3]   = (arr[idx]   - ctr.x) * sc;
        fp[i*3+1] = (arr[idx+1] - ctr.y) * sc;
        fp[i*3+2] = (arr[idx+2] - ctr.z) * sc;
      }
      return fp;
    }

    // Body (static)
    const bodyFP = processVerts(bodyVerts, 50000);
    const bodyGeo = new THREE.BufferGeometry();
    bodyGeo.setAttribute('position', new THREE.BufferAttribute(bodyFP, 3));
    // Breathing material: gold body, warm white glow
    const breatheMats = [];
    const bodyMat = makeBreatheMat(0xD4A843, 0xF5E6C8, 0.07);
    const bodyPoints = new THREE.Points(bodyGeo, bodyMat);
    gpuGroup.add(bodyPoints);
    breatheMats.push(bodyMat);

    // Mouse repulsion data (WQF pattern: d[] target + h[] smoothed)
    const bodyOriginal = new Float32Array(bodyFP);
    const bodyDisplacement = new Float32Array(bodyFP.length); // target d[]
    const bodySmooth = new Float32Array(bodyFP.length);       // smoothed h[]
    gpuGroup.userData.bodyGeo = bodyGeo;
    gpuGroup.userData.bodyOriginal = bodyOriginal;
    gpuGroup.userData.bodyDisplacement = bodyDisplacement;
    gpuGroup.userData.bodySmooth = bodySmooth;
    gpuGroup.userData.bodyCount = bodyFP.length / 3;

    // Fan verts — normalize all, then split into 2 fans by X coordinate (median split)
    const fanFP = processVerts(fanWorldVerts, 30000);
    const fanCount = fanFP.length / 3;

    // Find median X to split fans
    const xCoords = [];
    for (let i = 0; i < fanCount; i++) xCoords.push(fanFP[i * 3]);
    xCoords.sort((a, b) => a - b);
    const medianX = xCoords[Math.floor(xCoords.length / 2)];

    // Split into two groups and compute their centers
    const f1v = [], f2v = [];
    const f1sum = new THREE.Vector3(), f2sum = new THREE.Vector3();
    let f1n = 0, f2n = 0;
    for (let i = 0; i < fanCount; i++) {
      const x = fanFP[i*3], y = fanFP[i*3+1], z = fanFP[i*3+2];
      if (x < medianX) {
        f1v.push(x, y, z); f1sum.x += x; f1sum.y += y; f1sum.z += z; f1n++;
      } else {
        f2v.push(x, y, z); f2sum.x += x; f2sum.y += y; f2sum.z += z; f2n++;
      }
    }
    if (f1n) f1sum.divideScalar(f1n);
    if (f2n) f2sum.divideScalar(f2n);

    _log('[MOZART] Fan1 center:', f1sum.x.toFixed(2), f1sum.y.toFixed(2), f1sum.z.toFixed(2), 'verts:', f1n);
    _log('[MOZART] Fan2 center:', f2sum.x.toFixed(2), f2sum.y.toFixed(2), f2sum.z.toFixed(2), 'verts:', f2n);

    // Create fan Points centered on their own center
    function makeFan(verts, center) {
      const fp = new Float32Array(verts.length);
      for (let i = 0; i < verts.length / 3; i++) {
        fp[i*3]   = verts[i*3]   - center.x;
        fp[i*3+1] = verts[i*3+1] - center.y;
        fp[i*3+2] = verts[i*3+2] - center.z;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(fp, 3));
      const fanMat = makeBreatheMat(0xD4A843, 0xF5E6C8, 0.07);
      breatheMats.push(fanMat);
      const pts = new THREE.Points(geo, fanMat);
      pts.position.copy(center);
      return pts;
    }

    const fan1Pts = makeFan(f1v, f1sum);
    const fan2Pts = makeFan(f2v, f2sum);
    gpuGroup.add(fan1Pts);
    gpuGroup.add(fan2Pts);
    gpuGroup.userData.fan1 = fan1Pts;
    gpuGroup.userData.fan2 = fan2Pts;
    gpuGroup.userData.breatheMats = breatheMats;

    // Repulsion data for fans
    const f1Arr = fan1Pts.geometry.attributes.position.array;
    fan1Pts.userData.orig = new Float32Array(f1Arr);
    fan1Pts.userData.disp = new Float32Array(f1Arr.length);
    fan1Pts.userData.smooth = new Float32Array(f1Arr.length);
    fan1Pts.userData.count = f1Arr.length / 3;
    fan1Pts.userData.center = f1sum.clone();

    const f2Arr = fan2Pts.geometry.attributes.position.array;
    fan2Pts.userData.orig = new Float32Array(f2Arr);
    fan2Pts.userData.disp = new Float32Array(f2Arr.length);
    fan2Pts.userData.smooth = new Float32Array(f2Arr.length);
    fan2Pts.userData.count = f2Arr.length / 3;
    fan2Pts.userData.center = f2sum.clone();

    // Auto-detect fan rotation axis: fans are flat discs,
    // the axis with LEAST variance is the rotation axis (normal to disc)
    let varX=0, varY=0, varZ=0;
    const fa = fan1Pts.geometry.attributes.position.array;
    const fn = fa.length / 3;
    for (let i=0; i<fn; i++) {
      varX += fa[i*3]   * fa[i*3];
      varY += fa[i*3+1] * fa[i*3+1];
      varZ += fa[i*3+2] * fa[i*3+2];
    }
    varX /= fn; varY /= fn; varZ /= fn;
    const minVar = Math.min(varX, varY, varZ);
    const fanAxis = minVar === varX ? 'x' : minVar === varY ? 'y' : 'z';
    gpuGroup.userData.fanAxis = fanAxis;

    _log('[MOZART] Fan axis variance X:', varX.toFixed(4), 'Y:', varY.toFixed(4), 'Z:', varZ.toFixed(4), '→ rotate around:', fanAxis);
    _log('[MOZART] GPU ready. Body:', bodyFP.length/3, 'Fan1:', f1n, 'Fan2:', f2n);
  }, (xhr) => {
    if (xhr.total) _log('[MOZART] Loading:', Math.round(xhr.loaded/xhr.total*100) + '%');
  }, err => _err('[MOZART] GLB error:', err));

  // Cache canvas dimensions (avoids repeated DOM reads in rAF loop)
  let cachedW = canvas.clientWidth, cachedH = canvas.clientHeight;

  // Pre-allocate reusable objects (zero GC in render loop)
  const _ndc = new THREE.Vector2();
  const _ray = new THREE.Raycaster();
  const _planeNormal = new THREE.Vector3();
  const _groupCenter = new THREE.Vector3();
  const _plane = new THREE.Plane();
  const _hitResult = new THREE.Vector3();
  const _invMat = new THREE.Matrix4();
  const _fanInv = new THREE.Matrix4();
  const _fanHit = new THREE.Vector3();
  const _worldHitCopy = new THREE.Vector3();

  // Animation
  registerScene(() => {
    if (!state.visible) return;
    state.time += 0.01;
    const t = state.time;

    gpuGroup.rotation.y = -0.3 + Math.sin(t*0.3)*0.15 + mouseX*0.4;
    gpuGroup.rotation.x = 0.2 + Math.cos(t*0.2)*0.08 - mouseY*0.2;
    // Update breathing shader time
    if (gpuGroup.userData.breatheMats) {
      for (let i = 0; i < gpuGroup.userData.breatheMats.length; i++) {
        gpuGroup.userData.breatheMats[i].uniforms.uTime.value = t;
      }
    }

    // Fans spin around the axis with smallest variance (the "thin" axis = normal to fan disc)
    if (gpuGroup.userData.fan1) {
      const ax = gpuGroup.userData.fanAxis || 'z';
      gpuGroup.userData.fan1.rotation[ax] = t * 2;
    }
    if (gpuGroup.userData.fan2) {
      const ax = gpuGroup.userData.fanAxis || 'z';
      gpuGroup.userData.fan2.rotation[ax] = -t * 2;
    }

    // ---- Mouse repulsion (spherical push in local 3D) ----
    // All reusable objects pre-allocated outside loop — zero GC pressure
    if (gpuGroup.userData.bodyGeo) {
      const geo = gpuGroup.userData.bodyGeo;
      const orig = gpuGroup.userData.bodyOriginal;
      const disp = gpuGroup.userData.bodyDisplacement;
      const smooth = gpuGroup.userData.bodySmooth;
      const count = gpuGroup.userData.bodyCount;
      const posArr = geo.attributes.position.array;

      if (!cachedW || !cachedH) return;
      _ndc.set(
        (mouseScreenX / cachedW) * 2 - 1,
        -(mouseScreenY / cachedH) * 2 + 1
      );
      _ray.setFromCamera(_ndc, camera);

      _planeNormal.set(0, 0, 1).applyQuaternion(camera.quaternion);
      _groupCenter.setFromMatrixPosition(gpuGroup.matrixWorld);
      _plane.setFromNormalAndCoplanarPoint(_planeNormal, _groupCenter);
      const worldHit = _ray.ray.intersectPlane(_plane, _hitResult);

      if (worldHit) {
        // Save world hit before converting (fans need it too)
        _worldHitCopy.copy(worldHit);
        // Convert world hit → local space of gpuGroup
        _invMat.copy(gpuGroup.matrixWorld).invert();
        const localHit = worldHit.applyMatrix4(_invMat);

        const RADIUS = 0.6;      // local units — small sphere
        const STRENGTH = 0.25;
        const LERP = 0.15;

        for (let i = 0; i < count; i++) {
          const i3 = i * 3;
          // Vector from mouse to particle (LOCAL space = true spherical)
          const dx = orig[i3]     - localHit.x;
          const dy = orig[i3 + 1] - localHit.y;
          const dz = orig[i3 + 2] - localHit.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < RADIUS && dist > 0.001) {
            const w = (1 - dist / RADIUS) * STRENGTH;
            const inv = 1 / dist;
            // Push radially outward from hit point — true sphere
            disp[i3]     = dx * inv * w;
            disp[i3 + 1] = dy * inv * w;
            disp[i3 + 2] = dz * inv * w;
          } else {
            disp[i3] = 0; disp[i3+1] = 0; disp[i3+2] = 0;
          }

          smooth[i3]     += LERP * (disp[i3]     - smooth[i3]);
          smooth[i3 + 1] += LERP * (disp[i3 + 1] - smooth[i3 + 1]);
          smooth[i3 + 2] += LERP * (disp[i3 + 2] - smooth[i3 + 2]);

          posArr[i3]     = orig[i3]     + smooth[i3];
          posArr[i3 + 1] = orig[i3 + 1] + smooth[i3 + 1];
          posArr[i3 + 2] = orig[i3 + 2] + smooth[i3 + 2];
        }
        geo.attributes.position.needsUpdate = true;

        // Apply same repulsion to fan1 and fan2
        const fans = [gpuGroup.userData.fan1, gpuGroup.userData.fan2];
        fans.forEach(fan => {
          if (!fan || !fan.userData.orig) return;
          const fOrig = fan.userData.orig;
          const fDisp = fan.userData.disp;
          const fSmooth = fan.userData.smooth;
          const fCount = fan.userData.count;
          const fPos = fan.geometry.attributes.position.array;

          // Fan hit point: convert world hit to fan's local space
          _fanInv.copy(fan.matrixWorld).invert();
          _fanHit.copy(_worldHitCopy).applyMatrix4(_fanInv);

          for (let j = 0; j < fCount; j++) {
            const j3 = j * 3;
            const fdx = fOrig[j3]     - _fanHit.x;
            const fdy = fOrig[j3 + 1] - _fanHit.y;
            const fdz = fOrig[j3 + 2] - _fanHit.z;
            const fdist = Math.sqrt(fdx*fdx + fdy*fdy + fdz*fdz);

            if (fdist < RADIUS && fdist > 0.001) {
              const fw = (1 - fdist / RADIUS) * STRENGTH;
              const finv = 1 / fdist;
              fDisp[j3]     = fdx * finv * fw;
              fDisp[j3 + 1] = fdy * finv * fw;
              fDisp[j3 + 2] = fdz * finv * fw;
            } else {
              fDisp[j3] = 0; fDisp[j3+1] = 0; fDisp[j3+2] = 0;
            }

            fSmooth[j3]     += LERP * (fDisp[j3]     - fSmooth[j3]);
            fSmooth[j3 + 1] += LERP * (fDisp[j3 + 1] - fSmooth[j3 + 1]);
            fSmooth[j3 + 2] += LERP * (fDisp[j3 + 2] - fSmooth[j3 + 2]);

            fPos[j3]     = fOrig[j3]     + fSmooth[j3];
            fPos[j3 + 1] = fOrig[j3 + 1] + fSmooth[j3 + 1];
            fPos[j3 + 2] = fOrig[j3 + 2] + fSmooth[j3 + 2];
          }
          fan.geometry.attributes.position.needsUpdate = true;
        });
      }
    }

    camera.position.x += (mouseX*1.5 - camera.position.x)*0.03;
    camera.position.y += (1 - mouseY*0.8 - camera.position.y)*0.03;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  });

  const heroResizeCtrl = new AbortController();
  window.addEventListener('resize', () => {
    const nw=window.innerWidth, nh=window.innerHeight;
    renderer.setSize(nw,nh); camera.aspect=nw/nh; camera.updateProjectionMatrix();
    cachedW = canvas.clientWidth; cachedH = canvas.clientHeight;
  }, { signal: heroResizeCtrl.signal });
}


// ================================================================
//  SCENE 2: FOCUS — Plane wave
// ================================================================
function initFocusScene() {
  const section = document.querySelector('.focus');
  if (!section) return;
  section.style.position = 'relative';
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:absolute;inset:0;z-index:0;overflow:hidden;';
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;';
  wrap.appendChild(canvas);
  section.insertBefore(wrap, section.firstChild);
  const content = section.querySelector('.container');
  if (content) { content.style.position='relative'; content.style.zIndex='1'; }

  const {scene,camera,renderer} = createScene(canvas, section, {fov:75,cameraPos:[0,2,21],fogColor:0xDADADA,fogNear:10,fogFar:40,clearColor:0xDADADA});
  const state={visible:true,time:0};
  observeVisibility(canvas,state);

  const WAVE_VERT = `
    uniform float size; uniform float sizeAttenuation; uniform float uTime;
    varying float vFogDist;
    void main() {
      vec3 p = position;
      float f1 = 0.15, f2 = 0.30, f3 = 0.45;
      p.z += (sin((p.x+uTime)*f1)*cos((p.y+uTime*0.5)*f1*0.7)
            + cos((p.x+uTime)*f1*0.8)*sin((p.y+uTime*0.5)*f1)*0.5) * 3.0
           + (sin((p.x+uTime)*f2)*cos((p.y+uTime*0.5)*f2*0.7)*0.5
            + cos((p.x+uTime)*f2*0.8)*sin((p.y+uTime*0.5)*f2)*0.25) * 3.0
           + (sin((p.x+uTime)*f3)*cos((p.y+uTime*0.5)*f3*0.7)*0.333
            + cos((p.x+uTime)*f3*0.8)*sin((p.y+uTime*0.5)*f3)*0.167) * 3.0;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_PointSize = size * (sizeAttenuation / -mv.z);
      gl_Position = projectionMatrix * mv;
      vFogDist = -mv.z;
    }
  `;
  const planeGeo=new THREE.PlaneGeometry(100,100,200,200);
  const waveMat=new THREE.ShaderMaterial({
    uniforms:{color:{value:new THREE.Color(0x5B2C6F)},size:{value:0.25},sizeAttenuation:{value:170},uTime:{value:0},fogColor:{value:new THREE.Color(0xDADADA)},fogNear:{value:10},fogFar:{value:40}},
    vertexShader:WAVE_VERT, fragmentShader:PARTICLE_FRAGMENT, transparent:true,
  });
  const plane=new THREE.Points(planeGeo, waveMat);
  plane.rotation.x=-Math.PI/2;
  scene.add(plane);

  registerScene(() => {
    if(!state.visible)return;
    state.time+=0.01;
    waveMat.uniforms.uTime.value=state.time;
    renderer.render(scene,camera);
  });

  const focusResizeCtrl = new AbortController();
  window.addEventListener('resize',()=>handleResize(renderer,camera,section),{ signal: focusResizeCtrl.signal });
}


// ================================================================
//  SCENE 3: INVESTORS/FOUNDERS — Plane wave
// ================================================================
function initIFScene() {
  const container=document.querySelector('.if-canvas');
  if(!container)return;
  container.style.background='none';
  const canvas=document.createElement('canvas');
  canvas.style.cssText='width:100%;height:100%;';
  container.appendChild(canvas);

  const {scene,camera,renderer}=createScene(canvas,container,{fov:60,cameraPos:[0,0,25],fogColor:0x0D0517,fogNear:0,fogFar:40,clearColor:0x0D0517});
  const state={visible:true,time:0};
  observeVisibility(canvas,state);

  const WAVE_VERT2 = `
    uniform float size; uniform float sizeAttenuation; uniform float uTime;
    varying float vFogDist;
    void main() {
      vec3 p = position;
      float f1 = 0.12, f2 = 0.24, f3 = 0.36;
      float tx = uTime*0.5, ty = uTime*0.3;
      p.z += (sin((p.x+tx)*f1)*cos((p.y+ty)*f1*0.7)
            + cos((p.x+tx)*f1*0.8)*sin((p.y+ty)*f1)*0.5) * 2.0
           + (sin((p.x+tx)*f2)*cos((p.y+ty)*f2*0.7)*0.5
            + cos((p.x+tx)*f2*0.8)*sin((p.y+ty)*f2)*0.25) * 2.0
           + (sin((p.x+tx)*f3)*cos((p.y+ty)*f3*0.7)*0.333
            + cos((p.x+tx)*f3*0.8)*sin((p.y+ty)*f3)*0.167) * 2.0;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_PointSize = size * (sizeAttenuation / -mv.z);
      gl_Position = projectionMatrix * mv;
      vFogDist = -mv.z;
    }
  `;
  const planeGeo=new THREE.PlaneGeometry(60,60,120,120);
  const waveMat2=new THREE.ShaderMaterial({
    uniforms:{color:{value:new THREE.Color(0xD4A843)},size:{value:0.35},sizeAttenuation:{value:170},uTime:{value:0},fogColor:{value:new THREE.Color(0x0D0517)},fogNear:{value:0},fogFar:{value:40}},
    vertexShader:WAVE_VERT2, fragmentShader:PARTICLE_FRAGMENT, transparent:true,
  });
  const plane=new THREE.Points(planeGeo,waveMat2);
  plane.rotation.x=-Math.PI/3;plane.position.y=-5;
  scene.add(plane);

  registerScene(() => {
    if(!state.visible)return;
    state.time+=0.01;
    waveMat2.uniforms.uTime.value=state.time;
    renderer.render(scene,camera);
  });

  const ifResizeCtrl = new AbortController();
  window.addEventListener('resize',()=>handleResize(renderer,camera,container),{ signal: ifResizeCtrl.signal });
}


// ================================================================
//  SCENE 4: PARTNERS — Torus
// ================================================================
function initPartnersScene() {
  const container=document.querySelector('.partners-right');
  if(!container)return;
  container.style.position='relative';container.style.overflow='hidden';container.style.background='none';
  const canvas=document.createElement('canvas');
  canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:0;';
  container.insertBefore(canvas,container.firstChild);
  Array.from(container.children).forEach(c=>{if(c!==canvas){c.style.position='relative';c.style.zIndex='1';}});

  const {scene,camera,renderer}=createScene(canvas,container,{fov:60,cameraPos:[0,0,15],fogColor:0x0D0517,fogNear:5,fogFar:30,clearColor:0x0D0517});
  const state={visible:true,time:0};
  observeVisibility(canvas,state);

  const t1=new THREE.Points(new THREE.TorusGeometry(3,1,102,180),makePMat(0xD4A843,0.2));
  scene.add(t1);
  const t2=new THREE.Points(new THREE.TorusGeometry(2,0.6,60,100),makePMat(0x800020,0.15));
  scene.add(t2);

  registerScene(() => {
    if(!state.visible)return;
    state.time+=0.01;const t=state.time;
    t1.rotation.x=Math.sin(t*0.3)*0.3;t1.rotation.y=t*0.15;
    t2.rotation.x=Math.cos(t*0.2)*0.4;t2.rotation.y=-t*0.2;t2.rotation.z=t*0.1;
    renderer.render(scene,camera);
  });

  const partnersResizeCtrl = new AbortController();
  window.addEventListener('resize',()=>handleResize(renderer,camera,container),{ signal: partnersResizeCtrl.signal });
}


// ================================================================
//  SCENE 5: FOOTER — Notes (Fibonacci sphere + Canvas2D textures)
// ================================================================
function createNoteTexture(type){
  const s=128,c=document.createElement('canvas');c.width=s;c.height=s;
  const x=c.getContext('2d');x.clearRect(0,0,s,s);x.fillStyle='#fff';x.strokeStyle='#fff';x.lineWidth=3;x.lineCap='round';
  const cx=s/2,cy=s/2;
  if(type==='quarter'){x.beginPath();x.ellipse(cx-8,cy+20,14,10,-0.3,0,Math.PI*2);x.fill();x.beginPath();x.moveTo(cx+5,cy+18);x.lineTo(cx+5,cy-35);x.stroke();}
  else if(type==='eighth'){x.beginPath();x.ellipse(cx-8,cy+20,14,10,-0.3,0,Math.PI*2);x.fill();x.beginPath();x.moveTo(cx+5,cy+18);x.lineTo(cx+5,cy-35);x.stroke();x.beginPath();x.moveTo(cx+5,cy-35);x.quadraticCurveTo(cx+28,cy-20,cx+12,cy-5);x.stroke();}
  else if(type==='double'){x.beginPath();x.ellipse(cx-18,cy+22,11,8,-0.3,0,Math.PI*2);x.fill();x.beginPath();x.ellipse(cx+14,cy+22,11,8,-0.3,0,Math.PI*2);x.fill();x.beginPath();x.moveTo(cx-8,cy+20);x.lineTo(cx-8,cy-30);x.moveTo(cx+24,cy+20);x.lineTo(cx+24,cy-30);x.stroke();x.lineWidth=4;x.beginPath();x.moveTo(cx-8,cy-30);x.lineTo(cx+24,cy-30);x.moveTo(cx-8,cy-22);x.lineTo(cx+24,cy-22);x.stroke();}
  else{x.lineWidth=3.5;x.beginPath();x.moveTo(cx+2,cy+38);x.quadraticCurveTo(cx-22,cy+15,cx-10,cy-5);x.quadraticCurveTo(cx+10,cy-25,cx+5,cy-40);x.quadraticCurveTo(cx-5,cy-50,cx-12,cy-35);x.stroke();x.beginPath();x.moveTo(cx+2,cy+40);x.lineTo(cx+2,cy-42);x.stroke();x.beginPath();x.arc(cx,cy+34,6,0,Math.PI*1.5);x.stroke();}
  const t=new THREE.CanvasTexture(c);t.needsUpdate=true;return t;
}

function fibSphere(n,r,yS){
  const p=new Float32Array(n*3),g=(1+Math.sqrt(5))/2;
  for(let i=0;i<n;i++){const th=2*Math.PI*i/g,ph=Math.acos(1-2*(i+0.5)/n);p[i*3]=r*Math.sin(ph)*Math.cos(th);p[i*3+1]=r*Math.sin(ph)*Math.sin(th)*(yS||1);p[i*3+2]=r*Math.cos(ph);}
  return p;
}

function initFooterScene(){
  const container=document.querySelector('.footer-canvas');
  if(!container)return;
  container.style.background='none';
  const canvas=document.createElement('canvas');canvas.style.cssText='width:100%;height:100%;';
  container.appendChild(canvas);

  const {scene,camera,renderer}=createScene(canvas,container,{fov:50,cameraPos:[0,0,18],fogColor:0x0D0517,fogNear:8,fogFar:35,clearColor:0x0D0517});
  const state={visible:true,time:0};
  observeVisibility(canvas,state);

  const texs=['quarter','eighth','double','treble'].map(createNoteTexture);
  const NV=`attribute float size;attribute vec3 customColor;attribute float phase;varying vec3 vColor;varying float vAlpha;uniform float uTime;
    void main(){vColor=customColor;vec3 p=position;p.y+=sin(uTime*0.4+phase)*0.3;p.x+=sin(uTime*0.2+phase*1.3)*0.15;
    vec4 mv=modelViewMatrix*vec4(p,1.0);gl_PointSize=size*(200.0/-mv.z);gl_Position=projectionMatrix*mv;vAlpha=smoothstep(30.0,5.0,-mv.z)*0.85;}`;
  const NF=`uniform sampler2D uTexture;varying vec3 vColor;varying float vAlpha;
    void main(){vec4 t=texture2D(uTexture,gl_PointCoord);if(t.a<0.1)discard;gl_FragColor=vec4(vColor*t.rgb,t.a*vAlpha);}`;

  const pal=[new THREE.Color(0xD4A843),new THREE.Color(0xF5E6C8),new THREE.Color(0xD4A843),new THREE.Color(0x8B5E9B),new THREE.Color(0x800020)];
  const rpc=()=>{const a=pal[Math.floor(Math.random()*pal.length)],b=pal[Math.floor(Math.random()*pal.length)];return a.clone().lerp(b,Math.random());};

  const layers=[{c:40,r:5,y:0.7,s0:1.2,s1:2},{c:60,r:9,y:0.6,s0:0.8,s1:1.5},{c:80,r:14,y:0.5,s0:0.4,s1:1}];
  const groups=[];
  layers.forEach((l,li)=>{
    const pos=fibSphere(l.c,l.r,l.y),sz=new Float32Array(l.c),col=new Float32Array(l.c*3),ph=new Float32Array(l.c);
    for(let i=0;i<l.c;i++){sz[i]=l.s0+Math.random()*(l.s1-l.s0);ph[i]=Math.random()*Math.PI*2;const c=rpc();col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('size',new THREE.BufferAttribute(sz,1));
    g.setAttribute('customColor',new THREE.BufferAttribute(col,3));g.setAttribute('phase',new THREE.BufferAttribute(ph,1));
    const m=new THREE.ShaderMaterial({uniforms:{uTexture:{value:texs[li%texs.length]},uTime:{value:0}},vertexShader:NV,fragmentShader:NF,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
    const p=new THREE.Points(g,m);scene.add(p);groups.push(p);
  });

  // Dust
  const dg=new THREE.BufferGeometry();dg.setAttribute('position',new THREE.BufferAttribute(fibSphere(300,12,0.8),3));
  const dm=makePMat(0xD4A843,0.06);dm.transparent=true;dm.depthWrite=false;dm.blending=THREE.AdditiveBlending;
  const dust=new THREE.Points(dg,dm);scene.add(dust);

  registerScene(() => {
    if(!state.visible)return;
    state.time+=0.01;const t=state.time;
    groups.forEach((g,i)=>{g.material.uniforms.uTime.value=t;g.rotation.y=t*(0.02+i*0.008);g.rotation.x=Math.sin(t*0.1+i)*0.05;});
    dust.rotation.y=t*0.01;dust.rotation.x=Math.sin(t*0.08)*0.03;
    renderer.render(scene,camera);
  });

  const footerResizeCtrl = new AbortController();
  window.addEventListener('resize',()=>handleResize(renderer,camera,container),{ signal: footerResizeCtrl.signal });
}


// ================================================================
//  INIT
// ================================================================
window.addEventListener('DOMContentLoaded', () => {
  let attempts = 0;
  const check = setInterval(() => {
    attempts++;
    const loader = document.querySelector('.loader');
    if (attempts > 100 || !loader || loader.classList.contains('loaded')) {
      clearInterval(check);
      initHeroScene();
      initFocusScene();
      initIFScene();
      initFooterScene();
      initPartnersScene();
    }
  }, 100);
});

masterLoop();
