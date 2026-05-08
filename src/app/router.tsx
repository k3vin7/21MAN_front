import { createBrowserRouter } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { RootLayout } from '@/layouts/RootLayout';
import { AuthPage } from '@/pages/AuthPage';
import { AuthorDashboardPage } from '@/pages/AuthorDashboardPage';
import { HomePage } from '@/pages/HomePage';
import { NewPullRequestPage } from '@/pages/NewPullRequestPage';
import { NewRepositoryPage } from '@/pages/NewRepositoryPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { PullRequestReviewPage } from '@/pages/PullRequestReviewPage';
import { RepositoryDetailPage } from '@/pages/RepositoryDetailPage';
import { SearchPage } from '@/pages/SearchPage';
import { UserProfilePage } from '@/pages/UserProfilePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'search',
        element: <SearchPage />,
      },
      {
        path: 'login',
        element: <AuthPage mode="login" />,
      },
      {
        path: 'register',
        element: <AuthPage mode="register" />,
      },
      {
        path: 'r/new',
        element: <NewRepositoryPage />,
      },
      {
        path: 'r/:repoId',
        element: <RepositoryDetailPage />,
      },
      {
        path: 'r/:repoId/pr/new',
        element: <NewPullRequestPage />,
      },
      {
        path: 'r/:repoId/pr/:prId/review',
        element: <PullRequestReviewPage />,
      },
      {
        path: 'r/:repoId/dashboard',
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <AuthorDashboardPage />,
          },
        ],
      },
      {
        path: 'u/:username',
        element: <UserProfilePage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

