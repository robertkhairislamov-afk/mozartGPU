// ===== Industries GPU Particle Background =====
(() => {
  const section = document.querySelector('.industries');
  const canvas = section && section.querySelector('.industries-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  function resize() {
    const rect = section.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }
  window.addEventListener('resize', resize);
  resize();

  // Type enum (faster than string comparison)
  const T_BOARD = 0, T_CORE = 1, T_VRAM = 2, T_TRACE = 3;

  // Flat typed arrays for particle data
  const MAX = 12000;
  const px0 = new Float32Array(MAX);
  const py0 = new Float32Array(MAX);
  const pz0 = new Float32Array(MAX);
  const pDist = new Float32Array(MAX);
  const pRnd = new Float32Array(MAX);
  const pType = new Uint8Array(MAX);
  let count = 0;

  function addParticle(x, y, z, type) {
    if (count >= MAX) return;
    px0[count] = x;
    py0[count] = y;
    pz0[count] = z;
    pDist[count] = Math.sqrt(x * x + y * y);
    pRnd[count] = Math.random();
    pType[count] = type;
    count++;
  }

  function createRect(cx, cy, cz, w, h, step, type) {
    for (let x = cx - w / 2; x <= cx + w / 2; x += step) {
      for (let y = cy - h / 2; y <= cy + h / 2; y += step) {
        addParticle(x, y, cz, type);
      }
    }
  }

  // PCB board
  createRect(0, 0, -20, 1000, 1000, 55, T_BOARD);

  // GPU die core
  createRect(0, 0, 30, 140, 140, 7, T_CORE);

  // 8 VRAM banks
  const vOff = 150;
  [[0, -vOff], [0, vOff], [-vOff, 0], [vOff, 0],
   [-140, -140], [140, -140], [-140, 140], [140, 140]]
    .forEach(c => createRect(c[0], c[1], 15, 60, 60, 10, T_VRAM));

  // PCB traces
  for (let i = 0; i < 150; i++) {
    let x = (Math.random() - 0.5) * 300;
    let y = (Math.random() - 0.5) * 300;
    if (Math.abs(x) < 90 && Math.abs(y) < 90) {
      if (Math.random() > 0.5) x = Math.sign(x || 1) * 90;
      else y = Math.sign(y || 1) * 90;
    }
    let dx = Math.random() > 0.5 ? 1 : 0;
    let dy = 1 - dx;
    dx *= Math.sign(x || 1) * 8;
    dy *= Math.sign(y || 1) * 8;
    const len = 20 + Math.random() * 30;
    for (let j = 0; j < len; j++) {
      addParticle(x, y, 0, T_TRACE);
      x += dx; y += dy;
      if (Math.random() > 0.85) {
        if (dx !== 0) { dy = Math.sign(y || 1) * 8; dx = 0; }
        else { dx = Math.sign(x || 1) * 8; dy = 0; }
      }
    }
  }

  // Pre-compute alpha LUT (256 steps) to avoid toFixed/string alloc per particle
  const ALPHA_STEPS = 256;
  const coreColors = new Array(ALPHA_STEPS);
  const vramColors = new Array(ALPHA_STEPS);
  for (let i = 0; i < ALPHA_STEPS; i++) {
    const a = (i / (ALPHA_STEPS - 1)).toFixed(3);
    coreColors[i] = `rgba(0,200,255,${a})`;
    vramColors[i] = `rgba(91,44,111,${a})`;
  }
  const traceHi = 'rgba(212,168,67,1)';
  const traceLo = 'rgba(168,216,234,0.15)';
  const boardCol = 'rgba(91,44,111,0.1)';
  const fadeFill = 'rgba(13,5,23,0.3)';

  const focalLength = 1200;
  let time = 0;
  let lastTime = 0;
  let running = false;

  function render(now) {
    if (!running) return;

    const dt = lastTime ? Math.min((now - lastTime) / 16.66, 3) : 1;
    lastTime = now;
    time += 0.01 * dt;

    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = fadeFill;
    ctx.fillRect(0, 0, w, h);

    const rotZ = time * 0.15;
    const cosZ = Math.cos(rotZ);
    const sinZ = Math.sin(rotZ);
    // rotX = PI/3 is constant
    const cosX = 0.5;       // cos(PI/3)
    const sinX = 0.8660254; // sin(PI/3)
    const cxH = w * 0.5;
    const cyH = h * 0.5 + 80;

    const t10 = time * 10;
    const t5 = time * 5;
    const t8 = time * 8;

    for (let i = 0; i < count; i++) {
      const x0 = px0[i], y0 = py0[i], z0 = pz0[i];

      const x1 = x0 * cosZ - y0 * sinZ;
      const y1 = x0 * sinZ + y0 * cosZ;

      const y2 = y1 * cosX - z0 * sinX;
      const z2 = y1 * sinX + z0 * cosX;

      const zR = z2 + 1000;
      if (zR < 1) continue;

      const scale = focalLength / zR;
      const sx = x1 * scale + cxH;
      const sy = y2 * scale + cyH;

      if (sx < -3 || sx > w || sy < -3 || sy > h) continue;

      const type = pType[i];
      let size, color;

      if (type === T_CORE) {
        const a = 0.6 + Math.sin(t10 + pRnd[i] * 3.14159) * 0.4;
        color = coreColors[(a * 255) | 0];
        size = 2.5 * scale;
      } else if (type === T_VRAM) {
        const a = 0.6 + Math.sin(t5 + pDist[i] * 0.05) * 0.3;
        color = vramColors[(a * 255) | 0];
        size = 1.8 * scale;
      } else if (type === T_TRACE) {
        const wave = Math.sin(pDist[i] * 0.05 - t8);
        if (wave > 0.8) {
          color = traceHi;
          size = 2.5 * scale;
        } else {
          color = traceLo;
          size = 1.2 * scale;
        }
      } else {
        color = boardCol;
        size = 2.5 * scale;
      }

      ctx.fillStyle = color;
      ctx.fillRect(sx, sy, size, size);
    }

    requestAnimationFrame(render);
  }

  // Only animate when visible
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !running) {
        running = true;
        lastTime = 0;
        requestAnimationFrame(render);
      } else if (!entry.isIntersecting) {
        running = false;
      }
    });
  }, { threshold: 0.05 });

  obs.observe(section);
})();
