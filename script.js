//  Theme Toggle Functionality
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.themeLabel = document.getElementById('theme-label');
        this.currentTheme = localStorage.getItem('theme') || 'light';
        
        this.init();
    }
    
    init() {
        // Set initial theme
        this.setTheme(this.currentTheme);
        
        // Add event listener
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
    
    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update toggle position
        if (theme === 'dark') {
            this.themeLabel.textContent = 'Light Mode';
        } else {
            this.themeLabel.textContent = 'Dark Mode';
        }
        
        // Update chart colors
        setTimeout(() => this.updateChartColors(), 100);
    }
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        
        // Show notification
        this.showThemeNotification(newTheme);
    }
    
    showThemeNotification(theme) {
        const notification = document.createElement('div');
        notification.className = `notification info`;
        notification.innerHTML = `
            <i class="fas fa-${theme === 'dark' ? 'moon' : 'sun'}"></i>
            <span>Switched to ${theme === 'dark' ? 'Dark' : 'Light'} Mode</span>
            <button class="close-notif"><i class="fas fa-times"></i></button>
        `;
        
        document.querySelector('.container').appendChild(notification);
        
        notification.querySelector('.close-notif').addEventListener('click', () => {
            notification.remove();
        });
        
        setTimeout(() => notification.remove(), 3000);
    }
    
    updateChartColors() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#f8f9fa' : '#212529';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
        const bgColor = isDark ? '#2d2d2d' : '#ffffff';
        
        // Update charts if they exist
        if (window.elevatorController && window.elevatorController.pieChart) {
            const pieChart = window.elevatorController.pieChart;
            pieChart.options.plugins.legend.labels.color = textColor;
            pieChart.options.plugins.tooltip.backgroundColor = bgColor;
            pieChart.options.plugins.tooltip.titleColor = textColor;
            pieChart.options.plugins.tooltip.bodyColor = textColor;
            pieChart.update('none');
        }
        
        if (window.elevatorController && window.elevatorController.lineChart) {
            const lineChart = window.elevatorController.lineChart;
            lineChart.options.scales.x.ticks.color = textColor;
            lineChart.options.scales.y.ticks.color = textColor;
            lineChart.options.scales.x.grid.color = gridColor;
            lineChart.options.scales.y.grid.color = gridColor;
            lineChart.options.plugins.tooltip.backgroundColor = bgColor;
            lineChart.options.plugins.tooltip.titleColor = textColor;
            lineChart.options.plugins.tooltip.bodyColor = textColor;
            lineChart.update('none');
        }
    }
}

//  Main Elevator Controller Class
class ElevatorController {
    constructor() {
        //  COMPLETE MOORE MACHINE STATES (9 States)
        this.STATES = {
            IDLE: 'IDLE',
            MOVING_UP: 'MOVING_UP',
            MOVING_DOWN: 'MOVING_DOWN',
            DOOR_OPENING: 'DOOR_OPENING',
            DOOR_OPEN: 'DOOR_OPEN',
            DOOR_CLOSING: 'DOOR_CLOSING',
            DOOR_CLOSED: 'DOOR_CLOSED',
            EMERGENCY: 'EMERGENCY',
            OVERLOAD: 'OVERLOAD'  // Additional state for overload
        };
        
        // Initialize state
        this.currentState = this.STATES.IDLE;
        this.currentFloor = 0;
        this.targetFloor = null;
        this.requestQueue = [];
        this.doorOpen = false;
        this.emergencyActive = false;
        this.overloadActive = false;
        this.powerFailure = false;
        this.direction = 'NONE';
        this.occupants = 0;
        this.weightPercentage = 0;
        
        // Emergency tracking
        this.emergencyLog = [];
        this.preEmergencyState = null;
        
        // Statistics
        this.stats = {
            stateChanges: [],
            floorsTraveled: 0,
            doorOperations: 0,
            totalRequests: 0,
            emergencyEvents: 0,
            overloadEvents: 0,
            completedRequests: 0,
            waitTimes: [],
            startTime: null,
            lastRequestTime: null
        };
        
        // Performance metrics
        this.performance = {
            avgWaitTime: 0,
            travelEfficiency: 100,
            idleTimePercentage: 0,
            systemUptime: 0
        };
        
        // Graph data - FIXED: Added stateTimeline array
        this.chartData = {
            stateCounts: {
                'IDLE': 0,
                'MOVING_UP': 0,
                'MOVING_DOWN': 0,
                'DOOR_OPENING': 0,
                'DOOR_OPEN': 0,
                'DOOR_CLOSING': 0,
                'DOOR_CLOSED': 0,
                'EMERGENCY': 0,
                'OVERLOAD': 0
            },
            performanceMetrics: [],
            currentStateStartTime: null,
            stateTimeline: []  // FIXED: Added missing array
        };
        
        // Chart instances
        this.pieChart = null;
        this.lineChart = null;
        
        // Timers
        this.autoCloseTimer = null;
        this.movementTimer = null;
        this.emergencyFlashTimer = null;
        this.statsUpdateTimer = null;
        this.uptimeTimer = null;
        this.powerRecoveryTimer = null;
        
        // Audio elements
        this.dingSound = document.getElementById('ding-sound');
        this.emergencySound = document.getElementById('emergency-sound');
        
        // Queue processing mode
        this.queueProcessingMode = 'FCFS'; // FCFS, PRIORITY
        
        // Initialize
        this.init();
    }
    
    init() {
        this.stats.startTime = new Date();
        this.currentStateStartTime = new Date();
        
        // Initialize theme manager
        this.themeManager = new ThemeManager();
        
        // Bind events
        this.bindEvents();
        
        // Initialize charts
        this.initCharts();
        
        // Update UI
        this.updateUI();
        
        // Start timers
        this.startStatisticsUpdate();
        this.startUptimeCounter();
        
        // Log initialization
        this.logStateChange('System initialized with enhanced features');
        
        // Show welcome message
        this.showNotification('Elevator Control System Ready!', 'success');
    }
    
    initCharts() {
        // Check current theme
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#f8f9fa' : '#212529';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
        const bgColor = isDark ? '#2d2d2d' : '#ffffff';
        
        // Initialize Pie Chart (State Distribution)
        const pieCtx = document.getElementById('state-distribution-chart').getContext('2d');
        this.pieChart = new Chart(pieCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(this.chartData.stateCounts),
                datasets: [{
                    data: Object.values(this.chartData.stateCounts),
                    backgroundColor: [
                        '#6c757d',    // IDLE - gray
                        '#4361ee',    // MOVING_UP - blue
                        '#7209b7',    // MOVING_DOWN - purple
                        '#4cc9f0',    // DOOR_OPENING - cyan
                        '#20c997',    // DOOR_OPEN - teal
                        '#f8961e',    // DOOR_CLOSING - orange
                        '#495057',    // DOOR_CLOSED - dark gray
                        '#f72585',    // EMERGENCY - pink
                        '#ff6b6b'     // OVERLOAD - red
                    ],
                    borderWidth: 2,
                    borderColor: isDark ? '#2d2d2d' : '#ffffff',
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 11
                            },
                            color: textColor
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        },
                        backgroundColor: bgColor,
                        titleColor: textColor,
                        bodyColor: textColor,
                        borderColor: isDark ? '#495057' : '#dee2e6',
                        borderWidth: 1
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });
        
