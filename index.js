const Debug = require('yy-debug');
const Update = require('../update/update.js');

// initialize debug panels to track progress
Debug.init();
var loop = Debug.add('loop', {text: 'looping', panels: 'Looping'});

// initialize update loop with debug options
Update.init({debug: Debug, percent: true, FPS: true, count: true, onLoop: function() { Debug.one('looping: ' + Math.random(), {panel: loop}); } });

// add a call to testRandom every 100 MS and show it in Random Numbers debug panel
var randomLoop = Update.add(testRandom, {time: 100, percent: 'Random Numbers'});
var random = Debug.add('random', {text: '0', panels: 'Random'});
var randomLoopRemove = false;

// add a call to testPI every update and track it in PI Calculation debug panel
Update.add(testPI, {percent: 'PI Multiplication'});

// add a call to testDelay (tracked automatically in Other debug panel)
Update.add(testDelay);

// start update loop
Update.update();

function testRandom()
{
    Debug.one(Math.random(), {panel: random});
    if (randomLoopRemove)
    {
        Update.remove(randomLoop);
        randomLoop = null;
        randomLoopRemove = false;
    }
}

function otherRandom()
{
    Debug.one(Math.random(), {panel: random});
}

function testPI()
{
    let test = Math.pow(Math.PI, 100); // eslint-disable-line
}

function testDelay()
{
    let test = 0; // eslint-disable-line
    for (var i = 0; i < 100000; i++)
    {
        test += i * 3;
    }
}

// 'c' clears all updates
// 'a' adds an update
let multiplication = 1;
document.body.addEventListener('keypress',
    function(e)
    {
        const code = (typeof e.which === 'number') ? e.which : e.keyCode;
        if (code === 99) // c
        {
            Update.clear();
        }
        else if (code === 97) // a
        {
            Update.add(otherRandom, {percent: 'Random - '  + multiplication++});
        }
        else if (code == 98) // b
        {
            if (randomLoop)
            {
                randomLoopRemove = true;
            }
            else
            {
                randomLoop = Update.add(testRandom, {time: 100, percent: 'Random Numbers'});
            }
        }
    }
);

Debug.log('______Tests______<br>Press A to add an update<br>Press B to add/remove the random update during the update loop<br>Press C to clear the Random updates')

// shows the code in the demo
window.onload = function()
{
    var client = new XMLHttpRequest();
    client.open('GET', 'index.js');
    client.onreadystatechange = function()
    {
        var code = document.getElementById('code');
        code.innerHTML = client.responseText;
        require('highlight.js').highlightBlock(code);
    }
    client.send();
};

// for eslint
/* global document, window, XMLHttpRequest */