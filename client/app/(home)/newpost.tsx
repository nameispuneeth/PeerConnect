import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function NewPost() {
  const router=useRouter();
  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900 justify-center px-4">

      <Pressable className="bg-primary-600 py-4 rounded-md mb-6 items-center" onPress={()=>router.push("/newcourse")}>
        <Text className="text-white text-lg font-semibold">
          New Course
        </Text>
      </Pressable>

      <Pressable className="bg-primary-600 py-4 rounded-md items-center" onPress={()=>router.push("/newitem")}>
        <Text className="text-white text-lg font-semibold">
          New Store Item
        </Text>
      </Pressable>

    </View>
  );
}