class StepCounter {
    constructor() {
        this.steps = 0;
        this.distance = 0;
        this.calories = 0;
        this.duration = 0;
        this.isRunning = false;
        this.lastAccel = { x: 0, y: 0, z: 0 };
        this.threshold = 10; // Sensitivity threshold
        this.stepLength = 0.7; // Average step length in meters

        this.initializeElements();
        this.initializeEventListeners();
    }

    initializeElements() {
        this.stepsElement = document.getElementById('steps');
        this.distanceElement = document.getElementById('distance');
        this.caloriesElement = document.getElementById('calories');
        this.durationElement = document.getElementById('duration');
        this.pointer = document.getElementById('pointer');
        this.startBtn = document.getElementById('startBtn');
        
        // Initialize progress ring
        this.circle = document.querySelector('.progress-ring-circle');
        const circumference = 2 * Math.PI * 140;
        this.circle.style.strokeDasharray = `${circumference} ${circumference}`;
        this.circle.style.strokeDashoffset = circumference;
    }

    initializeEventListeners() {
        this.startBtn.addEventListener('click', () => this.toggleTracking());

        if (window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', (event) => this.handleMotion(event));
        } else {
            alert('Device motion not supported on this device');
        }
    }

    toggleTracking() {
        this.isRunning = !this.isRunning;
        this.startBtn.textContent = this.isRunning ? 'STOP' : 'START';
        this.startBtn.style.background = this.isRunning ? '#FF3B30' : '#FF9500';

        if (this.isRunning) {
            this.startTime = Date.now();
            this.updateDuration();
        }
    }

    handleMotion(event) {
        if (!this.isRunning) return;

        const acceleration = event.accelerationIncludingGravity;
        if (!acceleration) return;

        const currentAccel = {
            x: acceleration.x,
            y: acceleration.y,
            z: acceleration.z
        };

        const deltaX = Math.abs(currentAccel.x - this.lastAccel.x);
        const deltaY = Math.abs(currentAccel.y - this.lastAccel.y);
        const deltaZ = Math.abs(currentAccel.z - this.lastAccel.z);

        if (deltaX + deltaY + deltaZ > this.threshold) {
            this.incrementSteps();
        }

        this.lastAccel = currentAccel;
    }

    incrementSteps() {
        this.steps++;
        this.updateStats();
        this.updateVisuals();
        this.saveToLocalStorage();
    }

    updateStats() {
        // Update display elements
        this.stepsElement.textContent = this.steps;
        this.distance = (this.steps * this.stepLength / 1000).toFixed(2);
        this.distanceElement.textContent = this.distance;
        this.calories = Math.floor(this.steps * 0.04);
        this.caloriesElement.textContent = this.calories;
    }

    updateVisuals() {
        // Update progress ring with smoother animation
        const circumference = 2 * Math.PI * 140;
        const maxSteps = 1000; // Full circle at 1000 steps
        const progress = Math.min(this.steps / maxSteps, 1);
        const offset = circumference - (progress * circumference);
        this.circle.style.strokeDashoffset = offset;

        // Rotate gradient based on progress
        const gradientRotation = progress * 360;
        const gradient = document.querySelector('#gradient');
        gradient.setAttribute('gradientTransform', `rotate(${gradientRotation} 0.5 0.5)`);

        // Update pointer position
        const pointerProgress = Math.min(this.steps / maxSteps, 1);
        this.pointer.style.left = `${pointerProgress * 100}%`;
    }

    updateDuration() {
        if (!this.isRunning) return;

        const elapsed = Math.floor((Date.now() - this.startTime) / 1000 / 60);
        this.duration = elapsed;
        this.durationElement.textContent = elapsed;
        setTimeout(() => this.updateDuration(), 1000);
    }

    saveToLocalStorage() {
        const data = {
            steps: this.steps,
            distance: this.distance,
            calories: this.calories,
            duration: this.duration,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('stepData', JSON.stringify(data));
    }
}

// Initialize the step counter when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new StepCounter();
}); 