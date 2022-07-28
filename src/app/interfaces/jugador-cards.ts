import { CardSimple } from "./card-simple";

export interface JugadorCards{
    jugadorId:string,
    cartas:[CardSimple],
    puntaje:number,
    when:string
}