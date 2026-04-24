import { Home, Search, Heart, ShoppingCart, History, Store } from "lucide";

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

function el(tag, className, text) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text != null) n.textContent = text;
  return n;
}

// ---------- Mock shop data ----------

const ORDERS = [
  { name: "Heritage Leather Satchel", store: "Northmere Goods", price: 214, status: "Delivered" },
  { name: "Enamel Pour-Over Kettle", store: "Kinfolk Supply", price: 88, status: "Shipped" },
  { name: "Merino Crew Sock (3-pack)", store: "Basin & Range", price: 34, status: "Delivered" },
  { name: "Walnut Stacking Stool", store: "Mori Workshop", price: 320, status: "Processing" },
];

const STORES = [
  { name: "Northmere Goods", tag: "Leather & canvas" },
  { name: "Kinfolk Supply", tag: "Kitchen & coffee" },
  { name: "Basin & Range", tag: "Outdoor basics" },
  { name: "Mori Workshop", tag: "Furniture studio" },
  { name: "Studio Vale", tag: "Ceramics" },
  { name: "Archive Press", tag: "Stationery" },
];

const CART = [
  { name: "Brass Candle Snuffer", store: "Studio Vale", price: 28, qty: 1 },
  { name: "Olive Linen Apron", store: "Kinfolk Supply", price: 72, qty: 2 },
  { name: "Letterpress Notebook", store: "Archive Press", price: 18, qty: 1 },
];

const FAVOURITES = [
  { name: "Ash Cutting Board", price: 64 },
  { name: 'Cast Iron Skillet 10"', price: 95 },
  { name: "Wool Felt Slippers", price: 58 },
  { name: "Rattan Pendant Shade", price: 140 },
  { name: "Clay Planter (Terra)", price: 38 },
  { name: "Glass Carafe", price: 48 },
];

const EXPLORE = [
  { name: "Home & Kitchen", count: 1240 },
  { name: "Apparel", count: 982 },
  { name: "Stationery", count: 346 },
  { name: "Outdoor", count: 511 },
  { name: "Ceramics", count: 208 },
  { name: "Vintage", count: 172 },
];

const HOME_CHIPS = [
  "A warm oversized wool coat",
  "Mid-century desk lamp",
  "Linen bedsheets in sage",
  "Gift for a foodie",
];

// ---------- Section renderers ----------

function renderHome(body) {
  const wrap = el("div", "home-wrap");
  wrap.appendChild(el("div", "home-prompt", "What are you looking for?"));

  const inputRow = el("div", "home-input-row");
  const input = el("input", "home-input");
  input.type = "text";
  input.placeholder = "Describe it in your own words…";
  inputRow.appendChild(input);
  wrap.appendChild(inputRow);

  const chips = el("div", "home-chips");
  HOME_CHIPS.forEach((text) => {
    const c = el("button", "home-chip", text);
    c.type = "button";
    c.addEventListener("click", () => {
      input.value = text;
      input.focus();
    });
    chips.appendChild(c);
  });
  wrap.appendChild(chips);
  body.appendChild(wrap);

  setTimeout(() => input.focus(), 40);
}

function renderExplore(body) {
  const search = el("div", "explore-search");
  const iconWrap = el("span", "explore-search-icon");
  iconWrap.innerHTML = iconToSvg(Search, { size: 15, stroke: "rgba(235,240,242,0.5)" });
  search.appendChild(iconWrap);
  const input = el("input");
  input.type = "text";
  input.placeholder = "Search stores, items, creators…";
  search.appendChild(input);
  body.appendChild(search);

  const grid = el("div", "explore-grid");
  EXPLORE.forEach((c) => {
    const tile = el("button", "explore-tile");
    tile.type = "button";
    tile.appendChild(el("span", "explore-tile-name", c.name));
    tile.appendChild(el("span", "explore-tile-count", `${c.count.toLocaleString()} items`));
    grid.appendChild(tile);
  });
  body.appendChild(grid);
}

function renderHistory(body) {
  const list = el("div", "row-list");
  ORDERS.forEach((o) => {
    const row = el("div", "row-item");
    const left = el("div", "row-left");
    left.appendChild(el("div", "row-name", o.name));
    left.appendChild(el("div", "row-meta", o.store));
    const right = el("div", "row-right");
    right.appendChild(el("div", "row-price", `$${o.price}`));
    right.appendChild(el("div", `row-status status-${o.status.toLowerCase()}`, o.status));
    row.appendChild(left);
    row.appendChild(right);
    list.appendChild(row);
  });
  body.appendChild(list);
}

function renderFollowing(body) {
  const grid = el("div", "stores-grid");
  STORES.forEach((s) => {
    const tile = el("div", "store-tile");
    const initials = s.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    tile.appendChild(el("div", "store-monogram", initials));
    const info = el("div", "store-info");
    info.appendChild(el("div", "store-name", s.name));
    info.appendChild(el("div", "store-tag", s.tag));
    tile.appendChild(info);
    grid.appendChild(tile);
  });
  body.appendChild(grid);
}

function renderCart(body) {
  const list = el("div", "row-list");
  let subtotal = 0;
  CART.forEach((item) => {
    subtotal += item.price * item.qty;
    const row = el("div", "row-item");
    const left = el("div", "row-left");
    left.appendChild(el("div", "row-name", item.name));
    left.appendChild(el("div", "row-meta", `${item.store} · qty ${item.qty}`));
    const right = el("div", "row-right");
    right.appendChild(el("div", "row-price", `$${item.price * item.qty}`));
    row.appendChild(left);
    row.appendChild(right);
    list.appendChild(row);
  });
  body.appendChild(list);

  const footer = el("div", "cart-footer");
  footer.appendChild(el("span", "cart-total-label", "Subtotal"));
  footer.appendChild(el("span", "cart-total-value", `$${subtotal}`));
  body.appendChild(footer);
}

