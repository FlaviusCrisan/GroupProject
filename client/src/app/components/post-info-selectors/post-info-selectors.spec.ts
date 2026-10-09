import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostInfoSelectors } from './post-info-selectors';

describe('PostInfoSelectors', () => {
  let component: PostInfoSelectors;
  let fixture: ComponentFixture<PostInfoSelectors>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostInfoSelectors],
    }).compileComponents();

    fixture = TestBed.createComponent(PostInfoSelectors);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
