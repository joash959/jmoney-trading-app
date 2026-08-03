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

export type LiveSession = {
  id: string;
  title: string;
  description: string | null;
  host: string | null;
  session_date: string;
  session_time: string | null;
  duration: number | null;
  zoom_link: string | null;
  zoom_password: string | null;
  status: string | null;
  display_order: number | null;
  is_active: boolean;
  tier: 'free' | 'premium';
  created_at: string;
  updated_at: string;
};
