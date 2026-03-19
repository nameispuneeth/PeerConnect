import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  const router=useRouter();
  return (
    <SafeAreaView className="bg-slate-50 dark:bg-slate-900 flex-1 h-screen">
      <View className="mb-3 ml-1 mt-5">
        <Text className="text-3xl ml-3 text-slate-800 dark:text-slate-100">UserName</Text>
      </View>
      <View className="flex flex-row mb-3">
        <Text className="text-lg ml-3 text-slate-600 dark:text-slate-300">10 Followers</Text>
        <Text className="text-lg ml-3 text-slate-400 dark:text-slate-500">.</Text> 
        <Text className="text-lg ml-3 text-slate-600 dark:text-slate-300">11 Following</Text>
      </View>
      <View className="flex flex-row mb-10">
        <Text className="text-lg ml-3 text-slate-600 dark:text-slate-300">10 Courses Taught</Text>
        <Text className="text-lg ml-3 text-slate-400 dark:text-slate-500">.</Text>
        <Text className="text-lg ml-3 text-slate-600 dark:text-slate-300">11 Items Sold</Text>
      </View>

    <View className="bg-slate-50 dark:bg-slate-900 px-4">
      <Pressable className="bg-primary-600 py-4 rounded-md mb-6 items-center" onPress={()=>router.navigate("/(home)/mycourses")}>
        <Text className="text-white text-lg font-semibold">
          My Courses
        </Text>
      </Pressable>

      <Pressable className="bg-primary-600 py-4 rounded-md items-center" onPress={()=>router.navigate("/(home)/mystore")}>
        <Text className="text-white text-lg font-semibold">
          My Store Items
        </Text>
      </Pressable>

    </View>
    </SafeAreaView>
  );
}