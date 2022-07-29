import { Component, OnInit } from '@angular/core';
import { salaget } from 'src/app/model/sala';
import { DataService } from 'src/app/services/data.service';
import { Router } from '@angular/router';
import { jugador } from 'src/app/interfaces/jugador';
import { MessageService, Message } from 'primeng/api';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-salajugador',
  templateUrl: './salajugador.component.html',
  styleUrls: ['./salajugador.component.scss'],
  providers: [MessageService],
})
export class SalajugadorComponent implements OnInit {
  jugadores: Array<jugador> = [];
  jugadoresFiltrados: Array<jugador> = [];
  player1: { juegoId: string; imagen: string } = { juegoId: '', imagen: '' };

 

  habilitarBoton:boolean = true;
  habilitarJuego:boolean = false;
  spinner:boolean = false;
  usuarioLogeado:string ='';

  userLogged: any;
  juegoId:any ='';

  sesionLogeadaFirebase:any ='';
  sesionSala:string='';

  constructor(private dataService: DataService,
    private router: Router,
    private messageService: MessageService,
    private authService: AuthService,) {}


  ngOnInit(): void {

    this.authService.getUserLogged().subscribe((prop)=>{
      console.log(prop?.email)
      this.sesionLogeadaFirebase =prop?.email;
    });
 
    this.juegoId= localStorage.getItem('id');
    this.obtenerInformacionSala(this.juegoId);
    this.conexionWebSocket();
   
    this.habilitarBoton=true;
    this.habilitarJuego=false;
    this.spinner=false;
    this.userLogged = this.authService.getUserLogged();  
  }

  obtenerInformacionSala(id:string){
   this.dataService.getInformacionSala(id).subscribe((res:any)=>
   {
    let juegoID =res.juegoId;
    res.jugadores.forEach((elem: { alias: any; jugadorId: any; puntaje: any; }) => {
      let juga: jugador;
      juga = {
        alias: elem.alias,
        jugadorId: elem.jugadorId,
        puntaje: elem.puntaje,
        juegoId:juegoID
      };

      this.jugadores.push(juga);

      this.jugadoresFiltrados = this.jugadores.filter((valor, indice) => {
        this.jugadores.indexOf(valor) === indice;
      });
        
      this.userLogged.subscribe( (x: { email: string; }) => {
        //this.habilitarJuego = this.jugadores[0].jugadorId == x?.email;
        this.userLogged=this.jugadores[0].jugadorId;
        this.usuarioLogeado = x.email;
        console.log('jugador id ', this.jugadores[0].jugadorId, 'x ', x?.email);
      });

    });   
   })
  }

  iniciarJuego(){
    if(this.jugadores.length >= 2){
      let juegoId:any = localStorage.getItem('id');
      this.dataService.getIniciarJuego(juegoId).subscribe();
      this.habilitarBoton=false;
      this.messageService.add({
        severity: 'Warning',
        summary: 'Creando Tablero !',
        detail: 'Uniendo jugadores al tablero',
      });

      this.spinner=true;
      
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'No se puede iniciar el juego.',
        detail: 'Jugadores Insuficientes.',
      });
    }
  }

  enviarSala(juegoId:string,jugadorId:string){
    this.dataService.setJuegoId(juegoId);
    this.dataService.setJugadorId(jugadorId);
    localStorage.setItem('id', juegoId);
    this.router.navigate(['tablero']);
  }

  crearBot(){
    var randomEmail = require('random-email');
    this.dataService.agregarJugadorSala(this.juegoId, randomEmail(), 'Automático').subscribe();
  }

  conexionWebSocket(){
      
    this.dataService.connectToWebSocket(this.juegoId).subscribe((evento)=>{
      console.log('socket desde salajugadors' , evento);
           
      switch(evento.type){

      case 'juego.JugadorCreado' :{
          let juga: jugador;
        juga = {
          alias: evento.alias,
          jugadorId: evento.jugadorId,
          puntaje: 0,
          juegoId:evento.aggregateRootId
        };

        this.jugadores.forEach((jugador)=>{
          if(!(jugador.jugadorId==juga.jugadorId)){
            this.jugadores.push(juga);  
          }
        });

        this.router.navigate(['sala-jugador'])
        .then(() => {
          window.location.reload();
        });

        this.messageService.add({
          severity: 'info',
          summary: 'Jugador Agregado a la Sala.',
          detail: evento.jugadorId
        });
      } 
      break;

     case 'juego.JuegoIniciado' : {
        this.enviarSala(evento.aggregateRootId,this.usuarioLogeado);
     }


    }  
    })
  }
}
