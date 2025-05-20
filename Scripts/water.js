import * as THREE from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

let water, renderTarget, depthMaterial, clock;
const params = { foamColor: 0xffffff, waterColor: 0x14c6a5, threshold: 0.3 }; // Lower threshold for more foam
function initCartoonWater(scene, camera, renderer) {
    clock = new THREE.Clock();

    // Depth texture support
    var supportsDepthTextureExtension = !!renderer.extensions.get(
        "WEBGL_depth_texture"
    );


    const pixelRatio = renderer.getPixelRatio();
    renderTarget = new THREE.WebGLRenderTarget(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio);
    renderTarget.texture.minFilter = THREE.NearestFilter;
    renderTarget.texture.magFilter = THREE.NearestFilter;
    renderTarget.texture.generateMipmaps = false;
    renderTarget.stencilBuffer = false;

    if (supportsDepthTextureExtension) {
        renderTarget.depthTexture = new THREE.DepthTexture();
        renderTarget.depthTexture.type = THREE.UnsignedShortType;
    }

    depthMaterial = new THREE.MeshDepthMaterial();
    depthMaterial.depthPacking = THREE.RGBADepthPacking;
    depthMaterial.blending = THREE.NoBlending;

    // Water shader
    const dudvMap = new THREE.TextureLoader().load("https://i.imgur.com/hOIsXiZ.png");
    dudvMap.wrapS = dudvMap.wrapT = THREE.RepeatWrapping;

    const uniforms = {
        time: { value: 0 },
        threshold: { value: params.threshold },
        tDudv: { value: dudvMap },
        tDepth: { value: supportsDepthTextureExtension ? renderTarget.depthTexture : renderTarget.texture },
        cameraNear: { value: camera.near },
        cameraFar: { value: camera.far },
        resolution: { value: new THREE.Vector2(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio) },
        foamColor: { value: new THREE.Color(params.foamColor) },
        waterColor: { value: new THREE.Color(params.waterColor) },
    };


    const waterGeometry = new THREE.PlaneGeometry(200, 200);
    const waterMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform float threshold;
            uniform sampler2D tDudv;
            uniform sampler2D tDepth;
            uniform vec3 foamColor;
            uniform vec3 waterColor;
            varying vec2 vUv;

            void main() {
                vec2 uv = vUv + texture2D(tDudv, vUv + time * 0.05).rg * 0.1;
                float depth = texture2D(tDepth, uv).r;
                vec3 color = mix(waterColor, foamColor, smoothstep(threshold, 1.0, depth));
                gl_FragColor = vec4(color, 1.0);
            }
        `,
        transparent: true,
    });

    water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    scene.add(water);

    // GUI for water parameters
    const gui = new GUI();
    gui.addColor(params, "foamColor").onChange(() => waterMaterial.uniforms.foamColor.value.set(params.foamColor));
    gui.addColor(params, "waterColor").onChange(() => waterMaterial.uniforms.waterColor.value.set(params.waterColor));
    gui.add(params, "threshold", 0.1, 1).onChange(() => waterMaterial.uniforms.threshold.value = params.threshold);
}

function updateCartoonWater(renderer, scene, camera) {
    const time = clock.getElapsedTime();

    // Depth pass
    water.visible = false;
    scene.overrideMaterial = depthMaterial;
    renderer.setRenderTarget(renderTarget);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    scene.overrideMaterial = null;
    water.visible = true;

    // Update water uniforms
    water.material.uniforms.time.value = time;

    // Render scene
    renderer.render(scene, camera);
}

export { initCartoonWater, updateCartoonWater };