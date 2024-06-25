# Robot Lateral TOF Simulator

This project is a web-based simulator for a robot that follows a wall using PID (Proportional-Integral-Derivative) control. It allows users to experiment with different PID parameters, motor characteristics, and sensor perturbations to understand how these factors affect the robot's ability to maintain a constant distance from the wall.

[Interactive Demo](https://robot-lateral-tof-simulator.netlify.app/)

## Features

- Interactive simulation of a wall-following robot
- Adjustable PID control parameters (Kp, Ki, Kd)
- Configurable motor perturbations to simulate real-world inconsistencies
- Adjustable sensor perturbations to simulate measurement inaccuracies
- Motor inertia simulation for more realistic behavior
- Real-time debug information display

## Prerequisites

Before you begin, ensure you have met the following requirements:

- You have installed Node.js and npm (Node Package Manager)
- You have a basic understanding of React and JavaScript

## Installing Robot Lateral TOF Simulator

To install the Robot Lateral TOF Simulator, follow these steps:

1. Clone the repository or download the source code
2. Navigate to the project directory in your terminal
3. Run the following command to install the required dependencies:

```
npm install
```

## Using Robot Lateral TOF Simulator

To use the Robot Lateral TOF Simulator, follow these steps:

1. In the project directory, run the following command to start the development server:

```
npm start
```

2. Open your web browser and navigate to `http://localhost:3000` (or the URL provided in the terminal)

3. You should now see the simulator interface. You can:
   - Adjust the wall position using the slider
   - Modify PID parameters (Kp, Ki, Kd) to change the control behavior
   - Adjust motor and sensor perturbations to simulate real-world conditions
   - Change the motor responsiveness to simulate different levels of motor inertia

4. Observe how changes in these parameters affect the robot's ability to follow the wall

## License

This project uses the following license: [MIT License](https://opensource.org/licenses/MIT).