'use client';

import { useQuery } from "@tanstack/react-query";
import Navbar from "./Components/Navbar";
import { format, fromUnixTime, parseISO } from 'date-fns';
import { useAtom } from "jotai";
import { loadingCityAtom, placeAtom } from "@/app/atom";

import axios from "axios";
import Container from "./Components/Container";
import { convertKelvinTocelsius } from "./utils/convertKelvinTocelsius";
import WeatherIcon from "./Components/WeatherIcon";
import WeatherDetails from "./Components/WeatherDetails";
import { metersToKilometers } from "./utils/metersToKilometers";
import { convertWindSpeed } from "./utils/convertWindSpeed";
import ForecastWeatherDetail from "./Components/ForecastWeatherDetail";

const API_KEY = "a262c7ae5af3f8c84330e58261f4f650"; // Consider moving this to environment variables

// Function to determine weather type based on icon or description
const getWeatherType = (weatherIcon, description) => {
  const icon = weatherIcon?.toLowerCase() || '';
  const desc = description?.toLowerCase() || '';
  
  // Clear/Sunny conditions
  if (icon.includes('01') || desc.includes('clear') || desc.includes('sunny')) {
    return 'sunny';
  }
  
  // Rainy conditions
  if (icon.includes('09') || icon.includes('10') || icon.includes('11') || 
      desc.includes('rain') || desc.includes('drizzle') || desc.includes('thunder') || desc.includes('storm')) {
    return 'rainy';
  }
  
  // Cloudy conditions (default)
  return 'cloudy';
};

// Function to get background class based on weather type
const getWeatherBackgroundClass = (weatherType) => {
  switch (weatherType) {
    case 'sunny':
      return 'sunny-bg';
    case 'rainy':
      return 'rainy-bg';
    case 'cloudy':
    default:
      return 'cloudy-bg';
  }
};

// Function to get forecast item background class
const getForecastItemClass = (weatherType) => {
  switch (weatherType) {
    case 'sunny':
      return 'forecast-item-sunny';
    case 'rainy':
      return 'forecast-item-rainy';
    case 'cloudy':
    default:
      return 'forecast-item-cloudy';
  }
};

