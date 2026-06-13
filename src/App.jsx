import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { MockDbProvider } from './context/MockDbContext';

function App() {
  return (
    <MockDbProvider>
      <RouterProvider router={router} />
    </MockDbProvider>
  );
}

export default App;
