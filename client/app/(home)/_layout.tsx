import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import "react-native-reanimated";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function HomeLayout() {
  const tintColor = useThemeColor({}, 'tint');
  const inactiveColor = useThemeColor({}, 'tabIconDefault');

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tintColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: useThemeColor({}, 'background'),
          borderTopColor: useThemeColor({}, 'border'),
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
    </Tabs>
  );
}