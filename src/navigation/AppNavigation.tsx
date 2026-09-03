import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize } from '../constants/theme';

// Screens
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import LibraryScreen from '../screens/LibraryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AlbumScreen from '../screens/AlbumScreen';
import ArtistScreen from '../screens/ArtistScreen';
import PlaylistScreen from '../screens/PlaylistScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeIcon({ focused }: { focused: boolean }) {
  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.icon, focused && styles.iconFocused]}>⌂</Text>
      {focused && <View style={styles.dot} />}
    </View>
  );
}

function SearchIcon({ focused }: { focused: boolean }) {
  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.icon, focused && styles.iconFocused]}>⌕</Text>
      {focused && <View style={styles.dot} />}
    </View>
  );
}

function LibraryIcon({ focused }: { focused: boolean }) {
  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.icon, focused && styles.iconFocused]}>♫</Text>
      {focused && <View style={styles.dot} />}
    </View>
  );
}

function SettingsIcon({ focused }: { focused: boolean }) {
  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.icon, focused && styles.iconFocused]}>⚙</Text>
      {focused && <View style={styles.dot} />}
    </View>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.white,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: 'Home', tabBarIcon: ({ focused }) => <HomeIcon focused={focused} /> }} />
      <Tab.Screen name="SearchTab" component={SearchScreen} options={{ tabBarLabel: 'Search', tabBarIcon: ({ focused }) => <SearchIcon focused={focused} /> }} />
      <Tab.Screen name="LibraryTab" component={LibraryScreen} options={{ tabBarLabel: 'Library', tabBarIcon: ({ focused }) => <LibraryIcon focused={focused} /> }} />
      <Tab.Screen name="SettingsTab" component={SettingsScreen} options={{ tabBarLabel: 'Setting', tabBarIcon: ({ focused }) => <SettingsIcon focused={focused} /> }} />
    </Tab.Navigator>
  );
}

export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="Album" component={AlbumScreen} />
        <Stack.Screen name="Artist" component={ArtistScreen} />
        <Stack.Screen name="Playlist" component={PlaylistScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    backgroundColor: 'rgba(8, 8, 16, 0.96)',
    borderTopColor: 'rgba(255,255,255,0.04)',
    borderTopWidth: 1,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
    elevation: 0,
  },
  tabLabel: {
    fontSize: fontSize.xs,
    fontWeight: '500' as const,
    marginTop: 2,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  icon: {
    fontSize: 20,
    color: colors.textTertiary,
  },
  iconFocused: {
    color: colors.white,
  },
  dot: {
    position: 'absolute',
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
});
