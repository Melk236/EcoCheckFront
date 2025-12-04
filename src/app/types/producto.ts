export interface ProductoResponse {
    product: Product;
}

export interface Product {
    product_name: string;
    brands: string;
    categories: string;
    countries_tags: string[];
    image_front_url: string;
    ingredients_text: string;
    packaging_materials_tags: string[];
    packaging_recycling_tags: string[];
    carbon_footprint_percent_of_known_ingredients: number;
    manufacturing_places: string;
    generic_name: string;
    generic_name_de: string;
    generic_name_en: string;
    generic_name_es: string;
    generic_name_fr: string;
    generic_name_zh: string;
    labels_tags:string[];
}

export interface Producto {
    id: number;
    nombre?: string;
    marcaId: number;
    categoria: string;
    paisOrigen?: string;
    descripcion: string;
    ecoScore: number;
    imagenUrl?: string;
    fechaActualizacion: Date;
}