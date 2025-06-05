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

  // Fixed the function name typo and improved the logic
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

  // Fixed the function name typo
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

  function handleCurrentLocation() {
    if (navigator.geolocation) {
      setLoadingCity(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await axios.get(
              `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
            );
            
            setTimeout(() => {
              setLoadingCity(false);
              setPlace(response.data.name);
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
          setError("Location access denied");
        }
      );
    } else {
      setError("Geolocation not supported by this browser");
    }
  }

  return (
    <>
      <nav className="backdrop-blur-md bg-white/20 shadow-md sticky top-0 left-0 z-50 border-b border-white/30">
        <div className="h-[80px] w-full flex justify-between items-center max-w-7xl px-4 md:px-6 mx-auto text-white">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-white text-3xl font-semibold tracking-wide drop-shadow">Weather</h2>
            <MdWbSunny className="text-3xl mt-1 text-yellow-300" />
          </div>

          <section className="flex gap-2 items-center">
            <MdMyLocation
              title="Your Current Location"
              onClick={handleCurrentLocation}
              className="text-2xl text-gray-400 hover:opacity-80 cursor-pointer"
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
          className="cursor-pointer p-1 rounded hover:bg-gray-200 text-sm"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}