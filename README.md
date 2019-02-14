# p5.js-export

Export high resolution snapshots from p5.js sketches

**Note:** it's very much a work in progress. Currently it only works with A* ISO sizes in portrait orientation.

## How to use

```js
saveForPrint("sketch.jpg", "A3", 300);
```

Save the file on key press :

```js
function keyPressed() {
  if (keyCode === 83) { // if "s" is pressed
    saveForPrint("sketch.jpg", "A3", 300);
  }
}
```

### Save multiple frames

4th parameter is used to save multiple frames. Useful if you have an alpha on the background ("blending" multiple `draw()` calls)

```js
saveForPrint("sketch.jpg", "A3", 300, 10); // save 10 frames
```

## Why ?

I was looking for a simple way to print sketches at high resoution but couldn't find one. The goal was to have a unique method
as to mimic p5.js `save()` method.

## How it works

When calling `saveForPrint()`, the canvas is scaled to the desired resolution ("A4", "A3", "A2", "A1", "A0"), `draw()` is called 
(once or multiple times) then the p5 `save()` method is called and we reduce the canvas to its original size.

It's pretty invasive but I haven't experienced any side effects yet. I'd love to get some feedback
