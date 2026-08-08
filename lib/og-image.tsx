import { ImageResponse } from "next/og";
import { ALL_GAMES, GameConfig } from "./games/config";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/**
 * Link-preview card. Deliberately plain: no network fonts or images, so it
 * renders identically everywhere and cannot fail at build time.
 */
export const renderOgImage = (game: GameConfig) =>
  new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 108, fontWeight: 700, letterSpacing: -2 }}>
          {game.name}
        </div>
        <div style={{ fontSize: 40, color: "#a1a1aa", marginTop: 16 }}>
          {game.tagline}
        </div>
        <div
          style={{
            display: "flex",
            gap: 20,
            marginTop: 56,
            fontSize: 52,
            color: "#fafafa",
          }}
        >
          {["+", "−", "×", "÷"].map((op) => (
            <div
              key={op}
              style={{
                width: 92,
                height: 92,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 18,
                background: "#1f1f23",
              }}
            >
              {op}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 30, color: "#71717a", marginTop: 56 }}>
          A new puzzle every day
        </div>
      </div>
    ),
    OG_SIZE
  );

/** Link-preview card for the homepage, which is a menu rather than one game. */
export const renderHomeOgImage = () =>
  new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 104, fontWeight: 700, letterSpacing: -2 }}>
          Make Ten
        </div>
        <div style={{ fontSize: 36, color: "#a1a1aa", marginTop: 12 }}>
          Three daily arithmetic puzzles
        </div>
        <div style={{ display: "flex", gap: 18, marginTop: 52 }}>
          {ALL_GAMES.map((game) => (
            <div
              key={game.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "22px 30px",
                borderRadius: 16,
                background: "#1f1f23",
                fontSize: 32,
              }}
            >
              {game.name}
            </div>
          ))}
        </div>
      </div>
    ),
    OG_SIZE
  );
