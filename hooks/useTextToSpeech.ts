import { useState, useEffect, useCallback } from 'react';
import * as Speech from 'expo-speech';

export function useTextToSpeech() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentText, setCurrentText] = useState('');

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  const stopSpeech = useCallback(async () => {
    await Speech.stop();
    setIsPlaying(false);
  }, []);

  const speak = useCallback(async (text: string) => {
    if (isPlaying) {
      await stopSpeech();
      if (text === currentText) {
        return;
      }
    }

    setCurrentText(text);
    setIsPlaying(true);
    
    try {
      await Speech.speak(text, {
        language: 'en',
        pitch: 1.0,
        rate: 0.9,
        onDone: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    } catch (error) {
      console.error('Speech error:', error);
      setIsPlaying(false);
    }
  }, [isPlaying, currentText, stopSpeech]);

  return { speak, stopSpeech, isPlaying };
}