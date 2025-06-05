// RadarChart.tsx
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface MuscleGroupData {
  chest: number;
  bicep: number;
  leg: number;
  glutes: number;
  abs: number;
  back: number;
  tricep: number;
}

interface RadarChartProps {
  email: string;
  maxValue?: number;
  size?: number;
  apiUrl?: string; // Base URL for your API
}

interface AttributeData {
  key: keyof MuscleGroupData;
  label: string;
  value: number;
}

interface WorkoutTotals {
  [workoutName: string]: number;
}

const RadarChart: React.FC<RadarChartProps> = ({
  email,
  maxValue = 100,
  size = 180,
  apiUrl = 'http://localhost:3000' // Default API URL
}) => {
  const [data, setData] = useState<MuscleGroupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const center = size / 2;
  const radius = size / 2 - 40;
  const angleStep = (2 * Math.PI) / 7; // 7 attributes

  // Mapping function to convert workout names to muscle groups
  const mapWorkoutToMuscleGroup = (workoutTotals: WorkoutTotals): MuscleGroupData => {
    const muscleData: MuscleGroupData = {
      chest: 0,
      bicep: 0,
      leg: 0,
      glutes: 0,
      abs: 0,
      back: 0,
      tricep: 0,
    };

    Object.entries(workoutTotals).forEach(([workoutName, totalReps]) => {
      const lowerWorkout = workoutName.toLowerCase();

      if (lowerWorkout.includes('pushup') || lowerWorkout.includes('push-up')) {
        muscleData.chest += totalReps * 0.7;
        muscleData.tricep += totalReps * 0.15;
        muscleData.bicep += totalReps * 0.1;
        muscleData.back += totalReps * 0.05;
      }

      if (lowerWorkout.includes('twist')) {
        muscleData.abs += totalReps * 1.0;
      }

      if (lowerWorkout.includes('squat')) {
        muscleData.leg += totalReps * 0.6;
        muscleData.glutes += totalReps * 0.4;
      }

      if (lowerWorkout.includes('plank')) {
        muscleData.abs += totalReps * 1.0;
      }

      // Other muscle-specific mappings (keep existing logic as fallback)
      if (lowerWorkout.includes('curl') || lowerWorkout.includes('bicep')) {
        muscleData.bicep += totalReps;
      }

      if (lowerWorkout.includes('tricep') || lowerWorkout.includes('dip') || lowerWorkout.includes('extension')) {
        muscleData.tricep += totalReps;
      }

      if (lowerWorkout.includes('pullup') || lowerWorkout.includes('pull-up') || lowerWorkout.includes('row') || lowerWorkout.includes('back')) {
        muscleData.back += totalReps;
      }

      if (lowerWorkout.includes('crunch') || lowerWorkout.includes('sit-up') || lowerWorkout.includes('situp') || lowerWorkout.includes('abs')) {
        muscleData.abs += totalReps;
      }

      if (lowerWorkout.includes('lunge') || lowerWorkout.includes('leg') || lowerWorkout.includes('calf')) {
        muscleData.leg += totalReps;
      }

      if (lowerWorkout.includes('glute') || lowerWorkout.includes('hip') || lowerWorkout.includes('bridge')) {
        muscleData.glutes += totalReps;
      }
    });

    return muscleData;
  };


  // Fetch workout data from API
  useEffect(() => {
    const fetchWorkoutData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${apiUrl}/api/workout-totals?email=${encodeURIComponent(email)}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.totals) {
          const muscleData = mapWorkoutToMuscleGroup(result.totals);
          setData(muscleData);
        } else {
          setError('No workout data found');
        }
      } catch (err) {
        console.error('Error fetching workout data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    if (email) {
      fetchWorkoutData();
    }
  }, [email, apiUrl]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#ff6b35" />
        <Text style={styles.loadingText}>Loading workout data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>No workout data available</Text>
      </View>
    );
  }

  const attributes: AttributeData[] = [
    { key: 'chest', label: 'Chest', value: data.chest },
    { key: 'bicep', label: 'Bicep', value: data.bicep },
    { key: 'tricep', label: 'Tricep', value: data.tricep },
    { key: 'back', label: 'Back', value: data.back },
    { key: 'abs', label: 'Abs', value: data.abs },
    { key: 'glutes', label: 'Glutes', value: data.glutes },
    { key: 'leg', label: 'Legs', value: data.leg },
  ];

  console.log('RadarChart attributes:', attributes);

  // Generate points for the polygon based on data values
  const generatePoints = () => {
    return attributes.map((attr, index) => {
      const angle = index * angleStep - Math.PI / 2; // Start from top
      const value = (attr.value / maxValue) * radius;
      const x = center + Math.cos(angle) * value;
      const y = center + Math.sin(angle) * value;
      return `${x},${y}`;
    }).join(' ');
  };

  // Generate grid circles
  const generateGridCircles = () => {
    const circles = [];
    for (let i = 1; i <= 4; i++) {
      const r = (radius / 4) * i;
      circles.push(
        <Circle
          key={i}
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="#e0e0e0"
          strokeWidth="1"
        />
      );
    }
    return circles;
  };

  // Generate grid lines
  const generateGridLines = () => {
    return attributes.map((_, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const x = center + Math.cos(angle) * radius;
      const y = center + Math.sin(angle) * radius;
      return (
        <Line
          key={index}
          x1={center}
          y1={center}
          x2={x}
          y2={y}
          stroke="#e0e0e0"
          strokeWidth="1"
        />
      );
    });
  };

  // Generate labels
  const generateLabels = () => {
    return attributes.map((attr, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const labelRadius = radius + 25;
      const x = center + Math.cos(angle) * labelRadius;
      const y = center + Math.sin(angle) * labelRadius;

      return (
        <SvgText
          key={index}
          x={x}
          y={y}
          fill="#ffffff"
          fontSize="14"
          fontWeight="600"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {attr.label}
        </SvgText>
      );
    });
  };

  // Calculate overall score
  const totalValue = attributes.reduce((sum, attr) => sum + attr.value, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Progress</Text>

      <View style={styles.chartContainer}>
        <Svg height={size} width={size}>
          {/* Grid circles */}
          {generateGridCircles()}

          {/* Grid lines */}
          {generateGridLines()}

          {/* Data polygon */}
          <Polygon
            points={generatePoints()}
            fill="#ff6b35"
            fillOpacity="0.2"
            stroke="#ff6b35"
            strokeWidth="2"
          />

          {/* Data points */}
          {attributes.map((attr, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const value = (attr.value / maxValue) * radius;
            const x = center + Math.cos(angle) * value;
            const y = center + Math.sin(angle) * value;
            return (
              <Circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill="#ff6b35"
                stroke="#fff"
                strokeWidth="1"
              />
            );
          })}

          {/* Labels */}
          {generateLabels()}
        </Svg>
      </View>
    </View>
  );
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return '#27ae60';
  if (score >= 60) return '#f39c12';
  if (score >= 40) return '#e67e22';
  return '#e74c3c';
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#152238',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
  },
});

export default RadarChart;