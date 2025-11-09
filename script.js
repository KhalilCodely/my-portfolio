
  function scrollCertificates(direction) {
    const container = document.getElementById('certificatesContainer');
    const scrollAmount = 300; // pixels per click
    container.scrollBy({
      left: scrollAmount * direction,
      behavior: 'smooth'
    });
  }