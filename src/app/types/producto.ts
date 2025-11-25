export interface Producto {
    product:Product;
}
export interface Product{
    product_name:string;
    brands:string;
    categories:string;
    countries_tags:string[];
    image_front_url:string;
    ingredients_text:string;
    packaging_materials_tags:string[];
    packaging_recycling_tags:string[];
    carbon_footprint_percent_of_known_ingredients:number;

}