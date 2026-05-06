import { useState, useRef, useCallback } from "react";

const MOCK_SINGLE_ANALYSIS = {
  meta: { confidence: "high" },
  colors: {
    tokens: [
      { name: "primary", value: "#0A84FF", role: "action" },
      { name: "primary-dark", value: "#0060D1", role: "action-hover" },
      { name: "background", value: "#FFFFFF", role: "surface" },
      { name: "surface-alt", value: "#F4F4F4", role: "surface" },
      { name: "surface-near", value: "#F5F5F5", role: "surface" },
      { name: "text-primary", value: "#111111", role: "text" },
      { name: "text-secondary", value: "#666666", role: "text" },
      { name: "danger", value: "#FF3B30", role: "semantic" },
      { name: "success", value: "#30D158", role: "semantic" },
      { name: "border", value: "#E0E0E0", role: "border" },
    ],
    issues: ["surface-alt", "surface-near"],
  },
  typography: {
    fontFamily: "DM Sans",
    scale: [
      { name: "display", size: 48, weight: 700, lineHeight: 56 },
      { name: "h1", size: 32, weight: 700, lineHeight: 40 },
      { name: "h2", size: 24, weight: 600, lineHeight: 32 },
      { name: "body", size: 16, weight: 400, lineHeight: 24 },
      { name: "label", size: 12, weight: 500, lineHeight: 16 },
    ],
  },
  spacing: { baseUnit: 8, scale: [2, 4, 8, 12, 16, 24, 32, 48, 64] },
  components: [
    {
      name: "Button",
      base: { properties: { padding: "10px 20px", borderRadius: 8, fontSize: 15, fontWeight: 600, border: "none", cursor: "pointer" } },
      variants: [
        { name: "primary", properties: { backgroundColor: "primary", textColor: "#FFFFFF" } },
        { name: "secondary", properties: { backgroundColor: "#F0F0F0", textColor: "#111111" } },
        { name: "ghost", properties: { backgroundColor: "transparent", textColor: "primary", border: "1.5px solid", borderColor: "primary" } },
      ],
    },
    {
      name: "Badge",
      base: { properties: { padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600, display: "inline-block" } },
      variants: [
        { name: "default", properties: { backgroundColor: "#EEEEEE", textColor: "#444444" } },
        { name: "primary", properties: { backgroundColor: "primary", textColor: "#FFFFFF" } },
        { name: "success", properties: { backgroundColor: "#E5F9EC", textColor: "#1A7A3A" } },
      ],
    },
  ],
  inconsistencies: [
    "Two near-identical grays: #F4F4F4 vs #F5F5F5 — consolidate to one token.",
    "Font weights 600 and 700 used interchangeably for headings.",
    "Border-radius varies (6px, 8px, 12px) with no clear hierarchy rule.",
  ],
};

const BRAND_MOCK = {
  stripe: {
    brandName: "Stripe",
    url: "https://stripe.com",
    primaryColor: "#635BFF",
    scores: { visualConsistency: 96, typographySystem: 94, colorSystem: 97, componentMaturity: 95, spacingSystem: 91, accessibility: 88, brandStrength: 98 },
    summary: "Stripe sets the gold standard for SaaS design. Their color system is exceptionally deliberate with a purple-centric palette that feels both trustworthy and modern. Typography is highly systematic with a clear scale. Component library shows exceptional maturity.",
    strengths: ["Industry-leading color token system", "Exceptional visual hierarchy", "Consistent 6px border-radius language", "Strong brand recognition via purple gradient", "Pristine white-space discipline"],
    weaknesses: ["Gradient overuse creates visual noise in places", "Dark mode shows minor surface inconsistencies", "Icon sizes lack a proportional system"],
    colors: ["#635BFF", "#0A2540", "#F6F9FC", "#425466", "#00D4FF", "#80E9FF"],
    fontFamily: "Sohne",
  },
  linear: {
    brandName: "Linear",
    url: "https://linear.app",
    primaryColor: "#5E6AD2",
    scores: { visualConsistency: 93, typographySystem: 90, colorSystem: 88, componentMaturity: 89, spacingSystem: 94, accessibility: 79, brandStrength: 92 },
    summary: "Linear excels in dark-mode-first design with an extremely refined minimal aesthetic. Their spacing system is one of the tightest in the industry. Color palette leans on indigo tones with strong contrast. Accessibility gaps appear in lower-contrast secondary states.",
    strengths: ["Best-in-class dark mode implementation", "Tight 8pt spacing grid discipline", "Cohesive indigo brand identity", "Minimal but expressive icon language", "Excellent motion and interaction design"],
    weaknesses: ["Light mode feels secondary / less polished", "Accessibility dips in secondary states", "Limited public color token documentation"],
    colors: ["#5E6AD2", "#111827", "#1F2937", "#6B7280", "#A78BFA", "#E5E7EB"],
    fontFamily: "Inter",
  },
  figma: {
    brandName: "Figma",
    url: "https://figma.com",
    primaryColor: "#1ABCFE",
    scores: { visualConsistency: 87, typographySystem: 88, colorSystem: 92, componentMaturity: 91, spacingSystem: 86, accessibility: 84, brandStrength: 90 },
    summary: "Figma's brand is playful and vibrant with a distinctive multi-color palette. Their color system is bold and varied but occasionally borders on inconsistency. Typography hierarchy is clear. Component system is flexible and reflects their design-tool DNA.",
    strengths: ["Bold, memorable multi-color identity", "Strong color contrast ratios", "Clear typographic hierarchy", "Playful yet professional voice", "Excellent component documentation"],
    weaknesses: ["Multi-color system is hard to extend consistently", "Spacing scale has edge-case irregularities", "Some light mode surfaces lack sufficient contrast"],
    colors: ["#1ABCFE", "#0ACF83", "#FF7262", "#A259FF", "#F24E1E", "#FFFFFF"],
    fontFamily: "Inter",
  },
  notion: {
    brandName: "Notion",
    url: "https://notion.so",
    primaryColor: "#000000",
    scores: { visualConsistency: 82, typographySystem: 91, colorSystem: 76, componentMaturity: 83, spacingSystem: 80, accessibility: 86, brandStrength: 88 },
    summary: "Notion's design prioritizes content legibility over visual flair. The near-monochrome palette is deliberately restrained, creating excellent reading conditions. Typography is exceptional. The sparse color system limits expressive range but maximizes focus.",
    strengths: ["Outstanding typography and reading experience", "Content-first design philosophy", "Clean black-and-white brand identity", "High text accessibility scores", "Excellent information density management"],
    weaknesses: ["Sparse color system limits visual distinction", "Spacing inconsistencies in dense views", "Component hover/active states are underdeveloped"],
    colors: ["#000000", "#37352F", "#6B6B6B", "#E9E9E7", "#2EAADC", "#FFFFFF"],
    fontFamily: "ui-sans-serif",
  },
};

