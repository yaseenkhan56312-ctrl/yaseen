/**
 * Voice Control Assistant Web Speech Helper
 */

// Define SpeechRecognition interface for TypeScript
interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as IWindow;
  return !!(win.SpeechRecognition || win.webkitSpeechRecognition);
}

export function createSpeechRecognizer(
  lang: string = 'en-US',
  onResult: (transcript: string, isFinal: boolean) => void,
  onError: (error: string) => void,
  onEnd: () => void
) {
  const win = window as IWindow;
  const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

  if (!SpeechRecognitionClass) {
    onError('Speech recognition not supported in this browser.');
    return null;
  }

  try {
    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const text = (finalTranscript || interimTranscript).trim();
      onResult(text, !!finalTranscript);
    };

    recognition.onerror = (event: any) => {
      // Don't treat "no-speech" as a fatal error
      if (event.error !== 'no-speech') {
        onError(event.error || 'Voice recognition error');
      }
    };

    recognition.onend = () => {
      onEnd();
    };

    return recognition;
  } catch (err: any) {
    onError(err?.message || 'Failed to initialize microphone');
    return null;
  }
}

export function speakText(text: string, lang: string = 'en-US') {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  try {
    // Cancel any pending speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 0.85;

    // Pick appropriate language code
    if (lang === 'ur') {
      utterance.lang = 'ur-PK';
    } else if (lang === 'ps') {
      utterance.lang = 'ps-AF';
    } else {
      utterance.lang = 'en-US';
    }

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Speech synthesis failed:', e);
  }
}
