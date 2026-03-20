import React, { useEffect, useMemo, useState } from "react";

const BRAND = {
  orange: "#f97316",
  page: "#ffffff",
  card: "#0f172a",
  cardAlt: "#111827",
  text: "#ffffff",
  textDark: "#0f172a",
  border: "rgba(15,23,42,0.14)",
  divider: "rgba(255,255,255,0.18)",
  muted: "rgba(15,23,42,0.68)",
  success: "#166534",
};

function makeLayout(config) {
  return {
    ...config,
    regionWidth: config.columnWidth * 4 + config.columnGap * 3,
  };
}

const SCREEN_LAYOUT = makeLayout({
  roundHeight: 620,
  columnWidth: 150,
  columnGap: 10,
  regionStackGap: 20,
  centerWidth: 460,
  ffCardWidth: 200,
  cardHeights: { r64: 68, r32: 60, s16: 60, e8: 60, ff: 82, chip: 98 },
  centerGap: 20,
  boardGap: 24,
  showThrone: true,
  showCenterLabel: true,
});

const PRINT_LAYOUT = makeLayout({
  roundHeight: 500,
  columnWidth: 120,
  columnGap: 8,
  regionStackGap: 14,
  centerWidth: 360,
  ffCardWidth: 160,
  cardHeights: { r64: 54, r32: 48, s16: 48, e8: 48, ff: 64, chip: 78 },
  centerGap: 12,
  boardGap: 16,
  showThrone: false,
  showCenterLabel: true,
});

const PRINT_PAGE = {
  width: 11 * 96,
  height: 8.5 * 96,
  margin: 12,
};
const PRINTABLE_WIDTH = PRINT_PAGE.width - PRINT_PAGE.margin * 2;
const PRINTABLE_HEIGHT = PRINT_PAGE.height - PRINT_PAGE.margin * 2;
const PRINT_BOARD_WIDTH =
  PRINT_LAYOUT.regionWidth * 2 + PRINT_LAYOUT.centerWidth + PRINT_LAYOUT.boardGap * 2;
const PRINT_BOARD_HEIGHT = PRINT_LAYOUT.roundHeight * 2 + PRINT_LAYOUT.regionStackGap + 56;
const PRINT_SCALE = Math.min(
  PRINTABLE_WIDTH / PRINT_BOARD_WIDTH,
  PRINTABLE_HEIGHT / PRINT_BOARD_HEIGHT
);

const ROUND_BANNER = [
  { label: "Sus 64", pts: "1 pt" },
  { label: "Troublesome 32", pts: "2 pts" },
  { label: "Sick 16", pts: "4 pts" },
  { label: "Illegal 8", pts: "8 pts" },
  { label: "Furious Four", pts: "16 pts" },
  { label: "No Kings Championship", pts: "32 pts" },
];

const REGION_DATA = [
  {
    name: "Democracy & Rule",
    teams: [
      "Election denial rhetoric",
      "DOJ pressure",
      "Executive power expansion",
      "Pardons for allies",
      "Targeting opponents",
      "Election control fights",
      "Schedule F",
      "Deep state purge",
      "Voting restrictions",
      "Media attacks",
      "PBS cuts",
      "Loyalty tests",
      "University pressure",
      "Conspiracy rhetoric",
      "DEI backlash",
      "Tech threats",
    ],
  },
  {
    name: "Economy & Taxes",
    teams: [
      "Tax cuts for billionaires",
      "Tariff taxes",
      "Trade wars",
      "Deficit expansion",
      "Corporate deregulation",
      "Fed pressure",
      "Market volatility",
      "Reshoring inflation",
      "Drug pricing",
      "Privatization",
      "SNAP cuts",
      "Medicaid cuts",
      "ACA weakening",
      "Rural hospitals",
      "Public health distrust",
      "Pandemic rollback",
    ],
  },
  {
    name: "Immigration & Border",
    teams: [
      "Mass deportations",
      "Family detention",
      "Military at border",
      "Asylum limits",
      "ICE expansion",
      "Sanctuary crackdowns",
      "Legal immigration cuts",
      "Backlog chaos",
      "Surveillance expansion",
      "Protest crackdowns",
      "Religious policy",
      "Book bans",
      "Criminal reform rollback",
      "Civil rights concerns",
      "Law enforcement posture",
      "Speech limits",
    ],
  },
  {
    name: "Chaos Abroad",
    teams: [
      "NATO weakening",
      "Ukraine uncertainty",
      "China tariffs",
      "Iran escalation",
      "Agreement withdrawal",
      "Authoritarian alignment",
      "Intel distrust",
      "Military politicization",
      "Climate withdrawal",
      "EPA rollbacks",
      "Public land drilling",
      "Pipeline fast track",
      "Renewable cuts",
      "Climate skepticism",
      "Treaty exits",
      "Global instability",
    ],
  },
];

