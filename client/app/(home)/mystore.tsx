import { useState } from 'react';
import { ActivityIndicator, Text, View, Image, ScrollView, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useUser } from '@/constants/userContext';

const IMAGE_WIDTH = Dimensions.get('window').width - 56;
const IMAGE_HEIGHT = IMAGE_WIDTH * (3 / 4);
const IMAGE_GAP = 12;
const PAGE_WIDTH = IMAGE_WIDTH + IMAGE_GAP;

const Mystore = () => {
  const {user}=useUser();
  const [activeImageByItem, setActiveImageByItem] = useState<Record<string, number>>({});
  if (!user) return <View className='flex justify-center items-center'><ActivityIndicator size="large" /></View>
  return (
    <SafeAreaView className='flex flex-1 min-h-screen bg-slate-50 dark:bg-slate-900'>
      <Text className='text-2xl font-extrabold ml-2 mt-3 mb-2 text-slate-800 dark:text-slate-100'>My Store Items</Text>
      <View className='border-b-2 border-slate-400 dark:border-slate-600 mb-3'></View>
      <ScrollView className='mb-10'>
        {user.mystore.map((val, idx) => {
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

            </View>

            {/* <View className='flex flex-row'>
                <Text> Timeslot : </Text>
                <Text>{val.timeslot} </Text>
              </View>
    
              <View className='flex flex-row'>
                <Text> Dormitary : </Text>
                <Text>{val.dormitary} </Text>
              </View>
    
              <View className='flex flex-row items-center'>
                <Text> Topics : </Text>
                <View className='flex flex-row gap-2'>
                {val.topics.map((val2:string,idx2:number)=>(
                  <Text className='bg-gray-200 p-1 rounded-md' key={idx2}>{val2}</Text>
                ))}
                </View>
              </View>
    
              <View className='flex flex-row items-center'>
                <Text> Status : </Text>
                {val.assignedto ? <Text className='bg-green-400 text-white font-extrabold rounded-xl text-xs p-2'>Taught</Text> : <Text className='bg-yellow-400 text-white font-extrabold rounded-xl text-xs p-2'>Not Taught</Text>}
              </View> */}

          </View>
        )})}
      </ScrollView>
    </SafeAreaView>
  )
}

export default Mystore

