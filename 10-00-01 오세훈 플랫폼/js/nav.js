/**
 * 공통 모바일 네비게이션 — nav.js
 * Charlie 분대 Task #41 — Phase 5: 모바일 최적화
 *
 * 기능:
 *  - 햄버거 메뉴 (열기/닫기/토글)
 *  - 현재 페이지 활성 링크 자동 감지
 *  - 스크롤 시 네비게이션 숨김/표시 (모바일)
 *  - 포커스 트랩 (접근성 — 모달 메뉴)
 *  - 키보드 ESC로 닫기
 *  - 바깥 클릭 닫기
 *  - 리사이즈 시 자동 닫기
 *  - ARIA 속성 완전 지원
 */

(function () {
  'use strict';

  /* ───────────────────────────────────────
     CSS: 모바일 네비게이션 스타일 (동적 주입)
     ─────────────────────────────────────── */
  const NAV_STYLE = `
    /* 햄버거 버튼 */
    .hamburger-btn {
      display: none;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 5px;
      width: 40px;
      height: 40px;
      background: none;
      border: 1px solid var(--border, #E5E7EB);
      border-radius: 8px;
      cursor: pointer;
      padding: 8px;
      transition: background 0.2s ease, border-color 0.2s ease;
      flex-shrink: 0;
      position: relative;
      z-index: 210;
    }

    .hamburger-btn:hover {
      background: var(--primary-light, #FFE8EA);
      border-color: var(--primary, #E60012);
    }

    .hamburger-btn:focus-visible {
      outline: 2px solid var(--primary, #E60012);
      outline-offset: 2px;
    }

    .hamburger-line {
      display: block;
      width: 20px;
      height: 2px;
      background: var(--text, #1F2937);
      border-radius: 2px;
      transition: transform 0.3s ease, opacity 0.3s ease, width 0.3s ease;
      transform-origin: center;
    }

    /* 햄버거 → X 애니메이션 */
    .hamburger-btn.active .hamburger-line:nth-child(1) {
      transform: translateY(7px) rotate(45deg);
    }
    .hamburger-btn.active .hamburger-line:nth-child(2) {
      opacity: 0;
      width: 0;
    }
    .hamburger-btn.active .hamburger-line:nth-child(3) {
      transform: translateY(-7px) rotate(-45deg);
    }

    /* 모바일 메뉴 오버레이 */
    @media (max-width: 768px) {
      .hamburger-btn { display: flex; }

      .navbar-menu-mobile {
        position: fixed;
        top: 0;
        right: -100%;
        width: min(300px, 85vw);
        height: 100dvh;
        background: white;
        border-left: 1px solid var(--border, #E5E7EB);
        box-shadow: -4px 0 20px rgba(0,0,0,0.12);
        display: flex !important;
        flex-direction: column;
        padding: 80px var(--space-6, 24px) var(--space-6, 24px);
        gap: 0;
        z-index: 205;
        overflow-y: auto;
        transition: right 0.32s cubic-bezier(0.4, 0, 0.2, 1);
        list-style: none;
        margin: 0;
      }

      .navbar-menu-mobile.active {
        right: 0;
      }

      .navbar-menu-mobile li {
        border-bottom: 1px solid var(--bg-lighter, #F3F4F6);
      }

      .navbar-menu-mobile li:last-child {
        border-bottom: none;
        margin-top: auto;
        padding-top: var(--space-6, 24px);
      }

      .navbar-menu-mobile a {
        display: block;
        padding: var(--space-4, 16px) var(--space-2, 8px);
        font-size: var(--font-size-lg, 16px) !important;
        font-weight: var(--font-weight-medium, 500);
        color: var(--text, #1F2937) !important;
        text-decoration: none;
        transition: color 0.2s ease, padding-left 0.2s ease;
        border-radius: 0;
      }

      .navbar-menu-mobile a:hover,
      .navbar-menu-mobile a:focus-visible {
        color: var(--primary, #E60012) !important;
        padding-left: var(--space-4, 16px);
      }

      .navbar-menu-mobile a.active {
        color: var(--primary, #E60012) !important;
        font-weight: var(--font-weight-bold, 700);
        border-bottom: none;
        padding-bottom: var(--space-4, 16px);
      }
    }

    /* 모바일 메뉴 배경 오버레이 */
    .nav-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.45);
      z-index: 200;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .nav-backdrop.active {
      display: block;
      opacity: 1;
    }

    /* 스크롤 시 네비게이션 변화 */
    .navbar.scrolled {
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    }

    @media (max-width: 768px) {
      .navbar.hide-on-scroll {
        transform: translateY(-100%);
        transition: transform 0.3s ease;
      }
      .navbar.show-on-scroll {
        transform: translateY(0);
        transition: transform 0.3s ease;
      }
    }

    /* 건너뜀 링크 (스크린 리더 접근성) */
    .skip-link {
      position: absolute;
      top: -50px;
      left: var(--space-4, 16px);
      background: var(--primary, #E60012);
      color: white;
      padding: var(--space-3, 12px) var(--space-5, 20px);
      border-radius: 0 0 8px 8px;
      font-weight: 700;
      text-decoration: none;
      z-index: 9999;
      transition: top 0.2s;
    }

    .skip-link:focus {
      top: 0;
    }
  `;

  /* ───────────────────────────────────────
     스타일 주입
     ─────────────────────────────────────── */
  function injectStyles() {
    if (document.getElementById('nav-mobile-styles')) return;
    const style = document.createElement('style');
    style.id = 'nav-mobile-styles';
    style.textContent = NAV_STYLE;
    document.head.appendChild(style);
  }

  /* ───────────────────────────────────────
     건너뜀 링크 (접근성)
     ─────────────────────────────────────── */
  function injectSkipLink() {
    if (document.getElementById('skip-to-main')) return;
    const a = document.createElement('a');
    a.id = 'skip-to-main';
    a.className = 'skip-link';
    a.href = '#main-content';
    a.textContent = '본문으로 바로가기';
    document.body.insertBefore(a, document.body.firstChild);
  }

  /* ───────────────────────────────────────
     현재 페이지 활성 링크 감지
     ─────────────────────────────────────── */
  function setActiveLink(menu) {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const links = menu.querySelectorAll('a[href]');

    links.forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href === '#' || href.startsWith('javascript')) return;

      const linkFile = href.split('/').pop().split('?')[0].split('#')[0];
      const isActive = linkFile === currentPath || (currentPath === '' && linkFile === 'index.html');

      if (isActive) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }

  /* ───────────────────────────────────────
     메뉴 열기 / 닫기
     ─────────────────────────────────────── */
  function openMobileMenu(btn, menu, backdrop) {
    menu.classList.add('active');
    btn.classList.add('active');
    btn.setAttribute('aria-expanded', 'true');
    if (backdrop) backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';

    // 첫 번째 링크로 포커스 이동 (접근성)
    requestAnimationFrame(() => {
      const firstLink = menu.querySelector('a');
      if (firstLink) firstLink.focus();
    });
  }

  function closeMobileMenu(btn, menu, backdrop) {
    menu.classList.remove('active');
    btn.classList.remove('active');
    btn.setAttribute('aria-expanded', 'false');
    if (backdrop) backdrop.classList.remove('active');
    document.body.style.overflow = '';
    btn.focus();
  }

  function toggleMobileMenu(btn, menu, backdrop) {
    if (menu.classList.contains('active')) {
      closeMobileMenu(btn, menu, backdrop);
    } else {
      openMobileMenu(btn, menu, backdrop);
    }
  }

  /* ───────────────────────────────────────
     포커스 트랩 (메뉴 열린 동안 TAB 순환)
     ─────────────────────────────────────── */
  function createFocusTrap(btn, menu) {
    return function trapFocus(e) {
      if (!menu.classList.contains('active')) return;
      if (e.key !== 'Tab') return;

      const focusable = [btn, ...menu.querySelectorAll('a, button')].filter(el => !el.disabled && el.tabIndex !== -1);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
  }

  /* ───────────────────────────────────────
     스크롤 시 네비게이션 숨김/표시
     ─────────────────────────────────────── */
  function initScrollBehavior(navbar) {
    let lastScrollY = window.scrollY;
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;

          // 스크롤된 상태에서 그림자 표시
          navbar.classList.toggle('scrolled', currentY > 8);

          // 모바일에서만 숨김/표시 처리
          if (window.innerWidth <= 768) {
            if (currentY > lastScrollY && currentY > 80) {
              navbar.classList.add('hide-on-scroll');
              navbar.classList.remove('show-on-scroll');
            } else {
              navbar.classList.remove('hide-on-scroll');
              navbar.classList.add('show-on-scroll');
            }
          }

          lastScrollY = currentY;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ───────────────────────────────────────
     메인 초기화
     ─────────────────────────────────────── */
  function initMobileNav() {
    injectStyles();
    injectSkipLink();

    const navbar = document.querySelector('.navbar');
    const navbarMenu = document.querySelector('.navbar-menu');

    if (!navbar || !navbarMenu) return;

    // 현재 페이지 활성 링크 설정
    setActiveLink(navbarMenu);

    // 스크롤 동작
    initScrollBehavior(navbar);

    // 이미 초기화된 경우 스킵
    if (document.querySelector('.hamburger-btn')) return;

    /* ── 햄버거 버튼 생성 ── */
    const hamburgerBtn = document.createElement('button');
    hamburgerBtn.className = 'hamburger-btn';
    hamburgerBtn.setAttribute('aria-label', '메뉴 열기');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    hamburgerBtn.setAttribute('aria-controls', 'navMenuMobile');
    hamburgerBtn.innerHTML = `
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    `;

    /* ── 백드롭 생성 ── */
    const backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(backdrop);

    /* ── 메뉴에 모바일 클래스 및 ID 추가 ── */
    navbarMenu.classList.add('navbar-menu-mobile');
    navbarMenu.id = 'navMenuMobile';
    navbarMenu.setAttribute('role', 'navigation');
    navbarMenu.setAttribute('aria-label', '모바일 메뉴');

    /* ── 네비게이션 컨텐츠에 삽입 ── */
    const navbarContent = document.querySelector('.navbar-content');
    if (navbarContent) {
      navbarContent.insertBefore(hamburgerBtn, navbarMenu);
    }

    /* ── 이벤트: 햄버거 클릭 ── */
    hamburgerBtn.addEventListener('click', () => {
      toggleMobileMenu(hamburgerBtn, navbarMenu, backdrop);
      const isOpen = navbarMenu.classList.contains('active');
      hamburgerBtn.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
    });

    /* ── 이벤트: 메뉴 링크 클릭 시 닫기 ── */
    navbarMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          closeMobileMenu(hamburgerBtn, navbarMenu, backdrop);
        }
      });
    });

    /* ── 이벤트: 백드롭 클릭 ── */
    backdrop.addEventListener('click', () => {
      closeMobileMenu(hamburgerBtn, navbarMenu, backdrop);
    });

    /* ── 이벤트: ESC 키 ── */
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navbarMenu.classList.contains('active')) {
        closeMobileMenu(hamburgerBtn, navbarMenu, backdrop);
      }
    });

    /* ── 이벤트: 포커스 트랩 ── */
    const trap = createFocusTrap(hamburgerBtn, navbarMenu);
    document.addEventListener('keydown', trap);

    /* ── 이벤트: 리사이즈 시 닫기 ── */
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth > 768 && navbarMenu.classList.contains('active')) {
          closeMobileMenu(hamburgerBtn, navbarMenu, backdrop);
        }
      }, 200);
    }, { passive: true });
  }

  /* ───────────────────────────────────────
     DOMContentLoaded 또는 즉시 실행
     ─────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileNav);
  } else {
    initMobileNav();
  }

  // 전역 노출 (다른 스크립트에서 호출 가능)
  window.initMobileNav = initMobileNav;

})();
