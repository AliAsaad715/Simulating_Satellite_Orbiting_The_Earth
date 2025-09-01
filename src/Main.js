import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Drawing } from './Drawing.js';
import { Physics } from './Physics.js';

export class Main {
    constructor() {
        this.drawing = new Drawing();
        // this.physics = new Physics();
        this.clock = new THREE.Clock();
        this.controls = null;
        this.guiControls = null;

        // this.drawing = new Drawing();
        this.physics = new Physics(this.drawing);

        this.init();
    }

    async init() {
        try {
            // 1. إعداد الأساسيات أولاً
            this.drawing.createStarfield();
            this.drawing.setupLighting();
            this.setupControls();

            // 2. تحميل النماذج بشكل متزامن
            await this.loadModels();

            // 3. تهيئة القمر الصناعي في موقعه الصحيح
            this.initializeSatellite();

            // 4. إعداد واجهة المستخدم
            this.guiControls = this.physics.createGUI();

            // 5. بدء التحريك
            this.animate();

            // 6. إعداد أحداث النافذة
            this.setupEventListeners();

            console.log('التطبيق يعمل بنجاح!');

        } catch (error) {
            console.error('خطأ في التهيئة:', error);
        }
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
            const initialPosition = this.physics.updateSatelliteOrbit();
            this.drawing.updateSatellitePosition(initialPosition);
        } else {
            console.log('القمر الصناعي لم يتم تحميله بعد');
            // حاول مرة أخرى بعد فترة إذا لزم الأمر
            setTimeout(() => this.initializeSatellite(), 100);
        }
    }

    setupControls() {
        this.controls = new OrbitControls(this.drawing.camera, this.drawing.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.minDistance = 20;
        this.controls.maxDistance = 700;

        // ضبط الكاميرا لترى المشهد بشكل أفضل
        this.drawing.camera.position.set(0, 50, 150);
        this.controls.update();
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.drawing.resize();
            this.drawing.render(this.drawing.camera, this.controls);
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const deltaTime = this.clock.getDelta();

        // تحديث دوران الأرض
        if (this.drawing.earth) {
            this.drawing.updateEarthRotation(
                deltaTime,
                this.physics.params.timeScale, // زيادة سرعة الدوران
                this.physics.params.earthRotationSpeed // زيادة سرعة الدوران
            );
        }

        // محاكاة حركة القمر الصناعي
        if (this.drawing.satellite) {
            const newPosition = this.physics.simulateOrbit(deltaTime, this.drawing.satellite.position.clone());
            this.drawing.updateSatellitePosition(newPosition);

        }

        // تحديث واجهة المستخدم
        if (this.guiControls) {
            this.guiControls.currentSpeed.updateDisplay();
            this.guiControls.radiusControl.updateDisplay();
        }

        // تحديث التحكم والتـصيير
        this.controls.update();
        this.drawing.render(this.drawing.camera, this.controls);
    }
}

// بدء التطبيق
new Main();

