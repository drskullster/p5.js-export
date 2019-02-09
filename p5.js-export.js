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

saveForPrint = function(_fileName, _size, _resolution) {
  const fileName = _fileName ? _fileName : "export.jpg";
  const resolution = _resolution ? _resolution : 300;
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
  draw();
  save(fileName);

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
