import { Platform } from "react-native";
import { Theme } from "@react-navigation/native";

const WEB_FONT_STACK =
  'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';

export const HbsTheme: Theme = {
  dark: false,
  colors: {
    primary: "#215387",
    background: "rgb(242, 242, 242)",
    card: "rgb(255, 255, 255)",
    text: "rgb(28, 28, 30)",
    border: "rgb(199, 199, 204)",
    notification: "rgb(255, 69, 58)",
  },
  fonts: Platform.select({
    web: {
      regular: { fontFamily: WEB_FONT_STACK, fontWeight: "400" },
      medium: { fontFamily: WEB_FONT_STACK, fontWeight: "500" },
      bold: { fontFamily: WEB_FONT_STACK, fontWeight: "600" },
      heavy: { fontFamily: WEB_FONT_STACK, fontWeight: "700" },
    },
    ios: {
      regular: { fontFamily: "System", fontWeight: "400" },
      medium: { fontFamily: "System", fontWeight: "500" },
      bold: { fontFamily: "System", fontWeight: "600" },
      heavy: { fontFamily: "System", fontWeight: "700" },
    },
    default: {
      regular: { fontFamily: "sans-serif", fontWeight: "normal" },
      medium: { fontFamily: "sans-serif-medium", fontWeight: "normal" },
      bold: { fontFamily: "sans-serif", fontWeight: "600" },
      heavy: { fontFamily: "sans-serif", fontWeight: "700" },
    },
  })!,
};

export const HbsDarkTheme: Theme = {
  dark: true,
  colors: {
    // Primary colors inspired by Material UI dark theme
    primary: "#54b0ef",        // light blue 200
    background: "#121212",       // very dark background
    card: "rgb(38, 38, 38)",             // slightly lighter for cards
    text: "rgb(236, 236, 236)",          // near white for text
    border: "rgb(66, 66, 66)",           // darker border
    notification: "rgb(255, 138, 128)",  // reddish notification color
  },
  fonts: Platform.select({
    web: {
      regular: { fontFamily: WEB_FONT_STACK, fontWeight: "400" },
      medium: { fontFamily: WEB_FONT_STACK, fontWeight: "500" },
      bold: { fontFamily: WEB_FONT_STACK, fontWeight: "600" },
      heavy: { fontFamily: WEB_FONT_STACK, fontWeight: "700" },
    },
    ios: {
      regular: { fontFamily: "System", fontWeight: "400" },
      medium: { fontFamily: "System", fontWeight: "500" },
      bold: { fontFamily: "System", fontWeight: "600" },
      heavy: { fontFamily: "System", fontWeight: "700" },
    },
    default: {
      regular: { fontFamily: "sans-serif", fontWeight: "normal" },
      medium: { fontFamily: "sans-serif-medium", fontWeight: "normal" },
      bold: { fontFamily: "sans-serif", fontWeight: "600" },
      heavy: { fontFamily: "sans-serif", fontWeight: "700" },
    },
  })!,
};