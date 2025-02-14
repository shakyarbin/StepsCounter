class ReportPage {
    constructor() {
        this.loadData();
        this.initializeCharts();
        this.updateDate();
        this.updateActivityRings();
        this.loadActivityData();
    }

    updateDate() {
        const date = new Date();
        const options = { weekday: 'long', month: 'short', day: 'numeric' };
        const formattedDate = date.toLocaleDateString('en-US', options).toUpperCase();
        document.querySelector('.date').textContent = formattedDate;
    }

    loadData() {
        // Load data from localStorage
        this.reportData = JSON.parse(localStorage.getItem('stepCounterData')) || {
            weeklySteps: [0, 0, 0, 0, 0, 0, 0],
            dailySpeeds: [],
            totalSteps: 0
        };

        const state = JSON.parse(localStorage.getItem('stepCounterState')) || {
            steps: 0,
            isTracking: false
        };

        // Update step count and distance
        document.querySelector('.stat-value').textContent = state.steps.toLocaleString();
        const distance = (state.steps * 0.0007).toFixed(2);
        document.querySelectorAll('.stat-value')[1].innerHTML = `${distance}<small>MI</small>`;

        this.updateTrends();
        this.updateSummary();
    }

    updateActivityRings() {
        const state = JSON.parse(localStorage.getItem('stepCounterState')) || { steps: 0 };
        const calories = Math.round(state.steps * 0.04);
        const minutes = Math.round(state.steps * 0.0166);
        const hours = Math.round(minutes / 60);

        // Update ring stats
        document.querySelector('.ring-stat:nth-child(1) .value').innerHTML = 
            `${calories}/800<small>CAL</small>`;
        document.querySelector('.ring-stat:nth-child(2) .value').innerHTML = 
            `${minutes}/30<small>MIN</small>`;
        document.querySelector('.ring-stat:nth-child(3) .value').innerHTML = 
            `${hours}/12<small>HRS</small>`;

        // Calculate ring percentages
        const movePercent = Math.min((calories / 800) * 100, 100);
        const exercisePercent = Math.min((minutes / 30) * 100, 100);
        const standPercent = Math.min((hours / 12) * 100, 100);

        // Update ring SVG
        const rings = document.querySelector('.rings');
        rings.innerHTML = `
            <svg viewBox="0 0 100 100">
                <circle class="ring-bg" cx="50" cy="50" r="40"/>
                <circle class="ring-progress move-ring" cx="50" cy="50" r="40" 
                    style="stroke-dasharray: ${movePercent * 2.51}, 251"/>
                <circle class="ring-bg" cx="50" cy="50" r="35"/>
                <circle class="ring-progress exercise-ring" cx="50" cy="50" r="35"
                    style="stroke-dasharray: ${exercisePercent * 2.20}, 220"/>
                <circle class="ring-bg" cx="50" cy="50" r="30"/>
                <circle class="ring-progress stand-ring" cx="50" cy="50" r="30"
                    style="stroke-dasharray: ${standPercent * 1.88}, 188"/>
            </svg>
        `;
    }

    updateTrends() {
        const state = JSON.parse(localStorage.getItem('stepCounterState')) || { steps: 0 };
        const minutes = Math.round(state.steps * 0.0166);
        const distance = (state.steps * 0.0007).toFixed(1);
        const pace = ((minutes / distance) || 0).toFixed(1);

        const trends = [
            { label: 'Stand', value: '12HR/DAY', trend: 'up' },
            { label: 'Exercise', value: `${minutes}MIN/DAY`, trend: 'up' },
            { label: 'Distance', value: `${distance}MI/DAY`, trend: minutes > 30 ? 'up' : 'down' },
            { label: 'Walking Pace', value: `${pace}MIN/MI`, trend: 'up' }
        ];

        const trendGrid = document.querySelector('.trend-grid');
        trendGrid.innerHTML = trends.map(trend => `
            <div class="trend-item">
                <span class="trend-icon ${trend.trend}">
                    ${trend.trend === 'up' ? '↑' : '↓'}
                </span>
                <div class="trend-info">
                    <span class="label">${trend.label}</span>
                    <span class="value">${trend.value}</span>
                </div>
            </div>
        `).join('');
    }

    initializeCharts() {
        this.createHourlyStepsChart();
        this.createHourlyDistanceChart();
        this.createPaceChart();
    }

    createHourlyStepsChart() {
        const ctx = document.getElementById('hourlyStepsChart');
        if (!ctx) return;

        const stepsData = JSON.parse(localStorage.getItem('stepsData')) || {
            hourly: {},
            daily: {},
            weekly: {}
        };

        const now = new Date();
        const currentDate = now.toDateString();
        const currentHour = now.getHours();
        
        // Generate dummy data for testing
        const last24Hours = Array.from({length: 24}, (_, i) => {
            const hour = (currentHour - 23 + i + 24) % 24;
            const hourKey = `${hour}:00`;
            
            // Generate random steps between 100 and 1000 for testing
            return {
                hour: hourKey,
                steps: Math.floor(Math.random() * 900) + 100
            };
        });

        // Calculate percentage change
        const previousTotal = last24Hours.slice(0, 12)
            .reduce((sum, hour) => sum + hour.steps, 0);
        const currentTotal = last24Hours.slice(12)
            .reduce((sum, hour) => sum + hour.steps, 0);
        const percentChange = previousTotal > 0 ? 
            ((currentTotal - previousTotal) / previousTotal * 100).toFixed(0) : 0;

        // Update trend value
        const trendValue = document.querySelector('.trend-value');
        if (trendValue) {
            const isIncrease = percentChange >= 0;
            trendValue.textContent = `${isIncrease ? '↑' : '↓'} ${Math.abs(percentChange)}%`;
            trendValue.style.color = isIncrease ? '#32d74b' : '#ff453a';
        }

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: last24Hours.map(h => h.hour),
                datasets: [{
                    data: last24Hours.map(h => h.steps),
                    backgroundColor: '#007AFF',
                    borderRadius: 6,
                    borderSkipped: false,
                    barThickness: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: true,
                        mode: 'index',
                        intersect: false,
                        backgroundColor: '#1c1c1e',
                        titleColor: '#ffffff',
                        bodyColor: '#8e8e93',
                        borderColor: '#333333',
                        borderWidth: 1,
                        padding: 10,
                        displayColors: false,
                        callbacks: {
                            label: (context) => `${context.raw} steps`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            display: false
                        },
                        ticks: {
                            display: false
                        },
                        border: {
                            display: false
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#8e8e93',
                            font: { size: 10 },
                            maxTicksLimit: 6,
                            padding: 8,
                            callback: function(val, index) {
                                // Show fewer x-axis labels
                                return index % 4 === 0 ? this.getLabelForValue(val) : '';
                            }
                        },
                        border: {
                            display: false
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    createHourlyDistanceChart() {
        const ctx = document.getElementById('distanceHourlyChart');
        const hours = Array.from({length: 24}, (_, i) => i);
        const data = hours.map(() => Math.random() * 0.2); // Simulated hourly distance

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: hours.map(h => `${h}:00`),
                datasets: [{
                    data: data,
                    backgroundColor: '#32d74b',
                    borderRadius: 4,
                    barThickness: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        display: false,
                        beginAtZero: true
                    },
                    x: {
                        display: false
                    }
                }
            }
        });
    }

    createPaceChart() {
        const ctx = document.getElementById('paceChart');
        if (!ctx) return;

        const hourlySteps = JSON.parse(localStorage.getItem('hourlySteps')) || {};
        const currentHour = new Date().getHours();
        
        // Generate labels for last 24 hours
        const labels = Array.from({length: 24}, (_, i) => {
            const hour = (currentHour - 23 + i + 24) % 24;
            return `${hour}:00`;
        });

        // Calculate pace (steps per minute) for each hour
        const data = labels.map(hour => {
            const steps = hourlySteps[hour] || 0;
            return (steps / 60).toFixed(2); // steps per minute
        });

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Steps/min',
                    data: data,
                    borderColor: '#32d74b',
                    backgroundColor: 'rgba(50, 215, 75, 0.05)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 1.5,
                    pointRadius: 0,
                    pointHoverRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        display: true,
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#8e8e93',
                            font: { size: 10 },
                            maxTicksLimit: 5,
                            padding: 8
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#8e8e93',
                            font: { size: 10 },
                            maxTicksLimit: 4,
                            padding: 8
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                elements: {
                    line: {
                        tension: 0.4
                    }
                }
            }
        });
    }

    updateSummary() {
        document.getElementById('weeklyAvg').textContent = 
            Math.round(this.reportData.weeklySteps.reduce((a, b) => a + b, 0) / 7);
        document.getElementById('bestDay').textContent = 
            Math.max(...this.reportData.weeklySteps);
        document.getElementById('totalDistance').textContent = 
            (this.reportData.totalSteps * 0.0007).toFixed(2);
    }

    loadActivityData() {
        const activeTimeData = JSON.parse(localStorage.getItem('activeTime')) || {
            minutes: 0,
            lastUpdated: Date.now()
        };
        
        const activeHours = Math.floor(activeTimeData.minutes / 60);
        const standHours = Math.min(activeHours, 12); // Cap at 12 hours
        
        // Update the activity rings with real data
        const rings = document.querySelector('.rings');
        if (rings) {
            const movePercent = Math.min((this.reportData.totalSteps / 800) * 100, 100);
            const exercisePercent = Math.min((activeTimeData.minutes / 30) * 100, 100);
            const standPercent = Math.min((standHours / 12) * 100, 100);
            
            rings.innerHTML = `
                <svg viewBox="0 0 100 100">
                    <circle class="ring-bg" cx="50" cy="50" r="40"/>
                    <circle class="ring-progress move-ring" cx="50" cy="50" r="40" 
                        style="stroke-dasharray: ${movePercent * 2.51}, 251"/>
                    <circle class="ring-bg" cx="50" cy="50" r="35"/>
                    <circle class="ring-progress exercise-ring" cx="50" cy="50" r="35"
                        style="stroke-dasharray: ${exercisePercent * 2.20}, 220"/>
                    <circle class="ring-bg" cx="50" cy="50" r="30"/>
                    <circle class="ring-progress stand-ring" cx="50" cy="50" r="30"
                        style="stroke-dasharray: ${standPercent * 1.88}, 188"/>
                </svg>
            `;

            // Update ring stats
            document.querySelector('.ring-stat:nth-child(1) .value').innerHTML = 
                `${this.reportData.totalSteps}/800<small>CAL</small>`;
            document.querySelector('.ring-stat:nth-child(2) .value').innerHTML = 
                `${Math.round(activeTimeData.minutes)}/30<small>MIN</small>`;
            document.querySelector('.ring-stat:nth-child(3) .value').innerHTML = 
                `${standHours}/12<small>HRS</small>`;
        }
    }
}

