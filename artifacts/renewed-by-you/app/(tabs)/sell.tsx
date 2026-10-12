import { useState } from 'react';
import {
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
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ClothingItem, ListingMode } from '@/data/catalog';
import { useColors } from '@/hooks/useColors';
import { useAppStore } from '@/state/AppStore';

const inputBase = {
  minHeight: 48,
  paddingHorizontal: 13,
  borderWidth: 1,
  borderRadius: 13,
  fontSize: 13,
} as const;

export default function ListPieceScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, addListing } = useAppStore();
  const [title, setTitle] = useState('');
  const [size, setSize] = useState('');
  const [condition, setCondition] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('8');
  const [mode, setMode] = useState<ListingMode>('both');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  const submit = () => {
    const parsedPrice = Number(price);
    if (title.trim().length < 3 || size.trim().length < 1 || condition.trim().length < 2 || description.trim().length < 8) {
      setError('Add a title, size, condition, and a short description to continue.');
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice < 1 || parsedPrice > 100) {
      setError('Enter a daily price between $1 and $100.');
      return;
    }
    Keyboard.dismiss();
    const item: ClothingItem = {
      id: `mine-${Date.now()}`,
      title: title.trim(),
      category: 'Closet find',
      size: size.trim(),
      condition: condition.trim(),
      price: parsedPrice,
      mode,
      description: description.trim(),
      owner: profile?.name || 'You',
      isMine: true,
      image: require('../../assets/images/cardigan.jpg'),
    };
    addListing(item);
    setSaved(true);
    setError('');
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topInset + 10, paddingBottom: 108 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.eyebrow, { color: colors.primary }]}>PASS IT ON</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Give a good piece{'\n'}another go-round.</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          List a piece from your closet for a neighbor to borrow or swap.
        </Text>

        {saved ? (
          <View style={[styles.successCard, { backgroundColor: colors.sage }]}>
            <View style={[styles.successIcon, { backgroundColor: colors.card }]}>
              <Ionicons name="checkmark" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.successTitle, { color: colors.foreground }]}>Your piece is listed.</Text>
            <Text style={[styles.successText, { color: colors.mutedForeground }]}>
              It is saved in this demo and ready for your campus closet.
            </Text>
            <Pressable
              testID="view-listing"
              onPress={() => { setSaved(false); router.push('/(tabs)/profile'); }}
              style={[styles.successLink, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.successLinkText, { color: colors.primaryForeground }]}>View my closet</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.primaryForeground} />
            </Pressable>
            <Pressable
              onPress={() => {
                setTitle(''); setSize(''); setCondition(''); setDescription('');
                setPrice('8'); setMode('both'); setSaved(false);
              }}
              style={styles.listAnother}
            >
              <Text style={[styles.listAnotherText, { color: colors.primary }]}>List another piece</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={[styles.photoCard, { backgroundColor: colors.blush }]}>
              <Image source={require('../../assets/images/cardigan.jpg')} style={styles.previewImage} resizeMode="cover" />
              <View style={styles.photoCopy}>
                <Ionicons name="image-outline" size={17} color={colors.accentForeground} />
                <Text style={[styles.photoText, { color: colors.foreground }]}>Demo photo preview</Text>
                <Text style={[styles.photoCaption, { color: colors.mutedForeground }]}>A sample photo is used for this MVP.</Text>
              </View>
            </View>

            <View style={styles.form}>
              <Field label="WHAT IS IT CALLED?" value={title} onChangeText={setTitle} placeholder="e.g. Favorite denim jacket" colors={colors} testID="listing-title" />
              <View style={styles.twoCols}>
                <View style={styles.column}>
                  <Field label="SIZE" value={size} onChangeText={setSize} placeholder="e.g. M / 8" colors={colors} testID="listing-size" />
                </View>
                <View style={styles.column}>
                  <Field label="CONDITION" value={condition} onChangeText={setCondition} placeholder="Like new" colors={colors} testID="listing-condition" />
                </View>
              </View>
              <Field
                label="A LITTLE ABOUT IT"
                value={description}
                onChangeText={setDescription}
                placeholder="What makes this piece special?"
                colors={colors}
                testID="listing-description"
                multiline
              />
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>HOW SHOULD IT GO AROUND?</Text>
              <View style={styles.modeOptions}>
                {([
                  ['both', 'Rent or swap'],
                  ['rent', 'Rent only'],
                  ['swap', 'Swap only'],
                ] as [ListingMode, string][]).map(([value, label]) => {
                  const selected = value === mode;
                  return (
                    <Pressable
                      key={value}
                      testID={`mode-${value}`}
                      onPress={() => setMode(value)}
                      style={[styles.modeOption, { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.sage : colors.card }]}
                    >
                      <Ionicons
                        name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                        size={16}
                        color={selected ? colors.primary : colors.mutedForeground}
                      />
                      <Text style={[styles.modeLabel, { color: colors.foreground }]}>{label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              {mode !== 'swap' && (
                <View style={styles.priceField}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>RENTAL PRICE</Text>
                    <Text style={[styles.priceHint, { color: colors.mutedForeground }]}>A friendly daily rate</Text>
                  </View>
                  <View style={[styles.priceInputWrap, { borderColor: colors.input, backgroundColor: colors.card }]}>
                    <Text style={[styles.dollar, { color: colors.mutedForeground }]}>$</Text>
                    <TextInput
                      testID="listing-price"
                      value={price}
                      onChangeText={setPrice}
                      keyboardType="decimal-pad"
                      placeholder="8"
                      placeholderTextColor={colors.mutedForeground}
                      style={[styles.priceInput, { color: colors.foreground }]}
                    />
                    <Text style={[styles.perDay, { color: colors.mutedForeground }]}>/day</Text>
                  </View>
                </View>
              )}
              {!!error && <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>}
              <Pressable
                testID="publish-listing"
                onPress={submit}
                style={({ pressed }) => [styles.submit, { backgroundColor: colors.primary, opacity: pressed ? 0.86 : 1 }]}
              >
                <Ionicons name="sparkles-outline" size={17} color={colors.primaryForeground} />
                <Text style={[styles.submitText, { color: colors.primaryForeground }]}>List my piece</Text>
                <Ionicons name="arrow-forward" size={17} color={colors.primaryForeground} />
              </Pressable>
              <Text style={[styles.privacyNote, { color: colors.mutedForeground }]}>Saved on this device. No public post is made.</Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  colors,
  testID,
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  colors: ReturnType<typeof useColors>;
  testID: string;
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[
          inputBase,
          styles.textInput,
          { borderColor: colors.input, color: colors.foreground, backgroundColor: colors.card },
          multiline && styles.multiline,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 21, maxWidth: 640, width: '100%', alignSelf: 'center' },
  eyebrow: { fontSize: 9, fontWeight: '700', letterSpacing: 1.4 },
  title: { fontSize: 29, lineHeight: 34, letterSpacing: -0.9, fontWeight: '700', marginTop: 8 },
  subtitle: { fontSize: 12, lineHeight: 18, marginTop: 7, maxWidth: 350 },
  photoCard: { flexDirection: 'row', alignItems: 'center', padding: 11, borderRadius: 18, gap: 12, marginTop: 19 },
  previewImage: { width: 62, height: 70, borderRadius: 12 },
  photoCopy: { flex: 1, gap: 3 },
  photoText: { fontSize: 12, fontWeight: '700' },
  photoCaption: { fontSize: 10 },
  form: { marginTop: 21, gap: 15 },
  field: { gap: 7, flex: 1 },
  fieldLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.9 },
  textInput: { width: '100%' },
  multiline: { height: 92, paddingTop: 12 },
  twoCols: { flexDirection: 'row', gap: 10 },
  column: { flex: 1 },
  modeOptions: { gap: 8 },
  modeOption: { minHeight: 44, paddingHorizontal: 12, borderRadius: 13, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 9 },
  modeLabel: { fontSize: 12, fontWeight: '600' },
  priceField: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  priceHint: { fontSize: 10, marginTop: 4 },
  priceInputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 13, paddingHorizontal: 10, height: 44, minWidth: 118 },
  dollar: { fontSize: 13, fontWeight: '700' },
  priceInput: { width: 35, textAlign: 'center', fontSize: 13, fontWeight: '700' },
  perDay: { fontSize: 9 },
  error: { fontSize: 11, lineHeight: 16 },
  submit: { minHeight: 52, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 9, marginTop: 1 },
  submitText: { fontSize: 13, fontWeight: '700' },
  privacyNote: { textAlign: 'center', fontSize: 9, marginTop: -6 },
  successCard: { marginTop: 26, alignItems: 'center', borderRadius: 24, padding: 25 },
  successIcon: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontSize: 21, fontWeight: '700', marginTop: 13 },
  successText: { textAlign: 'center', fontSize: 12, lineHeight: 18, marginTop: 6, maxWidth: 280 },
  successLink: { minHeight: 45, borderRadius: 14, paddingHorizontal: 17, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  successLinkText: { fontSize: 12, fontWeight: '700' },
  listAnother: { marginTop: 16, padding: 8 },
  listAnotherText: { fontSize: 11, fontWeight: '700' },
});
