export type Profile = {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  membership_tier: string | null;
  phone_number: string | null;
  is_approved: boolean;
  approved_at: string | null;
  approved_by: string | null;
  access_expires_at: string | null;
  referred_by_affiliate_id: string | null;
  tier: 'free' | 'premium';
  created_at: string;
  updated_at: string;
};

export type Course = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  level: string | null;
  thumbnail_url: string | null;
  instructor_name: string | null;
  instructor_avatar: string | null;
  duration_hours: number | null;
  lessons_count: number | null;
  is_premium: boolean;
  tier: 'free' | 'premium';
  created_at: string;
  updated_at: string;
};

export type Lesson = {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  duration_minutes: number | null;
  order_index: number | null;
  is_preview: boolean;
  created_at: string;
};

export type LeaderboardSettings = {
  id: string;
  is_active: boolean;
  competition_status: string | null;
  competition_name: string | null;
  competition_end_date: string | null;
  prize_1st: number | null;
  prize_2nd: number | null;
  prize_3rd: number | null;
  currency_symbol: string | null;
  rules: string | null;
  banner_subtitle: string | null;
  show_leaderboard: boolean;
  show_podium: boolean;
  updated_at: string;
  updated_by: string | null;
};

export type LeaderboardParticipant = {
  id: string;
  user_id: string;
  name: string;
  nickname: string | null;
  mt5_number: string | null;
  profit_percentage: number | null;
  trades_count: number | null;
  win_rate: number | null;
  rank: number | null;
  previous_rank: number | null;
  total_volume: number | null;
  baseline_volume: number | null;
  baseline_month: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Community = {
  id: string;
  name: string;
  description: string | null;
  member_count: string | null;
  icon_name: string;
  category: string;
  display_order: number;
  is_active: boolean;
  tier: 'free' | 'premium';
  created_at: string;
  updated_at: string;
};

export type TelegramLink = {
  id: string;
  user_id: string;
  telegram_user_id: number | null;
  telegram_username: string | null;
  telegram_first_name: string | null;
  status: 'pending' | 'invited' | 'joined' | 'removed';
  in_channel: boolean;
  invite_link: string | null;
  joined_at: string | null;
  removed_at: string | null;
};

export type TelegramAccessReason =
  | 'not_funded'
  | 'not_approved'
  | 'expired'
  | 'eligible_removed'
  | 'not_joined'
  | null;

export type TelegramAccessStatus = {
  link: TelegramLink | null;
  funded: boolean;
  accessActive: boolean;
  isApproved: boolean;
  accessExpiresAt: string | null;
  expired: boolean;
  removedAt: string | null;
  reason: TelegramAccessReason;
  canRecover: boolean;
};

export type TradeJournalEntry = {
  id: string;
  user_id: string;
  trade_date: string;
  profit_loss: number;
  number_of_trades: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type NotificationRow = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
};

export type LiveSession = {
  id: string;
  title: string;
  description: string | null;
  host: string | null;
  session_date: string;
  session_time: string | null;
  duration: number | null;
  status: string | null;
  display_order: number | null;
  is_active: boolean;
  tier: 'free' | 'premium';
  created_at: string;
  updated_at: string;
};
