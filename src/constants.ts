import { ACSArea, ACSTask } from './types';

const createPlaceholderTask = (name: string, code: string): ACSTask => ({
  name,
  code,
  references: "See FAA ACS for references and objective",
  objective: "See FAA ACS for references and objective",
  stds: []
});

export const ALL_ACS: Record<string, ACSArea[]> = {
  ppl: [
    { 
      area: "I. Preflight Preparation", 
      tasks: [
        {
          name: "Pilot Qualifications",
          code: "PA.I.A",
          references: "14 CFR parts 61, 68; AC 68-1; FAA-H-8083-2, FAA-H-8083-25",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with pilot qualifications.",
          stds: [
            { code: "PA.I.A.K1", category: "K", description: "Certification requirements, recency of experience, and recordkeeping" },
            { code: "PA.I.A.K2", category: "K", description: "Privileges and limitations" },
            { code: "PA.I.A.K3", category: "K", description: "Medical certificates: class, expiration, privileges, and temporary disqualifications" },
            { code: "PA.I.A.K4", category: "K", description: "Documents required to exercise privileges" },
            { code: "PA.I.A.K5", category: "K", description: "Part 68 BasicMed privileges and limitations" },
            { code: "PA.I.A.R1", category: "R", description: "Proficiency versus currency" },
            { code: "PA.I.A.R2", category: "R", description: "Personal minimums" },
            { code: "PA.I.A.S1", category: "S", description: "Apply requirements to act as pilot-in-command in a scenario given by the evaluator" }
          ]
        },
        {
          name: "Airworthiness Requirements",
          code: "PA.I.B",
          references: "14 CFR parts 21, 39, 43, 91; FAA-H-8083-2, FAA-H-8083-25",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with airworthiness requirements, including aircraft required certificates and documents.",
          stds: [
            { code: "PA.I.B.K1", category: "K", description: "General airworthiness requirements and compliance for an airplane" },
            { code: "PA.I.B.K2", category: "K", description: "Aircraft maintenance requirements" },
            { code: "PA.I.B.K3", category: "K", description: "Procedures for operating with inoperative equipment" },
            { code: "PA.I.B.K4", category: "K", description: "Special flight permits" },
            { code: "PA.I.B.R1", category: "R", description: "Operating with inoperative equipment" },
            { code: "PA.I.B.R2", category: "R", description: "Flying an aircraft that is not airworthy" },
            { code: "PA.I.B.S1", category: "S", description: "Locate and explain aircraft certificates, operating limitations, and maintenance records" },
            { code: "PA.I.B.S2", category: "S", description: "Determine the aircraft is airworthy in a scenario given by the evaluator" }
          ]
        },
        {
          name: "Weather Information",
          code: "PA.I.C",
          references: "14 CFR part 91; AC 00-6, AC 00-45, AC 91-92; FAA-H-8083-2, FAA-H-8083-25, FAA-H-8083-28",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with weather information for a flight under VFR.",
          stds: [
            { code: "PA.I.C.K1", category: "K", description: "Sources of weather data" },
            { code: "PA.I.C.K2", category: "K", description: "Weather products and charts" },
            { code: "PA.I.C.K3", category: "K", description: "Atmospheric composition and stability" },
            { code: "PA.I.C.R1", category: "R", description: "Weather-related hazards" },
            { code: "PA.I.C.R2", category: "R", description: "Personal minimums and go/no-go decision" },
            { code: "PA.I.C.S1", category: "S", description: "Obtain and interpret weather information for the planned flight" },
            { code: "PA.I.C.S2", category: "S", description: "Analyze weather data and determine if the flight can be conducted safely under VFR" }
          ]
        },
        {
          name: "Cross-Country Flight Planning",
          code: "PA.I.D",
          references: "14 CFR part 91; FAA-H-8083-2, FAA-H-8083-25; Navigation Charts",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with cross-country flight planning.",
          stds: [
            { code: "PA.I.D.K1", category: "K", description: "Route selection, navigation charts, and publications" },
            { code: "PA.I.D.K2", category: "K", description: "Altitude selection and fuel requirements" },
            { code: "PA.I.D.R1", category: "R", description: "Pilot-in-command responsibility and authority" },
            { code: "PA.I.D.R2", category: "R", description: "Fuel planning and management" },
            { code: "PA.I.D.S1", category: "S", description: "Prepare a flight log and file a VFR flight plan" },
            { code: "PA.I.D.S2", category: "S", description: "Calculate power settings, fuel consumption, and ETE" }
          ]
        },
        {
          name: "National Airspace System",
          code: "PA.I.E",
          references: "14 CFR part 71, 14 CFR part 91, 14 CFR part 93; AIM; Navigation Charts",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with the National Airspace System (NAS).",
          stds: [
            { code: "PA.I.E.K1", category: "K", description: "Airspace classes, boundaries, and vertical limits" },
            { code: "PA.I.E.K2", category: "K", description: "Weather minimums and equipment requirements" },
            { code: "PA.I.E.R1", category: "R", description: "Operating in complex airspace" },
            { code: "PA.I.E.S1", category: "S", description: "Identify and explain airspace on a sectional chart" }
          ]
        },
        {
          name: "Performance and Limitations",
          code: "PA.I.F",
          references: "FAA-H-8083-1, FAA-H-8083-2, FAA-H-8083-25; POH/AFM",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with performance and limitations.",
          stds: [
            { code: "PA.I.F.K1", category: "K", description: "Atmospheric conditions and aircraft performance" },
            { code: "PA.I.F.K2", category: "K", description: "Weight and balance and center of gravity" },
            { code: "PA.I.F.R1", category: "R", description: "Operating near performance limits" },
            { code: "PA.I.F.S1", category: "S", description: "Calculate weight and balance and performance data" }
          ]
        },
        {
          name: "Operation of Systems",
          code: "PA.I.G",
          references: "FAA-H-8083-2, FAA-H-8083-25; POH/AFM",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with the operation of systems.",
          stds: [
            { code: "PA.I.G.K1", category: "K", description: "Airplane systems and their operation" },
            { code: "PA.I.G.R1", category: "R", description: "System malfunctions and failures" },
            { code: "PA.I.G.S1", category: "S", description: "Operate and monitor aircraft systems" }
          ]
        },
        {
          name: "Human Factors",
          code: "PA.I.H",
          references: "FAA-H-8083-2, FAA-H-8083-25; AIM",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with human factors.",
          stds: [
            { code: "PA.I.H.K1", category: "K", description: "Aeronautical decision-making and risk management" },
            { code: "PA.I.H.K2", category: "K", description: "Physiological factors and aeromedical factors" },
            { code: "PA.I.H.R1", category: "R", description: "Personal health and fitness for flight" },
            { code: "PA.I.H.S1", category: "S", description: "Apply ADM and risk management principles" }
          ]
        }
      ] 
    },
    { 
      area: "II. Preflight Procedures", 
      tasks: [
        {
          name: "Preflight Assessment",
          code: "PA.II.A",
          references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-25; POH/AFM",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with preflight assessment.",
          stds: [
            { code: "PA.II.A.K1", category: "K", description: "Preflight inspection items and procedures" },
            { code: "PA.II.A.R1", category: "R", description: "Environmental factors and aircraft condition" },
            { code: "PA.II.A.S1", category: "S", description: "Perform a preflight inspection and determine airworthiness" }
          ]
        },
        {
          name: "Flight Deck Management",
          code: "PA.II.B",
          references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-25; POH/AFM",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with flight deck management.",
          stds: [
            { code: "PA.II.B.K1", category: "K", description: "Cockpit organization and resource management" },
            { code: "PA.II.B.R1", category: "R", description: "Distractions and task management" },
            { code: "PA.II.B.S1", category: "S", description: "Organize the flight deck and manage resources" }
          ]
        },
        {
          name: "Engine Starting",
          code: "PA.II.C",
          references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-25; POH/AFM",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with engine starting.",
          stds: [
            { code: "PA.II.C.K1", category: "K", description: "Engine starting procedures and safety" },
            { code: "PA.II.C.R1", category: "R", description: "Propeller safety and engine fires" },
            { code: "PA.II.C.S1", category: "S", description: "Start the engine and monitor parameters" }
          ]
        },
        {
          name: "Before Takeoff Check",
          code: "PA.II.E",
          references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-25; POH/AFM",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with the before takeoff check.",
          stds: [
            { code: "PA.II.E.K1", category: "K", description: "Before takeoff check items and procedures" },
            { code: "PA.II.E.R1", category: "R", description: "Checklist usage and distractions" },
            { code: "PA.II.E.S1", category: "S", description: "Perform the before takeoff check and verify readiness" }
          ]
        }
      ] 
    },
    { 
      area: "III. Airport Operations", 
      tasks: [
        {
          name: "Communications, Light Signals, and Runway Lighting Systems",
          code: "PA.III.A",
          references: "14 CFR part 91; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-25; AIM",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with communications, light signals, and runway lighting systems.",
          stds: [
            { code: "PA.III.A.K1", category: "K", description: "Communication procedures and phraseology" },
            { code: "PA.III.A.K2", category: "K", description: "ATC light signals and their meanings" },
            { code: "PA.III.A.R1", category: "R", description: "Communication failure and lost procedures" },
            { code: "PA.III.A.S1", category: "S", description: "Maintain radio communications and interpret signals" }
          ]
        },
        {
          name: "Traffic Patterns",
          code: "PA.III.B",
          references: "14 CFR part 91; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-25; AIM",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with traffic patterns.",
          stds: [
            { code: "PA.III.B.K1", category: "K", description: "Traffic pattern procedures and safety" },
            { code: "PA.III.B.R1", category: "R", description: "Collision avoidance and wake turbulence" },
            { code: "PA.III.B.S1", category: "S", description: "Follow traffic pattern procedures and maintain separation" }
          ]
        },
        {
          name: "Airport Markings, Signs, and Lighting",
          code: "PA.III.C",
          references: "FAA-H-8083-2, FAA-H-8083-25; AIM",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with airport marking and signage.",
          stds: [
            { code: "PA.III.C.K1", category: "K", description: "Airport markings, signs, and lighting" },
            { code: "PA.III.C.R1", category: "R", description: "Misinterpretation of markings and signs" },
            { code: "PA.III.C.S1", category: "S", description: "Identify and explain airport markings and signs" }
          ]
        }
      ] 
    },
    { 
      area: "IV. Takeoffs, Landings, and Go-Arounds", 
      tasks: [
        {
          name: "Normal Takeoff and Climb",
          code: "PA.IV.A",
          references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with a normal takeoff and climb.",
          stds: [
            { code: "PA.IV.A.K1", category: "K", description: "Normal takeoff and climb procedures" },
            { code: "PA.IV.A.R1", category: "R", description: "Wind and surface conditions" },
            { code: "PA.IV.A.S1", category: "S", description: "Perform a normal takeoff and climb within standards" }
          ]
        },
        {
          name: "Normal Approach and Landing",
          code: "PA.IV.B",
          references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with a normal approach and landing.",
          stds: [
            { code: "PA.IV.B.K1", category: "K", description: "Normal approach and landing procedures" },
            { code: "PA.IV.B.R1", category: "R", description: "Stabilized approach and landing hazards" },
            { code: "PA.IV.B.S1", category: "S", description: "Perform a normal approach and landing within standards" }
          ]
        },
        {
          name: "Soft-Field Takeoff and Climb",
          code: "PA.IV.C",
          references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with a soft-field takeoff and climb.",
          stds: [
            { code: "PA.IV.C.K1", category: "K", description: "Soft-field takeoff and climb procedures" },
            { code: "PA.IV.C.R1", category: "R", description: "Surface conditions and ground effect" },
            { code: "PA.IV.C.S1", category: "S", description: "Perform a soft-field takeoff and climb within standards" }
          ]
        },
        {
          name: "Soft-Field Approach and Landing",
          code: "PA.IV.D",
          references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with a soft-field approach and landing.",
          stds: [
            { code: "PA.IV.D.K1", category: "K", description: "Soft-field approach and landing procedures" },
            { code: "PA.IV.D.R1", category: "R", description: "Surface conditions and touchdown control" },
            { code: "PA.IV.D.S1", category: "S", description: "Perform a soft-field approach and landing within standards" }
          ]
        },
        {
          name: "Short-Field Takeoff and Maximum Performance Climb",
          code: "PA.IV.E",
          references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with a short-field takeoff and maximum performance climb.",
          stds: [
            { code: "PA.IV.E.K1", category: "K", description: "Short-field takeoff and climb procedures" },
            { code: "PA.IV.E.R1", category: "R", description: "Obstacle clearance and performance limits" },
            { code: "PA.IV.E.S1", category: "S", description: "Perform a short-field takeoff and climb within standards" }
          ]
        },
        {
          name: "Short-Field Approach and Landing",
          code: "PA.IV.F",
          references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with a short-field approach and landing.",
          stds: [
            { code: "PA.IV.F.K1", category: "K", description: "Short-field approach and landing procedures" },
            { code: "PA.IV.F.R1", category: "R", description: "Obstacle clearance and touchdown accuracy" },
            { code: "PA.IV.F.S1", category: "S", description: "Perform a short-field approach and landing within standards" }
          ]
        },
        {
          name: "Forward Slip to a Landing",
          code: "PA.IV.G",
          references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with a forward slip to a landing.",
          stds: [
            { code: "PA.IV.G.K1", category: "K", description: "Forward slip procedures and purpose" },
            { code: "PA.IV.G.R1", category: "R", description: "Airspeed control and crosswind factors" },
            { code: "PA.IV.G.S1", category: "S", description: "Perform a forward slip to a landing within standards" }
          ]
        },
        {
          name: "Go-Around/Rejected Landing",
          code: "PA.IV.H",
          references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with a go-around/rejected landing.",
          stds: [
            { code: "PA.IV.H.K1", category: "K", description: "Go-around procedures and decision making" },
            { code: "PA.IV.H.R1", category: "R", description: "Delayed decision and configuration changes" },
            { code: "PA.IV.H.S1", category: "S", description: "Perform a go-around within standards" }
          ]
        }
      ] 
    },
    { 
      area: "V. Performance and Ground Reference Maneuvers", 
      tasks: [
        {
          name: "Steep Turns",
          code: "PA.V.A",
          references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with steep turns.",
          stds: [
            { code: "PA.V.A.K1", category: "K", description: "Steep turn procedures and aerodynamics" },
            { code: "PA.V.A.R1", category: "R", description: "Overbanking tendency and structural limits" },
            { code: "PA.V.A.S1", category: "S", description: "Perform a steep turn within standards" }
          ]
        },
        {
          name: "Ground Reference Maneuvers",
          code: "PA.V.B",
          references: "FAA-H-8083-2, FAA-H-8083-3",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with ground reference maneuvers.",
          stds: [
            { code: "PA.V.B.K1", category: "K", description: "Ground reference maneuver procedures and wind correction" },
            { code: "PA.V.B.R1", category: "R", description: "Collision avoidance and low-level hazards" },
            { code: "PA.V.B.S1", category: "S", description: "Perform ground reference maneuvers within standards" }
          ]
        }
      ] 
    },
    { 
      area: "VI. Navigation", 
      tasks: [
        {
          name: "Pilotage and Dead Reckoning",
          code: "PA.VI.A",
          references: "FAA-H-8083-2, FAA-H-8083-25; Navigation Charts",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with pilotage and dead reckoning.",
          stds: [
            { code: "PA.VI.A.K1", category: "K", description: "Pilotage and dead reckoning procedures" },
            { code: "PA.VI.A.R1", category: "R", description: "Navigation errors and fuel management" },
            { code: "PA.VI.A.S1", category: "S", description: "Navigate using pilotage and dead reckoning within standards" }
          ]
        },
        {
          name: "Navigation Systems and Radar Services",
          code: "PA.VI.B",
          references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-25; AIM",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with navigation systems and radar services.",
          stds: [
            { code: "PA.VI.B.K1", category: "K", description: "Navigation systems and radar services" },
            { code: "PA.VI.B.R1", category: "R", description: "System malfunctions and over-reliance on automation" },
            { code: "PA.VI.B.S1", category: "S", description: "Use navigation systems and radar services within standards" }
          ]
        },
        {
          name: "Diversion",
          code: "PA.VI.C",
          references: "FAA-H-8083-2, FAA-H-8083-25; Navigation Charts",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with diversion.",
          stds: [
            { code: "PA.VI.C.K1", category: "K", description: "Diversion procedures and decision making" },
            { code: "PA.VI.C.R1", category: "R", description: "Delayed decision and fuel management" },
            { code: "PA.VI.C.S1", category: "S", description: "Perform a diversion within standards" }
          ]
        },
        {
          name: "Lost Procedures",
          code: "PA.VI.D",
          references: "FAA-H-8083-2, FAA-H-8083-25; AIM; Navigation Charts",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with lost procedures.",
          stds: [
            { code: "PA.VI.D.K1", category: "K", description: "Lost procedures and resources" },
            { code: "PA.VI.D.R1", category: "R", description: "Panic and fuel exhaustion" },
            { code: "PA.VI.D.S1", category: "S", description: "Perform lost procedures within standards" }
          ]
        }
      ] 
    },
    { 
      area: "VII. Slow Flight and Stalls", 
      tasks: [
        {
          name: "Maneuvering During Slow Flight",
          code: "PA.VII.A",
          references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with maneuvering during slow flight.",
          stds: [
            { code: "PA.VII.A.K1", category: "K", description: "Slow flight procedures and aerodynamics" },
            { code: "PA.VII.A.R1", category: "R", description: "Stall/spin awareness and altitude loss" },
            { code: "PA.VII.A.S1", category: "S", description: "Perform maneuvering during slow flight within standards" }
          ]
        },
        {
          name: "Power-Off Stalls",
          code: "PA.VII.B",
          references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with power-off stalls.",
          stds: [
            { code: "PA.VII.B.K1", category: "K", description: "Power-off stall procedures and aerodynamics" },
            { code: "PA.VII.B.R1", category: "R", description: "Secondary stalls and spin awareness" },
            { code: "PA.VII.B.S1", category: "S", description: "Perform power-off stalls within standards" }
          ]
        },
        {
          name: "Power-On Stalls",
          code: "PA.VII.C",
          references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with power-on stalls.",
          stds: [
            { code: "PA.VII.C.K1", category: "K", description: "Power-on stall procedures and aerodynamics" },
            { code: "PA.VII.C.R1", category: "R", description: "Secondary stalls and spin awareness" },
            { code: "PA.VII.C.S1", category: "S", description: "Perform power-on stalls within standards" }
          ]
        },
        {
          name: "Spin Awareness",
          code: "PA.VII.D",
          references: "FAA-H-8083-2, FAA-H-8083-3; AC 61-67; POH/AFM",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with spin awareness.",
          stds: [
            { code: "PA.VII.D.K1", category: "K", description: "Spin aerodynamics and recovery procedures" },
            { code: "PA.VII.D.R1", category: "R", description: "Stall/spin hazards and structural limits" },
            { code: "PA.VII.D.S1", category: "S", description: "Explain spin awareness and recovery procedures" }
          ]
        }
      ] 
    },
    { 
      area: "VIII. Basic Instrument Maneuvers", 
      tasks: [
        {
          name: "Straight-and-Level Flight",
          code: "PA.VIII.A",
          references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-15",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with straight-and-level flight solely by reference to instruments.",
          stds: [
            { code: "PA.VIII.A.K1", category: "K", description: "Instrument flight procedures and scanning" },
            { code: "PA.VIII.A.R1", category: "R", description: "Instrument failure and spatial disorientation" },
            { code: "PA.VIII.A.S1", category: "S", description: "Maintain straight-and-level flight within standards" }
          ]
        },
        {
          name: "Constant Airspeed Climbs",
          code: "PA.VIII.B",
          references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-15",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with constant airspeed climbs solely by reference to instruments.",
          stds: [
            { code: "PA.VIII.B.K1", category: "K", description: "Constant airspeed climb procedures" },
            { code: "PA.VIII.B.R1", category: "R", description: "Instrument failure and spatial disorientation" },
            { code: "PA.VIII.B.S1", category: "S", description: "Perform constant airspeed climbs within standards" }
          ]
        },
        {
          name: "Constant Airspeed Descents",
          code: "PA.VIII.C",
          references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-15",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with constant airspeed descents solely by reference to instruments.",
          stds: [
            { code: "PA.VIII.C.K1", category: "K", description: "Constant airspeed descent procedures" },
            { code: "PA.VIII.C.R1", category: "R", description: "Instrument failure and spatial disorientation" },
            { code: "PA.VIII.C.S1", category: "S", description: "Perform constant airspeed descents within standards" }
          ]
        },
        {
          name: "Turns to Headings",
          code: "PA.VIII.D",
          references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-15",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with turns to headings solely by reference to instruments.",
          stds: [
            { code: "PA.VIII.D.K1", category: "K", description: "Turn procedures and instrument scanning" },
            { code: "PA.VIII.D.R1", category: "R", description: "Instrument failure and spatial disorientation" },
            { code: "PA.VIII.D.S1", category: "S", description: "Perform turns to headings within standards" }
          ]
        },
        {
          name: "Recovery from Unusual Flight Attitudes",
          code: "PA.VIII.E",
          references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-15",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with recovery from unusual flight attitudes solely by reference to instruments.",
          stds: [
            { code: "PA.VIII.E.K1", category: "K", description: "Unusual attitude recovery procedures" },
            { code: "PA.VIII.E.R1", category: "R", description: "Spatial disorientation and structural limits" },
            { code: "PA.VIII.E.S1", category: "S", description: "Recover from unusual attitudes within standards" }
          ]
        },
        {
          name: "Radio Communications / Navigation Systems / Radar Services",
          code: "PA.VIII.F",
          references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-15; AIM",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with radio communications, navigation systems, and radar services solely by reference to instruments.",
          stds: [
            { code: "PA.VIII.F.K1", category: "K", description: "Radio communications and navigation systems" },
            { code: "PA.VIII.F.R1", category: "R", description: "Communication failure and system malfunctions" },
            { code: "PA.VIII.F.S1", category: "S", description: "Use radio communications and navigation systems within standards" }
          ]
        }
      ] 
    },
    { 
      area: "IX. Emergency Operations", 
      tasks: [
        {
          name: "Emergency Descent",
          code: "PA.IX.A",
          references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with emergency descent.",
          stds: [
            { code: "PA.IX.A.K1", category: "K", description: "Emergency descent procedures and purpose" },
            { code: "PA.IX.A.R1", category: "R", description: "Structural limits and collision avoidance" },
            { code: "PA.IX.A.S1", category: "S", description: "Perform an emergency descent within standards" }
          ]
        },
        {
          name: "Emergency Approach and Landing (Simulated)",
          code: "PA.IX.B",
          references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with emergency approach and landing.",
          stds: [
            { code: "PA.IX.B.K1", category: "K", description: "Emergency approach and landing procedures" },
            { code: "PA.IX.B.R1", category: "R", description: "Landing site selection and configuration" },
            { code: "PA.IX.B.S1", category: "S", description: "Perform an emergency approach and landing within standards" }
          ]
        },
        {
          name: "Systems and Equipment Malfunctions",
          code: "PA.IX.C",
          references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-25; POH/AFM",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with systems and equipment malfunctions.",
          stds: [
            { code: "PA.IX.C.K1", category: "K", description: "System malfunctions and recovery procedures" },
            { code: "PA.IX.C.R1", category: "R", description: "Distractions and task management" },
            { code: "PA.IX.C.S1", category: "S", description: "Identify and respond to system malfunctions" }
          ]
        },
        {
          name: "Emergency Equipment and Survival Gear",
          code: "PA.IX.D",
          references: "FAA-H-8083-2, FAA-H-8083-25; POH/AFM",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with emergency equipment and survival gear.",
          stds: [
            { code: "PA.IX.D.K1", category: "K", description: "Emergency equipment and survival gear" },
            { code: "PA.IX.D.R1", category: "R", description: "Environmental hazards and survival" },
            { code: "PA.IX.D.S1", category: "S", description: "Identify and explain emergency equipment" }
          ]
        }
      ] 
    },
    { 
      area: "XI. Night Operations", 
      tasks: [
        {
          name: "Night Preparation",
          code: "PA.XI.A",
          references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-25; AIM; POH/AFM",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with night preparation.",
          stds: [
            { code: "PA.XI.A.K1", category: "K", description: "Night flight procedures and equipment" },
            { code: "PA.XI.A.R1", category: "R", description: "Night illusions and spatial disorientation" },
            { code: "PA.XI.A.S1", category: "S", description: "Prepare for night flight and explain procedures" }
          ]
        }
      ] 
    },
    { 
      area: "XII. Postflight Procedures", 
      tasks: [
        {
          name: "After Landing, Parking, and Securing",
          code: "PA.XII.A",
          references: "FAA-H-8083-2, FAA-H-8083-3; POH/AFM",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with after landing, parking, and securing.",
          stds: [
            { code: "PA.XII.A.K1", category: "K", description: "Postflight procedures and securing the aircraft" },
            { code: "PA.XII.A.R1", category: "R", description: "Surface hazards and securing errors" },
            { code: "PA.XII.A.S1", category: "S", description: "Perform postflight procedures within standards" }
          ]
        }
      ] 
    },
  ],
  ir: [
    { 
      area: "I. Preflight Preparation", 
      tasks: [
        {
          name: "Pilot Qualifications",
          code: "IR.I.A",
          references: "14 CFR part 61, AC 68-1, FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-15, FAA-H-8083-25",
          objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with requirements to act as pilot-in-command under instrument flight rules.",
          stds: [
            { code: "IR.I.A.K1", category: "K", description: "Certification requirements, recency of experience, and recordkeeping" },
            { code: "IR.I.A.K2", category: "K", description: "Privileges and limitations" },
            { code: "IR.I.A.K3", category: "K", description: "Part 68 BasicMed privileges and limitations" },
            { code: "IR.I.A.R1", category: "R", description: "Proficiency versus currency" },
            { code: "IR.I.A.R2", category: "R", description: "Personal minimums" },
            { code: "IR.I.A.R3", category: "R", description: "Fitness for flight and physiological factors that might affect the pilot's ability to fly under instrument conditions" },
            { code: "IR.I.A.R4", category: "R", description: "Flying unfamiliar aircraft or operating with unfamiliar flight display systems and avionics" },
            { code: "IR.I.A.S1", category: "S", description: "Apply requirements to act as pilot-in-command under Instrument Flight Rules in a scenario given by the evaluator" }
          ]
        },
        createPlaceholderTask("Weather Information", "IR.I.B"),
        createPlaceholderTask("Cross-Country Flight Planning", "IR.I.C"),
        createPlaceholderTask("Instruments and Equipment", "IR.I.D"),
        createPlaceholderTask("Regulations and Procedures", "IR.I.E")
      ] 
    },
    { 
      area: "II. Preflight Procedures", 
      tasks: [
        createPlaceholderTask("Preflight inspection for IFR flight", "IR.II.A"),
        createPlaceholderTask("Cockpit management and automation setup", "IR.II.B"),
        createPlaceholderTask("Engine starting and runup for IFR", "IR.II.C"),
        createPlaceholderTask("Taxiing with instruments", "IR.II.D"),
        createPlaceholderTask("Runup and before-takeoff checks for IFR", "IR.II.E")
      ] 
    },
    { 
      area: "III. Air Traffic Control Clearances and Procedures", 
      tasks: [
        createPlaceholderTask("Obtaining and reading back IFR clearances", "IR.III.A"),
        createPlaceholderTask("Compliance with departure instructions", "IR.III.B"),
        createPlaceholderTask("Holding instructions and entry procedures", "IR.III.C"),
        createPlaceholderTask("Position reports", "IR.III.D"),
        createPlaceholderTask("Lost communications procedures", "IR.III.E")
      ] 
    },
    { 
      area: "IV. Flight by Reference to Instruments", 
      tasks: [
        createPlaceholderTask("Straight and level flight by reference to instruments", "IR.IV.A"),
        createPlaceholderTask("Turns to headings", "IR.IV.B"),
        createPlaceholderTask("Recovery from unusual attitudes", "IR.IV.C"),
        createPlaceholderTask("Magnetic compass turns", "IR.IV.D")
      ] 
    },
    { 
      area: "V. Navigation Systems", 
      tasks: [
        createPlaceholderTask("VOR navigation and tracking", "IR.V.A"),
        createPlaceholderTask("GPS navigation and RNAV", "IR.V.B"),
        createPlaceholderTask("ILS localizer and glideslope tracking", "IR.V.C"),
        createPlaceholderTask("DME arc procedures", "IR.V.D"),
        createPlaceholderTask("Intercepting and tracking courses", "IR.V.E")
      ] 
    },
    { 
      area: "VI. Instrument Approach Procedures", 
      tasks: [
        createPlaceholderTask("ILS approach to minimums", "IR.VI.A"),
        createPlaceholderTask("VOR approach", "IR.VI.B"),
        createPlaceholderTask("RNAV GPS approach", "IR.VI.C"),
        createPlaceholderTask("Localizer approach", "IR.VI.D"),
        createPlaceholderTask("Circling approach", "IR.VI.E"),
        createPlaceholderTask("Landing from instrument approach", "IR.VI.F"),
        createPlaceholderTask("Missed approach procedure", "IR.VI.G")
      ] 
    },
    { 
      area: "VII. Emergency Operations", 
      tasks: [
        createPlaceholderTask("Loss of communications", "IR.VII.A"),
        createPlaceholderTask("Partial panel operations with failed instruments", "IR.VII.B"),
        createPlaceholderTask("Spinning awareness", "IR.VII.C"),
        createPlaceholderTask("Engine failure during IFR flight", "IR.VII.D"),
        createPlaceholderTask("Unforecasted icing conditions", "IR.VII.E"),
        createPlaceholderTask("Emergency descent", "IR.VII.F")
      ] 
    },
    { 
      area: "VIII. Postflight Procedures", 
      tasks: [
        createPlaceholderTask("Checking and securing aircraft after IFR flight", "IR.VIII.A"),
        createPlaceholderTask("Closing IFR flight plan", "IR.VIII.B"),
        createPlaceholderTask("Logging instrument time correctly", "IR.VIII.C")
      ] 
    }
  ],
  cpl: [
    { 
      area: "I. Preflight Preparation", 
      tasks: [
        createPlaceholderTask("Pilot Qualifications", "CA.I.A"),
        createPlaceholderTask("Airworthiness Requirements", "CA.I.B"),
        createPlaceholderTask("Weather Information", "CA.I.C"),
        createPlaceholderTask("Performance and Limitations", "CA.I.D"),
        createPlaceholderTask("Operation of Systems", "CA.I.E"),
        createPlaceholderTask("Human Factors", "CA.I.F")
      ] 
    },
    { 
      area: "II. Preflight Procedures", 
      tasks: [
        createPlaceholderTask("Preflight Assessment", "CA.II.A"),
        createPlaceholderTask("Flight Deck Management", "CA.II.B"),
        createPlaceholderTask("Engine Starting", "CA.II.C"),
        createPlaceholderTask("Taxiing", "CA.II.D"),
        createPlaceholderTask("Before Takeoff Check", "CA.II.E")
      ] 
    },
    { 
      area: "III. Airport Operations", 
      tasks: [
        createPlaceholderTask("Communications", "CA.III.A"),
        createPlaceholderTask("Traffic Patterns", "CA.III.B"),
        createPlaceholderTask("Airport Markings / Signs / Lighting", "CA.III.C")
      ] 
    },
    { 
      area: "IV. Takeoffs, Landings, and Go-Arounds", 
      tasks: [
        createPlaceholderTask("Normal Takeoff and Climb", "CA.IV.A"),
        createPlaceholderTask("Normal Approach and Landing", "CA.IV.B"),
        createPlaceholderTask("Soft-Field Takeoff and Climb", "CA.IV.C"),
        createPlaceholderTask("Soft-Field Approach and Landing", "CA.IV.D"),
        createPlaceholderTask("Short-Field Takeoff and Maximum Performance Climb", "CA.IV.E"),
        createPlaceholderTask("Short-Field Approach and Landing", "CA.IV.F"),
        createPlaceholderTask("Power-Off 180° Accuracy Approach and Landing", "CA.IV.G"),
        createPlaceholderTask("Forward Slip to a Landing", "CA.IV.H"),
        createPlaceholderTask("Go-Around / Rejected Landing", "CA.IV.I")
      ] 
    },
    { 
      area: "V. Performance Maneuvers", 
      tasks: [
        createPlaceholderTask("Steep Turns", "CA.V.A"),
        createPlaceholderTask("Steep Spirals", "CA.V.B"),
        createPlaceholderTask("Chandelles", "CA.V.C"),
        createPlaceholderTask("Lazy Eights", "CA.V.D")
      ] 
    },
    { 
      area: "VI. Ground Reference Maneuvers", 
      tasks: [
        createPlaceholderTask("Eights on Pylons", "CA.VI.A")
      ] 
    },
    { 
      area: "VII. Navigation", 
      tasks: [
        createPlaceholderTask("Pilotage and Dead Reckoning", "CA.VII.A"),
        createPlaceholderTask("Navigation Systems and Radar Services", "CA.VII.B"),
        createPlaceholderTask("Diversion", "CA.VII.C"),
        createPlaceholderTask("Lost Procedures", "CA.VII.D")
      ] 
    },
    { 
      area: "VIII. Slow Flight and Stalls", 
      tasks: [
        createPlaceholderTask("Maneuvering During Slow Flight", "CA.VIII.A"),
        createPlaceholderTask("Power-Off Stalls", "CA.VIII.B"),
        createPlaceholderTask("Power-On Stalls", "CA.VIII.C"),
        createPlaceholderTask("Accelerated Stalls", "CA.VIII.D"),
        createPlaceholderTask("Spin Awareness", "CA.VIII.E")
      ] 
    },
    { 
      area: "IX. High Altitude Operations", 
      tasks: [
        createPlaceholderTask("Supplemental Oxygen", "CA.IX.A"),
        createPlaceholderTask("Pressurization", "CA.IX.B")
      ] 
    },
    { 
      area: "X. Emergency Operations", 
      tasks: [
        createPlaceholderTask("Emergency Descent", "CA.X.A"),
        createPlaceholderTask("Emergency Approach and Landing (Simulated)", "CA.X.B"),
        createPlaceholderTask("Systems and Equipment Malfunctions", "CA.X.C"),
        createPlaceholderTask("Emergency Equipment and Survival Gear", "CA.X.D")
      ] 
    },
    { 
      area: "XI. Postflight Procedures", 
      tasks: [
        createPlaceholderTask("After Landing, Parking, and Securing", "CA.XI.A")
      ] 
    }
  ],
  cfi: [
    { 
      area: "I. Fundamentals of Instructing", 
      tasks: [
        createPlaceholderTask("Learning Process", "FI.I.A"),
        createPlaceholderTask("Human Behavior and Effective Communication", "FI.I.B"),
        createPlaceholderTask("The Teaching Process", "FI.I.C"),
        createPlaceholderTask("Teaching Methods", "FI.I.D"),
        createPlaceholderTask("Critique and Evaluation", "FI.I.E"),
        createPlaceholderTask("Flight Instructor Characteristics and Responsibilities", "FI.I.F"),
        createPlaceholderTask("Planning Instructional Activity", "FI.I.G")
      ] 
    },
    { 
      area: "II. Technical Subject Areas", 
      tasks: [
        createPlaceholderTask("Aeromedical Factors", "FI.II.A"),
        createPlaceholderTask("Visual Scanning and Collision Avoidance", "FI.II.B"),
        createPlaceholderTask("Principles of Flight", "FI.II.C"),
        createPlaceholderTask("Airplane Flight Controls", "FI.II.D"),
        createPlaceholderTask("Airplane Systems", "FI.II.E"),
        createPlaceholderTask("Magnetic Compass", "FI.II.F"),
        createPlaceholderTask("Navigation and Flight Planning", "FI.II.G"),
        createPlaceholderTask("Night Operations", "FI.II.H"),
        createPlaceholderTask("High Altitude Operations", "FI.II.I"),
        createPlaceholderTask("Federal Aviation Regulations and Publications", "FI.II.J"),
        createPlaceholderTask("Publications", "FI.II.K"),
        createPlaceholderTask("Logbook Entries and Certificate Endorsements", "FI.II.L")
      ] 
    },
    { 
      area: "III. Preflight Preparation", 
      tasks: [
        createPlaceholderTask("Certificates and Documents", "FI.III.A"),
        createPlaceholderTask("Weather Information", "FI.III.B"),
        createPlaceholderTask("Operation of Systems", "FI.III.C"),
        createPlaceholderTask("Performance and Limitations", "FI.III.D"),
        createPlaceholderTask("Airworthiness Requirements", "FI.III.E")
      ] 
    },
    { 
      area: "IV. Preflight Lesson on a Maneuver to be Performed in Flight", 
      tasks: [
        createPlaceholderTask("Maneuver Lesson", "FI.IV.A")
      ] 
    },
    { 
      area: "V. Preflight Procedures", 
      tasks: [
        createPlaceholderTask("Preflight Assessment", "FI.V.A"),
        createPlaceholderTask("Flight Deck Management", "FI.V.B"),
        createPlaceholderTask("Engine Starting", "FI.V.C"),
        createPlaceholderTask("Taxiing", "FI.V.D"),
        createPlaceholderTask("Before Takeoff Check", "FI.V.E")
      ] 
    },
    { 
      area: "VI. Airport Operations", 
      tasks: [
        createPlaceholderTask("Communications", "FI.VI.A"),
        createPlaceholderTask("Traffic Patterns", "FI.VI.B"),
        createPlaceholderTask("Airport Markings / Signs / Lighting", "FI.VI.C")
      ] 
    },
    { 
      area: "VII. Takeoffs, Landings, and Go-Arounds", 
      tasks: [
        createPlaceholderTask("Normal Takeoff and Climb", "FI.VII.A"),
        createPlaceholderTask("Normal Approach and Landing", "FI.VII.B"),
        createPlaceholderTask("Soft-Field Takeoff and Climb", "FI.VII.C"),
        createPlaceholderTask("Soft-Field Approach and Landing", "FI.VII.D"),
        createPlaceholderTask("Short-Field Takeoff and Maximum Performance Climb", "FI.VII.E"),
        createPlaceholderTask("Short-Field Approach and Landing", "FI.VII.F"),
        createPlaceholderTask("Power-Off 180° Accuracy Approach and Landing", "FI.VII.G"),
        createPlaceholderTask("Forward Slip to a Landing", "FI.VII.H"),
        createPlaceholderTask("Go-Around / Rejected Landing", "FI.VII.I")
      ] 
    },
    { 
      area: "VIII. Fundamentals of Flight", 
      tasks: [
        createPlaceholderTask("Straight-and-Level Flight", "FI.VIII.A"),
        createPlaceholderTask("Level Turns", "FI.VIII.B"),
        createPlaceholderTask("Climbs and Climbing Turns", "FI.VIII.C"),
        createPlaceholderTask("Descents and Descending Turns", "FI.VIII.D")
      ] 
    },
    { 
      area: "IX. Performance Maneuvers", 
      tasks: [
        createPlaceholderTask("Steep Turns", "FI.IX.A"),
        createPlaceholderTask("Steep Spirals", "FI.IX.B"),
        createPlaceholderTask("Chandelles", "FI.IX.C"),
        createPlaceholderTask("Lazy Eights", "FI.IX.D")
      ] 
    },
    { 
      area: "X. Ground Reference Maneuvers", 
      tasks: [
        createPlaceholderTask("Rectangular Course", "FI.X.A"),
        createPlaceholderTask("S-Turns across a Road", "FI.X.B"),
        createPlaceholderTask("Turns Around a Point", "FI.X.C"),
        createPlaceholderTask("Eights on Pylons", "FI.X.D")
      ] 
    },
    { 
      area: "XI. Slow Flight, Stalls, and Spins", 
      tasks: [
        createPlaceholderTask("Maneuvering During Slow Flight", "FI.XI.A"),
        createPlaceholderTask("Power-Off Stalls", "FI.XI.B"),
        createPlaceholderTask("Power-On Stalls", "FI.XI.C"),
        createPlaceholderTask("Accelerated Stalls", "FI.XI.D"),
        createPlaceholderTask("Crossed-control Stalls", "FI.XI.E"),
        createPlaceholderTask("Elevator Trim Stalls", "FI.XI.F"),
        createPlaceholderTask("Secondary Stalls", "FI.XI.G"),
        createPlaceholderTask("Spin Awareness", "FI.XI.H")
      ] 
    },
    { 
      area: "XII. Basic Instrument Maneuvers", 
      tasks: [
        createPlaceholderTask("Straight-and-Level Flight", "FI.XII.A"),
        createPlaceholderTask("Constant Airspeed Climbs", "FI.XII.B"),
        createPlaceholderTask("Constant Airspeed Descents", "FI.XII.C"),
        createPlaceholderTask("Turns to Headings", "FI.XII.D"),
        createPlaceholderTask("Recovery from Unusual Flight Attitudes", "FI.XII.E")
      ] 
    },
    { 
      area: "XIII. Emergency Operations", 
      tasks: [
        createPlaceholderTask("Emergency Descent", "FI.XIII.A"),
        createPlaceholderTask("Emergency Approach and Landing (Simulated)", "FI.XIII.B"),
        createPlaceholderTask("Systems and Equipment Malfunctions", "FI.XIII.C"),
        createPlaceholderTask("Emergency Equipment and Survival Gear", "FI.XIII.D")
      ] 
    },
    { 
      area: "XIV. Postflight Procedures", 
      tasks: [
        createPlaceholderTask("After Landing, Parking, and Securing", "FI.XIV.A")
      ] 
    }
  ],
  cfii: [
    { 
      area: "I. Fundamentals of Instructing", 
      tasks: [
        createPlaceholderTask("Learning Process", "FII.I.A"),
        createPlaceholderTask("Human Behavior and Effective Communication", "FII.I.B"),
        createPlaceholderTask("The Teaching Process", "FII.I.C"),
        createPlaceholderTask("Teaching Methods", "FII.I.D"),
        createPlaceholderTask("Critique and Evaluation", "FII.I.E"),
        createPlaceholderTask("Flight Instructor Characteristics and Responsibilities", "FII.I.F"),
        createPlaceholderTask("Planning Instructional Activity", "FII.I.G")
      ] 
    },
    { 
      area: "II. Technical Subject Areas", 
      tasks: [
        createPlaceholderTask("Instrument Flight Deck Check", "FII.II.A"),
        createPlaceholderTask("ATC Clearances", "FII.II.B"),
        createPlaceholderTask("Compliance with Departure, En Route, and Arrival Procedures and Clearances", "FII.II.C"),
        createPlaceholderTask("Holding Procedures", "FII.II.D"),
        createPlaceholderTask("Intercepting and Tracking Navigational Systems and DME Arcs", "FII.II.E"),
        createPlaceholderTask("Non-precision Approach", "FII.II.F"),
        createPlaceholderTask("Precision Approach", "FII.II.G"),
        createPlaceholderTask("Missed Approach", "FII.II.H"),
        createPlaceholderTask("Circling Approach", "FII.II.I"),
        createPlaceholderTask("Landing from an Instrument Approach", "FII.II.J"),
        createPlaceholderTask("Loss of Communications", "FII.II.K"),
        createPlaceholderTask("Loss of Primary Flight Instrument Indicator", "FII.II.L")
      ] 
    }
  ],
  mei: [
    { 
      area: "I. Preflight Preparation", 
      tasks: [
        createPlaceholderTask("Pilot Qualifications", "ME.I.A"),
        createPlaceholderTask("Airworthiness Requirements", "ME.I.B"),
        createPlaceholderTask("Weather Information", "ME.I.C"),
        createPlaceholderTask("Performance and Limitations", "ME.I.D"),
        createPlaceholderTask("Operation of Systems", "ME.I.E"),
        createPlaceholderTask("Multiengine Aerodynamics", "ME.I.F"),
        createPlaceholderTask("Multiengine Systems and Emergencies", "ME.I.G"),
        createPlaceholderTask("Vmc Demonstration Theory", "ME.I.H")
      ] 
    },
    { 
      area: "II. Preflight Procedures", 
      tasks: [
        createPlaceholderTask("Preflight Assessment", "ME.II.A"),
        createPlaceholderTask("Flight Deck Management", "ME.II.B"),
        createPlaceholderTask("Engine Starting", "ME.II.C"),
        createPlaceholderTask("Taxiing", "ME.II.D"),
        createPlaceholderTask("Before Takeoff Check", "ME.II.E")
      ] 
    },
    { 
      area: "III. Airport Operations", 
      tasks: [
        createPlaceholderTask("Communications", "ME.III.A"),
        createPlaceholderTask("Traffic Patterns", "ME.III.B"),
        createPlaceholderTask("Airport Markings / Signs / Lighting", "ME.III.C")
      ] 
    },
    { 
      area: "IV. Takeoffs, Landings, and Go-Arounds", 
      tasks: [
        createPlaceholderTask("Normal Takeoff and Climb", "ME.IV.A"),
        createPlaceholderTask("Normal Approach and Landing", "ME.IV.B"),
        createPlaceholderTask("Short-Field Takeoff and Maximum Performance Climb", "ME.IV.C"),
        createPlaceholderTask("Short-Field Approach and Landing", "ME.IV.F"),
        createPlaceholderTask("Go-Around / Rejected Landing", "ME.IV.G")
      ] 
    },
    { 
      area: "V. Multiengine Operations", 
      tasks: [
        createPlaceholderTask("Maneuvering with One Engine Inoperative", "ME.V.A"),
        createPlaceholderTask("Vmc Demonstration", "ME.V.B"),
        createPlaceholderTask("Engine Failure During Takeoff Before Vmc", "ME.V.C"),
        createPlaceholderTask("Engine Failure After Liftoff", "ME.V.D"),
        createPlaceholderTask("Approach and Landing with One Engine Inoperative", "ME.V.E")
      ] 
    },
    { 
      area: "VI. Emergency Operations", 
      tasks: [
        createPlaceholderTask("Systems and Equipment Malfunctions", "ME.VI.A"),
        createPlaceholderTask("Emergency Equipment and Survival Gear", "ME.VI.B")
      ] 
    },
    { 
      area: "VII. Postflight Procedures", 
      tasks: [
        createPlaceholderTask("After Landing, Parking, and Securing", "ME.VII.A")
      ] 
    }
  ]
};

