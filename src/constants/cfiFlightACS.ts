import { ACSArea } from '../types';

export const CFI_FLIGHT_ACS: ACSArea[] = [
  {
    area: "II. Technical Subject Areas",
    tasks: [
      {
        name: "Aeromedical Factors",
        code: "FI.II.A",
        references: "FAA-H-8083-2, FAA-H-8083-25; AIM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with aeromedical factors.",
        stds: [
          { code: "FI.II.A.K1", category: "K", description: "Hypoxia, its symptoms and effects, and corrective action." },
          { code: "FI.II.A.K2", category: "K", description: "Hyperventilation, its symptoms and effects, and corrective action." },
          { code: "FI.II.A.K3", category: "K", description: "Middle ear and sinus problems." },
          { code: "FI.II.A.K4", category: "K", description: "Spatial disorientation, optical illusions, and corrective action." },
          { code: "FI.II.A.K5", category: "K", description: "Motion sickness." },
          { code: "FI.II.A.K6", category: "K", description: "Carbon monoxide poisoning." },
          { code: "FI.II.A.K7", category: "K", description: "Stress and fatigue." },
          { code: "FI.II.A.K8", category: "K", description: "Dehydration." },
          { code: "FI.II.A.K9", category: "K", description: "Alcohol and drugs, and their effect on pilot performance." },
          { code: "FI.II.A.K10", category: "K", description: "Scuba diving and its effects on the pilot." },
          { code: "FI.II.A.R1", category: "R", description: "Aeronautical decision-making and risk management." },
          { code: "FI.II.A.S1", category: "S", description: "Explain aeromedical factors in an instructional environment." }
        ]
      },
      {
        name: "Principles of Flight",
        code: "FI.II.C",
        references: "FAA-H-8083-2, FAA-H-8083-25",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with principles of flight.",
        stds: [
          { code: "FI.II.C.K1", category: "K", description: "Airfoil design and terminology." },
          { code: "FI.II.C.K2", category: "K", description: "Forces acting on an airplane." },
          { code: "FI.II.C.K3", category: "K", description: "Bernoulli's Principle and Newton's Laws." },
          { code: "FI.II.C.K4", category: "K", description: "Stability and control." },
          { code: "FI.II.C.K5", category: "K", description: "Load factor." },
          { code: "FI.II.C.K6", category: "K", description: "Stalls and spins." },
          { code: "FI.II.C.R1", category: "R", description: "Operating near the edges of the flight envelope." },
          { code: "FI.II.C.S1", category: "S", description: "Explain principles of flight in an instructional environment." }
        ]
      }
    ]
  },
  {
    area: "VII. Takeoffs, Landings, and Go-Arounds",
    tasks: [
      {
        name: "Normal Takeoff and Climb",
        code: "FI.VII.A",
        references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with normal takeoff and climb.",
        stds: [
          { code: "FI.VII.A.K1", category: "K", description: "Normal takeoff and climb procedures and aerodynamics." },
          { code: "FI.VII.A.R1", category: "R", description: "Wind and surface conditions." },
          { code: "FI.VII.A.S1", category: "S", description: "Establish and maintain Vy ±5 knots." },
          { code: "FI.VII.A.S2", category: "S", description: "Maintain directional control and track extend centerline." },
          { code: "FI.VII.A.S3", category: "S", description: "Analyze and correct student performance." }
        ]
      },
      {
        name: "Power-Off 180° Accuracy Approach and Landing",
        code: "FI.VII.G",
        references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with a power-off 180° accuracy approach and landing.",
        stds: [
          { code: "FI.VII.G.K1", category: "K", description: "Power-off 180° accuracy approach and landing procedures." },
          { code: "FI.VII.G.R1", category: "R", description: "Energy management and glide path control." },
          { code: "FI.VII.G.S1", category: "S", description: "Touch down within 200 feet beyond the specified line." },
          { code: "FI.VII.G.S2", category: "S", description: "Explain and demonstrate the maneuver simultaneously." }
        ]
      }
    ]
  },
  {
    area: "IX. Performance Maneuvers",
    tasks: [
      {
        name: "Steep Turns",
        code: "FI.IX.A",
        references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with steep turns.",
        stds: [
          { code: "FI.IX.A.K1", category: "K", description: "Steep turn procedures and aerodynamics." },
          { code: "FI.IX.A.R1", category: "R", description: "Overbanking tendency and structural limits." },
          { code: "FI.IX.A.S1", category: "S", description: "Maintain altitude ±100 feet; airspeed ±10 knots." },
          { code: "FI.IX.A.S2", category: "S", description: "Maintain bank angle 50° ±5°." },
          { code: "FI.IX.A.S3", category: "S", description: "Analyze and correct student performance." }
        ]
      },
      {
        name: "Chandelles",
        code: "FI.IX.C",
        references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with chandelles.",
        stds: [
          { code: "FI.IX.C.K1", category: "K", description: "Chandelle procedures and coordination." },
          { code: "FI.IX.C.R1", category: "R", description: "Stall awareness and coordination errors." },
          { code: "FI.IX.C.S1", category: "S", description: "Maximum performance 180° climbing turn." },
          { code: "FI.IX.C.S2", category: "S", description: "Complete the maneuver within 10° of the initial heading just above stall speed." }
        ]
      }
    ]
  },
  {
    area: "XI. Slow Flight, Stalls, and Spins",
    tasks: [
      {
        name: "Maneuvering During Slow Flight",
        code: "FI.XI.A",
        references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with maneuvering during slow flight.",
        stds: [
          { code: "FI.XI.A.K1", category: "K", description: "Relationship between airspeed, load factor, and stall speed." },
          { code: "FI.XI.A.R1", category: "R", description: "Stall/spin awareness and coordination." },
          { code: "FI.XI.A.S1", category: "S", description: "Establish and maintain an airspeed at which any further increase in angle of attack would result in a stall." },
          { code: "FI.XI.A.S2", category: "S", description: "Analyze and correct student performance." }
        ]
      },
      {
        name: "Spin Awareness",
        code: "FI.XI.H",
        references: "FAA-H-8083-2, FAA-H-8083-3; AC 61-67; POH/AFM",
        objective: "To determine that the applicant exhibits satisfactory knowledge and risk management associated with spin awareness.",
        stds: [
          { code: "FI.XI.H.K1", category: "K", description: "Spin aerodynamics, recovery procedures, and prevention." },
          { code: "FI.XI.H.R1", category: "R", description: "Stall/spin hazards and structural limits." },
          { code: "FI.XI.H.S1", category: "S", description: "Explain spin awareness and recovery in an instructional environment." }
        ]
      }
    ]
  },
  {
    area: "XIII. Emergency Operations",
    tasks: [
      {
        name: "Emergency Approach and Landing (Simulated)",
        code: "FI.XIII.B",
        references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with an emergency approach and landing.",
        stds: [
          { code: "FI.XIII.B.K1", category: "K", description: "Emergency approach and landing procedures." },
          { code: "FI.XIII.B.R1", category: "R", description: "Landing site selection and energy management." },
          { code: "FI.XIII.B.S1", category: "S", description: "Establish and maintain Vg ±5 knots." },
          { code: "FI.XIII.B.S2", category: "S", description: "Plan and fly an approach to reach a landing site." },
          { code: "FI.XIII.B.S3", category: "S", description: "Demonstrate SRM/CRM effectively." }
        ]
      }
    ]
  }
];
