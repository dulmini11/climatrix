import React from 'react'
import Container from './Container'
import WeatherIcon from './WeatherIcon'
import WeatherDetails, { WeatherDetailProps } from './WeatherDetails';
import { convertKelvinTocelsius } from '../utils/convertKelvinTocelsius';

export interface ForecastWeatherDetailProps extends WeatherDetailProps {
  visibility?: string;
  humidity?: string;
  windSpeed?: string;
  airPressure?: string;
  sunrise?: string;
  sunset?: string;
  
  weatherIcon?: string;
  date?: string;
  day?: string;
  temp?: number;
  feels_like?: number;
  description?: string;
}

export default function ForecastWeatherDetail(props: ForecastWeatherDetailProps) {
  const {
    visibility = "25 km",
    humidity = "61%",
    windSpeed = "7 km/h",
    airPressure = "1012 hPa",
    sunrise = "6:20",
    sunset = "18:48",

    weatherIcon = 'defaultIcon',
    date = '',
    day = '',
    temp = 0,
    feels_like = 0,
    description = ''
  } = props;

  return (
    <Container className='gap-4'>
      {/*left*/}
      <section className='flex gap-4 items-center px-4'>
        <div className='flex flex-col gap-1 items-center'>
          <WeatherIcon iconName={weatherIcon} />
          <p>{date}</p>
          <p className='text-sm'>{day}</p>
        </div>

        <div className='flex flex-col px-4'>
          <span className='text-5xl'>{convertKelvinTocelsius(temp)}°</span>
          <p className='text-xs space-x-1 whitespace-nowrap'></p>
          <span>Feels like</span>
          <span>{convertKelvinTocelsius(feels_like ?? 0)}°</span>
          <p className='capitalize'>{description}</p>
        </div>
      </section>
      {/*right*/}
      <section className='overflow-x-auto flex justify-between gap-4 px-4 w-full pr-10'>
      <WeatherDetails{...props}/>
      </section>
    </Container>
  )
}
