import { Component, OnInit } from '@angular/core';
import { ProductoService } from '../../../services/producto.service';
import { ActivatedRoute } from '@angular/router';
import { Producto } from '../../../types/producto';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Material } from '../../../types/material';
import { MaterialService } from '../../../services/material.service';
import { EmpresaService } from '../../../services/empresa.service';
import { Empresa } from '../../../types/empresa';

@Component({
  selector: 'app-detalle-producto',
  imports: [CommonModule],
  templateUrl: './detalle-producto.html',
  styleUrl: './detalle-producto.css',
})
export class DetalleProductoComponent implements OnInit{

  //Variables
  producto:Producto={
    id: 0,
    marcaId: 0,
    categoria: '',
    descripcion: '',
    ecoScore: 0,
    fechaActualizacion:new Date()
  }
  materiales:Material[]=[];
  materialesFormateados:string[]=[];
  marca:Empresa={
    id: 0,
    nombre: '',
    puntuacionSocial: 0,
    descripcion: ''
  }
  //Creamos un Observable de tipos subject para desuscribir de los observables cuando este emita algo.
  destroy$=new Subject<void>();

  constructor(private productoService:ProductoService,private materialService:MaterialService,private marcaService:EmpresaService,private route:ActivatedRoute){}

  ngOnInit(): void {
      const id=Number(this.route.snapshot.paramMap.get('id'));//Obetenemos el id del producto de la url.

      this.obtenerProducto(id);//Lamamos al servicio para traerse el producto seleccionado
      this.obtenerMateriales(id);
  }

  obtenerProducto(id:number){
    this.productoService.getById(id).pipe(takeUntil(this.destroy$)).subscribe({
      next:(data)=>{
        this.producto=data;
        this.obtenerMarca();
      },
      error:(error)=>{
        console.log(error);
      }
    });
  }

  obtenerMateriales(id:number){
    this.materialService.getById(id).pipe(takeUntil(this.destroy$)).subscribe({
      next:(data)=>{
        this.materiales=data;
      },
      error:(error)=>{
        console.log(error);
      }
    });
  }

  obtenerMarca(){
    this.marcaService.getById(this.producto.marcaId).pipe(takeUntil(this.destroy$)).subscribe({
      next:(data)=>{
        this.marca=data;
      },
      error:(error)=>{
        console.log(error);
      }
    });
  }

  formatNumber(ecoScore:number):string{

    return ecoScore.toFixed(0);

  }

  calcularOffset(ecoScore:number){
   const totalLength: number = 100.53;

   return totalLength - (totalLength * ecoScore/100);

  }

  formatMateriales(){
    
    const materialesDb=new Map([//Como vienen los materiales de la  DB
      
      ['cartonPAP','carton (PAP)'],
      ['plasticoPET','Plástico (PET)'],
      ['plasticoPVC','Plástico (PVC)'],
      ['plasticoHDPE','Plástico (HDPE)'],
      ['plasticoLDPE','Plástico (LDPE)'],
      
    ])
  }
  ngOnDestroy(){
    this.destroy$.next();//Nos desuscribimos de los observables del componente
    this.destroy$.complete();//Completamos este para que tambien ya no exista
  }

}
