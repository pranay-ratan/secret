class CameraScanner extends HTMLElement {
    connectedCallback() {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `
        <style>
          .camera-container {
            position: relative;
            width: 100%;
            max-width: 500px;
            margin: 0 auto;
          }
          video {
            width: 100%;
            border-radius: 8px;
            background: black;
          }
          .scan-box {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80%;
            height: 100px;
            border: 3px solid #3b82f6;
            border-radius: 8px;
            box-shadow: 0 0 0 10000px rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .scan-line {
            width: 100%;
            height: 2px;
            background: #3b82f6;
            animation: scan 2s infinite linear;
          }
          @keyframes scan {
            0% { transform: translateY(-50px); }
            100% { transform: translateY(50px); }
          }
          button {
            margin-top: 1rem;
            background: #3b82f6;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
        </style>
        <div class="camera-container">
          <video id="video" autoplay playsinline></video>
          <div class="scan-box">
            <div class="scan-line"></div>
          </div>
          <button id="capture">
            <i data-feather="camera"></i>
            Capture ID
          </button>
        </div>
      `;
      
      this.initCamera();
      feather.replace();
    }
  
    initCamera() {
      const video = this.shadowRoot.getElementById('video');
      const captureBtn = this.shadowRoot.getElementById('capture');
      
      navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      .then(stream => {
        video.srcObject = stream;
        captureBtn.addEventListener('click', () => this.capture(video));
      })
      .catch(err => {
        console.error('Camera error:', err);
        this.dispatchEvent(new CustomEvent('error', { detail: err.message }));
      });
    }
  
    capture(video) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Process the image (would be replaced with ML model)
      this.processImage(canvas);
    }
  
    processImage(canvas) {
      // TODO: Implement ML model integration here
      // For now, we'll emit the image data
      this.dispatchEvent(new CustomEvent('capture', { 
        detail: { imageData: canvas.toDataURL('image/jpeg') }
      }));
    }
  
    disconnectedCallback() {
      const video = this.shadowRoot.getElementById('video');
      if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
      }
    }
  }
  
  customElements.define('camera-scanner', CameraScanner);