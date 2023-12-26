import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {MainPageComponent} from "./main-page/main-page.component";
import {CalculatorComponent} from "./main-page/map-page/calculator/calculator.component";
import {PlaceQueryComponent} from "./main-page/map-page/place-query/place-query.component";
import {MapPageComponent} from "./main-page/map-page/map-page.component";

const routes: Routes = [
  {
    path: '', component: MainPageComponent, children: [
      {
        path: '', component: MapPageComponent, children: [
          {path: '', component: CalculatorComponent,},
          {path: 'advancedSearch', component: PlaceQueryComponent},
        ]
      }
    ]
  },
  {path: '**', redirectTo: '', pathMatch: 'full'}, //page not found redirect to main
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
