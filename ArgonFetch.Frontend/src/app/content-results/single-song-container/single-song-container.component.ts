import { Component, Input } from '@angular/core';
import { MusicInformation } from '../../../../api';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-single-song-container',
  standalone: true,
  imports: [FontAwesomeModule, CommonModule],
  templateUrl: './single-song-container.component.html',
  styleUrl: './single-song-container.component.scss'
})
export class SingleSongContainerComponent {
  @Input() musicInfo!: MusicInformation;
  
  // Icons
  faDownload = faDownload;

  onDownload() {
    // TODO: Implement download functionality
  }
}
