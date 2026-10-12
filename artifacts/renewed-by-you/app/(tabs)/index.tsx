import { useMemo, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ClothingItem } from '@/data/catalog';
import { useColors } from '@/hooks/useColors';
import { useAppStore } from '@/state/AppStore';

type Filter = 'All' | 'Rent' | 'Swap';

function ItemCard({ item, onPress }: { item: ClothingItem; onPress: () => void }) {
  const colors = useColors();
  const label = item.mode === 'both' ? 'RENT OR SWAP' : item.mode.toUpperCase();
  return (
    <Pressable
      testID={`item-${item.id}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.9 : 1 }]}
    >
      <View style={styles.imageWrap}>
        <Image source={item.image} resizeMode="cover" style={styles.itemImage} />
        <View style={[styles.typePill, { backgroundColor: item.mode === 'swap' ? colors.lavender : colors.butter }]}>
          <Text style={[styles.typeText, { color: colors.foreground }]}>{label}</Text>
        </View>
      </View>
      <View style={styles.cardInfo}>
        <View style={styles.cardTitleLine}>
          <Text numberOfLines={1} style={[styles.itemTitle, { color: colors.foreground }]}>{item.title}</Text>
          <Text style={[styles.price, { color: colors.primary }]}>${item.price}<Text style={styles.perDay}>/day</Text></Text>
        </View>
        <Text numberOfLines={1} style={[styles.itemMeta, { color: colors.mutedForeground }]}>{item.size}  ·  {item.condition}</Text>
        <View style={styles.ownerRow}>
          <View style={[styles.avatarDot, { backgroundColor: colors.blush }]}>
            <Ionicons name="person" size={10} color={colors.accentForeground} />
          </View>
          <Text style={[styles.ownerName, { color: colors.mutedForeground }]}>{item.owner}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function DiscoverScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { items, profile } = useAppStore();
  const [filter, setFilter] = useState<Filter>('All');
  const [search, setSearch] = useState('');
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const visibleItems = useMemo(
    () =>
      items.filter((item) => {
        const matchesFilter =
          filter === 'All' ||
          (filter === 'Rent' && (item.mode === 'rent' || item.mode === 'both')) ||
          (filter === 'Swap' && (item.mode === 'swap' || item.mode === 'both'));
        const text = `${item.title} ${item.category} ${item.size} ${item.owner}`.toLowerCase();
        return matchesFilter && text.includes(search.trim().toLowerCase());
      }),
    [items, filter, search],
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topInset + 8, paddingBottom: 110 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>YOUR CAMPUS CLOSET</Text>
            <Text style={[styles.greeting, { color: colors.foreground }]}>Hey, {profile?.name.split(' ')[0] || 'friend'}.</Text>
          </View>
          <Pressable
            testID="open-profile"
            accessibilityLabel="Open your closet"
            onPress={() => router.push('/(tabs)/profile')}
            style={[styles.profileButton, { backgroundColor: colors.sage }]}
          >
            <Text style={[styles.profileInitial, { color: colors.primary }]}>{profile?.name.charAt(0).toUpperCase() || 'Y'}</Text>
          </Pressable>
        </View>

        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            testID="search-listings"
            value={search}
            onChangeText={setSearch}
            placeholder="Find your next favorite"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable accessibilityLabel="Clear search" onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        <View style={[styles.feature, { backgroundColor: colors.sage }]}>
          <View style={styles.featureCopy}>
            <Text style={[styles.featureKicker, { color: colors.primary }]}>GOOD FOR YOUR CLOSET</Text>
            <Text style={[styles.featureTitle, { color: colors.foreground }]}>Great outfits.{'\n'}Smaller footprint.</Text>
            <Text style={[styles.featureBody, { color: colors.mutedForeground }]}>Find something lovely, just around the corner.</Text>
          </View>
          <View style={[styles.featureIcon, { backgroundColor: colors.card }]}>
            <Ionicons name="leaf-outline" size={28} color={colors.primary} />
          </View>
        </View>

        <View style={styles.sectionHeading}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>The good stuff</Text>
            <Text style={[styles.sectionCaption, { color: colors.mutedForeground }]}>Pieces from people near you</Text>
          </View>
          <Text style={[styles.itemCount, { color: colors.mutedForeground }]}>{visibleItems.length} pieces</Text>
        </View>

        <View style={styles.filters}>
          {(['All', 'Rent', 'Swap'] as Filter[]).map((option) => {
            const selected = filter === option;
            return (
              <Pressable
                key={option}
                testID={`filter-${option.toLowerCase()}`}
                onPress={() => setFilter(option)}
                style={[
                  styles.filterPill,
                  { backgroundColor: selected ? colors.primary : colors.card, borderColor: selected ? colors.primary : colors.border },
                ]}
              >
                <Text style={[styles.filterLabel, { color: selected ? colors.primaryForeground : colors.mutedForeground }]}>{option}</Text>
              </Pressable>
            );
          })}
        </View>

        {visibleItems.length > 0 ? (
          <View style={styles.grid}>
            {visibleItems.map((item) => (
              <View style={styles.gridCell} key={item.id}>
                <ItemCard
                  item={item}
                  onPress={() => router.push({ pathname: '/(tabs)/item/[id]', params: { id: item.id } })}
                />
              </View>
            ))}
          </View>
        ) : (
          <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="search-outline" size={25} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No pieces found</Text>
            <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>Try another search or switch the filter.</Text>
            <Pressable onPress={() => { setSearch(''); setFilter('All'); }}>
              <Text style={[styles.reset, { color: colors.primary }]}>Show everything</Text>
            </Pressable>
          </View>
        )}
        <Text style={[styles.footerNote, { color: colors.mutedForeground }]}>
          Every borrowed piece is one less new thing made.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20, maxWidth: 700, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  eyebrow: { fontSize: 9, fontWeight: '700', letterSpacing: 1.35, marginBottom: 5 },
  greeting: { fontSize: 27, fontWeight: '700', letterSpacing: -0.9 },
  profileButton: { width: 42, height: 42, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  profileInitial: { fontSize: 17, fontWeight: '700' },
  searchBox: { minHeight: 48, borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 9 },
  searchInput: { flex: 1, height: 46, fontSize: 13 },
  feature: { marginTop: 18, borderRadius: 22, minHeight: 145, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  featureCopy: { flex: 1, paddingRight: 8 },
  featureKicker: { fontSize: 9, fontWeight: '700', letterSpacing: 1.2 },
  featureTitle: { fontSize: 22, lineHeight: 25, letterSpacing: -0.6, fontWeight: '700', marginTop: 7 },
  featureBody: { fontSize: 11, lineHeight: 16, marginTop: 7, maxWidth: 215 },
  featureIcon: { width: 58, height: 58, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  sectionHeading: { marginTop: 25, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 20, fontWeight: '700', letterSpacing: -0.4 },
  sectionCaption: { fontSize: 11, marginTop: 3 },
  itemCount: { fontSize: 10, paddingBottom: 2 },
  filters: { flexDirection: 'row', gap: 8, marginTop: 13, marginBottom: 13 },
  filterPill: { paddingHorizontal: 16, height: 33, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  filterLabel: { fontSize: 11, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  gridCell: { width: '50%', paddingHorizontal: 6, marginBottom: 12 },
  card: { overflow: 'hidden', borderRadius: 19, borderWidth: StyleSheet.hairlineWidth },
  imageWrap: { height: 194, position: 'relative' },
  itemImage: { width: '100%', height: '100%' },
  typePill: { position: 'absolute', left: 9, top: 9, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 12 },
  typeText: { fontSize: 8, letterSpacing: 0.35, fontWeight: '700' },
  cardInfo: { padding: 10 },
  cardTitleLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 4 },
  itemTitle: { flex: 1, fontSize: 12, fontWeight: '700' },
  price: { fontSize: 12, fontWeight: '700' },
  perDay: { fontSize: 8, fontWeight: '500' },
  itemMeta: { fontSize: 9, marginTop: 5 },
  ownerRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  avatarDot: { width: 17, height: 17, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  ownerName: { fontSize: 9 },
  empty: { marginTop: 10, borderRadius: 20, borderWidth: 1, alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 15, fontWeight: '700', marginTop: 10 },
  emptyBody: { fontSize: 12, marginTop: 4, textAlign: 'center' },
  reset: { fontSize: 12, fontWeight: '700', marginTop: 13 },
  footerNote: { textAlign: 'center', fontSize: 10, marginTop: 14 },
});
