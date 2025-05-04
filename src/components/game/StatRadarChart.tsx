// src/components/game/StatRadarChart.tsx

"use client"

import * as React from "react"
import { useState, useCallback, useEffect } from "react"
import { Label, PolarGrid, PolarRadiusAxis, Radar, RadarChart, PolarAngleAxis, Text } from "recharts" // Added Text
import type { CharacterStats } from "@/types/game-types"; // Import CharacterStats type
import { cn } from "@/lib/utils"; // Utility function
import { HandDrawnStrengthIcon, HandDrawnStaminaIcon, HandDrawnAgilityIcon, HandDrawnMagicIcon, HandDrawnHistoryIcon, HandDrawnAgilityIcon as HandDrawnCharismaIcon } from "@/components/icons/HandDrawnIcons"; // Import icons
import { TOTAL_STAT_POINTS, MIN_STAT_VALUE, MAX_STAT_VALUE } from "@/lib/constants"; // Import from constants file
import { useToast } from "@/hooks/use-toast"; // Import toast
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

interface StatRadarChartProps {
  stats: CharacterStats;
  setStats: React.Dispatch<React.SetStateAction<CharacterStats>>;
  remainingPoints: number;
  setRemainingPoints: React.Dispatch<React.SetStateAction<number>>;
}

const statIcons = {
    Strength: HandDrawnStrengthIcon,
    Agility: HandDrawnAgilityIcon,
    Stamina: HandDrawnStaminaIcon,
    // Placeholder icons for new stats - replace with actual icons later
    Intellect: HandDrawnMagicIcon, // Placeholder (Magic icon)
    Wisdom: HandDrawnHistoryIcon, // Placeholder (History icon)
    Charisma: HandDrawnCharismaIcon, // Placeholder (Agility icon)
};


// Include all 6 stats in the data keys
const dataKeys = ["Strength", "Agility", "Stamina", "Intellect", "Wisdom", "Charisma"];


