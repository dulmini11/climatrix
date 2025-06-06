import React from 'react';
import { cn } from '../utils/cn';
import bgImage from '../../../public/sky.jpeg'; // ✅ image import

export default function Container(props: React.HTMLProps<HTMLDivElement>) {
  return (
    <div
      {...props}
      style={{
        backgroundImage: `url(${bgImage.src})`, // ⬅️ use imported image
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        ...props.style, // keep any other styles passed in
      }}
      className={cn(
        'w-full border rounded-xl flex py-4 shadow-sm',
        props.className
      )}
    />
  );
}
