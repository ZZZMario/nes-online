const canvas = document.getElementById('nes-canvas');
const romInput = document.getElementById('romInput');
const nes = new jsnes.NES({
  onFrame: function (frameBuffer) {
    const imageData = canvasCtx.createImageData(256, 240);
    for (let i = 0; i < frameBuffer.length; i++) {
      imageData.data[i * 4 + 0] = (frameBuffer[i] >> 16) & 0xFF; // R
      imageData.data[i * 4 + 1] = (frameBuffer[i] >> 8) & 0xFF;  // G
      imageData.data[i * 4 + 2] = frameBuffer[i] & 0xFF;         // B
      imageData.data[i * 4 + 3] = 0xFF;                          // A
    }
    canvasCtx.putImageData(imageData, 0, 0);
  },
  onStatusUpdate: console.log,
  onAudioSample: function () {} // Audio left out for simplicity
});

const canvasCtx = canvas.getContext('2d');

// Keyboard input
const keyMap = {
  ArrowUp: jsnes.Controller.BUTTON_UP,
  ArrowDown: jsnes.Controller.BUTTON_DOWN,
  ArrowLeft: jsnes.Controller.BUTTON_LEFT,
  ArrowRight: jsnes.Controller.BUTTON_RIGHT,
  z: jsnes.Controller.BUTTON_A,
  x: jsnes.Controller.BUTTON_B,
  Enter: jsnes.Controller.BUTTON_START,
  Shift: jsnes.Controller.BUTTON_SELECT,
};

document.addEventListener('keydown', e => {
  if (keyMap[e.key]) nes.buttonDown(1, keyMap[e.key]);
});
document.addEventListener('keyup', e => {
  if (keyMap[e.key]) nes.buttonUp(1, keyMap[e.key]);
});

// ROM loader
romInput.addEventListener('change', function () {
  const file = this.files[0];
  const reader = new FileReader();
  reader.onload = function () {
    nes.loadROM(reader.result);
    nes.start();
  };
  reader.readAsBinaryString(file);
});
