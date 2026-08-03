import { Feather } from '@expo/vector-icons';
import glyphMap from '@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/Feather.json';

type FeatherName = React.ComponentProps<typeof Feather>['name'];

const FALLBACK: FeatherName = 'message-circle';

// Community icon_name values come from Lucide (the web app's icon set),
// which doesn't map 1:1 onto Feather. This translates the common ones and
// falls back to a sane default for anything unrecognized, rather than
// risking an invalid icon name.
const LUCIDE_TO_FEATHER: Record<string, FeatherName> = {
  send: 'send',
  'message-circle': 'message-circle',
  'message-square': 'message-circle',
  users: 'users',
  'users-round': 'users',
  zap: 'zap',
  shield: 'shield',
  'shield-check': 'shield',
  bell: 'bell',
  star: 'star',
  award: 'award',
  trophy: 'award',
  'trending-up': 'trending-up',
  'bar-chart': 'bar-chart-2',
  'bar-chart-2': 'bar-chart-2',
  lock: 'lock',
  globe: 'globe',
  hash: 'hash',
};

export function toFeatherIcon(name: string | null | undefined): FeatherName {
  if (!name) return FALLBACK;
  const mapped = LUCIDE_TO_FEATHER[name];
  if (mapped) return mapped;
  // If the name happens to already be a valid Feather glyph, use it as-is.
  if (name in glyphMap) return name as FeatherName;
  return FALLBACK;
}
