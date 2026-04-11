import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmsPage } from './dms-page';

describe('DmsPage', () => {
  let component: DmsPage;
  let fixture: ComponentFixture<DmsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DmsPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DmsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
