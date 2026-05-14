import { ACSArea } from '../types';

export const CPL_AMEL_ACS: ACSArea[] = [
  {
    area: "I. Preflight Preparation",
    tasks: [
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
        name: "Taxiing ASEL and AMEL",
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
    tasks: []
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
        name: "Short-Field Takeoff and Maximum Performance Climb (AMEL)",
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
        name: "Short-Field Approach and Landing (AMEL)",
        code: "CA.IV.F",
        references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with a short-field approach and landing.",
        stds: [
          { code: "CA.IV.F.K1", category: "K", description: "Short-field approach and landing procedures" },
          { code: "CA.IV.F.R1", category: "R", description: "Obstacle clearance and touchdown accuracy" },
          { code: "CA.IV.F.S1", category: "S", description: "Touch down within 200 ft beyond aiming point; apply maximum braking" }
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
      }
    ]
  },
  {
    area: "VI. Navigation",
    tasks: []
  },
  {
    area: "VII. Slow Flight and Stalls",
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
    area: "VIII. High Altitude Operations",
    tasks: []
  },
  {
    area: "IX. Emergency Operations — Multiengine",
    tasks: [
      {
        name: "Engine Failure Before VMC",
        code: "CA.IX.E",
        references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-12; POH/AFM",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with engine failure before VMC on the ground.",
        stds: [
          { code: "CA.IX.E.K1", category: "K", description: "Recognize engine failure indications and abort procedures" },
          { code: "CA.IX.E.R1", category: "R", description: "Runway overrun and directional control loss" },
          { code: "CA.IX.E.S1", category: "S", description: "Close throttles immediately, maintain directional control, bring aircraft to a stop" }
        ]
      },
      {
        name: "Engine Failure After Liftoff",
        code: "CA.IX.F",
        references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-12; POH/AFM",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with engine failure after liftoff.",
        stds: [
          { code: "CA.IX.F.K1", category: "K", description: "Decision altitude and accelerate-stop versus accelerate-go" },
          { code: "CA.IX.F.R1", category: "R", description: "Attempting to climb below VMC and loss of directional control" },
          { code: "CA.IX.F.S1", category: "S", description: "Identify, verify, and feather failed engine; maintain directional control; establish Vyse" }
        ]
      },
      {
        name: "Approach and Landing with an Inoperative Engine",
        code: "CA.IX.G",
        references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-12; POH/AFM",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with approach and landing with an inoperative engine.",
        stds: [
          { code: "CA.IX.G.K1", category: "K", description: "Single-engine approach procedures and go-around considerations" },
          { code: "CA.IX.G.R1", category: "R", description: "Loss of directional control during go-around" },
          { code: "CA.IX.G.S1", category: "S", description: "Maintain Vyse on approach; touch down within 400 ft of aiming point; maintain directional control throughout" }
        ]
      }
    ]
  },
  {
    area: "X. Multiengine Operations",
    tasks: [
      {
        name: "Maneuvering with One Engine Inoperative",
        code: "CA.X.A",
        references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-12; POH/AFM",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with maneuvering with one engine inoperative.",
        stds: [
          { code: "CA.X.A.K1", category: "K", description: "Performance and control characteristics OEI" },
          { code: "CA.X.A.R1", category: "R", description: "Loss of control during slow flight OEI" },
          { code: "CA.X.A.S1", category: "S", description: "Maintain altitude ±100 ft, heading ±10°, airspeed at or above Vyse" }
        ]
      },
      {
        name: "VMC Demonstration",
        code: "CA.X.B",
        references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-12; POH/AFM",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with the VMC demonstration.",
        stds: [
          { code: "CA.X.B.K1", category: "K", description: "Factors affecting VMC and the published Vmc speed" },
          { code: "CA.X.B.R1", category: "R", description: "Exceeding the actual VMC and stall/spin entry" },
          { code: "CA.X.B.S1", category: "S", description: "Establish single-engine scenario; reduce speed toward Vmc; recognize and recover before loss of directional control" }
        ]
      },
      {
        name: "One Engine Inoperative — Instrument Approach",
        code: "CA.X.C",
        references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-12; POH/AFM",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with instrument approach procedures with one engine inoperative.",
        note: "Required only if applicant holds instrument rating or has demonstrated multiengine instrument proficiency",
        stds: [
          { code: "CA.X.C.K1", category: "K", description: "Single-engine instrument approach procedures and limitations" },
          { code: "CA.X.C.R1", category: "R", description: "Go-around considerations with inoperative engine" },
          { code: "CA.X.C.S1", category: "S", description: "Fly published approach; maintain course within one dot; touch down within 400 ft of aiming point" }
        ]
      },
      {
        name: "Instrument Approach and Landing with an Inoperative Engine — Simulated",
        code: "CA.X.D",
        references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-12; POH/AFM",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with completing an instrument approach to landing with one engine inoperative.",
        note: "Required only if applicant holds instrument rating or has demonstrated multiengine instrument proficiency",
        stds: [
          { code: "CA.X.D.K1", category: "K", description: "Missed approach considerations with inoperative engine" },
          { code: "CA.X.D.R1", category: "R", description: "Attempting go-around below minimums with inoperative engine" },
          { code: "CA.X.D.S1", category: "S", description: "Execute missed approach or land from single-engine approach; maintain directional control" }
        ]
      }
    ]
  },
  {
    area: "XI. Postflight Procedures",
    tasks: []
  }
];
