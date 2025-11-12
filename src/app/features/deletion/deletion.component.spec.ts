import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletionComponent } from './deletion.component';

describe('DeletionComponent', () => {
  let component: DeletionComponent;
  let fixture: ComponentFixture<DeletionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeletionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeletionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