const MOCK_BENCHMARK_INSIGHTS = [
  { type: "gap", text: "The leader scores 20+ points above the lowest-ranked brand on color system maturity — the biggest gap in this benchmark." },
  { type: "tie", text: "Multiple brands share the same base font (Inter) but achieve very different visual personalities through color and spacing choices." },
  { type: "warning", text: "All analyzed brands have accessibility gaps in low-contrast secondary states — an industry-wide blind spot worth addressing." },
  { type: "insight", text: "Spacing system discipline strongly correlates with overall visual consistency scores across the benchmark." },
  { type: "insight", text: "Brand strength and color system maturity show the highest correlation among all scored dimensions." },
];

const SCORE_LABELS = {
  visualConsistency: "Visual Consistency",
  typographySystem: "Typography",
  colorSystem: "Color System",
  componentMaturity: "Components",
  spacingSystem: "Spacing",
  accessibility: "Accessibility",
  brandStrength: "Brand Strength",
};

const ACCENT_POOL = ["#0A84FF", "#8B5CF6", "#F59E0B", "#10B981", "#EF4444", "#06B6D4"];

const resolveColor = (tokenName, tokens) => {
  if (!tokenName || tokenName === "transparent") return "transparent";
  if (tokenName.startsWith("#") || tokenName.startsWith("rgb")) return tokenName;
  const found = tokens.find((t) => t.name === tokenName);
  return found ? found.value : tokenName;
};

