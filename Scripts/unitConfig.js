const unitConfig = {
    attacker: {
        price: 100,
        baseStats: { damage: 10, range: 50, attackSpeed: 1.5 },
        target: 'air',
        invisible: false,
        magic: false,
        projectile: true,
        penetration: false,
        path1: [
            { damage: 10, range: 5, attackSpeed: -0.1, upgradePrice: 50 },
            { damage: 10, range: 5, attackSpeed: -0.1, invisible: true, upgradePrice: 50 },
            { damage: 10, range: 5, attackSpeed: -0.1, upgradePrice: 50 },
            { damage: 20, range: 15, attackSpeed: -0.1, upgradePrice: 100 },
            { damage: 20, range: 15, attackSpeed: -0.1, upgradePrice: 100 },
        ],
        path2: [
            { damage: 15, range: 10, attackSpeed: -0.1, upgradePrice: 60 },
            { damage: 15, range: 10, attackSpeed: -0.1, invisible: true, upgradePrice: 60 },
            { damage: 15, range: 10, attackSpeed: -0.1, upgradePrice: 60 },
            { damage: 20, range: 15, attackSpeed: -0.1, upgradePrice: 120 },
            { damage: 20, range: 15, attackSpeed: -0.1, upgradePrice: 120 },
        ],
        path3: [
            { damage: 20, range: 15, attackSpeed: -0.1, upgradePrice: 70 },
            { damage: 20, range: 15, attackSpeed: -0.1, invisible: true, upgradePrice: 70 },
            { damage: 20, range: 15, attackSpeed: -0.1, upgradePrice: 70 },
            { damage: 20, range: 15, attackSpeed: -0.1, upgradePrice: 140 },
            { damage: 20, range: 15, attackSpeed: -0.1, upgradePrice: 140 },
        ]
    },
    defender: {
        price: 80,
        baseStats: { damage: 5, range: 40, attackSpeed: 2.0 },
        path1: [
            { damage: 5, range: 5, attackSpeed: -0.1, upgradePrice: 40 },
            { damage: 5, range: 5, attackSpeed: -0.1, upgradePrice: 40 },
            { damage: 5, range: 5, attackSpeed: -0.1, upgradePrice: 40 },
        ],
        path2: [
            { damage: 7, range: 7, attackSpeed: -0.1, upgradePrice: 50 },
            { damage: 7, range: 7, attackSpeed: -0.1, upgradePrice: 50 },
            { damage: 7, range: 7, attackSpeed: -0.1, upgradePrice: 50 },
        ],
        path3: [
            { damage: 9, range: 9, attackSpeed: -0.1, upgradePrice: 60 },
            { damage: 9, range: 9, attackSpeed: -0.1, upgradePrice: 60 },
            { damage: 9, range: 9, attackSpeed: -0.1, upgradePrice: 60 },
        ]
    },
    defender2: {
        price: 80,
        baseStats: { damage: 5, range: 40, attackSpeed: 2.0 },
        path1: [
            { damage: 5, range: 5, attackSpeed: -0.1, upgradePrice: 40 },
            { damage: 5, range: 5, attackSpeed: -0.1, upgradePrice: 40 },
            { damage: 5, range: 5, attackSpeed: -0.1, upgradePrice: 40 },
        ],
        path2: [
            { damage: 7, range: 7, attackSpeed: -0.1, upgradePrice: 50 },
            { damage: 7, range: 7, attackSpeed: -0.1, upgradePrice: 50 },
            { damage: 7, range: 7, attackSpeed: -0.1, upgradePrice: 50 },
        ],
        path3: [
            { damage: 9, range: 9, attackSpeed: -0.1, upgradePrice: 60 },
            { damage: 9, range: 9, attackSpeed: -0.1, upgradePrice: 60 },
            { damage: 9, range: 9, attackSpeed: -0.1, upgradePrice: 60 },
        ]
    }
};

export { unitConfig };