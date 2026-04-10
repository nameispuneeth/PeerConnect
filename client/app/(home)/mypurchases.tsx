import { View, Text, Pressable, Alert, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@/constants/userContext';
import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URI } from '@/config/api';
import { useFocusEffect } from 'expo-router';
import { Clock, MapPin, Timer, Tag, KeyRound, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react-native';
import { useTheme } from '@/constants/ThemeContext';

type OtpState = {
  [courseId: string]:
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'available'; otp: string }
    | { status: 'tooEarly'; minutesLeft: number }
    | { status: 'verified' }
    | { status: 'error'; message: string };
};

export default function Mypurchases() {
  const { user, setUser } = useUser();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [otpStates, setOtpStates] = useState<OtpState>({});
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    try {
      const res = await fetch(`${BACKEND_URI}/api/user/mypurchases`, {
        headers: { authorization: token },
      });
      const data = await res.json();
      if (res.ok) setCourses(data.courses);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void fetchPurchases();
    }, [fetchPurchases])
  );

  const handleGetOtp = async (courseId: string) => {
    setOtpStates((prev) => ({ ...prev, [courseId]: { status: 'loading' } }));
    const token = await AsyncStorage.getItem('token');
    try {
      const res = await fetch(`${BACKEND_URI}/api/user/getotp/${courseId}`, {
        headers: { authorization: token! },
      });
      const data = await res.json();
      if (res.ok) {
        if (data.verified) {
          setOtpStates((prev) => ({ ...prev, [courseId]: { status: 'verified' } }));
        } else {
          setOtpStates((prev) => ({ ...prev, [courseId]: { status: 'available', otp: data.otp } }));
        }
      } else if (res.status === 425) {
        setOtpStates((prev) => ({
          ...prev,
          [courseId]: { status: 'tooEarly', minutesLeft: data.minutesLeft },
        }));
      } else {
        setOtpStates((prev) => ({
          ...prev,
          [courseId]: { status: 'error', message: data.message || 'Error fetching OTP' },
        }));
      }
    } catch (e) {
      setOtpStates((prev) => ({
        ...prev,
        [courseId]: { status: 'error', message: 'Network error. Try again.' },
      }));
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900 justify-center items-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <View className="px-5 pt-3 pb-4">
        <Text className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-1">
          Purchased
        </Text>
        <Text className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
          My Courses
        </Text>
      </View>
      <View className="h-px bg-slate-200 dark:bg-slate-700 mx-4 mb-3" />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16 }}>
        {courses.length === 0 && (
          <View className="flex-1 justify-center items-center mt-24 gap-3">
            <View className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 items-center justify-center">
              <Tag size={28} color={isDark ? '#64748b' : '#94a3b8'} />
            </View>
            <Text className="text-slate-500 dark:text-slate-400 text-base font-medium">
              No purchased courses yet
            </Text>
            <Text className="text-slate-400 dark:text-slate-500 text-sm text-center">
              Browse the marketplace to find courses
            </Text>
          </View>
        )}

        {courses.map((course, idx) => {
          const state = otpStates[course._id] ?? { status: 'idle' };
          return (
            <View
              key={idx}
              className="bg-white dark:bg-slate-800 rounded-2xl mb-4 overflow-hidden border border-slate-200 dark:border-slate-700"
              style={{ boxShadow: '0px 2px 8px rgba(0,0,0,0.06)', elevation: 2 }}
            >
              {/* Card Header */}
              <View className="bg-indigo-50 dark:bg-indigo-900/30 px-4 py-3 border-b border-indigo-100 dark:border-indigo-800/40">
                <Text className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {course.title ?? 'Untitled Course'}
                </Text>
                <View className="flex-row items-center gap-1 mt-0.5">
                  <Tag size={12} color={isDark ? '#818cf8' : '#6366f1'} />
                  <Text className="text-indigo-600 dark:text-indigo-300 text-xs font-semibold">
                    {course.cost} coins paid
                  </Text>
                </View>
              </View>

              {/* Details */}
              <View className="px-4 py-3 gap-2">
                <View className="flex-row items-center gap-2">
                  <Clock size={14} color={isDark ? '#94a3b8' : '#64748b'} />
                  <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium">Timeslot</Text>
                  <Text className="text-slate-700 dark:text-slate-200 text-xs ml-auto">{course.timeslot}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <MapPin size={14} color={isDark ? '#94a3b8' : '#64748b'} />
                  <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium">Location</Text>
                  <Text className="text-slate-700 dark:text-slate-200 text-xs ml-auto">{course.dormitary}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Timer size={14} color={isDark ? '#94a3b8' : '#64748b'} />
                  <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium">Duration</Text>
                  <Text className="text-slate-700 dark:text-slate-200 text-xs ml-auto">{course.duration}</Text>
                </View>

                {/* Topics */}
                {course.topics?.length > 0 && (
                  <View className="flex-row flex-wrap gap-1.5 mt-1">
                    {course.topics.map((t: string, i: number) => (
                      <View key={i} className="bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-100 dark:border-indigo-800/40 px-2.5 py-1 rounded-full">
                        <Text className="text-indigo-600 dark:text-indigo-300 text-xs font-medium">{t}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* OTP Section */}
              <View className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-700/50">
                {state.status === 'idle' && (
                  <Pressable
                    className="bg-indigo-600 dark:bg-indigo-700 py-3 rounded-xl items-center flex-row justify-center gap-2 active:opacity-80"
                    onPress={() => handleGetOtp(course._id)}
                  >
                    <KeyRound size={16} color="white" />
                    <Text className="text-white font-bold text-sm">Get Session OTP</Text>
                  </Pressable>
                )}

                {state.status === 'loading' && (
                  <View className="items-center py-3">
                    <ActivityIndicator size="small" color="#6366f1" />
                  </View>
                )}

                {state.status === 'tooEarly' && (
                  <View className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 items-center gap-2">
                    <Text className="text-amber-700 dark:text-amber-300 font-bold text-sm">
                      ⏰ Not Available Yet
                    </Text>
                    <Text className="text-amber-600 dark:text-amber-400 text-xs text-center">
                      OTP unlocks {state.minutesLeft} min{state.minutesLeft !== 1 ? 's' : ''} before session
                    </Text>
                    <Pressable
                      className="flex-row items-center gap-1 mt-1"
                      onPress={() => handleGetOtp(course._id)}
                    >
                      <RefreshCw size={12} color={isDark ? '#818cf8' : '#6366f1'} />
                      <Text className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold">Refresh</Text>
                    </Pressable>
                  </View>
                )}

                {state.status === 'available' && (
                  <View className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-xl p-4 items-center gap-1">
                    <Text className="text-indigo-500 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                      Your Session OTP
                    </Text>
                    <Text className="text-5xl font-black tracking-[0.25em] text-indigo-700 dark:text-indigo-200 my-2">
                      {state.otp}
                    </Text>
                    <Text className="text-indigo-500 dark:text-indigo-400 text-xs text-center">
                      Share this with your teacher to confirm the session
                    </Text>
                  </View>
                )}

                {state.status === 'verified' && (
                  <View className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl p-4 items-center gap-1">
                    <CheckCircle size={24} color={isDark ? '#34d399' : '#059669'} />
                    <Text className="text-emerald-700 dark:text-emerald-300 font-bold text-base mt-1">
                      Session Complete
                    </Text>
                    <Text className="text-emerald-600 dark:text-emerald-400 text-xs text-center">
                      Teacher verified your OTP. Coins transferred!
                    </Text>
                  </View>
                )}

                {state.status === 'error' && (
                  <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-3 items-center gap-2">
                    <AlertCircle size={18} color={isDark ? '#f87171' : '#dc2626'} />
                    <Text className="text-red-600 dark:text-red-400 text-xs text-center">{state.message}</Text>
                    <Pressable
                      onPress={() => setOtpStates((p) => ({ ...p, [course._id]: { status: 'idle' } }))}
                    >
                      <Text className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold underline">Try again</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
