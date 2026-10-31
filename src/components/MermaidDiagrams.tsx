"use client";

import { useEffect } from "react";

/** Theme tokens from globals.css, read at draw time so diagrams match whichever theme is active. */
function themeVariables() {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string) => css.getPropertyValue(name).trim();
  return {
    darkMode: document.documentElement.getAttribute("data-theme") !== "light",
    background: v("--bg"),
    fontFamily: getComputedStyle(document.body).fontFamily,
    fontSize: "15px",
    primaryColor: v("--bg-elev"),
    primaryBorderColor: v("--accent"),
    primaryTextColor: v("--fg-strong"),
    secondaryColor: v("--bg-sunken"),
    tertiaryColor: v("--bg-sunken"),
    lineColor: v("--muted"),
    textColor: v("--fg"),
    clusterBkg: v("--accent-soft"),
    clusterBorder: v("--control-border"),
    edgeLabelBackground: v("--bg"),
    noteBkgColor: v("--bg-sunken"),
    noteTextColor: v("--fg"),
    noteBorderColor: v("--control-border"),
    // The base theme draws a grey drop shadow under every node; on the dark background it reads as a glow
    dropShadow: "none",
  };
}

/**
 * Draws every `figure.mermaid-diagram` on the page (see rehypeMermaid). mermaid is loaded only on pages that have one,
 * and diagrams are redrawn when the theme toggle flips `data-theme`.
 */
export default function MermaidDiagrams() {
  useEffect(() => {
    let cancelled = false;
    let seq = 0;

    async function draw() {
      const figures = [...document.querySelectorAll<HTMLElement>("figure.mermaid-diagram")];
      if (!figures.length) return;
      const { default: mermaid } = await import("mermaid");
      mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: "base", look: "classic", themeVariables: themeVariables() });
      for (const figure of figures) {
        const source = figure.querySelector("pre.mermaid-source")?.textContent ?? "";
        try {
          const { svg } = await mermaid.render(`mermaid-${++seq}`, source);
          if (cancelled) return;
          let out = figure.querySelector<HTMLElement>(".mermaid-svg");
          if (!out) {
            out = document.createElement("div");
            out.className = "mermaid-svg";
            figure.append(out);
          }
          out.innerHTML = svg;
          figure.dataset.rendered = "";
        } catch (err) {
          // Leave the source visible so a typo shows up as code rather than a blank space
          console.warn("mermaid: diagram failed to render", err);
        }
      }
    }

    draw();
    const observer = new MutationObserver(() => draw());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  return null;
}
