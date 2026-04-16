import { View, Text, TextInput, Pressable, ScrollView, Modal, StatusBar, ActivityIndicator } from "react-native";
import { useState } from "react";
import { BACKEND_URI } from "@/config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "@/constants/userContext";
import { useTheme } from "@/constants/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { PlusCircle, X, Calendar, ChevronLeft, ChevronRight, Check } from "lucide-react-native";
import LocationPicker from "@/components/LocationPicker";
import DurationPicker from "@/components/DurationPicker";

export default function NewCourse() {
  const { setUser } = useUser();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [title, setTitle] = useState<string>("");
  const [cost, setCost] = useState<string>("");
  const [dormitary, setDormitary] = useState<string>("");
  const [topics, setTopics] = useState<string[]>([]);
  const [topicInput, setTopicInput] = useState<string>("");
  const [timeslot, setTimeslot] = useState<Date | null>(null);
  const [duration, setDuration] = useState<string>("");
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedHour, setSelectedHour] = useState<string>(new Date().getHours().toString().padStart(2, '0'));
  const [selectedMinute, setSelectedMinute] = useState<string>(new Date().getMinutes().toString().padStart(2, '0'));
  const [submitting, setSubmitting] = useState(false);

  const formatDisplayDate = (date: Date) =>
    date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const handleSubmit = async () => {
    if (submitting) return;
    if (!title.trim()) return alert("Please enter a course title");
    if (!cost || isNaN(Number(cost)) || Number(cost) <= 0) return alert("Please enter a valid coin cost");
    if (!dormitary) return alert("Please select a location");
    if (topics.length === 0) return alert("Please add at least one topic");
    if (!duration) return alert("Please select a duration");
    if (!timeslot) return alert("Please select a timeslot");

    const data = {
      title: title.trim(),
      cost: Number(cost),
      dormitary,
      topics,
      timeslot: `${formatDisplayDate(timeslot)} from ${timeslot.getHours().toString().padStart(2, '0')}:${timeslot.getMinutes().toString().padStart(2, '0')}`,
      duration,
    };
    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem("token") || "";
      const response = await fetch(`${BACKEND_URI}/api/user/addcourse`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "authorization": token },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok) {
        alert("Course created successfully!");
        setUser((prevUser) => (prevUser ? {
          ...prevUser,
          mycourses: [...prevUser.mycourses, {
            title: data.title, cost: data.cost, dormitary: data.dormitary,
            topics: data.topics, timeslot: data.timeslot, duration: data.duration,
          }],
        } : null));
        setTitle(""); setCost(""); setDormitary(""); setTopics([]); setTimeslot(null); setDuration("");
      } else {
        alert(result.message || "Failed to create course");
      }
    } catch (e) {
      alert("Network error. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const addTopic = () => {
    if (topicInput.trim()) {
      setTopics([...topics, topicInput.trim()]);
      setTopicInput("");
    }
  };

  const removeTopic = (index: number) => setTopics(topics.filter((_, i) => i !== index));

  const handleConfirmDateTime = () => {
    const h = parseInt(selectedHour);
    const m = parseInt(selectedMinute);
    if (isNaN(h) || h < 0 || h > 23) return alert("Enter a valid hour (0–23)");
    if (isNaN(m) || m < 0 || m > 59) return alert("Enter a valid minute (0–59)");
    const dateTime = new Date(selectedDate);
    dateTime.setHours(h, m, 0, 0);
    if (dateTime <= new Date()) return alert("Please select a future date and time");
    setTimeslot(dateTime);
    setShowDatePicker(false);
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
            Create Course
          </Text>
        </View>

        {/* Form Fields */}
        <View className="gap-4">
          {/* Title */}
          <View>
            <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 ml-1">Course Title</Text>
            <TextInput
              placeholder="e.g. Advanced Calculus"
              value={title}
              onChangeText={setTitle}
              className={inputClass}
              placeholderTextColor="#94a3b8"
            />
          </View>

          {/* Cost */}
          <View>
            <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 ml-1">Cost (Coins)</Text>
            <TextInput
              placeholder="e.g. 50"
              value={cost}
              keyboardType="numeric"
              onChangeText={(t) => setCost(t.replace(/[^0-9]/g, ''))}
              className={inputClass}
              placeholderTextColor="#94a3b8"
            />
          </View>

          {/* Location Picker */}
          <LocationPicker value={dormitary} onChange={setDormitary} />

          {/* Duration Picker */}
          <DurationPicker value={duration} onChange={setDuration} />

          {/* Topics */}
          <View>
            <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 ml-1">Topics</Text>
            <View className="flex-row gap-2">
              <TextInput
                placeholder="Add a topic"
                value={topicInput}
                onChangeText={setTopicInput}
                onSubmitEditing={addTopic}
                returnKeyType="done"
                className="flex-1 bg-white dark:bg-slate-800 px-4 py-3.5 rounded-xl text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-sm"
                placeholderTextColor="#94a3b8"
              />
              <Pressable
                onPress={addTopic}
                className="bg-indigo-600 px-4 rounded-xl justify-center items-center active:opacity-80"
              >
                <PlusCircle size={20} color="white" />
              </Pressable>
            </View>

            {topics.length > 0 && (
              <View className="flex-row flex-wrap gap-2 mt-3">
                {topics.map((topic, idx) => (
                  <View
                    key={idx}
                    className="bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-100 dark:border-indigo-800/60 px-3 py-1.5 rounded-full flex-row items-center gap-1.5"
                  >
                    <Text className="text-indigo-700 dark:text-indigo-300 text-sm font-medium">{topic}</Text>
                    <Pressable onPress={() => removeTopic(idx)} hitSlop={8}>
                      <X size={13} color={isDark ? '#818cf8' : '#6366f1'} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Timeslot */}
          <View>
            <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 ml-1">Timeslot</Text>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              className="bg-white dark:bg-slate-800 px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 flex-row items-center gap-3 active:opacity-80"
            >
              <Calendar size={18} color={timeslot ? (isDark ? '#a5b4fc' : '#4f46e5') : (isDark ? '#64748b' : '#94a3b8')} />
              <Text className={`text-sm ${timeslot ? 'text-slate-800 dark:text-slate-100 font-medium' : 'text-slate-400 dark:text-slate-500'}`}>
                {timeslot
                  ? `${formatDisplayDate(timeslot)} at ${timeslot.getHours().toString().padStart(2, '0')}:${timeslot.getMinutes().toString().padStart(2, '0')}`
                  : 'Tap to select date & time'}
              </Text>
            </Pressable>
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
              {submitting ? 'Creating...' : 'Create Course'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Date Time Picker Modal */}
      <Modal visible={showDatePicker} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white dark:bg-slate-800 rounded-t-3xl p-6">
            <Text className="text-xl font-extrabold text-slate-800 dark:text-slate-100 text-center mb-5">
              Select Date & Time
            </Text>

            {/* Date Picker */}
            <View className="mb-5">
              <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 ml-1">Date</Text>
              <View className="bg-slate-100 dark:bg-slate-700 rounded-xl p-4 flex-row items-center justify-between">
                <Pressable
                  className="p-2 bg-white dark:bg-slate-600 rounded-lg active:opacity-80"
                  onPress={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setDate(newDate.getDate() - 1);
                    const today = new Date(); today.setHours(0,0,0,0);
                    if (newDate >= today) setSelectedDate(newDate);
                  }}
                >
                  <ChevronLeft size={20} color={isDark ? '#94a3b8' : '#475569'} />
                </Pressable>
                <Text className="text-slate-800 dark:text-slate-100 font-bold text-base">
                  {selectedDate.toDateString()}
                </Text>
                <Pressable
                  className="p-2 bg-white dark:bg-slate-600 rounded-lg active:opacity-80"
                  onPress={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setDate(newDate.getDate() + 1);
                    setSelectedDate(newDate);
                  }}
                >
                  <ChevronRight size={20} color={isDark ? '#94a3b8' : '#475569'} />
                </Pressable>
              </View>
            </View>

            {/* Time Picker */}
            <View className="mb-5">
              <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 ml-1">Time (24 hr)</Text>
              <View className="flex-row items-center justify-center gap-3">
                <View className="flex-1">
                  <Text className="text-center text-slate-500 dark:text-slate-400 text-xs mb-1">Hour (0–23)</Text>
                  <TextInput
                    value={selectedHour}
                    onChangeText={(text) => {
                      const clean = text.replace(/[^0-9]/g, '');
                      if (clean === '') { setSelectedHour(''); return; }
                      const num = parseInt(clean);
                      if (num <= 23) setSelectedHour(clean);
                    }}
                    onBlur={() => {
                      const h = parseInt(selectedHour);
                      setSelectedHour(isNaN(h) ? '00' : h.toString().padStart(2, '0'));
                    }}
                    placeholder="HH"
                    keyboardType="number-pad"
                    maxLength={2}
                    className="bg-slate-100 dark:bg-slate-700 p-3 rounded-xl text-center text-2xl font-bold text-slate-800 dark:text-slate-100"
                  />
                </View>
                <Text className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-4">:</Text>
                <View className="flex-1">
                  <Text className="text-center text-slate-500 dark:text-slate-400 text-xs mb-1">Minute (0–59)</Text>
                  <TextInput
                    value={selectedMinute}
                    onChangeText={(text) => {
                      const clean = text.replace(/[^0-9]/g, '');
                      if (clean === '') { setSelectedMinute(''); return; }
                      const num = parseInt(clean);
                      if (num <= 59) setSelectedMinute(clean);
                    }}
                    onBlur={() => {
                      const m = parseInt(selectedMinute);
                      setSelectedMinute(isNaN(m) ? '00' : m.toString().padStart(2, '0'));
                    }}
                    placeholder="MM"
                    keyboardType="number-pad"
                    maxLength={2}
                    className="bg-slate-100 dark:bg-slate-700 p-3 rounded-xl text-center text-2xl font-bold text-slate-800 dark:text-slate-100"
                  />
                </View>
              </View>

              {/* Quick time presets */}
              <View className="flex-row flex-wrap gap-2 mt-3">
                {['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'].map((time) => (
                  <Pressable
                    key={time}
                    className="flex-1 min-w-[30%] bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-100 dark:border-indigo-800/40 py-2 rounded-xl active:opacity-70"
                    onPress={() => {
                      const [h, m] = time.split(':');
                      setSelectedHour(h);
                      setSelectedMinute(m);
                    }}
                  >
                    <Text className="text-center text-indigo-700 dark:text-indigo-300 font-semibold text-sm">{time}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <Pressable
                className="flex-1 bg-slate-200 dark:bg-slate-700 py-4 rounded-2xl active:opacity-80"
                onPress={() => setShowDatePicker(false)}
              >
                <Text className="text-center text-slate-700 dark:text-slate-300 font-bold">Cancel</Text>
              </Pressable>
              <Pressable
                className="flex-1 bg-indigo-600 py-4 rounded-2xl active:opacity-80"
                onPress={handleConfirmDateTime}
              >
                <Text className="text-center text-white font-bold">Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}