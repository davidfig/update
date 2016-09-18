## update
    update loop API for javascript apps

## Live Example with Source
https://davidfig.github.io/update/

## Installation

    npm install yy-update

# API Reference
<a name="Update"></a>

## Update
**Kind**: global class  

* [Update](#Update)
    * [new Update()](#new_Update_new)
    * [.init([options])](#Update+init)
    * [.registerPause(pause, resume)](#Update+registerPause)
    * [.pauseGame()](#Update+pauseGame)
    * [.resumeGame()](#Update+resumeGame)
    * [.add(funct, [options])](#Update+add)
    * [.remove(update)](#Update+remove)
    * [.update()](#Update+update)

<a name="new_Update_new"></a>

### new Update()
update loop API for javascript apps

**Example**  
```js
const Update = require('yy-update');

// initialize update loop
Update.init();

// add a call to testPI every 100 ms
Update.add(testPI, {time: 100});

// add a call to testDelay
Update.add(testDelay);

// start update loop
Update.update();

function testPI()
{
   var test = Math.pow(Math.PI, 100);
}

function testDelay()
{
   var test = 0;
   for (var i = 0; i < 100000; i++)
   {
       test += i * 3;
   }
}
```
<a name="Update+init"></a>

### update.init([options])
must call this.init before using Update

**Kind**: instance method of <code>[Update](#Update)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>object</code> |  |
| [options.Debug] | <code>object</code> | pass Debug from github.com/davidfig/debug |
| [options.count] | <code>boolean</code> &#124; <code>string</code> | show debug counts (can supply side for panel, e.g., 'topleft') |
| [options.percent] | <code>boolean</code> &#124; <code>string</code> | show debug percentage |
| [options.FPS] | <code>boolean</code> &#124; <code>string</code> | show debug FPS |

<a name="Update+registerPause"></a>

### update.registerPause(pause, resume)
register functions to call after Update pauses or resumes

**Kind**: instance method of <code>[Update](#Update)</code>  

| Param | Type |
| --- | --- |
| pause | <code>function</code> | 
| resume | <code>function</code> | 

<a name="Update+pauseGame"></a>

### update.pauseGame()
pauses all updates

**Kind**: instance method of <code>[Update](#Update)</code>  
<a name="Update+resumeGame"></a>

### update.resumeGame()
resumes all updates

**Kind**: instance method of <code>[Update](#Update)</code>  
<a name="Update+add"></a>

### update.add(funct, [options])
adds a function to the update loop

**Kind**: instance method of <code>[Update](#Update)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| funct | <code>function</code> |  |  |
| [options] | <code>object</code> |  |  |
| [options.time] | <code>number</code> | <code>0</code> | in milliseconds to call this function |
| [options.FPS] | <code>number</code> |  | this replaces options.time and calls the function at the desired FPS |
| [options.once] | <code>boolean</code> | <code>false</code> | call only once and then remove from update queue |
| [options.percent] | <code>string</code> |  | name to track the percentage in the debug panel |

<a name="Update+remove"></a>

### update.remove(update)
removes an update from the loop

**Kind**: instance method of <code>[Update](#Update)</code>  

| Param | Type | Description |
| --- | --- | --- |
| update | <code>object</code> | object returned by this.add() |

<a name="Update+update"></a>

### update.update()
starts the update loop

**Kind**: instance method of <code>[Update](#Update)</code>  
* * *

Copyright (c) 2016 YOPEY YOPEY LLC - MIT License - Documented by [jsdoc-to-markdown](https://github.com/75lb/jsdoc-to-markdown)