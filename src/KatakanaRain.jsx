import React, { useEffect, useRef } from "react";

// Katakana Unicode block
const KATAKANA = Array.from({length: 96}, (_, i) => String.fromCharCode(0x30A0 + i));
const FONT_SIZE = 14; // match phrase rain
const COLUMN_SPACING = FONT_SIZE * 0.9;
const RAIN_SPEED = 50; // ms per frame
const TRAIL_FADE = 0.18; // faster fade for background
const COLOR = "#7fff00"; // bright green

export default function KatakanaRain() {
  const canvasRef = useRef(null);
  const yPositionsRef = useRef();
  const speedsRef = useRef();
  const columnsRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.font = `${FONT_SIZE}px 'Share Tech Mono', monospace`;
    ctx.textBaseline = "top";

    // Calculate columns
    const columns = Math.floor(window.innerWidth / COLUMN_SPACING);
    columnsRef.current = columns;
    if (!yPositionsRef.current || yPositionsRef.current.length !== columns) {
      yPositionsRef.current = Array(columns).fill(0).map(() => Math.random() * window.innerHeight);
    }
    if (!speedsRef.current || speedsRef.current.length !== columns) {
      speedsRef.current = Array(columns).fill(0).map(() => FONT_SIZE * (0.7 + Math.random() * 0.7));
    }

    function draw() {
      ctx.fillStyle = `rgba(15,17,26,${Math.max(0.01, Math.min(TRAIL_FADE, 0.5))})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < columnsRef.current; i++) {
        ctx.fillStyle = COLOR;
        ctx.globalAlpha = 1.0;
        const char = KATAKANA[Math.floor(Math.random() * KATAKANA.length)];
        ctx.fillText(char, i * COLUMN_SPACING, yPositionsRef.current[i]);
        ctx.globalAlpha = 1.0;
        yPositionsRef.current[i] += speedsRef.current[i];
        if (yPositionsRef.current[i] > window.innerHeight + FONT_SIZE * 2) {
          yPositionsRef.current[i] = -FONT_SIZE * (Math.random() * 10);
          speedsRef.current[i] = FONT_SIZE * (0.7 + Math.random() * 0.7);
        }
      }
    }
    const interval = setInterval(draw, RAIN_SPEED);
    return () => clearInterval(interval);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        pointerEvents: "none"
      }}
      width={window.innerWidth}
      height={window.innerHeight}
    />
  );
}
