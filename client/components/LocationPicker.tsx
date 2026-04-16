import { View, Text, Pressable, ScrollView, Modal } from 'react-native';
import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react-native';
import { useTheme } from '@/constants/ThemeContext';

// ─── Config ────────────────────────────────────────────────────────────────
const PLACES = ['BH1', 'BH2', 'Library', 'AB1', 'AB2'] as const;
type Place = typeof PLACES[number];

const FLOORS: Record<Place, string[]> = {
  BH1: ['G', 'F', 'S', 'T'],
  BH2: ['G', 'F', 'S', 'T'],
  Library: ['G', 'F'],
  AB1: ['G', 'F', 'S', 'T'],
  AB2: ['G', 'F', 'S', 'T'],
};

function getRooms(place: Place): number[] | null {
  if (place === 'Library') return null;
  const max = (place === 'BH1' || place === 'BH2') ? 200 : 24;
  return Array.from({ length: max }, (_, i) => i + 1);
}

// ─── Mini Dropdown ───────────────────────────────────────────────────────────
interface DropdownProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (v: string) => void;
  isDark: boolean;
  flex?: number;
}

function Dropdown({ label, value, options, onSelect, isDark, flex = 1 }: DropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={{ flex }}
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2.5 flex-row items-center justify-between active:opacity-80"
      >
        <Text
          numberOfLines={1}
          className={`text-xs font-semibold flex-1 ${value ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`}
        >
          {value || label}
        </Text>
        <ChevronDown size={13} color={isDark ? '#94a3b8' : '#64748b'} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black/40 justify-center items-center px-8"
          onPress={() => setOpen(false)}
        >
          <View
            className="bg-white dark:bg-slate-800 rounded-2xl w-full overflow-hidden"
            style={{ maxHeight: 340 }}
          >
            <View className="px-4 pt-4 pb-2 border-b border-slate-100 dark:border-slate-700">
              <Text className="text-sm font-bold text-slate-700 dark:text-slate-200">{label}</Text>
            </View>
            <ScrollView>
              {options.map((opt) => (
                <Pressable
                  key={opt}
                  onPress={() => { onSelect(opt); setOpen(false); }}
                  className="flex-row items-center justify-between px-4 py-3.5 border-b border-slate-50 dark:border-slate-700/50 active:bg-indigo-50 dark:active:bg-indigo-900/30"
                >
                  <Text className="text-sm text-slate-700 dark:text-slate-200 font-medium">{opt}</Text>
                  {value === opt && <Check size={16} color="#6366f1" />}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

// ─── LocationPicker ──────────────────────────────────────────────────────────
interface LocationPickerProps {
  value: string;
  onChange: (location: string) => void;
}

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [place, setPlace] = useState<Place | ''>('');
  const [floor, setFloor] = useState('');
  const [room, setRoom] = useState('');

  const build = (p: Place | '', f: string, r: string) => {
    if (!p) return '';
    if (p === 'Library') return f ? `${p} – ${f} Floor` : p;
    if (p && f && r) return `${p} – ${f} Floor – Room ${r}`;
    return '';
  };

  const handlePlace = (p: string) => {
    const pl = p as Place;
    setPlace(pl);
    setFloor('');
    setRoom('');
    onChange('');
  };

  const handleFloor = (f: string) => {
    setFloor(f);
    setRoom('');
    const pl = place as Place;
    if (pl === 'Library') {
      const loc = `${pl} – ${f} Floor`;
      onChange(loc);
    } else {
      onChange('');
    }
  };

  const handleRoom = (r: string) => {
    setRoom(r);
    const loc = build(place, floor, r);
    onChange(loc);
  };

  const floors = place ? FLOORS[place as Place] : [];
  const rooms = place && place !== 'Library' ? (getRooms(place as Place) ?? []) : [];
  const showFloor = !!place;
  const showRoom = !!floor && place !== 'Library';

  return (
    <View>
      <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 ml-1">
        Location
      </Text>

      {/* Dropdowns row */}
      <View className="flex-row gap-2">
        {/* Place */}
        <Dropdown
          label="Place"
          value={place}
          options={[...PLACES]}
          onSelect={handlePlace}
          isDark={isDark}
          flex={1.4}
        />

        {/* Floor — reveal after place */}
        {showFloor && (
          <Dropdown
            label="Floor"
            value={floor ? `${floor}` : ''}
            options={floors.map(f => `${f} Floor`)}
            onSelect={(v) => handleFloor(v.replace(' Floor', ''))}
            isDark={isDark}
            flex={1}
          />
        )}

        {/* Room — reveal after floor (not for library) */}
        {showRoom && (
          <Dropdown
            label="Room"
            value={room ? `${room}` : ''}
            options={rooms.map(r => String(r))}
            onSelect={handleRoom}
            isDark={isDark}
            flex={1}
          />
        )}
      </View>

      {/* Preview */}
      {value ? (
        <Text className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold mt-1.5 ml-1">
          {value}
        </Text>
      ) : place ? (
        <Text className="text-slate-400 dark:text-slate-500 text-xs mt-1.5 ml-1">
          {!floor ? 'Select floor →' : !room ? 'Select room →' : ''}
        </Text>
      ) : null}
    </View>
  );
}
