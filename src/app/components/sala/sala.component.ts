import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService, Message } from 'primeng/api';
import { juego } from 'src/app/model/juego';
import { DataService } from 'src/app/services/data.service';
import { AuthService } from 'src/app/services/auth.service';
import { sala } from 'src/app/model/informacionSala';
import { salaget } from 'src/app/model/sala';



@Component({
  selector: 'app-sala',
  templateUrl: './sala.component.html',
  styleUrls: ['./sala.component.css'],
  providers: [MessageService],
})
export class SalaComponent implements OnInit {

  email: any;

  bloquerBoton:boolean =false;

  public form: FormGroup = this.formBuilder.group({
    id: ['', []],
    sala: ['', [Validators.required, Validators.maxLength(50)]],
    estado: ['', [Validators.required]],
    jugadores: ['', [Validators.required, Validators.minLength(2)]],
  });

  dato: juego = {
    juegoId: '',
    jugadorId: '',
    alias: '',
  };

  cards: any;

  salas: salaget = {
    juegoId: '',
    jugadorId: '',
    alias: '',
  };

  salas2: salaget = {
    juegoId: '',
    jugadorId: '',
    alias: '',
  };

   parametros:any={
    juegoId:'',
    jugadorId:'',
    alias:''
  };

  userLogged = this.authService.getUserLogged();

  constructor(
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private DataService: DataService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    localStorage.removeItem('id');

    this.idAleatorio();
    this.listarSala();
    this.bloquerBoton=false;
  }

  validar() {
    console.log(this.form);
    if (this.form.valid) {
      this.userLogged.subscribe((value) => {
        console.log(value?.uid);

        this.dato.alias = this.form.get('sala')?.value;
        this.dato.jugadorId = value?.email;
        this.dato.juegoId = this.form.get('id')?.value;
       
        this.DataService.crearjuego(this.dato).subscribe((res) => {
          this.bloquerBoton=true;

          if (res) {
            this.messageService.add({
              severity: 'success',
              summary: 'Exitoso',
              detail: 'Se ha creado la sala',
            });
            this.listarSala();
            setTimeout(() => {
              window.location.reload();
            }, 3000);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Fallo en la Conexion',
            });
          }
        });
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Valide los Campos',
      });
    }
  }

  listarSala() {
    
    this.DataService.getsala().subscribe((res) => {
      this.cards = res;
     
    });
  }

  idAleatorio() {
    let result = '';
    const characters = 'ABCDEIJadefghijklxyz012345';
    const charactersLength = characters.length;
    for (let i = 0; i < charactersLength; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    this.form.patchValue({ id: result });
  }

  
  agregarJugadorSala(juegoId:string,jugadorId:string,alias:string){


    this.userLogged.subscribe((value) => {
      console.log('******Value***********')
      console.log(value?.email)
      this.salas2.jugadorId=value?.email;
      localStorage.setItem('id',juegoId)
      this.salas2.juegoId=juegoId,
      this.salas2.alias=alias;
      
      console.log('*******SALA2**********')
      console.log(this.salas2)
      console.log('*****************')
      this.DataService.saveQuestion(this.salas2).subscribe((res)=>{
        console.log(res)
        console.log('*****************')
        this.router.navigate(['sala-jugador']);
      })
     
    });
 
    
  }


  



}
