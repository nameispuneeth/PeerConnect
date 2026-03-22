import {View, Text,Alert,ScrollView,Image, Dimensions} from 'react-native';
import React,{useState,useEffect} from 'react';
import { BACKEND_URI } from '@/config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';



export default function AllItems() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeImageByItem, setActiveImageByItem] = useState<Record<string, number>>({});
    const IMAGE_WIDTH = Dimensions.get('window').width - 56;
    const IMAGE_HEIGHT = IMAGE_WIDTH * (3 / 4);
    const IMAGE_GAP = 12;
    const PAGE_WIDTH = IMAGE_WIDTH + IMAGE_GAP;
    const router=useRouter();

    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            setError(null);
            const token=await AsyncStorage.getItem('token');
            if(!token){
                setError('User not authenticated');
                router.push('/(auth)');
                setLoading(false);
                return;
            }
            try {
                const response = await fetch(`${BACKEND_URI}/api/user/getallitems`,{
                    headers:{
                        'authorization': token
                    }
                });
                const data = await response.json();
                if(response.ok) {
                    setItems(data.items || []);
                    setError(null);
                }
                else{
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
  return (
    <View className='flex-1'>
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
        <ScrollView className='mt-10'>
          {items.map((val, idx) => {
            const itemKey = val._id ? String(val._id) : `item-${idx}`;
            const activeImageIndex = activeImageByItem[itemKey] ?? 0;
  
            return (
            <View key={val._id || idx} className='border border-slate-400 dark:border-slate-600 flex flex-col mb-8 m-2 p-3 rounded-md bg-white dark:bg-slate-800 gap-2'>
              <Text className='text-2xl font-bold mb-2 text-slate-800 dark:text-slate-100'>{val.title ?? "Untitled Item"}</Text>
              <View className='flex flex-row'>
                <Text className='text-slate-700 dark:text-slate-300'> Current Bid Cost : </Text>
                <Text className='text-slate-800 dark:text-slate-100'>{val.currcost} Coins</Text>
              </View>
  
              <View className='flex gap-2'>
                <Text className='text-slate-700 dark:text-slate-300'> Images : </Text>
                {val.images && val.images.length > 0 ? (
                  <>
                    <ScrollView
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
  
            </View>
            )})}
          </ScrollView>
      )}
    </View>
  )
}   