import { Component, OnInit } from '@angular/core';
import { ModalEscaner } from './modal-escaner/modal-escaner.component';
import { ApiExternaService } from '../../services/api-externa.service';
import { Product } from '../../types/producto';
import { Subject, takeUntil } from 'rxjs';


@Component({
  selector: 'app-home',
  imports: [ModalEscaner],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit {

  modalEscanerOpen: boolean = false;
  codigoEscaneado: string = '';
  producto: Product | undefined;
  scoreAmbiental:number=0;//Variable para el score

  private destroy$ = new Subject<void>();//Para desuscribirse a los Observables

  constructor(private apiExterna: ApiExternaService) { }

  ngOnInit(): void {
    this.obtenerQr('3017620425035.json');
    console.log('HomeComponent initialized');
  }

  openModalEscaner() {
    this.modalEscanerOpen = true;
    console.log(this.modalEscanerOpen)
  }
  closeModalEscaner() {
    this.modalEscanerOpen = false;
  }

  //Con el qr obtenido del modal hijo hacemos calculamos los porcentajes

  obtenerQr(qrEscaneado: string) {
    this.codigoEscaneado = qrEscaneado;//Obtenemos el código escaneado del padre

    this.apiExterna.getOpenFood(this.codigoEscaneado).pipe(takeUntil(this.destroy$)).subscribe(
      (data) => {
        
        this.producto=data.product;
        console.log(this.producto);
        this.calcularEcoScore();
      },
      (error) => {
        console.log(error);
      }
    );

  }

  ngOnDestroy() {
    this.destroy$.next()//Emitimos un valor por lo que nos desuscribimos del Observable.
    this.destroy$.complete()//Completamos el Subject para que no se quede de fondo al salirnos del compoenene
  }

  calcularEcoScore(){
    
  }

}
