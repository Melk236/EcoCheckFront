// =============================================================================
// COMPONENTE HOME - Gestiona la visualización de productos y cálculo de EcoScore
// =============================================================================
// Este componente principal de la aplicación maneja:
// - Escaneo de códigos QR de productos
// - Cálculo de puntuaciones ambientales y sociales
// - Gestión de empresas y productos
// - Traducción de descripciones de productos

// Componentes de Angular y módulos necesarios
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, forkJoin, catchError } from 'rxjs';

// Componentes hijos del módulo
import { ModalEscaner } from './modal-escaner/modal-escaner.component';
import { ModalInformativo } from '../modales/modal-informativo/modal-informativo';
import { LoadingModal } from '../modales/loading-modal/loading-modal';
import { PaginacionComponent } from '../../shared/paginacion/paginacion.component';

// Servicios de la aplicación
import { ApiExternaService } from '../../services/api-externa.service';
import { EmpresaService } from '../../services/empresa.service';
import { ProductoService } from '../../services/producto.service';
import { TraducirService } from '../../services/traducir.service';
import { MaterialService } from '../../services/material.service';
import { CertificacionesService } from '../../services/certificaciones.service';
import { EmpresaCertificacionService } from '../../services/empresa-certificacion.service';
import { PuntuacionService } from '../../services/puntuacion.service';
import { ObtenerEmpresaService } from '../../services/obtener-empresa.service';
import { ErrorHandlerService } from '../../services/error-handler.service';

// Tipos e interfaces
import { Product, Producto } from '../../types/producto';
import { Empresa, CompanyInfo } from '../../types/empresa';
import { Certificaciones } from '../../types/certificaciones';
import { EmpresaCertificacion } from '../../types/empresa-certificacion';
import { Material } from '../../types/material';
import { Puntuacion } from '../../types/puntuacion';

// Constantes de materiales (mapeos, reglas, impacto de carbono)
import { MATERIAL_MAPPING, MATERIAL_IMPACT, MATERIAL_RULES, RECYCLABLE_TAGS, NON_RECYCLABLE_TAG, PLASTIC_RECYCLABLE_TAGS, MATERIAL_TAG_PATTERNS, CATEGORY_TO_PACKAGING } from '../../constants/material-constants';
// Constantes de países (puntuaciones, traducciones)
import { COUNTRY_SCORES, NEIGHBORING_COUNTRIES, EUROPEAN_COUNTRIES, AFRICAN_COUNTRIES, COUNTRY_TRANSLATION } from '../../constants/country-constants';
// Constantes de certificaciones (puntuaciones, mapeos)
import { CERTIFICATION_SCORES, DISPLAYABLE_CERTIFICATIONS, CERTIFICATION_MAPPING, DEFAULT_SOCIAL_SCORE, RECYCLING_IMPACT_FACTOR, MAX_CO2_KG } from '../../constants/certification-constants';

// Enum para tipos de traducción
enum TranslationType {
  Company = 1,
  Product = 2
}

