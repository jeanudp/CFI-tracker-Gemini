import { ACSArea } from '../types';

export const IR_GROUND_ACS: ACSArea[] = [
  {
    area: "I. Preflight Preparation",
    tasks: [
      {
        name: "Pilot Qualifications",
        code: "IR.I.A",
        references: "14 CFR part 61; AC 68-1; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-15, FAA-H-8083-25",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with requirements to act as PIC under IFR.",
        stds: [
          { code: "IR.I.A.K1", category: "K", description: "Certification requirements, recency of experience, and recordkeeping." },
          { code: "IR.I.A.K2", category: "K", description: "Privileges and limitations of instrument rating." },
          { code: "IR.I.A.K3", category: "K", description: "Part 68 BasicMed privileges and limitations." },
          { code: "IR.I.A.R1", category: "R", description: "Proficiency versus currency." },
          { code: "IR.I.A.R2", category: "R", description: "Personal minimums." },
          { code: "IR.I.A.R3", category: "R", description: "Fitness for flight and physiological factors affecting IFR flight." },
          { code: "IR.I.A.R4", category: "R", description: "Flying unfamiliar aircraft or unfamiliar avionics." },
          { code: "IR.I.A.S1", category: "S", description: "Apply PIC requirements under IFR in a scenario given by the evaluator." }
        ]
      },
      {
        name: "Weather Information",
        code: "IR.I.B",
        references: "14 CFR part 91; AC 91-92; AIM; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-25, FAA-H-8083-28",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with weather information for IFR flight.",
        stds: [
          { code: "IR.I.B.K1", category: "K", description: "Sources of weather data for IFR flight planning." },
          { code: "IR.I.B.K2", category: "K", description: "Weather products for preflight planning — departure, en route, and arrival." },
          { code: "IR.I.B.K2a", category: "K", description: "METARs, SPECIs, and PIREPs." },
          { code: "IR.I.B.K2b", category: "K", description: "Surface Analysis Chart and Ceiling and Visibility Chart (CVA)." },
          { code: "IR.I.B.K2c", category: "K", description: "Terminal Aerodrome Forecasts (TAF)." },
          { code: "IR.I.B.K2d", category: "K", description: "Graphical Forecasts for Aviation (GFA)." },
          { code: "IR.I.B.K2e", category: "K", description: "Wind and Temperature Aloft Forecast (FB)." },
          { code: "IR.I.B.K2f", category: "K", description: "Convective Outlook (AC)." },
          { code: "IR.I.B.K2g", category: "K", description: "AIRMETs, SIGMETs, and Convective SIGMETs." },
          { code: "IR.I.B.K3", category: "K", description: "IFR meteorology — climate and hazardous conditions." },
          { code: "IR.I.B.K3a", category: "K", description: "Atmospheric composition and stability." },
          { code: "IR.I.B.K3b", category: "K", description: "Wind — windshear, mountain wave, and affecting factors." },
          { code: "IR.I.B.K3c", category: "K", description: "Temperature and heat exchange." },
          { code: "IR.I.B.K3d", category: "K", description: "Moisture and precipitation." },
          { code: "IR.I.B.K3e", category: "K", description: "Weather system formation — air masses and fronts." },
          { code: "IR.I.B.K3f", category: "K", description: "Clouds." },
          { code: "IR.I.B.K3g", category: "K", description: "Turbulence." },
          { code: "IR.I.B.K3h", category: "K", description: "Thunderstorms and microbursts." },
          { code: "IR.I.B.K3i", category: "K", description: "Icing and freezing level." },
          { code: "IR.I.B.K3j", category: "K", description: "Fog and mist." },
          { code: "IR.I.B.K3k", category: "K", description: "Frost." },
          { code: "IR.I.B.K3l", category: "K", description: "Obstructions to visibility — smoke, haze, volcanic ash." },
          { code: "IR.I.B.K4", category: "K", description: "Flight deck displays of digital weather and aeronautical information." },
          { code: "IR.I.B.R1", category: "R", description: "Go/no-go and continue/divert decisions." },
          { code: "IR.I.B.R1a", category: "R", description: "Circumstances that would make diversion prudent." },
          { code: "IR.I.B.R1b", category: "R", description: "Personal weather minimums." },
          { code: "IR.I.B.R1c", category: "R", description: "Hazardous weather — known or forecast icing or turbulence." },
          { code: "IR.I.B.R2", category: "R", description: "Use and limitations of weather equipment and resources." },
          { code: "IR.I.B.R2a", category: "R", description: "Installed onboard weather equipment." },
          { code: "IR.I.B.R2b", category: "R", description: "Aviation weather reports and forecasts." },
          { code: "IR.I.B.R2c", category: "R", description: "Inflight weather resources." },
          { code: "IR.I.B.S1", category: "S", description: "Obtain an adequate weather briefing using available resources." },
          { code: "IR.I.B.S2", category: "S", description: "Analyze at least three meteorological conditions from K3a–K3l." },
          { code: "IR.I.B.S3", category: "S", description: "Correlate weather information to make a go/no-go decision." },
          { code: "IR.I.B.S4", category: "S", description: "Determine if an alternate is required and if it meets regulatory requirements." }
        ]
      },
      {
        name: "Cross-Country Flight Planning",
        code: "IR.I.C",
        references: "14 CFR part 91; AIM; Chart Supplements; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-15, FAA-H-8083-16, FAA-H-8083-25; IFR Enroute Charts; NOTAMS",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with IFR cross-country planning and filing.",
        stds: [
          { code: "IR.I.C.K1", category: "K", description: "IFR route planning considerations." },
          { code: "IR.I.C.K1a", category: "K", description: "Available navigational facilities." },
          { code: "IR.I.C.K1b", category: "K", description: "Special use airspace." },
          { code: "IR.I.C.K1c", category: "K", description: "Preferred routes." },
          { code: "IR.I.C.K1d", category: "K", description: "Primary and alternate airports." },
          { code: "IR.I.C.K1e", category: "K", description: "Enroute charts." },
          { code: "IR.I.C.K1f", category: "K", description: "Chart Supplements." },
          { code: "IR.I.C.K1g", category: "K", description: "NOTAMs." },
          { code: "IR.I.C.K1h", category: "K", description: "Terminal Procedures Publications (TPP)." },
          { code: "IR.I.C.K2", category: "K", description: "Altitude selection — terrain, obstacles, MEA, wind, oxygen." },
          { code: "IR.I.C.K3", category: "K", description: "IFR flight calculations." },
          { code: "IR.I.C.K3a", category: "K", description: "Time, climb/descent rates, course, distance, heading, TAS, groundspeed." },
          { code: "IR.I.C.K3b", category: "K", description: "ETA including UTC conversion." },
          { code: "IR.I.C.K3c", category: "K", description: "Fuel requirements including reserve." },
          { code: "IR.I.C.K4", category: "K", description: "Elements of an IFR flight plan." },
          { code: "IR.I.C.K5", category: "K", description: "Activating and closing an IFR flight plan." },
          { code: "IR.I.C.R1", category: "R", description: "Pilot." },
          { code: "IR.I.C.R2", category: "R", description: "Aircraft." },
          { code: "IR.I.C.R3", category: "R", description: "Environment — weather, airports, airspace, terrain, obstacles." },
          { code: "IR.I.C.R4", category: "R", description: "External pressures." },
          { code: "IR.I.C.R5", category: "R", description: "Limitations of ATC services." },
          { code: "IR.I.C.R6", category: "R", description: "Limitations of electronic planning applications." },
          { code: "IR.I.C.R7", category: "R", description: "Fuel planning." },
          { code: "IR.I.C.S1", category: "S", description: "Prepare and explain an IFR cross-country plan with risk analysis and fuel calculations." },
          { code: "IR.I.C.S2", category: "S", description: "Recalculate fuel reserves based on evaluator scenario." },
          { code: "IR.I.C.S3", category: "S", description: "Create a navigation plan and simulate filing an IFR flight plan." },
          { code: "IR.I.C.S4", category: "S", description: "Interpret departure, arrival, en route, and approach charts." },
          { code: "IR.I.C.S5", category: "S", description: "Recognize simulated airframe icing and explain adverse effects and corrections." },
          { code: "IR.I.C.S6", category: "S", description: "Apply current charts, Chart Supplements, and NOTAMs to flight planning." }
        ]
      }
    ]
  },
  {
    area: "II. Preflight Procedures",
    tasks: [
      {
        name: "Aircraft Systems Related to IFR Operations",
        code: "IR.II.A",
        references: "14 CFR part 91; AC 91-74; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-15, FAA-H-8083-25; POH/AFM",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with anti-icing, deicing, and IFR-related systems.",
        stds: [
          { code: "IR.II.A.K1", category: "K", description: "Anti-icing and deicing systems — airframe, propeller, intake, fuel, pitot-static." },
          { code: "IR.II.A.K2", category: "K", description: "Flight control systems." },
          { code: "IR.II.A.R1", category: "R", description: "Operations in icing conditions." },
          { code: "IR.II.A.R2", category: "R", description: "Limitations of anti-icing and deicing systems." },
          { code: "IR.II.A.R3", category: "R", description: "Use of automated systems in IMC." },
          { code: "IR.II.A.S1", category: "S", description: "Demonstrate familiarity with anti/de-icing procedures for the aircraft used." },
          { code: "IR.II.A.S2", category: "S", description: "Demonstrate familiarity with AFCS procedures for the aircraft used, if applicable." }
        ]
      },
      {
        name: "Aircraft Flight Instruments and Navigation Equipment",
        code: "IR.II.B",
        references: "14 CFR part 91; AC 90-100, AC 90-105, AC 90-107, AC 91-78, AC 91.21-1; AIM; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-15, FAA-H-8083-25",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with IFR instruments and navigation equipment.",
        stds: [
          { code: "IR.II.B.K1", category: "K", description: "Flight instrument systems." },
          { code: "IR.II.B.K1a", category: "K", description: "Pitot-static system and instruments." },
          { code: "IR.II.B.K1b", category: "K", description: "Gyroscopic/electric/vacuum system and instruments." },
          { code: "IR.II.B.K1c", category: "K", description: "Electrical systems, PFD, MFD, transponder, ADS-B." },
          { code: "IR.II.B.K1d", category: "K", description: "Magnetic compass." },
          { code: "IR.II.B.K2", category: "K", description: "Navigation systems." },
          { code: "IR.II.B.K2a", category: "K", description: "VOR, DME, ILS, marker beacon." },
          { code: "IR.II.B.K2b", category: "K", description: "RNAV, GPS, WAAS, FMS, autopilot." },
          { code: "IR.II.B.K3", category: "K", description: "Electronic flight bag (EFB) use." },
          { code: "IR.II.B.R1", category: "R", description: "Monitoring and management of automated systems." },
          { code: "IR.II.B.R2", category: "R", description: "Approved vs non-approved navigation devices." },
          { code: "IR.II.B.R3", category: "R", description: "Flight and navigation instrument failure modes." },
          { code: "IR.II.B.R4", category: "R", description: "EFB use." },
          { code: "IR.II.B.R5", category: "R", description: "Navigation database use." },
          { code: "IR.II.B.S1", category: "S", description: "Operate and manage installed instruments and navigation equipment." },
          { code: "IR.II.B.S2", category: "S", description: "Operate and manage EFB, if used." }
        ]
      }
    ]
  },
  {
    area: "VII. Emergency Operations",
    tasks: [
      {
        name: "Loss of Communications",
        code: "IR.VII.A",
        references: "14 CFR part 91; AIM; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-15, FAA-H-8083-16, FAA-H-8083-25",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with loss of communications under IFR.",
        stds: [
          { code: "IR.VII.A.K1", category: "K", description: "Lost comm procedures — reestablishing contact, IFR deviation, and beginning approach." },
          { code: "IR.VII.A.R1", category: "R", description: "Possible reasons for loss of communication." },
          { code: "IR.VII.A.R2", category: "R", description: "Deviation from lost comm procedures." },
          { code: "IR.VII.A.S1", category: "S", description: "Recognize a simulated loss of communication." },
          { code: "IR.VII.A.S2", category: "S", description: "Simulate actions to re-establish communication." },
          { code: "IR.VII.A.S3", category: "S", description: "Determine whether to continue to destination or deviate." },
          { code: "IR.VII.A.S4", category: "S", description: "Determine appropriate time to begin an approach." },
          { code: "IR.VII.A.S5", category: "S", description: "Use SRM or CRM as appropriate." }
        ]
      },
      {
        name: "IR ACS Risk Management for Each Maneuver",
        code: "IR.RM",
        references: "FAA-S-ACS-8C",
        objective: "To determine the applicant exhibits satisfactory risk management for all instrument flight maneuvers and procedures.",
        stds: [
          { code: "IR.II.C.R1", category: "R", description: "Instrument Flight Deck Check — Inoperative equipment." },
          { code: "IR.II.C.R2", category: "R", description: "Instrument Flight Deck Check — Outdated navigation publications or databases." },
          { code: "IR.III.A.R1", category: "R", description: "ATC Clearances — Less than full understanding of clearance." },
          { code: "IR.III.A.R2", category: "R", description: "ATC Clearances — Inappropriate, incomplete, or incorrect clearance." },
          { code: "IR.III.A.R3", category: "R", description: "ATC Clearances — Clearance inconsistent with aircraft performance or navigation capability." },
          { code: "IR.III.A.R4", category: "R", description: "ATC Clearances — Clearance intended for aircraft with similar call sign." },
          { code: "IR.III.B.R1", category: "R", description: "Holding — Recalculating fuel reserves for unanticipated EFC time." },
          { code: "IR.III.B.R2", category: "R", description: "Holding — Minimum fuel or emergency declaration scenarios." },
          { code: "IR.III.B.R3", category: "R", description: "Holding — Scenarios leading to hold including deteriorating destination weather." },
          { code: "IR.III.B.R4", category: "R", description: "Holding — Entry and wind correction." },
          { code: "IR.IV.A.R1", category: "R", description: "Instrument Flight — Physiological factors degrading instrument cross-check." },
          { code: "IR.IV.A.R2", category: "R", description: "Instrument Flight — Spatial disorientation and optical illusions." },
          { code: "IR.IV.A.R3", category: "R", description: "Instrument Flight — Unfamiliar aircraft or avionics." },
          { code: "IR.IV.B.R1", category: "R", description: "Unusual Attitudes — LOC-I causes — stress, task saturation, spatial disorientation." },
          { code: "IR.IV.B.R3", category: "R", description: "Unusual Attitudes — Operating envelope." },
          { code: "IR.IV.B.R4", category: "R", description: "Unusual Attitudes — Instrument interpretation." },
          { code: "IR.IV.B.R5", category: "R", description: "Unusual Attitudes — Assessment of the unusual attitude." },
          { code: "IR.IV.B.R6", category: "R", description: "Unusual Attitudes — Control input errors." },
          { code: "IR.IV.B.R7", category: "R", description: "Unusual Attitudes — Control by reference to instruments only." },
          { code: "IR.IV.B.R8", category: "R", description: "Unusual Attitudes — Collision hazards." },
          { code: "IR.IV.B.R9", category: "R", description: "Unusual Attitudes — Distractions and loss of situational awareness." },
          { code: "IR.V.A.R1", category: "R", description: "Intercepting and Tracking — Automated navigation management." },
          { code: "IR.V.A.R2", category: "R", description: "Intercepting and Tracking — Distractions and loss of situational awareness." },
          { code: "IR.V.A.R3", category: "R", description: "Intercepting and Tracking — Navigation system limitations." },
          { code: "IR.V.B.R1", category: "R", description: "Departure/En Route/Arrival — ATC communications and procedure compliance." },
          { code: "IR.V.B.R2", category: "R", description: "Departure/En Route/Arrival — Traffic avoidance equipment limitations." },
          { code: "IR.V.B.R3", category: "R", description: "Departure/En Route/Arrival — See and avoid responsibility." },
          { code: "IR.VI.A.R1", category: "R", description: "Non-Precision Approach — Deviating from assigned procedure." },
          { code: "IR.VI.A.R2", category: "R", description: "Non-Precision Approach — Navigation frequency selection." },
          { code: "IR.VI.A.R3", category: "R", description: "Non-Precision Approach — Automated navigation management." },
          { code: "IR.VI.A.R4", category: "R", description: "Non-Precision Approach — Aircraft configuration during approach and missed approach." },
          { code: "IR.VI.A.R5", category: "R", description: "Non-Precision Approach — Unstable approach or excessive descent rate." },
          { code: "IR.VI.A.R6", category: "R", description: "Non-Precision Approach — Deteriorating weather on approach." },
          { code: "IR.VI.A.R7", category: "R", description: "Non-Precision Approach — Descending below MDA without visual references." },
          { code: "IR.VI.B.R1", category: "R", description: "Precision Approach — Deviating from assigned procedure." },
          { code: "IR.VI.B.R2", category: "R", description: "Precision Approach — Navigation frequency selection." },
          { code: "IR.VI.B.R3", category: "R", description: "Precision Approach — Automated navigation management." },
          { code: "IR.VI.B.R4", category: "R", description: "Precision Approach — Aircraft configuration during approach and missed approach." },
          { code: "IR.VI.B.R5", category: "R", description: "Precision Approach — Unstable approach or excessive descent rate." },
          { code: "IR.VI.B.R6", category: "R", description: "Precision Approach — Deteriorating weather on approach." },
          { code: "IR.VI.B.R7", category: "R", description: "Precision Approach — Descending below DA/DH without visual references." },
          { code: "IR.VI.C.R1", category: "R", description: "Missed Approach — Deviations from procedure or ATC instructions." },
          { code: "IR.VI.C.R2", category: "R", description: "Missed Approach — Holding, diverting, or flying approach again." },
          { code: "IR.VI.C.R3", category: "R", description: "Missed Approach — Aircraft configuration." },
          { code: "IR.VI.C.R4", category: "R", description: "Missed Approach — Factors leading to early missed approach or go-around below minimums." },
          { code: "IR.VI.C.R5", category: "R", description: "Missed Approach — Automated navigation management." },
          { code: "IR.VI.D.R1", category: "R", description: "Circling Approach — Circling procedures." },
          { code: "IR.VI.D.R2", category: "R", description: "Circling Approach — Night or marginal visibility circling." },
          { code: "IR.VI.D.R3", category: "R", description: "Circling Approach — Losing visual contact with airport." },
          { code: "IR.VI.D.R4", category: "R", description: "Circling Approach — Automated navigation management." },
          { code: "IR.VI.D.R5", category: "R", description: "Circling Approach — Altitude, airspeed, or distance management." },
          { code: "IR.VI.D.R6", category: "R", description: "Circling Approach — Low altitude maneuvering — stall, spin, CFIT." },
          { code: "IR.VI.D.R7", category: "R", description: "Circling Approach — Missed approach after MAP while circling." },
          { code: "IR.VI.E.R1", category: "R", description: "Landing from Instrument Approach — Unstable approach." },
          { code: "IR.VI.E.R2", category: "R", description: "Landing from Instrument Approach — Flying below glidepath." },
          { code: "IR.VI.E.R3", category: "R", description: "Landing from Instrument Approach — Transitioning from instruments to visual." },
          { code: "IR.VI.E.R4", category: "R", description: "Landing from Instrument Approach — Aircraft configuration." },
          { code: "IR.VII.D.R1", category: "R", description: "Loss of Primary Instruments — Use of secondary displays." },
          { code: "IR.VII.D.R2", category: "R", description: "Loss of Primary Instruments — Maintaining aircraft control." },
          { code: "IR.VII.D.R3", category: "R", description: "Loss of Primary Instruments — Distractions and loss of situational awareness." },
          { code: "IR.VIII.A.R1", category: "R", description: "Postflight — Postflight inspection and discrepancy documentation." }
        ]
      }
    ]
  }
];