// Initialize the report page
document.addEventListener('DOMContentLoaded', () => {
    // Load saved data
    const savedData = localStorage.getItem('stepCounterData');
    if (savedData) {
        const data = JSON.parse(savedData);
        updateStats(data);
        initializeHourlyChart();
    }
});

function updateStats(data) {
    // Update step count
    document.getElementById('stepCount').textContent = data.steps || 0;
    
    // Update distance (km) - assuming average step length of 0.7 meters
    const distanceKm = ((data.steps || 0) * 0.0007).toFixed(2);
    document.getElementById('stepDistance').textContent = distanceKm;
    
    // Update calories
    const calories = Math.round((data.steps || 0) * 0.04);
    document.getElementById('moveValue').textContent = `${calories}/800`;
    
    // Update exercise minutes (assuming 100 steps per minute)
    const minutes = Math.round((data.steps || 0) / 100);
    document.getElementById('exerciseValue').textContent = `${minutes}/30`;
    
    // Calculate speed (km/h)
    const hours = minutes / 60;
    const speed = hours > 0 ? (distanceKm / hours).toFixed(1) : 0;
    
    // Update trends
    updateTrends(speed, distanceKm);
}

function updateTrends(speed, distance) {
    const trends = document.querySelectorAll('.trend-value');
    trends[2].textContent = `${distance}KM/DAY`;
    trends[3].textContent = `${speed}KM/H`;
}

function initializeHourlyChart() {
    const ctx = document.getElementById('hourlyStepsChart').getContext('2d');
    
    // Get current hour
    const currentHour = new Date().getHours();
    
    // Generate labels for last 24 hours
    const labels = Array.from({length: 24}, (_, i) => {
        const hour = (currentHour - 23 + i + 24) % 24;
        return `${hour}:00`;
    });
    
    // Get hourly data from localStorage or generate empty data
    const hourlyData = JSON.parse(localStorage.getItem('hourlySteps') || '[]');
    const data = new Array(24).fill(0);
    hourlyData.forEach(entry => {
        const hour = new Date(entry.timestamp).getHours();
        data[hour] += entry.steps;
    });

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Steps',
                data: data,
                backgroundColor: 'rgba(255, 149, 0, 0.5)',
                borderColor: 'rgba(255, 149, 0, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#8e8e93'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#8e8e93',
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
} 