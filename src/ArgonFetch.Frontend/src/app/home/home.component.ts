import { Component, DestroyRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { faLink, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { DefaultService, MusicInformation, PlaylistInformation } from '../../../api';
import { PlaylistContainerComponent } from '../content-results/playlist-container/playlist-container.component';
import { SingleSongContainerComponent } from '../content-results/single-song-container/single-song-container.component';
import { ModalService } from '../services/modal.service';
import { ContentSkeletonLoaderComponent } from "../content-skeleton-loader/content-skeleton-loader.component";

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
    SingleSongContainerComponent,
    ContentSkeletonLoaderComponent
  ]
})
export class HomeComponent {
  faLink = faLink;
  faSearch = faSearch;
  faTimes = faTimes;

  url: string = '';
  faWarning = faTriangleExclamation;

  isLoading: boolean = false;
  loaderType: 'single-song' | 'playlist' = 'single-song';

  songContent: MusicInformation | undefined;
  playlistContent: PlaylistInformation | undefined;

  constructor(
    private defaultService: DefaultService,
    private destroyRef: DestroyRef,
    private modalService: ModalService
  ) { }

  async download() {
    if (!this.url) {
      this.modalService.open({
        title: 'Oops! No URL Detected',
        confirmationText: 'You forgot to enter a URL! How do you expect me to fetch something from nothing?',
        showCancelButton: false
      }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
      return;
    }

    // Reset previous content
    this.songContent = undefined;
    this.playlistContent = undefined;

    // Show loader
    this.isLoading = true;

    this.defaultService
      .identifyContentApiIdentifyIsSongGet(this.url)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(isSong => {
        // Set the appropriate loader type based on content type
        this.loaderType = isSong ? 'single-song' : 'playlist';

        if (isSong) {
          this.defaultService
            .getSongInfoApiFetchSongGet(this.url)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (response) => {
                // Add a small delay to make the loader visible
                setTimeout(() => {
                  this.songContent = response;
                  this.isLoading = false;
                }, 800);
              },
              error: () => {
                this.handleError();
              }
            });
        } else {
          this.defaultService
            .getPlaylistInfoApiFetchPlaylistGet(this.url)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (response) => {
                // Add a small delay to make the loader visible
                setTimeout(() => {
                  this.playlistContent = response;
                  this.isLoading = false;
                }, 800);
              },
              error: () => {
                this.handleError();
              }
            });
        }
      }, error => {
        this.handleError();
      });
  }

  private handleError() {
    this.isLoading = false;
    this.modalService.open({
      title: 'Error',
      confirmationText: 'Unable to fetch content. Please check the URL and try again.',
      showCancelButton: false
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }
}