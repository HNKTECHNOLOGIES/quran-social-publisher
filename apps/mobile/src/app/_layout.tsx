import { Platform, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/lib/auth';
import { colors } from '@/theme';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <View style={styles.webBg}>
        <View style={styles.phone}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.canvas },
            }}
          />
        </View>
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  webBg: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? '#0b241c' : colors.canvas,
    alignItems: 'center',
  },
  phone: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 430 : undefined,
    backgroundColor: colors.canvas,
  },
});
