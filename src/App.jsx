import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import KirbyPet from './components/KirbyPet';

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <KirbyPet />
    </>
  );
}

export default App;
