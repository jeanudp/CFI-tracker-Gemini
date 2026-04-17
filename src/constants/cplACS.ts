import { ACSArea } from '../types';

export const CPL_ACS: ACSArea[] = [
  {
    area: "I. Preflight Preparation",
    tasks: [
      {
        name: "Pilot Qualifications",
        code: "CA.I.A",
        references: "14 CFR parts 61, 68; AC 68-1; FAA-H-8083-2, FAA-H-8083-25",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with pilot qualifications.",
        stds: [
          { code: "CA.I.A.K1", category: "K", description: "Certification requirements, recency of experience, and recordkeeping" },
          { code: "CA.I.A.K2", category: "K", description: "Privileges and limitations of the commercial pilot certificate" },
          { code: "CA.I.A.K3", category: "K", description: "Medical certificates: class, expiration, privileges, and temporary disqualifications" },
          { code: "CA.I.A.K4", category: "K", description: "Documents required to exercise commercial pilot privileges" },
          { code: "CA.I.A.R1", category: "R", description: "Proficiency versus currency" },
          { code: "CA.I.A.R2", category: "R", description: "Personal minimums and commercial operations" },
          { code: "CA.I.A.S1", category: "S", description: "Apply requirements to act as pilot-in-command in a scenario given by the evaluator" }
        ]
      },
      {
        name: "Airworthiness Requirements",
        code: "CA.I.B",
        references: "14 CFR parts 21, 39, 43, 91; FAA-H-8083-2, FAA-H-8083-25",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with airworthiness requirements.",
        stds: [
          { code: "CA.I.B.K1", category: "K", description: "General airworthiness requirements and compliance for an airplane" },
          { code: "CA.I.B.K2", category: "K", description: "Aircraft maintenance requirements" },
          { code: "CA.I.B.K2a", category: "K", description: "Maintenance inspections" },
          { code: "CA.I.B.K2b", category: "K", description: "Airworthiness Directives (ADs)" },
          { code: "CA.I.B.K2c", category: "K", description: "Maintenance recordkeeping" },
          { code: "CA.I.B.K3", category: "K", description: "Procedures for operating with inoperative equipment" },
          { code: "CA.I.B.K3a", category: "K", description: "14 CFR part 91.213" },
          { code: "CA.I.B.K3b", category: "K", description: "Minimum Equipment List (MEL)" },
          { code: "CA.I.B.K4", category: "K", description: "Special flight permits" },
          { code: "CA.I.B.R1", category: "R", description: "Operating with inoperative equipment" },
          { code: "CA.I.B.R2", category: "R", description: "Flying an aircraft that is not airworthy" },
          { code: "CA.I.B.S1", category: "S", description: "Locate and explain aircraft certificates, operating limitations, and maintenance records" },
          { code: "CA.I.B.S2", category: "S", description: "Determine the aircraft is airworthy in a scenario given by the evaluator" }
        ]
      },
      {
        name: "Weather Information",
        code: "CA.I.C",
        references: "14 CFR part 91; AC 00-6, AC 00-45, AC 91-92; FAA-H-8083-2, FAA-H-8083-25, FAA-H-8083-28",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with weather information for a commercial flight.",
        stds: [
          { code: "CA.I.C.K1", category: "K", description: "Sources of weather data for flight planning" },
          { code: "CA.I.C.K2", category: "K", description: "Weather products and charts" },
          { code: "CA.I.C.K2a", category: "K", description: "METAR" },
          { code: "CA.I.C.K2b", category: "K", description: "TAF" },
          { code: "CA.I.C.K2c", category: "K", description: "Surface Analysis Chart" },
          { code: "CA.I.C.K2d", category: "K", description: "Winds and Temperatures Aloft" },
          { code: "CA.I.C.K2e", category: "K", description: "Significant Weather Prognostic Charts" },
          { code: "CA.I.C.K2f", category: "K", description: "AIRMETs and SIGMETs" },
          { code: "CA.I.C.K2g", category: "K", description: "PIREPs" },
          { code: "CA.I.C.K2h", category: "K", description: "AWOS, ASOS, and ATIS" },
          { code: "CA.I.C.K3", category: "K", description: "Atmospheric composition and stability" },
          { code: "CA.I.C.R1", category: "R", description: "Weather-related hazards for commercial operations" },
          { code: "CA.I.C.R2", category: "R", description: "Personal minimums and go/no-go decision" },
          { code: "CA.I.C.S1", category: "S", description: "Obtain and interpret weather information for the planned flight" },
          { code: "CA.I.C.S2", category: "S", description: "Analyze weather data and determine if the flight can be conducted safely" }
        ]
      },
      {
        name: "Cross-Country Flight Planning",
        code: "CA.I.D",
        references: "14 CFR part 91; FAA-H-8083-2, FAA-H-8083-25; Navigation Charts",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with cross-country flight planning.",
        stds: [
          { code: "CA.I.D.K1", category: "K", description: "Route selection, navigation charts, and publications" },
          { code: "CA.I.D.K2", category: "K", description: "Altitude selection and fuel requirements for commercial operations" },
          { code: "CA.I.D.K3", category: "K", description: "NOTAMs and TFRs" },
          { code: "CA.I.D.R1", category: "R", description: "Pilot-in-command responsibility and authority" },
          { code: "CA.I.D.R2", category: "R", description: "Fuel planning and management" },
          { code: "CA.I.D.S1", category: "S", description: "Prepare a flight log and file a VFR flight plan" },
          { code: "CA.I.D.S2", category: "S", description: "Calculate power settings, fuel consumption, and ETE" }
        ]
      },
      {
        name: "National Airspace System",
        code: "CA.I.E",
        references: "14 CFR parts 71, 91, 93; AIM; Navigation Charts",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with the National Airspace System.",
        stds: [
          { code: "CA.I.E.K1", category: "K", description: "Airspace classes, boundaries, and vertical limits" },
          { code: "CA.I.E.K1a", category: "K", description: "Class A" },
          { code: "CA.I.E.K1b", category: "K", description: "Class B" },
          { code: "CA.I.E.K1c", category: "K", description: "Class C" },
          { code: "CA.I.E.K1d", category: "K", description: "Class D" },
          { code: "CA.I.E.K1e", category: "K", description: "Class E" },
          { code: "CA.I.E.K1f", category: "K", description: "Class G" },
          { code: "CA.I.E.K1g", category: "K", description: "Special use airspace" },
          { code: "CA.I.E.K2", category: "K", description: "VFR weather minimums and equipment requirements" },
          { code: "CA.I.E.R1", category: "R", description: "Operating in complex airspace during commercial operations" },
          { code: "CA.I.E.S1", category: "S", description: "Identify and explain airspace on a sectional chart" }
        ]
      },
      {
        name: "Performance and Limitations",
        code: "CA.I.F",
        references: "FAA-H-8083-1, FAA-H-8083-2, FAA-H-8083-25; POH/AFM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with performance and limitations.",
        stds: [
          { code: "CA.I.F.K1", category: "K", description: "Atmospheric conditions and aircraft performance" },
          { code: "CA.I.F.K1a", category: "K", description: "Pressure altitude and density altitude" },
          { code: "CA.I.F.K1b", category: "K", description: "Temperature and humidity effects" },
          { code: "CA.I.F.K1c", category: "K", description: "Wind effects on performance" },
          { code: "CA.I.F.K2", category: "K", description: "Weight and balance and center of gravity" },
          { code: "CA.I.F.K3", category: "K", description: "Takeoff and landing performance data" },
          { code: "CA.I.F.K4", category: "K", description: "Cruise performance and range" },
          { code: "CA.I.F.R1", category: "R", description: "Operating near performance limits" },
          { code: "CA.I.F.S1", category: "S", description: "Calculate weight and balance and performance data for the planned flight" }
        ]
      },
      {
        name: "Operation of Systems",
        code: "CA.I.G",
        references: "FAA-H-8083-2, FAA-H-8083-25; POH/AFM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with the operation of systems.",
        stds: [
          { code: "CA.I.G.K1", category: "K", description: "Airplane systems and their operation" },
          { code: "CA.I.G.K1a", category: "K", description: "Primary and secondary flight controls" },
          { code: "CA.I.G.K1b", category: "K", description: "Powerplant and propeller systems" },
          { code: "CA.I.G.K1c", category: "K", description: "Landing gear systems" },
          { code: "CA.I.G.K1d", category: "K", description: "Fuel and fuel metering systems" },
          { code: "CA.I.G.K1e", category: "K", description: "Electrical systems" },
          { code: "CA.I.G.K1f", category: "K", description: "Hydraulic systems" },
          { code: "CA.I.G.K1g", category: "K", description: "Ice protection systems" },
          { code: "CA.I.G.K1h", category: "K", description: "Avionics and autopilot systems" },
          { code: "CA.I.G.K1i", category: "K", description: "Oxygen systems" },
          { code: "CA.I.G.R1", category: "R", description: "System malfunctions and failures" },
          { code: "CA.I.G.S1", category: "S", description: "Operate and monitor aircraft systems" }
        ]
      },
      {
        name: "Human Factors",
        code: "CA.I.H",
        references: "FAA-H-8083-2, FAA-H-8083-25; AIM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with human factors.",
        stds: [
          { code: "CA.I.H.K1", category: "K", description: "Aeronautical decision-making and risk management" },
          { code: "CA.I.H.K1a", category: "K", description: "Aeronautical decision-making" },
          { code: "CA.I.H.K1b", category: "K", description: "Risk management" },
          { code: "CA.I.H.K1c", category: "K", description: "Task management and workload" },
          { code: "CA.I.H.K1d", category: "K", description: "Situational awareness" },
          { code: "CA.I.H.K1e", category: "K", description: "Controlled flight into terrain (CFIT)" },
          { code: "CA.I.H.K2", category: "K", description: "Physiological and aeromedical factors" },
          { code: "CA.I.H.K2a", category: "K", description: "Hypoxia and hyperventilation" },
          { code: "CA.I.H.K2b", category: "K", description: "Spatial disorientation" },
          { code: "CA.I.H.K2c", category: "K", description: "Fatigue and stress" },
          { code: "CA.I.H.K2d", category: "K", description: "Alcohol, drugs, and medications" },
          { code: "CA.I.H.R1", category: "R", description: "Personal health and fitness for commercial flight" },
          { code: "CA.I.H.S1", category: "S", description: "Apply ADM and risk management principles to a commercial scenario" }
        ]
      }
    ]
  },
  {
    area: "II. Preflight Procedures",
    tasks: [
      {
        name: "Preflight Assessment",
        code: "CA.II.A",
        references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-25; POH/AFM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with preflight assessment.",
        stds: [
          { code: "CA.II.A.K1", category: "K", description: "Preflight inspection items and procedures" },
          { code: "CA.II.A.R1", category: "R", description: "Environmental factors and aircraft condition" },
          { code: "CA.II.A.S1", category: "S", description: "Perform a preflight inspection and determine airworthiness" }
        ]
      },
      {
        name: "Flight Deck Management",
        code: "CA.II.B",
        references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-25; POH/AFM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with flight deck management.",
        stds: [
          { code: "CA.II.B.K1", category: "K", description: "Cockpit organization and resource management" },
          { code: "CA.II.B.R1", category: "R", description: "Distractions and task management" },
          { code: "CA.II.B.S1", category: "S", description: "Organize the flight deck and manage resources effectively" }
        ]
      },
      {
        name: "Engine Starting",
        code: "CA.II.C",
        references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-25; POH/AFM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with engine starting.",
        stds: [
          { code: "CA.II.C.K1", category: "K", description: "Engine starting procedures and safety" },
          { code: "CA.II.C.R1", category: "R", description: "Propeller safety and engine fires" },
          { code: "CA.II.C.S1", category: "S", description: "Start the engine and monitor parameters" }
        ]
      },
      {
        name: "Taxiing",
        code: "CA.II.D",
        references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM; AIM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with taxiing.",
        stds: [
          { code: "CA.II.D.K1", category: "K", description: "Taxi procedures and airport surface movement" },
          { code: "CA.II.D.R1", category: "R", description: "Runway incursions and surface hazards" },
          { code: "CA.II.D.S1", category: "S", description: "Taxi safely using correct procedures and radio communications" }
        ]
      },
      {
        name: "Before Takeoff Check",
        code: "CA.II.E",
        references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-25; POH/AFM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with the before takeoff check.",
        stds: [
          { code: "CA.II.E.K1", category: "K", description: "Before takeoff check items and procedures" },
          { code: "CA.II.E.R1", category: "R", description: "Checklist usage and distractions" },
          { code: "CA.II.E.S1", category: "S", description: "Perform the before takeoff check and verify readiness" }
        ]
      }
    ]
  },
  {
    area: "III. Airport Operations",
    tasks: [
      {
        name: "Communications, Light Signals, and Runway Lighting Systems",
        code: "CA.III.A",
        references: "14 CFR part 91; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-25; AIM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with communications.",
        stds: [
          { code: "CA.III.A.K1", category: "K", description: "Communication procedures and phraseology" },
          { code: "CA.III.A.K2", category: "K", description: "ATC light signals and runway lighting systems" },
          { code: "CA.III.A.R1", category: "R", description: "Communication failure and lost procedures" },
          { code: "CA.III.A.S1", category: "S", description: "Maintain radio communications and interpret signals" }
        ]
      },
      {
        name: "Traffic Patterns",
        code: "CA.III.B",
        references: "14 CFR part 91; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-25; AIM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with traffic patterns.",
        stds: [
          { code: "CA.III.B.K1", category: "K", description: "Traffic pattern procedures and safety" },
          { code: "CA.III.B.R1", category: "R", description: "Collision avoidance and wake turbulence" },
          { code: "CA.III.B.S1", category: "S", description: "Follow traffic pattern procedures and maintain separation" }
        ]
      },
      {
        name: "Airport Markings, Signs, and Lighting",
        code: "CA.III.C",
        references: "FAA-H-8083-2, FAA-H-8083-25; AIM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with airport markings and signage.",
        stds: [
          { code: "CA.III.C.K1", category: "K", description: "Airport markings, signs, and lighting" },
          { code: "CA.III.C.R1", category: "R", description: "Misinterpretation of markings and runway incursions" },
          { code: "CA.III.C.S1", category: "S", description: "Identify and explain airport markings and signs" }
        ]
      }
    ]
  },
  {
    area: "IV. Takeoffs, Landings, and Go-Arounds",
    tasks: [
      {
        name: "Normal Takeoff and Climb",
        code: "CA.IV.A",
        references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with a normal takeoff and climb.",
        stds: [
          { code: "CA.IV.A.K1", category: "K", description: "Normal takeoff and climb procedures" },
          { code: "CA.IV.A.R1", category: "R", description: "Wind and surface conditions" },
          { code: "CA.IV.A.S1", category: "S", description: "Maintain centerline; establish Vy ±5 kts; track extended centerline" }
        ]
      },
      {
        name: "Normal Approach and Landing",
        code: "CA.IV.B",
        references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with a normal approach and landing.",
        stds: [
          { code: "CA.IV.B.K1", category: "K", description: "Normal approach and landing procedures" },
          { code: "CA.IV.B.R1", category: "R", description: "Stabilized approach and landing hazards" },
          { code: "CA.IV.B.S1", category: "S", description: "Stabilized by 500 ft AGL; touch down within 400 ft of aiming point" }
        ]
      },
      {
        name: "Soft-Field Takeoff and Climb",
        code: "CA.IV.C",
        references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with a soft-field takeoff and climb.",
        stds: [
          { code: "CA.IV.C.K1", category: "K", description: "Soft-field takeoff and climb procedures" },
          { code: "CA.IV.C.R1", category: "R", description: "Surface conditions and ground effect" },
          { code: "CA.IV.C.S1", category: "S", description: "Continuous rolling takeoff; accelerate in ground effect; establish Vy ±5 kts" }
        ]
      },
      {
        name: "Soft-Field Approach and Landing",
        code: "CA.IV.D",
        references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with a soft-field approach and landing.",
        stds: [
          { code: "CA.IV.D.K1", category: "K", description: "Soft-field approach and landing procedures" },
          { code: "CA.IV.D.R1", category: "R", description: "Surface conditions and touchdown control" },
          { code: "CA.IV.D.S1", category: "S", description: "Touch down at minimum controllable airspeed; maintain back pressure throughout rollout" }
        ]
      },
      {
        name: "Short-Field Takeoff and Maximum Performance Climb",
        code: "CA.IV.E",
        references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with a short-field takeoff and maximum performance climb.",
        stds: [
          { code: "CA.IV.E.K1", category: "K", description: "Short-field takeoff and maximum performance climb procedures" },
          { code: "CA.IV.E.R1", category: "R", description: "Obstacle clearance and performance limits" },
          { code: "CA.IV.E.S1", category: "S", description: "Use maximum available runway; climb at Vx ±5 kts to obstacle; transition to Vy" }
        ]
      },
      {
        name: "Short-Field Approach and Landing",
        code: "CA.IV.F",
        references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with a short-field approach and landing.",
        stds: [
          { code: "CA.IV.F.K1", category: "K", description: "Short-field approach and landing procedures" },
          { code: "CA.IV.F.R1", category: "R", description: "Obstacle clearance and touchdown accuracy" },
          { code: "CA.IV.F.S1", category: "S", description: "Touch down within 200 ft beyond aiming point; apply maximum braking" }
        ]
      },
      {
        name: "Power-Off 180° Accuracy Approach and Landing",
        code: "CA.IV.G",
        references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with a power-off 180° accuracy approach and landing.",
        stds: [
          { code: "CA.IV.G.K1", category: "K", description: "Power-off 180° accuracy approach and landing procedures" },
          { code: "CA.IV.G.K2", category: "K", description: "Energy management and glide path control" },
          { code: "CA.IV.G.R1", category: "R", description: "Misjudging glide path and landing point" },
          { code: "CA.IV.G.S1", category: "S", description: "Touch down within 200 ft beyond specified point; no power after abeam position" }
        ]
      },
      {
        name: "Forward Slip to a Landing",
        code: "CA.IV.H",
        references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with a forward slip to a landing.",
        stds: [
          { code: "CA.IV.H.K1", category: "K", description: "Forward slip procedures and purpose" },
          { code: "CA.IV.H.R1", category: "R", description: "Airspeed control and crosswind factors" },
          { code: "CA.IV.H.S1", category: "S", description: "Maintain runway alignment; airspeed ±5 kts; transition to normal attitude before touchdown" }
        ]
      },
      {
        name: "Go-Around/Rejected Landing",
        code: "CA.IV.I",
        references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with a go-around and rejected landing.",
        stds: [
          { code: "CA.IV.I.K1", category: "K", description: "Go-around procedures and decision making" },
          { code: "CA.IV.I.R1", category: "R", description: "Delayed decision and configuration changes" },
          { code: "CA.IV.I.S1", category: "S", description: "Recognize need promptly; apply full power; retract flaps incrementally; maintain directional control" }
        ]
      }
    ]
  },
  {
    area: "V. Performance Maneuvers",
    tasks: [
      {
        name: "Steep Turns",
        code: "CA.V.A",
        references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with steep turns.",
        stds: [
          { code: "CA.V.A.K1", category: "K", description: "Steep turn procedures and aerodynamics" },
          { code: "CA.V.A.R1", category: "R", description: "Overbanking tendency and structural limits" },
          { code: "CA.V.A.S1", category: "S", description: "Bank 50° ±5°; altitude ±100 ft; airspeed ±10 kts; roll out on entry heading ±10°" }
        ]
      },
      {
        name: "Steep Spirals",
        code: "CA.V.B",
        references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with steep spirals.",
        stds: [
          { code: "CA.V.B.K1", category: "K", description: "Steep spiral procedures and energy management" },
          { code: "CA.V.B.R1", category: "R", description: "Airspeed buildup and structural limits" },
          { code: "CA.V.B.S1", category: "S", description: "Maintain constant radius; complete 3 turns; roll out ±10° of entry heading" }
        ]
      },
      {
        name: "Chandelles",
        code: "CA.V.C",
        references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with chandelles.",
        stds: [
          { code: "CA.V.C.K1", category: "K", description: "Chandelle procedures and aerodynamics" },
          { code: "CA.V.C.R1", category: "R", description: "Stall awareness and airspeed control" },
          { code: "CA.V.C.S1", category: "S", description: "Maximum performance 180° climbing turn; complete turn just above stall speed; heading ±10°" }
        ]
      },
      {
        name: "Lazy Eights",
        code: "CA.V.D",
        references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with lazy eights.",
        stds: [
          { code: "CA.V.D.K1", category: "K", description: "Lazy eight procedures and coordination" },
          { code: "CA.V.D.R1", category: "R", description: "Coordination and stall awareness" },
          { code: "CA.V.D.S1", category: "S", description: "Constant change of pitch bank and airspeed; roll out on entry heading ±10°" }
        ]
      }
    ]
  },
  {
    area: "VI. Ground Reference Maneuvers",
    tasks: [
      {
        name: "Eights on Pylons",
        code: "CA.VI.A",
        references: "FAA-H-8083-2, FAA-H-8083-3",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with eights on pylons.",
        stds: [
          { code: "CA.VI.A.K1", category: "K", description: "Pivotal altitude and pylon selection" },
          { code: "CA.VI.A.K2", category: "K", description: "Effect of airspeed on pivotal altitude" },
          { code: "CA.VI.A.R1", category: "R", description: "Collision avoidance and low-level hazards" },
          { code: "CA.VI.A.S1", category: "S", description: "Maintain pivotal altitude; reference line on pylon; correct for wind" }
        ]
      }
    ]
  },
  {
    area: "VII. Navigation",
    tasks: [
      {
        name: "Pilotage and Dead Reckoning",
        code: "CA.VII.A",
        references: "FAA-H-8083-2, FAA-H-8083-25; Navigation Charts",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with pilotage and dead reckoning.",
        stds: [
          { code: "CA.VII.A.K1", category: "K", description: "Pilotage and dead reckoning procedures" },
          { code: "CA.VII.A.R1", category: "R", description: "Navigation errors and fuel management" },
          { code: "CA.VII.A.S1", category: "S", description: "Within ±3 NM of planned route; checkpoints within ±5 min; altitude ±200 ft; heading ±10°" }
        ]
      },
      {
        name: "Navigation Systems and Radar Services",
        code: "CA.VII.B",
        references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-25; AIM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with navigation systems and radar services.",
        stds: [
          { code: "CA.VII.B.K1", category: "K", description: "Navigation systems and radar services" },
          { code: "CA.VII.B.R1", category: "R", description: "System malfunctions and over-reliance on automation" },
          { code: "CA.VII.B.S1", category: "S", description: "Maintain course within ±¼ scale CDI deflection; altitude ±200 ft; heading ±10°" }
        ]
      },
      {
        name: "Diversion",
        code: "CA.VII.C",
        references: "FAA-H-8083-2, FAA-H-8083-25; Navigation Charts",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with diversion.",
        stds: [
          { code: "CA.VII.C.K1", category: "K", description: "Diversion procedures and decision making" },
          { code: "CA.VII.C.R1", category: "R", description: "Delayed decision and fuel management" },
          { code: "CA.VII.C.S1", category: "S", description: "Estimate heading and ETA within ±10%; begin diversion promptly" }
        ]
      },
      {
        name: "Lost Procedures",
        code: "CA.VII.D",
        references: "FAA-H-8083-2, FAA-H-8083-25; AIM; Navigation Charts",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with lost procedures.",
        stds: [
          { code: "CA.VII.D.K1", category: "K", description: "Lost procedures and available resources" },
          { code: "CA.VII.D.R1", category: "R", description: "Panic and fuel exhaustion" },
          { code: "CA.VII.D.S1", category: "S", description: "Maintain VFR; contact ATC promptly; determine position within reasonable time" }
        ]
      }
    ]
  },
  {
    area: "VIII. Slow Flight and Stalls",
    tasks: [
      {
        name: "Maneuvering During Slow Flight",
        code: "CA.VIII.A",
        references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with maneuvering during slow flight.",
        stds: [
          { code: "CA.VIII.A.K1", category: "K", description: "Slow flight procedures and aerodynamics" },
          { code: "CA.VIII.A.R1", category: "R", description: "Stall/spin awareness and altitude loss" },
          { code: "CA.VIII.A.S1", category: "S", description: "Airspeed at or below 1.2 Vso; altitude ±100 ft; heading ±10°; bank in turns ±10°" }
        ]
      },
      {
        name: "Power-Off Stalls",
        code: "CA.VIII.B",
        references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with power-off stalls.",
        stds: [
          { code: "CA.VIII.B.K1", category: "K", description: "Power-off stall procedures and aerodynamics" },
          { code: "CA.VIII.B.R1", category: "R", description: "Secondary stalls and spin awareness" },
          { code: "CA.VIII.B.S1", category: "S", description: "Recover at first indication; minimize altitude loss; wings level on recovery" }
        ]
      },
      {
        name: "Power-On Stalls",
        code: "CA.VIII.C",
        references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with power-on stalls.",
        stds: [
          { code: "CA.VIII.C.K1", category: "K", description: "Power-on stall procedures and aerodynamics" },
          { code: "CA.VIII.C.R1", category: "R", description: "Secondary stalls and spin awareness" },
          { code: "CA.VIII.C.S1", category: "S", description: "Recover at first indication; minimize altitude loss; heading ±10° on recovery" }
        ]
      },
      {
        name: "Accelerated Stalls",
        code: "CA.VIII.D",
        references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with accelerated stalls.",
        stds: [
          { code: "CA.VIII.D.K1", category: "K", description: "Accelerated stall aerodynamics and conditions" },
          { code: "CA.VIII.D.K2", category: "K", description: "Relationship between load factor and stall speed" },
          { code: "CA.VIII.D.R1", category: "R", description: "Structural limits and secondary stall" },
          { code: "CA.VIII.D.S1", category: "S", description: "Recognize and recover from accelerated stall; minimize altitude loss" }
        ]
      },
      {
        name: "Spin Awareness",
        code: "CA.VIII.E",
        references: "FAA-H-8083-2, FAA-H-8083-3; AC 61-67; POH/AFM",
        objective: "To determine that the applicant exhibits satisfactory knowledge and risk management associated with spin awareness.",
        stds: [
          { code: "CA.VIII.E.K1", category: "K", description: "Spin aerodynamics and recovery procedures" },
          { code: "CA.VIII.E.K2", category: "K", description: "Spin prevention and recognition" },
          { code: "CA.VIII.E.R1", category: "R", description: "Stall/spin hazards and structural limits" }
        ]
      }
    ]
  },
  {
    area: "IX. High Altitude Operations",
    tasks: [
      {
        name: "Supplemental Oxygen",
        code: "CA.IX.A",
        references: "14 CFR part 91; FAA-H-8083-2, FAA-H-8083-25; AIM",
        objective: "To determine that the applicant exhibits satisfactory knowledge and risk management associated with supplemental oxygen requirements.",
        stds: [
          { code: "CA.IX.A.K1", category: "K", description: "Oxygen requirements for flight crew and passengers 14 CFR §91.211" },
          { code: "CA.IX.A.K2", category: "K", description: "Hypoxia symptoms and effects" },
          { code: "CA.IX.A.R1", category: "R", description: "Hypoxia and time of useful consciousness" }
        ]
      },
      {
        name: "Pressurization",
        code: "CA.IX.B",
        references: "FAA-H-8083-2, FAA-H-8083-25; POH/AFM",
        objective: "To determine that the applicant exhibits satisfactory knowledge and risk management associated with pressurization systems.",
        stds: [
          { code: "CA.IX.B.K1", category: "K", description: "Pressurization system operation and limitations" },
          { code: "CA.IX.B.K2", category: "K", description: "Cabin altitude and differential pressure" },
          { code: "CA.IX.B.R1", category: "R", description: "Pressurization failure and emergency procedures" }
        ]
      }
    ]
  },
  {
    area: "X. Emergency Operations",
    tasks: [
      {
        name: "Emergency Descent",
        code: "CA.X.A",
        references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with emergency descent.",
        stds: [
          { code: "CA.X.A.K1", category: "K", description: "Emergency descent procedures and purpose" },
          { code: "CA.X.A.R1", category: "R", description: "Structural limits and collision avoidance" },
          { code: "CA.X.A.S1", category: "S", description: "Establish maximum allowable airspeed promptly; use up to 45° bank; maintain heading ±10°" }
        ]
      },
      {
        name: "Emergency Approach and Landing (Simulated)",
        code: "CA.X.B",
        references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with emergency approach and landing.",
        stds: [
          { code: "CA.X.B.K1", category: "K", description: "Emergency approach and landing procedures" },
          { code: "CA.X.B.R1", category: "R", description: "Landing site selection and configuration" },
          { code: "CA.X.B.S1", category: "S", description: "Establish Vg ±5 kts; select suitable field; complete checklist; plan approach to reach field" }
        ]
      },
      {
        name: "Systems and Equipment Malfunctions",
        code: "CA.X.C",
        references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-25; POH/AFM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with systems and equipment malfunctions.",
        stds: [
          { code: "CA.X.C.K1", category: "K", description: "System malfunctions and recovery procedures" },
          { code: "CA.X.C.R1", category: "R", description: "Distractions and task management during emergencies" },
          { code: "CA.X.C.S1", category: "S", description: "Correctly identify malfunction; follow POH checklist; maintain aircraft control" }
        ]
      },
      {
        name: "Emergency Equipment and Survival Gear",
        code: "CA.X.D",
        references: "FAA-H-8083-2, FAA-H-8083-25; POH/AFM",
        objective: "To determine that the applicant exhibits satisfactory knowledge and risk management associated with emergency equipment and survival gear.",
        stds: [
          { code: "CA.X.D.K1", category: "K", description: "Emergency equipment location and usage" },
          { code: "CA.X.D.R1", category: "R", description: "Environmental hazards and survival priorities" }
        ]
      }
    ]
  },
  {
    area: "XI. Postflight Procedures",
    tasks: [
      {
        name: "After Landing, Parking, and Securing",
        code: "CA.XI.A",
        references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with after landing, parking, and securing.",
        stds: [
          { code: "CA.XI.A.K1", category: "K", description: "Postflight procedures and securing the aircraft" },
          { code: "CA.XI.A.R1", category: "R", description: "Surface hazards and securing errors" },
          { code: "CA.XI.A.S1", category: "S", description: "Perform postflight procedures correctly and secure the aircraft" }
        ]
      }
    ]
  }
];
