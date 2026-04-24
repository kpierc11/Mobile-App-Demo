import { PacketQueueContext } from "@/src/components/PacketQueue";
import Feather from "@expo/vector-icons/Feather";
import { useTheme } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Switch,
} from "react-native";
import { TimerPickerModal } from "react-native-timer-picker";
import { LinearGradient } from "expo-linear-gradient";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Packet } from "@/src/utils/Packet";
import { Button } from "@react-navigation/elements";

interface TimeData {
  time: number;
  id: number;
}

interface OffTimeData {
  time: string;
  hoursOff: number;
}

export const CustomButton: React.FC<{
  label: string;
  onPress?: () => void;
}> = ({ label, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.button, { marginRight: 20 }]}
      onPress={onPress}
    >
      <Text style={{ color: "white", fontSize: 16 }}>{label}</Text>
    </TouchableOpacity>
  );
};

export default function QuattroScheduler() {
  const { processImmediatePacket } = useContext(PacketQueueContext);
  const theme = useTheme();
  const packet = new Packet();
  const { currentDeviceID, currentDeviceName } = useLocalSearchParams();
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showHourPicker, setShowHourPicker] = useState(false);
  const [alarmString, setAlarmString] = useState<string | null>(null);
  const [offTimes, setOffTimes] = useState<OffTimeData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEnabled, setIsEnabled] = useState<boolean>(false);

  // const toggleSwitch = async () => {
  //   setIsEnabled((previousState) => !previousState);
  //   setIsLoading(true);
  //   try {
  //     if (isEnabled) {
  //       await processImmediatePacket(
  //         packet.sendTurnOffQuattros(),
  //         currentDeviceID.toString(),
  //       );
  //     }

  //     if (!isEnabled) {
  //       await processImmediatePacket(
  //         packet.sendTurnOnQuattros(),
  //         currentDeviceID.toString(),
  //       );
  //     }

  //     await new Promise((r) => setTimeout(r, 3000));
  //   } catch (error) {
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const sortedTimes = offTimes.sort((a, b) => a.time.localeCompare(b.time));

  const formatTime = ({
    hours,
    minutes,
    ampm,
  }: {
    hours: number;
    minutes?: number;
    ampm?: "AM" | "PM";
  }) => {
    const timeParts = [];

    if (hours !== undefined) {
      timeParts.push(hours.toString().padStart(2, "0"));
    }
    if (minutes !== undefined) {
      timeParts.push(minutes.toString().padStart(2, "0"));
    }
    const time = timeParts.join(":");

    return time;
  };

  const handleClearSchedule = async () => {
    setOffTimes([]);
  };

  const getCurrentSchedule = async () => {
    try {
      await processImmediatePacket(
        packet.sendGetQuattroSchedule(),
        currentDeviceID.toString(),
      );
    } catch (error) {}
  };

  const handleRemoveTime = (timeIndex: number) => {
    setOffTimes(offTimes.filter((a, index) => index !== timeIndex));
  };

  const handleScheduleUpdate = async () => {
    setIsLoading(true);

    let currentMinutes = 0;

    try {
      if (offTimes.length === 0) {
        await processImmediatePacket(
          packet.sendTurnOnQuattros(),
          currentDeviceID.toString(),
        );
        await new Promise((r) => setTimeout(r, 3000));
        return;
      }

      offTimes.forEach((data) => {
        const scheduleTime = data.time.split(":");
        const hoursToMinutes = Number(scheduleTime[0]) * 60;
        const minutes = Number(scheduleTime[1]);
        const totalMinutes = hoursToMinutes + minutes;

        //console.log("Minutes:", totalMinutes);
        currentMinutes = totalMinutes;
      });

      await processImmediatePacket(
        packet.sendTurnOffQuattros(),
        currentDeviceID.toString(),
      );

      await new Promise((r) => setTimeout(r, 3000));
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatingTime = (time: string) => {
    setOffTimes(
      offTimes.map((currentData) => {
        if (currentData.time === time) {
          return { ...currentData, time: time, hoursOff: currentData.hoursOff };
        }
        return currentData;
      }),
    );
  };

  useEffect(() => {
    getCurrentSchedule();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 120,
            width: "100%",
          }}
        >
          <Text style={{ color: theme.colors.text, fontSize: 20 }}>
            Updating Settings...
          </Text>
          <ActivityIndicator style={{ marginTop: 20 }} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View
        style={{
          display: "flex",
          justifyContent: "flex-start",
          width: "95%",
          marginTop: 40,
        }}
      >
        <Text style={[styles.mainHeading, { color: theme.colors.text }]}>
          Schedule Selector
        </Text>
      </View>
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          style={[styles.button, { marginRight: "auto" }]}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={{ color: "white" }}>Add New Time</Text>
          <AntDesign name="plus" size={16} color={"white"} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleClearSchedule}>
          <Text style={{ color: "white" }}>Clear Schedule</Text>
          <MaterialIcons name="clear" size={16} color={"white"} />
        </TouchableOpacity>
      </View>
      <View
        style={[
          styles.settingsCard,
          { backgroundColor: theme.colors.card, marginTop: 20 },
        ]}
      >
        <View style={styles.iconMainContainer}>
          {offTimes.length > 0 ? (
            sortedTimes.map((data, index) => {
              return (
                <View
                  key={index}
                  style={{ display: "flex", flexDirection: "row" }}
                >
                  <View style={[styles.row, { marginRight: "auto", gap: 40 }]}>
                    <View style={{display:"flex", flexDirection:"row", gap:20}}>
                     
                      <Text
                        style={[styles.label, { color: theme.colors.text }]}
                      >
                        {data.time}
                      </Text>
                    </View>

                    {/* <TouchableOpacity
                      style={[styles.iconContainer, { gap: 10 }]}
                      onPress={() => setShowHourPicker(true)}
                    >
                      <Feather
                        name="edit"
                        size={18}
                        color={theme.colors.text}
                      />
                      <Text>Hours Off</Text>
                      <Text
                        style={[styles.label, { color: theme.colors.text }]}
                      >
                        {data.hoursOff}
                      </Text>
                    </TouchableOpacity> */}
                  </View>
                  <TouchableOpacity
                    key={index}
                    style={styles.iconContainer}
                    onPress={() => handleRemoveTime(index)}
                  >
                    <Feather name="trash" size={22} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>
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

      <View>
        <TouchableOpacity style={styles.button} onPress={handleScheduleUpdate}>
          <Text style={{ color: "white" }}>Update Schedule</Text>
        </TouchableOpacity>
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
        modalTitle="Set Time"
        onCancel={() => setShowTimePicker(false)}
        onConfirm={(pickedDuration) => {
          setOffTimes([
            ...offTimes,
            { time: formatTime(pickedDuration), hoursOff: 0 },
          ]);
          setShowTimePicker(false);
        }}
        setIsVisible={setShowTimePicker}
        use12HourPicker
        minuteInterval={10}
        minuteLabel="min"
        styles={{
          theme: theme.dark ? "dark" : "light",
          pickerLabelGap: 8,
          pickerItem: {
            fontSize: 20,
          },
          pickerLabel: {
            fontSize: 20,
            fontWeight: 500,
          },
          modalTitle: {
            fontSize: 18,
          },

          pickerColumnWidth: {
            hours: 120,
            minutes: 120,
          },
        }}
        visible={showTimePicker}
      />

      {/* <TimerPickerModal
        closeOnOverlayPress
        modalProps={{
          overlayOpacity: 0.7,
        }}
        cancelButton={<CustomButton label="Cancel"></CustomButton>}
        confirmButton={<CustomButton label="Confirm"></CustomButton>}
        hideSeconds
        hideMinutes
        LinearGradient={LinearGradient}
        modalTitle="Off Hours"
        onCancel={() => setShowHourPicker(false)}
        onConfirm={(pickedDuration) => {
          handleUpdatingHours(pickedDuration.hours);
          setShowHourPicker(false);
        }}
        setIsVisible={setShowHourPicker}
        minuteInterval={10}
        minuteLabel="min"
        styles={{
          theme: theme.dark ? "dark" : "light",
          pickerLabelGap: 8,
          pickerItem: {
            fontSize: 20,
          },
          pickerLabel: {
            fontSize: 20,
            fontWeight: 500,
          },
          modalTitle: {
            fontSize: 18,
          },

          pickerColumnWidth: {
            hours: 120,
            minutes: 120,
          },
        }}
        visible={showHourPicker}
      /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  mainHeading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10,
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
  },

  image: {
    width: "80%",
    height: 200,
    borderRadius: 15,
    marginTop: 20,
    marginBottom: 20,
  },

  settingsCard: {
    width: "100%",
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
