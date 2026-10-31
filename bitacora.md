# Bitácora de uso de asistentes de IA  

**Proyecto:** clon_x  
**Herramienta:** ChatGPT  
**Modelo:** GPT-6  
**Periodo:** Octubre de 2026

## 1. Integración de Firebase con React

**Fecha:** Octubre de 2026  
**Herramienta:** ChatGPT – GPT-6.

**Consulta realizada:** Orientación para integrar Firebase en el proyecto React y configurar correctamente la conexión con sus servicios.

**Asistencia recibida:**
- Orientación sobre la configuración del proyecto Firebase.
- Revisión de la configuración de Firebase dentro de React.
- Apoyo para conectar Firebase Authentication y Cloud Firestore.
- Revisión de la inicialización de Firebase y sus importaciones.

**Archivos relacionados:**
- `src/lib/firebase.js`
- `package.json`

**Resultado:** Se logró configurar la conexión entre la aplicación y los servicios de Firebase.

## 2. Configuración de autenticación y sesiones de Firebase

**Fecha:** Octubre de 2026  
**Herramienta:** ChatGPT – GPT-6.

**Consulta realizada:** Ayuda para solucionar problemas relacionados con la autenticación de Firebase, especialmente al iniciar sesión y recuperar los datos del usuario.

**Asistencia recibida:**
- Revisión de Firebase Authentication.
- Orientación sobre la autenticación mediante correo electrónico y contraseña.
- Revisión del inicio de sesión con Google.
- Análisis de la recuperación de sesiones mediante `onAuthStateChanged`.
- Revisión de la conexión entre el usuario autenticado y su perfil almacenado en Firestore.

**Archivos relacionados:**
- `src/services/authService.js`
- `src/context/AuthContext.jsx`
- `src/hooks/useAuth.js`

**Resultado:** Se solucionaron problemas de integración relacionados con la autenticación y la recuperación de sesiones.

## 3. Revisión de permisos y reglas de seguridad de Firestore

**Fecha:** Octubre de 2026  
**Herramienta:** ChatGPT – GPT-6.

**Consulta realizada:** Ayuda para solucionar el error `Missing or insufficient permissions` al realizar consultas y operaciones en Firestore.

**Asistencia recibida:**
- Revisión de las reglas de seguridad de Firestore.
- Análisis de los permisos de lectura y escritura de la colección `users`.
- Revisión de los permisos de la colección `follows`.
- Validación de que las operaciones se realizaran con un usuario autenticado.
- Análisis de consultas que generaban errores de permisos.
- Orientación para proteger los datos y evitar habilitar accesos públicos innecesarios.

**Archivos relacionados:**
- `src/services/userService.js`
- `src/services/followService.js`
- `src/context/AuthContext.jsx`
- Reglas de seguridad de Cloud Firestore.

**Resultado:** Se identificaron y corrigieron problemas relacionados con los permisos y las consultas a Firestore, manteniendo las restricciones de acceso para usuarios autenticados.

## 4. Corrección de errores de integración con Firebase

**Fecha:** Octubre de 2026  
**Herramienta:** ChatGPT – GPT-6.

**Consulta realizada:** Apoyo para identificar y corregir errores que aparecieron durante la integración de Firebase con los diferentes servicios de la aplicación.

**Asistencia recibida:**
- Revisión de errores de importación de Firebase.
- Análisis de problemas relacionados con `auth.currentUser`.
- Revisión de las operaciones de consulta y escritura en Firestore.
- Orientación para identificar el origen de los errores de permisos.
- Revisión de advertencias relacionadas con las importaciones de Firebase.

**Archivos relacionados:**
- `src/lib/firebase.js`
- `src/services/authService.js`
- `src/services/userService.js`
- `src/services/followService.js`
- `src/context/AuthContext.jsx`

**Resultado:** Se recibió asistencia para diagnosticar y solucionar inconvenientes técnicos relacionados con la integración de Firebase y sus permisos.

---

**Alcance de la asistencia:** La ayuda de ChatGPT se limitó a la integración de Firebase, la configuración de autenticación, la revisión de permisos de Firestore y la solución de errores relacionados con estos servicios. El desarrollo de las demás funcionalidades de la aplicación fue realizado por el equipo.