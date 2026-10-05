// PWA icons generate karta hai -- plain Node, koi dependency nahi (zlib built-in).
// Kyun script? PWA manifest ko PNG chahiye (SVG nahi chalta), aur brand colour
// ya logo badalna ho to sirf yahan edit karke `node scripts/generate-icons.js`
// chalana hai.
//
// Output: public/icons/*.png  +  app/apple-icon.png

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

// ---- brand colours (globals.css ke --accent-* se match) ----
const BG_FROM = [0x1c, 0x18, 0x12]; // --accent-1
const BG_TO = [0x6b, 0x64, 0x55]; // --accent-2
const INK = [0xfa, 0xf7, 0xf0]; // --paper

/* ------------------------------------------------------------------ *
 * Minimal PNG encoder (RGBA, 8-bit, no interlacing)
 * ------------------------------------------------------------------ */
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePng(size, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type: RGBA
  // Har scanline ke aage filter byte 0 (None).
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* ------------------------------------------------------------------ *
 * Shape helpers -- signed distance fields (negative = inside)
 * ------------------------------------------------------------------ */
function sdRoundBox(px, py, halfW, halfH, r) {
  const qx = Math.abs(px) - (halfW - r);
  const qy = Math.abs(py) - (halfH - r);
  return Math.min(Math.max(qx, qy), 0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - r;
}

function sdSegment(px, py, ax, ay, bx, by) {
  const pax = px - ax;
  const pay = py - ay;
  const bax = bx - ax;
  const bay = by - ay;
  const h = Math.min(1, Math.max(0, (pax * bax + pay * bay) / (bax * bax + bay * bay)));
  return Math.hypot(pax - bax * h, pay - bay * h);
}

// "M" ka polyline: left foot -> left top -> middle dip -> right top -> right foot
function sdM(px, py, scale) {
  const hw = 0.2 * scale;
  const hh = 0.22 * scale;
  const pts = [
    [-hw, hh],
    [-hw, -hh],
    [0, 0.06 * scale],
    [hw, -hh],
    [hw, hh],
  ];
  let d = Infinity;
  for (let i = 0; i < pts.length - 1; i++) {
    d = Math.min(d, sdSegment(px, py, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]));
  }
  return d - 0.043 * scale; // stroke ki half-width
}

/* ------------------------------------------------------------------ *
 * Icon renderer
 * ------------------------------------------------------------------ */
// rounded=false -> full-bleed square (maskable + iOS dono apna mask lagate hai)
// scale        -> logo kitna bada (maskable me chhota, safe zone ke andar)
function render(size, { rounded, scale }) {
  const rgba = Buffer.alloc(size * size * 4);
  const SS = 3; // 3x3 supersampling -> smooth edges
  const radius = 0.22;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;

      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          // Normalised coords, centre origin, -0.5 .. 0.5
          const px = (x + (sx + 0.5) / SS) / size - 0.5;
          const py = (y + (sy + 0.5) / SS) / size - 0.5;

          const inBox = rounded ? sdRoundBox(px, py, 0.5, 0.5, radius) < 0 : true;
          if (!inBox) continue;

          // 135deg gradient (top-left dark -> bottom-right lighter)
          const t = Math.min(1, Math.max(0, (px + py + 1) / 2));
          let cr = BG_FROM[0] + (BG_TO[0] - BG_FROM[0]) * t;
          let cg = BG_FROM[1] + (BG_TO[1] - BG_FROM[1]) * t;
          let cb = BG_FROM[2] + (BG_TO[2] - BG_FROM[2]) * t;

          if (sdM(px, py, scale) < 0) {
            cr = INK[0];
            cg = INK[1];
            cb = INK[2];
          }

          r += cr;
          g += cg;
          b += cb;
          a += 255;
        }
      }

      const n = SS * SS;
      const covered = a / n;
      const i = (y * size + x) * 4;
      // Sirf covered samples ka average -- transparent edge par black
      // fringe na aaye (warna rounded corners ke aas-paas hala dikhta hai).
      if (covered > 0) {
        const w = a / 255;
        rgba[i] = Math.round(r / w);
        rgba[i + 1] = Math.round(g / w);
        rgba[i + 2] = Math.round(b / w);
        rgba[i + 3] = Math.round(covered);
      }
    }
  }
  return encodePng(size, rgba);
}

/* ------------------------------------------------------------------ */
const root = path.join(__dirname, "..");
const iconDir = path.join(root, "public", "icons");
fs.mkdirSync(iconDir, { recursive: true });

const jobs = [
  // Chrome/Android "any purpose" -- rounded, transparent corners
  ["public/icons/icon-192.png", 192, { rounded: true, scale: 1 }],
  ["public/icons/icon-512.png", 512, { rounded: true, scale: 1 }],
  // Maskable -- full bleed + chhota logo (Android apna shape kaat-ta hai,
  // isliye logo safe zone ke andar hona zaroori hai)
  ["public/icons/icon-maskable-192.png", 192, { rounded: false, scale: 0.62 }],
  ["public/icons/icon-maskable-512.png", 512, { rounded: false, scale: 0.62 }],
  // iOS home screen -- full bleed, apni rounding khud lagati hai
  ["app/apple-icon.png", 180, { rounded: false, scale: 0.8 }],
  // Favicon fallback (SVG ke saath backup)
  ["public/icons/favicon-32.png", 32, { rounded: true, scale: 1 }],
];

for (const [rel, size, opts] of jobs) {
  fs.writeFileSync(path.join(root, rel), render(size, opts));
  console.log("wrote", rel, "(" + size + "px)");
}

console.log("Done. Icons dobara banane ke liye: node scripts/generate-icons.js");
