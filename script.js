import { Activity, Zap, Target, Clock, Layers, Waves } from "lucide";

// ---------- Lucide icon serializer ----------

function iconToSvg(icon, { size = 22, stroke = "currentColor" } = {}) {
  const children = icon
    .map(([tag, attrs]) => {
      const a = Object.entries(attrs)
        .map(([k, v]) => `${k}="${v}"`)
        .join(" ");
      return `<${tag} ${a} />`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${children}</svg>`;
}

// ---------- Streaming data ----------

function createStream({ start = 200, vol = 15, drift = 0, decay = 0.02, seedCount = 180 } = {}) {
  const points = [];
  let value = start;
  const center = start;
  let t = Date.now() - seedCount * 1000;

  const step = () => {
    value += (center - value) * decay + drift + (Math.random() - 0.5) * vol;
    return value;
  };

  for (let i = 0; i < seedCount; i++) {
    points.push({ time: t, value: step() });
    t += 1000;
  }

  return {
    points,
    tick() {
      points.push({ time: Date.now(), value: step() });
      if (points.length > 600) points.shift();
    },
    latest() {
      return points[points.length - 1];
    },
  };
}

const streamA = createStream({ start: 248, vol: 14, decay: 0.025 });
const streamB = createStream({ start: 182, vol: 11, decay: 0.03 });

setInterval(() => {
  streamA.tick();
  streamB.tick();
}, 220);

// ---------- Particles ----------

const N = 320;
const SPRING_K = 0.09;
const DAMPING = 0.78;

const particles = Array.from({ length: N }, (_, i) => ({
  x: Math.random() * 800,
  y: Math.random() * 300,
  vx: 0,
  vy: 0,
  tx: 0,
  ty: 0,
  alpha: 0.8,
  phase: Math.random() * Math.PI * 2,
  group: i % 2,
}));

function updateParticles(t) {
  for (const p of particles) {
    const ax = (p.tx - p.x) * SPRING_K;
    const ay = (p.ty - p.y) * SPRING_K;
    p.vx = (p.vx + ax) * DAMPING;
    p.vy = (p.vy + ay) * DAMPING;
    p.x += p.vx;
    p.y += p.vy;
  }
}

// ---------- Layouts ----------

function rangeOf(points) {
  let min = Infinity;
  let max = -Infinity;
  for (const p of points) {
    if (p.value < min) min = p.value;
    if (p.value > max) max = p.value;
  }
  if (min === max) {
    min -= 1;
    max += 1;
  }
  return { min, max };
}

function sampleCurve(points, t01) {
  const idx = t01 * (points.length - 1);
  const i = Math.floor(idx);
  const frac = idx - i;
  const a = points[i];
  const b = points[Math.min(i + 1, points.length - 1)];
  return a.value + (b.value - a.value) * frac;
}

function layoutLine(cw, ch, time) {
  const pts = streamA.points;
  const { min, max } = rangeOf(pts);
  const padX = 24;
  const padY = 32;
  for (let i = 0; i < N; i++) {
    const p = particles[i];
    const t01 = i / (N - 1);
    const v = sampleCurve(pts, t01);
    p.tx = padX + t01 * (cw - padX * 2);
    p.ty = padY + (1 - (v - min) / (max - min)) * (ch - padY * 2);
    p.alpha = 0.55 + 0.35 * t01;
  }
}

function layoutMomentum(cw, ch, time) {
  const pts = streamA.points;
  const { min, max } = rangeOf(pts);
  const padX = 24;
  const padY = 36;
  for (let i = 0; i < N; i++) {
    const p = particles[i];
    const t01 = i / (N - 1);
    const v = sampleCurve(pts, t01);
    const baseY = padY + (1 - (v - min) / (max - min)) * (ch - padY * 2);
    const bob = Math.sin(time * 0.0022 + p.phase + t01 * 6) * 8;
    p.tx = padX + t01 * (cw - padX * 2);
    p.ty = baseY + bob;
    p.alpha = 0.5 + 0.4 * Math.abs(Math.sin(time * 0.0015 + p.phase));
  }
}

function layoutReference(cw, ch, time) {
  const pts = streamA.points;
  const { min, max } = rangeOf(pts);
  const padX = 24;
  const padY = 32;
  const avg = pts.reduce((s, p) => s + p.value, 0) / pts.length;
  const refY = padY + (1 - (avg - min) / (max - min)) * (ch - padY * 2);
  for (let i = 0; i < N; i++) {
    const p = particles[i];
    const t01 = i / (N - 1);
    if (i % 3 === 0) {
      p.tx = padX + t01 * (cw - padX * 2);
      p.ty = refY;
      p.alpha = 0.4;
    } else {
      const v = sampleCurve(pts, t01);
      p.tx = padX + t01 * (cw - padX * 2);
      p.ty = padY + (1 - (v - min) / (max - min)) * (ch - padY * 2);
      p.alpha = 0.75;
    }
  }
}

function layoutWindows(cw, ch, time) {
  const pts = streamA.points;
  const windowSize = 40;
  const slice = pts.slice(-windowSize);
  const { min, max } = rangeOf(slice);
  const padX = 24;
  const padY = 32;
  for (let i = 0; i < N; i++) {
    const p = particles[i];
    const t01 = i / (N - 1);
    const v = sampleCurve(slice, t01);
    p.tx = padX + t01 * (cw - padX * 2);
    p.ty = padY + (1 - (v - min) / (max - min)) * (ch - padY * 2);
    p.alpha = 0.6 + 0.35 * t01;
  }
}

function layoutOrderbook(cw, ch, time) {
  const latest = streamA.latest().value;
  const padX = 40;
  const padY = 28;
  const rows = 14;
  const rowH = (ch - padY * 2) / rows;
  const perRow = Math.floor(N / rows);
  for (let r = 0; r < rows; r++) {
    const rowY = padY + r * rowH + rowH / 2;
    const isBid = r >= rows / 2;
    const depth = 0.3 + Math.random() * 0.0 + Math.abs(Math.sin(r * 1.3 + time * 0.0005)) * 0.7;
    const widthFrac = 0.2 + depth * 0.7;
    for (let k = 0; k < perRow; k++) {
      const idx = r * perRow + k;
      if (idx >= N) break;
      const p = particles[idx];
      const t01 = k / (perRow - 1);
      if (isBid) {
        p.tx = padX + (cw / 2 - padX) * (1 - t01 * widthFrac);
      } else {
        p.tx = cw / 2 + (cw / 2 - padX) * (t01 * widthFrac);
      }
      p.ty = rowY;
      p.alpha = 0.35 + 0.5 * depth;
    }
  }
  for (let i = rows * perRow; i < N; i++) {
    const p = particles[i];
    p.tx = cw / 2;
    p.ty = ch / 2;
    p.alpha = 0;
  }
}

function layoutMulti(cw, ch, time) {
  const ptsA = streamA.points;
  const ptsB = streamB.points;
  const combined = [...ptsA.map((p) => p.value), ...ptsB.map((p) => p.value)];
  let min = Infinity;
  let max = -Infinity;
  for (const v of combined) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const padX = 24;
  const padY = 32;
  const half = N / 2;
  for (let i = 0; i < N; i++) {
    const p = particles[i];
    const group = i < half ? 0 : 1;
    const t01 = (i % half) / (half - 1);
    const src = group === 0 ? ptsA : ptsB;
    const v = sampleCurve(src, t01);
    p.group = group;
    p.tx = padX + t01 * (cw - padX * 2);
    p.ty = padY + (1 - (v - min) / (max - min)) * (ch - padY * 2);
    p.alpha = group === 0 ? 0.75 : 0.5;
  }
}

const LAYOUTS = [
  layoutLine,
  layoutMomentum,
  layoutReference,
  layoutWindows,
  layoutOrderbook,
  layoutMulti,
];

let currentVariant = 0;

// ---------- Canvas ----------

const mount = document.getElementById("vizMount");
mount.classList.add("viz-host");

const headerWrap = document.createElement("div");
headerWrap.className = "viz-header";
const headerTitle = document.createElement("span");
headerTitle.className = "viz-title";
headerTitle.textContent = "Live stream";
const headerValue = document.createElement("span");
headerValue.className = "viz-value";
headerValue.textContent = "—";
headerWrap.appendChild(headerTitle);
headerWrap.appendChild(headerValue);
mount.appendChild(headerWrap);

const canvasWrap = document.createElement("div");
canvasWrap.className = "viz-canvas-wrap";
const canvas = document.createElement("canvas");
canvasWrap.appendChild(canvas);
mount.appendChild(canvasWrap);

const ctx = canvas.getContext("2d");
let cssW = 0;
let cssH = 0;
let dpr = window.devicePixelRatio || 1;

function resize() {
  dpr = window.devicePixelRatio || 1;
  const rect = canvasWrap.getBoundingClientRect();
  cssW = rect.width;
  cssH = rect.height;
  canvas.width = Math.floor(cssW * dpr);
  canvas.height = Math.floor(cssH * dpr);
  canvas.style.width = cssW + "px";
  canvas.style.height = cssH + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

const ro = new ResizeObserver(resize);
ro.observe(canvasWrap);
resize();

// Seed particle positions to something onscreen so first transition feels smooth
for (const p of particles) {
  p.x = Math.random() * 600 + 50;
  p.y = Math.random() * 180 + 40;
}

function draw() {
  ctx.clearRect(0, 0, cssW, cssH);
  const gold = [196, 154, 58];
  const goldAlt = [138, 182, 196];
  for (const p of particles) {
    const col = p.group === 1 && currentVariant === 5 ? goldAlt : gold;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${col[0]}, ${col[1]}, ${col[2]}, ${p.alpha})`;
    ctx.fill();
  }
}

function frame(t) {
  if (cssW > 0 && cssH > 0) {
    LAYOUTS[currentVariant](cssW, cssH, t);
    updateParticles(t);
    draw();
  }
  const latest = streamA.latest();
  if (latest) headerValue.textContent = latest.value.toFixed(2);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// ---------- Radial control ----------

const VARIANTS = [
  { label: "Inspect", sub: "hover a slice" },
  { icon: Activity, name: "Line", sub: "streaming curve" },
  { icon: Zap, name: "Momentum", sub: "velocity field" },
  { icon: Target, name: "Reference", sub: "mean anchor" },
  { icon: Clock, name: "Window", sub: "recent frame" },
  { icon: Layers, name: "Depth", sub: "orderbook" },
  { icon: Waves, name: "Multi", sub: "dual stream" },
];

const segmentsGroup = document.getElementById("segments");
const indicator = document.getElementById("indicator");
const indicatorGroup = document.getElementById("indicatorGroup");
const centerLabel = document.getElementById("centerLabel");
const centerSub = document.getElementById("centerSub");

const CX = 220;
const CY = 220;
const R_OUTER = 200;
const R_INNER = 92;
const SEG_COUNT = 6;
const GAP_DEG = 2;
const SEG_DEG = 360 / SEG_COUNT;

function polar(cx, cy, r, angDeg) {
  const a = ((angDeg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

function annularSector(cx, cy, rOuter, rInner, startDeg, endDeg) {
  const [x1, y1] = polar(cx, cy, rOuter, startDeg);
  const [x2, y2] = polar(cx, cy, rOuter, endDeg);
  const [x3, y3] = polar(cx, cy, rInner, endDeg);
  const [x4, y4] = polar(cx, cy, rInner, startDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${large} 0 ${x4} ${y4} Z`;
}

function arcPath(cx, cy, r, startDeg, endDeg) {
  const [x1, y1] = polar(cx, cy, r, startDeg);
  const [x2, y2] = polar(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

for (let i = 0; i < SEG_COUNT; i++) {
  const start = i * SEG_DEG + GAP_DEG / 2;
  const end = (i + 1) * SEG_DEG - GAP_DEG / 2;

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("class", "segment");
  path.setAttribute("d", annularSector(CX, CY, R_OUTER, R_INNER, start, end));
  path.dataset.index = String(i);
  segmentsGroup.appendChild(path);

  const midDeg = (start + end) / 2;
  const rIcon = (R_OUTER + R_INNER) / 2;
  const [ix, iy] = polar(CX, CY, rIcon, midDeg);
  const variant = VARIANTS[i + 1];

  const fo = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
  fo.setAttribute("x", String(ix - 14));
  fo.setAttribute("y", String(iy - 14));
  fo.setAttribute("width", "28");
  fo.setAttribute("height", "28");
  fo.setAttribute("class", "segment-icon-wrap");
  fo.style.pointerEvents = "none";
  fo.innerHTML = iconToSvg(variant.icon, { size: 22, stroke: "rgba(230, 235, 237, 0.78)" });
  segmentsGroup.appendChild(fo);

  path.addEventListener("mouseenter", () => activate(i + 1));
  path.addEventListener("click", () => activate(i + 1));
}

function activate(variantIdx) {
  currentVariant = variantIdx - 1;
  const v = VARIANTS[variantIdx];

  segmentsGroup.querySelectorAll(".segment").forEach((el) => {
    el.classList.toggle("active", Number(el.dataset.index) === variantIdx - 1);
  });

  const i = variantIdx - 1;
  const start = i * SEG_DEG + GAP_DEG / 2;
  const end = (i + 1) * SEG_DEG - GAP_DEG / 2;
  indicator.setAttribute("d", arcPath(CX, CY, R_OUTER + 8, start, end));
  indicator.style.opacity = "1";

  centerLabel.textContent = v.name;
  centerSub.textContent = v.sub;
}

segmentsGroup.addEventListener("mouseleave", () => {
  segmentsGroup.querySelectorAll(".segment").forEach((el) => el.classList.remove("active"));
  indicator.style.opacity = "0";
  centerLabel.textContent = VARIANTS[0].label;
  centerSub.textContent = VARIANTS[0].sub;
});

activate(1);
