import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { Card } from 'src/app/interfaces/card';
import { MessageService, Message } from 'primeng/api';
import { AuthService } from 'src/app/services/auth.service';
import { find } from 'rxjs';
import { salaget } from 'src/app/model/sala';

@Component({
  selector: 'app-tablero',
  templateUrl: './tablero.component.html',
  styleUrls: ['./tablero.component.css'],
  providers: [MessageService],
})
export class TableroComponent implements OnInit {
  userLogged = this.authService.getUserLogged();

  constructor(private dataService: DataService, private router: Router,private messageService: MessageService,private authService: AuthService,) {}

  cards: Array<any> = [];
  cartaJugador: Array<any> = [];
  cartaPorJugador : Array<any> = [];
  state = false;
  idcarta:string='';

  ngOnInit(): void {
    this.generateCards();
    this.conexionWebSocket();
  }

  enviarSala(id: string) {
    localStorage.setItem('id', id);
    this.router.navigate(['tablero']);
  }

  generateCards() {
    this.dataService.getCards().subscribe((x) => {
      let cortarCartas = x.slice(0, 5);

      x.forEach((res) => {
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
      this.obtenerCartarJugador();
    });
    console.log('Lista : ' , this.cards);
  }

  obtenerCartarJugador() {
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

  obtener(idCarta:string){
   
    this.cards.forEach((carta) => { 
      if (carta.id ==idCarta) {
        this.cartaJugador.push(carta);
      }
    });
    console.log('cartasEcontradas' , this.cartaJugador)
  }

  jugarCarta(id:string,idcarta:string){
    this.idcarta=idcarta;
    this.state = !this.state;
    console.log('**************ID CARTA***************')
    console.log(id)
    console.log('************IDJUEGO*****************')
    console.log(this.dataService.getJuegoId())
    console.log('************JUGADOR*****************')
    console.log(this.dataService.getJugadorId())

    this.userLogged.subscribe((value) => {      
      this.dataService.jugarcarta(this.dataService.getJuegoId(),this.dataService.getJugadorId(),id );
    });
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

        this.obtenerCartarJugador();
        this.state = !this.state;
      }
      console.log(evento);
    })
  }

  conexionWebSocket2(){
    this.dataService.connectToWebSocket(this.dataService.getJuegoId()).subscribe((event)=>{
      switch(event.type){
        case 'juego.TableroCreado': {
          break;
        }

        case 'juego.RondaCreada': {
          break;
        }

        case 'juego.TiempoDescontado': {
          break;
        }

        case 'juego.CartaAgregadaAlTablero': {
          break;
        }

        case 'juego.CartaQuitada': {
          break;
        }

        case 'juego.TiempoTerminado': {
          break;
        }

        case 'juego.CartaAlAzarSeleccionada': {
          break;
        }

        case 'juego.TableroDeshabilitado': {
          break;
        }

        case 'juego.CartasApostadasMostradas': {
          break;
        }

        case 'juego.GanadorDeRondaDeterminado': {
          break;
        }

        case 'juego.TiempoRestablecido': {
          break;
        }

        case 'juego.TableroHabilitado': {
          break;
        }

        case 'juego.CronometroIniciado': {
          break;
        }

      }
    });
  }

}
