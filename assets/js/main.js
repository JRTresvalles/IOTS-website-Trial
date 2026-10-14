// ---------- Mobile navigation ----------
const toggle = document.querySelector('.header__toggle');
const nav = document.getElementById('site-nav');

toggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('nav--open');
  toggle.setAttribute('aria-expanded', open);
});

// ---------- Header shadow on scroll ----------
const header = document.querySelector('.header');
const onScroll = () => header?.classList.toggle('header--scrolled', window.scrollY > 8);

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();
