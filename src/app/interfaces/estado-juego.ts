import { JugadorSimple } from "./jugador-simple";
export interface EstadoJuego{
    juegoId:string,
    jugadores: JugadorSimple[],
    estado: boolean,
    when: string
}