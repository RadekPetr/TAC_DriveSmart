/*License (MIT)

 Copyright © 2013 Matt Diamond

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
 to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of
 the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 DEALINGS IN THE SOFTWARE.
 */

/* Changed to Mootools Clas -    Radek PETR 2014 */

var RecorderWorker = new Class({

    Implements : [Options, Events],
    options : {

    },
    initialize : function(myParent, myOptions) {
        this.setOptions(myOptions);
        this.options.parent = myParent;

    },
    init : function(sampleRate) {
        this.recLength = 0;
        this.recBuffersL = [];
        this.recBuffersR = [];
        this.sampleRate = null;
        this.sampleRate = sampleRate;
    },
    record : function(inputBuffer) {
        this.recBuffersL.push(inputBuffer[0]);
        this.recBuffersR.push(inputBuffer[1]);
        this.recLength += inputBuffer[0].length;
    },
    exportWAV : function(type) {
        var bufferL = this.mergeBuffers(this.recBuffersL, this.recLength);
        var bufferR = this.mergeBuffers(this.recBuffersR, this.recLength);
        var interleaved = this.interleave(bufferL, bufferR);
        var dataview = this.encodeWAV(interleaved);
        var audioBlob = new Blob([dataview], {
            type : type
        });
        log("4");
        return audioBlob;
    },
    exportMonoWAV : function(type) {

        var bufferL = this.mergeBuffers(this.recBuffersL, this.recLength);
        var dataview = this.encodeWAV(bufferL, true);
        var audioBlob = new Blob([dataview], {
            type : type
        });

        return audioBlob;
    },
    getBuffers : function() {
        var buffers = [];
        buffers.push(this.mergeBuffers(this.recBuffersL, this.recLength));
        buffers.push(this.mergeBuffers(this.recBuffersR, this.recLength));
        log("buffers", buffers);
        return buffers;
    },
    clear : function() {
        this.recLength = 0;
        this.recBuffersL = [];
        this.recBuffersR = [];
    },
    mergeBuffers : function(recBuffers, recLength) {
        var result = new Float32Array(recLength);
        var offset = 0;
        for (var i = 0; i < recBuffers.length; i++) {
            result.set(recBuffers[i], offset);
            offset += recBuffers[i].length;
        }
        return result;
    },
    interleave : function(inputL, inputR) {
        var length = inputL.length + inputR.length;
        var result = new Float32Array(length);

        var index = 0, inputIndex = 0;

        while (index < length) {
            result[index++] = inputL[inputIndex];
            result[index++] = inputR[inputIndex];
            inputIndex++;
        }
        return result;
    },
    floatTo16BitPCM : function(output, offset, input) {
        for (var i = 0; i < input.length; i++, offset += 2) {
            var s = Math.max(-1, Math.min(1, input[i]));
            output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
        log("2");
    },
    writeString : function(view, offset, string) {
        for (var i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    },
    encodeWAV : function(samples, mono) {
        var buffer = new ArrayBuffer(44 + samples.length * 2);
        // var buffer = new ArrayBuffer(44 + samples.length * 1);
        var view = new DataView(buffer);

        /* RIFF identifier */
        this.writeString(view, 0, 'RIFF');
        /* file length */
        view.setUint32(4, 32 + samples.length * 2, true);
        /* RIFF type */
        this.writeString(view, 8, 'WAVE');
        /* format chunk identifier */
        this.writeString(view, 12, 'fmt ');
        /* format chunk length */
        view.setUint32(16, 16, true);
        /* sample format (raw) */
        view.setUint16(20, 1, true);
        /* channel count */
        view.setUint16(22, mono ? 1 : 2, true);
        /* sample rate */
        view.setUint32(24, this.sampleRate, true);
        /* byte rate (sample rate * block align) */
        view.setUint32(28, this.sampleRate * 4, true);
        /* block align (channel count * bytes per sample) */
        view.setUint16(32, 4, true);
        /* bits per sample */
        view.setUint16(34, 16, true);
        /* data chunk identifier */
        this.writeString(view, 36, 'data');
        /* data chunk length */
        view.setUint32(40, samples.length * 2, true);

        this.floatTo16BitPCM(view, 44, samples);
        log("3");
        return view;
    }
});
