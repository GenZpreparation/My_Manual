const fs = require("fs");
const path = require("path");

const target = path.join(__dirname, "node_modules", "next", "dist", "compiled", "@vercel", "og", "index.node.js");
if (fs.existsSync(target)) {
  let content = fs.readFileSync(target, "utf8");
  content = content.replace(
    'join(import.meta.url, "../noto-sans-v27-latin-regular.ttf")',
    'new URL("./noto-sans-v27-latin-regular.ttf", import.meta.url)'
  );
  content = content.replace(
    'join(import.meta.url, "../yoga.wasm")',
    'new URL("./yoga.wasm", import.meta.url)'
  );
  content = content.replace(
    'join(import.meta.url, "../resvg.wasm")',
    'new URL("./resvg.wasm", import.meta.url)'
  );
  fs.writeFileSync(target, content, "utf8");
  console.log("Patched index.node.js successfully!");
} else {
  console.log("Target not found:", target);
}
