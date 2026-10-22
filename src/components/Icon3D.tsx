import { Image, ImageStyle, StyleProp } from 'react-native';

// 3D icons. Feature icons use the J Money black-and-blue set
// (assets/icons-brand); rewards and extras the set doesn't cover use
// Microsoft Fluent Emoji 3D (MIT - see assets/icons3d/LICENSE.md).
const ICONS = {
  'alerts': require('../../assets/icons-brand/alerts.webp'),
  'analysis': require('../../assets/icons-brand/analysis.webp'),
  'ballot': require('../../assets/icons3d/ballot.webp'),
  'bank': require('../../assets/icons3d/bank.webp'),
  'bell': require('../../assets/icons-brand/bell.webp'),
  'books': require('../../assets/icons-brand/courses.webp'),
  'brain': require('../../assets/icons3d/brain.webp'),
  'briefcase': require('../../assets/icons-brand/portfolio.webp'),
  'broker': require('../../assets/icons-brand/broker.webp'),
  'bronze': require('../../assets/icons3d/bronze.webp'),
  'calendar': require('../../assets/icons3d/calendar.webp'),
  'chart-down': require('../../assets/icons3d/chart-down.webp'),
  'chart-up': require('../../assets/icons3d/chart-up.webp'),
  'chat': require('../../assets/icons-brand/support.webp'),
  'check': require('../../assets/icons3d/check.webp'),
  'courses': require('../../assets/icons-brand/courses.webp'),
  'crown': require('../../assets/icons3d/crown.webp'),
  'dashboard': require('../../assets/icons-brand/dashboard.webp'),
  'fire': require('../../assets/icons3d/fire.webp'),
  'gem': require('../../assets/icons3d/gem.webp'),
  'gift': require('../../assets/icons3d/gift.webp'),
  'gold': require('../../assets/icons3d/gold.webp'),
  'green-heart': require('../../assets/icons3d/green-heart.webp'),
  'journal': require('../../assets/icons-brand/journal.webp'),
  'link': require('../../assets/icons3d/link.webp'),
  'live': require('../../assets/icons-brand/live.webp'),
  'lock': require('../../assets/icons3d/lock.webp'),
  'market-scan': require('../../assets/icons-brand/market-scan.webp'),
  'medal': require('../../assets/icons3d/medal.webp'),
  'money-bag': require('../../assets/icons3d/money-bag.webp'),
  'podium': require('../../assets/icons-brand/podium.webp'),
  'rocket': require('../../assets/icons3d/rocket.webp'),
  'scanner': require('../../assets/icons-brand/scanner.webp'),
  'silver': require('../../assets/icons3d/silver.webp'),
  'star': require('../../assets/icons3d/star.webp'),
  'tag': require('../../assets/icons3d/tag.webp'),
  'target': require('../../assets/icons3d/target.webp'),
  'telegram': require('../../assets/icons-brand/telegram.webp'),
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
