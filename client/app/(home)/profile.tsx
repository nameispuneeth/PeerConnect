import { View, Text, Pressable, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@/constants/userContext";
import { BookOpen, ShoppingBag, ShoppingCart, Coins, Users, GraduationCap, SquareArrowRightExit } from "lucide-react-native";
import { useTheme } from "@/constants/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function Profile() {
  const router = useRouter();
  const { user } = useUser();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!user) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-slate-50 dark:bg-slate-900">
        <ActivityIndicator size="large" color="#6366f1" />
      </SafeAreaView>
    );
  }

  const StatCard = ({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) => (
    <View className="flex-1 bg-white dark:bg-slate-800 rounded-2xl p-4 items-center gap-1 border border-slate-200 dark:border-slate-700">
      {icon}
      <Text className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{value}</Text>
      <Text className="text-xs text-slate-500 dark:text-slate-400 text-center">{label}</Text>
    </View>
  );

  return (
    <SafeAreaView className="bg-slate-50 dark:bg-slate-900 flex-1">
      {/* Header Card */}
      <View className="mx-4 mt-4 mb-4 bg-indigo-600 dark:bg-indigo-800 rounded-3xl p-6">
        {/* Avatar Circle */}
        <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center mb-3">
          <Text className="text-3xl font-black text-white">
            {user.name?.[0]?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text className="text-2xl font-extrabold text-white mb-1">{user.name}</Text>
        <View className="flex-row items-center gap-3 mt-1">
          <View className="flex-row items-center gap-1">
            <Users size={13} color="rgba(255,255,255,0.75)" />
            <Text className="text-white/75 text-xs">{user.followers} followers</Text>
          </View>
          <Text className="text-white/50">·</Text>
          <Text className="text-white/75 text-xs">{user.following} following</Text>
        </View>
        {/* Coins */}
        <View className="flex-row items-center gap-1.5 mt-3 bg-white/20 self-start px-3 py-1.5 rounded-full">
          <Coins size={14} color="#fbbf24" />
          <Text className="text-yellow-300 font-bold text-sm">{user.coins} coins</Text>
        </View>
      </View>

      {/* Stats Row */}
      <View className="mx-4 flex-row gap-3 mb-5">
        <StatCard
          label="Courses Taught"
          value={user.mycourses?.filter((c: any) => c.assignedto && c.coinstransferred).length ?? 0}
          icon={<GraduationCap size={22} color={isDark ? '#a5b4fc' : '#6366f1'} />}
        />
        <StatCard
          label="Items Listed"
          value={user.mystore?.length ?? 0}
          icon={<ShoppingBag size={22} color={isDark ? '#a5b4fc' : '#6366f1'} />}
        />
      </View>

      {/* Navigation Buttons */}
      <View className="px-4 gap-3">
        <Pressable
          className="bg-indigo-600 dark:bg-indigo-700 py-4 rounded-2xl flex-row items-center justify-center gap-3 active:opacity-80"
          onPress={() => router.navigate("/(home)/mycourses")}
        >
          <View pointerEvents="none" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <BookOpen size={20} color="white" />
            <Text className="text-white text-base font-bold">My Courses</Text>
          </View>
        </Pressable>

        <Pressable
          className="bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700/50 py-4 rounded-2xl flex-row items-center justify-center gap-3 active:opacity-80"
          onPress={() => router.navigate('/(home)/mypurchases' as any)}
        >
          <View pointerEvents="none" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <ShoppingCart size={20} color={isDark ? '#a5b4fc' : '#4f46e5'} />
            <Text className="text-indigo-600 dark:text-indigo-300 text-base font-bold">My Purchased Courses</Text>
          </View>
        </Pressable>

        <Pressable
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-4 rounded-2xl flex-row items-center justify-center gap-3 active:opacity-80"
          onPress={() => router.navigate("/(home)/mystore")}
        >
          <View pointerEvents="none" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <ShoppingBag size={20} color={isDark ? '#94a3b8' : '#475569'} />
            <Text className="text-slate-700 dark:text-slate-300 text-base font-bold">My Store Items</Text>
          </View>
        </Pressable>

        <Pressable
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-4 rounded-2xl flex-row items-center justify-center gap-3 active:opacity-80"
          onPress={async () => {
            await AsyncStorage.removeItem("token");
            router.replace("/(auth)");
          }}
        >
          <View pointerEvents="none" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <SquareArrowRightExit size={20} color={isDark ? '#94a3b8' : '#475569'} />
            <Text className="text-slate-700 dark:text-slate-300 text-base font-bold">Logout</Text>
          </View>
        </Pressable>

      </View>
    </SafeAreaView>
  );
}