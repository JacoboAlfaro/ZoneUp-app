import { Uniwind } from "uniwind";

function cssColor(name: `--color-zu-${string}`): string {
  const value = Uniwind.getCSSVariable(name);
  return typeof value === "string" ? value : "";
}

export const color = {
  get navy() {
    return cssColor("--color-zu-navy");
  },
  get skyFade() {
    return cssColor("--color-zu-sky-fade");
  },
  get skyBottom() {
    return cssColor("--color-zu-sky-bottom");
  },
  get white() {
    return cssColor("--color-zu-white");
  },
  get border() {
    return cssColor("--color-zu-border");
  },
  get slate() {
    return cssColor("--color-zu-slate");
  },
  get red() {
    return cssColor("--color-zu-red");
  },
  get redText() {
    return cssColor("--color-zu-red-text");
  },
};

export function withAlpha(cssColorValue: string, opacity: number) {
  const hex = cssColorValue.trim();
  if (hex.startsWith("#")) {
    const n = hex.replace("#", "");
    const r = parseInt(n.slice(0, 2), 16);
    const g = parseInt(n.slice(2, 4), 16);
    const b = parseInt(n.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  const rgb = hex.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgb) {
    return `rgba(${rgb[1]}, ${rgb[2]}, ${rgb[3]}, ${opacity})`;
  }

  return cssColorValue;
}

export const glass = {
  get navy() {
    return withAlpha(color.navy, 0.88);
  },
  get sky() {
    return withAlpha(color.skyFade, 0.62);
  },
  get skySoft() {
    return withAlpha(color.skyFade, 0.42);
  },
  get skyStrong() {
    return withAlpha(color.skyFade, 0.78);
  },
  get white() {
    return withAlpha(color.white, 0.72);
  },
  /** Tarjeta sobre fondo desenfocado: deja ver más el color de atrás. */
  get whiteSoft() {
    return withAlpha(color.white, 0.48);
  },
  get border() {
    return withAlpha(color.border, 0.55);
  },
  get red() {
    return withAlpha(color.red, 0.6);
  },
};
