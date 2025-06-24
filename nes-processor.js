class NESProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.leftSamples = [];
    this.rightSamples = [];

    this.port.onmessage = (event) => {
      const data = event.data;
      if (data.type === 'sample') {
        this.leftSamples.push(data.left);
        this.rightSamples.push(data.right);
      }
    };
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    if (!output || output.length < 2) return true;

    const left = output[0];
    const right = output[1];

    for (let i = 0; i < left.length; i++) {
      left[i] = this.leftSamples.length ? this.leftSamples.shift() : 0;
      right[i] = this.rightSamples.length ? this.rightSamples.shift() : 0;
    }

    return true;
  }
}

registerProcessor('nes-processor', NESProcessor);
