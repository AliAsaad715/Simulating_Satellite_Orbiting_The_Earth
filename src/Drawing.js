// import * as THREE from 'three';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// export class Drawing {
//     constructor() {
//         this.scene = new THREE.Scene();
//         this.scene.background = new THREE.Color(0x000011);

//         this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//         this.camera.position.set(0, 50, 150);

//         this.canvas = document.querySelector('canvas.webgl');
//         this.renderer = new THREE.WebGLRenderer({
//             canvas: this.canvas,
//             antialias: true
//         });
//         this.renderer.setSize(window.innerWidth, window.innerHeight);
//         this.renderer.shadowMap.enabled = true;
//         this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//         this.earth = null;
//         this.satellite = null;
//         this.loader = new GLTFLoader();
//     }

//     createStarfield() {
//         const geometry = new THREE.BufferGeometry();
//         const material = new THREE.PointsMaterial({
//             color: 0xffffff,
//             size: 0.2,
//             sizeAttenuation: true
//         });

//         const vertices = [];
//         for (let i = 0; i < 10000; i++) {
//             vertices.push(
//                 (Math.random() - 0.5) * 2000,
//                 (Math.random() - 0.5) * 2000,
//                 (Math.random() - 0.5) * 2000
//             );
//         }

//         geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
//         const stars = new THREE.Points(geometry, material);
//         this.scene.add(stars);
//     }

//     setupLighting() {
//         const ambientLight = new THREE.AmbientLight(0xffffff, 1.9);
//         this.scene.add(ambientLight);

//         const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
//         directionalLight.position.set(1, 1, 1).normalize();
//         directionalLight.castShadow = true;
//         this.scene.add(directionalLight);

//         const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.3);
//         this.scene.add(hemisphereLight);
//     }

//     loadEarth(callback) {
//         this.loader.load(
//             '/models/earth_breathing.glb',
//             (gltf) => {
//                 this.earth = gltf.scene;
//                 this.earth.scale.set(80, 80, 80);

//                 this.earth.traverse((child) => {
//                     if (child.isMesh) {
//                         child.material = child.material.clone();
//                         child.material.emissiveIntensity = 0.1;
//                         child.castShadow = true;
//                         child.receiveShadow = true;
//                     }
//                 });

//                 this.scene.add(this.earth);
//                 console.log('تم تحميل الأرض بنجاح');
//                 if (callback) callback();
//             },
//             undefined,
//             (error) => {
//                 console.error('فشل تحميل نموذج الأرض:', error);
//                 if (callback) callback();
//             }
//         );
//     }

//     loadSatellite(callback) {
//         this.loader.load(
//             '/models/simple_satellite_low_poly_free.glb',
//             (gltf) => {
//                 this.satellite = gltf.scene;
//                 this.satellite.scale.set(2.4, 2.4, 2.4);

//                 this.satellite.traverse((child) => {
//                     if (child.isMesh) {
//                         child.material = child.material.clone();
//                         child.material.envMapIntensity = 1.2;
//                         child.castShadow = true;
//                     }
//                 });

//                 this.scene.add(this.satellite);


//                 console.log('تم تحميل القمر الصناعي بنجاح ');
//                 if (callback) callback();
//             },
//             undefined,
//             (error) => {
//                 console.error('فشل تحميل نموذج القمر الصناعي:', error);
//             }
//         );
//     }

//     updateEarthRotation(deltaTime, timeScale, rotationSpeed) {
//         if (this.earth) {
//             this.earth.rotation.y += rotationSpeed * deltaTime * timeScale;
//         }
//     }

//     updateSatellitePosition(position) {
//         if (this.satellite) {
//             this.satellite.position.copy(position);
//             this.satellite.lookAt(0, 0, 0);
//         }
//     }

//     resize() {
//         this.camera.aspect = window.innerWidth / window.innerHeight;
//         this.camera.updateProjectionMatrix();
//         this.renderer.setSize(window.innerWidth, window.innerHeight);
//     }

//     render(camera, controls) {
//         if (controls) controls.update();
//         this.renderer.render(this.scene, camera);
//     }

// }

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

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
    }

    loadEarth(callback) {
        this.loader.load(
            '/models/earth_breathing.glb',
            (gltf) => {
                this.earth = gltf.scene;
                this.earth.scale.set(80, 80, 80);

                this.earth.traverse((child) => {
                    if (child.isMesh) {
                        child.material = child.material.clone();
                        child.material.emissiveIntensity = 0.1;
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                this.scene.add(this.earth);
                console.log('تم تحميل الأرض بنجاح');
                if (callback) callback();
            },
            undefined,
            (error) => {
                console.error('فشل تحميل نموذج الأرض:', error);
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
                console.log('تم تحميل القمر الصناعي بنجاح');
                if (callback) callback();
            },
            undefined,
            (error) => {
                console.error('فشل تحميل نموذج القمر الصناعي:', error);
            }
        );
    }

    updateEarthRotation(deltaTime, timeScale, rotationSpeed) {
        if (this.earth) {
            this.earth.rotation.y += rotationSpeed * deltaTime * timeScale;
        }
    }

    updateSatellitePosition(position) {
        if (this.satellite && position && position.x !== undefined) {
            this.satellite.position.copy(position);
            this.satellite.lookAt(0, 0, 0);
        } else {
            console.error('لا يمكن تحديث موقع القمر: إما القمر غير موجود أو الموقع غير صالح');
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