const canvas = document.getElementById('star-field');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

ctx.fillStyle = 'white';
ctx.beginPath();
ctx.arc(100, 100, 20, 0, Math.PI * 2);
ctx.fill();