const btnStyle = {
  background: BRAND.card,
  color: BRAND.text,
  border: `1px solid ${BRAND.border}`,
  padding: "10px 16px",
  borderRadius: 8,
  fontWeight: 700,
  cursor: "pointer",
};

function getCardHeight(layout, round) {
  return layout.cardHeights[round] || 60;
}

function evenCenters(count, roundHeight) {
  if (!count) return [];
  const spacing = roundHeight / count;
  return Array.from({ length: count }, (_, i) => spacing * i + spacing / 2);
}

function nextCenters(prev) {
  const out = [];
  for (let i = 0; i < prev.length; i += 2) out.push((prev[i] + prev[i + 1]) / 2);
  return out;
}

function buildInitialGames(teams) {
  const games = [];
  for (let i = 0; i < teams.length; i += 2) games.push([teams[i], teams[i + 1]]);
  return games;
}

function buildNextRound(prevWinners) {
  const games = [];
  for (let i = 0; i < prevWinners.length; i += 2) {
    games.push([prevWinners[i] || "TBD", prevWinners[i + 1] || "TBD"]);
  }
  return games;
}

function encodePicks(picks) {
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(picks))));
  } catch (e) {
    return "";
  }
}

function decodePicks(str) {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(str))));
  } catch (e) {
    return null;
  }
}

