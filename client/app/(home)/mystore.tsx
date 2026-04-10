import { useState, useCallback } from 'react';
import { ActivityIndicator, Text, View, Image, ScrollView, Dimensions, Pressable, TextInput, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useUser } from '@/constants/userContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URI } from '@/config/api';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '@/constants/ThemeContext';
import { Coins, Trophy, KeyRound, CheckCircle, Package, ShoppingBag } from 'lucide-react-native';

const IMAGE_WIDTH = Dimensions.get('window').width - 56;
const IMAGE_HEIGHT = IMAGE_WIDTH * (3 / 4);
const IMAGE_GAP = 12;
const PAGE_WIDTH = IMAGE_WIDTH + IMAGE_GAP;

const Mystore = () => {
  const { user, setUser } = useUser();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [items, setItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [activeImageByItem, setActiveImageByItem] = useState<Record<string, number>>({});
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [otpInputs, setOtpInputs] = useState<{ [id: string]: string }>({});
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const fetchMyStore = useCallback(() => {
    const load = async () => {
      setLoadingItems(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) { setLoadingItems(false); return; }
      try {
        const res = await fetch(`${BACKEND_URI}/api/user/myitems`, {
          headers: { authorization: token },
        });
        const data = await res.json();
        if (res.ok) setItems(data.mystore || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingItems(false);
      }
    };
    void load();
  }, []);

  useFocusEffect(fetchMyStore);

  if (!user) return (
    <View className='flex-1 justify-center items-center bg-slate-50 dark:bg-slate-900'>
      <ActivityIndicator size="large" color="#6366f1" />
    </View>
  );

  const handleAssignWinner = async (itemId: string, title: string, highestBid: number) => {
    Alert.alert(
      'Assign Winner',
      `Assign the highest bidder (${highestBid} coins) as the winner for "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Assign',
          onPress: async () => {
            setAssigningId(itemId);
            const token = await AsyncStorage.getItem('token');
            try {
              const res = await fetch(`${BACKEND_URI}/api/user/assignwinner`, {
                method: 'POST',
                headers: { authorization: token!, 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId }),
              });
              const data = await res.json();
              if (res.ok) {
                Alert.alert('✅ Winner Assigned!', `${data.winnerName} has been assigned.\n\nAsk for their OTP when you hand over the item.`);
                fetchMyStore();
              } else {
                Alert.alert('Error', data.message || 'Could not assign winner');
              }
            } catch (e) {
              Alert.alert('Error', 'Network error. Please try again.');
            } finally {
              setAssigningId(null);
            }
          },
        },
      ]
    );
  };

  const handleVerifyOtp = async (itemId: string, cost: number) => {
    const otp = otpInputs[itemId];
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit OTP from the buyer');
      return;
    }
    setVerifyingId(itemId);
    const token = await AsyncStorage.getItem('token');
    try {
      const res = await fetch(`${BACKEND_URI}/api/user/verifyitemotp`, {
        method: 'POST',
        headers: { authorization: token!, 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        if (user) setUser({ ...user, coins: data.coins });
        setItems((prev) =>
          prev.map((it) =>
            it._id === itemId ? { ...it, coinstransferred: true, otpverified: true } : it
          )
        );
        Alert.alert('✅ Delivered!', `OTP accepted! ${cost} coins added.\nNew balance: ${data.coins} coins`);
      } else {
        Alert.alert('Error', data.message || 'Verification failed');
      }
    } catch (e) {
      Alert.alert('Error', 'Network error. Try again.');
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <SafeAreaView className='flex-1 bg-slate-50 dark:bg-slate-900'>
      {/* Header */}
      <View className="px-5 pt-3 pb-4">
        <Text className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-1">Selling</Text>
        <Text className='text-2xl font-extrabold text-slate-800 dark:text-slate-100'>My Store</Text>
      </View>
      <View className="h-px bg-slate-200 dark:bg-slate-700 mx-4 mb-3" />

      <ScrollView className='flex-1' contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16 }}>
        {loadingItems && (
          <View className='flex-1 justify-center items-center mt-20'>
            <ActivityIndicator size='large' color="#6366f1" />
          </View>
        )}
        {!loadingItems && items.length === 0 && (
          <View className='flex-1 justify-center items-center mt-24 gap-3'>
            <View className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 items-center justify-center">
              <ShoppingBag size={28} color={isDark ? '#64748b' : '#94a3b8'} />
            </View>
            <Text className='text-slate-500 dark:text-slate-400 text-base font-medium'>No items yet</Text>
            <Text className='text-slate-400 dark:text-slate-500 text-sm text-center'>
              Add items to your store from the New Post tab
            </Text>
          </View>
        )}

        {items.map((val, idx) => {
          const itemKey = val._id ? String(val._id) : `item-${idx}`;
          const activeImageIndex = activeImageByItem[itemKey] ?? 0;
          const highestBid = val.bids && val.bids.length > 0 ? val.bids[val.bids.length - 1].bid : null;

          return (
            <View
              key={val._id || idx}
              className='bg-white dark:bg-slate-800 rounded-2xl mb-4 overflow-hidden border border-slate-200 dark:border-slate-700'
              style={{ boxShadow: '0px 2px 8px rgba(0,0,0,0.06)', elevation: 2 }}
            >
              {/* Card Header */}
              <View className={`px-4 py-3 border-b ${
                val.assignedto
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/40'
                  : 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-100 dark:border-indigo-800/40'
              }`}>
                <View className="flex-row items-start justify-between">
                  <Text className='text-lg font-bold text-slate-800 dark:text-slate-100 flex-1 mr-2'>
                    {val.title ?? 'Untitled Item'}
                  </Text>
                  {val.assignedto ? (
                    <View className="bg-emerald-500 px-2.5 py-1 rounded-full">
                      <Text className="text-white text-xs font-bold">Sold</Text>
                    </View>
                  ) : val.bids?.length > 0 ? (
                    <View className="bg-amber-400 px-2.5 py-1 rounded-full">
                      <Text className="text-white text-xs font-bold">Bidding</Text>
                    </View>
                  ) : (
                    <View className="bg-slate-400 px-2.5 py-1 rounded-full">
                      <Text className="text-white text-xs font-bold">No Bids</Text>
                    </View>
                  )}
                </View>
                <View className="flex-row items-center gap-3 mt-1">
                  <View className="flex-row items-center gap-1">
                    <Coins size={12} color={isDark ? '#fbbf24' : '#d97706'} />
                    <Text className='text-amber-600 dark:text-amber-400 text-xs font-semibold'>
                      Current: {val.currcost} coins
                    </Text>
                  </View>
                  {highestBid !== null && (
                    <>
                      <Text className="text-slate-300 dark:text-slate-600">·</Text>
                      <View className="flex-row items-center gap-1">
                        <Trophy size={12} color={isDark ? '#a5b4fc' : '#6366f1'} />
                        <Text className='text-indigo-600 dark:text-indigo-400 text-xs font-bold'>
                          Top bid: {highestBid}
                        </Text>
                      </View>
                    </>
                  )}
                </View>
              </View>

              {/* Images */}
              <View className='px-4 pt-3 gap-2'>
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
                  {val.images.map((img: string, i: number) => (
                    <View key={`${val._id}-img-${i}`} className='mr-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600'>
                      <Image
                        source={{ uri: img }}
                        style={{ height: IMAGE_HEIGHT, width: IMAGE_WIDTH }}
                        resizeMode='cover'
                        onError={(e) => console.log('Image error:', e.nativeEvent)}
                      />
                    </View>
                  ))}
                </ScrollView>

                {val.images.length > 1 && (
                  <View className='flex flex-row justify-center items-center gap-1'>
                    {val.images.map((_: string, dotIndex: number) => (
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

              {/* Assign Winner Button */}
              {!val.assignedto && val.bids && val.bids.length > 0 && (
                <View className="px-4 pt-3 pb-1">
                  <Pressable
                    className='bg-indigo-600 dark:bg-indigo-700 py-3.5 rounded-xl items-center flex-row justify-center gap-2 active:opacity-80'
                    disabled={assigningId === val._id}
                    onPress={() => handleAssignWinner(val._id, val.title, highestBid)}
                  >
                    {assigningId === val._id ? (
                      <ActivityIndicator size='small' color='white' />
                    ) : (
                      <>
                        <Trophy size={16} color="white" />
                        <Text className='text-white font-bold text-sm'>Assign Top Bidder ({highestBid} coins)</Text>
                      </>
                    )}
                  </Pressable>
                </View>
              )}

              {/* Winner assigned banner */}
              {val.assignedto && !val.coinstransferred && (
                <View className='mx-4 mt-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-3'>
                  <Text className='text-blue-700 dark:text-blue-300 font-bold text-sm'>📦 Winner assigned — pending delivery</Text>
                  <Text className='text-blue-500 dark:text-blue-400 text-xs mt-0.5'>Ask the buyer for their 6-digit OTP when you hand over the item.</Text>
                </View>
              )}

              {/* OTP input */}
              {val.assignedto && !val.coinstransferred && (
                <View className='px-4 pb-4 pt-3 gap-3 border-t border-slate-100 dark:border-slate-700 mt-3'>
                  <Text className='font-bold text-slate-700 dark:text-slate-300 text-sm'>
                    Enter Buyer OTP to Claim Coins
                  </Text>
                  <TextInput
                    className='border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-700 text-base tracking-widest'
                    placeholder='Enter 6-digit OTP'
                    placeholderTextColor='#94a3b8'
                    keyboardType='number-pad'
                    maxLength={6}
                    value={otpInputs[val._id] ?? ''}
                    onChangeText={(t) => setOtpInputs((prev) => ({ ...prev, [val._id]: t }))}
                  />
                  <Pressable
                    className='bg-emerald-600 py-3.5 rounded-xl items-center flex-row justify-center gap-2 active:opacity-80'
                    disabled={verifyingId === val._id}
                    onPress={() => handleVerifyOtp(val._id, val.currcost)}
                  >
                    {verifyingId === val._id ? (
                      <ActivityIndicator size='small' color='white' />
                    ) : (
                      <>
                        <KeyRound size={16} color="white" />
                        <Text className='text-white font-bold'>Verify OTP & Claim</Text>
                      </>
                    )}
                  </Pressable>
                </View>
              )}

              {/* Delivered */}
              {val.assignedto && val.coinstransferred && (
                <View className='mx-4 mb-4 mt-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl p-3 flex-row items-center justify-center gap-2'>
                  <CheckCircle size={18} color={isDark ? '#34d399' : '#059669'} />
                  <Text className='text-emerald-700 dark:text-emerald-300 font-bold'>Delivered & Coins Claimed!</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  )
}

export default Mystore
