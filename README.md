## update.js
update loop API for javascript apps. Works well with https://github.com/davidfig/debug (included for testing and examples)

## Code Example

        const Update = require('@yy/update');

        // initialize update loop
        Update.init();

        // add a call to testRandom every 100 MS and track it in Random Numbers debug panel
        Update.add(testRandom, {time: 100});

        // add a call to testPI every update
        Update.add(testPI);

        // add a call to testDelay
        Update.add(testDelay);

        // start update loop
        Update.update();

        function testRandom()
        {
            debugOne(Math.random(), {panel: random});
        }

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

## Live Example
https://davidfig.github.io/update/

see also

* https://davidfig.github.io/animate/
* https://davidfig.github.io/renderer/
* https://davidfig.github.io/viewport/

## Installation
include update.js in your project or add to your workflow

    npm install --save davidfig/update

# API Reference
**Kind**: global class  

* [Update](#Update)
    * [.init([Debug], [count], [percent], [FPS])](#Update+init)
    * [.registerPause(pause, resume)](#Update+registerPause)
    * [.pauseGame()](#Update+pauseGame)
    * [.resumeGame()](#Update+resumeGame)
    * [._updateAll(elapsed)](#Update+_updateAll)
    * [.add(funct, options)](#Update+add)
    * [.remove(update)](#Update+remove)
    * [.update()](#Update+update)
    * [.checkVisibility()](#Update+checkVisibility)
    * [.visibilityChange()](#Update+visibilityChange)
    * [._debugInit()](#Update+_debugInit)
    * [._debugUpdate(current)](#Update+_debugUpdate)
    * [._debugPercent(other)](#Update+_debugPercent)

<a name="Update+init"></a>

### update.init([Debug], [count], [percent], [FPS])
must call this.init before using Update

**Kind**: instance method of <code>[Update](#Update)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [Debug] | <code>object</code> | pass Debug from github.com/davidfig/debug |
| [count] | <code>boolean</code> &#124; <code>string</code> | show debug counts (can supply side for panel, e.g., 'topleft') |
| [percent] | <code>boolean</code> &#124; <code>string</code> | show debug percentage |
| [FPS] | <code>boolean</code> &#124; <code>string</code> | show debug FPS |

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
<a name="Update+_updateAll"></a>

### update._updateAll(elapsed)
loops through all updates

**Kind**: instance method of <code>[Update](#Update)</code>  

| Param | Type | Description |
| --- | --- | --- |
| elapsed | <code>number</code> | in milliseconds |

<a name="Update+add"></a>

### update.add(funct, options)
adds a function to the update loop

**Kind**: instance method of <code>[Update](#Update)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| funct | <code>function</code> |  |  |
| options | <code>object</code> |  |  |
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
<a name="Update+checkVisibility"></a>

### update.checkVisibility()
Starts a page visibility event listener running, or window.onpagehide/onpageshow if not supported by the browser. Also listens for window.onblur and window.onfocus.
based on Phaser: https://github.com/photonstorm/phaser (MIT license)

**Kind**: instance method of <code>[Update](#Update)</code>  
<a name="Update+visibilityChange"></a>

### update.visibilityChange()
Callback for checkVisibility()
based on Phaser: https://github.com/photonstorm/phaser (MIT license)

**Kind**: instance method of <code>[Update](#Update)</code>  
<a name="Update+_debugInit"></a>

### update._debugInit()
adds debug panels (uses github.com/davidfig/debug)

**Kind**: instance method of <code>[Update](#Update)</code>  
<a name="Update+_debugUpdate"></a>

### update._debugUpdate(current)
update debug panels

**Kind**: instance method of <code>[Update](#Update)</code>  

| Param | Type | Description |
| --- | --- | --- |
| current | <code>number</code> | time |

<a name="Update+_debugPercent"></a>

### update._debugPercent(other)
update percentage panel

**Kind**: instance method of <code>[Update](#Update)</code>  

| Param | Type | Description |
| --- | --- | --- |
| other | <code>number</code> | time |


* * *

Copyright (c) 2016 YOPEY YOPEY LLC - MIT License - Documented by [jsdoc-to-markdown](https://github.com/75lb/jsdoc-to-markdown)