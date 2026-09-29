import { createFile, DataStream, Endianness, MP4BoxBuffer } from "mp4box";

// Fetches an MP4, decodes every frame up front with WebCodecs and draws the
// frame matching the latest scroll progress onto a transferred OffscreenCanvas.

let ctx = null;
let frames = [];
let total = 0;
let progress = 0;
let drawn = -1;
let decoder = null;
let disposed = false;
const abort = new AbortController();

self.onmessage = ({ data }) => {
  if (data.type === "init") {
    ctx = data.canvas.getContext("2d");
    progress = data.progress;
    load(data.sources).catch((err) => {
      if (!disposed) self.postMessage({ type: "error", message: String(err?.message || err) });
    });
  } else if (data.type === "progress") {
    progress = data.value;
    draw();
  } else if (data.type === "dispose") {
    dispose();
  }
};

async function load(sources) {
  const source = await pickSupported(sources);
  if (!source) throw new Error("No supported codec");

  const res = await fetch(source.src, { signal: abort.signal });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${source.src}`);
  const { config, chunks } = demux(await res.arrayBuffer());
  if (disposed) return;

  total = chunks.length;
  decoder = new VideoDecoder({
    output: (frame) => {
      if (disposed) return frame.close();
      if (frames.length === 0) {
        ctx.canvas.width = frame.displayWidth;
        ctx.canvas.height = frame.displayHeight;
      }
      frames.push(frame);
      draw();
      if (frames.length === 1) self.postMessage({ type: "first" });
    },
    error: (err) => {
      if (!disposed) self.postMessage({ type: "error", message: err.message });
    },
  });

  // Held frames can starve a hardware decoder's output pool, so prefer software.
  const sw = { ...config, hardwareAcceleration: "prefer-software" };
  decoder.configure((await VideoDecoder.isConfigSupported(sw)).supported ? sw : config);
  for (const chunk of chunks) decoder.decode(chunk);
  await decoder.flush();
  decoder.close();
  decoder = null;
}

async function pickSupported(sources) {
  for (const s of sources) {
    try {
      if ((await VideoDecoder.isConfigSupported({ codec: s.codec })).supported) return s;
    } catch {
      // Unrecognised codec string: try the next source.
    }
  }
  return null;
}

function demux(buffer) {
  const file = createFile();
  let config = null;
  const chunks = [];
  let error = null;

  file.onError = (_, message) => (error = new Error(message));
  file.onReady = (info) => {
    const track = info.videoTracks[0];
    if (!track) return (error = new Error("No video track"));
    config = {
      codec: track.codec,
      codedWidth: track.video.width,
      codedHeight: track.video.height,
      description: codecDescription(file.getTrackById(track.id)),
    };
    file.setExtractionOptions(track.id, null, { nbSamples: Infinity });
    file.start();
  };
  file.onSamples = (_, __, samples) => {
    for (const s of samples) {
      chunks.push(
        new EncodedVideoChunk({
          type: s.is_sync ? "key" : "delta",
          timestamp: (s.cts * 1e6) / s.timescale,
          duration: (s.duration * 1e6) / s.timescale,
          data: s.data,
        }),
      );
    }
  };

  file.appendBuffer(MP4BoxBuffer.fromArrayBuffer(buffer, 0));
  file.flush();
  if (error) throw error;
  if (!config || !chunks.length) throw new Error("Could not demux video");
  return { config, chunks };
}

function codecDescription(trak) {
  for (const entry of trak.mdia.minf.stbl.stsd.entries) {
    const box = entry.avcC || entry.hvcC || entry.vpcC || entry.av1C;
    if (box) {
      const stream = new DataStream(undefined, 0, Endianness.BIG_ENDIAN);
      box.write(stream);
      return new Uint8Array(stream.buffer, 8); // strip the box header
    }
  }
  return undefined;
}

function draw() {
  if (!frames.length) return;
  const i = Math.min(Math.round(progress * (total - 1)), frames.length - 1);
  if (i === drawn) return;
  drawn = i;
  ctx.drawImage(frames[i], 0, 0, ctx.canvas.width, ctx.canvas.height);
}

function dispose() {
  disposed = true;
  abort.abort();
  try {
    decoder?.close();
  } catch {
    // Already closed.
  }
  for (const f of frames) f.close();
  frames = [];
  self.close();
}
