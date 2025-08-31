import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import QuranListScreen from "../../app/(tabs)/QuranListScreen";
import SurahDetailScreen from "../../app/SurahDetailScreen";
import TafsirScreen from "../../app/TafsirScreen";

const Stack = createStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="QuranList">
        <Stack.Screen name="QuranList" component={QuranListScreen} options={{ title: "Quran List" }} />
        <Stack.Screen name="SurahDetail" component={SurahDetailScreen} options={{ title: "SurahDetail" }} />
        <Stack.Screen name="Tafsir" component={TafsirScreen} options={{ title: "Tafsir" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
