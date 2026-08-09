import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl md:text-6xl font-serif text-primary mb-4">Testshop</h1>
      <p className="text-lg md:text-xl text-secondary max-w-2xl text-center mb-8">
        Welcome to the elegant clothing brand storefront.
      </p>
      <button className="bg-primary text-surface px-8 py-3 rounded hover:bg-accent transition-colors">
        Shop Now
      </button>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
