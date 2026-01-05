import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-paginacion',
  imports: [],
  templateUrl: './paginacion.html',
  styleUrl: './paginacion.css',
})
export class PaginacionComponent implements OnChanges {



  /*Variables para el manejo de la paginación de los elementos */
  pagActual: number = 1;
  numElementos: number = 6;
  numPaginasTotal: number = 0;
  paginas: number[] = [];

  /*Lista de la colección de elementos que nos viene del componente padre y 
  la lista paginada que se enviará al componente padre*/
  @Input() lista: any[] = [];
  @Output() pagin = new EventEmitter<any[]>();
  listaPaginada: any[] = [];



  ngOnChanges(changes: SimpleChanges): void {
    this.entradaDatos();

  }
  /*Métodos para manejar la navegación */
  entradaDatos() {


    //Calculamos el numero total de paginas que va a tener nuestra paginación
    this.numPaginasTotal = Math.ceil(this.lista.length / this.numElementos);
    this.paginas = Array.from({ length: 5 }, (_, index) => index + 1);

    /*Emitimos al componente padre la lista paginada */
    this.paginar();
  }
  /*Manejar la paginación al darle al botón siguiente*/
  siguiente() {

    
    if (this.paginas[this.paginas.length - 1] !== this.numPaginasTotal) {
      this.paginas.push(this.paginas[this.paginas.length - 1] + 1);
      this.paginas.shift();
    }

    this.pagActual++;
    /*Emitimos al componente padre la lista paginada */
    this.paginar();
  }

  anterior() {
   

    if (this.paginas[0] !== 1 && this.paginas[0]==this.pagActual) {
      this.paginas.pop();
      this.paginas.unshift(this.paginas[0] - 1);
    }

     this.pagActual--;

    /*Emitimos al componente padre la lista paginada */
    this.paginar();
  }

  /*Ir a la página específica que selecciona el usuario */
  irPagina(pagina:number){
    this.pagActual=pagina;
    this.paginar();
  }

  /*Método que coge el rango entre la lista que llega del componente padres */
  paginar(){
    const start = (this.pagActual * this.numElementos) - (this.numElementos);

    const end = start + this.numElementos;

    this.listaPaginada = this.lista.slice(start, end);
    
    this.pagin.emit(this.listaPaginada);
  }
}
