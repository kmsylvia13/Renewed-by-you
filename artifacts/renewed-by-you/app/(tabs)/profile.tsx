import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatDate } from '@/data/catalog';
import { useColors } from '@/hooks/useColors';
import { useAppStore } from '@/state/AppStore';

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    profile,
    rentals,
    listings,
    swapRequests,
    extensionRequests,
    requestExtension,
    signOut,
  } = useAppStore();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  const handleSignOut = () => {
    signOut();
    router.replace('/');
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: topInset + 10, paddingBottom: 112 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.headerLine}>
          <View>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>YOUR LITTLE CLOSET</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>My closet</Text>
          </View>
          <Pressable
            testID="sign-out"
            onPress={handleSignOut}
            accessibilityLabel="Sign out"
            style={[styles.iconButton, { borderColor: colors.border, backgroundColor: colors.card }]}
          >
            <Ionicons name="log-out-outline" size={18} color={colors.mutedForeground} />
          </Pressable>
        </View>

        <View style={[styles.profileCard, { backgroundColor: colors.sage }]}>
          <View style={[styles.avatar, { backgroundColor: colors.card }]}>
            <Text style={[styles.initial, { color: colors.primary }]}>{profile?.name.charAt(0).toUpperCase() || 'Y'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.name, { color: colors.foreground }]}>{profile?.name || 'Campus friend'}</Text>
            <Text style={[styles.email, { color: colors.mutedForeground }]}>{profile?.email || 'Your campus closet'}</Text>
            <View style={[styles.campusPill, { backgroundColor: colors.card }]}>
              <Ionicons name="leaf-outline" size={12} color={colors.primary} />
              <Text style={[styles.campusText, { color: colors.primary }]}>Making more with less</Text>
            </View>
          </View>
        </View>

        <View style={[styles.stats, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Stat value={String(rentals.length)} label="Rentals" color={colors.primary} labelColor={colors.mutedForeground} />
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <Stat value={String(listings.length)} label="Your pieces" color={colors.accentForeground} labelColor={colors.mutedForeground} />
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <Stat value={String(swapRequests.length)} label="Swap asks" color={colors.primary} labelColor={colors.mutedForeground} />
        </View>

        <SectionTitle title="My rentals" subtitle="Things taking a little closet vacation" colors={colors} />
        {rentals.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.butter }]}>
              <Ionicons name="shirt-outline" size={21} color={colors.accentForeground} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Nothing borrowed just yet</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Find a favorite and it will show up here.</Text>
            <Pressable testID="browse-pieces" onPress={() => router.push('/(tabs)')} style={styles.textAction}>
              <Text style={[styles.textActionLabel, { color: colors.primary }]}>Find a piece</Text>
              <Ionicons name="arrow-forward" size={15} color={colors.primary} />
            </Pressable>
          </View>
        ) : (
          <View style={styles.list}>
            {rentals.map((rental) => {
              const requested = extensionRequests.some((request) => request.rentalId === rental.id);
              return (
                <View key={rental.id} style={[styles.rentalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Image source={rental.image} style={styles.rentalImage} resizeMode="cover" />
                  <View style={styles.rentalInfo}>
                    <View style={styles.rentalTitleRow}>
                      <Text style={[styles.rentalName, { color: colors.foreground }]} numberOfLines={1}>{rental.title}</Text>
                      <View style={[styles.statusPill, { backgroundColor: requested ? colors.butter : colors.sage }]}>
                        <Text style={[styles.statusText, { color: requested ? colors.accentForeground : colors.primary }]}>{requested ? 'EXTENSION PENDING' : 'UPCOMING'}</Text>
                      </View>
                    </View>
                    <Text style={[styles.rentalDate, { color: colors.mutedForeground }]}>
                      {formatDate(new Date(rental.startDate))} – {formatDate(new Date(rental.endDate))}
                    </Text>
                    <View style={styles.rentalBottom}>
                      <Text style={[styles.rentalTotal, { color: colors.foreground }]}>${rental.total} demo total</Text>
                      {requested ? (
                        <Text style={[styles.pendingLabel, { color: colors.accentForeground }]}>+2 days requested</Text>
                      ) : (
                        <Pressable
                          testID={`extend-${rental.id}`}
                          onPress={() => requestExtension(rental.id)}
                          style={[styles.extendButton, { borderColor: colors.primary }]}
                        >
                          <Ionicons name="time-outline" size={13} color={colors.primary} />
                          <Text style={[styles.extendText, { color: colors.primary }]}>Ask for 2 more days</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {swapRequests.length > 0 && (
          <>
            <SectionTitle title="Swap requests" subtitle="Your friendly asks" colors={colors} />
            <View style={styles.list}>
              {swapRequests.map((request) => (
                <View key={request.id} style={[styles.swapCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Image source={request.image} style={styles.swapImage} resizeMode="cover" />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rentalName, { color: colors.foreground }]}>{request.title}</Text>
                    <Text style={[styles.rentalDate, { color: colors.mutedForeground }]}>Request saved · {formatDate(new Date(request.requestedAt))}</Text>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: colors.lavender }]}>
                    <Text style={[styles.statusText, { color: colors.accentForeground }]}>PENDING</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={styles.sectionLine}>
          <SectionTitle title="My listed pieces" subtitle="Pieces you have passed around" colors={colors} />
          <Pressable testID="add-piece" onPress={() => router.push('/(tabs)/sell')} style={styles.addButton}>
            <Ionicons name="add" size={14} color={colors.primary} />
            <Text style={[styles.addText, { color: colors.primary }]}>Add</Text>
          </Pressable>
        </View>
        {listings.length === 0 ? (
          <View style={[styles.listingEmpty, { borderColor: colors.border }]}>
            <Ionicons name="repeat-outline" size={18} color={colors.mutedForeground} />
            <Text style={[styles.listingEmptyText, { color: colors.mutedForeground }]}>No pieces listed yet.</Text>
            <Pressable testID="list-first-piece" onPress={() => router.push('/(tabs)/sell')}>
              <Text style={[styles.textActionLabel, { color: colors.primary }]}>Share one</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.ownedGrid}>
            {listings.map((item) => (
              <Pressable
                testID={`own-item-${item.id}`}
                key={item.id}
                onPress={() => router.push({ pathname: '/(tabs)/item/[id]', params: { id: item.id } })}
                style={[styles.ownedCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Image source={item.image} style={styles.ownedImage} resizeMode="cover" />
                <View style={{ padding: 9 }}>
                  <Text style={[styles.rentalName, { color: colors.foreground }]} numberOfLines={1}>{item.title}</Text>
                  <Text style={[styles.rentalDate, { color: colors.mutedForeground }]}>{item.mode === 'swap' ? 'Swap listing' : `$${item.price} / day`}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
        <Text style={[styles.demoFoot, { color: colors.mutedForeground }]}>All demo activity is saved on this device.</Text>
      </ScrollView>
    </View>
  );
}

function Stat({ value, label, color, labelColor }: { value: string; label: string; color: string; labelColor: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: labelColor }]}>{label}</Text>
    </View>
  );
}

function SectionTitle({ title, subtitle, colors }: { title: string; subtitle: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={[styles.sectionHeading, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.sectionCaption, { color: colors.mutedForeground }]}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20, maxWidth: 700, width: '100%', alignSelf: 'center' },
  headerLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { fontSize: 9, fontWeight: '700', letterSpacing: 1.3 },
  title: { fontSize: 27, fontWeight: '700', letterSpacing: -0.8, marginTop: 5 },
  iconButton: { width: 39, height: 39, borderWidth: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  profileCard: { flexDirection: 'row', gap: 14, alignItems: 'center', borderRadius: 22, padding: 17, marginTop: 19 },
  avatar: { width: 57, height: 57, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  initial: { fontSize: 24, fontWeight: '700' },
  profileInfo: { gap: 3, flex: 1 },
  name: { fontSize: 17, fontWeight: '700' },
  email: { fontSize: 11 },
  campusPill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 11 },
  campusText: { fontSize: 9, fontWeight: '700' },
  stats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', borderWidth: 1, borderRadius: 18, paddingVertical: 13, marginTop: 11 },
  stat: { flex: 1, alignItems: 'center', gap: 3 },
  statValue: { fontSize: 17, fontWeight: '700' },
  statLabel: { fontSize: 9 },
  statDivider: { height: 29, width: StyleSheet.hairlineWidth },
  sectionTitle: { marginTop: 24, marginBottom: 11 },
  sectionHeading: { fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
  sectionCaption: { fontSize: 10, marginTop: 3 },
  emptyCard: { borderWidth: 1, borderRadius: 19, padding: 17, alignItems: 'center' },
  emptyIcon: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 13, fontWeight: '700', marginTop: 10 },
  emptyText: { fontSize: 10, marginTop: 4, textAlign: 'center' },
  textAction: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 12 },
  textActionLabel: { fontSize: 11, fontWeight: '700' },
  list: { gap: 9 },
  rentalCard: { borderWidth: 1, borderRadius: 17, padding: 9, flexDirection: 'row', gap: 11 },
  rentalImage: { width: 70, height: 88, borderRadius: 12 },
  rentalInfo: { flex: 1, justifyContent: 'center', gap: 7 },
  rentalTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 5 },
  rentalName: { flexShrink: 1, fontSize: 12, fontWeight: '700' },
  statusPill: { borderRadius: 9, paddingHorizontal: 7, paddingVertical: 5 },
  statusText: { fontSize: 7, fontWeight: '700', letterSpacing: 0.3 },
  rentalDate: { fontSize: 9 },
  rentalBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginTop: 2, flexWrap: 'wrap' },
  rentalTotal: { fontSize: 9, fontWeight: '600' },
  extendButton: { borderWidth: 1, borderRadius: 9, paddingHorizontal: 7, paddingVertical: 5, flexDirection: 'row', alignItems: 'center', gap: 4 },
  extendText: { fontSize: 8, fontWeight: '700' },
  pendingLabel: { fontSize: 8, fontWeight: '700' },
  swapCard: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 15, padding: 9 },
  swapImage: { width: 49, height: 55, borderRadius: 10 },
  sectionLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingVertical: 8 },
  addText: { fontSize: 11, fontWeight: '700' },
  listingEmpty: { minHeight: 54, borderWidth: 1, borderStyle: 'dashed', borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  listingEmptyText: { fontSize: 10 },
  ownedGrid: { flexDirection: 'row', gap: 9, flexWrap: 'wrap' },
  ownedCard: { width: '48%', borderWidth: 1, borderRadius: 15, overflow: 'hidden' },
  ownedImage: { width: '100%', height: 133 },
  demoFoot: { textAlign: 'center', fontSize: 9, marginTop: 18 },
});
