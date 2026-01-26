import { Component, OnInit } from '@angular/core';
import { ModalEscaner } from './modal-escaner/modal-escaner.component';
import { ApiExternaService } from '../../services/api-externa.service';
import { Product, Producto } from '../../types/producto';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { ObtenerEmpresaService } from '../../services/obtener-empresa.service';
import { CompanyInfo, Empresa } from '../../types/empresa';
import { EmpresaService } from '../../services/empresa.service';
import { ProductoService } from '../../services/producto.service';
import { TraducirService } from '../../services/traducir.service';
import { CommonModule } from '@angular/common';
import { MaterialService } from '../../services/material.service';
import { Material } from '../../types/material';
import { Router } from '@angular/router';
import { CertificacionesService } from '../../services/certificaciones.service';
import { EmpresaCertificacionService } from '../../services/empresa-certificacion.service';
import { Certificaciones } from '../../types/certificaciones';
import { EmpresaCertificacion } from '../../types/empresa-certificacion';
import { PuntuacionService } from '../../services/puntuacion.service';
import { Puntuacion } from '../../types/puntuacion';
import { PaginacionComponent } from '../../shared/paginacion/paginacion.component';
import { ModalInformativo } from '../modales/modal-informativo/modal-informativo';



@Component({
  selector: 'app-home',
  imports: [ModalEscaner, ModalInformativo, CommonModule, PaginacionComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit {

  // Variables del componente
  modalEscanerOpen: boolean = false;
  modalSucces: boolean = false;
  error: string = '';
  codigoEscaneado: string = '';
  producto: Product | undefined;
  descripcionTraducida: string = '';
  ingredientesTraducidos: string = '';

  // Score ambiental
  scoreAmbiental: number = 0;
  scoreSocial: number = 0;
  mediaScore: number = 0;
  materiales: { material: string; reciclable: boolean; impactoCarbono: number }[] = [];

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


  // Datos de la empresa
  empresaInfo: CompanyInfo = { nombre: '' };
  empresas: Empresa[] = [];

  //Datos del producto
  productos: Producto[] = [];
  productosPaginados: Producto[] = [];

  //Datos de las certificaciones
  certificaciones: Certificaciones[] = [];
  certificacionesLimpias: string[] = [];


  // Gestión de observables
  private destroy$ = new Subject<void>();

  constructor(private apiExterna: ApiExternaService, private obtenerEmpresaService: ObtenerEmpresaService, private EmpreService: EmpresaService, private ProductoService: ProductoService, private traducirService: TraducirService, private materialService: MaterialService, private certificacionesService: CertificacionesService, private empresaCertificacionService: EmpresaCertificacionService, private puntuacionService: PuntuacionService, private route: Router) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.obtenerQr('8480000524058.json');
    }, 5000);

    this.obtenerEmpresas();
    this.obtenerProductos();
    this.obtenerCertificaciones();
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

  obtenerCertificaciones() {
    this.certificacionesService.get().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.certificaciones = data;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  //Modales
  openModalEscaner() {
    this.modalEscanerOpen = true;

  }

  closeModalEscaner() {
    this.modalEscanerOpen = false;
  }

  //Con el qr obtenido del modal hijo calculamos los porcentajes

  obtenerQr(qrEscaneado: string) {
    this.codigoEscaneado = qrEscaneado;//Obtenemos el código escaneado del padre

    this.apiExterna.getOpenFood(this.codigoEscaneado).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {

        this.producto = data.product;
        console.log(this.producto);

        const nombreEncontrado = this.productos.find(item => item.nombre?.trim().toLowerCase() === this.producto?.product_name.trim().toLowerCase());


        if (nombreEncontrado === undefined) {
          this.obtenerIdEmpresa();
        }
      },
      error: (error) => {
        console.log(error);
        this.error = error;
        this.modalSucces = true;
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
    console.log(sumaCarbono)
    console.log(this.materiales);
    //Cálculo final de medias, si la longitud de los materiales es 0, el impacto de carbono sera igual a 0
    const ImpactoCarbono = this.producto?.packaging_materials_tags.length == 0 ? 4 : sumaCarbono / this.producto!.packaging_materials_tags.length;

    const mediaMateriales = this.producto?.packaging_materials_tags.length == 0 ? 0 : sumaMaterial / this.producto!.packaging_materials_tags.length;

    const mediaCarbono = this.calculoMediaCarbono(ImpactoCarbono);

    //Escogemos entre el manufacturing places o el primer countrie tag para calcular la media de transporte
    const pais = this.producto?.manufacturing_places ? this.producto.manufacturing_places : this.producto?.countries_tags[0].split(':')[1]

    const mediaTransporte = this.calculoTransporte(pais!);
    console.log(mediaCarbono + ' y' + mediaMateriales + ' y' + mediaTransporte);
    this.scoreAmbiental = (mediaMateriales * 0.4) + (mediaCarbono * 0.3) + (mediaTransporte * 0.3);

    this.mediaScore = (this.scoreAmbiental + this.scoreSocial) / 2;
    this.traducir(2);//Traducimos la descripcion del product escaneado

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

      "en:pet-1-polyethylene-terephthalate": "plasticoPET",
      "en:pp-5-polypropylene": "plasticoPP",
      "en:pvc-3-polyvinyl-chloride": "plasticoPVC",
      "en:hdpe-2-high-density-polyethylene": "plasticoHDPE",
      "en:ldpe-4-low-density-polyethylene": "plasticoLDPE",
      "en:other-plastics": "plastico",

      "en:tetrapak": "tetrapak",

    };


    this.producto?.packaging_recycling_tags.forEach((rec) => {//Recorremos los tags reciclables y cambiamos la variable reciclable si es reciclable el materia en concreto
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
      impactoCarbono: 0
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

  calcularValorCarbono(material: { material: string, reciclable: boolean, impactoCarbono: number }): number {

    const impacto = this.materialesImpacto.get(material.material) ?? 2;
    if (material.reciclable) {
      const dosDecimales = (impacto * 0.8).toFixed(2);//Insertamos en this.materiales el impacto de carbono de cada material
      material.impactoCarbono = Number(dosDecimales);

      return impacto * 0.8;
    }
    else {
      material.impactoCarbono = impacto;
      return impacto;
    }
  }

  calculoMediaCarbono(imapctoCarbono: number): number {
    const maxCO2 = 8; // kg CO2 máximo que daría 0 puntos
    const score = Math.max(0, 100 - (imapctoCarbono / maxCO2) * 100);

    return score;
  }

  calculoTransporte(pais: string): number {
    console.log(pais)
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

    //Si ya tenemos la empresa en la base de datos no salimos de este método para no crear la misma empresa varias veces
    const empresa = this.empresas.find(item => item.nombre.toLowerCase() == this.producto?.brands.toLowerCase());
    console.log(this.producto?.brands);
    console.table(this.empresas)
    if (empresa !== undefined) {
      console.log(empresa.puntuacionSocial);
      this.scoreSocial = empresa.puntuacionSocial;//Si a existe la empresa cogemos su score social.
      this.calcularEcoScore();//Calculamos el ecoScore.
      return;
    }

    this.obtenerEmpresaService.searchCompanyId(this.producto!.brands).pipe(takeUntil(this.destroy$)).subscribe(
      (empresa) => {
        console.log(empresa)
        if (!empresa) {
          console.log("No se encontró la empresa en Wikidata");
          return;
        }

        const id = empresa.id;
        this.empresaInfo.descripcion = empresa.description;

        this.extraerDatosEmpresa(id);
      },
      (error) => {
        console.log(error);
        this.error = error;
        this.modalSucces = true;
      }
    );
  }


  extraerDatosEmpresa(id: string) {
    this.obtenerEmpresaService.getCompanyInfo(id).pipe(takeUntil(this.destroy$)).subscribe(
      (data) => {
        const entity = data.entities[id];
        const claims = entity.claims;

        this.empresaInfo.nombre = entity.labels?.['es']?.value || entity.labels?.['en']?.value || '';
        this.empresaInfo.sitioWeb = claims['P856']?.[0]?.mainsnak?.datavalue?.value as string;
        this.empresaInfo.logo = claims['P154']?.[0]?.mainsnak?.datavalue?.value as string;
        //Si ya tenemos la empresa en la base de datos no salimos de este método para no crear la misma empresa varias veces
        const empresa = this.empresas.find(item => item.nombre.toLowerCase() == this.empresaInfo.nombre.toLowerCase())
        if (empresa !== undefined) {
          console.log(empresa.puntuacionSocial);
          this.scoreSocial = empresa.puntuacionSocial;//Si a existe la empresa cogemos su score social.
          this.calcularEcoScore();//Calculamos el ecoScore.
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


            this.traducir(1); //ahora sí, cuando todo terminó traducimos la descripción
          }
        );
      },
      (error) => {
        console.log(error);
        this.error = error;
        this.modalSucces = true;
      }
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
        this.error = error;
        this.modalSucces = true;
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

    this.rellenarCertificaciones();//Rellenamos la propiedad this.empresa.certifcaciones si las hay.

    const body = {
      id: 0,
      nombre: this.empresaInfo.nombre,
      empresaMatriz: this.empresaInfo.empresaMatriz,
      paisSede: this.empresaInfo.paisSede,
      sitioWeb: this.empresaInfo.sitioWeb,
      descripcion: this.descripcionTraducida,
      puntuacionSocial: this.scoreSocial,
      controversias: '',
      logo: this.empresaInfo.logo

    }

    this.EmpreService.post(body).subscribe(
      (data) => {
        console.log(data);
        this.empresas.push(data);
        this.asociarCertificacionesEmpresa()//Se crean las asociaciones entre la nueva empresa y las certificaciones si las tiene
        this.calcularEcoScore();
      },
      (error) => {
        console.log(error);
        this.error = error;
        this.modalSucces = true;
      }
    );
  }

  crearProducto() {
    const idCompania = this.empresas.find(item => item.nombre.toLowerCase().trim() == this.producto?.brands.toLowerCase().trim())?.id
    console.log(idCompania)
    if (idCompania == undefined) {//No creamos el recurso si el idCompania es undefined
      return;
    }

    const pais = this.producto?.manufacturing_places ? this.producto.manufacturing_places : this.producto?.countries_tags[0].split(':')[1];

    const body = {
      id: 0,
      nombre: this.producto?.product_name,
      marcaId: idCompania,
      categoria: 'product',
      paisOrigen: this.formatPais(pais ?? 'No especificado'),
      descripcion: this.descripcionTraducida || 'Producto alimenticio',
      ecoScore: this.mediaScore,
      imagenUrl: this.producto?.image_front_url,
      ingredientes: this.ingredientesTraducidos,
      fechaActualizacion: new Date()
    }
    console.table(body)
    this.ProductoService.post(body).subscribe({
      next: (data) => {
        this.productos.push(data);

        this.crearMateriales(data.id);//Cuando se cree el producto creamos sus materiales.
      },
      error: (error) => {
        console.log(error);
        this.error = error;
        this.modalSucces = true;
      }
    });
  }

  traducir(opcion: number) {//Método auxiliar para traducir, opcion 1=>traduccion desc del producto y opcion2=>desc de la empresa
    console.log(opcion)
    let descripcion: string | undefined = '';
    this.descripcionTraducida = '';

    switch (opcion) {
      case 1:
        descripcion = this.empresaInfo.descripcion;

        this.traducirService.post(descripcion!).pipe(takeUntil(this.destroy$)).subscribe(
          {
            next: (data) => {
              this.descripcionTraducida = data.texto;
              //Cuando traduzcamos llamamos a craerEmpresa
              this.crearEmpresa();
            },
            error: (error) => {
              console.log(error);
              this.error = error;
              this.modalSucces = true;
            }
          }
        );
        break;

      case 2:
        const posiblesNombres = [
          this.producto?.generic_name_es,
          this.producto?.generic_name,
          this.producto?.generic_name_en,
          this.producto?.generic_name_fr,
          this.producto?.generic_name_de,
          this.producto?.generic_name_zh
        ];
        
        //Si no cogemos el idioma en el que la descripción no está vacío y lo traducimos
        descripcion = posiblesNombres.find(item => item?.trim() !== '');
        console.log(this.producto?.ingredients_text)
        if (descripcion === undefined) {//Si la descricpción ya viene traducida no traducimos nada
          this.ingredientesTraducidos = this.producto?.ingredients_text_es!;
          this.crearProducto();
          return;
        }
        
        forkJoin({
          descripcion: this.traducirService.post(descripcion),
          ingredientes: this.traducirService.post(this.producto?.ingredients_text!)
        }).pipe(takeUntil(this.destroy$)).subscribe({
          next: (data) => {
            this.descripcionTraducida = data.descripcion.texto;
            this.ingredientesTraducidos = data.ingredientes.texto;
            //Cuando terminamos llamamos a crearProducto

            this.crearProducto();

          },
          error: (error) => {
            console.log(error);
            this.error = error.error.mensaje;
            this.modalSucces = true;
          }
        })
        break;
    }




  }

  //Creación de materiales
  crearMateriales(productoId: number) {

    //No creamos los materiales si estos no existen en la api de OpenFood y creamos la puntuación del producto directamente
    if (this.materiales.length == 0) {
      this.crearPuntuacion();
      return
    }
    //Rellenamos el body con los materiales que tenemos y sus parámetros.
    const body: Material[] = []
    this.materiales.forEach((valor) => {
      body.push({
        id: 0,
        productoId: productoId,
        nombre: valor.material,
        impactoCarbono: valor.impactoCarbono,
        reciclable: valor.reciclable
      })
    })

    this.materialService.post(body).subscribe({
      next: (data) => {
        console.log(data);
        this.crearPuntuacion();
      },
      error: (error) => {
        console.log(error);
        this.error = error;
        this.modalSucces = true;
      }
    })
  }

  formatPais(pais: string): string {//Pasamos el nombre del país del inglés al español
    pais = pais[0].toUpperCase() + pais.substring(1);
    const countries = new Map([
      ["Spain", "españa"],
      ["France", "francia"],
      ["Germany", "alemania"],
      ["Italy", "italia"],
      ["Portugal", "portugal"],
      ["United kingdom", "reino unido"],
      ["Ireland", "irlanda"],
      ["Netherlands", "países bajos"],
      ["Belgium", "bélgica"],
      ["Switzerland", "suiza"],
      ["Austria", "austria"],
      ["Norway", "noruega"],
      ["Sweden", "suecia"],
      ["Finland", "finlandia"],
      ["Denmark", "dinamarca"],
      ["Poland", "polonia"],
      ["Czech republic", "república checa"],
      ["Hungary", "hungría"],
      ["Greece", "grecia"],
      ["Turkey", "turquía"],
      ["United states", "estados unidos"],
      ["Canada", "canadá"],
      ["Mexico", "méxico"],
      ["Argentina", "argentina"],
      ["Brazil", "brasil"],
      ["Chile", "chile"],
      ["Colombia", "colombia"],
      ["Morocco", "marruecos"],
      ["Algeria", "argelia"],
      ["Egypt", "egipto"],
      ["South africa", "sudáfrica"],
      ["China", "china"],
      ["Japan", "japón"],
      ["South korea", "corea del sur"],
      ["India", "india"],
      ["Australia", "australia"],
      ["New zealand", "nueva zelanda"],
      ["Saudi arabia", "arabia saudí"],
      ["No especificado", "No especificado"]
    ]);
    return countries.get(pais) ?? '';
  }

  formatNumber(ecoScore: number): string {
    const numero = ecoScore / 10;

    return numero.toFixed(1);
  }

  rellenarCertificaciones() {
    this.certificacionesLimpias = []//Limpiamos el array.
    let score: number = 50;//La puntuacíon por defectos es 50.

    const certifaciones = new Map([
      ["en:fair-trade", 20],
      ["en:fairtrade", 20],
      ["en:organic", 15],
      ["en:bio", 15],
      ["en:b-corp", 25],
      ["en:rainforest-alliance", 12],
      ["en:msc", 12],
      ["en:utz-certified", 10],
      ["en:sa8000", 18],
      ["en:fsc", 10],
      ["en:vegetarian", 5],
      ["en:vegan", 8],
      ["en:no-preservatives", 5],
      ["en:no-colorings", 5],
      ["en:no-gluten", 3]
    ]);


    this.producto?.labels_tags.forEach((valor) => {
      if (valor.trim().includes('en:fair-trade')
        || valor.trim().toLowerCase().includes('en:fairtrade')
        || valor.trim().toLowerCase().includes('en:b-corp')
        || valor.trim().toLowerCase().includes('en:rainforest-alliance')
        || valor.trim().toLowerCase().includes('en:msc')
        || valor.trim().toLowerCase().includes('en:utz-certified')
        || valor.trim().toLowerCase().includes('en:sa8000')
        || valor.trim().toLowerCase().includes('en:fsc')
      ) {

        this.certificacionesLimpias.push(valor.split(':')[1]);

      }

      if (certifaciones.get(valor) !== undefined) {//Le sumaos al score social si contien alguno de estos certificados adicionales
        score += certifaciones.get(valor)!;
      }

    });
    this.scoreSocial = score;

    return score;
  }

  asociarCertificacionesEmpresa() {
    const idsEmpresaCertificacion: EmpresaCertificacion[] = [];

    const certificacionesBd = new Map([
      ['fair-trade', 'Fair Trade'],
      ['fairtrade', 'Fair Trade'],
      ['b-corp', 'B Corp Certified'],
      ['rainforest-alliance', 'Rainforest Alliance'],
      ['sa800', 'SA800'],
      ['utz-certified', 'Utz Certified'],
      ['msc', 'MSC Marine Stewardship Council'],
      ['fsc', 'FSC/PEFC']

    ]);

    this.certificacionesLimpias.forEach((valor) => {
      const encontrado = this.certificaciones.find(item => item.nombre == certificacionesBd.get(valor));

      if (encontrado !== undefined) {
        idsEmpresaCertificacion.push({
          id: 0,
          marcaId: this.empresas[this.empresas.length - 1].id,
          certificacionId: encontrado.id
        });
      }

    });

    this.crearCertificaciones(idsEmpresaCertificacion);

  }

  crearCertificaciones(idsEmpresaCertificacion: EmpresaCertificacion[]) {
    this.empresaCertificacionService.post(idsEmpresaCertificacion).subscribe({

      error: (error) => {
        console.log(error);
        this.error = error;
        this.modalSucces = true;
      }
    });
  }

  crearPuntuacion() {
    const body: Puntuacion = {
      id: 0,
      productoId: this.productos[this.productos.length - 1].id,
      fecha: new Date(),
      valor: this.mediaScore,
      valorAmbiental: this.scoreAmbiental,
      valorSocial: this.scoreSocial
    }

    this.puntuacionService.post(body).pipe(takeUntil(this.destroy$)).subscribe({

      error: (error) => {
        console.log(error);
        this.error = error;
        this.modalSucces = true;
      }
    });
  }


  abrirDetalle(id: number) {
    this.route.navigate(['home/detalle-producto', id]);
  }

  /*Método para paginacón de los productos*/
  paginar(lista: Producto[]) {

    setTimeout(() => {
      this.productosPaginados = lista;
    }, 0);

  }

  closeModalSucces() {
    this.modalSucces = false;
  }

  ngOnDestroy() {
    this.destroy$.next()//Emitimos un valor por lo que nos desuscribimos del Observable.
    this.destroy$.complete()//Completamos el Subject para que no se quede de fondo al salirnos del componente
  }


}
