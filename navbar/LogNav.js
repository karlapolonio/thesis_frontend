import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useState, useEffect } from 'react';
import { useUser } from '../UserContext';

export default function LogNav({userId, BACKEND_URL, API_KEY}) {
  const { mealRefreshCounter, triggerMealRefresh } = useUser();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [groupedMeals, setGroupedMeals] = useState({});
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [foodLogs, setFoodLogs] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchMeals(selectedDate);
  }, [selectedDate, mealRefreshCounter]);

  const fetchMeals = async (date) => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/meal/?user_id=${userId}&date=${date}`,
        {
          headers: {
            "x-api-key": API_KEY
          }
        }
      );
      const data = await res.json();
      const sorted = data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      const grouped = {};
      sorted.forEach((meal) => {
        const time = formatTime(meal.timestamp);
        if (!grouped[time]) grouped[time] = [];
        grouped[time].push(meal);
      });

      setGroupedMeals(grouped);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFoodLogs = async (meal) => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/log_food/?user_id=${userId}&meal_id=${meal.id}`,
        {
          headers: {
            "x-api-key": API_KEY
          },
        }
      );
      const data = await res.json();
      setFoodLogs(data);
      setSelectedMeal(meal);
      setModalVisible(true);
    } catch (err) {
      console.error(err);
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
              console.log("Deleting meal:", mealId);
              const res = await fetch(`${BACKEND_URL}/meal/${mealId}`, {
                method: "DELETE",
                headers: {
                  "x-api-key": API_KEY,
                },
              });

              const data = await res.json();
              console.log("Response data:", data);

              if (res.ok) {
                setModalVisible(false);
                fetchMeals(selectedDate);
                triggerMealRefresh();
              } else {
                console.error("Failed to delete meal:", data.detail || data);
                Alert.alert("Error", data.detail || "Failed to delete meal");
              }
            } catch (err) {
              console.error("Delete meal error:", err);
              Alert.alert("Error", "Failed to delete meal due to network or server error");
            }
          },
        },
      ]
    );
  };


  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    let hours = date.getHours();
    const minutes = date.getMinutes();
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

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <Text style={styles.calendarTitle}>Log</Text>
      <ScrollView style={{ flex: 1, padding: 10, backgroundColor: '#ffffff' }}>
        <Calendar
          current={selectedDate}
          style={{ backgroundColor: '#6cd171ff', borderRadius: 20 }}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          theme={{
            textSectionTitleColor: '#2e7d32',
            arrowColor: '#27ae60',
            monthTextColor: '#2e7d32',
            todayTextColor: '#27ae60',
          }}
          dayComponent={({ date, state }) => {
            const isSelected = date.dateString === selectedDate;
            const todayStr = new Date().toISOString().split('T')[0];
            const bgColor = isSelected ? '#27ae60' : 'transparent';
            const textColor = isSelected ? '#ffffff' : state === 'disabled' ? '#a5d6a7' : '#2e7d32';
            const fontWeight = date.dateString === todayStr ? 'bold' : '400';
            return (
              <TouchableOpacity
                style={{
                  backgroundColor: bgColor,
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginVertical: 2,
                }}
                onPress={() => setSelectedDate(date.dateString)}
              >
                <Text style={{ color: textColor, fontWeight }}>{date.day}</Text>
              </TouchableOpacity>
            );
          }}
        />

        <Text style={styles.title}>Meals on {formatDate(selectedDate)}</Text>
        {Object.keys(numberedMeals).length === 0 ? (
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
                    <Text style={styles.mealName}>{meal.name || `Meal ${meal.mealNumber}`}</Text>
                    <Text style={styles.mealCalories}>{meal.total_calories.toFixed(1)} kcal</Text>
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
                      {item.calories.toFixed(1)} kcal • {item.protein.toFixed(1)}g P • {item.carbs.toFixed(1)}g C • {item.fat.toFixed(1)}g F
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  calendarTitle: { fontSize: 22, fontWeight: 'bold', color: '#2e7d32', margin: 20 },
  container: { flex: 1 },
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
  macroBadge: { backgroundColor: '#f0f0f0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, fontSize: 12, color: '#2e7d32' },
  emptyContainer: { padding: 20, alignItems: 'center', marginVertical: 20 },
  emptyText: { color: '#2e7d32', fontStyle: 'italic' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', maxHeight: '80%', backgroundColor: '#fff', borderRadius: 10, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  closeButton: { marginTop: 15, padding: 10, backgroundColor: 'green', borderRadius: 8, alignItems: 'center' },
  closeText: { color: '#fff', fontWeight: 'bold' },
  foodItem: { paddingVertical: 6, borderBottomWidth: 1, borderColor: '#eee' },
  foodName: { fontWeight: 'bold', fontSize: 14, color: '#2e7d32' },
  foodMacros: { fontSize: 12, color: '#555', marginTop: 2 },
});
