const canvas = document.getElementById('star-field');
const ctx = canvas.getContext('2d');

let centerX, centerY;
let mouseX = null;
let mouseY = null;
let isMouseDown = false;

function resize() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	centerX = canvas.width / 2;
	centerY = canvas.height / 2;
}

resize();
window.addEventListener('resize', resize);

// Track mouse position
document.addEventListener('mousemove', (e) => {
	mouseX = e.clientX;
	mouseY = e.clientY;
});

document.addEventListener('mouseleave', () => {
	mouseX = null;
	mouseY = null;
});

document.addEventListener('mousedown', () => {
	isMouseDown = true;
});

document.addEventListener('mouseup', () => {
	isMouseDown = false;
});

// Burst effect on click
document.addEventListener('click', (e) => {
	createBurst(e.clientX, e.clientY, 15);
});

const stars = [];
const numStars = 200;

function createStar(x, y, angle, speed) {
	return {
		x: x ?? centerX,
		y: y ?? centerY,
		angle: angle ?? Math.random() * Math.PI * 2,
		distance: Math.random() * 50 + 20,
		size: Math.random() * 1.5 + 0.5,
		baseSpeed: speed ?? Math.random() * 0.8 + 0.2,
		speed: speed ?? Math.random() * 0.8 + 0.2,
		opacity: Math.random() * 0.5 + 0.3,
		vx: 0,
		vy: 0
	};
}

function createBurst(x, y, count) {
	for (let i = 0; i < count; i++) {
		const angle = (Math.PI * 2 / count) * i + Math.random() * 0.3;
		const star = createStar(x, y, angle, Math.random() * 3 + 2);
		star.distance = 5;
		star.size = Math.random() * 2 + 1;
		star.opacity = 1;
		star.isBurst = true;
		stars.push(star);
	}
}

for (let i = 0; i < numStars; i++) {
	const star = createStar();
	star.distance = Math.random() * Math.max(canvas.width, canvas.height) / 2;
	stars.push(star);
}

function animate() {
	ctx.fillStyle = '#1D1225';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	const mouseInfluenceRadius = 150;
	const mouseForce = isMouseDown ? -0.8 : 0.3; // Attract when clicking, repel otherwise

	for (let i = stars.length - 1; i >= 0; i--) {
		const star = stars[i];

		// Calculate position from center or burst origin
		const originX = star.isBurst ? star.x : centerX;
		const originY = star.isBurst ? star.y : centerY;

		star.distance += star.speed;

		let x = originX + Math.cos(star.angle) * star.distance + star.vx;
		let y = originY + Math.sin(star.angle) * star.distance + star.vy;

		// Mouse interaction
		if (mouseX !== null && mouseY !== null) {
			const dx = x - mouseX;
			const dy = y - mouseY;
			const dist = Math.sqrt(dx * dx + dy * dy);

			if (dist < mouseInfluenceRadius && dist > 0) {
				const force = (1 - dist / mouseInfluenceRadius) * mouseForce;
				star.vx += (dx / dist) * force;
				star.vy += (dy / dist) * force;

				// Speed boost when near mouse
				star.speed = star.baseSpeed * (1 + (1 - dist / mouseInfluenceRadius) * 2);
			} else {
				star.speed = star.baseSpeed;
			}
		}

		// Dampen velocity
		star.vx *= 0.95;
		star.vy *= 0.95;

		// Reset or remove stars that go off screen
		if (x < -20 || x > canvas.width + 20 || y < -20 || y > canvas.height + 20) {
			if (star.isBurst) {
				stars.splice(i, 1);
				continue;
			}
			star.distance = 20;
			star.angle = Math.random() * Math.PI * 2;
			star.opacity = Math.random() * 0.5 + 0.3;
			star.vx = 0;
			star.vy = 0;
		}

		// Fade out burst stars
		if (star.isBurst) {
			star.opacity *= 0.98;
			if (star.opacity < 0.05) {
				stars.splice(i, 1);
				continue;
			}
		}

		// Size increases with distance for parallax effect
		const size = star.size * (star.distance / 300 + 0.5);

		// Purple-tinted stars matching the theme
		const brightness = Math.min(star.opacity + (star.distance / 800), 1);

		// Brighter when near mouse
		let finalBrightness = brightness;
		if (mouseX !== null && mouseY !== null) {
			const dx = x - mouseX;
			const dy = y - mouseY;
			const dist = Math.sqrt(dx * dx + dy * dy);
			if (dist < mouseInfluenceRadius) {
				finalBrightness = Math.min(brightness + (1 - dist / mouseInfluenceRadius) * 0.5, 1);
			}
		}

		ctx.fillStyle = `rgba(197, 121, 255, ${finalBrightness * 0.7})`;

		ctx.beginPath();
		ctx.arc(x, y, size, 0, Math.PI * 2);
		ctx.fill();

		// Add glow for burst stars
		if (star.isBurst) {
			ctx.fillStyle = `rgba(241, 222, 255, ${star.opacity * 0.3})`;
			ctx.beginPath();
			ctx.arc(x, y, size * 2, 0, Math.PI * 2);
			ctx.fill();
		}
	}

	requestAnimationFrame(animate);
}

animate();
