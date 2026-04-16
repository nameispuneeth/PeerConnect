import { View, Text, Pressable, Modal, ActivityIndicator, ScrollView, Image } from 'react-native';
import { useState } from 'react';
import { User, BookOpen, ShoppingBag, X, GraduationCap, CheckCircle2 } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URI } from '@/config/api';
import { useTheme } from '@/constants/ThemeContext';

interface SellerProfileModalProps {
  userId: string;
  username: string;
  children: React.ReactNode;
}

export default function SellerProfileModal({ userId, username, children }: SellerProfileModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ taughtCourses: any[]; soldItems: any[] } | null>(null);

  const fetchDetails = async () => {
    setVisible(true);
    if (data) return;
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${BACKEND_URI}/api/user/seller-details/${userId}`, {
        headers: { authorization: token! },
      });
      const json = await res.json();
      if (res.ok) {
        setData({
          taughtCourses: json.taughtCourses,
          soldItems: json.soldItems,
        });
      }
    } catch (e) {
      console.log('Error fetching seller details:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Pressable onPress={fetchDetails}>{children}</Pressable>

      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-slate-50 dark:bg-slate-900 rounded-t-3xl h-[80%]">
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 items-center justify-center">
                  <User size={20} color="#6366f1" />
                </View>
                <View>
                  <Text className="text-lg font-bold text-slate-800 dark:text-slate-100">{username}</Text>
                  <Text className="text-xs text-slate-500 dark:text-slate-400">Seller Profile</Text>
                </View>
              </View>
              <Pressable onPress={() => setVisible(false)} className="p-2 rounded-full bg-slate-200 dark:bg-slate-800">
                <X size={18} color={isDark ? '#cbd5e1' : '#475569'} />
              </Pressable>
            </View>

            {loading ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#6366f1" />
              </View>
            ) : (
              <ScrollView className="flex-1 px-4 pt-4">
                {/* Courses Taught Section */}
                <View className="mb-8">
                  <View className="flex-row items-center gap-2 mb-4 px-2">
                    <GraduationCap size={20} color="#6366f1" />
                    <Text className="text-base font-bold text-slate-800 dark:text-slate-100">
                      Courses Taught ({data?.taughtCourses.length ?? 0})
                    </Text>
                  </View>
                  
                  {data?.taughtCourses.length === 0 ? (
                    <Text className="text-slate-400 dark:text-slate-500 text-sm px-2 italic">No courses taught yet.</Text>
                  ) : (
                    data?.taughtCourses.map((course, idx) => (
                      <View key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-2xl mb-3 border border-slate-200 dark:border-slate-700">
                        <View className="flex-row justify-between items-start mb-2">
                          <Text className="text-sm font-bold text-slate-800 dark:text-slate-100 flex-1 mr-2">{course.title}</Text>
                          <View className="flex-row items-center gap-1 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                            <CheckCircle2 size={10} color="#10b981" />
                            <Text className="text-[10px] font-bold text-green-700 dark:text-green-400">COMPLETED</Text>
                          </View>
                        </View>
                        <Text className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                          {course.topics.join(' • ')}
                        </Text>
                        <View className="flex-row items-center justify-between mt-1">
                          <Text className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{course.duration}</Text>
                          <Text className="text-xs font-bold text-amber-600 dark:text-amber-400">{course.cost} coins</Text>
                        </View>
                      </View>
                    ))
                  )}
                </View>

                {/* Items Sold Section */}
                <View className="mb-10">
                  <View className="flex-row items-center gap-2 mb-4 px-2">
                    <ShoppingBag size={20} color="#6366f1" />
                    <Text className="text-base font-bold text-slate-800 dark:text-slate-100">
                      Items Sold ({data?.soldItems.length ?? 0})
                    </Text>
                  </View>

                  {data?.soldItems.length === 0 ? (
                    <Text className="text-slate-400 dark:text-slate-500 text-sm px-2 italic">No items sold yet.</Text>
                  ) : (
                    data?.soldItems.map((item, idx) => (
                      <View key={idx} className="bg-white dark:bg-slate-800 p-3 rounded-2xl mb-3 border border-slate-200 dark:border-slate-700 flex-row gap-3">
                        {item.images && item.images.length > 0 ? (
                          <Image source={{ uri: item.images[0] }} className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-700" />
                        ) : (
                          <View className="w-16 h-16 rounded-xl bg-slate-200 dark:bg-slate-700 items-center justify-center">
                            <ShoppingBag size={20} color={isDark ? '#64748b' : '#94a3b8'} />
                          </View>
                        )}
                        <View className="flex-1 justify-center">
                          <View className="flex-row justify-between items-center mb-1">
                            <Text className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.title}</Text>
                            <Text className="text-xs font-bold text-green-600 dark:text-green-400">SOLD</Text>
                          </View>
                          <Text className="text-xs text-slate-500 dark:text-slate-400">Final Price: {item.currcost} coins</Text>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}
