import type { NavigatorScreenParams } from '@react-navigation/native';

export type MoreStackParamList = {
  MoreHome: undefined;
  AIScanner: undefined;
  TelegramChannels: undefined;
  TradingJournal: undefined;
  Leaderboard: undefined;
  RecommendedBroker: undefined;
  MarketAnalysis: undefined;
  Notifications: undefined;
  ContactUs: undefined;
};

export type CoursesStackParamList = {
  CoursesHome: undefined;
  CourseDetail: { courseId: string; lessonId?: string };
};

export type MainTabParamList = {
  Home: undefined;
  Courses: NavigatorScreenParams<CoursesStackParamList>;
  Alerts: undefined;
  Live: undefined;
  More: NavigatorScreenParams<MoreStackParamList>;
};

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email: string };
  Main: NavigatorScreenParams<MainTabParamList>;
};
