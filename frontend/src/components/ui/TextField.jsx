// Text inputs with live character counters and inline validation, styled for
// the Dopamine block aesthetic. WordField enforces a single token (no spaces);
// PromptField is a longer connecting prompt.

export function WordField({ id, label, value, onChange, max = 40, error, hint, disabled }) {
  const count = value.length;
  const near = count > max * 0.8;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="font-display text-lg font-bold text-ink">
          {label}
        </label>
        <span className={`font-mono text-xs ${near ? 'text-magenta-deep' : 'text-ink-faint'}`}>
          {count}/{max}
        </span>
      </div>
      <input
        id={id}
        type="text"
        value={value}
        disabled={disabled}
        maxLength={max}
        autoComplete="off"
        spellCheck="false"
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        placeholder="oneword"
        className="mt-2 w-full rounded-2xl border-2 border-ink/90 bg-cream-panel px-4 py-3 font-display text-2xl font-extrabold text-ink outline-none transition placeholder:text-ink-faint/50 focus:border-magenta disabled:opacity-60"
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-semibold text-magenta-deep">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-soft">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function PromptField({ id, label, value, onChange, max = 200, error, hint, disabled }) {
  const count = value.length;
  const near = count > max * 0.8;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="font-display text-lg font-bold text-ink">
          {label}
        </label>
        <span className={`font-mono text-xs ${near ? 'text-magenta-deep' : 'text-ink-faint'}`}>
          {count}/{max}
        </span>
      </div>
      <textarea
        id={id}
        rows={3}
        value={value}
        disabled={disabled}
        maxLength={max}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        placeholder="things that drift, ways to say goodbye, what a city sounds like at night"
        className="mt-2 w-full resize-none rounded-2xl border-2 border-ink/90 bg-cream-panel px-4 py-3 text-base text-ink outline-none transition placeholder:text-ink-faint/60 focus:border-teal disabled:opacity-60"
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-semibold text-magenta-deep">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-soft">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
