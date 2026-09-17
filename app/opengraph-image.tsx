import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt =
  "Noot — Construímos o que o seu time precisa. Toda a execução em um time só.";

export const size = { width: 1200, height: 630 };

export const contentType = "image/png";

const assets = (file: string) => join(process.cwd(), "assets", file);

const [jakartaExtraBold, jakartaRegular] = await Promise.all([
  readFile(assets("PlusJakartaSans-ExtraBold.ttf")),
  readFile(assets("PlusJakartaSans-Regular.ttf")),
]);

/** The real wordmark, letter by letter — the slashed o is the whole point of
 *  it, and no font can stand in for that. */
const WORDMARK = [
  { file: "n-white.svg", w: 18, h: 19 },
  { file: "o-white.svg", w: 22, h: 19 },
  { file: "o-slash-white.svg", w: 22, h: 19 },
  { file: "t-white.svg", w: 14, h: 24 },
] as const;

const UNIT = 66 / 24;

const wordmark = await Promise.all(
  WORDMARK.map(async (letter) => {
    const svg = await readFile(
      join(process.cwd(), "public", "images", "noot", letter.file),
    );
    return {
      ...letter,
      src: `data:image/svg+xml;base64,${svg.toString("base64")}`,
    };
  }),
);

/**
 * The share card carries the hero's argument, not a screenshot of it: the
 * wordmark, the promise, and the one line that says what the promise costs
 * the reader. Everything is drawn here rather than loaded as an image so the
 * card stays crisp at whatever size a feed decides to render it.
 *
 * Satori (what ImageResponse runs on) only supports flexbox — no grid — and
 * every element with more than one child needs an explicit `display: flex`.
 */
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "84px 88px",
          background: "linear-gradient(118deg, #ED1A41 0%, #B81232 34%, #081125 78%)",
          fontFamily: "Jakarta",
          position: "relative",
        }}
      >
        {/* The bloom the hero and closing section carry. Satori bands a
            radial-gradient that fades to zero inside its own box, so this one
            runs edge to edge and fades across the full width instead. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "radial-gradient(ellipse 70% 95% at 18% 34%, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0.10) 38%, rgba(255,255,255,0) 72%)",
          }}
        />

        {/* the vertical rule motif from the closing panel */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(255,255,255,0) 0px, rgba(255,255,255,0) 47px, rgba(255,255,255,0.07) 47px, rgba(255,255,255,0.07) 48px)",
          }}
        />

        <div
          style={{ display: "flex", alignItems: "flex-end", gap: UNIT * 1.1 }}
        >
          {wordmark.map((letter) => (
            <img
              key={letter.file}
              src={letter.src}
              width={Math.round(UNIT * letter.w)}
              height={Math.round(UNIT * letter.h)}
              alt=""
            />
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 82,
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: "-0.035em",
              lineHeight: 1.04,
              maxWidth: 940,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex" }}>Construímos o que</div>
            <div style={{ display: "flex" }}>o seu time precisa</div>
          </div>

          <div
            style={{
              marginTop: 34,
              fontSize: 33,
              fontWeight: 400,
              color: "rgba(255,255,255,0.74)",
              letterSpacing: "-0.01em",
              maxWidth: 820,
              display: "flex",
            }}
          >
            Toda a execução em um time só.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.22)",
            paddingTop: 30,
          }}
        >
          <div
            style={{
              fontSize: 25,
              fontWeight: 400,
              color: "rgba(255,255,255,0.62)",
              display: "flex",
            }}
          >
            noot.com.br
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#081125",
              background: "#FFFFFF",
              padding: "16px 30px",
              borderRadius: 9999,
              letterSpacing: "-0.01em",
              display: "flex",
            }}
          >
            Fale com a gente
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Jakarta", data: jakartaExtraBold, weight: 800, style: "normal" },
        { name: "Jakarta", data: jakartaRegular, weight: 400, style: "normal" },
      ],
    },
  );
}
