import { Link2 } from 'lucide-react';

// The connecting-prompt banner that sits above the two seats. It frames what
// the pair is trying to converge on.
export default function PromptBanner({ prompt, seq }) {
  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <div className="rounded-2xl border-2 border-ink/90 bg-cream-panel px-5 py-4 shadow-block-sm">
        <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-magenta-deep">
          <Link2 size={14} />
          Connecting prompt
          {seq ? <span className="font-mono text-ink-faint">#{seq}</span> : null}
        </div>
        <p className="mt-2 text-center font-display text-2xl font-extrabold leading-tight text-ink sm:text-3xl">
          {prompt}
        </p>
      </div>
    </div>
  );
}
