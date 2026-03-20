import { View, Text, Pressable, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { BACKEND_URI } from "@/config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

type UserType = {
  name: string;
  followers: number;
  following: number;
  courses: number;
  items: number;
};

export default function Profile() {
  const router = useRouter();

  const [userData, setUserData] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        if (!token) {
          Alert.alert("Error", "User not authenticated");
          router.replace("/(auth)");
          return;
        }

        const response = await fetch(`${BACKEND_URI}/api/user/profile`, {
          method: "GET",
          headers: {
            "authorization": token,
          },
        });

        const text = await response.text();

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          console.error("Invalid JSON:", text);
          Alert.alert("Error", "Server error");
          return;
        }

        if (response.ok) {
          setUserData({
            name: data.user.name,
            followers: data.user.followers,
            following: data.user.following,
            courses: data.user.courses,
            items: data.user.items,
          });
        } else {
          Alert.alert("Error", data.message || "Failed to fetch");
        }
      } catch (error) {
        console.error("Error:", error);
        Alert.alert("Error", "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // 🔥 LOADING UI
  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-slate-50 dark:bg-slate-900">
        <ActivityIndicator size="large" />
        <Text className="mt-2 text-slate-600 dark:text-slate-300">
          Loading profile...
        </Text>
      </SafeAreaView>
    );
  }

  // 🔥 ERROR UI (if data still null)
  if (!userData) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text className="text-red-500">Failed to load profile</Text>
      </SafeAreaView>
    );
  }

  // ✅ MAIN UI
  return (
    <SafeAreaView className="bg-slate-50 dark:bg-slate-900 flex-1">
      <View className="mb-3 ml-1 mt-5">
        <Text className="text-3xl ml-3 text-slate-800 dark:text-slate-100">
          {userData.name}
        </Text>
      </View>

      <View className="flex flex-row mb-3">
        <Text className="text-lg ml-3 text-slate-600 dark:text-slate-300">
          {userData.followers} Followers
        </Text>
        <Text className="text-lg ml-3 text-slate-400">•</Text>
        <Text className="text-lg ml-3 text-slate-600 dark:text-slate-300">
          {userData.following} Following
        </Text>
      </View>

      <View className="flex flex-row mb-10">
        <Text className="text-lg ml-3 text-slate-600 dark:text-slate-300">
          {userData.courses} Courses Taught
        </Text>
        <Text className="text-lg ml-3 text-slate-400">•</Text>
        <Text className="text-lg ml-3 text-slate-600 dark:text-slate-300">
          {userData.items} Items Sold
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