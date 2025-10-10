import { Text, TextInput, View, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Modal, Alert} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import styles from "../styles/FormStyle";
import { useUser } from "../UserContext";
import axios from "axios";
import { BACKEND_URL } from '../Config';

const API_BASE_URL = `${BACKEND_URL}/profile`;

export default function Form({ navigation }) {
  const { userId } = useUser();

  const [formData, setFormData] = useState({
    userId: userId,
    first_field: "",
    second_field: "",
    third_field: "",
    fourth_field: "",
    fifth_field: "",
  });

  const [showThirdDD, setShowThirdDD] = useState(false);
  const [showFourthDD, setShowFourthDD] = useState(false);
  const [showFifthDD, setShowFifthDD] = useState(false);

  const thirdFieldList = ["Option A", "Option B", "Option C"];
  const fourthFieldList = ["Choice 1", "Choice 2", "Choice 3"];
  const fifthFieldList = ["Yes", "No", "Maybe"];

  const handleSubmit = async () => {
    try {
      if (!userId) {
        Alert.alert("Error", "No user logged in.");
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/submit/${userId}`, formData);
      Alert.alert("Success", response.data.message);
      navigation.navigate("Main");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.response?.data?.detail || "Something went wrong");
    }
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
        style={{ flex: 1, padding: 20, backgroundColor: '#fff' }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.formTitle}>Form</Text>
            <Text style={styles.formSubtitle}>
              Form description
            </Text>
          </View>

          {/* Row 1: First & Second */}
          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Field</Text>
              <TextInput
                style={styles.input}
                value={formData.firstField}
                onChangeText={(text) => setFormData(prev => ({ ...prev, firstField: text }))}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Second Field</Text>
              <TextInput
                style={styles.input}
                value={formData.secondField}
                onChangeText={(text) => setFormData(prev => ({ ...prev, secondField: text }))}
              />
            </View>
          </View>

          {/* Row 2: Third & Fourth (dropdowns) */}
          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Third Field</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowThirdDD(true)}
              >
                <Text style={styles.dropdownButtonText}>
                  {formData.thirdField}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fourth Field</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowFourthDD(true)}
              >
                <Text style={styles.dropdownButtonText}>
                  {formData.fourthField}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Fifth Field (dropdown) */}
          <View style={styles.fullRow}>
            <View style={styles.inputGroup2}>
              <Text style={styles.label}>Fifth Field</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowFifthDD(true)}
              >
                <Text style={styles.dropdownButtonText}>
                  {formData.fifthField}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <View style={{ marginVertical: 20 }}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => handleSubmit()}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Modal Third Field */}
        <Modal visible={showThirdDD} transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView>
                {thirdFieldList.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={styles.dropdownOption}
                    onPress={() => {
                      setFormData((prev) => ({ ...prev, thirdField: item }));
                      setShowThirdDD(false);
                    }}
                  >
                    <Text style={styles.dropdownOptionText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowThirdDD(false)}
              >
                <Text style={{ textAlign: "center", color: "#007bff" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal Fourth Field */}
        <Modal visible={showFourthDD} transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView>
                {fourthFieldList.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={styles.dropdownOption}
                    onPress={() => {
                      setFormData((prev) => ({ ...prev, fourthField: item }));
                      setShowFourthDD(false);
                    }}
                  >
                    <Text style={styles.dropdownOptionText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowFourthDD(false)}
              >
                <Text style={{ textAlign: "center", color: "#007bff" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal Fifth Field */}
        <Modal visible={showFifthDD} transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView>
                {fifthFieldList.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={styles.dropdownOption}
                    onPress={() => {
                      setFormData((prev) => ({ ...prev, fifthField: item }));
                      setShowFifthDD(false);
                    }}
                  >
                    <Text style={styles.dropdownOptionText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowFifthDD(false)}
              >
                <Text style={{ textAlign: "center", color: "#007bff" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}