import * as THREE from 'three';

function createVolumetricLightCone(color = 0xffffff, intensity = 0.5, angle = Math.PI / 6, distance = 15, segments = 32) {
    const geometry = new THREE.ConeGeometry(distance * Math.tan(angle), distance, segments, 1, true);

    // Gradient texture for volumetric effect
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, `rgba(255,255,255,${intensity})`);
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.MeshBasicMaterial({
        map: texture,
        color,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
    });

    const cone = new THREE.Mesh(geometry, material);
    cone.rotateX(-Math.PI / 2);
    return cone;
}

export function createVolumetricLightingSetup({
                                                  scene,
                                                  lightColor = 0xffffff,
                                                  lightIntensity = 1.5,
                                                  shadowMapSize = 2048,
                                                  shadowBias = -0.000005,
                                              } = {}) {
    // Ambient Light
    const ambientLight = new THREE.AmbientLight("#404040", 0.6); // soft ambient light
    scene.add(ambientLight);

    // Hemisphere Light (sky and ground)
    const hemiLight = new THREE.HemisphereLight(0xddeeff, 0x202020, 0);
    scene.add(hemiLight);

    // Directional Light (sunlight) with shadows
    const dirLight = new THREE.DirectionalLight(lightColor, lightIntensity);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = shadowMapSize;
    dirLight.shadow.mapSize.height = shadowMapSize;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 1000;
    dirLight.shadow.camera.left = -15;
    dirLight.shadow.camera.right = 15;
    dirLight.shadow.camera.top = 15;
    dirLight.shadow.camera.bottom = -15;
    dirLight.shadow.bias = shadowBias;
    scene.add(dirLight);







    return {
        ambientLight,
        hemiLight,
        dirLight,
    };
}
