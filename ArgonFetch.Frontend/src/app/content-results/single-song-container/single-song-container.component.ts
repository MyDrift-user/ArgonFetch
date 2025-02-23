import { Component, Input } from '@angular/core';
import { MusicInformation } from '../../../../api';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-single-song-container',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './single-song-container.component.html',
  styleUrl: './single-song-container.component.scss'
})
export class SingleSongContainerComponent {
  @Input() musicInfo!: MusicInformation;
  faDownload = faDownload;
}
