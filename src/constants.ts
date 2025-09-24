import { BeatState } from './types';
import type { Preset } from './types';

const { Off, Normal, Accent } = BeatState;

export const PRESET_PATTERNS: Preset[] = [
  {
    name: 'Standard Swing',
    pattern: [Off, Accent, Off, Normal, Off, Accent, Off, Normal, Off, Accent, Off, Normal, Off, Accent, Off, Normal],
  },
  {
    name: 'Bossa Nova',
    pattern: [Accent, Off, Normal, Off, Normal, Off, Normal, Accent, Off, Normal, Off, Normal, Off, Normal, Off, Off],
  },
  {
    name: 'Samba',
    pattern: [Accent, Normal, Off, Normal, Accent, Normal, Off, Normal, Accent, Normal, Off, Normal, Accent, Normal, Off, Normal],
  },
  {
    name: 'Funk Groove',
    pattern: [Accent, Off, Normal, Off, Normal, Off, Accent, Off, Accent, Off, Normal, Off, Normal, Off, Accent, Off],
  },
  {
    name: 'Reggae (One Drop)',
    pattern: [Off, Off, Accent, Off, Off, Off, Accent, Off, Off, Off, Accent, Off, Off, Off, Accent, Off],
  },
  {
    name: 'Afro-Cuban (Son Clave 3-2)',
    pattern: [Accent, Off, Off, Normal, Off, Normal, Off, Off, Accent, Off, Normal, Off, Accent, Off, Off, Off],
  },
  {
    name: 'Shuffle',
    pattern: [Accent, Off, Normal, Accent, Off, Normal, Accent, Off, Normal, Accent, Off, Normal, Accent, Off, Normal, Accent],
  },
  {
    name: 'Hip-Hop (Boom Bap)',
    pattern: [Accent, Off, Off, Normal, Accent, Off, Off, Normal, Accent, Off, Off, Normal, Accent, Off, Off, Normal],
  },
];
