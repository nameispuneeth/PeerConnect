import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const explore = () => {
  return (
    <SafeAreaView className="bg-slate-50 dark:bg-slate-900 flex-1">
    <View className="flex-1 justify-center items-center">
      <Text className="text-slate-800 dark:text-slate-100 text-xl">Explore</Text>
    </View>
    </SafeAreaView>
  )
}

export default explore

const styles = StyleSheet.create({})