function BrokenCrown() {
  return (
    <svg width="68" height="46" viewBox="0 0 120 80" aria-hidden="true">
      <path d="M10 62 L28 20 L58 52 L90 18 L110 62 Z" fill={BRAND.orange} />
      <path d="M55 24 L64 74" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
      <path d="M24 62 H108" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function ThroneOrange() {
  return (
    <svg width="120" height="100" viewBox="0 0 200 180" aria-hidden="true">
      <rect x="30" y="80" width="140" height="60" rx="8" fill="#3f3f46" />
      <rect x="20" y="60" width="20" height="80" rx="6" fill="#27272a" />
      <rect x="160" y="60" width="20" height="80" rx="6" fill="#27272a" />
      <rect x="60" y="20" width="80" height="70" rx="10" fill="#52525b" />
      <path d="M70 45 L85 30 L100 45 L115 30 L130 45" stroke={BRAND.orange} strokeWidth="3" fill="none" />
      <circle cx="100" cy="85" r="22" fill="#f97316" />
      <circle cx="90" cy="78" r="5" fill="#3f3f46" />
      <circle cx="108" cy="92" r="6" fill="#3f3f46" />
      <circle cx="92" cy="82" r="2" fill="#000" />
      <circle cx="108" cy="82" r="2" fill="#000" />
      <path d="M92 94 Q100 100 108 94" stroke="#000" strokeWidth="2" fill="none" />
    </svg>
  );
}

function HeaderBranding({ compact }) {
  return (
    <div
      className="header-branding"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        marginBottom: compact ? 8 : 18,
        position: "relative",
        width: "100%",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: compact ? 0.025 : 0.04,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <svg width={compact ? 220 : 300} height={compact ? 220 : 300} viewBox="0 0 200 200" aria-hidden="true">
          <circle cx="100" cy="100" r="86" fill="none" stroke={BRAND.orange} strokeWidth="4" />
          <path d="M26 66 L58 126 L98 40 L138 126 L172 66" stroke={BRAND.orange} strokeWidth="6" fill="none" />
        </svg>
      </div>
      <div style={{ marginBottom: compact ? 2 : 4 }}>
        <BrokenCrown />
      </div>
      <h1 style={{ color: BRAND.orange, fontSize: compact ? 22 : 30, fontWeight: 900, margin: 0, letterSpacing: 2 }}>
        NO KINGS MADNESS
      </h1>
      <div className="subtitle" style={{ color: BRAND.muted, marginTop: 4, fontSize: compact ? 10 : 13 }}>
        Crown the chaos
      </div>
    </div>
  );
}

function TeamLine({ text, onClick, active, align, fontSize }) {
  return (
    <div
      onClick={text !== "TBD" ? onClick : undefined}
      style={{
        cursor: text !== "TBD" ? "pointer" : "default",
        fontSize,
        fontWeight: 700,
        lineHeight: 1.1,
        padding: "4px 6px",
        borderRadius: 5,
        background: active ? BRAND.orange : "transparent",
        color: active ? "#000000" : BRAND.text,
        textAlign: align || "left",
        minHeight: 22,
      }}
    >
      {text}
    </div>
  );
}

function GameCard(props) {
  const { gameId, teams, picks, setPick, highlight, align, round, layout } = props;
  const winner = picks[gameId];
  const minHeight = getCardHeight(layout, round);
  const fontSize = highlight ? (round === "chip" ? 12 : 11) : 10;

  return (
    <div
      style={{
        background: highlight ? BRAND.cardAlt : BRAND.card,
        borderRadius: 10,
        padding: 8,
        minHeight,
        display: "grid",
        gridTemplateRows: "1fr 1fr",
        gap: 2,
        border: `1px solid ${highlight ? BRAND.orange : BRAND.border}`,
        boxShadow: highlight ? "0 0 16px rgba(249,115,22,0.22)" : "none",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: BRAND.divider }} />
      <TeamLine text={teams[0]} active={winner === teams[0]} onClick={() => setPick(gameId, teams[0])} align={align} fontSize={fontSize} />
      <TeamLine text={teams[1]} active={winner === teams[1]} onClick={() => setPick(gameId, teams[1])} align={align} fontSize={fontSize} />
    </div>
  );
}

function RegionConnectors({ reverse, xPositions, rounds, layout }) {
  const connector = (fromCenters, toCenters, fromIndex, toIndex) => {
    const x1 = reverse ? xPositions[fromIndex] : xPositions[fromIndex] + layout.columnWidth;
    const x2 = reverse ? xPositions[toIndex] + layout.columnWidth : xPositions[toIndex];
    const midX = (x1 + x2) / 2;

    return toCenters.map((toY, i) => {
      const y1 = fromCenters[i * 2];
      const y2 = fromCenters[i * 2 + 1];
      return (
        <path
          key={`${fromIndex}-${toIndex}-${i}`}
          d={`M ${x1} ${y1} H ${midX} V ${y2} M ${midX} ${toY} H ${x2}`}
          stroke="rgba(15,23,42,0.22)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    });
  };

  return (
    <svg
      width={layout.regionWidth}
      height={layout.roundHeight}
      viewBox={`0 0 ${layout.regionWidth} ${layout.roundHeight}`}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      aria-hidden="true"
    >
      {connector(rounds.c64, rounds.c32, 0, 1)}
      {connector(rounds.c32, rounds.c16, 1, 2)}
      {connector(rounds.c16, rounds.c8, 2, 3)}
    </svg>
  );
}

function Column({ games, centers, picks, setPick, prefix, round, align, layout }) {
  return (
    <div style={{ width: layout.columnWidth, position: "relative", height: layout.roundHeight }}>
      {games.map((game, i) => {
        const h = getCardHeight(layout, round);
        return (
          <div key={`${prefix}-${round}-${i}`} style={{ position: "absolute", top: centers[i] - h / 2, width: "100%" }}>
            <GameCard
              gameId={`${prefix}-${round}-${i}`}
              teams={game}
              picks={picks}
              setPick={setPick}
              align={align}
              round={round}
              layout={layout}
            />
          </div>
        );
      })}
    </div>
  );
}

function Region({ region, reverse, picks, setPick, prefix, layout }) {
  const r64 = buildInitialGames(region.teams);
  const r32 = buildNextRound(r64.map((_, i) => picks[`${prefix}-r64-${i}`]));
  const s16 = buildNextRound(r32.map((_, i) => picks[`${prefix}-r32-${i}`]));
  const e8 = buildNextRound(s16.map((_, i) => picks[`${prefix}-s16-${i}`]));

  const c64 = evenCenters(8, layout.roundHeight);
  const c32 = nextCenters(c64);
  const c16 = nextCenters(c32);
  const c8 = nextCenters(c16);
  const xPositions = reverse
    ? [layout.columnWidth * 3 + layout.columnGap * 3, layout.columnWidth * 2 + layout.columnGap * 2, layout.columnWidth + layout.columnGap, 0]
    : [0, layout.columnWidth + layout.columnGap, layout.columnWidth * 2 + layout.columnGap * 2, layout.columnWidth * 3 + layout.columnGap * 3];
  const align = reverse ? "right" : "left";

  return (
    <div style={{ width: layout.regionWidth }}>
      <h3 style={{ color: BRAND.textDark, textAlign: align, marginBottom: 8, fontSize: layout === PRINT_LAYOUT ? 12 : 15 }}>
        {region.name}
      </h3>
      <div style={{ position: "relative", width: layout.regionWidth, height: layout.roundHeight }}>
        <RegionConnectors reverse={reverse} xPositions={xPositions} rounds={{ c64, c32, c16, c8 }} layout={layout} />
        <div style={{ position: "absolute", left: xPositions[0], top: 0 }}>
          <Column games={r64} centers={c64} picks={picks} setPick={setPick} prefix={prefix} round="r64" align={align} layout={layout} />
        </div>
        <div style={{ position: "absolute", left: xPositions[1], top: 0 }}>
          <Column games={r32} centers={c32} picks={picks} setPick={setPick} prefix={prefix} round="r32" align={align} layout={layout} />
        </div>
        <div style={{ position: "absolute", left: xPositions[2], top: 0 }}>
          <Column games={s16} centers={c16} picks={picks} setPick={setPick} prefix={prefix} round="s16" align={align} layout={layout} />
        </div>
        <div style={{ position: "absolute", left: xPositions[3], top: 0 }}>
          <Column games={e8} centers={c8} picks={picks} setPick={setPick} prefix={prefix} round="e8" align={align} layout={layout} />
        </div>
      </div>
    </div>
  );
}

function CenterBracket({ picks, setPick, semi, champ, layout, printMode }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: layout.centerGap,
        minHeight: layout.roundHeight * 2 + layout.regionStackGap,
        position: "relative",
      }}
    >
      {layout.showCenterLabel ? (
        <div style={{ color: BRAND.orange, fontWeight: 800, fontSize: printMode ? 11 : 13, letterSpacing: 1, textTransform: "uppercase" }}>
          Final Four
        </div>
      ) : null}

      <svg width={layout.centerWidth} height={printMode ? 88 : 120} viewBox={`0 0 ${layout.centerWidth} ${printMode ? 88 : 120}`} style={{ position: "absolute", top: printMode ? 48 : 54, pointerEvents: "none" }} aria-hidden="true">
        <path d={`M ${printMode ? 108 : 135} ${printMode ? 36 : 48} H ${printMode ? 150 : 195} V ${printMode ? 70 : 92} H ${printMode ? 180 : 225}`} stroke="rgba(15,23,42,0.24)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d={`M ${layout.centerWidth - (printMode ? 108 : 135)} ${printMode ? 36 : 48} H ${layout.centerWidth - (printMode ? 150 : 195)} V ${printMode ? 70 : 92} H ${layout.centerWidth - (printMode ? 180 : 225)}`} stroke="rgba(15,23,42,0.24)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: layout.centerGap, position: "relative", width: "100%" }}>
        <div style={{ width: layout.ffCardWidth }}>
          <GameCard gameId="FF-ff-0" teams={semi[0]} picks={picks} setPick={setPick} highlight round="ff" layout={layout} />
        </div>
        <div style={{ width: layout.ffCardWidth }}>
          <GameCard gameId="FF-ff-1" teams={semi[1]} picks={picks} setPick={setPick} highlight round="ff" layout={layout} />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: printMode ? 10 : 16,
          borderRadius: 16,
          border: `2px solid ${BRAND.orange}`,
          boxShadow: printMode ? "none" : "0 0 24px rgba(249,115,22,0.16)",
          background: printMode ? "rgba(249,115,22,0.03)" : "radial-gradient(circle, rgba(249,115,22,0.10), transparent 70%)",
          position: "relative",
          width: printMode ? 210 : 250,
        }}
      >
        <div style={{ color: BRAND.orange, fontWeight: 900, fontSize: printMode ? 11 : 14, marginBottom: printMode ? 4 : 6 }}>
          CHAMPIONSHIP
        </div>
        {layout.showThrone ? (
          <>
            <div style={{ position: "absolute", width: 150, height: 150, borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,0.16), transparent 70%)", top: 22, zIndex: 0, pointerEvents: "none" }} />
            <div style={{ marginBottom: 8, transform: "scale(1.02)", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.25))", position: "relative", zIndex: 1 }}>
              <ThroneOrange />
            </div>
          </>
        ) : null}
        <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
          <GameCard gameId="CH-chip-0" teams={champ[0]} picks={picks} setPick={setPick} highlight round="chip" layout={layout} />
        </div>
      </div>
    </div>
  );
}