export default function Home() {
  const [place] = useAtom(placeAtom);
  const [loadingCity] = useAtom(loadingCityAtom);
  
  // Use the selected place or default to Colombo
  const currentLocation = place || "Colombo";

  const { isPending, error, data, refetch } = useQuery({
    queryKey: ['weatherData', currentLocation],
    queryFn: async () => {
      const { data } = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${currentLocation}&appid=${API_KEY}&cnt=56`
      );
      return data;
    },
    enabled: !loadingCity, // Don't fetch while city is loading
  });

  const firstData = data?.list[0];
  console.log("data", data);
  console.log("current location", currentLocation);

  // Get current weather type for main background
  const currentWeatherType = getWeatherType(firstData?.weather[0]?.icon, firstData?.weather[0]?.description);
  const mainBackgroundClass = getWeatherBackgroundClass(currentWeatherType);

  const uniqueDates = [
    ...new Set(
      data?.list?.map(
        (entry) => new Date(entry.dt * 1000).toISOString().split("T")[0]
      )
    )
  ];

  const firstDataForEachDate = uniqueDates.map((date) => {
    return data?.list?.find((entry) => {
      const entryDate = new Date(entry.dt * 1000).toISOString().split("T")[0];
      const entryHour = new Date(entry.dt * 1000).getHours();
      return entryDate === date && entryHour >= 6;
    });
  });

  if (isPending || loadingCity)
    return (
      <div className="weather-loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading weather data...</p>
        </div>
      </div>
    );

  if (error) {
    return (
      <div className="weather-container">
        <Navbar location={currentLocation} />
        <div className="error-container">
          <div className="error-content">
            <p className="error-title">Error loading weather data</p>
            <p className="error-subtitle">Please try searching for a different location</p>
            <button 
              onClick={() => refetch()} 
              className="retry-button"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        /* Base weather container with dynamic background */
        .weather-container {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          transition: all 1s ease;
        }

        /* Sunny Background */
        .sunny-bg {
          background: linear-gradient(135deg, #FFD700 0%, #FF8C00 50%, #FF6347 100%);
        }
        
        .sunny-bg::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            linear-gradient(45deg, transparent 40%, rgba(255, 255, 255, 0.05) 50%, transparent 60%);
          animation: sunShimmer 8s ease-in-out infinite;
          pointer-events: none;
        }

        /* Cloudy Background */
        .cloudy-bg {
          background: linear-gradient(135deg, #87CEEB 0%, #4682B4 50%, #2F4F4F 100%);
        }
        
        .cloudy-bg::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(ellipse at 30% 20%, rgba(255, 255, 255, 0.3) 0%, transparent 60%),
            radial-gradient(ellipse at 70% 40%, rgba(255, 255, 255, 0.2) 0%, transparent 50%),
            radial-gradient(ellipse at 20% 60%, rgba(255, 255, 255, 0.25) 0%, transparent 40%);
          animation: cloudFloat 12s ease-in-out infinite;
          pointer-events: none;
        }

        /* Rainy Background */
        .rainy-bg {
          background: linear-gradient(135deg, #2C3E50 0%, #34495E 50%, #1C2833 100%);
        }
        
        .rainy-bg::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            linear-gradient(110deg, transparent 40%, rgba(255, 255, 255, 0.03) 42%, rgba(255, 255, 255, 0.03) 44%, transparent 46%),
            linear-gradient(120deg, transparent 60%, rgba(255, 255, 255, 0.02) 62%, rgba(255, 255, 255, 0.02) 64%, transparent 66%);
          animation: rainDrop 1.5s linear infinite;
          pointer-events: none;
        }

        /* Forecast Item Backgrounds */
        .forecast-item-sunny {
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 140, 0, 0.1) 100%);
          border: 1px solid rgba(255, 215, 0, 0.3);
        }

        .forecast-item-cloudy {
          background: linear-gradient(135deg, rgba(135, 206, 235, 0.2) 0%, rgba(70, 130, 180, 0.1) 100%);
          border: 1px solid rgba(135, 206, 235, 0.3);
        }

        .forecast-item-rainy {
          background: linear-gradient(135deg, rgba(44, 62, 80, 0.3) 0%, rgba(52, 73, 94, 0.2) 100%);
          border: 1px solid rgba(44, 62, 80, 0.4);
        }

        /* Animations */
        @keyframes sunShimmer {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 0.4; }
        }

        @keyframes cloudFloat {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(20px); }
        }

        @keyframes rainDrop {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }

        .weather-loading {
          min-height: 100vh;
          background: linear-gradient(135deg,rgb(0, 0, 0) 0%,rgb(15, 47, 71) 50%, #a29bfe 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loading-content {
          text-align: center;
          color: white;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        .loading-text {
          font-size: 18px;
          font-weight: 500;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          padding: 20px;
        }

        .error-content {
          text-align: center;
          background: rgba(255, 255, 255, 0.21);
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
        }

        .error-title {
          color: #e74c3c;
          font-size: 20px;
          margin-bottom: 10px;
          font-weight: 600;
        }

        .error-subtitle {
          color: #7f8c8d;
          margin-bottom: 20px;
        }

        .retry-button {
          background: linear-gradient(135deg, #74b9ff, #0984e3);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .retry-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(116, 185, 255, 0.4);
        }

        .main-content {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .weather-section {
          background: rgba(255, 255, 255, 0.19);
          backdrop-filter: blur(20px);
          border-radius: 25px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          position: relative;
          overflow: hidden;
        }

        .weather-section::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 15px;
        }

        .today-header {
          display: flex;
          gap: 10px;
          align-items: end;
          margin-bottom: 20px;
        }

        .today-header h2 {
          font-size: 2.5rem;
          color:rgb(252, 252, 252);
          margin: 0;
        }

        .today-header .date {
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .temperature-section {
          background: linear-gradient(135deg,rgb(1, 8, 42),rgb(22, 46, 184));
          color: #fff;
          padding: 30px;
          border-radius: 20px;
          margin-bottom: 20px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(1, 1, 16, 0.25);
          transition: transform 0.3s ease;
        }

        .temperature-section:hover {
          transform: translateY(-3px);
        }

        .temperature-section::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%);
          animation: pulse 8s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.2;
          }
        }

        .temp-display {
          font-size: 4rem;
          font-weight: 300;
          margin-bottom: 10px;
          position: relative;
          z-index: 1;
        }

        .feels-like {
          font-size: 1rem;
          opacity: 0.9;
          margin-bottom: 10px;
          position: relative;
          z-index: 1;
        }

        .temp-range {
          display: flex;
          gap: 20px;
          font-size: 1rem;
          position: relative;
          z-index: 1;
        }

        .hourly-forecast {
          display: flex;
          gap: 20px;
          overflow-x: auto;
          padding: 20px 0;
          background: rgba(116, 185, 255, 0.1);
          border-radius: 15px;
        }

        .hourly-item {
          flex: none;
          text-align: center;
          padding: 15px;
          background: rgba(255, 255, 255, 0.21);
          border-radius: 12px;
          min-width: 80px;
          transition: all 0.3s ease;
          color: white;
        }

        .hourly-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }

        .forecast-section {
          margin-top: 40px;
        }

        .forecast-title {
          font-size: 2rem;
          color: rgb(255, 255, 255);
          margin-bottom: 25px;
          text-align: center;
          position: relative;
        }

        .forecast-title::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 3px;
          background: linear-gradient(90deg, #74b9ff, #0984e3);
          border-radius: 2px;
        }

        .forecast-item {
          backdrop-filter: blur(10px);
          border-radius: 18px;
          padding: 25px;
          margin-bottom: 15px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .forecast-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
        }

        @media (max-width: 768px) {
          .weather-details-section {
            flex-direction: column;
          }
          
          .main-content {
            padding: 15px;
          }
          
          .weather-section {
            padding: 20px;
          }
          
          .temp-display {
            font-size: 3rem;
          }
          
          .today-header h2 {
            font-size: 2rem;
          }
        }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        .weather-section:hover::before {
          animation: shimmer 2s infinite;
        }
      `}</style>

      <div className={`weather-container ${mainBackgroundClass}`}>
        <Navbar location={currentLocation} />
        <main className="main-content">
          {/*today*/}
          <section className="weather-section">
            <div className="today-header">
              <h2>{format(parseISO(firstData?.dt_txt ?? ''), 'EEEE')}</h2>
              <p className="date">({format(parseISO(firstData?.dt_txt ?? ''), 'dd.MM.yyyy')})</p>
            </div>
            
            <div className="temperature-section">
              <div className="temp-display">
                {convertKelvinTocelsius(firstData?.main.temp ?? 296.37)}°
              </div>
              <p className="feels-like">
                Feels like {convertKelvinTocelsius(firstData?.main.feels_like ?? 0)}°
              </p>
              <div className="temp-range">
                <span>{convertKelvinTocelsius(firstData?.main.temp_min ?? 0)}°↓</span>
                <span>{convertKelvinTocelsius(firstData?.main.temp_max ?? 0)}°↑</span>
              </div>
            </div>

            {/* Time and weather icon */}
            <div className="hourly-forecast">
              {data?.list?.map((d, i) => (
                <div key={i} className="hourly-item">
                  <p>{format(parseISO(d.dt_txt), "h:mm a")}</p>
                  <WeatherIcon iconName={d.weather[0].icon} />
                  <p>{convertKelvinTocelsius(d?.main.temp ?? 0)}°</p>
                </div>
              ))}
            </div>

            {/* left and right in same row */}
            <div className="flex flex-row gap-4 items-center justify-between mt-5">
              {/* Left */}
              <Container className="w-fit justify-center flex-col px-4 items-center">
                <p className="capitalize text-center text-white">{firstData?.weather[0].description}</p>
                <WeatherIcon iconName={firstData?.weather[0].icon ?? "01d"} />
              </Container>

              {/* Right */}
              <Container className="bg-white/10 backdrop-blur-md border border-white/30 rounded-xl px-6 gap-4 justify-between overflow-x-auto shadow-md">
                <WeatherDetails
                  visibility={metersToKilometers(firstData?.visibility ?? 10000)}
                  airPressure={`${firstData?.main.pressure} hpa`}
                  humidity={`${firstData?.main.humidity}%`}
                  sunrise={format(fromUnixTime(data?.city.sunrise ?? 1702949452), "H:mm")}
                  sunset={format(fromUnixTime(data?.city.sunset ?? 1702949452), "H:mm")}
                  windSpeed={convertWindSpeed(firstData?.wind.speed ?? 1.64)}
                />
              </Container>
            </div>
          </section>

          {/* 7 day forecast data */}
          <section className="weather-section">
            <div className="forecast-section">
              <h3 className="forecast-title">7-Day Forecast</h3>
              {firstDataForEachDate.map((d, i) => {
                const forecastWeatherType = getWeatherType(d?.weather[0]?.icon, d?.weather[0]?.description);
                const forecastItemClass = getForecastItemClass(forecastWeatherType);
                
                return (
                  <div key={i} className={`forecast-item ${forecastItemClass}`}>
                    <ForecastWeatherDetail
                      description={d?.weather[0].description ?? ""}
                      weatherIcon={d?.weather[0].icon ?? "01d"}
                      date={d?.dt_txt ? format(parseISO(d.dt_txt), "EEEE") : "Unknown"}
                      day={d?.dt_txt ? format(parseISO(d.dt_txt), "EEEE") : "Unknown"}
                      feels_like={d?.main.feels_like ?? 0}
                      temp={d?.main.temp ?? 0}
                      temp_max={d?.main.temp_max ?? 0}
                      temp_min={d?.main.temp_min ?? 0}
                      airPressure={`${d?.main.pressure} hPa`}
                      humidity={`${d?.main.humidity}%`}
                      sunrise={format(fromUnixTime(data?.city.sunrise ?? 1702517657), "H:mm")}
                      sunset={format(fromUnixTime(data?.city.sunset ?? 1702517657), "H:mm")}
                      visibility={`${metersToKilometers(d?.visibility ?? 10000)}`}
                      windSpeed={convertWindSpeed(d?.wind.speed ?? 1.64)}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}