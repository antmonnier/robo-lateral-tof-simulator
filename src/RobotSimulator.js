import React, { useState, useEffect, useRef } from "react";

class PIDController {
  constructor (kp, ki, kd) {
    this.kp = kp;
    this.ki = ki;
    this.kd = kd;
    this.previousError = 0;
    this.integral = 0;
  }

  compute (setpoint, measurement, dt) {
    const error = setpoint - measurement;
    this.integral += error * dt;
    const derivative = (error - this.previousError) / dt;
    this.previousError = error;
    return this.kp * error + this.ki * this.integral + this.kd * derivative;
  }

  setParams (kp, ki, kd) {
    this.kp = kp;
    this.ki = ki;
    this.kd = kd;
  }
}

class Robot {
  constructor (initialX, initialY, initialAngle) {
    this.x = initialX;
    this.y = initialY;
    this.angle = initialAngle;
    this.leftSpeed = 0;
    this.rightSpeed = 0;
    this.targetLeftSpeed = 0;
    this.targetRightSpeed = 0;
    this.pidController = new PIDController(0.5, 0.1, 0.1);
    this.distanceRun = 0;
  }

  update (dt, wallDistance, motorPerturbation, sensorPerturbation, motorResponsiveness) {
    const setpoint = 250; // Center of the screen

    // Apply sensor perturbation
    const perturbedWallDistance = wallDistance * (1 + (Math.random() * 2 - 1) * sensorPerturbation / 100);

    const output = this.pidController.compute(setpoint, perturbedWallDistance, dt);

    // Calculate target speeds with perturbations
    const leftPerturbation = 1 + (Math.random() * 2 - 1) * motorPerturbation / 100;
    const rightPerturbation = 1 + (Math.random() * 2 - 1) * motorPerturbation / 100;
    this.targetLeftSpeed = (50 - output) * leftPerturbation;
    this.targetRightSpeed = (50 + output) * rightPerturbation;

    // Gradually change current speeds towards target speeds
    this.leftSpeed += (this.targetLeftSpeed - this.leftSpeed) * motorResponsiveness * dt;
    this.rightSpeed += (this.targetRightSpeed - this.rightSpeed) * motorResponsiveness * dt;

    const avgSpeed = (this.leftSpeed + this.rightSpeed) / 2;
    const angularVelocity = (this.rightSpeed - this.leftSpeed) / 20;
    const dx = avgSpeed * Math.cos(this.angle) * dt;
    const dy = avgSpeed * Math.sin(this.angle) * dt;
    this.x += dx;
    this.y += dy;
    this.angle += angularVelocity * dt;
    this.angle = (this.angle + 2 * Math.PI) % (2 * Math.PI);
    this.distanceRun += Math.sqrt(dx * dx + dy * dy);

    return perturbedWallDistance; // Return this for debugging
  }

  setPIDParams (kp, ki, kd) {
    this.pidController.setParams(kp, ki, kd);
  }
}

