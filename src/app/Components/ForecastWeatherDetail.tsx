import React from 'react'
import Container from './Container'
import WeatherIcon from './WeatherIcon'
import { WeatherDetailProps } from './WeatherDetails';

export interface ForecastWeatherDetailProps extends WeatherDetailProps{
  visibility?: string;
  humidity?: string;
  windSpeed?: string;
  airPressure?: string;
  sunrise?: string;
  sunset?: string;
}


export default function ForecastWeatherDetail( props : ForecastWeatherDetailProps) {
  const{  
  visibility = "25 km",
  humidity = "61%",
  windSpeed = "7 km/h",
  airPressure = "1012 hPa",
  sunrise = "6:20",
  sunset = "18:48"
} = props;

  return (
    <Container className='gap-4'>
      <section className='flex gap-4 items-center px-4'>
        <div>
          <WeatherIcon iconName='={weatherIcon}'/>
          <p>{date}</p>
          <p className='text-sm'>{day}</p>
        </div>
      </section>
    </Container>
  )
}