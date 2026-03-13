document.addEventListener("DOMContentLoaded", async () => {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  // Get user info from backend
  async function getMe() {
    try {
      const res = await fetch("/accounts/me/");
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  const user = await getMe();

  const logo = "/static/img/BRI Large Logo.jpg.jpeg";

  // Public pages that don't require auth
  const publicPages = ['/', '/home/', '/index/', '/features/', '/pricing/', '/about/', '/contact/', '/login/', '/signup/', '/forgot-password/'];
  const currentPath = window.location.pathname;
  const isPublicPage = publicPages.includes(currentPath);

  // Public navbar
  if (isPublicPage || !user) {
    navbar.innerHTML = `
      <div class="nav-wrapper">
        <div class="brand">
          <span class="brand-icon"><img src="${logo}" alt="" style="width:35px;"></span><span class="brand-text">BRI <span class="cls">PLAGIARISM</span></span>
        </div>
        <ul class="nav-links">
          <li><a class="nav-link" href="/">🏠 Home</a></li>
          <li><a class="nav-link" href="/#features">✨ Features</a></li>
          <li><a class="nav-link" href="/#pricing">💰 Pricing</a></li>
          <li><a class="nav-link" href="/about/">📖 About</a></li>
          <li><a class="nav-link" href="/contact/">📞 Contact</a></li>
          <li><a class="nav-link" href="/login/">🔐 Sign In</a></li>
        </ul>
        <button class="mobile-menu-btn">☰</button>
      </div>
    `;
    addMobileMenuListener();
    return;
  }

  // Protected navbar
  function logout() {
    window.location.href = "/accounts/logout/";
  }

  navbar.innerHTML = `
    <div class="nav-wrapper">
      <a href="/dashboard/" class="brand">
        <span class="brand-icon"><img src="${logo}" alt="" style="width:60px; margin-right: -6px;"></span><span class="brand-text">BRI <br> <span class="cls">PLAGIARISM</span></span>
      </a>

      <ul class="nav-links">
        <li><a class="nav-link" href="/dashboard/" style="font-size: 20px;"><span class="clss"><i class="fa-brands fa-dashcube"></i></span> Dashboard</a></li>
        <li class="mobile-only">
        <span class="user-tag">
        <i class="fa-solid fa-circle-user"></i> 
        ${user.display_name || user.email?.split('@')[0] || 'User'}
        </span>
        </li>

        <li class="mobile-only">
        <button class="logout-btn mobile-logout logoutBtn" id="logoutBtn">
        <i class="fa-solid fa-arrow-right-from-bracket"></i> Logout
        </button>
        </li>
      </ul>

      <div class="nav-right">
        <span class="user-tag">
          <i class="fa-solid fa-circle-user"></i> ${user.display_name || user.email?.split('@')[0] || 'User'}
        </span>
        <button class="logout-btn logoutBtn" id="logoutBtn">
        <i class="fa-solid fa-arrow-right-from-bracket"></i> Logout
        </button>
      </div>
      <button class="mobile-menu-btn">☰</button>
    </div>
  `;

  document.querySelectorAll(".logoutBtn").forEach(btn => {
    btn.addEventListener("click", logout);
  });
  addMobileMenuListener();
});

// Mobile menu functionality
function addMobileMenuListener() {
  const menuBtn = document.querySelector(".mobile-menu-btn");
  const navLinks = document.querySelector(".nav-links");

  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => {
      navLinks.classList.toggle("show");
      menuBtn.innerHTML = navLinks.classList.contains("show") ? "✕" : "☰";
    });
  }
}