## update.js
update loop API for javascript apps. Works well with https://github.com/davidfig/debug (included for testing and examples)

## Code Example

        // initialize debug panels to track progress
        Debug.init();
        var random = Debug.add('random', {text: '0'});

        // initialize update loop
        Update.init();

        // add a call to testRandom every 100 MS and track it in Random Numbers debug panel
        Update.add(testRandom, {time: 100, percent: 'Random Numbers'});

        // add a call to testPI every update and track it in PI Calculation debug panel
        Update.add(testPI, {percent: 'PI Calculation'});

        // add a call to testDelay (tracked automatically in Other debug panel)
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

## Installation
include update.js in your project or add to your workflow

    <script src="update.js"></script>

## Example
https://davidfig.github.io/update/

see also

* https://davidfig.github.io/debug/
* https://davidfig.github.io/animate/
* https://davidfig.github.io/renderer/
* https://davidfig.github.io/viewport/

## API Reference

### Update.init()
initialize Update

### Update.update()
starts the update loop

### Update.add(funct, options)
Add a function to the update loop
* funct: function pointer
* options {}
    - options.time: time to execute funct in MS (defaults to every update loop)
    - options.FPS: desired frames per second to call funct
    - options.once: true or false -- call function only once
    - percent: track percentages in a davidfig/Debug panel

### Update.remove(update)
removes an update from the loop
* update: object returned by Update.add() or Update.addFPS()

### Update.registerPause(pause, resume)
registers callback for pause and resume

### Update.pauseGame()
pauses the update loop -- this is automatically called when document loses focus

### Update.resumeGame()
resumes the update loop -- this is automatically called when document gains focus

## License
MIT License (MIT)