const StatRadarChart: React.FC<StatRadarChartProps> = ({ stats, setStats, remainingPoints, setRemainingPoints }) => {
  const [isClient, setIsClient] = useState(false); // State to track client-side rendering
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true); // Set to true once component mounts on client
  }, []);

  // Update statArray to include all 6 stats
  const statArray = [
    { stat: "Strength", value: stats.strength, allocated: stats.strength },
    { stat: "Agility", value: stats.agility, allocated: stats.agility },
    { stat: "Stamina", value: stats.stamina, allocated: stats.stamina },
    { stat: "Intellect", value: 1, allocated: 1 }, // TODO: Replace with actual intellect later from state
    { stat: "Wisdom", value: 1, allocated: 1 }, // TODO: Replace with actual wisdom later from state
    { stat: "Charisma", value: 1, allocated: 1 }, // TODO: Replace with actual charisma later from state
  ];

   const handleStatChange = useCallback((statName: string, value: number) => {
        const lowerCaseStatName = statName.toLowerCase() as keyof CharacterStats; // Ensure correct type

        setStats(prevStats => {
            // Ensure all stats exist in prevStats (initialize if missing)
            const currentStats = {
                strength: prevStats.strength ?? MIN_STAT_VALUE,
                stamina: prevStats.stamina ?? MIN_STAT_VALUE,
                agility: prevStats.agility ?? MIN_STAT_VALUE,
                // Add other stats here once they are in CharacterStats type
            };

            // Calculate current total based on ALL stats in CharacterStats type
            // This needs to be updated when Intellect, Wisdom, Charisma are added to the type
            const currentTotal = currentStats.strength + currentStats.stamina + currentStats.agility; // + other stats...

            // Clamp the incoming value
            const clampedValue = Math.max(MIN_STAT_VALUE, Math.min(MAX_STAT_VALUE, value));

            // Calculate the potential new total if this stat is updated
            const potentialTotal = currentTotal - (currentStats[lowerCaseStatName] || MIN_STAT_VALUE) + clampedValue;

            if (potentialTotal <= TOTAL_STAT_POINTS) {
                 const newStats = { ...currentStats, [lowerCaseStatName]: clampedValue };
                 setRemainingPoints(TOTAL_STAT_POINTS - potentialTotal);
                 return newStats;
            } else {
                 // If exceeding total points, possibly prevent the change or just show a warning
                 toast({
                   title: "Stat Limit Reached",
                   description: `Cannot exceed ${TOTAL_STAT_POINTS} total stat points.`,
                   variant: "destructive",
                 });
                 // Return previous stats to prevent exceeding the limit
                 setRemainingPoints(TOTAL_STAT_POINTS - currentTotal);
                 return currentStats; // Return the existing valid state
            }
        });
    }, [setStats, setRemainingPoints, toast]);



  const CustomizedRadarLabel = (props: any) => {
    const { payload, x, y, cx, cy, index, value } = props;
    if (!payload || value === undefined || payload.name === undefined) return null; // Ensure payload and essential fields exist

    const statName = payload.name; // Use payload.name for the stat identifier
    const Icon = statIcons[statName as keyof typeof statIcons] || null; // Find icon or default

    const angle = payload.angle; // Angle in degrees
    const radiusOffset = 25; // How far out from the point to place the label

    // Calculate the position outside the point
    const radianAngle = angle * (Math.PI / 180); // Convert angle to radians
    // Determine the max radius of the chart for label positioning
    const chartRadius = Math.min(cx, cy) * 0.8; // Assuming outerRadius="80%"

    const labelX = cx + chartRadius * Math.cos(-radianAngle) + radiusOffset * Math.cos(-radianAngle);
    const labelY = cy + chartRadius * Math.sin(-radianAngle) + radiusOffset * Math.sin(-radianAngle);


    // Adjust text anchor based on quadrant for better readability
    let textAnchor: "start" | "end" | "middle" = "middle";
    if (angle > 10 && angle < 170) textAnchor = "start"; // Right side
    if (angle > 190 && angle < 350) textAnchor = "end"; // Left side


    return (
        <>
            {Icon ? <Icon className="inline mr-1.5 h-4 w-4" /> : null}
            <Text x={labelX} y={labelY} textAnchor={textAnchor} verticalAnchor="middle" className="text-sm fill-muted-foreground">
              {payload.name} ({value}) {/* Show stat and the allocated value */}
            </Text>
        </>
    );
  };


  return (
    <>
       <h4 className="font-medium text-center text-muted-foreground">Skill Allocation</h4>
       <p className="text-xs text-center text-muted-foreground mb-2">Click and drag the dots to allocate your stats.</p>

       {isClient ? ( // Only render chart content on the client
            <div className="aspect-square relative w-full h-auto max-w-sm mx-auto"> {/* Control size and center */}
                <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="75%" // Adjusted size
                width={300} // Fixed width/height for predictability
                height={300}
                style={{ width: "100%", height: "100%" }}
                data={statArray}
                >
                <defs>
                    {dataKeys.map((key, index) => (
                        <linearGradient key={`color-${key}`} id={`color${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={`hsl(var(--chart-${index + 1}))`} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={`hsl(var(--chart-${index + 1}))`} stopOpacity={0} />
                        </linearGradient>
                    ))}
                </defs>
                <PolarGrid stroke="hsl(var(--border)/0.5)" gridType="polygon" /> {/* Use polygon grid */}
                <PolarAngleAxis dataKey="stat" tick={<CustomizedRadarLabel />} axisLine={false} tickLine={false} /> {/* Customize tick */}
                 {/* Adjust domain to start from MIN_STAT_VALUE if you don't want 0 shown */}
                <PolarRadiusAxis angle={90} domain={[0, MAX_STAT_VALUE]} axisLine={false} tick={false} />
                <Radar
                    name="Stats" // Single radar series
                    dataKey="value"
                    stroke={`hsl(var(--primary))`}
                    fill={`hsl(var(--primary)/0.6)`}
                    fillOpacity={0.6}
                    strokeWidth={2}
                    dot={(props) => {
                        const { cx, cy, payload, index } = props;
                        // Use payload.stat to get the correct stat name
                         if (!payload || payload.stat === undefined) return null; // Ensure payload and stat exist
                        const statName = payload.stat;
                        const chartCenterX = 150; // Midpoint of width=300
                        const chartCenterY = 150; // Midpoint of height=300
                        const outerRadiusPixels = 150 * 0.75; // outerRadius * chartRadius

                        const handleDrag = (e: React.MouseEvent<SVGCircleElement>) => {
                            const svg = (e.target as SVGCircleElement).closest('svg');
                            if (!svg) return;

                            const pt = svg.createSVGPoint();
                            const svgRect = svg.getBoundingClientRect();

                            const onMove = (moveEvent: MouseEvent) => {
                                pt.x = moveEvent.clientX;
                                pt.y = moveEvent.clientY;
                                const transformedPoint = pt.matrixTransform(svg.getScreenCTM()?.inverse());

                                // Calculate distance from center
                                const dx = transformedPoint.x - chartCenterX;
                                const dy = transformedPoint.y - chartCenterY;

                                // Project the mouse position onto the stat's axis
                                const angleRad = payload.angle * (Math.PI / 180);
                                const projectedDistance = dx * Math.cos(-angleRad) + dy * Math.sin(-angleRad);

                                // Calculate value based on projected distance
                                let newValue = Math.round((projectedDistance / outerRadiusPixels) * MAX_STAT_VALUE);
                                newValue = Math.max(MIN_STAT_VALUE, Math.min(MAX_STAT_VALUE, newValue)); // Clamp within min/max

                                // Only update if the value is different to avoid unnecessary re-renders
                                // Also check if the new value would exceed remaining points
                                const currentStatValue = stats[statName.toLowerCase() as keyof CharacterStats] || MIN_STAT_VALUE;
                                const diff = newValue - currentStatValue;

                                if (newValue !== currentStatValue && (remainingPoints - diff >= 0)) {
                                     handleStatChange(statName, newValue);
                                 } else if (remainingPoints - diff < 0 && diff > 0) {
                                      // Optionally provide feedback that points are maxed out
                                      // console.log("Cannot increase further, no points left or stat maxed");
                                 }

                            };

                            const onUp = () => {
                                document.removeEventListener('mousemove', onMove);
                                document.removeEventListener('mouseup', onUp);
                                svg.style.cursor = 'default'; // Reset cursor
                            };

                            svg.style.cursor = 'grabbing'; // Change cursor during drag
                            document.addEventListener('mousemove', onMove);
                            document.addEventListener('mouseup', onUp);
                        };

                        return (
                            <circle
                                cx={cx}
                                cy={cy}
                                r={6} // Slightly larger dot
                                fill="hsl(var(--background))"
                                strokeWidth={2}
                                stroke={`hsl(var(--chart-${index + 1}))`}
                                style={{ cursor: 'grab' }}
                                onMouseDown={handleDrag}
                                onDragStart={(e) => e.preventDefault()} // Prevent default drag behavior
                            />
                        );
                    }}
                    activeDot={{ r: 8, style: { cursor: 'grabbing' } }} // Style for active dot
                />
                </RadarChart>
            </div>
        ) : (
          <div className="aspect-square w-full flex items-center justify-center">
            <Skeleton className="w-3/4 h-3/4 rounded-full" />
          </div>
        )}

       <p className={`text-sm font-medium text-center mt-4 ${remainingPoints < 0 ? 'text-destructive animate-pulse' : remainingPoints > 0 ? 'text-orange-500 dark:text-orange-400' : 'text-primary'}`}>
           {remainingPoints < 0 ? `Overallocated by ${Math.abs(remainingPoints)} points!` : `${remainingPoints} points remaining.`}
        </p>

    </>
  );
};

export default StatRadarChart; // Export as default
