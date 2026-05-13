import { useState } from "react";

// ─────────────────────────────────────────────
// CoverPage — pure display component
// ─────────────────────────────────────────────
export function CoverPage({
  universityName = "University of Green Meadows",
  title = "Impact of Climate Change on Biodiversity Conservation",
  author = "Sarah Johnson",
  footerLines = [
    "Master of Science in Environmental Science",
    "Department of Environmental Studies",
    "University of Green Meadows",
    "Dr. Emily Green",
    "May 15, 2025",
  ],
  bgColor = "#7D2535",
  textColor = "#FFFFFF",
  accentColor = "#D4A04A",
  titleSize = 18,
}) {
  return (
    <div
      className="relative flex flex-col items-center px-8 py-10 rounded shadow-2xl"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        width: "260px",
        minHeight: "370px",
        fontFamily: "'Georgia', serif",
      }}
    >
      {/* Logo / Emblem */}
      <svg
        viewBox="0 0 60 60"
        className="w-14 h-14 mb-2"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="30" cy="30" r="28" stroke={textColor} strokeWidth="1.5" fillOpacity="0" opacity="0.5" />
        <circle cx="30" cy="30" r="22" stroke={textColor} strokeWidth="1" fillOpacity="0" opacity="0.3" />
        <path d="M26 20 L34 20 L36 26 L24 26 Z" fill={textColor} opacity="0.7" />
        <path d="M22 26 L38 26 M22 30 L38 30 M22 34 L38 34" stroke={textColor} strokeWidth="1.2" opacity="0.8" />
        <path d="M18 38 Q30 47 42 38" stroke={accentColor} strokeWidth="1.8" fill="none" />
        <circle cx="30" cy="17" r="2.5" fill={accentColor} opacity="0.9" />
      </svg>

      {/* University Name */}
      <p className="text-center mb-4 tracking-widest" style={{ fontSize: "8px", opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.12em" }}>
        {universityName}
      </p>

      {/* Top Accent Line */}
      <div className="w-3/5 mb-5" style={{ height: "1px", backgroundColor: accentColor, opacity: 0.7 }} />

      {/* Title */}
      <h1
        className="font-bold text-center leading-snug mb-4"
        style={{ fontSize: `${titleSize}px`, color: textColor }}
      >
        {title}
      </h1>

      {/* Author */}
      <p className="text-center mb-auto" style={{ fontSize: "11px", opacity: 0.85 }}>
        <em>By</em>{" "}
        <span className="font-semibold">{author}</span>
      </p>

      {/* Bottom Accent Line */}
      <div className="w-3/5 mt-6 mb-5" style={{ height: "1px", backgroundColor: accentColor, opacity: 0.7 }} />

      {/* Footer */}
      <div className="text-center" style={{ fontSize: "8px", opacity: 0.8, lineHeight: "1.8" }}>
        {footerLines.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ControlRow — labeled input helper
// ─────────────────────────────────────────────
function ControlRow({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </label>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// ColorPicker — swatch + hex display
// ─────────────────────────────────────────────
function ColorPicker({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded cursor-pointer border border-gray-600 bg-transparent p-0.5"
      />
      <span className="text-xs font-mono text-gray-400">{value.toUpperCase()}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// CoverPageEditor — full editor with live preview
// ─────────────────────────────────────────────
export default function CoverPageEditor() {
  const [config, setConfig] = useState({
    universityName: "University of Green Meadows",
    title: "Impact of Climate Change on Biodiversity Conservation",
    author: "Sarah Johnson",
    footerText:
      "Master of Science in Environmental Science\nDepartment of Environmental Studies\nUniversity of Green Meadows\nDr. Emily Green\nMay 15, 2025",
    bgColor: "#7D2535",
    textColor: "#FFFFFF",
    accentColor: "#D4A04A",
    titleSize: 18,
  });

  const set = (key) => (val) => setConfig((prev) => ({ ...prev, [key]: val }));
  const setE = (key) => (e) => set(key)(e.target.value);

  const footerLines = config.footerText.split("\n").filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-8 py-4 flex items-center gap-3">
        <div className="w-2 h-6 rounded-full" style={{ backgroundColor: "#D4A04A" }} />
        <h1 className="text-sm font-semibold tracking-widest uppercase text-gray-300">
          Cover Page Editor
        </h1>
        <span className="ml-auto text-xs text-gray-600">Live Preview</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Controls Panel ── */}
        <aside className="w-72 border-r border-gray-800 overflow-y-auto p-6 flex flex-col gap-6">

          {/* Colors */}
          <section>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 pb-1 border-b border-gray-800">
              Colors
            </p>
            <div className="flex flex-col gap-4">
              <ControlRow label="Background">
                <ColorPicker value={config.bgColor} onChange={set("bgColor")} />
              </ControlRow>
              <ControlRow label="Text">
                <ColorPicker value={config.textColor} onChange={set("textColor")} />
              </ControlRow>
              <ControlRow label="Accent">
                <ColorPicker value={config.accentColor} onChange={set("accentColor")} />
              </ControlRow>
            </div>
          </section>

          {/* Typography */}
          <section>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 pb-1 border-b border-gray-800">
              Typography
            </p>
            <ControlRow label={`Title size — ${config.titleSize}px`}>
              <input
                type="range"
                min={12}
                max={26}
                value={config.titleSize}
                onChange={(e) => set("titleSize")(Number(e.target.value))}
                className="w-full accent-amber-400"
              />
            </ControlRow>
          </section>

          {/* Content */}
          <section>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 pb-1 border-b border-gray-800">
              Content
            </p>
            <div className="flex flex-col gap-4">
              <ControlRow label="University">
                <input
                  type="text"
                  value={config.universityName}
                  onChange={setE("universityName")}
                  className="bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-amber-500"
                />
              </ControlRow>
              <ControlRow label="Title">
                <textarea
                  rows={3}
                  value={config.title}
                  onChange={setE("title")}
                  className="bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-amber-500 resize-none"
                />
              </ControlRow>
              <ControlRow label="Author">
                <input
                  type="text"
                  value={config.author}
                  onChange={setE("author")}
                  className="bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-amber-500"
                />
              </ControlRow>
              <ControlRow label="Footer (one line each)">
                <textarea
                  rows={5}
                  value={config.footerText}
                  onChange={setE("footerText")}
                  className="bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-amber-500 resize-none font-mono"
                />
              </ControlRow>
            </div>
          </section>

          {/* Presets */}
          <section>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 pb-1 border-b border-gray-800">
              Presets
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Crimson", bg: "#7D2535", text: "#FFFFFF", accent: "#D4A04A" },
                { label: "Navy", bg: "#1A2744", text: "#FFFFFF", accent: "#5BA3D9" },
                { label: "Forest", bg: "#1E3B2F", text: "#F0EDD5", accent: "#A3C97A" },
                { label: "Slate", bg: "#2D3748", text: "#F7FAFC", accent: "#F6AD55" },
                { label: "Ivory", bg: "#FAF7F0", text: "#2D2416", accent: "#C49A3C" },
                { label: "Onyx", bg: "#0F0F0F", text: "#E8E8E8", accent: "#E84545" },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      bgColor: p.bg,
                      textColor: p.text,
                      accentColor: p.accent,
                    }))
                  }
                  className="flex flex-col items-center gap-1 p-2 rounded border border-gray-800 hover:border-gray-600 transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-full border-2"
                    style={{ backgroundColor: p.bg, borderColor: p.accent }}
                  />
                  <span className="text-xs text-gray-500">{p.label}</span>
                </button>
              ))}
            </div>
          </section>
        </aside>

        {/* ── Preview Panel ── */}
        <main className="flex-1 flex items-center justify-center bg-gray-900 overflow-auto p-12">
          <div className="flex flex-col items-center gap-6">
            <CoverPage
              universityName={config.universityName}
              title={config.title}
              author={config.author}
              footerLines={footerLines}
              bgColor={config.bgColor}
              textColor={config.textColor}
              accentColor={config.accentColor}
              titleSize={config.titleSize}
            />
            <p className="text-xs text-gray-600 tracking-wider uppercase">Live Preview</p>
          </div>
        </main>
      </div>
    </div>
  );
}