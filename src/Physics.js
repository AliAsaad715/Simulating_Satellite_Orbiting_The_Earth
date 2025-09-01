// import * as THREE from 'three';
// import { GUI } from 'lil-gui';
// import { Drawing } from './Drawing';

// export class Physics {
//     constructor() {
//         this.params = {
//             G: 6.67430e-11,
//             M_earth: 5.972e24,
//             R_earth: 6378000,
//             M_stellite: 1000,
//             instantaneousSpeed: 0,
//             currentOrbitRadius: 0,
//             rho0: 1.225,
//             H: 8500,
//             Cd: 2.2,
//             A: 10,
//             earthRotationSpeed: 7.292115e-5,
//             orbitRadius: 200,
//             physicsTimeScale: 1,
//             thrust: 0,
//             thrustVector: { x: 0, y: 0, z: 0 }
//         };

//         this.satelliteVelocity = new THREE.Vector3();
//         this.gui = null;
//     }

//     calculateForces(position, velocity) {
//         const r = position.length();
//         const h = r - this.params.R_earth;

//         // قوة الجاذبية
//         const F_gravity = position.clone().normalize().multiplyScalar(
//             -this.params.G * this.params.M_earth * this.params.M_stellite / (r * r)
//         );

//         // قوة السحب
//         let F_drag = new THREE.Vector3(0, 0, 0);
//         if (h > 0) {
//             const rho = this.params.rho0 * Math.exp(-h / this.params.H);
//             const v_magnitude = velocity.length();
//             const F_drag_magnitude = 0.5 * rho * this.params.Cd * this.params.A * v_magnitude * v_magnitude;
//             F_drag = velocity.clone().normalize().negate().multiplyScalar(F_drag_magnitude);
//         }

//         // قوة الدفع
//         let F_thrust = new THREE.Vector3(0, 0, 0);
//         if (this.params.thrust > 0) {
//             const thrustDirection = new THREE.Vector3(
//                 this.params.thrustVector.x,
//                 this.params.thrustVector.y,
//                 this.params.thrustVector.z
//             ).normalize();
//             F_thrust = thrustDirection.multiplyScalar(this.params.thrust);
//         }

//         return { gravity: F_gravity, drag: F_drag, thrust: F_thrust };
//     }

//     simulateOrbit(deltaTime, currentPosition) {
//         const scaledDeltaTime = deltaTime * this.params.physicsTimeScale;
//         const position_meters = currentPosition.clone().multiplyScalar(1000);
//         const velocity_meters = this.satelliteVelocity.clone();

//         const forces = this.calculateForces(position_meters, velocity_meters);
//         const acceleration = new THREE.Vector3()
//             .add(forces.gravity)
//             .add(forces.drag)
//             .add(forces.thrust)
//             .divideScalar(this.params.M_stellite);

//         this.satelliteVelocity.add(acceleration.clone().multiplyScalar(scaledDeltaTime));
//         this.params.instantaneousSpeed = this.satelliteVelocity.length();

//         const newPosition = position_meters.add(this.satelliteVelocity.clone().multiplyScalar(scaledDeltaTime));
//         this.params.currentOrbitRadius = newPosition.length() / 1000;

//         return newPosition.divideScalar(1000);
//     }

//     updateSatelliteOrbit() {
//         const r_meters = this.params.orbitRadius * 1000;
//         const orbitalVelocity = Math.sqrt(this.params.G * this.params.M_earth / r_meters);
//         this.satelliteVelocity.set(0, 0, -orbitalVelocity);

//         return new THREE.Vector3(this.params.orbitRadius, 0, 0);

//     }

//     createGUI() {
//         this.gui = new GUI({ width: 300 });
//         this.gui.domElement.style.position = 'absolute';
//         this.gui.domElement.style.left = '0px';
//         this.gui.domElement.style.top = '0px';

//         const infoFolder = this.gui.addFolder('Simulation Info');
//         const currentSpeed = infoFolder.add(this.params, 'instantaneousSpeed').name('Instantaneous Speed (m/s)');
//         currentSpeed.disable();
//         const radiusControl = infoFolder.add(this.params, 'currentOrbitRadius').name('Current Orbit Radius (km)');
//         radiusControl.disable();
//         infoFolder.open();

//         const orbitFolder = this.gui.addFolder('Orbit Properties');
//         orbitFolder.add(this.params, 'orbitRadius', 120, 600).name('Orbit Radius (km)')
//             .onChange(() => this.updateSatelliteOrbit());
//         orbitFolder.add(this.params, 'M_stellite', 500, 5000).name('Satellite Mass (kg)')
//             .onChange(() => this.updateSatelliteOrbit());
//         orbitFolder.open();

//         const dragFolder = this.gui.addFolder('Atmospheric Drag');
//         dragFolder.add(this.params, 'rho0', 0.1, 2).name('Air Density ρ₀ (kg/m³)');
//         dragFolder.add(this.params, 'H', 1000, 20000).name('Scale Height H (m)');
//         dragFolder.add(this.params, 'A', 1, 20).name('Cross-sectional Area A (m²)');
//         dragFolder.open();

//         const thrustFolder = this.gui.addFolder('Thrust Control');
//         thrustFolder.add(this.params, 'thrust', 0, 2).name('Thrust Force (N)');
//         thrustFolder.add(this.params.thrustVector, 'x', -1, 1).name('Thrust Direction X');
//         thrustFolder.add(this.params.thrustVector, 'y', -1, 1).name('Thrust Direction Y');
//         thrustFolder.add(this.params.thrustVector, 'z', -1, 1).name('Thrust Direction Z');
//         thrustFolder.open();

//         const timeFolder = this.gui.addFolder('Time Control');
//         timeFolder.add(this.params, 'physicsTimeScale', 1, 100).name('Time Acceleration');
//         timeFolder.open();

