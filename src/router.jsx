import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import IndexPage from './pages/IndexPage';
import BoardPage from './pages/BoardPage';
import TeacherPage from './pages/TeacherPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <IndexPage />,
  },
  {
    path: '/board/:classId',
    element: <BoardPage />,
  },
  {
    path: '/teacher/:classId',
    element: <TeacherPage />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  }
]);
