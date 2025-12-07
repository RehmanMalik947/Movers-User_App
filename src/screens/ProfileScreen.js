import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function UserProfileScreen() {

  const navigation = useNavigation();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image
            source={{ uri: 'https://unsplash.com/photos/young-woman-with-dark-hair-wearing-a-blue-tank-top-PR-tMohdtFw?q=80&w=200&auto=format&fit=crop' }}
            style={styles.profileImg}
          />
          <Text style={styles.name}>Imran Shahid</Text>
          <Text style={styles.membership}>Premium User</Text>
        </View>

        {/* Contact Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Contact Information</Text>
          <View style={styles.infoRow}>
            <Icon name="call-outline" size={20} color="#DAAE58" />
            <Text style={styles.infoText}>+92 300 1234567</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="mail-outline" size={20} color="#DAAE58" />
            <Text style={styles.infoText}>imran.shahid@example.com</Text>
          </View>
        </View>

        {/* Saved Addresses */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Saved Addresses</Text>
          <View style={styles.infoRow}>
            <Icon name="home-outline" size={20} color="#DAAE58" />
            <Text style={styles.infoText}>Home - Gulberg, Lahore</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="business-outline" size={20} color="#DAAE58" />
            <Text style={styles.infoText}>Office - Johar Town, Lahore</Text>
          </View>
          <TouchableOpacity style={styles.addAddressBtn}>
            <Icon name="add-circle-outline" size={20} color="#2A73FF" />
            <Text style={styles.addAddressText}>Add New Address</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Orders */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Recent Orders</Text>
          {['Order #1234', 'Order #1233', 'Order #1232'].map((order) => (
            <View key={order} style={styles.infoRow}>
              <Icon name="cube-outline" size={20} color="#DAAE58" />
              <Text style={styles.infoText}>{order}</Text>
            </View>
          ))}
        </View>

        {/* Settings */}
        <View style={styles.infoCard}>
          <TouchableOpacity style={styles.settingsRow}>
            <Icon name="settings-outline" size={20} color="#DAAE58" />
            <Text style={styles.infoText}>Settings</Text>
            <Icon name="chevron-forward" size={20} color="#9C9C9C" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity onPress={()=>{navigation.navigate('login')}} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#2A2A2A' },

  profileCard: {
    alignItems: 'center',
    backgroundColor: '#FDF1D9',
    borderRadius: 18,
    paddingVertical: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F0E8D6',
  },
  profileImg: { width: 100, height: 100, borderRadius: 50, marginBottom: 12 },
  name: { fontSize: 18, fontWeight: '700', color: '#2A2A2A' },
  membership: { fontSize: 14, color: '#555', marginBottom: 12 },

  infoCard: {
    backgroundColor: '#F5F8FF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: { fontSize: 16, fontWeight: '700', color: '#2A2A2A', marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  infoText: { fontSize: 14, color: '#2A2A2A' },

  addAddressBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  addAddressText: { marginLeft: 6, color: '#2A73FF', fontWeight: '600' },

  settingsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  logoutBtn: {
    backgroundColor: '#ec2720ff',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 50,
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
