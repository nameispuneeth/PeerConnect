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

  
  const HandleSubmit=async()=>{
    if(password=="" || email==""){
      Alert.alert("Email And Password Are Required");
      return;
    }
    try{
      // const response=await signInWithEmailAndPassword(auth,email,password);
      // await AsyncStorage.setItem("token",response.idToken);
      const response=await fetch("http://192.168.1.3:8000/api/auth/login",{
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
        router.replace("/(home)");
      }else{
        Alert.alert(data.message);
      }
    }catch(e){
      Alert.alert("Network Issues");
    }
  }
  return (
    <SafeAreaView className="flex-1 gap-20 m-1 justify-center items-center space-y-10 bg-gray-100">
      <View className="text-center"> 
        <Text className="text-7xl font-semibold text-left">Hi!</Text>
        <Text className="text-7xl font-semibold text-left">Welcome</Text>
        <Text className="text-lg font-extralight text-left ml-3 mt-3">We've Been Waiting For You</Text>
      </View>
      <View className="w-[80%]">
        <TextInput className={`border-b-2 border-black py-3 text-lg text-gray-950 mb-3 focus:outline-none`} placeholder="Enter Your Email"  value={email} onChangeText={text=>setemail(text)}/>
        <View className="flex-row border-b-2 border-black items-center mb-3 justify-between">
          <TextInput className={`w-[90%] text-lg focus:outline-none`} secureTextEntry={!showpwd} autoCapitalize="none" autoCorrect={false} value={password} textContentType="password" placeholder="Enter Your Password" onChangeText={(text)=>setpassword(text)} />
          <TouchableOpacity onPress={() => setshowpwd(!showpwd)}>
            {showpwd ? <Eye color="black" /> : <EyeOff color="black" />}
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center gap-2 mt-5">
          <TouchableOpacity onPress={() => setremember(!remember)}>
            {remember ? <SquareCheck /> : <Square />}

          </TouchableOpacity>
          <Text>Remember Me</Text>
        </View>
        <TouchableOpacity className="mt-7 text-center border-2 border-black bg-black text-white p-3 text-xl font-semibold">
        <Text className="text-white text-center text-xl font-semibold" onPress={()=>HandleSubmit()}>Login</Text>
        </TouchableOpacity>
      </View>
      <View className="flex-row items-center justify-center">
      <Text className="text-base text-gray-700 font-extralight">Don't Have An Account ? </Text>
      <Text className="text-lg font-bold cursor-pointer" onPress={()=>router.replace("/register")}> Register</Text>  
      </View>   
    </SafeAreaView>
  )
}