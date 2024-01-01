import {CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {MatTableModule} from '@angular/material/table'

import {AppComponent} from './app.component';
import {MainPageComponent} from './main-page/main-page.component';
import {MapPageComponent} from './main-page/map-page/map-page.component';
import {HttpClientModule} from "@angular/common/http";
import { CalculatorComponent } from './main-page/map-page/calculator/calculator.component';
import {ReactiveFormsModule} from "@angular/forms";
import {LoaderComponent} from "./main-page/map-page/calculator/loader/loader.component";
import { ResultsComponent } from './main-page/map-page/calculator/results/results.component';
import { PlaceQueryComponent } from './main-page/map-page/place-query/place-query.component';
import { PlaceQueryResultsComponent } from './main-page/map-page/place-query/place-query-results/place-query-results.component';
import {RouterOutlet} from "@angular/router";
import {AppRoutingModule} from "./app-routing.module";
import {
    PlaceEventsComponent
} from "./main-page/map-page/place-query/place-events/place-events.component";

@NgModule({
  declarations: [
    AppComponent,
    MainPageComponent,
    MapPageComponent,
    CalculatorComponent,
    LoaderComponent,
    ResultsComponent,
    PlaceQueryComponent,
    PlaceQueryResultsComponent
  ],
    imports: [
        BrowserModule,
        HttpClientModule,
        ReactiveFormsModule,
        MatTableModule,
        RouterOutlet,
        AppRoutingModule,
        PlaceEventsComponent
    ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ]
})
export class AppModule {
}
