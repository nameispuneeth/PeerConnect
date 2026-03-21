import { View, Text, TextInput, Pressable, ScrollView, Image, Alert } from "react-native";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Trash } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "@/constants/userContext";

export default function NewStoreItem() {
  const { setUser } = useUser();
  const [title, setTitle] = useState<string>("");
  const [image, setImage] = useState<string[]>([]);
  const [currCost, setCurrCost] = useState<string>("");

  const pickImage = async () => {
    if (image.length >= 3) {
      Alert.alert("You can only upload up to 3 images.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      let curruri: string = result.assets[0].uri;
      setImage((prev) => [...prev, curruri]);
    }
  };

  const removeImage = (index: Number) => {
    setImage((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    console.log("Submitting item with title:", title);
    let imgarr: string[] = [];
    try {
      const uploadPromises = image.map(async (val, idx) => {
        const formData = new FormData();
        formData.append("file", {
          uri: val,
          name: `image${idx}.jpg`,
          type: "image/jpeg",
        } as any);
        formData.append("upload_preset", process.env.EXPO_PUBLIC_API_UPLOAD_PRESET as string);
        formData.append("cloud_name", process.env.EXPO_PUBLIC_API_CLOUD_NAME as string);
        const resp = await fetch(`https://api.cloudinary.com/v1_1/${process.env.EXPO_PUBLIC_API_CLOUD_NAME}/image/upload`, {
          method: "POST",
          body: formData,
        })
        const dta = await resp.json();
        return dta.secure_url;
      })

      imgarr = await Promise.all(uploadPromises);
      console.log(imgarr);
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URI}/api/user/additem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "authorization": token as string,
        },
        body: JSON.stringify({
          title,
          images: imgarr,
          currcost: parseFloat(currCost),
        }),
      });
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        Alert.alert("Item created successfully!");
        setUser((prevUser) => (prevUser ? {
          ...prevUser,
          mystore: [...prevUser.mystore, {
            title: title,
            currcost: parseFloat(currCost),
            images: imgarr,

          }]
        } : null));
        setTitle("");
        setImage([]);
        setCurrCost("");
      } else {
        Alert.alert("Failed to create item. Please try again.");
      }
    } catch (err) {
      console.log("Error uploading images:", err);
      Alert.alert("Failed to upload images. Please try again.");
      return;
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900 px-5 py-6"
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
        <View className="mt-10 mb-10">
      <Text className="text-2xl font-bold mb-6 text-center text-slate-800 dark:text-slate-100">
        New Store Item
      </Text>

      <TextInput
        placeholder="Item Title"
        value={title}
        onChangeText={setTitle}
        className="bg-white dark:bg-slate-800 p-4 rounded-lg mb-4 text-slate-800 dark:text-slate-100 border border-gray-300 dark:border-gray-500"
        placeholderTextColor="#94a3b8"
      />

      {image.length !== 0 &&
        image.map((data, idx) => (
          <View key={idx} className="relative mb-4">

            <Image
              source={{ uri: data }}
              className="w-full h-48 rounded-lg"
            />

            <Pressable
              onPress={() => removeImage(idx)}
              className="absolute top-2 right-2 bg-slate-200 dark:bg-slate-700 p-2 rounded-full"
            >
              <Trash size={18} color="#64748b" />
            </Pressable>

          </View>
        ))
      }

      <Pressable
        onPress={pickImage}
        className="bg-white dark:bg-slate-800 p-4 rounded-lg mb-4 items-center border-2 border-dashed border-slate-400 dark:border-slate-600"
      >
        <Text className="text-slate-600 dark:text-slate-300 font-medium">
          Select Image
        </Text>
      </Pressable>

      <TextInput
        placeholder="Current Cost"
        keyboardType="numeric"
        value={currCost}
        onChangeText={setCurrCost}
        className="bg-white dark:bg-slate-800 p-4 rounded-lg mb-6 text-slate-800 dark:text-slate-100  border border-gray-300 dark:border-gray-500"
        placeholderTextColor="#94a3b8"
      />

      <Pressable
        onPress={handleSubmit}
        className="bg-primary-600 py-4 rounded-lg items-center"
      >
        <Text className="text-white font-semibold text-lg">
          Create Item
        </Text>
      </Pressable>
</View>
    </ScrollView>
  );
}