// BrightPath - Sound Service (expo-av)
import { Audio } from 'expo-av';

let currentSound = null;

const soundFiles = {
  // Drums (wav files)
  drum_kick: require('../../assets/sounds/drum_kick.wav'),
  drum_snare: require('../../assets/sounds/drum_snare.wav'),
  drum_hihat: require('../../assets/sounds/drum_hihat.wav'),
  drum_clap: require('../../assets/sounds/drum_clap.wav'),
  drum_boom: require('../../assets/sounds/drum_boom.wav'),

  // Guitar (mp3 files)
  gt_a: require('../../assets/sounds/gt_a.mp3'),
  gt_b: require('../../assets/sounds/gt_b.mp3'),
  gt_c: require('../../assets/sounds/gt_c.mp3'),
  gt_d: require('../../assets/sounds/gt_d.mp3'),
  gt_e: require('../../assets/sounds/gt_e.mp3'),
  gt_g: require('../../assets/sounds/gt_g.mp3'),

  // Piano (mp3 files)
  piano_a4: require('../../assets/sounds/piano_a4.mp3'),
  piano_b4: require('../../assets/sounds/piano_b4.mp3'),
  piano_c4: require('../../assets/sounds/piano_c4.mp3'),
  piano_d4: require('../../assets/sounds/piano_d4.mp3'),
  piano_e4: require('../../assets/sounds/piano_e4.mp3'),
  piano_f4: require('../../assets/sounds/piano_f4.mp3'),
  piano_g4: require('../../assets/sounds/piano_g4.mp3'),
};

// Map legacy keys if needed
const legacyMap = {
  piano_c: 'piano_c4',
  piano_d: 'piano_d4',
  piano_e: 'piano_e4',
  piano_f: 'piano_f4',
  piano_g: 'piano_g4',
  piano_a: 'piano_a4',
  piano_b: 'piano_b4',
  drum_kick: 'drum_kick',
  drum_snare: 'drum_snare',
  drum_hihat: 'drum_hihat',
  drum_crash: 'drum_boom',
  drum_tom: 'drum_boom',
};

export const playLocalSound = async (fileName, type = 'mp3') => {
  try {
    const soundKey = legacyMap[fileName] || fileName;
    const soundSource = soundFiles[soundKey];
    if (!soundSource) {
      console.warn('[SoundService] Sound source not found for key:', fileName);
      return;
    }

    if (currentSound) {
      try {
        await currentSound.unloadAsync();
      } catch (err) {
        // ignore
      }
      currentSound = null;
    }

    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    const { sound } = await Audio.Sound.createAsync(soundSource);
    currentSound = sound;
    await sound.playAsync();

    sound.setOnPlaybackStatusUpdate(async (status) => {
      if (status.didJustFinish) {
        try {
          await sound.unloadAsync();
        } catch (err) {
          // ignore
        }
        if (currentSound === sound) {
          currentSound = null;
        }
      }
    });
  } catch (e) {
    console.error('[SoundService] Playback error for:', fileName, e);
  }
};

export const playSound = playLocalSound;

export const stopSound = async () => {
  try {
    if (currentSound) {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      currentSound = null;
    }
  } catch (e) {
    console.log('[SoundService] Sound stop error:', e);
  }
};

export const PIANO_SOUND_FILES = {
  Do: 'piano_c4',
  Re: 'piano_d4',
  Mi: 'piano_e4',
  Fa: 'piano_f4',
  Sol: 'piano_g4',
  La: 'piano_a4',
  Ti: 'piano_b4',
};

export const DRUM_SOUND_FILES = {
  kick: 'drum_kick',
  snare: 'drum_snare',
  hihat: 'drum_hihat',
  clap: 'drum_clap',
  boom: 'drum_boom',
};

export const GUITAR_SOUND_FILES = {
  E: 'gt_e',
  A: 'gt_a',
  D: 'gt_d',
  G: 'gt_g',
  B: 'gt_b',
  e: 'gt_e',
};

export default { playSound, stopSound, playLocalSound, PIANO_SOUND_FILES, DRUM_SOUND_FILES, GUITAR_SOUND_FILES };
