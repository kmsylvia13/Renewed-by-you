import { useMemo, useState } from 'react';
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
import { dateOptions, formatDate } from '@/data/catalog';
import { useColors } from '@/hooks/useColors';
import { useAppStore } from '@/state/AppStore';

export default function ItemDetailsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items, profile } = useAppStore();
  const item = items.find((entry) => entry.id === id);
  const [startOffset, setStartOffset] = useState(2);
  const [endOffset, setEndOffset] = useState(4);
  const startOptions = useMemo(() => dateOptions(2, 7), []);
  const endOptions = useMemo(() => dateOptions(startOffset + 1, 7), [startOffset]);
  const startDate = dateOptions(startOffset, 1)[0];
  const endDate = dateOptions(endOffset, 1)[0];
  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  if (!item) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFoundText, { color: colors.foreground }]}>This piece is no longer here.</Text>
        <Pressable onPress={() => router.back()}><Text style={{ color: colors.primary }}>Go back</Text></Pressable>
      </View>
    );
  }

  const nights = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 86400000));
  const canRent = item.mode !== 'swap' && !item.isMine;
  const canSwap = item.mode !== 'rent' && !item.isMine;
  const isOwner = !!item.isMine || (profile?.name === item.owner);

  return (
    <View style={[styles.page, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        <View style={styles.imageHero}>
          <Image source={item.image} resizeMode="cover" style={styles.heroImage} />
          <Pressable
            testID="back-to-discover"
            accessibilityLabel="Back to discover"
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: colors.card }]}
          >
            <Ionicons name="arrow-back" size={19} color={colors.foreground} />
          </Pressable>
          <View style={[styles.heroBadge, { backgroundColor: colors.card }]}>
            <Text style={[styles.heroBadgeText, { color: colors.foreground }]}>{item.category}</Text>
          </View>
        </View>
        <View style={[styles.body, { paddingTop: topInset > 0 ? 0 : 14 }]}>
          <View style={styles.titleLine}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.foreground }]}>{item.title}</Text>
              <Text style={[styles.owner, { color: colors.mutedForeground }]}>Shared by {item.owner}</Text>
            </View>
            <View style={styles.priceBlock}>
              <Text style={[styles.price, { color: colors.primary }]}>${item.price}</Text>
              <Text style={[styles.perDay, { color: colors.mutedForeground }]}>per day</Text>
            </View>
          </View>

          <View style={styles.tags}>
            <View style={[styles.tag, { backgroundColor: colors.sage }]}>
              <Ionicons name="shirt-outline" size={14} color={colors.primary} />
              <Text style={[styles.tagText, { color: colors.foreground }]}>{item.size}</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: colors.blush }]}>
              <Ionicons name="sparkles-outline" size={14} color={colors.accentForeground} />
              <Text style={[styles.tagText, { color: colors.foreground }]}>{item.condition}</Text>
            </View>
          </View>
          <Text style={[styles.description, { color: colors.mutedForeground }]}>{item.description}</Text>

          {canRent && (
            <View style={[styles.datePanel, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.panelHeading}>
                <View>
                  <Text style={[styles.panelTitle, { color: colors.foreground }]}>Pick your dates</Text>
                  <Text style={[styles.panelCaption, { color: colors.mutedForeground }]}>Choose when it leaves and comes home</Text>
                </View>
                <Ionicons name="calendar-clear-outline" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>PICKUP</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
                {startOptions.map((date, index) => {
                  const selected = startOffset === index + 2;
                  return (
                    <Pressable
                      testID={`start-date-${index}`}
                      key={date.toISOString()}
                      onPress={() => {
                        const next = index + 2;
                        setStartOffset(next);
                        if (endOffset <= next) setEndOffset(next + 2);
                      }}
                      style={[styles.dateChip, { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.primary : colors.background }]}
                    >
                      <Text style={[styles.dayName, { color: selected ? colors.primaryForeground : colors.mutedForeground }]}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</Text>
                      <Text style={[styles.dayNumber, { color: selected ? colors.primaryForeground : colors.foreground }]}>{date.getDate()}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground, marginTop: 15 }]}>RETURN</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
                {endOptions.map((date, index) => {
                  const selected = endOffset === startOffset + index + 1;
                  return (
                    <Pressable
                      testID={`end-date-${index}`}
                      key={date.toISOString()}
                      onPress={() => setEndOffset(startOffset + index + 1)}
                      style={[styles.dateChip, { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.primary : colors.background }]}
                    >
                      <Text style={[styles.dayName, { color: selected ? colors.primaryForeground : colors.mutedForeground }]}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</Text>
                      <Text style={[styles.dayNumber, { color: selected ? colors.primaryForeground : colors.foreground }]}>{date.getDate()}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              <View style={[styles.estimate, { borderTopColor: colors.border }]}>
                <Text style={[styles.estimateLabel, { color: colors.mutedForeground }]}>{nights} {nights === 1 ? 'day' : 'days'} × ${item.price}</Text>
                <Text style={[styles.estimateAmount, { color: colors.foreground }]}>${nights * item.price}</Text>
              </View>
            </View>
          )}

          {isOwner ? (
            <View style={[styles.ownerNote, { backgroundColor: colors.sage }]}>
              <Ionicons name="checkmark-circle-outline" size={19} color={colors.primary} />
              <Text style={[styles.ownerNoteText, { color: colors.foreground }]}>This piece is in your closet. You can manage it from My closet.</Text>
            </View>
          ) : (
            <View style={styles.actions}>
              {canRent && (
                <Pressable
                  testID="rent-item"
                  onPress={() => router.push({
                    pathname: '/(tabs)/checkout',
                    params: {
                      itemId: item.id,
                      mode: 'rent',
                      startDate: startDate.toISOString(),
                      endDate: endDate.toISOString(),
                      nights: String(nights),
                    },
                  })}
                  style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.primary, opacity: pressed ? 0.88 : 1 }]}
                >
                  <Text style={[styles.primaryText, { color: colors.primaryForeground }]}>Rent this piece</Text>
                  <Ionicons name="arrow-forward" size={18} color={colors.primaryForeground} />
                </Pressable>
              )}
              {canSwap && (
                <Pressable
                  testID="swap-item"
                  onPress={() => router.push({
                    pathname: '/(tabs)/checkout',
                    params: { itemId: item.id, mode: 'swap' },
                  })}
                  style={[styles.swapButton, { borderColor: colors.primary, backgroundColor: colors.card }]}
                >
                  <Ionicons name="repeat-outline" size={18} color={colors.primary} />
                  <Text style={[styles.swapText, { color: colors.primary }]}>Propose a swap</Text>
                </Pressable>
              )}
              <Text style={[styles.demoNote, { color: colors.mutedForeground }]}>
                {canRent ? `Available from ${formatDate(startDate)} · No payment collected` : 'Local campus pickup, arranged between you'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  imageHero: { height: 375, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  backButton: { position: 'absolute', left: 18, top: Platform.OS === 'web' ? 72 : 52, width: 40, height: 40, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  heroBadge: { position: 'absolute', left: 18, bottom: 16, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 20 },
  heroBadgeText: { fontSize: 11, fontWeight: '700' },
  body: { paddingHorizontal: 21, paddingBottom: 26, maxWidth: 650, width: '100%', alignSelf: 'center' },
  titleLine: { flexDirection: 'row', alignItems: 'center', marginTop: 18, gap: 12 },
  title: { fontSize: 26, letterSpacing: -0.8, fontWeight: '700' },
  owner: { fontSize: 12, marginTop: 5 },
  priceBlock: { alignItems: 'flex-end' },
  price: { fontSize: 23, fontWeight: '700' },
  perDay: { fontSize: 10, marginTop: -1 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 17 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 11, paddingVertical: 8, borderRadius: 12 },
  tagText: { fontSize: 10, fontWeight: '600' },
  description: { fontSize: 13, lineHeight: 20, marginTop: 15 },
  datePanel: { marginTop: 22, padding: 15, borderRadius: 20, borderWidth: 1 },
  panelHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  panelTitle: { fontSize: 16, fontWeight: '700' },
  panelCaption: { fontSize: 10, marginTop: 3 },
  fieldLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1, marginTop: 17, marginBottom: 8 },
  dateRow: { gap: 7, paddingRight: 2 },
  dateChip: { width: 47, height: 54, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  dayName: { fontSize: 9, fontWeight: '600' },
  dayNumber: { fontSize: 14, fontWeight: '700' },
  estimate: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: StyleSheet.hairlineWidth, marginTop: 17, paddingTop: 13 },
  estimateLabel: { fontSize: 11 },
  estimateAmount: { fontSize: 13, fontWeight: '700' },
  actions: { marginTop: 18, gap: 10 },
  primaryButton: { minHeight: 54, borderRadius: 17, paddingHorizontal: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  primaryText: { fontSize: 14, fontWeight: '700' },
  swapButton: { minHeight: 51, borderRadius: 17, borderWidth: 1, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  swapText: { fontSize: 13, fontWeight: '700' },
  demoNote: { textAlign: 'center', fontSize: 10, marginTop: 2 },
  ownerNote: { marginTop: 20, borderRadius: 15, padding: 14, flexDirection: 'row', gap: 9, alignItems: 'center' },
  ownerNoteText: { flex: 1, fontSize: 12, lineHeight: 17 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 15, fontWeight: '600' },
});
