import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Physics } from './Physics';

export class Drawing {
    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 50, 150);

        this.canvas = document.querySelector('canvas.webgl');
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        this.earth = null;
        this.satellite = null;
        this.loader = new GLTFLoader();
        this.atmosphere = null;
        this.earthSize = 80;
        this.physicsTimeScale = new Physics().physicsTimeScale;
    }

    createAtmosphere() {
        if (this.atmosphere) {
            this.scene.remove(this.atmosphere);
        }

        const atmosphereGeometry = new THREE.SphereGeometry(this.earthSize * 1.4, 64, 64);
        const atmosphereMaterial = new THREE.MeshPhongMaterial({
            color: 0x87ceeb,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide,
            shininess: 10
        });
        console.log(this.earthSize * 1.4);
        this.atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);

        const glowGeometry = new THREE.SphereGeometry(this.earthSize * 1, 64, 64);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x4488ff,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });

        this.atmosphereGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.scene.add(this.atmosphereGlow);
        this.scene.add(this.atmosphere);
    }

    createStarfield() {
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.2,
            sizeAttenuation: true
        });

        const vertices = [];
        for (let i = 0; i < 10000; i++) {
            vertices.push(
                (Math.random() - 0.5) * 2000,
                (Math.random() - 0.5) * 2000,
                (Math.random() - 0.5) * 2000
            );
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        const stars = new THREE.Points(geometry, material);
        this.scene.add(stars);
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.9);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(1, 1, 1).normalize();
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.3);
        this.scene.add(hemisphereLight);

        const atmosphereLight = new THREE.PointLight(0x4488ff, 0.5, 1000);
        atmosphereLight.position.set(0, 0, 0);
        this.scene.add(atmosphereLight);
    }

    loadEarth(callback) {
        this.loader.load(
            '/models/earth_breathing.glb',
            (gltf) => {
                this.earth = gltf.scene;

                const bbox = new THREE.Box3().setFromObject(this.earth);
                const size = bbox.getSize(new THREE.Vector3());
                this.earthSize = Math.max(size.x, size.y, size.z);

                this.earth.scale.set(80, 80, 80);
                this.earthSize = 80;

                this.earth.traverse((child) => {
                    if (child.isMesh) {
                        child.material = child.material.clone();
                        child.material.emissiveIntensity = 0.1;
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                this.scene.add(this.earth);

                this.createAtmosphere();

                console.log('The model earth is loading successfully');
                if (callback) callback();
            },
            undefined,
            (error) => {
                console.error("The model earth isn't loading successfully!", error);

                if (callback) callback();
            }
        );
    }


    loadSatellite(callback) {
        this.loader.load(
            '/models/simple_satellite_low_poly_free.glb',
            (gltf) => {
                this.satellite = gltf.scene;
                this.satellite.scale.set(2.7, 2.7, 2.7);

                this.satellite.traverse((child) => {
                    if (child.isMesh) {
                        child.material = child.material.clone();
                        child.material.envMapIntensity = 1.2;
                        child.castShadow = true;
                    }
                });

                this.scene.add(this.satellite);
                console.log('The model satellite is loading successfully');
                if (callback) callback();
            },
            undefined,
            (error) => {
                console.error("The model satellite isn't loading successfully!", error);

                if (callback) callback();
            }
        );
    }

    updateEarthRotation(deltaTime, timeScale, rotationSpeed) {
        if (this.earth) {
            this.earth.rotation.y += rotationSpeed * deltaTime * timeScale;
        }

        if (this.atmosphere) {
            this.atmosphere.rotation.y += rotationSpeed * deltaTime * timeScale * 0.95;
        }

        if (this.atmosphereGlow) {
            this.atmosphereGlow.rotation.y += rotationSpeed * deltaTime * timeScale * 0.9;
        }
    }

    updateSatellitePosition(position) {
        if (this.satellite && position && position.x !== undefined) {
            this.satellite.position.copy(position);
            this.satellite.lookAt(0, 0, 0);
        } else {
            console.error('error');
        }
    }

    toggleAtmosphere(visible) {
        if (this.atmosphere) {
            this.atmosphere.visible = visible;
        }
        if (this.atmosphereGlow) {
            this.atmosphereGlow.visible = visible;
        }
    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render(camera, controls) {
        if (controls) controls.update();
        this.renderer.render(this.scene, camera);
    }
}