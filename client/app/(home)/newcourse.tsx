import { View, Text, TextInput, Pressable, ScrollView, Modal } from "react-native";
import { useState } from "react";
import { BACKEND_URI } from "@/config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function NewCourse() {
  const [title, setTitle] = useState<string>("");
  const [cost, setCost] = useState<string>("");
  const [dormitary, setDormitary] = useState<string>("");
  const [topics, setTopics] = useState<string[]>([]);
  const [topicInput, setTopicInput] = useState<string>("");
  const [timeslot, setTimeslot] = useState<Date | null>(null);
  const [duration, setDuration] = useState<string>("");
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedHour, setSelectedHour] = useState<string>("12");
  const [selectedMinute, setSelectedMinute] = useState<string>("00");

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleSubmit = async() => {
    if(!timeslot || !title || !cost || !dormitary || topics.length === 0 || !duration){
      alert("Please fill all fields and select a timeslot");
      return;
    }
    const data = {
      title,
      cost: Number(cost),
      dormitary,
      topics,
      timeslot:`${formatDisplayDate(timeslot)} from ${timeslot.getHours().toString().padStart(2, '0')}:${timeslot.getMinutes().toString().padStart(2, '0')}`,
      duration
    };

    try{
      const token = await AsyncStorage.getItem("token") || "";
      const response = await fetch(`${BACKEND_URI}/api/user/addcourse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "authorization": token
        },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      console.log(result);
      if (response.ok) {
        alert("Course created successfully");
        setTitle("");
        setCost("");
        setDormitary("");
        setTopics([]);
        setTimeslot(null);
        setDuration("");
      }else{
        alert(result.message || "Failed to create course");
      }
    }catch(e){
      alert("Network Issues");
    }
  };

  const addTopic = () => {
    if (topicInput.trim()) {
      setTopics([...topics, topicInput.trim()]);
      setTopicInput("");
    }
  };

  const removeTopic = (index: number) => {
    setTopics(topics.filter((_, i) => i !== index));
  };

  const handleConfirmDateTime = () => {
    const dateTime = new Date(selectedDate);
    dateTime.setHours(parseInt(selectedHour) || 0);
    dateTime.setMinutes(parseInt(selectedMinute) || 0);
    
    if (dateTime >= new Date()) {
      setTimeslot(dateTime);
      setShowDatePicker(false);
    } else {
      alert("Please select a future date and time");
    }
  };

  

  return (
    <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900 px-5 py-6"
    contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>

      <Text className="text-2xl font-bold mb-6 text-center text-slate-800 dark:text-slate-100">
        Create Course
      </Text>

      <TextInput
        placeholder="Course Title"
        value={title}
        onChangeText={setTitle}
        className="bg-white dark:bg-slate-800 p-4 rounded-lg mb-4 text-slate-800 dark:text-slate-100 border border-gray-300 dark:border-gray-500"
        placeholderTextColor="#94a3b8"
      />

      <TextInput
        placeholder="Cost"
        value={cost}
        keyboardType="numeric"
        onChangeText={setCost}
        className="bg-white dark:bg-slate-800 p-4 rounded-lg mb-4 text-slate-800 dark:text-slate-100 border border-gray-300 dark:border-gray-500"
        placeholderTextColor="#94a3b8"
      />

      <TextInput
        placeholder="Dormitory"
        value={dormitary}
        onChangeText={setDormitary}
        className="bg-white dark:bg-slate-800 p-4 rounded-lg mb-4 text-slate-800 dark:text-slate-100 border border-gray-300 dark:border-gray-500"
        placeholderTextColor="#94a3b8"
      />

      {/* Topics Section */}
      <View className="mb-4">
        <Text className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-100">Topics</Text>
        <View className="flex-row gap-2">
          <TextInput
            placeholder="Add topic"
            value={topicInput}
            onChangeText={setTopicInput}
            className="flex-1 bg-white dark:bg-slate-800 p-3 rounded-lg text-slate-800 dark:text-slate-100 border border-gray-300 dark:border-gray-500"
            placeholderTextColor="#94a3b8"
          />
          <Pressable
            onPress={addTopic}
            className="bg-green-500 px-4 py-3 rounded-lg justify-center items-center"
          >
            <Text className="text-white font-bold text-lg">+</Text>
          </Pressable>
        </View>
        
        {/* Display Topics */}
        <View className="flex-row flex-wrap gap-2 mt-3">
          {topics.map((topic, idx) => (
            <View
              key={idx}
              className="bg-slate-200 dark:bg-slate-700 px-3 py-2 rounded-full flex-row items-center gap-2"
            >
              <Text className="text-slate-800 dark:text-slate-100 border border-gray-300 dark:border-gray-500">{topic}</Text>
              <Pressable onPress={() => removeTopic(idx)}>
                <Text className="text-slate-600 dark:text-slate-300 font-bold">✕</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </View>

      {/* Timeslot Section */}
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-100 ">Timeslot</Text>
        <Pressable
          onPress={() => setShowDatePicker(true)}
          className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-300 dark:border-gray-500"
        >
          <Text className="text-slate-600 dark:text-slate-300 text-center">
            {timeslot 
              ? `${formatDisplayDate(timeslot)} from ${timeslot.getHours().toString().padStart(2, '0')}:${timeslot.getMinutes().toString().padStart(2, '0')}`
              : "Tap to select date & time"
            }
          </Text>
        </Pressable>
      </View>

      {/* Date Time Picker Modal */}
      <Modal visible={showDatePicker} transparent animationType="slide">
        <View className="flex-1 bg-black bg-opacity-50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-2xl font-bold mb-6 text-center">Select Date & Time</Text>

            {/* Date Picker */}
            <View className="mb-6">
              <Text className="font-semibold mb-2">Date: {formatDisplayDate(selectedDate)}</Text>
              <Pressable
                className="bg-gray-100 p-4 rounded-lg mb-2"
                onPress={() => {
                  // Simple date increment buttons
                }}
              >
                <Text className="text-center text-gray-600">{selectedDate.toDateString()}</Text>
              </Pressable>
              
              {/* Date adjustment buttons */}
              <View className="flex-row gap-2 mb-4">
                <Pressable
                  className="flex-1 bg-blue-100 p-3 rounded-lg"
                  onPress={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setDate(newDate.getDate() - 1);
                    if (newDate >= new Date()) setSelectedDate(newDate);
                  }}
                >
                  <Text className="text-center text-blue-700">← Previous Day</Text>
                </Pressable>
                <Pressable
                  className="flex-1 bg-blue-100 p-3 rounded-lg"
                  onPress={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setDate(newDate.getDate() + 1);
                    setSelectedDate(newDate);
                  }}
                >
                  <Text className="text-center text-blue-700">Next Day →</Text>
                </Pressable>
              </View>
            </View>

            {/* Time Picker */}
            <View className="mb-6">
              <Text className="font-semibold mb-3">Time</Text>
              <View className="flex-row gap-4 justify-center items-center mb-4">
                <View className="flex-1">
                  <Text className="text-center text-gray-600 text-sm mb-2">Hour</Text>
                  <TextInput
                    value={selectedHour}
                    onChangeText={(text) => {
                      // Allow empty string or single/double digits
                      if (text === '') {
                        setSelectedHour('');
                      } else {
                        const num = parseInt(text);
                        if (!isNaN(num) && num >= 0 && num <= 23) {
                          setSelectedHour(text); // Don't pad while typing
                        }
                      }
                    }}
                    onBlur={() => {
                      // Pad only when user leaves the field
                      if (selectedHour && selectedHour.length === 1) {
                        setSelectedHour(selectedHour.padStart(2, '0'));
                      }
                    }}
                    placeholder="HH"
                    keyboardType="numeric"
                    maxLength={2}
                    className="bg-gray-100 p-3 rounded-lg text-center text-2xl font-bold"
                  />
                </View>
                <Text className="text-3xl font-bold">:</Text>
                <View className="flex-1">
                  <Text className="text-center text-gray-600 text-sm mb-2">Minute</Text>
                  <TextInput
                    value={selectedMinute}
                    onChangeText={(text) => {
                      // Allow empty string or single/double digits
                      if (text === '') {
                        setSelectedMinute('');
                      } else {
                        const num = parseInt(text);
                        if (!isNaN(num) && num >= 0 && num <= 59) {
                          setSelectedMinute(text); // Don't pad while typing
                        }
                      }
                    }}
                    onBlur={() => {
                      // Pad only when user leaves the field
                      if (selectedMinute && selectedMinute.length === 1) {
                        setSelectedMinute(selectedMinute.padStart(2, '0'));
                      }
                    }}
                    placeholder="MM"
                    keyboardType="numeric"
                    maxLength={2}
                    className="bg-gray-100 p-3 rounded-lg text-center text-2xl font-bold"
                  />
                </View>
              </View>

              {/* Quick time buttons */}
              <View className="flex-row flex-wrap gap-2">
                {['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'].map((time) => (
                  <Pressable
                    key={time}
                    className="flex-1 min-w-fit bg-gray-200 p-2 rounded-lg"
                    onPress={() => {
                      const [h, m] = time.split(':');
                      setSelectedHour(h);
                      setSelectedMinute(m);
                    }}
                  >
                    <Text className="text-center text-gray-700 font-semibold">{time}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3 mt-6">
              <Pressable
                className="flex-1 bg-gray-300 p-4 rounded-lg"
                onPress={() => setShowDatePicker(false)}
              >
                <Text className="text-center text-gray-700 font-semibold">Cancel</Text>
              </Pressable>
              <Pressable
                className="flex-1 bg-black p-4 rounded-lg"
                onPress={handleConfirmDateTime}
              >
                <Text className="text-center text-white font-semibold">Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <TextInput
        placeholder="Duration (e.g. 3 hours)"
        value={duration}
        onChangeText={setDuration}
        className="bg-white dark:bg-slate-800 p-4 rounded-lg mb-6 text-slate-800 dark:text-slate-100 border border-gray-300 dark:border-gray-500"
        placeholderTextColor="#94a3b8"
      />

      <Pressable
        onPress={handleSubmit}
        className="bg-primary-600 py-4 rounded-lg items-center"
      >
        <Text className="text-white font-semibold text-lg">
          Create Course
        </Text>
      </Pressable>

    </ScrollView>
  );
}