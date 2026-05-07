import React, { useEffect, useRef, useState } from "react";

// Katakana Unicode block
const KATAKANA = Array.from({length: 96}, (_, i) => String.fromCharCode(0x30A0 + i));
const FONT_SIZE = 14;
const COLUMN_SPACING = FONT_SIZE * 0.9;

const KATAKANA_RAIN_SPEED = 70; // ms per frame (slower)
const KATAKANA_TRAIL_FADE = 0.18;
const KATAKANA_COLOR = "#7fff00";

const PHRASE_ROW_SPACING = 1.0; // slower fall per frame
const PHRASE_RAIN_SPEED = 160; // slower frame rate
const PHRASE_TRAIL_FADE = 0.18;
const PHRASE_COLOR = "#00ffe7";

function getKerningOffsets(ctx, message) {
  let offsets = [];
  let x = 0;
  for (let i = 0; i < message.length; i++) {
    offsets.push(x);
    x += ctx.measureText(message[i]).width;
  }
  return offsets;
}

function usePhrases() {
  const [phrases, setPhrases] = useState(["your eyes are not deceiving you"]);
  useEffect(() => {
    fetch("/phrases.txt")
      .then(r => r.text())
      .then(text => {
        setPhrases(text.split("\n").filter(Boolean));
      });
  }, []);
  return phrases;
}

