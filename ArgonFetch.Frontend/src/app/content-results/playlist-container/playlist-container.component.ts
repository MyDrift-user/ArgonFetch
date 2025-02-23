import { Component, Input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PlaylistInformation } from '../../../../api';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-playlist-container',
  standalone: true,
  imports: [FontAwesomeModule, NgFor],
  templateUrl: './playlist-container.component.html',
  styleUrl: './playlist-container.component.scss'
})
export class PlaylistContainerComponent {
  @Input() playlistInfo!: PlaylistInformation;
  faDownload = faDownload;
}
