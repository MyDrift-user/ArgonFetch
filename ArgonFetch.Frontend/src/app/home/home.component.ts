import { Component, DestroyRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { faLink, faDownload } from '@fortawesome/free-solid-svg-icons';
import { DefaultService, MusicInformation, PlaylistInformation } from '../../../api';
import { PlaylistContainerComponent } from '../content-results/playlist-container/playlist-container.component';
import { SingleSongContainerComponent } from '../content-results/single-song-container/single-song-container.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [
    FormsModule, 
    CommonModule, 
    FontAwesomeModule,
    PlaylistContainerComponent,
    SingleSongContainerComponent
  ]
})
export class HomeComponent {
  faLink = faLink;
  faDownload = faDownload;
  
  url: string = '';
  faWarning = faTriangleExclamation;

  isLoading: boolean = false;

  songContent: MusicInformation | undefined;
  playlistContent:  PlaylistInformation | undefined;

  constructor(
    private deafaultService: DefaultService,
    private destroyRef: DestroyRef
    )
  {}

  async download() {
    if (!this.url) {
      alert('Please enter a URL');
      return;
    }

    this.isLoading = true;

    this.deafaultService
    .identifyContentApiIdentifyIsSongGet(this.url)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(isSong => {

      if(isSong) {
        this.deafaultService
        .getSongInfoApiFetchSongGet(this.url)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(a => {
          this.songContent = a;
        }) 
      }
      else {
        this.deafaultService
        .getPlaylistInfoApiFetchPlaylistGet(this.url)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(a => {
          this.playlistContent = a;
        }) 
      }

      this.isLoading = false;
    });
  }
} 