'use client';

import { useQuery } from "@tanstack/react-query";
import Navbar from "./Components/Navbar";
import { format, parseISO } from 'date-fns';

import axios from "axios";
import Container from "./Components/Container";
import { convertKelvinTocelsius } from "./utils/convertKelvinTocelsius";

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

  const firstData = data?.list[0];
  console.log("data",data);

  if (isPending) return 'Loading...';
  if (error) return 'An error occurred.';

  return (
    <div className="flex flex-col gap-4 bg-gray-100 min-h-screen">
      <Navbar />
      <main className="px-3 max-w-7xl mx-auto flex-col gap-9 w-full pd-10 pt-4">
        {/*today*/}
        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="flex gap-1 text-2xl items-end">
              <p>{format(parseISO(firstData?.dt_txt ??''),'EEEE')}</p>
              <p className="text-lg">({format(parseISO(firstData?.dt_txt ??''),'dd.MM.yyyy')})</p>
            </h2>
            <Container className="gap-10 px-6 items-center">
              <div className="flex flex-col px-4">
                <span className="text-5xl">
                  {convertKelvinTocelsius(firstData?.main.temp ?? 296.37)}°
                </span>
                <p className="text-xs space-x-1 whitespace-nowrap">
                  <span>Feels like</span>
                  <span>{convertKelvinTocelsius(firstData?.main.feels_like ?? 0)}°
                  </span> 
                  <p className="text-xs space-x-2">
                    <span>
                  {convertKelvinTocelsius(firstData?.main.temp_min ?? 0)}°↓{""}
                </span>
                <span>
                  {""}
                  {convertKelvinTocelsius(firstData?.main.temp_max ?? 0)}°↑
                </span>
                  </p>
                  {/* <span>Feels like</span>
                  <span>{convertKelvinTocelsius(firstData?.main.feels_like ?? 0)}°
                  </span> */}
                </p>
              </div>
            </Container>
          </div>
        </section>
        {/*7 day forcast data*/}
        <section></section>
      </main>
    </div>
  );
}
