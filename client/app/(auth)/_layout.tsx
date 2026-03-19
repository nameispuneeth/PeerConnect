import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect,useState } from "react";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RootLayout() {
  const router=useRouter();
  const [loading,setloading]=useState<Boolean>(true);
  const colorScheme = useColorScheme();
  useEffect(()=>{
    const checkauth=async()=>{
      const token=await AsyncStorage.getItem("token");
      // if(token) router.replace("/(home)");
      setloading(false);
    }
    checkauth();
  },[])
  if(loading) return null;
  
    return (
      <>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{headerShown:false}} />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </>
    );
  }
