const unitConfig = {
    mortar: {
        price: 350,
        baseStats: { damage: 10, range: 50, attackSpeed: 0.2 },
        target: 'air',
        invisible: true,
        magic: false,
        projectile: true,
        penetration: true,
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
    }
};

export { unitConfig };