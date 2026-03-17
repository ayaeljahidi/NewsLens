import { useState, useEffect, useRef, useCallback } from "react";

const API = "http://localhost:8000";

// ─── Icons ────────────────────────────────────────────────────────────────────
const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const MoonIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const SpinnerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
  </svg>
);
const AIIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const ExternalIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

// ─── Theme Toggle ─────────────────────────────────────────────────────────────
function ThemeToggle({ dark, onToggle }) {
  return (
    <button onClick={onToggle} style={{
      background: "var(--bg3)", border: "1px solid var(--border2)",
      borderRadius: "50px", padding: "6px 14px", display: "flex", alignItems: "center",
      gap: "8px", color: "var(--text2)", fontSize: "13px", fontWeight: 500,
      transition: "var(--transition)", cursor: "pointer",
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
    onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border2)"}
    title={dark ? "Mode clair" : "Mode sombre"}>
      <span style={{ display:"flex", transition:"transform 0.3s", transform: dark ? "rotate(0deg)" : "rotate(180deg)" }}>
        {dark ? <SunIcon /> : <MoonIcon />}
      </span>
      <span style={{ color: "var(--text2)" }}>{dark ? "Clair" : "Sombre"}</span>
    </button>
  );
}

// ─── Search Bar ───────────────────────────────────────────────────────────────
function SearchBar({ value, onChange, onSearch, loading, suggestions, onSuggest }) {
  const [showSugg, setShowSugg] = useState(false);
  const inputRef = useRef(null);

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "12px",
        background: "var(--surface)", border: "2px solid var(--border2)",
        borderRadius: "50px", padding: "12px 20px",
        boxShadow: "var(--shadow2)", transition: "border-color 0.2s",
      }}
      onFocus={() => setShowSugg(true)}
      onBlur={() => setTimeout(() => setShowSugg(false), 150)}>
        <span style={{ color: "var(--text3)", flexShrink: 0 }}>
          {loading ? <SpinnerIcon /> : <SearchIcon />}
        </span>
        <input
          ref={inputRef}
          value={value}
          onChange={e => { onChange(e.target.value); onSuggest(e.target.value); }}
          onKeyDown={e => { if (e.key === "Enter") { setShowSugg(false); onSearch(value); } }}
          placeholder="Rechercher des actualités..."
          style={{
            flex: 1, border: "none", outline: "none", background: "transparent",
            fontSize: "16px", color: "var(--text)", fontFamily: "'DM Sans'",
          }}
        />
        {value && (
          <button onClick={() => { onChange(""); onSearch(""); }} style={{
            background: "var(--bg3)", border: "none", borderRadius: "50%",
            width: "24px", height: "24px", display: "flex", alignItems: "center",
            justifyContent: "center", color: "var(--text3)", padding: 0,
          }}><CloseIcon /></button>
        )}
        <button onClick={() => { setShowSugg(false); onSearch(value); }} style={{
          background: "var(--accent)", border: "none", borderRadius: "50px",
          padding: "8px 22px", color: "#fff", fontSize: "14px", fontWeight: 500,
          transition: "opacity 0.2s", flexShrink: 0,
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
        onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
          Chercher
        </button>
      </div>

      {/* Suggestions dropdown */}
      {showSugg && suggestions.length > 0 && (
        <div className="animate-slide" style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
          background: "var(--surface)", border: "1px solid var(--border2)",
          borderRadius: "16px", boxShadow: "var(--shadow2)", overflow: "hidden", zIndex: 100,
        }}>
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => { onChange(s); onSearch(s); setShowSugg(false); }}
              style={{
                width: "100%", padding: "11px 20px", background: "transparent",
                border: "none", textAlign: "left", color: "var(--text2)",
                fontSize: "14px", cursor: "pointer", display: "flex",
                alignItems: "center", gap: "10px", transition: "background 0.15s",
                borderBottom: i < suggestions.length - 1 ? "1px solid var(--border)" : "none",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--bg2)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <SearchIcon /> <span dangerouslySetInnerHTML={{ __html: s }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── AI Summary Panel ─────────────────────────────────────────────────────────
function AISummary({ summary, loading, query }) {
  if (!loading && !summary) return null;
  return (
    <div className="animate-fade-up" style={{
      background: "var(--accent2)", border: "1px solid var(--border2)",
      borderLeft: "3px solid var(--accent)", borderRadius: "var(--radius)",
      padding: "18px 20px", marginBottom: "24px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
        <span style={{ color: "var(--accent)" }}><AIIcon /></span>
        <span style={{ fontSize: "12px", fontFamily: "'DM Mono'", letterSpacing: "1.5px", color: "var(--accent)", fontWeight: 500 }}>
          SYNTHÈSE IA — Tinyllama
        </span>
        {loading && <SpinnerIcon />}
      </div>
      {loading ? (
        <div style={{ display: "flex", gap: "6px" }}>
          {[0,1,2].map(i => (
            <div key={i} className="animate-pulse" style={{
              height: "10px", borderRadius: "5px", background: "var(--border2)",
              width: ["60%","80%","40%"][i], animationDelay: `${i*0.2}s`
            }} />
          ))}
        </div>
      ) : (
        <p style={{ fontSize: "14px", lineHeight: 1.75, color: "var(--text)", fontStyle: "italic" }}>
          {summary}
        </p>
      )}
    </div>
  );
}

// ─── Article Card ─────────────────────────────────────────────────────────────
function ArticleCard({ article, index }) {
  const date = article.published
    ? new Date(article.published).toLocaleDateString("fr-FR", { day:"numeric", month:"short", year:"numeric" })
    : "";

  return (
    <article className="animate-fade-up" style={{
      animationDelay: `${index * 0.05}s`, opacity: 0,
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: "var(--radius)", padding: "20px 22px",
      transition: "var(--transition)", cursor: "pointer",
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = "var(--accent)";
      e.currentTarget.style.boxShadow = "var(--shadow2)";
      e.currentTarget.style.transform = "translateY(-2px)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = "var(--border)";
      e.currentTarget.style.boxShadow = "none";
      e.currentTarget.style.transform = "translateY(0)";
    }}
    onClick={() => article.url && window.open(article.url, "_blank")}>

      {/* Meta */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
        <span style={{
          background: "var(--bg3)", border: "1px solid var(--border)",
          borderRadius: "4px", padding: "2px 9px",
          fontSize: "11px", fontFamily: "'DM Mono'", color: "var(--text3)",
          letterSpacing: "0.5px",
        }}>{article.source}</span>
        {date && <span style={{ fontSize: "12px", color: "var(--text3)" }}>{date}</span>}
        <span style={{ marginLeft: "auto", color: "var(--text3)" }}><ExternalIcon /></span>
      </div>

      {/* Title */}
      <h2 style={{
        fontFamily: "'Playfair Display'", fontSize: "18px", fontWeight: 700,
        lineHeight: 1.35, color: "var(--text)", marginBottom: "10px",
      }} dangerouslySetInnerHTML={{ __html: article.title }} />

      {/* Description */}
      {article.description && (
        <p style={{
          fontSize: "14px", color: "var(--text2)", lineHeight: 1.7,
          display: "-webkit-box", WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        }} dangerouslySetInnerHTML={{ __html: article.description }} />
      )}

      {/* Score bar */}
      <div style={{ marginTop: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ flex: 1, height: "2px", background: "var(--bg3)", borderRadius: "1px", overflow: "hidden" }}>
          <div style={{
            height: "100%", background: "var(--accent)",
            width: `${Math.min(article.score * 10, 100)}%`,
            transition: "width 0.8s ease",
          }} />
        </div>
        <span style={{ fontSize: "11px", fontFamily: "'DM Mono'", color: "var(--text3)" }}>
          {article.score}
        </span>
      </div>
    </article>
  );
}

// ─── Filter Pills ─────────────────────────────────────────────────────────────
function FilterPills({ sources, active, onSelect }) {
  if (!sources.length) return null;
  return (
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
      <button onClick={() => onSelect(null)} style={{
        background: !active ? "var(--accent)" : "var(--surface)",
        color: !active ? "#fff" : "var(--text2)",
        border: `1px solid ${!active ? "var(--accent)" : "var(--border2)"}`,
        borderRadius: "50px", padding: "5px 14px", fontSize: "12px",
        fontWeight: 500, transition: "var(--transition)",
      }}>Toutes</button>
      {sources.map(s => (
        <button key={s} onClick={() => onSelect(s)} style={{
          background: active === s ? "var(--accent)" : "var(--surface)",
          color: active === s ? "#fff" : "var(--text2)",
          border: `1px solid ${active === s ? "var(--accent)" : "var(--border2)"}`,
          borderRadius: "50px", padding: "5px 14px", fontSize: "12px",
          fontWeight: 400, transition: "var(--transition)", cursor: "pointer",
        }}>{s}</button>
      ))}
    </div>
  );
}

// ─── Empty / Hero State ───────────────────────────────────────────────────────
function Hero() {
  const topics = ["Intelligence artificielle", "Économie mondiale", "Climat", "Sport", "Politique", "Technologie"];
  return (
    <div style={{ textAlign: "center", padding: "60px 0 40px" }}>
      <div className="animate-fade-up" style={{ marginBottom: "8px" }}>
        <span style={{ fontSize: "11px", fontFamily: "'DM Mono'", letterSpacing: "3px", color: "var(--accent)" }}>
          ELASTICSEARCH · OLLAMA · BM25
        </span>
      </div>
      <h1 className="animate-fade-up" style={{
        fontFamily: "'Playfair Display'", fontSize: "clamp(40px, 6vw, 68px)",
        fontWeight: 700, lineHeight: 1.1, color: "var(--text)",
        letterSpacing: "-1px", marginBottom: "16px", animationDelay: ".05s", opacity: 0,
      }}>
        L'actualité,<br />
        <em style={{ color: "var(--accent)", fontWeight: 400 }}>augmentée par l'IA.</em>
      </h1>
      <p className="animate-fade-up" style={{
        fontSize: "16px", color: "var(--text2)", maxWidth: "460px",
        margin: "0 auto 36px", lineHeight: 1.7, animationDelay: ".1s", opacity: 0,
      }}>
        Recherchez dans des milliers d'articles en &lt;50ms grâce à Elasticsearch,
        et obtenez une synthèse instantanée par Ollama.
      </p>

      {/* Topic chips */}
      <div className="animate-fade-up" style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap", animationDelay: ".15s", opacity: 0 }}>
        {topics.map(t => (
          <span key={t} style={{
            background: "var(--surface)", border: "1px solid var(--border2)",
            borderRadius: "50px", padding: "6px 16px", fontSize: "13px",
            color: "var(--text2)", cursor: "default",
          }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark]               = useState(false);
  const [query, setQuery]             = useState("");
  const [results, setResults]         = useState([]);
  const [total, setTotal]             = useState(0);
  const [sources, setSources]         = useState([]);
  const [activeSource, setActiveSource] = useState(null);
  const [summary, setSummary]         = useState("");
  const [loading, setLoading]         = useState(false);
  const [aiLoading, setAiLoading]     = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [searched, setSearched]       = useState(false);
  const [page, setPage]               = useState(0);
  const PAGE_SIZE = 10;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  const doSearch = useCallback(async (q, src = activeSource, p = 0) => {
    if (!q?.trim()) { setResults([]); setSearched(false); setSummary(""); return; }
    setLoading(true);
    setSearched(true);
    setSummary("");
    if (p === 0) setResults([]);

    try {
      const params = new URLSearchParams({ q, size: PAGE_SIZE, from: p * PAGE_SIZE });
      if (src) params.append("source", src);
      const res  = await fetch(`${API}/search?${params}`);
      const data = await res.json();

      setResults(prev => p === 0 ? data.results : [...prev, ...data.results]);
      setTotal(data.total);
      if (p === 0) setSources(data.sources || []);
      setPage(p);

      // AI summarize top results
      if (p === 0 && data.results.length > 0) {
        setAiLoading(true);
        const titles = data.results.slice(0, 5).map(r =>
          r.title.replace(/<[^>]+>/g, "")
        ).join("||");
        try {
          const sumRes = await fetch(`${API}/summarize?${new URLSearchParams({ q, articles: titles })}`);
          const sumData = await sumRes.json();
          setSummary(sumData.summary);
        } catch { setSummary(""); }
        setAiLoading(false);
      }
    } catch {
      setResults([{ title: "⚠ Backend inaccessible", description: "Lance : cd backend && uvicorn main:app --reload", source: "error", score: 0, published: "", url: "" }]);
    }
    setLoading(false);
  }, [activeSource]);

  const handleFilterSource = (src) => {
    setActiveSource(src);
    doSearch(query, src, 0);
  };

  const getSuggestions = async (q) => {
    if (!q || q.length < 2) { setSuggestions([]); return; }
    try {
      const res  = await fetch(`${API}/suggest?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch { setSuggestions([]); }
  };

  const hasMore = results.length < total;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", transition: "background 0.3s" }}>

      {/* ── HEADER ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "var(--bg)", borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", gap: "20px" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "1px", flexShrink: 0 }}>
            <span style={{ fontFamily: "'Playfair Display'", fontSize: "22px", fontWeight: 700, color: "var(--text)" }}>News</span>
            <span style={{ fontFamily: "'Playfair Display'", fontSize: "22px", fontWeight: 400, fontStyle: "italic", color: "var(--accent)" }}>Lens</span>
          </div>

          {/* Search */}
          <div style={{ flex: 1 }}>
            <SearchBar
              value={query}
              onChange={setQuery}
              onSearch={q => doSearch(q, activeSource, 0)}
              loading={loading}
              suggestions={suggestions}
              onSuggest={getSuggestions}
            />
          </div>

          {/* Theme toggle */}
          <ThemeToggle dark={dark} onToggle={() => setDark(d => !d)} />
        </div>
      </header>

      {/* ── MAIN ── */}
      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 24px" }}>

        {!searched && <Hero />}

        {searched && (
          <>
            {/* Stats bar */}
            <div className="animate-fade-in" style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: "20px",
            }}>
              <p style={{ fontSize: "13px", color: "var(--text3)", fontFamily: "'DM Mono'" }}>
                {loading ? "Recherche..." : `${total.toLocaleString()} résultats`}
              </p>
              <p style={{ fontSize: "12px", color: "var(--text3)" }}>
                Powered by <span style={{ color: "var(--accent)", fontWeight: 500 }}>Elasticsearch BM25</span>
              </p>
            </div>

            {/* Source filters */}
            <FilterPills sources={sources} active={activeSource} onSelect={handleFilterSource} />

            {/* AI Summary */}
            <AISummary summary={summary} loading={aiLoading} query={query} />

            {/* Results */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {results.map((r, i) => (
                <ArticleCard key={r.id || i} article={r} index={i % PAGE_SIZE} />
              ))}
            </div>

            {/* Load more */}
            {hasMore && !loading && (
              <div style={{ textAlign: "center", marginTop: "32px" }}>
                <button onClick={() => doSearch(query, activeSource, page + 1)} style={{
                  background: "var(--surface)", border: "2px solid var(--border2)",
                  borderRadius: "50px", padding: "12px 36px", fontSize: "14px",
                  fontWeight: 500, color: "var(--text)", transition: "var(--transition)",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--text)"; }}>
                  Charger plus · {total - results.length} restants
                </button>
              </div>
            )}

            {/* No results */}
            {!loading && results.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text3)" }}>
                <p style={{ fontFamily: "'Playfair Display'", fontSize: "24px", marginBottom: "8px" }}>Aucun résultat</p>
                <p style={{ fontSize: "14px" }}>Essayez un autre terme ou vérifiez que l'indexer a bien tourné.</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "20px 24px", marginTop: "40px", textAlign: "center" }}>
        <p style={{ fontSize: "12px", fontFamily: "'DM Mono'", color: "var(--text3)", letterSpacing: "1px" }}>
          NEWSLENS · ELASTICSEARCH + OLLAMA + CC-NEWS
        </p>
      </footer>
    </div>
  );
}
