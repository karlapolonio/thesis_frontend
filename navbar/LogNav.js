import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
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
import styles from "../styles/LogNavStyle";

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
    <ScrollView
      style={{ flex: 1, padding: 15, backgroundColor: '#ffffffff' }}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      <Text style={styles.calendarTitle}>{moment(selectedDate).format('MMMM YYYY')}</Text>

      <CalendarStrip
        scrollable
        style={{
          height: 100,
          paddingTop: 10,
          paddingBottom: 10,
          backgroundColor: '#27ae60',
          borderRadius: 12,
          marginBottom: 20,
        }}
        calendarColor="#63b686ff"
        calendarHeaderStyle={{ color: '#ffffff', fontSize: 18, fontWeight: '600' }}
        dateNumberStyle={{ color: '#d4f1d4', fontSize: 16 }}
        dateNameStyle={{ color: '#d4f1d4', fontSize: 12 }}
        selectedDate={moment(selectedDate)}
        showMonth={false}
        iconContainer={{ flex: 0.1 }}
        highlightDateNumberStyle={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold' }}
        highlightDateNameStyle={{ color: '#ffffff', fontSize: 12, fontWeight: '600' }}
        customDatesStyles={[
          {
            startDate: moment(selectedDate),
            dateNameStyle: { color: '#ffffff', fontWeight: 'bold', fontSize: 12 },
            dateNumberStyle: { color: '#ffffff', fontWeight: 'bold', fontSize: 18 },
            containerStyle: { backgroundColor: '#145a32', borderRadius: 20 },
          },
        ]}
        onDateSelected={(date) => {
          setSelectedDate(date.format('YYYY-MM-DD'));
        }}
      />

      {/* Selected Day Title */}
      <Text style={styles.select}>{formatDateTitle(selectedDate)}</Text>

      {/* Meals List */}
      {loadingMeals ? (
        <View style={{ marginTop: 30, alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#1e7d32" />
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
              style={[styles.closeButton, { backgroundColor: '#c0392b', marginTop: 10 }]}
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