import { Alert, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { BACKEND_URI } from '@/config/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SafeAreaView } from 'react-native-safe-area-context'

const mystore = () => {
  const [loading,setloading]=useState<boolean>(true);
  const [items,setitems]=useState([]);
  useEffect(()=>{
    setloading(true);
    const apifetch=async()=>{
      try{
        const token=await AsyncStorage.getItem("token")||"";
      const response=await fetch(`${BACKEND_URI}/api/user/myitems`,{
        method:"GET",
        headers:{
          "authorization":token
        }
      });
      const data=await response.json();
      console.log(data);
      if(response.ok){
        setitems(data.mystore);
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
    <SafeAreaView>

    </SafeAreaView>
  )
}

export default mystore

