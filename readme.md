# Simulation Of Satellite


## 🛰️ Overview
A 3D satellite simulation project built with modern web technologies. This simulation demonstrates satellite orbit mechanics and visualization in space.



## 🌌 Physics Simulation Features
Three Fundamental Forces Implemented:
1. Gravitational Force 🌍

      Newton's Law of Universal Gravitation: F = G × (m₁ × m₂) / r²
    
      Realistic Earth gravity simulation (9.8 m/s² at surface)
    
      Inverse-square law for altitude-dependent gravity
    
      Orbital mechanics including elliptical orbits
    
      Gravity assist calculations for trajectory planning

2. Atmospheric Drag Force 💨
   
      Altitude-dependent atmospheric density modeling
    
      Drag coefficient based on satellite geometry
    
      Velocity-dependent resistance calculations
    
      Orbital decay simulation due to atmospheric friction
    
      Thermospheric and exospheric layer effects

3. Thrust/Propulsion Force 🚀
   
      Variable thrust magnitude control
    
      Directional propulsion in 3D space
      
      Fuel consumption and mass change calculations
    
      Orbital maneuvers: altitude changes, plane changes
    
      Attitude control system simulation



## Installation
Clone the repository:
```bash
git clone https://github.com/AliAsaad715/Simulating_Satellite_Orbiting_The_Earth

cd Simulating_Satellite_Orbiting_The_Earth
```

## Setup
1. Download [Node.js](https://nodejs.org/en/download/).
2. Run this followed commands:

``` bash
# Install dependencies (only the first time)
npm install

# Run the local server at localhost:8080
npm run dev

# Build for production in the dist/ directory
npm run build
```
3. Open your browser to: http://localhost:8080

## 🎮 Simulation Controls
### Force Manipulation
Gravity Adjustment: Modify gravitational constant

Drag Coefficient: Change atmospheric resistance

Thrust Control: Activate/deactivate propulsion

Vector Direction: Control thrust direction in 3D space

### Camera Controls
Orbit Controls: Rotate around the simulation

Zoom: Mouse wheel or pinch gestures

## 🎯 Learning Objectives
Understand how gravity governs satellite motion

Analyze atmospheric drag effects on different orbits

Experiment with orbital maneuvers using thrust

Observe energy conservation in orbital systems

Study the balance between gravitational and centrifugal forces

## 🔧 Technical Specifications
Framework: Three.js + JavaScript ES6+

Rendering: WebGL 2.0

Physics Engine: Custom implementation

Performance: 60 FPS target

Browser Support: Chrome, Firefox, Safari, Edge
