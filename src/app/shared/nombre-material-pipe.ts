import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nombreMaterial',
})
export class NombreMaterialPipe implements PipeTransform {

  transform(material:string): string {
    const letras = material.split('');
    letras[0] = letras[0].toUpperCase();
    material = letras.join('');
    const materialesDb = new Map([//Como vienen los materiales de la  DB

      ['CartonPAP', 'Carton (PAP)'],
      ['PlasticoPET', 'Plástico (PET)'],
      ['PlasticoPVC', 'Plástico (PVC)'],
      ['PlasticoHDPE', 'Plástico (HDPE)'],
      ['PlasticoLDPE', 'Plástico (LDPE)'],
      ['PlasticoPP', 'Plástico (PP)']
    ]);
    return materialesDb.get(material) ?? material;
  }

}
