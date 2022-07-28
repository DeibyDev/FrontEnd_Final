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
  player1: { juegoId: string; imagen: string } = { juegoId: '', imagen: '' };
 

  habilitarBoton:boolean = true;
  habilitarJuego:boolean = false;

  userLogged: any;

  constructor(private DataService: DataService,
    private router: Router,
    private messageService: MessageService,
    private authService: AuthService,) {}


  ngOnInit(): void {
    let juegoId:any = localStorage.getItem('id');
    this.obtenerInformacionSala(juegoId);
    this.habilitarBoton=true;
    this.habilitarJuego=false;
    this.userLogged = this.authService.getUserLogged();  
  }


  obtenerInformacionSala(id:string){
   this.DataService.getInformacionSala(id).subscribe((res:any)=>
   {
    console.log(res)
    let juegoID =res.juegoId;
    res.jugadores.forEach((elem: { alias: any; jugadorId: any; puntaje: any; }) => {
      let juga: jugador;
      juga = {
        alias: elem.alias,
        jugadorId: elem.jugadorId,
        puntaje: elem.puntaje,
        juegoId:juegoID
      }
      this.jugadores.push(juga);
      this.userLogged.subscribe( (x: { email: string; }) => {
        this.habilitarJuego = this.jugadores[0].jugadorId == x?.email;
        console.log('jugador id ', this.jugadores[0].jugadorId, 'x ', x?.email);
        
      })

    });   
   })
  }

  iniciarJuego(){
    if(this.jugadores.length >= 2){
      let juegoId:any = localStorage.getItem('id');
      this.DataService.getIniciarJuego(juegoId).subscribe();
      this.habilitarBoton=false;
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'No se puede iniciar el juego.',
        detail: 'Jugadores Insuficientes.',
      });
    }
  }

  
  enviarSala(juegoId:string,jugadorId:string){
    this.DataService.setJuegoId(juegoId);
    this.DataService.setJugadorId(jugadorId);
    localStorage.setItem('id', juegoId);
    if(this.jugadores.length >= 2){
      this.router.navigate(['tablero']);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'No se puede iniciar el juego.',
        detail: 'Jugadores Insuficientes.',
      });
    }
  }
}
