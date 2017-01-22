## update.js
update loop API for javascript apps

## Live Example with Source
https://davidfig.github.io/update/

## Installation

    npm install yy-update

# API Reference
## Functions

<dl>
<dt><a href="#init">init([options])</a></dt>
<dd><p>must call init() before using Update</p>
</dd>
<dt><a href="#registerPause">registerPause(pause, resume)</a></dt>
<dd><p>register functions to call after Update pauses or resumes</p>
</dd>
<dt><a href="#pauseGame">pauseGame()</a></dt>
<dd><p>pauses all updates</p>
</dd>
<dt><a href="#resumeGame">resumeGame()</a></dt>
<dd><p>resumes all updates</p>
</dd>
<dt><a href="#add">add(funct, [options])</a></dt>
<dd><p>adds a function to the update loop</p>
</dd>
<dt><a href="#clear">clear()</a></dt>
<dd><p>removes all updates and clears the percentage list</p>
</dd>
<dt><a href="#remove">remove(update)</a></dt>
<dd><p>removes an update from the loop</p>
</dd>
<dt><a href="#update">update()</a></dt>
<dd><p>starts the update loop</p>
</dd>
</dl>

<a name="init"></a>

## init([options])
must call init() before using Update

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>object</code> |  |
| [options.Debug] | <code>object</code> | pass Debug from github.com/davidfig/debug |
| [options.count] | <code>boolean</code> &#124; <code>string</code> | show debug counts (can supply side for panel, e.g., 'topleft') |
| [options.percent] | <code>boolean</code> &#124; <code>string</code> | show debug percentage |
| [options.FPS] | <code>boolean</code> &#124; <code>string</code> | show debug FPS |
| [options.onLoop] | <code>function</code> | call at end of update loop |

<a name="registerPause"></a>

## registerPause(pause, resume)
register functions to call after Update pauses or resumes

**Kind**: global function  

| Param | Type |
| --- | --- |
| pause | <code>function</code> | 
| resume | <code>function</code> | 

<a name="pauseGame"></a>

## pauseGame()
pauses all updates

**Kind**: global function  
<a name="resumeGame"></a>

## resumeGame()
resumes all updates

**Kind**: global function  
<a name="add"></a>

## add(funct, [options])
adds a function to the update loop

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| funct | <code>function</code> |  |  |
| [options] | <code>object</code> |  |  |
| [options.time] | <code>number</code> | <code>0</code> | in milliseconds to call this function |
| [options.FPS] | <code>number</code> |  | this replaces options.time and calls the function at the desired FPS |
| [options.once] | <code>boolean</code> | <code>false</code> | call only once and then remove from update queue |
| [options.percent] | <code>string</code> |  | name to track the percentage in the debug panel |

<a name="clear"></a>

## clear()
removes all updates and clears the percentage list

**Kind**: global function  
<a name="remove"></a>

## remove(update)
removes an update from the loop

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| update | <code>object</code> | object returned by add() |

<a name="update"></a>

## update()
starts the update loop

**Kind**: global function  

* * *

Copyright (c) 2017 YOPEY YOPEY LLC - MIT License - Documented by [jsdoc-to-markdown](https://github.com/75lb/jsdoc-to-markdown)