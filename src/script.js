//ali 

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'lil-gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// 1. تهيئة المشهد
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000011);
const clock = new THREE.Clock();


// 2. إعداد الكاميرا
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 50, 150);

// 3. المُحسّن
const canvas = document.querySelector('canvas.webgl');
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// 4. نظام النجوم
function createStarfield() {
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
    scene.add(stars);
}
createStarfield();

const params = {
    G: 6.67430e-11,
    M_earth: 5.972e24,
    R_earth: 6378000,
    M_stellite: 1000,
    instantaneousSpeed: 0,
    currentOrbitRadius: 0,
    rho0: 1.225,
    H: 8500,
    Cd: 2.2,
    A: 10,
    earthRotationSpeed: 7.292115e-5,
    showAtmosphere: true,
    orbitRadius: 200,
    timeScale: 1000,
    physicsTimeScale: 1,
    h: 0,
    thrust: 0,
    thrustVector: { x: 0, y: 0, z: 0 },
};

let currentSpeed;
let radiusControl;
// 6. تحميل النماذج
let earth = null;
let satellite = null;
let satelliteVelocity = new THREE.Vector3();
const loader = new GLTFLoader();

// إعداد إضاءة متكاملة
function setupLighting() {
    // 1. إضاءة محيطة أساسية
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // 2. إضاءة اتجاهية رئيسية (مثل الشمس)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(1, 1, 1).normalize();
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // 3. إضاءة مساعدة
    const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.3);
    scene.add(hemisphereLight);
}

