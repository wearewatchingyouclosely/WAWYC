import React, { useEffect, useRef } from "react";

import { useState } from "react";
// Utility to fetch phrases from a text file
function usePhrases() {
  const [phrases, setPhrases] = useState(["your eyes are not deceiving you"]);
  useEffect(() => {
    fetch("/src/phrases.txt")
      .then(r => r.text())
      .then(text => {
        setPhrases(text.split("\n").filter(Boolean));
      });
  }, []);
  return phrases;
}

// Matrix rain settings
const FONT_SIZE = 14; // px
const ROW_SPACING = 1.3; // multiplier for extra vertical space
const RAIN_SPEED = 125; // ms per frame (25% slower)
const TRAIL_FADE = 0.37; // opacity for ghosting (15% faster fade)

function getKerningOffsets(ctx, message, fontSize) {
  // Calculate x offsets for each letter based on kerning
  let offsets = [];
  let x = 0;
  for (let i = 0; i < message.length; i++) {
    offsets.push(x);
    x += ctx.measureText(message[i]).width;
  }
  return offsets;
}

export default function MatrixRain() {
  const canvasRef = useRef(null);
  const phrases = usePhrases();
  const [messageIdx, setMessageIdx] = useState(0);

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

    // Pick a random phrase
    const MESSAGE = phrases[messageIdx % phrases.length];
    // Calculate kerning offsets for message and randomize horizontal position
    const kerning = getKerningOffsets(ctx, MESSAGE, FONT_SIZE);
    const columns = MESSAGE.length;
    // Find total message width
    const totalWidth = ctx.measureText(MESSAGE).width;
    // Allow the phrase to hang off left or right edge
    const minX = -Math.floor(totalWidth * 0.5);
    const maxX = window.innerWidth - Math.ceil(totalWidth * 0.5);
    const startX = minX + Math.random() * (maxX - minX);
    const columnXs = kerning.map(x => x + startX);
    const maxY = window.innerHeight;

    // Assign each character randomly to one of 3 rows near the top
    const ROW_COUNT = 3;
    // Rows are spaced evenly from -4*FONT_SIZE to -1*FONT_SIZE
    let rowYs = Array.from({length: ROW_COUNT}, (_, i) => -4 * FONT_SIZE + i * (1.5 * FONT_SIZE));
    let yPositions = [];
    for (let i = 0; i < columns; i++) {
      let row = Math.floor(Math.random() * ROW_COUNT);
      yPositions.push(rowYs[row]);
    }

    function draw() {
      // Fade old trails
      ctx.fillStyle = `rgba(15,17,26,${TRAIL_FADE})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let allOff = true;
      for (let i = 0; i < columns; i++) {
        // Draw trail
        ctx.fillStyle = "#00ffe7";
        ctx.globalAlpha = 0.7;
        ctx.fillText(MESSAGE[i], columnXs[i], yPositions[i]);
        ctx.globalAlpha = 1.0;
        // Move down
        yPositions[i] += FONT_SIZE * ROW_SPACING;
        // Check if any are still on screen
        if (yPositions[i] < maxY) allOff = false;
      }
      // If all letters are fully off screen at the bottom, wait before picking a new phrase
      if (allOff) {
        if (!draw.waiting) {
          draw.waiting = true;
          setTimeout(() => {
            setMessageIdx(idx => idx + 1);
            draw.waiting = false;
          }, RAIN_SPEED * 36); // triple the previous triple time for a total of 9x
        }
      }
    }

    const interval = setInterval(draw, RAIN_SPEED);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [phrases, messageIdx]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none"
      }}
      width={window.innerWidth}
      height={window.innerHeight}
    />
  );
}
