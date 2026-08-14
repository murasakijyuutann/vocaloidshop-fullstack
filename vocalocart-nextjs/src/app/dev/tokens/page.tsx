import { Button } from "@/components/ui/button";

/**
 * Scratch page for verifying the design-token layer (step 0 of the
 * VocaloCart redesign — see docs/vocalocart-design-brief.md). Not linked
 * from any nav; delete once the token layer is confirmed and later steps
 * are underway.
 */

const swatches: { name: string; classes: string }[] = [
  { name: "background", classes: "bg-background text-foreground border border-border" },
  { name: "surface", classes: "bg-surface text-surface-foreground border border-border" },
  { name: "muted", classes: "bg-muted text-muted-foreground border border-border" },
  { name: "card", classes: "bg-card text-card-foreground border border-border" },
  { name: "primary", classes: "bg-primary text-primary-foreground" },
  { name: "secondary", classes: "bg-secondary text-secondary-foreground" },
  { name: "accent", classes: "bg-accent text-accent-foreground" },
  { name: "destructive", classes: "bg-destructive text-destructive-foreground" },
];

const variants = ["default", "secondary", "destructive", "outline", "ghost", "link"] as const;
const sizes = ["sm", "default", "lg", "icon"] as const;

export default function TokenScratchPage() {
  return (
    <div className="min-h-screen bg-background text-foreground px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-12">
        <header className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Design token check</h1>
          <p className="text-muted-foreground">
            Every color and radius token, plus every button variant/size, should render
            distinctly. If anything below is invisible or unstyled, the token layer isn&apos;t
            wired up correctly.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Color tokens
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {swatches.map((s) => (
              <div key={s.name} className={`rounded-lg p-4 text-sm font-medium ${s.classes}`}>
                {s.name}
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Radius scale
          </h2>
          <div className="flex flex-wrap gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-sm bg-secondary text-xs font-medium text-secondary-foreground">
              sm
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-md bg-secondary text-xs font-medium text-secondary-foreground">
              md
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-secondary text-xs font-medium text-secondary-foreground">
              lg
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-secondary text-xs font-medium text-secondary-foreground">
              xl
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Button variants × sizes
          </h2>
          <div className="space-y-4">
            {variants.map((variant) => (
              <div key={variant} className="flex flex-wrap items-center gap-3">
                <span className="w-20 text-sm text-muted-foreground">{variant}</span>
                {sizes.map((size) => (
                  <Button key={size} variant={variant} size={size}>
                    {size === "icon" ? "•" : "Button"}
                  </Button>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Focus ring (tab to the button below)
          </h2>
          <Button variant="outline">Focus me</Button>
        </section>
      </div>
    </div>
  );
}
