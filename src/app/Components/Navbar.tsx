/** @format */
"use client";

import React, { useState, useEffect } from "react";
import { MdOutlineLocationOn, MdWbSunny, MdMyLocation } from "react-icons/md";
import axios from "axios";
import { loadingCityAtom, placeAtom } from "@/app/atom";
import { useAtom } from "jotai";

type Props = { location?: string };

// Use the same API key as your main component
const API_KEY = "a262c7ae5af3f8c84330e58261f4f650";

// Location mapping for accurate local names
const locationMapping: { [key: string]: string } = {
  "Homagama": "Maharagama",
  "Colombo": "Colombo",
  // Add more mappings as needed
};

// Sri Lankan cities with their approximate coordinates
const sriLankanCities = {
  Maharagama: { lat: 6.8441, lon: 79.9206 },
  Homagama: { lat: 6.8439, lon: 79.9897 },
  Colombo: { lat: 6.9271, lon: 79.8612 },
  Nugegoda: { lat: 6.8649, lon: 79.8997 },
  Kottawa: { lat: 6.8176, lon: 79.9732 },
};

// Helper function to calculate distance between two points in kilometers
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
}

// Function to get the most accurate location name
function getAccurateLocationName(apiLocationName: string, lat: number, lon: number): string {
  // First, check if we have a direct mapping
  if (locationMapping[apiLocationName]) {
    return locationMapping[apiLocationName];
  }
  
  // Find the closest Sri Lankan city
  let closestCity = apiLocationName;
  let minDistance = Infinity;
  
  for (const [cityName, coords] of Object.entries(sriLankanCities)) {
    const distance = calculateDistance(lat, lon, coords.lat, coords.lon);
    if (distance < minDistance && distance < 5) { // Within 5km
      minDistance = distance;
      closestCity = cityName;
    }
  }
  
  return closestCity;
}

// Simple SearchBox component
function SearchBox({ value, onChange, onSubmit }: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="flex relative items-center justify-center h-10">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Search location..."
        className="px-4 py-2 w-[230px] border border-gray-300 rounded-l-md focus:outline-none focus:border-blue-500 h-full"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 h-full"
      >
        Search
      </button>
    </form>
  );
}

