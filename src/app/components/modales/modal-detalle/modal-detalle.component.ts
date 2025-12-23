import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Puntuacion } from '../../../types/puntuacion';
import { Material } from '../../../types/material';
import { CommonModule } from '@angular/common';
import { NombreMaterialPipe } from '../../../shared/nombre-material-pipe';
import { Producto } from '../../../types/producto';
import { EmpresaService } from '../../../services/empresa.service';
import { Empresa } from '../../../types/empresa';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { CertificacionesService } from '../../../services/certificaciones.service';
import { EmpresaCertificacionService } from '../../../services/empresa-certificacion.service';
import { Certificaciones } from '../../../types/certificaciones';
import { EmpresaCertificacion } from '../../../types/empresa-certificacion';


@Component({
  selector: 'app-modal-detalle',
  imports: [CommonModule, NombreMaterialPipe],
  templateUrl: './modal-detalle.html',
  styleUrl: './modal-detalle.css',
})
export class ModalDetalleComponent implements OnInit,OnDestroy {
  @Input() puntuacion: Puntuacion = {
    id: 0,
    productoId: 0,
    fecha: new Date(),
    valor: 0,
    valorAmbiental: 0,
    valorSocial: 0
  }
  @Input() materiales: Material[] = [];
  @Input() producto: Producto = {
    id: 0,
    marcaId: 0,
    categoria: '',
    descripcion: '',
    ecoScore: 0,
    fechaActualizacion: new Date()
  }
  @Output() closeModal = new EventEmitter<void>();
  empresa: Empresa = {
    id: 0,
    nombre: '',
    puntuacionSocial: 0,
    descripcion: ''
  }
  certificaciones:Certificaciones[]=[];
  empresaCertificacion:EmpresaCertificacion[]=[];
  nombrePais: string = '';
  certificacionesEmpresa:Certificaciones[]=[];
  //Observable para desuscribirse de los observables del componente
  destroy$ = new Subject<void>();

  constructor(private empresaService: EmpresaService,private certificacionesService:CertificacionesService,
    private empresaCertificacionService:EmpresaCertificacionService
  ) { }
  
  ngOnInit(): void {
    this.obtenerEmpresa();
    this.formatNombre();
  }

  /*Emitimos el evento al padre para que se cierre el modal */
  cerrarModal() {
    this.closeModal.emit();
  }

  /*Obtenemos la empresa del producto */
  obtenerEmpresa() {
   forkJoin({
    empresa:this.empresaService.getById(this.producto.marcaId).pipe(takeUntil(this.destroy$)),
    certificaciones:this.certificacionesService.get().pipe(takeUntil(this.destroy$)),
    empresaCertificacion:this.empresaCertificacionService.get().pipe(takeUntil(this.destroy$))
   }).subscribe({
   next: ({empresa, certificaciones, empresaCertificacion}) => {
        this.empresa = empresa;
        this.certificaciones = certificaciones;
        this.empresaCertificacion = empresaCertificacion;

        //Al terminar llamamos a un método auxiliar para obtener las certificaciones de la empresa
        this.obtenerCertificaciones();
    },
    error: (error) => {
        console.error('Error en forkJoin:', error);
    }
   });
  }

  /*Obtenemos las certificaciones de la empresa*/
  obtenerCertificaciones(){
    this.certificacionesEmpresa=[];

    const relacionEmpresaCertificacion=this.empresaCertificacion.filter(item=>item.marcaId==this.empresa.id);
    
    if(relacionEmpresaCertificacion!==undefined){
      relacionEmpresaCertificacion.forEach((valor)=>{
        const encontrado= this.certificaciones.find(item=>item.id==valor.certificacionId);

        if(encontrado!==undefined){
          this.certificacionesEmpresa.push(encontrado);
        }
      });
    }
    console.table(this.certificacionesEmpresa);
  }

  /*Formateo de los valores */
  formatNumber(ecoScore: number): string {
    return ecoScore.toFixed(0);
  }

  /*Formateo del nombre del país del producto*/
  formatNombre() {
    const nombre = this.producto.paisOrigen?.charAt(0).toUpperCase() + this.producto.paisOrigen!.substring(1);

    this.nombrePais = nombre;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
