import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Drawing } from './Drawing.js';
import { Physics } from './Physics.js';

export class Main {
    constructor() {
        this.drawing = new Drawing();
        this.clock = new THREE.Clock();
        this.controls = null;
        this.guiControls = null;
        this.physics = new Physics(this.drawing);

        
        this.sizes = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        this.crashMessageElement = this.createCrashMessageElement();

        this.init();
    }

    async init() {
        try {
            this.drawing.createStarfield();
            this.drawing.setupLighting();
            this.setupControls();

            await this.loadModels();

            this.initializeSatellite();

            this.guiControls = this.physics.createGUI();

            this.physics.onCrashCallback = this.showCrashMessage.bind(this);

            this.animate();

            this.setupEventListeners();

            console.log('success');

        } catch (error) {
            console.error('error', error);
        }
    }

   
    createCrashMessageElement() {
        const element = document.createElement('div');
        element.style.position = 'absolute';
        element.style.top = '50%';
        element.style.left = '50%';
        element.style.transform = 'translate(-50%, -50%)';
        element.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        element.style.color = 'white';
        element.style.padding = '20px';
        element.style.borderRadius = '10px';
        element.style.textAlign = 'center';
        element.style.fontSize = '24px';
        element.style.zIndex = '1000';
        element.style.display = 'none';
        element.innerHTML = `
           <h2>Satellite Crash!</h2>
             <p>The satellite has entered the atmosphere and crashed on the Earth's surface.</p>
            <button id="resetButton" style="margin-top: 15px; padding: 10px 20px; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Restart
            </button>
        `;
        document.body.appendChild(element);

        element.querySelector('#resetButton').addEventListener('click', () => {
            this.hideCrashMessage();
            this.physics.resetSimulation();
        });

        return element;
    }

    showCrashMessage() {
        this.crashMessageElement.style.display = 'block';
    }

    hideCrashMessage() {
        this.crashMessageElement.style.display = 'none';
    }

    async loadModels() {
        return new Promise((resolve, reject) => {
            this.drawing.loadEarth(() => {
                this.drawing.loadSatellite(() => {
                    resolve();
                });
            });
        });
    }

    initializeSatellite() {
        if (this.drawing.satellite) {
            this.physics.updateSatelliteOrbit();
        } else {
            setTimeout(() => this.initializeSatellite(), 100);
        }
    }

    setupControls() {
        this.controls = new OrbitControls(this.drawing.camera, this.drawing.canvas);
        this.controls.enableDamping = true;
        this.controls.minDistance = 20;
        this.controls.maxDistance = 700;

        this.drawing.camera.position.set(0, 50, 250);
        this.controls.update();
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            
            this.sizes.width = window.innerWidth;
            this.sizes.height = window.innerHeight;

            this.drawing.camera.aspect = this.sizes.width / this.sizes.height;
            this.drawing.camera.updateProjectionMatrix();

            this.drawing.renderer.setSize(this.sizes.width, this.sizes.height);
            this.drawing.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        });

        window.addEventListener('dblclick', () => {
            if (!document.fullscreenElement) {
                this.drawing.canvas.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const deltaTime = this.clock.getDelta();

        if (!this.physics.params.crashed) {
            if (this.drawing.earth) {
                this.drawing.updateEarthRotation(
                    deltaTime,
                    this.physics.params.timeScale,
                    this.physics.params.earthRotationSpeed
                );
            }

            if (this.drawing.satellite) {
                const newPosition = this.physics.simulateOrbit(deltaTime, this.drawing.satellite.position.clone());
                this.drawing.updateSatellitePosition(newPosition);
            }
        }

        if (this.guiControls) {
            this.guiControls.currentSpeed.updateDisplay();
            this.guiControls.radiusControl.updateDisplay();
        }

        this.controls.update();
        this.drawing.render(this.drawing.camera, this.controls);
    }
}

new Main();