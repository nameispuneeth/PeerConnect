import "../../lib/fix-css-interlop"
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import "react-native-reanimated";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BACKEND_URI } from "@/config/api";
import { Alert } from "react-native";
import { useUser, UserProvider } from "@/constants/userContext";
import { useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";


function HomeLayout() {
  const { setUser } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const tintColor = useThemeColor({}, 'tint');
  const inactiveColor = useThemeColor({}, 'tabIconDefault');
  const bgColor = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "border");

  useEffect(() => {
    setLoading(true);
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Authentication Required", "Please log in to continue.");
        router.replace("/(auth)");
        return;
      }
      try {
        const response = await fetch(`${BACKEND_URI}/api/user/profile`, {
          method: "GET",
          headers: { "authorization": token }
        });
        const data = await response.json();
        if (response.ok) {
          setUser({
            name: data.user.name,
            mycourses: data.user.mycourses,
            mystore: data.user.mystore,
            coins: data.user.coins,
            boughtcourses: data.user.boughtcourses,
            boughtitems: data.user.boughtitems,
          })
        } else {
          console.error("Error fetching user profile:", data.message);
          Alert.alert("Error", "Unable to fetch user data. Please try again.");
          router.replace("/(auth)");
          return;
        }
      } catch (e) {
        console.error("Error fetching user profile:", e);
        Alert.alert("Network Error", "Unable to fetch user data. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);


  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>

    );
  }
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tintColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: bgColor,
          borderTopColor: borderColor,
        },
      }}
    >
      <Tabs.Screen name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />
        }}
      />

      <Tabs.Screen name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => <Ionicons name="compass-outline" size={size} color={color} />
        }}
      />
      <Tabs.Screen name="newpost"
        options={{
          title: "New Post",
          tabBarIcon: ({ color, size }) => <Ionicons name="add-circle-outline" size={size} color={color} />
        }}
      />
      <Tabs.Screen name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color, size }) => <Ionicons name="bag-check-outline" size={size} color={color} />
        }}
      />
      <Tabs.Screen name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />
        }}
      />

      <Tabs.Screen name="mycourses" options={{ href: null }} />
      <Tabs.Screen name="mystore" options={{ href: null }} />
      <Tabs.Screen name="newcourse" options={{ href: null }} />
      <Tabs.Screen name="newitem" options={{ href: null }} />
      <Tabs.Screen name="mypurchases" options={{ href: null }} />


    </Tabs>
  );
}

export default function Layout() {
  return (
    <UserProvider>
      <HomeLayout />
    </UserProvider>
  );
}