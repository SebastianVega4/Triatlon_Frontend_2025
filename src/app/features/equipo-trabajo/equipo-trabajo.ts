import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-equipo-trabajo',
  imports: [CommonModule],
  templateUrl: './equipo-trabajo.html',
  styleUrl: './equipo-trabajo.scss'
})
export class EquipoTrabajo {
 equipo = [
    {
      nombre: 'Andrés Amaya',
      rol: 'Scrum Master',
      imagen: 'https://drive.google.com/thumbnail?id=1x_IgJ0teOXJBaXQeLOIZhie6hWjxXWnV&sz=w1000',
      descripcion: 'Coordina y asegura la calidad en cada fase del desarrollo.'
    },
    {
      nombre: 'Sebastián Vega',
      rol: 'Product Owner',
      imagen: 'https://drive.google.com/thumbnail?id=1oBc8y9Jv7W5de-ZRLTPneaIzVOCtPVoD&sz=w1000',
      descripcion: 'Responsable de la validación de funcionalidades en cada fase de desarrollo.'
    },
    {
      nombre: 'Tatiana Lesmes',
      rol: 'Desarrolladora BackEnd',
      imagen: 'https://drive.google.com/thumbnail?id=1hVxR07OiSKep8mQ0SjpRBC9ki9noTYo-&sz=w1000',
      descripcion: 'Encargada del backend y la arquitectura de la aplicación.'
    },
   
    {
      nombre: 'Juan Beltrán',
      rol: 'Desarrollador BackEnd',
      imagen: 'https://drive.google.com/thumbnail?id=1_piwHwyX03pZPcuSY6W7e4CKK706FJS0&sz=w1000',
      descripcion: 'Encargado del backend y la arquitectura de la aplicación.'
    },
     {
      nombre: 'Alixon López',
      rol: 'Tester QA',
      imagen: 'https://drive.google.com/thumbnail?id=1_ofItH4T3pMBGn3WSZRTi3YBzqZKJZR9&sz=w1000',
      descripcion: 'Encargada de pruebas y aseguramiento de calidad.'
    },
    {
      nombre: 'Ingrith Rodríguez',
      rol: 'Desarrolladora FrontEnd',
      imagen: 'https://drive.google.com/thumbnail?id=1ex7P8PloI8ydUUYIqeXmdEuvp7SpcoVM&sz=w1000',
      descripcion: 'Responsable del diseño visual y la experiencia de usuario.'
    }
  ];
}
