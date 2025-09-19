import * as THREE from 'three';
import { GUI } from 'lil-gui';

export class Physics {
    constructor(drawing) {
        this.params = {
            G: 6.67430e-11,
            M_earth: 5.972e24,
            R_earth: 63.78000,
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
            thrustVector: { x: 0, y: 0, z: 0 },
            showAtmosphere: true,
            crashed: false,

            RPM: 10,
            d: 10,
            p: 10,
            v0: 10,
            a0: 0,
            a1: 0,
            a2: 0,
            a3: 0
        };

        this.drawing = drawing;
        this.satelliteVelocity = new THREE.Vector3();
        this.gui = null;
        this.onCrashCallback = null;
    }


    calculateForces(position_km, velocity_ms) {

        const position_m = position_km.clone().multiplyScalar(1000);
        const r = position_m.length();
        const h = r - this.params.R_earth;

        const F_gravity = position_m.clone().normalize().multiplyScalar(
            -this.params.G * this.params.M_earth * this.params.M_stellite / (r * r)
        );


        let F_drag = new THREE.Vector3(0, 0, 0);
        if (h > 0) {
            const rho = this.params.rho0 * Math.exp(-h / this.params.H);
            const v_magnitude = velocity_ms.length();
            const F_drag_magnitude = -0.5 * rho * this.params.Cd * this.params.A * v_magnitude * v_magnitude;
            F_drag = velocity_ms.clone().normalize().negate().multiplyScalar(F_drag_magnitude);
        }



        let F_thrust = new THREE.Vector3(0, 0, 0);


        let thrustMagnitude = Math.max(0, 4.392e-8 * this.params.RPM * (Math.pow(this.params.d, 3.5) / Math.sqrt(this.params.p)) * (4.233e-4 * this.params.RPM * this.params.p - this.params.v0));


        if (thrustMagnitude > 0) {
            const thrustDirection = new THREE.Vector3(
                this.params.thrustVector.x,
                this.params.thrustVector.y,
                this.params.thrustVector.z
            ).normalize();


            F_thrust = thrustDirection.multiplyScalar(thrustMagnitude);
        }



        return { gravity: F_gravity, drag: F_drag, thrust: F_thrust };
    }

    simulateOrbit(deltaTime, currentPosition_km) {

        if (this.params.crashed) {
            return currentPosition_km;
        }

        const scaledDeltaTime = deltaTime * this.params.physicsTimeScale;

        const velocity_ms = this.satelliteVelocity.clone();


        const forces = this.calculateForces(currentPosition_km, velocity_ms);

        const acceleration = new THREE.Vector3()
            .add(forces.gravity)
            .sub(forces.drag)
            .add(forces.thrust)
            .divideScalar(this.params.M_stellite);

        this.satelliteVelocity.add(acceleration.clone().multiplyScalar(scaledDeltaTime));
        this.params.instantaneousSpeed = this.satelliteVelocity.length();

        const position_m = currentPosition_km.clone().multiplyScalar(1000);


        const newPosition_m = position_m.add(this.satelliteVelocity.clone().multiplyScalar(scaledDeltaTime));

        this.params.currentOrbitRadius = newPosition_m.length() / 1000;

        const currentAltitude = this.params.currentOrbitRadius - this.params.R_earth;

        if (currentAltitude < 57) {
            this.params.crashed = true;
            if (this.onCrashCallback) {
                this.onCrashCallback();
            }
        }


        if (this.drawing.satellite) {
            this.drawing.satellite.lookAt(0, 0, 0);
        }

        return newPosition_m.divideScalar(1000);
    }

    // إعادة تعيين المحاكاة
    resetSimulation() {
        this.params.crashed = false;
        this.updateSatelliteOrbit();
    }

    updateSatelliteOrbit = () => {
        if (!this.drawing.satellite) return;

        this.drawing.satellite.position.set(this.params.orbitRadius, 0, 0);

        const r_meters = this.params.orbitRadius * 1000;
        const orbitalVelocity = Math.sqrt(this.params.G * this.params.M_earth / r_meters);


        this.satelliteVelocity.set(0, 0, -orbitalVelocity);


        this.drawing.satellite.lookAt(0, 0, 0);
    }


    updateThrust() {

        const thrustMagnitude1 = Math.max(0, 4.392e-8 * this.params.a0 * (Math.pow(this.params.a1, 3.5) / Math.sqrt(this.params.a2)) * (4.233e-4 * this.params.a0 * this.params.a2 - this.params.a3));

        if (thrustMagnitude1 > 0) {
            const thrustDirection = new THREE.Vector3(
                this.params.thrustVector.x,
                this.params.thrustVector.y,
                this.params.thrustVector.z
            ).normalize();
            F_thrust = thrustDirection.multiplyScalar(thrustMagnitude1);
        }
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
        orbitFolder.add(this.params, 'orbitRadius', 50, 600).name('Orbit Radius (km)')
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
        thrustFolder.add(this.params, 'a0', 0, 10).name('RPM ').onChange(this.updateThrust.bind(this));
        thrustFolder.add(this.params, 'a1', 0, 10).name('d').onChange(this.updateThrust.bind(this));
        thrustFolder.add(this.params, 'a2', 0, 10).name('p').onChange(this.updateThrust.bind(this));
        thrustFolder.add(this.params, 'a3', 0, 10).name('v0').onChange(this.updateThrust.bind(this));
        thrustFolder.add(this.params.thrustVector, 'x', -1, 1).name('Thrust Direction X');
        thrustFolder.add(this.params.thrustVector, 'y', -1, 1).name('Thrust Direction Y');
        thrustFolder.add(this.params.thrustVector, 'z', -1, 1).name('Thrust Direction Z');
        thrustFolder.open();

        const timeFolder = this.gui.addFolder('Time Control');
        timeFolder.add(this.params, 'physicsTimeScale', 1, 100).name('Time Acceleration');
        timeFolder.open();

        const visualFolder = this.gui.addFolder('Visualization');
        visualFolder.add(this.params, 'showAtmosphere').name('Show Atmosphere')
            .onChange((value) => {
                if (this.drawing.atmosphere) {
                    this.drawing.atmosphere.visible = value;
                }
            });
        visualFolder.open();

        const resetFolder = this.gui.addFolder('Reset');
        resetFolder.add({ reset: () => this.resetSimulation() }, 'reset').name('Reset Simulation');
        resetFolder.open();

        return { currentSpeed, radiusControl };
    }
}
