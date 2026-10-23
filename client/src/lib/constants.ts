export interface IndustrialCategory {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  description: string;
  image: string;
  startingPrice: string;
}

export const INDUSTRIAL_CATEGORIES: IndustrialCategory[] = [
  {
    id: 'plc',
    name: 'PLC (Programmable Logic Controller)',
    shortName: 'PLC',
    slug: 'plc',
    description: 'High-speed modular, compact and rack-mounted industrial PLCs for factory automation.',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80',
    startingPrice: '₹12,499',
  },
  {
    id: 'vfd',
    name: 'VFD (Variable Frequency Drives)',
    shortName: 'VFD',
    slug: 'vfd',
    description: 'AC frequency inverters and motor speed controllers for energy efficiency and torque control.',
    image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&q=80',
    startingPrice: '₹8,990',
  },
  {
    id: 'hmi',
    name: 'HMI (Human Machine Interface)',
    shortName: 'HMI',
    slug: 'hmi',
    description: 'Industrial touch panels, color TFT operator interfaces with Ethernet, RS485 and Modbus.',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80',
    startingPrice: '₹14,500',
  },
  {
    id: 'motors',
    name: 'Industrial Motors',
    shortName: 'Motors',
    slug: 'motors',
    description: 'Three-phase induction motors, brake motors, geared motors, and high-efficiency drives.',
    image: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=600&q=80',
    startingPrice: '₹6,200',
  },
  {
    id: 'servo-drives',
    name: 'Servo Drives & Motors',
    shortName: 'Servo Drives',
    slug: 'servo-drives',
    description: 'High-precision motion control servo amplifiers, rotary encoders, and closed-loop motors.',
    image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=600&q=80',
    startingPrice: '₹18,900',
  },
  {
    id: 'sensors',
    name: 'Sensors',
    shortName: 'Sensors',
    slug: 'sensors',
    description: 'Proximity sensors, photoelectric eyes, rotary encoders, temperature transmitters and limit switches.',
    image: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=600&q=80',
    startingPrice: '₹1,450',
  },
  {
    id: 'electrical-components',
    name: 'Electrical Components',
    shortName: 'Electrical Components',
    slug: 'electrical-components',
    description: 'Industrial contactors, overload relays, MCBs, MCCBs, pushbuttons, terminal blocks & timers.',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80',
    startingPrice: '₹450',
  },
  {
    id: 'smps-power-supplies',
    name: 'SMPS / Power Supplies',
    shortName: 'SMPS / Power Supplies',
    slug: 'smps-power-supplies',
    description: 'DIN-rail 24V DC industrial switch mode power supplies, DC-DC converters, and battery backups.',
    image: 'https://images.unsplash.com/photo-1597733336794-12d05021d510?w=600&q=80',
    startingPrice: '₹1,850',
  },
  {
    id: 'electrical-control-panels',
    name: 'Electrical Control Panels',
    shortName: 'Control Panels',
    slug: 'electrical-control-panels',
    description: 'Custom PLC panels, VFD starter panels, PCC/MCC power distribution panels, and APFC panels.',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80',
    startingPrice: '₹25,000',
  },
  {
    id: 'industrial-cables-accessories',
    name: 'Industrial Cables & Accessories',
    shortName: 'Cables & Accessories',
    slug: 'industrial-cables-accessories',
    description: 'Shielded instrumentation cables, drag chain flex cables, glands, conduits, and cable drag trays.',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80',
    startingPrice: '₹890',
  },
];

export interface IndustrialService {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  iconName: string;
  deliverables: string[];
}

