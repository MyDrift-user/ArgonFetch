import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { faLink, faDownload } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule, FontAwesomeModule]
})
export class HomeComponent {
  faLink = faLink;
  faDownload = faDownload;
  
  url: string = '';
  faWarning = faTriangleExclamation;

  download() {
    if (!this.url) {
      alert('Please enter a URL');
      return;
    }
    console.log('Downloading:', this.url);
  }
} 