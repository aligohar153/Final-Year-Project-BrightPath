// BrightPath - TTS Service (Expo Speech)
import * as Speech from 'expo-speech';

let isSpeaking = false;

export const speak = async (text, options = {}) => {
  try {
    await stop();
    isSpeaking = true;
    Speech.speak(text, {
      language: options.language || 'en-US',
      rate: options.rate || 0.85,
      pitch: options.pitch || 1.0,
      onDone: () => { isSpeaking = false; },
      onError: () => { isSpeaking = false; },
      ...options,
    });
  } catch (e) {
    console.log('TTS Error:', e);
    isSpeaking = false;
  }
};

export const stop = async () => {
  try {
    const speaking = await Speech.isSpeakingAsync();
    if (speaking) {
      await Speech.stop();
    }
    isSpeaking = false;
  } catch (e) {
    console.log('TTS stop error:', e);
  }
};

export const isTTSSpeaking = () => isSpeaking;

export default { speak, stop, isTTSSpeaking };


