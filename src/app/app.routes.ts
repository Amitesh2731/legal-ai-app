import { Routes } from '@angular/router';
import { AuthGuard, GuestGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // ─── Auth Routes (guests only) ─────────────────────────────────
  {
    path: 'auth',
    canActivate: [GuestGuard],
    loadComponent: () =>
      import('./shared/layouts/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.page').then(m => m.LoginPage)
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.page').then(m => m.RegisterPage)
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./features/auth/forgot-password/forgot-password.page').then(m => m.ForgotPasswordPage)
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./features/auth/reset-password/reset-password.page').then(m => m.ResetPasswordPage)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },

  // ─── Client Routes ─────────────────────────────────────────────
  {
    path: 'client',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['client', 'admin'] },
    loadComponent: () =>
      import('./shared/layouts/client-layout/client-layout.component').then(m => m.ClientLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/client/dashboard/dashboard.page').then(m => m.ClientDashboardPage)
      },
      {
        path: 'cases',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/client/cases/case-list/case-list.page').then(m => m.ClientCaseListPage)
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/client/cases/case-create/case-create.page').then(m => m.ClientCaseCreatePage)
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/client/cases/case-detail/case-detail.page').then(m => m.ClientCaseDetailPage)
          },
          {
            path: ':id/documents/:documentId',
            loadComponent: () =>
              import('./shared/pages/document-detail/document-detail.page').then(m => m.DocumentDetailPage)
          }
        ]
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('./features/client/payments/payment-list/payment-list.page').then(m => m.PaymentListPage)
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/client/notifications/notification-list/notification-list.page').then(m => m.NotificationListPage)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/client/profile/profile.page').then(m => m.ClientProfilePage)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // ─── Advocate Routes ───────────────────────────────────────────
  {
    path: 'advocate',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['advocate', 'admin'] },
    loadComponent: () =>
      import('./shared/layouts/advocate-layout/advocate-layout.component').then(m => m.AdvocateLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/advocate/dashboard/dashboard.page').then(m => m.AdvocateDashboardPage)
      },
      {
        path: 'cases',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/advocate/cases/case-list/case-list.page').then(m => m.AdvocateCaseListPage)
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/advocate/cases/case-detail/case-detail.page').then(m => m.AdvocateCaseDetailPage)
          },
          {
            path: ':id/documents/:documentId',
            loadComponent: () =>
              import('./shared/pages/document-detail/document-detail.page').then(m => m.DocumentDetailPage)
          }
        ]
      },
      {
        path: 'opinions',
        loadComponent: () =>
          import('./features/advocate/opinions/opinion-list/opinion-list.page').then(m => m.OpinionListPage)
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/advocate/notifications/notification-list/notification-list.page').then(m => m.AdvocateNotificationListPage)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/advocate/profile/profile.page').then(m => m.AdvocateProfilePage)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // ─── Default Redirect ─────────────────────────────────────────
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' }
];
