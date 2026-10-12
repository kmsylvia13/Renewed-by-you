import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Redirect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useAppStore } from '@/state/AppStore';

export default function WelcomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, hydrated, signIn } = useAppStore();
  const [mode, setMode] = useState<'welcome' | 'create' | 'login'>('welcome');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  if (!hydrated) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (profile) {
    return <Redirect href="/(tabs)" />;
  }

  const submit = () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Add a valid email to continue.');
      return;
    }
    const displayName =
      mode === 'create'
        ? name.trim()
        : name.trim() || cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
    if (mode === 'create' && displayName.length < 2) {
      setError('Add your name so your campus community can say hi.');
      return;
    }
    Keyboard.dismiss();
    signIn(displayName || 'Campus friend', cleanEmail);
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.page, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topInset + 12 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brandRow}>
          <View style={[styles.logo, { backgroundColor: colors.sage }]}>
            <Ionicons name="leaf-outline" size={20} color={colors.primary} />
          </View>
          <Text style={[styles.brand, { color: colors.foreground }]}>
            renewed<Text style={{ color: colors.primary }}> by you</Text>
          </Text>
        </View>

        <View style={styles.hero}>
          <Image
            source={require('../assets/images/dress.jpg')}
            style={styles.heroPhoto}
            resizeMode="cover"
          />
          <View style={[styles.heroBadge, { backgroundColor: colors.butter }]}>
            <Ionicons name="sparkles-outline" color={colors.accentForeground} size={14} />
            <Text style={[styles.heroBadgeText, { color: colors.accentForeground }]}>
              your closet, shared
            </Text>
          </View>
        </View>

        <View style={styles.copy}>
          <Text style={[styles.kicker, { color: colors.primary }]}>
            LESS BUYING. MORE OUTFIT REPEATING.
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            A new look,{'\n'}without a new buy.
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Borrow, swap, and pass along good clothes with people right on your campus.
          </Text>
        </View>

        {mode === 'welcome' ? (
          <View style={styles.actions}>
            <Pressable
              testID="get-started"
              onPress={() => setMode('create')}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: colors.primary, opacity: pressed ? 0.86 : 1 },
              ]}
            >
              <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>Create your account</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.primaryForeground} />
            </Pressable>
            <Pressable
              testID="login"
              onPress={() => setMode('login')}
              style={[styles.secondaryButton, { borderColor: colors.border }]}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.foreground }]}>
                I already have an account
              </Text>
            </Pressable>
            <Text style={[styles.note, { color: colors.mutedForeground }]}>
              Made for your campus, and the planet.
            </Text>
          </View>
        ) : (
          <View style={[styles.form, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.formHeading}>
              <Text style={[styles.formTitle, { color: colors.foreground }]}>
                {mode === 'create' ? 'Join the closet' : 'Welcome back'}
              </Text>
              <Pressable
                accessibilityLabel="Back"
                onPress={() => {
                  setError('');
                  setMode('welcome');
                }}
                hitSlop={12}
              >
                <Ionicons name="close" size={22} color={colors.mutedForeground} />
              </Pressable>
            </View>
            {mode === 'create' && (
              <TextInput
                testID="name-input"
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="words"
                style={[styles.input, { borderColor: colors.input, color: colors.foreground }]}
              />
            )}
            <TextInput
              testID="email-input"
              value={email}
              onChangeText={setEmail}
              placeholder="College email"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={[styles.input, { borderColor: colors.input, color: colors.foreground }]}
            />
            {!!error && <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>}
            <Pressable
              testID="continue-auth"
              onPress={submit}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: colors.primary, opacity: pressed ? 0.86 : 1 },
              ]}
            >
              <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>Continue</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.primaryForeground} />
            </Pressable>
            <Pressable
              onPress={() => {
                setError('');
                setMode(mode === 'create' ? 'login' : 'create');
              }}
              style={styles.switchMode}
            >
              <Text style={[styles.switchText, { color: colors.mutedForeground }]}>
                {mode === 'create' ? 'Already here? ' : 'New to Renewed? '}
                <Text style={{ color: colors.primary, fontWeight: '700' }}>
                  {mode === 'create' ? 'Log in' : 'Create an account'}
                </Text>
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  page: { flex: 1 },
  content: { paddingHorizontal: 26, paddingBottom: 34, maxWidth: 520, width: '100%', alignSelf: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 38, height: 38, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  brand: { fontSize: 18, letterSpacing: -0.5, fontWeight: '700' },
  hero: { marginTop: 26, height: 330, borderRadius: 30, overflow: 'hidden' },
  heroPhoto: { width: '100%', height: '100%' },
  heroBadge: { position: 'absolute', left: 14, bottom: 14, borderRadius: 30, paddingHorizontal: 13, paddingVertical: 9, flexDirection: 'row', gap: 6, alignItems: 'center' },
  heroBadgeText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.1 },
  copy: { marginTop: 28 },
  kicker: { fontSize: 10, fontWeight: '700', letterSpacing: 1.3 },
  title: { fontSize: 38, lineHeight: 43, fontWeight: '700', letterSpacing: -1.6, marginTop: 10 },
  subtitle: { fontSize: 15, lineHeight: 23, marginTop: 12, maxWidth: 350 },
  actions: { marginTop: 24, gap: 11 },
  primaryButton: { minHeight: 54, borderRadius: 17, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  primaryButtonText: { fontSize: 15, fontWeight: '700' },
  secondaryButton: { minHeight: 52, borderRadius: 17, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  secondaryButtonText: { fontSize: 14, fontWeight: '600' },
  note: { textAlign: 'center', fontSize: 12, marginTop: 5 },
  form: { marginTop: 22, padding: 17, borderWidth: 1, borderRadius: 22, gap: 11 },
  formHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  formTitle: { fontSize: 19, fontWeight: '700' },
  input: { minHeight: 49, paddingHorizontal: 14, borderWidth: 1, borderRadius: 13, fontSize: 14 },
  error: { fontSize: 12, marginTop: -4 },
  switchMode: { alignItems: 'center', paddingVertical: 6 },
  switchText: { fontSize: 12 },
});
