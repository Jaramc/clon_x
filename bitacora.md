# BITÁCORA DE DESARROLLO — INTEGRANTE 3

**Proyecto:** Clon de X (Twitter)  
**Módulo:** Sistema de seguidores y autenticación simulada  
**Tecnologías:** React, Vite, JavaScript, CSS, React Router y Git  
**Rama de trabajo:** `feature/follow-system`  
**Rama de integración:** `dev`  
**Pull Request:** [#4](https://github.com/Jaramc/clon_x/pull/4)

## 1. Objetivo

Implementar las funcionalidades correspondientes al sistema de seguidores y seguidos del proyecto Clon de X, incluyendo autenticación simulada, protección de rutas, visualización de usuarios, paginación y ordenamiento alfabético.

## 2. Actividades desarrolladas

### Actividad 1. Implementación de datos simulados

Se configuraron los archivos `mockUsers.js` y `mockFollows.js` para representar usuarios y relaciones de seguimiento.

**Resultado:** Se establecieron los datos necesarios para probar las funcionalidades sin depender de una base de datos externa.

### Actividad 2. Desarrollo del servicio de seguimiento

Se implementó `followService.js` para gestionar las operaciones de seguimiento.

**Funcionalidades:**

- Consultar usuarios seguidos.
- Consultar seguidores.
- Seguir usuarios.
- Dejar de seguir usuarios.

**Resultado:** Se centralizó la lógica del sistema de seguimiento.

### Actividad 3. Desarrollo de componentes

Se implementaron y utilizaron componentes reutilizables como `FollowButton`, `UserCard` y `FollowDemo`.

**Resultado:** Se construyó una interfaz que permite visualizar usuarios e interactuar con las relaciones de seguimiento.

### Actividad 4. Autenticación simulada

Se desarrolló un sistema de autenticación utilizando `AuthContext`, `useAuth`, `LoginPage` y servicios relacionados.

**Funcionalidades:**

- Inicio de sesión simulado.
- Cierre de sesión.
- Identificación del usuario autenticado.
- Protección de rutas privadas.
- Redirección al iniciar sesión.

**Resultado:** Se implementó el control de acceso a las funcionalidades privadas del sistema.

### Actividad 5. Páginas de seguidores y seguidos

Se desarrollaron las páginas `FollowingPage.jsx` y `FollowersPage.jsx`.

**Funcionalidades:**

- Visualizar usuarios seguidos.
- Visualizar seguidores.
- Mostrar contadores.
- Presentar mensajes cuando no existen registros.

**Resultado:** Se habilitaron las vistas de seguimiento asociadas al usuario autenticado.

### Actividad 6. Paginación y ordenamiento alfabético

Se incorporaron `Pagination.jsx`, `Pagination.css` y `usePagination.js`.

**Funcionalidades:**

- Distribuir los usuarios en páginas.
- Navegar mediante los botones Anterior y Siguiente.
- Seleccionar números de página.
- Ordenar alfabéticamente los listados.
- Mantener los contadores generales independientemente de la página seleccionada.

**Resultado:** Se mejoró la organización y navegación de los listados de seguidores y seguidos.

## 3. Pruebas realizadas

| Prueba                             | Resultado     |
| ---------------------------------- | ------------- |
| Visualización de usuarios seguidos | Satisfactoria |
| Visualización de seguidores        | Satisfactoria |
| Actualización de contadores        | Satisfactoria |
| Navegación entre páginas           | Satisfactoria |
| Ordenamiento alfabético            | Satisfactoria |
| Inicio y cierre de sesión          | Satisfactoria |
| Protección de rutas                | Satisfactoria |
| Instalación con `npm ci`           | Satisfactoria |
| Compilación con `npm run build`    | Satisfactoria |

## 4. Incidencias y soluciones

**Incidencia 1.** Los contadores de seguidores y seguidos cambiaban durante las pruebas.

**Solución:** Se verificaron los datos simulados y el comportamiento de los listados.

**Incidencia 2.** Error `EPERM` durante la ejecución inicial de `npm ci`.

**Solución:** Se comprobó que no existieran procesos de Node.js utilizando archivos de dependencias y se ejecutó nuevamente la instalación, finalizando correctamente.

**Incidencia 3.** Necesidad de mejorar la visualización de listas extensas.

**Solución:** Se incorporó paginación y ordenamiento alfabético.

## 5. Control de versiones

Se utilizó Git para registrar los cambios y GitHub para publicar el trabajo.

**Commits principales:**

- `8a24edf` — Implementar sistema de seguidores y autenticación.
- `253c38f` — Agregar paginación y orden alfabético a seguidores y seguidos.

Se publicaron los cambios en la rama `feature/follow-system` y se asociaron al Pull Request #4.

## 6. Estado del desarrollo

Las funcionalidades del Integrante 3 se encuentran implementadas y se han realizado pruebas funcionales y de compilación.

El Pull Request #4 permanece abierto, sin conflictos de integración y con una revisión solicitada al equipo.

**Estado:** Desarrollo completado; pendiente de revisión e integración con `dev`.

## 7. Conclusión

El desarrollo permitió aplicar conceptos de React, componentes reutilizables, hooks, manejo de estados, autenticación simulada, enrutamiento, paginación y control de versiones.

Las funcionalidades implementadas contribuyen a la interacción entre usuarios dentro del proyecto Clon de X y establecen una base para futuras integraciones con servicios y bases de datos reales.
