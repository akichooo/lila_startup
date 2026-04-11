import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import * as Tone from "tone";

interface SoundSettings {
  enabled: boolean;
  masterVolume: number; // 0-100
  backgroundMusic: boolean;
  interfaceSounds: boolean;
  mascotSounds: boolean;
  musicStyle: "piano" | "nature";
}

const DEFAULT_SETTINGS: SoundSettings = {
  enabled: false,
  masterVolume: 60,
  backgroundMusic: true,
  interfaceSounds: true,
  mascotSounds: true,
  musicStyle: "piano",
};

type SoundEffect =
  | "nav-click"
  | "primary-click"
  | "success"
  | "error"
  | "toggle"
  | "mark"
  | "save-note"
  | "session-end"
  | "mascot-blobby"
  | "mascot-tangerine"
  | "mascot-zapzing"
  | "mascot-wave"
  | "analysis-tick";

interface SoundContextType {
  settings: SoundSettings;
  updateSettings: (partial: Partial<SoundSettings>) => void;
  play: (effect: SoundEffect) => void;
  startBackgroundMusic: (page: "dashboard" | "upload" | "voiceroom") => void;
  stopBackgroundMusic: () => void;
  testSound: () => void;
  toneStarted: boolean;
  initTone: () => Promise<void>;
}

const SoundContext = createContext<SoundContextType | null>(null);

export function useLilaSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useLilaSound must be used within SoundProvider");
  return ctx;
}

const LS_KEY = "lila_sound_settings";

function loadSettings(): SoundSettings {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_SETTINGS;
}

