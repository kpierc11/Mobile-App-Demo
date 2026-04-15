import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useTheme } from "@react-navigation/native";
import { Dispatch, SetStateAction, useState } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  TextInput,
  StyleSheet,
} from "react-native";

interface FilterProps {
  filterAlphabetically: boolean;
  searchTerm: string;
  setFilterAphabetically: () => void;
  setSearchTerm: Dispatch<SetStateAction<any>>;
}

export default function FilterOptions({
  filterAlphabetically,
  searchTerm,
  setFilterAphabetically,
  setSearchTerm,
}: FilterProps) {
  const theme = useTheme();
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        width: "100%",
        paddingHorizontal: 10,
        marginBottom: 30,
        gap: 20,
        marginTop: 30,
      }}
    >
      <View style={{ display: "flex", flexDirection: "column", gap: 10, marginRight:"auto"
       }}>
        <View
          style={[
            styles.settingsCard,
            { backgroundColor: theme.colors.card },
          ]}
        >
          <Feather name="search" size={20} color="black" style={{marginLeft:50}} />
          <TextInput
            style={[
              styles.input,
              { color: theme.colors.text, borderColor: theme.colors.border },
            ]}
            onChangeText={setSearchTerm}
            value={searchTerm}
            placeholder={"Search Device..."}
            placeholderTextColor={theme.colors.border}
          />
        </View>
      </View>
      <View style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <TouchableOpacity onPress={setFilterAphabetically}>
          <View
            style={[
              {
                display: "flex",
                justifyContent: "center",
                backgroundColor: "#215387",
                borderRadius: 15,
                padding: 10,
              },
              filterAlphabetically
                ? { backgroundColor: "#215387", width: "auto" }
                : { backgroundColor: "white" },
            ]}
          >
            <FontAwesome6
              name="arrow-down-a-z"
              size={18}
              color={filterAlphabetically ? "white" : "black"}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  settingsCard: {
    display: "flex",
    flexDirection:"row",
    alignItems:"center",
    justifyContent: "center",
    borderColor: "black",
    width: 300,
    borderWidth: 0,
    padding: 1,
    borderRadius: 15,
  },
  input: {
    height: 40,
    margin: 2,
    width: "100%",
    fontSize: 16,
    borderRadius: 99,
    padding: 10,
  },
});
