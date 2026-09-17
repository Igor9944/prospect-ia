import { Link } from "react-router-dom";
import { LogoBrand } from "../components/Brand";

const plans = [
  {
    name: "Starter",
    price: "49€",
    period: "/ mois",
    desc: "Idéal pour les cabinets et petites structures qui lancent dans la prospection ciblée.",
    items: ["500 prospects qualifiés / mois", "1 campagne active de prospection", "Scoring IA personnalisé standard", "Support client réactif par email"],
    cta: "Commencer gratuitement",
    featured: false,
  },
  {
    name: "Pro",
    price: "129€",
    period: "/ mois",
    desc: "La solution complète pour les équipes commerciales voulant maximiser leur taux de réponse.",
    items: ["5 000 prospects qualifiés / mois", "Campagnes de prospection illimitées", "Scoring IA avancé & enrichissement", "Intégrations natives (Sheets, Gmail, n8n)", "Support client prioritaire 24/7", "Tableau de bord analytique avancé"],
    cta: "Commencer avec Pro",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Sur mesure",
    period: "",
    desc: "Pour les grands groupes commerciaux exigeant un haut niveau de personnalisation et de sécurité.",
    items: ["Prospects qualifiés illimités", "Modèles d'IA entraînés sur vos données", "API dédiée & webhooks temps réel", "SLA de disponibilité garanti", "Account Manager dédié"],
    cta: "Contacter le service commercial",
    featured: false,
  },
];

export default function Pricing() {
  return (
    <div className="pricing">
      <header className="nav" style={{ background: "#070b14", borderColor: "#1e2b45" }}>
        <Link to="/"><LogoBrand variant="dark" markSize={40} /></Link>
        <div className="nav-links">
          <Link className="pill" style={{ background: "transparent", color: "#fff" }} to="/">Produit</Link>
          <Link className="pill" style={{ background: "transparent", color: "#fff" }} to="/">Fonctions</Link>
          <span className="pill">Tarifs</span>
          <Link className="btn btn-primary" to="/login">Demander une démo</Link>
        </div>
      </header>
      <section className="section" style={{ textAlign: "center" }}>
        <div className="eyebrow" style={{ background: "#1e3a8a", color: "#93c5fd" }}>Tarification claire</div>
        <h2>Des tarifs simples et transparents</h2>
        <p style={{ color: "#8e9bb3", maxWidth: 640, margin: "12px auto" }}>
          Choisissez le plan adapté à votre volume de prospection. Tous nos forfaits comprennent notre technologie d'intelligence artificielle.
        </p>
        <div className="bill-toggle">
          <span className="on">Facturation mensuelle</span>
          <span>Facturation annuelle -25%</span>
        </div>
      </section>
      <div className="plans">
        {plans.map((p) => (
          <article key={p.name} className={`plan${p.featured ? " featured" : ""}`}>
            {p.featured ? <div className="popular">✦ LE PLUS POPULAIRE</div> : null}
            <h3>{p.name}</h3>
            <div className="price">{p.price}<span style={{ fontSize: 16, fontWeight: 500 }}>{p.period}</span></div>
            <p style={{ color: "#8e9bb3" }}>{p.desc}</p>
            <ul>
              {p.items.map((item) => (
                <li key={item} style={{ margin: "8px 0" }}>✓ {item}</li>
              ))}
            </ul>
            <Link className={`btn ${p.featured ? "btn-primary" : "btn-ghost"} btn-full`} to="/login">{p.cta}</Link>
          </article>
        ))}
      </div>
      <div className="proof">
        <div><strong>+2 400</strong>équipes commerciales</div>
        <div><strong>12M+</strong>prospects enrichis</div>
        <div><strong>3x</strong>taux de réponse moyen</div>
      </div>
      <section className="section" style={{ textAlign: "center" }}>
        <h2>Des réponses à vos questions</h2>
        <div className="faq">
          {[
            ["Comment fonctionne le scoring IA des prospects ?", "Notre algorithme basé sur GPT-4 analyse le site web et les réseaux sociaux professionnels du prospect. Il évalue sa pertinence par rapport à votre persona cible et justifie sa note de 0 à 10 selon des critères clairs."],
            ["Quelles sont les intégrations disponibles d'office ?", "Toutes nos offres incluent la liaison avec Google Sheets pour centraliser vos données, ainsi que l'interface Gmail/Outlook pour déclencher vos premiers emails de contact."],
            ["Puis-je changer ou annuler mon forfait à tout moment ?", "Oui, tous nos abonnements sont sans engagement. Vous pouvez upgrader, downgrader ou arrêter votre abonnement depuis les paramètres de facturation."],
            ["Utilisez-vous vos données de prospection pour entraîner vos modèles ?", "Non, absolument pas. Nous respectons scrupuleusement la confidentialité de vos cibles. Toutes vos requêtes et analyses de données restent 100% privées."],
          ].map(([q, a]) => (
            <article key={q} className="card">
              <h4>{q}</h4>
              <p style={{ color: "#8e9bb3" }}>{a}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
