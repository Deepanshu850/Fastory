import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Switch,
  Platform,
  Alert,
  Share,
  Linking,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

type PersonalInfo = {
  name: string;
  email: string;
  phone: string;
  notifications: boolean;
  newsletter: boolean;
};

export default function ProfileScreen() {
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, signIn, signOut } = useAuth();
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: '',
    email: user?.email || '',
    phone: '',
    notifications: true,
    newsletter: false,
  });

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: 'Check out this amazing news app!',
        title: 'News App',
        url: 'https://newsapp.example.com',
      });
    } catch (error) {
      console.error('Error sharing app:', error);
    }
  };

  const handleFeedback = () => {
    Linking.openURL('mailto:feedback@newsapp.example.com?subject=App%20Feedback');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Implement account deletion logic here
            Alert.alert('Account Deleted', 'Your account has been successfully deleted.');
            signOut();
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={80} color="#FF0000" />
        </View>
        <Text style={[styles.welcomeText, { color: theme.colors.text }]}>
          {user ? `Welcome, ${personalInfo.name || user.email}` : 'Welcome, Guest'}
        </Text>
      </View>

      {/* Personal Information Section */}
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="person" size={24} color="#FF0000" />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Personal Information
          </Text>
        </View>
        <TextInput
          style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.text }]}
          placeholder="Full Name"
          placeholderTextColor={theme.colors.text}
          value={personalInfo.name}
          onChangeText={(text) => setPersonalInfo({ ...personalInfo, name: text })}
        />
        <TextInput
          style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.text }]}
          placeholder="Email"
          placeholderTextColor={theme.colors.text}
          value={personalInfo.email}
          onChangeText={(text) => setPersonalInfo({ ...personalInfo, email: text })}
          keyboardType="email-address"
        />
        <TextInput
          style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.text }]}
          placeholder="Phone Number"
          placeholderTextColor={theme.colors.text}
          value={personalInfo.phone}
          onChangeText={(text) => setPersonalInfo({ ...personalInfo, phone: text })}
          keyboardType="phone-pad"
        />
      </View>

      {/* Preferences Section */}
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="settings" size={24} color="#FF0000" />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Preferences
          </Text>
        </View>
        <View style={styles.preference}>
          <Text style={[styles.preferenceText, { color: theme.colors.text }]}>
            Dark Mode
          </Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: '#FF0000' }}
            thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : '#f4f3f4'}
          />
        </View>
        <View style={styles.preference}>
          <Text style={[styles.preferenceText, { color: theme.colors.text }]}>
            Push Notifications
          </Text>
          <Switch
            value={personalInfo.notifications}
            onValueChange={(value) =>
              setPersonalInfo({ ...personalInfo, notifications: value })
            }
            trackColor={{ false: '#767577', true: '#FF0000' }}
            thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : '#f4f3f4'}
          />
        </View>
        <View style={styles.preference}>
          <Text style={[styles.preferenceText, { color: theme.colors.text }]}>
            Newsletter
          </Text>
          <Switch
            value={personalInfo.newsletter}
            onValueChange={(value) =>
              setPersonalInfo({ ...personalInfo, newsletter: value })
            }
            trackColor={{ false: '#767577', true: '#FF0000' }}
            thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Support Section */}
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="help-circle" size={24} color="#FF0000" />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Support
          </Text>
        </View>
        <Pressable style={styles.menuItem} onPress={handleShareApp}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="share-outline" size={24} color={theme.colors.text} />
            <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
              Share App
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
        </Pressable>
        <Pressable style={styles.menuItem} onPress={handleFeedback}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="mail-outline" size={24} color={theme.colors.text} />
            <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
              Send Feedback
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
        </Pressable>
        <Pressable
          style={styles.menuItem}
          onPress={() => Linking.openURL('https://newsapp.example.com/terms')}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="document-text-outline" size={24} color={theme.colors.text} />
            <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
              Terms & Conditions
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
        </Pressable>
      </View>

      {/* Account Section */}
      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="key" size={24} color="#FF0000" />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Account
          </Text>
        </View>
        {user ? (
          <>
            <Pressable style={styles.button} onPress={handleSignOut}>
              <Ionicons name="log-out" size={24} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Sign Out</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.deleteButton]}
              onPress={handleDeleteAccount}>
              <Ionicons name="trash" size={24} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Delete Account</Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            style={styles.button}
            onPress={() => signIn('user@example.com', 'password')}>
            <Ionicons name="log-in" size={24} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Sign In</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 20,
  },
  avatarContainer: {
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    margin: 10,
    padding: 15,
    borderRadius: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  preference: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  preferenceText: {
    fontSize: 16,
  },
  button: {
    backgroundColor: '#FF0000',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    flexDirection: 'row',
  },
  buttonIcon: {
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#DC3545',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
  },
});