function renderFavourites(body) {
  const grid = el("div", "fav-grid");
  FAVOURITES.forEach((f) => {
    const tile = el("div", "fav-tile");
    tile.appendChild(el("div", "fav-thumb"));
    const info = el("div", "fav-info");
    info.appendChild(el("div", "fav-name", f.name));
    info.appendChild(el("div", "fav-price", `$${f.price}`));
    tile.appendChild(info);
    grid.appendChild(tile);
  });
  body.appendChild(grid);
}

// ---------- Variants (clockwise from 12 o'clock) ----------

const VARIANTS = [
  { icon: Home, name: "Home", sub: "describe what you want", render: renderHome, counter: null },
  { icon: Search, name: "Explore", sub: "discover items", render: renderExplore, counter: null },
  { icon: Heart, name: "Favourites", sub: "saved for later", render: renderFavourites, counter: FAVOURITES.length },
  { icon: ShoppingCart, name: "Cart", sub: "ready to buy", render: renderCart, counter: CART.reduce((a, c) => a + c.qty, 0) },
  { icon: History, name: "History", sub: "past orders", render: renderHistory, counter: ORDERS.length },
  { icon: Store, name: "Following", sub: "stores you follow", render: renderFollowing, counter: STORES.length },
];

// ---------- Panel shell ----------

const panel = document.querySelector(".viz-panel");
const mount = document.getElementById("vizMount");
mount.classList.add("viz-host");
mount.innerHTML = "";

const headerWrap = el("div", "viz-header");
const headerTitle = el("span", "viz-title", "");
const headerValue = el("span", "viz-value", "");
headerWrap.appendChild(headerTitle);
headerWrap.appendChild(headerValue);
const bodyWrap = el("div", "viz-body");
mount.appendChild(headerWrap);
mount.appendChild(bodyWrap);

// Animate panel bounds to fit measured content (two-div pattern)
const panelCS = getComputedStyle(panel);
const verticalPadding =
  parseFloat(panelCS.paddingTop) + parseFloat(panelCS.paddingBottom);
const horizontalPadding =
  parseFloat(panelCS.paddingLeft) + parseFloat(panelCS.paddingRight);

let boundsInitialized = false;
function updateBounds() {
  const r = mount.getBoundingClientRect();
  const w = r.width + horizontalPadding;
  const h = r.height + verticalPadding;
  if (!boundsInitialized) {
    panel.style.transition = "none";
    panel.style.width = `${w}px`;
    panel.style.height = `${h}px`;
    requestAnimationFrame(() => {
      panel.style.transition = "";
      boundsInitialized = true;
    });
  } else {
    panel.style.width = `${w}px`;
    panel.style.height = `${h}px`;
  }
}

const boundsObserver = new ResizeObserver(() => updateBounds());
boundsObserver.observe(mount);

let currentVariant = -1;

function showVariant(i) {
  if (i === currentVariant) return;
  currentVariant = i;
  const v = VARIANTS[i];
  headerTitle.textContent = v.name;
  headerValue.textContent = v.counter != null ? `${v.counter}` : "";
  bodyWrap.innerHTML = "";
  v.render(bodyWrap);
  updateBounds();
}

// ---------- Radial control ----------

const segmentsGroup = document.getElementById("segments");
const indicator = document.getElementById("indicator");
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

function annularSector(cx, cy, rO, rI, s, e) {
  const [x1, y1] = polar(cx, cy, rO, s);
  const [x2, y2] = polar(cx, cy, rO, e);
  const [x3, y3] = polar(cx, cy, rI, e);
  const [x4, y4] = polar(cx, cy, rI, s);
  const large = e - s > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${rO} ${rO} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${rI} ${rI} 0 ${large} 0 ${x4} ${y4} Z`;
}

function arcPath(cx, cy, r, s, e) {
  const [x1, y1] = polar(cx, cy, r, s);
  const [x2, y2] = polar(cx, cy, r, e);
  const large = e - s > 180 ? 1 : 0;
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
  const v = VARIANTS[i];

  const fo = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
  fo.setAttribute("x", String(ix - 14));
  fo.setAttribute("y", String(iy - 14));
  fo.setAttribute("width", "28");
  fo.setAttribute("height", "28");
  fo.style.pointerEvents = "none";
  fo.innerHTML = iconToSvg(v.icon, { size: 22, stroke: "rgba(230, 235, 237, 0.78)" });
  segmentsGroup.appendChild(fo);

  path.addEventListener("mouseenter", () => activate(i));
  path.addEventListener("click", () => activate(i));
}

function activate(i) {
  const v = VARIANTS[i];
  segmentsGroup.querySelectorAll(".segment").forEach((s) => {
    s.classList.toggle("active", Number(s.dataset.index) === i);
  });
  const start = i * SEG_DEG + GAP_DEG / 2;
  const end = (i + 1) * SEG_DEG - GAP_DEG / 2;
  indicator.setAttribute("d", arcPath(CX, CY, R_OUTER + 8, start, end));
  indicator.style.opacity = "1";
  centerLabel.textContent = v.name;
  centerSub.textContent = v.sub;
  showVariant(i);
}

activate(0);
