import { ACSArea } from '../types';

export const MEI_ADDON_GROUND_ACS: ACSArea[] = [
  {
    area: "II. Technical Subject Areas",
    tasks: [
      {
        name: "Runway Incursion Avoidance",
        code: "AI.II.C",
        references: "AC 91-73; AIM; Chart Supplements; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-9, FAA-H-8083-25",
        objective: "To determine the applicant understands runway incursion avoidance, can apply that knowledge, manage associated risks, demonstrate appropriate skills, and provide effective instruction.",
        stds: [
          { code: "AI.II.C.K1", category: "K", description: "Runway incursion definition" },
          { code: "AI.II.C.K2", category: "K", description: "Taxi instructions and clearances" },
          { code: "AI.II.C.K3", category: "K", description: "Importance of recording taxi instructions and reviewing taxi routes on airport diagram" },
          { code: "AI.II.C.K4", category: "K", description: "Airport markings, signs, and lights including hold lines" },
          { code: "AI.II.C.K5", category: "K", description: "Flight deck activities during taxiing: route planning, Hot Spots, ATC coordination" },
          { code: "AI.II.C.K6", category: "K", description: "Communication and operations at uncontrolled airports" },
          { code: "AI.II.C.R1", category: "R", description: "Distractions, task prioritization, loss of situational awareness, or disorientation" },
          { code: "AI.II.C.R2", category: "R", description: "Confirmation or expectation bias related to taxi instructions" },
          { code: "AI.II.C.R3", category: "R", description: "Entering or crossing runways" },
          { code: "AI.II.C.R4", category: "R", description: "Night taxi operations" },
          { code: "AI.II.C.R5", category: "R", description: "Low visibility taxi operations" },
          { code: "AI.II.C.R6", category: "R", description: "Runway incursion after landing" },
          { code: "AI.II.C.R7", category: "R", description: "Operating on taxiways between parallel runways" },
          { code: "AI.II.C.S1", category: "S", description: "Deliver instruction on elements and techniques for runway incursion avoidance" }
        ]
      },
      {
        name: "Endorsements and Logbook Entries",
        code: "AI.II.K",
        references: "14 CFR part 61; AC 61-65; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-9, FAA-H-8083-25",
        objective: "To determine the applicant understands logbook entries and endorsements, can apply that knowledge, manage associated risks, demonstrate appropriate skills, and provide effective instruction.",
        stds: [
          { code: "AI.II.K.K1", category: "K", description: "Required logbook entries for instruction given" },
          { code: "AI.II.K.K2", category: "K", description: "Pre-solo knowledge test, solo endorsements, and logbook entries" },
          { code: "AI.II.K.K3", category: "K", description: "Other required endorsements (Class B airspace, SFAR)" },
          { code: "AI.II.K.K4", category: "K", description: "Recommendation for practical test: logbook entry, application for initial, additional, or aircraft qualification" },
          { code: "AI.II.K.K5", category: "K", description: "Endorsing logbook for satisfactory completion of FAA flight review" },
          { code: "AI.II.K.K6", category: "K", description: "Required flight instructor records" },
          { code: "AI.II.K.K7", category: "K", description: "Flight instructor renewal and reinstatement requirements" },
          { code: "AI.II.K.R1", category: "R", description: "Endorsements without appropriate limitations or expiration dates" },
          { code: "AI.II.K.S1", category: "S", description: "Describe and prepare logbook entries/endorsements for at least two events from K1–K5" }
        ]
      },
      {
        name: "One Engine Inoperative (OEI) Performance (AMEL, AMES)",
        code: "AI.II.P",
        references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-9, FAA-H-8083-25; FAA-P-8740-66; POH/AFM",
        objective: "To determine the applicant understands elements related to multiengine performance, can apply that knowledge, manage associated risks, demonstrate appropriate skills, and provide effective instruction. Note: Evaluator assesses the applicant's knowledge of at least two knowledge elements from this Task.",
        stds: [
          { code: "AI.II.P.K1", category: "K", description: "Proficient use of appropriate performance charts, tables, graphs, or other data to determine airplane performance and limitations for all phases of flight." },
          { code: "AI.II.P.K2", category: "K", description: "Effects of exceeding limitations." },
          { code: "AI.II.P.K3", category: "K", description: "Effects of atmospheric conditions on performance." },
          { code: "AI.II.P.K4", category: "K", description: "Factors to be considered to determine required performance is within the airplane's single and multiengine capabilities." },
          { code: "AI.II.P.K5", category: "K", description: "Aerodynamics of OEI operation including the critical engine, effects of bank angle on VMC, zero side slip, and reasons for loss of directional control." },
          { code: "AI.II.P.K6", category: "K", description: "The relationship between minimum control speed VMC and stall speed and the effect of density altitude on that relationship." },
          { code: "AI.II.P.K7", category: "K", description: "How to determine the best course of action after an engine failure." },
          { code: "AI.II.P.R1", category: "R", description: "Exceeding the critical angle of attack." },
          { code: "AI.II.P.R2", category: "R", description: "Loss of directional control." },
          { code: "AI.II.P.R3", category: "R", description: "Flying over terrain that exceeds the single engine service ceiling." },
          { code: "AI.II.P.R4", category: "R", description: "Fuel management." },
          { code: "AI.II.P.S1", category: "S", description: "Compute the expected single engine climb performance." }
        ]
      }
    ]
  }
];
