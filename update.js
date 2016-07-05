/*
    update.js <https://github.com/davidfig/update>
    License: MIT license <https://github.com/davidfig/update/license>
    Author: David Figatner
    Copyright (c) 2016 YOPEY YOPEY LLC
*/ ;(function(){

var list = [];
var FPS = 60;
var FPSActual;
var pause = false;
var pauseRegistrations = [];
var pauseElapsed = 0;

var startTime = 0;
var frameNumber = 0;
var lastUpdate = 0;
var lastFPS = '--';

var tolerance = 1;

var maxChange = 100;

var panels = {fps: null, meter: null, percent: null};
var percentageList = [];
var lastCount;

var DEBUG = false;

// this creates a rolling average using 500 entries to smooth the debug percentages
var rollingAverage = 500;

// initialize Update
// options: {}
//  debug {boolean} whether to turn on debug support (requires github.com/davidfig/debug)
function init(options)
{
    options = options || {};
    checkVisibility();
    FPSActual = 1000 / FPS;
    if (options.debug)
    {
        DEBUG = true;
        debugInit();
    }
}

// register functions to call after Update pauses or resumes
function registerPause(pause, resume)
{
    pauseRegistrations.push({ pause: pause, resume: resume});
}

function pauseGame()
{
    if (pause !== true)
    {
        pause = true;
        pauseElapsed = performance.now() - lastUpdate;
        updateOff = false;
        if (DEBUG)
        {
            debugPause();
        }
        for (var i = 0; i < pauseRegistrations.length; i++)
        {
            pauseRegistrations[i].pause();
        }
    }
}

function resumeGame()
{
    if (pause === true)
    {
        pause = false;
        lastUpdate = performance.now() - pauseElapsed;
        fpsReset();
        for (var i = 0; i < pauseRegistrations.length; i++)
        {
            pauseRegistrations[i].resume();
        }
        if (updateOff === true)
        {
            update();
        }
    }
}

function fpsReset()
{
    startTime = 0;
    frameNumber = 0;
    lastUpdate = 0;
    lastFPS = '--';
}

function updateOther(elapsed)
{
    var i = 0, _i = list.length;
    var total = 0, other = 0, updates = [], count = 0;
    while (i < _i)
    {
        var update = list[i++];
        if (update.pause)
        {
            continue;
        }
        if (update.duration !== 0)
        {
            update.elapsed += elapsed;
            if (update.elapsed < update.duration)
            {
                if (update.params.percent)
                {
                    var change = percentageList[update.params.percent];
                    change.amounts[change.current++] = 0;
                    if (change.current === rollingAverage)
                    {
                        change.current = 0;
                    }
                }
                continue;
            }
            else
            {
                update.elapsed = 0;
            }
        }
        var start, result;
        if (DEBUG && panels.percent)
        {
            start = performance.now();
            result = update.callback(elapsed, update.params);
            current = performance.now() - start;
            if (update.params.percent)
            {
                var change = percentageList[update.params.percent];
                change.amounts[change.current++] = current;
                if (change.current === rollingAverage)
                {
                    change.current = 0;
                }
            }
            else
            {
                other += current;
            }
            total += current;
        }
        else
        {
            result = update.callback(elapsed, update.params);
        }
        if (update.once || result)
        {
            i--;
            _i--;
            list.splice(i, 1);
        }
        count++;
    }
    if (DEBUG)
    {
        if (lastCount !== count)
        {
            debugOne(count + ' updates', {panel: panels.count});
            lastCount = count;
        }
        if (panels.percent)
        {
            debugPercent(other);
        }
    }
}

// Add a function to the update loop with a desired FPS
// params:
//   once: true or false -- call function only once
//   percent: track percentages in a davidfig/Debug panel
function addFPS(funct, fps, params)
{
    return add(funct, 1000 / fps, params);
}

// Add a function to the update loop ever time MS
// params:
//   once: true or false -- call function only once
//   percent: track percentages in a davidfig/Debug panel
function add(funct, time, params)
{
    time = time || 0;
    params = params || {};
    var update = {callback: funct, params: params, duration: time, elapsed: 0, once: params.once, pause: false};
    list.push(update);
    if (DEBUG && params.percent)
    {
        percentageList[params.percent] = {current: 0, amounts: []};
        var test = '';
        for (var key in percentageList)
        {
            test += key + ': --%<br>';
        }
        debugOne(test, {panel: panels.percent});
        Debug.resize();
    }
    return update;
}

// removes an update from the loop
// update is the object returned by Update.add() or Update.addFPS()
function remove(update)
{
    for (var i = 0, _i = list.length; i < _i; i++)
    {
        if (list[i] === update)
        {
            list.splice(i, 1);
            return;
        }
    }
}

// starts the update loop
function update()
{
    if (pause === true)
    {
        updateOff = true;
        return;
    }
    var current = performance.now();
    var elapsed;
    if (lastUpdate === 0)
    {
        elapsed = 0;
    }
    else
    {
        elapsed = current - lastUpdate;
        elapsed = elapsed > maxChange ? maxChange : elapsed;
    }
    if (FPS === 60 || elapsed === 0 || elapsed >= FPSActual)
    {
        if (list.length)
        {
            updateOther(elapsed);
        }
        lastUpdate = current;
        if (debug)
        {
            debugUpdate(current);
        }
    }
    if (typeof requestAnimationFrame === 'function')
    {
        requestAnimationFrame(update);
    }
    else
    {
        setTimeout(update, FPSActual);
    }
}

//
// Starts a page visibility event listener running, or window.onpagehide/onpageshow if not supported by the browser.
// Also listens for window.onblur and window.onfocus.
// based on Phaser: https://github.com/photonstorm/phaser (MIT license)
function checkVisibility()
{
    var hiddenVar;
    if (document.webkitHidden !== undefined)
    {
        hiddenVar = 'webkitvisibilitychange';
    }
    else if (document.mozHidden !== undefined)
    {
        hiddenVar = 'mozvisibilitychange';
    }
    else if (document.msHidden !== undefined)
    {
        hiddenVar = 'msvisibilitychange';
    }
    else if (document.hidden !== undefined)
    {
        hiddenVar = 'visibilitychange';
    }
    else
    {
        hiddenVar = null;
    }

    //  Does browser support it? If not (like in IE9 or old Android) we need to fall back to blur/focus
    if (hiddenVar)
    {
        document.addEventListener(hiddenVar, visibilityChange, false);
    }

    window.onblur = visibilityChange;
    window.onfocus = visibilityChange;

    window.onpagehide = visibilityChange;
    window.onpageshow = visibilityChange;
}

// Callback for checkVisibility()
// based on Phaser: https://github.com/photonstorm/phaser (MIT license)
function visibilityChange(event)
{
    if (event.type === 'pagehide' || event.type === 'blur' || event.type === 'pageshow' || event.type === 'focus')
    {
        if (event.type === 'pagehide' || event.type === 'blur')
        {
            pauseGame();
        }
        else if (event.type === 'pageshow' || event.type === 'focus')
        {
            resumeGame(event);
        }
        return;
    }

    if (document.hidden || document.mozHidden || document.msHidden || document.webkitHidden || event.type === "pause")
    {
        pauseGame(event);
    }
}

// add an FPS panel and meter
function debugInit()
{
    panels.fps = Debug.add('FPS', {text: '-- FPS'});
    panels.meter = Debug.addMeter('panel');
    panels.count = Debug.add('Updates', {text: '0 updates'});
    panels.percent = Debug.add('percentages', {style: {textAlign: 'right'}});
    percentageList['Other'] = {current: 0, amounts: []};
}

function debugPause()
{
    debugOne('-- FPS', {panel: panels.fps});
}

function debugUpdate(current)
{
    frameNumber++;
    var currentTime = performance.now() - startTime;

    // skip the first half second to get rid of garbage
    if (currentTime > 500)
    {
        if (startTime !== 0)
        {
            lastFPS = Math.floor(frameNumber / (currentTime / 1000));
            if (lastFPS >= 60 - tolerance && lastFPS <= 60 + tolerance)
            {
                lastFPS = 60;
            }
        }
        startTime = performance.now();
        frameNumber = 0;
    }
    debugOne(lastFPS + ' FPS', {panel: panels.fps});
    var time = performance.now() - current;

// TODO: 16.7 is hard coded for 60 FPS. Probably should figure out the real amount for the current FPS
    var expected = (16.7 - time) / 16.7;
    Debug.meter(expected, {panel: panels.meter});
}

function debugPercent(other)
{
    var change = percentageList['Other'];
    change.amounts[change.current++] = other;
    change.current %= rollingAverage;
    var updates = [], all = 0;
    for (var name in percentageList)
    {
        var change = percentageList[name];
        var total = 0;
        for (var i = 0; i < change.amounts.length; i++)
        {
            total += change.amounts[i];
        }
        total /= change.amounts.length;
        all += total;
        updates.push({name: name, total: total});
    }
    var result = '';
    for (var i = 1; i < updates.length; i++)
    {
        var update = updates[i];
        result += update.name + ': ' + Math.round(update.total / all * 100) + '%<br>';
    }
    var update = updates[0];
    result += update.name + ': ' + Math.round(update.total / all * 100) + '%<br>';
    debugOne(result, {panel: panels.percent});
}

// exports
var Update = {
    init: init,
    add: add,
    update: update,
    remove: remove,
    registerPause: registerPause,
    pauseGame: pauseGame,
    resumeGame: resumeGame
};

// add support for AMD (Asynchronous Module Definition) libraries such as require.js.
if (typeof define === 'function' && define.amd)
{
    define(function()
    {
        return {
            Update: Update
        };
    });
}

// add support for CommonJS libraries such as browserify.
if (typeof exports !== 'undefined')
{
    exports.Update = Update;
}

// define globally in case AMD is not available or available but not used
if (typeof window !== 'undefined')
{
    window.Update = Update;
}   })();