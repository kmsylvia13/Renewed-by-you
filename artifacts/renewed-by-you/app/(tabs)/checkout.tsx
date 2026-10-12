import { useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatDate } from '@/data/catalog';
import { useColors } from '@/hooks/useColors';
import { useAppStore } from '@/state/AppStore';

export default function CheckoutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    itemId: string;
    mode: string;
    startDate?: string;
    endDate?: string;
    nights?: string;
  }>();
  const { items, addRental, addSwapRequest } = useAppStore();
  const [confirmed, setConfirmed] = useState(false);
  const item = items.find((entry) => entry.id === params.itemId);
  const swap = params.mode === 'swap';
  const startDate = params.startDate ? new Date(params.startDate) : new Date();
  const endDate = params.endDate ? new Date(params.endDate) : new Date();
  const days = Math.max(1, Number(params.nights || 1));
  const total = (item?.price ?? 0) * days;
  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  const confirm = () => {
    if (!item) return;
    if (swap) {
      addSwapRequest({
        id: Date.now().toString(),
        itemId: item.id,
        title: item.title,
        image: item.image,
        requestedAt: new Date().toISOString(),
        status: 'pending',
      });
    } else {
      addRental({
        id: Date.now().toString(),
        itemId: item.id,
        title: item.title,
        image: item.image,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        total,
        status: 'upcoming',
      });
    }
    setConfirmed(true);
  };

  if (!item) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <Text style={[styles.missing, { color: colors.foreground }]}>We couldn’t find this piece.</Text>
        <Pressable onPress={() => router.replace('/(tabs)')}><Text style={{ color: colors.primary }}>Back to discover</Text></Pressable>
      </View>
    );
  }

  if (confirmed) {
    return (
      <View style={[styles.successScreen, { backgroundColor: colors.background, paddingTop: topInset + 24 }]}>
        <View style={[styles.successIcon, { backgroundColor: colors.sage }]}>
          <Ionicons name={swap ? 'repeat-outline' : 'checkmark'} size={32} color={colors.primary} />
        </View>
        <Text style={[styles.successTitle, { color: colors.foreground }]}>
          {swap ? 'Swap request sent!' : 'It’s yours for a bit.'}
        </Text>
        <Text style={[styles.successBody, { color: colors.mutedForeground }]}>
          {swap
            ? `Your note to ${item.owner} is saved. You’ll see the request in My closet.`
            : `${item.title} is reserved from ${formatDate(startDate)} to ${formatDate(endDate)}. No payment was collected.`}
        </Text>
        <Pressable
          testID="view-rental"
          onPress={() => router.replace('/(tabs)/profile')}
          style={({ pressed }) => [styles.confirmButton, { backgroundColor: colors.primary, opacity: pressed ? 0.86 : 1 }]}
        >
          <Text style={[styles.confirmButtonText, { color: colors.primaryForeground }]}>View my closet</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.primaryForeground} />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: topInset + 5, paddingBottom: 28 }]} showsVerticalScrollIndicator={false}>
        <Pressable
          testID="checkout-back"
          onPress={() => router.back()}
          style={styles.back}
        >
          <Ionicons name="arrow-back" size={19} color={colors.foreground} />
          <Text style={[styles.backText, { color: colors.foreground }]}>Back</Text>
        </Pressable>
        <Text style={[styles.kicker, { color: colors.primary }]}>{swap ? 'GOOD THINGS GO AROUND' : 'ALMOST YOURS'}</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>{swap ? 'Propose a swap' : 'Review your rental'}</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {swap ? 'A friendly first step toward a closet refresh.' : 'A quick check before this piece joins your rotation.'}
        </Text>

        <View style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Image source={item.image} style={styles.itemImage} resizeMode="cover" />
          <View style={styles.itemInfo}>
            <Text style={[styles.itemName, { color: colors.foreground }]}>{item.title}</Text>
            <Text style={[styles.itemMeta, { color: colors.mutedForeground }]}>{item.size}</Text>
            <Text style={[styles.itemOwner, { color: colors.primary }]}>from {item.owner}</Text>
          </View>
        </View>

        {!swap ? (
          <View style={[styles.breakdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.panelTitle, { color: colors.foreground }]}>Your rental</Text>
            <View style={styles.line}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Pickup</Text>
              <Text style={[styles.value, { color: colors.foreground }]}>{formatDate(startDate)}</Text>
            </View>
            <View style={styles.line}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Return</Text>
              <Text style={[styles.value, { color: colors.foreground }]}>{formatDate(endDate)}</Text>
            </View>
            <View style={styles.line}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>${item.price} × {days} {days === 1 ? 'day' : 'days'}</Text>
              <Text style={[styles.value, { color: colors.foreground }]}>${total}</Text>
            </View>
            <View style={[styles.line, styles.totalLine, { borderTopColor: colors.border }]}>
              <Text style={[styles.totalLabel, { color: colors.foreground }]}>Demo total</Text>
              <Text style={[styles.total, { color: colors.primary }]}>${total}</Text>
            </View>
          </View>
        ) : (
          <View style={[styles.swapNotice, { backgroundColor: colors.lavender }]}>
            <Ionicons name="chatbubble-ellipses-outline" size={19} color={colors.accentForeground} />
            <Text style={[styles.swapNoticeText, { color: colors.foreground }]}>
              Swap details are arranged directly with {item.owner}. This request does not include payment.
            </Text>
          </View>
        )}

        <View style={[styles.demoNotice, { backgroundColor: colors.sage }]}>
          <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
          <Text style={[styles.demoNoticeText, { color: colors.foreground }]}>
            {swap ? 'This is a demo request. Nothing is sent outside the app.' : 'Demo checkout only — no card details and no real payment.'}
          </Text>
        </View>

        <Pressable
          testID="confirm-checkout"
          onPress={confirm}
          style={({ pressed }) => [styles.confirmButton, { backgroundColor: colors.primary, opacity: pressed ? 0.86 : 1 }]}
        >
          <Text style={[styles.confirmButtonText, { color: colors.primaryForeground }]}>{swap ? 'Send swap request' : 'Confirm rental'}</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.primaryForeground} />
        </Pressable>
        <Text style={[styles.footer, { color: colors.mutedForeground }]}>A college class MVP. Made for trying things out.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 22, maxWidth: 620, width: '100%', alignSelf: 'center' },
  back: { flexDirection: 'row', alignItems: 'center', gap: 7, minHeight: 34, marginBottom: 20 },
  backText: { fontSize: 12, fontWeight: '600' },
  kicker: { fontSize: 9, letterSpacing: 1.3, fontWeight: '700' },
  title: { fontSize: 29, letterSpacing: -0.9, fontWeight: '700', marginTop: 8 },
  subtitle: { fontSize: 12, lineHeight: 18, marginTop: 6 },
  itemCard: { flexDirection: 'row', borderRadius: 19, borderWidth: 1, overflow: 'hidden', padding: 10, gap: 13, marginTop: 23 },
  itemImage: { width: 79, height: 92, borderRadius: 13 },
  itemInfo: { justifyContent: 'center', gap: 6, flex: 1 },
  itemName: { fontSize: 15, fontWeight: '700' },
  itemMeta: { fontSize: 11 },
  itemOwner: { fontSize: 10, fontWeight: '600' },
  breakdown: { borderWidth: 1, borderRadius: 19, padding: 16, marginTop: 15, gap: 14 },
  panelTitle: { fontSize: 14, fontWeight: '700', marginBottom: 1 },
  line: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 11 },
  value: { fontSize: 11, fontWeight: '600' },
  totalLine: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 13, marginTop: 1 },
  totalLabel: { fontSize: 13, fontWeight: '700' },
  total: { fontSize: 19, fontWeight: '700' },
  swapNotice: { marginTop: 15, padding: 15, borderRadius: 17, flexDirection: 'row', gap: 10, alignItems: 'center' },
  swapNoticeText: { flex: 1, fontSize: 12, lineHeight: 18 },
  demoNotice: { marginTop: 14, padding: 13, borderRadius: 15, flexDirection: 'row', alignItems: 'center', gap: 9 },
  demoNoticeText: { flex: 1, fontSize: 11, lineHeight: 16 },
  confirmButton: { minHeight: 54, borderRadius: 17, paddingHorizontal: 18, marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  confirmButtonText: { fontSize: 14, fontWeight: '700' },
  footer: { textAlign: 'center', fontSize: 10, marginTop: 12 },
  successScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, paddingBottom: 34 },
  successIcon: { width: 76, height: 76, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  successTitle: { fontSize: 27, textAlign: 'center', fontWeight: '700', letterSpacing: -0.8 },
  successBody: { fontSize: 13, lineHeight: 20, textAlign: 'center', maxWidth: 340, marginTop: 9 },
  missing: { fontSize: 15, margin: 20 },
});
