const unitConfig = {
    gunnar: {  // Basic starter unit - hybrid damage but weaker stats
        price: 250,
        baseStats: { damage: 1, range: 45, attackSpeed: 1.1 },
        target: 'hybrid',
        invisible: false,
        magic: false,
        projectile: true,
        penetration: false,
        path1: [ // Damage focus
            { damage: 4, range: 0, attackSpeed: 0, upgradePrice: 40 },
            { damage: 6, range: 0, attackSpeed: 0, upgradePrice: 60 },
            { damage: 8, range: 5, attackSpeed: 0, upgradePrice: 80 },
            { damage: 10, range: 5, attackSpeed: -0.02, penetration: true, upgradePrice: 120 },
            { damage: 15, range: 10, attackSpeed: -0.03, upgradePrice: 160 },
        ],
        path2: [ // Attack speed focus
            { damage: 2, range: 0, attackSpeed: -0.02, upgradePrice: 40 },
            { damage: 3, range: 0, attackSpeed: -0.03, upgradePrice: 60 },
            { damage: 3, range: 5, attackSpeed: -0.04, upgradePrice: 80 },
            { damage: 4, range: 5, attackSpeed: -0.05, upgradePrice: 120 },
            { damage: 6, range: 10, attackSpeed: -0.06, upgradePrice: 160 },
        ],
        path3: [ // Range focus
            { damage: 2, range: 8, attackSpeed: 0, upgradePrice: 40 },
            { damage: 2, range: 12, attackSpeed: 0, upgradePrice: 60 },
            { damage: 3, range: 16, attackSpeed: -0.01, upgradePrice: 80 },
            { damage: 4, range: 20, attackSpeed: -0.01, upgradePrice: 120 },
            { damage: 6, range: 25, attackSpeed: -0.02, upgradePrice: 160 },
        ]
    },
    mage: {  // Magic damage, ground target specialist
        price: 400,
        baseStats: { damage: 15, range: 40, attackSpeed: 0.3 },
        target: 'ground',
        invisible: false,
        magic: true,
        projectile: true,
        penetration: true,
        path1: [ // Heavy magic damage
            { damage: 8, range: 0, attackSpeed: 0, upgradePrice: 60 },
            { damage: 12, range: 0, attackSpeed: 0, upgradePrice: 90 },
            { damage: 15, range: 5, attackSpeed: -0.02, upgradePrice: 120 },
            { damage: 20, range: 5, attackSpeed: -0.03, upgradePrice: 180 },
            { damage: 25, range: 10, attackSpeed: -0.04, upgradePrice: 250 },
        ],
        path2: [ // Area damage
            { damage: 5, range: 5, attackSpeed: -0.02, upgradePrice: 60 },
            { damage: 8, range: 5, attackSpeed: -0.03, invisible: true, upgradePrice: 90 },
            { damage: 10, range: 10, attackSpeed: -0.04, upgradePrice: 120 },
            { damage: 12, range: 10, attackSpeed: -0.05, upgradePrice: 180 },
            { damage: 15, range: 15, attackSpeed: -0.06, upgradePrice: 250 },
        ],
        path3: [ // Long range magic
            { damage: 5, range: 15, attackSpeed: 0, upgradePrice: 60 },
            { damage: 8, range: 20, attackSpeed: 0, upgradePrice: 90 },
            { damage: 10, range: 25, attackSpeed: -0.02, upgradePrice: 120 },
            { damage: 12, range: 30, attackSpeed: -0.03, upgradePrice: 180 },
            { damage: 15, range: 35, attackSpeed: -0.04, upgradePrice: 250 },
        ]
    },
    sniper: {  // Physical damage, air target specialist
        price: 350,
        baseStats: { damage: 12, range: 60, attackSpeed: 0.2 },
        target: 'air',
        invisible: false,
        magic: false,
        projectile: true,
        penetration: false,
        path1: [ // Sharp shooter
            { damage: 6, range: 5, attackSpeed: 0, upgradePrice: 50 },
            { damage: 10, range: 5, attackSpeed: -0.01, upgradePrice: 80 },
            { damage: 14, range: 10, attackSpeed: -0.02, upgradePrice: 110 },
            { damage: 18, range: 10, attackSpeed: -0.03, penetration: true, upgradePrice: 160 },
            { damage: 22, range: 15, attackSpeed: -0.04, upgradePrice: 220 },
        ],
        path2: [ // Quick shot
            { damage: 4, range: 0, attackSpeed: -0.03, upgradePrice: 50 },
            { damage: 6, range: 0, attackSpeed: -0.04, upgradePrice: 80 },
            { damage: 8, range: 5, attackSpeed: -0.05, upgradePrice: 110 },
            { damage: 10, range: 5, attackSpeed: -0.06, upgradePrice: 160 },
            { damage: 12, range: 10, attackSpeed: -0.08, upgradePrice: 220 },
        ],
        path3: [ // Long range
            { damage: 4, range: 15, attackSpeed: 0, upgradePrice: 50 },
            { damage: 6, range: 20, attackSpeed: 0, invisible: true, upgradePrice: 80 },
            { damage: 8, range: 25, attackSpeed: -0.01, upgradePrice: 110 },
            { damage: 10, range: 30, attackSpeed: -0.02, upgradePrice: 160 },
            { damage: 12, range: 35, attackSpeed: -0.03, upgradePrice: 220 },
        ]
    }
};

export { unitConfig };