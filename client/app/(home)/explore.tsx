import { StyleSheet, Text, View, SafeAreaView, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal } from 'react-native';
import React, { useState } from 'react';
import { BACKEND_URI } from '@/config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/constants/ThemeContext';
import { Search, X, Filter, ChevronDown } from 'lucide-react-native';

export default function Explore() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>({ users: [], courses: [], items: [] });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'courses' | 'items'>('all');
  const [showCourseFilter, setShowCourseFilter] = useState(false);
  const [showItemFilter, setShowItemFilter] = useState(false);

  // Course filters
  const [courseFilters, setCourseFilters] = useState({
    minCost: '',
    maxCost: '',
    topic: '',
  });

  // Item filters
  const [itemFilters, setItemFilters] = useState({
    minCost: '',
    maxCost: '',
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a search query');
      return;
    }

    setLoading(true);
    setSearched(true);
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Error', 'User not authenticated');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URI}/api/user/search`, {
        method: 'POST',
        headers: {
          'authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await response.json();
      if (response.ok) {
        setSearchResults(data);
      } else {
        Alert.alert('Error', data.message || 'Search failed');
      }
    } catch (error) {
      console.error('Error searching:', error);
      Alert.alert('Error', 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = searchResults.courses?.filter((course: any) => {
    let match = true;
    if (courseFilters.minCost && course.cost < parseInt(courseFilters.minCost)) match = false;
    if (courseFilters.maxCost && course.cost > parseInt(courseFilters.maxCost)) match = false;
    if (courseFilters.topic && !course.topics?.includes(courseFilters.topic)) match = false;
    return match;
  }) || [];

  const filteredItems = searchResults.items?.filter((item: any) => {
    let match = true;
    if (itemFilters.minCost && item.currcost < parseInt(itemFilters.minCost)) match = false;
    if (itemFilters.maxCost && item.currcost > parseInt(itemFilters.maxCost)) match = false;
    return match;
  }) || [];

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 py-4 gap-3">
          <Text className={`text-2xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>Explore</Text>

          {/* Search Input */}
          <View className={`flex-row items-center gap-2 px-3 py-2 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`}>
            <Search size={18} color={isDark ? '#94a3b8' : '#64748b'} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search users, courses, items..."
              placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
              className={`flex-1 text-sm ${isDark ? 'text-slate-100' : 'text-slate-800'}`}
              onSubmitEditing={handleSearch}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <View pointerEvents="none">
                  <X size={18} color={isDark ? '#94a3b8' : '#64748b'} />
                </View>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Search Button */}
          <TouchableOpacity
            onPress={handleSearch}
            disabled={loading}
            className={`py-3 rounded-xl items-center flex-row justify-center gap-2 ${loading ? 'bg-slate-400 dark:bg-slate-600' : 'bg-indigo-600 dark:bg-indigo-700'}`}
          >
            <View pointerEvents="none" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Search size={16} color="white" />
                  <Text className="text-white font-bold text-sm">Search</Text>
                </>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Results */}
        {searched && !loading && (
          <>
            {/* Tab Switcher */}
            <View className="mx-4 mb-4 flex-row bg-slate-200 dark:bg-slate-800 rounded-lg p-1 gap-1">
              {['all', 'courses', 'items'].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab as any)}
                  className={`flex-1 py-2 rounded-md ${
                    activeTab === tab
                      ? 'bg-white dark:bg-slate-700'
                      : ''
                  }`}
                >
                  <Text className={`text-xs font-semibold text-center capitalize ${
                    activeTab === tab
                      ? 'text-indigo-600 dark:text-indigo-300'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {tab === 'all' ? 'All' : tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Users Results */}
            {(activeTab === 'all' || activeTab === 'courses') && searchResults.users?.length > 0 && (
              <View className="mx-4 mb-4">
                <Text className={`text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Users ({searchResults.users.length})</Text>
                {searchResults.users.map((user: any, idx: number) => (
                  <View key={idx} className={`p-3 rounded-lg mb-2 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                    <Text className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{user.username}</Text>
                    <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{user.followers} followers</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Courses Results */}
            {(activeTab === 'all' || activeTab === 'courses') && (
              <View className="mx-4 mb-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Courses ({filteredCourses.length})</Text>
                  <TouchableOpacity
                    onPress={() => setShowCourseFilter(!showCourseFilter)}
                    className="flex-row items-center gap-1"
                  >
                    <View pointerEvents="none" style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Filter size={14} color={isDark ? '#94a3b8' : '#64748b'} />
                      <ChevronDown size={14} color={isDark ? '#94a3b8' : '#64748b'} />
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Course Filter Modal */}
                <Modal transparent visible={showCourseFilter} animationType="fade">
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ width: '90%', maxWidth: 350, backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: 12, padding: 20 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 16, color: isDark ? '#f1f5f9' : '#0f172a' }}>Course Filters</Text>

                      <View style={{ marginBottom: 12 }}>
                        <Text style={{ marginBottom: 6, color: isDark ? '#cbd5e1' : '#334155', fontSize: 12 }}>Min Cost</Text>
                        <TextInput
                          value={courseFilters.minCost}
                          onChangeText={(val) => setCourseFilters({...courseFilters, minCost: val})}
                          placeholder="Min cost in coins"
                          keyboardType="numeric"
                          placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                          style={{
                            backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
                            color: isDark ? '#f1f5f9' : '#0f172a',
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 8,
                            fontSize: 14,
                          }}
                        />
                      </View>

                      <View style={{ marginBottom: 12 }}>
                        <Text style={{ marginBottom: 6, color: isDark ? '#cbd5e1' : '#334155', fontSize: 12 }}>Max Cost</Text>
                        <TextInput
                          value={courseFilters.maxCost}
                          onChangeText={(val) => setCourseFilters({...courseFilters, maxCost: val})}
                          placeholder="Max cost in coins"
                          keyboardType="numeric"
                          placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                          style={{
                            backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
                            color: isDark ? '#f1f5f9' : '#0f172a',
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 8,
                            fontSize: 14,
                          }}
                        />
                      </View>

                      <View style={{ flexDirection: 'row', marginTop: 16, gap: 8 }}>
                        <TouchableOpacity
                          onPress={() => {
                            setCourseFilters({ minCost: '', maxCost: '', topic: '' });
                            setShowCourseFilter(false);
                          }}
                          style={{
                            flex: 1,
                            paddingVertical: 10,
                            borderRadius: 8,
                            backgroundColor: isDark ? '#334155' : '#f1f5f9',
                          }}
                        >
                          <Text style={{ textAlign: 'center', color: isDark ? '#f1f5f9' : '#0f172a', fontWeight: '500' }}>Reset</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => setShowCourseFilter(false)}
                          style={{
                            flex: 1,
                            paddingVertical: 10,
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

                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course: any, idx: number) => (
                    <View key={idx} className={`p-3 rounded-lg mb-2 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                      <Text className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{course.title}</Text>
                      <View className="flex-row justify-between mt-1">
                        <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{course.cost} coins</Text>
                        <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{course.duration}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No courses found</Text>
                )}
              </View>
            )}

            {/* Items Results */}
            {(activeTab === 'all' || activeTab === 'items') && (
              <View className="mx-4 mb-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Items ({filteredItems.length})</Text>
                  <TouchableOpacity
                    onPress={() => setShowItemFilter(!showItemFilter)}
                    className="flex-row items-center gap-1"
                  >
                    <View pointerEvents="none" style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Filter size={14} color={isDark ? '#94a3b8' : '#64748b'} />
                      <ChevronDown size={14} color={isDark ? '#94a3b8' : '#64748b'} />
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Item Filter Modal */}
                <Modal transparent visible={showItemFilter} animationType="fade">
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ width: '90%', maxWidth: 350, backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: 12, padding: 20 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 16, color: isDark ? '#f1f5f9' : '#0f172a' }}>Item Filters</Text>

                      <View style={{ marginBottom: 12 }}>
                        <Text style={{ marginBottom: 6, color: isDark ? '#cbd5e1' : '#334155', fontSize: 12 }}>Min Cost</Text>
                        <TextInput
                          value={itemFilters.minCost}
                          onChangeText={(val) => setItemFilters({...itemFilters, minCost: val})}
                          placeholder="Min cost in coins"
                          keyboardType="numeric"
                          placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                          style={{
                            backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
                            color: isDark ? '#f1f5f9' : '#0f172a',
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 8,
                            fontSize: 14,
                          }}
                        />
                      </View>

                      <View style={{ marginBottom: 12 }}>
                        <Text style={{ marginBottom: 6, color: isDark ? '#cbd5e1' : '#334155', fontSize: 12 }}>Max Cost</Text>
                        <TextInput
                          value={itemFilters.maxCost}
                          onChangeText={(val) => setItemFilters({...itemFilters, maxCost: val})}
                          placeholder="Max cost in coins"
                          keyboardType="numeric"
                          placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                          style={{
                            backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
                            color: isDark ? '#f1f5f9' : '#0f172a',
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 8,
                            fontSize: 14,
                          }}
                        />
                      </View>

                      <View style={{ flexDirection: 'row', marginTop: 16, gap: 8 }}>
                        <TouchableOpacity
                          onPress={() => {
                            setItemFilters({ minCost: '', maxCost: '' });
                            setShowItemFilter(false);
                          }}
                          style={{
                            flex: 1,
                            paddingVertical: 10,
                            borderRadius: 8,
                            backgroundColor: isDark ? '#334155' : '#f1f5f9',
                          }}
                        >
                          <Text style={{ textAlign: 'center', color: isDark ? '#f1f5f9' : '#0f172a', fontWeight: '500' }}>Reset</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => setShowItemFilter(false)}
                          style={{
                            flex: 1,
                            paddingVertical: 10,
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

                {filteredItems.length > 0 ? (
                  filteredItems.map((item: any, idx: number) => (
                    <View key={idx} className={`p-3 rounded-lg mb-2 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                      <Text className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{item.title}</Text>
                      <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.currcost} coins</Text>
                    </View>
                  ))
                ) : (
                  <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No items found</Text>
                )}
              </View>
            )}
          </>
        )}

        {/* No Search Yet */}
        {!searched && (
          <View className="mx-4 mt-8 items-center">
            <Search size={40} color={isDark ? '#64748b' : '#94a3b8'} />
            <Text className={`text-sm mt-3 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Search for users, courses, or items
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({})