        // Initialize Line Chart (Performance Metrics) - FIXED
        const lineCtx = document.getElementById('performance-chart').getContext('2d');
        this.lineChart = new Chart(lineCtx, {
            type: 'line',
            data: {
                labels: ['Efficiency', 'Wait Time', 'Idle Time', 'Load'],
                datasets: [{
                    label: 'Performance Metrics',
                    data: [100, 0, 0, 0],
                    borderColor: '#4361ee',
                    backgroundColor: isDark ? 'rgba(67, 97, 238, 0.2)' : 'rgba(67, 97, 238, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#4361ee',
                    pointBorderColor: bgColor,
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: textColor,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const labels = ['Efficiency (%)', 'Avg Wait Time (s)', 'Idle Time (%)', 'System Load (%)'];
                                return `${labels[context.dataIndex]}: ${context.parsed.y}`;
                            }
                        },
                        backgroundColor: bgColor,
                        titleColor: textColor,
                        bodyColor: textColor,
                        borderColor: isDark ? '#495057' : '#dee2e6',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            color: textColor,
                            callback: (value) => `${value}%`
                        },
                        grid: {
                            color: gridColor
                        },
                        title: {
                            display: true,
                            text: 'Percentage',
                            color: textColor
                        }
                    },
                    x: {
                        ticks: {
                            color: textColor
                        },
                        grid: {
                            color: gridColor
                        }
                    }
                }
            }
        });
    }
    
    startStatisticsUpdate() {
        // Update statistics every second
        this.statsUpdateTimer = setInterval(() => this.updateStatistics(), 1000);
    }
    
    startUptimeCounter() {
        this.uptimeTimer = setInterval(() => this.updateUptime(), 1000);
    }
    
    updateUptime() {
        const now = new Date();
        const uptime = Math.floor((now - this.stats.startTime) / 1000);
        
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = uptime % 60;
        
        const uptimeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('uptime').textContent = uptimeString;
        document.getElementById('stat-uptime').textContent = uptimeString;
        
        this.performance.systemUptime = uptime;
    }
    
    updateStatistics() {
        // Update state counts for current state
        this.chartData.stateCounts[this.currentState]++;
        
        // Update stat cards
        document.getElementById('stat-state-changes').textContent = this.stats.stateChanges.length;
        document.getElementById('stat-floors-traveled').textContent = this.stats.floorsTraveled;
        document.getElementById('stat-door-operations').textContent = this.stats.doorOperations;
        document.getElementById('stat-total-requests').textContent = this.stats.totalRequests;
        document.getElementById('stat-emergency-events').textContent = this.stats.emergencyEvents;
        
        // Calculate performance metrics
        this.calculatePerformanceMetrics();
        
        // Update pie chart
        if (this.pieChart) {
            this.pieChart.data.datasets[0].data = Object.values(this.chartData.stateCounts);
            this.pieChart.update('none');
        }
        
        // Update line chart with performance metrics
        if (this.lineChart) {
            this.lineChart.data.datasets[0].data = [
                this.performance.travelEfficiency,
                Math.min(100, this.performance.avgWaitTime),
                this.performance.idleTimePercentage,
                Math.min(100, this.weightPercentage)
            ];
            this.lineChart.update('none');
        }
        
        // Update quick stats
        this.updateQuickStats();
        
        // Update advanced stats
        this.updateAdvancedStats();
        
        // Update history list
        this.updateHistoryList();
    }
    
    calculatePerformanceMetrics() {
        // Calculate average wait time
        if (this.stats.waitTimes.length > 0) {
            const totalWaitTime = this.stats.waitTimes.reduce((a, b) => a + b, 0);
            this.performance.avgWaitTime = Math.round(totalWaitTime / this.stats.waitTimes.length);
        }
        
        // Calculate travel efficiency (floors traveled vs optimal)
        const optimalFloors = this.stats.completedRequests * 1; // Assuming 1 floor per request optimal
        this.performance.travelEfficiency = optimalFloors > 0 ? 
            Math.min(100, Math.round((this.stats.floorsTraveled / optimalFloors) * 100)) : 100;
        
        // Calculate idle time percentage
        const totalTime = Math.floor((new Date() - this.stats.startTime) / 1000);
        const idleCount = this.chartData.stateCounts['IDLE'] || 0;
        this.performance.idleTimePercentage = totalTime > 0 ? 
            Math.round((idleCount / totalTime) * 100) : 0;
            
        // Add to chartData for line chart
        const now = new Date();
        if (this.chartData.performanceMetrics.length > 10) {
            this.chartData.performanceMetrics.shift();
        }
        this.chartData.performanceMetrics.push({
            time: now,
            efficiency: this.performance.travelEfficiency,
            waitTime: this.performance.avgWaitTime,
            idleTime: this.performance.idleTimePercentage,
            load: this.weightPercentage
        });
    }
    
    updateQuickStats() {
        document.getElementById('quick-active').textContent = this.currentState;
        document.getElementById('quick-floor').textContent = this.currentFloor === 0 ? 'G' : this.currentFloor;
        document.getElementById('quick-door').textContent = this.doorOpen ? 'OPEN' : 'CLOSED';
        document.getElementById('quick-queue').textContent = this.requestQueue.length;
        document.getElementById('quick-efficiency').textContent = `${this.performance.travelEfficiency}%`;
    }
    
    updateAdvancedStats() {
        document.getElementById('avg-wait-time').textContent = `${this.performance.avgWaitTime}s`;
        document.getElementById('travel-efficiency').textContent = `${this.performance.travelEfficiency}%`;
        document.getElementById('idle-time').textContent = `${this.performance.idleTimePercentage}%`;
        
        // System health
        const systemStatus = this.emergencyActive ? 'Emergency' : 
                            this.overloadActive ? 'Overload' : 
                            this.powerFailure ? 'Power Failure' : 'Healthy';
        const systemStatusElement = document.getElementById('system-status');
        systemStatusElement.textContent = systemStatus;
        systemStatusElement.className = systemStatus === 'Healthy' ? 'status-good' : 'status-danger';
        
        // Simulated memory usage (for demo)
        const memoryUsage = Math.min(100, Math.round((this.requestQueue.length / 10) * 100));
        document.getElementById('memory-usage').textContent = `${memoryUsage}%`;
        
        // Error rate
        const errorRate = this.stats.totalRequests > 0 ? 
            Math.round((this.stats.emergencyEvents / this.stats.totalRequests) * 100) : 0;
        document.getElementById('error-rate').textContent = `${errorRate}%`;
    }
    
    updateHistoryList() {
        const historyList = document.getElementById('state-history-list');
        const recentHistory = this.stats.stateChanges.slice(-5).reverse(); // Last 5, newest first
        
        if (recentHistory.length === 0) {
            historyList.innerHTML = '<div class="empty-history">No state transitions yet</div>';
            return;
        }
        
        historyList.innerHTML = recentHistory.map(transition => `
            <div class="history-item animate__animated animate__fadeIn">
                <div class="state-transition">
                    <span class="state-from">${transition.from}</span>
                    <i class="fas fa-arrow-right"></i>
                    <span class="state-to">${transition.to}</span>
                </div>
                <div class="state-floor">Floor ${transition.floor === 0 ? 'G' : transition.floor}</div>
                <div class="state-time">${new Date(transition.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</div>
            </div>
        `).join('');
    }
    
    //  MOORE MACHINE: Outputs based SOLELY on current state
    getOutputs() {
        switch(this.currentState) {
            case this.STATES.IDLE:
                return {
                    motor: 'STOP',
                    door: 'CLOSED',
                    direction: 'NONE',
                    light: this.occupants > 0 ? 'ON' : 'OFF',
                    alarm: 'OFF',
                    display: `Floor ${this.currentFloor === 0 ? 'G' : this.currentFloor}`,
                    weight: `${this.weightPercentage}%`
                };
                
            case this.STATES.MOVING_UP:
                return {
                    motor: 'UP',
                    door: 'CLOSED',
                    direction: 'UP ↑',
                    light: 'ON',
                    alarm: 'OFF',
                    display: `Moving to ${this.targetFloor === 0 ? 'G' : this.targetFloor}`,
                    weight: `${this.weightPercentage}%`
                };
                
            case this.STATES.MOVING_DOWN:
                return {
                    motor: 'DOWN',
                    door: 'CLOSED',
                    direction: 'DOWN ↓',
                    light: 'ON',
                    alarm: 'OFF',
                    display: `Moving to ${this.targetFloor === 0 ? 'G' : this.targetFloor}`,
                    weight: `${this.weightPercentage}%`
                };
                
            case this.STATES.DOOR_OPENING:
                return {
                    motor: 'STOP',
                    door: 'OPENING',
                    direction: 'NONE',
                    light: 'ON',
                    alarm: 'OFF',
                    display: `Opening at ${this.currentFloor === 0 ? 'G' : this.currentFloor}`,
                    audio: 'DING',
                    weight: `${this.weightPercentage}%`
                };
                
            case this.STATES.DOOR_OPEN:
                return {
                    motor: 'STOP',
                    door: 'OPEN',
                    direction: 'NONE',
                    light: 'ON',
                    alarm: 'OFF',
                    display: `Door Open at ${this.currentFloor === 0 ? 'G' : this.currentFloor}`,
                    timer: '5s',
                    weight: `${this.weightPercentage}%`
                };
                
            case this.STATES.DOOR_CLOSING:
                return {
                    motor: 'STOP',
                    door: 'CLOSING',
                    direction: 'NONE',
                    light: 'ON',
                    alarm: 'OFF',
                    display: 'Closing Door',
                    weight: `${this.weightPercentage}%`
                };
                
            case this.STATES.DOOR_CLOSED:
                return {
                    motor: 'STOP',
                    door: 'CLOSED',
                    direction: 'NONE',
                    light: this.occupants > 0 ? 'ON' : 'OFF',
                    alarm: 'OFF',
                    display: `Floor ${this.currentFloor === 0 ? 'G' : this.currentFloor}`,
                    safetyCheck: 'COMPLETE',
                    weight: `${this.weightPercentage}%`
                };
                
            case this.STATES.EMERGENCY:
                return {
                    motor: 'STOP',
                    door: this.doorOpen ? 'OPEN' : 'CLOSED',
                    direction: 'NONE',
                    light: 'FLASHING',
                    alarm: 'ON',
                    display: ' EMERGENCY ',
                    emergencyLight: 'ON',
                    announcement: 'Emergency stop activated',
                    weight: `${this.weightPercentage}%`
                };
                
            case this.STATES.OVERLOAD:
                return {
                    motor: 'STOP',
                    door: 'OPEN',
                    direction: 'NONE',
                    light: 'FLASHING',
                    alarm: 'ON',
                    display: ' OVERLOAD ',
                    announcement: 'Weight limit exceeded',
                    weight: `${this.weightPercentage}%`
                };
                
            default:
                return {};
        }
    }
    
    // State transition function
    transitionTo(newState) {
        if (this.currentState === newState) return;
        
        // Calculate state duration
        const now = new Date();
        const stateDuration = this.currentStateStartTime ? 
            Math.floor((now - this.currentStateStartTime) / 1000) : 0;
        
        // Log state change
        this.logStateChange(`${this.currentState} → ${newState} (${stateDuration}s)`);
        
        // Add to timeline
        this.chartData.stateTimeline.push({
            state: this.currentState,
            duration: stateDuration,
            endTime: now
        });
        
        // Update state
        const previousState = this.currentState;
        this.currentState = newState;
        this.currentStateStartTime = now;
        
        // Update statistics
        this.stats.stateChanges.push({
            from: previousState,
            to: newState,
            time: now,
            floor: this.currentFloor,
            duration: stateDuration
        });
        
        // Play sound effects
        this.playStateSound(newState);
        
        // Update UI
        this.updateUI();
        
        // Handle state-specific behavior
        this.handleStateBehavior();
    }
    
    playStateSound(state) {
        try {
            if (state === this.STATES.DOOR_OPENING) {
                this.dingSound.currentTime = 0;
                this.dingSound.play().catch(e => console.log('Audio play failed:', e));
            } else if (state === this.STATES.EMERGENCY) {
                this.emergencySound.currentTime = 0;
                this.emergencySound.play().catch(e => console.log('Audio play failed:', e));
            }
        } catch (e) {
            console.log('Audio not supported');
        }
    }
    
    handleStateBehavior() {
        // Clear any existing timers
        clearTimeout(this.autoCloseTimer);
        clearTimeout(this.movementTimer);
        
        switch(this.currentState) {
            case this.STATES.MOVING_UP:
                this.moveElevator('UP');
                break;
                
            case this.STATES.MOVING_DOWN:
                this.moveElevator('DOWN');
                break;
                
            case this.STATES.DOOR_OPENING:
                this.stats.doorOperations++;
                this.autoCloseTimer = setTimeout(() => {
                    if (this.currentState === this.STATES.DOOR_OPENING && !this.emergencyActive && !this.overloadActive) {
                        this.doorOpen = true;
                        this.transitionTo(this.STATES.DOOR_OPEN);
                    }
                }, 2000);
                break;
                
            case this.STATES.DOOR_OPEN:
                // Auto close after 5 seconds
                this.autoCloseTimer = setTimeout(() => {
                    if (this.currentState === this.STATES.DOOR_OPEN && !this.emergencyActive && !this.overloadActive) {
                        this.transitionTo(this.STATES.DOOR_CLOSING);
                    }
                }, 5000);
                break;
                
            case this.STATES.DOOR_CLOSING:
                this.autoCloseTimer = setTimeout(() => {
                    if (this.currentState === this.STATES.DOOR_CLOSING && !this.emergencyActive && !this.overloadActive) {
                        this.doorOpen = false;
                        this.stats.doorOperations++;
                        this.transitionTo(this.STATES.DOOR_CLOSED);
                    }
                }, 2000);
                break;
                
            case this.STATES.DOOR_CLOSED:
                // Wait 1 second in CLOSED state, then check queue
                this.autoCloseTimer = setTimeout(() => {
                    if (this.currentState === this.STATES.DOOR_CLOSED && !this.emergencyActive && !this.overloadActive) {
                        this.checkQueue();
                    }
                }, 1000);
                break;
                
            case this.STATES.EMERGENCY:
                this.triggerEmergencyProtocols();
                break;
                
            case this.STATES.OVERLOAD:
                this.triggerOverloadProtocols();
                break;
        }
    }
    
    moveElevator(direction) {
        const floorHeight = 80;
        const targetPosition = this.targetFloor * floorHeight;
        const elevator = document.getElementById('elevator');
        
        // Calculate travel time (2 seconds per floor)
        const floorsToMove = Math.abs(this.targetFloor - this.currentFloor);
        const travelTime = floorsToMove * 2000;
        
        // Animate movement
        elevator.style.transition = `bottom ${travelTime}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        elevator.style.bottom = `${targetPosition}px`;
        
        // Update floor counter during movement
        let floorsMoved = 0;
        const interval = setInterval(() => {
            if (floorsMoved < floorsToMove) {
                floorsMoved++;
                this.stats.floorsTraveled++;
            }
        }, 2000);
        
        // Arrive at floor
        this.movementTimer = setTimeout(() => {
            clearInterval(interval);
            this.currentFloor = this.targetFloor;
            
            if (!this.emergencyActive && !this.overloadActive) {
                this.transitionTo(this.STATES.DOOR_OPENING);
            }
            
            // Update elevator position
            elevator.style.bottom = `${this.currentFloor * floorHeight}px`;
        }, travelTime);
    }
    
    requestFloor(floor, direction = null, priority = false) {
        if (this.emergencyActive || this.overloadActive || this.powerFailure) {
            this.showNotification('System not available - cannot process requests', 'error');
            return;
        }
        
        floor = parseInt(floor);
        this.stats.totalRequests++;
        this.stats.lastRequestTime = new Date();
        
        // Same floor request
        if (floor === this.currentFloor && this.currentState === this.STATES.IDLE) {
            this.targetFloor = floor;
            this.transitionTo(this.STATES.DOOR_OPENING);
            this.showNotification(`Already at floor ${floor === 0 ? 'G' : floor} - opening doors`, 'info');
            return;
        }
        
        // Add to queue
        const request = {
            floor,
            direction,
            priority,
            time: new Date(),
            id: Date.now(),
            waitStart: new Date()
        };
        
        if (priority && this.queueProcessingMode === 'PRIORITY') {
            // Add to beginning of queue for priority
            this.requestQueue.unshift(request);
        } else {
            this.requestQueue.push(request);
        }
        
        this.updateQueueDisplay();
        this.showNotification(`Request added: Floor ${floor === 0 ? 'G' : floor} ${direction ? `(${direction})` : ''}`, 'success');
        
        // Process if idle or door closed
        if (this.currentState === this.STATES.IDLE || this.currentState === this.STATES.DOOR_CLOSED) {
            this.processNextRequest();
        }
    }
    
    processNextRequest() {
        if (this.requestQueue.length === 0) {
            if (this.currentState === this.STATES.DOOR_CLOSED) {
                this.transitionTo(this.STATES.IDLE);
            }
            return;
        }
        
        // Get next request based on processing mode
        let nextRequest;
        if (this.queueProcessingMode === 'PRIORITY') {
            // Find first priority request, otherwise first in queue
            nextRequest = this.requestQueue.find(req => req.priority) || this.requestQueue[0];
        } else {
            nextRequest = this.requestQueue[0];
        }
        
        // Remove the request from queue
        const requestIndex = this.requestQueue.findIndex(req => req.id === nextRequest.id);
        this.requestQueue.splice(requestIndex, 1);
        
        this.targetFloor = nextRequest.floor;
        this.direction = nextRequest.direction || (this.targetFloor > this.currentFloor ? 'UP' : 'DOWN');
        
        // Calculate wait time
        const waitTime = Math.floor((new Date() - nextRequest.waitStart) / 1000);
        this.stats.waitTimes.push(waitTime);
        this.stats.completedRequests++;
        
        this.updateQueueDisplay();
        
        // Determine movement direction
        if (this.targetFloor > this.currentFloor) {
            this.transitionTo(this.STATES.MOVING_UP);
        } else if (this.targetFloor < this.currentFloor) {
            this.transitionTo(this.STATES.MOVING_DOWN);
        } else {
            this.transitionTo(this.STATES.DOOR_OPENING);
        }
    }
    
    checkQueue() {
        if (this.requestQueue.length > 0) {
            this.processNextRequest();
        } else {
            // From DOOR_CLOSED, go to IDLE
            if (this.currentState === this.STATES.DOOR_CLOSED) {
                this.transitionTo(this.STATES.IDLE);
            }
        }
    }
    
    //  EMERGENCY FUNCTIONS
    emergencyStop() {
        console.log(` EMERGENCY STOP activated from state: ${this.currentState}`);
        
        // Save previous state for recovery
        this.preEmergencyState = this.currentState;
        
        // Stop all timers
        clearTimeout(this.autoCloseTimer);
        clearTimeout(this.movementTimer);
        
        // Set emergency flags
        this.emergencyActive = true;
        this.emergencyFloor = this.currentFloor;
        
        // Transition to EMERGENCY state
        this.transitionTo(this.STATES.EMERGENCY);
        
        // Emergency protocols
        this.triggerEmergencyProtocols();
        
        this.stats.emergencyEvents++;
        this.showNotification('EMERGENCY STOP ACTIVATED!', 'error', true);
    }
    
    triggerEmergencyProtocols() {
        // Sound emergency alarm
        this.playEmergencySound();
        
        // Flash emergency lights
        this.startEmergencyFlash();
        
        // Log emergency event
        this.logEmergencyEvent();
        
        // Disable normal controls
        this.disableControls();
    }
    
    resetFromEmergency() {
        if (this.currentState === this.STATES.EMERGENCY) {
            console.log('🔄 Resetting from emergency state...');
            
            this.emergencyActive = false;
            
            // Stop flashing
            this.stopEmergencyFlash();
            
            // Enable controls
            this.enableControls();
            
            // Return to appropriate state
            if (this.doorOpen) {
                this.transitionTo(this.STATES.DOOR_OPEN);
            } else {
                this.transitionTo(this.STATES.DOOR_CLOSED);
            }
            
            this.showNotification('Emergency cleared - system reset', 'success');
        }
    }
    
    //  OVERLOAD FUNCTIONS
    simulateOverload() {
        if (this.overloadActive) return;
        
        console.log(' Simulating overload condition');
        
        this.overloadActive = true;
        this.weightPercentage = 120; // Exceed 100%
        
        // Show/hide buttons
        document.getElementById('btn-overload').style.display = 'none';
        document.getElementById('btn-clear-overload').style.display = 'block';
        
        // Transition to OVERLOAD state
        this.transitionTo(this.STATES.OVERLOAD);
        
        this.stats.overloadEvents++;
        this.showNotification(' WEIGHT LIMIT EXCEEDED! Elevator disabled', 'overload', true);
    }
    
    triggerOverloadProtocols() {
        // Keep doors open
        this.doorOpen = true;
        
        // Disable controls
        this.disableControls();
        
        // Show overload warning
        const elevator = document.getElementById('elevator');
        elevator.style.background = 'linear-gradient(45deg, #ff6b6b, #ff8fa3)';
    }
    
    clearOverload() {
        if (this.overloadActive) {
            this.overloadActive = false;
            this.weightPercentage = Math.min(100, this.occupants * 20); // Reset to actual
            
            const elevator = document.getElementById('elevator');
            elevator.style.background = 'linear-gradient(135deg, var(--elevator-base), var(--elevator-top))';
            
            // Hide clear button, show simulate button
            document.getElementById('btn-clear-overload').style.display = 'none';
            document.getElementById('btn-overload').style.display = 'block';
            
            this.enableControls();
            this.transitionTo(this.STATES.DOOR_OPEN);
            this.showNotification('Overload cleared - system operational', 'success');
        }
    }
    
    //  POWER FAILURE SIMULATION
    simulatePowerFailure() {
        if (this.powerFailure) return;
        
        console.log(' Simulating power failure');
        
        this.powerFailure = true;
        
        // Show/hide buttons
        document.getElementById('btn-power').style.display = 'none';
        document.getElementById('btn-clear-power').style.display = 'block';
        
        // Stop all operations
        clearTimeout(this.autoCloseTimer);
        clearTimeout(this.movementTimer);
        
        // Emergency lights only
        const outputs = this.getOutputs();
        outputs.light = 'EMERGENCY';
        outputs.motor = 'FAILURE';
        outputs.display = ' POWER FAILURE ';
        
        // Disable controls but keep clear buttons
        this.disableControls();
        
        this.showNotification(' POWER FAILURE SIMULATED! Emergency systems active', 'warning', true);
        
        // Auto-recovery after 10 seconds
        this.powerRecoveryTimer = setTimeout(() => {
            if (this.powerFailure) {
                this.restorePower();
            }
        }, 10000);
    }
    
    restorePower() {
        if (this.powerFailure) {
            this.powerFailure = false;
            
            // Show/hide buttons
            document.getElementById('btn-clear-power').style.display = 'none';
            document.getElementById('btn-power').style.display = 'block';
            
            // Clear auto-recovery timer
            if (this.powerRecoveryTimer) {
                clearTimeout(this.powerRecoveryTimer);
            }
            
            this.showNotification('Power restored - system rebooting', 'success');
            
            // Return to appropriate state
            setTimeout(() => {
                if (this.doorOpen) {
                    this.transitionTo(this.STATES.DOOR_OPEN);
                } else {
                    this.transitionTo(this.STATES.DOOR_CLOSED);
                }
            }, 2000);
        }
    }
    
    //  OCCUPANT MANAGEMENT
    addOccupant() {
        if (this.emergencyActive || this.overloadActive || this.powerFailure) return;
        
        this.occupants = Math.min(5, this.occupants + 1);
        this.weightPercentage = Math.min(120, this.occupants * 20);
        
        document.getElementById('occupant-count').textContent = this.occupants;
        document.getElementById('weight-value').textContent = `${this.weightPercentage}%`;
        
        // Check for overload
        if (this.weightPercentage > 100 && !this.overloadActive) {
            this.simulateOverload();
        }
        
        this.updateUI();
    }
    
    removeOccupant() {
        if (this.emergencyActive || this.overloadActive || this.powerFailure) return;
        
        this.occupants = Math.max(0, this.occupants - 1);
        this.weightPercentage = Math.max(0, this.occupants * 20);
        
        document.getElementById('occupant-count').textContent = this.occupants;
        document.getElementById('weight-value').textContent = `${this.weightPercentage}%`;
        
        // Clear overload if weight is back to normal
        if (this.weightPercentage <= 100 && this.overloadActive) {
            this.clearOverload();
        }
        
        this.updateUI();
    }
    
    //  SCENARIOS AND PRESETS
    runScenario1() {
        // Morning rush hour scenario
        this.showNotification('Running Scenario 1: Morning Rush Hour', 'info');
        
        this.requestFloor(4, 'UP', true);
        setTimeout(() => this.requestFloor(2, 'DOWN'), 1000);
        setTimeout(() => this.requestFloor(3, 'UP'), 2000);
        setTimeout(() => this.requestFloor(0, 'DOWN', true), 3000);
        setTimeout(() => this.requestFloor(1, 'UP'), 4000);
    }
    
    runScenario2() {
        // Emergency test scenario
        this.showNotification('Running Scenario 2: Emergency Test', 'warning');
        
        this.requestFloor(3);
        setTimeout(() => {
            if (this.currentState === this.STATES.MOVING_UP) {
                this.emergencyStop();
            }
        }, 3000);
        setTimeout(() => {
            if (this.currentState === this.STATES.EMERGENCY) {
                this.resetFromEmergency();
            }
        }, 8000);
    }
    
    runAutoTest() {
        this.showNotification('Starting Auto Test Sequence', 'info');
        
        const steps = [
            () => this.requestFloor(2),
            () => this.requestFloor(4),
            () => this.requestFloor(1),
            () => this.simulateOverload(),
            () => this.clearOverload(),
            () => this.requestFloor(3),
            () => this.emergencyStop(),
            () => this.resetFromEmergency(),
            () => this.requestFloor(0)
        ];
        
        steps.forEach((step, index) => {
            setTimeout(step, index * 5000);
        });
    }
    
    setPreset(preset) {
        switch(preset) {
            case 'up-peak':
                this.queueProcessingMode = 'PRIORITY';
                document.getElementById('queue-processing').textContent = 'PRIORITY';
                this.showNotification('Up Peak Mode: Priority to upward requests', 'info');
                break;
            case 'down-peak':
                this.queueProcessingMode = 'PRIORITY';
                document.getElementById('queue-processing').textContent = 'PRIORITY';
                this.showNotification('Down Peak Mode: Priority to downward requests', 'info');
                break;
            case 'random':
                // Add 5 random requests
                for (let i = 0; i < 5; i++) {
                    const floor = Math.floor(Math.random() * 5);
                    const direction = floor > this.currentFloor ? 'UP' : 'DOWN';
                    setTimeout(() => this.requestFloor(floor, direction), i * 1000);
                }
                this.showNotification('Added 5 random requests', 'info');
                break;
        }
    }
    
    logEmergencyEvent() {
        const event = {
            timestamp: new Date(),
            previousState: this.preEmergencyState,
            currentFloor: this.currentFloor,
            targetFloor: this.targetFloor,
            doorStatus: this.doorOpen ? 'OPEN' : 'CLOSED'
        };
        
        this.emergencyLog.push(event);
        console.log('📋 Emergency Event Logged:', event);
    }
    
    startEmergencyFlash() {
        // Flash the emergency state badge
        this.emergencyFlashTimer = setInterval(() => {
            const badge = document.getElementById('current-state');
            badge.style.animation = badge.style.animation ? '' : 'emergencyFlash 0.5s';
        }, 500);
    }
    
    stopEmergencyFlash() {
        if (this.emergencyFlashTimer) {
            clearInterval(this.emergencyFlashTimer);
            const badge = document.getElementById('current-state');
            badge.style.animation = '';
        }
    }
    
    playEmergencySound() {
        try {
            this.emergencySound.currentTime = 0;
            this.emergencySound.play().catch(e => console.log('Audio play failed:', e));
        } catch (e) {
            console.log('Audio not supported');
        }
    }
    
    disableControls() {
        // Disable all control buttons except reset, emergency clear, and clear buttons
        document.querySelectorAll('.floor-btn, .call-btn, .btn-action:not(#btn-reset):not(#btn-emergency), .btn-control, .preset-btn, .add-occupant, .remove-occupant, #btn-overload, #btn-power').forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        });
        
        // Enable clear buttons if they're visible
        const clearOverloadBtn = document.getElementById('btn-clear-overload');
        const clearPowerBtn = document.getElementById('btn-clear-power');
        
        if (clearOverloadBtn.style.display !== 'none') {
            clearOverloadBtn.disabled = false;
            clearOverloadBtn.style.opacity = '1';
            clearOverloadBtn.style.cursor = 'pointer';
        }
        
        if (clearPowerBtn.style.display !== 'none') {
            clearPowerBtn.disabled = false;
            clearPowerBtn.style.opacity = '1';
            clearPowerBtn.style.cursor = 'pointer';
        }
    }
    
    enableControls() {
        // Enable all control buttons
        document.querySelectorAll('.floor-btn, .call-btn, .btn-action, .btn-control, .preset-btn, .add-occupant, .remove-occupant, #btn-overload, #btn-power').forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
            btn.style.display = 'block'; // Ensure they're visible
        });
        
        // Hide clear buttons
        document.getElementById('btn-clear-overload').style.display = 'none';
        document.getElementById('btn-clear-power').style.display = 'none';
    }
    
    // UI Updates
    updateUI() {
        const outputs = this.getOutputs();
        
        // Update state display
        const stateElement = document.getElementById('current-state');
        stateElement.textContent = this.currentState;
        stateElement.className = `state-badge ${this.currentState.toLowerCase().replace('_', '-')}`;
        
        // Update outputs
        document.getElementById('output-motor').textContent = outputs.motor;
        document.getElementById('output-door').textContent = outputs.door;
        document.getElementById('output-direction').textContent = outputs.direction;
        document.getElementById('output-light').textContent = outputs.light;
        document.getElementById('output-alarm').textContent = outputs.alarm || 'OFF';
        document.getElementById('output-weight').textContent = outputs.weight || '0%';
        
        // Update elevator display
        document.getElementById('elevator-display').textContent = 
            this.currentFloor === 0 ? 'G' : this.currentFloor;
        document.getElementById('elevator-status').textContent = this.currentState;
        
        // Update elevator position
        this.updateElevatorPosition();
        
        // Update door animation - FIXED
        this.updateDoorAnimation(outputs.door);
        
        // Highlight current state in diagram
        this.highlightStateDiagram();
        
        // Update weight display
        document.getElementById('weight-value').textContent = `${this.weightPercentage}%`;
        document.getElementById('occupant-count').textContent = this.occupants;
        
        // Update statistics immediately
        this.updateStatistics();
    }
    
    updateElevatorPosition() {
        const elevator = document.getElementById('elevator');
        const floorHeight = 80;
        elevator.style.bottom = `${this.currentFloor * floorHeight}px`;
    }
    
    // FIXED: Door animation method
    updateDoorAnimation(doorState) {
        const leftDoor = document.querySelector('.left-door');
        const rightDoor = document.querySelector('.right-door');
        
        // Remove all classes first
        leftDoor.classList.remove('open-left');
        rightDoor.classList.remove('open-right');
        
        switch(doorState) {
            case 'OPEN':
            case 'OPENING':
                leftDoor.classList.add('open-left');
                rightDoor.classList.add('open-right');
                this.doorOpen = true;
                break;
            default:
                this.doorOpen = false;
        }
    }
    
    updateQueueDisplay() {
        const queueList = document.getElementById('request-queue');
        
        if (this.requestQueue.length === 0) {
            queueList.innerHTML = '<div class="empty-queue">No pending requests</div>';
            return;
        }
        
        queueList.innerHTML = this.requestQueue.map(req => `
            <div class="queue-item ${req.priority ? 'priority' : ''} animate__animated animate__fadeIn">
                <div class="floor">Floor ${req.floor === 0 ? 'G' : req.floor}</div>
                <div class="direction">${req.direction || 'INT'}</div>
                <div class="time">${Math.floor((new Date() - req.waitStart) / 1000)}s</div>
                ${req.priority ? '<span class="priority-badge"><i class="fas fa-star"></i></span>' : ''}
                <button class="cancel-btn" data-id="${req.id}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
        
        // Add cancel button listeners
        document.querySelectorAll('.cancel-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('.cancel-btn').dataset.id);
                this.cancelRequest(id);
            });
        });
    }
    
    cancelRequest(id) {
        this.requestQueue = this.requestQueue.filter(req => req.id !== id);
        this.updateQueueDisplay();
        this.showNotification('Request cancelled', 'warning');
    }
    
    highlightStateDiagram() {
        // Remove all highlights
        document.querySelectorAll('.state-node').forEach(node => {
            node.classList.remove('active');
            node.classList.remove('animate__animated', 'animate__pulse');
        });
        
        // Highlight current state
        const currentNode = document.querySelector(`.state-node[data-state="${this.currentState}"]`);
        if (currentNode) {
            currentNode.classList.add('active');
            currentNode.classList.add('animate__animated', 'animate__pulse');
        }
    }
    
    // Helper Functions
    showNotification(message, type = 'info', emergency = false) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type} ${emergency ? 'emergency' : ''}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getIconForType(type)}"></i>
            <span>${message}</span>
            <button class="close-notif"><i class="fas fa-times"></i></button>
        `;
        
        // Add to container
        const container = document.querySelector('.container');
        container.appendChild(notification);
        
        // Add close button listener
        notification.querySelector('.close-notif').addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto remove after 5 seconds (unless emergency)
        if (!emergency) {
            setTimeout(() => notification.remove(), 5000);
        }
    }
    
    getIconForType(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle',
            'overload': 'weight-hanging'
        };
        return icons[type] || 'info-circle';
    }
    
    logStateChange(description) {
        const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
        console.log(`[${timestamp}] ${description}`);
    }
    
    generateReport() {
        const now = new Date();
        const totalRuntime = Math.floor((now - this.stats.startTime) / 1000);
        
        // Prepare report data
        const report = {
            timestamp: now.toLocaleString(),
            project: 'Elevator Control System - Moore Machine',
            team: ['Huzaifa Ashrafi', 'Zaid Bhatti', 'Bilal Zaidi'],
            instructor: 'Sir Jawwad Bhutta',
            institution: 'Usman Institute of Technology',
            
            // Performance Data
            performance: {
                totalRuntime: `${totalRuntime} seconds`,
                totalOperations: this.stats.stateChanges.length,
                floorsTraveled: this.stats.floorsTraveled,
                doorOperations: this.stats.doorOperations,
                totalRequests: this.stats.totalRequests,
                completedRequests: this.stats.completedRequests,
                emergencyEvents: this.stats.emergencyEvents,
                overloadEvents: this.stats.overloadEvents,
                avgWaitTime: `${this.performance.avgWaitTime}s`,
                travelEfficiency: `${this.performance.travelEfficiency}%`,
                idleTimePercentage: `${this.performance.idleTimePercentage}%`,
                systemUptime: this.performance.systemUptime
            },
            
            // State Distribution
            stateDistribution: { ...this.chartData.stateCounts },
            
            // System Status
            systemStatus: {
                currentState: this.currentState,
                currentFloor: this.currentFloor,
                doorStatus: this.doorOpen ? 'OPEN' : 'CLOSED',
                occupants: this.occupants,
                weightPercentage: this.weightPercentage,
                emergencyActive: this.emergencyActive,
                overloadActive: this.overloadActive,
                powerFailure: this.powerFailure,
                queueLength: this.requestQueue.length,
                queueProcessingMode: this.queueProcessingMode
            },
            
            // Recent Activity (last 5 transitions)
            recentTransitions: this.stats.stateChanges.slice(-5).map(t => ({
                time: new Date(t.time).toLocaleTimeString(),
                from: t.from,
                to: t.to,
                floor: t.floor === 0 ? 'G' : t.floor,
                duration: `${t.duration}s`
            })),
            
            // Emergency Log
            emergencyLog: this.emergencyLog.map(log => ({
                time: new Date(log.timestamp).toLocaleString(),
                previousState: log.previousState,
                floor: log.currentFloor,
                door: log.doorStatus
            }))
        };
        
        console.log('📊 COMPLETE SYSTEM REPORT:', report);
        
        // Generate PDF
        this.generatePDFReport(report);
        
        return report;
    }
    
    generatePDFReport(reportData) {
    // Check if jsPDF is available
    if (typeof window.jspdf === 'undefined') {
        console.error('jsPDF library not loaded. Falling back to JSON.');
        this.showNotification('jsPDF library not loaded. Downloading JSON instead.', 'warning');
        this.downloadJSONReport(reportData);
        return;
    }
    
    try {
        // Import jsPDF
        const { jsPDF } = window.jspdf;
        
        // Create new PDF document
        const doc = new jsPDF();
        
        // Get current date and time for filename
        const now = new Date();
        const timestamp = now.toISOString().slice(0,19).replace(/:/g, '-');
        
        // Title
        doc.setFontSize(22);
        doc.setTextColor(67, 97, 238); // Primary color
        doc.text('Elevator Control System Report', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Report Generated: ${reportData.timestamp}`, 105, 30, { align: 'center' });
        
        doc.setFontSize(10);
        doc.text('Moore Machine Implementation - 9 States', 105, 36, { align: 'center' });
        
        // Team Information
        doc.setFontSize(14);
        doc.setTextColor(67, 97, 238);
        doc.text('Project Information', 20, 50);
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Team: ${reportData.team.join(', ')}`, 20, 60);
        doc.text(`Instructor: ${reportData.instructor}`, 20, 66);
        doc.text(`Institution: ${reportData.institution}`, 20, 72);
        
        // Current Status
        doc.setFontSize(14);
        doc.setTextColor(67, 97, 238);
        doc.text('Current System Status', 20, 85);
        
        const statusY = 95;
        const col1X = 20;
        const col2X = 100;
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        
        // Column 1
        doc.text(`Current State: ${reportData.systemStatus.currentState}`, col1X, statusY);
        doc.text(`Current Floor: ${reportData.systemStatus.currentFloor === 0 ? 'G' : reportData.systemStatus.currentFloor}`, col1X, statusY + 6);
        doc.text(`Door Status: ${reportData.systemStatus.doorStatus}`, col1X, statusY + 12);
        doc.text(`Occupants: ${reportData.systemStatus.occupants}`, col1X, statusY + 18);
        doc.text(`Weight Load: ${reportData.systemStatus.weightPercentage}%`, col1X, statusY + 24);
        
        // Column 2
        doc.text(`Emergency Active: ${reportData.systemStatus.emergencyActive ? 'YES' : 'NO'}`, col2X, statusY);
        doc.text(`Overload Active: ${reportData.systemStatus.overloadActive ? 'YES' : 'NO'}`, col2X, statusY + 6);
        doc.text(`Power Failure: ${reportData.systemStatus.powerFailure ? 'YES' : 'NO'}`, col2X, statusY + 12);
        doc.text(`Queue Length: ${reportData.systemStatus.queueLength}`, col2X, statusY + 18);
        doc.text(`Queue Mode: ${reportData.systemStatus.queueProcessingMode}`, col2X, statusY + 24);
        
        // Performance Metrics
        doc.setFontSize(14);
        doc.setTextColor(67, 97, 238);
        doc.text('Performance Metrics', 20, statusY + 40);
        
        const metricsY = statusY + 50;
        
        // Metrics in two columns
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        
        // Column 1
        doc.text(`Total Runtime: ${reportData.performance.totalRuntime}`, col1X, metricsY);
        doc.text(`State Changes: ${reportData.performance.totalOperations}`, col1X, metricsY + 6);
        doc.text(`Floors Traveled: ${reportData.performance.floorsTraveled}`, col1X, metricsY + 12);
        doc.text(`Door Operations: ${reportData.performance.doorOperations}`, col1X, metricsY + 18);
        doc.text(`Total Requests: ${reportData.performance.totalRequests}`, col1X, metricsY + 24);
        doc.text(`Completed Requests: ${reportData.performance.completedRequests}`, col1X, metricsY + 30);
        
        // Column 2
        doc.text(`Emergency Events: ${reportData.performance.emergencyEvents}`, col2X, metricsY);
        doc.text(`Overload Events: ${reportData.performance.overloadEvents}`, col2X, metricsY + 6);
        doc.text(`Avg Wait Time: ${reportData.performance.avgWaitTime}`, col2X, metricsY + 12);
        doc.text(`Travel Efficiency: ${reportData.performance.travelEfficiency}`, col2X, metricsY + 18);
        doc.text(`Idle Time: ${reportData.performance.idleTimePercentage}`, col2X, metricsY + 24);
        doc.text(`System Uptime: ${reportData.performance.systemUptime}s`, col2X, metricsY + 30);
        
        // State Distribution
        doc.setFontSize(14);
        doc.setTextColor(67, 97, 238);
        doc.text('State Distribution', 20, metricsY + 45);
        
        const stateY = metricsY + 55;
        let currentY = stateY;
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        
        // Display state counts
        Object.entries(reportData.stateDistribution).forEach(([state, count], index) => {
            const column = index % 2;
            const row = Math.floor(index / 2);
            const x = column === 0 ? col1X : col2X;
            const y = currentY + (row * 6);
            
            doc.text(`${state}: ${count}`, x, y);
        });
        
        // Add a line separator
        doc.setDrawColor(200, 200, 200);
        doc.line(20, currentY + 40, 190, currentY + 40);
        
        // Recent State Transitions
        doc.setFontSize(14);
        doc.setTextColor(67, 97, 238);
        doc.text('Recent State Transitions', 20, currentY + 50);
        
        const transitionsY = currentY + 60;
        
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        
        // Header
        doc.text('Time', 20, transitionsY);
        doc.text('From', 50, transitionsY);
        doc.text('To', 80, transitionsY);
        doc.text('Floor', 110, transitionsY);
        doc.text('Duration', 140, transitionsY);
        
        // Data
        reportData.recentTransitions.forEach((transition, index) => {
            const y = transitionsY + 8 + (index * 6);
            doc.text(transition.time, 20, y);
            doc.text(transition.from, 50, y);
            doc.text(transition.to, 80, y);
            doc.text(transition.floor.toString(), 110, y);
            doc.text(transition.duration, 140, y);
        });
        
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Elevator Control System - Moore Machine Implementation', 105, 285, { align: 'center' });
        doc.text('© 2024 - Team: Huzaifa Ashrafi, Zaid Bhatti, Bilal Zaidi', 105, 290, { align: 'center' });
        
        // Save the PDF
        const fileName = `elevator-report-${timestamp}.pdf`;
        doc.save(fileName);
        
        this.showNotification('PDF report generated and downloaded successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        this.showNotification('PDF generation failed. Downloading JSON instead.', 'warning');
        this.downloadJSONReport(reportData);
    }
}

    // Add this helper method for JSON fallback
    downloadJSONReport(reportData) {
        const dataStr = JSON.stringify(reportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `elevator-report-${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        document.body.appendChild(linkElement);
        linkElement.click();
        document.body.removeChild(linkElement);
    }
    
    clearAll() {
        // Clear queue
        this.requestQueue = [];
        this.updateQueueDisplay();
        
        // Reset to ground floor if not moving
        if (this.currentState === this.STATES.IDLE || this.currentState === this.STATES.DOOR_CLOSED) {
            this.currentFloor = 0;
            this.updateElevatorPosition();
        }
        
        // Clear statistics
        this.stats.waitTimes = [];
        this.stats.completedRequests = 0;
        
        this.showNotification('All requests cleared and system reset', 'info');
        this.updateUI();
    }
    
    // Event Binding
    bindEvents() {
        // Floor buttons
        document.querySelectorAll('.floor-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const floor = e.target.dataset.floor;
                this.requestFloor(floor);
            });
        });
        
        // Call buttons on floors
        document.querySelectorAll('.call-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const floor = e.target.closest('.call-btn').dataset.floor;
                const direction = e.target.closest('.call-btn').classList.contains('up') ? 'UP' : 'DOWN';
                this.requestFloor(floor, direction);
            });
        });
        
        // Control buttons
        document.getElementById('btn-up').addEventListener('click', () => {
            const floor = prompt('Enter floor number for UP request:', '3');
            if (floor !== null && !isNaN(floor)) {
                this.requestFloor(floor, 'UP');
            }
        });
        
        document.getElementById('btn-down').addEventListener('click', () => {
            const floor = prompt('Enter floor number for DOWN request:', '0');
            if (floor !== null && !isNaN(floor)) {
                this.requestFloor(floor, 'DOWN');
            }
        });
        
        document.getElementById('btn-open').addEventListener('click', () => {
            if (this.currentState === this.STATES.DOOR_OPEN || 
                this.currentState === this.STATES.DOOR_CLOSING ||
                this.currentState === this.STATES.DOOR_CLOSED) {
                clearTimeout(this.autoCloseTimer);
                this.doorOpen = true;
                this.transitionTo(this.STATES.DOOR_OPENING);
            }
        });
        
        document.getElementById('btn-close').addEventListener('click', () => {
            if (this.currentState === this.STATES.DOOR_OPEN) {
                this.transitionTo(this.STATES.DOOR_CLOSING);
            }
        });
        
        document.getElementById('btn-emergency').addEventListener('click', () => {
            if (confirm('Activate emergency stop?\nThis will halt all operations and sound an alarm.')) {
                this.emergencyStop();
            }
        });
        
        document.getElementById('btn-reset').addEventListener('click', () => {
            this.resetFromEmergency();
        });
        
        // Additional controls
        document.getElementById('btn-overload').addEventListener('click', () => {
            this.simulateOverload();
        });
        
        document.getElementById('btn-clear-overload').addEventListener('click', () => {
            this.clearOverload();
        });
        
        document.getElementById('btn-power').addEventListener('click', () => {
            this.simulatePowerFailure();
        });
        
        document.getElementById('btn-clear-power').addEventListener('click', () => {
            this.restorePower();
        });
        
        // Scenario buttons
        document.getElementById('btn-auto-test').addEventListener('click', () => {
            this.runAutoTest();
        });
        
        document.getElementById('btn-scenario-1').addEventListener('click', () => {
            this.runScenario1();
        });
        
        document.getElementById('btn-scenario-2').addEventListener('click', () => {
            this.runScenario2();
        });
        
        document.getElementById('btn-clear-all').addEventListener('click', () => {
            this.clearAll();
        });
        
        // Queue controls
        document.getElementById('btn-clear-queue').addEventListener('click', () => {
            this.requestQueue = [];
            this.updateQueueDisplay();
            this.showNotification('Queue cleared', 'info');
        });
        
        document.getElementById('btn-prioritize').addEventListener('click', () => {
            this.queueProcessingMode = this.queueProcessingMode === 'FCFS' ? 'PRIORITY' : 'FCFS';
            document.getElementById('queue-processing').textContent = this.queueProcessingMode;
            this.showNotification(`Queue processing: ${this.queueProcessingMode}`, 'info');
        });
        
        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const preset = e.target.closest('.preset-btn').dataset.preset;
                this.setPreset(preset);
            });
        });
        
        // Occupant controls
        document.querySelector('.add-occupant').addEventListener('click', () => {
            this.addOccupant();
        });
        
        document.querySelector('.remove-occupant').addEventListener('click', () => {
            this.removeOccupant();
        });
        
        // Report button
        document.getElementById('btn-report').addEventListener('click', () => {
            this.generateReport();
        });
        
        // Floor click
        document.querySelectorAll('.floor').forEach(floor => {
            floor.addEventListener('click', (e) => {
                if (!e.target.closest('.call-btn')) {
                    const floorNum = e.currentTarget.dataset.floor;
                    this.requestFloor(floorNum);
                }
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case '0': case 'g': case 'G':
                    this.requestFloor(0);
                    break;
                case '1': this.requestFloor(1); break;
                case '2': this.requestFloor(2); break;
                case '3': this.requestFloor(3); break;
                case '4': this.requestFloor(4); break;
                case 'ArrowUp': 
                    e.preventDefault();
                    // Move to next floor up if possible
                    if (this.currentFloor < 4 && !this.emergencyActive && !this.overloadActive && !this.powerFailure) {
                        this.requestFloor(this.currentFloor + 1);
                    }
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    // Move to next floor down if possible
                    if (this.currentFloor > 0 && !this.emergencyActive && !this.overloadActive && !this.powerFailure) {
                        this.requestFloor(this.currentFloor - 1);
                    }
                    break;
                case 'o': case 'O':
                    document.getElementById('btn-open').click();
                    break;
                case 'c': case 'C':
                    document.getElementById('btn-close').click();
                    break;
                case 'e': case 'E':
                    if (e.ctrlKey) document.getElementById('btn-emergency').click();
                    break;
                case 'r': case 'R':
                    if (e.ctrlKey) document.getElementById('btn-reset').click();
                    break;
                case 'p': case 'P':
                    if (e.ctrlKey) this.generateReport();
                    break;
                case 'a': case 'A':
                    if (e.ctrlKey) this.runAutoTest();
                    break;
                case 'q': case 'Q':
                    if (e.ctrlKey) {
                        this.requestQueue = [];
                        this.updateQueueDisplay();
                        this.showNotification('Queue cleared', 'info');
                    }
                    break;
                case 'u': case 'U':
                    e.preventDefault();
                    document.getElementById('btn-up').click();
                    break;
                case 'd': case 'D':
                    e.preventDefault();
                    document.getElementById('btn-down').click();
                    break;
                case '+':
                    this.addOccupant();
                    break;
                case '-':
                    this.removeOccupant();
                    break;
            }
        });
    }
}

