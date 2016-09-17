const Debug = require('@yy/debug');
const Update = require('@yy/update');

// initialize debug panels to track progress
Debug.init();

// initialize update loop with debug options
Update.init({debug: Debug, percent: true, FPS: true, count: true});

// add a call to testRandom every 100 MS and show it in Random Numbers debug panel
Update.add(testRandom, {time: 100, percent: 'Random Numbers'});
var random = Debug.add('random', {text: '0', panels: 'Random'});

// add a call to testPI every update and track it in PI Calculation debug panel
Update.add(testPI, {percent: 'PI Multiplication'});

// add a call to testDelay (tracked automatically in Other debug panel)
Update.add(testDelay);

// start update loop
Update.update();

function testRandom()
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