/**
 * @file update.js
 * @author David Figatner
 * @license MIT
 * @copyright YOPEY YOPEY LLC 2016
 * {@link https://github.com/davidfig/update}
 */

// placeholder for yy-debug ({@link http://github.com/davidfig/debug})
let Debug;

/**
 * @description
 * update loop API for javascript apps
 * @example
 * const Update = require('yy-update');
 *
 * // initialize update loop
 * Update.init();
 *
 * // add a call to testPI every 100 ms
 * Update.add(testPI, {time: 100});
 *
 * // add a call to testDelay
 * Update.add(testDelay);
 *
 * // start update loop
 * Update.update();
 *
 * function testPI()
 * {
 *    var test = Math.pow(Math.PI, 100);
 * }
 *
 * function testDelay()
 * {
 *    var test = 0;
 *    for (var i = 0; i < 100000; i++)
 *    {
 *        test += i * 3;
 *    }
 * }
 */
class Update
{
    constructor()
    {
        this.list = [];
        this.FPS = 60;
        this.pause = false;
        this.pauseRegistrations = [];
        this.pauseElapsed = 0;

        this.startTime = 0;
        this.frameNumber = 0;
        this.lastUpdate = 0;
        this.lastFPS = '--';

        this.tolerance = 1;

        this.maxChange = 100;

        this.panels = {fps: null, meter: null, percent: null};
        this.percentageList = [];

        // this is the number of entries to use in a rolling average to smooth the debug percentages
        this.rollingAverage = 500;
    }

    /**
     * must call this.init before using Update
     * @param {object} [options]
     * @param {object} [options.Debug] pass Debug from github.com/davidfig/debug
     * @param {boolean|string} [options.count] - show debug counts (can supply side for panel, e.g., 'topleft')
     * @param {boolean|string} [options.percent] - show debug percentage
     * @param {boolean|string} [options.FPS] - show debug FPS
     * @param {function} [options.onLoop] call at end of update loop
     */
    init(options)
    {
        options = options || {};
        this.checkVisibility();
        this.FPSActual = 1000 / this.FPS;
        if (options.debug)
        {
            Debug = options.debug;
            this.debug = {count: options.count, percent: options.percent, FPS: options.FPS};
            this._debugInit();
        }
        this.onLoop = options.onLoop;
    }

    /**
     * register functions to call after Update pauses or resumes
     * @param {Function} pause
     * @param {Function} resume
     */
    registerPause(pause, resume)
    {
        this.pauseRegistrations.push({ pause: pause, resume: resume});
    }

    /**
     * pauses all updates
     */
    pauseGame()
    {
        if (this.pause !== true)
        {
            this.pause = true;
            this.pauseElapsed = performance.now() - this.lastUpdate;
            this.updateOff = false;
            if (this.debug)
            {
                this._debugPause();
            }
            for (var i = 0; i < this.pauseRegistrations.length; i++)
            {
                this.pauseRegistrations[i].pause();
            }
        }
    }

    /**
     * resumes all updates
     */
    resumeGame()
    {
        if (this.pause === true)
        {
            this.pause = false;
            this.lastUpdate = performance.now() - this.pauseElapsed;
            if (Debug && this.debug && this.debug.FPS)
            {
                this.startTime = 0;
                this.frameNumber = 0;
                this.lastUpdate = 0;
                this.lastFPS = '--';
            }
            for (var i = 0; i < this.pauseRegistrations.length; i++)
            {
                this.pauseRegistrations[i].resume();
            }
            if (this.updateOff === true)
            {
                this.update();
            }
        }
    }

