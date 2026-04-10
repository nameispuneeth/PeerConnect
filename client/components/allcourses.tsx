import { View, Text, Alert, ScrollView, Pressable, ActivityIndicator, Modal, TextInput, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { BACKEND_URI } from '@/config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useUser } from '@/constants/userContext';
import { Clock, MapPin, Timer, Tag, ShoppingCart, Coins, Filter, ChevronDown } from 'lucide-react-native';
import { useTheme } from '@/constants/ThemeContext';

function parseTimeslot(str: string): Date | null {
    try {
        const cleaned = str.replace(' from ', ' ');
        const d = new Date(cleaned);
        return isNaN(d.getTime()) ? null : d;
    } catch {
        return null;
    }
}

function isTimeslotExpired(timeslot: string): boolean {
    const d = parseTimeslot(timeslot);
    if (!d) return false;
    return d < new Date();
}


export default function Allcourses() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [buyingId, setBuyingId] = useState<string | null>(null);
    const [showFilter, setShowFilter] = useState(false);
    const [filters, setFilters] = useState({ minCost: '', maxCost: '', location: '' });


    const { user, setUser } = useUser();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            setError(null);
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Error', 'User not authenticated');
                return;
            }
            try {
                const response = await fetch(`${BACKEND_URI}/api/user/getallcourses`, {
                    headers: { 'authorization': token }
                });
                const data = await response.json();
                if (response.ok) {
                    setCourses(
                        data.courses.filter(
                            (c: any) => !c.assignedto && !isTimeslotExpired(c.timeslot)
                        )
                    );
                } else {
                    Alert.alert('Error', data.message || 'Failed to fetch courses');
                    setError(data.message || 'Failed to fetch courses');
                }
            } catch (error) {
                console.error('Error fetching courses:', error);
                setError('Failed to load courses. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center py-20">
                <ActivityIndicator size="large" color="#6366f1" />
                <Text className="text-slate-500 dark:text-slate-400 text-sm mt-3">Loading courses…</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 justify-center items-center px-8 py-20">
                <Text className="text-red-500 dark:text-red-400 text-center">{error}</Text>
            </View>
        );
    }

    if (courses.length === 0) {
        return (
            <View className="flex-1 justify-center items-center py-20 gap-3">
                <View className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 items-center justify-center">
                    <ShoppingCart size={28} color={isDark ? '#64748b' : '#94a3b8'} />
                </View>
                <Text className="text-slate-600 dark:text-slate-300 font-semibold text-base">
                    No Courses Available
                </Text>
                <Text className="text-slate-400 dark:text-slate-500 text-sm text-center">
                    Check back later for new sessions
                </Text>
            </View>
        );
    }

    const filteredCourses = courses.filter((c: any) => {
        let match = true;
        if (filters.minCost && c.cost < parseInt(filters.minCost)) match = false;
        if (filters.maxCost && c.cost > parseInt(filters.maxCost)) match = false;
        if (filters.location && c.dormitary?.toLowerCase() !== filters.location.toLowerCase()) match = false;
        return match;
    });

    return (
        <View className="flex-1">
            {/* Filter Button */}
            <View className="px-4 pt-2 pb-2 flex-row justify-between items-center">
                <Text className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {filteredCourses.length} courses found
                </Text>
                <TouchableOpacity
                    onPress={() => setShowFilter(true)}
                    className="flex-row items-center gap-1 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30"
                >
                    <View pointerEvents="none" style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Filter size={14} color={isDark ? '#a5b4fc' : '#6366f1'} />
                        <ChevronDown size={14} color={isDark ? '#a5b4fc' : '#6366f1'} />
                    </View>
                </TouchableOpacity>
            </View>

            {/* Filter Modal */}
            <Modal transparent visible={showFilter} animationType="fade">
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 20 }}>
                    <View style={{ width: '100%', maxWidth: 400, backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: 12, padding: 24 }}>
                        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16, color: isDark ? '#f1f5f9' : '#0f172a' }}>
                            Filter Courses
                        </Text>

                        <View style={{ marginBottom: 12 }}>
                            <Text style={{ marginBottom: 6, color: isDark ? '#cbd5e1' : '#334155', fontSize: 12, fontWeight: '500' }}>Min Cost (coins)</Text>
                            <TextInput
                                value={filters.minCost}
                                onChangeText={(val) => setFilters({...filters, minCost: val})}
                                placeholder="Min cost"
                                keyboardType="numeric"
                                placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                                style={{
                                    backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
                                    color: isDark ? '#f1f5f9' : '#0f172a',
                                    paddingHorizontal: 12,
                                    paddingVertical: 10,
                                    borderRadius: 8,
                                    fontSize: 14,
                                }}
                            />
                        </View>

                        <View style={{ marginBottom: 12 }}>
                            <Text style={{ marginBottom: 6, color: isDark ? '#cbd5e1' : '#334155', fontSize: 12, fontWeight: '500' }}>Max Cost (coins)</Text>
                            <TextInput
                                value={filters.maxCost}
                                onChangeText={(val) => setFilters({...filters, maxCost: val})}
                                placeholder="Max cost"
                                keyboardType="numeric"
                                placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                                style={{
                                    backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
                                    color: isDark ? '#f1f5f9' : '#0f172a',
                                    paddingHorizontal: 12,
                                    paddingVertical: 10,
                                    borderRadius: 8,
                                    fontSize: 14,
                                }}
                            />
                        </View>

                        <View style={{ marginBottom: 16 }}>
                            <Text style={{ marginBottom: 6, color: isDark ? '#cbd5e1' : '#334155', fontSize: 12, fontWeight: '500' }}>Location</Text>
                            <TextInput
                                value={filters.location}
                                onChangeText={(val) => setFilters({...filters, location: val})}
                                placeholder="e.g., Dorm A"
                                placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                                style={{
                                    backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
                                    color: isDark ? '#f1f5f9' : '#0f172a',
                                    paddingHorizontal: 12,
                                    paddingVertical: 10,
                                    borderRadius: 8,
                                    fontSize: 14,
                                }}
                            />
                        </View>

                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <TouchableOpacity
                                onPress={() => {
                                    setFilters({ minCost: '', maxCost: '', location: '' });
                                    setShowFilter(false);
                                }}
                                style={{
                                    flex: 1,
                                    paddingVertical: 12,
                                    borderRadius: 8,
                                    backgroundColor: isDark ? '#334155' : '#f1f5f9',
                                }}
                            >
                                <Text style={{ textAlign: 'center', color: isDark ? '#f1f5f9' : '#0f172a', fontWeight: '600' }}>Reset</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setShowFilter(false)}
                                style={{
                                    flex: 1,
                                    paddingVertical: 12,
                                    borderRadius: 8,
                                    backgroundColor: '#4f46e5',
                                }}
                            >
                                <Text style={{ textAlign: 'center', color: '#fff', fontWeight: '600' }}>Done</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Courses List */}
            {filteredCourses.length > 0 ? (
                <ScrollView
                    contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 16, paddingTop: 4 }}
                    showsVerticalScrollIndicator={false}
                >
                    {filteredCourses.map((val, idx) => (
                        <View
                            key={idx}
                            className="bg-white dark:bg-slate-800 rounded-2xl mb-4 overflow-hidden border border-slate-200 dark:border-slate-700"
                            style={{ boxShadow: '0px 2px 8px rgba(0,0,0,0.06)', elevation: 2 }}
                        >
                    {/* Card Header */}
                    <View className="bg-indigo-50 dark:bg-indigo-900/30 px-4 py-3 border-b border-indigo-100 dark:border-indigo-800/40">
                        <Text className="text-lg font-bold text-slate-800 dark:text-slate-100">
                            {val.title ?? 'Untitled Course'}
                        </Text>
                        <View className="flex-row items-center gap-1 mt-0.5">
                            <View className="bg-amber-400 w-2 h-2 rounded-full" />
                            <Text className="text-slate-500 dark:text-slate-400 text-xs">Available</Text>
                        </View>
                    </View>

                    {/* Details */}
                    <View className="px-4 py-3 gap-2.5">
                        <View className="flex-row items-center gap-2">
                            <Coins size={14} color={isDark ? '#fbbf24' : '#d97706'} />
                            <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium">Cost</Text>
                            <Text className="text-amber-600 dark:text-amber-400 text-xs font-bold ml-auto">
                                {val.cost} coins
                            </Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                            <Clock size={14} color={isDark ? '#94a3b8' : '#64748b'} />
                            <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium">Timeslot</Text>
                            <Text className="text-slate-700 dark:text-slate-200 text-xs ml-auto">{val.timeslot}</Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                            <Timer size={14} color={isDark ? '#94a3b8' : '#64748b'} />
                            <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium">Duration</Text>
                            <Text className="text-slate-700 dark:text-slate-200 text-xs ml-auto">{val.duration}</Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                            <MapPin size={14} color={isDark ? '#94a3b8' : '#64748b'} />
                            <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium">Location</Text>
                            <Text className="text-slate-700 dark:text-slate-200 text-xs ml-auto">{val.dormitary}</Text>
                        </View>

                        {/* Topics */}
                        {val.topics?.length > 0 && (
                            <View className="flex-row flex-wrap gap-1.5 mt-0.5">
                                {val.topics.map((t: string, i: number) => (
                                    <View
                                        key={i}
                                        className="bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-100 dark:border-indigo-800/40 px-2.5 py-1 rounded-full"
                                    >
                                        <Text className="text-indigo-600 dark:text-indigo-300 text-xs font-medium">{t}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Book Button */}
                    <View className="px-4 pb-4">
                        <Pressable
                            className={`py-3.5 rounded-xl items-center flex-row justify-center gap-2 active:opacity-80 ${
                                buyingId === val._id
                                    ? 'bg-slate-400 dark:bg-slate-600'
                                    : 'bg-indigo-600 dark:bg-indigo-700'
                            }`}
                            disabled={buyingId === val._id}
                            onPress={() => {
                                if (isTimeslotExpired(val.timeslot)) {
                                    Alert.alert('⏰ Time Slot Expired', 'This session\'s time slot has already passed.');
                                    setCourses((prev) => prev.filter((c) => c._id !== val._id));
                                    return;
                                }
                                Alert.alert(
                                    'Confirm Booking',
                                    `Book "${val.title}" for ${val.cost} coins?`,
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'Confirm',
                                            onPress: async () => {
                                                if (isTimeslotExpired(val.timeslot)) {
                                                    Alert.alert('⏰ Time Slot Expired', 'This session\'s time slot has already passed.');
                                                    setCourses((prev) => prev.filter((c) => c._id !== val._id));
                                                    return;
                                                }
                                                setBuyingId(val._id);
                                                const token = await AsyncStorage.getItem('token');
                                                try {
                                                    const res = await fetch(`${BACKEND_URI}/api/user/buycourse`, {
                                                        method: 'POST',
                                                        headers: {
                                                            'authorization': token!,
                                                            'Content-Type': 'application/json',
                                                        },
                                                        body: JSON.stringify({ courseId: val._id }),
                                                    });
                                                    const data = await res.json();
                                                    if (res.ok) {
                                                        setCourses((prev) => prev.filter((c) => c._id !== val._id));
                                                        if (user) setUser({ ...user, coins: data.coins });
                                                        Alert.alert(
                                                            '✅ Booked!',
                                                            `Successfully booked "${val.title}"!\n\n📅 ${data.timeslot}\n📍 ${data.dormitary}\n\nCoins remaining: ${data.coins}`,
                                                        );
                                                    } else {
                                                        Alert.alert('Error', data.message || 'Could not book course');
                                                    }
                                                } catch (e) {
                                                    Alert.alert('Error', 'Network error. Please try again.');
                                                } finally {
                                                    setBuyingId(null);
                                                }
                                            },
                                        },
                                    ]
                                );
                            }}
                        >
                            {buyingId === val._id ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <View pointerEvents="none" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <ShoppingCart size={16} color="white" />
                                    <Text className="text-white font-bold text-sm">Book for {val.cost} coins</Text>
                                </View>
                            )}
                        </Pressable>
                    </View>
                </View>
            ))}
        </ScrollView>
    ) : (
        <View className="flex-1 justify-center items-center py-20">
            <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                No courses match your filters
            </Text>
        </View>
    )}
        </View>
    );
}