import { Routes } from '@angular/router';
import { CreationComponent } from './features/creation/creation.component';
import { ScheduleComponent } from './features/schedule/schedule.component';
import { LoadComponent } from './features/load/load.component';
import { LoginComponent } from './features/login/login.component';
import { UserCreationComponent } from './features/user-creation/user-creation.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AddCourseComponent } from './features/add/add.component';
import { DropCourseComponent } from './features/drop/drop.component';
import { ViewScheduleComponent } from './features/view/view.component';
import { SwapCoursesComponent } from './features/swap/swap.component';
import { ErrorTableComponent } from './features/error-table/error-table.component';
import { CompareFeatureComponent } from './features/compare-feature/compare-feature.component';
import { MoreInfoComponent } from './features/more-info/more-info.component';
import { DeletionComponent } from './features/deletion/deletion.component';

export const routes: Routes = [
    {path:'', component:LoginComponent},
    {
        path: 'dashboard',
        component: DashboardComponent,
        children: [
        { path: 'schedule', component: ScheduleComponent },
        { path: 'more-info', component: MoreInfoComponent},
        { path: 'creation', component: CreationComponent},
        { path: 'deletion', component: DeletionComponent},
        { path: 'load', component: LoadComponent},
        { path: 'error-table', component: ErrorTableComponent},
        { path: 'compare-feature', component: CompareFeatureComponent},
        { path: 'user_creation', component: UserCreationComponent},
        { path: 'view', component: ViewScheduleComponent},
        { path: 'add', component: AddCourseComponent},
        { path: 'drop', component: DropCourseComponent},
        { path: 'swap', component: SwapCoursesComponent},
        ]
    },
];
