import { View, Text, Alert ,ScrollView} from 'react-native';
import React, { useState, useEffect } from 'react';
import { BACKEND_URI } from '@/config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';



export default function Allcourses() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const router = useRouter();

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            setError(null);
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Error', 'User not authenticated');
                router.push('/(auth)');
                return;
            }
            try {
                const response = await fetch(`${BACKEND_URI}/api/user/getallcourses`, {
                    headers: {
                        'authorization': token
                    }
                });
                const data = await response.json();
                if (response.ok) setCourses(data.courses);
                else {
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
    return (
        <ScrollView className='mt-10' contentContainerStyle={{ flexGrow: 1 }}>
            {loading && (
                    <View className='flex-1 justify-center items-center'>
                      <Text className='text-slate-600 dark:text-slate-400'>Loading courses...</Text>
                    </View>
                  )}
                  
                  {!loading && error && (
                    <View className='flex-1 justify-center items-center px-6'>
                      <Text className='text-red-600 dark:text-red-400 text-center'>{error}</Text>
                    </View>
                  )}
                    
                  {!loading && !error && courses.length === 0 && (
                    <View className='flex-1 justify-center items-center'>
                      <Text className='text-slate-600 dark:text-slate-400'>No Courses Available</Text>
                    </View>
                  )}
            {courses.map((val, idx) => (
                <View key={idx} className='border border-slate-400 dark:border-slate-600 flex flex-col mb-8 m-2 p-3 rounded-md bg-white dark:bg-slate-800 gap-2'>
                    <Text className='text-2xl font-bold mb-2 text-slate-800 dark:text-slate-100'>{val.title ?? "Untitled Course"}</Text>
                    <View className='flex flex-row'>
                        <Text className='font-bold text-slate-700 dark:text-slate-300'> Cost : </Text>
                        <Text className='text-slate-800 dark:text-slate-100'>{val.cost} Coins</Text>
                    </View>

                    <View className='flex flex-row'>
                        <Text className='font-bold text-slate-700 dark:text-slate-300'> Duration : </Text>
                        <Text className='text-slate-800 dark:text-slate-100'>{val.duration} </Text>
                    </View>

                    <View className='flex flex-row'>
                        <Text className='font-bold text-slate-700 dark:text-slate-300'> Timeslot : </Text>
                        <Text className='text-slate-800 dark:text-slate-100'>{val.timeslot} </Text>
                    </View>

                    <View className='flex flex-row'>
                        <Text className='font-bold text-slate-700 dark:text-slate-300'> Dormitary : </Text>
                        <Text className='text-slate-800 dark:text-slate-100'>{val.dormitary} </Text>
                    </View>

                    <View className='flex flex-row items-center'>
                        <Text className='font-bold text-slate-700 dark:text-slate-300'> Topics : </Text>
                        <View className='flex flex-row gap-2'>
                            {val.topics.map((val2: string, idx2: number) => (
                                <Text className='bg-slate-200 dark:bg-slate-700 p-1 rounded-md text-slate-800 dark:text-slate-100' key={idx2}>{val2}</Text>
                            ))}
                        </View>
                    </View>

                    <View className='flex flex-row items-center'>
                        <Text className='font-bold text-slate-700 dark:text-slate-300'> Status : </Text>
                        {val.assignedto ? <Text className='bg-green-400 text-white font-extrabold rounded-xl text-xs p-2'>Taught</Text> : <Text className='bg-yellow-400 text-white font-extrabold rounded-xl text-xs p-2'>Not Taught</Text>}
                    </View>

                </View>
            ))}
        </ScrollView>
    )
}   