function saveSettings(s: SoundSettings) {
  localStorage.setItem(LS_KEY, JSON.stringify(s));
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SoundSettings>(loadSettings);
  const [toneStarted, setToneStarted] = useState(false);
  const bgMusicRef = useRef<{ stop: () => void } | null>(null);
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const gainRef = useRef<Tone.Gain | null>(null);
  const bgGainRef = useRef<Tone.Gain | null>(null);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const updateSettings = useCallback((partial: Partial<SoundSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const initTone = useCallback(async () => {
    if (toneStarted) return;
    await Tone.start();
    setToneStarted(true);
  }, [toneStarted]);

  const getVol = useCallback(() => {
    if (!settings.enabled) return -Infinity;
    // Convert 0-100 to dB range (-40 to 0)
    const vol = (settings.masterVolume / 100) * 40 - 40;
    return vol;
  }, [settings.enabled, settings.masterVolume]);

  const ensureSynth = useCallback(() => {
    if (!synthRef.current) {
      const gain = new Tone.Gain(0.3).toDestination();
      gainRef.current = gain;
      synthRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" },
        envelope: { attack: 0.01, decay: 0.15, sustain: 0.05, release: 0.3 },
      }).connect(gain);
    }
    if (gainRef.current) {
      const dbVol = getVol();
      gainRef.current.gain.value = dbVol === -Infinity ? 0 : Math.pow(10, dbVol / 20) * 0.3;
    }
    return synthRef.current!;
  }, [getVol]);

  const play = useCallback((effect: SoundEffect) => {
    if (!toneStarted || !settings.enabled) return;

    const isMascot = effect.startsWith("mascot-");
    if (isMascot && !settings.mascotSounds) return;
    if (!isMascot && effect !== "analysis-tick" && !settings.interfaceSounds) return;

    const synth = ensureSynth();
    const now = Tone.now();

    try {
      switch (effect) {
        case "nav-click":
          synth.triggerAttackRelease("G5", 0.04, now);
          break;
        case "primary-click":
          synth.triggerAttackRelease("C5", 0.06, now);
          synth.triggerAttackRelease("E5", 0.06, now + 0.06);
          break;
        case "success":
          synth.triggerAttackRelease("C5", 0.1, now);
          synth.triggerAttackRelease("E5", 0.1, now + 0.12);
          synth.triggerAttackRelease("G5", 0.15, now + 0.24);
          break;
        case "error":
          synth.triggerAttackRelease("E4", 0.08, now);
          synth.triggerAttackRelease("C4", 0.1, now + 0.1);
          break;
        case "toggle":
          synth.triggerAttackRelease("A5", 0.03, now);
          break;
        case "mark":
          synth.triggerAttackRelease("D5", 0.05, now);
          synth.triggerAttackRelease("A5", 0.04, now + 0.04);
          break;
        case "save-note":
          synth.triggerAttackRelease("F5", 0.05, now);
          synth.triggerAttackRelease("A5", 0.03, now + 0.04);
          break;
        case "session-end":
          synth.triggerAttackRelease(["C4", "E4", "G4"], 0.5, now);
          break;
        case "mascot-blobby":
          synth.triggerAttackRelease("C6", 0.06, now);
          synth.triggerAttackRelease("E6", 0.06, now + 0.08);
          synth.triggerAttackRelease("G6", 0.06, now + 0.16);
          break;
        case "mascot-tangerine": {
          const purr = new Tone.Synth({
            oscillator: { type: "triangle" },
            envelope: { attack: 0.1, decay: 0.3, sustain: 0.2, release: 0.2 },
          }).connect(gainRef.current!);
          purr.triggerAttackRelease("G3", 0.5, now);
          setTimeout(() => purr.dispose(), 1000);
          break;
        }
        case "mascot-zapzing":
          synth.triggerAttackRelease("E6", 0.05, now);
          synth.triggerAttackRelease("G6", 0.05, now + 0.08);
          synth.triggerAttackRelease("B6", 0.08, now + 0.16);
          break;
        case "mascot-wave":
          synth.triggerAttackRelease("E5", 0.08, now);
          synth.triggerAttackRelease("G5", 0.1, now + 0.1);
          break;
        case "analysis-tick":
          synth.triggerAttackRelease("A5", 0.03, now);
          break;
      }
    } catch {
      // Silently fail — audio is non-critical
    }
  }, [toneStarted, settings.enabled, settings.interfaceSounds, settings.mascotSounds, ensureSynth]);

  const startBackgroundMusic = useCallback((page: "dashboard" | "upload" | "voiceroom") => {
    if (!toneStarted || !settings.enabled || !settings.backgroundMusic) return;
    // Stop existing
    bgMusicRef.current?.stop();

    try {
      const bgGain = new Tone.Gain(0).toDestination();
      bgGainRef.current = bgGain;
      const maxGain = (settings.masterVolume / 100) * 0.05; // 15% of master, very subtle

      // Pentatonic notes for always-pleasant sound
      const notes = page === "voiceroom"
        ? ["E4", "G4", "A4", "B4", "D5", "E5"] // brighter
        : ["C4", "E4", "G4", "A4", "C5"]; // calm

      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" },
        envelope: { attack: 0.8, decay: 1.5, sustain: 0.3, release: 2 },
        volume: -20,
      }).connect(bgGain);

      const reverb = new Tone.Reverb({ decay: 4, wet: 0.7 }).toDestination();
      synth.connect(reverb);

      // Fade in over 3s
      bgGain.gain.rampTo(maxGain, 3);

      let noteIdx = 0;
      const loop = new Tone.Loop((time) => {
        const note = notes[noteIdx % notes.length];
        synth.triggerAttackRelease(note, "2n", time);
        noteIdx++;
      }, "2n");

      Tone.getTransport().start();
      loop.start(0);

      bgMusicRef.current = {
        stop: () => {
          bgGain.gain.rampTo(0, 2);
          setTimeout(() => {
            loop.stop();
            loop.dispose();
            synth.dispose();
            reverb.dispose();
            bgGain.dispose();
          }, 2200);
        },
      };
    } catch {
      // Silently fail
    }
  }, [toneStarted, settings.enabled, settings.backgroundMusic, settings.masterVolume]);

  const stopBackgroundMusic = useCallback(() => {
    bgMusicRef.current?.stop();
    bgMusicRef.current = null;
  }, []);

  const testSound = useCallback(() => {
    if (!toneStarted) return;
    const synth = ensureSynth();
    const now = Tone.now();
    synth.triggerAttackRelease("C5", 0.1, now);
    synth.triggerAttackRelease("E5", 0.1, now + 0.15);
    synth.triggerAttackRelease("G5", 0.15, now + 0.3);
  }, [toneStarted, ensureSynth]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      bgMusicRef.current?.stop();
      synthRef.current?.dispose();
      gainRef.current?.dispose();
    };
  }, []);

  return (
    <SoundContext.Provider value={{ settings, updateSettings, play, startBackgroundMusic, stopBackgroundMusic, testSound, toneStarted, initTone }}>
      {children}
    </SoundContext.Provider>
  );
}
