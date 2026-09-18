import React, { useEffect, useState } from "react";
import { Settings, Wifi, WifiOff } from "lucide-react";
import { defaultApiBase, getApiBase, pingApi, setApiBase } from "../lib/api";

export const BackendStatus: React.FC = () => {
  const [online, setOnline] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(getApiBase());

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      const ok = await pingApi();
      if (!cancelled) setOnline(ok);
    };
    tick();
    const id = setInterval(tick, 8000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [url]);

  const save = () => {
    setApiBase(url);
    setOpen(false);
    pingApi().then(setOnline);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Local API settings"
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium"
      >
        {online ? (
          <Wifi className="w-3.5 h-3.5 text-emerald-600" />
        ) : (
          <WifiOff className="w-3.5 h-3.5 text-amber-600" />
        )}
        <span className="hidden lg:inline">{online ? "API locale" : "API hors ligne"}</span>
        <Settings className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900">Backend local</h3>
            <p className="mt-1 text-xs text-slate-500">
              Le frontend GitHub Pages appelle ce serveur sur ta machine. Démarre-le avec
              <code className="mx-1 rounded bg-slate-100 px-1">npm run backend</code>
              (port 3001).
            </p>
            <label className="mt-4 block text-xs font-semibold text-slate-600">
              URL de l’API
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={defaultApiBase() || "http://127.0.0.1:3001"}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm"
              />
            </label>
            <p className="mt-2 text-[11px] text-slate-400">
              Vide = même origine (utile avec <code>npm run dev</code>).
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={save}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
