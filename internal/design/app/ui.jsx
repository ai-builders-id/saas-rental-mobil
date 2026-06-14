/* ============================================================
   UI primitives — exported to window
   ============================================================ */
const { useState, useEffect, useRef } = React;

/* ---- Icon (Lucide via createElement, React-safe) ---- */
const _pascal = (s) =>
  s.split(/[-_ ]/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");

function Icon({ name, size = 18, stroke = 2, className = "", style = {} }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = "";
    const lib = window.lucide;
    try {
      if (lib && lib.icons && lib.createElement) {
        const node = lib.icons[_pascal(name)] || lib.icons[name];
        if (node) {
          const svg = lib.createElement(node);
          svg.setAttribute("width", size);
          svg.setAttribute("height", size);
          svg.setAttribute("stroke-width", stroke);
          el.appendChild(svg);
          return;
        }
      }
    } catch (e) {}
    // fallback dot
    const dot = document.createElement("span");
    dot.style.cssText = `width:${size * 0.5}px;height:${size * 0.5}px;border-radius:50%;background:currentColor;opacity:.4;display:block`;
    el.appendChild(dot);
  }, [name, size, stroke]);
  return (
    <span
      ref={ref}
      className={"icon " + className}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, fl: "0 0 auto", ...style }}
    ></span>
  );
}

/* ---- Status badge ---- */
function StatusBadge({ status, dot = true }) {
  const meta = window.DATA.STATUS[status] || { label: status, tone: "inspection" };
  return (
    <span className={"badge tone-" + meta.tone}>
      {dot && <span className="badge-dot"></span>}
      {meta.label}
    </span>
  );
}

function Badge({ tone = "neutral", children, soft = true }) {
  return <span className={"badge " + (soft ? "tone-" + tone : "solid-" + tone)}>{children}</span>;
}

/* ---- Card ---- */
function Card({ title, subtitle, action, children, className = "", pad = true, bodyClass = "" }) {
  return (
    <section className={"card " + className}>
      {(title || action) && (
        <header className="card-head">
          <div className="card-head-text">
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-sub">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={(pad ? "card-body" : "") + " " + bodyClass}>{children}</div>
    </section>
  );
}

/* ---- Button ---- */
function Button({ variant = "default", size = "md", icon, iconRight, children, onClick, active, title }) {
  return (
    <button
      className={`btn btn-${variant} btn-${size}` + (active ? " is-active" : "")}
      onClick={onClick}
      title={title}
    >
      {icon && <Icon name={icon} size={size === "sm" ? 15 : 16} />}
      {children && <span>{children}</span>}
      {iconRight && <Icon name={iconRight} size={size === "sm" ? 15 : 16} />}
    </button>
  );
}

/* ---- Segmented control ---- */
function Segmented({ options, value, onChange }) {
  return (
    <div className="seg">
      {options.map((o) => (
        <button
          key={o.value}
          className={"seg-item" + (value === o.value ? " is-on" : "")}
          onClick={() => onChange(o.value)}
        >
          {o.icon && <Icon name={o.icon} size={15} />}
          {o.label && <span>{o.label}</span>}
        </button>
      ))}
    </div>
  );
}

/* ---- Sparkline ---- */
function Sparkline({ data, tone = "primary", w = 96, h = 30 }) {
  const max = Math.max(...data), min = Math.min(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / span) * (h - 4) - 2;
    return [x, y];
  });
  const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = d + ` L ${w} ${h} L 0 ${h} Z`;
  const gid = "sg-" + tone;
  return (
    <svg width={w} height={h} className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={`var(--${tone})`} stopOpacity="0.22" />
          <stop offset="100%" stopColor={`var(--${tone})`} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={d} fill="none" stroke={`var(--${tone})`} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---- Bar chart ---- */
function BarChart({ data, height = 200 }) {
  const max = Math.max(...data.map((d) => d.value));
  const niceMax = Math.ceil(max);
  const [hover, setHover] = useState(null);
  return (
    <div className="barchart" style={{ height }}>
      <div className="bc-grid">
        {[1, 0.75, 0.5, 0.25, 0].map((f, i) => (
          <div className="bc-line" key={i}>
            <span className="bc-axis">{(niceMax * f).toFixed(1).replace(".0", "")}</span>
          </div>
        ))}
      </div>
      <div className="bc-bars">
        {data.map((d, i) => (
          <div
            className="bc-col"
            key={i}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            {hover === i && <div className="bc-tip">Rp {d.value.toFixed(1)} jt</div>}
            <div
              className={"bc-bar" + (hover === i ? " is-hot" : "")}
              style={{ height: (d.value / niceMax) * 100 + "%" }}
            ></div>
            <span className="bc-label">{d.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- Donut ---- */
function Donut({ data, size = 132, thickness = 16 }) {
  const total = data.map((d) => d.value).reduce((a, b) => a + b, 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="donut-wrap">
      <svg width={size} height={size} className="donut">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-subtle)" strokeWidth={thickness} />
        {data.map((d, i) => {
          const len = (d.value / total) * c;
          const seg = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={`var(--st-${d.tone})`}
              strokeWidth={thickness}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
          offset += len;
          return seg;
        })}
      </svg>
      <div className="donut-center">
        <strong>{total}</strong>
        <span>unit</span>
      </div>
    </div>
  );
}

/* ---- Avatar ---- */
function Avatar({ name, size = 32, tone }) {
  const initials = name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const hues = ["#0284C7", "#7C3AED", "#0F766E", "#B45309", "#BE185D", "#4338CA"];
  const hue = tone || hues[name.charCodeAt(0) % hues.length];
  return (
    <span className="avatar" style={{ width: size, height: size, background: hue, fontSize: size * 0.38 }}>
      {initials}
    </span>
  );
}

/* ---- Rating stars ---- */
function Rating({ value }) {
  return (
    <span className="rating">
      <Icon name="star" size={13} className="star-on" stroke={2.2} />
      <span className="rating-num">{value.toFixed(1)}</span>
    </span>
  );
}

Object.assign(window, {
  Icon, StatusBadge, Badge, Card, Button, Segmented, Sparkline, BarChart, Donut, Avatar, Rating,
});
