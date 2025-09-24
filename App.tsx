import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BeatState } from './types';
import type { Pattern, Preset } from './types';
import { useIsDesktop } from './hooks/useIsDesktop';
import GridButton from './components/GridButton';
import Controls from './components/Controls';
import Recorder from './components/Recorder';

const App: React.FC = () => {
  const [pattern, setPattern] = useState<Pattern>(() => Array(16).fill(BeatState.Normal));
  const [bpm, setBpm] = useState<number>(60);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentBeat, setCurrentBeat] = useState<number>(-1);
  const [isCountInEnabled, setIsCountInEnabled] = useState<boolean>(true);
  
  // State for UI
  const [isCountingIn, setIsCountingIn] = useState<boolean>(false);
  const [countInStep, setCountInStep] = useState<number>(0);

  // Audio & Timing refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const mediaStreamDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const nextNoteTime = useRef<number>(0);
  const schedulerTimerId = useRef<number | null>(null);
  const beatQueue = useRef<{ beat: number, time: number, isCountIn: boolean }[]>([]);
  const countInBeatRef = useRef<number>(4); // Start in a "finished" state
  const patternBeatRef = useRef<number>(-1);

  // State refs for scheduler
  const isPlayingRef = useRef(isPlaying);
  const bpmRef = useRef(bpm);
  const patternRef = useRef(pattern);
  const isCountInEnabledRef = useRef(isCountInEnabled);
  // FIX: Moved `isCountingIn` state declaration before this line to fix "used before declaration" error.
  const isCountingInRef = useRef(isCountingIn);

  const isDesktop = useIsDesktop();
  
  // Keep refs in sync with state
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { patternRef.current = pattern; }, [pattern]);
  useEffect(() => { isCountInEnabledRef.current = isCountInEnabled; }, [isCountInEnabled]);
  useEffect(() => { isCountingInRef.current = isCountingIn; }, [isCountingIn]);

  const setupAudio = useCallback(async () => {
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.connect(audioContextRef.current.destination);
        
        if(isDesktop){
            try {
                // We request microphone permission here, but the actual stream for recording comes from the gain node.
                await navigator.mediaDevices.getUserMedia({ audio: true }); 
                mediaStreamDestinationRef.current = audioContextRef.current.createMediaStreamDestination();
                gainNodeRef.current.connect(mediaStreamDestinationRef.current);
            } catch (err) {
                console.warn("Microphone permission denied. Recording will not be available.", err);
            }
        }
    }
  }, [isDesktop]);

  const playClick = useCallback((beatState: BeatState, time: number) => {
    if (!audioContextRef.current || !gainNodeRef.current || beatState === BeatState.Off) {
      return;
    }
    
    let freq = 0;
    if (beatState === BeatState.Normal) {
      freq = 1000;
    } else if (beatState === BeatState.Accent) {
      freq = 1500;
    }

    const osc = audioContextRef.current.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    const envelope = audioContextRef.current.createGain();
    envelope.connect(gainNodeRef.current);
    envelope.gain.setValueAtTime(0, time);
    envelope.gain.linearRampToValueAtTime(0.5, time + 0.01);
    envelope.gain.linearRampToValueAtTime(0, time + 0.1);

    osc.connect(envelope);
    osc.start(time);
    osc.stop(time + 0.1);
  }, []);

  const scheduleNextBeats = useCallback(() => {
    const scheduleAheadTime = 0.1; // seconds
    const now = audioContextRef.current!.currentTime;

    while (nextNoteTime.current < now + scheduleAheadTime) {
      const isStillCountingIn = isCountInEnabledRef.current && countInBeatRef.current < 4;

      if (isStillCountingIn) {
        // Schedule count-in beat (0, 1, 2, 3)
        playClick(BeatState.Accent, nextNoteTime.current);
        beatQueue.current.push({ beat: countInBeatRef.current, time: nextNoteTime.current, isCountIn: true });
        
        // Advance time by one full beat (quarter note)
        nextNoteTime.current += 60.0 / bpmRef.current;
        countInBeatRef.current++; // Increment beat counter for the next iteration (becomes 1, 2, 3, 4)

        // If this was the final count-in beat, prepare for the pattern to start on the next beat
        if (countInBeatRef.current === 4) {
          patternBeatRef.current = -1;
        }
      } else {
        // We are in the main pattern phase.
        patternBeatRef.current = (patternBeatRef.current + 1) % 16;
        const currentPatternBeat = patternBeatRef.current;
        
        playClick(patternRef.current[currentPatternBeat], nextNoteTime.current);
        beatQueue.current.push({ beat: currentPatternBeat, time: nextNoteTime.current, isCountIn: false });
        
        // Advance time by a 16th note
        nextNoteTime.current += 60.0 / bpmRef.current / 4.0;
      }
    }
  }, [playClick]);

  const uiUpdateLoop = useCallback(() => {
    if (!isPlayingRef.current) return;
    
    const now = audioContextRef.current!.currentTime;
    while (beatQueue.current.length > 0 && beatQueue.current[0].time <= now) {
      const note = beatQueue.current.shift()!;
      if (note.isCountIn) {
        // This is a count-in note. Update the UI accordingly.
        setIsCountingIn(true); 
        setCountInStep(note.beat + 1); // note.beat is 0,1,2,3 -> UI shows 1,2,3,4
      } else {
        // This is a pattern note. Transition the UI if necessary.
        if (isCountingInRef.current) {
            setIsCountingIn(false);
            setCountInStep(0); // Explicitly reset count to ensure number disappears
        }
        setCurrentBeat(note.beat);
      }
    }
    
    requestAnimationFrame(uiUpdateLoop);
  }, []);


  const startScheduler = useCallback(() => {
    if (schedulerTimerId.current) return;

    const scheduler = () => {
      if (isPlayingRef.current) {
        scheduleNextBeats();
      }
      schedulerTimerId.current = window.setTimeout(scheduler, 25); // Run every 25ms
    };
    scheduler();
  }, [scheduleNextBeats]);

  const stopScheduler = useCallback(() => {
    if (schedulerTimerId.current) {
      clearTimeout(schedulerTimerId.current);
      schedulerTimerId.current = null;
    }
  }, []);

  const handlePlayToggle = async () => {
    await setupAudio();
    if (audioContextRef.current!.state === 'suspended') {
      await audioContextRef.current!.resume();
    }
    
    const newIsPlaying = !isPlaying;
    setIsPlaying(newIsPlaying);

    if (newIsPlaying) {
      beatQueue.current = [];
      nextNoteTime.current = audioContextRef.current!.currentTime;

      if (isCountInEnabledRef.current) {
        setIsCountingIn(true);
        setCountInStep(0); // Let scheduler set the first number to avoid flicker
        countInBeatRef.current = 0; // Start count-in from the first beat (index 0)
      } else {
        setIsCountingIn(false);
        setCurrentBeat(-1);
        countInBeatRef.current = 4; // Mark count-in as finished
        patternBeatRef.current = -1;
      }

      startScheduler();
      requestAnimationFrame(uiUpdateLoop);
    } else {
      stopScheduler();
      setCurrentBeat(-1);
      setIsCountingIn(false);
      setCountInStep(0);
    }
  };


  const handleGridButtonClick = (index: number) => {
    const newPattern = [...pattern];
    newPattern[index] = (newPattern[index] + 1) % 3;
    setPattern(newPattern);
  };

  const handleBpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBpm(Number(e.target.value));
  };

  const handlePresetChange = (preset: Preset) => {
    setPattern(preset.pattern);
  };

  const handleCountInToggle = () => {
    setIsCountInEnabled(prev => !prev);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center space-y-8">
        <header>
          <h1 className="text-5xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">
            Click Metronome
          </h1>
        </header>

        <div className="w-full aspect-square relative grid grid-cols-4 gap-4 p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl">
          {isCountingIn && countInStep > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm rounded-xl z-10 pointer-events-none">
              <span className="absolute text-9xl font-bold text-white/80 animate-ping opacity-75">{countInStep}</span>
              <span className="relative text-9xl font-bold text-white">{countInStep}</span>
            </div>
          )}
          {pattern.map((state, index) => (
            <GridButton
              key={index}
              index={index}
              state={state}
              isActive={index === currentBeat && !isCountingIn}
              onClick={() => handleGridButtonClick(index)}
            />
          ))}
        </div>

        <Controls
          isPlaying={isPlaying}
          onPlayToggle={handlePlayToggle}
          bpm={bpm}
          onBpmChange={handleBpmChange}
          onPresetChange={handlePresetChange}
          isCountInEnabled={isCountInEnabled}
          onCountInToggle={handleCountInToggle}
        />
        
        {isDesktop && <Recorder audioStream={mediaStreamDestinationRef.current?.stream ?? null} />}
        {!isDesktop && (
            <div className="text-center text-gray-500 text-sm mt-4">
                <p>Recording features are available on the desktop version.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default App;