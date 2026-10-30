// Cloudflare Pages 用に public/ へゲームを書き出す（wrangler は node_modules をアップロードしないので vendor/ に移す）
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "public");
const copy = (from, to = from.replace(/^node_modules\//, "vendor/")) =>
  fs.cpSync(path.join(ROOT, from), path.join(OUT, to), { recursive: true });

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT);

const html = fs
  .readFileSync(path.join(ROOT, "index.html"), "utf8")
  .replaceAll("./node_modules/", "./vendor/");
fs.writeFileSync(path.join(OUT, "index.html"), html);

copy("models");
copy("node_modules/@fontsource/dela-gothic-one/index.css");
copy("node_modules/@fontsource/dela-gothic-one/files");
copy("node_modules/@mediapipe/tasks-vision/vision_bundle.mjs");
copy("node_modules/@mediapipe/tasks-vision/wasm");

// 重いファイル（モデル・wasm・フォント）はブラウザに長めにキャッシュさせる
fs.writeFileSync(
  path.join(OUT, "_headers"),
  `/models/*
  Cache-Control: public, max-age=86400
/vendor/*
  Cache-Control: public, max-age=604800
/*
  Permissions-Policy: camera=(self), fullscreen=(self)
`,
);

console.log("public/ に書き出しました");
