document.addEventListener('DOMContentLoaded', () => {
    const data = JSON.parse(localStorage.getItem('stepData')) || {
        steps: 0,
        distance: 0,
        calories: 0,
        duration: 0
    };

    // Update stats
    document.getElementById('steps').textContent = data.steps;
    document.getElementById('calories').textContent = data.calories;
    document.getElementById('duration').textContent = data.duration;
    document.getElementById('distance').textContent = `${data.distance} km`;

    // Calculate and display pace
    const pace = data.duration > 0 ? (data.duration / data.distance).toFixed(2) : 0;
    document.getElementById('pace').textContent = `${pace} min/km`;
}); 