import { Badge } from "@/components/ui/badge";
import { NewClientModal } from "@/components/NewClientModal";
import { requireSignedInUser } from "@/lib/authz";
import { getClientIndex, type ClientIndexDoc } from "@/lib/clients";

// Clients - metadata-only client index. Do not expose full intake, contact, school,
// disability, document, or service data in MongoDB v1.
export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const actor = await requireSignedInUser();
  let clients: ClientIndexDoc[] = [];
  let dbError = false;
  try {
    clients = await getClientIndex(actor.orgId);
  } catch {
    dbError = true;
  }
  const count = clients.length;

  return (
    <div className="cli-wrap">
      <header className="cli-hero">
        <div className="cli-hero-text">
          <h1>Clients</h1>
          <p className="cli-hero-sub">
            A private-pay advocacy client index with only the metadata needed to orient
            the workspace.
          </p>
          <div className="cli-hero-note">
            Stored in <code>client_index</code>. Full intake persistence is disabled
            until encryption, consent, and retention rules are designed.
          </div>
        </div>
        <div className="cli-hero-stat">
          <div className="cli-hero-stat-num">{count}</div>
          <div className="cli-hero-stat-label">Clients</div>
        </div>
      </header>

      <section className="cli-pii" aria-label="PII rules">
        <div className="cli-pii-item">
          <span className="cli-pii-label">Client ID</span>
          <code className="cli-pii-code">marcus-t-d214</code>
          <span className="cli-pii-hint">first name-last initial-district abbr</span>
        </div>
        <div className="cli-pii-item">
          <span className="cli-pii-label">Display name</span>
          <code className="cli-pii-code">Marcus T.</code>
          <span className="cli-pii-hint">first + last initial only</span>
        </div>
      </section>

      <section className="cli-add" aria-label="Add a client">
        <div className="cli-add-glyph">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <line x1="12" y1="11" x2="12" y2="17" />
            <line x1="9" y1="14" x2="15" y2="14" />
          </svg>
        </div>
        <div className="cli-add-body">
          <div className="cli-add-title">Add a client</div>
          <div className="cli-add-desc">
            Add only first name, last initial, district abbreviation, and status. Derived
            id + display name follow the PII policy automatically.
          </div>
        </div>
        <NewClientModal />
      </section>

      <section className="cli-section">
        <h2 className="cli-section-title">Active clients</h2>
        <div className="cli-roster">
          {dbError ? (
            <div className="cli-roster-empty">
              Database unavailable — set <code>MONGODB_URI</code> or <code>MONGO_URI</code> in{" "}
              <code>.env</code> and restart.
            </div>
          ) : count === 0 ? (
            <div className="cli-roster-empty">No clients yet</div>
          ) : (
            clients.map((c) => (
              <div className="cli-roster-row" key={c.clientId}>
                <span className="flex flex-wrap items-center gap-2">
                  <span className="cli-roster-id">{c.clientId}</span>
                  <span className="text-sm text-[color:var(--text-muted)]">
                    {c.clientDisplayName}
                  </span>
                  <Badge className="border-transparent bg-sage/15 text-sage">
                    {c.status}
                  </Badge>
                  <span className="font-mono text-xs uppercase tracking-[0.08em] text-[color:var(--text-muted)]">
                    {c.districtAbbr}
                  </span>
                </span>
                <span
                  className="btn btn-primary opacity-50"
                  aria-disabled="true"
                  title="Folder view is deferred"
                >
                  Open folder
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="cli-section">
        <h2 className="cli-section-title">Inside each record</h2>
        <pre className="cli-tree">
          <span className="cli-tree-folder">clients/&lt;client_id&gt;</span>
          {"\n"}
          <span className="cli-tree-branch">├──</span>{" "}
          <span className="cli-tree-file">clientId / clientDisplayName / districtAbbr</span>{" "}
          <span className="cli-tree-desc">— minimal client index</span>
          {"\n"}
          <span className="cli-tree-branch">├──</span>{" "}
          <span className="cli-tree-file">status / createdBy / createdAt / updatedAt</span>{" "}
          <span className="cli-tree-desc">— workflow metadata</span>
          {"\n"}
          <span className="cli-tree-branch">└──</span>{" "}
          <span className="cli-tree-file">no parent contact, DOB, school, documents, or concerns</span>{" "}
          <span className="cli-tree-desc">— deferred by design</span>
        </pre>
      </section>
    </div>
  );
}
