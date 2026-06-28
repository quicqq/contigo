// Mueve cada "blob" del fondo a una profundidad distinta según la posición
// del mouse, para dar sensación de profundidad sin marear. La animación
// ambiental (el flotado constante) la controla el CSS por separado, así
// que aquí solo tocamos `transform`, nunca `margin`/`top`/`left`.
(function () {
  const blobs = document.querySelectorAll(".blob");
  if (!blobs.length) return;

  let targetX = 0, targetY = 0, curX = 0, curY = 0;

  window.addEventListener("mousemove", function (e) {
    targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function animate() {
    // Suavizado (lerp) para que el movimiento no sea brusco.
    curX += (targetX - curX) * 0.04;
    curY += (targetY - curY) * 0.04;

    blobs.forEach(function (blob, i) {
      const depth = (i + 1) * 12;
      blob.style.transform = `translate(${curX * depth}px, ${curY * depth}px)`;
    });

    requestAnimationFrame(animate);
  }
  animate();
})();
