'use client';

import { useQuery } from "@tanstack/react-query";
import Navbar from "./Components/Navbar";
import axios from "axios";

//... other type declarations

export default function Home() {
  const { isPending, error, data } = useQuery({
    queryKey: ['repoData'],
    queryFn: async () => 
    {
      const{data}= await axios.get("https://api.openweathermap.org/data/2.5/forecast?q=Colombo&appid=a262c7ae5af3f8c84330e58261f4f650&cnt=56");
      return data;
    }
    //   {
    //   const res = await fetch('https://api.openweathermap.org/data/2.5/forecast?q=Colombo&appid=a262c7ae5af3f8c84330e58261f4f650&cnt=56');
    //   if (!res.ok) throw new Error('Failed to fetch weather data');
    //   return res.json();
    // },
  });

  console.log("data",data);

  if (isPending) return 'Loading...';
  if (error) return 'An error occurred.';

  return (
    <div className="flex flex-col gap-4 bg-gray-100 min-h-screen">
      <Navbar />
      <main className="px-3 max-w-7xl mx-auto flex-col gap-9 w-full pd-10 pt-4"></main>
    </div>
  );
}
