// src/components/game/WorldMapDisplay.tsx
"use client";

import React, { useState } from "react";
import { useGame } from "../../context/GameContext";
import { CardboardCard, CardContent, CardHeader, CardTitle } from "./CardboardCard";
import { HandDrawnMapIcon } from "../icons/HandDrawnIcons";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { MapPin, Eye, EyeOff, Compass } from "lucide-react";
import type { Location } from "../../types/game-types";

export function WorldMapDisplay() {
  const { state, dispatch } = useGame();
  const { worldMap, character } = state;
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  const locations = worldMap.locations;
  const currentLocationId = worldMap.currentLocationId;
  const currentLocation = locations.find(loc => loc.id === currentLocationId);

  // SVG viewBox dimensions (0-100 coordinate system)
  const viewBoxWidth = 100;
  const viewBoxHeight = 100;

  // Get connected locations that are discovered
  const getConnectedDiscoveredLocations = (location: Location): Location[] => {
    return location.connectedLocationIds
      .map(id => locations.find(loc => loc.id === id))
      .filter((loc): loc is Location => loc !== undefined && loc.discovered);
  };

  // Handle travel to a connected location
  const handleTravel = (locationId: string) => {
    const targetLocation = locations.find(loc => loc.id === locationId);
    if (!targetLocation) return;
    
    // Check if connected to current location
    if (!currentLocation?.connectedLocationIds.includes(locationId)) {
      return;
    }

    dispatch({ type: "SET_CURRENT_LOCATION", payload: locationId });
    setSelectedLocationId(null);
  };

  // Render edges between discovered locations
  const renderEdges = () => {
    const edges: { from: Location; to: Location }[] = [];
    const discoveredLocs = locations.filter(loc => loc.discovered);
    
    discoveredLocs.forEach(fromLoc => {
      fromLoc.connectedLocationIds.forEach(toId => {
        const toLoc = locations.find(loc => loc.id === toId);
        if (toLoc && toLoc.discovered) {
          // Avoid duplicate edges (only add if fromLoc.id < toLoc.id)
          if (fromLoc.id < toLoc.id) {
            edges.push({ from: fromLoc, to: toLoc });
          }
        }
      });
    });

    return edges.map(({ from, to }) => {
      const isCurrentPath = (from.id === currentLocationId && to.discovered) || 
                           (to.id === currentLocationId && from.discovered);
      return (
        <line
          key={`${from.id}-${to.id}`}
          x1={`${from.x}%`}
          y1={`${from.y}%`}
          x2={`${to.x}%`}
          y2={`${to.y}%`}
          stroke={isCurrentPath ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
          strokeWidth={isCurrentPath ? "3" : "1.5"}
          strokeDasharray={isCurrentPath ? "none" : "4,4"}
          className="transition-all duration-300"
        />
      );
    });
  };

  // Render location nodes
  const renderLocations = () => {
    return locations.filter(loc => loc.discovered).map(loc => {
      const isCurrent = loc.id === currentLocationId;
      const isSelected = loc.id === selectedLocationId;
      const isConnectedToCurrent = currentLocation?.connectedLocationIds.includes(loc.id) ?? false;
      
      let nodeColor = "hsl(var(--muted-foreground))";
      let nodeSize = 6;
      if (isCurrent) {
        nodeColor = "hsl(var(--primary))";
        nodeSize = 10;
      } else if (isConnectedToCurrent) {
        nodeColor = "hsl(var(--accent))";
        nodeSize = 8;
      }

      return (
        <g key={loc.id}>
            <circle
              cx={`${loc.x}%`}
              cy={`${loc.y}%`}
              r={nodeSize}
              fill={nodeColor}
              stroke="hsl(var(--background))"
              strokeWidth="2"
              className="cursor-pointer transition-all hover:scale-125"
              role="button"
              tabIndex={0}
              aria-label={`Select location: ${loc.name}`}
              onClick={() => setSelectedLocationId(isSelected ? null : loc.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedLocationId(isSelected ? null : loc.id);
                }
              }}
            />
          {isCurrent && (
            <circle
              cx={`${loc.x}%`}
              cy={`${loc.y}%`}
              r="14"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="1.5"
              className="animate-pulse"
            />
          )}
          <text
            x={`${loc.x}%`}
            y={`${loc.y + 8}%`}
            textAnchor="middle"
            className="text-[8px] fill-foreground font-medium pointer-events-none"
          >
            {loc.name}
          </text>
        </g>
      );
    });
  };

  const selectedLocation = locations.find(loc => loc.id === selectedLocationId);
  const canTravel = selectedLocation && currentLocation?.connectedLocationIds.includes(selectedLocation.id);

  return (
    <TooltipProvider>
      <CardboardCard className="mb-4 bg-card/90 backdrop-blur-sm">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <HandDrawnMapIcon className="w-5 h-5" /> World Map
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4 flex flex-col">
          {/* Current location info */}
          {currentLocation && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Current: <span className="font-medium text-foreground">{currentLocation.name}</span></span>
              <span className="text-xs ml-auto">{locations.filter(l => l.discovered).length} / {locations.length} discovered</span>
            </div>
          )}

          {/* SVG Map */}
          <div className="relative w-full aspect-square border border-border rounded-md bg-muted/20 p-2">
            <svg
              viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
              className="w-full h-full"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Background grid (subtle) */}
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="hsl(var(--border))" strokeWidth="0.2" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
              
              {renderEdges()}
              {renderLocations()}
            </svg>
          </div>

          {/* Selected location details */}
          {selectedLocation && (
            <div className="mt-3 p-3 border border-border rounded-md bg-background/50">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold flex items-center gap-1">
                    {selectedLocation.name}
                    {!selectedLocation.discovered && <EyeOff className="w-3 h-3 text-muted-foreground" />}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedLocation.description}</p>
                  <p className="text-xs mt-1">
                    Type: <span className="capitalize">{selectedLocation.type}</span>
                  </p>
                </div>
                {canTravel && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTravel(selectedLocation.id)}
                    className="h-7 text-xs"
                  >
                    <Compass className="w-3 h-3 mr-1" />
                    Travel
                  </Button>
                )}
              </div>
            </div>
          )}

          {!selectedLocation && (
            <p className="text-xs text-muted-foreground italic text-center mt-2">
              Click on a location to view details.
            </p>
          )}
        </CardContent>
      </CardboardCard>
    </TooltipProvider>
  );
}