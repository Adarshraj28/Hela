import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fontSize, fontFamily, layout } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { HomeIcon, SearchIcon, LibraryIcon, SettingsIcon } from '../components/Icons';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import LibraryScreen from '../screens/LibraryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AlbumScreen from '../screens/AlbumScreen';
import ArtistScreen from '../screens/ArtistScreen';
import PlaylistScreen from '../screens/PlaylistScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS: Record<string, React.FC<{ focused: boolean }>> = {
  HomeTab: ({ focused }) => <HomeIcon size={22} color={focused ? '#ffffff' : '#8080a0'} />,
  SearchTab: ({ focused }) => <SearchIcon size={22} color={focused ? '#ffffff' : '#8080a0'} />,
  LibraryTab: ({ focused }) => <LibraryIcon size={22} color={focused ? '#ffffff' : '#8080a0'} />,
  SettingsTab: ({ focused }) => <SettingsIcon size={22} color={focused ? '#ffffff' : '#8080a0'} />,
};

function GlassTabBar({ state, navigation, descriptors }: any) {
  const insets = useSafeAreaInsets();
  const colors = useTheme();
  const { routes, index } = state;
  const bottomPad = Math.max(insets.bottom, 8);

  return (
    <View style={[s.navWrapper, { bottom: bottomPad + 6 }]} pointerEvents="box-none">
      {/* Ambient glow behind active tab */}
      {routes.map((route: any, i: number) => {
        const isActive = i === index;
        if (!isActive) return null;
        return (
          <Animated.View
            key={`glow-${route.key}`}
            style={[s.activeGlow, {
              left: `${(i / routes.length) * 100 + (100 / routes.length) / 2 - 8}%`,
              backgroundColor: 'rgba(139, 92, 246, 0.2)',
            }]}
          />
        );
      })}

      <View style={[s.navGlass, {
        backgroundColor: colors.glassBg,
        borderColor: colors.glassBorder,
        paddingBottom: 8,
        paddingTop: 6,
      }]}>
        {/* Top highlight edge */}
        <View style={[s.glassHighlight, { backgroundColor: colors.glassHighlight }]} />

        <View style={s.tabRow}>
          {routes.map((route: any, i: number) => {
            const isActive = i === index;
            const { options } = descriptors[route.key];
            const label = options.tabBarLabel || route.name.replace('Tab', '');
            const Icon = TAB_ICONS[route.name];

            return (
              <TouchableOpacity
                key={route.key}
                style={s.tabItem}
                activeOpacity={0.6}
                onPress={() => navigation.navigate(route.name)}
              >
                {isActive ? (
                  <View style={[s.activePill, { backgroundColor: colors.glassActive, borderColor: colors.glassActiveBorder }]}>
                    {Icon && <Icon focused={isActive} />}
                  </View>
                ) : (
                  <View style={s.inactiveIcon}>
                    {Icon && <Icon focused={isActive} />}
                  </View>
                )}
                <Text style={[
                  s.tabLabel,
                  { color: isActive ? colors.white : colors.textTertiary },
                  isActive && s.tabLabelActive,
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="SearchTab" component={SearchScreen} options={{ tabBarLabel: 'Search' }} />
      <Tab.Screen name="LibraryTab" component={LibraryScreen} options={{ tabBarLabel: 'Library' }} />
      <Tab.Screen name="SettingsTab" component={SettingsScreen} options={{ tabBarLabel: 'Profile' }} />
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
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const s = StyleSheet.create({
  navWrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 500,
    alignItems: 'center',
  },
  activeGlow: {
    position: 'absolute',
    width: '16%',
    height: 48,
    borderRadius: 24,
    bottom: 20,
    opacity: 0.6,
    transform: [{ translateX: -12 }],
  },
  navGlass: {
    width: '100%',
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
    // Glass shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 20,
  },
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    opacity: 0.3,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minWidth: 60,
  },
  activePill: {
    width: 44,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  inactiveIcon: {
    width: 44,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: fontFamily.medium,
    marginTop: 3,
    letterSpacing: 0.3,
  },
  tabLabelActive: {
    fontFamily: fontFamily.semibold,
  },
});
