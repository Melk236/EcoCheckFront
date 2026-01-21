import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-alerta',
  imports: [],
  templateUrl: './alerta.html',
  styleUrl: './alerta.css',
})
export class AlertaComponent implements OnChanges{
  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.mensajeError)
  }
  @Input() mensajeError:string='';



}
