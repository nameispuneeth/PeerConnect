import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity ,Alert} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Eye, EyeOff } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function Login() {
  const [showpwd, setshowpwd] = useState(false);
  const [showrepwd, setshowrepwd] = useState(false);
  const [email,setemail]=useState("");
  const [username,setusername]=useState("");
  const [password,setpassword]=useState("");
  const [repassword,setrepassword]=useState("");
  const backenduri=process.env.EXPO_PUBLIC_BACKEND_URI;

  const router=useRouter();

  const handleSubmit=async()=>{
    if(!username || !email || !password || !repassword){
      Alert.alert("Fill All The Fields");
      return;
    }else if(password!==repassword){
      Alert.alert("Passwords Doesn&apos;t Match");
      return;
    }
    try{
      const response=await fetch(`${backenduri}/api/auth/register`,{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },body:JSON.stringify({
          username,
          email,
          password
        })
      });
      const data=await response.json();
      if(response.ok){
        router.replace("/(auth)");
      }else{
        Alert.alert(data.message);
      }
    }catch(e){
      console.log(e);
    }
  }
  return (
    <SafeAreaView className="flex-1 justify-between items-center py-6 bg-slate-50 dark:bg-slate-900">
      <View className="text-center">
        <Text className="text-5xl font-semibold text-left text-slate-800 dark:text-slate-100">Let&apos;s</Text>
        <Text className="text-5xl font-semibold text-left text-slate-800 dark:text-slate-100">Get Started</Text>
        <Text className="text-base font-extralight text-left ml-2 mt-2 text-slate-600 dark:text-slate-300">We&apos;re Eager To Join You</Text>
      </View>
      <View className="w-[80%]">
        <TextInput className={`border-b-2 border-slate-400 dark:border-slate-600 py-3 text-lg text-slate-800 dark:text-slate-100 mb-3 focus:outline-none bg-transparent`} placeholder="Username" placeholderTextColor="#94a3b8" value={username} onChangeText={text=>setusername(text)} />
        <TextInput className={`border-b-2 border-slate-400 dark:border-slate-600 py-3 text-lg text-slate-800 dark:text-slate-100 mb-3 focus:outline-none bg-transparent`} placeholder="Email" placeholderTextColor="#94a3b8" value={email} onChangeText={text=>setemail(text)} />
        <View className="flex-row border-b-2 border-slate-400 dark:border-slate-600 items-center justify-between mb-3">
          <TextInput className={`text-lg py-3 focus:outline-none text-slate-800 dark:text-slate-100 bg-transparent`} secureTextEntry={!showpwd} autoCapitalize="none" autoCorrect={false} textContentType="password" placeholder="Password" placeholderTextColor="#94a3b8" value={password} onChangeText={text=>setpassword(text)}/>
          <TouchableOpacity onPress={() => setshowpwd(!showpwd)}>
            {showpwd ? <Eye color="#64748b" /> : <EyeOff color="#64748b" />}
          </TouchableOpacity>
        </View>
        <View className="flex-row border-b-2 border-slate-400 dark:border-slate-600 items-center justify-between mb-10">
          <TextInput className={`py-3 text-lg focus:outline-none text-slate-800 dark:text-slate-100 bg-transparent`} secureTextEntry={!showrepwd} autoCapitalize="none" autoCorrect={false} textContentType="password" placeholder="Re-Enter Password" placeholderTextColor="#94a3b8" value={repassword} onChangeText={text=>setrepassword(text)}  />
          <TouchableOpacity onPress={() => setshowrepwd(!showrepwd)}>
            {showrepwd ? <Eye color="#64748b" /> : <EyeOff color="#64748b" />}
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity className=" text-center border-2 border-primary-600 bg-primary-600 text-white p-3 rounded-lg" onPress={()=>handleSubmit()}>
          <Text className="text-white text-center text-xl font-semibold">Register</Text>
        </TouchableOpacity>
      </View>
      <View className="flex-row items-center justify-center pb-2">
      <Text className="text-base text-slate-600 dark:text-slate-300 font-extralight">Already Have An Account ? </Text>
      <Text className="text-lg font-bold text-primary-600 cursor-pointer" onPress={()=>router.replace("/(auth)")}> Login</Text>  
      </View>      
    </SafeAreaView>
  )
}