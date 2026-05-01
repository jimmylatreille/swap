const canvas = document.getElementById("noise-bg");
const ctx = canvas.getContext("2d");
let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

// Film grain parameters
let lastTime = 0;
const grainAlpha = 150; // Between 0 and 255 for transparency
const fps = 24; // Frames per second
const frameDuration = 1000 / fps;

function generateGrain() {
  const imageData = ctx.createImageData(width, height);
  const pixels = imageData.data;

  for (let i = 0; i < pixels.length; i += 4) {
    const gray = (Math.random() * 255) | 0;
    pixels[i] = gray; // Red
    pixels[i + 1] = gray; // Green
    pixels[i + 2] = gray; // Blue
    pixels[i + 3] = grainAlpha; // Alpha (transparency)
  }

  ctx.putImageData(imageData, 0, 0);
}

function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}

const loop = (currentTime) => {
  requestAnimationFrame(loop);
  const elapsed = Math.floor(currentTime - lastTime);

  if (elapsed > frameDuration) {
    lastTime = Math.floor(currentTime - (elapsed % frameDuration));
    generateGrain();
  }
};

requestAnimationFrame(loop); // Start the loop
window.addEventListener("resize", resizeCanvas);