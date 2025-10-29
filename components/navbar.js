class CustomNavbar extends HTMLElement {
    connectedCallback() {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `
        <style>
          nav {
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
          .logo {
            color: white;
            font-weight: bold;
            font-size: 1.25rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          ul {
            display: flex;
            gap: 1.5rem;
            list-style: none;
            margin: 0;
            padding: 0;
          }
          a {
            color: white;
            text-decoration: none;
            transition: opacity 0.2s;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 0.25rem;
          }
          a:hover {
            opacity: 0.9;
            text-decoration: underline;
          }
          @media (max-width: 768px) {
            nav {
              flex-direction: column;
              gap: 1rem;
              padding: 1rem;
            }
            ul {
              width: 100%;
              justify-content: center;
            }
          }
        </style>
        <nav>
          <div class="logo">
            <i data-feather="users"></i>
            <span>SFSS AGM Verifier</span>
          </div>
          <ul>
            <li><a href="#"><i data-feather="home"></i> Home</a></li>
            <li><a href="#"><i data-feather="settings"></i> Settings</a></li>
            <li><a href="#"><i data-feather="help-circle"></i> Help</a></li>
          </ul>
        </nav>
      `;
    }
  }
  customElements.define('custom-navbar', CustomNavbar);
