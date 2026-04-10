import { View, Text, ScrollView, Image, Platform, Pressable, useWindowDimensions, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { BACKEND_URI } from '@/config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ChevronDown, Filter } from 'lucide-react-native';
import { useTheme } from '@/constants/ThemeContext';



export default function AllItems() {
  const { width: screenWidth } = useWindowDimensions();
  const [userid, setuserid] = useState<string>("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageByItem, setActiveImageByItem] = useState<Record<string, number>>({});
  const itemScrollRefs = useRef<Record<string, ScrollView | null>>({});
  const MAX_CARD_WIDTH = 520;
  const CARD_WIDTH = Math.min(screenWidth - 20, Platform.OS === 'web' ? MAX_CARD_WIDTH : screenWidth - 20);
  const IMAGE_WIDTH = CARD_WIDTH - 24;
  const IMAGE_HEIGHT = IMAGE_WIDTH * (3 / 4);
  const IMAGE_GAP = 12;
  const PAGE_WIDTH = IMAGE_WIDTH + IMAGE_GAP;

  const [activemodal, setActivemodal] = useState<string>("");
  const [input, setInput] = useState("");
  const [bidsetting, setbidsetting] = useState(false);
  const [bidstnow, setbidstnow] = useState<Set<string>>(new Set());
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({ minCost: '', maxCost: '' });
  const { theme } = useTheme();
  const isDark = theme === 'dark';


  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError(null);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`${BACKEND_URI}/api/user/getallitems`, {
          headers: {
            'authorization': token
          }
        });
        const data = await response.json();
        console.log(data)
        if (response.ok) {
          setItems((data.items || []).filter((item: any) => !item.assignedto));
          setuserid(data.id);
          setError(null);
        }
        else {
          setError(data.message || 'Failed to fetch items');
        }
      } catch (error) {
        console.error('Error fetching items:', error);
        setError('Failed to load items. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);
  const handleBid = async (itemId: string, bidAmount: string) => {
    setbidsetting(true);
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      setError('User not authenticated');
      setbidsetting(false);
      return;
    }
    try {
      const response = await fetch(`${BACKEND_URI}/api/user/makebid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': token
        },
        body: JSON.stringify({ item_id: itemId, cost: bidAmount })
      });
      const data = await response.json();
      if (response.ok) {
        alert('Bid placed successfully!');
        setItems((prevItems) =>
          prevItems.map((item) =>
            item._id === itemId ? {
              ...item, currcost: bidAmount, bids: [
                ...item.bids || [],
                {
                  _id: Date.now(),
                  bid: bidAmount,
                  user: {
                    _id: Date.now(),
                    username: "You"
                  }
                }
              ]
            } : item
          )
        );
      } else {
        alert(data.message || 'Failed to place bid');
      }
    } catch (error) {
      console.error('Error placing bid:', error);
      alert('Failed to place bid. Please try again.');
    } finally {
      setbidsetting(false);
      setInput("");
    }
  };

  // Find the currently active modal item for rendering a single modal outside the map
  const activeItem = items.find((item) => String(item._id) === activemodal);

  const filteredItems = items.filter((item: any) => {
    let match = true;
    if (filters.minCost!='' && item.currcost < Number(filters.minCost)) match = false;
    if (filters.maxCost!='' && item.currcost > Number(filters.maxCost)) match = false;
    return match;
  });

  return (
    <View className='flex-1'>
      {loading && (
        <View className="flex-1 justify-center items-center py-20">
          <ActivityIndicator size="large" color="#6366f1" />
          <Text className="text-slate-500 dark:text-slate-400 text-sm mt-3">Loading items…</Text>
        </View>
      )}

      {!loading && error && (
        <View className='flex-1 justify-center items-center px-6'>
          <Text className='text-red-600 dark:text-red-400 text-center'>{error}</Text>
        </View>
      )}

      {!loading && !error && items.length === 0 && (
        <View className='flex-1 justify-center items-center'>
          <Text className='text-slate-600 dark:text-slate-400'>No Items Available</Text>
        </View>
      )}

      {!loading && !error && filteredItems.length > 0 && (
        <View className='flex-1 w-full'>
          {/* Filter Button */}
          <View className="px-4 py-2 flex-row justify-between items-center">
            <Text className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {filteredItems.length} items found
            </Text>
            <Pressable
              onPress={() => setShowFilter(true)}
              className="flex-row items-center gap-1 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30"
            >
              <View pointerEvents="none" style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Filter size={14} color={isDark ? '#a5b4fc' : '#6366f1'} />
                <ChevronDown size={14} color={isDark ? '#a5b4fc' : '#6366f1'} />
              </View>
            </Pressable>
          </View>

          {/* Filter Modal */}
          <Modal transparent visible={showFilter} animationType="fade">
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 20 }}>
              <View style={{ width: '100%', maxWidth: 400, backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: 12, padding: 24 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16, color: isDark ? '#f1f5f9' : '#0f172a' }}>
                  Filter Items
                </Text>

                <View style={{ marginBottom: 12 }}>
                  <Text style={{ marginBottom: 6, color: isDark ? '#cbd5e1' : '#334155', fontSize: 12, fontWeight: '500' }}>Min Cost (coins)</Text>
                  <TextInput
                    value={filters.minCost}
                    onChangeText={(val) => setFilters({ ...filters, minCost: val })}
                    placeholder="Min cost"
                    keyboardType="numeric"
                    placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                    style={{
                      backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
                      color: isDark ? '#f1f5f9' : '#0f172a',
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                  />
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{ marginBottom: 6, color: isDark ? '#cbd5e1' : '#334155', fontSize: 12, fontWeight: '500' }}>Max Cost (coins)</Text>
                  <TextInput
                    value={filters.maxCost}
                    onChangeText={(val) => setFilters({ ...filters, maxCost: val })}
                    placeholder="Max cost"
                    keyboardType="numeric"
                    placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                    style={{
                      backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
                      color: isDark ? '#f1f5f9' : '#0f172a',
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                  />
                </View>

                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Pressable
                    onPress={() => {
                      setFilters({ minCost: '', maxCost: '' });
                      setShowFilter(false);
                    }}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 8,
                      backgroundColor: isDark ? '#334155' : '#f1f5f9',
                    }}
                  >
                    <Text style={{ textAlign: 'center', color: isDark ? '#f1f5f9' : '#0f172a', fontWeight: '600' }}>Reset</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setShowFilter(false)}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 8,
                      backgroundColor: '#4f46e5',
                    }}
                  >
                    <Text style={{ textAlign: 'center', color: '#fff', fontWeight: '600' }}>Done</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>

          {/* Items List */}
          {filteredItems.length > 0 ? (
            <ScrollView className='mt-2' contentContainerStyle={{ paddingBottom: 28 }}>
              {filteredItems.map((val, idx) => {
                const itemKey = val._id ? String(val._id) : `item-${idx}`;
                const activeImageIndex = activeImageByItem[itemKey] ?? 0;

                return (
                  <View key={val._id || idx} className='border border-slate-400 dark:border-slate-600 flex flex-col mb-8 m-2 p-3 rounded-md bg-white dark:bg-slate-800 gap-2 self-center' style={{ width: CARD_WIDTH }}>
                    <Text className='text-2xl font-bold mb-2 text-slate-800 dark:text-slate-100'>{val.title ?? "Untitled Item"}</Text>
                    <View className='flex flex-row gap-2 items-center'>
                      <Text className='text-slate-700 dark:text-slate-300'> Current Bid : </Text>
                      <Text className='text-slate-800 dark:text-slate-100 font-semibold'>{val.currcost} Coins</Text>
                      {val.assignedto && (
                        <Text className='bg-green-400 text-white font-extrabold rounded-xl text-xs p-2'>Winner Assigned</Text>
                      )}
                    </View>

                    <View className='flex gap-2'>
                      {val.images && val.images.length > 0 ? (
                        <>
                          <View className='relative'>
                            <ScrollView
                              ref={(ref) => {
                                itemScrollRefs.current[itemKey] = ref;
                              }}
                              horizontal
                              showsHorizontalScrollIndicator={false}
                              pagingEnabled
                              snapToInterval={PAGE_WIDTH}
                              decelerationRate='fast'
                              contentContainerStyle={{ paddingHorizontal: 6 }}
                              className='mt-1'
                              onMomentumScrollEnd={(event) => {
                                const xOffset = event.nativeEvent.contentOffset.x;
                                const nextIndex = Math.max(0, Math.round(xOffset / PAGE_WIDTH));
                                setActiveImageByItem((prev) => ({ ...prev, [itemKey]: nextIndex }));
                              }}
                            >
                              {val.images.map((img: string, i: number) => (
                                <View key={`${val._id}-img-${i}`} className='mr-3 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700'>
                                  <Image
                                    source={{ uri: img }}
                                    style={{ height: IMAGE_HEIGHT, width: IMAGE_WIDTH }}
                                    resizeMode='cover'
                                    onError={(e) => console.log('Image error:', e.nativeEvent)}
                                  />
                                </View>
                              ))}

                            </ScrollView>

                          </View>

                          {val.images.length > 1 && (
                            <View className='flex flex-row justify-center items-center mt-2'>
                              {val.images.map((_: string, dotIndex: number) => (
                                <View
                                  key={`${itemKey}-dot-${dotIndex}`}
                                  className={`h-2 w-2 rounded-full mx-1 ${dotIndex === activeImageIndex ? 'bg-slate-800 dark:bg-slate-100' : 'bg-slate-300 dark:bg-slate-600'}`}
                                />
                              ))}
                            </View>
                          )}
                        </>
                      ) : (
                        <Text className='text-slate-500 dark:text-slate-400 text-sm'>No images available</Text>
                      )}
                    </View>
                    {/* Bid Button – disabled once winner is assigned */}
                    {val.assignedto ? (
                      <View className='bg-slate-300 dark:bg-slate-600 p-3 rounded-lg mt-3 items-center'>
                        <Text className='text-slate-500 dark:text-slate-400 font-semibold text-lg'>🏆 Winner Assigned</Text>
                      </View>
                    ) : (
                      <Pressable
                        className='bg-primary-600 p-3 rounded-xl mt-3 items-center flex-row justify-center gap-2 active:opacity-80'
                        onPress={() => {
                          if (val.bids?.length != 0 && val.bids?.[val.bids.length - 1]?.user?._id == userid) {
                            Alert.alert("Unable To Bid", "You Can't Bid Because You Made the last bid");
                            return;
                          } else setActivemodal(String(val._id));
                        }}
                      >
                        <View pointerEvents="none" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          {bidsetting
                            ? <ActivityIndicator size="small" color="white" />
                            : <Text className='text-center text-white text-lg font-semibold'>Bid</Text>
                          }
                        </View>
                      </Pressable>
                    )}
                    <Pressable
                      className='bg-primary-600 p-2 rounded-xl mt-3 active:opacity-80'
                      onPress={() => {
                        setbidstnow(prev => {
                          const newset = new Set(prev);
                          if (newset.has(itemKey)) {
                            newset.delete(itemKey);
                          } else {
                            newset.add(itemKey);
                          }
                          return newset;
                        });
                      }}
                    >
                      <View pointerEvents="none" style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <Text className='text-center text-white text-lg font-semibold'>Bids Till Now </Text>
                        <ChevronDown color={"white"} />
                      </View>
                    </Pressable>

                    {bidstnow.has(itemKey) && (
                      val.bids.length == 0 ? <View className='mt-2 bg-slate-100 dark:bg-slate-700 rounded-lg p-3 text-center'><Text className='dark:text-white text-center'>No Bids So Far...</Text></View> :
                        ([...val.bids].reverse().map((data: any, idx: number) => {
                          return (
                            <View key={idx} className='mt-2 bg-slate-100 dark:bg-slate-700 rounded-lg p-3'>
                              <View className='flex-row justify-between py-1'>
                                <Text className='dark:text-white'>{data.user._id == userid ? "You" : data.user.username}</Text>
                                <Text className='dark:text-white'>{data.bid} Coins</Text>
                              </View>
                            </View>
                          )
                        })
                        )
                    )}
                  </View>
                )


              })}
            </ScrollView>
          ) : (
            <View className='flex-1 justify-center items-center py-20'>
              <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                No items match your filters
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Bid Modal — conditionally rendered so it never creates an invisible touch layer */}
      {activemodal !== "" && (
        <Modal transparent visible={true} animationType="fade" onRequestClose={() => setActivemodal("")}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 20 }}>
            <View style={{ width: '100%', maxWidth: 400, backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: 12, padding: 24 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', textAlign: 'center', color: isDark ? '#f1f5f9' : '#0f172a' }}>
                Place Bid
              </Text>

              <View style={{ marginTop: 20 }}>
                <TextInput
                  value={input}
                  onChangeText={setInput}
                  placeholder="Enter coins"
                  keyboardType="numeric"
                  placeholderTextColor="#94a3b8"
                  style={{
                    backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
                    color: isDark ? '#f1f5f9' : '#0f172a',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 12,
                    fontSize: 16,
                  }}
                />
              </View>

              <View style={{ flexDirection: 'row', marginTop: 24 }}>
                <Pressable
                  onPress={() => {
                    setInput("");
                    setActivemodal("");
                  }}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    marginRight: 8,
                    borderRadius: 12,
                    backgroundColor: isDark ? '#334155' : '#f1f5f9',
                  }}
                >
                  <Text style={{ textAlign: 'center', color: isDark ? '#f1f5f9' : '#334155', fontWeight: '500' }}>
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    if (!input || !activeItem) return;
                    if (parseInt(input) <= parseInt(activeItem.currcost)) {
                      alert("Bid must be higher than current bid!");
                      return;
                    }
                    const itemId = activeItem._id;
                    const bidAmount = input;
                    setInput("");
                    setActivemodal("");
                    handleBid(itemId, bidAmount);
                  }}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    marginLeft: 8,
                    borderRadius: 12,
                    backgroundColor: '#4f46e5',
                  }}
                >
                  <Text style={{ textAlign: 'center', color: '#fff', fontWeight: '600' }}>
                    Submit
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}