const getScoreTheme = (score) => {
  if (score >= 90) return { bar: "#30D158", bg: "#E5F9EC", text: "#1A7A3A" };
  if (score >= 75) return { bar: "#FF9F0A", bg: "#FFF3D9", text: "#8A5A00" };
  return { bar: "#FF3B30", bg: "#FFE9E8", text: "#C41A1A" };
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
  @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes scaleX { from{transform:scaleX(0)} to{transform:scaleX(1)} }
  @keyframes popIn { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
  * { box-sizing:border-box; margin:0; padding:0; }
  input[type=text] { outline:none; transition:border-color .15s, box-shadow .15s; }
  input[type=text]:focus { border-color:#0A84FF !important; box-shadow:0 0 0 3px rgba(10,132,255,.12); }
  .score-bar-fill { transform-origin:left; animation:scaleX .7s cubic-bezier(.16,1,.3,1) both; }
  .upload-zone:hover { border-color:#0A84FF !important; background:#F8FBFF !important; }
  .tab-btn:hover { background:#F5F5F5 !important; }
  .brand-card:hover { border-color:#CCC !important; }
  .add-brand:hover { background:#F2F2F2 !important; border-color:#CCC !important; }
  .remove-x:hover { opacity:.7; }
`;

const BASE = {
  app: { minHeight:"100vh", background:"#FAFAF9", fontFamily:"'DM Sans','Helvetica Neue',sans-serif", color:"#111" },
  header: { background:"#FFF", borderBottom:"1px solid #EBEBEB", padding:"0 40px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 },
  logo: { display:"flex", alignItems:"center", gap:10, fontWeight:700, fontSize:16, letterSpacing:"-0.3px" },
  logoDot: { width:24, height:24, borderRadius:6, background:"linear-gradient(135deg,#0A84FF,#5E5CE6)", display:"flex", alignItems:"center", justifyContent:"center" },
  pills: { display:"flex", gap:3, background:"#F2F2F2", borderRadius:10, padding:3 },
  pill: { padding:"6px 16px", borderRadius:8, fontSize:13, fontWeight:600, border:"none", cursor:"pointer", fontFamily:"inherit", letterSpacing:"-0.1px", transition:"all .15s" },
  main: { maxWidth:1160, margin:"0 auto", padding:"48px 40px 80px" },
  hero: { textAlign:"center", marginBottom:48, animation:"fadeUp .5s ease both" },
  heroTitle: { fontSize:42, fontWeight:800, letterSpacing:"-1.6px", lineHeight:1.1, marginBottom:10, background:"linear-gradient(135deg,#111,#555)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" },
  heroSub: { fontSize:17, color:"#888", letterSpacing:"-0.2px" },
  card: { background:"#FFF", borderRadius:14, border:"1px solid #EBEBEB", padding:24 },
  sec: { marginBottom:40, animation:"fadeUp .4s ease both" },
  secHead: { display:"flex", alignItems:"center", gap:10, marginBottom:16 },
  secTitle: { fontSize:11, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"#C0C0C0", whiteSpace:"nowrap" },
  secLine: { flex:1, height:1, background:"#EBEBEB" },
  shimmer: { background:"linear-gradient(90deg,#F0F0F0 0,#E6E6E6 200px,#F0F0F0 400px)", backgroundSize:"600px 100%", animation:"shimmer 1.4s infinite linear", borderRadius:8 },
  spinner: { width:17, height:17, border:"2.5px solid rgba(255,255,255,.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .7s linear infinite" },
};

function SH({ title }) {
  return (
    <div style={BASE.secHead}>
      <p style={BASE.secTitle}>{title}</p>
      <div style={BASE.secLine} />
    </div>
  );
}

function ScoreBar({ score, color, delay = 0 }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <div style={{ flex:1, height:5, background:"#F0F0F0", borderRadius:99, overflow:"hidden" }}>
        <div className="score-bar-fill" style={{ height:"100%", width:`${score}%`, background:color, borderRadius:99, animationDelay:`${delay}s` }} />
      </div>
      <span style={{ fontSize:12, fontWeight:700, color:"#444", minWidth:24, textAlign:"right" }}>{score}</span>
    </div>
  );
}

function Upload({ images, onAdd, onRemove, onAnalyze, loading, maxImages = 5, btnLabel = "Analyze Design", btnColor = "#0A84FF" }) {
  const ref = useRef();
  const [drag, setDrag] = useState(false);
  const handle = (files) => {
    const valid = Array.from(files).filter((f) => f.type.startsWith("image/")).slice(0, maxImages - images.length);
    Promise.all(valid.map((f) => new Promise((res) => { const r = new FileReader(); r.onload = (e) => res({ src: e.target.result, name: f.name }); r.readAsDataURL(f); }))).then((imgs) => imgs.forEach(onAdd));
  };
  const disabled = loading || images.length === 0;
  return (
    <div>
      <div
        className="upload-zone"
        style={{ border:`2px dashed ${drag?"#0A84FF":"#E2E2E2"}`, borderRadius:12, padding:"28px 20px", background:drag?"#F0F7FF":"#FFF", cursor:"pointer", textAlign:"center", transition:"all .2s", marginBottom:14 }}
        onClick={() => !loading && ref.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files); }}
      >
        <div style={{ width:36, height:36, borderRadius:9, background:"#F0F0F0", margin:"0 auto 10px", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        </div>
        <p style={{ fontSize:13, fontWeight:600, color:"#555", marginBottom:3 }}>{images.length===0 ? "Drop screenshots or click to browse" : `${images.length}/${maxImages} added — drop more?`}</p>
        <p style={{ fontSize:11, color:"#BBB" }}>PNG, JPG · max {maxImages}</p>
      </div>
      <input ref={ref} type="file" accept="image/*" multiple style={{ display:"none" }} onChange={(e) => handle(e.target.files)} />
      {images.length > 0 && (
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:12 }}>
          {images.map((img, i) => (
            <div key={i} style={{ position:"relative", animation:"popIn .2s ease both" }}>
              <img src={img.src} alt={img.name} style={{ width:64, height:64, borderRadius:8, objectFit:"cover", border:"1.5px solid #E5E5E5" }} />
              <button className="remove-x" onClick={() => onRemove(i)} style={{ position:"absolute", top:-5, right:-5, width:17, height:17, borderRadius:"50%", background:"#111", color:"#FFF", border:"none", cursor:"pointer", fontSize:10, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1 }}>×</button>
            </div>
          ))}
        </div>
      )}
      <button
        onClick={onAnalyze}
        disabled={disabled}
        style={{ width:"100%", padding:"12px", borderRadius:10, background:disabled?"#E8E8E8":btnColor, color:disabled?"#AAA":"#FFF", border:"none", fontSize:14, fontWeight:700, cursor:disabled?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, fontFamily:"inherit", transition:"background .15s", letterSpacing:"-0.2px" }}
      >
        {loading ? <><div style={BASE.spinner}/> Analyzing...</> : <>{btnLabel}</>}
      </button>
    </div>
  );
}

function Colors({ data }) {
  const issues = new Set(data.issues || []);
  return (
    <div style={BASE.sec}>
      <SH title="Color Tokens" />
      <div style={BASE.card}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(105px,1fr))", gap:10 }}>
          {data.tokens.map((t) => (
            <div key={t.name} style={{ borderRadius:9, overflow:"hidden", border:issues.has(t.name)?"2px solid #FF3B30":"1px solid #EBEBEB", boxShadow:issues.has(t.name)?"0 0 0 3px rgba(255,59,48,.1)":"none" }}>
              <div style={{ height:58, background:t.value }} />
              <div style={{ padding:"7px 9px", background:"#FAFAFA", borderTop:"1px solid #F0F0F0" }}>
                <p style={{ fontSize:11, fontWeight:700, color:"#333", marginBottom:2 }}>{t.name}</p>
                <p style={{ fontSize:10, color:"#AAA", fontFamily:"monospace" }}>{t.value}</p>
                <p style={{ fontSize:9, color:"#CCC", textTransform:"uppercase", letterSpacing:".05em", fontWeight:700, marginTop:2 }}>{t.role}</p>
              </div>
            </div>
          ))}
        </div>
        {data.issues?.length > 0 && <p style={{ fontSize:12, color:"#FF3B30", marginTop:12, fontWeight:600 }}>⚠ {data.issues.length} token{data.issues.length>1?"s":""} flagged (red border)</p>}
      </div>
    </div>
  );
}

function Typography({ data }) {
  return (
    <div style={BASE.sec}>
      <SH title="Typography Scale" />
      <div style={BASE.card}>
        <p style={{ fontSize:11, color:"#CCC", fontWeight:700, letterSpacing:".06em", textTransform:"uppercase", marginBottom:14 }}>Font family: {data.fontFamily}</p>
        {data.scale.map((item, i) => (
          <div key={item.name} style={{ display:"flex", alignItems:"baseline", gap:18, padding:"12px 0", borderBottom:i<data.scale.length-1?"1px solid #F4F4F4":"none" }}>
            <span style={{ fontSize:10, fontWeight:700, letterSpacing:".07em", textTransform:"uppercase", color:"#CCC", minWidth:52 }}>{item.name}</span>
            <span style={{ fontSize:10, color:"#DDD", fontFamily:"monospace", minWidth:105 }}>{item.size}px / {item.weight} / {item.lineHeight}</span>
            <span style={{ fontSize:Math.min(item.size, 32), fontWeight:item.weight, lineHeight:`${item.lineHeight}px`, letterSpacing:item.size>=24?"-0.03em":"0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>The quick brown fox</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Spacing({ data }) {
  const max = Math.max(...data.scale);
  return (
    <div style={BASE.sec}>
      <SH title="Spacing Scale" />
      <div style={BASE.card}>
        <p style={{ fontSize:11, color:"#CCC", fontWeight:700, letterSpacing:".06em", textTransform:"uppercase", marginBottom:16 }}>Base unit: {data.baseUnit}px</p>
        <div style={{ display:"flex", alignItems:"flex-end", gap:10, flexWrap:"wrap" }}>
          {data.scale.map((val) => (
            <div key={val} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
              <div style={{ width:24, height:Math.max(6, val*1.8), background:`rgba(10,132,255,${0.25+0.75*(val/max)})`, borderRadius:3 }} />
              <span style={{ fontSize:10, color:"#AAA", fontFamily:"monospace" }}>{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ComponentRenderer({ component, colorTokens }) {
  const resolve = (v) => resolveColor(v, colorTokens);
  const { name, base, variants } = component;
  const renderV = (v) => {
    const bp = base.properties, vp = v.properties;
    const st = { ...bp, backgroundColor:resolve(vp.backgroundColor), color:resolve(vp.textColor||vp.color), fontFamily:"inherit" };
    if (vp.border) st.border = vp.border;
    if (vp.borderColor) st.borderColor = resolve(vp.borderColor);
    if (name==="Button") return <button key={v.name} style={st}>{v.name.charAt(0).toUpperCase()+v.name.slice(1)}</button>;
    if (name==="Badge") return <span key={v.name} style={st}>{v.name}</span>;
    if (name==="Input") return <input key={v.name} readOnly placeholder={`${v.name} state`} style={{ ...st, boxSizing:"border-box" }} />;
    return <div key={v.name} style={{ ...st, padding:"8px 14px" }}>{v.name}</div>;
  };
  return (
    <div style={{ marginBottom:20 }}>
      <p style={{ fontSize:13, fontWeight:700, color:"#333", marginBottom:10 }}>{name}</p>
      <div style={{ display:"flex", flexWrap:"wrap", gap:10, alignItems:"center" }}>
        {variants.map((v) => (
          <div key={v.name} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
            {renderV(v)}
            <span style={{ fontSize:10, color:"#CCC", fontWeight:700, textTransform:"uppercase", letterSpacing:".06em" }}>{v.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SingleComponents({ data, colorTokens }) {
  return (
    <div style={BASE.sec}>
      <SH title="Components" />
      <div style={BASE.card}>
        {data.map((comp, i) => (
          <div key={comp.name}>
            <ComponentRenderer component={comp} colorTokens={colorTokens} />
            {i<data.length-1 && <div style={{ height:1, background:"#F4F4F4", margin:"4px 0 18px" }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function Inconsistencies({ data }) {
  return (
    <div style={BASE.sec}>
      <SH title="Inconsistencies" />
      <div style={BASE.card}>
        {data.map((issue, i) => (
          <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"11px 0", borderBottom:i<data.length-1?"1px solid #F6F6F6":"none" }}>
            <div style={{ width:20, height:20, borderRadius:6, background:"#FFF3CD", color:"#856404", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, flexShrink:0, marginTop:1 }}>!</div>
            <p style={{ fontSize:13, color:"#555", lineHeight:1.6 }}>{issue}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SingleViewer({ analysis }) {
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:32 }}>
        <div>
          <h2 style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.7px", marginBottom:4 }}>Design System</h2>
          <p style={{ fontSize:13, color:"#AAA" }}>Extracted from your screenshots</p>
        </div>
        <span style={{ fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:99, background:"#E9F9EF", color:"#1A7A3A" }}>✓ {analysis.meta.confidence} confidence</span>
      </div>
      <Colors data={analysis.colors} />
      <Typography data={analysis.typography} />
      <Spacing data={analysis.spacing} />
      <SingleComponents data={analysis.components} colorTokens={analysis.colors.tokens} />
      <Inconsistencies data={analysis.inconsistencies} />
    </div>
  );
}

function SkeletonSingle() {
  const B = ({ w, h, mb = 10 }) => <div style={{ ...BASE.shimmer, width:w, height:h, marginBottom:mb, borderRadius:6 }} />;
  return (
    <div style={{ paddingTop:8 }}>
      <B w="40%" h={26} mb={8} /><B w="25%" h={13} mb={32} />
      <div style={{ display:"flex", gap:10, marginBottom:32 }}>{[...Array(6)].map((_,i)=><div key={i} style={{ flex:1 }}><B w="100%" h={88} /></div>)}</div>
      <B w="30%" h={13} mb={14} />
      {[...Array(4)].map((_,i)=><B key={i} w="100%" h={26} mb={9} />)}
    </div>
  );
}

// ─── Benchmark ────────────────────────────────────────────────────────────────

function BrandInputCard({ brand, index, color, onChange, onRemove, canRemove }) {
  return (
    <div className="brand-card" style={{ background:"#FFF", borderRadius:14, border:"1px solid #EBEBEB", padding:20, transition:"border-color .15s", animation:"popIn .25s ease both" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"#FFF" }}>{index+1}</div>
          <span style={{ fontSize:13, fontWeight:700 }}>Brand {index+1}</span>
        </div>
        {canRemove && <button className="remove-x" onClick={onRemove} style={{ background:"none", border:"none", cursor:"pointer", color:"#CCC", fontSize:18, fontWeight:700, lineHeight:1, padding:2 }}>×</button>}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        <div>
          <label style={{ fontSize:10, fontWeight:700, color:"#BBB", textTransform:"uppercase", letterSpacing:".07em", display:"block", marginBottom:5 }}>Brand name</label>
          <input type="text" placeholder="e.g. Stripe, Linear, Notion…" value={brand.name} onChange={(e)=>onChange({...brand,name:e.target.value})} style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:"1.5px solid #E5E5E5", fontSize:13, color:"#111", fontFamily:"inherit", background:"#FAFAFA" }} />
        </div>
        <div>
          <label style={{ fontSize:10, fontWeight:700, color:"#BBB", textTransform:"uppercase", letterSpacing:".07em", display:"block", marginBottom:5 }}>URL</label>
          <input type="text" placeholder="https://stripe.com" value={brand.url} onChange={(e)=>onChange({...brand,url:e.target.value})} style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:"1.5px solid #E5E5E5", fontSize:13, color:"#111", fontFamily:"inherit", background:"#FAFAFA" }} />
        </div>
        <div>
          <label style={{ fontSize:10, fontWeight:700, color:"#BBB", textTransform:"uppercase", letterSpacing:".07em", display:"block", marginBottom:5 }}>Screenshots ({brand.images.length}/3 optional)</label>
          <Upload images={brand.images} onAdd={(img)=>onChange({...brand,images:[...brand.images,img].slice(0,3)})} onRemove={(i)=>onChange({...brand,images:brand.images.filter((_,idx)=>idx!==i)})} onAnalyze={()=>{}} loading={false} maxImages={3} btnLabel="Add screenshots" btnColor={color} />
        </div>
      </div>
    </div>
  );
}

function BenchmarkInput({ brands, onChange, onRun, loading }) {
  const canRun = brands.length >= 2 && brands.every((b) => b.name.trim() || b.url.trim());
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))", gap:16, marginBottom:20 }}>
        {brands.map((brand, i) => (
          <BrandInputCard key={i} brand={brand} index={i} color={ACCENT_POOL[i%ACCENT_POOL.length]} onChange={(u)=>onChange(brands.map((b,idx)=>idx===i?u:b))} onRemove={()=>onChange(brands.filter((_,idx)=>idx!==i))} canRemove={brands.length>2} />
        ))}
        {brands.length < 4 && (
          <button className="add-brand" onClick={()=>onChange([...brands,{name:"",url:"",images:[]}])} style={{ background:"#FAFAFA", border:"2px dashed #E0E0E0", borderRadius:14, padding:24, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, transition:"all .15s", minHeight:120, fontFamily:"inherit" }}>
            <div style={{ width:34, height:34, borderRadius:9, background:"#EBEBEB", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, color:"#AAA" }}>+</div>
            <span style={{ fontSize:13, fontWeight:600, color:"#BBB" }}>Add brand {brands.length+1}</span>
          </button>
        )}
      </div>
      <button onClick={onRun} disabled={loading||!canRun} style={{ width:"100%", padding:"14px", borderRadius:10, background:loading||!canRun?"#E8E8E8":"#111", color:loading||!canRun?"#AAA":"#FFF", border:"none", fontSize:15, fontWeight:700, cursor:loading||!canRun?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, fontFamily:"inherit", letterSpacing:"-0.2px", transition:"background .15s" }}>
        {loading ? <><div style={BASE.spinner}/>Running deep analysis...</> : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>Run Benchmark — {brands.length} brands</>}
      </button>
      {!canRun && <p style={{ fontSize:12, color:"#CCC", textAlign:"center", marginTop:10 }}>Enter at least 2 brand names or URLs to compare</p>}
    </div>
  );
}

function RadarChart({ brands, accentColors }) {
  const keys = Object.keys(SCORE_LABELS);
  const cx=200, cy=200, r=130, n=keys.length;
  const ang = (i) => (i*2*Math.PI/n) - Math.PI/2;
  const pt = (i, val) => { const a=ang(i), d=(val/100)*r; return [cx+d*Math.cos(a), cy+d*Math.sin(a)]; };
  return (
    <svg viewBox="0 0 400 400" style={{ width:"100%", maxWidth:360, display:"block", margin:"0 auto" }}>
      {[25,50,75,100].map((pct) => <polygon key={pct} points={keys.map((_,i)=>pt(i,pct).join(",")).join(" ")} fill="none" stroke="#EBEBEB" strokeWidth={1}/>)}
      {keys.map((_,i) => { const [x,y]=pt(i,100); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#EBEBEB" strokeWidth={1}/>; })}
      {keys.map((key,i) => { const [x,y]=pt(i,114); return <text key={key} x={x} y={y} textAnchor="middle" dominantBaseline="central" style={{ fontSize:9.5, fill:"#BBB", fontFamily:"'DM Sans',sans-serif", fontWeight:700 }}>{SCORE_LABELS[key]}</text>; })}
      {Object.entries(brands).map(([key, brand]) => {
        const color=accentColors[key], pts=keys.map((k,i)=>pt(i,brand.scores[k]).join(",")).join(" ");
        return (
          <g key={key}>
            <polygon points={pts} fill={color+"1A"} stroke={color} strokeWidth={2}/>
            {keys.map((k,i) => { const [x,y]=pt(i,brand.scores[k]); return <circle key={k} cx={x} cy={y} r={3.5} fill={color}/>; })}
          </g>
        );
      })}
    </svg>
  );
}

function BrandCard({ brandKey, brandData, color, rank }) {
  const scores = brandData.scores;
  const overall = Math.round(Object.values(scores).reduce((a,b)=>a+b,0)/Object.values(scores).length);
  return (
    <div style={{ background:"#FFF", borderRadius:16, border:rank===1?`2px solid ${color}`:"1px solid #EBEBEB", padding:22, animation:"popIn .3s ease both", position:"relative", overflow:"hidden" }}>
      {rank===1 && <div style={{ position:"absolute", top:0, right:0, background:color, color:"#FFF", fontSize:9, fontWeight:800, padding:"4px 12px", borderBottomLeftRadius:8, letterSpacing:".07em" }}>TOP RANKED</div>}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
        <div style={{ width:38, height:38, borderRadius:10, background:color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, fontWeight:800, color:"#FFF", flexShrink:0 }}>{brandData.brandName.charAt(0)}</div>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:15, fontWeight:800, letterSpacing:"-0.3px", marginBottom:2 }}>{brandData.brandName}</p>
          <p style={{ fontSize:11, color:"#BBB" }}>{brandData.url}</p>
        </div>
        <div style={{ textAlign:"right" }}>
          <p style={{ fontSize:26, fontWeight:800, letterSpacing:"-1px", color }}>{overall}</p>
          <p style={{ fontSize:10, color:"#CCC", fontWeight:700, textTransform:"uppercase", letterSpacing:".06em" }}>Overall</p>
        </div>
      </div>
      <div style={{ display:"flex", gap:4, marginBottom:14, flexWrap:"wrap" }}>
        {brandData.colors.slice(0,6).map((c,i)=><div key={i} style={{ width:18, height:18, borderRadius:5, background:c, border:"1px solid rgba(0,0,0,.06)" }}/>)}
        <span style={{ fontSize:11, color:"#CCC", alignSelf:"center", marginLeft:4 }}>{brandData.fontFamily}</span>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:7, marginBottom:14 }}>
        {Object.entries(scores).map(([k,v],i)=>(
          <div key={k}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
              <span style={{ fontSize:11, color:"#999", fontWeight:600 }}>{SCORE_LABELS[k]}</span>
            </div>
            <ScoreBar score={v} color={color} delay={i*.05}/>
          </div>
        ))}
      </div>
      <div style={{ padding:"12px 14px", background:"#FAFAFA", borderRadius:10, border:"1px solid #F0F0F0", marginBottom:12 }}>
        <p style={{ fontSize:12, color:"#666", lineHeight:1.65 }}>{brandData.summary}</p>
      </div>
      <div>
        <p style={{ fontSize:10, fontWeight:700, color:"#BBB", textTransform:"uppercase", letterSpacing:".07em", marginBottom:7 }}>Strengths</p>
        {brandData.strengths.slice(0,3).map((s,i)=>(
          <div key={i} style={{ display:"flex", gap:7, marginBottom:5 }}>
            <span style={{ color:"#30D158", fontSize:12, marginTop:1 }}>✓</span>
            <span style={{ fontSize:12, color:"#555", lineHeight:1.5 }}>{s}</span>
          </div>
        ))}
        <p style={{ fontSize:10, fontWeight:700, color:"#BBB", textTransform:"uppercase", letterSpacing:".07em", margin:"10px 0 7px" }}>Weaknesses</p>
        {brandData.weaknesses.slice(0,2).map((s,i)=>(
          <div key={i} style={{ display:"flex", gap:7, marginBottom:5 }}>
            <span style={{ color:"#FF9500", fontSize:12, marginTop:1 }}>△</span>
            <span style={{ fontSize:12, color:"#555", lineHeight:1.5 }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RankingsTable({ rankings, brands, accentColors }) {
  const categories = Object.keys(rankings).filter(k=>k!=="overall");
  return (
    <div style={BASE.card}>
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr>
              <th style={{ textAlign:"left", padding:"8px 12px 14px 0", fontSize:10, fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", color:"#CCC", whiteSpace:"nowrap" }}>Dimension</th>
              {["🥇 1st","🥈 2nd","🥉 3rd","4th"].slice(0,Object.values(brands).length).map((label,i)=>(
                <th key={i} style={{ textAlign:"left", padding:"8px 12px 14px", fontSize:10, fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", color:"#CCC" }}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((cat,ri)=>(
              <tr key={cat} style={{ borderTop:"1px solid #F4F4F4" }}>
                <td style={{ padding:"10px 12px 10px 0", fontWeight:600, color:"#666", fontSize:12, whiteSpace:"nowrap" }}>{SCORE_LABELS[cat]||cat}</td>
                {(rankings[cat]||[]).map((key,ci)=>{
                  const brand=brands[key], color=accentColors[key];
                  if(!brand) return <td key={ci}/>;
                  return (
                    <td key={ci} style={{ padding:"10px 12px" }}>
                      <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 10px", borderRadius:99, background:ci===0?color+"18":"#F5F5F5", border:ci===0?`1px solid ${color}40`:"none" }}>
                        <span style={{ fontSize:12, fontWeight:700, color:ci===0?color:"#777" }}>{brand.brandName}</span>
                        <span style={{ fontSize:11, color:ci===0?color+"AA":"#BBB", fontWeight:600 }}>{brand.scores[cat]}</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InsightsList({ insights }) {
  const icons = { gap:{i:"↕",bg:"#EEF2FF",c:"#4338CA"}, tie:{i:"≈",bg:"#F0FDF4",c:"#15803D"}, warning:{i:"!",bg:"#FFF7ED",c:"#C2410C"}, insight:{i:"→",bg:"#F0F9FF",c:"#0369A1"} };
  return (
    <div style={BASE.card}>
      {insights.map((item,i)=>{
        const st=icons[item.type]||icons.insight;
        return (
          <div key={i} style={{ display:"flex", gap:10, padding:"11px 0", borderBottom:i<insights.length-1?"1px solid #F6F6F6":"none" }}>
            <div style={{ width:22, height:22, borderRadius:6, background:st.bg, color:st.c, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, flexShrink:0, marginTop:1 }}>{st.i}</div>
            <p style={{ fontSize:13, color:"#555", lineHeight:1.65 }}>{item.text}</p>
          </div>
        );
      })}
    </div>
  );
}

function BenchmarkViewer({ result }) {
  const { brands, rankings, insights, overview, winner } = result;
  const brandKeys = Object.keys(brands);
  const accentColors = {};
  brandKeys.forEach((k, i) => { accentColors[k] = brands[k].primaryColor || ACCENT_POOL[i%ACCENT_POOL.length]; });
  const sorted = [...brandKeys].sort((a,b) => {
    const avg = (k) => Object.values(brands[k].scores).reduce((s,v)=>s+v,0);
    return avg(b)-avg(a);
  });

  return (
    <div style={{ animation:"fadeUp .4s ease both" }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:36, gap:20, flexWrap:"wrap" }}>
        <div>
          <h2 style={{ fontSize:26, fontWeight:800, letterSpacing:"-0.9px", marginBottom:6 }}>Brand Benchmark</h2>
          <p style={{ fontSize:13, color:"#AAA" }}>{brandKeys.length} brands · AI design analysis · 7 dimensions</p>
        </div>
        {winner && brands[winner] && (
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 16px", background:"#FFF", borderRadius:12, border:`2px solid ${accentColors[winner]}40` }}>
            <span style={{ fontSize:22 }}>🏆</span>
            <div>
              <p style={{ fontSize:10, fontWeight:700, color:"#BBB", textTransform:"uppercase", letterSpacing:".07em", marginBottom:2 }}>Top Ranked</p>
              <p style={{ fontSize:15, fontWeight:800, letterSpacing:"-0.3px" }}>{brands[winner].brandName}</p>
            </div>
          </div>
        )}
      </div>

      <div style={BASE.sec}>
        <SH title="AI Overview" />
        <div style={{ ...BASE.card, fontSize:14, color:"#555", lineHeight:1.75 }}>{overview}</div>
      </div>

      <div style={BASE.sec}>
        <SH title="Overall Rankings" />
        <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
          {sorted.map((key,i)=>{
            const brand=brands[key], color=accentColors[key];
            const overall=Math.round(Object.values(brand.scores).reduce((a,b)=>a+b,0)/Object.values(brand.scores).length);
            return (
              <div key={key} style={{ flex:"1 1 200px", background:"#FFF", borderRadius:12, border:i===0?`2px solid ${color}`:"1px solid #EBEBEB", padding:"16px 18px", display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:24 }}>{"🥇🥈🥉🎖"[i]||"🎖"}</span>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:14, fontWeight:800, letterSpacing:"-0.2px", marginBottom:5 }}>{brand.brandName}</p>
                  <ScoreBar score={overall} color={color}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={BASE.sec}>
        <SH title="Radar Comparison" />
        <div style={BASE.card}>
          <RadarChart brands={brands} accentColors={accentColors}/>
          <div style={{ display:"flex", flexWrap:"wrap", gap:14, marginTop:16, justifyContent:"center" }}>
            {brandKeys.map((k)=>(
              <div key={k} style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:10, height:10, borderRadius:3, background:accentColors[k] }}/>
                <span style={{ fontSize:12, fontWeight:600, color:"#666" }}>{brands[k].brandName}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={BASE.sec}>
        <SH title="Rankings by Dimension" />
        <RankingsTable rankings={rankings} brands={brands} accentColors={accentColors}/>
      </div>

      <div style={BASE.sec}>
        <SH title="AI Insights" />
        <InsightsList insights={insights}/>
      </div>

      <div style={BASE.sec}>
        <SH title="Individual Reports" />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:18 }}>
          {sorted.map((key,rank)=><BrandCard key={key} brandKey={key} brandData={brands[key]} color={accentColors[key]} rank={rank+1}/>)}
        </div>
      </div>
    </div>
  );
}

function SkeletonBenchmark() {
  const B = ({ w, h, mb=10 }) => <div style={{ ...BASE.shimmer, width:w, height:h, marginBottom:mb, borderRadius:8 }}/>;
  return (
    <div style={{ paddingTop:8 }}>
      <B w="40%" h={28} mb={8}/><B w="28%" h={14} mb={32}/>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))", gap:16 }}>
        {[...Array(4)].map((_,i)=><B key={i} w="100%" h={440}/>)}
      </div>
    </div>
  );
}

// ─── API layer ────────────────────────────────────────────────────────────────

async function analyzeImages(images) {
  // Real: POST base64 images to Anthropic API, parse JSON response
  await new Promise((r)=>setTimeout(r,2000));
  return MOCK_SINGLE_ANALYSIS;
}

async function analyzeBenchmark(brands) {
  // Real: POST brand info + screenshots to Anthropic API asking for
  // structured JSON: scores (7 dimensions per brand), rankings, insights,
  // strengths/weaknesses, summary, colors, fontFamily per brand
  await new Promise((r)=>setTimeout(r,3000));
  const mockKeys = Object.keys(BRAND_MOCK);
  const result = {
    overview: MOCK_BENCHMARK_INSIGHTS.map(i=>i.text).slice(0,2).join(" "),
    insights: MOCK_BENCHMARK_INSIGHTS,
    brands: {},
    rankings: {},
    winner: "",
  };
  brands.forEach((b, i) => {
    const key = (b.name||`brand${i}`).toLowerCase().replace(/\s+/g,"_");
    const mock = BRAND_MOCK[mockKeys[i%mockKeys.length]];
    result.brands[key] = { ...mock, brandName: b.name||mock.brandName, url: b.url||mock.url };
  });
  const bKeys = Object.keys(result.brands);
  Object.keys(SCORE_LABELS).forEach(cat => {
    result.rankings[cat] = [...bKeys].sort((a,b)=>(result.brands[b].scores[cat]||0)-(result.brands[a].scores[cat]||0));
  });
  result.rankings.overall = [...bKeys].sort((a,b)=>{
    const avg=(k)=>Object.values(result.brands[k].scores).reduce((s,v)=>s+v,0);
    return avg(b)-avg(a);
  });
  result.winner = result.rankings.overall[0];
  result.overview = `This benchmark compares ${brands.map(b=>b.name||"a brand").join(", ")}. ${MOCK_BENCHMARK_INSIGHTS[0].text} ${MOCK_BENCHMARK_INSIGHTS[3].text}`;
  return result;
}

// ─── App root ─────────────────────────────────────────────────────────────────

export default function App() {
  const [mode, setMode] = useState("extract");

  const [images, setImages] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loadingE, setLoadingE] = useState(false);

  const [brandInputs, setBrandInputs] = useState([{name:"",url:"",images:[]},{name:"",url:"",images:[]}]);
  const [benchmark, setBenchmark] = useState(null);
  const [loadingB, setLoadingB] = useState(false);

  const runExtract = async () => {
    if (!images.length||loadingE) return;
    setLoadingE(true); setAnalysis(null);
    try { setAnalysis(await analyzeImages(images)); } catch(e){console.error(e);} finally { setLoadingE(false); }
  };

  const runBenchmark = async () => {
    if (loadingB) return;
    setLoadingB(true); setBenchmark(null);
    try { setBenchmark(await analyzeBenchmark(brandInputs)); } catch(e){console.error(e);} finally { setLoadingB(false); }
  };

  const showHero = mode==="extract" ? (!analysis&&!loadingE) : (!benchmark&&!loadingB);

  return (
    <div style={BASE.app}>
      <style>{GLOBAL_CSS}</style>

      <header style={BASE.header}>
        <div style={BASE.logo}>
          <div style={BASE.logoDot}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          Design DNA
        </div>

        <div style={BASE.pills}>
          {[["extract","Extract"],["benchmark","Benchmark"]].map(([v,l])=>(
            <button key={v} className="tab-btn" onClick={()=>setMode(v)} style={{ ...BASE.pill, ...(mode===v?{ background:"#FFF", color:"#111", boxShadow:"0 1px 4px rgba(0,0,0,.09)" }:{ background:"transparent", color:"#999" }) }}>{l}</button>
          ))}
        </div>

        <span style={{ fontSize:11, fontWeight:600, background:"#F2F2F2", color:"#777", padding:"2px 8px", borderRadius:99 }}>AI-powered</span>
      </header>

      <main style={BASE.main}>
        {showHero && (
          <div style={BASE.hero}>
            {mode==="extract" ? (
              <>
                <h1 style={BASE.heroTitle}>Extract your design system</h1>
                <p style={BASE.heroSub}>Upload product screenshots — get a living design system in seconds.</p>
              </>
            ) : (
              <>
                <h1 style={BASE.heroTitle}>Benchmark competing brands</h1>
                <p style={BASE.heroSub}>Compare 2–4 products side-by-side with deep AI design ratings.</p>
              </>
            )}
          </div>
        )}

        {mode==="extract" && (
          <>
            <div style={{ maxWidth:520, margin:"0 auto 48px", animation:"fadeUp .5s .1s ease both" }}>
              <Upload images={images} onAdd={(img)=>setImages(p=>p.length<5?[...p,img]:p)} onRemove={(i)=>setImages(p=>p.filter((_,idx)=>idx!==i))} onAnalyze={runExtract} loading={loadingE} />
            </div>
            {loadingE && <SkeletonSingle/>}
            {analysis && <SingleViewer analysis={analysis}/>}
          </>
        )}

        {mode==="benchmark" && (
          <>
            <div style={{ animation:"fadeUp .5s .1s ease both", marginBottom:48 }}>
              <BenchmarkInput brands={brandInputs} onChange={setBrandInputs} onRun={runBenchmark} loading={loadingB}/>
            </div>
            {loadingB && <SkeletonBenchmark/>}
            {benchmark && <BenchmarkViewer result={benchmark}/>}
          </>
        )}
      </main>
    </div>
  );
}
