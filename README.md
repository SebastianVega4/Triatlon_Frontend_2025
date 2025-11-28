# 🏊🚴🏃 Triatlón UPTC-Sogamoso 2025-2 - Plataforma de Gestión de Resultados

[![Angular](https://img.shields.io/badge/Built%20with-Angular%2020-red?style=for-the-badge&logo=angular)](https://angular.io/)
[![Firebase](https://img.shields.io/badge/Backend-Firebase%20Firestore-orange?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Status](https://img.shields.io/badge/Status-En%20Desarrollo-blue?style=for-the-badge)]()
[![License](https://img.shields.io/badge/License-GPL%203.0-brightgreen?style=for-the-badge)](https://www.gnu.org/licenses/gpl-3.0.html)

## 🎯 Descripción General

Esta aplicación web, desarrollada en **Angular 20** y respaldada por **Firebase Firestore**, es la plataforma oficial para la gestión y visualización de resultados de la **Triatlón UPTC-Sogamoso 2025-2**. Diseñada para ofrecer una experiencia interactiva y en tiempo real, permite a los usuarios consultar los resultados de cada prueba, explorar los detalles de los equipos y participantes, y visualizar los podios y premios individuales.

Un aspecto clave de la aplicación es su **panel de administración oculto**, que permite al organizador gestionar equipos, participantes, tiempos y, crucialmente, controlar la visibilidad de los resultados en tiempo real para mantener la emoción hasta la ceremonia de premiación.

## ✨ Características Destacadas

* **Visualización de Resultados en Tiempo Real**: Consulta de tiempos y posiciones actualizadas al instante para cada disciplina y equipo.
* **Detalle de Equipos y Participantes**: Explora la composición de cada equipo y los tiempos individuales de cada atleta en su respectiva disciplina.
* **Gestión de Equipos y Participantes (Panel Admin)**:
    * Creación y edición de equipos, incluyendo nombre, penalizaciones y visibilidad.
    * Asignación de participantes a equipos con su género y disciplina.
    * Registro y edición de tiempos individuales para cada participante.
* **Control de Visibilidad de Resultados**: El administrador puede ocultar o mostrar los resultados en tiempo real para añadir suspenso a la ceremonia de premiación.
* **Cálculo Automático de Tiempos y Posiciones**: El sistema calcula automáticamente el tiempo total del equipo y su posición general.
* **Lógica de Premios Avanzada**:
    * Identificación de los mejores tiempos por disciplina y género.
    * Exclusión de participantes de los equipos en el podio (1er, 2do, 3er lugar) para premios individuales, ya que ya han sido premiados. 
    * Gestión de un premio especial a la "Actitud Deportiva" seleccionado por los organizadores.
* **Manejo de Penalizaciones**: Asignación de una penalización de +5 minutos al tiempo del último competidor para aquellos atletas que no finalizan su prueba.
* **Autenticación Sencilla**: Un único usuario administrador predefinido en Firebase para el acceso al panel de gestión.

## ⚙️ Tecnologías Utilizadas

* **Frontend**: Angular 20
* **Base de Datos**: Firebase Firestore
* **Autenticación**: Firebase Authentication
* **Lenguajes**: TypeScript, HTML5, SCSS
* **Estilos**: Bootstrap (para un diseño responsivo y adaptado a móviles)

## 📂 Estructura del Repositorio

La arquitectura del proyecto está diseñada para ser modular y escalable, dividiendo claramente la lógica de negocio y la interfaz de usuario.

```
triatlon-app/
│
├── src/
│   ├── app/
│   │   ├── components/                 # Componentes UI
│   │   │   ├── admin/                  # Componentes del panel de administración
│   │   │   │   ├── admin-dashboard/
│   │   │   │   ├── crear-equipo/
│   │   │   │   ├── editar-equipo/
│   │   │   │   ├── gestion-tiempos/
│   │   │   │   └── visibilidad-resultados/
│   │   │   ├── public/                 # Componentes públicos de visualización
│   │   │   │   ├── equipo-detalle/
│   │   │   │   ├── lista-equipos/
│   │   │   │   ├── podio/
│   │   │   │   ├── premios-individuales/
│   │   │   │   └── resultados-disciplina/
│   │   │   └── shared/                 # Componentes compartidos (header, login, loading)
│   │   │       ├── header/
│   │   │       ├── loading/
│   │   │       └── login/
│   │   ├── guards/                     # Guardas de ruta para protección de admin
│   │   │   └── admin.guard.ts
│   │   ├── interfaces/                 # Definiciones de interfaces de datos (Equipo, Participante, Premio)
│   │   │   ├── equipo.interface.ts
│   │   │   ├── participante.interface.ts
│   │   │   └── premio.interface.ts
│   │   ├── services/                   # Servicios de interacción con Firebase y lógica de negocio
│   │   │   ├── auth.ts                 # Servicio de autenticación
│   │   │   ├── equipos.ts              # Servicio para CRUD de equipos y participantes
│   │   │   ├── resultados.ts           # Servicio para cálculos de resultados y premios
│   │   │   └── storage.ts              # Servicio para manejar la visibilidad de resultados
│   │   ├── app.config.ts
│   │   ├── app.html
│   │   ├── app.routes.ts               # Definición de rutas (incluida la ruta oculta de admin)
│   │   ├── app.scss
│   │   └── app.ts
│   ├── environments/                   # Configuración de entornos
│   └── assets/                         # Recursos estáticos (imágenes, etc.)
│
├── .gitignore                          # Archivos y carpetas excluidas del control de versiones
└── README.md                           # Documentación del proyecto
```

## 🚀 Instrucciones de Ejecución

Para poner en marcha este proyecto en tu entorno local:

### Requisitos

* Node.js (compatible con Angular 20)
* Angular CLI
* Git
* Una cuenta de Firebase con un proyecto configurado (Firestore y Authentication)

### Pasos para ejecución

1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/SebastianVega4/triatlon-app.git
    cd triatlon-app
    ```

2.  **Instalar dependencias de Angular**:
    ```bash
    npm install
    ```
3.**Ejecutar el proyecto**:
    ```
    ng serve
    ```

4.  **Acceder a la aplicación**:
    Abre tu navegador y navega a `http://localhost:4200/` (o el puerto que Angular CLI asigne).

5.  **Acceso al Panel de Administración**:
    La ruta de administración es una ruta oculta.Deberás navegar a ella y autenticarte con las credenciales del usuario admin que configuraste en Firebase. 

---

## 👨‍🎓 Autor

Desarrollado por **Sebastián Vega**

📧 *Sebastian.vegar2015@gmail.com*

🔗 [LinkedIn - Johan Sebastián Vega Ruiz](https://www.linkedin.com/in/johan-sebastian-vega-ruiz-b1292011b/)

---

## 📜 Licencia

Este repositorio se encuentra bajo la Licencia **GPL 3.0**.

**Permisos:**
* Uso comercial
* Modificación
* Distribución
* Uso privado

---

Facultad de Ingeniería — Ingeniería de Sistemas 🧩

**🏫 Universidad Pedagógica y Tecnológica de Colombia**
📍 Sogamoso, Boyacá 📍

© 2025 — Sebastian Vega
