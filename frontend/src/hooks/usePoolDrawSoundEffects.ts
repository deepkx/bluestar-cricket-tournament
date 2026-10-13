import { useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  playDrawComplete,
  playDrawPick,
  playDrawRoundWhoosh,
  playDrawShuffleTick,
  unlockDrawAudio,
} from '../utils/poolDrawSounds';
import type { PoolDrawSubPhase } from './useSequentialPoolDraw';

export function usePoolDrawSoundEffects(
  subPhase: PoolDrawSubPhase,
  landedCount: number,
  soundOn: boolean,
  shuffleTickMs = 78,
) {
  const reduceMotion = useReducedMotion();
  const prevLandedCount = useRef(0);
  const prevPhase = useRef<PoolDrawSubPhase>('shuffle');
  const [audioBlocked, setAudioBlocked] = useState(false);

  const enableSound = useCallback(async () => {
    const ok = await unlockDrawAudio();
    setAudioBlocked(!ok);
    return ok;
  }, []);

  useEffect(() => {
    if (!soundOn || reduceMotion) return;

    if (subPhase === 'shuffle' && prevPhase.current !== 'shuffle') {
      void unlockDrawAudio().then((ok) => {
        if (!ok) setAudioBlocked(true);
        else playDrawRoundWhoosh();
      });
    }
    prevPhase.current = subPhase;

    if (subPhase !== 'shuffle') return;
    const id = window.setInterval(() => {
      void unlockDrawAudio().then((ok) => {
        if (ok) playDrawShuffleTick();
      });
    }, shuffleTickMs);
    return () => window.clearInterval(id);
  }, [subPhase, soundOn, reduceMotion, shuffleTickMs]);

  useEffect(() => {
    if (!soundOn || reduceMotion) return;
    if (landedCount > prevLandedCount.current) {
      void unlockDrawAudio().then((ok) => {
        if (ok) playDrawPick();
      });
    }
    prevLandedCount.current = landedCount;
  }, [landedCount, soundOn, reduceMotion]);

  useEffect(() => {
    if (!soundOn || reduceMotion || subPhase !== 'done') return;
    void unlockDrawAudio().then((ok) => {
      if (ok) playDrawComplete();
    });
  }, [subPhase, soundOn, reduceMotion]);

  return { audioBlocked, enableSound };
}
