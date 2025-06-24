const canvas = document.getElementById('nes-canvas');
const ctx = canvas.getContext('2d');
const romInput = document.getElementById('romInput');

let nes;

if (typeof jsnes !== 'undefined') {
  nes = new jsnes.NES({
    onFrame: drawFrame,
    onStatusUpdate: console.log,
    onAudioSample: () => {} 
  });
} else if (typeof NES !== 'undefined') {
  nes = new NES({
    onFrame: drawFrame,
    onStatusUpdate: console.log,
    onAudioSample: () => {}
  });
} else {
  console.error("jsnes or NES not found.");
}

const frameBuffer = new Uint32Array(256 * 240);
const imageData = ctx.getImageData(0, 0, 256, 240);

function drawFrame(buffer) {
  for (let i = 0; i < buffer.length; i++) {
    const color = buffer[i];
    imageData.data[i * 4 + 0] = color & 0xFF;         // R (was B)
    imageData.data[i * 4 + 1] = (color >> 8) & 0xFF;  // G
    imageData.data[i * 4 + 2] = (color >> 16) & 0xFF; // B (was R)
    imageData.data[i * 4 + 3] = 0xFF;                 // A
  }
  ctx.putImageData(imageData, 0, 0);
}

const Controller = (typeof jsnes !== 'undefined') ? jsnes.Controller : (typeof NES !== 'undefined') ? NES.Controller : null;

if (!Controller) {
  console.error("Could not find jsnes Controller object.");
}

const BUTTON_A = 0;
const BUTTON_B = 1;
const BUTTON_SELECT = 2;
const BUTTON_START = 3;
const BUTTON_UP = 4;
const BUTTON_DOWN = 5;
const BUTTON_LEFT = 6;
const BUTTON_RIGHT = 7;

const keyMap = {
  'z': BUTTON_A,
  'x': BUTTON_B,
  'shift': BUTTON_SELECT,
  'enter': BUTTON_START,
  'arrowup': BUTTON_UP,
  'arrowdown': BUTTON_DOWN,
  'arrowleft': BUTTON_LEFT,
  'arrowright': BUTTON_RIGHT,
};

document.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  console.log(`Key down: ${key}`);
  if (keyMap[key] !== undefined) {
    nes.buttonDown(1, keyMap[key]);
    e.preventDefault();
  }
});

document.addEventListener('keyup', (e) => {
  const key = e.key.toLowerCase();
  if (keyMap[key] !== undefined) {
    nes.buttonUp(1, keyMap[key]);
    e.preventDefault();
  }
});


romInput.addEventListener('change', function () {
  const file = this.files[0];
  const reader = new FileReader();

  reader.onload = function () {
    const arrayBuffer = reader.result;
    const bytes = new Uint8Array(arrayBuffer);
    let binaryString = '';
    for (let i = 0; i < bytes.length; i++) {
      binaryString += String.fromCharCode(bytes[i]);
    }

    nes.loadROM(binaryString);

    setInterval(() => {
      nes.frame();
    }, 1000 / 60);
  };

  reader.readAsArrayBuffer(file);
});
