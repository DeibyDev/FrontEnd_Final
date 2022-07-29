import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ICard } from 'src/app/interfaces/card';
import { CardCarousel } from 'src/app/interfaces/card-carousel';
import { DataService } from 'src/app/services/data.service';
import { AuthService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
})
export class CarouselComponent implements OnInit {
  userLogged = this.authService.getUserLogged();
  cards: Array<ICard> = [];
  cardsCarousel: Array<ICard> = [];
  displayPosition: boolean = false;
  position: string = '';
  responsiveOptions;

  constructor(
    private dataService: DataService,
    private router: Router,
    private authService: AuthService
  ) {
    this.responsiveOptions = [
      {
        breakpoint: '1024px',
        numVisible: 3,
        numScroll: 3,
      },
      {
        breakpoint: '768px',
        numVisible: 2,
        numScroll: 2,
      },
      {
        breakpoint: '560px',
        numVisible: 1,
        numScroll: 1,
      },
    ];
  }

  ngOnInit(): void {
    this.generateImages();
  }

  generateImages() {
    this.dataService.getCards().subscribe((res) => {
      /*let arrayCartas = x.slice(0, 50);
      arrayCartas.forEach((res) => {
        let card: CardCarousel;
        card = {
          id: res.id,
          image: res.imagen,
          thumbImage: res.imagen,
          title: res.nombre,
          caracteristica: res.caracteristica,
          poder: res.poder,
          descipcion: res.descipcion,
        };

        this.cardsCarousel.push(card);
      });*/
      this.cards = res;
    });
  }

  goToSignIn() {
    this.router.navigate(['sign-in']);
  }

  showPositionDialog(position: string) {
    this.position = position;
    this.displayPosition = true;
  }

  sala() {
    this.userLogged.subscribe((value) => {
      if (value?.email == undefined) {
        this.router.navigate(['sign-in']);
      } else {
        this.router.navigate(['sala']);
      }
    });
  }
}
