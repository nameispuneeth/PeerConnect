import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { BACKEND_URI } from '@/config/api'

const Index = () => {
  
  return (
    <SafeAreaView>
    <View>
      <Text>index</Text>
    </View>
    </SafeAreaView>
  )
}

export default Index

const styles = StyleSheet.create({})