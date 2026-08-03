import type { NavigatorScreenParams } from '@react-navigation/native';

export type MoreStackParamList = {
  MoreHome: undefined;
  AIScanner: undefined;
  TelegramChannels: undefined;
  TradingJournal: undefined;
  Leaderboard: undefined;
  RecommendedBroker: undefined;
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
  Main: NavigatorScreenParams<MainTabParamList>;
};
