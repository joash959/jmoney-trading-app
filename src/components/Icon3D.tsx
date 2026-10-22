import { Image, ImageStyle, StyleProp } from 'react-native';

// Glossy 3D icons (Microsoft Fluent Emoji 3D, MIT - see assets/icons3d/LICENSE.md).
const ICONS = {
  'alerts': require('../../assets/icons3d/alerts.webp'),
  'analysis': require('../../assets/icons3d/analysis.webp'),
  'ballot': require('../../assets/icons3d/ballot.webp'),
  'bank': require('../../assets/icons3d/bank.webp'),
  'bell': require('../../assets/icons3d/bell.webp'),
  'books': require('../../assets/icons3d/books.webp'),
  'brain': require('../../assets/icons3d/brain.webp'),
  'briefcase': require('../../assets/icons3d/briefcase.webp'),
  'bronze': require('../../assets/icons3d/bronze.webp'),
  'calendar': require('../../assets/icons3d/calendar.webp'),
  'chart-down': require('../../assets/icons3d/chart-down.webp'),
  'chart-up': require('../../assets/icons3d/chart-up.webp'),
  'chat': require('../../assets/icons3d/chat.webp'),
  'check': require('../../assets/icons3d/check.webp'),
  'courses': require('../../assets/icons3d/courses.webp'),
  'crown': require('../../assets/icons3d/crown.webp'),
  'envelope': require('../../assets/icons3d/envelope.webp'),
  'fire': require('../../assets/icons3d/fire.webp'),
  'gem': require('../../assets/icons3d/gem.webp'),
  'gift': require('../../assets/icons3d/gift.webp'),
  'gold': require('../../assets/icons3d/gold.webp'),
  'green-heart': require('../../assets/icons3d/green-heart.webp'),
  'journal': require('../../assets/icons3d/journal.webp'),
  'link': require('../../assets/icons3d/link.webp'),
  'live': require('../../assets/icons3d/live.webp'),
  'lock': require('../../assets/icons3d/lock.webp'),
  'medal': require('../../assets/icons3d/medal.webp'),
  'money-bag': require('../../assets/icons3d/money-bag.webp'),
  'rocket': require('../../assets/icons3d/rocket.webp'),
  'scanner': require('../../assets/icons3d/scanner.webp'),
  'silver': require('../../assets/icons3d/silver.webp'),
  'speech': require('../../assets/icons3d/speech.webp'),
  'star': require('../../assets/icons3d/star.webp'),
  'tag': require('../../assets/icons3d/tag.webp'),
  'target': require('../../assets/icons3d/target.webp'),
  'telegram': require('../../assets/icons3d/telegram.webp'),
  'trophy': require('../../assets/icons3d/trophy.webp'),
  'wave': require('../../assets/icons3d/wave.webp'),
} as const;

export type Icon3DName = keyof typeof ICONS;

type Props = {
  name: Icon3DName;
  size?: number;
  style?: StyleProp<ImageStyle>;
  /** Dim it, e.g. for a locked badge. */
  muted?: boolean;
};

/** A 3D icon - the app's gamified icon style everywhere except the tab bar. */
export default function Icon3D({ name, size = 32, style, muted = false }: Props) {
  return (
    <Image
      source={ICONS[name]}
      style={[{ width: size, height: size }, muted && { opacity: 0.3 }, style]}
      resizeMode="contain"
    />
  );
}
