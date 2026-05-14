import { ACSArea } from '../types';

export const CPL_AMEL_GROUND_ACS: ACSArea[] = [
  {
    area: "I. Multiengine Aerodynamics and VMC",
    tasks: [
      {
        name: "Multiengine Aerodynamics",
        code: "CA.G.I.A",
        references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-12",
        objective: "To determine the applicant exhibits satisfactory knowledge of multiengine aerodynamic principles.",
        stds: [
          { code: "CA.G.I.A.K1", category: "K", description: "Asymmetric thrust and P-factor with one engine inoperative" },
          { code: "CA.G.I.A.K2", category: "K", description: "Critical engine and the effects of engine failure on aircraft control" },
          { code: "CA.G.I.A.R1", category: "R", description: "Complacency with multiengine performance margins" }
        ]
      },
      {
        name: "VMC — Definition and Factors",
        code: "CA.G.I.B",
        references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-12; 14 CFR part 23",
        objective: "To determine the applicant exhibits satisfactory knowledge of VMC and the factors that affect it.",
        stds: [
          { code: "CA.G.I.B.K1", category: "K", description: "Published Vmc and the conditions under which it was determined" },
          { code: "CA.G.I.B.K2", category: "K", description: "Factors that increase and decrease actual VMC" },
          { code: "CA.G.I.B.R1", category: "R", description: "Operating near or below Vmc" }
        ]
      },
      {
        name: "Accelerate-Stop and Accelerate-Go",
        code: "CA.G.I.C",
        references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-12; POH/AFM",
        objective: "To determine the applicant exhibits satisfactory knowledge of accelerate-stop and accelerate-go distances.",
        stds: [
          { code: "CA.G.I.C.K1", category: "K", description: "Definition and use of accelerate-stop distance" },
          { code: "CA.G.I.C.K2", category: "K", description: "Definition and use of accelerate-go distance" },
          { code: "CA.G.I.C.R1", category: "R", description: "Density altitude and runway length effects on these distances" }
        ]
      },
      {
        name: "Propeller Feathering",
        code: "CA.G.I.D",
        references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-12; POH/AFM",
        objective: "To determine the applicant exhibits satisfactory knowledge of propeller feathering systems and procedures.",
        stds: [
          { code: "CA.G.I.D.K1", category: "K", description: "Purpose of feathering and how feathering reduces drag" },
          { code: "CA.G.I.D.K2", category: "K", description: "Autofeather systems where applicable" },
          { code: "CA.G.I.D.R1", category: "R", description: "Delayed feathering and its effect on single-engine performance" }
        ]
      }
    ]
  },
  {
    area: "II. OEI Performance",
    tasks: [
      {
        name: "Single-Engine Service Ceiling",
        code: "CA.G.II.A",
        references: "FAA-H-8083-2, FAA-H-8083-12; POH/AFM",
        objective: "To determine the applicant exhibits satisfactory knowledge of single-engine service ceiling and performance.",
        stds: [
          { code: "CA.G.II.A.K1", category: "K", description: "Definition of single-engine absolute and service ceiling" },
          { code: "CA.G.II.A.K2", category: "K", description: "How weight altitude and temperature affect OEI ceiling" },
          { code: "CA.G.II.A.R1", category: "R", description: "Operating above single-engine service ceiling" }
        ]
      },
      {
        name: "Vyse and Vxse",
        code: "CA.G.II.B",
        references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-12; POH/AFM",
        objective: "To determine the applicant exhibits satisfactory knowledge of best single-engine rate and angle of climb speeds.",
        stds: [
          { code: "CA.G.II.B.K1", category: "K", description: "Definition and use of Vyse (blue line) for best single-engine rate of climb" },
          { code: "CA.G.II.B.K2", category: "K", description: "Definition and use of Vxse for best single-engine angle of climb" },
          { code: "CA.G.II.B.R1", category: "R", description: "Flying below Vyse after engine failure" }
        ]
      },
      {
        name: "Zero Sideslip",
        code: "CA.G.II.C",
        references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-12",
        objective: "To determine the applicant exhibits satisfactory knowledge of zero sideslip technique for OEI flight.",
        stds: [
          { code: "CA.G.II.C.K1", category: "K", description: "How zero sideslip differs from wings-level and coordinated ball-centered flight OEI" },
          { code: "CA.G.II.C.K2", category: "K", description: "Correct bank angle and rudder input for zero sideslip" },
          { code: "CA.G.II.C.R1", category: "R", description: "Excessive bank or ball deflection increasing drag and reducing climb performance" }
        ]
      }
    ]
  },
  {
    area: "III. Multiengine Systems",
    tasks: [
      {
        name: "Engine and Propeller Systems",
        code: "CA.G.III.A",
        references: "FAA-H-8083-2, FAA-H-8083-25; POH/AFM",
        objective: "To determine the applicant exhibits satisfactory knowledge of multiengine powerplant and propeller systems.",
        stds: [
          { code: "CA.G.III.A.K1", category: "K", description: "Counterrotating engines and the effect on critical engine designation" },
          { code: "CA.G.III.A.K2", category: "K", description: "Constant-speed propeller operation and controls" },
          { code: "CA.G.III.A.R1", category: "R", description: "Incorrect power management and propeller control inputs" }
        ]
      },
      {
        name: "Fuel and Oil Systems",
        code: "CA.G.III.B",
        references: "FAA-H-8083-2, FAA-H-8083-25; POH/AFM",
        objective: "To determine the applicant exhibits satisfactory knowledge of multiengine fuel and oil systems.",
        stds: [
          { code: "CA.G.III.B.K1", category: "K", description: "Fuel system configuration including crossfeed in multiengine airplanes" },
          { code: "CA.G.III.B.K2", category: "K", description: "Oil system monitoring and temperature limits" },
          { code: "CA.G.III.B.R1", category: "R", description: "Fuel mismanagement and crossfeed errors" }
        ]
      },
      {
        name: "Electrical and Hydraulic Systems",
        code: "CA.G.III.C",
        references: "FAA-H-8083-2, FAA-H-8083-25; POH/AFM",
        objective: "To determine the applicant exhibits satisfactory knowledge of multiengine electrical and hydraulic systems.",
        stds: [
          { code: "CA.G.III.C.K1", category: "K", description: "Dual electrical bus architecture and failure isolation" },
          { code: "CA.G.III.C.K2", category: "K", description: "Hydraulic system use for gear and flap operation" },
          { code: "CA.G.III.C.R1", category: "R", description: "Single electrical failure cascading to multiple system losses" }
        ]
      }
    ]
  }
];
