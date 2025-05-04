// src/components/game/StatRadarChart.tsx
"use client";

import * as React from "react";
import { useState, useCallback, useEffect } from "react";
import { Label, PolarGrid, PolarRadiusAxis, Radar, RadarChart, PolarAngleAxis, Text } from "recharts"; // Added Text
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/game/CardboardCard";
import type { CharacterStats } from "@/types/game-types"; // Import CharacterStats type
import { cn } from "@/lib/utils"; // Utility function
import { HandDrawnStrengthIcon, HandDrawnStaminaIcon, HandDrawnAgilityIcon, HandDrawnMagicIcon, HandDrawnHistoryIcon } from "@/components/icons/HandDrawnIcons"; // Import icons
import { TOTAL_STAT_POINTS, MIN_STAT_VALUE, MAX_STAT_VALUE } from "@/components/screens/CharacterCreation"; // Import consts
import { useToast } from "@/hooks/use-toast"; // Import toast

interface StatRadarChartProps {
  stats: CharacterStats;
  setStats: React.Dispatch<React.SetStateAction<CharacterStats>>;
  remainingPoints: number;
  setRemainingPoints: React.Dispatch<React.SetStateAction<number>>;
}

const statIcons = {
    Strength: HandDrawnStrengthIcon,
    Stamina: HandDrawnStaminaIcon,
    Agility: HandDrawnAgilityIcon,
    Intellect: HandDrawnMagicIcon,
    Wisdom: HandDrawnHistoryIcon,
    Charisma: HandDrawnAgilityIcon, // Replace with a Charisma icon later
};


const dataKeys = ["Strength", "Agility", "Stamina", "Intellect", "Wisdom", "Charisma"];


