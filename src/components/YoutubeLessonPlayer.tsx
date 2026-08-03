import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
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

export default function YoutubeLessonPlayer({ videoId, width, height }: Props) {
  const playerRef = useRef<YoutubeIframeRef>(null);
  const [playing, setPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(async () => {
      const time = await playerRef.current?.getCurrentTime();
      if (typeof time === 'number') setCurrentTime(time);
    }, 500);
    return () => clearInterval(interval);
  }, [playing]);

  const handleReady = async () => {
    const total = await playerRef.current?.getDuration();
    if (typeof total === 'number') setDuration(total);
  };

  const handleStateChange = (state: string) => {
    if (state === PLAYER_STATES.ENDED) {
      setPlaying(false);
      setCurrentTime(0);
    }
  };

  const handleSeek = async (fraction: number) => {
    if (!duration) return;
    const target = Math.max(0, Math.min(duration, fraction * duration));
    await playerRef.current?.seekTo(target, true);
    setCurrentTime(target);
  };

  return (
    <View style={{ width, height }}>
      <YoutubePlayer
        ref={playerRef}
        key={videoId}
        width={width}
        height={height}
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
        <Pressable
          style={styles.tapArea}
          onPress={() => setPlaying((prev) => !prev)}
        >
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
              handleSeek(event.nativeEvent.locationX / (width - 90))
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
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
