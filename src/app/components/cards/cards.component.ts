import { Component, OnInit } from '@angular/core';
import { ICard } from 'src/app/interfaces/card';
import { CardCarousel } from 'src/app/interfaces/card-carousel';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.css']
})
export class CardsComponent implements OnInit {

  cards: Array<ICard> = [];

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.generateCards();
  }

  generateCards() {
    this.dataService.getCards().subscribe(x => {
      console.log('resultado', x);

      x.forEach( res => {
        let card: ICard;
        card = {
          id: res.id,
          nombre: res.nombre,
          descipcion: res.descipcion,
          poder: res.poder,
          caracteristica: res.caracteristica,
          imagen: res.imagen
        }

        this.cards.push(card);
      })
    });
    
  }

}
