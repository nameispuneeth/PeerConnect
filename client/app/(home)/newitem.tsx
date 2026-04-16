import { View, Text, TextInput, Pressable, ScrollView, Image, Alert, ActivityIndicator, StatusBar } from "react-native";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Trash, Check, ImagePlus } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "@/constants/userContext";
import { useTheme } from "@/constants/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import LocationPicker from "@/components/LocationPicker";

export default function NewStoreItem() {
  const { setUser } = useUser();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [title, setTitle] = useState<string>("");
  const [image, setImage] = useState<string[]>([]);
  const [currCost, setCurrCost] = useState<string>("");
  const [pickup, setPickup] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async () => {
    if (image.length >= 3) {
      Alert.alert("Limit Reached", "You can only upload up to 3 images.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setImage((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (!title.trim()) return Alert.alert("Error", "Please enter an item title");
    if (!currCost || isNaN(Number(currCost)) || Number(currCost) <= 0)
      return Alert.alert("Error", "Please enter a valid starting cost");
    if (image.length === 0) return Alert.alert("Error", "Please add at least one image");
    if (!pickup) return Alert.alert("Error", "Please select a pickup location");

    setSubmitting(true);
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
        const resp = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.EXPO_PUBLIC_API_CLOUD_NAME}/image/upload`,
          { method: "POST", body: formData }
        );
        const dta = await resp.json();
        return dta.secure_url;
      });

      imgarr = await Promise.all(uploadPromises);

      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URI}/api/user/additem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "authorization": token as string,
        },
        body: JSON.stringify({
          title: title.trim(),
          images: imgarr,
          currcost: parseFloat(currCost),
          pickup,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert("✅ Item created!", "Your item is now listed.");
        setUser((prevUser) => (prevUser ? {
          ...prevUser,
          mystore: [...prevUser.mystore, {
            title: title.trim(),
            currcost: parseFloat(currCost),
            images: imgarr,
            pickup,
          }],
        } : null));
        setTitle("");
        setImage([]);
        setCurrCost("");
        setPickup("");
      } else {
        Alert.alert("Error", data.message || "Failed to create item. Please try again.");
      }
    } catch (err) {
      console.log("Error uploading images:", err);
      Alert.alert("Error", "Failed to upload images. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "bg-white dark:bg-slate-800 px-4 py-3.5 rounded-xl text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-sm";

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#0f172a' : '#f8fafc'}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 20, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="mb-6 mt-3">
          <Text className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-1">
            New Listing
          </Text>
          <Text className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
            List an Item
          </Text>
        </View>

        <View className="gap-4">
          {/* Title */}
          <View>
            <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 ml-1">Item Title</Text>
            <TextInput
              placeholder="e.g. Calculus Textbook"
              value={title}
              onChangeText={setTitle}
              className={inputClass}
              placeholderTextColor="#94a3b8"
            />
          </View>

          {/* Starting Cost */}
          <View>
            <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 ml-1">Starting Cost (Coins)</Text>
            <TextInput
              placeholder="e.g. 30"
              keyboardType="numeric"
              value={currCost}
              onChangeText={(t) => setCurrCost(t.replace(/[^0-9.]/g, ''))}
              className={inputClass}
              placeholderTextColor="#94a3b8"
            />
          </View>

          {/* Pickup Location */}
          <LocationPicker value={pickup} onChange={setPickup} />

          {/* Images */}
          <View>
            <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 ml-1">
              Photos ({image.length}/3)
            </Text>

            {image.map((data, idx) => (
              <View key={idx} className="relative mb-3">
                <Image
                  source={{ uri: data }}
                  className="w-full h-48 rounded-xl"
                  resizeMode="cover"
                />
                <Pressable
                  onPress={() => removeImage(idx)}
                  className="absolute top-2 right-2 bg-white/90 dark:bg-slate-800/90 p-2 rounded-full shadow"
                >
                  <Trash size={16} color="#ef4444" />
                </Pressable>
              </View>
            ))}

            {image.length < 3 && (
              <Pressable
                onPress={pickImage}
                className="bg-white dark:bg-slate-800 py-5 rounded-xl items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 gap-2 active:opacity-80"
              >
                <ImagePlus size={24} color={isDark ? '#64748b' : '#94a3b8'} />
                <Text className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                  {image.length === 0 ? 'Add Photos' : 'Add another photo'}
                </Text>
              </Pressable>
            )}
          </View>

          {/* Submit */}
          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            className={`py-4 rounded-2xl items-center flex-row justify-center gap-2 mt-2 active:opacity-80 ${submitting ? 'bg-slate-400 dark:bg-slate-600' : 'bg-indigo-600 dark:bg-indigo-700'}`}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Check size={18} color="white" />
            )}
            <Text className="text-white font-bold text-base">
              {submitting ? 'Creating...' : 'List Item'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}