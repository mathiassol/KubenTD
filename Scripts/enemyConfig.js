// To make sure that the difficulty is balanced, this config is created by AI.
// prompt: create a balanced enemy config with 20 waves and 3 different difficulty levels. Base the difficulty on the unitConfig.js

// Easy Mode - Starting Cash: 1000
const easyWaveConfig = [
    // Wave 1 - Simple introduction with basic enemies
    [
        {speed: 2, health: 50, type: 'ground', invisible: false, magic: false, steal: false, cash: 25},
        {speed: 2, health: 50, type: 'ground', invisible: false, magic: false, steal: false, cash: 25},
        {delay: 5},
        {speed: 2, health: 50, type: 'ground', invisible: false, magic: false, steal: false, cash: 25},
    ],
    // Wave 2 - Adding a few more enemies
    [
        {speed: 2, health: 60, type: 'ground', invisible: false, magic: false, steal: false, cash: 30},
        {speed: 2, health: 60, type: 'ground', invisible: false, magic: false, steal: false, cash: 30},
        {speed: 2, health: 60, type: 'ground', invisible: false, magic: false, steal: false, cash: 30},
        {speed: 2, health: 60, type: 'ground', invisible: false, magic: false, steal: false, cash: 30},
    ],
    // Wave 3 - First air enemies
    [
        {speed: 3, health: 70, type: 'air', invisible: false, magic: false, steal: false, cash: 35},
        {speed: 3, health: 70, type: 'air', invisible: false, magic: false, steal: false, cash: 35},
        {speed: 2, health: 80, type: 'ground', invisible: false, magic: false, steal: false, cash: 35},
    ],
    // Wave 4 - Mixed enemies
    [
        {speed: 2, health: 90, type: 'ground', invisible: false, magic: false, steal: false, cash: 40},
        {speed: 3, health: 80, type: 'air', invisible: false, magic: false, steal: false, cash: 40},
        {speed: 2, health: 90, type: 'ground', invisible: false, magic: false, steal: false, cash: 40},
        {speed: 3, health: 80, type: 'air', invisible: false, magic: false, steal: false, cash: 40},
    ],
    // Wave 5 - First magical enemy
    [
        {speed: 2, health: 100, type: 'ground', invisible: false, magic: true, steal: false, cash: 50},
        {speed: 3, health: 90, type: 'air', invisible: false, magic: false, steal: false, cash: 45},
        {speed: 3, health: 90, type: 'air', invisible: false, magic: false, steal: false, cash: 45},
    ],
    // Wave 6 - Faster enemies
    [
        {speed: 4, health: 110, type: 'ground', invisible: false, magic: false, steal: false, cash: 50},
        {speed: 4, health: 110, type: 'ground', invisible: false, magic: false, steal: false, cash: 50},
        {speed: 4, health: 100, type: 'air', invisible: false, magic: false, steal: false, cash: 50},
    ],
    // Wave 7 - First invisible enemy
    [
        {speed: 3, health: 120, type: 'ground', invisible: true, magic: false, steal: false, cash: 60},
        {speed: 3, health: 120, type: 'ground', invisible: false, magic: false, steal: false, cash: 55},
        {speed: 4, health: 110, type: 'air', invisible: false, magic: false, steal: false, cash: 55},
    ],
    // Wave 8 - Mixed challenge
    [
        {speed: 3, health: 130, type: 'ground', invisible: false, magic: true, steal: false, cash: 60},
        {speed: 4, health: 120, type: 'air', invisible: false, magic: false, steal: false, cash: 60},
        {speed: 3, health: 130, type: 'ground', invisible: true, magic: false, steal: false, cash: 60},
    ],
    // Wave 9 - Increasing difficulty
    [
        {speed: 4, health: 140, type: 'ground', invisible: false, magic: false, steal: false, cash: 65},
        {speed: 4, health: 140, type: 'ground', invisible: false, magic: false, steal: false, cash: 65},
        {speed: 4, health: 130, type: 'air', invisible: false, magic: true, steal: false, cash: 65},
        {speed: 4, health: 130, type: 'air', invisible: false, magic: true, steal: false, cash: 65},
    ],
    // Wave 10 - First thief
    [
        {speed: 5, health: 120, type: 'ground', invisible: false, magic: false, steal: true, cash: 80},
        {speed: 4, health: 150, type: 'ground', invisible: false, magic: true, steal: false, cash: 70},
        {speed: 4, health: 140, type: 'air', invisible: false, magic: false, steal: false, cash: 70},
    ],
    // Wave 11 - Difficult mix
    [
        {speed: 4, health: 160, type: 'ground', invisible: true, magic: false, steal: false, cash: 75},
        {speed: 4, health: 150, type: 'air', invisible: false, magic: true, steal: false, cash: 75},
        {speed: 5, health: 140, type: 'ground', invisible: false, magic: false, steal: false, cash: 75},
    ],
    // Wave 12 - Air heavy
    [
        {speed: 5, health: 160, type: 'air', invisible: false, magic: false, steal: false, cash: 80},
        {speed: 5, health: 160, type: 'air', invisible: false, magic: false, steal: false, cash: 80},
        {speed: 4, health: 170, type: 'ground', invisible: false, magic: true, steal: false, cash: 80},
    ],
    // Wave 13 - Invisible threats
    [
        {speed: 4, health: 180, type: 'ground', invisible: true, magic: false, steal: false, cash: 85},
        {speed: 4, health: 180, type: 'ground', invisible: true, magic: false, steal: false, cash: 85},
        {speed: 5, health: 170, type: 'air', invisible: false, magic: true, steal: false, cash: 85},
    ],
    // Wave 14 - Magic resistance needed
    [
        {speed: 4, health: 190, type: 'ground', invisible: false, magic: true, steal: false, cash: 90},
        {speed: 4, health: 190, type: 'ground', invisible: false, magic: true, steal: false, cash: 90},
        {speed: 5, health: 180, type: 'air', invisible: false, magic: true, steal: false, cash: 90},
    ],
    // Wave 15 - More thieves
    [
        {speed: 6, health: 160, type: 'ground', invisible: false, magic: false, steal: true, cash: 100},
        {speed: 6, health: 160, type: 'ground', invisible: false, magic: false, steal: true, cash: 100},
        {speed: 5, health: 200, type: 'air', invisible: true, magic: false, steal: false, cash: 95},
    ],
    // Wave 16 - Speed challenge
    [
        {speed: 6, health: 210, type: 'ground', invisible: false, magic: false, steal: false, cash: 100},
        {speed: 6, health: 210, type: 'ground', invisible: false, magic: false, steal: false, cash: 100},
        {speed: 6, health: 200, type: 'air', invisible: false, magic: true, steal: false, cash: 100},
    ],
    // Wave 17 - Magical threat
    [
        {speed: 5, health: 220, type: 'ground', invisible: false, magic: true, steal: false, cash: 110},
        {speed: 5, health: 220, type: 'ground', invisible: false, magic: true, steal: false, cash: 110},
        {speed: 6, health: 210, type: 'air', invisible: true, magic: false, steal: false, cash: 110},
    ],
    // Wave 18 - Difficult combo
    [
        {speed: 5, health: 230, type: 'ground', invisible: true, magic: true, steal: false, cash: 120},
        {speed: 6, health: 220, type: 'air', invisible: false, magic: true, steal: false, cash: 120},
        {speed: 7, health: 200, type: 'ground', invisible: false, magic: false, steal: true, cash: 120},
    ],
    // Wave 19 - Penultimate challenge
    [
        {speed: 6, health: 240, type: 'ground', invisible: true, magic: false, steal: false, cash: 130},
        {speed: 6, health: 240, type: 'ground', invisible: false, magic: true, steal: false, cash: 130},
        {speed: 6, health: 230, type: 'air', invisible: true, magic: true, steal: false, cash: 130},
    ],
    // Wave 20 - Final boss wave
    [
        {speed: 5, health: 300, type: 'ground', invisible: true, magic: true, steal: false, cash: 150},
        {speed: 7, health: 250, type: 'air', invisible: true, magic: false, steal: false, cash: 150},
        {speed: 6, health: 270, type: 'ground', invisible: false, magic: true, steal: true, cash: 150},
    ],
];
// Normal Mode - Starting Cash: 800
const normalWaveConfig = [
    // Wave 1 - Simple introduction
    [
        {speed: 3, health: 70, type: 'ground', invisible: false, magic: false, steal: false, cash: 25},
        {speed: 3, health: 70, type: 'ground', invisible: false, magic: false, steal: false, cash: 25},
        {speed: 3, health: 70, type: 'ground', invisible: false, magic: false, steal: false, cash: 25},
    ],
    // Wave 2 - Adding more enemies
    [
        {speed: 3, health: 80, type: 'ground', invisible: false, magic: false, steal: false, cash: 30},
        {speed: 3, health: 80, type: 'ground', invisible: false, magic: false, steal: false, cash: 30},
        {speed: 3, health: 80, type: 'ground', invisible: false, magic: false, steal: false, cash: 30},
        {speed: 3, health: 80, type: 'ground', invisible: false, magic: false, steal: false, cash: 30},
    ],
    // Wave 3 - Air enemies
    [
        {speed: 4, health: 90, type: 'air', invisible: false, magic: false, steal: false, cash: 35},
        {speed: 4, health: 90, type: 'air', invisible: false, magic: false, steal: false, cash: 35},
        {speed: 3, health: 100, type: 'ground', invisible: false, magic: false, steal: false, cash: 35},
    ],
    // Wave 4 - Mixed enemies
    [
        {speed: 3, health: 110, type: 'ground', invisible: false, magic: false, steal: false, cash: 40},
        {speed: 4, health: 100, type: 'air', invisible: false, magic: false, steal: false, cash: 40},
        {speed: 3, health: 110, type: 'ground', invisible: false, magic: false, steal: false, cash: 40},
        {speed: 4, health: 100, type: 'air', invisible: false, magic: false, steal: false, cash: 40},
    ],
    // Wave 5 - Magic enemy
    [
        {speed: 3, health: 130, type: 'ground', invisible: false, magic: true, steal: false, cash: 50},
        {speed: 4, health: 120, type: 'air', invisible: false, magic: false, steal: false, cash: 45},
        {speed: 4, health: 120, type: 'air', invisible: false, magic: false, steal: false, cash: 45},
    ],
    // Wave 6 - Faster enemies
    [
        {speed: 5, health: 140, type: 'ground', invisible: false, magic: false, steal: false, cash: 50},
        {speed: 5, health: 140, type: 'ground', invisible: false, magic: false, steal: false, cash: 50},
        {speed: 5, health: 130, type: 'air', invisible: false, magic: false, steal: false, cash: 50},
    ],
    // Wave 7 - Invisible enemy
    [
        {speed: 4, health: 160, type: 'ground', invisible: true, magic: false, steal: false, cash: 60},
        {speed: 4, health: 160, type: 'ground', invisible: false, magic: false, steal: false, cash: 55},
        {speed: 5, health: 150, type: 'air', invisible: false, magic: false, steal: false, cash: 55},
    ],
    // Wave 8 - Mixed challenge
    [
        {speed: 4, health: 180, type: 'ground', invisible: false, magic: true, steal: false, cash: 60},
        {speed: 5, health: 170, type: 'air', invisible: false, magic: false, steal: false, cash: 60},
        {speed: 4, health: 180, type: 'ground', invisible: true, magic: false, steal: false, cash: 60},
    ],
    // Wave 9 - Increasing difficulty
    [
        {speed: 5, health: 200, type: 'ground', invisible: false, magic: false, steal: false, cash: 65},
        {speed: 5, health: 200, type: 'ground', invisible: false, magic: false, steal: false, cash: 65},
        {speed: 5, health: 190, type: 'air', invisible: false, magic: true, steal: false, cash: 65},
        {speed: 5, health: 190, type: 'air', invisible: false, magic: true, steal: false, cash: 65},
    ],
    // Wave 10 - Thief
    [
        {speed: 6, health: 180, type: 'ground', invisible: false, magic: false, steal: true, cash: 80},
        {speed: 5, health: 220, type: 'ground', invisible: false, magic: true, steal: false, cash: 70},
        {speed: 5, health: 210, type: 'air', invisible: false, magic: false, steal: false, cash: 70},
    ],
    // Wave 11 - Difficult mix
    [
        {speed: 5, health: 240, type: 'ground', invisible: true, magic: false, steal: false, cash: 75},
        {speed: 5, health: 230, type: 'air', invisible: false, magic: true, steal: false, cash: 75},
        {speed: 6, health: 220, type: 'ground', invisible: false, magic: false, steal: false, cash: 75},
    ],
    // Wave 12 - Air heavy
    [
        {speed: 6, health: 250, type: 'air', invisible: false, magic: false, steal: false, cash: 80},
        {speed: 6, health: 250, type: 'air', invisible: false, magic: false, steal: false, cash: 80},
        {speed: 5, health: 260, type: 'ground', invisible: false, magic: true, steal: false, cash: 80},
    ],
    // Wave 13 - Invisible threats
    [
        {speed: 5, health: 280, type: 'ground', invisible: true, magic: false, steal: false, cash: 85},
        {speed: 5, health: 280, type: 'ground', invisible: true, magic: false, steal: false, cash: 85},
        {speed: 6, health: 270, type: 'air', invisible: false, magic: true, steal: false, cash: 85},
    ],
    // Wave 14 - Magic resistance needed
    [
        {speed: 5, health: 300, type: 'ground', invisible: false, magic: true, steal: false, cash: 90},
        {speed: 5, health: 300, type: 'ground', invisible: false, magic: true, steal: false, cash: 90},
        {speed: 6, health: 290, type: 'air', invisible: false, magic: true, steal: false, cash: 90},
    ],
    // Wave 15 - Thieves
    [
        {speed: 7, health: 270, type: 'ground', invisible: false, magic: false, steal: true, cash: 100},
        {speed: 7, health: 270, type: 'ground', invisible: false, magic: false, steal: true, cash: 100},
        {speed: 6, health: 320, type: 'air', invisible: true, magic: false, steal: false, cash: 95},
    ],
    // Wave 16 - Speed challenge
    [
        {speed: 7, health: 340, type: 'ground', invisible: false, magic: false, steal: false, cash: 100},
        {speed: 7, health: 340, type: 'ground', invisible: false, magic: false, steal: false, cash: 100},
        {speed: 7, health: 330, type: 'air', invisible: false, magic: true, steal: false, cash: 100},
    ],
    // Wave 17 - Magical threat
    [
        {speed: 6, health: 360, type: 'ground', invisible: false, magic: true, steal: false, cash: 110},
        {speed: 6, health: 360, type: 'ground', invisible: false, magic: true, steal: false, cash: 110},
        {speed: 7, health: 350, type: 'air', invisible: true, magic: false, steal: false, cash: 110},
    ],
    // Wave 18 - Difficult combo
    [
        {speed: 6, health: 380, type: 'ground', invisible: true, magic: true, steal: false, cash: 120},
        {speed: 7, health: 370, type: 'air', invisible: false, magic: true, steal: false, cash: 120},
        {speed: 8, health: 350, type: 'ground', invisible: false, magic: false, steal: true, cash: 120},
    ],
    // Wave 19 - Penultimate challenge
    [
        {speed: 7, health: 400, type: 'ground', invisible: true, magic: false, steal: false, cash: 130},
        {speed: 7, health: 400, type: 'ground', invisible: false, magic: true, steal: false, cash: 130},
        {speed: 7, health: 390, type: 'air', invisible: true, magic: true, steal: false, cash: 130},
    ],
    // Wave 20 - Final boss wave
    [
        {speed: 6, health: 500, type: 'ground', invisible: true, magic: true, steal: false, cash: 150},
        {speed: 8, health: 450, type: 'air', invisible: true, magic: false, steal: false, cash: 150},
        {speed: 7, health: 475, type: 'ground', invisible: false, magic: true, steal: true, cash: 150},
    ],
];

