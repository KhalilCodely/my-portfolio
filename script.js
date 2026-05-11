function scrollCertificates(direction) {
  const container = document.getElementById('certificatesContainer');
  const scrollAmount = 300; // pixels per click
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

document.addEventListener('DOMContentLoaded', () => {
  const animatedCards = document.querySelectorAll('.skill, .project-card, .certificate-card');

  animatedCards.forEach((card, index) => {
    card.style.setProperty('--entry-delay', `${Math.min(index * 60, 720)}ms`);
    card.classList.add('anime-entry');
  });

  document.addEventListener('pointerdown', (event) => {
    for (let i = 0; i < 6; i += 1) {
      createChakraSpark(event.clientX, event.clientY);
    }
  });
});
