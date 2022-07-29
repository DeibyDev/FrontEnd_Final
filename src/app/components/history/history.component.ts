import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { JugadorSimple } from 'src/app/interfaces/jugador-simple';
import { EstadoJuego } from 'src/app/interfaces/estado-juego';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {

  jugadores: JugadorSimple[] = [];
  estadoJuego: EstadoJuego = {
    juegoId: '',
    jugadores: [],
    estado: false,
    when: ''
  };

  displayedColumns: string[] = ['jugador', 'rondas-ganadas'];
  dataToDisplay = this.jugadores;

  juegoId: any;

  constructor(private dataService: DataService, private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.juegoId = localStorage.getItem('juegoId');
    console.log('Juego Id:', this.juegoId);
    
    this.conexionWebSocket();
    this.consultarEstadoDeJuego(this.juegoId);
  }

  consultarEstadoDeJuego(idJuego: string){
   this.dataService.getInformacionSala(idJuego).subscribe( res => {
    this.estadoJuego = res;
    res.jugadores.forEach( jugador => {
      let jugadorSimple: JugadorSimple;
      jugadorSimple = {
        jugadorId: jugador.jugadorId,
        alias: jugador.alias,
        puntaje: jugador.puntaje
      }

      this.jugadores.push(jugadorSimple);

    });
    
    console.log('RESPUESTA', res);
    
   });

   //this.jugadores.sort((a,b) => b.puntaje - a.puntaje);
   console.log('jugadores: ', this.jugadores);
   ;
  }

  conexionWebSocket(){
    this.dataService.connectToWebSocket(this.juegoId).subscribe((event)=>{
      if(event.type === 'juego.JuegoMostrado' && event.jugando === false){

      }
    });
  }

}
