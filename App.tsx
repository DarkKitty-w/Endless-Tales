import React from 'react';
import Home from './src/app/page';
import { Toaster } from "./src/components/ui/toaster";

const App = () => {
  return (
    <>
      <Home />
      <Toaster />
    </>
  );
};

export default App;