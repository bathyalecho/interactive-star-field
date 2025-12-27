// Steinmetz Solid Visualization
// A bicylinder - intersection of two perpendicular cylinders

(function() {
	let scene, camera, renderer, steinmetzMesh;
	let isDragging = false;
	let previousMousePosition = { x: 0, y: 0 };
	let rotationVelocity = { x: 0, y: 0 };
	let autoRotationSpeed = 0.005; // Counterclockwise rotation speed
	let hue = 0;
	let baseZoom, minZoom, maxZoom;

	function calculateCameraDistance() {
		// Adjust camera distance based on screen size
		// Smaller screens need camera further back for solid to fit nicely
		const minDimension = Math.min(window.innerWidth, window.innerHeight);
		// Base distance of 4 for ~800px, scale inversely for smaller screens
		const distance = Math.max(3.5, 4 * (800 / minDimension) * 0.7);
		return Math.min(distance, 6); // Cap at 6 for very small screens
	}

	function init() {
		const canvas = document.getElementById('steinmetz-canvas');

		// Scene setup
		scene = new THREE.Scene();

		// Calculate initial camera distance based on screen size
		baseZoom = calculateCameraDistance();
		minZoom = baseZoom * 0.5;  // Can zoom in to 50% of base distance
		maxZoom = baseZoom * 2.5;  // Can zoom out to 250% of base distance

		// Camera setup
		camera = new THREE.PerspectiveCamera(
			60,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		camera.position.z = baseZoom;

		// Renderer setup
		renderer = new THREE.WebGLRenderer({
			canvas: canvas,
			antialias: true,
			alpha: true
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setClearColor(0x1D1225, 1);

		// Create Steinmetz solid
		createSteinmetzSolid();

		// Event listeners
		window.addEventListener('resize', onWindowResize);
		canvas.addEventListener('mousedown', onMouseDown);
		canvas.addEventListener('mousemove', onMouseMove);
		canvas.addEventListener('mouseup', onMouseUp);
		canvas.addEventListener('mouseleave', onMouseUp);
		canvas.addEventListener('wheel', onWheel, { passive: false });

		// Touch events
		canvas.addEventListener('touchstart', onTouchStart);
		canvas.addEventListener('touchmove', onTouchMove, { passive: false });
		canvas.addEventListener('touchend', onTouchEnd);

		// Start animation
		animate();
	}

	function createSteinmetzSolid() {
		const geometry = createBicylinderGeometry(1.5, 48);

		// Wireframe material with initial purple color
		const material = new THREE.MeshBasicMaterial({
			color: 0xc579ff,
			wireframe: true,
			transparent: true,
			opacity: 0.9
		});

		steinmetzMesh = new THREE.Mesh(geometry, material);
		scene.add(steinmetzMesh);

		// Add a subtle solid inner mesh for depth
		const innerMaterial = new THREE.MeshBasicMaterial({
			color: 0x1D1225,
			transparent: true,
			opacity: 0.3,
			side: THREE.DoubleSide
		});
		const innerMesh = new THREE.Mesh(geometry.clone(), innerMaterial);
		innerMesh.scale.set(0.99, 0.99, 0.99);
		steinmetzMesh.add(innerMesh);
	}

	function createBicylinderGeometry(radius, segments) {
		// A Steinmetz solid (bicylinder) is the intersection of two perpendicular cylinders
		// Cylinder 1 along Z-axis: x² + y² = r²
		// Cylinder 2 along X-axis: y² + z² = r²
		// The surface has 4 curved faces

		const geometry = new THREE.BufferGeometry();
		const vertices = [];
		const indices = [];

		// Face 1 & 2: Parts of the Z-cylinder surface (x² + y² = r²)
		// bounded by z: |z| ≤ r·|cos(θ)|
		// Each face covers z from 0 to ±zMax
		for (let side = 0; side < 2; side++) {
			const baseIndex = vertices.length / 3;
			const zSign = side === 0 ? 1 : -1;

			for (let i = 0; i <= segments; i++) {
				const theta = (i / segments) * Math.PI * 2;
				const cosT = Math.cos(theta);
				const sinT = Math.sin(theta);
				const x = radius * cosT;
				const y = radius * sinT;
				const zMax = radius * Math.abs(cosT);

				for (let j = 0; j <= segments; j++) {
					const t = j / segments; // 0 to 1
					const z = zSign * zMax * t;
					vertices.push(x, y, z);
				}
			}

			const rowSize = segments + 1;
			for (let i = 0; i < segments; i++) {
				for (let j = 0; j < segments; j++) {
					const a = baseIndex + i * rowSize + j;
					const b = baseIndex + i * rowSize + j + 1;
					const c = baseIndex + (i + 1) * rowSize + j;
					const d = baseIndex + (i + 1) * rowSize + j + 1;

					if (zSign > 0) {
						indices.push(a, b, c);
						indices.push(b, d, c);
					} else {
						indices.push(a, c, b);
						indices.push(b, c, d);
					}
				}
			}
		}

		// Face 3 & 4: Parts of the X-cylinder surface (y² + z² = r²)
		// bounded by x: |x| ≤ r·|sin(φ)|
		// Each face covers x from 0 to ±xMax
		for (let side = 0; side < 2; side++) {
			const baseIndex = vertices.length / 3;
			const xSign = side === 0 ? 1 : -1;

			for (let i = 0; i <= segments; i++) {
				const phi = (i / segments) * Math.PI * 2;
				const cosP = Math.cos(phi);
				const sinP = Math.sin(phi);
				const y = radius * cosP;
				const z = radius * sinP;
				const xMax = radius * Math.abs(sinP);

				for (let j = 0; j <= segments; j++) {
					const t = j / segments; // 0 to 1
					const x = xSign * xMax * t;
					vertices.push(x, y, z);
				}
			}

			const rowSize = segments + 1;
			for (let i = 0; i < segments; i++) {
				for (let j = 0; j < segments; j++) {
					const a = baseIndex + i * rowSize + j;
					const b = baseIndex + i * rowSize + j + 1;
					const c = baseIndex + (i + 1) * rowSize + j;
					const d = baseIndex + (i + 1) * rowSize + j + 1;

					if (xSign > 0) {
						indices.push(a, c, b);
						indices.push(b, c, d);
					} else {
						indices.push(a, b, c);
						indices.push(b, d, c);
					}
				}
			}
		}

		geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
		geometry.setIndex(indices);
		geometry.computeVertexNormals();

		return geometry;
	}

	function hslToHex(h, s, l) {
		const hDecimal = h / 360;
		const sDecimal = s / 100;
		const lDecimal = l / 100;

		let r, g, b;

		if (s === 0) {
			r = g = b = lDecimal;
		} else {
			const hue2rgb = (p, q, t) => {
				if (t < 0) t += 1;
				if (t > 1) t -= 1;
				if (t < 1/6) return p + (q - p) * 6 * t;
				if (t < 1/2) return q;
				if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
				return p;
			};

			const q = lDecimal < 0.5
				? lDecimal * (1 + sDecimal)
				: lDecimal + sDecimal - lDecimal * sDecimal;
			const p = 2 * lDecimal - q;

			r = hue2rgb(p, q, hDecimal + 1/3);
			g = hue2rgb(p, q, hDecimal);
			b = hue2rgb(p, q, hDecimal - 1/3);
		}

		const toHex = x => {
			const hex = Math.round(x * 255).toString(16);
			return hex.length === 1 ? '0' + hex : hex;
		};

		return parseInt(`${toHex(r)}${toHex(g)}${toHex(b)}`, 16);
	}

	function animate() {
		requestAnimationFrame(animate);

		// Update hue for color cycling (slow, smooth transition)
		hue = (hue + 0.2) % 360;

		// Apply color - keeping it in the purple/pink/blue range for theme consistency
		// Shifting between purple (270), magenta (300), and blue (240)
		const themeHue = 240 + (Math.sin(hue * Math.PI / 180) + 1) * 30;
		steinmetzMesh.material.color.setHex(hslToHex(themeHue, 70, 65));

		// Auto-rotate counterclockwise (negative Y rotation)
		if (!isDragging) {
			steinmetzMesh.rotation.y -= autoRotationSpeed;

			// Apply drag momentum decay
			steinmetzMesh.rotation.x += rotationVelocity.x;
			steinmetzMesh.rotation.y += rotationVelocity.y;
			rotationVelocity.x *= 0.95;
			rotationVelocity.y *= 0.95;
		}

		renderer.render(scene, camera);
	}

	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);

		// Recalculate zoom limits for new screen size
		const newBaseZoom = calculateCameraDistance();
		minZoom = newBaseZoom * 0.5;
		maxZoom = newBaseZoom * 2.5;

		// Adjust current zoom if it's outside new limits
		camera.position.z = Math.max(minZoom, Math.min(maxZoom, camera.position.z));
	}

	function onMouseDown(event) {
		isDragging = true;
		previousMousePosition = {
			x: event.clientX,
			y: event.clientY
		};
		rotationVelocity = { x: 0, y: 0 };
	}

	function onMouseMove(event) {
		if (!isDragging) return;

		const deltaX = event.clientX - previousMousePosition.x;
		const deltaY = event.clientY - previousMousePosition.y;

		steinmetzMesh.rotation.y += deltaX * 0.005;
		steinmetzMesh.rotation.x += deltaY * 0.005;

		rotationVelocity = {
			x: deltaY * 0.002,
			y: deltaX * 0.002
		};

		previousMousePosition = {
			x: event.clientX,
			y: event.clientY
		};
	}

	function onMouseUp() {
		isDragging = false;
	}

	function onWheel(event) {
		event.preventDefault();
		camera.position.z += event.deltaY * 0.005;
		camera.position.z = Math.max(minZoom, Math.min(maxZoom, camera.position.z));
	}

	let initialPinchDistance = 0;

	function getTouchDistance(touches) {
		const dx = touches[0].clientX - touches[1].clientX;
		const dy = touches[0].clientY - touches[1].clientY;
		return Math.sqrt(dx * dx + dy * dy);
	}

	function onTouchStart(event) {
		if (event.touches.length === 1) {
			isDragging = true;
			previousMousePosition = {
				x: event.touches[0].clientX,
				y: event.touches[0].clientY
			};
			rotationVelocity = { x: 0, y: 0 };
		} else if (event.touches.length === 2) {
			isDragging = false;
			initialPinchDistance = getTouchDistance(event.touches);
		}
	}

	function onTouchMove(event) {
		event.preventDefault();

		if (event.touches.length === 1 && isDragging) {
			const deltaX = event.touches[0].clientX - previousMousePosition.x;
			const deltaY = event.touches[0].clientY - previousMousePosition.y;

			steinmetzMesh.rotation.y += deltaX * 0.005;
			steinmetzMesh.rotation.x += deltaY * 0.005;

			rotationVelocity = {
				x: deltaY * 0.002,
				y: deltaX * 0.002
			};

			previousMousePosition = {
				x: event.touches[0].clientX,
				y: event.touches[0].clientY
			};
		} else if (event.touches.length === 2) {
			const currentDistance = getTouchDistance(event.touches);
			const delta = initialPinchDistance - currentDistance;

			camera.position.z += delta * 0.01;
			camera.position.z = Math.max(minZoom, Math.min(maxZoom, camera.position.z));

			initialPinchDistance = currentDistance;
		}
	}

	function onTouchEnd() {
		isDragging = false;
		initialPinchDistance = 0;
	}

	// Initialize when DOM is ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
