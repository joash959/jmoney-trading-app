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
