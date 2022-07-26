import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, Message } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
  providers: [MessageService],
})
export class SignUpComponent implements OnInit {
  mostrar: Boolean = false;
  public form: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    rating: ['', []],
  });
  constructor(public authService: AuthService,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private route: Router) { }

  ngOnInit(): void {
  }

  ingresar() {
    this.mostrar = !this.mostrar;    
    this.authService
      .loginRegistre(this.form.value.email, this.form.value.password)
      .then((res) => {       
        if (res) {
          this.messageService.add({
            severity: 'success',
            summary: '!Exitoso¡',
            detail: 'Usuario Almacenado correctamente',
          });
          setTimeout(() => {
            this.route.navigate(['preguntas']);
          }, 2000);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Usuarios Registrado',
            detail: 'Por favor intente con otro correo',
          });
        }

        this.mostrar = !this.mostrar;
      });
  }

  // ingresar(){
  //   this.messageService.add({
  //     severity: 'success',
  //     summary: '!Exitoso¡',
  //     detail: 'Usuario Almacenado correctamente',
  //   });
  // }

}
