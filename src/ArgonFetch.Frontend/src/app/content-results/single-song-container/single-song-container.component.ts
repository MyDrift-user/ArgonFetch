import { Component, DestroyRef, Input } from '@angular/core';
import { DefaultService, MusicInformation } from '../../../../api';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { faDownload, faSpinner } from '@fortawesome/free-solid-svg-icons';

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
  downloadSpeed = 0; // Speed in bytes per second
  downloadSpeedText = ''; // Formatted speed (KB/s or MB/s)
  estimatedTimeText = ''; // Formatted estimated time

  // For speed calculation
  private startTime = 0;
  private loadedBytes = 0;
  private totalBytes = 0;
  private speedUpdateInterval: any;

  // Parallel download settings
  private readonly CHUNK_COUNT = 4; // Number of parallel connections
  private chunks: { start: number; end: number; loaded: number; blob?: Blob }[] = [];
  private activeRequests = 0;

  constructor(private defaultService: DefaultService) { }

  formatSpeed(bytesPerSecond: number): string {
    if (bytesPerSecond > 1048576) { // 1 MB/s
      return (bytesPerSecond / 1048576).toFixed(2) + ' MB/s';
    } else {
      return (bytesPerSecond / 1024).toFixed(2) + ' KB/s';
    }
  }

  formatTime(seconds: number): string {
    if (seconds === Infinity || isNaN(seconds)) {
      return 'calculating...';
    }

    if (seconds < 60) {
      return Math.ceil(seconds) + ' sec';
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.ceil(seconds % 60);
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  }

  updateSpeed(): void {
    const currentTime = Date.now();
    const elapsedSeconds = (currentTime - this.startTime) / 1000;

    if (elapsedSeconds > 0) {
      this.downloadSpeed = this.loadedBytes / elapsedSeconds;
      this.downloadSpeedText = this.formatSpeed(this.downloadSpeed);

      // Calculate remaining time
      const remainingBytes = this.totalBytes - this.loadedBytes;
      const estimatedSeconds = remainingBytes / this.downloadSpeed;
      this.estimatedTimeText = this.formatTime(estimatedSeconds);
    }
  }

  async onDownload() {
    if (this.isDownloading) return;

    this.resetDownloadState();

    const proxy = "http://localhost:4442/";
    const url = this.musicInfo.streaming_url;
    const filename = this.musicInfo.song_name + '.mp3';

    this.isDownloading = true;
    this.downloadProgress = 0;
    this.loadedBytes = 0;
    this.chunks = [];
    this.startTime = Date.now();

    try {
      // Get file size with HEAD request
      const headResponse = await fetch(proxy + url, { method: 'HEAD' });
      if (!headResponse.ok) throw new Error("Failed to get file information");

      this.totalBytes = parseInt(headResponse.headers.get('content-length') || '0', 10);
      if (!this.totalBytes) throw new Error("Content-Length header is missing");

      // Calculate chunk sizes
      const chunkSize = Math.floor(this.totalBytes / this.CHUNK_COUNT);

      // Initialize chunks
      for (let i = 0; i < this.CHUNK_COUNT; i++) {
        const start = i * chunkSize;
        const end = (i === this.CHUNK_COUNT - 1) ? this.totalBytes - 1 : start + chunkSize - 1;
        this.chunks.push({ start, end, loaded: 0 });
      }

      // Set up interval for speed updates
      this.speedUpdateInterval = setInterval(() => this.updateSpeed(), 1000);

      // Start parallel downloads
      const downloadPromises = this.chunks.map((chunk, index) =>
        this.downloadChunk(proxy + url, chunk, index)
      );

      await Promise.all(downloadPromises);

      // Combine all chunks and trigger download
      if (this.chunks.every(chunk => chunk.blob)) {
        const completeBlob = new Blob(
          this.chunks.map(chunk => chunk.blob as Blob),
          { type: 'video/mp4' }
        );

        const link = document.createElement("a");
        link.href = URL.createObjectURL(completeBlob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
      }
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      this.isDownloading = false;
      clearInterval(this.speedUpdateInterval);
    }
  }

  async downloadChunk(url: string, chunk: { start: number; end: number; loaded: number; blob?: Blob }, chunkIndex: number): Promise<void> {
    this.activeRequests++;

    try {
      const response = await fetch(url, {
        headers: {
          'Range': `bytes=${chunk.start}-${chunk.end}`
        }
      });

      if (!response.ok && response.status !== 206) {
        throw new Error(`Failed to download chunk ${chunkIndex}. Status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Response reader could not be created");

      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        chunks.push(value);
        chunk.loaded += value.byteLength;
        this.loadedBytes += value.byteLength;

        // Update overall progress
        this.downloadProgress = Math.round((this.loadedBytes / this.totalBytes) * 100);
      }

      // Create blob from chunk
      chunk.blob = new Blob(chunks, { type: 'audio/mpeg' });
    } catch (error) {
      console.error(`Error downloading chunk ${chunkIndex}:`, error);
      throw error;
    } finally {
      this.activeRequests--;
    }
  }

  private resetDownloadState(): void {
    this.isDownloading = false;
    this.downloadProgress = 0;
    this.loadedBytes = 0;
    this.totalBytes = 0;
    this.downloadSpeed = 0;
    this.downloadSpeedText = '';
    this.estimatedTimeText = '';
    this.chunks = [];

    if (this.speedUpdateInterval) {
      clearInterval(this.speedUpdateInterval);
      this.speedUpdateInterval = null;
    }
  }

  ngOnDestroy() {
    if (this.speedUpdateInterval) {
      clearInterval(this.speedUpdateInterval);
    }
  }
}