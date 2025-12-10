import { Routes } from '@angular/router';

export const routes: Routes = [

  {
    path: 'Pagina Principal',
    loadComponent: () =>
    import('./Black-jack/pages/Main-Page/Main-Page'),


  },

  {
       path: 'PlayerVsPc',
       loadComponent: () =>
       import('./Black-jack/pages/PvE-Page/Player-vs-Pc')
  },

  {
       path: 'PlayerVsPlayer',
       loadComponent: () =>
       import('./Black-jack/pages/PvP page/PvP page')
  },
  {
       path: 'Online',
       loadComponent: () =>
       import('./Black-jack/pages/Online-page/Online-page')
  },

  {
    path: '**',
    redirectTo: 'Pagina Principal'
  }



];