function BracketBoard({ picks, setPick, layout, printMode }) {
  const semiWinners = [picks["A-e8-0"], picks["B-e8-0"], picks["C-e8-0"], picks["D-e8-0"]];
  const semi = [
    [semiWinners[0] || "TBD", semiWinners[1] || "TBD"],
    [semiWinners[2] || "TBD", semiWinners[3] || "TBD"],
  ];
  const finalWinners = [picks["FF-ff-0"], picks["FF-ff-1"]];
  const champ = [[finalWinners[0] || "TBD", finalWinners[1] || "TBD"]];
  const boardWidth = layout.regionWidth * 2 + layout.centerWidth + layout.boardGap * 2;

  return (
    <div style={{ width: boardWidth, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: `${layout.regionWidth}px ${layout.centerWidth}px ${layout.regionWidth}px`, gap: layout.boardGap, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: layout.regionStackGap }}>
          <Region region={REGION_DATA[0]} picks={picks} setPick={setPick} prefix="A" layout={layout} />
          <Region region={REGION_DATA[1]} picks={picks} setPick={setPick} prefix="B" layout={layout} />
        </div>

        <CenterBracket picks={picks} setPick={setPick} semi={semi} champ={champ} layout={layout} printMode={printMode} />

        <div style={{ display: "flex", flexDirection: "column", gap: layout.regionStackGap }}>
          <Region region={REGION_DATA[2]} reverse picks={picks} setPick={setPick} prefix="C" layout={layout} />
          <Region region={REGION_DATA[3]} reverse picks={picks} setPick={setPick} prefix="D" layout={layout} />
        </div>
      </div>
    </div>
  );
}

