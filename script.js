function scrollCertificates(direction) {
  const container = document.getElementById('certificatesContainer');

  if (!container) {
    return;
  }

  const scrollAmount = Math.min(container.clientWidth * 0.85, 420);
  container.scrollBy({
    left: scrollAmount * direction,
    behavior: 'smooth'
  });
}

function createChakraSpark(x, y) {
  const spark = document.createElement('span');
  spark.className = 'cursor-chakra';
  spark.style.left = `${x}px`;
  spark.style.top = `${y}px`;
  spark.style.setProperty('--spark-x', `${(Math.random() - 0.5) * 90}px`);
  spark.style.setProperty('--spark-y', `${-35 - Math.random() * 80}px`);
  document.body.appendChild(spark);
  spark.addEventListener('animationend', () => spark.remove());
}

function setupNavigation() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navigation = document.getElementById('primary-navigation');

  if (!menuToggle || !navigation) {
    return;
  }

  menuToggle.addEventListener('click', () => {
    const isOpen = navigation.classList.toggle('active');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navigation.addEventListener('click', (event) => {
    if (event.target.matches('a')) {
      navigation.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

function setupCertificateControls() {
  document.querySelectorAll('[data-certificate-scroll]').forEach((button) => {
    button.addEventListener('click', () => {
      scrollCertificates(Number(button.dataset.certificateScroll));
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupCertificateControls();

  const animatedCards = document.querySelectorAll('.skill, .project-card, .certificate-card');

  animatedCards.forEach((card, index) => {
    card.style.setProperty('--entry-delay', `${Math.min(index * 60, 720)}ms`);
    card.classList.add('anime-entry');
  });

  document.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    for (let i = 0; i < 6; i += 1) {
      createChakraSpark(event.clientX, event.clientY);
    }
  });
});
