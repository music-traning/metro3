import React from 'react';
import { PRESET_PATTERNS } from '../constants';
import type { Preset } from '../types';

interface ControlsProps {
  isPlaying: boolean;
  onPlayToggle: () => void;
  bpm: number;
  onBpmChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPresetChange: (preset: Preset) => void;
  isCountInEnabled: boolean;
  onCountInToggle: () => void;
}

const PlayIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

const Controls: React.FC<ControlsProps> = ({ isPlaying, onPlayToggle, bpm, onBpmChange, onPresetChange, isCountInEnabled, onCountInToggle }) => {
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPreset = PRESET_PATTERNS.find(p => p.name === e.target.value);
    if (selectedPreset) {
      onPresetChange(selectedPreset);
    }
  };
  
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-2xl w-full max-w-2xl space-y-6">
      <div className="flex items-center justify-center space-x-6">
        <button
          onClick={onPlayToggle}
          className="w-20 h-20 rounded-full bg-cyan-500 text-white flex items-center justify-center text-4xl shadow-lg hover:bg-cyan-400 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-cyan-300 transform hover:scale-105"
          aria-label={isPlaying ? 'Stop' : 'Play'}
        >
          {isPlaying ? <PauseIcon className="w-10 h-10" /> : <PlayIcon className="w-10 h-10" />}
        </button>
        <div className="flex-grow">
          <label htmlFor="bpm" className="block text-center text-white font-medium mb-2">
            BPM: <span className="font-bold text-2xl text-cyan-400">{bpm}</span>
          </label>
          <input
            id="bpm"
            type="range"
            min="40"
            max="240"
            value={bpm}
            onChange={onBpmChange}
            className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg accent-fuchsia-500"
          />
        </div>
      </div>
      <div className="flex justify-between items-end pt-2">
        <div className="flex-grow pr-4">
          <label htmlFor="presets" className="block text-sm font-medium text-gray-300 mb-1">
            Load Preset
          </label>
          <select
            id="presets"
            onChange={handleSelectChange}
            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
          >
            <option>Select a pattern...</option>
            {PRESET_PATTERNS.map(preset => (
              <option key={preset.name} value={preset.name}>{preset.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-2">
            <label htmlFor="count-in-toggle" className="text-sm font-medium text-gray-300">
                Count-in
            </label>
            <button
                id="count-in-toggle"
                role="switch"
                aria-checked={isCountInEnabled}
                onClick={onCountInToggle}
                className={`${
                    isCountInEnabled ? 'bg-cyan-500' : 'bg-gray-600'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800`}
            >
                <span
                    aria-hidden="true"
                    className={`${
                        isCountInEnabled ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
            </button>
        </div>
      </div>
    </div>
  );
};

export default Controls;