import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { useState } from "react";

export default function NewCourse() {
  const [title, setTitle] = useState<string>("");
  const [cost, setCost] = useState<string>("");
  const [dormitary, setDormitary] = useState<string>("");
  const [topics, setTopics] = useState<string>("");
  const [timeslot, setTimeslot] = useState<string>("");
  const [duration, setDuration] = useState<string>("");

  const handleSubmit = () => {
    const data = {
      title,
      cost: Number(cost),
      dormitary,
      topics: topics.split(","),
      timeslot,
      duration
    };

    console.log(data);
  };

  return (
    <ScrollView className="flex-1 bg-gray-200 px-5 py-6"
    contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>

      <Text className="text-2xl font-bold mb-6 text-center">
        Create Course
      </Text>

      <TextInput
        placeholder="Course Title"
        value={title}
        onChangeText={setTitle}
        className="bg-white p-4 rounded-lg mb-4"
      />

      <TextInput
        placeholder="Cost"
        value={cost}
        keyboardType="numeric"
        onChangeText={setCost}
        className="bg-white p-4 rounded-lg mb-4"
      />

      <TextInput
        placeholder="Dormitory"
        value={dormitary}
        onChangeText={setDormitary}
        className="bg-white p-4 rounded-lg mb-4"
      />

      <TextInput
        placeholder="Topics (comma separated)"
        value={topics}
        onChangeText={setTopics}
        className="bg-white p-4 rounded-lg mb-4"
      />

      <TextInput
        placeholder="Timeslot (YYYY-MM-DD)"
        value={timeslot}
        onChangeText={setTimeslot}
        className="bg-white p-4 rounded-lg mb-4"
      />

      <TextInput
        placeholder="Duration (e.g. 3 hours)"
        value={duration}
        onChangeText={setDuration}
        className="bg-white p-4 rounded-lg mb-6"
      />

      <Pressable
        onPress={handleSubmit}
        className="bg-black py-4 rounded-lg items-center"
      >
        <Text className="text-white font-semibold text-lg">
          Create Course
        </Text>
      </Pressable>

    </ScrollView>
  );
}