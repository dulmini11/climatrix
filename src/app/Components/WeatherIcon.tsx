import React from 'react';
import Image from 'next/image';
import { cn } from '@/app/utils/cn';

type Props = React.HTMLProps<HTMLDivElement> & {
  iconName: string;
};

export default function WeatherIcon(props: Props) {
  return (
    <div {...props} className={cn('relative h-20 w-20', props.className)}>
      <Image
        width={100}
        height={100}
        alt="weather-icon"
        className="absolute h-full w-full"
        src={`https://openweathermap.org/img/wn/${props.iconName}@4x.png`}
      />
    </div>
  );
}
