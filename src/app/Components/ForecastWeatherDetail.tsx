import React from 'react'
import Container from './Container'
import WeatherIcon from './WeatherIcon'
import { WeatherDetailProps } from './WeatherDetails';
import { convertKelvinTocelsius } from '../utils/convertKelvinTocelsius';
import { MdDescription } from 'react-icons/md';

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

        <div className='flex flex-col px-4'>
          <span className='text-5xl'>{convertKelvinTocelsius(temp ?? 0)}°</span>
          <p className='text-xs space-x-1 whitespace-nowrap'></p>
          <span>Feels like</span>
          <span>{convertKelvinTocelsius(feels_like ?? 0)}°</span>
          <p className='capitalixe'>{description}</p>
        </div>
      </section>
    </Container>
  )
}