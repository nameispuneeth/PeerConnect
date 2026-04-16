import { View, Text, Pressable, Modal } from 'react-native';
import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react-native';
import { useTheme } from '@/constants/ThemeContext';

// 30min, 1h, 1.5h ... up to 4h
const DURATION_OPTIONS = [
  '30 min',
  '1 hr',
  '1 hr 30 min',
  '2 hr',
  '2 hr 30 min',
  '3 hr',
  '3 hr 30 min',
  '4 hr',
];

interface DurationPickerProps {
  value: string;
  onChange: (v: string) => void;
}

export default function DurationPicker({ value, onChange }: DurationPickerProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [open, setOpen] = useState(false);

  return (
    <View>
      <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 ml-1">
        Duration
      </Text>

      <Pressable
        onPress={() => setOpen(true)}
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 flex-row items-center justify-between active:opacity-80"
      >
        <Text className={`text-sm ${value ? 'text-slate-800 dark:text-slate-100 font-medium' : 'text-slate-400 dark:text-slate-500'}`}>
          {value || 'Select duration'}
        </Text>
        <ChevronDown size={16} color={isDark ? '#94a3b8' : '#64748b'} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black/40 justify-center items-center px-8"
          onPress={() => setOpen(false)}
        >
          <View className="bg-white dark:bg-slate-800 rounded-2xl w-full overflow-hidden">
            <View className="px-4 pt-4 pb-2 border-b border-slate-100 dark:border-slate-700">
              <Text className="text-sm font-bold text-slate-700 dark:text-slate-200">Select Duration</Text>
            </View>
            {DURATION_OPTIONS.map((opt) => (
              <Pressable
                key={opt}
                onPress={() => { onChange(opt); setOpen(false); }}
                className="flex-row items-center justify-between px-4 py-3.5 border-b border-slate-50 dark:border-slate-700/50 active:bg-indigo-50 dark:active:bg-indigo-900/30"
              >
                <Text className="text-sm text-slate-700 dark:text-slate-200 font-medium">{opt}</Text>
                {value === opt && <Check size={16} color="#6366f1" />}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
