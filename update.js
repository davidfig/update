/**
 * @file update.js
 * @author David Figatner
 * @license MIT
 * @copyright YOPEY YOPEY LLC 2016
 * {@link https://github.com/davidfig/update}
 */

// placeholder for yy-debug ({@link http://github.com/davidfig/debug})
let Debug;

let FPS = 60;
let _list = [];
let _pause = false;
let _pauseRegistrations = [];
let _pauseElapsed = 0;

let _startTime = 0;
let _frameNumber = 0;
let _lastUpdate = 0;
let _lastFPS = '--';

let _tolerance = 1;

let _maxChange = 100;

let _panels = {fps: null, meter: null, percent: null};
let _percentageList = [];

let _updateOff;
let _debug;

// this is the number of entries to use in a rolling average to smooth the debug percentages
let _rollingAverage = 500;

let _updateRemove;
let _lastCount;
let _onLoop;

/**
 * must call init() before using Update
 * @param {object} [options]
 * @param {object} [options.Debug] pass Debug from github.com/davidfig/debug
 * @param {boolean|string} [options.count] - show debug counts (can supply side for panel, e.g., 'topleft')
 * @param {boolean|string} [options.percent] - show debug percentage
 * @param {boolean|string} [options.FPS] - show debug FPS
 * @param {function} [options.onLoop] call at end of update loop
 */
function init(options)
{
    options = options || {};
    window.addEventListener('blur', pauseGame);
    window.addEventListener('focus', resumeGame);
    if (options.debug)
    {
        Debug = options.debug;
        _debug = {count: options.count, percent: options.percent, FPS: options.FPS};
        _debugInit();
    }
    _onLoop = options.onLoop;
}

/**
 * register functions to call after Update pauses or resumes
 * @param {Function} pause
 * @param {Function} resume
 */
function registerPause(pause, resume)
{
    _pauseRegistrations.push({ pause: pause, resume: resume});
}

/**
 * pauses all updates
 */
function pauseGame()
{
    if (_pause !== true)
    {
        _pause = true;
        _pauseElapsed = performance.now() - _lastUpdate;
        _updateOff = false;
        if (_debug)
        {
            _debugPause();
        }
        for (var i = 0; i < _pauseRegistrations.length; i++)
        {
            _pauseRegistrations[i].pause();
        }
    }
}

/**
 * resumes all updates
 */
function resumeGame()
{
    if (_pause === true)
    {
        _pause = false;
        _lastUpdate = performance.now() - _pauseElapsed;
        if (_debug && _debug.FPS)
        {
            _startTime = 0;
            _frameNumber = 0;
            _lastUpdate = 0;
            _lastFPS = '--';
        }
        for (let i = 0; i < _pauseRegistrations.length; i++)
        {
            _pauseRegistrations[i].resume();
        }
        if (_updateOff === true)
        {
            update();
        }
    }
}

/**
 * loops through all updates
 * @param {number} elapsed in milliseconds
 * @private
 */
