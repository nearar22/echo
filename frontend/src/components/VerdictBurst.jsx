import { motion } from 'framer-motion';
import { Sparkles, Waves, CloudOff } from 'lucide-react';
import { bandOf } from '../lib/contract.js';

// The verdict bloom fired in the center when both tiles flip. A burst of rays
// in the band color, the band name, and the proximity reading. match blooms
// magenta, near blooms teal, miss is a muted fade.
const ICON = { match: Sparkles, near: Waves, miss: CloudOff };

export default function VerdictBurst({ band, proximity, link, compact = false }) {
  const meta = bandOf(band);
  const Icon = ICON[meta.key] || Sparkles;
  const rays = 12;

  return (
    <div className="relative flex flex-col items-center justify-center text-center">
      <div className="relative flex items-center justify-center">
        {/* Rays */}
        {Array.from({ length: rays }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute h-1 rounded-full"
            style={{
              width: compact ? 26 : 40,
              backgroundColor: meta.color,
              transformOrigin: 'left center',
              rotate: `${(360 / rays) * i}deg`,
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: [0, 1, 0.7], opacity: [0, 1, 0] }}
            transition={{ duration: 0.9, delay: i * 0.012, ease: 'easeOut' }}
          />
        ))}
        <motion.div
          className={`relative z-10 flex items-center justify-center rounded-full border-2 border-ink/90 ${
            compact ? 'h-16 w-16' : 'h-24 w-24'
          }`}
          style={{ backgroundColor: meta.color, boxShadow: `0 0 40px -6px ${meta.glow}` }}
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 14 }}
        >
          <Icon size={compact ? 26 : 38} className={meta.key === 'near' || meta.key === 'miss' ? 'text-ink' : 'text-cream-panel'} />
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.18 }}
        className="mt-4"
      >
        <p className="font-display text-3xl font-black leading-none text-ink sm:text-4xl">
          {meta.verb}
        </p>
        <div className="mt-2 flex items-center justify-center gap-2">
          <span
            className="rounded-full border-2 border-ink/90 px-3 py-0.5 text-xs font-bold uppercase tracking-wide text-ink"
            style={{ backgroundColor: meta.soft }}
          >
            {meta.label}
          </span>
          {proximity >= 0 && (
            <span className="font-mono text-sm font-semibold text-ink-soft">
              proximity {proximity}/100
            </span>
          )}
        </div>
        {link && !compact && (
          <p className="mx-auto mt-3 max-w-md text-balance text-sm text-ink-soft">{link}</p>
        )}
      </motion.div>
    </div>
  );
}
