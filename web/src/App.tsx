import { Navigate, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Pricing from "./pages/Pricing";
import AppShell from "./components/AppShell";
import Campaigns from "./pages/Campaigns";
import Prospects from "./pages/Prospects";
import ProspectDetail from "./pages/ProspectDetail";
import Scoring from "./pages/Scoring";
import Sequences from "./pages/Sequences";
import Stats from "./pages/Stats";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/tarifs" element={<Pricing />} />
      <Route path="/app" element={<AppShell />}>
        <Route index element={<Navigate to="/app/campagnes" replace />} />
        <Route path="campagnes" element={<Campaigns />} />
        <Route path="prospects" element={<Prospects />} />
        <Route path="prospects/:id" element={<ProspectDetail />} />
        <Route path="scoring" element={<Scoring />} />
        <Route path="sequences" element={<Sequences />} />
        <Route path="stats" element={<Stats />} />
        <Route path="parametres" element={<Settings />} />
      </Route>
    </Routes>
  );
}
