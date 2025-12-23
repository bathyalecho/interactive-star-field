const canvas = document.getElementById('star-field');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const x = Math.random() * canvas.width;
const y = Math.random() * canvas.height;

console.log('canvas width is: ', canvas.width, 'canvas height is: ', canvas.height);
console.log('x is: ', x, 'y is: ', y);



ctx.fillStyle = 'white';
ctx.beginPath();
ctx.arc(x, y, 10, 0, Math.PI * 2);
ctx.fill();
