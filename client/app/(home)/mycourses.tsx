import { Alert, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { BACKEND_URI } from '@/config/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SafeAreaView } from 'react-native-safe-area-context'

const mycourses = () => {
  const [loading,setloading]=useState<boolean>(true);
  const [courses,setcourses]=useState<any[]>([]);
  useEffect(()=>{
    setloading(true);
    const apifetch=async()=>{
      try{
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
        Alert.alert("Netwoek Issues")
      }
    }
    apifetch()
  },[])
  return (
    <SafeAreaView className='flex flex-1 min-h-screen bg-gray-200'>
      {courses.map((val,idx)=>(
        <View key={idx} className='border border-black flex flex-col mb-8 m-2 p-3 rounded-md bg-gray-100 gap-2'>
          <Text className='text-2xl font-bold mb-2'>{val.title ?? "Untitled Course"}</Text>
          <View className='flex flex-row'>
            <Text> Cost : </Text>
            <Text>{val.cost} Coins</Text>
          </View>

          <View className='flex flex-row'>
            <Text> Duration : </Text>
            <Text>{val.duration} </Text>
          </View>

          <View className='flex flex-row'>
            <Text> Timeslot : </Text>
            <Text>{val.timeslot} </Text>
          </View>

          <View className='flex flex-row'>
            <Text> Dormitary : </Text>
            <Text>{val.dormitary} </Text>
          </View>

          <View className='flex flex-row items-center mb-5'>
            <Text> Topics : </Text>
            <View className='flex flex-row gap-2'>
            {val.topics.map((val2:string,idx2:number)=>(
              <Text className='bg-gray-200 p-1 rounded-md' key={idx2}>{val2}</Text>
            ))}
            </View>
          </View>



        </View>
      ))}
    </SafeAreaView>
  )
}

export default mycourses