@Component({
  selector: 'app-home',
  imports: [ModalEscaner, ModalInformativo, CommonModule, PaginacionComponent, LoadingModal],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit, OnDestroy {

  // ==================== ESTADO DEL COMPONENTE ====================
  // Variables de estado para modales y operaciones
  modalEscanerOpen: boolean = false;
  modalSucces: boolean = false;
  loadingModal: boolean = false;
  success: boolean = false;
  error: string = '';
  codigoEscaneado: string = '';

  // ==================== DATOS DEL PRODUCTO ====================
  // Información del producto escaneado y traducciones
  producto: Product | undefined;
  descripcionTraducida: string = '';
  ingredientesTraducidos: string = '';

  // ==================== PUNTUACIONES AMBIENTALES ====================
  // Scores calculados para el producto
  scoreAmbiental: number = 0;
  scoreSocial: number = 0;
  mediaScore: number = 0;
  // Array de materiales procesados con su información de reciclaje
  materiales: { material: string; reciclable: boolean; impactoCarbono: number }[] = [];

  // ==================== DATOS DE LA EMPRESA ====================
  // Información de la empresa obtenida de Wikidata
  empresaInfo: CompanyInfo = { nombre: '' };
  empresas: Empresa[] = [];

  // ==================== DATOS DE PRODUCTOS ====================
  // Listas de productos para visualización
  productos: Producto[] = [];
  productosPaginados: Producto[] = [];

  // ==================== CERTIFICACIONES ====================
  // Certificaciones disponibles y procesadas
  certificaciones: Certificaciones[] = [];
  certificacionesLimpias: string[] = [];

  // ==================== GESTIÓN DE OBSERVABLES ====================
  // Subject para desuscripción automática al destruir el componente
  private destroy$ = new Subject<void>();

  // ==================== CONSTRUCTOR ====================
  // Inyección de dependencias para servicios y router
  constructor(
    private api: ApiExternaService,
    private obtenerEmpresaService: ObtenerEmpresaService,
    private EmpreService: EmpresaService,
    private ProductoService: ProductoService,
    private traducirService: TraducirService,
    private materialService: MaterialService,
    private certificacionesService: CertificacionesService,
    private empresaCertificacionService: EmpresaCertificacionService,
    private puntuacionService: PuntuacionService,
    private route: Router,
    private errorHandler: ErrorHandlerService
  ) {}

  // ==================== CICLO DE VIDA ====================

  /**
   * Inicializa el componente cargando datos y configurando escaneo automático
   */
  ngOnInit(): void {
    // Inicia escaneo automático después de 5 segundos con código de prueba
    /* 
    setTimeout(() => {
      this.obtenerQr('8480000603074.json');
    }, 5000);
    */
    // Carga datos iniciales en paralelo
    this.loadInitialData();
  }

  /**
   * Limpia las suscripciones al destruir el componente para evitar memory leaks
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== CARGA DE DATOS ====================

  /**
   * Carga inicial de empresas, productos y certificaciones en paralelo
   * Utiliza forkJoin para esperar a que todas las peticiones terminen
   */
  private loadInitialData(): void {
    forkJoin({
      empresas: this.EmpreService.get(),
      productos: this.ProductoService.get(),
      certificaciones: this.certificacionesService.get()
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.empresas = data.empresas;
        this.productos = data.productos;
        this.certificaciones = data.certificaciones;
      },
      error: () => this.errorHandler.handleError('Error al cargar datos iniciales')
    });
  }

  // ==================== GESTIÓN DE MODALES ====================

  /**
   * Abre el modal del escáner QR
   */
  openModalEscaner() {
    this.modalEscanerOpen = true;
  }

  /**
   * Cierra el modal del escáner QR
   */
  closeModalEscaner() {
    this.modalEscanerOpen = false;
  }

  /**
   * Cierra el modal de éxito/error
   */
  closeModalSucces() {
    this.modalSucces = false;
  }

  // ==================== PROCESAMIENTO DE QR ====================

  /**
   * Procesa el código QR escaneado consultando la API de OpenFood
   * @param qrEscaneado - Código QR recibido del modal hijo
   */
  obtenerQr(qrEscaneado: string) {
    this.codigoEscaneado = qrEscaneado;
    this.loadingModal = true;

    this.api.getOpenFood(this.codigoEscaneado).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.producto = data.product;
        // Verifica si el producto ya existe o procesa uno nuevo
        this.navigateToExistingProduct() || this.processNewProduct();
      },
      error: (error) => {
        console.log(error);
        this.showError('No se puedo procesar el código QR o hubo un problema con el producto');
      }
    });
  }

  /**
   * Navega a la página de detalle si el producto ya existe en la BD
   * @returns true si encontró el producto, false en caso contrario
   */
  private navigateToExistingProduct(): boolean {
    const nombreEncontrado = this.productos.find(
      item => item.nombre?.trim().toLowerCase() === this.producto?.product_name.trim().toLowerCase()
    );

    if (nombreEncontrado !== undefined) {
      setTimeout(() => {
        this.abrirDetalle(nombreEncontrado.id);
      }, 1000);
      return true;
    }
    return false;
  }

  /**
   * Determina si crear un nuevo producto o usar datos existentes de la empresa
   */
  private processNewProduct(): void {
    // Busca si la empresa ya existe en la base de datos local
    const empresa = this.empresas.find(
      item => item.nombre.toLowerCase().trim() == this.producto?.brands.toLowerCase().trim()
    );

    if (empresa !== undefined) {
      // Si existe, usa su puntuación social y calcula el score ambiental
      this.scoreSocial = empresa.puntuacionSocial;
      this.calcularEcoScore();
    } else {
      // Si no existe, busca la empresa en Wikidata
      this.obtenerIdEmpresa();
    }
  }

  // ==================== CÁLCULO DE ECOSCORE ====================

  /**
   * Calcula el EcoScore ambiental del producto basándose en:
   * - Materiales del packaging (40%)
   * - Impacto de carbono (30%)
   * - Transporte (30%)
   */
  calcularEcoScore() {
    // Reinicia el array de materiales
    this.materiales = [];

    let packagingMaterials = this.producto?.packaging_materials_tags || [];
    let inferredRecyclable = true;

    // Si packaging_materials_tags está vacío o es un array vacío, inferir materiales de la categoría
    if (!packagingMaterials || packagingMaterials.length === 0) {
      const inference = this.inferPackagingFromCategories();
      packagingMaterials = inference.materials;
      inferredRecyclable = inference.reciclable;
    }

    // Procesa cada material del packaging
    packagingMaterials.forEach((material) => {
      this.cleanMaterial(material, inferredRecyclable);
    });

    let sumaMaterial: number = 0;
    let sumaCarbono: number = 0;

    // Calcula puntuaciones para cada material
    this.materiales.forEach((valor) => {
      sumaMaterial += this.calcularValorProducto(valor);
      sumaCarbono += this.calcularValorCarbono(valor);
    });

    const materialCount = packagingMaterials.length;

    // Calcula medias
    const ImpactoCarbono = materialCount === 0 ? 4 : sumaCarbono / materialCount;
    const mediaMateriales = materialCount === 0 ? 0 : sumaMaterial / materialCount;
    const mediaCarbono = this.calculoMediaCarbono(ImpactoCarbono);

    // Determina el país para calcular transporte
    const pais = this.producto?.countries_tags[0] ? this.producto?.countries_tags[0].split(':')[1] : this.producto!.manufacturing_places;
    const mediaTransporte = this.calculoTransporte(pais!);

    // Calcula score ambiental con pesos definidos
    this.scoreAmbiental = (mediaMateriales * 0.4) + (mediaCarbono * 0.3) + (mediaTransporte * 0.3);
    // Calcula media total
    this.mediaScore = (this.scoreAmbiental + this.scoreSocial) / 2;
    // Traduce la descripción del producto
    this.traducir(TranslationType.Product);
  }

  /**
   * Infiere los materiales de packaging basándose en las categorías del producto
   * @returns Objeto con materiales inferidos y si son reciclables
   */
  private inferPackagingFromCategories(): { materials: string[]; reciclable: boolean } {
    const categories = this.producto?.categories_tags || [];
    const materialsInferred: string[] = [];
    let reciclableDefault = true;

    // Buscar primera categoría que coincida con el mapeo
    for (const category of categories) {
      const categoryMapping = CATEGORY_TO_PACKAGING[category];
      if (categoryMapping) {
        materialsInferred.push(...categoryMapping.packaging);
        reciclableDefault = categoryMapping.reciclable;
        break;
      }
    }

    return { materials: materialsInferred, reciclable: reciclableDefault };
  }

  /**
   * Procesa un material individual y determina si es reciclable
   * @param tag - Tag del material desde la API de OpenFood
   * @param useInferredRecyclable - Si es true, usa el valor de reciclable inferido de la categoría
   */
  private cleanMaterial(tag: string, useInferredRecyclable: boolean = false) {
    const reciclable = useInferredRecyclable ? useInferredRecyclable : this.isMaterialRecyclable(tag);
    const materialName = MATERIAL_MAPPING[tag] || 'other';

    this.materiales.push({
      material: materialName,
      reciclable,
      impactoCarbono: 0
    });
  }

  /**
   * Determina si un material es reciclable basándose en los tags de reciclaje
   * @param materialTag - Tag del material a verificar
   * @returns true si el material es reciclable
   */
  private isMaterialRecyclable(materialTag: string): boolean {
    const recyclingTags = this.producto?.packaging_recycling_tags || [];

    for (const tag of recyclingTags) {
      // Si no es reciclable, retorna false inmediatamente
      if (tag === NON_RECYCLABLE_TAG) return false;
      // Verifica diferentes casos de reciclaje
      if (RECYCLABLE_TAGS.includes(tag) && this.matchesAnyPattern(materialTag, MATERIAL_TAG_PATTERNS['recyclable'])) return true;
      if (PLASTIC_RECYCLABLE_TAGS.includes(tag) && this.matchesAnyPattern(materialTag, MATERIAL_TAG_PATTERNS['plasticRecyclable'])) return true;
      if (tag === 'en:recycle-in-glass-bin' && this.matchesAnyPattern(materialTag, MATERIAL_TAG_PATTERNS['glassRecyclable'])) return true;
      if (tag === 'en:recycle-in-paper-bin' && this.matchesAnyPattern(materialTag, MATERIAL_TAG_PATTERNS['paperRecyclable'])) return true;
    }
    return false;
  }

  /**
   * Verifica si un texto contiene cualquiera de los patrones dados
   * @param text - Texto a verificar
   * @param patterns - Patrones a buscar
   * @returns true si encuentra algún patrón
   */
  private matchesAnyPattern(text: string, patterns: string[]): boolean {
    return patterns.some(pattern => text.includes(pattern));
  }

  /**
   * Calcula el valor del producto basándose en el material y si es reciclable
   * @param material - Información del material
   * @returns Puntuación calculada para el material
   */
  calcularValorProducto(material: { material: string; reciclable: boolean; impactoCarbono: number }): number {
    const valor = MATERIAL_RULES[material.material] || MATERIAL_RULES['other'];
    // Si es reciclable suma bonus, si no aplica penalización
    return material.reciclable ? valor[0] + valor[1] : valor[0] + valor[2];
  }

  /**
   * Calcula el impacto de carbono del material
   * @param material - Información del material
   * @returns Impacto de carbono ajustado
   */
  calcularValorCarbono(material: { material: string; reciclable: boolean; impactoCarbono: number }): number {
    const impacto = MATERIAL_IMPACT[material.material] || MATERIAL_IMPACT['other'];
    // Materiales reciclables tienen 80% del impacto original
    const adjustedImpact = material.reciclable ? impacto * RECYCLING_IMPACT_FACTOR : impacto;
    material.impactoCarbono = Number(adjustedImpact.toFixed(2));
    return adjustedImpact;
  }

  /**
   * Calcula la puntuación de carbono normalizada (0-100)
   * @param imapctoCarbono - Impacto de carbono a evaluar
   * @returns Puntuación entre 0 y 100
   */
  calculoMediaCarbono(imapctoCarbono: number): number {
    // Fórmula: 100 - (impacto / máximo) * 100
    return Math.max(0, 100 - (imapctoCarbono / MAX_CO2_KG) * 100);
  }

  /**
   * Calcula la puntuación de transporte basándose en el origen del producto
   * @param pais - País de origen normalizado
   * @returns Puntuación de transporte (20-100)
   */
  calculoTransporte(pais: string): number {
    const paisNormalizado = pais.toLowerCase().trim();

    // España: puntuación máxima
    if (COUNTRY_SCORES[paisNormalizado] !== undefined) return COUNTRY_SCORES[paisNormalizado];
    // Países vecinos
    if (NEIGHBORING_COUNTRIES.includes(paisNormalizado)) return 80;
    // Resto de Europa
    if (EUROPEAN_COUNTRIES.includes(paisNormalizado)) return 60;
    // África
    if (AFRICAN_COUNTRIES.includes(paisNormalizado)) return 40;
    // Otros continentes
    return 20;
  }

  // ==================== MANEJO DE ERRORES ====================

  /**
   * Muestra un mensaje de error en el modal informativo
   * @param message - Mensaje de error a mostrar
   */
  private showError(message: string): void {
    this.loadingModal = false;
    this.success = false;
    this.error = message;
    this.modalSucces = true;
  }

  /**
   * Maneja el éxito de la traducción y redirige a crear empresa o producto
   * @param type - Tipo de traducción (empresa o producto)
   * @param descripcion - Texto traducido
   */
  private handleTranslationSuccess(type: TranslationType, descripcion: string): void {
    this.descripcionTraducida = descripcion;
    if (type === TranslationType.Company) {
      this.crearEmpresa();
    } else {
      this.crearProducto();
    }
  }

  // ==================== GESTIÓN DE EMPRESAS ====================

  /**
   * Busca la empresa en Wikidata por el nombre de la marca
   */
  obtenerIdEmpresa() {
    this.obtenerEmpresaService.searchCompanyId(this.producto!.brands).pipe(takeUntil(this.destroy$)).subscribe(
      (empresa) => {
        if (!empresa) {
          console.log("No se encontró la empresa en Wikidata");
          return;
        }

        this.empresaInfo.descripcion = empresa.description;
        this.extraerDatosEmpresa(empresa.id);
      },
      (error) => {
        console.log(error);
        this.showError('No se puedo procesar el código QR o hubo un problema con el producto');
      }
    );
  }

  /**
   * Extrae información detallada de la empresa desde Wikidata
   * @param id - Identificador de la empresa en Wikidata
   */
  extraerDatosEmpresa(id: string) {
    this.obtenerEmpresaService.getCompanyInfo(id).pipe(takeUntil(this.destroy$)).subscribe(
      (data) => {
        const entity = data.entities[id];
        const claims = entity.claims;

        // Extrae datos básicos
        this.empresaInfo.nombre = entity.labels?.['es']?.value || entity.labels?.['en']?.value || '';
        this.empresaInfo.sitioWeb = this.getPropertyValue(claims, 'P856');
        this.empresaInfo.logo = this.getPropertyValue(claims, 'P154');

        // Resuelve sede y matriz de la empresa
        this.resolveCompanyHierarchy(claims, id);
      },
      (error) => {
        console.log(error);
        this.showError('No se puedo procesar el código QR o hubo un problema con el producto');
      }
    );
  }

  /**
   * Obtiene un valor de propiedad desde los claims de Wikidata
   * @param claims - Objeto de claims de Wikidata
   * @param propertyId - ID de la propiedad a obtener
   * @returns Valor de la propiedad o undefined
   */
  private getPropertyValue(claims: Record<string, any[]>, propertyId: string): string | undefined {
    return claims[propertyId]?.[0]?.mainsnak?.datavalue?.value as string;
  }

  /**
   * Resuelve la jerarquía de la empresa (sede y matriz) en paralelo
   * @param claims - Claims de la empresa
   * @param companyId - ID de la empresa
   */
  private resolveCompanyHierarchy(claims: Record<string, any[]>, companyId: string): void {
    // Extrae IDs de sede y matriz
    const sedeId = (claims['P17']?.[0]?.mainsnak?.datavalue?.value as { id: string })?.id;
    const matrizId = (claims['P749']?.[0]?.mainsnak?.datavalue?.value as { id: string })?.id;

    // Prepara peticiones paralelas
    const llamadas: Record<string, any> = {};
    if (sedeId) llamadas['sede'] = this.obtenerEmpresaService.getCompanyInfo(sedeId);
    if (matrizId) llamadas['matriz'] = this.obtenerEmpresaService.getCompanyInfo(matrizId);

    // Ejecuta en paralelo y espera resultado
    forkJoin(llamadas).pipe(takeUntil(this.destroy$)).subscribe(
      (resultados: any) => {
        if (resultados['sede']) {
          const entity = resultados['sede'].entities[sedeId];
          this.empresaInfo!.paisSede = entity?.labels?.['es']?.value;
        }
        if (resultados['matriz']) {
          const entity = resultados['matriz'].entities[matrizId];
          this.empresaInfo!.empresaMatriz = entity?.labels?.['es']?.value;
        }
        // Traduce la descripción de la empresa
        this.traducir(TranslationType.Company);
      }
    );
  }

  /**
   * Crea una nueva empresa en la base de datos local
   */
  crearEmpresa() {
    // Procesa certificaciones antes de crear
    this.rellenarCertificaciones();

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
    };

    this.EmpreService.post(body).pipe(takeUntil(this.destroy$)).subscribe(
      (data) => {
        console.log(data);
        this.empresas.push(data);
        this.asociarCertificacionesEmpresa();
        this.calcularEcoScore();
      },
      (error) => {
        console.log(error);
        this.showError('No se puedo procesar el código QR o hubo un problema con el producto');
      }
    );
  }

  /**
   * Crea un nuevo producto en la base de datos local
   */
  crearProducto() {
    // Busca la empresa asociada al producto
    const idCompania = this.empresas.find(
      item => item.nombre.toLowerCase().trim().includes(this.producto?.brands.toLowerCase().trim() || '')
    );

    if (idCompania == undefined) {
      return;
    }

    const pais = idCompania.paisSede;
    const body = {
      id: 0,
      nombre: this.producto?.product_name,
      marcaId: idCompania.id,
      categoria: this.formatCategorias(this.producto?.categories_tags ?? []),
      paisOrigen: this.formatPais(pais ?? 'No especificado'),
      descripcion: this.descripcionTraducida || 'Producto alimenticio',
      ecoScore: this.mediaScore,
      imagenUrl: this.producto?.image_front_url,
      ingredientes: this.ingredientesTraducidos || 'No hay información de los ingredientes, consúltelo en manual del producto',
      fechaActualizacion: new Date()
    };

    this.ProductoService.post(body).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.productos.push(data);
        this.productos = [...this.productos];
        this.crearMateriales(data.id);
      },
      error: (error) => {
        console.log(error);
        this.showError('No se puedo procesar el código QR o hubo un problema con el producto');
      }
    });
  }

  // ==================== TRADUCCIÓN ====================

  /**
   * Traduce descripciones utilizando el servicio de traducción
   * @param opcion - Tipo de traducción (Company o Product)
   */
  traducir(opcion: TranslationType) {
    this.descripcionTraducida = '';

    if (opcion === TranslationType.Company) {
      // Traduce descripción de empresa
      const descripcion = this.empresaInfo.descripcion;

      this.traducirService.post(descripcion!).pipe(takeUntil(this.destroy$)).subscribe({
        next: (data) => {
          this.handleTranslationSuccess(TranslationType.Company, data.texto);
        },
        error: (error) => {
          console.log(error);
          this.showError('No se puedo procesar el código QR o hubo un problema con el producto');
        }
      });
    } else {
      // Traduce nombre e ingredientes del producto
      const posiblesNombres = [
        this.producto?.generic_name_es,
        this.producto?.generic_name,
        this.producto?.generic_name_en,
        this.producto?.generic_name_fr,
        this.producto?.generic_name_de,
        this.producto?.generic_name_zh
      ];

      const descripcion = posiblesNombres.find(item => item?.trim() !== '');

      if (descripcion === undefined && this.producto?.ingredients_text !== undefined) {
        this.crearProducto();
        return;
      }

      // Traduce descripción e ingredientes en paralelo
      forkJoin({
        descripcion: this.traducirService.post(descripcion!),
        ingredientes: this.traducirService.post(this.producto?.ingredients_text!)
      }).pipe(takeUntil(this.destroy$)).subscribe({
        next: (data) => {
          this.descripcionTraducida = data.descripcion.texto;
          this.ingredientesTraducidos = data.ingredientes.texto;
          this.handleTranslationSuccess(TranslationType.Product, data.descripcion.texto);
        },
        error: (error) => {
          console.log(error);
          this.showError('No se puedo procesar el código QR o hubo un problema con el producto');
        }
      });
    }
  }

  // ==================== MATERIALES ====================

  /**
   * Crea los registros de materiales para el producto
   * @param productoId - ID del producto creado
   */
  crearMateriales(productoId: number) {
    // Si no hay materiales, crea directamente la puntuación
    if (this.materiales.length == 0) {
      this.crearPuntuacion();
      return;
    }

    // Mapea materiales al formato del body
    const body: Material[] = this.materiales.map(valor => ({
      id: 0,
      productoId: productoId,
      nombre: valor.material,
      impactoCarbono: valor.impactoCarbono,
      reciclable: valor.reciclable
    }));

    this.materialService.post(body).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.crearPuntuacion();
      },
      error: (error) => {
        console.log(error);
        this.showError('No se puedo procesar el código QR o hubo un problema con el producto');
      }
    });
  }

  // ==================== UTILIDADES ====================

  /**
   * Traduce el nombre del país del inglés al español
   * @param pais - Nombre del país en inglés
   * @returns Nombre del país en español
   */
  formatPais(pais: string): string {
    pais = pais[0].toUpperCase() + pais.substring(1);

    if (pais.toLowerCase() == 'españa') return pais;

    return COUNTRY_TRANSLATION[pais] || pais;
  }

  /**
   * Formatea el EcoScore para visualización (divide entre 10)
   * @param ecoScore - Puntuación original
   * @returns Puntuación formateada con un decimal
   */
  formatNumber(ecoScore: number): string {
    return (ecoScore / 10).toFixed(1);
  }

  // ==================== CERTIFICACIONES ====================

  /**
   * Procesa las certificaciones del producto y calcula la puntuación social
   */
  rellenarCertificaciones() {
    this.certificacionesLimpias = [];
    this.scoreSocial = DEFAULT_SOCIAL_SCORE;

    this.producto?.labels_tags.forEach((valor) => {
      const normalizedTag = valor.toLowerCase().trim();

      // Extrae certificaciones para mostrar
      if (DISPLAYABLE_CERTIFICATIONS.some(cert => normalizedTag.includes(cert.toLowerCase()))) {
        this.certificacionesLimpias.push(valor.split(':')[1]);
      }

      // Suma puntos por certificaciones
      if (CERTIFICATION_SCORES[valor]) {
        this.scoreSocial += CERTIFICATION_SCORES[valor];
      }
    });
  }

  /**
   * Asocia las certificaciones procesadas con la empresa en la base de datos
   */
  asociarCertificacionesEmpresa() {
    const idsEmpresaCertificacion: EmpresaCertificacion[] = [];

    this.certificacionesLimpias.forEach((valor) => {
      // Busca la certificación en la base de datos local
      const encontrado = this.certificaciones.find(item => item.nombre == CERTIFICATION_MAPPING[valor]);

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

  /**
   * Guarda las asociaciones empresa-certificación en la base de datos
   * @param idsEmpresaCertificacion - Array de asociaciones a crear
   */
  crearCertificaciones(idsEmpresaCertificacion: EmpresaCertificacion[]) {
    this.empresaCertificacionService.post(idsEmpresaCertificacion).subscribe({
      error: (error) => {
        console.log(error);
        this.showError('No se puedo procesar el código QR o hubo un problema con el producto');
      }
    });
  }

  // ==================== PUNTUACIÓN FINAL ====================

  /**
   * Crea el registro final de puntuación del producto
   */
  crearPuntuacion() {
    const body: Puntuacion = {
      id: 0,
      productoId: this.productos[this.productos.length - 1].id,
      fecha: new Date(),
      valor: this.mediaScore,
      valorAmbiental: this.scoreAmbiental,
      valorSocial: this.scoreSocial
    };

    this.puntuacionService.post(body).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        // Muestra modal de éxito después de 1 segundo
        setTimeout(() => {
          this.loadingModal = false;
          this.success = true;
          this.error = '';
          this.modalSucces = true;
        }, 1000);
      },
      error: (error) => {
        console.log(error);
        this.showError('No se puedo procesar el código QR o hubo un problema con el producto');
      }
    });
  }
  /*Devolvemos las categorias bein formateadas */
  formatCategorias(categorias:string[]):string{

    if(categorias.length==0) return '';//Si esta el array vacio devolvemos una cadena vacia

    categorias = categorias.map(categoria => categoria.split(':')[1]);
    console.log(categorias);
    return categorias.join(',');
  }

  // ==================== NAVEGACIÓN ====================

  /**
   * Navega a la página de detalle de un producto
   * @param id - ID del producto a mostrar
   */
  abrirDetalle(id: number) {
    this.route.navigate(['home/detalle-producto', id]);
  }

  /**
   * Actualiza la lista de productos paginados
   * @param lista - Lista de productos para la página actual
   */
  paginar(lista: Producto[]) {
    setTimeout(() => {
      this.productosPaginados = lista;
    }, 0);
  }
}
