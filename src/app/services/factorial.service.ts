import {Injectable} from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class FactorialService {
  factorialResult!: number;

  constructor() {
    this.calculateFactorial();
  }

  calculateFactorial(factorialInput: number = 14) {
    if (typeof Worker !== 'undefined') {
      // Create a new
      const worker = new Worker(new URL('./worker/services.worker', import.meta.url));
      worker.onmessage = ({ data }) => {
        this.factorialResult = data;
        console.log("factorial 14:" + data)
      };
      worker.postMessage(factorialInput);
    } else {
      // Web Workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }
  }
}
