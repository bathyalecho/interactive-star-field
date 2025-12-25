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
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

for (let i = 0; i < numStars; i++) {
	stars.push({
		angle: Math.random() * Math.PI * 2,
		distance: Math.random() * canvas.width / 2,
		size: Math.random() * 2,
		speed: Math.random() * 2 
	});
}

function animate() {
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height);


  for (const star of stars) {
	star.distance += star.speed;
	
	const x = centerX + Math.cos(star.angle) * star.distance;
	const y = centerY + Math.sin(star.angle) * star.distance;
	
	console.log("X is ", x)
	console.log("Y is ", y)

	if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) {
		star.distance = 100;
		star.angle = Math.random() * Math.PI * 2;
    }


	const size = star.size * (star.distance / 200 + 0.5);
	ctx.fillStyle = 'white';
	ctx.fillRect(x, y, star.size, star.size);
  }

  requestAnimationFrame(animate);
}

animate();
