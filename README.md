# p5.js-export

Export high resolution snapshots from p5.js sketches

Update 2022-06-25:
* When a .png is exported, the resolution (eg. 300 DPI) is also encoded in the PNG image.

**Note:** it's very much a work in progress. Currently it only works with A* ISO sizes in portrait orientation.

## How to use

Import the library in your html `<head>` tag :

```html
<script src="https://unpkg.com/p5.js-export/p5.js-export.js"></script>
```
Then insert `saveForPrint()` in your code :

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

## Known limitations

* The frames saved are not the previous ones, but the future ones. In that sense, **it's not possible to export sketches based on user actions**. One possible solution would be to have a notion of recording (start a recording, then move mouse, then save).
* Background has to be set in `draw()` function or it will be ignored. One possible solution would be to pass your background as an option in the `saveForPrint()` function.

## Why ?

I was looking for a simple way to print sketches at high resoution but couldn't find one. The goal was to have a unique method
as to mimic p5.js `save()` method.

## How it works

When calling `saveForPrint()`, the canvas is scaled to the desired resolution ("A4", "A3", "A2", "A1", "A0"), `draw()` is called (once or multiple times) then the p5 `save()` method is called and we reduce the canvas to its original size.
