import { View, Text, ScrollView, Image, Platform, TouchableOpacity, useWindowDimensions, TextInput, Modal, ActivityIndicator ,Alert} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { BACKEND_URI } from '@/config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ChevronDown } from 'lucide-react-native';



export default function AllItems() {
  const { width: screenWidth } = useWindowDimensions();
  const [userid,setuserid]=useState<string>("");
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
  const router = useRouter();
  const [activemodal, setActivemodal] = useState<string>("");
  const [input, setInput] = useState("");
  const [bidsetting, setbidsetting] = useState(false);
  const [bidstnow, setbidstnow] = useState<Set<string>>(new Set());


  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError(null);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setError('User not authenticated');
        router.push('/(auth)');
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
        if (response.ok) {
          setItems(data.items || []);
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
      router.push('/(auth)');
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
            item._id === itemId ? { ...item, currcost: bidAmount ,bids:[
              ...item.bids || [],
              {
                _id:Date.now(),
                bid:bidAmount,
                user:{
                  _id:Date.now(),
                  username:"You"
                }
              }
            ]} : item
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

  return (
    <View className='flex-1 justify-center items-center'>
      {loading && (
        <View className='flex-1 justify-center items-center'>
          <Text className='text-slate-600 dark:text-slate-400'>Loading items...</Text>
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

      {!loading && !error && items.length > 0 && (
        <ScrollView className='mt-10' contentContainerStyle={{ paddingBottom: 28 }}>
          {items.map((val, idx) => {
            const itemKey = val._id ? String(val._id) : `item-${idx}`;
            const activeImageIndex = activeImageByItem[itemKey] ?? 0;

            return (
              <View key={val._id || idx} className='border border-slate-400 dark:border-slate-600 flex flex-col mb-8 m-2 p-3 rounded-md bg-white dark:bg-slate-800 gap-2 self-center' style={{ width: CARD_WIDTH }}>
                <Text className='text-2xl font-bold mb-2 text-slate-800 dark:text-slate-100'>{val.title ?? "Untitled Item"}</Text>
                <View className='flex flex-row'>
                  <Text className='text-slate-700 dark:text-slate-300'> Current Bid Cost : </Text>
                  <Text className='text-slate-800 dark:text-slate-100'>{val.currcost} Coins</Text>
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
                <TouchableOpacity className='bg-primary-600 p-3 rounded-lg mt-3' onPress={() =>{
                  if(val.bids.length!=0 && val.bids[val.bids.length-1].user._id==userid){
                    Alert.alert("Unable To Bid","You Can't Bid Because You Made the last bid");
                    return;
                  }else setActivemodal(String(val._id))
                }}>
                  {bidsetting ? <ActivityIndicator size="large"></ActivityIndicator> : <Text className='text-center text-white text-lg font-semibold'>Bid</Text>}
                </TouchableOpacity>
                <TouchableOpacity className='bg-primary-600 p-2 rounded-lg mt-3' onPress={() => {
                  setbidstnow(prev => {
                    const newset = new Set(prev);
                    if (newset.has(val._id)) {
                      newset.delete(val._id);
                    } else {
                      newset.add(val._id);
                    }
                    return newset;
                  })
                }}>
                  <View className='flex flex-row justify-center items-center'>
                    <Text className='text-center text-white text-lg font-semibold'>Bids Till Now </Text>
                    <ChevronDown color={"white"} />
                  </View>
                </TouchableOpacity>

                {bidstnow.has(itemKey) && (
                    val.bids.length == 0 ? <View className='mt-2 bg-slate-100 dark:bg-slate-700 rounded-lg p-3 text-center'><Text className='dark:text-white text-center'>No Bids So Far...</Text></View> : 
                    ([...val.bids].reverse().map((data: any, idx: number) => {
                      return (
                        <View key={idx} className='mt-2 bg-slate-100 dark:bg-slate-700 rounded-lg p-3'>
                          <View className='flex-row justify-between py-1'>
                            <Text className='dark:text-white'>{data.user._id==userid ? "You": data.user.username}</Text>
                            <Text className='dark:text-white'>{data.bid} Coins</Text>
                          </View>
                        </View>
                      )
                    })
                    )
                )}
                <Modal transparent visible={activemodal===String(val._id)} animationType="fade">
                  <View className="flex-1 justify-center items-center bg-black/40 px-5">

                    {/* Card */}
                    <View className="w-full max-w-md bg-white dark:bg-slate-900 rounded-lg p-6">

                      {/* Title */}
                      <Text className="text-lg font-semibold text-slate-900 dark:text-white text-center">
                        Place Bid
                      </Text>

                      {/* Input */}
                      <View className="mt-5">
                        <TextInput
                          value={input}
                          onChangeText={setInput}
                          placeholder="Enter coins"
                          keyboardType="numeric"
                          placeholderTextColor="#94a3b8"
                          className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl text-base"
                        />
                      </View>

                      {/* Buttons */}
                      <View className="flex-row mt-6">

                        {/* Cancel */}
                        <TouchableOpacity
                          onPress={() => {
                            setInput("");
                            setActivemodal("");
                          }}
                          className="flex-1 py-3 mr-2 rounded-xl bg-slate-100 dark:bg-slate-800"
                        >
                          <Text className="text-center text-slate-700 dark:text-slate-300 font-medium">
                            Cancel
                          </Text>
                        </TouchableOpacity>

                        {/* Submit */}
                        <TouchableOpacity
                          onPress={() => {
                            if (!input) return;
                            if (parseInt(input) <= parseInt(val.currcost)) {
                              alert("Bid must be higher than current bid!");
                              return;
                            }
                            setInput("");
                            setActivemodal("");
                            handleBid(val._id, input);
                          }}
                          className="flex-1 py-3 ml-2 rounded-xl bg-primary-600"
                        >
                          <Text className="text-center text-white font-semibold">
                            Submit
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Modal>
              </View>
            )


          })}
        </ScrollView>
      )}

    </View>
  )
}   