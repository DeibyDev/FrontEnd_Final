import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  userLogged = this.authService.getUserLogged();
  disabled: boolean = false;
  constructor(private router: Router, private authService: AuthService) { }

  user: User = {
    email: '',
    displayName: '',
    uid: '',
    photoURL: '',
    emailVerified: false
  };

  ngOnInit(): void {
    this.traerdatos();
    this.authService.isAuth().subscribe(user => {
      if(user) {
        this.user = user;
        console.log('USER', user);
      }
    })
  }

  goToHome(){
    this.router.navigate(['dashboard']);
  }

  goToProfile(){
    this.router.navigate(['profile']);
  }

  goToCards(){
    this.router.navigate(['cards']);
  }

  login(){
    this.router.navigate(['sign-in']);
  }

  SignOut(){
    this.authService.SignOut();
  }

  cards(){
    this.router.navigate(['cards']);
  }


  traerdatos() {
    this.userLogged.subscribe((value) => {    
      if (value?.email == undefined) {
        this.disabled = true;        
      } else {
        this.disabled = false;       
      }
    });
  }

}
