import { Link } from "react-router-dom";
import { Icon, LogoBrand, LogoWide } from "../components/Brand";

const steps = [
  { n: "01", title: "Identifier", desc: "Cibles ICP par secteur", icon: "/assets/icon-search.svg", bg: "#ebf1ff", color: "#2e66f2" },
  { n: "02", title: "Enrichir", desc: "Données multi-sources", icon: "/assets/icon-database.svg", bg: "#e0f8fd", color: "#1abaeb" },
  { n: "03", title: "Qualifier", desc: "Score IA 0-10 traçable", icon: "/assets/icon-star.svg", bg: "#e3f9ee", color: "#269e63" },
  { n: "04", title: "Prospecter", desc: "Emails personnalisés IA", icon: "/assets/icon-send.svg", bg: "#fff4e0", color: "#db8f1f" },
  { n: "05", title: "Relancer", desc: "Séquences automatiques", icon: "/assets/icon-refresh.svg", bg: "#f0ebff", color: "#7b5cf5" },
  { n: "06", title: "Convertir", desc: "Pipeline & reporting", icon: "/assets/icon-check.svg", bg: "#e8f9f0", color: "#14a85c" },
];

const features = [
  {
    title: "Recherche intelligente",
    copy: "Décrivez le profil cible, la zone, les mots-clés et la taille recherchée. ProspectAI parcourt le web et construit une liste qualifiée automatiquement.",
    tag: "Google Custom Search",
    icon: "/assets/icon-search.svg",
    bg: "#ebf1ff",
    color: "#2e66f2",
  },
  {
    title: "Enrichissement multi-sources",
    copy: "Website, contacts, activité, taille, réputation et signaux commerciaux avec leurs sources pour chaque entreprise identifiée.",
    tag: "Sources + n8n",
    icon: "/assets/icon-database.svg",
    bg: "#e0f8fd",
    color: "#1abaeb",
  },
  {
    title: "Scoring IA traçable",
    copy: "Score 0-10 généré par IA, avec justification, signaux positifs et négatifs, et une liste des données manquantes pour chaque prospect.",
    tag: "Google Gemini",
    icon: "/assets/icon-star.svg",
    bg: "#e3f9ee",
    color: "#269e63",
  },
  {
    title: "Outreach & relances",
    copy: "Emails ultra-personnalisés générés par IA, contrôle anti-doublon et séquences de relances programmées sans action manuelle.",
    tag: "Gmail + n8n",
    icon: "/assets/icon-mail.svg",
    bg: "#fff4e0",
    color: "#db8f1f",
  },
];

export default function Landing() {
  return (
    <div className="landing">
      <header className="nav">
        <Link to="/"><LogoBrand variant="light" markSize={44} /></Link>
        <div className="nav-links">
          <a className="pill" href="#produit">Produit</a>
          <a className="pill" href="#fonctions">Fonctions</a>
          <Link className="pill" to="/tarifs">Tarifs</Link>
          <Link className="btn btn-dark" to="/login">Demander une démo</Link>
        </div>
      </header>

      <section className="hero" id="produit">
        <div>
          <span className="eyebrow">Prospection B2B + IA</span>
          <h1>
            Trouvez les bons<br />
            prospects.<br />
            Laissez ProspectAI<br />
            piloter la suite.
          </h1>
          <p className="lead">
            Décrivez votre cible. ProspectAI recherche, enrichit, qualifie, contacte et suit chaque prospect dans un seul espace.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary btn-pill" to="/login">Créer une campagne →</Link>
            <a className="btn btn-pill" style={{ background: "#fff", border: "1.5px solid #d4defa", color: "#0e121c" }} href="#fonctions">
              Voir le produit
            </a>
          </div>
          <p className="trust">Utilisé par +200 équipes commerciales · Intégration en 15 min</p>
        </div>
        <div className="product-card">
          <div className="k">Prospect intelligence</div>
          <div className="n">12 480</div>
          <div style={{ color: "#8aa3c8" }}>entreprises analysées ce mois</div>
          <div className="bars">
            {[100, 140, 123, 170, 153, 200].map((h) => (
              <div key={h} className="bar" style={{ height: h }} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 18 }}>
            <span className="btn btn-primary" style={{ borderRadius: 16, padding: "6px 14px", fontSize: 12 }}>Score IA</span>
            <strong>8,7 / 10</strong>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="label">Comment ça marche</div>
        <h2>Un parcours commercial, un seul espace.</h2>
        <p style={{ color: "#4b5878" }}>n8n orchestre les étapes pendant que votre équipe se concentre sur la conversion.</p>
        <div className="steps">
          {steps.map((s) => (
            <article key={s.n} className="step">
              <div className="step-ico" style={{ background: s.bg }}>
                <Icon src={s.icon} size={20} />
              </div>
              <div style={{ marginTop: 10, fontSize: 11, fontWeight: 700, color: s.color }}>{s.n}</div>
              <h3 style={{ margin: "6px 0 4px", fontSize: 17 }}>{s.title}</h3>
              <small>{s.desc}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="fonctions">
        <div className="label">Fonctionnalités</div>
        <h2>De la donnée brute à la décision commerciale.</h2>
        <p style={{ color: "#4b5878" }}>Chaque brique est connectée à la suivante pour un flux sans friction.</p>
        <div className="features">
          {features.map((f) => (
            <article key={f.title} className="feature">
              <div className="feature-ico" style={{ background: f.bg }}>
                <Icon src={f.icon} size={32} />
              </div>
              <div>
                <h3 style={{ margin: "0 0 8px" }}>{f.title}</h3>
                <p style={{ margin: 0, color: "#66738a" }}>{f.copy}</p>
              </div>
              <span className="pill" style={{ background: f.bg, color: f.color }}>{f.tag}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="cta-panel">
        <div className="label" style={{ color: "rgba(255,255,255,.6)" }}>Commencer maintenant</div>
        <h2>Moins de recherche. Plus de prospects qualifiés.</h2>
        <p style={{ maxWidth: 680, color: "rgba(255,255,255,.75)" }}>
          Suivez chaque prospect, chaque relance et chaque prochaine action - en pilote automatique.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-light btn-pill" to="/login">Lancer une campagne →</Link>
          <Link className="btn btn-ghost btn-pill" to="/login">Voir une démo</Link>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-grid">
          <div>
            <LogoWide variant="dark" height={96} />
          </div>
          <div>
            <h4>Produit</h4>
            <a href="#fonctions">Fonctionnalités</a>
            <a href="#produit">Intégrations</a>
            <Link to="/tarifs">Tarifs</Link>
            <a>Changelog</a>
          </div>
          <div>
            <h4>Ressources</h4>
            <a>Documentation</a>
            <a>Blog</a>
            <a>Cas clients</a>
            <a>API</a>
          </div>
          <div>
            <h4>Entreprise</h4>
            <a>À propos</a>
            <a>Carrières</a>
            <a>Presse</a>
            <Link to="/login">Contact</Link>
          </div>
          <div>
            <h4>Légal</h4>
            <a>Confidentialité</a>
            <a>Conditions</a>
            <a>Cookies</a>
            <a>RGPD</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2025 ProspectAI - Tous droits réservés</span>
          <span>Mentions légales · Politique de confidentialité</span>
        </div>
      </footer>
    </div>
  );
}
