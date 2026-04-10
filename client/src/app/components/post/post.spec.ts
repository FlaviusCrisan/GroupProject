import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostPage } from './post-page';

describe('PostPage', () => {
  let component: PostPage;
  let fixture: ComponentFixture<PostPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
