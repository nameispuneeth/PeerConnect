import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React from 'react'
import { TouchableOpacity } from 'react-native'
import { Moon, Sun, Coins } from 'lucide-react-native'
import { useTheme } from '@/constants/ThemeContext'

import AllItems from '@/components/allitems'
import Allcourses from '@/components/allcourses'

const Index = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = React.useState<'courses' | 'store'>('courses');
  
  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <View className="flex-row justify-between items-center px-4 py-4">

        <Text className="text-xl font-bold text-slate-800 dark:text-slate-100">Student Peer</Text>

        <View className="flex-row items-center gap-4">
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
          <View className="flex-row items-center gap-1 bg-slate-200 dark:bg-slate-700 px-3 py-2 rounded-full">
            <Coins size={20} color={theme === 'dark' ? '#f1f5f9' : '#1e293b'} />
            <Text className="text-slate-800 dark:text-slate-100 font-semibold">200</Text>
          </View>
        </View>
      </View>
      <View className='flex flex-row justify-around mt-3'>
        <TouchableOpacity onPress={() => setActiveTab('courses')} className={`border dark:border-white px-16 py-3 rounded-lg ${activeTab === 'courses' ? 'bg-slate-200 dark:bg-slate-700' : ''}`}>
          <Text className="dark:text-white text-slate-800 font-semibold">Courses</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('store')} className={`border dark:border-white px-16 py-3 rounded-lg ${activeTab === 'store' ? 'bg-slate-200 dark:bg-slate-700' : ''}`}>
          <Text className="dark:text-white text-slate-800 font-semibold">Store</Text>
        </TouchableOpacity>
      </View>
      <View className="flex-1 justify-center items-center">
        {activeTab === 'courses' ? <Allcourses /> : <AllItems />}
      </View>

      
    </SafeAreaView>
  )
}

export default Index

const styles = StyleSheet.create({})