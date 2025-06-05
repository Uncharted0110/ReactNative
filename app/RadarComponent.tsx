// RadarChart.tsx
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
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
  data: MuscleGroupData;
  maxValue?: number;
  size?: number;
}

interface AttributeData {
  key: keyof MuscleGroupData;
  label: string;
  value: number;
}

const RadarChart: React.FC<RadarChartProps> = ({ data, maxValue = 100, size = 200 }) => {
  const center = size / 2;
  const radius = size / 2 - 40;
  const angleStep = (2 * Math.PI) / 7; // 7 attributes

  const attributes: AttributeData[] = [
    { key: 'chest', label: 'Chest', value: data.chest || 0 },
    { key: 'bicep', label: 'Bicep', value: data.bicep || 0 },
    { key: 'tricep', label: 'Tricep', value: data.tricep || 0 },
    { key: 'back', label: 'Back', value: data.back || 0 },
    { key: 'abs', label: 'Abs', value: data.abs || 0 },
    { key: 'glutes', label: 'Glutes', value: data.glutes || 0 },
    { key: 'leg', label: 'Legs', value: data.leg || 0 },
  ];

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
          fill="#2c3e50"
          fontSize="12"
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
  const overallScore = Math.round((totalValue / (attributes.length * maxValue)) * 100);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Muscle Group Development</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Overall Score</Text>
          <Text style={[styles.scoreValue, { color: getScoreColor(overallScore) }]}>
            {overallScore}%
          </Text>
        </View>
      </View>

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
                strokeWidth="2"
              />
            );
          })}
          
          {/* Labels */}
          {generateLabels()}
        </Svg>
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Muscle Groups</Text>
        <View style={styles.legendGrid}>
          {attributes.map((attr, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#ff6b35' }]} />
              <Text style={styles.legendText}>
                {attr.label}: {attr.value}%
              </Text>
            </View>
          ))}
        </View>
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
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
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
    color: '#2c3e50',
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
  legendContainer: {
    marginTop: 10,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: '500',
  },
});

export default RadarChart;