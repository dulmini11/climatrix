import React from 'react'
import { IoMdSunny } from "react-icons/io";
import { TbCurrentLocation } from "react-icons/tb";
import { CiLocationOn } from "react-icons/ci";
import SearchBox from './SearchBox';

type Props = {};

export default function Navbar({}: Props) {
  return (
    <nav className="shadow-sm sticky top-0 left-0 z-50 bg-white">
        <div className='h-[80px]  w-full  flex  justify -between items-center max-w-7x1 px-3 mx-auto'>
            <p className='flex items-center justify center gap-2 borde'></p>
            <h2 className='text-gray-500 text-3xl'>Weather</h2>
            <IoMdSunny className='text-3xl mt-1 text-yellow-300'/>
            <section className='flex gap-2 items-center'></section>
            <TbCurrentLocation className='text-2xl text-gray-400 hover:opacity-80 cursor-pointer ' />
            <CiLocationOn className='text-3xl' />
            <p className='text-slate-900/80 text-sm'>Srilanka</p>
            <div><SearchBox/></div>
            </div>
            </nav>
  );
}