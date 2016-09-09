/*
    update.js <https://github.com/davidfig/update>
    License: MIT license <https://github.com/davidfig/update/license>
    Author: David Figatner
    Copyright (c) 2016 YOPEY YOPEY LLC
*/

/* globals Debug, debugOne, performance, requestAnimationFrame, setTimeout, window, define, document */
var Update = {

    list: [],
    FPS: 60,
    pause: false,
    pauseRegistrations: [],
    pauseElapsed: 0,

    startTime: 0,
    frameNumber: 0,
    lastUpdate: 0,
    lastFPS: '--',

    tolerance: 1,

    maxChange: 100,

    panels: {fps: null, meter: null, percent: null},
    percentageList: [],

    // this is the number of entries to use in a rolling average to smooth the debug percentages
    rollingAverage: 500,

    /**
     * must call Update.init before using Update
     * @param {boolean} debug - whether to turn on debug support (requires github.com/davidfig/debug)
     * @param {boolean=false|string} count - show debug counts (can supply side for panel, e.g., 'topleft')
     * @param {boolean=false|string} percent - show debug percentage
     * @param {boolean=false|string} FPS - show debug FPS
     */
    init: function(options)
    {
        options = options || {};
        Update.checkVisibility();
        Update.FPSActual = 1000 / Update.FPS;
        if (options.debug)
        {
            Update.debug = {count: options.count, percent: options.percent, FPS: options.FPS};
            Update._debugInit();
        }
    },

    /**
     * register functions to call after Update pauses or resumes
     * @param {Function} pause
     * @param {Function} resume
     */
    registerPause: function(pause, resume)
    {
        Update.pauseRegistrations.push({ pause: pause, resume: resume});
    },

    /**
     * pauses all updates
     */
    pauseGame: function()
    {
        if (Update.pause !== true)
        {
            Update.pause = true;
            Update.pauseElapsed = performance.now() - Update.lastUpdate;
            Update.updateOff = false;
            if (Update.debug)
            {
                Update.debugPause();
            }
            for (var i = 0; i < Update.pauseRegistrations.length; i++)
            {
                Update.pauseRegistrations[i].pause();
            }
        }
    },

    /**
     * resumes all updates
     */
    resumeGame: function()
    {
        if (Update.pause === true)
        {
            Update.pause = false;
            Update.lastUpdate = performance.now() - Update.pauseElapsed;
            if (Update.debug.FPS)
            {
                Update.startTime = 0;
                Update.frameNumber = 0;
                Update.lastUpdate = 0;
                Update.lastFPS = '--';
            }
            for (var i = 0; i < Update.pauseRegistrations.length; i++)
            {
                Update.pauseRegistrations[i].resume();
            }
            if (Update.updateOff === true)
            {
                Update.update();
            }
        }
    },

    /**
     * loops through all updates
     */
    _updateAll: function(elapsed)
    {
        var i = 0, _i = Update.list.length;
        var other = 0, count = 0;
        while (i < _i)
        {
            var update = Update.list[i++];
            if (update.pause)
            {
                continue;
            }
            if (update.duration !== 0)
            {
                update.elapsed += elapsed;
                if (update.elapsed < update.duration)
                {
                    if (Update.debug.percent && update.options.percent)
                    {
                        var change = Update.percentageList[update.options.percent];
                        change.amounts[change.current++] = 0;
                        if (change.current === Update.rollingAverage)
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
            if (Update.debug && Update.debug.percent)
            {
                start = performance.now();
                result = update.callback(elapsed, update.options);
                var current = performance.now() - start;
                if (update.options.percent)
                {
                    var change = Update.percentageList[update.options.percent];
                    change.amounts[change.current++] = current;
                    if (change.current === Update.rollingAverage)
                    {
                        change.current = 0;
                    }
                }
                else
                {
                    other += current;
                }
            }
            else
            {
                result = update.callback(elapsed, update.options);
            }
            if (update.once || result)
            {
                i--;
                _i--;
                Update.list.splice(i, 1);
            }
            count++;
        }
        if (Update.debug)
        {
            if (Update.debug.count && Update.lastCount !== count)
            {
                debugOne(count + ' updates', {panel: Update.panels.count});
                Update.lastCount = count;
            }
            if (Update.debug.percent)
            {
                Update._debugPercent(other);
            }
        }
    },

    /**
     * adds a function to the update loop
     * @param {Function} funct
     * @param {object} options
     * @param {number=0} options.time in milliseconds to call this function
     * @param {number=} options.FPS - this replaces options.time and calls the function at the desired FPS
     * @param {boolean=false} options.once - call only once and then remove from update queue
     * @param {string=} options.percent - name to track the percentage in the debug panel
     */
    add: function(funct, options)
    {
        options = options || {};
        var time = options.time || (options.FPS ? 1000 / options.FPS : 0);
        var update = {callback: funct, options: options, duration: time, elapsed: 0, once: options.once, pause: false};
        Update.list.push(update);
        if (Update.debug && options.percent)
        {
            Update.percentageList[options.percent] = {current: 0, amounts: []};
            var test = '';
            for (var key in Update.percentageList)
            {
                test += key + ': --%<br>';
            }
            debugOne(test, {panel: Update.panels.percent});
            Debug.resize();
        }
        return update;
    },

    /**
     * removes an update from the loop
     * @param {object} update - object returned by Update.add()
     */
    remove: function(update)
    {
        var index = Update.list.indexOf(update);
        Update.list.splice(index, 1);
    },

    /**
     * starts the update loop
     */
    update: function()
    {
        if (Update.pause === true)
        {
            Update.updateOff = true;
            return;
        }
        var current = performance.now();
        var elapsed;
        if (Update.lastUpdate === 0)
        {
            elapsed = 0;
        }
        else
        {
            elapsed = current - Update.lastUpdate;
            elapsed = elapsed > Update.maxChange ? Update.maxChange : elapsed;
        }
        if (Update.FPS === 60 || elapsed === 0 || elapsed >= Update.FPSActual)
        {
            if (Update.list.length)
            {
                Update._updateAll(elapsed);
            }
            Update.lastUpdate = current;
            if (Update.debug && Update.debug.FPS)
            {
                Update._debugUpdate(current);
            }
        }
        if (typeof requestAnimationFrame === 'function')
        {
            requestAnimationFrame(Update.update);
        }
        else
        {
            setTimeout(Update.update, Update.FPSActual);
        }
    },

    /**
     * Starts a page visibility event listener running, or window.onpagehide/onpageshow if not supported by the browser. Also listens for window.onblur and window.onfocus.
     * based on Phaser: https://github.com/photonstorm/phaser (MIT license)
     */
    checkVisibility: function()
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
            document.addEventListener(hiddenVar, Update.visibilityChange, false);
        }

        window.onblur = Update.visibilityChange;
        window.onfocus = Update.visibilityChange;

        window.onpagehide = Update.visibilityChange;
        window.onpageshow = Update.visibilityChange;
    },

    /**
     * Callback for checkVisibility()
     * based on Phaser: https://github.com/photonstorm/phaser (MIT license)
     */
    visibilityChange: function(event)
    {
        if (event.type === 'pagehide' || event.type === 'blur' || event.type === 'pageshow' || event.type === 'focus')
        {
            if (event.type === 'pagehide' || event.type === 'blur')
            {
                Update.pauseGame();
            }
            else if (event.type === 'pageshow' || event.type === 'focus')
            {
                Update.resumeGame(event);
            }
            return;
        }

        if (document.hidden || document.mozHidden || document.msHidden || document.webkitHidden || event.type === 'pause')
        {
            Update.pauseGame(event);
        }
    },

    /**
     * adds debug panels (uses github.com/davidfig/debug)
     */
    _debugInit: function()
    {
        if (Update.debug.FPS)
        {
            Update.panels.fps = Debug.add('FPS', {text: '-- FPS'});
            Update.panels.meter = Debug.addMeter('panel');
        }
        if (Update.debug.count)
        {
            Update.panels.count = Debug.add('Updates', {text: '0 updates'});
        }
        if (Update.debug.percent)
        {
            Update.panels.percent = Debug.add('percentages', {style: {textAlign: 'right'}});
            Update.percentageList['Other'] = {current: 0, amounts: []};
        }
    },

    debugPause: function()
    {
        debugOne('-- FPS', {panel: Update.panels.fps});
    },

    _debugUpdate: function(current)
    {
        Update.frameNumber++;
        var currentTime = performance.now() - Update.startTime;

        // skip the first half second to get rid of garbage
        if (currentTime > 500)
        {
            if (Update.startTime !== 0)
            {
                Update.lastFPS = Math.floor(Update.frameNumber / (currentTime / 1000));
                if (Update.lastFPS >= 60 - Update.tolerance && Update.lastFPS <= 60 + Update.tolerance)
                {
                    Update.lastFPS = 60;
                }
            }
            Update.startTime = performance.now();
            Update.frameNumber = 0;
        }
        debugOne(Update.lastFPS + ' FPS', {panel: Update.panels.fps});
        var time = performance.now() - current;

        // 16.7 is hard coded for 60 FPS. Probably should figure out the real amount for the current FPS
        var expected = (16.7 - time) / 16.7;
        Debug.meter(expected, {panel: Update.panels.meter});
    },

    /**
     * update percentage panel
     */
    _debugPercent: function(other)
    {
        var change = Update.percentageList['Other'];
        change.amounts[change.current++] = other;
        change.current %= Update.rollingAverage;
        var updates = [], all = 0;
        for (var name in Update.percentageList)
        {
            var change = Update.percentageList[name];
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
        debugOne(result, {panel: Update.panels.percent});
    }
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
    module.exports = Update;
}

// define globally in case AMD is not available or available but not used
if (typeof window !== 'undefined')
{
    window.Update = Update;
}