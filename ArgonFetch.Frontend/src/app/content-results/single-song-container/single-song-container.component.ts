// Import the necessary modules at the top of your component file
import { HttpEventType } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DefaultService, MusicInformation } from '../../../../api';
import { Component, DestroyRef, Input } from '@angular/core';
import { faDownload, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { catchError, retry } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

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
  faSpinner = faSpinner;
  isDownloading = false;
  downloadProgress = 0;
  showProgressBar = false;
  private ws: WebSocketSubject<any> | null = null;
  private downloadStartTime: number = 0;

  constructor(
    private defaultService: DefaultService,
    private destroyRef: DestroyRef
  ) { }

  onDownload() {
    this.isDownloading = true;
    this.downloadProgress = 0;
    this.showProgressBar = true;
    this.downloadStartTime = Date.now();
    console.log('Download started');

    const chunks: Array<Uint8Array> = [];
    let filename = '';
    let contentType = '';
    let retryCount = 0;
    const maxRetries = 3;

    const logTimeElapsed = () => {
      const seconds = (Date.now() - this.downloadStartTime) / 1000;
      console.log(`Time elapsed: ${seconds.toFixed(2)}s`);
    };

    // Start interval timer
    const timerInterval = setInterval(logTimeElapsed, 1000);

    const connectWebSocket = () => {
      // Create WebSocket connection
      this.ws = webSocket({
        url: `ws://${window.location.hostname}:8000/ws/download`,
        deserializer: (e) => {
          if (e.data instanceof Blob) {
            return e.data;
          }
          return JSON.parse(e.data);
        },
        openObserver: {
          next: () => {
            console.log('WebSocket connected');
            this.ws?.next({
              url: this.musicInfo.song_url
            });
          }
        }
      });

      this.ws.pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: async (message: any) => {
          if (message instanceof Blob) {
            // Handle binary chunk
            const arrayBuffer = await message.arrayBuffer();
            const chunk = new Uint8Array(arrayBuffer);
            chunks.push(chunk);
          } else if (typeof message === 'object') {
            // Handle JSON messages
            if (message.error) {
              clearInterval(timerInterval);
              const totalTime = (Date.now() - this.downloadStartTime) / 1000;
              console.error('Download error after', totalTime.toFixed(2), 'seconds:', message.error);
              alert(message.error);
              this.isDownloading = false;
              this.showProgressBar = false;
              this.ws?.complete();
              return;
            }

            switch (message.type) {
              case 'metadata':
                filename = message.filename;
                contentType = message.content_type;
                console.log('Metadata received:', { filename, contentType });
                break;

              case 'progress':
                this.downloadProgress = message.progress;
                break;

              case 'complete':
                clearInterval(timerInterval);
                const totalTime = (Date.now() - this.downloadStartTime) / 1000;
                console.log(`Download completed in ${totalTime.toFixed(2)} seconds`);

                // Log final statistics
                const totalSize = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
                console.log(`Total size: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);
                console.log(`Average speed: ${((totalSize / 1024 / 1024) / totalTime).toFixed(2)} MB/s`);

                // Combine all chunks
                const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
                const completeArray = new Uint8Array(totalLength);
                let offset = 0;
                for (const chunk of chunks) {
                  completeArray.set(chunk, offset);
                  offset += chunk.length;
                }

                // Create blob and trigger download
                const blob = new Blob([completeArray], { type: contentType });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;

                // Show 100% completion before downloading
                this.downloadProgress = 100;
                
                setTimeout(() => {
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  window.URL.revokeObjectURL(url);

                  // Reset UI after a delay
                  setTimeout(() => {
                    this.isDownloading = false;
                    this.showProgressBar = false;
                  }, 1000);
                }, 500);

                // Close WebSocket
                this.ws?.complete();
                break;
            }
          }
        },
        error: (error) => {
          clearInterval(timerInterval);
          const totalTime = (Date.now() - this.downloadStartTime) / 1000;
          console.error('WebSocket error after', totalTime.toFixed(2), 'seconds:', error);
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Retrying connection (${retryCount}/${maxRetries})...`);
            setTimeout(() => connectWebSocket(), 1000);
          } else {
            this.isDownloading = false;
            this.showProgressBar = false;
            alert('Download failed after multiple attempts. Please try again.');
          }
          this.ws?.complete();
        }
      });
    };

    connectWebSocket();
  }

  ngOnDestroy() {
    this.ws?.complete();
  }
}