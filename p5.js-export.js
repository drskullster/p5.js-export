ISO_PORTRAIT_RATIO = 0.7071;
ISO_LANDSCAPE_RATIO = 1.4142;

const sizes = {
  a: [
    [841, 1189],
    [594, 841],
    [420, 594],
    [297, 420],
    [210, 297],
    [148, 210],
    [105, 148],
    [74, 105],
    [52, 74],
    [37, 52],
    [26, 37]
  ]
};

saveForPrint = function(_fileName, _size, _resolution, _savedFrames) {
  const fileName = _fileName ? _fileName : "export.jpg";
  const reencodePNG = fileName.indexOf(".png") > -1;
  const resolution = _resolution ? _resolution : 300;
  const savedFrames = _savedFrames ? _savedFrames : 1;
  let size = sizes.a[4];

  if (_size) {
    const letter = _size[0].toLowerCase();
    const num = _size[1];
    size = sizes[letter][num];
  }

  const pixelDensity = _renderer._pInst.pixelDensity();

  const origW = width;
  const origH = height;

  const destW = getPxSize(size[0], resolution);
  const destH = getPxSize(size[1], resolution);

  saveCanvasProperties();

  _renderer.elt.width = destW;
  _renderer.elt.height = destH;
  _renderer.width = destW;
  _renderer.height = destH;

  resetCanvasProperties();

  scale(destW / origW);
  for (var i = 0; i < savedFrames; i++) {
    draw();
  }
  
  if (reencodePNG) saveReEncodedPng(fileName, resolution)
  else save(fileName);

  _renderer.elt.width = width * pixelDensity;
  _renderer.elt.height = height * pixelDensity;
  _renderer.width = origW;
  _renderer.height = origH;

  resetCanvasProperties();

  scale(1);
};

function getPxSize(_size, _resolution) {
  return parseInt((_size / 10) * (_resolution / 2.54));
}


/**
 * resizing canvas somehow removes properties from context.
 * So we need to save all properties before resize,
 * then reset them. Borrowed from p5.js resizeCanvas()
 * source code.
 **/
let props;

function saveCanvasProperties() {
  props = {};
  for (let key in _renderer.drawingContext) {
    let val = _renderer.drawingContext[key];
    if (typeof val !== 'object' && typeof val !== 'function') {
      props[key] = val;
    }
  }
}

function resetCanvasProperties() {
  for (var savedKey in props) {
    try {
      _renderer.drawingContext[savedKey] = props[savedKey];
    } catch (err) {
      // ignore read-only property errors
    }
  }
}


function saveReEncodedPng(fileName, resolution) {
  let pngHeader = "data:image/png;base64,";
  let base64 = _renderer.canvas.toDataURL().substr(pngHeader.length);
  let binary_string = window.atob(base64);
  let len = binary_string.length;
  let bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }

  // pixels per metre
  let ppm = Math.round(resolution / 2.54 * 100);
  bytes = rewrite_pHYs_chunk(bytes, ppm, ppm);

  // re-encode PNG (btoa method)
  var b64encoded = btoa(
    new Uint8Array(bytes)
      .reduce((data, byte) => data + String.fromCharCode(byte), '')
  );
  // download file
  let a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  a.href = pngHeader + b64encoded;
  a.download = fileName;
  a.click();
}

