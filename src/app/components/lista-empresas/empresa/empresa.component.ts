import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmpresaService } from '../../../services/empresa.service';
import { CertificacionesService } from '../../../services/certificaciones.service';
import { EmpresaCertificacionService } from '../../../services/empresa-certificacion.service';
import { Empresa, IListaEmpresas } from '../../../types/empresa';
import { Certificaciones } from '../../../types/certificaciones';
import { EmpresaCertificacion } from '../../../types/empresa-certificacion';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { ListaEmpresasComponent } from '../lista-empresas.component';

@Component({
  selector: 'app-empresa',
  imports: [],
  templateUrl: './empresa.html',
  styleUrl: './empresa.css',
})
export class EmpresaComponent implements OnInit {

  /*Variables manejo de datos porivenientes de la DB */
  empresa: Empresa = {
    id: 0,
    nombre: '',
    puntuacionSocial: 0,
    controversias: '',
    descripcion: ''
  }
  certificaciones: Certificaciones[] = [];
  empresaCertificacion: EmpresaCertificacion[] = [];
  certificacionEmpresa: string[] = [];

  /*Observable que maneja la desuscripción del componente cuando se destruye el componente*/
  destroy$ = new Subject<void>();

  constructor(private route: ActivatedRoute, private empresaService: EmpresaService, private certificacionesService: CertificacionesService, private empresaCertificacionService: EmpresaCertificacionService) { }


  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.obtenerDatos(id);
  }

  /*Obtenemos la empresa asociada al id con sus respectivas certificaciones */
  obtenerDatos(id: number) {
    forkJoin({
      empresa: this.empresaService.getById(id),
      certificaciones: this.certificacionesService.get(),
      empresaCertificacion: this.empresaCertificacionService.get()
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {

        this.empresa = data.empresa;
        this.certificaciones = data.certificaciones;
        this.empresaCertificacion = data.empresaCertificacion;

        this.asociarEmpresaCertificaciones();

      },
      error: (error) => {
        console.log(error);
      }
    })

  }

  /*Asociamos la empresa con sus certificaciones si esta los tiene */
  asociarEmpresaCertificaciones() {
    //Rellenamos la listaEmpresa con los datos de la empresa correspondiente

    const empresaCertificacion = this.empresaCertificacion.filter(item => item.marcaId == this.empresa.id);

    if (empresaCertificacion === undefined) return;

    this.certificaciones.forEach((valor) => {
      const certificado = empresaCertificacion.find(item => item.certificacionId == valor.id);
     
      if (certificado !== undefined) {
        this.certificacionEmpresa.push(valor.nombre);
      }

    });
    

  }
}
