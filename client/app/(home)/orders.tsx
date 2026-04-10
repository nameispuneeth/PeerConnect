import { useState, useCallback } from 'react';
import { Text, View, ScrollView, Image, Pressable, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URI } from '@/config/api';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '@/constants/ThemeContext';
import { Coins, PackageCheck, KeyRound, CheckCircle, AlertCircle, Package } from 'lucide-react-native';

const IMAGE_WIDTH = Dimensions.get('window').width - 56;
const IMAGE_HEIGHT = IMAGE_WIDTH * (3 / 4);
const IMAGE_GAP = 12;
const PAGE_WIDTH = IMAGE_WIDTH + IMAGE_GAP;

type OtpState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'available'; otp: string }
  | { status: 'verified' }
  | { status: 'error'; message: string };

export default function Orders() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [otpStates, setOtpStates] = useState<Record<string, OtpState>>({});
  const [activeImageByItem, setActiveImageByItem] = useState<Record<string, number>>({});
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const fetchOrders = useCallback(() => {
    const load = async () => {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) { setLoading(false); return; }
      try {
        const res = await fetch(`${BACKEND_URI}/api/user/myorders`, {
          headers: { authorization: token },
        });
        const data = await res.json();
        if (res.ok) setItems(data.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  useFocusEffect(fetchOrders);

  const handleGetOtp = async (itemId: string) => {
    setOtpStates((prev) => ({ ...prev, [itemId]: { status: 'loading' } }));
    const token = await AsyncStorage.getItem('token');
    try {
      const res = await fetch(`${BACKEND_URI}/api/user/getitemotp/${itemId}`, {
        headers: { authorization: token! },
      });
      const data = await res.json();
      if (res.ok) {
        if (data.verified) {
          setOtpStates((prev) => ({ ...prev, [itemId]: { status: 'verified' } }));
        } else {
          setOtpStates((prev) => ({ ...prev, [itemId]: { status: 'available', otp: data.otp } }));
        }
      } else {
        setOtpStates((prev) => ({
          ...prev,
          [itemId]: { status: 'error', message: data.message || 'Error fetching OTP' },
        }));
      }
    } catch (e) {
      setOtpStates((prev) => ({
        ...prev,
        [itemId]: { status: 'error', message: 'Network error. Try again.' },
      }));
    }
  };

  if (loading) {
    return (
      <SafeAreaView className='flex-1 bg-slate-50 dark:bg-slate-900 justify-center items-center'>
        <ActivityIndicator size='large' color="#6366f1" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className='flex-1 bg-slate-50 dark:bg-slate-900'>
      {/* Header */}
      <View className="px-5 pt-3 pb-4">
        <Text className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-1">Auction Wins</Text>
        <Text className='text-2xl font-extrabold text-slate-800 dark:text-slate-100'>My Orders</Text>
      </View>
      <View className="h-px bg-slate-200 dark:bg-slate-700 mx-4 mb-3" />

      <ScrollView className='flex-1' contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16 }}>
        {items.length === 0 && (
          <View className='flex-1 justify-center items-center mt-24 gap-3'>
            <View className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 items-center justify-center">
              <Package size={28} color={isDark ? '#64748b' : '#94a3b8'} />
            </View>
            <Text className='text-slate-500 dark:text-slate-400 text-base font-medium'>
              No orders yet
            </Text>
            <Text className='text-slate-400 dark:text-slate-500 text-sm text-center'>
              Win an auction in the Store to see your orders here
            </Text>
          </View>
        )}

        {items.map((item, idx) => {
          const itemKey = item._id ? String(item._id) : `item-${idx}`;
          const activeImageIndex = activeImageByItem[itemKey] ?? 0;
          const state = otpStates[item._id] ?? { status: 'idle' };

          return (
            <View
              key={item._id || idx}
              className='bg-white dark:bg-slate-800 rounded-2xl mb-4 overflow-hidden border border-slate-200 dark:border-slate-700'
              style={{ boxShadow: '0px 2px 8px rgba(0,0,0,0.06)', elevation: 2 }}
            >
              {/* Card Header */}
              <View className="bg-indigo-50 dark:bg-indigo-900/30 px-4 py-3 border-b border-indigo-100 dark:border-indigo-800/40">
                <Text className='text-lg font-bold text-slate-800 dark:text-slate-100'>
                  {item.title ?? 'Untitled Item'}
                </Text>
                <View className="flex-row items-center gap-1 mt-0.5">
                  <Coins size={12} color={isDark ? '#fbbf24' : '#d97706'} />
                  <Text className='text-amber-600 dark:text-amber-400 text-xs font-semibold'>
                    Won for {item.currcost} coins
                  </Text>
                </View>
              </View>

              {/* Images carousel */}
              {item.images && item.images.length > 0 && (
                <View className='px-4 pt-3'>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    snapToInterval={PAGE_WIDTH}
                    decelerationRate='fast'
                    contentContainerStyle={{ paddingHorizontal: 6 }}
                    onMomentumScrollEnd={(event) => {
                      const xOffset = event.nativeEvent.contentOffset.x;
                      const nextIndex = Math.max(0, Math.round(xOffset / PAGE_WIDTH));
                      setActiveImageByItem((prev) => ({ ...prev, [itemKey]: nextIndex }));
                    }}
                  >
                    {item.images.map((img: string, i: number) => (
                      <View
                        key={`${item._id}-img-${i}`}
                        className='mr-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600'
                      >
                        <Image
                          source={{ uri: img }}
                          style={{ height: IMAGE_HEIGHT, width: IMAGE_WIDTH }}
                          resizeMode='cover'
                        />
                      </View>
                    ))}
                  </ScrollView>
                  {item.images.length > 1 && (
                    <View className='flex flex-row justify-center items-center mt-2 gap-1'>
                      {item.images.map((_: string, dotIndex: number) => (
                        <View
                          key={`${itemKey}-dot-${dotIndex}`}
                          className={`h-1.5 rounded-full ${dotIndex === activeImageIndex
                            ? 'w-4 bg-indigo-500'
                            : 'w-1.5 bg-slate-300 dark:bg-slate-600'
                          }`}
                        />
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* OTP Section */}
              <View className='px-4 py-4 border-t border-slate-100 dark:border-slate-700 mt-3'>
                <Text className='text-xs text-slate-400 dark:text-slate-500 mb-3 text-center'>
                  Show this OTP to the seller when they hand over the item
                </Text>

                {state.status === 'idle' && (
                  <Pressable
                    className='bg-indigo-600 dark:bg-indigo-700 py-3.5 rounded-xl items-center flex-row justify-center gap-2 active:opacity-80'
                    onPress={() => handleGetOtp(item._id)}
                  >
                    <KeyRound size={16} color="white" />
                    <Text className='text-white font-bold text-sm'>Get Delivery OTP</Text>
                  </Pressable>
                )}

                {state.status === 'loading' && (
                  <View className='items-center py-3'>
                    <ActivityIndicator size='small' color='#6366f1' />
                  </View>
                )}

                {state.status === 'available' && (
                  <View className='bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-xl p-4 items-center gap-1'>
                    <Text className='text-indigo-500 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider'>
                      Delivery OTP
                    </Text>
                    <Text className='text-5xl font-black tracking-[0.25em] text-indigo-700 dark:text-indigo-200 my-2'>
                      {state.otp}
                    </Text>
                    <Text className='text-indigo-400 dark:text-indigo-500 text-xs text-center'>
                      Show to seller when receiving your item
                    </Text>
                    <Pressable className='mt-1' onPress={() => handleGetOtp(item._id)}>
                      <Text className='text-indigo-600 dark:text-indigo-400 text-xs font-semibold underline'>Refresh</Text>
                    </Pressable>
                  </View>
                )}

                {state.status === 'verified' && (
                  <View className='bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl p-4 items-center gap-1'>
                    <CheckCircle size={24} color={isDark ? '#34d399' : '#059669'} />
                    <Text className='text-emerald-700 dark:text-emerald-300 font-bold text-base mt-1'>
                      Item Delivered!
                    </Text>
                    <Text className='text-emerald-600 dark:text-emerald-400 text-xs text-center'>
                      Seller confirmed delivery. Transaction complete.
                    </Text>
                  </View>
                )}

                {state.status === 'error' && (
                  <View className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-3 items-center gap-2'>
                    <AlertCircle size={18} color={isDark ? '#f87171' : '#dc2626'} />
                    <Text className='text-red-600 dark:text-red-400 text-xs text-center'>{state.message}</Text>
                    <Pressable
                      onPress={() => setOtpStates((p) => ({ ...p, [item._id]: { status: 'idle' } }))}
                    >
                      <Text className='text-indigo-600 dark:text-indigo-400 text-xs font-semibold underline'>Try again</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}