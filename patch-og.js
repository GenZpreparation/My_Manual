// Ye sirf WINDOWS pe chalta hai. Vercel (Linux) aur Docker (Linux alpine)
// par @vercel/og ka original path resolution sahi kaam karta hai, isliye
// wahan ye patch na chle -- nahi chlaya jaata.
//
// Kyun zaroori hai Windows pe: @vercel/og bundled `join(import.meta.url,
// "../noto-sans-....ttf")` use karta hai jo Windows par bundled font/wasm
// files resolve nahi kar pata, aur build par "Could not load font/wasm"
// error aata hai. Ye un paths ko `new URL("./file", import.meta.url)`
// me convert kar deta hai jo har platform par chalta hai.
if (process.platform !== "win32") {
  console.log("patch-og: skipped (not Windows)");
  process.exit(0);
}

const fs = require("fs");
const path = require("path");

const target = path.join(__dirname, "node_modules", "next", "dist", "compiled", "@vercel", "og", "index.node.js");

try {
  if (!fs.existsSync(target)) {
    console.log("patch-og: target not found, nothing to do:", target);
    process.exit(0);
  }
  let content = fs.readFileSync(target, "utf8");
  const replacements = [
    ['join(import.meta.url, "../noto-sans-v27-latin-regular.ttf")', 'new URL("./noto-sans-v27-latin-regular.ttf", import.meta.url)'],
    ['join(import.meta.url, "../yoga.wasm")', 'new URL("./yoga.wasm", import.meta.url)'],
    ['join(import.meta.url, "../resvg.wasm")', 'new URL("./resvg.wasm", import.meta.url)'],
  ];
  let applied = 0;
  for (const [from, to] of replacements) {
    if (content.includes(from)) {
      content = content.replace(from, to);
      applied++;
    }
  }
  fs.writeFileSync(target, content, "utf8");
  console.log(`patch-og: patched ${applied}/${replacements.length} paths in index.node.js`);
} catch (err) {
  // Build ko fail mat karo -- OG image ek bonus feature hai, critical nahi.
  console.warn("patch-og: skipped (non-fatal):", err.message);
}
