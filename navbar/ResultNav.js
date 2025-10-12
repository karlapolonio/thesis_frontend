import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import styles from "../styles/ResultStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "../UserContext";

export default function ResultNav({ photoUri, userId, BACKEND_URL, API_KEY }) {
  const API_PREDICT_URL = `${BACKEND_URL}/predict/food`;
  const [predictions, setPredictions] = useState([]);
  const [segmentedImage, setSegmentedImage] = useState(null);
  const [servings, setServings] = useState([]);
  const [loading, setLoading] = useState(false);
  const { setMealRefreshCounter } = useUser();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!photoUri) return;

    const sendPhotoToAPI = async () => {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("file", {
          uri: Platform.OS === "ios" ? photoUri.replace("file://", "") : photoUri,
          name: "photo.jpg",
          type: "image/jpeg",
        });

        const response = await axios.post(API_PREDICT_URL, formData, {
          headers: { "Content-Type": "multipart/form-data",
                     "x-api-key": API_KEY
          },
        });

        const { predictions: preds, image } = response.data;
        setPredictions(preds || []);
        setSegmentedImage(image || null);
        setServings(preds.map((p) => p?.nutrition?.serving_weight_grams || 0));
      } catch (error) {
        console.error(error.response || error.message);
        Alert.alert("Error", "Failed to get predictions from server.");
      } finally {
        setLoading(false);
      }
    };

    sendPhotoToAPI();
  }, [photoUri]);

  const totals = useMemo(() => {
    return predictions.reduce(
      (acc, item, idx) => {
        const base = Number(item?.nutrition?.serving_weight_grams) || 0;
        const serving = Number(servings[idx]) || 0;
        const factor = base === 0 ? 0 : serving / base;

        acc.calories += (Number(item?.nutrition?.calories) || 0) * factor;
        acc.protein += (Number(item?.nutrition?.protein) || 0) * factor;
        acc.carbs += (Number(item?.nutrition?.carbs) || 0) * factor;
        acc.fat += (Number(item?.nutrition?.fat) || 0) * factor;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [predictions, servings]);

  const updateServing = (index, text) => {
    const num = Number(text) || 0;
    setServings((prev) => {
      const next = [...prev];
      next[index] = num;
      return next;
    });
  };

  const saveMealAndFoods = async () => {
    try {
      setSaving(true); // start spinner
      const now = new Date();
      const localISOTime = new Date(
        now.getTime() - now.getTimezoneOffset() * 60000
      ).toISOString();

      const mealResponse = await axios.post(`${BACKEND_URL}/meal/`, {
        user_id: userId,
        total_calories: totals.calories,
        total_protein: totals.protein,
        total_carbs: totals.carbs,
        total_fat: totals.fat,
        created_at: localISOTime,
      }, {
        headers: { "x-api-key": API_KEY },
      });

      const mealId = mealResponse.data.id;

      const foodsPayload = predictions.map((item, index) => {
        const baseServing = Number(item?.nutrition?.serving_weight_grams) || 0;
        const serving = Number(servings[index]) || 0;
        const factor = baseServing === 0 ? 0 : serving / baseServing;

        return {
          food_name: item.label,
          serving_size_grams: Number(serving),
          calories: Number((item.nutrition.calories * factor).toFixed(1)),
          protein: Number((item.nutrition.protein * factor).toFixed(1)),
          carbs: Number((item.nutrition.carbs * factor).toFixed(1)),
          fat: Number((item.nutrition.fat * factor).toFixed(1)),
        };
      });

      await axios.post(`${BACKEND_URL}/log_food/`, {
        user_id: userId,
        meal_id: mealId,
        foods: foodsPayload,
      }, {
        headers: { "x-api-key": API_KEY },
      });

      // Show spinner for 1 second before stopping
      setTimeout(() => {
        setSaving(false);
        Alert.alert("Success", "Meal and food logs saved successfully!");
        triggerMealRefresh();
      }, 1000);

    } catch (error) {
      console.error(error.response || error.message);
      setSaving(false);
      Alert.alert("Error", "Failed to save meal or food logs.");
    }
  };

  const triggerMealRefresh = () => {
    setMealRefreshCounter(prev => prev + 1);
  };

  if (!photoUri) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Please capture an image first.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="green" />
        <Text style={{ marginTop: 10, color: "green" }}>Processing image</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.section}>
            <Text style={styles.title}>Captured Image</Text>
            <Image source={{ uri: photoUri }} style={styles.image} resizeMode="contain" />
          </View>

          {predictions.length > 0 ? (
            <>
              {segmentedImage && (
                <View style={styles.section}>
                  <Text style={styles.title}>Food Recognition</Text>
                  <Image
                    source={{ uri: `data:image/jpeg;base64,${segmentedImage}` }}
                    style={styles.image}
                    resizeMode="contain"
                  />
                </View>
              )}

              {/* Nutrition Totals */}
              <View style={styles.section}>
                <Text style={styles.title}>Nutritional Analysis</Text>
                <View style={styles.totalBoxContainer}>
                  <View style={styles.totalBox}>
                    <Text style={styles.totalLabel}>Total Calories</Text>
                    <Text style={styles.totalValue}>{totals.calories.toFixed(1)} kcal</Text>
                  </View>
                  <View style={styles.totalBox}>
                    <Text style={styles.totalLabel}>Total Protein</Text>
                    <Text style={styles.totalValue}>{totals.protein.toFixed(1)} g</Text>
                  </View>
                  <View style={styles.totalBox}>
                    <Text style={styles.totalLabel}>Total Carbs</Text>
                    <Text style={styles.totalValue}>{totals.carbs.toFixed(1)} g</Text>
                  </View>
                  <View style={styles.totalBox}>
                    <Text style={styles.totalLabel}>Total Fat</Text>
                    <Text style={styles.totalValue}>{totals.fat.toFixed(1)} g</Text>
                  </View>
                </View>

                {/* Predictions List */}
                {predictions.map((item, index) => {
                  const baseServing = Number(item?.nutrition?.serving_weight_grams) || 0;
                  const serving = Number(servings[index]) || 0;
                  const factor = baseServing === 0 ? 0 : serving / baseServing;

                  const adjusted = {
                    calories: ((Number(item?.nutrition?.calories) || 0) * factor).toFixed(1),
                    protein: ((Number(item?.nutrition?.protein) || 0) * factor).toFixed(1),
                    carbs: ((Number(item?.nutrition?.carbs) || 0) * factor).toFixed(1),
                    fat: ((Number(item?.nutrition?.fat) || 0) * factor).toFixed(1),
                  };

                  return (
                    <View key={index} style={styles.predItem}>
                      <Text style={styles.predText}>{item.label}</Text>

                      <View style={styles.servingRow}>
                        <Text style={styles.nutritionText}>
                          <Text style={{ fontWeight: "bold" }}>Serving Size:</Text>
                        </Text>
                        <TextInput
                          style={styles.input}
                          value={String(servings[index] ?? "")}
                          onChangeText={(val) => updateServing(index, val)}
                          keyboardType="numeric"
                        />
                        <Text style={styles.nutritionText}>g</Text>
                      </View>

                      <View style={{ marginTop: 6 }}>
                        <Text style={styles.nutritionText}>Calories: {adjusted.calories} kcal</Text>
                        <Text style={styles.nutritionText}>Protein: {adjusted.protein} g</Text>
                        <Text style={styles.nutritionText}>Carbs: {adjusted.carbs} g</Text>
                        <Text style={styles.nutritionText}>Fat: {adjusted.fat} g</Text>
                      </View>
                    </View>
                  );
                })}

                {/* Save Meal Button */}
                <TouchableOpacity
                  style={{
                    backgroundColor: "green",
                    borderRadius: 8,
                    marginTop: 20,
                    alignItems: "center",
                    justifyContent: "center",
                    height: 50,
                    width: "50%",
                    alignSelf: "center",
                  }}
                  onPress={saveMealAndFoods}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
                      Save Meal
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={{ padding: 20, alignItems: "center" }}>
              <Text style={{ fontSize: 16, color: "#555", textAlign: "center" }}>
                No food detected. Please try capturing the image again.
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
