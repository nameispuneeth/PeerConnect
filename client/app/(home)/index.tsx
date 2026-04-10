import { Text, View, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React from 'react'
import { TouchableOpacity } from 'react-native'
import { Moon, Sun, Coins, BookOpen, ShoppingBag } from 'lucide-react-native'
import { useTheme } from '@/constants/ThemeContext'
import { useUser } from '@/constants/userContext'

import AllItems from '@/components/allitems'
import Allcourses from '@/components/allcourses'

const Index = () => {
  const { user } = useUser();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = React.useState<'courses' | 'store'>('courses');
  const isDark = theme === 'dark';

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#0f172a' : '#f8fafc'}
      />

      {/* Header */}
      <View className="flex-row justify-between items-center px-5 pt-2 pb-4">
        <View>
          <Text className="text-xs font-medium text-indigo-500 dark:text-indigo-400 tracking-widest uppercase mb-0.5">
            Welcome back
          </Text>
          <Text className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            Student Peer
          </Text>
        </View>

        <View className="flex-row items-center gap-3">
          {/* Coins Badge */}
          <View className="flex-row items-center gap-1.5 bg-amber-100 dark:bg-amber-900/40 px-3 py-2 rounded-full border border-amber-200 dark:border-amber-700">
            <Coins size={16} color={isDark ? '#fbbf24' : '#d97706'} />
            <Text className="text-amber-700 dark:text-amber-300 font-bold text-sm">
              {user?.coins ?? 0}
            </Text>
          </View>

          {/* Theme Toggle */}
          <TouchableOpacity
            onPress={toggleTheme}
            className="p-2.5 rounded-full bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600"
            activeOpacity={0.7}
          >
            <View pointerEvents="none">
              {isDark ? (
                <Sun size={18} color="#f1f5f9" />
              ) : (
                <Moon size={18} color="#334155" />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Switcher */}
      <View className="mx-4 mb-3 flex-row bg-slate-200 dark:bg-slate-800 rounded-2xl p-1 border border-slate-300 dark:border-slate-700">
        <TouchableOpacity
          onPress={() => setActiveTab('courses')}
          className={`flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-xl ${activeTab === 'courses'
            ? 'bg-white dark:bg-slate-700 shadow-sm'
            : ''
            }`}
          activeOpacity={0.7}
        >
          <View pointerEvents="none" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <BookOpen size={16} color={
              activeTab === 'courses'
                ? (isDark ? '#a5b4fc' : '#4f46e5')
                : (isDark ? '#64748b' : '#94a3b8')
            } />
            <Text className={`font-semibold text-sm ${activeTab === 'courses'
              ? 'text-indigo-600 dark:text-indigo-300'
              : 'text-slate-400 dark:text-slate-500'
              }`}>
              Courses
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('store')}
          className={`flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-xl ${activeTab === 'store'
            ? 'bg-white dark:bg-slate-700 shadow-sm'
            : ''
            }`}
          activeOpacity={0.7}
        >
          <View pointerEvents="none" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ShoppingBag size={16} color={
              activeTab === 'store'
                ? (isDark ? '#a5b4fc' : '#4f46e5')
                : (isDark ? '#64748b' : '#94a3b8')
            } />
            <Text className={`font-semibold text-sm ${activeTab === 'store'
              ? 'text-indigo-600 dark:text-indigo-300'
              : 'text-slate-400 dark:text-slate-500'
              }`}>
              Store
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="flex-1 w-full">
        {activeTab === 'courses' ? <Allcourses /> : <AllItems />}
      </View>
    </SafeAreaView>
  )
}

export default Index