export default function MatrixAndKatakanaRain({ easterEgg }) {
  const canvasRef = useRef(null);
  const phrases = usePhrases();
  const [messageIdx, setMessageIdx] = useState(() => Math.floor(Math.random() * 1000000));
  const phraseState = useRef({});
  const katakanaState = useRef({});
  const [marqueeActive, setMarqueeActive] = useState(false);

  useEffect(() => {
    if (!easterEgg) return;
    setMarqueeActive(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.font = `${FONT_SIZE}px 'Share Tech Mono', monospace`;
    ctx.textBaseline = "top";

    // Fill screen with grid of 'follow the white rabbit, neo'
    const phrase = "  follow the white rabbit, neo  ";
    const textWidth = Math.max(1, ctx.measureText(phrase).width);
    const startX = -Math.floor(textWidth * 0.5);
    const cols = Math.ceil((window.innerWidth - startX) / textWidth) + 1;
    const rows = Math.floor(window.innerHeight / FONT_SIZE);
    // Animate a single bright head with a 5-instance trailing fade
    const total = rows * cols;
    const TAIL_LENGTH = 5;
    let headStep = 0;

    function drawMarquee(step) {
      ctx.fillStyle = "#0f111a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${FONT_SIZE}px 'Share Tech Mono', monospace`;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // Column-major order creates a vertical rain-like trail.
          const idx = c * rows + r;
          const distance = step - idx;
          let intensity = 0;

          if (distance === 0) {
            intensity = 1;
          } else if (distance > 0 && distance <= TAIL_LENGTH) {
            intensity = (TAIL_LENGTH + 1 - distance) / (TAIL_LENGTH + 1);
          }

          if (intensity > 0) {
            // Keep only the head at full brightness; trail fades quickly.
            ctx.fillStyle = `rgba(255, 242, 0, ${0.08 + intensity * 0.92})`;
            ctx.shadowColor = "#fff200";
            ctx.shadowBlur = 1 + intensity * 11;
          } else {
            ctx.fillStyle = "rgba(255, 242, 0, 0.03)";
            ctx.shadowBlur = 0;
          }
          ctx.fillText(phrase, startX + c * textWidth, r * FONT_SIZE);
        }
      }
      ctx.shadowBlur = 0;
    }

    function animate() {
      if (headStep <= total + TAIL_LENGTH) {
        drawMarquee(headStep);
        headStep++;
        requestAnimationFrame(animate);
      } else {
        // Hold for 1.5s, then clear and restore rain
        setTimeout(() => {
          setMarqueeActive(false);
        }, 1500);
      }
    }
    drawMarquee(headStep);
    requestAnimationFrame(animate);
    return () => setMarqueeActive(false);
  }, [easterEgg]);

  useEffect(() => {
    if (marqueeActive) return; // Pause rain during marquee
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.font = `${FONT_SIZE}px 'Share Tech Mono', monospace`;
      ctx.textBaseline = "top";

      // --- Katakana Rain State ---
      const katakanaCols = Math.floor(window.innerWidth / COLUMN_SPACING);
      if (!katakanaState.current.yPositions || katakanaState.current.yPositions.length !== katakanaCols) {
        katakanaState.current.yPositions = Array(katakanaCols).fill(0).map(() => Math.random() * window.innerHeight);
        katakanaState.current.speeds = Array(katakanaCols).fill(0).map(() => FONT_SIZE * (0.7 + Math.random() * 0.7));
      }

      // --- Phrase Rain State ---
      const MESSAGE = phrases[messageIdx % phrases.length];
      ctx.font = `${FONT_SIZE}px 'Share Tech Mono', monospace`;
      const kerning = getKerningOffsets(ctx, MESSAGE);
      const phraseCols = MESSAGE.length;
      const totalWidth = ctx.measureText(MESSAGE).width;
      // Ensure the phrase never hangs off the left or right edge
      const minX = 0;
      const maxX = window.innerWidth - totalWidth;
      // Initialization for phrase state will be handled inside draw()
      const maxY = window.innerHeight;

      function draw() {
        // Fade old trails for both effects
        ctx.fillStyle = `rgba(15,17,26,${Math.max(0.01, Math.min(Math.max(KATAKANA_TRAIL_FADE, PHRASE_TRAIL_FADE), 0.5))})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // --- Katakana Rain ---
        ctx.font = `${FONT_SIZE}px 'Share Tech Mono', monospace`;
        for (let i = 0; i < katakanaCols; i++) {
          ctx.fillStyle = KATAKANA_COLOR;
          ctx.globalAlpha = 1.0;
          const char = KATAKANA[Math.floor(Math.random() * KATAKANA.length)];
          ctx.fillText(char, i * COLUMN_SPACING, katakanaState.current.yPositions[i]);
          katakanaState.current.yPositions[i] += katakanaState.current.speeds[i];
          if (katakanaState.current.yPositions[i] > window.innerHeight + FONT_SIZE * 2) {
            katakanaState.current.yPositions[i] = -FONT_SIZE * (Math.random() * 10);
            katakanaState.current.speeds[i] = FONT_SIZE * (0.7 + Math.random() * 0.7);
          }
        }
        // --- Phrase Rain ---
        ctx.font = `${FONT_SIZE}px 'Share Tech Mono', monospace`;
        // Phrase state machine: 'active', 'pause'
        if (!phraseState.current.state) {
          phraseState.current.state = "active";
          phraseState.current.message = MESSAGE;
          phraseState.current.init = true;
          phraseState.current.startX = minX + Math.random() * Math.max(0, maxX - minX);
          phraseState.current.columnXs = kerning.map(x => x + phraseState.current.startX);
          // Assign each character randomly to one of 3 rows near the top
          const ROW_COUNT = 3;
          let rowYs = Array.from({length: ROW_COUNT}, (_, i) => -4 * FONT_SIZE + i * (1.5 * FONT_SIZE));
          phraseState.current.yPositions = [];
          for (let i = 0; i < phraseCols; i++) {
            let row = Math.floor(Math.random() * ROW_COUNT);
            phraseState.current.yPositions.push(rowYs[row]);
          }
          phraseState.current.waiting = false;
          phraseState.current.pauseTimer = null;
        }

        if (phraseState.current.state === "active") {
          let allOff = true;
          for (let i = 0; i < phraseCols; i++) {
            ctx.fillStyle = PHRASE_COLOR;
            ctx.globalAlpha = 0.7;
            ctx.fillText(MESSAGE[i], phraseState.current.columnXs[i], phraseState.current.yPositions[i]);
            ctx.globalAlpha = 1.0;
            phraseState.current.yPositions[i] += FONT_SIZE * PHRASE_ROW_SPACING;
            if (phraseState.current.yPositions[i] < maxY) allOff = false;
          }
          // If all letters are fully off screen at the bottom, start pause
          if (allOff && !phraseState.current.waiting) {
            phraseState.current.waiting = true;
            phraseState.current.state = "pause";
            // Start a pause (1.5s)
            phraseState.current.pauseTimer = setTimeout(() => {
              phraseState.current.state = null;
              setMessageIdx(idx => idx + 1);
            }, 1500);
          }
        }
        // During pause, do nothing (just katakana rain and fading)
        // Never clear the canvas fully, always fade
      }
      const interval = setInterval(draw, Math.min(KATAKANA_RAIN_SPEED, PHRASE_RAIN_SPEED));
      return () => clearInterval(interval);
    }, [phrases, messageIdx, marqueeActive]);

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
