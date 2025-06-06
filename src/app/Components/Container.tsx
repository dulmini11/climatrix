import React from 'react';
import { cn } from '../utils/cn';

export default function Container(props: React.HTMLProps<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        'w-full rounded-xl flex py-4 shadow-sm backdrop-blur-md bg-white/10 border border-white/20',
        props.className
      )}
    />
  );
}