export const INDUSTRIAL_SERVICES: IndustrialService[] = [
  {
    id: 'plc-programming',
    title: 'PLC Programming',
    shortDesc: 'Custom logic development, ladder logic, function blocks, and structured text for Siemens, Allen-Bradley, Delta, and Mitsubishi.',
    fullDesc: 'End-to-end PLC software architecture including machine sequencing, safety interlocks, recipe management, and process automation.',
    iconName: 'Cpu',
    deliverables: ['Custom Ladder Logic & FBD', 'I/O Mapping & Documentation', 'Factory Acceptance Testing (FAT)', 'On-Site Commissioning'],
  },
  {
    id: 'vfd-installation-commissioning',
    title: 'VFD Installation & Commissioning',
    shortDesc: 'Complete installation, mounting, motor matching, tuning, and field commissioning of Variable Frequency Drives.',
    fullDesc: 'Ensuring correct torque limits, ramp speeds, harmonic mitigation, thermal overload settings, and seamless fieldbus communication.',
    iconName: 'Gauge',
    deliverables: ['Drive Sizing & Selection', 'Enclosure & Braking Resistor Setup', 'Motor Load Tuning', 'Efficiency & Harmonics Check'],
  },
  {
    id: 'hmi-scada-development',
    title: 'HMI & SCADA Development',
    shortDesc: 'Interactive operator UI dashboards, real-time graphical SCADA screens, alarm logging, and historical trend reporting.',
    fullDesc: 'Modern, user-friendly visualization systems enabling plant operators to monitor, control, and analyze machinery in real time.',
    iconName: 'Activity',
    deliverables: ['Custom Screen Layouts', 'Real-time Alarm & Event Logs', 'Data Logging & CSV Reports', 'Remote Mobile Monitoring'],
  },
  {
    id: 'electrical-control-panel-design',
    title: 'Electrical Control Panel Design & Wiring',
    shortDesc: 'Schematic drawings, CAD panel layouts, precision component assembly, ferrule-numbered wiring, and rigorous testing.',
    fullDesc: 'Built in compliance with Indian and international electrical safety standards. IP-rated enclosures for dust, heat, and vibration resistance.',
    iconName: 'Boxes',
    deliverables: ['AutoCAD Electrical Schematics', 'Bill of Materials (BOM)', 'Neat Ferruling & Busbar Layout', 'Comprehensive Insulation Testing'],
  },
  {
    id: 'system-integration',
    title: 'Industrial Automation System Integration',
    shortDesc: 'Connecting PLCs, field sensors, servo drives, robotic cells, and enterprise ERP/MES software into a unified workflow.',
    fullDesc: 'Turnkey automation solutions that bridge shop-floor hardware with management insights to eliminate bottlenecks and boost throughput.',
    iconName: 'Network',
    deliverables: ['Multi-vendor Protocol Bridging', 'Sensor-to-Cloud Telemetry', 'Production Tracking', 'Turnkey Project Execution'],
  },
  {
    id: 'troubleshooting-maintenance',
    title: 'Troubleshooting & Maintenance',
    shortDesc: 'Emergency breakdown diagnosis, regular preventative health checks, faulty component replacement, and system backups.',
    fullDesc: 'Minimizing factory downtime with rapid response engineering support across Rajasthan and North India industrial clusters.',
    iconName: 'Wrench',
    deliverables: ['Fault Code Diagnostics', 'PLC Program Backup & Recovery', 'Preventative Maintenance Audits', '24/7 Breakdown Assistance'],
  },
  {
    id: 'vfd-parameter-setting',
    title: 'VFD Parameter Setting',
    shortDesc: 'Precision parameter configuration, PID tuning, multi-step speed controls, sleep/wake modes, and communications mapping.',
    fullDesc: 'Optimizing acceleration/deceleration curves, over-voltage suppression, vector control parameters, and sensorless torque curves.',
    iconName: 'Sliders',
    deliverables: ['Motor Parameter Optimization', 'PID Closed-Loop Calibration', 'Modbus / Profinet Setup', 'Documented Parameter Backup Sheet'],
  },
  {
    id: 'automation-consultancy',
    title: 'Automation Consultancy',
    shortDesc: 'Feasibility studies, ROI analysis, technology roadmap planning, and vendor-neutral component recommendations.',
    fullDesc: 'Expert consultation for plant managers and business owners looking to modernize legacy machinery into Industry 4.0 ready facilities.',
    iconName: 'Lightbulb',
    deliverables: ['Plant Automation Audits', 'Cost vs. Benefit Feasibility', 'Component Specification Docs', 'Energy Savings Analysis'],
  },
];
