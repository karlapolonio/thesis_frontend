import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import CalendarStrip from 'react-native-calendar-strip';
import moment from 'moment';
import { useState, useEffect } from 'react';
import { useUser } from '../UserContext';

const getLocalDateString = (date = new Date()) => {
  const localTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localTime.toISOString().split('T')[0];
};

export default function LogNav({ userId, BACKEND_URL, API_KEY }) {
  const { mealRefreshCounter, triggerMealRefresh } = useUser();
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [groupedMeals, setGroupedMeals] = useState({});
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [foodLogs, setFoodLogs] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingMeals, setLoadingMeals] = useState(false);

  useEffect(() => {
    fetchMeals(selectedDate);
  }, [selectedDate, mealRefreshCounter]);

  const fetchMeals = async (date) => {
    try {
      setLoadingMeals(true);
      const res = await fetch(`${BACKEND_URL}/meal/?user_id=${userId}&date=${date}`, {
        headers: { "x-api-key": API_KEY },
      });

      if (!res.ok) {
        setGroupedMeals({});
        return;
      }

      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        setGroupedMeals({});
        return;
      }

      const sorted = data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      const grouped = {};

      sorted.forEach((meal) => {
        const time = formatTime(meal.created_at);
        if (!grouped[time]) grouped[time] = [];
        grouped[time].push(meal);
      });

      setGroupedMeals(grouped);
    } catch (err) {
      console.error("Network or fetch error:", err);
      setGroupedMeals({});
    } finally {
      setLoadingMeals(false);
    }
  };

  const fetchFoodLogs = async (meal) => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/log_food/?user_id=${userId}&meal_id=${meal.id}`,
        { headers: { "x-api-key": API_KEY } }
      );

      if (!res.ok) {
        setFoodLogs([]);
        setSelectedMeal(meal);
        setModalVisible(true);
        return;
      }

      const data = await res.json();
      setFoodLogs(Array.isArray(data) ? data : []);
      setSelectedMeal(meal);
      setModalVisible(true);
    } catch (err) {
      console.error("Network error fetching food logs:", err);
      setFoodLogs([]);
      setSelectedMeal(meal);
      setModalVisible(true);
    }
  };

  const deleteMeal = async (mealId) => {
    Alert.alert(
      "Delete Meal",
      "Are you sure you want to delete this meal? All associated food logs will be removed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(`${BACKEND_URL}/meal/${mealId}`, {
                method: "DELETE",
                headers: { "x-api-key": API_KEY },
              });
              const data = await res.json();
              if (res.ok) {
                setModalVisible(false);
                fetchMeals(selectedDate);
                triggerMealRefresh();
              } else {
                Alert.alert("Error", data.detail || "Failed to delete meal");
              }
            } catch (err) {
              console.error("Delete meal error:", err);
              Alert.alert("Error", "Network or server error");
            }
          },
        },
      ]
    );
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const getNumberedMeals = () => {
    let counter = 1;
    const numbered = {};
    Object.keys(groupedMeals)
      .sort((a, b) => new Date(`1970-01-01T${a}`) - new Date(`1970-01-01T${b}`))
      .forEach((time) => {
        numbered[time] = groupedMeals[time].map((meal) => ({
          ...meal,
          mealNumber: counter++,
        }));
      });
    return numbered;
  };

  const numberedMeals = getNumberedMeals();
  const todayStr = getLocalDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  const formatDateTitle = (dateStr) => {
    if (dateStr === todayStr) return "Meals Today";
    if (dateStr === yesterdayStr) return "Meals Yesterday";
    return `Meals on ${new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}`;
  };

  return (
    <ScrollView style={{ flex: 1, padding: 10, backgroundColor: '#ffffff' }}>
      <Text style={styles.calendarTitle}>Log</Text>

      <CalendarStrip
        scrollable
        style={{ height: 120, paddingTop: 10, paddingBottom: 10 }}
        calendarColor="#6cd171ff"
        calendarHeaderStyle={{ color: '#2e7d32', fontSize: 16 }}
        dateNumberStyle={{ color: '#2e7d32', fontSize: 14 }}
        dateNameStyle={{ color: '#2e7d32', fontSize: 12 }}
        highlightDateNumberStyle={{ color: '#ffffff' }}
        highlightDateNameStyle={{ color: '#ffffff' }}
        selectedDate={moment(selectedDate)}
        onDateSelected={(date) => {
          const dateStr = date.format('YYYY-MM-DD');
          if (dateStr > todayStr) {
            Alert.alert('Invalid Date', 'You cannot select a future date.');
            return;
          }
          setSelectedDate(dateStr);
        }}
      />

      <Text style={styles.title}>{formatDateTitle(selectedDate)}</Text>

      {loadingMeals ? (
        <View style={{ marginTop: 30, alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#27ae60" />
        </View>
      ) : Object.keys(numberedMeals).length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No meals recorded for this day.</Text>
        </View>
      ) : (
        Object.keys(numberedMeals).map((time) => (
          <View key={time} style={{ marginBottom: 15 }}>
            <Text style={styles.timeHeader}>{time}</Text>
            {numberedMeals[time].map((meal) => (
              <TouchableOpacity
                key={meal.id}
                style={styles.mealCard}
                onPress={() => fetchFoodLogs(meal)}
              >
                <View style={styles.mealHeader}>
                  <Text style={styles.mealName}>
                    {meal.name || `Meal ${meal.mealNumber}`}
                  </Text>
                  <Text style={styles.mealCalories}>
                    {meal.total_calories.toFixed(1)} kcal
                  </Text>
                </View>
                <View style={styles.macrosRow}>
                  <Text style={styles.macroBadge}>{meal.total_protein.toFixed(1)}g P</Text>
                  <Text style={styles.macroBadge}>{meal.total_carbs.toFixed(1)}g C</Text>
                  <Text style={styles.macroBadge}>{meal.total_fat.toFixed(1)}g F</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))
      )}

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Food Logs for {selectedMeal?.name || `Meal ${selectedMeal?.mealNumber}`}
            </Text>

            <FlatList
              data={foodLogs}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.foodItem}>
                  <Text style={styles.foodName}>{item.food_name}</Text>
                  <Text style={styles.foodMacros}>
                    {item.calories.toFixed(1)} kcal • {item.protein.toFixed(1)}g P •{' '}
                    {item.carbs.toFixed(1)}g C • {item.fat.toFixed(1)}g F
                  </Text>
                </View>
              )}
            />

            <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>

            <Pressable
              style={[styles.closeButton, { backgroundColor: 'red', marginTop: 10 }]}
              onPress={() => deleteMeal(selectedMeal.id)}
            >
              <Text style={styles.closeText}>Delete Meal</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  calendarTitle: { fontSize: 22, fontWeight: 'bold', color: '#2e7d32', marginLeft: 10, marginTop:25, marginBottom: 15 },
  title: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  timeHeader: { fontSize: 16, fontWeight: 'bold', marginVertical: 5 },
  mealCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mealName: { fontSize: 16, fontWeight: 'bold', color: '#2e7d32' },
  mealCalories: { fontSize: 16, fontWeight: 'bold', color: '#27ae60' },
  macrosRow: { flexDirection: 'row', marginTop: 5, justifyContent: 'space-between' },
  macroBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 12,
    color: '#2e7d32',
  },
  emptyContainer: { padding: 20, alignItems: 'center', marginVertical: 20 },
  emptyText: { color: '#2e7d32', fontStyle: 'italic' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  closeButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: 'green',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeText: { color: '#fff', fontWeight: 'bold' },
  foodItem: { paddingVertical: 6, borderBottomWidth: 1, borderColor: '#eee' },
  foodName: { fontWeight: 'bold', fontSize: 14, color: '#2e7d32' },
  foodMacros: { fontSize: 12, color: '#555', marginTop: 2 },
});
