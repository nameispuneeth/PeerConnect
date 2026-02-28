import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import "react-native-reanimated";

export default function HomeLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "black",
        tabBarInactiveTintColor: "gray",
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
        <Tabs.Screen name="store" 
        options={{
            title: "Store",
            tabBarIcon: ({ color, size }) => <Ionicons name="bag-handle-outline" size={size} color={color} />
        }}
        />  
        <Tabs.Screen name="profile" 
        options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />
        }}
        />
        
    </Tabs>
  );
}