// source: https://github.com/murkle/rewrite-png-pHYs-chunk
/* adapted from https://github.com/hughsk/png-chunks-extract (MIT) and https://github.com/SheetJS/js-crc32 (Apache 2.0) (C) 2014-present SheetJS -- http://sheetjs.com */
let rewrite_pHYs_chunk = function (data, ppmx, ppmy) {

  /* crc32.js (C) 2014-present SheetJS -- http://sheetjs.com */
  /* vim: set ts=2: */
  /*exported CRC32 */
  var CRC32;
  (function (factory) {
    /*jshint ignore:start */
    if (typeof DO_NOT_EXPORT_CRC === 'undefined') {
      if ('object' === typeof exports) {
        factory(exports);
      } else if ('function' === typeof define && define.amd) {
        define(function () {
          var module = {};
          factory(module);
          return module;
        });
      } else {
        factory(CRC32 = {});
      }
    } else {
      factory(CRC32 = {});
    }
    /*jshint ignore:end */
  }(function (CRC32) {
    CRC32.version = '1.1.1';
    /* see perf/crc32table.js */
    /*global Int32Array */
    function signed_crc_table() {
      var c = 0, table = new Array(256);

      for (var n = 0; n != 256; ++n) {
        c = n;
        c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
        c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
        c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
        c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
        c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
        c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
        c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
        c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
        table[n] = c;
      }

      return typeof Int32Array !== 'undefined' ? new Int32Array(table) : table;
    }

    var T = signed_crc_table();
    function crc32_bstr(bstr, seed) {
      var C = seed ^ -1, L = bstr.length - 1;
      for (var i = 0; i < L;) {
        C = (C >>> 8) ^ T[(C ^ bstr.charCodeAt(i++)) & 0xFF];
        C = (C >>> 8) ^ T[(C ^ bstr.charCodeAt(i++)) & 0xFF];
      }
      if (i === L) C = (C >>> 8) ^ T[(C ^ bstr.charCodeAt(i)) & 0xFF];
      return C ^ -1;
    }

    function crc32_buf(buf, seed) {
      if (buf.length > 10000) return crc32_buf_8(buf, seed);
      var C = seed ^ -1, L = buf.length - 3;
      for (var i = 0; i < L;) {
        C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
        C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
        C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
        C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
      }
      while (i < L + 3) C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
      return C ^ -1;
    }

    function crc32_buf_8(buf, seed) {
      var C = seed ^ -1, L = buf.length - 7;
      for (var i = 0; i < L;) {
        C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
        C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
        C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
        C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
        C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
        C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
        C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
        C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
      }
      while (i < L + 7) C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
      return C ^ -1;
    }

    function crc32_str(str, seed) {
      var C = seed ^ -1;
      for (var i = 0, L = str.length, c, d; i < L;) {
        c = str.charCodeAt(i++);
        if (c < 0x80) {
          C = (C >>> 8) ^ T[(C ^ c) & 0xFF];
        } else if (c < 0x800) {
          C = (C >>> 8) ^ T[(C ^ (192 | ((c >> 6) & 31))) & 0xFF];
          C = (C >>> 8) ^ T[(C ^ (128 | (c & 63))) & 0xFF];
        } else if (c >= 0xD800 && c < 0xE000) {
          c = (c & 1023) + 64; d = str.charCodeAt(i++) & 1023;
          C = (C >>> 8) ^ T[(C ^ (240 | ((c >> 8) & 7))) & 0xFF];
          C = (C >>> 8) ^ T[(C ^ (128 | ((c >> 2) & 63))) & 0xFF];
          C = (C >>> 8) ^ T[(C ^ (128 | ((d >> 6) & 15) | ((c & 3) << 4))) & 0xFF];
          C = (C >>> 8) ^ T[(C ^ (128 | (d & 63))) & 0xFF];
        } else {
          C = (C >>> 8) ^ T[(C ^ (224 | ((c >> 12) & 15))) & 0xFF];
          C = (C >>> 8) ^ T[(C ^ (128 | ((c >> 6) & 63))) & 0xFF];
          C = (C >>> 8) ^ T[(C ^ (128 | (c & 63))) & 0xFF];
        }
      }
      return C ^ -1;
    }
    CRC32.table = T;
    CRC32.bstr = crc32_bstr;
    CRC32.buf = crc32_buf;
    CRC32.str = crc32_str;
  }));

  // Used for fast-ish conversion between uint8s and uint32s/int32s.
  // Also required in order to remain agnostic for both Node Buffers and
  // Uint8Arrays.
  var uint8 = new Uint8Array(4);
  var int32 = new Int32Array(uint8.buffer);
  var uint32 = new Uint32Array(uint8.buffer);

  var pHYsFound = false;

  if (data[0] !== 0x89 || data[1] !== 0x50 || data[2] !== 0x4E || data[3] !== 0x47 || data[4] !== 0x0D || data[5] !== 0x0A || data[6] !== 0x1A || data[7] !== 0x0A) {
    throw new Error('Invalid .png file header: possibly caused by DOS-Unix line ending conversion?');
  }

  var ended = false
  var idx = 8

  while (idx < data.length) {
    // Read the length of the current chunk,
    // which is stored as a Uint32.
    uint8[3] = data[idx++]
    uint8[2] = data[idx++]
    uint8[1] = data[idx++]
    uint8[0] = data[idx++]

    // Chunk includes name/type for CRC check (see below).
    var length = uint32[0] + 4
    var chunk = new Uint8Array(length)
    chunk[0] = data[idx++]
    chunk[1] = data[idx++]
    chunk[2] = data[idx++]
    chunk[3] = data[idx++]

    // Get the name in ASCII for identification.
    var name = (
      String.fromCharCode(chunk[0]) +
      String.fromCharCode(chunk[1]) +
      String.fromCharCode(chunk[2]) +
      String.fromCharCode(chunk[3])
    );

    //console.log("chunk found " + name + ", length = " + (length - 4));


    var chunkDataStart = idx;

    // Read the contents of the chunk out of the main buffer.
    for (var i = 4; i < length; i++) {
      chunk[i] = data[idx++];
    }

    var crcStart = idx;
    // Read out the CRC value for comparison.
    // It's stored as an Int32.
    uint8[3] = data[idx++];
    uint8[2] = data[idx++];
    uint8[1] = data[idx++];
    uint8[0] = data[idx++];

    var crcActual = int32[0];
    var crcExpect = CRC32.buf(chunk);
    if (crcExpect !== crcActual) {
      throw new Error(
        'CRC values for ' + name + ' header do not match, PNG file is likely corrupted'
      )
    } else {
      //console.log("CRCs match! " + crcExpect + " " + crcActual + " " + chunk.length);
    }

    if (name == "IDAT") {

      chunkDataStart = chunkDataStart - 8;

      var len = data.length;

      // create new array with pHYs chunk inserted
      // 4+4+13
      var data2 = new Uint8Array(len + 21);

      // copy before IEND
      for (var i = 0; i < chunkDataStart; i++) {
        data2[i] = data[i];
      }
      // copy IEND to end
      for (var i = chunkDataStart; i < len; i++) {
        data2[i + 21] = data[i];
      }

      var phys = new Uint8Array(13);
      var i = 0;

      // length of pHYs chunk
      int32[0] = 9;
      data2[chunkDataStart++] = uint8[3];
      data2[chunkDataStart++] = uint8[2];
      data2[chunkDataStart++] = uint8[1];
      data2[chunkDataStart++] = uint8[0];

      // pHYs (chunk name)
      phys[i++] = data2[chunkDataStart++] = 'p'.charCodeAt(0);
      phys[i++] = data2[chunkDataStart++] = 'H'.charCodeAt(0);
      phys[i++] = data2[chunkDataStart++] = 'Y'.charCodeAt(0);
      phys[i++] = data2[chunkDataStart++] = 's'.charCodeAt(0);


      // x
      uint32[0] = ppmx;
      phys[i++] = data2[chunkDataStart++] = uint8[3];
      phys[i++] = data2[chunkDataStart++] = uint8[2];
      phys[i++] = data2[chunkDataStart++] = uint8[1];
      phys[i++] = data2[chunkDataStart++] = uint8[0];
      // y 
      uint32[0] = ppmy;
      phys[i++] = data2[chunkDataStart++] = uint8[3];
      phys[i++] = data2[chunkDataStart++] = uint8[2];
      phys[i++] = data2[chunkDataStart++] = uint8[1];
      phys[i++] = data2[chunkDataStart++] = uint8[0];
      // unit = meters
      phys[i++] = data2[chunkDataStart++] = 1;

      var physCRC = CRC32.buf(phys);
      int32[0] = physCRC;

      data2[chunkDataStart++] = uint8[3];
      data2[chunkDataStart++] = uint8[2];
      data2[chunkDataStart++] = uint8[1];
      data2[chunkDataStart++] = uint8[0];

      return data2;


    }

    if (name == "pHYs") {
      //console.log("pHYs chunk found, rewriting!!!!!!!!!!!!!");

      var phys = new Uint8Array(13);
      var i = 0;


      // pHYs (chunk name)
      phys[i++] = 'p'.charCodeAt(0);
      phys[i++] = 'H'.charCodeAt(0);
      phys[i++] = 'Y'.charCodeAt(0);
      phys[i++] = 's'.charCodeAt(0);
      // x
      uint32[0] = ppmx;
      phys[i++] = data[chunkDataStart++] = uint8[3];
      phys[i++] = data[chunkDataStart++] = uint8[2];
      phys[i++] = data[chunkDataStart++] = uint8[1];
      phys[i++] = data[chunkDataStart++] = uint8[0];
      // y 
      uint32[0] = ppmy;
      phys[i++] = data[chunkDataStart++] = uint8[3];
      phys[i++] = data[chunkDataStart++] = uint8[2];
      phys[i++] = data[chunkDataStart++] = uint8[1];
      phys[i++] = data[chunkDataStart++] = uint8[0];
      // unit = meters
      phys[i++] = data[chunkDataStart++] = 1;

      var physCRC = CRC32.buf(phys);
      int32[0] = physCRC;

      data[crcStart++] = uint8[3];
      data[crcStart++] = uint8[2];
      data[crcStart++] = uint8[1];
      data[crcStart++] = uint8[0];

      return data;
    }

  }

  throw new Error('.png file ended prematurely: no IEND or pHYs header was found');

}

