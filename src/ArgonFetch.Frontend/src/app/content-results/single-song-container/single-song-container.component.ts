// Import the necessary modules at the top of your component file
import { DefaultService, MusicInformation } from '../../../../api';
import { Component, DestroyRef, Input } from '@angular/core';
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
  
  faDownload = faDownload;

  constructor(
    private defaultService: DefaultService,
    private destroyRef: DestroyRef
  ) { }

  onDownload() {
    const a = document.createElement('a');
    a.href = this.musicInfo.streaming_url;
    a.download = this.musicInfo.song_name + '.mp3';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

}