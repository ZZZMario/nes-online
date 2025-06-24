const canvas = document.getElementById('nes-canvas');
const ctx = canvas.getContext('2d');
const romInput = document.getElementById('romInput');

let nes;
let workletNode;

// Setup AudioWorklet
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

audioCtx.audioWorklet.addModule('nes-processor.js').then(() => {
  workletNode = new AudioWorkletNode(audioCtx, 'nes-processor');
  workletNode.connect(audioCtx.destination);

  nes = new jsnes.NES({
    onFrame: drawFrame,
    onStatusUpdate: console.log,
    onAudioSample: (l, r) => {
      workletNode.port.postMessage({ type: 'sample', left: l, right: r });
    }
  });
});

document.body.addEventListener('click', () => {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
});

// drawFrame stays unchanged
const imageData = ctx.getImageData(0, 0, 256, 240);
function drawFrame(buffer) {
  for (let i = 0; i < buffer.length; i++) {
    const color = buffer[i];
    imageData.data[i * 4 + 0] = color & 0xFF;
    imageData.data[i * 4 + 1] = (color >> 8) & 0xFF;
    imageData.data[i * 4 + 2] = (color >> 16) & 0xFF;
    imageData.data[i * 4 + 3] = 0xFF;
  }
  ctx.putImageData(imageData, 0, 0);
}

// Key mapping is unchanged...
const BUTTON_A = 0, BUTTON_B = 1, BUTTON_SELECT = 2, BUTTON_START = 3;
const BUTTON_UP = 4, BUTTON_DOWN = 5, BUTTON_LEFT = 6, BUTTON_RIGHT = 7;

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
  if (keyMap[key] !== undefined) {
    nes?.buttonDown(1, keyMap[key]);
    e.preventDefault();
  }
});
document.addEventListener('keyup', (e) => {
  const key = e.key.toLowerCase();
  if (keyMap[key] !== undefined) {
    nes?.buttonUp(1, keyMap[key]);
    e.preventDefault();
  }
});

// ROM loader
let romLoaded = false;
romInput.addEventListener('change', function () {
  const file = this.files[0];
  const reader = new FileReader();

  reader.onload = function () {
    const bytes = new Uint8Array(reader.result);
    let binaryString = '';
    for (let i = 0; i < bytes.length; i++) {
      binaryString += String.fromCharCode(bytes[i]);
    }

    nes.loadROM(binaryString);
    romLoaded = true;
  };

  reader.readAsArrayBuffer(file);
});

// Frame loop
function runLoop() {
  requestAnimationFrame(runLoop);
  if (romLoaded && nes) nes.frame();
}
runLoop();