const StatRadarChart: React.FC<StatRadarChartProps> = ({ stats, setStats, remainingPoints, setRemainingPoints }) => {
  const [isClient, setIsClient] = useState(false); // State to track client-side rendering
    const { toast } = useToast();

  useEffect(() => {
    setIsClient(true); // Set to true once component mounts on client
  }, []);

  const statArray = [
    { stat: "Strength", value: stats.strength, allocated: stats.strength },
    { stat: "Agility", value: stats.agility, allocated: stats.agility },
    { stat: "Stamina", value: stats.stamina, allocated: stats.stamina },
    { stat: "Intellect", value: 1, allocated: 1 }, // Replace with actual intellect later
    { stat: "Wisdom", value: 1, allocated: 1 }, // Replace with actual wisdom later
    { stat: "Charisma", value: 1, allocated: 1 }, // Replace with actual charisma later
  ];

   const handleStatChange = useCallback((statName: string, value: number) => {
        // Clamping and points logic as before (adjust remainingPoints, etc.)
        const clampedValue = Math.max(MIN_STAT_VALUE, Math.min(MAX_STAT_VALUE, value));

        setStats(prevStats => {
            const tentativeStats = { ...prevStats, [statName.toLowerCase()]: clampedValue };
            const currentTotal = tentativeStats.strength + tentativeStats.stamina + tentativeStats.agility;

            if (currentTotal <= TOTAL_STAT_POINTS) {
                setRemainingPoints(TOTAL_STAT_POINTS - currentTotal);
                return tentativeStats;
            } else {
                toast({
                  title: "Stat Limit Reached",
                  description: `Cannot exceed ${TOTAL_STAT_POINTS} total stat points.`,
                  variant: "destructive",
                });
                setRemainingPoints(TOTAL_STAT_POINTS - (prevStats.strength + prevStats.stamina + prevStats.agility));
                return prevStats;
            }
        });
    }, [setStats, setRemainingPoints, toast]);



  const CustomizedRadarLabel = (props: any) => {
    const { payload, x, y, cx, cy, value } = props;
     if (!payload) return null;

    const angle = payload.angle; // Angle in degrees
    const radiusOffset = 15; // How far out from the point to place the label

    // Calculate the position outside the point
    const radianAngle = angle * (Math.PI / 180); // Convert angle to radians
    const labelX = cx + (60 + radiusOffset) * Math.cos(-radianAngle); // Use negative angle because y-axis is inverted and use 60 base radius
    const labelY = cy + (60 + radiusOffset) * Math.sin(-radianAngle);

    // Adjust text anchor based on quadrant for better readability
    let textAnchor: "start" | "end" | "middle" = "middle";
    if (labelX > cx) {
      textAnchor = "start";
    } else if (labelX < cx) {
      textAnchor = "end";
    }

    const Icon = statIcons[payload.dataKey as keyof typeof statIcons] || null; // Find icon or default

    return (
        
            {Icon ? <Icon className="inline mr-1.5 h-4 w-4" /> : null}
            <Text x={labelX} y={labelY} textAnchor={textAnchor} verticalAnchor="middle" className="text-sm fill-muted-foreground">
              {payload.name} ({value}) {/* Show stat and the allocated value */}
            </Text>
        
    );
  };


  return (
    
       Skill Allocation
          Click and drag the dots to allocate your stats.
        
       {isClient ? ( // Only render chart content on the client
          
            <RadarChart
              cx="50%"
              cy="50%"
              width={300}
              height={300}
              style={{ width: "100%", height: "100%" }}
              data={statArray}
            >
              <PolarGrid />
              <PolarAngleAxis dataKey="stat" stroke="#bbbbbb" tick={<CustomizedRadarLabel />} />
              <PolarRadiusAxis angle={30} domain={[0, MAX_STAT_VALUE]} axisLine={false} tick={false} />
              {dataKeys.map((key, index) => (
                <Radar
                  key={key}
                  dataKey="value"
                  name={key}
                  stroke={`url(#color${index})`}
                  fill={`url(#color${index})`}
                  fillOpacity={0.6}
                  strokeWidth={2}
                  dot={ // Add dots for easy click & drag
                  (props) => {
                    const { cx, cy, payload, dataKey } = props;
                    const statName = payload.stat;

                    const handleDrag = (e: React.MouseEvent<SVGCircleElement>) => {
                      // Basic dragging implementation (horizontal only)
                      const container = (e.target as SVGCircleElement).closest('svg'); // Find the SVG container

                      if (container) {
                        const containerRect = container.getBoundingClientRect();

                        const startX = e.clientX; // Record start X
                        const startValue = (payload as any).value; // Initial stat value
                        const onMove = (moveEvent: MouseEvent) => {
                            // Calculate stat change based on mouse movement
                            const deltaX = moveEvent.clientX - startX; // Get offset from initial point
                            const newValue = Math.round(startValue + (deltaX / 40)); // Adjust factor as needed

                             // Trigger Stat Change using bound handler
                             handleStatChange(statName, newValue);

                        };
                        const onUp = () => {
                          document.removeEventListener('mousemove', onMove);
                          document.removeEventListener('mouseup', onUp);
                        };

                        document.addEventListener('mousemove', onMove);
                        document.addEventListener('mouseup', onUp);
                      }
                    };

                    return (
                        
                            <circle
                                cx={cx}
                                cy={cy}
                                r={5}
                                fill="#fff"
                                strokeWidth={3}
                                stroke={`hsl(var(--chart-${index + 1}))`}
                                style={{ cursor: 'grab' }}
                                onMouseDown={handleDrag}
                            />
                        
                    );
                  }
                }
                />
              ))}
              {/* Define gradients for each stat (for Radar fill) */}
              {dataKeys.map((key, index) => (
                <defs key={`gradient${index}`}>
                  <linearGradient id={`color${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={`hsl(var(--chart-${index + 1}))`} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={`hsl(var(--chart-${index + 1}))`} stopOpacity={0} />
                  </linearGradient>
                </defs>
              ))}
            </RadarChart>
          
        ) : (
          
            "Loading chart..."
          
        )}
       You have {remainingPoints} points remaining.
    
  );
};

export default StatRadarChart;