const RobotSimulator = () => {
  const [robot, setRobot] = useState(new Robot(250, 250, Math.PI / 2));
  const [wallY, setWallY] = useState(50);
  const [debugInfo, setDebugInfo] = useState({});
  const [pidParams, setPidParams] = useState({ kp: 0.5, ki: 0.1, kd: 0.1 });
  const [motorPerturbation, setMotorPerturbation] = useState(10);
  const [sensorPerturbation, setSensorPerturbation] = useState(5);
  const [motorResponsiveness, setMotorResponsiveness] = useState(5);
  const robotRef = useRef(robot);
  const canvasWidth = 500;
  const canvasHeight = 500;

  useEffect(() => {
    const intervalId = setInterval(() => {
      const dt = 0.1;
      const wallDistance = Math.abs(robotRef.current.y - wallY);
      const perturbedWallDistance = robotRef.current.update(dt, wallDistance, motorPerturbation, sensorPerturbation, motorResponsiveness);
      setRobot({ ...robotRef.current });
      setDebugInfo({
        actualWallDistance: wallDistance,
        perturbedWallDistance,
        leftSpeed: robotRef.current.leftSpeed,
        rightSpeed: robotRef.current.rightSpeed,
        targetLeftSpeed: robotRef.current.targetLeftSpeed,
        targetRightSpeed: robotRef.current.targetRightSpeed,
        y: robotRef.current.y,
        angle: robotRef.current.angle,
        distanceRun: robotRef.current.distanceRun
      });
    }, 100);
    return () => clearInterval(intervalId);
  }, [wallY, motorPerturbation, sensorPerturbation, motorResponsiveness]);

  const handlePIDChange = (param, value) => {
    const newParams = { ...pidParams, [param]: parseFloat(value) };
    setPidParams(newParams);
    robotRef.current.setPIDParams(newParams.kp, newParams.ki, newParams.kd);
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px", display: "flex" }}>
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>Robot Wall Following Simulator</h1>
        <svg width={canvasWidth} height={canvasHeight} style={{ border: "1px solid #ccc" }}>
          <line x1="0" y1={wallY} x2={canvasWidth} y2={wallY} stroke="black" strokeWidth="2" />
          <circle cx={canvasWidth / 2} cy={robot.y} r="10" fill="blue" />
          <line
            x1={canvasWidth / 2}
            y1={robot.y}
            x2={canvasWidth / 2 + 20 * Math.cos(robot.angle)}
            y2={robot.y + 20 * Math.sin(robot.angle)}
            stroke="red"
            strokeWidth="2"
          />
        </svg>
      </div>
      <div style={{ flex: 1, marginLeft: "20px" }}>
        <div style={{ marginBottom: "20px" }}>
          <label style={{ marginRight: "10px" }}>Wall Y position:</label>
          <input
            type="range"
            min="0"
            max={canvasHeight}
            value={wallY}
            onChange={(e) => setWallY(parseInt(e.target.value))}
            style={{ width: "200px" }}
          />
          <span style={{ marginLeft: "10px" }}>{wallY}</span>
        </div>
        <div style={{ marginBottom: "20px" }}>
          <label style={{ marginRight: "10px" }}>Motor Perturbation (%):</label>
          <input
            type="range"
            min="0"
            max="50"
            value={motorPerturbation}
            onChange={(e) => setMotorPerturbation(parseInt(e.target.value))}
            style={{ width: "200px" }}
          />
          <span style={{ marginLeft: "10px" }}>{motorPerturbation}%</span>
        </div>
        <div style={{ marginBottom: "20px" }}>
          <label style={{ marginRight: "10px" }}>Sensor Perturbation (%):</label>
          <input
            type="range"
            min="0"
            max="50"
            value={sensorPerturbation}
            onChange={(e) => setSensorPerturbation(parseInt(e.target.value))}
            style={{ width: "200px" }}
          />
          <span style={{ marginLeft: "10px" }}>{sensorPerturbation}%</span>
        </div>
        <div style={{ marginBottom: "20px" }}>
          <label style={{ marginRight: "10px" }}>Motor Responsiveness:</label>
          <input
            type="range"
            min="1"
            max="20"
            value={motorResponsiveness}
            onChange={(e) => setMotorResponsiveness(parseInt(e.target.value))}
            style={{ width: "200px" }}
          />
          <span style={{ marginLeft: "10px" }}>{motorResponsiveness}</span>
        </div>
        <div style={{ marginBottom: "20px" }}>
          <h3>PID Parameters:</h3>
          {Object.entries(pidParams).map(([param, value]) => (
            <div key={param} style={{ marginBottom: "10px" }}>
              <label style={{ marginRight: "10px" }}>{param.toUpperCase()}:</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.01"
                value={value}
                onChange={(e) => handlePIDChange(param, e.target.value)}
                style={{ width: "200px" }}
              />
              <span style={{ marginLeft: "10px" }}>{value.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div>
          <h2 style={{ fontSize: "18px", marginBottom: "10px" }}>Debug Information:</h2>
          <p>Actual Wall Distance: {debugInfo.actualWallDistance?.toFixed(2)}</p>
          <p>Perturbed Wall Distance: {debugInfo.perturbedWallDistance?.toFixed(2)}</p>
          <p>Robot Y: {debugInfo.y?.toFixed(2)}</p>
          <p>Robot Angle: {(debugInfo.angle * 180 / Math.PI)?.toFixed(2)}°</p>
          <p>Left Motor Speed: {debugInfo.leftSpeed?.toFixed(2)}</p>
          <p>Right Motor Speed: {debugInfo.rightSpeed?.toFixed(2)}</p>
          <p>Target Left Speed: {debugInfo.targetLeftSpeed?.toFixed(2)}</p>
          <p>Target Right Speed: {debugInfo.targetRightSpeed?.toFixed(2)}</p>
          <p>Distance Run: {debugInfo.distanceRun?.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default RobotSimulator;