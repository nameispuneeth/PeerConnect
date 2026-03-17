import { Alert, StyleSheet, Text, View ,ActivityIndicator, ScrollView} from 'react-native'
import React, { useEffect, useState } from 'react'
import { BACKEND_URI } from '@/config/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SafeAreaView } from 'react-native-safe-area-context'

const mycourses = () => {
  const [loading,setloading]=useState<boolean>(true);
  const [courses,setcourses]=useState<any[]>([]);
  useEffect(()=>{
    const apifetch=async()=>{
      try{
            setloading(true);

        const token=await AsyncStorage.getItem("token")||"";
      const response=await fetch(`${BACKEND_URI}/api/user/mycourses`,{
        method:"GET",
        headers:{
          "authorization":token
        }
      });
      const data=await response.json();
      if(response.ok){
        setcourses(data.mycourses || []);
      }else{
        Alert.alert(data.message);
      }
      }catch(e){
        Alert.alert("Network Issues")
      }finally{
        setloading(false);
      }
    }
    apifetch()
  },[])
    if(loading) return <View className='flex justify-center items-center'><ActivityIndicator/></View>
  return (
    <SafeAreaView className='flex flex-1 min-h-screen bg-gray-200'>
     <Text className='text-2xl font-extrabold ml-2 mt-3 mb-2'>My Courses</Text>
      <View className='border-b-2 border-black mb-3'></View>
      <ScrollView className='mb-10'>
      {courses.map((val,idx)=>(
        <View key={idx} className='border border-black flex flex-col mb-8 m-2 p-3 rounded-md bg-gray-100 gap-2'>
          <Text className='text-2xl font-bold mb-2'>{val.title ?? "Untitled Course"}</Text>
          <View className='flex flex-row'>
            <Text className='font-bold'> Cost : </Text>
            <Text>{val.cost} Coins</Text>
          </View>

          <View className='flex flex-row'>
            <Text className='font-bold'> Duration : </Text>
            <Text>{val.duration} </Text>
          </View>

          <View className='flex flex-row'>
            <Text className='font-bold'> Timeslot : </Text>
            <Text>{val.timeslot} </Text>
          </View>

          <View className='flex flex-row'>
            <Text className='font-bold'> Dormitary : </Text>
            <Text>{val.dormitary} </Text>
          </View>

          <View className='flex flex-row items-center'>
            <Text className='font-bold'> Topics : </Text>
            <View className='flex flex-row gap-2'>
            {val.topics.map((val2:string,idx2:number)=>(
              <Text className='bg-gray-200 p-1 rounded-md' key={idx2}>{val2}</Text>
            ))}
            </View>
          </View>

          <View className='flex flex-row items-center'>
            <Text className='font-bold'> Status : </Text>
            {val.assignedto ? <Text className='bg-green-400 text-white font-extrabold rounded-xl text-xs p-2'>Taught</Text> : <Text className='bg-yellow-400 text-white font-extrabold rounded-xl text-xs p-2'>Not Taught</Text>}
          </View>

        </View>
      ))}
      </ScrollView>
    </SafeAreaView>
  )
}

export default mycourses

