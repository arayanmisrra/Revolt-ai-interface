import { useState, useEffect, useRef, useCallback } from 'react';

// Types for Web Speech API
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  start(): void;
  stop(): void;
}

interface ISpeechRecognitionStatic {
  new (): ISpeechRecognition;
}

// Extend the Window interface
declare global {
  interface Window {
    SpeechRecognition: ISpeechRecognitionStatic;
    webkitSpeechRecognition: ISpeechRecognitionStatic;
  }
}


// Polyfill for browsers that might have prefixed versions
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

interface UseSpeechOptions {
  onListenStart?: () => void;
  onListenStop?: () => void;
  onSpeakStart?: () => void;
  onSpeakEnd?: () => void;
  onTranscript: (transcript: string) => void;
  lang?: string;
}

export const useSpeech = ({
  onListenStart,
  onListenStop,
  onSpeakStart,
  onSpeakEnd,
  onTranscript,
  lang = 'en-US',
}: UseSpeechOptions) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  const supported = !!SpeechRecognition;

  useEffect(() => {
    if (!supported) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setIsListening(true);
      onListenStart?.();
    };

    recognition.onend = () => {
      setIsListening(false);
      onListenStop?.();
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      onListenStop?.();
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };

    recognitionRef.current = recognition;
  }, [onListenStart, onListenStop, onTranscript, supported]);

  useEffect(() => {
    if (recognitionRef.current) {
        recognitionRef.current.lang = lang;
    }
  }, [lang]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error("Could not start recognition:", error);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error("Could not stop recognition:", error);
      }
    }
  }, [isListening]);

  const speak = useCallback((text: string) => {
    // Cancel any ongoing speech before starting a new one
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.onstart = () => onSpeakStart?.();
    utterance.onend = () => onSpeakEnd?.();
    utterance.onerror = (event) => {
        console.error("Speech synthesis error", event);
        onSpeakEnd?.(); // Ensure state is reset even on error
    };
    window.speechSynthesis.speak(utterance);
  }, [lang, onSpeakStart, onSpeakEnd]);

  const interrupt = useCallback(() => {
    window.speechSynthesis.cancel();
    onSpeakEnd?.(); // Manually trigger onSpeakEnd to reset status
  }, [onSpeakEnd]);

  return { isListening, startListening, stopListening, speak, interrupt, supported };
};
