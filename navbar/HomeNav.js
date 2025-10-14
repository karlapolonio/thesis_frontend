import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Animated,
  Alert,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useUser } from "../UserContext";

// 🎨 Your chosen palette
const PALETTE = {
  darkGreen: "#4C763B",
  mediumGreen: "#009c31ff",
  lightGreen: "#B0CE88",
  yellow: "#d9d768ff",
};

const GOALS = { calories: 1000, protein: 1000, carbs: 1000, fat: 1000 };
const NUTRIENTS = ["calories", "protein", "carbs", "fat"];
const COLORS = {
  calories: PALETTE.darkGreen,
  protein: PALETTE.mediumGreen,
  carbs: PALETTE.lightGreen,
  fat: PALETTE.yellow,
};

const formatDate = (date) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getMonth()]} ${date.getDate()}`;
};

export default function HomeNav({ userId, BACKEND_URL, API_KEY }) {
  const { mealRefreshCounter } = useUser();
  const screenWidth = Dimensions.get("window").width - 20;

  const [todayTotals, setTodayTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [weeklyData, setWeeklyData] = useState([]);
  const [selectedNutrient, setSelectedNutrient] = useState("calories");
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [animatedValues] = useState({
    calories: new Animated.Value(0),
    protein: new Animated.Value(0),
    carbs: new Animated.Value(0),
    fat: new Animated.Value(0),
  });

  const safeNumber = (val) => (isNaN(Number(val)) ? 0 : Number(val));

  useEffect(() => {
    const fetchToday = async () => {
      try {
        const today = new Date();
        const date = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
          .toISOString()
          .split("T")[0];

        const res = await fetch(`${BACKEND_URL}/meal/?user_id=${userId}&date=${date}`, {
          headers: { "x-api-key": API_KEY },
        });
        const meals = await res.json();

        const totals = meals.reduce(
          (acc, meal) => ({
            calories: acc.calories + (meal.total_calories || 0),
            protein: acc.protein + (meal.total_protein || 0),
            carbs: acc.carbs + (meal.total_carbs || 0),
            fat: acc.fat + (meal.total_fat || 0),
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        );
        setTodayTotals(totals);

        Object.keys(totals).forEach((key) =>
          Animated.timing(animatedValues[key], {
            toValue: Math.min((totals[key] / GOALS[key]) * 100, 100),
            duration: 600,
            useNativeDriver: false,
          }).start()
        );
      } catch (err) {
        console.error(err);
      }
    };
    fetchToday();
  }, [mealRefreshCounter, userId]);

  useEffect(() => {
    const fetchWeekly = async () => {
      setLoading(true);
      try {
        const data = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const date = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
            .toISOString()
            .split("T")[0];

          const res = await fetch(`${BACKEND_URL}/meal/?user_id=${userId}&date=${date}`, {
            headers: { "x-api-key": API_KEY },
          });
          const meals = await res.json();

          const day = { calories: 0, protein: 0, carbs: 0, fat: 0 };
          meals.forEach((m) => {
            day.calories += safeNumber(m.total_calories);
            day.protein += safeNumber(m.total_protein);
            day.carbs += safeNumber(m.total_carbs);
            day.fat += safeNumber(m.total_fat);
          });
          data.push({ date: formatDate(d), ...day });
        }
        setWeeklyData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWeekly();
  }, [mealRefreshCounter, userId]);

  const renderBar = (label, value, goal, anim, color) => (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.label}>
        {label}: {value.toFixed(0)} / {goal}
      </Text>
      <View style={styles.barBackground}>
        <Animated.View
          style={[
            styles.barFill,
            {
              backgroundColor: color,
              width: anim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }),
            },
          ]}
        />
      </View>
    </View>
  );

  const formatYAxis = (y) => {
    const num = parseFloat(y);
    if (isNaN(num)) return "0";
    if (num < 1 && num > 0) return num.toFixed(2);
    return Math.round(num).toString();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: PALETTE.darkGreen }]}>Daily Summary</Text>
      {renderBar("Calories", todayTotals.calories, GOALS.calories, animatedValues.calories, COLORS.calories)}
      {renderBar("Protein", todayTotals.protein, GOALS.protein, animatedValues.protein, COLORS.protein)}
      {renderBar("Carbs", todayTotals.carbs, GOALS.carbs, animatedValues.carbs, COLORS.carbs)}
      {renderBar("Fat", todayTotals.fat, GOALS.fat, animatedValues.fat, COLORS.fat)}

      <View style={styles.header}>
        <Text style={[styles.title, { color: PALETTE.darkGreen }]}>Weekly Nutrition Overview</Text>

        <TouchableOpacity style={styles.dropdownBox} onPress={() => setModalVisible(true)}>
          <Text style={styles.dropdownText}>
            {selectedNutrient.charAt(0).toUpperCase() + selectedNutrient.slice(1)} ▼
          </Text>
        </TouchableOpacity>
      </View>


      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            {NUTRIENTS.map((n) => (
              <TouchableOpacity
                key={n}
                style={styles.modalItem}
                onPress={() => {
                  setSelectedNutrient(n);
                  setModalVisible(false);
                }}
              >
                <Text>{n.charAt(0).toUpperCase() + n.slice(1)}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ color: "red", textAlign: "center", padding: 8 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {loading ? (
        <ActivityIndicator size="large" color={PALETTE.mediumGreen} style={{ marginTop: 30 }} />
      ) : weeklyData.length > 0 ? (
        <LineChart
          data={{
            labels: weeklyData.map((d) => d.date),
            datasets: [{ data: weeklyData.map((d) => d[selectedNutrient]) }],
          }}
          width={screenWidth}
          height={280}
          fromZero={true}
          formatYLabel={formatYAxis}
          verticalLabelRotation={45}
          chartConfig={{
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            color: () => COLORS[selectedNutrient],
            labelColor: () => "#333",
            decimalPlaces: 2,
            propsForBackgroundLines: {
              stroke: "#ccc",
              strokeWidth: 1,
            },
            propsForDots: {
              r: "4",
              strokeWidth: "2",
              stroke: COLORS[selectedNutrient],
            },
          }}
          style={styles.chart}
          bezier
          onDataPointClick={({ value, index }) => {
            Alert.alert(
              selectedNutrient.charAt(0).toUpperCase() + selectedNutrient.slice(1),
              `${weeklyData[index].date}: ${value}`
            );
          }}
        />
      ) : (
        <Text style={styles.noData}>No data available</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#fff", padding: 16 },
  title: { fontSize: 18, fontWeight: "600", marginBottom: 20 },
  label: { fontSize: 14, color: "#333", marginBottom: 4 },
  barBackground: {
    height: 16,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 25,
    marginBottom: 10,
    paddingHorizontal: 5,
  },

  dropdownBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3, 
    marginTop: -15,
  },

  dropdownText: {
    color: PALETTE.mediumGreen,
    fontSize: 14,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "75%",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 10,
  },
  modalItem: {
    paddingVertical: 10,
    alignItems: "center",
  },
  chart: {
    marginVertical: 15,
    borderRadius: 10,
    marginLeft: -20,
    marginRight: 10,
  },
  noData: {
    marginTop: 30,
    textAlign: "center",
    color: "#777",
  },
});
