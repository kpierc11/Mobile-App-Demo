import { PacketQueueContext } from "@/src/components/PacketQueue";
import Feather from "@expo/vector-icons/Feather";
import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useContext, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { TimerPickerModal } from "react-native-timer-picker";
import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export const CustomButton: React.FC<{
  label: string;
  onPress?: () => void;
}> = ({ label, onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={{ color: "white", fontSize: 16 }}>{label}</Text>
      <MaterialCommunityIcons name="arrow-right" size={12} color={"white"} />
    </TouchableOpacity>
  );
};

export default function QuattroScheduler() {
  const { processImmediatePacket } = useContext(PacketQueueContext);
  const theme = useTheme();

  const [showPicker, setShowPicker] = useState(false);
  const [alarmString, setAlarmString] = useState<string | null>(null);
  const [offTimes, setOffTimes] = useState<string[]>([]);

  const formatTime = ({
    hours,
    minutes,
  }: {
    hours?: number;
    minutes?: number;
  }) => {
    const timeParts = [];

    if (hours !== undefined) {
      timeParts.push(hours.toString().padStart(2, "0"));
    }
    if (minutes !== undefined) {
      timeParts.push(minutes.toString().padStart(2, "0"));
    }
    return timeParts.join(":");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={{ width: "100%", alignItems: "flex-end" }}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowPicker(true)}
        >
          <Text style={{ color: "white" }}>Add new Time</Text>
        </TouchableOpacity>
      </View>
      <View style={{ marginTop: 20 }}></View>
      <View
        style={[styles.settingsCard, { backgroundColor: theme.colors.card }]}
      >
        <View style={styles.iconMainContainer}>
          {offTimes.length > 0 ? (
            offTimes.map((time, index) => {
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.iconContainer}
                  onPress={() => setShowPicker(true)}
                >
                  <View style={styles.row}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>
                      {time}
                    </Text>
                    <Text
                      style={[styles.value, { color: theme.colors.text }]}
                    ></Text>
                  </View>
                  <Feather name="edit" size={18} color={theme.colors.text} />
                </TouchableOpacity>
              );
            })
          ) : (
            <>
              <Text style={{ color: theme.colors.text, textAlign: "center" }}>
                No current times set.
              </Text>
              <Text style={{ color: theme.colors.text, textAlign: "center" }}>
                Add a new time to turn off the quattro head.
              </Text>
            </>
          )}
        </View>
      </View>

      <TimerPickerModal
        closeOnOverlayPress
        modalProps={{
          overlayOpacity: 0.7,
        }}
        cancelButton={<CustomButton label="Cancel"></CustomButton>}
        confirmButton={<CustomButton label="Confirm"></CustomButton>}
        hideSeconds
        LinearGradient={LinearGradient}
        modalTitle="Set Turn Off Time"
        onCancel={() => setShowPicker(false)}
        onConfirm={(pickedDuration) => {
          setOffTimes([...offTimes, formatTime(pickedDuration)]);
          setShowPicker(false);
        }}
        setIsVisible={setShowPicker}
        use12HourPicker
        minuteLabel="min"
        styles={{
          theme: theme.dark ? "dark" : "light",
          pickerLabelGap: 8,
          pickerItem: {
            fontSize: 20,
          },
          pickerLabel: {
            fontSize: 20,
            fontWeight:500,
          },
          modalTitle: {
            fontSize: 18,
          },

          pickerColumnWidth: {
            hours: 120,
            minutes: 120,
          },
        }}
        visible={showPicker}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#215387",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 5,
    padding: 10,
    marginTop: 20,
    marginRight: 20,
  },

  image: {
    width: "80%",
    height: 200,
    borderRadius: 15,
    marginTop: 20,
    marginBottom: 20,
  },

  settingsCard: {
    width: "95%",
    padding: 10,
    borderRadius: 10,
    margin: 20,
    marginTop: 0,
    marginBottom: 40,
  },

  iconMainContainer: {
    gap: 30,
    width: "100%",
    paddingVertical: 10,
  },

  iconContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  label: {
    fontSize: 16,
    fontWeight: "bold",
    gap: 10,
  },

  value: {
    fontSize: 16,
  },

  cardWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  card: {
    flexBasis: "48%",
    margin: "1%",
    marginBottom: 20,
    padding: 20,
    borderRadius: 10,
    elevation: 2,
    maxHeight: 250,
  },

  subHeading: {
    fontSize: 16,
    marginTop: 10,
  },
});
