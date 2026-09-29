import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const WIDTHS = [768, 1280, 1920];
const CODECS = { av1: "av01.0.08M.08", h264: "avc1.640028" };

const clipUrl = (clip, file) => `${import.meta.env.BASE_URL}clips/${clip}/${file}`;

const pickWidth = () => {
  const needed = window.innerWidth * Math.min(window.devicePixelRatio || 1, 1.5);
  const width = WIDTHS.find((w) => w >= needed) ?? WIDTHS[WIDTHS.length - 1];
  // Every frame stays decoded while on screen, so cap resolution on low-memory devices.
  return (navigator.deviceMemory ?? 8) < 8 ? Math.min(width, 1280) : width;
};

// iOS/iPadOS tabs are killed quickly under memory pressure; seek a <video> there instead.
const isAppleMobile = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

const canDecode = () =>
  typeof VideoDecoder === "function" &&
  "transferControlToOffscreen" in HTMLCanvasElement.prototype &&
  !isAppleMobile();

const fill = "absolute inset-0 w-full h-full object-cover";

/**
 * Full-bleed video frame driven by `progress` (a 0–1 MotionValue).
 * Without `clip`, only `poster` is shown.
 */
const ScrollClip = ({ clip, poster, progress, alt = "" }) => {
  const rootRef = useRef(null);
  const videoRef = useRef(null);
  const near = useInView(rootRef, { margin: "100% 0px 100% 0px" });
  const reducedMotion = useReducedMotion();
  const [mode, setMode] = useState(() => (canDecode() ? "decoder" : "video"));
  const [showingFrame, setShowingFrame] = useState(false);
  const [width] = useState(pickWidth);

  const active = Boolean(clip) && near && !reducedMotion;

  useEffect(() => {
    if (!active || mode !== "decoder") return;

    // Created here rather than in JSX: a canvas can only be transferred once,
    // so each load session needs a fresh element.
    const canvas = document.createElement("canvas");
    canvas.className = fill;
    canvas.setAttribute("aria-hidden", "true");
    rootRef.current.appendChild(canvas);
    const offscreen = canvas.transferControlToOffscreen();

    const worker = new Worker(new URL("./clipDecoder.worker.js", import.meta.url), { type: "module" });
    worker.onmessage = ({ data }) => {
      if (data.type === "first") setShowingFrame(true);
      if (data.type === "error") {
        console.warn(`ScrollClip "${clip}": ${data.message}; falling back to <video>`);
        setMode("video");
      }
    };
    worker.onerror = () => setMode("video");
    worker.postMessage(
      {
        type: "init",
        canvas: offscreen,
        progress: progress.get(),
        sources: [
          { src: clipUrl(clip, `av1-${width}.mp4`), codec: CODECS.av1 },
          { src: clipUrl(clip, `h264-${width}.mp4`), codec: CODECS.h264 },
        ],
      },
      [offscreen],
    );
    const unsubscribe = progress.on("change", (value) => worker.postMessage({ type: "progress", value }));

    return () => {
      unsubscribe();
      worker.postMessage({ type: "dispose" });
      canvas.remove();
      setShowingFrame(false);
    };
  }, [active, mode, clip, width, progress]);

  useEffect(() => {
    if (!active || mode !== "video") return;

    const video = videoRef.current;
    const controller = new AbortController();
    let objectUrl;
    let raf = 0;

    const seek = () => {
      raf = 0;
      if (video.duration > 0) video.currentTime = progress.get() * video.duration;
    };
    const scheduleSeek = () => {
      if (!raf) raf = requestAnimationFrame(seek);
    };
    const onLoaded = () => {
      seek();
      setShowingFrame(true);
    };

    // Holding the whole file in memory makes every seek local instead of a range request.
    fetch(clipUrl(clip, `h264-${width}.mp4`), { signal: controller.signal })
      .then((res) => res.blob())
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        video.addEventListener("loadeddata", onLoaded, { once: true });
        video.src = objectUrl;
        video.load();
      })
      .catch(() => {});
    const unsubscribe = progress.on("change", scheduleSeek);

    return () => {
      controller.abort();
      unsubscribe();
      cancelAnimationFrame(raf);
      video.removeEventListener("loadeddata", onLoaded);
      video.removeAttribute("src");
      video.load();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setShowingFrame(false);
    };
  }, [active, mode, clip, width, progress]);

  return (
    <div ref={rootRef} className="absolute inset-0 overflow-hidden bg-black-100">
      {clip && mode === "video" && (
        <video ref={videoRef} muted playsInline preload="auto" aria-hidden="true" className={fill} />
      )}
      <img
        src={clip ? clipUrl(clip, "poster.webp") : poster}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`${fill} z-[1] transition-opacity duration-300 ${showingFrame ? "opacity-0" : "opacity-100"}`}
      />
    </div>
  );
};

export default ScrollClip;