// Hard Mode - Starting Cash: 600
const hardWaveConfig = [
    // Wave 1 - Challenging start
    [
        {speed: 4, health: 100, type: 'ground', invisible: false, magic: false, steal: false, cash: 25},
        {speed: 4, health: 100, type: 'ground', invisible: false, magic: false, steal: false, cash: 25},
        {speed: 4, health: 100, type: 'ground', invisible: false, magic: false, steal: false, cash: 25},
    ],
    // Wave 2 - More enemies
    [
        {speed: 4, health: 120, type: 'ground', invisible: false, magic: false, steal: false, cash: 30},
        {speed: 4, health: 120, type: 'ground', invisible: false, magic: false, steal: false, cash: 30},
        {speed: 4, health: 120, type: 'ground', invisible: false, magic: false, steal: false, cash: 30},
        {speed: 4, health: 120, type: 'ground', invisible: false, magic: false, steal: false, cash: 30},
    ],
    // Wave 3 - Air enemies earlier
    [
        {speed: 5, health: 140, type: 'air', invisible: false, magic: false, steal: false, cash: 35},
        {speed: 5, health: 140, type: 'air', invisible: false, magic: false, steal: false, cash: 35},
        {speed: 4, health: 150, type: 'ground', invisible: false, magic: true, steal: false, cash: 35},
    ],
    // Wave 4 - Mixed enemies with invisible
    [
        {speed: 4, health: 160, type: 'ground', invisible: true, magic: false, steal: false, cash: 40},
        {speed: 5, health: 150, type: 'air', invisible: false, magic: false, steal: false, cash: 40},
        {speed: 4, health: 160, type: 'ground', invisible: false, magic: false, steal: false, cash: 40},
        {speed: 5, health: 150, type: 'air', invisible: false, magic: false, steal: false, cash: 40},
    ],
    // Wave 5 - Magic enemies early
    [
        {speed: 4, health: 180, type: 'ground', invisible: false, magic: true, steal: false, cash: 50},
        {speed: 5, health: 170, type: 'air', invisible: false, magic: true, steal: false, cash: 45},
        {speed: 5, health: 170, type: 'air', invisible: false, magic: false, steal: false, cash: 45},
    ],
    // Wave 6 - Fast enemies
    [
        {speed: 6, health: 190, type: 'ground', invisible: false, magic: false, steal: false, cash: 50},
        {speed: 6, health: 190, type: 'ground', invisible: false, magic: false, steal: false, cash: 50},
        {speed: 6, health: 180, type: 'air', invisible: false, magic: true, steal: false, cash: 50},
    ],
    // Wave 7 - Invisible enemies
    [
        {speed: 5, health: 210, type: 'ground', invisible: true, magic: false, steal: false, cash: 60},
        {speed: 5, health: 210, type: 'ground', invisible: true, magic: false, steal: false, cash: 55},
        {speed: 6, health: 200, type: 'air', invisible: false, magic: false, steal: false, cash: 55},
    ],
    // Wave 8 - Mixed challenge
    [
        {speed: 5, health: 230, type: 'ground', invisible: false, magic: true, steal: false, cash: 60},
        {speed: 6, health: 220, type: 'air', invisible: true, magic: false, steal: false, cash: 60},
        {speed: 5, health: 230, type: 'ground', invisible: true, magic: false, steal: false, cash: 60},
    ],
    // Wave 9 - Thief early
    [
        {speed: 7, health: 200, type: 'ground', invisible: false, magic: false, steal: true, cash: 65},
        {speed: 6, health: 250, type: 'ground', invisible: false, magic: false, steal: false, cash: 65},
        {speed: 6, health: 240, type: 'air', invisible: false, magic: true, steal: false, cash: 65},
        {speed: 6, health: 240, type: 'air', invisible: false, magic: true, steal: false, cash: 65},
    ],
    // Wave 10 - Multiple thieves
    [
        {speed: 7, health: 220, type: 'ground', invisible: false, magic: false, steal: true, cash: 80},
        {speed: 7, health: 220, type: 'ground', invisible: false, magic: false, steal: true, cash: 80},
        {speed: 6, health: 270, type: 'ground', invisible: false, magic: true, steal: false, cash: 70},
        {speed: 6, health: 260, type: 'air', invisible: true, magic: false, steal: false, cash: 70},
    ],
    // Wave 11 - Difficult mix
    [
        {speed: 6, health: 290, type: 'ground', invisible: true, magic: false, steal: false, cash: 75},
        {speed: 6, health: 280, type: 'air', invisible: false, magic: true, steal: false, cash: 75},
        {speed: 7, health: 270, type: 'ground', invisible: false, magic: true, steal: false, cash: 75},
    ],
    // Wave 12 - Air heavy
    [
        {speed: 7, health: 310, type: 'air', invisible: true, magic: false, steal: false, cash: 80},
        {speed: 7, health: 310, type: 'air', invisible: true, magic: false, steal: false, cash: 80},
        {speed: 6, health: 320, type: 'ground', invisible: false, magic: true, steal: false, cash: 80},
    ],
    // Wave 13 - Invisible threats
    [
        {speed: 6, health: 340, type: 'ground', invisible: true, magic: false, steal: false, cash: 85},
        {speed: 6, health: 340, type: 'ground', invisible: true, magic: true, steal: false, cash: 85},
        {speed: 7, health: 330, type: 'air', invisible: true, magic: true, steal: false, cash: 85},
    ],
    // Wave 14 - Magic resistance needed
    [
        {speed: 6, health: 360, type: 'ground', invisible: false, magic: true, steal: false, cash: 90},
        {speed: 6, health: 360, type: 'ground', invisible: false, magic: true, steal: false, cash: 90},
        {speed: 7, health: 350, type: 'air', invisible: false, magic: true, steal: false, cash: 90},
        {speed: 7, health: 350, type: 'air', invisible: false, magic: true, steal: false, cash: 90},
    ],
    // Wave 15 - Thieves
    [
        {speed: 8, health: 330, type: 'ground', invisible: false, magic: false, steal: true, cash: 100},
        {speed: 8, health: 330, type: 'ground', invisible: false, magic: false, steal: true, cash: 100},
        {speed: 8, health: 330, type: 'ground', invisible: true, magic: false, steal: true, cash: 100},
        {speed: 7, health: 380, type: 'air', invisible: true, magic: false, steal: false, cash: 95},
    ],
    // Wave 16 - Speed challenge
    [
        {speed: 8, health: 400, type: 'ground', invisible: false, magic: true, steal: false, cash: 100},
        {speed: 8, health: 400, type: 'ground', invisible: false, magic: true, steal: false, cash: 100},
        {speed: 8, health: 390, type: 'air', invisible: false, magic: true, steal: false, cash: 100},
    ],
    // Wave 17 - Magical threat
    [
        {speed: 7, health: 420, type: 'ground', invisible: true, magic: true, steal: false, cash: 110},
        {speed: 7, health: 420, type: 'ground', invisible: true, magic: true, steal: false, cash: 110},
        {speed: 8, health: 410, type: 'air', invisible: true, magic: true, steal: false, cash: 110},
    ],
    // Wave 18 - Difficult combo
    [
        {speed: 7, health: 440, type: 'ground', invisible: true, magic: true, steal: false, cash: 120},
        {speed: 8, health: 430, type: 'air', invisible: true, magic: true, steal: false, cash: 120},
        {speed: 9, health: 410, type: 'ground', invisible: false, magic: false, steal: true, cash: 120},
        {speed: 9, health: 410, type: 'ground', invisible: false, magic: false, steal: true, cash: 120},
    ],
    // Wave 19 - Penultimate challenge
    [
        {speed: 8, health: 460, type: 'ground', invisible: true, magic: true, steal: false, cash: 130},
        {speed: 8, health: 460, type: 'ground', invisible: true, magic: true, steal: false, cash: 130},
        {speed: 8, health: 450, type: 'air', invisible: true, magic: true, steal: false, cash: 130},
        {speed: 8, health: 450, type: 'air', invisible: true, magic: true, steal: false, cash: 130},
    ],
    // Wave 20 - Final boss wave
    [
        {speed: 7, health: 600, type: 'ground', invisible: true, magic: true, steal: false, cash: 150},
        {speed: 9, health: 550, type: 'air', invisible: true, magic: true, steal: false, cash: 150},
        {speed: 8, health: 575, type: 'ground', invisible: true, magic: true, steal: true, cash: 150},
        {speed: 8, health: 575, type: 'air', invisible: true, magic: true, steal: false, cash: 150},
    ],
];

export { easyWaveConfig, normalWaveConfig, hardWaveConfig };