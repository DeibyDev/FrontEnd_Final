import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalajugadorComponent } from './salajugador.component';

describe('SalajugadorComponent', () => {
  let component: SalajugadorComponent;
  let fixture: ComponentFixture<SalajugadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SalajugadorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalajugadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
