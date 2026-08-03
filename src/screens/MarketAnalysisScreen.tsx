import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/colors';
import { MainTabParamList, MoreStackParamList } from '../navigation/types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import GlowBackground from '../components/GlowBackground';
import TopBar from '../components/TopBar';
import EmptyStateCard from '../components/EmptyStateCard';
import FloatingChatButton from '../components/FloatingChatButton';

type Props = NativeStackScreenProps<MoreStackParamList, 'MarketAnalysis'>;

const WIDGET_HTML = `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <style>
      html, body { margin: 0; padding: 0; background: #05070E; }
      .tradingview-widget-container { margin-bottom: 12px; }
    </style>
  </head>
  <body>
    <div class="tradingview-widget-container">
      <div id="tradingview_chart"></div>
      <script type="text/javascript" src="https://s3.tradingview.com/tv.js"></script>
      <script type="text/javascript">
        new TradingView.widget({
          "width": "100%",
          "height": 420,
          "symbol": "OANDA:XAUUSD",
          "interval": "60",
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "toolbar_bg": "#05070E",
          "enable_publishing": false,
          "allow_symbol_change": true,
          "hide_side_toolbar": true,
          "container_id": "tradingview_chart"
        });
      </script>
    </div>
    <div class="tradingview-widget-container">
      <div class="tradingview-widget-container__widget"></div>
      <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-events.js" async>
      {
        "colorTheme": "dark",
        "isTransparent": false,
        "width": "100%",
        "height": "500",
        "locale": "en",
        "importanceFilter": "-1,0,1"
      }
      </script>
    </div>
  </body>
</html>
`;

export default function MarketAnalysisScreen({ navigation }: Props) {
  const { profile } = useAuth();
  const tabNavigation =
    navigation.getParent<BottomTabNavigationProp<MainTabParamList>>();

  const [checkingAccess, setCheckingAccess] = useState(true);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    supabase
      .from('feature_tier_settings')
      .select('default_tier')
      .eq('feature_key', 'market_analysis')
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (!error && data?.default_tier === 'premium') {
          setLocked(profile?.tier !== 'premium');
        }
        setCheckingAccess(false);
      });

    return () => {
      cancelled = true;
    };
  }, [profile]);

  if (checkingAccess) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <GlowBackground />
        <ActivityIndicator color={colors.accentBlue} style={styles.loader} />
      </SafeAreaView>
    );
  }

  if (locked) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <GlowBackground />
        <View style={styles.gatedContent}>
          <TopBar />
          <View style={styles.headerRow}>
            <View style={styles.headerIcon}>
              <Feather name="bar-chart-2" size={20} color={colors.link} />
            </View>
            <Text style={styles.headerTitle}>Market Analysis</Text>
          </View>
          <EmptyStateCard
            icon="lock"
            title="Premium Feature"
            subtitle="Connect and fund your PrimeXBT account to unlock live charts and the economic calendar."
            buttonLabel="Go to Home"
            onPress={() => tabNavigation?.navigate('Home')}
            style={styles.cardSpaced}
          />
        </View>
        <FloatingChatButton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <GlowBackground />
      <View style={styles.headerWrap}>
        <TopBar />
        <View style={styles.headerRow}>
          <View style={styles.headerIcon}>
            <Feather name="bar-chart-2" size={20} color={colors.link} />
          </View>
          <Text style={styles.headerTitle}>Market Analysis</Text>
        </View>
      </View>
      <WebView
        source={{ html: WIDGET_HTML }}
        style={styles.webview}
        scrollEnabled
        originWhitelist={['*']}
      />
      <FloatingChatButton />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loader: {
    flex: 1,
  },
  headerWrap: {
    paddingHorizontal: 20,
  },
  gatedContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    marginBottom: 8,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(78,140,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    flexShrink: 1,
  },
  cardSpaced: {
    marginTop: 20,
  },
  webview: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
