import { useEffect, useState } from "react"
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Eye, EyeOff, Square, SquareCheck } from "lucide-react-native";
import { useNavigation,useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";





export default function Index() {
  const [showpwd, setshowpwd] = useState(false);
  const [remember, setremember] = useState(false);
  const [email,setemail]=useState("");
  const [password,setpassword]=useState("");
  const router=useRouter();
  const backenduri=process.env.EXPO_PUBLIC_BACKEND_URI;

  
  const HandleSubmit=async()=>{
    if(password=="" || email==""){
      Alert.alert("Email And Password Are Required");
      return;
    }
    try{
      const response=await fetch(`${backenduri}/api/auth/login`,{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
            password,
            email
        })
      })
      const data=await response.json();
      if(response.ok){
        await AsyncStorage.setItem("token",data.token);
        router.replace("/(home)");
      }else{
        Alert.alert(data.message);
        console.log(data.message)
      }
    }catch(e){
      console.log(e);
      Alert.alert("Network Issues");
    }
  }
  
  return (
    <SafeAreaView className="flex-1 gap-20 m-1 justify-center items-center space-y-10 bg-slate-50 dark:bg-slate-900">
      <View className="text-center"> 
        <Text className="text-7xl font-semibold text-left text-slate-800 dark:text-slate-100">Hi!</Text>
        <Text className="text-7xl font-semibold text-left text-slate-800 dark:text-slate-100">Welcome</Text>
        <Text className="text-lg font-extralight text-left ml-3 mt-3 text-slate-600 dark:text-slate-300">We&apos;ve Been Waiting For You</Text>
      </View>
      <View className="w-[80%]">
        <TextInput className={`border-b-2 border-slate-400 dark:border-slate-600 py-3 text-lg text-slate-800 dark:text-slate-100 mb-3 focus:outline-none bg-transparent`} placeholder="Enter Your Email" placeholderTextColor="#94a3b8" value={email} onChangeText={text=>setemail(text)}/>
        <View className="flex-row border-b-2 border-slate-400 dark:border-slate-600 items-center mb-3 justify-between">
          <TextInput className={`w-[90%] text-lg focus:outline-none text-slate-800 dark:text-slate-100 bg-transparent`} secureTextEntry={!showpwd} autoCapitalize="none" autoCorrect={false} value={password} textContentType="password" placeholder="Enter Your Password" placeholderTextColor="#94a3b8" onChangeText={(text)=>setpassword(text)} />
          <TouchableOpacity onPress={() => setshowpwd(!showpwd)}>
            {showpwd ? <Eye color="#64748b" /> : <EyeOff color="#64748b" />}
          </TouchableOpacity>
        </View>
        <TouchableOpacity className="mt-7 text-center border-2 border-primary-600 bg-primary-600 text-white p-3 text-xl font-semibold rounded-lg" onPress={()=>HandleSubmit()}>
        <Text className="text-white text-center text-xl font-semibold">Login</Text>
        </TouchableOpacity>
      </View>
      <View className="flex-row items-center justify-center">
      <Text className="text-base text-slate-600 dark:text-slate-300 font-extralight">Don&apos;t Have An Account ? </Text>
      <Text className="text-lg font-bold text-primary-600 cursor-pointer" onPress={()=>router.replace("/register")}> Register</Text>  
      </View>   
    </SafeAreaView>
  )
}