// Initialize when page loads (Menu)
document.addEventListener('DOMContentLoaded', () => {
    window.elevatorController = new ElevatorController();
    
    console.log(' Elevator Control System (Enhanced) Ready!');
    console.log(' Dark/Light Mode Toggle Enabled');
    console.log(' Complete 9-State Moore Machine with Advanced Features');
    console.log('');
    console.log(' FEATURES:');
    console.log('   • 8-State Moore Machine Implementation');
    console.log('   • Real-time Statistics & Analytics');
    console.log('   • Interactive Charts & Graphs');
    console.log('   • Emergency System with Protocols');
    console.log('   • Overload Detection & Handling');
    console.log('   • Power Failure Simulation');
    console.log('   • Occupant Management');
    console.log('   • Multiple Scenarios & Presets');
    console.log('   • Queue Management System');
    console.log('   • Comprehensive PDF Reporting');
    console.log('');
    console.log(' KEYBOARD SHORTCUTS:');
    console.log('   0/G - Request Ground floor');
    console.log('   1-4 - Request respective floor');
    console.log('   U - Request Up (prompt)');
    console.log('   D - Request Down (prompt)');
    console.log('   ↑ - Move to floor above');
    console.log('   ↓ - Move to floor below');
    console.log('   O - Open door');
    console.log('   C - Close door');
    console.log('   Ctrl+E - Emergency stop');
    console.log('   Ctrl+R - Reset system');
    console.log('   Ctrl+P - Generate PDF report');
    console.log('   Ctrl+A - Run auto test');
    console.log('   Ctrl+Q - Clear queue');
    console.log('   + - Add occupant');
    console.log('   - - Remove occupant');
    console.log('');
    console.log(' Click buttons or use keyboard shortcuts to interact!');
});