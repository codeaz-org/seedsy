"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const KINDS: {
  id: string;
  name: string;
  glyph: string;
  hint: string;
  fields: { key: string; label: string; placeholder: string }[];
}[] = [
  {
    id: "wordpress",
    name: "WordPress",
    glyph: "W",
    hint: "Create an Application Password under Users → Profile.",
    fields: [
      { key: "site_url", label: "Site URL", placeholder: "https://blog.yourbrand.com" },
      { key: "username", label: "WP username", placeholder: "admin" },
      { key: "app_password", label: "Application password", placeholder: "xxxx xxxx xxxx xxxx" },
    ],
  },
  {
    id: "webflow",
    name: "Webflow",
    glyph: "Wf",
    hint: "Site settings → Apps & integrations → API access.",
    fields: [
      { key: "api_token", label: "API token", placeholder: "Bearer token from Webflow" },
      { key: "collection_id", label: "Blog collection ID", placeholder: "5f7…" },
      { key: "body_field", label: "Body field slug", placeholder: "post-body" },
    ],
  },
  {
    id: "shopify",
    name: "Shopify",
    glyph: "S",
    hint: "Custom app with write_content scope → Admin API token.",
    fields: [
      { key: "shop", label: "Shop name", placeholder: "yourbrand (from yourbrand.myshopify.com)" },
      { key: "access_token", label: "Admin API access token", placeholder: "shpat_…" },
      { key: "blog_id", label: "Blog ID", placeholder: "84512…" },
    ],
  },
  {
    id: "ghost",
    name: "Ghost",
    glyph: "G",
    hint: "Settings → Integrations → Add custom integration → Admin API key.",
    fields: [
      { key: "api_url", label: "Ghost site URL", placeholder: "https://yourbrand.ghost.io" },
      { key: "admin_api_key", label: "Admin API key", placeholder: "id:secret" },
    ],
  },
  {
    id: "webhook",
    name: "Webhook",
    glyph: "→",
    hint: "POSTs full article JSON — pipe into Zapier, Make, or your own API.",
    fields: [
      { key: "url", label: "Webhook URL", placeholder: "https://yoursite.com/api/seedsy" },
      { key: "secret", label: "Shared secret (optional)", placeholder: "sent as X-Seedsy-Secret" },
    ],
  },
];

export default function IntegrationForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [kind, setKind] = useState("wordpress");
  const [config, setConfig] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const active = KINDS.find((k) => k.id === kind)!;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/integrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: projectId, kind, config }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setMsg({ ok: false, text: data.error || "Could not save" });
    setMsg({ ok: true, text: "Connected. New articles publish here automatically." });
    router.refresh();
  }

  return (
    <form onSubmit={save} className="card space-y-5">
      <p className="label">Connect a CMS</p>
      <div className="grid grid-cols-5 gap-2">
        {KINDS.map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={() => { setKind(k.id); setConfig({}); setMsg(null); }}
            className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 transition ${
              kind === k.id
                ? "border-signal/70 bg-thicket text-signal"
                : "border-parchment/10 text-sage hover:border-parchment/30"
            }`}
          >
            <span className="font-display text-lg leading-none">{k.glyph}</span>
            <span className="text-[10px]">{k.name}</span>
          </button>
        ))}
      </div>
      <p className="rounded-xl bg-night/50 px-4 py-2.5 font-mono text-[11px] leading-relaxed text-sage">
        {active.hint}
      </p>
      {active.fields.map((f) => (
        <div key={f.key}>
          <label className="label mb-1.5 block">{f.label}</label>
          <input className="input" placeholder={f.placeholder}
            value={config[f.key] || ""}
            onChange={(e) => setConfig({ ...config, [f.key]: e.target.value })} />
        </div>
      ))}
      <button className="btn" disabled={busy}>
        {busy ? <span className="working">Saving</span> : `Connect ${active.name}`}
      </button>
      {msg && (
        <p className={`text-sm ${msg.ok ? "text-leaf" : "text-ember"}`}>{msg.text}</p>
      )}
    </form>
  );
}
