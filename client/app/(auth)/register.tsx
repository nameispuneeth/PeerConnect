import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity ,Alert} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Eye, EyeOff } from "lucide-react-native";
import { useNavigation,useRouter } from "expo-router";

export default function Login() {
  const [showpwd, setshowpwd] = useState(false);
  const [showrepwd, setshowrepwd] = useState(false);
  const [email,setemail]=useState("");
  const [username,setusername]=useState("");
  const [password,setpassword]=useState("");
  const [repassword,setrepassword]=useState("");

  const navigation=useNavigation();
  const router=useRouter();

  const handleSubmit=async()=>{
    if(!username || !email || !password || !repassword){
      Alert.alert("Fill All The Fields");
      return;
    }else if(password!==repassword){
      Alert.alert("Passwords Doesnt Match");
      return;
    }
    try{
    //   const response=await createUserWithEmailAndPassword(auth,email,password);
    //   await AsyncStorage.setItem("token",response.idToken);
    //   console.log(response);
    //   router.replace("(home)");
    }catch(e){
      console.log(e);
    }
  }
  return (
    <SafeAreaView className="flex-1 gap-16 justify-center items-center space-y-10 bg-gray-100">
      <View className="text-center">
        <Text className="text-6xl font-semibold text-left">Let's</Text>
        <Text className="text-6xl font-semibold text-left">Get Started</Text>
        <Text className="text-lg font-extralight text-left ml-3 mt-3">We're Eager To Join You</Text>
      </View>
      <View className="w-[80%]">
        <TextInput className={`border-b-2 border-black py-3 text-lg text-gray-950 mb-3 focus:outline-none`} placeholder="Username" value={username} onChangeText={text=>setusername(text)} />
        <TextInput className={`border-b-2 border-black py-3 text-lg text-gray-950 mb-3 focus:outline-none`} placeholder="Email" value={email} onChangeText={text=>setemail(text)} />
        <View className="flex-row border-b-2 border-black items-center justify-between mb-3">
          <TextInput className={`text-lg py-3 focus:outline-none`} secureTextEntry={!showpwd} autoCapitalize="none" autoCorrect={false} textContentType="password" placeholder="Password" value={password} onChangeText={text=>setpassword(text)}/>
          <TouchableOpacity onPress={() => setshowpwd(!showpwd)}>
            {showpwd ? <Eye color="black" /> : <EyeOff color="black" />}
          </TouchableOpacity>
        </View>
        <View className="flex-row border-b-2 border-black items-center justify-between mb-10">
          <TextInput className={`py-3 text-lg focus:outline-none`} secureTextEntry={!showrepwd} autoCapitalize="none" autoCorrect={false} textContentType="password" placeholder="Re-Enter Password" value={repassword} onChangeText={text=>setrepassword(text)}  />
          <TouchableOpacity onPress={() => setshowrepwd(!showrepwd)}>
            {showrepwd ? <Eye color="black" /> : <EyeOff color="black" />}
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity className=" text-center border-2 border-black bg-black text-white p-3 mt-5" onPress={()=>handleSubmit()}>
          <Text className="text-white text-center text-xl font-semibold">Register</Text>
        </TouchableOpacity>
      </View>
      <View className="flex-row items-center justify-center">
      <Text className="text-base text-gray-700 font-extralight">Already Have An Account ? </Text>
      <Text className="text-lg font-bold cursor-pointer" onPress={()=>router.replace("/(auth)")}> Login</Text>  
      </View>      
    </SafeAreaView>
  )
}