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
  scoreAmbiental: number = 0;//Variable para el score
  materiales: { material: string, reciclable: boolean }[] = [];
  reglaMateriales: any = {//Variable que contiene el score base del material,bonus reciclabilidad y penalización por no reciclabilidad
    papel: [75, 5, -10],     // base, bonus, penalty
    vidrio: [70, 10, -15],
    carton: [80, 5, -10],
    plasticoPP: [45, 2, -20],
    plasticoPET: [60, 5, -20],
    plasticoPVC: [30, 0, -25],
    plasticoLDPE: [40, 2, -20],
    plasticoHDPE: [55, 4, -20],
    aluminio: [60, 5, -10],
    acero: [55, 5, -10],
    tetrapak: [45, 5, -15],
    cartonPAP: [65, 5, -10],
    other: [50, 0, -10]
  };
  materialesImpacto = new Map<string, number>([
    ['papel', 0.9],
    ['vidrio', 1.2],
    ['carton', 0.8],
    ['plasticoPP', 2],
    ['plasticoPET', 2.5],
    ['plasticoPVC', 3],
    ['plasticoLDPE', 2],
    ['plasticoHDPE', 1.8],
    ['aluminio', 8],
    ['acero', 2],
    ['tetrapak', 3],
    ['cartonPAP', 1],
    ['other', 2]
  ]);


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

        this.producto = data.product;
        console.log(this.producto.packaging_materials_tags);
        this.calcularEcoScore();
      },
      (error) => {
        console.log(error);
      }
    );

  }

  calcularEcoScore() {//cálculo del ecoScore
    let sumaMaterial: number = 0;
    let sumaCarbono: number = 0;
    let mediaMateriales: number = 0;
    let ImpactoCarbono: number = 0;

    this.producto?.packaging_materials_tags.forEach((material) => {//Rellenamos el array materiales.
      this.cleanMaterial(material);
    });

    this.materiales.forEach((valor) => {
      sumaMaterial += this.calcularValorProducto(valor);
      sumaCarbono += this.calcularValorCarbono(valor);
    });


    mediaMateriales = sumaMaterial / this.producto!.packaging_materials_tags.length;
    ImpactoCarbono = sumaCarbono / this.producto!.packaging_materials_tags.length;
    const mediaCarbono = this.calculoMediaCarbono(ImpactoCarbono);
    const mediaTransporte = this.calculoTransporte();
    const scoreAmbiental = (mediaMateriales * 0.4) + (mediaCarbono * 0.3);
  }

  //Funciones para limpiar los datos.
  cleanMaterial(tag: string) {
    let reciclable: boolean = false;//variable para comprobar si es reciclable o no.
    const map: any = {
      "en:clear-glass": "vidrio",
      "en:brown-glass": "vidrio",
      "en:glass": "vidrio",

      "en:paper": "papel",
      "es:papel": "papel",

      "en:non-corrugated-cardboard": "carton",
      "en:corrugated-cardboard": "carton",
      "en:cardboard": "carton",
      "xx:82-c-pap": "cartonPAP",

      "en:aluminum": "aluminio",
      "en:steel": "acero",
      "en:tinplate": "acero",

      "en:pet-1-polyethylene-terephthalate": "plastico-pet",
      "en:pp-5-polypropylene": "plasticoPP",
      "en:pvc-3-polyvinyl-chloride": "plasticoPVC",
      "en:hdpe-2-high-density-polyethylene": "plasticoHDPE",
      "en:ldpe-4-low-density-polyethylene": "plasticoLDPE",
      "en:other-plastics": "plastico",

      "en:tetrapak": "tetrapak"
    };


    this.producto?.packaging_recycling_tags.forEach((rec) => {//Recorremos los tgas reciclables y cambiamos la variable reciclable si es reciclable el materia en concreto
      switch (rec) {
        case 'en:recycle':
          if (tag.includes('paper') ||
            tag.includes('glass') ||
            tag.includes('cardboard') ||
            tag.includes('pap') ||
            tag.includes('aluminum') ||
            tag.includes('steel') ||
            tag.includes('tinplate')) {
            reciclable = true;
          }

          break;
        case 'en:recyclable':
          if (tag.includes('paper') ||
            tag.includes('glass') ||
            tag.includes('cardboard') ||
            tag.includes('pap') ||
            tag.includes('aluminum') ||
            tag.includes('steel') ||
            tag.includes('tinplate')) {

            reciclable = true;

          }

          break;
        case 'en:recycle-in-plastic-bin':
          if (tag.includes('polyethylene') ||
            tag.includes('polyvinyl') ||
            tag.includes('polypropylene')
          ) {
            reciclable = true;
          }

          break;
        case 'en:recycle-in-glass-bin':
          if (tag.includes('glass')
          ) {

            reciclable = true;
          }

          break;
        case 'en:recycle-in-paper-bin':
          if (tag.includes('paper') ||
            tag.includes('papel')) {

            reciclable = true;
          }

          break;
        case 'en:non-recyclable':
          reciclable = false;
          break;
      }
    });

    this.materiales.push({
      material: map[tag],
      reciclable: reciclable
    });
  }

  calcularValorProducto(material: { material: string, reciclable: boolean }): number {

    let valor = this.reglaMateriales[material.material] ?? this.reglaMateriales['other'];

    if (material.reciclable) {

      return valor[0] + valor[1];
    }
    else {

      return valor[0] + valor[2];
    }
  }

  calcularValorCarbono(material: { material: string, reciclable: boolean }): number {

    const impacto = this.materialesImpacto.get(material.material) ?? 2;
    if (material.reciclable) {

      return impacto * 0.8;
    }
    else {

      return impacto;
    }
  }

  calculoMediaCarbono(imapctoCarbono: number): number {
    const maxCO2 = 8; // kg CO2 máximo que daría 0 puntos
    const score = Math.max(0, 100 - (imapctoCarbono / maxCO2) * 100);

    return score;
  }

  calculoTransporte(){
    
  }


  ngOnDestroy() {
    this.destroy$.next()//Emitimos un valor por lo que nos desuscribimos del Observable.
    this.destroy$.complete()//Completamos el Subject para que no se quede de fondo al salirnos del compoenene
  }


}
