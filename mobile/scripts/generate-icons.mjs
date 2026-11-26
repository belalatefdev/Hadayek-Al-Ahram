import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const logo = path.join(root, "assets", "brand-logo.svg");
const outputIcon = path.join(root, "assets", "icon.png");
const outputAdaptive = path.join(root, "assets", "adaptive-icon.png");
const logoPng = await sharp(logo).resize(760, 570, { fit: "contain" }).png().toBuffer();
const background = Buffer.from('<svg width="1024" height="1024"><rect width="1024" height="1024" fill="#102B4D"/></svg>');
await sharp(background).composite([{ input: logoPng, gravity: "center" }]).png().toFile(outputIcon);
await sharp({ create: { width: 1024, height: 1024, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: logoPng, gravity: "center" }]).png().toFile(outputAdaptive);
console.log("Generated Play Store-ready icon assets from brand-logo.svg.");
