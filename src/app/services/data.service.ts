import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Card } from '../interfaces/card';
import { juego } from '../model/juego';
import { Observable } from 'rxjs';
import { sala } from '../model/informacionSala';
import { salaget } from '../model/sala';

@Injectable({
  providedIn: 'root',
})

export class DataService {
  constructor(private http: HttpClient) {}

  private juegoId:string ='';
  private jugadorId:string='';

  public setJuegoId (id:string){
    this.juegoId=id;
  }
  public setJugadorId (id:string){
    this.jugadorId=id;
  }
  public  getJugadorId ():string{
    return this.jugadorId;
  }
  public  getJuegoId  ():string{
    return this.juegoId;
  }

  //agregar sets

  sendPlayers(gameData: any) {
    return this.http.post<any>('http://localhost:8080/crearJuego', gameData);
  }

  startGame(id: string) {
    const gameId = { juegoId: id };
    return this.http.post<any>('http://localhost:8080/iniciarJuego', gameId);
  } //https://cargames.herokuapp.com

  getCards() {
    return this.http.get<Card[]>('http://localhost:8080/api/v1/carta');
    // return this.http.get<Card[]>('/api/v1/carta');
  }

  connectToWebSocket(juegoId: string) {
    const webSocketSubject: WebSocketSubject<any> = webSocket(
      `ws://192.168.0.7:8080/retrieve/${juegoId}`
    );
    return webSocketSubject.asObservable();
  }

  // TODO: Nuevo

  private url: string = 'http://192.168.0.7:8080/api/v1/juego/';

  crearjuego(id: juego): Observable<any> {
    let direction = this.url + 'crearjuego';
    return this.http.post<any>(direction, id, {
      responseType: 'text' as 'json',
    });
  }

  getsala(): Observable<any> {
    let direction = this.url;
    return this.http.get<any>(direction);
  }

  getInformacionSala(id: string): Observable<any> {
    let direction = this.url;
    return this.http.get(`http://192.168.0.7:8080/api/v1/juego/${id}`);
  }

  getIniciarJuego(id: string): Observable<any> {
    return this.http.get(
      `http://192.168.0.7:8080/api/v1/juego/iniciarjuego/${id}`
    );
  }

  obtenerCartasJugador(juegoId: string ,jugadorId:string): Observable<any> {

    let parametros={
      'juegoId':juegoId,
      'jugadorId':jugadorId
    };
    let direction = this.url + 'jugador';

    return this.http.post<any>(direction, parametros);
  }

  agregarJugadorSala(juegoId: string ,jugadorId:string,alias:string): Observable<any>{

    let parametros={
      'juegoId':juegoId,
      'jugadorId':jugadorId,
      'alias':alias
    };
    let direction = this.url + 'agregarjugador';

    return this.http.post<any>(direction, parametros);

  }

  saveQuestion(question: salaget): Observable<any> {
    let direction = 'http://192.168.0.7:8080/api/v1/juego/' + 'agregarjugador';


    console.log('*******Save Question******');
    console.log(question);
    console.log('*******Save Question******');
    console.log();
    console.log('*******Save direction******');
    console.log(direction);
    console.log('*******Save direction******');
    return this.http.post<any>(direction, {'juegoId':question.juegoId,
    'jugadorId':question.jugadorId,
    'alias':question.alias}, {
      responseType: 'text' as 'json',
    });
  }

  jugarcarta(juegoId: string ,jugadorId:string,cartaId:string): Observable<any>{

    let parametros={
      'juegoId':juegoId,
      'jugadorId':jugadorId,
      'cartaId':cartaId
    };
    let direction = this.url + 'jugarcarta';

    return this.http.post<any>(direction, parametros);

  }



}