    /**
     * loops through all updates
     * @param {number} elapsed in milliseconds
     * @private
     */
    _updateAll(elapsed)
    {
        var i = 0, _i = this.list.length;
        var other = 0, count = 0;
        while (i < _i)
        {
            var update = this.list[i++];
            if (update.pause)
            {
                continue;
            }
            if (update.duration !== 0)
            {
                update.elapsed += elapsed;
                if (update.elapsed < update.duration)
                {
                    if (this.debug && this.debug.percent && update.options.percent)
                    {
                        var change = this.percentageList[update.options.percent];
                        change.amounts[change.current++] = 0;
                        if (change.current === this.rollingAverage)
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
            if (this.debug && this.debug.percent)
            {
                start = performance.now();
                result = update.callback(elapsed, update.options);
                var current = performance.now() - start;
                if (update.options.percent)
                {
                    var change = this.percentageList[update.options.percent];
                    change.amounts[change.current++] = current;
                    if (change.current === this.rollingAverage)
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
                this.list.splice(i, 1);
            }
            count++;
        }
        if (this.debug)
        {
            if (this.debug.count && this.lastCount !== count)
            {
                Debug.one(count + ' updates', {panel: this.panels.count});
                this.lastCount = count;
            }
            if (this.debug.percent)
            {
                this._debugPercent(other);
            }
        }
    }

    /**
     * adds a function to the update loop
     * @param {Function} funct
     * @param {object} [options]
     * @param {number} [options.time=0] in milliseconds to call this function
     * @param {number} [options.FPS] - this replaces options.time and calls the function at the desired FPS
     * @param {boolean} [options.once=false] - call only once and then remove from update queue
     * @param {string} [options.percent] - name to track the percentage in the debug panel
     */
    add(funct, options)
    {
        options = options || {};
        var time = options.time || (options.FPS ? 1000 / options.FPS : 0);
        var update = {callback: funct, options: options, duration: time, elapsed: 0, once: options.once, pause: false};
        this.list.push(update);
        if (this.debug && options.percent)
        {
            this.percentageList[options.percent] = {current: 0, amounts: []};
            var test = '';
            for (var key in this.percentageList)
            {
                test += key + ': --%<br>';
            }
            Debug.one(test, {panel: this.panels.percent});
            Debug.resize();
        }
        return update;
    }

    /**
     * removes an update from the loop
     * @param {object} update - object returned by this.add()
     */
    remove(update)
    {
        if (update)
        {
            var index = this.list.indexOf(update);
            if (index !== -1)
            {
                this.list.splice(index, 1);
            }
        }
    }

    /**
     * starts the update loop
     */
    update()
    {
        if (this.pause === true)
        {
            this.updateOff = true;
            return;
        }
        var current = performance.now();
        var elapsed;
        if (this.lastUpdate === 0)
        {
            elapsed = 0;
        }
        else
        {
            elapsed = current - this.lastUpdate;
            elapsed = elapsed > this.maxChange ? this.maxChange : elapsed;
        }
        if (this.FPS === 60 || elapsed === 0 || elapsed >= this.FPSActual)
        {
            if (this.list.length)
            {
                this._updateAll(elapsed);
            }
            this.lastUpdate = current;
            if (this.debug && this.debug.FPS)
            {
                this._debugUpdate(current);
            }
        }
        if (this.onLoop)
        {
            this.onLoop();
        }
        if (typeof requestAnimationFrame === 'function')
        {
            requestAnimationFrame(this.update.bind(this));
        }
        else
        {
            setTimeout(this.update.bind(this), this.FPSActual);
        }
    }

    /**
     * Starts a page visibility event listener running, or window.onpagehide/onpageshow if not supported by the browser. Also listens for window.onblur and window.onfocus.
     * based on Phaser: https://github.com/photonstorm/phaser (MIT license)
     * @private
     */
    checkVisibility()
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
            document.addEventListener(hiddenVar, this.visibilityChange.bind(this), false);
        }

        window.onblur = this.visibilityChange.bind(this);
        window.onfocus = this.visibilityChange.bind(this);

        window.onpagehide = this.visibilityChange.bind(this);
        window.onpageshow = this.visibilityChange.bind(this);
    }

    /**
     * Callback for checkVisibility()
     * based on Phaser: https://github.com/photonstorm/phaser (MIT license)
     * @private
     */
    visibilityChange(event)
    {
        if (event.type === 'pagehide' || event.type === 'blur' || event.type === 'pageshow' || event.type === 'focus')
        {
            if (event.type === 'pagehide' || event.type === 'blur')
            {
                this.pauseGame();
            }
            else if (event.type === 'pageshow' || event.type === 'focus')
            {
                this.resumeGame(event);
            }
            return;
        }

        if (document.hidden || document.mozHidden || document.msHidden || document.webkitHidden || event.type === 'pause')
        {
            this.pauseGame(event);
        }
    }

    /**
     * adds debug panels (uses github.com/davidfig/debug)
     * @private
     */
    _debugInit()
    {
        if (this.debug.FPS)
        {
            this.panels.fps = Debug.add('FPS', {text: '-- FPS'});
            this.panels.meter = Debug.addMeter('panel');
        }
        if (this.debug.count)
        {
            this.panels.count = Debug.add('Updates', {text: '0 updates'});
        }
        if (this.debug.percent)
        {
            this.panels.percent = Debug.add('percentages', {style: {textAlign: 'right'}});
            this.percentageList['Other'] = {current: 0, amounts: []};
        }
    }

    /**
     * pause debug
     * @private
     */
    _debugPause()
    {
        if (this.debug.FPS)
        {
            Debug.one('-- FPS', {panel: this.panels.fps});
        }
    }

    /**
     * update debug panels
     * @param {number} current time
     * @private
     */
    _debugUpdate(current)
    {
        this.frameNumber++;
        var currentTime = performance.now() - this.startTime;

        // skip the first half second to get rid of garbage
        if (currentTime > 500)
        {
            if (this.startTime !== 0)
            {
                this.lastFPS = Math.floor(this.frameNumber / (currentTime / 1000));
                if (this.lastFPS >= 60 - this.tolerance && this.lastFPS <= 60 + this.tolerance)
                {
                    this.lastFPS = 60;
                }
            }
            this.startTime = performance.now();
            this.frameNumber = 0;
        }
        Debug.one(this.lastFPS + ' FPS', {panel: this.panels.fps});
        var time = performance.now() - current;

        // 16.7 is hard coded for 60 FPS. Probably should figure out the real amount for the current FPS
        var expected = (16.7 - time) / 16.7;
        Debug.meter(expected, {panel: this.panels.meter});
    }

    /**
     * update percentage panel
     * @param {number} other time
     * @private
     */
    _debugPercent(other)
    {
        var change = this.percentageList['Other'];
        change.amounts[change.current++] = other;
        change.current %= this.rollingAverage;
        var updates = [], all = 0;
        for (var name in this.percentageList)
        {
            var change = this.percentageList[name];
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
        Debug.one(result, {panel: this.panels.percent});
    }
}

module.exports = new Update();

// for eslint
/* globals performance, requestAnimationFrame, setTimeout, window, document */