export const ACS_ELEMENTS: Record<string, string[]> = {
  'A. Preflight Assessment': [],
  'B. Flight Deck Management': [],
  'C. Engine Starting': [],
  'E. Before Takeoff Check': [],
  'A. Communications': [],
  'B. Traffic Patterns': [
    'Pattern altitude ±100 ft',
    'Airspeed within 10 kts of POH target speed',
  ],
  'C. Airport Markings / Signs / Lighting': [],
  'A. Normal Takeoff and Climb': [
    'Maintain centerline during takeoff roll',
    'Establish Vx or Vy ±5 kts after liftoff',
    'Track runway extended centerline',
  ],
  'B. Normal Approach and Landing': [
    'Stabilized approach by 500 ft AGL',
    'Approach speed ±5 kts of target',
    'Touch down in first third of runway, on centerline, minimal drift',
    'Touch down within 400 ft beyond aiming point',
  ],
  'C. Soft-Field Takeoff and Climb': [
    'Continuous rolling takeoff — no stopping on surface',
    'Lift off at minimum airspeed; accelerate in ground effect',
    'Establish Vy ±5 kts after clearing obstacle',
  ],
  'D. Soft-Field Approach and Landing': [
    'Approach speed ±5 kts of target',
    'Touch down at minimum controllable airspeed',
    'Maintain back pressure throughout rollout',
  ],
  'E. Short-Field Takeoff and Maximum Performance Climb': [
    'Use maximum available runway; rotate at POH-specified Vr',
    'Climb at Vx ±5 kts to obstacle; transition to Vy',
  ],
  'F. Short-Field Approach and Landing': [
    'Approach speed ±5 kts of target',
    'Touch down at or within 200 ft beyond aiming point',
    'Apply maximum braking after touchdown',
  ],
  'G. Forward Slip to a Landing': [
    'Maintain runway alignment throughout slip',
    'Airspeed ±5 kts of target; transition to normal attitude before touchdown',
  ],
  'H. Go-Around / Rejected Landing': [
    'Recognize need promptly; apply full power immediately',
    'Retract flaps incrementally; maintain directional control',
  ],
  'A. Steep Turns': [
    'Bank: 45° ±5° (PPL) / 50° ±5° (CPL)',
    'Altitude: ±100 ft',
    'Airspeed: ±10 kts',
    'Roll out on entry heading ±10°',
  ],
  'B. Ground Reference Maneuvers': [
    'Altitude: 600–1,000 ft AGL ±100 ft',
    'Constant radius from reference; correct for wind drift',
  ],
  'A. Pilotage and Dead Reckoning': [
    'Within ±3 NM of planned route',
    'Arrive at checkpoints within ±5 min of ETE',
    'Altitude ±200 ft; heading ±10°',
  ],
  'B. Navigation Systems and Radar Services': [
    'Maintain course within ±¼ scale CDI deflection',
    'Altitude ±200 ft; heading ±10°',
  ],
  'C. Diversion': [
    'Estimate heading and ETA to alternate within ±10%',
    'Begin diversion promptly after decision',
  ],
  'D. Lost Procedures': [
    'Maintain VFR; contact ATC promptly',
    'Determine position within reasonable time',
  ],
  'A. Maneuvering During Slow Flight': [
    'Airspeed at or below 1.2 Vso; altitude ±100 ft',
    'Heading ±10°; bank in turns ±10°',
  ],
  'B. Power-Off Stalls': [
    'Recover at first indication (buffet or break)',
    'Minimize altitude loss; wings level on recovery',
    'Bank in turning stalls ±10° of specified',
  ],
  'C. Power-On Stalls': [
    'Recover at first indication',
    'Minimize altitude loss; heading ±10° on recovery',
  ],
  'D. Spin Awareness': [
    'Verbalize cause and entry conditions',
    'Demonstrate PARE recovery: Power idle, Ailerons neutral, Rudder opposite, Elevator forward',
  ],
  'A. Straight-and-Level Flight': [
    'Heading ±10°',
    'Altitude ±200 ft',
    'Airspeed ±10 kts',
  ],
  'B. Constant Airspeed Climbs': [
    'Airspeed ±10 kts',
    'Heading ±10°',
    'Level off within ±200 ft of assigned altitude',
  ],
  'C. Constant Airspeed Descents': [
    'Airspeed ±10 kts',
    'Heading ±10°',
    'Level off within ±200 ft of assigned altitude',
  ],
  'D. Turns to Headings': [
    'Standard rate (3°/sec)',
    'Roll out on assigned heading ±10°',
    'Altitude ±200 ft',
  ],
  'E. Recovery from Unusual Flight Attitudes': [
    'Recover promptly using correct technique',
    'Return to straight-and-Level within ±200 ft',
  ],
  'F. Radio Communications / Navigation Systems / Radar Services': [
    'Maintain course within ±¼ scale deflection',
    'Altitude ±200 ft; heading ±10°',
  ],
  'A. Emergency Descent': [
    'Establish maximum allowable airspeed promptly',
    'Use up to 45° bank; maintain heading ±10°',
  ],
  'B. Emergency Approach and Landing (Simulated)': [
    'Establish Vg ±5 kts immediately after simulated failure',
    'Select suitable landing area; complete checklist',
    'Plan and fly approach to reach selected field',
  ],
  'C. Systems and Equipment Malfunctions': [
    'Correctly identify malfunction; follow POH checklist',
    'Maintain aircraft control throughout',
  ],
  'D. Emergency Equipment and Survival Gear': [],
  'A. Night Preparation': [],
  'A. After Landing, Parking, and Securing': [],
  // Instrument Rating (IR) Tasks
  'A. Preflight inspection for IFR flight': ['Verify pitot-static system', 'Check de-icing/anti-icing equipment', 'Verify navigation database currency'],
  'B. Cockpit management and automation setup': ['Program GPS/FMS for route', 'Set up primary and backup navigation', 'Organize charts and approach plates'],
  'C. Engine starting and runup for IFR': ['Check vacuum/pressure system', 'Verify gyroscopic instrument stability', 'Check alternator/generator output'],
  'D. Taxiing with instruments': ['Check turn coordinator/bank indicator', 'Verify heading indicator matches compass', 'Check airspeed and altimeter response'],
  'E. Runup and before-takeoff checks for IFR': ['Verify all IFR required equipment', 'Check pitot heat', 'Final clearance review'],
  'A. Obtaining and reading back IFR clearances': ['CRAFT: Clearance, Route, Altitude, Frequency, Transponder', 'Correct readback of all instructions'],
  'B. Compliance with departure instructions': ['Follow DP or ODP precisely', 'Maintain terrain/obstacle clearance', 'Timely frequency changes'],
  'C. Holding instructions and entry procedures': ['Identify entry type (Direct, Parallel, Teardrop)', 'Maintain altitude ±100 ft', 'Correct timing and wind correction'],
  'D. Position reports': ['Correct format: ID, Position, Time, Altitude, Type, Next Fix', 'Timely reporting to ATC'],
  'E. Lost communications procedures': ['Follow AVE F (Assigned, Vectored, Expected, Filed) for route', 'Follow MEA (Minimum, Expected, Assigned) for altitude'],
  'A. Straight and level flight by reference to instruments': ['Altitude ±100 ft', 'Heading ±10°', 'Airspeed ±10 kts'],
  'B. Turns to headings': ['Standard rate turns', 'Roll out on heading ±10°', 'Altitude ±100 ft'],
  'C. Recovery from unusual attitudes': ['Recognize attitude promptly', 'Correct recovery sequence (Power, Pitch, Bank)', 'Return to stabilized flight'],
  'D. Magnetic compass turns': ['Correct for UNOS (Undershoot North, Overshoot South)', 'Roll out on heading ±15°'],
  'A. VOR navigation and tracking': ['Maintain course within ±¾ scale CDI deflection', 'Correct station passage identification'],
  'B. GPS navigation and RNAV': ['Verify GPS integrity (RAIM)', 'Maintain course within ±¾ scale deflection'],
  'C. ILS localizer and glideslope tracking': ['Maintain localizer within ±¾ scale', 'Maintain glideslope within ±¾ scale'],
  'D. DME arc procedures': ['Maintain arc within ±1 NM', 'Correct lead-in to final course'],
  'E. Intercepting and tracking courses': ['Smooth interception without overshooting', 'Maintain course within ±¾ scale'],
  'A. ILS approach to minimums': ['Maintain localizer and glideslope within ±¾ scale', 'Decision Altitude (DA) ±10 ft'],
  'B. VOR approach': ['Altitude ±100 ft at MDA', 'Course within ±¾ scale'],
  'C. RNAV GPS approach': ['Verify LNAV/VNAV or LPV minimums', 'Maintain course within ±¾ scale'],
  'D. Localizer approach': ['Altitude ±100 ft at MDA', 'Course within ±¾ scale'],
  'E. Circling approach': ['Maintain altitude +100/-0 ft until descending for landing', 'Maintain visual contact with runway'],
  'F. Landing from instrument approach': ['Transition to visual references smoothly', 'Touchdown in touchdown zone'],
  'G. Missed approach procedure': ['Prompt execution at MAP or DA', 'Establish climb and follow instructions precisely'],
  'A. Loss of communications': ['Follow §91.185 procedures', 'Squawk 7600'],
  'B. Partial panel operations with failed instruments': ['Identify failed instrument(s)', 'Maintain control using backup instruments', 'Altitude ±100 ft, Heading ±10°'],
  'C. Spinning awareness': ['Explain causes and recovery procedures', 'Recognize incipient spin conditions'],
  'D. Engine failure during IFR flight': ['Maintain control (Aviate)', 'Navigate to nearest suitable airport', 'Communicate emergency status'],
  'E. Unforecasted icing conditions': ['Identify icing accumulation', 'Exit icing conditions (Altitude or Heading change)', 'Use anti-ice/de-ice systems'],
  'F. Emergency descent': ['Establish maximum safe rate of descent', 'Maintain positive control'],
  'A. Checking and securing aircraft after IFR flight': ['Verify all systems off', 'Check for any new maintenance issues'],
  'B. Closing IFR flight plan': ['Close with ATC or FSS promptly after landing'],
  'C. Logging instrument time correctly': ['Log actual or simulated instrument time', 'Log approaches and holding for currency'],
  // IR Ground Tasks
  'A. Pilot Qualifications': [
    'Recency of experience requirements for IFR flight §61.57',
    'Currency requirements for instrument approaches',
    'Logging instrument time requirements',
    'Required equipment for IFR flight'
  ],
  'B. Weather Information': [
    'Obtaining and interpreting weather data for IFR flight',
    'METARs TAFs PIREPs AIRMETs SIGMETs',
    'Interpreting weather charts for IFR planning',
    'Icing conditions and pireps',
    'Thunderstorm avoidance',
    'Wind shear awareness'
  ],
  'C. Cross-Country Flight Planning': [
    'IFR flight plan filing requirements',
    'Route selection using airways and direct routing',
    'Alternate airport requirements §91.169',
    'Fuel requirements for IFR flight §91.167',
    'NOTAM interpretation for IFR operations',
    'TFR awareness and avoidance'
  ],
  'D. Instruments and Equipment': [
    'Required instruments for IFR flight §91.205',
    'Pitot static system and associated instruments',
    'Gyroscopic instruments and power sources',
    'Magnetic compass errors and limitations',
    'Navigation systems VOR ILS GPS RNAV',
    'Automation and flight management systems',
    'Instrument currency and maintenance requirements'
  ],
  'E. Regulations and Procedures': [
    'IFR regulatory requirements §91 subpart B',
    'ATC clearances and pilot responsibilities',
    'Departure procedures DPs and ODPs',
    'Enroute procedures airways and NAVAID use',
    'Arrival procedures STARs',
    'Approach procedure requirements and minimums',
    'Missed approach procedures and alternate requirements',
    'Lost communications procedures §91.185'
  ],
  // CPL Specific
  'G. Power-Off 180° Accuracy Approach and Landing': ['Touch down within 200 ft beyond specified point'],
  'B. Steep Spirals': ['Maintain constant radius, 3 turns, roll out ±10°'],
  'C. Chandelles': ['Max performance 180° climbing turn'],
  'D. Lazy Eights': ['Constant change of pitch, bank, and airspeed'],
  'A. Eights on Pylons': ['Maintain pivotal altitude'],
};

export const RATINGS = {
  ppl:  { label: 'Private Pilot ASEL',  acs: 'FAA-S-ACS-6B',  groundPage: '/ground', flightPage: '/flight' },
  ir:   { label: 'Instrument Rating',   acs: 'FAA-S-ACS-8B',  groundPage: '/ground', flightPage: '/flight' },
  cpl:  { label: 'Commercial Pilot',    acs: 'FAA-S-ACS-7A',  groundPage: '/ground', flightPage: '/flight' },
  cfi:  { label: 'CFI',                 acs: 'FAA-S-ACS-25',  groundPage: '/ground', flightPage: '/flight' },
  cfii: { label: 'CFII',               acs: 'FAA-S-ACS-25',   groundPage: '/ground', flightPage: '/flight' },
  mei:  { label: 'MEI',                 acs: 'FAA-S-ACS-25',  groundPage: '/ground', flightPage: '/flight' },
};

