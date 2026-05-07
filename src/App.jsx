import React, { useState, useEffect } from "react";
import "./App.css";
import MatrixAndKatakanaRain from "./MatrixAndKatakanaRain";

const socials = [
  {
    name: "Instagram",
    url: "https://instagram.com/wearewatchingyouclosely",
    icon: "fab fa-instagram"
  },
  {
    name: "Twitter",
    url: "https://x.com/_WAWYC_",
    icon: "fab fa-twitter"
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/channel/UCbVpO0A_-Rei9DOWCFpxO3Q",
    icon: "fab fa-youtube"
  },
  {
    name: "GitHub",
    url: "https://github.com/wearewatchingyouclosely",
    icon: "fab fa-github"
  }
];

export default function App() {
  // Contra code: up up down down left right left right b a
  const contraCode = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  const [input, setInput] = useState([]);
  const [easterEgg, setEasterEgg] = useState(false);

  useEffect(() => {
    function handleKeyDown(e) {
      setInput(prev => {
        const next = [...prev, e.key].slice(-contraCode.length);
        if (next.join() === contraCode.join()) {
          setEasterEgg(true);
          setTimeout(() => setEasterEgg(false), 5000); // Reset after 5s
        }
        return next;
      });
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="cyber-bg">
      <MatrixAndKatakanaRain easterEgg={easterEgg} />
      <div className="bio-card">
        <h1 className="glitch" data-text="WAWYC">WAWYC</h1>
        <p className="subtitle">wearewatchingyouclosely.net</p>
        <div className="socials">
          {socials.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label={s.name}
            >
              <i className={s.icon}></i>
            </a>
          ))}
        </div>
      </div>
      <div className="scanlines"></div>
    </div>
  );
}
