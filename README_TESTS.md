# Tests Unitarios para la Aplicación Eco-Check

Este documento describe cómo ejecutar y mantener los tests unitarios para la aplicación Angular Eco-Check.

## Estructura de los Tests

Los tests unitarios se encuentran en los siguientes archivos:

1. `src/app/app.spec.ts` - Tests básicos para el componente principal
2. `src/app/services/auth.service.spec.ts` - Tests para el servicio de autenticación
3. `src/app/services/profile.service.spec.ts` - Tests para el servicio de perfil de usuario
4. `src/app/services/empresa.service.spec.ts` - Tests para el servicio de empresas
5. `src/app/components/login/login.component.spec.ts` - Tests para el componente de inicio de sesión
6. `src/app/components/registro/registro.component.spec.ts` - Tests para el componente de registro
7. `src/app/components/home/home.component.spec.ts` - Tests para el componente principal (home)

## Requisitos Previos

Asegúrate de tener instaladas las dependencias de desarrollo necesarias:

```bash
npm install --save-dev @types/jasmine jasmine-core karma karma-jasmine karma-chrome-launcher
```

## Ejecutar los Tests

### Ejecutar todos los tests:

```bash
ng test
```

### Ejecutar tests en modo watch (desarrollo):

```bash
ng test --watch
```

### Ejecutar tests una sola vez:

```bash
ng test --watch=false
```

## Cobertura de Código

Para generar un informe de cobertura de código:

```bash
ng test --code-coverage
```

Esto generará un informe en la carpeta `coverage/`.

## Escribir nuevos Tests

### Para Componentes:

1. Crea un archivo `.spec.ts` junto al componente
2. Importa las dependencias necesarias
3. Usa `TestBed.configureTestingModule` para configurar el módulo de prueba
4. Usa espías (spies) para simular servicios
5. Escribe casos de prueba para diferentes escenarios

### Para Servicios:

1. Crea un archivo `.spec.ts` junto al servicio
2. Usa `HttpClientTestingModule` para simular llamadas HTTP
3. Usa `HttpTestingController` para simular respuestas
4. Verifica que las solicitudes HTTP sean las esperadas

### Para Pipes y Directivas:

1. Crea un archivo `.spec.ts` junto al pipe o directiva
2. Prueba diferentes valores de entrada
3. Verifica que la salida sea la esperada

## Mejores Prácticas

1. **Nombres descriptivos**: Usa nombres de prueba que describan claramente qué se está probando
2. **Tests independientes**: Cada test debe poder ejecutarse independientemente
3. **Cobertura significativa**: Apunta a cubrir caminos críticos y casos límite
4. **Mocks apropiados**: Simula dependencias externas cuando sea posible
5. **Limpieza**: Asegúrate de limpiar después de cada prueba

## Solución de Problemas

### Errores de Tipos Jasmine

Si encuentras errores relacionados con Jasmine, asegúrate de tener instaladas las definiciones de tipos:

```bash
npm install --save-dev @types/jasmine
```

### Tests que no se ejecutan

Verifica que:
1. Los archivos tienen la extensión `.spec.ts`
2. Están ubicados en el directorio correcto
3. El archivo `angular.json` está correctamente configurado

## Mantenimiento

- Actualiza los tests cuando se modifiquen los componentes o servicios
- Ejecuta los tests regularmente para asegurar que no hay regresiones
- Añade nuevos tests para nuevas funcionalidades