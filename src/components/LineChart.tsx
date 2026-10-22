import { useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, PanResponder, StyleProp, View, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';

export type ChartPoint = { label: string; value: number };

type Props = {
  data: ChartPoint[];
  height?: number;
  /** Line colour - defaults to the brand purple. */
  color?: string;
  /** Called with the point under the finger while scrubbing, null on release. */
  onScrub?: (point: ChartPoint | null) => void;
  style?: StyleProp<ViewStyle>;
};

const PAD_Y = 10;

/** Robinhood-style line chart: smooth line with a soft area fill, a dotted
 * baseline at the starting value, and drag-to-scrub. */
export default function LineChart({
  data,
  height = 150,
  color,
  onScrub,
  style,
}: Props) {
  const [width, setWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const lastIndex = useRef<number | null>(null);

  // Unique per chart: SVG ids are global on web, so two charts would clash.
  const gradientId = useRef(`area-${Math.random().toString(36).slice(2)}`).current;
  const series = useMemo(
    () => (data.length >= 2 ? data : [{ label: '', value: 0 }, { label: '', value: 0 }]),
    [data]
  );
  const stroke = color ?? colors.primary;

  const geometry = useMemo(() => {
    if (width === 0) return null;
    const values = series.map((p) => p.value);
    let min = Math.min(...values);
    let max = Math.max(...values);
    if (min === max) {
      min -= 1;
      max += 1;
    }
    const x = (i: number) => (i / (series.length - 1)) * width;
    const y = (v: number) => PAD_Y + (1 - (v - min) / (max - min)) * (height - PAD_Y * 2);
    const pts = series.map((p, i) => ({ x: x(i), y: y(p.value) }));

    // Catmull-Rom -> cubic Bezier for a smooth line through every point.
    let line = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] ?? pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] ?? p2;
      const t = 0.18;
      const c1x = p1.x + (p2.x - p0.x) * t;
      const c1y = p1.y + (p2.y - p0.y) * t;
      const c2x = p2.x - (p3.x - p1.x) * t;
      const c2y = p2.y - (p3.y - p1.y) * t;
      line += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
    }
    const area = `${line} L ${pts[pts.length - 1].x} ${height} L ${pts[0].x} ${height} Z`;
    return { pts, line, area, baselineY: y(series[0].value) };
  }, [series, width, height]);

  const indexAt = (locationX: number) => {
    if (width === 0) return 0;
    const i = Math.round((locationX / width) * (series.length - 1));
    return Math.max(0, Math.min(series.length - 1, i));
  };

  const update = (locationX: number) => {
    const i = indexAt(locationX);
    if (i !== lastIndex.current) {
      lastIndex.current = i;
      Haptics.selectionAsync();
      setActiveIndex(i);
      onScrub?.(series[i]);
    }
  };

  const end = () => {
    lastIndex.current = null;
    setActiveIndex(null);
    onScrub?.(null);
  };

  // Created once; reads the latest handlers through a ref so it never
  // works off stale width/data.
  const handlersRef = useRef({ update, end, enabled: data.length >= 2 });
  handlersRef.current = { update, end, enabled: data.length >= 2 };
  const pan = useRef(
    PanResponder.create({
      // Claim the touch only once it's clearly a sideways drag, so a vertical
      // swipe that starts on the chart still scrolls the page.
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) =>
        handlersRef.current.enabled && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => handlersRef.current.update(e.nativeEvent.locationX),
      onPanResponderMove: (e) => handlersRef.current.update(e.nativeEvent.locationX),
      onPanResponderRelease: () => handlersRef.current.end(),
      onPanResponderTerminate: () => handlersRef.current.end(),
    })
  ).current;

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const active = activeIndex !== null && geometry ? geometry.pts[activeIndex] : null;

  return (
    <View
      style={[{ height }, style]}
      onLayout={onLayout}
      {...pan.panHandlers}
    >
      {geometry && (
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={stroke} stopOpacity={0.22} />
              <Stop offset="1" stopColor={stroke} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Line
            x1={0}
            x2={width}
            y1={geometry.baselineY}
            y2={geometry.baselineY}
            stroke="rgba(255,255,255,0.18)"
            strokeWidth={1}
            strokeDasharray="2 5"
          />
          <Path d={geometry.area} fill={`url(#${gradientId})`} />
          <Path
            d={geometry.line}
            fill="none"
            stroke={stroke}
            strokeWidth={2.2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {active && (
            <>
              <Line
                x1={active.x}
                x2={active.x}
                y1={0}
                y2={height}
                stroke="rgba(255,255,255,0.35)"
                strokeWidth={1}
              />
              <Circle cx={active.x} cy={active.y} r={9} fill={stroke} opacity={0.25} />
              <Circle cx={active.x} cy={active.y} r={4.5} fill={stroke} stroke={colors.background} strokeWidth={2} />
            </>
          )}
          {!active && geometry.pts.length > 0 && (
            <Circle
              cx={geometry.pts[geometry.pts.length - 1].x}
              cy={geometry.pts[geometry.pts.length - 1].y}
              r={3.5}
              fill={stroke}
            />
          )}
        </Svg>
      )}
    </View>
  );
}
