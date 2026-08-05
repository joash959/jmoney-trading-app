import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/colors';
import { MainTabParamList, MoreStackParamList } from '../navigation/types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import GlowBackground from '../components/GlowBackground';
import TopBar from '../components/TopBar';
import ScreenHeader from '../components/ScreenHeader';
import EmptyStateCard from '../components/EmptyStateCard';

type Props = NativeStackScreenProps<MoreStackParamList, 'MarketAnalysis'>;

const WIDGET_HTML = `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <style>
      html, body { margin: 0; padding: 0; background: #0A0A0D; }
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
          "toolbar_bg": "#0A0A0D",
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
          <ScreenHeader
            icon="bar-chart-2"
            image={require('../../assets/marketanalysis.png')}
            title="Market Analysis"
          />
          <EmptyStateCard
            icon="lock"
            title="Premium Feature"
            subtitle="Connect and fund your PrimeXBT account to unlock live charts and the economic calendar."
            buttonLabel="Go to Home"
            onPress={() => tabNavigation?.navigate('Home')}
            style={styles.cardSpaced}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <GlowBackground />
      <View style={styles.headerWrap}>
        <TopBar />
        <ScreenHeader
          icon="bar-chart-2"
          image={require('../../assets/marketanalysis.png')}
          title="Market Analysis"
        />
      </View>
      <WebView
        source={{ html: WIDGET_HTML }}
        style={styles.webview}
        scrollEnabled
        originWhitelist={['*']}
      />
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
  cardSpaced: {
    marginTop: 20,
  },
  webview: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