//         return { currentSpeed, radiusControl };
//     }
// }

import * as THREE from 'three';
import { GUI } from 'lil-gui';

export class Physics {
    constructor(drawing) {
        this.params = {
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
            orbitRadius: 200,
            physicsTimeScale: 1,
            timeScale: 1000,
            thrust: 0,
            thrustVector: { x: 0, y: 0, z: 0 }
        };

        this.drawing = drawing;
        this.satelliteVelocity = new THREE.Vector3();
        this.gui = null;
    }

    calculateForces(position, velocity) {
        const r = position.length();
        const h = r - this.params.R_earth;

        const F_gravity = position.clone().normalize().multiplyScalar(
            -this.params.G * this.params.M_earth * this.params.M_stellite / (r * r)
        );

        let F_drag = new THREE.Vector3(0, 0, 0);
        if (h > 0) {
            const rho = this.params.rho0 * Math.exp(-h / this.params.H);
            const v_magnitude = velocity.length();
            const F_drag_magnitude = 0.5 * rho * this.params.Cd * this.params.A * v_magnitude * v_magnitude;
            F_drag = velocity.clone().normalize().negate().multiplyScalar(F_drag_magnitude);
        }

        let F_thrust = new THREE.Vector3(0, 0, 0);
        if (this.params.thrust > 0) {
            const thrustDirection = new THREE.Vector3(
                this.params.thrustVector.x,
                this.params.thrustVector.y,
                this.params.thrustVector.z
            ).normalize();
            F_thrust = thrustDirection.multiplyScalar(this.params.thrust);
        }

        return { gravity: F_gravity, drag: F_drag, thrust: F_thrust };
    }

    simulateOrbit(deltaTime, currentPosition) {
        const scaledDeltaTime = deltaTime * this.params.physicsTimeScale;
        const position_meters = currentPosition.clone().multiplyScalar(1000);
        const velocity_meters = this.satelliteVelocity.clone();

        const forces = this.calculateForces(position_meters, velocity_meters);
        const acceleration = new THREE.Vector3()
            .add(forces.gravity)
            .add(forces.drag)
            .add(forces.thrust)
            .divideScalar(this.params.M_stellite);

        this.satelliteVelocity.add(acceleration.clone().multiplyScalar(scaledDeltaTime));
        this.params.instantaneousSpeed = this.satelliteVelocity.length();

        const newPosition = position_meters.add(this.satelliteVelocity.clone().multiplyScalar(scaledDeltaTime));
        this.params.currentOrbitRadius = newPosition.length() / 1000;

        // الحفاظ على توجه القمر نحو الأرض
        if (this.drawing.satellite) {
            this.drawing.satellite.lookAt(0, 0, 0);
        }

        return newPosition.divideScalar(1000);
    }

    updateSatelliteOrbit = () => {
        if (!this.drawing.satellite) return;

        // تحديث موقع القمر
        this.drawing.satellite.position.set(this.params.orbitRadius, 0, 0);

        // حساب السرعة المدارية الجديدة
        const r_meters = this.params.orbitRadius * 1000;
        const orbitalVelocity = Math.sqrt(this.params.G * this.params.M_earth / r_meters);

        // تصحيح اتجاه السرعة للمدار الأفقي (دائرة أفقية حول المحور Y)
        this.satelliteVelocity.set(0, 0, orbitalVelocity); // تغيير من (0, orbitalVelocity, 0)

        // جعل القمر يواجه مركز الأرض
        this.drawing.satellite.lookAt(0, 0, 0);
    }

    createGUI() {
        this.gui = new GUI({ width: 300 });
        this.gui.domElement.style.position = 'absolute';
        this.gui.domElement.style.left = '0px';
        this.gui.domElement.style.top = '0px';

        const infoFolder = this.gui.addFolder('Simulation Info');
        const currentSpeed = infoFolder.add(this.params, 'instantaneousSpeed').name('Instantaneous Speed (m/s)');
        currentSpeed.disable();
        const radiusControl = infoFolder.add(this.params, 'currentOrbitRadius').name('Current Orbit Radius (km)');
        radiusControl.disable();
        infoFolder.open();

        const orbitFolder = this.gui.addFolder('Orbit Properties');
        orbitFolder.add(this.params, 'orbitRadius', 120, 600).name('Orbit Radius (km)')
            .onChange(this.updateSatelliteOrbit);
        orbitFolder.add(this.params, 'M_stellite', 500, 5000).name('Satellite Mass (kg)')
            .onChange(this.updateSatelliteOrbit);
        orbitFolder.open();

        const dragFolder = this.gui.addFolder('Atmospheric Drag');
        dragFolder.add(this.params, 'rho0', 0.1, 2).name('Air Density ρ₀ (kg/m³)');
        dragFolder.add(this.params, 'H', 1000, 20000).name('Scale Height H (m)');
        dragFolder.add(this.params, 'A', 1, 20).name('Cross-sectional Area A (m²)');
        dragFolder.open();

        const thrustFolder = this.gui.addFolder('Thrust Control');
        thrustFolder.add(this.params, 'thrust', 0, 2).name('Thrust Force (N)');
        thrustFolder.add(this.params.thrustVector, 'x', -1, 1).name('Thrust Direction X');
        thrustFolder.add(this.params.thrustVector, 'y', -1, 1).name('Thrust Direction Y');
        thrustFolder.add(this.params.thrustVector, 'z', -1, 1).name('Thrust Direction Z');
        thrustFolder.open();

        const timeFolder = this.gui.addFolder('Time Control');
        timeFolder.add(this.params, 'physicsTimeScale', 1, 100).name('Time Acceleration');
        timeFolder.open();

        return { currentSpeed, radiusControl };
    }
}