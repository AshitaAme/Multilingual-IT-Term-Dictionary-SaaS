'use client';
import { useState } from 'react';

export default function Home() {
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        {/* TODO: Add search and tags components here */}
        {/* <Search></Search>
          <Tags></Tags> */}
      </div>
    </div>
  );
}
