"use client";
import { useState } from "react";

export default function Home() {
  
    const [inputValue, setInputValue] = useState("");

    
    return (
      <>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <h2>Current Value: {inputValue}</h2>
      </>
    );
}
