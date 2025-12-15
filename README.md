# 🛗 Elevator Control System - Moore Machine Implementation

![Moore Machine 9 States](https://img.shields.io/badge/Moore%20Machine-9%20States-blue)
![Version](https://img.shields.io/badge/Version-1.0.0-success)
![License](https://img.shields.io/badge/License-CC%20BY--NC%204.0-green)
![Status](https://img.shields.io/badge/Status-Complete-brightgreen)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![Chart.js](https://img.shields.io/badge/Chart.js-4.4.0-blueviolet)
![PDF Generation](https://img.shields.io/badge/PDF%20Generation-jspDF-orange)

A sophisticated web-based simulation of an elevator control system implemented as a **9-state Moore Machine**, featuring real-time analytics, comprehensive emergency protocols, and automated PDF reporting.

##  Live Demo
[View Live Project](https://huzaifaashrafi1.github.io/elevator-moore-machine)  

##  Project Overview

This project demonstrates a complete **finite state machine (FSM)** implementation for elevator control, combining theoretical automata concepts with practical web development. The system simulates a 5-story building elevator with advanced features like overload detection, emergency protocols, and real-time performance analytics.

### Key Academic Contributions
- **Pure Moore Machine** implementation (outputs depend solely on current state)
- **9 distinct states** with complete transition logic
- **Real-world elevator protocols** simulation
- **Comprehensive state diagram** visualization
- **Performance metrics** tracking and analysis

##  Features

###  Core Implementation
- **9-State Moore Machine** with deterministic transitions
- **Visual State Diagram** showing all state relationships
- **Complete State Table** documenting all Moore outputs
- **Real-time UI Updates** synchronized with state changes

###  Analytics & Monitoring
- **Live Statistics Dashboard** with key performance indicators
- **Interactive Charts** (pie chart, line graph) using Chart.js
- **State Distribution Tracking** across all 9 states
- **Performance Metrics** calculation (efficiency, wait times, idle time)
- **State Transition History** with timestamps

###  Emergency & Safety Systems
- **Emergency Stop Protocol** with audio/visual alerts
- **Overload Detection** (weight limit simulation)
- **Power Failure Simulation** with automatic recovery
- **Occupant Management** system
- **Safety Interlocks** and protocol enforcement

###  Reporting & Documentation
- **PDF Report Generation** using jsPDF
- **Comprehensive System Reports** with statistics
- **Emergency Event Logging**
- **Performance Analysis** export

###  User Experience
- **Dark/Light Mode Toggle** with automatic detection
- **Keyboard Shortcuts** for all operations
- **Responsive Design** for all screen sizes
- **Animated Visuals** (elevator movement, door operations)
- **Audio Feedback** (ding sounds, emergency alarms)

###  Testing & Scenarios
- **Pre-defined Test Scenarios** (Morning Rush, Emergency Test)
- **Auto Test Mode** for complete system validation
- **Queue Management** with priority scheduling
- **Preset Modes** (Up Peak, Down Peak, Random)

##  Architecture

### Moore Machine States
| State | Description | Key Outputs |
|-------|-------------|-------------|
| **IDLE** | Stationary, waiting for requests | Motor: STOP, Door: CLOSED |
| **MOVING_UP** | Ascending to target floor | Motor: UP, Door: CLOSED |
| **MOVING_DOWN** | Descending to target floor | Motor: DOWN, Door: CLOSED |
| **DOOR_OPENING** | Doors opening at arrival | Motor: STOP, Door: OPENING |
| **DOOR_OPEN** | Doors open for boarding | Motor: STOP, Door: OPEN |
| **DOOR_CLOSING** | Doors closing after dwell time | Motor: STOP, Door: CLOSING |
| **DOOR_CLOSED** | Doors closed, ready for next move | Motor: STOP, Door: CLOSED |
| **EMERGENCY** | Emergency stop activated | Motor: STOP, Alarm: ON |
| **OVERLOAD** | Weight limit exceeded | Motor: STOP, Door: OPEN, Alarm: ON |

### Technical Stack
- **Frontend**: HTML5, CSS3 (with CSS Variables for theming), Vanilla JavaScript (ES6+)
- **Charts**: Chart.js v4.4.0
- **PDF Generation**: jsPDF v2.5.1 with AutoTable plugin
- **Icons**: Font Awesome v6.4.0
- **Animations**: Animate.css v4.1.1
- **Fonts**: Poppins (Google Fonts)
- **Development**: VS Code with Prettier, ESLint, Live Server

##  Quick Start

### Prerequisites
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+)
- Node.js (optional, for development server)
- VS Code (recommended for development)

### Installation & Running

**Method 1: Direct Browser (Simplest)**
```bash
# Clone the repository
git clone https://github.com/HuzaifaAshrafi1/elevator-moore-machine.git

# Open index.html in your browser
cd elevator-moore-machine
open index.html  # On macOS
# or
start index.html # On Windows
```

**Method 2: Development Server (Recommended)**
```bash
# Install dependencies
npm install

# Start development server
npm start

# Server will open at http://localhost:3000
```

**Method 3: VS Code Live Server**
1. Open project in VS Code
2. Install "Live Server" extension (recommended in .vscode/extensions.json)
3. Right-click index.html → "Open with Live Server"

##  Usage Guide

### Basic Operations
1. **Floor Selection**: Click floor buttons (G, 1, 2, 3, 4) or use keyboard shortcuts (0-4)
2. **Direction Requests**: Use call buttons on building visualization (up/down arrows)
3. **Door Control**: Open/Close doors using control panel buttons
4. **Emergency**: Activate emergency stop for safety protocols

### Advanced Features
- **Occupant Management**: Simulate passengers entering/exiting
- **Performance Monitoring**: View real-time statistics in dashboard
- **Scenario Testing**: Run pre-defined test scenarios
- **Report Generation**: Create PDF reports of system activity

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `0` or `G` | Request Ground Floor |
| `1`-`4` | Request Floor 1-4 |
| `↑` / `↓` | Request adjacent floor |
| `O` / `C` | Open / Close door |
| `Ctrl+E` | Emergency stop |
| `Ctrl+R` | Reset system |
| `Ctrl+P` | Generate PDF report |
| `Ctrl+A` | Run auto test |
| `+` / `-` | Add / Remove occupant |

##  Project Structure

```
elevator-moore-machine/
├── index.html                 # Main HTML file with complete UI
├── style.css                  # CSS with dark/light theme system
├── script.js                  # Core JavaScript (ES6+ classes)
├── LICENSE                    # CC BY-NC 4.0 License
├── README.md                  # This documentation
├── package.json               # Project configuration & dependencies
└── .vscode/                   # VS Code workspace settings
    ├── settings.json          # Editor preferences
    └── extensions.json        # Recommended extensions
```

##  Testing

### Automated Tests
```bash
# Run auto test sequence from UI
1. Click "Auto Test" button
2. Observe complete system validation
```

### Manual Testing Scenarios
1. **Morning Rush Hour**: Simulates peak usage patterns
2. **Emergency Protocol Test**: Validates emergency response
3. **Overload Simulation**: Tests weight limit handling
4. **Power Failure**: Tests backup systems

### Performance Metrics Tracked
- State transition frequency
- Average wait time per request
- Travel efficiency (optimal vs actual)
- Door operation cycles
- Emergency event count

## 🛠️ Development

### Setup Development Environment
```bash
# Install all dependencies
npm install

# Format code (Prettier)
npm run format

# Lint code (ESLint)
npm run lint

# Start development server with live reload
npm run dev
```

### Code Architecture
- **ElevatorController Class**: Main controller with all state logic
- **ThemeManager Class**: Handles dark/light mode switching
- **Chart Management**: Real-time chart updates
- **Event System**: Comprehensive keyboard and click handlers
- **PDF Generation**: Modular report creation system

### Adding New Features
1. Extend the `ElevatorController` class for new states
2. Update state transition logic in `transitionTo()` method
3. Add corresponding UI elements in `index.html`
4. Style new components in `style.css`
5. Test thoroughly with existing scenarios

## 📊 Performance & Optimization

### Optimizations Implemented
- **Debounced state updates** to prevent excessive renders
- **Chart.js lazy updates** for better performance
- **Efficient DOM queries** with querySelector caching
- **CSS transitions** instead of JavaScript animations where possible
- **LocalStorage caching** for theme preferences

### Browser Compatibility
- **Chrome 90+**: Fully supported
- **Firefox 88+**: Fully supported
- **Safari 14+**: Fully supported
- **Edge 90+**: Fully supported
- **Mobile Browsers**: Responsive design supported

##  Contributing

This is an academic project, but suggestions are welcome:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit changes (`git commit -m 'Add some improvement'`)
4. Push to branch (`git push origin feature/improvement`)
5. Open a Pull Request

### Code Standards
- Follow existing code structure and naming conventions
- Use Prettier for code formatting
- Add comments for complex logic
- Update documentation for new features

## 📄 License

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International License**.

**You are free to:**
- Share, copy, and redistribute the material
- Adapt, remix, transform, and build upon the material
- Use for academic, educational, and research purposes

**Under these terms:**
- **Attribution Required**: Credit must be given to the authors
- **NonCommercial**: Commercial use is not permitted

For complete license terms, see the [LICENSE](LICENSE) file.


##  Academic Context

This project serves as a practical implementation of theoretical concepts learned in Automata Theory, specifically:
- Finite State Machines (FSM)
- Moore Machines vs Mealy Machines
- State transition diagrams
- Deterministic vs Non-deterministic automata
- Formal language theory applications

## Related Resources

- [Moore Machine Theory - Wikipedia](https://en.wikipedia.org/wiki/Moore_machine)
- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
- [jsPDF Documentation](https://artskydj.github.io/jsPDF/docs/)
- [Project Repository](https://github.com/HuzaifaAshrafi1/elevator-moore-machine)
- [Issue Tracker](https://github.com/HuzaifaAshrafi1/elevator-moore-machine/issues)
