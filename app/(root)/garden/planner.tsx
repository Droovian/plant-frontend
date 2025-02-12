import { useEffect, useRef } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import CustomButton from "@/components/Button";
import { MotiView } from "moti";
import { router } from "expo-router";
import { useGardenStore } from "@/store";
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons";

const Planner = () => {
  const { width, height, unit, squareArea, soilType, setGardenData } = useGardenStore();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-green-50">
      {/* <TouchableOpacity
        onPress={() => router.back()}
        className="z-3 absolute top-4 bg-white rounded-full p-2 shadow-md"
        style={{ marginTop: insets.top }}
      >
        <Ionicons name="arrow-back" size={24} color="#4CAF50" />
      </TouchableOpacity> */}
      <MotiView
        from={{ opacity: 0, translateY: -50 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 1000 }}
        style={styles.header}
        className="bg-green-100 p-4"
      >
        <Text className="text-green-700 font-bold text-3xl">Plan your Garden</Text>
      </MotiView>

      <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Garden Dimensions</Text>
          <View style={styles.dimensionInputs}>
            <TextInput
              style={styles.input}
              placeholder="Width"
              placeholderTextColor={"#81C784"}
              value={width}
              onChangeText={(text) => setGardenData("width", text)}
              keyboardType="numeric"
            />
            <Text style={styles.dimensionSeparator}>x</Text>
            <TextInput
              style={styles.input}
              placeholder="Height"
              placeholderTextColor={"#81C784"}
              value={height}
              onChangeText={(text) => setGardenData("height", text)}
              keyboardType="numeric"
            />
            <Picker selectedValue={unit} style={styles.unitPicker} onValueChange={(itemValue) => setGardenData("unit", itemValue)}>
              <Picker.Item label="feet" value="feet" color="#06402B" />
              <Picker.Item label="meters" value="meters" color="#06402B" />
            </Picker>
          </View>
        </View>

        <MotiView from={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", delay: 300 }} style={styles.inputGroup}>
          <Text style={styles.label}>Square Area Representation</Text>
          <TextInput
            placeholderTextColor={"#81C784"}
            style={styles.input}
            placeholder="e.g., 1 sq ft"
            value={squareArea}
            onChangeText={(text) => setGardenData("squareArea", text)}
          />
        </MotiView>

        <MotiView from={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", delay: 600 }} style={styles.inputGroup}>
          <Text style={styles.label}>Soil Type</Text>
          <Picker selectedValue={soilType} style={styles.soilPicker} onValueChange={(itemValue) => setGardenData("soilType", itemValue)}>
            <Picker.Item label="Select soil type" value="" color="#06402B" />
            <Picker.Item label="Clay" value="clay" color="#06402B" />
            <Picker.Item label="Sandy" value="sandy" color="#06402B" />
            <Picker.Item label="Silt" value="silt" color="#06402B" />
            <Picker.Item label="Loam" value="loam" color="#06402B" />
          </Picker>
        </MotiView>

        <MotiView from={{ opacity: 0, translateY: 50 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: "spring", delay: 900 }}>
          <CustomButton title="Proceed to layout" bgVariant="plant" onPress={() => router.push("/(root)/garden/builder")} />
        </MotiView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1B5E20",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#81C784",
  },
  dimensionInputs: {
    flexDirection: "row",
    alignItems: "center",
  },
  dimensionSeparator: {
    fontSize: 20,
    fontWeight: "bold",
    marginHorizontal: 10,
    color: "#1B5E20",
  },
  unitPicker: {
    flex: 1,
    marginLeft: 10,
  },
  soilPicker: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#81C784",
  },
});

export default Planner;