function init() {
    setupLighting();

    // تحميل الأرض مع الحفاظ على موادها الأصلية
    loader.load(
        '/models/earth_breathing.glb',
        function (gltf) {
            earth = gltf.scene;
            earth.scale.set(80, 80, 80);

            // تحسين المواد الأصلية دون استبدالها
            earth.traverse((child) => {
                if (child.isMesh) {
                    // الحفاظ على المادة الأصلية مع تحسين الإضاءة
                    child.material = child.material.clone();
                    child.material.emissiveIntensity = 0.1;

                    // تمكين الظلال
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            scene.add(earth);
            console.log('تم تحميل الأرض بنجاح مع الحفاظ على ألوانها الأصلية');

            loadSatellite();
        },
        undefined,
        function (error) {
            console.error('فشل تحميل نموذج الأرض:', error);
            loadSatellite();
        }
    );
}

function loadSatellite() {
    loader.load(
        '/models/simple_satellite_low_poly_free.glb',
        function (gltf) {
            satellite = gltf.scene;
            satellite.scale.set(2, 2, 2);
            // تحديد الموضع الابتدائي بوحدات three.js
            satellite.position.set(params.orbitRadius, 0, 0);

            // حساب السرعة المدارية الابتدائية بوحدة (م/ث)
            const r_meters = params.orbitRadius * 1000;
            const orbitalVelocity = Math.sqrt(params.G * params.M_earth / r_meters);

            // إسناد السرعة الابتدائية إلى المتجه الصحيح
            satelliteVelocity.set(0, 0, -orbitalVelocity);

            // تحسين مواد القمر الصناعي
            satellite.traverse((child) => {
                if (child.isMesh) {
                    child.material = child.material.clone();
                    child.material.envMapIntensity = 1.2;
                    child.castShadow = true;
                }
            });

            scene.add(satellite);
            console.log('تم تحميل القمر الصناعي بنجاح');
        },
        undefined,
        function (error) {
            console.error('فشل تحميل نموذج القمر الصناعي:', error);
        }
    );
}

init();


// 7. محاكاة القوى
function calculateForces(position, velocity) {

    const r = position.length();
    const h = r - params.R_earth;
    // قوة الجاذبية
    const gravityM = params.G * params.M_earth * params.M_stellite / (r * r);
    const F_gravity = position.clone().normalize().multiplyScalar(-params.G * params.M_earth * params.M_stellite / (r * r));

    // قوة السحب (نموذج أسي)
    let F_drag = new THREE.Vector3(0, 0, 0);
    if (h > 0) {
        const rho = params.rho0 * Math.exp(-h / params.H); // H بالمتر
        const v_magnitude = velocity.length();
        F_drag_magnitude = 0.5 * rho * params.Cd * params.A * v_magnitude * v_magnitude;;
        F_drag = velocity.clone().normalize().negate().multiplyScalar(F_drag_magnitude);
    }

    //قوة الدفع 
    let F_thrust = new THREE.Vector3(0, 0, 0);
    if (params.thrust > 0) {
        const thrustDirection = new THREE.Vector3(params.thrustVector.x, params.thrustVector.y, params.thrustVector.z).normalize();
        const thrustMagnitude = params.thrust; // استخدم قيمة الدفع مباشرة
        F_thrust = thrustDirection.multiplyScalar(thrustMagnitude);
    }

    return {
        gravity: F_gravity,
        drag: F_drag,
        thrust: F_thrust
    };
}

// 8. محاكاة الحركة 
function simulateOrbit(deltaTime) {
    if (!satellite) return;

    const scaledDeltaTime = deltaTime * params.physicsTimeScale;
    // الحصول على الموضع الحالي  
    const position_meters = satellite.position.clone().multiplyScalar(1000);
    // الحصول على السرعة الحالية 
    const velocity_meters = satelliteVelocity.clone();
    // حساب القوى المؤثرة
    const forces = calculateForces(position_meters, velocity_meters);
    // حساب التسارع الكلي
    const acceleration = new THREE.Vector3()
        .add(forces.gravity)
        .add(forces.drag)
        .add(forces.thrust)
        .divideScalar(params.M_stellite);

    console.log('Total Acceleration:', acceleration.length());
    console.log('Thrust Force:', forces.thrust.length());
    console.log('drag Force:', forces.drag.length());
    console.log('gravity Force:', forces.gravity.length());


    // تحديث السرعة بناءً على التسارع
    satelliteVelocity.add(acceleration.clone().multiplyScalar(scaledDeltaTime));

    params.instantaneousSpeed = satelliteVelocity.length();

    const newPosition = position_meters.add(satelliteVelocity.clone().multiplyScalar(scaledDeltaTime));

    // تحويل الموضع الجديد من متر إلى وحدات three.js 
    satellite.position.copy(newPosition.divideScalar(1000));

    params.currentOrbitRadius = satellite.position.length();
    // توجيه القمر الصناعي نحو الأرض
    satellite.lookAt(0, 0, 0);
}

function updateSatelliteOrbit() {
    if (!satellite) return;

    satellite.position.set(params.orbitRadius, 0, 0);

    const r_meters = params.orbitRadius * 1000;
    const orbitalVelocity = Math.sqrt(params.G * params.M_earth / r_meters);

    satelliteVelocity.set(0, 0, -orbitalVelocity);
}


function createGUI() {
    const gui = new GUI({ width: 300 });

    // وضع اللوحة على الجانب الأيسر من الشاشة
    gui.domElement.style.position = 'absolute';
    gui.domElement.style.left = '0px';
    gui.domElement.style.top = '0px';

    // معلومات المحاكاة
    const infoFolder = gui.addFolder('Simulation Info');
    currentSpeed = infoFolder.add(params, 'instantaneousSpeed').name('Instantaneous Speed (m/s)');
    currentSpeed.disable();
    radiusControl = infoFolder.add(params, 'currentOrbitRadius').name('Current Orbit Radius (km)');
    radiusControl.disable();
    infoFolder.open();

    // خصائص المدار
    const orbitFolder = gui.addFolder('Orbit Properties');
    orbitFolder.add(params, 'orbitRadius', 120, 600).name('Orbit Radius (km)').onChange(updateSatelliteOrbit);
    orbitFolder.add(params, 'M_stellite', 500, 5000).name('Satellite Mass (kg)').onChange(updateSatelliteOrbit);
    orbitFolder.open();

    // مقاومة الغلاف الجوي
    const dragFolder = gui.addFolder('Atmospheric Drag');
    dragFolder.add(params, 'rho0', 0.1, 2).name('Air Density ρ₀ (kg/m³)');
    dragFolder.add(params, 'H', 1000, 20000).name('Scale Height H (m)');
    dragFolder.add(params, 'A', 1, 20).name('Cross-sectional Area A (m²)');
    dragFolder.open();

    // قوة الدفع
    const thrustFolder = gui.addFolder('Thrust Control');
    thrustFolder.add(params, 'thrust', 0, 2).name('Thrust Force (N)');
    thrustFolder.add(params.thrustVector, 'x', -1, 1).name('Thrust Direction X');
    thrustFolder.add(params.thrustVector, 'y', -1, 1).name('Thrust Direction Y');
    thrustFolder.add(params.thrustVector, 'z', -1, 1).name('Thrust Direction Z');
    thrustFolder.open();

    // التحكم الزمني
    const timeFolder = gui.addFolder('Time Control');
    timeFolder.add(params, 'physicsTimeScale', 1, 100).name('Time Acceleration');
    timeFolder.open();
}

createGUI();

// 10. التحكم بالكاميرا
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 20;
controls.maxDistance = 500;

// 11. دورة التحريك
function animate() {
    requestAnimationFrame(animate);
    const deltaTime = clock.getDelta(); // استخدام ساعة three.js

    if (earth) earth.rotation.y += params.earthRotationSpeed * deltaTime * params.timeScale;

    if (satellite) simulateOrbit(deltaTime);

    if (currentSpeed) currentSpeed.updateDisplay();
    if (radiusControl) radiusControl.updateDisplay();

    controls.update();
    renderer.render(scene, camera);
}

// 12. إدارة أحجام النوافذ
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 13. بدء التحريك
animate();