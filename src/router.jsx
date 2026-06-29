import { createBrowserRouter, Navigate, Outlet, useParams } from 'react-router-dom';
import IndexPage from './pages/IndexPage';
import BoardPage from './pages/BoardPage';
import TeacherPage from './pages/TeacherPage';
import { MockDbProvider } from './context/MockDbContext';

function ClassLayout() {
  const { classId } = useParams();
  return (
    <MockDbProvider classId={classId}>
      <Outlet />
    </MockDbProvider>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <IndexPage />,
  },
  {
    element: <ClassLayout />,
    children: [
      { path: '/board/:classId',   element: <BoardPage /> },
      { path: '/teacher/:classId', element: <TeacherPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  }
]);