function _updateAll(elapsed)
{
    _updateRemove = [];
    let i = 0, _i = _list.length;
    let other = 0, count = 0;
    while (i < _i)
    {
        const entry = _list[i++];
        if (entry.pause)
        {
            continue;
        }
        if (entry.duration !== 0)
        {
            entry.elapsed += elapsed;
            if (entry.elapsed < entry.duration)
            {
                if (_debug && _debug.percent && entry.options.percent)
                {
                    const change = _percentageList[entry.options.percent];
                    change.amounts[change.current++] = 0;
                    if (change.current === _rollingAverage)
                    {
                        change.current = 0;
                    }
                }
                continue;
            }
            else
            {
                entry.elapsed = 0;
            }
        }
        let start, result;
        if (_debug && _debug.percent)
        {
            start = performance.now();
            result = entry.callback(elapsed, entry.options);
            var current = performance.now() - start;
            if (entry.options.percent)
            {
                const change = _percentageList[entry.options.percent];
                change.amounts[change.current++] = current;
                if (change.current === _rollingAverage)
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
            result = entry.callback(elapsed, entry.options);
        }
        if (entry.once || result)
        {
            i--;
            _i--;
            _list.splice(i, 1);
        }
        count++;
    }
    if (_debug)
    {
        if (_debug.count && _lastCount !== count)
        {
            Debug.one(count + ' updates', {panel: _panels.count});
            _lastCount = count;
        }
        if (_debug.percent)
        {
            _debugPercent(other);
        }
    }
    while (_updateRemove.length)
    {
        _remove(_updateRemove.pop());
    }
    _updateRemove = null;
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
function add(funct, options)
{
    options = options || {};
    const time = options.time || (options.FPS ? 1000 / options.FPS : 0);
    const update = {callback: funct, options: options, duration: time, elapsed: 0, once: options.once, pause: false};
    _list.push(update);
    if (_debug && options.percent)
    {
        _percentageList[options.percent] = {current: 0, amounts: []};
        let test = '';
        for (let key in _percentageList)
        {
            test += key + ': --%<br>';
        }
        Debug.one(test, {panel: _panels.percent});
        Debug.resize();
    }
    return update;
}

/**
 * removes all updates and clears the percentage list
 */
function clear()
{
    _list = [];
    if (_debug && _debug.percent)
    {
        _percentageList = {};
        _percentageList['Other'] = {current: 0, amounts: []};
        Debug.resize();
    }
}

/**
 * removes an update from the loop
 * @param {object} update - object returned by add()
 */
function remove(update)
{
    if (update)
    {
        if (_updateRemove)
        {
            _updateRemove.push(update);
        }
        else
        {
            _remove(update);
        }
    }
}

/**
 * removes the update from the loop
 * this does not check whether the update loop is active; use remove() instead
 * @param {object} update - object returned by add()
 * @private
 */
function _remove(update)
{
    const index = _list.indexOf(update);
    if (index !== -1)
    {
        _list.splice(index, 1);
    }
}

/**
 * starts the update loop
 */
function update()
{
    if (_pause === true)
    {
        _updateOff = true;
        return;
    }
    const current = performance.now();
    let elapsed;
    if (_lastUpdate === 0)
    {
        elapsed = 0;
    }
    else
    {
        elapsed = current - _lastUpdate;
        elapsed = elapsed > _maxChange ? _maxChange : elapsed;
    }
    _updateAll(elapsed);
    _lastUpdate = current;
    if (_debug && _debug.FPS)
    {
        _debugUpdate(current);
    }
    if (_onLoop)
    {
        _onLoop();
    }
    requestAnimationFrame(update);
}

/**
 * adds debug panels (uses github.com/davidfig/debug)
 * @private
 */
function _debugInit()
{
    if (_debug.FPS)
    {
        _panels.fps = Debug.add('FPS', {text: '-- FPS'});
        _panels.meter = Debug.addMeter('panel');
    }
    if (_debug.count)
    {
        _panels.count = Debug.add('Updates', {text: '0 updates'});
    }
    if (_debug.percent)
    {
        _panels.percent = Debug.add('percentages', {style: {textAlign: 'right'}});
        _percentageList['Other'] = {current: 0, amounts: []};
    }
}

/**
 * pause debug
 * @private
 */
function _debugPause()
{
    if (_debug.FPS)
    {
        Debug.one('-- FPS', {panel: _panels.fps});
    }
}

/**
 * update debug panels
 * @param {number} current time
 * @private
 */
function _debugUpdate(current)
{
    _frameNumber++;
    const currentTime = performance.now() - _startTime;

    // skip the first half second to get rid of garbage
    if (currentTime > 500)
    {
        if (_startTime !== 0)
        {
            _lastFPS = Math.floor(_frameNumber / (currentTime / 1000));
            if (_lastFPS >= FPS - _tolerance && _lastFPS <= FPS + _tolerance)
            {
                _lastFPS = FPS;
            }
        }
        _startTime = performance.now();
        _frameNumber = 0;
    }
    Debug.one(_lastFPS + ' FPS', {panel: _panels.fps});
    const time = performance.now() - current;
    const expected = (16.7 - time) / 16.7;
    Debug.meter(expected, {panel: _panels.meter});
}

/**
 * update percentage panel
 * @param {number} other time
 * @private
 */
function _debugPercent(other)
{
    const change = _percentageList['Other'];
    change.amounts[change.current++] = other;
    change.current %= _rollingAverage;
    let updates = [], all = 0;
    for (let name in _percentageList)
    {
        const change = _percentageList[name];
        let total = 0;
        for (let i = 0; i < change.amounts.length; i++)
        {
            total += change.amounts[i];
        }
        total /= change.amounts.length;
        all += total;
        updates.push({name: name, total: total});
    }
    let result = '';
    for (let i = 1; i < updates.length; i++)
    {
        const update = updates[i];
        result += update.name + ': ' + Math.round(update.total / all * 100) + '%<br>';
    }
    const update = updates[0];
    result += update.name + ': ' + (all === 0 ? '100' : Math.round(update.total / all * 100)) + '%<br>';
    Debug.one(result, {panel: _panels.percent});
}

module.exports = {
    init,
    registerPause,
    pauseGame,
    resumeGame,
    add,
    clear,
    remove,
    update
};

/* globals performance, requestAnimationFrame */