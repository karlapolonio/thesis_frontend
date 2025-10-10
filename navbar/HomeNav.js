import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Animated } from "react-native";
import { useUser } from "../UserContext";
import { BACKEND_URL } from "../Config";

const GOALS = {
  calories: 1000,
  protein: 1000,
  carbs: 1000,
  fat: 1000,
};

export default function HomeNav() {
  const { userId, mealRefreshCounter } = useUser();
  const [todayTotals, setTodayTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  const [animatedValues] = useState({
    calories: new Animated.Value(0),
    protein: new Animated.Value(0),
    carbs: new Animated.Value(0),
    fat: new Animated.Value(0),
  });

  useEffect(() => {
    const fetchTodayTotals = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const res = await fetch(`${BACKEND_URL}/meal/?user_id=${userId}&date=${today}`);
        const meals = await res.json();

        // Sum all totals
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

        // Animate bars
        Object.keys(totals).forEach((key) => {
          Animated.timing(animatedValues[key], {
            toValue: Math.min((totals[key] / GOALS[key]) * 100, 100),
            duration: 800,
            useNativeDriver: false,
          }).start();
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchTodayTotals();
  }, [mealRefreshCounter, userId]);

  const renderProgressBar = (label, value, goal, color, animatedValue) => {
    return (
      <View style={{ marginVertical: 12 }}>
        <Text style={styles.progressLabel}>
          {label}: {value.toFixed(0)} / {goal}
        </Text>
        <View style={styles.progressBackground}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: animatedValue.interpolate({
                  inputRange: [0, 100],
                  outputRange: ["0%", "100%"],
                }),
                backgroundColor: color,
              },
            ]}
          />
        </View>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Today's Progress</Text>

      {renderProgressBar("Calories", todayTotals.calories, GOALS.calories, "#27ae60", animatedValues.calories)}
      {renderProgressBar("Protein", todayTotals.protein, GOALS.protein, "#f39c12", animatedValues.protein)}
      {renderProgressBar("Carbs", todayTotals.carbs, GOALS.carbs, "#2980b9", animatedValues.carbs)}
      {renderProgressBar("Fat", todayTotals.fat, GOALS.fat, "#c0392b", animatedValues.fat)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 25,
    textAlign: "center",
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#333",
  },
  progressBackground: {
    width: "100%",
    height: 22,
    backgroundColor: "#e0e0e0",
    borderRadius: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 12,
  },
});
