import { Component, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { A11yModule } from '@angular/cdk/a11y';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-setup-dialog',
  imports: [FormsModule, A11yModule],
  templateUrl: './setup-dialog.html',
  styleUrl: './setup-dialog.css',
})
export class SetupDialog {
  @Output() completed = new EventEmitter<void>();
  region = 'EU';
  language = 'English';
  games = '';
  saving = false;
  error = '';
  constructor(
    private api: ApiService,
    private cd: ChangeDetectorRef,
  ) {}
  async save() {
    if (this.saving) return;
    this.saving = true;
    this.error = '';
    try {
      const user = await this.api.get_user_info(await this.api.get_user_id());
      const current = user.publicMetadata || {};
      await this.api.update_user_metadata({
        ...current,
        setup_complete: true,
        preferred_games: this.games
          .split(',')
          .map((g) => g.trim())
          .filter(Boolean),
        socials: { ...current.socials, region: this.region, language: this.language },
      });
      this.completed.emit();
    } catch {
      this.error = 'Your preferences could not be saved. Try again or finish later.';
    } finally {
      this.saving = false;
      this.cd.detectChanges();
    }
  }
}
