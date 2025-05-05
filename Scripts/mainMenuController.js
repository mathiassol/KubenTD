let settingsChanged = false;
let originalSettings = {};

document.addEventListener('DOMContentLoaded', async function() {
    const displayModeSelect = document.getElementById('displayMode');
    const vsyncCheckbox = document.getElementById('vsync');

    if (window.electron) {
        try {
            const settings = await window.electron.getCurrentSettings();

            originalSettings = { ...settings };
            if (settings.displayMode) {
                originalSettings.vsync = settings.vsync || false;
            }

            if (settings.displayMode) {
                displayModeSelect.value = settings.displayMode;
            }
            
            if (settings.vsync !== undefined) {
                vsyncCheckbox.checked = settings.vsync;
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    displayModeSelect.addEventListener('change', function() {
        settingsChanged = true;
    });

    vsyncCheckbox.addEventListener('change', function() {
        settingsChanged = true;
    });
});

document.addEventListener('keydown', function keydownHandler() {
        document.getElementById('text1').style.display= "none";
        setMenu(2)
        document.removeEventListener('keydown', keydownHandler);
});

function apply() {
    const displayMode = document.getElementById('displayMode').value;
    const vsync = document.getElementById('vsync').checked;

    if (window.electron) {
        window.electron.changeDisplayMode(displayMode);
        console.log(`Applied display mode: ${displayMode}`);

        const settings = {
            display: {
                mode: displayMode,
                vsync: vsync
            }
        };
        
        window.electron.saveSettings(settings);
        console.log('Settings saved to INI file');

        originalSettings = {
            displayMode: displayMode,
            vsync: vsync
        };
        settingsChanged = false;
    } else {
        console.error("Electron API not available");
    }
}

function restoreSettings() {
    const displayModeSelect = document.getElementById('displayMode');
    const vsyncCheckbox = document.getElementById('vsync');
    
    if (originalSettings.displayMode) {
        displayModeSelect.value = originalSettings.displayMode;
    }
    
    if (originalSettings.vsync !== undefined) {
        vsyncCheckbox.checked = originalSettings.vsync;
    }
    
    settingsChanged = false;
}

function back() {
    if (currentMenu === 2) {
        return;
    }

    if (document.getElementById('settings-popup')) {
        return;
    }
    
    if (currentMenu === 3 && settingsChanged) {
        createConfirmationPopup();
        return;
    }
    
    currentMenu--;
    setMenu(currentMenu);
    console.log(currentMenu);
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        if (document.getElementById('settings-popup')) {
            return;
        }
        
        if (currentMenu === 3 && settingsChanged) {
            console.log("Settings changed, showing confirmation popup");
            createConfirmationPopup();
            return;
        }
    }
});

function createConfirmationPopup() {
    const existingPopup = document.getElementById('settings-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    const popup = document.createElement('div');
    popup.id = 'settings-popup';
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.background = '#1a1a1a';
    popup.style.border = '2px solid #a18c58';
    popup.style.padding = '20px';
    popup.style.zIndex = '1000';
    popup.style.textAlign = 'center';
    popup.style.color = '#fff';
    popup.style.height = '180px';

    
    const message = document.createElement('p');
    message.textContent = 'You have unsaved changes. What would you like to do?';
    popup.appendChild(message);
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'space-around';
    buttonContainer.style.marginTop = '20px';

    const buttonStyle = {
        background: 'transparent',
        color: '#a18c58',
        border: '1px solid #a18c58',
        padding: '10px 15px',
        cursor: 'pointer',
        fontSize: '16px',
        letterSpacing: '1px',
        transition: 'all 0.3s ease',
        width: '30%',
        height: '20%',
        position: 'relative'
    };
    
    const applyBtn = document.createElement('button');
    applyBtn.textContent = 'Apply Changes';
    Object.assign(applyBtn.style, buttonStyle);
    applyBtn.onmouseover = function() {
        this.style.color = '#E88C5F';
        this.style.borderColor = '#E88C5F';
    };
    applyBtn.onmouseout = function() {
        this.style.color = '#a18c58';
        this.style.borderColor = '#a18c58';
    };
    applyBtn.onclick = function() {
        apply();
        popup.remove();
        currentMenu = 2;
        setMenu(currentMenu);
    };
    
    const discardBtn = document.createElement('button');
    discardBtn.textContent = 'Discard Changes';
    Object.assign(discardBtn.style, buttonStyle);
    discardBtn.onmouseover = function() {
        this.style.color = '#E88C5F';
        this.style.borderColor = '#E88C5F';
    };
    discardBtn.onmouseout = function() {
        this.style.color = '#a18c58';
        this.style.borderColor = '#a18c58';
    };
    discardBtn.onclick = function() {
        restoreSettings();
        popup.remove();
        currentMenu = 2;
        setMenu(currentMenu);
    };
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    Object.assign(cancelBtn.style, buttonStyle);
    cancelBtn.onmouseover = function() {
        this.style.color = '#E88C5F';
        this.style.borderColor = '#E88C5F';
    };
    cancelBtn.onmouseout = function() {
        this.style.color = '#a18c58';
        this.style.borderColor = '#a18c58';
    };
    cancelBtn.onclick = function() {
        popup.remove();
    };

    [applyBtn, discardBtn, cancelBtn].forEach(btn => {
        const line = document.createElement('div');
        line.style.position = 'absolute';
        line.style.left = '0';
        line.style.bottom = '0';
        line.style.height = '1px';
        line.style.width = '0';
        line.style.background = '#E88C5F';
        line.style.transition = 'width 0.3s ease-out';
        
        btn.appendChild(line);
        
        btn.onmouseover = function() {
            this.style.color = '#E88C5F';
            this.style.borderColor = '#E88C5F';
            line.style.width = '100%';
        };
        
        btn.onmouseout = function() {
            this.style.color = '#a18c58';
            this.style.borderColor = '#a18c58';
            line.style.width = '0';
        };
    });
    
    buttonContainer.appendChild(applyBtn);
    buttonContainer.appendChild(discardBtn);
    buttonContainer.appendChild(cancelBtn);
    popup.appendChild(buttonContainer);
    
    document.body.appendChild(popup);
}

var bg = bg || {};

function randomRange(from, to, seed){ return Math.floor((seed?seed:Math.random())*(to-from+1)+from); }

//Fire
(function(b){
    var cntr   = document.getElementById("canvascontainer"),
        W = cntr ? cntr.offsetWidth : window.innerWidth,
        H = cntr ? cntr.offsetHeight : window.innerHeight,
        canvas = [document.getElementById("canvas"), document.getElementById("buffer")],
        ctxs   = [canvas[0].getContext("2d"), canvas[1].getContext("2d")],
        C      = 0,
        angle  = 0,
        A      = [],
        int;

function ash(o) {
    var i,
        j,
        m = Math.random(),
        p = randomRange(4, 8, m);

    if(o && o.x) this.x = o.x;
    else this.x = m*W;
    if(o && o.y) this.y = o.y;
    else this.y = m*H;

    if(o && o.a && isFinite(o.a) && o.a > 0) this.a = o.a;
    else this.a = Math.max(1, m*(p-4)+1); // Ensure minimum of 1
    
    this.r = randomRange(233, 255, m);
    this.g = randomRange(181, 192, m);
    this.b = randomRange(72, 88, m);

    if(o && o.dp) this.dp = o.dp;
    else {
        this.dp = [{x:0,y:0}];
        for(i = 0; i < p; i++) {
            j = (i == 0 || p/2 > i ? 1 : -1);
            this.dp.push({x:this.dp[i].x+(randomRange(5, 30)*j), y:this.dp[i].y+(randomRange(5, 30)*j)});
        }
    }
}

    function draw() {
        var grad, i, j, p, ctx;
        if(C == 0) {
            //canvas
            canvas[0].style.visibility = "visible";
            canvas[1].style.visibility = "hidden";
            C = 1;
        } else {
            //buffer
            canvas[1].style.visibility = "visible";
            canvas[0].style.visibility = "hidden";
            C = 0;
        }

        ctx = ctxs[C];
        ctx.clearRect(0, 0, W, H);

        for(i = 0; i < A.length; i++) {
            p = A[i];

        if (isFinite(p.x) && isFinite(p.y) && isFinite(p.a) && p.a > 0) {
            grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.a);
            grad.addColorStop(0, "rgba("+p.r+", "+p.g+", "+p.b+", 1)");
            grad.addColorStop(0.9, "rgba("+p.r+", "+p.g+", "+p.b+", "+randomRange(1,10)/10+")");
            grad.addColorStop(1, "rgba("+p.r+", "+p.g+", "+p.b+", 0)");

            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            for(j = 1; j < p.dp.length; j++) ctx.lineTo(p.x+p.dp[j].x, p.y+p.dp[j].y);
            ctx.closePath();
            ctx.fillStyle = grad;
            ctx.globalAlpha = 0.7;
            ctx.fill();
        } else {
            A[i] = new ash();
        }
    }

    update();
}

    function update() {
        var i, p;
        angle += 0.01;

        for(i = 0; i < A.length; i++) {
            p = A[i];

            p.y += Math.cos(angle+A.length) + 1 + p.a/2;
            p.x += Math.sin(angle) * 2;

            if(p.x > W+5 || p.x < -5 || p.y > H) {
                if(i % 3 > 0) A[i] = new ash({y: -10, a: p.a, d: p.d, dp: p.dp});
                else {
                    //Enter from the left
                    if(Math.sin(angle) > 0) A[i] = new ash({x: -5, a: p.a, d: p.d, dp: p.dp});
                    //Enter from the right
                    else A[i] = new ash({x: W+5, a: p.a, d: p.d, dp: p.dp});
                }
            }
        }
    }

    //Run
    canvas[0].width = W;
    canvas[0].height = H;
    canvas[1].width = W;
    canvas[1].height = H;
    for(var i = 0; i < 50; i++) A.push(new ash());
    setInterval(draw, 35);
})(bg);

// settings tab

document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(panel => {
                panel.classList.remove('active');
            });

            this.classList.add('active');

            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
});