export const IR_FLIGHT_ACS: ACSArea[] = [
  {
    area: "II. Preflight Procedures",
    tasks: [
      {
        name: "Instrument Flight Deck Check",
        code: "IR.II.C",
        references: "14 CFR part 91; AC 91.21-1; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-15, FAA-H-8083-25; POH/AFM",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with the instrument flight deck check.",
        stds: [
          { code: "IR.II.C.K1", category: "K", description: "Purpose of instrument flight deck check and detecting defects." },
          { code: "IR.II.C.K2", category: "K", description: "IFR airworthiness — inspection requirements and required equipment." },
          { code: "IR.II.C.K3", category: "K", description: "Procedures and limitations for inoperative equipment." },
          { code: "IR.II.C.R1", category: "R", description: "Inoperative equipment." },
          { code: "IR.II.C.R2", category: "R", description: "Outdated navigation publications or databases." },
          { code: "IR.II.C.S1", category: "S", description: "Perform preflight inspection and confirm aircraft is airworthy for IFR flight." }
        ]
      }
    ]
  },
  {
    area: "III. ATC Clearances and Procedures",
    tasks: [
      {
        name: "Compliance with ATC Clearances",
        code: "IR.III.A",
        references: "14 CFR part 91; AIM; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-15, FAA-H-8083-16, FAA-H-8083-25",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with ATC clearances solely by reference to instruments.",
        stds: [
          { code: "IR.III.A.K1", category: "K", description: "ATC clearance elements and pilot/controller responsibilities — departure, en route, arrival, and void times." },
          { code: "IR.III.A.K2", category: "K", description: "PIC emergency authority." },
          { code: "IR.III.A.K3", category: "K", description: "Lost comm procedures and non-radar environment operations." },
          { code: "IR.III.A.R1", category: "R", description: "Less than full understanding of clearance." },
          { code: "IR.III.A.R2", category: "R", description: "Inappropriate, incomplete, or incorrect clearance." },
          { code: "IR.III.A.R3", category: "R", description: "Clearance inconsistent with aircraft performance or navigation capability." },
          { code: "IR.III.A.R4", category: "R", description: "Clearance intended for aircraft with similar call sign." },
          { code: "IR.III.A.S1", category: "S", description: "Copy, read back, interpret, and comply with ATC clearances using standard phraseology." },
          { code: "IR.III.A.S2", category: "S", description: "Set comm frequencies, navigation systems, and transponder per clearance." },
          { code: "IR.III.A.S3", category: "S", description: "Use current paper or electronic navigation publications." },
          { code: "IR.III.A.S4", category: "S", description: "Intercept all courses, radials, and bearings in a timely manner." },
          { code: "IR.III.A.S5", category: "S", description: "Maintain ±10 kts airspeed, ±10° heading, ±100 ft altitude, ¾-scale CDI." },
          { code: "IR.III.A.S6", category: "S", description: "Use SRM or CRM as appropriate." },
          { code: "IR.III.A.S7", category: "S", description: "Perform appropriate checklists for phase of flight." }
        ]
      },
      {
        name: "Holding Procedures",
        code: "IR.III.B",
        references: "14 CFR part 91; AIM; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-15, FAA-H-8083-16, FAA-H-8083-25",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with holding procedures solely by reference to instruments.",
        stds: [
          { code: "IR.III.B.K1", category: "K", description: "Holding elements — speeds, entries, standard and nonstandard patterns." },
          { code: "IR.III.B.R1", category: "R", description: "Fuel recalculation for unanticipated EFC time." },
          { code: "IR.III.B.R2", category: "R", description: "Minimum fuel or emergency declaration scenarios." },
          { code: "IR.III.B.R3", category: "R", description: "Scenarios leading to hold including deteriorating destination weather." },
          { code: "IR.III.B.R4", category: "R", description: "Hold entry and wind correction." },
          { code: "IR.III.B.S1", category: "S", description: "Use appropriate entry for standard, nonstandard, published, or non-published hold." },
          { code: "IR.III.B.S2", category: "S", description: "Slow to holding speed 3 min or less from fix and set power for fuel conservation." },
          { code: "IR.III.B.S3", category: "S", description: "Recognize fix arrival and promptly initiate holding entry." },
          { code: "IR.III.B.S3a", category: "S", description: "Comply with leg length and restrictions associated with holding pattern." },
          { code: "IR.III.B.S4", category: "S", description: "Maintain ±10 kts airspeed, ±100 ft altitude, ±10° heading, ¾-scale CDI." },
          { code: "IR.III.B.S5", category: "S", description: "Use wind correction to maintain pattern and arrive over fix at specified time." },
          { code: "IR.III.B.S6", category: "S", description: "Use MFD and graphical displays to monitor position during hold." },
          { code: "IR.III.B.S7", category: "S", description: "Comply with ATC reporting requirements for holding." },
          { code: "IR.III.B.S8", category: "S", description: "Use SRM or CRM as appropriate." }
        ]
      }
    ]
  },
  {
    area: "IV. Flight by Reference to Instruments",
    tasks: [
      {
        name: "Instrument Flight",
        code: "IR.IV.A",
        references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-15, FAA-H-8083-16, FAA-H-8083-25",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with basic flight maneuvers solely by reference to instruments.",
        stds: [
          { code: "IR.IV.A.K1", category: "K", description: "Attitude instrument flying — straight-and-level, climbs, turns, descents." },
          { code: "IR.IV.A.K2", category: "K", description: "Pitch, bank, and power instrument interpretation and limitations." },
          { code: "IR.IV.A.K3", category: "K", description: "Normal and abnormal instrument indications." },
          { code: "IR.IV.A.R1", category: "R", description: "Physiological factors degrading instrument cross-check." },
          { code: "IR.IV.A.R2", category: "R", description: "Spatial disorientation and optical illusions." },
          { code: "IR.IV.A.R3", category: "R", description: "Unfamiliar aircraft or avionics." },
          { code: "IR.IV.A.S1", category: "S", description: "Maintain ±100 ft altitude, ±10° heading, ±10 kts airspeed, ±5° bank." },
          { code: "IR.IV.A.S2", category: "S", description: "Use proper instrument cross-check and apply pitch, bank, power, and trim corrections." }
        ]
      },
      {
        name: "Recovery from Unusual Flight Attitudes",
        code: "IR.IV.B",
        references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-15, FAA-H-8083-25; POH/AFM",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with unusual attitude recovery solely by reference to instruments.",
        stds: [
          { code: "IR.IV.B.K1", category: "K", description: "Unusual attitude recovery procedures." },
          { code: "IR.IV.B.K2", category: "K", description: "Prevention — flight causal, physiological, environmental, and equipment failure factors." },
          { code: "IR.IV.B.K3", category: "K", description: "Procedures to regain VMC after inadvertent IMC (IIMC/UIMC)." },
          { code: "IR.IV.B.K4", category: "K", description: "Appropriate use of automation." },
          { code: "IR.IV.B.R1", category: "R", description: "LOC-I causes — stress, task saturation, poor scan, spatial disorientation." },
          { code: "IR.IV.B.R3", category: "R", description: "Operating envelope." },
          { code: "IR.IV.B.R4", category: "R", description: "Instrument interpretation." },
          { code: "IR.IV.B.R5", category: "R", description: "Assessment of unusual attitude." },
          { code: "IR.IV.B.R6", category: "R", description: "Control input errors inducing undesired attitudes." },
          { code: "IR.IV.B.R7", category: "R", description: "Control by instruments only." },
          { code: "IR.IV.B.R8", category: "R", description: "Collision hazards." },
          { code: "IR.IV.B.R9", category: "R", description: "Distractions and loss of situational awareness." },
          { code: "IR.IV.B.S1", category: "S", description: "Identify nose-high and nose-low unusual attitudes and recover using correct sequence." },
          { code: "IR.IV.B.S2", category: "S", description: "Use SRM or CRM as appropriate." }
        ]
      }
    ]
  },
  {
    area: "V. Navigation Systems",
    tasks: [
      {
        name: "Intercepting and Tracking Navigational Systems and DME Arcs",
        code: "IR.V.A",
        references: "14 CFR part 91; AIM; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-15, FAA-H-8083-16, FAA-H-8083-25; POH/AFM",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with intercepting and tracking navigation aids solely by reference to instruments.",
        stds: [
          { code: "IR.V.A.K1", category: "K", description: "Ground-based navigation — orientation, course determination, equipment, intercept and tracking." },
          { code: "IR.V.A.K2", category: "K", description: "Satellite-based navigation — GPS, WAAS, RAIM, databases, intercept and tracking." },
          { code: "IR.V.A.R1", category: "R", description: "Automated navigation management." },
          { code: "IR.V.A.R2", category: "R", description: "Distractions and loss of situational awareness." },
          { code: "IR.V.A.R3", category: "R", description: "Navigation system limitations." },
          { code: "IR.V.A.S1", category: "S", description: "Tune and identify navigation facility and verify system accuracy." },
          { code: "IR.V.A.S2", category: "S", description: "Determine aircraft position relative to facility or waypoint." },
          { code: "IR.V.A.S3", category: "S", description: "Set and orient to course to be intercepted." },
          { code: "IR.V.A.S4", category: "S", description: "Intercept specified course at appropriate angle inbound or outbound." },
          { code: "IR.V.A.S5", category: "S", description: "Maintain ±10 kts airspeed, ±100 ft altitude, ±5° heading." },
          { code: "IR.V.A.S6", category: "S", description: "Maintain course within ¾-scale CDI. DME arc within ±1 NM." },
          { code: "IR.V.A.S7", category: "S", description: "Recognize navigation failure and report to ATC." },
          { code: "IR.V.A.S8", category: "S", description: "Use MFD and graphical displays to monitor position and wind drift." },
          { code: "IR.V.A.S9", category: "S", description: "Use autopilot for course intercepts at evaluator discretion." },
          { code: "IR.V.A.S10", category: "S", description: "Use SRM or CRM as appropriate." }
        ]
      },
      {
        name: "Departure, En Route, and Arrival Operations",
        code: "IR.V.B",
        references: "14 CFR parts 91, 97; AC 90-100, AC 90-105, AC 91-74; AIM; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-15, FAA-H-8083-16, FAA-H-8083-25; POH/AFM",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with IFR departure, en route, and arrival operations solely by reference to instruments.",
        stds: [
          { code: "IR.V.B.K1", category: "K", description: "ATC routes — DPs, climb gradients, STARs, and constraints." },
          { code: "IR.V.B.K2", category: "K", description: "Pilot/controller responsibilities, communications, and ATC services." },
          { code: "IR.V.B.R1", category: "R", description: "ATC communications and procedure compliance." },
          { code: "IR.V.B.R2", category: "R", description: "Traffic avoidance equipment limitations." },
          { code: "IR.V.B.R3", category: "R", description: "See and avoid responsibility." },
          { code: "IR.V.B.S1", category: "S", description: "Select and use appropriate comm and navigation facilities." },
          { code: "IR.V.B.S2", category: "S", description: "Perform checklists for phase of flight." },
          { code: "IR.V.B.S3", category: "S", description: "Use current paper or electronic navigation publications." },
          { code: "IR.V.B.S4", category: "S", description: "Establish two-way comms and comply with ATC instructions and restrictions." },
          { code: "IR.V.B.S5", category: "S", description: "Intercept courses, radials, and bearings in a timely manner." },
          { code: "IR.V.B.S6", category: "S", description: "Comply with all charted procedures." },
          { code: "IR.V.B.S7", category: "S", description: "Maintain ±10 kts airspeed, ±100 ft altitude, ±10° heading, ¾-scale CDI." },
          { code: "IR.V.B.S8", category: "S", description: "Update and interpret weather in flight." },
          { code: "IR.V.B.S9", category: "S", description: "Use digital weather and aeronautical displays for situational awareness." },
          { code: "IR.V.B.S10", category: "S", description: "Use SRM or CRM as appropriate." }
        ]
      }
    ]
  },
  {
    area: "VI. Instrument Approach Procedures",
    tasks: [
      {
        name: "Non-Precision Approach",
        code: "IR.VI.A",
        references: "14 CFR part 91; AC 120-108; AIM; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-15, FAA-H-8083-16, FAA-H-8083-25; Terminal Procedures Publications",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with non-precision approach procedures solely by reference to instruments.",
        stds: [
          { code: "IR.VI.A.K1", category: "K", description: "Non-precision approach procedures — LP vs LNAV guidance differences." },
          { code: "IR.VI.A.K2", category: "K", description: "RNAV approach navigation system indications and annunciations." },
          { code: "IR.VI.A.K3", category: "K", description: "Ground-based and satellite-based navigation for non-precision approaches." },
          { code: "IR.VI.A.K4", category: "K", description: "Stabilized approach and energy management." },
          { code: "IR.VI.A.R1", category: "R", description: "Deviating from assigned procedure." },
          { code: "IR.VI.A.R2", category: "R", description: "Navigation frequency selection." },
          { code: "IR.VI.A.R3", category: "R", description: "Automated navigation management." },
          { code: "IR.VI.A.R4", category: "R", description: "Aircraft configuration during approach and missed approach." },
          { code: "IR.VI.A.R5", category: "R", description: "Unstable approach or excessive descent rate." },
          { code: "IR.VI.A.R6", category: "R", description: "Deteriorating weather on approach." },
          { code: "IR.VI.A.R7", category: "R", description: "Descending below MDA without visual references." },
          { code: "IR.VI.A.S1", category: "S", description: "Accomplish non-precision approaches selected by evaluator." },
          { code: "IR.VI.A.S2", category: "S", description: "Establish two-way comms with ATC using proper phraseology." },
          { code: "IR.VI.A.S3", category: "S", description: "Select, tune, identify, and confirm navigation equipment for approach." },
          { code: "IR.VI.A.S4", category: "S", description: "Comply with all ATC clearances." },
          { code: "IR.VI.A.S5", category: "S", description: "Recognize inaccurate or inoperative instrumentation and take appropriate action." },
          { code: "IR.VI.A.S6", category: "S", description: "Advise ATC if unable to comply with clearance." },
          { code: "IR.VI.A.S7", category: "S", description: "Complete appropriate checklists." },
          { code: "IR.VI.A.S8", category: "S", description: "Establish appropriate configuration and airspeed for conditions." },
          { code: "IR.VI.A.S9", category: "S", description: "Maintain ±100 ft altitude, ±10° heading, ±10 kts airspeed, ¾-scale CDI prior to final." },
          { code: "IR.VI.A.S10", category: "S", description: "Adjust MDA and visibility for NOTAMs, inoperative equipment, or visual aids." },
          { code: "IR.VI.A.S11", category: "S", description: "Establish stabilized descent to appropriate altitude." },
          { code: "IR.VI.A.S12", category: "S", description: "Final segment — ¾-scale CDI, ±10 kts, MDA +100/-0 ft to VDP or MAP." },
          { code: "IR.VI.A.S13", category: "S", description: "Assess visual references and initiate missed approach or continue for landing." },
          { code: "IR.VI.A.S14", category: "S", description: "Use MFD and graphical displays for position and wind drift awareness." },
          { code: "IR.VI.A.S15", category: "S", description: "Use SRM or CRM as appropriate." }
        ]
      },
      {
        name: "Precision Approach",
        code: "IR.VI.B",
        references: "14 CFR part 91; AC 90-105, AC 90-107; AIM; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-15, FAA-H-8083-16, FAA-H-8083-25; Terminal Procedures Publications",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with precision approach procedures solely by reference to instruments.",
        stds: [
          { code: "IR.VI.B.K1", category: "K", description: "Precision approach procedures — descent rates and minimums adjustment." },
          { code: "IR.VI.B.K2", category: "K", description: "Navigation system displays, annunciations, and modes." },
          { code: "IR.VI.B.K3", category: "K", description: "Ground-based and satellite-based navigation — signal integrity and databases." },
          { code: "IR.VI.B.K4", category: "K", description: "Stabilized approach and energy management." },
          { code: "IR.VI.B.R1", category: "R", description: "Deviating from assigned procedure." },
          { code: "IR.VI.B.R2", category: "R", description: "Navigation frequency selection." },
          { code: "IR.VI.B.R3", category: "R", description: "Automated navigation management." },
          { code: "IR.VI.B.R4", category: "R", description: "Aircraft configuration during approach and missed approach." },
          { code: "IR.VI.B.R5", category: "R", description: "Unstable approach or excessive descent rate." },
          { code: "IR.VI.B.R6", category: "R", description: "Deteriorating weather on approach." },
          { code: "IR.VI.B.R7", category: "R", description: "Descending below DA/DH without visual references." },
          { code: "IR.VI.B.S1", category: "S", description: "Accomplish precision approaches selected by evaluator." },
          { code: "IR.VI.B.S2", category: "S", description: "Establish two-way comms with ATC using proper phraseology." },
          { code: "IR.VI.B.S3", category: "S", description: "Select, tune, identify, and confirm navigation equipment for approach." },
          { code: "IR.VI.B.S4", category: "S", description: "Comply with all ATC clearances." },
          { code: "IR.VI.B.S5", category: "S", description: "Recognize inaccurate or inoperative instrumentation and take appropriate action." },
          { code: "IR.VI.B.S6", category: "S", description: "Advise ATC if unable to comply with clearance." },
          { code: "IR.VI.B.S7", category: "S", description: "Complete appropriate checklists." },
          { code: "IR.VI.B.S8", category: "S", description: "Establish appropriate configuration and airspeed for conditions." },
          { code: "IR.VI.B.S9", category: "S", description: "Maintain ±100 ft altitude, ±10° heading, ±10 kts airspeed, ¾-scale CDI prior to final." },
          { code: "IR.VI.B.S10", category: "S", description: "Adjust DA/DH and visibility for NOTAMs, inoperative equipment, or visual aids." },
          { code: "IR.VI.B.S11", category: "S", description: "Establish predetermined descent rate at vertical guidance intercept point." },
          { code: "IR.VI.B.S12", category: "S", description: "Stabilized final — ¾-scale vertical and lateral guidance, ±10 kts airspeed FAF to DA/DH." },
          { code: "IR.VI.B.S13", category: "S", description: "Initiate missed approach immediately at DA/DH if visual references not unmistakably visible." },
          { code: "IR.VI.B.S14", category: "S", description: "Transition to landing only when in position for normal descent to runway." },
          { code: "IR.VI.B.S15", category: "S", description: "Maintain stabilized visual flight path from DA/DH to touchdown zone." },
          { code: "IR.VI.B.S16", category: "S", description: "Use MFD and graphical displays for position and wind drift awareness." },
          { code: "IR.VI.B.S17", category: "S", description: "Use SRM or CRM as appropriate." }
        ]
      },
      {
        name: "Missed Approach",
        code: "IR.VI.C",
        references: "14 CFR parts 91, 97; AIM; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-15, FAA-H-8083-16, FAA-H-8083-25; Terminal Procedures Publications",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with missed approach procedures solely by reference to instruments.",
        stds: [
          { code: "IR.VI.C.K1", category: "K", description: "Missed approach procedures and limitations — including FMS and autopilot use." },
          { code: "IR.VI.C.R1", category: "R", description: "Deviations from procedure or ATC instructions." },
          { code: "IR.VI.C.R2", category: "R", description: "Holding, diverting, or flying approach again." },
          { code: "IR.VI.C.R3", category: "R", description: "Aircraft configuration." },
          { code: "IR.VI.C.R4", category: "R", description: "Factors leading to early missed approach or go-around below minimums." },
          { code: "IR.VI.C.R5", category: "R", description: "Automated navigation management." },
          { code: "IR.VI.C.S1", category: "S", description: "Promptly initiate missed approach and report to ATC." },
          { code: "IR.VI.C.S2", category: "S", description: "Apply appropriate power and pitch for desired performance." },
          { code: "IR.VI.C.S3", category: "S", description: "Configure aircraft, establish positive climb, accelerate to ±10 kts of target." },
          { code: "IR.VI.C.S4", category: "S", description: "Follow missed approach/go-around checklist." },
          { code: "IR.VI.C.S5", category: "S", description: "Comply with published or alternate missed approach procedure." },
          { code: "IR.VI.C.S6", category: "S", description: "Advise ATC if unable to comply with clearance or climb gradient." },
          { code: "IR.VI.C.S7", category: "S", description: "Maintain ±10 kts airspeed, ±10° heading/course/bearing, ±100 ft altitude." },
          { code: "IR.VI.C.S8", category: "S", description: "Use MFD and graphical displays to monitor missed approach track." },
          { code: "IR.VI.C.S9", category: "S", description: "Use SRM or CRM as appropriate." },
          { code: "IR.VI.C.S10", category: "S", description: "Request clearance for another approach, alternate, holding, or as directed." }
        ]
      },
      {
        name: "Circling Approach",
        code: "IR.VI.D",
        references: "14 CFR parts 91, 97; AIM; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-15, FAA-H-8083-16, FAA-H-8083-25; Terminal Procedures Publications",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with circling approach procedures.",
        stds: [
          { code: "IR.VI.D.K1", category: "K", description: "Circling approach procedures, approach categories, and airspeed restrictions." },
          { code: "IR.VI.D.R1", category: "R", description: "Circling procedures." },
          { code: "IR.VI.D.R2", category: "R", description: "Night or marginal visibility circling." },
          { code: "IR.VI.D.R3", category: "R", description: "Losing visual contact with airport." },
          { code: "IR.VI.D.R4", category: "R", description: "Automated navigation management." },
          { code: "IR.VI.D.R5", category: "R", description: "Altitude, airspeed, or distance management while circling." },
          { code: "IR.VI.D.R6", category: "R", description: "Low altitude maneuvering — stall, spin, CFIT." },
          { code: "IR.VI.D.R7", category: "R", description: "Missed approach after MAP while circling." },
          { code: "IR.VI.D.S1", category: "S", description: "Comply with circling procedure considering turbulence, windshear, and aircraft category." },
          { code: "IR.VI.D.S2", category: "S", description: "Confirm traffic direction and comply with ATC restrictions." },
          { code: "IR.VI.D.S3", category: "S", description: "Use SRM or CRM as appropriate." },
          { code: "IR.VI.D.S4", category: "S", description: "Establish landing configuration and stabilized descent to MDA before MAP." },
          { code: "IR.VI.D.S5", category: "S", description: "Maintain ±10 kts airspeed, ±10° heading, +100/-0 ft until descending below MDA." },
          { code: "IR.VI.D.S6", category: "S", description: "Maneuver to base or downwind appropriate for runway and conditions." },
          { code: "IR.VI.D.S7", category: "S", description: "If missed approach — turn correctly, use proper procedure, and configure aircraft." },
          { code: "IR.VI.D.S8", category: "S", description: "If landing — stabilized descent, touch down in first third, max 30° bank." }
        ]
      },
      {
        name: "Landing from an Instrument Approach",
        code: "IR.VI.E",
        references: "14 CFR part 91; AIM; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-15, FAA-H-8083-16, FAA-H-8083-25; POH/AFM",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with landing from an instrument approach.",
        stds: [
          { code: "IR.VI.E.K1", category: "K", description: "Pilot responsibilities and factors affecting landing from straight-in or circling approach." },
          { code: "IR.VI.E.K2", category: "K", description: "Airport signs, markings, lighting, and approach lighting systems." },
          { code: "IR.VI.E.K3", category: "K", description: "Landing profiles and aircraft configurations." },
          { code: "IR.VI.E.R1", category: "R", description: "Unstable approach." },
          { code: "IR.VI.E.R2", category: "R", description: "Flying below glidepath." },
          { code: "IR.VI.E.R3", category: "R", description: "Transitioning from instruments to visual references." },
          { code: "IR.VI.E.R4", category: "R", description: "Aircraft configuration for landing." },
          { code: "IR.VI.E.S1", category: "S", description: "Transition at DA/DH, MDA, or VDP to visual flight for safe maneuvering and landing." },
          { code: "IR.VI.E.S2", category: "S", description: "Adhere to ATC advisories — NOTAMs, windshear, wake turbulence, runway surface." },
          { code: "IR.VI.E.S3", category: "S", description: "Complete appropriate checklists." },
          { code: "IR.VI.E.S4", category: "S", description: "Maintain positive aircraft control throughout the landing maneuver." },
          { code: "IR.VI.E.S5", category: "S", description: "Use SRM or CRM as appropriate." }
        ]
      }
    ]
  },
  {
    area: "VII. Emergency Operations",
    tasks: [
      {
        name: "Loss of Communications",
        code: "IR.VII.A",
        references: "14 CFR part 91; AIM; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-15, FAA-H-8083-16, FAA-H-8083-25",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with loss of communications under IFR.",
        stds: [
          { code: "IR.VII.A.K1", category: "K", description: "Lost comm procedures — reestablishing contact, IFR deviation, beginning approach." },
          { code: "IR.VII.A.R1", category: "R", description: "Possible reasons for loss of communication." },
          { code: "IR.VII.A.R2", category: "R", description: "Deviation from lost comm procedures." },
          { code: "IR.VII.A.S1", category: "S", description: "Recognize a simulated loss of communication." },
          { code: "IR.VII.A.S2", category: "S", description: "Simulate actions to re-establish communication." },
          { code: "IR.VII.A.S3", category: "S", description: "Determine whether to continue to flight plan destination or deviate." },
          { code: "IR.VII.A.S4", category: "S", description: "Determine appropriate time to begin approach." },
          { code: "IR.VII.A.S5", category: "S", description: "Use SRM or CRM as appropriate." }
        ]
      },
      {
        name: "Approach with Loss of Primary Flight Instrument Indicators",
        code: "IR.VII.D",
        references: "14 CFR part 91; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-15, FAA-H-8083-16, FAA-H-8083-25; POH/AFM; Terminal Procedures Publications",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with approach with loss of primary flight instruments.",
        stds: [
          { code: "IR.VII.D.K1", category: "K", description: "Recognizing inaccurate or inoperative primary instruments and advising ATC." },
          { code: "IR.VII.D.K2", category: "K", description: "Primary instrument failure modes and minimizing effects." },
          { code: "IR.VII.D.R1", category: "R", description: "Use of secondary displays when primary failed." },
          { code: "IR.VII.D.R2", category: "R", description: "Maintaining aircraft control." },
          { code: "IR.VII.D.R3", category: "R", description: "Distractions and loss of situational awareness." },
          { code: "IR.VII.D.S1", category: "S", description: "Advise ATC if unable to comply with clearance." },
          { code: "IR.VII.D.S2", category: "S", description: "Complete non-precision approach without primary flight instruments." },
          { code: "IR.VII.D.S3", category: "S", description: "Use SRM or CRM as appropriate." }
        ]
      }
    ]
  },
  {
    area: "VIII. Postflight Procedures",
    tasks: [
      {
        name: "Checking Instruments and Equipment",
        code: "IR.VIII.A",
        references: "14 CFR part 91; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-25; POH/AFM",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with postflight instrument and equipment checks.",
        stds: [
          { code: "IR.VIII.A.K1", category: "K", description: "Documenting in-flight and postflight discrepancies." },
          { code: "IR.VIII.A.R1", category: "R", description: "Postflight inspection and discrepancy documentation." },
          { code: "IR.VIII.A.S1", category: "S", description: "Conduct postflight inspection and document discrepancies and servicing requirements." }
        ]
      }
    ]
  }
];
