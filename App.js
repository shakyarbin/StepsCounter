import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import StepPath from './components/StepPath';

const STEP_THRESHOLD = 1.2; // Adjust this value based on testing
const STEP_DELAY = 150; // Minimum delay between steps (milliseconds)
const CALORIES_PER_STEP = 0.04;
const DISTANCE_PER_STEP = 0.0008; // in kilometers

export default function App() {
  const [steps, setSteps] = useState(0);
  const [lastStep, setLastStep] = useState(0);
  const [{ x, y, z }, setData] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    let subscription;
    
    const _subscribe = () => {
      subscription = Accelerometer.addListener(setData);
      Accelerometer.setUpdateInterval(100);
    };

    _subscribe();
    return () => subscription && subscription.remove();
  }, []);

  useEffect(() => {
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    const now = Date.now();
    
    if (magnitude > STEP_THRESHOLD && (now - lastStep) > STEP_DELAY) {
      setSteps(steps + 1);
      setLastStep(now);
    }
  }, [x, y, z]);

  const calories = (steps * CALORIES_PER_STEP).toFixed(2);
  const distance = (steps * DISTANCE_PER_STEP).toFixed(2);

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{steps}</Text>
          <Text style={styles.statLabel}>Steps</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{calories}</Text>
          <Text style={styles.statLabel}>Calories</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{distance}</Text>
          <Text style={styles.statLabel}>Kilometers</Text>
        </View>
      </View>
      <StepPath steps={steps} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 20,
    borderRadius: 15,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
}); 