import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";

function Root() {
  const path = window.location.pathname;

  if (path === "/test") {
    return <App popupDelayMs={2500} isTestPage={true} />;
  }

  return <App />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
