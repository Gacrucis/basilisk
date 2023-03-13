import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { CanDeactivateGuard } from './guards/can-deactivate-guard.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'chat/default',
    pathMatch: 'full'
  },
  {
    path: 'chat/:id',
    loadChildren: () => import('./chat/chat.module').then( m => m.chatPageModule),
    canDeactivate: [CanDeactivateGuard]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
