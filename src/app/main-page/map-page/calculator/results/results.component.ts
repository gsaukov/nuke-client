import {Component, Input} from '@angular/core';
import {ICalculationResults} from "../calculator.component";

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent {

  @Input()
  calculationResults!: ICalculationResults|null;

}
