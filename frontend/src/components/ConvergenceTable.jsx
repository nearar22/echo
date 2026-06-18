import { motion } from 'framer-motion';
import PromptBanner from './PromptBanner.jsx';
import SeatTile from './SeatTile.jsx';
import BurstZone from './BurstZone.jsx';

// The primary surface: a round TABLE holding two facing seat panels, a
// connecting-prompt banner above them, and a center burst zone between them.
//
// Props:
// - round: the active round object (or null)
// - listening: true while an answer_round consensus is in flight for THIS round
// - justSettled: true to play the verdict bloom (both tiles flipped)
export default function ConvergenceTable({ round, listening = false, justSettled = false }) {
  if (!round) return null;

  const settled = round.status === 'settled';
  const seatTwoFilled = !!round.seatTwo;

  // Seat one: always sealed while awaiting (chain hides the word), revealed on
  // settle. While listening, it trembles.
  const seatOneState = settled ? 'revealed' : listening ? 'trembling' : 'sealed';
  // Seat two: empty until filled. Trembles while listening, reveals on settle.
  const seatTwoState = settled
    ? 'revealed'
    : listening
    ? 'trembling'
    : seatTwoFilled
    ? 'sealed'
    : 'empty';

  const centerMode = settled ? 'verdict' : listening ? 'listening' : 'awaiting';

  return (
    <div className="relative mx-auto w-full max-w-4xl">
      <PromptBanner prompt={round.prompt} seq={round.seq} />

      {/* The table */}
      <div className="relative mt-8">
        <div className="pointer-events-none absolute inset-x-2 top-10 -z-0 mx-auto h-[78%] rounded-[3rem] border-2 border-ink/15 bg-cream-panel/40 sm:inset-x-10" />

        <div className="relative z-10 grid grid-cols-1 items-start gap-6 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <motion.div
            className="flex justify-center"
            animate={settled ? { x: [40, 0] } : { x: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 16 }}
          >
            <SeatTile
              seat="one"
              state={seatOneState}
              word={round.wordOne}
              address={round.seatOne}
              band={settled ? round.band : null}
              tone="magenta"
            />
          </motion.div>

          <div className="flex min-h-[6rem] items-center justify-center py-2 sm:min-h-[12rem] sm:px-2">
            <BurstZone
              mode={centerMode}
              band={round.band}
              proximity={round.proximity}
              link={round.link}
            />
          </div>

          <motion.div
            className="flex justify-center"
            animate={settled ? { x: [-40, 0] } : { x: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 16 }}
          >
            <SeatTile
              seat="two"
              state={seatTwoState}
              word={round.wordTwo}
              address={round.seatTwo}
              band={settled ? round.band : null}
              tone="teal"
              label={seatTwoFilled || settled ? 'Seat two' : 'Open seat'}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
