// Encodes a source video into the renditions ScrollClip expects:
//   public/clips/<slug>/av1-{1920,1280,768}.mp4   decoded up front via WebCodecs
//   public/clips/<slug>/h264-{1920,1280,768}.mp4  all-intra, for <video> seeking fallback
//   public/clips/<slug>/poster.webp
//
// Usage: npm run clip -- <input> <slug> [--start 2.5] [--duration 4] [--fps 30] [--crop auto|w:h:x:y]
// Needs ffmpeg on PATH (winget install Gyan.FFmpeg) or FFMPEG=<path to ffmpeg>.

import { spawnSync } from "node:child_process";
import { mkdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const WIDTHS = [1920, 1280, 768];
const MAX_RECOMMENDED_SECONDS = 6;

const ffmpeg = process.env.FFMPEG || "ffmpeg";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const args = process.argv.slice(2);
const positional = args.filter((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? undefined : args[i + 1];
};

const [input, slug] = positional;
if (!input || !slug || !/^[a-z0-9-]+$/.test(slug)) {
  console.error("Usage: npm run clip -- <input> <slug> [--start s] [--duration s] [--fps n] [--crop auto|w:h:x:y]");
  console.error("slug: lowercase letters, digits and dashes, e.g. max-slam");
  process.exit(1);
}

const fps = Number(flag("fps") ?? 30);
const trim = [
  ...(flag("start") ? ["-ss", flag("start")] : []),
  ...(flag("duration") ? ["-t", flag("duration")] : []),
];

const run = (argv) => {
  const r = spawnSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", ...argv], { stdio: "inherit" });
  if (r.error) {
    console.error(`Could not run ffmpeg (${ffmpeg}). Install it or set FFMPEG to its path.`);
    process.exit(1);
  }
  if (r.status !== 0) process.exit(r.status);
};

const encoders = spawnSync(ffmpeg, ["-hide_banner", "-encoders"], { encoding: "utf8" }).stdout || "";
const av1 = encoders.includes("libsvtav1")
  ? ["-c:v", "libsvtav1", "-preset", "6", "-crf", "34", "-g", "60"]
  : ["-c:v", "libaom-av1", "-cpu-used", "4", "-row-mt", "1", "-crf", "32", "-b:v", "0", "-g", "60"];

const outDir = join(root, "public", "clips", slug);
mkdirSync(outDir, { recursive: true });

const common = ["-an", "-sn", "-map_metadata", "-1", "-movflags", "+faststart"];
// Removes letterbox bars baked into the footage; they would show as hard edges on the page.
const detectCrop = () => {
  const out = spawnSync(ffmpeg, ["-hide_banner", ...trim, "-i", input, "-vf", "cropdetect=limit=24:round=2", "-f", "null", "-"], {
    encoding: "utf8",
  }).stderr;
  const counts = {};
  for (const [, c] of out.matchAll(/crop=(\d+:\d+:\d+:\d+)/g)) counts[c] = (counts[c] || 0) + 1;
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
};
const cropArg = flag("crop");
const crop = cropArg === "auto" ? detectCrop() : cropArg;
if (crop && !/^\d+:\d+:\d+:\d+$/.test(crop)) {
  console.error(`Invalid --crop "${crop}". Use auto or w:h:x:y, e.g. 1920:864:0:108`);
  process.exit(1);
}
if (crop) console.log(`crop ${crop}`);
const cropFilter = crop ? `crop=${crop},` : "";

const scale = (w) => `${cropFilter}fps=${fps},scale='min(${w},iw)':-2:flags=lanczos,format=yuv420p`;

for (const w of WIDTHS) {
  console.log(`av1  ${w}`);
  run([...trim, "-i", input, "-vf", scale(w), ...av1, ...common, join(outDir, `av1-${w}.mp4`)]);

  console.log(`h264 ${w}`);
  run([
    ...trim, "-i", input, "-vf", scale(w),
    "-c:v", "libx264", "-profile:v", "high", "-preset", "slow", "-crf", "23", "-g", "1", "-bf", "0",
    ...common, join(outDir, `h264-${w}.mp4`),
  ]);
}

console.log("poster");
run([...trim, "-i", input, "-frames:v", "1", "-vf", `${cropFilter}scale='min(1920,iw)':-2`, "-c:v", "libwebp", "-quality", "82", join(outDir, "poster.webp")]);

const probe = spawnSync(ffmpeg, ["-hide_banner", "-i", join(outDir, "av1-1280.mp4")], { encoding: "utf8" }).stderr;
const [, hh, mm, ss] = probe.match(/Duration: (\d+):(\d+):([\d.]+)/) || [];
const seconds = hh ? Number(hh) * 3600 + Number(mm) * 60 + Number(ss) : NaN;

console.log(`\nWrote public/clips/${slug}/`);
for (const f of [...WIDTHS.flatMap((w) => [`av1-${w}.mp4`, `h264-${w}.mp4`]), "poster.webp"]) {
  console.log(`  ${f.padEnd(15)} ${(statSync(join(outDir, f)).size / 1024 / 1024).toFixed(2)} MB`);
}
if (seconds > MAX_RECOMMENDED_SECONDS) {
  console.warn(`\nClip is ${seconds.toFixed(1)}s. Every frame is kept decoded in memory while on screen;`);
  console.warn(`keep clips under ${MAX_RECOMMENDED_SECONDS}s (use --start/--duration) to stay within budget.`);
}
console.log(`\nSet  clip: "${slug}"  on the project in src/constants/index.js`);
