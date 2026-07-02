import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function StarRating({ rating = 0, size = 14, showValue = true, color = '#F59E0B' }) {
  const value = Math.max(0, Math.min(5, Number(rating) || 0));
  const full = Math.floor(value);
  const half = value - full >= 0.5;

  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((star) => {
        let icon = 'star-outline';
        if (star <= full) icon = 'star';
        else if (star === full + 1 && half) icon = 'star-half';

        return <Icon key={star} name={icon} size={size} color={color} style={styles.star} />;
      })}
      {showValue && <Text style={[styles.value, { fontSize: size - 1 }]}>{value.toFixed(1)}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  star: { marginRight: 1 },
  value: { marginLeft: 6, fontWeight: '700', color: '#334155' },
});
