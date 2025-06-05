import React from 'react';
import Image from 'next/image';
import { cn } from '../utils/cn';

type Props = {
  iconName: string;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export default function WeatherIcon({ iconName, className, ...restProps }: Props) {
  return (
    <div {...restProps} className={cn('relative h-20 w-20', className)}>
      <Image
        width={100}
        height={100}
        alt="weather-icon"
        src={`https://openweathermap.org/img/wn/${iconName}@4x.png`}
        className="absolute h-full w-full"
      />
    </div>
  );
}