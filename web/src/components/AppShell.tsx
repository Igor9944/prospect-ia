import { useEffect, useState, type ReactNode } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Avatar, Icon, LogoBrand } from "./Brand";
import { api, type CampaignDto } from "../lib/api";

const nav = [
  { to: "/app/campagnes", label: "Vue d'ensemble", icon: "/assets/icon-layout.svg" },
  { to: "/app/prospects", label: "Prospects", icon: "/assets/icon-target.svg" },
  { to: "/app/scoring", label: "Filtres & Scoring IA", icon: "/assets/icon-sparkles.svg" },
  { to: "/app/sequences", label: "Séquences & Relances", icon: "/assets/icon-mail-nav.svg" },
  { to: "/app/stats", label: "Statistiques", icon: "/assets/icon-chart.svg" },
  { to: "/app/parametres", label: "Paramètres", icon: "/assets/icon-settings.svg" },
];

export default function AppShell() {
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<CampaignDto | null>(null);
  const [prospectCount, setProspectCount] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([api.campaigns(), api.prospects()])
      .then(([campaigns, prospects]) => {
        setCampaign(campaigns.find((c) => c.status === "Active") ?? campaigns[0] ?? null);
        setProspectCount(prospects.length);
      })
      .catch(() => undefined);
  }, []);

  return (
    <div className="shell">
      <aside className="sidebar">
        <div>
          <LogoBrand variant="dark" markSize={40} />
          <div className="campaign-box">
            <div className="k">Campagne active</div>
            <div style={{ fontWeight: 600, fontSize: 13, marginTop: 4 }}>
              {campaign?.name ?? "non disponible"}
            </div>
            <div style={{ color: "#10b981", fontSize: 11, marginTop: 6 }}>
              ● {campaign?.status ?? "—"}
            </div>
          </div>
          <nav>
            {nav.map((item) => (
              <NavLink key={item.to} to={item.to} end className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
                <Icon src={item.icon} size={20} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.to === "/app/prospects" && prospectCount !== null ? (
                  <span className="badge">{prospectCount}</span>
                ) : null}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="user-row">
          <Avatar />
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Compte local</div>
            <div style={{ color: "#8e9bb3", fontSize: 12 }}>Auth Supabase à brancher</div>
          </div>
        </div>
      </aside>
      <main className="main">
        <Outlet context={{ navigate }} />
      </main>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  extra,
}: {
  title: string;
  subtitle: string;
  extra?: ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <div className="header">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="header-actions">
        {extra}
        <label className="search">
          <Icon src="/assets/icon-search-nav.svg" size={16} />
          <input placeholder="Rechercher un prospect..." />
        </label>
        <button className="btn btn-primary" onClick={() => navigate("/app/campagnes")}>
          <Icon src="/assets/icon-plus.svg" size={16} /> Nouvelle campagne
        </button>
      </div>
    </div>
  );
}