// tab

let currentMenu = 1;

function setMenu(menuNumber) {
    document.querySelectorAll('.page').forEach(menu => {
        menu.classList.add('hidden');
    });

    const targetMenu = document.getElementById('menu-' + menuNumber);
    if (targetMenu) {
        currentMenu = menuNumber;
        targetMenu.classList.remove('hidden');
        console.log(currentMenu);
    }
}
function back() {
    if (currentMenu === 2) {
        return;
    }
    currentMenu--;
    setMenu(currentMenu);
    console.log(currentMenu);
}
function openSettings() {
    setMenu(3);
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        if (document.getElementById('settings-popup')) {
            return;
        }
        
        if (currentMenu === 3 && settingsChanged) {
            createConfirmationPopup();
            return;
        }
        back();
    }
});

function quitApp() {
    console.log("Quit application");
}
function saveSettings(settings) {
    try {
        const config = settings || {};
        
        // Existing settings
        config.display = config.display || {};
        config.display.mode = displayMode;
        config.display.vsync = vsync;
        
        // New Three.js settings
        config.graphics = config.graphics || {};
        config.graphics.shadowsEnabled = shadowsEnabled;
        config.graphics.shadowResolution = shadowResolution;
        config.graphics.antialiasing = antialiasing;
        config.graphics.textureQuality = textureQuality;
        
        // Additional settings groups
        config.renderer = config.renderer || {};
        config.camera = config.camera || {};
        // etc.
        
        fs.writeFileSync(settingsPath, ini.stringify(config));
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}



async function startGame(mapId, difficulty) {
    event.stopPropagation();

    try {
        await window.gameAPI.updateGameSettings(mapId, difficulty);
        console.log(`Starting game with map: ${mapId}, difficulty: ${difficulty}`);
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}