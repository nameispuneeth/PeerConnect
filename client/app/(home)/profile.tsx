import { View, Text, Pressable, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@/constants/userContext";

type UserType = {
  name: string;
  followers: number;
  following: number;
  courses: number;
  items: number;
};

export default function Profile() {
  const router = useRouter();
  const {user}=useUser();
  
if (!user) {
  return (
    <SafeAreaView className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" />
    </SafeAreaView>
  );
}

  return (
    <SafeAreaView className="bg-slate-50 dark:bg-slate-900 flex-1">
      <View className="mb-3 ml-1 mt-5">
        <Text className="text-3xl ml-3 text-slate-800 dark:text-slate-100">
          {user.name}
        </Text>
      </View>

      <View className="flex flex-row mb-3">
        <Text className="text-lg ml-3 text-slate-600 dark:text-slate-300">
          {user.followers} Followers
        </Text>
        <Text className="text-lg ml-3 text-slate-400">•</Text>
        <Text className="text-lg ml-3 text-slate-600 dark:text-slate-300">
          {user.following} Following
        </Text>
      </View>

      <View className="flex flex-row mb-10">
        <Text className="text-lg ml-3 text-slate-600 dark:text-slate-300">
          {user.mycourses.length} Courses Taught
        </Text>
        <Text className="text-lg ml-3 text-slate-400">•</Text>
        <Text className="text-lg ml-3 text-slate-600 dark:text-slate-300">
          {user.mystore.length} Items Sold
        </Text>
      </View>

      <View className="px-4">
        <Pressable
          className="bg-primary-600 py-4 rounded-md mb-6 items-center"
          onPress={() => router.navigate("/(home)/mycourses")}
        >
          <Text className="text-white text-lg font-semibold">
            My Courses
          </Text>
        </Pressable>

        <Pressable
          className="bg-primary-600 py-4 rounded-md items-center"
          onPress={() => router.navigate("/(home)/mystore")}
        >
          <Text className="text-white text-lg font-semibold">
            My Store Items
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}