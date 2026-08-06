import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Text from './AppText';
import { Feather } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
import YoutubePlayer, {
  PLAYER_STATES,
  YoutubeIframeRef,
} from 'react-native-youtube-iframe';
import type { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';
import { colors } from '../theme/colors';

type Props = {
  videoId: string;
  width: number;
  height: number;
};

// Domains the player itself needs to load - anything else (youtube.com/watch,
// the YouTube app, youtu.be, etc.) is a "take me out of the app" navigation
// and gets blocked. Notably this list must include the react-native-youtube-
// iframe wrapper page's own host (lonelycpp.github.io) - its default
// onShouldStartLoadWithRequest actually calls Linking.openURL() to hand
// youtube.com taps off to the external YouTube app/Safari on iOS, which is
// exactly what we're overriding here, but blocking its own wrapper page by
// mistake would break the player entirely.
const ALLOWED_HOST_FRAGMENTS = [
  'lonelycpp.github.io',
  'youtube.com/embed',
  'youtube-nocookie.com',
  'about:blank',
  'googlevideo.com',
  'ytimg.com',
  'ggpht.com',
  'google.com/log',
  'doubleclick.net',
];

function isAllowedNavigation(url: string) {
  return ALLOWED_HOST_FRAGMENTS.some((fragment) => url.includes(fragment));
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Swallow orientation errors instead of taking the whole app down -
// lockAsync(LANDSCAPE) previously crashed at the native layer (not a
// catchable JS rejection on its own), so fullscreen now only calls the
// lighter unlockAsync/lockAsync(PORTRAIT_UP) pair, still guarded here.
async function safeOrientationCall(call: () => Promise<void>) {
  try {
    await call();
  } catch (err) {
    console.log('[video] orientation call failed', err);
  }
}

export default function YoutubeLessonPlayer({ videoId, width, height }: Props) {
  const playerRef = useRef<YoutubeIframeRef>(null);
  // Starts paused - YouTube's embedded iframe can't autoplay in a WebView,
  // so starting "playing" true left the UI stuck showing a pause icon over
  // a video that was never actually running, and the first tap just
  // silently confirmed that (already-false) state instead of starting it.
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const resumeAtRef = useRef(0);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Fit a 16:9 video into the current screen ("contain" sizing) instead of
  // stretching it to the full (usually much taller, portrait) screen
  // dimensions - that left the actual video in a small letterboxed strip
  // at the top with a huge dead black area below it holding the controls.
  const screenRatio = screenWidth / screenHeight;
  const videoRatio = 16 / 9;
  const fullscreenWidth =
    screenRatio > videoRatio ? screenHeight * videoRatio : screenWidth;
  const fullscreenHeight =
    screenRatio > videoRatio ? screenHeight : screenWidth / videoRatio;

  // A new lesson means a new video - don't carry over the previous one's
  // playhead/playing state into it.
  useEffect(() => {
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    resumeAtRef.current = 0;
  }, [videoId]);

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(async () => {
      const time = await playerRef.current?.getCurrentTime();
      if (typeof time === 'number') {
        setCurrentTime(time);
        resumeAtRef.current = time;
      }
    }, 500);
    return () => clearInterval(interval);
  }, [playing]);

  const handleReady = async () => {
    const total = await playerRef.current?.getDuration();
    if (typeof total === 'number') setDuration(total);
    if (resumeAtRef.current > 0) {
      await playerRef.current?.seekTo(resumeAtRef.current, true);
    }
  };

  const handleStateChange = (state: string) => {
    if (state === PLAYER_STATES.ENDED) {
      setPlaying(false);
      setCurrentTime(0);
      resumeAtRef.current = 0;
    }
  };

  const handleSeek = async (fraction: number) => {
    if (!duration) return;
    const target = Math.max(0, Math.min(duration, fraction * duration));
    resumeAtRef.current = target;
    await playerRef.current?.seekTo(target, true);
    setCurrentTime(target);
  };

  const handleTogglePlay = async () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    setPlaying(true);
    // The play/pause bridge (react-native-youtube-iframe's postMessage
    // channel into the WebView) is unreliable on some devices - seekTo
    // uses injectJavaScript directly and reliably reaches the player, and
    // re-seeking to the current position also resumes playback, so use it
    // as the actual "start playing" trigger instead of relying on the
    // `play` prop alone.
    const time = await playerRef.current?.getCurrentTime();
    await playerRef.current?.seekTo(
      typeof time === 'number' ? time : resumeAtRef.current,
      true
    );
  };

  const enterFullscreen = () => {
    setFullscreen(true);
    safeOrientationCall(() => ScreenOrientation.unlockAsync());
  };

  const exitFullscreen = () => {
    setFullscreen(false);
    safeOrientationCall(() =>
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
    );
  };

  // Defensive: if this unmounts (navigating away) while still fullscreen,
  // make sure rotation doesn't stay unlocked for the rest of the app -
  // harmless no-op if it was already locked back to portrait.
  useEffect(() => {
    return () => {
      safeOrientationCall(() =>
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
      );
    };
  }, []);

  const renderPlayer = (playerWidth: number, playerHeight: number, isFullscreen: boolean) => (
    <View style={{ width: playerWidth, height: playerHeight }}>
      <YoutubePlayer
        ref={playerRef}
        key={videoId}
        width={playerWidth}
        height={playerHeight}
        videoId={videoId}
        play={playing}
        onReady={handleReady}
        onChangeState={handleStateChange}
        initialPlayerParams={{ controls: false, rel: false }}
        webViewProps={{
          onShouldStartLoadWithRequest: (request: ShouldStartLoadRequest) =>
            isAllowedNavigation(request.mainDocumentURL || request.url),
        }}
      />

      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <Pressable style={styles.tapArea} onPress={handleTogglePlay}>
          <View style={styles.playButton}>
            <Feather
              name={playing ? 'pause' : 'play'}
              size={26}
              color={colors.text}
            />
          </View>
        </Pressable>

        <View style={styles.scrubberRow} pointerEvents="box-none">
          <Text style={styles.timeText}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </Text>
          <Pressable
            style={styles.progressTrack}
            onPress={(event) =>
              handleSeek(event.nativeEvent.locationX / (playerWidth - 90))
            }
          >
            <View style={styles.progressBg} />
            <View
              style={[
                styles.progressFill,
                {
                  width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                },
              ]}
            />
          </Pressable>
          <Pressable
            style={styles.fullscreenButton}
            onPress={isFullscreen ? exitFullscreen : enterFullscreen}
          >
            <Feather
              name={isFullscreen ? 'minimize' : 'maximize'}
              size={16}
              color={colors.text}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <>
      {!fullscreen && renderPlayer(width, height, false)}

      <Modal visible={fullscreen} animationType="fade" onRequestClose={exitFullscreen}>
        <View style={styles.fullscreenModal}>
          {fullscreen && renderPlayer(fullscreenWidth, fullscreenHeight, true)}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fullscreenModal: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrubberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    paddingBottom: 8,
  },
  timeText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '600',
  },
  progressTrack: {
    flex: 1,
    height: 20,
    justifyContent: 'center',
  },
  progressBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accentBlue,
  },
  fullscreenButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
