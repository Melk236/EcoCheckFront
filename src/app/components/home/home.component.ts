import { Component,OnInit } from '@angular/core';
import { ModalEscaner } from './modal-escaner/modal-escaner.component';
import { ApiExternaService } from '../../services/api-externa.service';
import { Product, Producto } from '../../types/producto';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { environment } from '../../environment/environment';
import { ObtenerEmpresaService } from '../../services/obtener-empresa.service';
import { CompanyInfo, Empresa } from '../../types/empresa';
import { EmpresaService } from '../../services/empresa.service';
import { ProductoService } from '../../services/producto.service';
import { TraducirService } from '../../services/traducir.service';
import { CommonModule } from '@angular/common';
import { MaterialService } from '../../services/material.service';
import { Material } from '../../types/material';



@Component({
  selector: 'app-home',
  imports: [ModalEscaner, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit {

  // Variables del componente
  modalEscanerOpen: boolean = false;
  codigoEscaneado: string = '';
  producto: Product | undefined;
  descripcionTraducida: string = '';
  // Score ambiental
  scoreAmbiental: number = 0;
  materiales: { material: string; reciclable: boolean;impactoCarbono:number }[] = [];

  // Reglas de materiales: [score_base, bonus_reciclable, penalización_no_reciclable]
  reglaMateriales: Record<string, [number, number, number]> = {
    papel: [75, 5, -10],
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

  // Impacto ambiental relativo por material
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

  // API Wikidata
  idWikiEmpresa = environment.apiWikiDataIdEmpresa;
  apiWiki = environment.apiWikiData;

  // Datos de la empresa
  empresaInfo: CompanyInfo = { nombre: '' };
  empresas: Empresa[] = [];

  //Datos del producto
  productos: Producto[] = [];
  // Gestión de observables
  private destroy$ = new Subject<void>();

  constructor(private apiExterna: ApiExternaService, private obtenerEmpresaService: ObtenerEmpresaService, private EmpreService: EmpresaService, private ProductoService: ProductoService, private traducirService: TraducirService,private materialService:MaterialService) {

  }

  ngOnInit(): void {

    this.obtenerQr('3017620425035.json');
    this.obtenerEmpresas();
    this.obtenerProductos();
  }


  obtenerEmpresas() {
    this.EmpreService.get().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.empresas = data;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  obtenerProductos() {


    this.ProductoService.get().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {

        this.productos = data;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  //Modales
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

    this.apiExterna.getOpenFood(this.codigoEscaneado).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {

        this.producto = data.product;
        console.log(this.producto.brands);

        if(this.productos.some(item=>item.nombre?.trim().toLowerCase()!==this.producto?.product_name.trim().toLowerCase())){
          
          this.obtenerIdEmpresa();//Obtenemos los datos necesarios para la empresa
        }
      },
      error: (error) => {
        console.log(error);
      }
    });

  }

  calcularEcoScore() {//cálculo del ecoScore
    let sumaMaterial: number = 0;
    let sumaCarbono: number = 0;


    this.producto?.packaging_materials_tags.forEach((material) => {//Rellenamos el array materiales.
      this.cleanMaterial(material);
    });

    this.materiales.forEach((valor) => {//Iteramos por cada material y sumamos segun su base y si es reciclable
      sumaMaterial += this.calcularValorProducto(valor);
      sumaCarbono += this.calcularValorCarbono(valor);

    });
    console.log(this.materiales);
    //Cálculo final de medias
    const ImpactoCarbono = sumaCarbono / this.producto!.packaging_materials_tags.length;

    const mediaMateriales = sumaMaterial / this.producto!.packaging_materials_tags.length;
    const mediaCarbono = this.calculoMediaCarbono(ImpactoCarbono);
    const mediaTransporte = this.calculoTransporte(this.producto!.manufacturing_places);

    const scoreAmbiental = (mediaMateriales * 0.4) + (mediaCarbono * 0.3) + (mediaTransporte * 0.3);
    this.traducir(scoreAmbiental);//Traducimos la descripcion del product escaneado

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

      "en:tetrapak": "tetrapak",
      
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
      reciclable: reciclable,
      impactoCarbono:0
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

  calcularValorCarbono(material: { material: string, reciclable: boolean,impactoCarbono:number }): number {

    const impacto = this.materialesImpacto.get(material.material) ?? 2;
    if (material.reciclable) {
      const dosDecimales=(impacto*0.8).toFixed(2);//Insertamos en this.materiales el imapcto de carbono de cada material
      material.impactoCarbono=Number(dosDecimales);

      return impacto * 0.8;
    }
    else {
      material.impactoCarbono=impacto;
      return impacto;
    }
  }

  calculoMediaCarbono(imapctoCarbono: number): number {
    const maxCO2 = 8; // kg CO2 máximo que daría 0 puntos
    const score = Math.max(0, 100 - (imapctoCarbono / maxCO2) * 100);

    return score;
  }

  calculoTransporte(pais: string): number {

    const paisNormalizado = pais.toLowerCase().trim();
    console.log(paisNormalizado);
    // España
    if (paisNormalizado === 'españa' || paisNormalizado === 'spain') {
      return 100;
    }

    // Países vecinos
    const paisesVecinos = ['francia', 'france', 'portugal'];
    if (paisesVecinos.includes(paisNormalizado)) {
      return 80;
    }

    // Países europeos
    const paisesEuropeos = [
      'alemania', 'germany', 'italia', 'italy', 'reino unido', 'united kingdom', 'uk',
      'países bajos', 'netherlands', 'bélgica', 'belgium', 'suiza', 'switzerland',
      'austria', 'suecia', 'sweden', 'noruega', 'norway', 'dinamarca', 'denmark',
      'finlandia', 'finland', 'polonia', 'poland', 'grecia', 'greece', 'irlanda', 'ireland',
      'república checa', 'czech republic', 'rumania', 'romania', 'hungría', 'hungary'
    ];
    if (paisesEuropeos.includes(paisNormalizado)) {
      return 60;
    }

    // Continentes cercanos (África)
    const paisesAfricanos = [
      'marruecos', 'morocco', 'argelia', 'algeria', 'túnez', 'tunisia', 'egipto', 'egypt',
      'libia', 'libya', 'sudáfrica', 'south africa', 'nigeria', 'kenia', 'kenya'
    ];
    if (paisesAfricanos.includes(paisNormalizado)) {
      return 40;
    }

    // Otros continentes (Asia, América, Oceanía)
    return 20;
  }


  obtenerIdEmpresa() {
    this.obtenerEmpresaService.searchCompanyId(this.producto!.brands).pipe(takeUntil(this.destroy$)).subscribe(
      (empresa) => {
        if (!empresa) {
          console.log("No se encontró la empresa en Wikidata");
          return;
        }

        const id = empresa.id;
        this.extraerDatosEmpresa(id);
      },
      (error) => console.log(error)
    );
  }


  extraerDatosEmpresa(id: string) {
    this.obtenerEmpresaService.getCompanyInfo(id).pipe(takeUntil(this.destroy$)).subscribe(
      (data) => {
        const entity = data.entities[id];
        const claims = entity.claims;

        this.empresaInfo = {
          nombre: entity.labels?.['es']?.value || entity.labels?.['en']?.value || '',
          sitioWeb: claims['P856']?.[0]?.mainsnak?.datavalue?.value as string,
          paisSede: undefined,
          empresaMatriz: undefined,
          certificaciones: undefined
        };
        //Si ya tenemos la empresa en la base de datos no salimos de este método para no crear la misma empresa varias veces
        if (this.empresas.some(item => item.nombre.toLowerCase() == this.empresaInfo.nombre.toLowerCase())) {
          this.calcularEcoScore()//Calculamos el ecoScore.
          return;
        }


        const sedeId = (claims['P17']?.[0]?.mainsnak?.datavalue?.value as { id: string })?.id;
        const matrizId = (claims['P749']?.[0]?.mainsnak?.datavalue?.value as { id: string })?.id;

        // Creamos un arreglo de llamadas dinámico
        const llamadas: any = {};

        if (sedeId) {
          llamadas.sede = this.obtenerEmpresaService.getCompanyInfo(sedeId);
        }

        if (matrizId) {
          llamadas.matriz = this.obtenerEmpresaService.getCompanyInfo(matrizId);
        }

        // 🔥 forkJoin solo se ejecuta cuando todas las llamadas terminan
        forkJoin(llamadas).pipe(takeUntil(this.destroy$)).subscribe(
          (resultados: any) => {

            if (resultados.sede) {
              this.empresaInfo!.paisSede = resultados.sede.entities[sedeId]?.labels?.['es']?.value;
            }

            if (resultados.matriz) {
              this.empresaInfo!.empresaMatriz = resultados.matriz.entities[matrizId]?.labels?.['es']?.value;
            }


            this.crearEmpresa(); //ahora sí, cuando todo terminó
          }
        );
      },
      (error) => console.log(error)
    );
  }

  resolverSede(sedeId: string, empresaInfo: CompanyInfo) {
    this.obtenerEmpresaService.getCompanyInfo(sedeId).pipe(takeUntil(this.destroy$)).subscribe(
      (data) => {
        const entity = data.entities[sedeId];

        empresaInfo.paisSede = entity?.labels?.['es']?.value || entity?.labels?.['en']?.value;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  resolverMatriz(matrizId: string, empresaInfo: CompanyInfo) {
    this.obtenerEmpresaService.getCompanyInfo(matrizId).pipe(takeUntil(this.destroy$)).subscribe(
      (data) => {
        const entity = data.entities[matrizId];
        empresaInfo.empresaMatriz = entity?.labels?.['es']?.value || entity?.labels?.['en']?.value;
      }
    );
  }

  crearEmpresa() {
    const body = {
      id: 0,
      nombre: this.empresaInfo.nombre,
      empresaMatriz: this.empresaInfo.empresaMatriz,
      paisSede: this.empresaInfo.paisSede,
      sitioWeb: this.empresaInfo.sitioWeb,
      certificaciones: this.empresaInfo.certificaciones,
      puntuacionSocial: 0,
      puntuacionAmbiental: 0,
      puntuacionGobernanza: 0

    }

    this.EmpreService.post(body).subscribe(
      (data) => {
        console.log(data);
        this.calcularEcoScore();
      },
      (error) => {
        console.log(error);
      }
    );
  }

  crearProducto(scoreAmbiental: number) {
    const idCompania = this.empresas.find(item => item.nombre.toLowerCase().trim() == this.empresaInfo.
      nombre.toLowerCase().trim())?.id

    if (idCompania == undefined) {//No creamos el recurso si el idCompania es undefined
      return;
    }


    const body = {
      id: 0,
      nombre: this.producto?.product_name,
      marcaId: idCompania,
      categoria: 'product',
      paisOrigen: this.producto?.manufacturing_places,
      descripcion: this.descripcionTraducida,
      ecoScore: scoreAmbiental,
      imagenUrl: this.producto?.image_front_url,
      fechaActualizacion: new Date()
    }

    this.ProductoService.post(body).subscribe({
      next: (data) => {
        this.productos.push(data);
        console.log(data.id)
        this.crearMateriales(data.id);//Cuando se cree el producto creamos sus materiales.
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  traducir(scoreAmbiental: number) {//Método auxiliar para traducir
    this.descripcionTraducida = '';
    const posiblesNombres = [
      this.producto?.generic_name_es,
      this.producto?.generic_name,
      this.producto?.generic_name_en,
      this.producto?.generic_name_fr,
      this.producto?.generic_name_de,
      this.producto?.generic_name_zh
    ];

    //Si no cogemos el idioma en el que la descripción no está vacío y lo traducimos
    const descripcion = posiblesNombres.find(item => item?.trim() !== '');

    if ((this.producto?.generic_name_es && this.producto.generic_name_es.trim() !== '') || descripcion === undefined) {//Si la descricpción ya viene traducida no traducimos nada
      return;
    }

    this.traducirService.post(descripcion).pipe(takeUntil(this.destroy$)).subscribe(
      {
        next: (data) => {
          this.descripcionTraducida = data.texto;
          //Cuando traduzcamos llamamos a craerProducto
          this.crearProducto(scoreAmbiental);
        },
        error: (error) => {
          console.log(error);
        }
      }
    );

  }

  //Creación de materiales
  crearMateriales(productoId:number){
    
    //Rellenamos el body con los materiales que tenemos y sus parámetros.
    const body:Material[]=[]
    this.materiales.forEach((valor)=>{
      body.push({
        id: 0,
        productoId:productoId,
        nombre: valor.material,
        impactoCarbono: valor.impactoCarbono,
        reciclable: valor.reciclable
      })
    })

    this.materialService.post(body).subscribe({
      next:(data)=>{
        console.log(data);
      },
      error:(error)=>{
        console.log(error);
      }
    })
  }


  formatNumber(ecoScore: number): string {
    const numero = ecoScore / 10;
    return numero.toFixed(1);
  }

  ngOnDestroy() {
    this.destroy$.next()//Emitimos un valor por lo que nos desuscribimos del Observable.
    this.destroy$.complete()//Completamos el Subject para que no se quede de fondo al salirnos del componente
  }


}