export default function Navbar({ location }: Props) {
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [place, setPlace] = useAtom(placeAtom);
  const [_, setLoadingCity] = useAtom(loadingCityAtom);

  // Improved input change handler
  async function handleInputChange(value: string) {
    setCity(value);
    
    if (value.length >= 3) {
      setError("");
      
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/geo/1.0/direct?q=${value}&limit=5&appid=${API_KEY}`
        );

        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          const formattedSuggestions = response.data.map(
            (item: any) => `${item.name}, ${item.country}`
          );
          
          setSuggestions(formattedSuggestions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
          setError("No locations found");
        }
        
      } catch (error: any) {
        console.error("API Error:", error);
        setSuggestions([]);
        setShowSuggestions(false);
        setError(`Search failed: ${error.response?.status || 'Network Error'}`);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setError("");
    }
  }

  function handleSuggestionClick(value: string) {
    setCity(value);
    setShowSuggestions(false);
    setError("");
  }

  // Improved search submit handler
  function handleSubmitSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    if (!city.trim()) {
      setError("Please enter a location");
      return;
    }

    setLoadingCity(true);
    setError("");
    
    // Extract city name (before comma if present)
    const cityOnly = city.split(",")[0].trim();
    
    setTimeout(() => {
      setLoadingCity(false);
      setPlace(cityOnly);
      setShowSuggestions(false);
    }, 500);
  }

  // Improved current location handler with accurate location detection
  function handleCurrentLocation() {
    if (navigator.geolocation) {
      setLoadingCity(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Get weather data using coordinates for accuracy
            const weatherResponse = await axios.get(
              `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
            );
            
            // Try reverse geocoding for better location name
            let locationName = weatherResponse.data.name;
            
            try {
              const geocodeResponse = await axios.get(
                `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=5&appid=${API_KEY}`
              );
              
              if (geocodeResponse.data && geocodeResponse.data.length > 0) {
                // Look for the most specific local area name
                const locations = geocodeResponse.data;
                
                // Prefer local area names over larger administrative areas
                for (const loc of locations) {
                  if (loc.local_names && loc.local_names.en) {
                    locationName = loc.local_names.en;
                    break;
                  }
                }
                
                // If no local name found, use the first result
                if (locationName === weatherResponse.data.name && locations[0]) {
                  locationName = locations[0].name;
                }
              }
            } catch (geocodeError) {
              console.log("Reverse geocoding failed, using weather API location");
            }
            
            // Apply our accurate location mapping
            const accurateLocationName = getAccurateLocationName(locationName, latitude, longitude);
            
            console.log(`Coordinates: ${latitude}, ${longitude}`);
            console.log(`API Location: ${locationName}`);
            console.log(`Accurate Location: ${accurateLocationName}`);
            
            setTimeout(() => {
              setLoadingCity(false);
              setPlace(accurateLocationName);
            }, 500);
            
          } catch (error) {
            console.error("Current location error:", error);
            setLoadingCity(false);
            setError("Failed to get current location weather");
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLoadingCity(false);
          
          // Provide more specific error messages
          switch(error.code) {
            case error.PERMISSION_DENIED:
              setError("Location access denied by user");
              break;
            case error.POSITION_UNAVAILABLE:
              setError("Location information unavailable");
              break;
            case error.TIMEOUT:
              setError("Location request timed out");
              break;
            default:
              setError("Unknown location error");
              break;
          }
        },
        {
          enableHighAccuracy: true, // Request more accurate location
          timeout: 15000, // 15 seconds timeout
          maximumAge: 300000 // 5 minutes cache
        }
      );
    } else {
      setError("Geolocation not supported by this browser");
    }
  }

  return (
    <>
      <nav className="backdrop-blur-md bg-white/20 shadow-md sticky top-0 left-0 z-50 border-b border-white/30">
        <div className="h-[80px] w-full flex justify-between items-center max-w-7xl px-3 mx-auto">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-gray-800 text-3xl">Weather</h2>
            <MdWbSunny className="text-3xl mt-1 text-yellow-300" />
          </div>

          <section className="flex gap-2 items-center">
            <MdMyLocation
              title="Your Current Location"
              onClick={handleCurrentLocation}
              className="text-2xl text-gray-400 hover:opacity-80 cursor-pointer transition-opacity"
            />
            <MdOutlineLocationOn className="text-3xl" />
            <p className="text-slate-900/80 text-sm">{location}</p>
            <div className="relative hidden md:flex">
              <SearchBox
                value={city}
                onSubmit={handleSubmitSearch}
                onChange={(e) => handleInputChange(e.target.value)}
              />
              <SuggestionBox
                showSuggestions={showSuggestions}
                suggestions={suggestions}
                handleSuggestionClick={handleSuggestionClick}
                error={error}
              />
            </div>
          </section>
        </div>
      </nav>

      <section className="flex max-w-7xl px-3 md:hidden">
        <div className="relative">
          <SearchBox
            value={city}
            onSubmit={handleSubmitSearch}
            onChange={(e) => handleInputChange(e.target.value)}
          />
          <SuggestionBox
            showSuggestions={showSuggestions}
            suggestions={suggestions}
            handleSuggestionClick={handleSuggestionClick}
            error={error}
          />
        </div>
      </section>
    </>
  );
}

function SuggestionBox({
  showSuggestions,
  suggestions,
  handleSuggestionClick,
  error,
}: {
  showSuggestions: boolean;
  suggestions: string[];
  handleSuggestionClick: (item: string) => void;
  error: string;
}) {
  const shouldShow = (showSuggestions && suggestions.length > 0) || !!error;
  
  if (!shouldShow) return null;
  
  return (
    <ul className="mb-4 bg-white absolute border top-[44px] left-0 border-gray-300 rounded-md min-w-[200px] flex flex-col gap-1 py-2 px-2 z-50 shadow-lg">
      {error && suggestions.length === 0 && (
        <li className="text-red-500 p-1 text-sm">{error}</li>
      )}
      {suggestions.map((item, i) => (
        <li
          key={i}
          onClick={() => handleSuggestionClick(item)}
          className="cursor-pointer p-1 rounded hover:bg-gray-200 text-sm transition-colors"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}