import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontSize, fontWeight } from '../constants/theme';
import { HomeIcon, SearchIcon, LibraryIcon, SettingsIcon } from '../components/Icons';

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

const TAB_ICONS: Record<string, React.FC<{ focused: boolean }>> = {
  HomeTab: ({ focused }) => <HomeIcon size={22} color={focused ? colors.white : colors.textTertiary} />,
  SearchTab: ({ focused }) => <SearchIcon size={22} color={focused ? colors.white : colors.textTertiary} />,
  LibraryTab: ({ focused }) => <LibraryIcon size={22} color={focused ? colors.white : colors.textTertiary} />,
  SettingsTab: ({ focused }) => <SettingsIcon size={22} color={focused ? colors.white : colors.textTertiary} />,
};

function TabNavigator() {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom - 4, 0);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => {
          const Icon = TAB_ICONS[route.name];
          return Icon ? <Icon focused={focused} /> : null;
        },
        tabBarStyle: {
          backgroundColor: 'rgba(8, 8, 16, 0.97)',
          borderTopColor: 'rgba(255,255,255,0.04)',
          borderTopWidth: 1,
          height: 60 + bottomPad,
          paddingBottom: bottomPad + 6,
          paddingTop: 6,
          elevation: 0,
        },
        tabBarActiveTintColor: colors.white,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500' as const,
          fontFamily: 'SpaceGrotesk_500Medium',
          marginTop: 2,
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="SearchTab" component={SearchScreen} options={{ tabBarLabel: 'Search' }} />
      <Tab.Screen name="LibraryTab" component={LibraryScreen} options={{ tabBarLabel: 'Library' }} />
      <Tab.Screen name="SettingsTab" component={SettingsScreen} options={{ tabBarLabel: 'Setting' }} />
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
