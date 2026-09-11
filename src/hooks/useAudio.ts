"use client";

import { useCallback, useRef } from "react";

type SoundType = "lobby" | "countdown" | "correct" | "wrong" | "start" | "tick" | "whoosh" | "levelup";

export function useAudio() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getAudioContext = useCallback(() => {
    if (typeof window === 'undefined') return null;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return null;
        try {
          audioCtxRef.current = new AudioContextClass();
        } catch (e) {
          console.warn("Failed to init AudioContext", e);
          return null;
        }
      }
      // Safari requires resume after user gesture
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
      return audioCtxRef.current;
    } catch (err) {
      console.warn("Audio error", err);
      return null;
    }
  }, []);

  const playTone = useCallback((frequency: number, type: OscillatorType, duration: number, vol = 0.1) => {
    try {
      const ctx = getAudioContext();
      if (!ctx || ctx.state !== 'running') return;
      
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(vol, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (err) {
      // Silently fail - audio is non-critical
    }
  }, [getAudioContext]);

  const stopSound = useCallback(() => {
    if (activeLoopRef.current !== null) {
      clearInterval(activeLoopRef.current);
      activeLoopRef.current = null;
    }
  }, []);

  const playSound = useCallback((type: SoundType, loop: boolean = false) => {
    const playLogic = () => {
      try {
        const ctx = getAudioContext();
        if (!ctx || ctx.state !== 'running') return;

        switch (type) {
          case "correct":
            playTone(523.25, "sine", 0.1, 0.1);
            setTimeout(() => playTone(659.25, "sine", 0.1, 0.1), 100);
            setTimeout(() => playTone(783.99, "sine", 0.2, 0.1), 200);
            setTimeout(() => playTone(1046.50, "sine", 0.4, 0.1), 300);
            break;
          case "wrong":
            playTone(300, "sawtooth", 0.2, 0.1);
            setTimeout(() => playTone(250, "sawtooth", 0.4, 0.1), 150);
            break;
          case "start":
            playTone(440, "square", 0.2, 0.05);
            setTimeout(() => playTone(440, "square", 0.2, 0.05), 500);
            setTimeout(() => playTone(880, "square", 0.5, 0.05), 1000);
            break;
          case "lobby": {
            // Epic 8-bit arpeggio loop (minor pentatonic)
            const notes = [
              220.00, // A3
              261.63, // C4
              329.63, // E4
              392.00, // G4
              440.00, // A4
              392.00, // G4
              329.63, // E4
              261.63  // C4
            ];
            notes.forEach((freq, i) => {
              setTimeout(() => {
                playTone(freq / 2, "square", 0.1, 0.05); // Bass
                playTone(freq, "square", 0.1, 0.05);     // Melody
              }, i * 125);
            });
            break;
          }
          case "countdown":
            playTone(600, "sine", 0.1, 0.05);
            break;
          case "tick":
            // Short percussive click for timer
            playTone(1200, "square", 0.03, 0.06);
            setTimeout(() => playTone(800, "square", 0.02, 0.03), 30);
            break;
          case "whoosh":
            // Sweeping frequency rise for transitions
            playTone(200, "sine", 0.3, 0.08);
            setTimeout(() => playTone(400, "sine", 0.2, 0.06), 50);
            setTimeout(() => playTone(800, "sine", 0.15, 0.04), 100);
            setTimeout(() => playTone(1600, "sine", 0.1, 0.02), 150);
            break;
          case "levelup":
            // Triumphant ascending arpeggio for streak milestones
            playTone(523.25, "sine", 0.15, 0.1);   // C5
            setTimeout(() => playTone(659.25, "sine", 0.15, 0.1), 100);  // E5
            setTimeout(() => playTone(783.99, "sine", 0.15, 0.1), 200);  // G5
            setTimeout(() => playTone(1046.50, "sine", 0.2, 0.12), 300); // C6
            setTimeout(() => playTone(1318.51, "sine", 0.3, 0.1), 400);  // E6
            setTimeout(() => playTone(1567.98, "sine", 0.5, 0.08), 500); // G6
            break;
        }
      } catch (err) {
        // Silently fail
      }
    };

    if (loop) {
      stopSound();
      const intervalMs = type === "lobby" ? 1000 : (type === "countdown" ? 1000 : 500);
      playLogic();
      activeLoopRef.current = setInterval(playLogic, intervalMs);
    } else {
      playLogic();
    }
  }, [getAudioContext, playTone, stopSound]);

  return { playSound, stopSound };
}
