
import React from 'react';
import { BeatState } from '../types';

interface GridButtonProps {
  state: BeatState;
  isActive: boolean;
  onClick: () => void;
  index: number;
}

const GridButton: React.FC<GridButtonProps> = ({ state, isActive, onClick, index }) => {
  const getButtonClass = () => {
    let baseClass = 'w-full h-full rounded-lg transition-all duration-150 flex items-center justify-center text-white/50 font-mono text-lg shadow-inner focus:outline-none focus:ring-4';
    
    if (isActive) {
      baseClass += ' ring-4 ring-white scale-105';
    } else {
      baseClass += ' ring-transparent';
    }

    switch (state) {
      case BeatState.Normal:
        return `${baseClass} bg-cyan-500 shadow-cyan-500/30 hover:bg-cyan-400`;
      case BeatState.Accent:
        return `${baseClass} bg-fuchsia-500 shadow-fuchsia-500/30 hover:bg-fuchsia-400`;
      case BeatState.Off:
      default:
        return `${baseClass} bg-gray-700 hover:bg-gray-600 shadow-black/30`;
    }
  };

  return (
    <button onClick={onClick} className={getButtonClass()}>
      {index + 1}
    </button>
  );
};

export default GridButton;
