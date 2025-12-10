import {  Component, input} from '@angular/core';
import { RouterLink } from '@angular/router';





@Component({
  selector: 'card-mode-component',
  imports: [RouterLink],
  templateUrl: './Card-mode-component.html',

})
export class CardModeComponent {
  imagen =     input<string>();
  router =     input<string>();
  label =      input<string>();
  subLabel =   input<string>();
 }
