/* ============================================================
   App shell: Sidebar + Topbar + router + mount
   ============================================================ */
const { Icon: I, Avatar: Avt } = window;
const P = window.Pages;
const TD = window.DATA;

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "layout-dashboard" },
  { id: "fleet",     label: "Armada",    icon: "car-front" },
  { id: "bookings",  label: "Booking",   icon: "calendar-days", badge: TD.summary.bookingsToday },
  { id: "customers", label: "Pelanggan", icon: "users" },
  { id: "gps",       label: "GPS Tracking", icon: "map-pin" },
  { id: "reports",   label: "Laporan",   icon: "chart-column" },
];
const NAV2 = [
  { id: "settings",  label: "Pengaturan", icon: "settings" },
];

const TITLES = {
  dashboard: "Dashboard", fleet: "Armada", bookings: "Booking",
  customers: "Pelanggan", gps: "GPS Tracking", reports: "Laporan", settings: "Pengaturan",
};

function Sidebar({ page, setPage, collapsed }) {
  const item = (n) => (
    <button key={n.id}
      className={"nav-item" + (page === n.id ? " is-active" : "")}
      onClick={() => setPage(n.id)} title={collapsed ? n.label : ""}>
      <I name={n.icon} size={19} stroke={2} />
      {!collapsed && <span className="nav-label">{n.label}</span>}
      {!collapsed && n.badge != null && <span className="nav-badge">{n.badge}</span>}
    </button>
  );
  return (
    <aside className={"sidebar" + (collapsed ? " is-collapsed" : "")}>
      <div className="brand">
        <span className="brand-mark"><I name="car-front" size={20} stroke={2.2} /></span>
        {!collapsed && (
          <div className="brand-text">
            <strong>Rajawali</strong>
            <span>Rentcar</span>
          </div>
        )}
      </div>

      <div className="branch-pick" title="Cabang aktif">
        <span className="branch-ico"><I name="git-branch" size={16} /></span>
        {!collapsed && <><span className="branch-name">Semua Cabang</span><I name="chevrons-up-down" size={15} className="muted" /></>}
      </div>

      <nav className="nav">
        {!collapsed && <p className="nav-section">Menu</p>}
        {NAV.map(item)}
        <div className="nav-gap"></div>
        {!collapsed && <p className="nav-section">Sistem</p>}
        {NAV2.map(item)}
      </nav>

      <div className="side-foot">
        <div className="plan-card">
          {!collapsed ? (
            <>
              <div className="plan-row">
                <span className="plan-badge">PRO</span>
                <span className="plan-trial">Trial · 9 hari</span>
              </div>
              <div className="plan-bar"><div style={{ width: "64%" }}></div></div>
              <p className="plan-usage">37 / 50 unit terpakai</p>
              <button className="upgrade-btn"><I name="zap" size={14} />Upgrade</button>
            </>
          ) : (
            <span className="plan-badge">PRO</span>
          )}
        </div>
      </div>
    </aside>
  );
}

function Topbar({ title, collapsed, setCollapsed, theme, setTheme }) {
  return (
    <header className="topbar">
      <div className="row gap-12 ai-center">
        <button className="icon-btn" onClick={() => setCollapsed(!collapsed)} title="Sembunyikan menu">
          <I name={collapsed ? "panel-left-open" : "panel-left-close"} size={19} />
        </button>
        <nav className="crumbs">
          <span className="muted">Rajawali</span>
          <I name="chevron-right" size={14} className="muted" />
          <span className="crumb-current">{title}</span>
        </nav>
      </div>

      <div className="topbar-search" onClick={(e)=>e.currentTarget.querySelector('input').focus()}>
        <I name="search" size={16} className="muted" />
        <input placeholder="Cari plat, pelanggan, booking…" />
        <kbd>⌘K</kbd>
      </div>

      <div className="row gap-6 ai-center">
        <button className="icon-btn" title="Mode tampilan"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          <I name={theme === "dark" ? "sun" : "moon"} size={18} />
        </button>
        <button className="icon-btn has-dot" title="Notifikasi"><I name="bell" size={18} /><span className="ndot"></span></button>
        <button className="icon-btn" title="Bantuan"><I name="circle-help" size={18} /></button>
        <div className="user-chip">
          <Avt name="Hendra Wijaya" size={30} tone="#0284C7" />
          <div className="user-text">
            <strong>Pak Hendra</strong>
            <span>Owner</span>
          </div>
          <I name="chevron-down" size={15} className="muted" />
        </div>
      </div>
    </header>
  );
}

function App() {
  const [page, setPage] = React.useState("dashboard");
  const [collapsed, setCollapsed] = React.useState(false);
  const [theme, setTheme] = React.useState(() => localStorage.getItem("rr-theme") || "light");

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("rr-theme", theme);
  }, [theme]);

  const render = () => {
    switch (page) {
      case "dashboard": return <P.Dashboard />;
      case "fleet":     return <P.Fleet />;
      case "bookings":  return <P.Bookings />;
      case "customers": return <P.Customers />;
      case "gps":       return <P.Gps />;
      case "reports":   return <P.EmptyState icon="chart-column" title="Laporan & Analitik"
                          desc="Laporan utilisasi armada, pendapatan per cabang, dan laporan pajak siap pakai akan tampil di sini." />;
      case "settings":  return <P.EmptyState icon="settings" title="Pengaturan Tenant"
                          desc="Profil bisnis, nomor WhatsApp, staff & role, serta langganan dikelola di halaman ini." />;
      default: return null;
    }
  };

  return (
    <div className="shell">
      <Sidebar page={page} setPage={setPage} collapsed={collapsed} />
      <div className="main">
        <Topbar title={TITLES[page]} collapsed={collapsed} setCollapsed={setCollapsed} theme={theme} setTheme={setTheme} />
        <main className="scroll" key={page}>{render()}</main>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
