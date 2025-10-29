class CustomFooter extends HTMLElement {
    connectedCallback() {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `
        <style>
          footer {
            background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
            color: white;
            padding: 2rem 0;
            margin-top: auto;
          }
          .footer-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
          }
          .footer-info {
            display: flex;
            align-items: center;
            gap: 1rem;
          }
          .footer-links {
            display: flex;
            gap: 1.5rem;
          }
          .footer-links a {
            color: white;
            text-decoration: none;
            transition: opacity 0.2s;
            font-weight: 500;
          }
          .footer-links a:hover {
            opacity: 0.8;
            text-decoration: underline;
          }
          @media (max-width: 768px) {
            .footer-content {
              flex-direction: column;
              text-align: center;
            }
            .footer-info {
              flex-direction: column;
              gap: 0.5rem;
            }
          }
        </style>
        <footer>
          <div class="footer-content">
            <div class="footer-info">
              <span>© 2025 SFSS AGM Student Verifier</span>
              <span>•</span>
              <span>Simon Fraser Student Society</span>
            </div>
            <div class="footer-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Contact</a>
            </div>
          </div>
        </footer>
      `;
    }
  }

  customElements.define('custom-footer', CustomFooter);
