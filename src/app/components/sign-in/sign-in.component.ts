import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, Message } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css'],
  providers: [MessageService],
})
export class SignInComponent implements OnInit {
  mostrar: Boolean = false;
  displayModal: boolean = false;
  mostrar2: Boolean = false;
  public form: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(10)]],
    rating: ['', []],
  });
  public form2: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
  });
  constructor(public authService: AuthService,
    private formBuilder: FormBuilder,
    private messageService: MessageService,private route: Router) { 
    
  }

  ngOnInit(): void {
  }

  ingresar() {
    this.mostrar = !this.mostrar;
    this.authService
      .SignIn(this.form.value.email, this.form.value.password)
      .then((res) => {       
        if (res == undefined) {
          this.messageService.add({
            severity: 'error',
            summary: 'Rectifique los datos',
            detail: 'Clave o Usuario incorrecto, Intente de Nuevo',
          });
        } else {
          this.messageService.add({
            severity: 'success',
            summary: 'Bienvenido',
            detail: 'Disfruta de tu estadía',
          });
          // this.route.navigate(['preguntas']);
        }

        this.mostrar = !this.mostrar;
      });
  }

  ingresarGoogle() {
    this.mostrar = !this.mostrar;       
    this.authService
      .loginGoogle(this.form.value.email, this.form.value.password)
      .then((res) => {
        if (res) {
          this.messageService.add({
            severity: 'success',
            summary: 'Bienvenido',
            detail: 'Disfruta de tu estadía',
          });
          setTimeout(() => {
            this.route.navigate(['sala']);
          }, 3000);

        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Rectifique los datos',
            detail: 'Clave o Usuario incorrecto, Intente de Nuevo',
          });
          
        }
        this.mostrar = !this.mostrar;
      });
  }

  showModalDialog() {
    this.displayModal = true;
  }

  recuperarEmail() {
    try {
      this.mostrar2 = !this.mostrar2;
      this.authService.resetPassword(this.form2.value.email).then((res) => {
        this.displayModal = false;
        this.messageService.add({
          severity: 'success',
          summary: '!Exitoso¡',
          detail: 'Revisa tu bandeja de entrada',
        });
      });
      this.mostrar2 = !this.mostrar2;
    } catch (error) {}
  }

}
