import { Text, View, ActivityIndicator, ScrollView, TextInput, Pressable, Alert, Modal } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useUser } from '@/constants/userContext'
import { useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { BACKEND_URI } from '@/config/api'
import { Clock, MapPin, Timer, Tag, KeyRound, CheckCircle, AlertTriangle, Edit3, Users, ChevronLeft, ChevronRight } from 'lucide-react-native'
import { useTheme } from '@/constants/ThemeContext'

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

function parseTimeslot(str: string): dayjs.Dayjs | null {
  const d = dayjs(str, 'MMM D, YYYY [from] HH:mm');
  return d.isValid() ? d : null;
}

function getNowIST(): dayjs.Dayjs {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  return dayjs(new Date(utcMs + 330 * 60000));
}

function isTimeslotExpired(timeslot: string): boolean {
  const d = parseTimeslot(timeslot);
  if (!d) return false;
  return d.isBefore(getNowIST());
}

const Mycourses = () => {
  const { user, setUser } = useUser();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [otpInputs, setOtpInputs] = useState<{ [id: string]: string }>({});
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editingCourseTitle, setEditingCourseTitle] = useState<string>('');
  const [newTimeslot, setNewTimeslot] = useState('');
  const [savingTimeslot, setSavingTimeslot] = useState(false);
  const [timeslot, setTimeslot] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedHour, setSelectedHour] = useState<string>(new Date().getHours().toString());
  const [selectedMinute, setSelectedMinute] = useState<string>(new Date().getMinutes().toString());


  if (!user) return (
    <View className='flex-1 justify-center items-center bg-slate-50 dark:bg-slate-900'>
      <ActivityIndicator size="large" color="#6366f1" />
    </View>
  );

  const handleSaveTimeslot = async (courseId: string, courseTitle: string, timeslotStr?: string) => {
    const slotToSave = (timeslotStr ?? newTimeslot).trim();
    if (!slotToSave) {
      Alert.alert('Error', 'Please select a new time slot');
      return;
    }
    setSavingTimeslot(true);
    const token = await AsyncStorage.getItem('token');
    try {
      const res = await fetch(`${BACKEND_URI}/api/user/updatetimeslot`, {
        method: 'PUT',
        headers: { authorization: token!, 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, timeslot: slotToSave }),
      });
      const data = await res.json();
      if (res.ok) {
        if (user) {
          const updatedCourses = user.mycourses.map((c: any) =>
            c._id === courseId ? { ...c, timeslot: slotToSave } : c
          );
          setUser({ ...user, mycourses: updatedCourses });
        }
        setEditingCourseId(null);
        setNewTimeslot('');
        Alert.alert('✅ Updated!', `Time slot for "${courseTitle}" has been updated.`);
      } else {
        Alert.alert('Error', data.message || 'Failed to update time slot');
      }
    } catch (e) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setSavingTimeslot(false);
    }
  };
  const formatDisplayDate = (date: Date) =>
    date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const handleConfirmDateTime = () => {
    const dateTime = new Date(selectedDate);
    dateTime.setHours(parseInt(selectedHour) || 0);
    dateTime.setMinutes(parseInt(selectedMinute) || 0);
    if (dateTime >= new Date()) {
      setTimeslot(dateTime);
      const formatted = `${formatDisplayDate(dateTime)} from ${dateTime.getHours().toString().padStart(2, '0')}:${dateTime.getMinutes().toString().padStart(2, '0')}`;
      setNewTimeslot(formatted);
      if (editingCourseId) {
        handleSaveTimeslot(editingCourseId, editingCourseTitle, formatted);
      }
    } else {
      alert("Please select a future date and time");
    }
  };

  return (
    <SafeAreaView className='flex-1 bg-slate-50 dark:bg-slate-900'>
      {/* Header */}
      <View className="px-5 pt-3 pb-4">
        <Text className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-1">
          Teaching
        </Text>
        <Text className='text-2xl font-extrabold text-slate-800 dark:text-slate-100'>My Courses</Text>
      </View>
      <View className="h-px bg-slate-200 dark:bg-slate-700 mx-4 mb-3" />

      <ScrollView className='flex-1' contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16 }}>
        {user.mycourses.length === 0 && (
          <View className="flex-1 justify-center items-center mt-24 gap-3">
            <View className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 items-center justify-center">
              <Tag size={28} color={isDark ? '#64748b' : '#94a3b8'} />
            </View>
            <Text className="text-slate-500 dark:text-slate-400 text-base font-medium">
              No courses yet
            </Text>
            <Text className="text-slate-400 dark:text-slate-500 text-sm text-center">
              Create your first course from the New Post tab
            </Text>
          </View>
        )}

        {user.mycourses.map((val: any, idx: number) => {
          const expired = isTimeslotExpired(val.timeslot);
          const isUnbooked = !val.assignedto;
          const showExpiredWarning = expired && isUnbooked;
          const showExpiredBadge = expired; // show expired badge for ALL expired courses

          return (
            <View
              key={idx}
              className="bg-white dark:bg-slate-800 rounded-2xl mb-4 overflow-hidden border border-slate-200 dark:border-slate-700"
              style={{ boxShadow: '0px 2px 8px rgba(0,0,0,0.06)', elevation: 2 }}
            >
              {/* Card Header */}
              <View className={`px-4 py-3 border-b ${showExpiredBadge
                ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/40'
                : val.assignedto
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/40'
                  : 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-100 dark:border-indigo-800/40'
                }`}>
                <View className="flex-row items-start justify-between">
                  <Text className="text-lg font-bold text-slate-800 dark:text-slate-100 flex-1 mr-2">
                    {val.title ?? 'Untitled Course'}
                  </Text>
                  {/* Status Badge — Expired takes priority */}
                  {showExpiredBadge ? (
                    <View className="flex-row items-center gap-1">
                      <View className="bg-red-500 px-2.5 py-1 rounded-full">
                        <Text className="text-white text-xs font-bold">Expired</Text>
                      </View>
                      {/* Edit icon button */}
                      <Pressable
                        className="bg-red-100 dark:bg-red-900/40 p-1.5 rounded-full active:opacity-70"
                        onPress={() => { setEditingCourseId(val._id); setEditingCourseTitle(val.title ?? ''); setNewTimeslot(''); }}
                      >
                        <Edit3 size={13} color={isDark ? '#f87171' : '#dc2626'} />
                      </Pressable>
                    </View>
                  ) : val.assignedto ? (
                    <View className="bg-emerald-500 px-2.5 py-1 rounded-full">
                      <Text className="text-white text-xs font-bold">Booked</Text>
                    </View>
                  ) : (
                    <View className="bg-amber-400 px-2.5 py-1 rounded-full">
                      <Text className="text-white text-xs font-bold">Open</Text>
                    </View>
                  )}
                </View>
                <View className="flex-row items-center gap-1 mt-1">
                  <Tag size={12} color={isDark ? '#818cf8' : '#6366f1'} />
                  <Text className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                    {val.cost} coins
                  </Text>
                </View>
              </View>

              {/* Details */}
              <View className="px-4 py-3 gap-2">
                <View className="flex-row items-center gap-2">
                  <Clock size={14} color={showExpiredBadge ? (isDark ? '#f87171' : '#ef4444') : (isDark ? '#94a3b8' : '#64748b')} />
                  <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium">Timeslot</Text>
                  <Text className={`text-xs ml-auto ${showExpiredBadge ? 'text-red-500 dark:text-red-400' : 'text-slate-700 dark:text-slate-200'}`}>
                    {val.timeslot}{showExpiredBadge ? ' (Expired)' : ''}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <MapPin size={14} color={isDark ? '#94a3b8' : '#64748b'} />
                  <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium">Location</Text>
                  <Text className="text-slate-700 dark:text-slate-200 text-xs ml-auto">{val.dormitary}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Timer size={14} color={isDark ? '#94a3b8' : '#64748b'} />
                  <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium">Duration</Text>
                  <Text className="text-slate-700 dark:text-slate-200 text-xs ml-auto">{val.duration}</Text>
                </View>

                {/* Topics */}
                {val.topics?.length > 0 && (
                  <View className="flex-row flex-wrap gap-1.5 mt-1">
                    {val.topics.map((t: string, i: number) => (
                      <View
                        key={i}
                        className="bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2.5 py-1 rounded-full"
                      >
                        <Text className="text-slate-700 dark:text-slate-200 text-xs font-medium">{t}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Expired Warning — shown for ALL expired courses */}
              {showExpiredBadge && (
                <View className="mx-4 mb-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4 gap-3">
                  <View className="flex-row items-center gap-2">
                    <AlertTriangle size={18} color={isDark ? '#f87171' : '#ef4444'} />
                    <Text className="text-red-700 dark:text-red-300 font-bold text-sm flex-1">
                      {isUnbooked
                        ? 'Time slot expired — no one booked'
                        : 'Time slot has expired'}
                    </Text>
                  </View>
                  <Text className="text-red-500 dark:text-red-400 text-xs">
                    Update the time slot to reschedule this course.
                  </Text>

                  {editingCourseId === val._id ? (
                    // <View className="gap-2">
                    //   <TextInput
                    //     className="border border-red-300 dark:border-red-600 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-700 text-sm"
                    //     placeholder="e.g. Apr 10, 2026 from 15:00"
                    //     placeholderTextColor="#94a3b8"
                    //     value={newTimeslot}
                    //     onChangeText={setNewTimeslot}
                    //   />
                    //   <View className="flex-row gap-2">
                    //     <Pressable
                    //       className="flex-1 bg-red-600 py-2.5 rounded-xl items-center active:opacity-80"
                    //       disabled={savingTimeslot}
                    //       onPress={() => handleSaveTimeslot(val._id, val.title)}
                    //     >
                    //       {savingTimeslot ? (
                    //         <ActivityIndicator size="small" color="white" />
                    //       ) : (
                    //         <Text className="text-white font-bold text-sm">Save</Text>
                    //       )}
                    //     </Pressable>
                    //     <Pressable
                    //       className="flex-1 bg-slate-200 dark:bg-slate-600 py-2.5 rounded-xl items-center active:opacity-80"
                    //       onPress={() => { setEditingCourseId(null); setNewTimeslot(''); }}
                    //     >
                    //       <Text className="text-slate-700 dark:text-slate-200 font-bold text-sm">Cancel</Text>
                    //     </Pressable>
                    //   </View>
                    // </View>
                    <Modal visible={editingCourseId === val._id} transparent animationType="slide">
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
                                  if (newDate >= new Date()) setSelectedDate(newDate);
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
                            <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 ml-1">Time</Text>
                            <View className="flex-row items-center justify-center gap-3">
                              <View className="flex-1">
                                <Text className="text-center text-slate-500 dark:text-slate-400 text-xs mb-1">Hour</Text>
                                <TextInput
                                  value={selectedHour}
                                  onChangeText={(text) => {
                                    if (text === '') { setSelectedHour(''); return; }
                                    const num = parseInt(text);
                                    if (!isNaN(num) && num >= 0 && num <= 23) setSelectedHour(text);
                                  }}
                                  onBlur={() => {
                                    if (selectedHour && selectedHour.length === 1) setSelectedHour(selectedHour.padStart(2, '0'));
                                  }}
                                  placeholder="HH"
                                  keyboardType="numeric"
                                  maxLength={2}
                                  className="bg-slate-100 dark:bg-slate-700 p-3 rounded-xl text-center text-2xl font-bold text-slate-800 dark:text-slate-100"
                                />
                              </View>
                              <Text className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-4">:</Text>
                              <View className="flex-1">
                                <Text className="text-center text-slate-500 dark:text-slate-400 text-xs mb-1">Minute</Text>
                                <TextInput
                                  value={selectedMinute}
                                  onChangeText={(text) => {
                                    if (text === '') { setSelectedMinute(''); return; }
                                    const num = parseInt(text);
                                    if (!isNaN(num) && num >= 0 && num <= 59) setSelectedMinute(text);
                                  }}
                                  onBlur={() => {
                                    if (selectedMinute && selectedMinute.length === 1) setSelectedMinute(selectedMinute.padStart(2, '0'));
                                  }}
                                  placeholder="MM"
                                  keyboardType="numeric"
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
                              onPress={() => { setEditingCourseId(null); setEditingCourseTitle(''); }}
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
                  ) : (
                    <Pressable
                      className="flex-row items-center justify-center gap-2 bg-red-600 py-2.5 rounded-xl active:opacity-80"
                      onPress={() => { setEditingCourseId(val._id); setEditingCourseTitle(val.title ?? ''); setNewTimeslot(''); }}
                    >
                      <Edit3 size={14} color="white" />
                      <Text className="text-white font-bold text-sm">Edit Time Slot</Text>
                    </Pressable>
                  )}
                </View>
              )}

              {/* Student Booked Banner */}
              {val.assignedto && (
                <View className="mx-4 mb-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-3 flex-row items-center gap-2">
                  <Users size={16} color={isDark ? '#60a5fa' : '#2563eb'} />
                  <Text className="text-blue-700 dark:text-blue-300 font-semibold text-sm">A student has booked this session</Text>
                </View>
              )}

              {/* OTP Verification */}
              {val.assignedto && !val.coinstransferred && (
                <View className="px-4 pb-4 pt-0 border-t border-slate-100 dark:border-slate-700 gap-3">
                  <Text className="font-bold text-slate-700 dark:text-slate-300 text-sm mt-3">
                    Verify OTP to Claim Coins
                  </Text>
                  <TextInput
                    className="border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-700 text-base tracking-widest"
                    placeholder="Enter 6-digit OTP"
                    placeholderTextColor="#94a3b8"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otpInputs[val._id] ?? ''}
                    onChangeText={(t) => setOtpInputs((prev) => ({ ...prev, [val._id]: t }))}
                  />
                  <Pressable
                    className="bg-emerald-600 py-3.5 rounded-xl items-center flex-row justify-center gap-2 active:opacity-80"
                    disabled={verifyingId === val._id}
                    onPress={async () => {
                      const otp = otpInputs[val._id];
                      if (!otp || otp.length !== 6) {
                        Alert.alert('Error', 'Please enter the 6-digit OTP');
                        return;
                      }
                      setVerifyingId(val._id);
                      const token = await AsyncStorage.getItem('token');
                      try {
                        const res = await fetch(`${BACKEND_URI}/api/user/verifyotp`, {
                          method: 'POST',
                          headers: { authorization: token!, 'Content-Type': 'application/json' },
                          body: JSON.stringify({ courseId: val._id, otp }),
                        });
                        const data = await res.json();
                        if (res.ok) {
                          if (user) setUser({ ...user, coins: data.coins });
                          val.coinstransferred = true;
                          Alert.alert('✅ Verified!', `${val.cost} coins added! New balance: ${data.coins}`);
                        } else {
                          Alert.alert('Error', data.message || 'Verification failed');
                        }
                      } catch (e) {
                        Alert.alert('Error', 'Network error. Try again.');
                      } finally {
                        setVerifyingId(null);
                      }
                    }}
                  >
                    {verifyingId === val._id ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <>
                        <KeyRound size={16} color="white" />
                        <Text className="text-white font-bold">Submit OTP & Claim</Text>
                      </>
                    )}
                  </Pressable>
                </View>
              )}

              {/* Already claimed */}
              {val.assignedto && val.coinstransferred && (
                <View className="mx-4 mb-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl p-3 flex-row items-center justify-center gap-2">
                  <CheckCircle size={18} color={isDark ? '#34d399' : '#059669'} />
                  <Text className="text-emerald-700 dark:text-emerald-300 font-bold">Coins Claimed!</Text>
                </View>
              )}



            </View>
          );
        })}

      </ScrollView>
    </SafeAreaView>
  );
}

export default Mycourses
