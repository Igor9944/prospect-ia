import { Link, useNavigate } from "react-router-dom";
import { Icon, LogoBrand, LogoMark, LogoWide } from "../components/Brand";

export default function Login() {
  const navigate = useNavigate();
  return (
    <div className="login">
      <section className="login-left">
        <LogoBrand variant="dark" markSize={38} />
        <div className="login-hero">
          <div className="logo-lg">
            <LogoWide variant="dark" height={120} />
          </div>
          <h1>La prospection B2B pilotée par l'intelligence artificielle.</h1>
          <p>Configurez vos critères, laissez l'IA qualifier vos prospects, et automatisez vos premiers contacts sans effort.</p>
          <div className="feat-pills">
            <span>✦ IA Qualifiée</span>
            <span>✦ Automatisation</span>
            <span>✦ CRM Intégré</span>
          </div>
        </div>
        <p style={{ color: "rgba(255,255,255,.35)", fontSize: 12 }}>© 2026 ProspectAI. Tous droits réservés.</p>
      </section>
      <section className="login-right">
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            navigate("/app/campagnes");
          }}
        >
          <div style={{ display: "grid", placeItems: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "#f0f4ff", border: "1px solid #dce6ff", display: "grid", placeItems: "center" }}>
              <LogoMark size={40} variant="light" />
            </div>
          </div>
          <div>
            <h2>Ravi de vous revoir !</h2>
            <p className="sub">Connectez-vous pour continuer à piloter vos campagnes.</p>
          </div>
          <div className="field">
            <label>Adresse email</label>
            <input type="email" defaultValue="nom@entreprise.com" />
          </div>
          <div className="field">
            <div className="row-between">
              <label>Mot de passe</label>
              <span className="link">Mot de passe oublié ?</span>
            </div>
            <input type="password" defaultValue="xxxxxxxxxxxx" />
          </div>
          <button className="btn btn-primary btn-login btn-full" type="submit" style={{ padding: "16px 24px", borderRadius: 12 }}>
            Se connecter
          </button>
          <div className="or">OU CONTINUER AVEC</div>
          <button className="sso" type="button" onClick={() => navigate("/app/campagnes")}>
            <Icon src="/assets/icon-google.svg" size={20} />
            Se connecter avec Google
          </button>
          <p style={{ textAlign: "center", fontSize: 13, color: "#8e9bb3" }}>
            Pas encore de compte ? <Link className="link" to="/tarifs">Créer un compte gratuit</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
