import { CanActivateFn, Router, Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Landing } from './app/pages/landing.page';
import { LayoutDefault } from './app/layouts/default.layout';

export const adminGuard: CanActivateFn = (next, state) => {
  const router = inject(Router);
  // const selfService = inject(SelfService)

  return new Promise((resolve) => {
    // selfService.getIsAdmin().subscribe((res) => {
    //   if (res) return resolve(true)
    //   return resolve(
    //     router.navigate(["/error"], {
    //       queryParams: { title: "Not Authorized", description: "Only admins are authorized to access this page"}
    //     })
    //   )
    // })
  });
};

const routeConfig: Routes = [
  {
    path: '',
    component: LayoutDefault,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () => import('./app/pages/landing.page').then((m) => m.Landing),
        title: 'Home page',
      },
      {
        path: 'login',
        loadComponent: () => import('./app/pages/user/auth').then((m) => m.AuthComponent),
        title: 'Login',
      },
      {
        path: 'request-pw-change',
        loadComponent: () => import('./app/pages/user/request-pw-change.page').then((m) => m.RequestPwChange),
        title: 'Request New Password',
      },
      {
        path: 'update-password',
        loadComponent: () => import('./app/pages/user/reset-pw.page').then((m) => m.ResetPassword),
        title: 'Reset Password',
      },
      {
        path: 'manage-users',
        loadComponent: () => import('./app/pages/user/manage.page').then((m) => m.PageManageUsers),
        title: 'Manage Users',
      },
      // {
      //   path: 'card/:id',
      //   runGuardsAndResolvers: "always",
      //   resolve: { card: cardResolver },
      //   loadComponent: () => import('./app/pages/cards/id/details.page').then(m => m.PageCardDetails),
      //   title: 'Card Details',
      // },
      // {
      //   path: 'admin',
      //   loadComponent: () => import('./app/pages/cards/list.page').then(m => m.PageListCards),
      //   title: 'Admin',
      // },
      // {
      //   path: 'search',
      //   loadComponent: () => import('./app/pages/advanced-search.page').then(m => m.PageAdvancedSearch),
      //   title: 'Advanced Search',
      // },
    ],
  },
];
export default routeConfig;
