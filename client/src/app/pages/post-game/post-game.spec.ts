import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostGame } from './post-game';

describe('PostGame', () => {
  let component: PostGame;
  let fixture: ComponentFixture<PostGame>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostGame]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostGame);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
