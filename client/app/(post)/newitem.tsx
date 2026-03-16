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
    <ScrollView className="flex-1 bg-gray-200 px-5 py-6"
    contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>

      <Text className="text-2xl font-bold mb-6 text-center">
        New Store Item
      </Text>

      <TextInput
        placeholder="Item Title"
        value={title}
        onChangeText={setTitle}
        className="bg-white p-4 rounded-lg mb-4"
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
              className="absolute top-2 right-2 bg-white p-2 rounded-full"
            >
              <Trash size={18} color="red" />
            </Pressable>

          </View>
        ))
      }

      <Pressable
        onPress={pickImage}
        className="bg-white p-4 rounded-lg mb-4 items-center"
      >
        <Text className="text-gray-700 font-medium">
          Select Image
        </Text>
      </Pressable>

      <TextInput
        placeholder="Current Cost"
        keyboardType="numeric"
        value={currCost}
        onChangeText={setCurrCost}
        className="bg-white p-4 rounded-lg mb-6"
      />

      <Pressable
        onPress={handleSubmit}
        className="bg-black py-4 rounded-lg items-center"
      >
        <Text className="text-white font-semibold text-lg">
          Create Item
        </Text>
      </Pressable>

    </ScrollView>
  );
}