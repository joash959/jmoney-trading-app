import { Ionicons } from '@expo/vector-icons';
import glyphMap from '@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/Ionicons.json';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const FALLBACK: IoniconName = 'chatbubble-outline';

// Community icon_name values come from Lucide (the web app's icon set),
// which doesn't map 1:1 onto Ionicons. This translates the common ones and
// falls back to a sane default for anything unrecognized, rather than
// risking an invalid icon name.
const LUCIDE_TO_IONICON: Record<string, IoniconName> = {
  send: 'paper-plane-outline',
  'message-circle': 'chatbubble-outline',
  'message-square': 'chatbubble-outline',
  users: 'people-outline',
  'users-round': 'people-outline',
  zap: 'flash-outline',
  shield: 'shield-outline',
  'shield-check': 'shield-checkmark-outline',
  bell: 'notifications-outline',
  star: 'star-outline',
  award: 'trophy-outline',
  trophy: 'trophy-outline',
  'trending-up': 'trending-up-outline',
  'bar-chart': 'bar-chart-outline',
  'bar-chart-2': 'bar-chart-outline',
  lock: 'lock-closed-outline',
  globe: 'globe-outline',
  hash: 'key-outline',
};

export function toIonicon(name: string | null | undefined): IoniconName {
  if (!name) return FALLBACK;
  const mapped = LUCIDE_TO_IONICON[name];
  if (mapped) return mapped;
  // If the name happens to already be a valid Ionicons glyph, use it as-is.
  if (name in glyphMap) return name as IoniconName;
  return FALLBACK;
}
