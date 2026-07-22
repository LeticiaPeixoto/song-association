import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Player } from '../../../../core/models/player.model';

@Component({
  selector: 'app-player-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-banner.component.html',
  styleUrl: './player-banner.component.scss',
})
export class PlayerBannerComponent {
  @Input({ required: true }) player!: Player | null;
}
