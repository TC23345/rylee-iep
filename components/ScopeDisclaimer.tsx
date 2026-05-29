import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ScopeGate = "legal" | "tax" | "idFPR" | "clinical";

const GATE_LABELS: Record<ScopeGate, string> = {
  legal: "Attorney",
  tax: "CPA",
  idFPR: "IDFPR",
  clinical: "Clinical judgment",
};

const GATE_COPY: Record<ScopeGate, string> = {
  legal: "contract language or dispute terms",
  tax: "entity tax treatment or deductions",
  idFPR: "current BCBA entity or license-scope positions",
  clinical: "student-specific eligibility or services opinions",
};

export function ScopeDisclaimer({
  gates,
  className,
}: {
  gates: ScopeGate[];
  className?: string;
}) {
  const uniqueGates = Array.from(new Set(gates));
  const gateText = uniqueGates.map((gate) => GATE_COPY[gate]).join(", ");

  return (
    <section
      aria-label="Professional scope disclaimer"
      className={cn(
        "mb-7 rounded-lg border border-amber-300/45 bg-amber-50/65 px-4 py-3 text-sm text-stone-800 shadow-sm",
        className
      )}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="font-serif text-base font-semibold leading-none text-stone-950">
          Professional scope
        </span>
        {uniqueGates.map((gate) => (
          <Badge
            className="border-amber-300/60 bg-white/70 text-[0.7rem] text-stone-700"
            key={gate}
            variant="outline"
          >
            {GATE_LABELS[gate]}
          </Badge>
        ))}
      </div>
      <p className="m-0 max-w-3xl leading-6 text-stone-700">
        This workspace is educational and operational. It is not legal advice, tax
        advice, a clinical determination, or an IDFPR position. For {gateText}, use
        this page to organize questions for the right professional.
      </p>
    </section>
  );
}
