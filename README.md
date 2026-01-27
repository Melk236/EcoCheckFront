# EcoCheck

Una aplicación móvil para escanear productos y evaluar su impacto ambiental y social.

## ¿Qué es EcoCheck?

EcoCheck es un asistente de compra sostenible que ayuda a los consumidores a tomar decisiones ecológicamente conscientes al escanear códigos de barras/QR de productos y recibir puntuaciones comprehensivas de su impacto ambiental y social.

## Características Principales

### 📱 Escaneo de Productos
- Escáner integrado usando la cámara del dispositivo
- Soporte para códigos de barras y códigos QR
- Reconocimiento automático de productos

### 🌍 Sistema de EcoScore
- **Impacto Ambiental (40%)**: Materiales de empaque, reciclabilidad, huella de carbono
- **Impacto del Transporte (30%)**: Distancia desde el país de origen
- **Huella de Carbono (30%)**: Cálculos específicos de CO2 por material

### 📊 Información Detallada
- Puntuaciones con códigos de color (verde/amarillo/naranja)
- Materiales de empaque y reciclabilidad
- País de origen y detalles de fabricación
- Ingredientes y información nutricional

### 🏢 Evaluación de Empresas
- Puntuación de responsabilidad social corporativa
- Certificaciones (Fair Trade, B Corp, Orgánico, etc.)
- Controversias y ética empresarial
- Base de datos de empresas con filtros y búsqueda

### 🌐 Integración de APIs
- **OpenFood Facts API**: Base de datos de productos
- **Wikidata API**: Información empresarial
- **LibreTranslate API**: Soporte multiidioma
- **API .NET personalizada**: Persistencia de datos

## Tecnologías

### Frontend
- **Angular 21** con componentes standalone
- **TypeScript** para seguridad tipada
- **Tailwind CSS** para estilos
- **Flowbite** componentes UI
- **ZXing Library** para escaneo de códigos

### Backend
- **API .NET** en localhost:7176
- **Base de datos local** para persistencia
- **Integración con APIs externas**

## Instalación y Configuración

Este proyecto fue generado usando [Angular CLI](https://github.com/angular/angular-cli) versión 21.0.0.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
