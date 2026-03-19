/**
 * 공통 네비게이션 스크립트
 * 모바일 햄버거 메뉴 + 반응형 네비게이션 관리
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
});

function initMobileNav() {
  // 네비게이션 바 찾기
  const navbar = document.querySelector('.navbar');
  const navbarMenu = document.querySelector('.navbar-menu');

  if (!navbar || !navbarMenu) return;

  // 햄버거 버튼이 이미 있는지 확인
  if (document.querySelector('.hamburger-btn')) return;

  // 햄버거 버튼 생성
  const hamburgerBtn = document.createElement('button');
  hamburgerBtn.className = 'hamburger-btn';
  hamburgerBtn.innerHTML = `
    <span class="hamburger-line"></span>
    <span class="hamburger-line"></span>
    <span class="hamburger-line"></span>
  `;
  hamburgerBtn.setAttribute('aria-label', '메뉴');
  hamburgerBtn.setAttribute('aria-expanded', 'false');

  // 네비게이션 메뉴에 모바일 클래스 추가
  navbarMenu.classList.add('navbar-menu-mobile');

  // 네비게이션 컨텐츠 찾기 및 햄버거 버튼 삽입
  const navbarContent = document.querySelector('.navbar-content');
  if (navbarContent) {
    navbarContent.insertBefore(hamburgerBtn, navbarMenu);
  }

  // 햄버거 버튼 클릭 이벤트
  hamburgerBtn.addEventListener('click', () => {
    toggleMobileMenu(hamburgerBtn, navbarMenu);
  });

  // 메뉴 아이템 클릭 시 메뉴 닫기
  const menuLinks = navbarMenu.querySelectorAll('a');
  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileMenu(hamburgerBtn, navbarMenu);
    });
  });

  // 화면 밖 클릭 시 메뉴 닫기
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
      closeMobileMenu(hamburgerBtn, navbarMenu);
    }
  });

  // 윈도우 리사이즈 시 메뉴 상태 초기화
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth > 768) {
        closeMobileMenu(hamburgerBtn, navbarMenu);
      }
    }, 250);
  });
}

function toggleMobileMenu(btn, menu) {
  const isOpen = menu.classList.contains('active');
  if (isOpen) {
    closeMobileMenu(btn, menu);
  } else {
    openMobileMenu(btn, menu);
  }
}

function openMobileMenu(btn, menu) {
  menu.classList.add('active');
  btn.classList.add('active');
  btn.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu(btn, menu) {
  menu.classList.remove('active');
  btn.classList.remove('active');
  btn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}
