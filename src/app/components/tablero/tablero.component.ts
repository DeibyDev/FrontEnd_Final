import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { Card } from 'src/app/interfaces/card';
import { MessageService, Message } from 'primeng/api';
import { AuthService } from 'src/app/services/auth.service';
import { find } from 'rxjs';
import { salaget } from 'src/app/model/sala';
import { JugadorCards } from 'src/app/interfaces/jugador-cards';
import { CardSimple } from 'src/app/interfaces/card-simple';
import { CartaJugador } from 'src/app/interfaces/carta-jugador';

@Component({
  selector: 'app-tablero',
  templateUrl: './tablero.component.html',
  styleUrls: ['./tablero.component.css'],
  providers: [MessageService],
})
export class TableroComponent implements OnInit {
  userLogged = this.authService.getUserLogged();

  constructor(private dataService: DataService, private router: Router,private messageService: MessageService,private authService: AuthService,) {}

  cards: Array<Card> = [];
  cartasJugador: Array<Card> = [];
  cartaPorJugador : Array<any> = [];
  state = false;
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
    this.conexionWebSocket2();
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

      /*x.forEach((res) => {
        let card: Card;
        card = {
          id: res.id,
          nombre: res.nombre,
          descipcion: res.descipcion,
          poder: res.poder,
          caracteristica: res.caracteristica,
          imagen: res.imagen,
        };
        this.cards.push(card);
      });
      //this.obtenerCartasJugador();
    });*/
    this.cards = res;
    console.log('Lista : ' , this.cards);
    
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
    
    /*
    this.dataService
    .obtenerCartasJugador(
      this.dataService.getJuegoId(),
      this.dataService.getJugadorId()
    ).subscribe(res => {

      res[0].cartas.forEach((elem: { cartaId: string; }) => {

        this.obtener(elem.cartaId)
      })
      //this.estadoJugador = res;
      //this.cartaJugador = res[0].cartas;
    });

    console.log('CARTAS JUGADOR: ', this.estadoJugador);
    */
  }

  obtener(idCarta: string) {

    this.cards.forEach((carta) => {
      if (carta.id == idCarta) {
        this.cartasJugador.push(carta);
      }
    });

    const set = new Set(this.cartasJugador);
    this.cartasJugador = [...set];

    console.log('cartasEcontradas', this.cartasJugador);
  }

  jugarCarta(idCarta: string, cartaApostada: string){
    this.authService.getUserLogged().subscribe( user => {
      if(user?.email === this.dataService.getJugadorId()){
        this.cartaJugada = cartaApostada;
        this.cartaJugadaTemp = this.cartaJugada;
      }
    });

    let cartaJugador: CartaJugador;
    cartaJugador = {
      jugadorId: this.dataService.getJugadorId(),
      carta: this.cartaJugadaTemp
    }

    this.apuestas.push(cartaJugador);

    console.log('**************ID CARTA***************')
    console.log(idCarta)
    console.log('************IDJUEGO*****************')
    console.log(this.dataService.getJuegoId())
    console.log('************JUGADOR*****************')
    console.log(this.dataService.getJugadorId())    

    this.dataService.jugarcarta(this.dataService.getJuegoId(), this.dataService.getJugadorId(), idCarta ).subscribe();
    this.cartasJugador = this.cartasJugador.filter( carta => carta.id !== idCarta);
    
    this.deshabilitarApuesta = true;
    this.cartaJugada = this.cartaEscondida;
  }

  conexionWebSocket(){
    this.dataService.connectToWebSocket(this.dataService.getJuegoId()).subscribe((evento)=>{
      if (evento.type === 'juego.GanadorDeRondaDeterminado') {
        this.userLogged.subscribe((value) => {
          console.log('**************************')
          console.log(value?.email)
          console.log('**************************')
          console.log(evento.jugadorId.uuid)
          console.log('**************************')

          if(value?.email == evento.jugadorId.uuid){
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

        this.obtenerCartasJugador();
        this.state = !this.state;
      }
      console.log(evento);
    })
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
    let carta : Card = this.cards.filter(carta => carta.id === idCarta)[0];

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

  conexionWebSocket2(){
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
          //this.quitarCartaAlAzar(event);
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
          //this.mostrarCarta();
          this.cartaJugada = this.cartaJugadaTemp;
          break;
        }

        case 'juego.GanadorDeRondaDeterminado': {
          this.establecerGanadorRonda(event.jugadorId.uuid);
          this.cartaJugada = '';
          break;
        }

        case 'juego.RondaDeDesempateCreada': {
          event.jugadorIds.subscribe( (id: string) => {
            if(id === this.dataService.getJugadorId()){
              this.deshabilitarApuesta = false;
            } else {
              this.deshabilitarApuesta = true;
            }
          });
          break;
        }

        case 'juego.GanadorDeJuegoDeterminado': {
          this.establecerGanadorJuego(event.ganador.entityId.uuid);
          this.obtenerCartasJugador();
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
