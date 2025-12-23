const canvas = document.getElementById('star-field');
const ctx = canvas.getContext('2d');


function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resize();
window.addEventListener('resize', resize);

console.log('canvas width is: ', canvas.width, 'canvas height is: ', canvas.height);

const stars = [];
const numStars = 400;

for (let i = 0; i < numStars; i++) {
	stars.push({
		x: Math.random() * canvas.width,
		y: Math.random() * canvas.height,
		size: Math.random() * 2,
		speed: Math.random() * 2 + 0.5
	});
}

console.log(stars)

function animate() {
  // Clear canvas
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Update and draw each star
  for (const star of stars) {
    // Move star down
    star.y += star.speed;

    // Reset to top if off screen
    if (star.y > canvas.height) {
      star.y = 0;
      star.x = Math.random() * canvas.width;
    }

    // Draw star
    ctx.fillStyle = 'white';
    ctx.fillRect(star.x, star.y, star.size, star.size);
  }

  requestAnimationFrame(animate);
}

animate();
