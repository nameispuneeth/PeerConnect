import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { BACKEND_URI } from '@/config/api'
import { TouchableOpacity } from 'react-native'
import { Moon, Sun } from 'lucide-react-native'
import { useTheme } from '@/constants/ThemeContext'

const Index = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <View className="flex-row justify-end p-4">
        <TouchableOpacity 
          onPress={toggleTheme}
          className="p-2 rounded-full bg-slate-200 dark:bg-slate-700"
        >
          {theme === 'dark' ? (
            <Sun size={24} color="#f1f5f9" />
          ) : (
            <Moon size={24} color="#1e293b" />
          )}
        </TouchableOpacity>
      </View>
      <View className="flex-1 justify-center items-center">
        <Text className="text-2xl font-bold text-slate-800 dark:text-slate-100">Welcome to StudentPeer</Text>
        <Text className="text-slate-600 dark:text-slate-300 mt-2">Your learning platform</Text>
      </View>
    </SafeAreaView>
  )
}

export default Index

const styles = StyleSheet.create({})