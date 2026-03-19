import { View, Text, TextInput, Pressable, ScrollView, Image } from "react-native";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Trash } from "lucide-react-native";

export default function NewStoreItem() {
  const [title, setTitle] = useState<string>("");
  const [image, setImage] = useState<string[]>([]);
  const [currCost, setCurrCost] = useState<string>("");

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      let curruri:string=result.assets[0].uri;
      setImage((prev) => [...prev, curruri]);
    }
  };

  const removeImage = (index:Number) => {
    setImage((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const data = {
      title,
      image,
      currCost: Number(currCost),
    };

    console.log(data);
  };

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900 px-5 py-6"
    contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>

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

    </ScrollView>
  );
}