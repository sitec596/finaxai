import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StyleSheet, TextStyle } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;

  const styles = StyleSheet.create({
    tabBarLabel: {
      fontSize: 12,
      fontWeight: '500',
      marginBottom: 4,
    } as TextStyle,
    tabBarStyle: {
      backgroundColor: colorScheme === 'dark' ? Colors.dark.background : Colors.light.background,
      borderTopColor: colorScheme === 'dark' ? '#333' : '#eee',
      paddingTop: 8,
      paddingBottom: 4,
      height: 60,
    },
  });

  const tabScreenOptions = {
    headerShown: false,
    tabBarActiveTintColor: tintColor,
    tabBarInactiveTintColor: colorScheme === 'dark' ? '#888' : '#999',
    tabBarStyle: styles.tabBarStyle,
    tabBarLabelStyle: styles.tabBarLabel,
    tabBarButton: HapticTab,
  };

  const tabs = [
    {
      name: 'index' as const,
      options: {
        title: 'Home',
        tabBarIcon: ({ color }: { color: string }) => (
          <IconSymbol size={26} name="house.fill" color={color} />
        ),
      },
    },
    {
      name: 'add' as const,
      options: {
        title: 'Add',
        tabBarIcon: ({ color }: { color: string }) => (
          <IconSymbol size={30} name="plus.circle.fill" color={color} />
        ),
      },
    },
    {
      name: 'explore' as const,
      options: {
        title: 'Explore',
        tabBarIcon: ({ color }: { color: string }) => (
          <IconSymbol size={26} name="square.grid.2x2.fill" color={color} />
        ),
      },
    },
  ];

  return (
    <Tabs screenOptions={tabScreenOptions}>
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={tab.options}
        />
      ))}
    </Tabs>
  );
}