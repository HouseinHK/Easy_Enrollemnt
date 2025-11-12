import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompareFeatureComponent } from './compare-feature.component';

describe('CompareFeatureComponent', () => {
  let component: CompareFeatureComponent;
  let fixture: ComponentFixture<CompareFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompareFeatureComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CompareFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
