import React from "react";
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
  return (
    <div className="cyber-bg">
      <MatrixAndKatakanaRain />
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
