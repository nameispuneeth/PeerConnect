import { ActivityIndicator, Alert, StyleSheet, Text, View, Image, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useUser } from '@/constants/userContext';
const Mystore = () => {
  const {user}=useUser();
  if (!user) return <View className='flex justify-center items-center'><ActivityIndicator size="large" /></View>
  return (
    <SafeAreaView className='flex flex-1 min-h-screen bg-slate-50 dark:bg-slate-900'>
      <Text className='text-2xl font-extrabold ml-2 mt-3 mb-2 text-slate-800 dark:text-slate-100'>My Store Items</Text>
      <View className='border-b-2 border-slate-400 dark:border-slate-600 mb-3'></View>
      <ScrollView className='mb-10'>
        {user.mystore.map((val, idx) => (
          <View key={val._id || idx} className='border border-slate-400 dark:border-slate-600 flex flex-col mb-8 m-2 p-3 rounded-md bg-white dark:bg-slate-800 gap-2'>
            <Text className='text-2xl font-bold mb-2 text-slate-800 dark:text-slate-100'>{val.title ?? "Untitled Item"}</Text>
            <View className='flex flex-row'>
              <Text className='text-slate-700 dark:text-slate-300'> Current Bid Cost : </Text>
              <Text className='text-slate-800 dark:text-slate-100'>{val.currcost} Coins</Text>
            </View>

            <View className='flex gap-2'>
              <Text className='text-slate-700 dark:text-slate-300'> Images : </Text>
              <View className='flex justify-center items-center'>
                {val.images.map((img: string, i: number) => (
                  <Image
                    source={{ uri: img }}
                    key={`${val._id}-img-${i}`}
                    style={{ height: 200, width: 200 }}
                    onError={(e) => console.log("Image error:", e.nativeEvent)}
                  />
                ))}
              </View>

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
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

export default Mystore

