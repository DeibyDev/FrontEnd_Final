import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { ICard } from 'src/app/interfaces/card';
import { MessageService, Message } from 'primeng/api';
import { AuthService } from 'src/app/services/auth.service';
import { JugadorCards } from 'src/app/interfaces/jugador-cards';
import { CartaJugador } from 'src/app/interfaces/carta-jugador';

@Component({
  selector: 'app-tablero',
  templateUrl: './tablero.component.html',
  styleUrls: ['./tablero.component.scss'],
  providers: [MessageService],
})
export class TableroComponent implements OnInit {
  userLogged = this.authService.getUserLogged();

  constructor(private dataService: DataService, private router: Router,private messageService: MessageService,private authService: AuthService,) {}

  cards: Array<ICard> = [];
  cartasJugador: Array<ICard> = [];
  cartaPorJugador : Array<any> = [];
  cartaJugada: string = '';
  cartaJugadaTemp: string = '';
  cartaEscondida: string = '';
  cronometro: number = 0;
  deshabilitarApuesta: boolean = false;

  apuestas: CartaJugador[] = [];

  estadoJugador: JugadorCards[] = [{
    jugadorId: '',
    cartas:[{
      cartaId: '',
      habilitada: true,
      oculta: true,
      xp: 0
    }],
    puntaje: 0,
    when: ''
  }];

  ngOnInit(): void {
    this.generateCards();
    this.conexionWebSocket();
    this.cronometro = 60;
    this.deshabilitarApuesta = false;
    this.cartaEscondida = '/assets/carta-volteada.png'
  }

  enviarSala(id: string) {
    localStorage.setItem('id', id);
    this.router.navigate(['tablero']);
  }

  generateCards() {
    this.dataService.getCards().subscribe((res) => {
    this.cards = res;
    });
  }

  obtenerCartasJugador() {
    this.dataService
      .obtenerCartasJugador(
        this.dataService.getJuegoId(),
        this.dataService.getJugadorId()
      )
      .subscribe((carta) => {

        carta[0].cartas.forEach((elem: { cartaId: string; }) => {

          this.obtener(elem.cartaId)
        })
      });
  }

  obtener(idCarta: string) {

    this.cards.forEach((carta) => {
      if (carta.id == idCarta) {
        this.cartasJugador.push(carta);
      }
    });

    const set = new Set(this.cartasJugador);
    this.cartasJugador = [...set];
  }

  jugarCarta(idCarta: string, cartaApostada: string){
    this.authService.getUserLogged().subscribe( user => {
      if(user?.email === this.dataService.getJugadorId()){
        this.cartaJugada = cartaApostada;
        this.cartaJugadaTemp = this.cartaJugada;
        this.cartaJugada = this.cartaEscondida;
      }
    });

    let poder: number = 0;

    this.cards.filter(carta => {
      if(carta.imagen === this.cartaJugadaTemp){
        poder = carta.poder;
      }
    });

    let cartaJugador: CartaJugador;
    cartaJugador = {
      jugadorId: this.dataService.getJugadorId(),
      carta: this.cartaJugadaTemp,
      poder: poder
    }

    this.apuestas.push(cartaJugador);   

    this.dataService.jugarcarta(this.dataService.getJuegoId(), this.dataService.getJugadorId(), idCarta ).subscribe();
    this.cartasJugador = this.cartasJugador.filter( carta => carta.id !== idCarta);
    
    this.deshabilitarApuesta = true;
  }

  establecerGanadorRonda(jugadorId: string){
    this.userLogged.subscribe((value) => {

      if(value?.email == jugadorId){
        this.messageService.add({
          severity: 'success',
          summary: 'Exitoso',
          detail: 'Ganador de la ronda',
        });
      }else{
        this.messageService.add({
          severity: 'error',
          summary: 'Ronda Perdida',
          detail: 'Siguiente Partida Preparate',
        });
      }
    });
  }

  establecerGanadorJuego(jugadorId: string){
    this.userLogged.subscribe((value) => {

      if(value?.email == jugadorId){
        this.messageService.add({
          severity: 'success',
          summary: 'Exitoso',
          detail: 'Ganador del Juego',
        });
      }else{
        this.messageService.add({
          severity: 'error',
          summary: 'Juego Perdido',
          detail: 'Perdiste todas las cartas',
        });
      }
    });
  }

  quitarCartaAlAzar(event: any){
    let idCarta = event.carta.entityId.uuid;
    let carta : ICard = this.cards.filter(carta => carta.id === idCarta)[0];

    let cartaApostada = carta.imagen;

    this.jugarCarta(idCarta, cartaApostada);
  }

  mostrarCarta(){
    this.userLogged.subscribe((user) => {
      this.apuestas.forEach( cartaJugador => {
        if(cartaJugador.jugadorId === user?.email){
          this.cartaJugada = cartaJugador.carta;
        }
      });
    });
  }

  empate(event: any){
    event.jugadorIds.forEach( (id: { uuid: string; }) => {
      if(id.uuid === this.dataService.getJugadorId()){
        this.deshabilitarApuesta = false;
      } else {
        this.deshabilitarApuesta = true;
      }

      this.messageService.add({
        severity: 'warning',
        summary: 'Empate',
        detail: 'Jugador ' + id.uuid + ' empatado',
      });
    });
  }

  conexionWebSocket(){
    this.dataService.connectToWebSocket(this.dataService.getJuegoId()).subscribe((event)=>{
      switch(event.type){
        case 'juego.TableroCreado': {
          break;
        }

        case 'juego.RondaCreada': {
          this.obtenerCartasJugador();
          break;
        }

        case 'juego.TiempoDescontado': {
          this.cronometro = this.cronometro - 1;
          break;
        }

        case 'juego.CartaJugada': {
          this.cartaJugada = this.cartaEscondida;
          break;
        }

        case 'juego.CartaAgregadaAlTablero': {
          this.quitarCartaAlAzar(event);
          this.cartaJugada = this.cartaEscondida;
          break;
        }

        case 'juego.CartaQuitada': {
          this.obtenerCartasJugador();
          break;
        }

        case 'juego.TiempoTerminado': {
          this.cronometro = 0;
          this.deshabilitarApuesta = true;
          break;
        }

        case 'juego.CartaAlAzarSeleccionada': {
          break;
        }

        case 'juego.TableroDeshabilitado': {
          this.deshabilitarApuesta = true;
          break;
        }

        case 'juego.CartasApostadasMostradas': {
          this.mostrarCarta();
          break;
        }

        case 'juego.GanadorDeRondaDeterminado': {
          this.establecerGanadorRonda(event.jugadorId.uuid);
          this.cartaJugada = '';
          break;
        }

        case 'juego.RondaDeDesempateCreada': {
          this.empate(event);
          break;
        }

        case 'juego.GanadorDeJuegoDeterminado': {
          this.establecerGanadorJuego(event.ganador.entityId.uuid);
          this.obtenerCartasJugador();
          setTimeout(() => {
            localStorage.setItem('juegoId', event.aggregateRootId);
            this.router.navigate(['history']);
          }, 3000);
          break;
        }

        case 'juego.TiempoRestablecido': {
          this.cronometro = 60;
          this.cartaJugada = '';
          break;
        }

        case 'juego.TableroHabilitado': {
          this.deshabilitarApuesta = false;
          break;
        }

        case 'juego.CronometroIniciado': {
          this.cronometro = this.cronometro - 1;
          break;
        }

      }
    });
  }

}