function ShareModal({ isOpen, text, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      className="share-modal-overlay"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "min(760px, 100%)",
          background: BRAND.cardAlt,
          color: BRAND.text,
          border: `1px solid ${BRAND.border}`,
          borderRadius: 16,
          padding: 20,
          boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: BRAND.orange }}>Share Bracket URL</div>
          <button onClick={onClose} style={btnStyle}>Close</button>
        </div>
        <div style={{ color: "rgba(255,255,255,0.7)", marginBottom: 12 }}>Copy the URL below to share this exact bracket state.</div>
        <textarea
          readOnly
          value={text}
          style={{
            width: "100%",
            minHeight: 160,
            background: "#ffffff",
            color: "#111827",
            border: `1px solid ${BRAND.border}`,
            borderRadius: 10,
            padding: 12,
            fontFamily: "monospace",
            fontSize: 12,
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />
      </div>
    </div>
  );
}

export default function App() {
  const [picks, setPicks] = useState(() => {
    if (typeof window === "undefined") return {};
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("p");
    if (fromUrl) {
      const decoded = decodePicks(fromUrl);
      if (decoded && typeof decoded === "object") return decoded;
    }
    try {
      const saved = localStorage.getItem("no-kings-picks");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  const [shareOpen, setShareOpen] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem("no-kings-picks", JSON.stringify(picks));
    } catch (e) {}

    if (typeof window !== "undefined") {
      const encoded = encodePicks(picks);
      const url = new URL(window.location.href);
      if (encoded) url.searchParams.set("p", encoded);
      else url.searchParams.delete("p");
      window.history.replaceState({}, "", url.toString());
    }
  }, [picks]);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const encoded = encodePicks(picks);
    const url = new URL(window.location.href);
    if (encoded) url.searchParams.set("p", encoded);
    return url.toString();
  }, [picks]);

  const setPick = (id, team) => {
    setPicks((prev) => {
      const updated = { ...prev, [id]: team };
      const prefix = id.split("-")[0];
      const rounds = ["r64", "r32", "s16", "e8", "ff", "chip"];
      const currentRound = id.split("-")[1];
      const idx = rounds.indexOf(currentRound);
      rounds.slice(idx + 1).forEach((r) => {
        Object.keys(updated).forEach((k) => {
          if (k.startsWith(prefix + "-" + r)) delete updated[k];
        });
      });
      return updated;
    });
  };

  const handleShare = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setStatus("Share URL copied.");
      } else {
        setShareOpen(true);
        setStatus("Share panel opened.");
      }
    } catch (e) {
      setShareOpen(true);
      setStatus("Share panel opened.");
    }
  };

  const handleReset = () => {
    setPicks({});
    setStatus("Bracket reset.");
  };

  const handlePrintPdf = () => {
    window.print();
    setStatus("Use 'Save as PDF' in the print dialog.");
  };

  return (
    <div style={{ background: BRAND.page, minHeight: "100vh", color: BRAND.textDark }}>
      <style>{`
        * { box-sizing: border-box; }
        html, body, #root { margin: 0; min-height: 100%; background: ${BRAND.page}; }
        @page { size: 11in 8.5in; margin: 0.15in; }

        .print-only { display: none; }
        .screen-only { display: block; }

        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            overflow: visible !important;
            background: #ffffff !important;
          }
          .screen-only,
          .controls-bar,
          .status-bar,
          .round-banner,
          .share-modal-overlay,
          button,
          textarea {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .print-page {
            width: ${PRINTABLE_WIDTH}px !important;
            height: ${PRINTABLE_HEIGHT}px !important;
            overflow: hidden !important;
            margin: 0 auto !important;
            background: #ffffff !important;
          }
          .print-stage {
            width: ${PRINT_BOARD_WIDTH}px !important;
            transform: scale(${PRINT_SCALE});
            transform-origin: top left;
          }
        }
      `}</style>

      <div
        style={{
          position: "relative",
          minHeight: "100vh",
          padding: 20,
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(249,115,22,0.04), transparent 45%),
            linear-gradient(120deg, rgba(249,115,22,0.025) 0%, transparent 35%),
            linear-gradient(240deg, rgba(249,115,22,0.02) 0%, transparent 35%)
          `,
        }}
      >
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(circle at center, rgba(249,115,22,0.02), transparent 55%)" }} />

        <div className="screen-only" style={{ position: "relative", zIndex: 1 }}>
          <HeaderBranding compact={false} />

          <div className="controls-bar" style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
            <button onClick={handleShare} style={btnStyle}>Share</button>
            <button onClick={handleReset} style={btnStyle}>Reset</button>
            <button onClick={handlePrintPdf} style={btnStyle}>Print / Save PDF</button>
          </div>

          <div className="status-bar" style={{ textAlign: "center", color: BRAND.success, minHeight: 20, marginBottom: 8, fontSize: 12 }}>
            {status}
          </div>

          <div className="round-banner" style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 12, marginBottom: 16, padding: "8px 12px", borderRadius: 12, border: `1px solid ${BRAND.border}`, background: "rgba(249,115,22,0.04)" }}>
            {ROUND_BANNER.map((item, i) => (
              <div
                key={item.label}
                style={{
                  color: i === 5 ? BRAND.orange : "#475569",
                  fontWeight: i === 5 ? 900 : 700,
                  fontSize: 11,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  padding: "6px 10px",
                  background: i === 5 ? "rgba(249,115,22,0.12)" : "rgba(15,23,42,0.035)",
                  borderRadius: 8,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 900 }}>{item.label}</div>
                <div style={{ fontSize: 10, opacity: 0.75 }}>{item.pts}</div>
              </div>
            ))}
          </div>

          <div style={{ width: "100%", overflowX: "auto", paddingBottom: 16 }}>
            <BracketBoard picks={picks} setPick={setPick} layout={SCREEN_LAYOUT} printMode={false} />
          </div>
        </div>

        <div className="print-only print-page" style={{ position: "relative", zIndex: 1, padding: 0 }}>
          <div className="print-stage">
            <HeaderBranding compact={true} />
            <BracketBoard picks={picks} setPick={setPick} layout={PRINT_LAYOUT} printMode={true} />
          </div>
        </div>

        <ShareModal isOpen={shareOpen} text={shareUrl} onClose={() => setShareOpen(false)} />
      </div>
    </div>
  );
}
