import { Producto } from './producto';
import { Material } from './material';

export interface ProductoConMateriales extends Producto {
    materiales?: Material[];
}
