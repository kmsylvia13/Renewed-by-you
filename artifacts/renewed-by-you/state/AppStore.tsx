import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  seedItems,
  type ClothingItem,
  type ExtensionRequest,
  type Rental,
  type SwapRequest,
} from '@/data/catalog';

const STORAGE_KEY = 'renewed-by-you-demo-v1';

type Profile = { name: string; email: string };
type PersistedStore = {
  profile: Profile | null;
  listings: ClothingItem[];
  rentals: Rental[];
  swapRequests: SwapRequest[];
  extensionRequests: ExtensionRequest[];
};

type AppStoreValue = PersistedStore & {
  hydrated: boolean;
  items: ClothingItem[];
  signIn: (name: string, email: string) => void;
  signOut: () => void;
  addListing: (item: ClothingItem) => void;
  addRental: (rental: Rental) => void;
  addSwapRequest: (request: SwapRequest) => void;
  requestExtension: (rentalId: string) => void;
};

const emptyStore: PersistedStore = {
  profile: null,
  listings: [],
  rentals: [],
  swapRequests: [],
  extensionRequests: [],
};

const StoreContext = createContext<AppStoreValue | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<PersistedStore>(emptyStore);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved && mounted) {
          const parsed = JSON.parse(saved) as Partial<PersistedStore>;
          setStore({
            ...emptyStore,
            ...parsed,
            listings: parsed.listings ?? [],
            rentals: parsed.rentals ?? [],
            swapRequests: parsed.swapRequests ?? [],
            extensionRequests: parsed.extensionRequests ?? [],
          });
        }
      })
      .catch(() => {
        // Keep the in-memory demo usable if local storage is unavailable.
      })
      .finally(() => {
        if (mounted) setHydrated(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (hydrated) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(store)).catch(() => {});
    }
  }, [hydrated, store]);

  const signIn = useCallback((name: string, email: string) => {
    setStore((current) => ({ ...current, profile: { name, email } }));
  }, []);
  const signOut = useCallback(() => {
    setStore((current) => ({ ...current, profile: null }));
  }, []);
  const addListing = useCallback((item: ClothingItem) => {
    setStore((current) => ({ ...current, listings: [item, ...current.listings] }));
  }, []);
  const addRental = useCallback((rental: Rental) => {
    setStore((current) => ({ ...current, rentals: [rental, ...current.rentals] }));
  }, []);
  const addSwapRequest = useCallback((request: SwapRequest) => {
    setStore((current) => ({
      ...current,
      swapRequests: [request, ...current.swapRequests],
    }));
  }, []);
  const requestExtension = useCallback((rentalId: string) => {
    setStore((current) => {
      if (current.extensionRequests.some((request) => request.rentalId === rentalId)) {
        return current;
      }
      return {
        ...current,
        extensionRequests: [
          {
            id: Date.now().toString(),
            rentalId,
            days: 2,
            requestedAt: new Date().toISOString(),
          },
          ...current.extensionRequests,
        ],
      };
    });
  }, []);

  const items = useMemo(
    () => [...store.listings, ...seedItems],
    [store.listings],
  );
  const value = useMemo(
    () => ({
      ...store,
      hydrated,
      items,
      signIn,
      signOut,
      addListing,
      addRental,
      addSwapRequest,
      requestExtension,
    }),
    [
      store,
      hydrated,
      items,
      signIn,
      signOut,
      addListing,
      addRental,
      addSwapRequest,
      requestExtension,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useAppStore must be used inside AppStoreProvider');
  return context;
}
