import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { MockDbProvider } from './context/MockDbContext';
import KirbyPet from './components/KirbyPet';

function App() {
  return (
    <MockDbProvider>
      <RouterProvider router={router} />
      {/* 🐾 커비가 화면을 돌아다니며 잔소리! position:fixed라 항상 최상단에 떠있어요~ */}
      <KirbyPet />
    </MockDbProvider>
  );
}

export default App;
