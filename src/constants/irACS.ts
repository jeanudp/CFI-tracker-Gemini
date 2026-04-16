import { ACSArea } from '../types';

export const IR_GROUND_ACS: ACSArea[] = [
  {
    area: "I. Preflight Preparation",
    tasks: [
      {
        name: "Pilot Qualifications",
        code: "IR.I.A",
        references: "14 CFR part 61; AC 68-1; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-15, FAA-H-8083-25",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with requirements to act as pilot-in-command under instrument flight rules.",
        stds: [
          { code: "IR.I.A.K1", category: "K", description: "Certification requirements, recency of experience, and recordkeeping." },
          { code: "IR.I.A.K2", category: "K", description: "Privileges and limitations." },
          { code: "IR.I.A.K3", category: "K", description: "Part 68 BasicMed privileges and limitations." },
          { code: "IR.I.A.R1", category: "R", description: "Proficiency versus currency." },
          { code: "IR.I.A.R2", category: "R", description: "Personal minimums." },
          { code: "IR.I.A.R3", category: "R", description: "Fitness for flight and physiological factors that might affect the pilot's ability to fly under instrument conditions." },
          { code: "IR.I.A.R4", category: "R", description: "Flying unfamiliar aircraft or operating with unfamiliar flight display systems and avionics." },
          { code: "IR.I.A.S1", category: "S", description: "Apply requirements to act as pilot-in-command (PIC) under Instrument Flight Rules (IFR) in a scenario given by the evaluator." }
        ]
      },
      {
        name: "Weather Information",
        code: "IR.I.B",
        references: "14 CFR part 91; AC 91-92; AIM; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-25, FAA-H-8083-28",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with obtaining, understanding, and applying weather information for a flight under IFR.",
        stds: [
          { code: "IR.I.B.K1", category: "K", description: "Sources of weather data (e.g., National Weather Service, Flight Service) for flight planning purposes." },
          { code: "IR.I.B.K2", category: "K", description: "Acceptable weather products and resources required for preflight planning, current and forecast weather for departure, en route, and arrival phases of flight." },
          { code: "IR.I.B.K2a", category: "K", description: "Airport Observations (METAR and SPECI) and Pilot Observations (PIREP)." },
          { code: "IR.I.B.K2b", category: "K", description: "Surface Analysis Chart, Ceiling and Visibility Chart (CVA)." },
          { code: "IR.I.B.K2c", category: "K", description: "Terminal Aerodrome Forecasts (TAF)." },
          { code: "IR.I.B.K2d", category: "K", description: "Graphical Forecasts for Aviation (GFA)." },
          { code: "IR.I.B.K2e", category: "K", description: "Wind and Temperature Aloft Forecast (FB)." },
          { code: "IR.I.B.K2f", category: "K", description: "Convective Outlook (AC)." },
          { code: "IR.I.B.K2g", category: "K", description: "Inflight Aviation Weather Advisories including AIRMET, SIGMET, and Convective SIGMET." },
          { code: "IR.I.B.K3", category: "K", description: "Meteorology applicable to IFR flights including expected climate and hazardous conditions." },
          { code: "IR.I.B.K3a", category: "K", description: "Atmospheric composition and stability." },
          { code: "IR.I.B.K3b", category: "K", description: "Wind (e.g., windshear, mountain wave, factors affecting wind)." },
          { code: "IR.I.B.K3c", category: "K", description: "Temperature and heat exchange." },
          { code: "IR.I.B.K3d", category: "K", description: "Moisture and precipitation." },
          { code: "IR.I.B.K3e", category: "K", description: "Weather system formation, including air masses and fronts." },
          { code: "IR.I.B.K3f", category: "K", description: "Clouds." },
          { code: "IR.I.B.K3g", category: "K", description: "Turbulence." },
          { code: "IR.I.B.K3h", category: "K", description: "Thunderstorms and microbursts." },
          { code: "IR.I.B.K3i", category: "K", description: "Icing and freezing level information." },
          { code: "IR.I.B.K3j", category: "K", description: "Fog and mist." },
          { code: "IR.I.B.K3k", category: "K", description: "Frost." },
          { code: "IR.I.B.K3l", category: "K", description: "Obstructions to visibility (e.g., smoke, haze, volcanic ash)." },
          { code: "IR.I.B.K4", category: "K", description: "Flight deck instrument displays of digital weather and aeronautical information." },
          { code: "IR.I.B.R1", category: "R", description: "Making the go/no-go and continue/divert decisions." },
          { code: "IR.I.B.R1a", category: "R", description: "Circumstances that would make diversion prudent." },
          { code: "IR.I.B.R1b", category: "R", description: "Personal weather minimums." },
          { code: "IR.I.B.R1c", category: "R", description: "Hazardous weather conditions, including known or forecast icing or turbulence aloft." },
          { code: "IR.I.B.R2", category: "R", description: "Use and limitations of installed onboard weather equipment, aviation weather reports and forecasts, and inflight weather resources." },
          { code: "IR.I.B.R2a", category: "R", description: "Installed onboard weather equipment." },
          { code: "IR.I.B.R2b", category: "R", description: "Aviation weather reports and forecasts." },
          { code: "IR.I.B.R2c", category: "R", description: "Inflight weather resources." },
          { code: "IR.I.B.S1", category: "S", description: "Use available aviation weather resources to obtain an adequate weather briefing." },
          { code: "IR.I.B.S2", category: "S", description: "Analyze the implications of at least three meteorological conditions using actual weather or weather conditions provided by the evaluator." },
          { code: "IR.I.B.S3", category: "S", description: "Correlate weather information to make a go/no-go decision." },
          { code: "IR.I.B.S4", category: "S", description: "Determine whether an alternate airport is required, and if required, whether the selected alternate airport meets regulatory requirements." }
        ]
      },
      {
        name: "Cross-Country Flight Planning",
        code: "IR.I.C",
        references: "14 CFR part 91; AIM; Chart Supplements; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-15, FAA-H-8083-16, FAA-H-8083-25; IFR Enroute Charts; NOTAMS; IFR Navigation Charts",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with planning an IFR cross-country and filing an IFR flight plan.",
        stds: [
          { code: "IR.I.C.K1", category: "K", description: "Route planning, including consideration of available navigational facilities, special use airspace, preferred routes, primary and alternate airports, enroute charts, Chart Supplements, NOTAMS, and Terminal Procedures Publications." },
          { code: "IR.I.C.K1a", category: "K", description: "Available navigational facilities." },
          { code: "IR.I.C.K1b", category: "K", description: "Special use airspace." },
          { code: "IR.I.C.K1c", category: "K", description: "Preferred routes." },
          { code: "IR.I.C.K1d", category: "K", description: "Primary and alternate airports." },
          { code: "IR.I.C.K1e", category: "K", description: "Enroute charts." },
          { code: "IR.I.C.K1f", category: "K", description: "Chart Supplements." },
          { code: "IR.I.C.K1g", category: "K", description: "NOTAMS." },
          { code: "IR.I.C.K1h", category: "K", description: "Terminal Procedures Publications (TPP)." },
          { code: "IR.I.C.K2", category: "K", description: "Altitude selection accounting for terrain and obstacles, glide distance, IFR cruising altitudes, effect of wind, and oxygen requirements." },
          { code: "IR.I.C.K3", category: "K", description: "Calculating time, climb and descent rates, course, distance, heading, true airspeed, groundspeed, estimated time of arrival, and fuel requirements including reserve." },
          { code: "IR.I.C.K3a", category: "K", description: "Time, climb and descent rates, course, distance, heading, true airspeed, and groundspeed." },
          { code: "IR.I.C.K3b", category: "K", description: "Estimated time of arrival, including conversion to universal coordinated time (UTC)." },
          { code: "IR.I.C.K3c", category: "K", description: "Fuel requirements, including reserve." },
          { code: "IR.I.C.K4", category: "K", description: "Elements of an IFR flight plan." },
          { code: "IR.I.C.K5", category: "K", description: "Procedures for activating and closing an IFR flight plan in controlled and uncontrolled airspace." },
          { code: "IR.I.C.R1", category: "R", description: "Pilot." },
          { code: "IR.I.C.R2", category: "R", description: "Aircraft." },
          { code: "IR.I.C.R3", category: "R", description: "Environment (e.g., weather, airports, airspace, terrain, obstacles)." },
          { code: "IR.I.C.R4", category: "R", description: "External pressures." },
          { code: "IR.I.C.R5", category: "R", description: "Limitations of air traffic control (ATC) services." },
          { code: "IR.I.C.R6", category: "R", description: "Limitations of electronic planning applications and programs." },
          { code: "IR.I.C.R7", category: "R", description: "Fuel planning." },
          { code: "IR.I.C.S1", category: "S", description: "Prepare, present, and explain a cross-country flight plan assigned by the evaluator including a risk analysis based on real time weather, calculating time en route and fuel." },
          { code: "IR.I.C.S2", category: "S", description: "Recalculate fuel reserves based on a scenario provided by the evaluator." },
          { code: "IR.I.C.S3", category: "S", description: "Create a navigation plan and simulate filing an IFR flight plan." },
          { code: "IR.I.C.S4", category: "S", description: "Interpret departure, arrival, en route, and approach procedures with reference to appropriate and current charts." },
          { code: "IR.I.C.S5", category: "S", description: "Recognize simulated wing contamination due to airframe icing and demonstrate knowledge of adverse effects during pre-takeoff, takeoff, cruise, and landing phases of flight." },
          { code: "IR.I.C.S6", category: "S", description: "Apply pertinent information from appropriate and current aeronautical charts, Chart Supplements, NOTAMs relative to airport, runway and taxiway closures, and other flight publications." }
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
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with anti-icing or deicing systems, and other systems related to IFR flight.",
        stds: [
          { code: "IR.II.A.K1", category: "K", description: "The general operational characteristics and limitations of applicable anti-icing and deicing systems, including airframe, propeller, intake, fuel, and pitot-static systems." },
          { code: "IR.II.A.K2", category: "K", description: "Flight control systems." },
          { code: "IR.II.A.R1", category: "R", description: "Operations in icing conditions." },
          { code: "IR.II.A.R2", category: "R", description: "Limitations of anti-icing and deicing systems." },
          { code: "IR.II.A.R3", category: "R", description: "Use of automated systems in instrument conditions." },
          { code: "IR.II.A.S1", category: "S", description: "Demonstrate familiarity with anti- or de-icing procedures or information published by the manufacturer specific to the aircraft used on the practical test." },
          { code: "IR.II.A.S2", category: "S", description: "Demonstrate familiarity with the automatic flight control system (AFCS) procedures or information published by the manufacturer specific to the aircraft used on the practical test, if applicable." }
        ]
      },
      {
        name: "Aircraft Flight Instruments and Navigation Equipment",
        code: "IR.II.B",
        references: "14 CFR part 91; AC 90-100, AC 90-105, AC 90-107, AC 91-78, AC 91.21-1; AIM; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-15, FAA-H-8083-25",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with managing instruments appropriate for an IFR flight.",
        stds: [
          { code: "IR.II.B.K1", category: "K", description: "Operation of the aircraft's applicable flight instrument system(s)." },
          { code: "IR.II.B.K1a", category: "K", description: "Pitot-static instrument system and associated instruments." },
          { code: "IR.II.B.K1b", category: "K", description: "Gyroscopic/electric/vacuum instrument system and associated instruments." },
          { code: "IR.II.B.K1c", category: "K", description: "Electrical systems, electronic flight instrument displays (PFD, MFD), transponder and ADS-B." },
          { code: "IR.II.B.K1d", category: "K", description: "Magnetic compass." },
          { code: "IR.II.B.K2", category: "K", description: "Operation of the aircraft's applicable navigation system(s)." },
          { code: "IR.II.B.K2a", category: "K", description: "VOR, DME, ILS, marker beacon receiver/indicators." },
          { code: "IR.II.B.K2b", category: "K", description: "Area navigation (RNAV), GPS, WAAS, flight management system (FMS), autopilot." },
          { code: "IR.II.B.K3", category: "K", description: "Use of an electronic flight bag (EFB), if used." },
          { code: "IR.II.B.R1", category: "R", description: "Monitoring and management of automated systems." },
          { code: "IR.II.B.R2", category: "R", description: "Difference between approved and non-approved navigation devices." },
          { code: "IR.II.B.R3", category: "R", description: "Modes of flight and navigation instruments, including failure conditions." },
          { code: "IR.II.B.R4", category: "R", description: "Use of an electronic flight bag." },
          { code: "IR.II.B.R5", category: "R", description: "Use of navigation databases." },
          { code: "IR.II.B.S1", category: "S", description: "Operate and manage installed instruments and navigation equipment." },
          { code: "IR.II.B.S2", category: "S", description: "Operate and manage an applicant supplied electronic flight bag (EFB), if used." }
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
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with loss of communications while operating solely by reference to instruments.",
        stds: [
          { code: "IR.VII.A.K1", category: "K", description: "Procedures to follow in the event of lost communication during various phases of flight, including techniques for reestablishing communications, when it is acceptable to deviate from an IFR clearance, and when to begin an approach at the destination." },
          { code: "IR.VII.A.R1", category: "R", description: "Possible reasons for loss of communication." },
          { code: "IR.VII.A.R2", category: "R", description: "Deviation from procedures for lost communications." },
          { code: "IR.VII.A.S1", category: "S", description: "Recognize a simulated loss of communication." },
          { code: "IR.VII.A.S2", category: "S", description: "Simulate actions to re-establish communication." },
          { code: "IR.VII.A.S3", category: "S", description: "Determine whether to continue to flight plan destination or deviate." },
          { code: "IR.VII.A.S4", category: "S", description: "Determine appropriate time to begin an approach." },
          { code: "IR.VII.A.S5", category: "S", description: "Use single-pilot resource management (SRM) or crew resource management (CRM), as appropriate." }
        ]
      },
      {
        name: "IR ACS Risk Management for Each Maneuver",
        code: "IR.RM",
        references: "FAA-S-ACS-8C",
        objective: "To determine the applicant exhibits satisfactory risk management associated with all instrument flight maneuvers and procedures.",
        stds: [
          { code: "IR.II.C.R1", category: "R", description: "Instrument Flight Deck Check — Operating with inoperative equipment." },
          { code: "IR.II.C.R2", category: "R", description: "Instrument Flight Deck Check — Operating with outdated navigation publications or databases." },
          { code: "IR.III.A.R1", category: "R", description: "ATC Clearances — Less than full understanding of an ATC clearance." },
          { code: "IR.III.A.R2", category: "R", description: "ATC Clearances — Inappropriate, incomplete, or incorrect ATC clearances." },
          { code: "IR.III.A.R3", category: "R", description: "ATC Clearances — ATC clearance inconsistent with aircraft performance or navigation capability." },
          { code: "IR.III.A.R4", category: "R", description: "ATC Clearances — ATC clearance intended for other aircraft with similar call signs." },
          { code: "IR.III.B.R1", category: "R", description: "Holding Procedures — Recalculating fuel reserves if assigned an unanticipated EFC time." },
          { code: "IR.III.B.R2", category: "R", description: "Holding Procedures — Scenarios that could result in minimum fuel or need to declare an emergency." },
          { code: "IR.III.B.R3", category: "R", description: "Holding Procedures — Scenarios that could lead to holding, including deteriorating weather at destination." },
          { code: "IR.III.B.R4", category: "R", description: "Holding Procedures — Holding entry and wind correction while holding." },
          { code: "IR.IV.A.R1", category: "R", description: "Instrument Flight — Situations that can affect physiology and degrade instrument cross-check." },
          { code: "IR.IV.A.R2", category: "R", description: "Instrument Flight — Spatial disorientation and optical illusions." },
          { code: "IR.IV.A.R3", category: "R", description: "Instrument Flight — Flying unfamiliar aircraft or operating with unfamiliar flight display systems and avionics." },
          { code: "IR.IV.B.R1", category: "R", description: "Unusual Attitudes — Situations that could lead to LOC-I or unusual attitudes (stress, task saturation, inadequate instrument scan, spatial disorientation)." },
          { code: "IR.IV.B.R3", category: "R", description: "Unusual Attitudes — Operating envelope considerations." },
          { code: "IR.IV.B.R4", category: "R", description: "Unusual Attitudes — Interpreting flight instruments." },
          { code: "IR.IV.B.R5", category: "R", description: "Unusual Attitudes — Assessment of the unusual attitude." },
          { code: "IR.IV.B.R6", category: "R", description: "Unusual Attitudes — Control input errors, inducing undesired aircraft attitudes." },
          { code: "IR.IV.B.R7", category: "R", description: "Unusual Attitudes — Control application solely by reference to instruments." },
          { code: "IR.IV.B.R8", category: "R", description: "Unusual Attitudes — Collision hazards." },
          { code: "IR.IV.B.R9", category: "R", description: "Unusual Attitudes — Distractions, task prioritization, loss of situational awareness, or disorientation." },
          { code: "IR.V.A.R1", category: "R", description: "Intercepting and Tracking — Management of automated navigation and autoflight systems." },
          { code: "IR.V.A.R2", category: "R", description: "Intercepting and Tracking — Distractions, task prioritization, loss of situational awareness, or disorientation." },
          { code: "IR.V.A.R3", category: "R", description: "Intercepting and Tracking — Limitations of the navigation system in use." },
          { code: "IR.V.B.R1", category: "R", description: "Departure En Route Arrival — ATC communications and compliance with published procedures." },
          { code: "IR.V.B.R2", category: "R", description: "Departure En Route Arrival — Limitations of traffic avoidance equipment." },
          { code: "IR.V.B.R3", category: "R", description: "Departure En Route Arrival — Responsibility to use see and avoid techniques when possible." },
          { code: "IR.VI.A.R1", category: "R", description: "Non-Precision Approach — Deviating from the assigned approach procedure." },
          { code: "IR.VI.A.R2", category: "R", description: "Non-Precision Approach — Selecting a navigation frequency." },
          { code: "IR.VI.A.R3", category: "R", description: "Non-Precision Approach — Management of automated navigation and autoflight systems." },
          { code: "IR.VI.A.R4", category: "R", description: "Non-Precision Approach — Aircraft configuration during an approach and missed approach." },
          { code: "IR.VI.A.R5", category: "R", description: "Non-Precision Approach — An unstable approach, including excessive descent rates." },
          { code: "IR.VI.A.R6", category: "R", description: "Non-Precision Approach — Deteriorating weather conditions on approach." },
          { code: "IR.VI.A.R7", category: "R", description: "Non-Precision Approach — Operating below the MDA without proper visual references." },
          { code: "IR.VI.B.R1", category: "R", description: "Precision Approach — Deviating from the assigned approach procedure." },
          { code: "IR.VI.B.R2", category: "R", description: "Precision Approach — Selecting a navigation frequency." },
          { code: "IR.VI.B.R3", category: "R", description: "Precision Approach — Management of automated navigation and autoflight systems." },
          { code: "IR.VI.B.R4", category: "R", description: "Precision Approach — Aircraft configuration during an approach and missed approach." },
          { code: "IR.VI.B.R5", category: "R", description: "Precision Approach — An unstable approach, including excessive descent rates." },
          { code: "IR.VI.B.R6", category: "R", description: "Precision Approach — Deteriorating weather conditions on approach." },
          { code: "IR.VI.B.R7", category: "R", description: "Precision Approach — Continuing to descend below DA/DH when required visual references are not visible." },
          { code: "IR.VI.C.R1", category: "R", description: "Missed Approach — Deviations from prescribed procedures or ATC instructions." },
          { code: "IR.VI.C.R2", category: "R", description: "Missed Approach — Holding, diverting, or electing to fly the approach again." },
          { code: "IR.VI.C.R3", category: "R", description: "Missed Approach — Aircraft configuration during an approach and missed approach." },
          { code: "IR.VI.C.R4", category: "R", description: "Missed Approach — Factors that might lead to executing a missed approach before the MAP or go-around below DA, DH, or MDA." },
          { code: "IR.VI.C.R5", category: "R", description: "Missed Approach — Management of automated navigation and autoflight systems." },
          { code: "IR.VI.D.R1", category: "R", description: "Circling Approach — Prescribed circling approach procedures." },
          { code: "IR.VI.D.R2", category: "R", description: "Circling Approach — Executing a circling approach at night or with marginal visibility." },
          { code: "IR.VI.D.R3", category: "R", description: "Circling Approach — Losing visual contact with an identifiable part of the airport." },
          { code: "IR.VI.D.R4", category: "R", description: "Circling Approach — Management of automated navigation and autoflight systems." },
          { code: "IR.VI.D.R5", category: "R", description: "Circling Approach — Management of altitude, airspeed, or distance while circling." },
          { code: "IR.VI.D.R6", category: "R", description: "Circling Approach — Low altitude maneuvering, including stall, spin, or CFIT." },
          { code: "IR.VI.D.R7", category: "R", description: "Circling Approach — Executing a missed approach after the MAP while circling." },
          { code: "IR.VI.E.R1", category: "R", description: "Landing from Instrument Approach — Attempting to land from an unstable approach." },
          { code: "IR.VI.E.R2", category: "R", description: "Landing from Instrument Approach — Flying below the glidepath." },
          { code: "IR.VI.E.R3", category: "R", description: "Landing from Instrument Approach — Transitioning from instrument to visual references for landing." },
          { code: "IR.VI.E.R4", category: "R", description: "Landing from Instrument Approach — Aircraft configuration for landing." },
          { code: "IR.VII.D.R1", category: "R", description: "Loss of Primary Flight Instruments — Use of secondary flight displays when primary displays have failed." },
          { code: "IR.VII.D.R2", category: "R", description: "Loss of Primary Flight Instruments — Maintaining aircraft control." },
          { code: "IR.VII.D.R3", category: "R", description: "Loss of Primary Flight Instruments — Distractions, task prioritization, loss of situational awareness, or disorientation." },
          { code: "IR.VIII.A.R1", category: "R", description: "Postflight — Performance and documentation of postflight inspection and aircraft discrepancies." }
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
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with conducting a preflight check on the aircraft's instruments necessary for an IFR flight.",
        stds: [
          { code: "IR.II.C.K1", category: "K", description: "Purpose of performing an instrument flight deck check and how to detect possible defects." },
          { code: "IR.II.C.K2", category: "K", description: "IFR airworthiness, including aircraft inspection requirements and required equipment for IFR flight." },
          { code: "IR.II.C.K3", category: "K", description: "Required procedures, documentation, and limitations of flying with inoperative equipment." },
          { code: "IR.II.C.R1", category: "R", description: "Operating with inoperative equipment." },
          { code: "IR.II.C.R2", category: "R", description: "Operating with outdated navigation publications or databases." },
          { code: "IR.II.C.S1", category: "S", description: "Perform preflight inspection by following the checklist appropriate to the aircraft and determine if the aircraft is in a condition for safe instrument flight." }
        ]
      }
    ]
  },
  {
    area: "III. Air Traffic Control (ATC) Clearances and Procedures",
    tasks: [
      {
        name: "Compliance with Air Traffic Control Clearances",
        code: "IR.III.A",
        references: "14 CFR part 91; AIM; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-15, FAA-H-8083-16, FAA-H-8083-25",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with ATC clearances and procedures while operating solely by reference to instruments.",
        stds: [
          { code: "IR.III.A.K1", category: "K", description: "Elements and procedures related to ATC clearances and pilot/controller responsibilities for departure, en route, and arrival phases of flight, including clearance void times." },
          { code: "IR.III.A.K2", category: "K", description: "Pilot-in-Command (PIC) emergency authority." },
          { code: "IR.III.A.K3", category: "K", description: "Lost communication procedures and procedures for flights outside of radar environments." },
          { code: "IR.III.A.R1", category: "R", description: "Less than full understanding of an ATC clearance." },
          { code: "IR.III.A.R2", category: "R", description: "Inappropriate, incomplete, or incorrect ATC clearances." },
          { code: "IR.III.A.R3", category: "R", description: "ATC clearance inconsistent with aircraft performance or navigation capability." },
          { code: "IR.III.A.R4", category: "R", description: "ATC clearance intended for other aircraft with similar call signs." },
          { code: "IR.III.A.S1", category: "S", description: "Correctly copy, read back, interpret, and comply with simulated or actual ATC clearances in a timely manner using standard phraseology as provided in the AIM." },
          { code: "IR.III.A.S2", category: "S", description: "Correctly set communication frequencies, navigation systems, and transponder codes in compliance with the ATC clearance." },
          { code: "IR.III.A.S3", category: "S", description: "Use the current and appropriate paper or electronic navigation publications." },
          { code: "IR.III.A.S4", category: "S", description: "Intercept all courses, radials, and bearings appropriate to the procedure, route, or clearance in a timely manner." },
          { code: "IR.III.A.S5", category: "S", description: "Maintain the applicable airspeed ±10 knots, headings ±10°, altitude ±100 feet; track a course, radial, or bearing within ¾-scale deflection of the CDI." },
          { code: "IR.III.A.S6", category: "S", description: "Use single-pilot resource management (SRM) or crew resource management (CRM), as appropriate." },
          { code: "IR.III.A.S7", category: "S", description: "Perform the appropriate checklist items relative to the phase of flight." }
        ]
      },
      {
        name: "Holding Procedures",
        code: "IR.III.B",
        references: "14 CFR part 91; AIM; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-15, FAA-H-8083-16, FAA-H-8083-25",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with holding procedures solely by reference to instruments.",
        stds: [
          { code: "IR.III.B.K1", category: "K", description: "Elements related to holding procedures, including reporting criteria, appropriate speeds, and recommended entry procedures for standard, nonstandard, published, and non-published holding patterns." },
          { code: "IR.III.B.R1", category: "R", description: "Recalculating fuel reserves if assigned an unanticipated expect further clearance (EFC) time." },
          { code: "IR.III.B.R2", category: "R", description: "Scenarios and circumstances that could result in minimum fuel or the need to declare an emergency." },
          { code: "IR.III.B.R3", category: "R", description: "Scenarios that could lead to holding, including deteriorating weather at the planned destination." },
          { code: "IR.III.B.R4", category: "R", description: "Holding entry and wind correction while holding." },
          { code: "IR.III.B.S1", category: "S", description: "Use an entry procedure appropriate for a standard, nonstandard, published, or non-published holding pattern." },
          { code: "IR.III.B.S2", category: "S", description: "Change to the holding airspeed appropriate for the altitude when 3 minutes or less from, but prior to arriving at, the holding fix and set appropriate power as needed for fuel conservation." },
          { code: "IR.III.B.S3", category: "S", description: "Recognize arrival at the holding fix and promptly initiate entry into the holding pattern." },
          { code: "IR.III.B.S3a", category: "S", description: "Comply with the holding pattern leg length and other restrictions, if applicable, associated with the holding pattern." },
          { code: "IR.III.B.S4", category: "S", description: "Maintain airspeed ±10 knots, altitude ±100 feet, selected headings within ±10°, and track a selected course, radial, or bearing within ¾-scale deflection of the CDI." },
          { code: "IR.III.B.S5", category: "S", description: "Use proper wind correction procedures to maintain the desired pattern and to arrive over the fix as close as possible to a specified time." },
          { code: "IR.III.B.S6", category: "S", description: "Use a multi-function display (MFD) and other graphical navigation displays, if installed, to monitor position in relation to the desired flightpath during holding." },
          { code: "IR.III.B.S7", category: "S", description: "Comply with ATC reporting requirements and restrictions associated with the holding pattern." },
          { code: "IR.III.B.S8", category: "S", description: "Use single-pilot resource management (SRM) or crew resource management (CRM), as appropriate." }
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
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with performing basic flight maneuvers solely by reference to instruments.",
        stds: [
          { code: "IR.IV.A.K1", category: "K", description: "Elements related to attitude instrument flying during straight-and-level flight, climbs, turns, and descents while conducting various instrument flight procedures." },
          { code: "IR.IV.A.K2", category: "K", description: "Interpretation, operation, and limitations of pitch, bank, and power instruments." },
          { code: "IR.IV.A.K3", category: "K", description: "Normal and abnormal instrument indications and operations." },
          { code: "IR.IV.A.R1", category: "R", description: "Situations that can affect physiology and degrade instrument cross-check." },
          { code: "IR.IV.A.R2", category: "R", description: "Spatial disorientation and optical illusions." },
          { code: "IR.IV.A.R3", category: "R", description: "Flying unfamiliar aircraft or operating with unfamiliar flight display systems and avionics." },
          { code: "IR.IV.A.S1", category: "S", description: "Maintain altitude ±100 feet during level flight, selected headings ±10°, airspeed ±10 knots, and bank angles ±5° during turns." },
          { code: "IR.IV.A.S2", category: "S", description: "Use proper instrument cross-check and interpretation, and apply the appropriate pitch, bank, power, and trim corrections when applicable." }
        ]
      },
      {
        name: "Recovery from Unusual Flight Attitudes",
        code: "IR.IV.B",
        references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-15, FAA-H-8083-25; POH/AFM",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with recovering from unusual flight attitudes solely by reference to instruments.",
        stds: [
          { code: "IR.IV.B.K1", category: "K", description: "Procedures for recovery from unusual attitudes in flight." },
          { code: "IR.IV.B.K2", category: "K", description: "Prevention of unusual attitudes, including flight causal, physiological, and environmental factors, and system and equipment failures." },
          { code: "IR.IV.B.K3", category: "K", description: "Procedures available to safely regain VMC after flight into inadvertent instrument meteorological conditions (IIMC/UIMC)." },
          { code: "IR.IV.B.K4", category: "K", description: "Appropriate use of automation, if applicable." },
          { code: "IR.IV.B.R1", category: "R", description: "Situations that could lead to loss of control in-flight (LOC-I) or unusual attitudes (e.g., stress, task saturation, inadequate instrument scan, spatial disorientation)." },
          { code: "IR.IV.B.R3", category: "R", description: "Operating envelope considerations." },
          { code: "IR.IV.B.R4", category: "R", description: "Interpreting flight instruments." },
          { code: "IR.IV.B.R5", category: "R", description: "Assessment of the unusual attitude." },
          { code: "IR.IV.B.R6", category: "R", description: "Control input errors, inducing undesired aircraft attitudes." },
          { code: "IR.IV.B.R7", category: "R", description: "Control application solely by reference to instruments." },
          { code: "IR.IV.B.R8", category: "R", description: "Collision hazards." },
          { code: "IR.IV.B.R9", category: "R", description: "Distractions, task prioritization, loss of situational awareness, or disorientation." },
          { code: "IR.IV.B.S1", category: "S", description: "Use proper instrument cross-check and interpretation to identify an unusual attitude (including both nose-high and nose-low) in flight, and apply the appropriate flight control, power input, and aircraft configuration in the correct sequence, to return to a stabilized level flight attitude." },
          { code: "IR.IV.B.S2", category: "S", description: "Use single-pilot resource management (SRM) or crew resource management (CRM), as appropriate." }
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
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with intercepting and tracking navigation aids and arcs solely by reference to instruments.",
        stds: [
          { code: "IR.V.A.K1", category: "K", description: "Ground-based navigation (orientation, course determination, equipment, tests, and regulations), including procedures for intercepting and tracking courses and arcs." },
          { code: "IR.V.A.K2", category: "K", description: "Satellite-based navigation (orientation, course determination, equipment, tests, regulations, interference, appropriate use of databases, RAIM, and WAAS), including procedures for intercepting and tracking courses and arcs." },
          { code: "IR.V.A.R1", category: "R", description: "Management of automated navigation and autoflight systems." },
          { code: "IR.V.A.R2", category: "R", description: "Distractions, task prioritization, loss of situational awareness, or disorientation." },
          { code: "IR.V.A.R3", category: "R", description: "Limitations of the navigation system in use." },
          { code: "IR.V.A.S1", category: "S", description: "Tune and identify the navigation facility or program the navigation system and verify system accuracy as appropriate for the equipment installed in the aircraft." },
          { code: "IR.V.A.S2", category: "S", description: "Determine aircraft position relative to the navigational facility or waypoint." },
          { code: "IR.V.A.S3", category: "S", description: "Set and orient to the course to be intercepted." },
          { code: "IR.V.A.S4", category: "S", description: "Intercept the specified course at appropriate angle, inbound to or outbound from a navigational facility or waypoint." },
          { code: "IR.V.A.S5", category: "S", description: "Maintain airspeed ±10 knots, altitude ±100 feet, and selected headings ±5°." },
          { code: "IR.V.A.S6", category: "S", description: "Apply proper correction to maintain a course, allowing no more than ¾-scale deflection of the CDI. If a DME arc is selected, maintain that arc ±1 nautical mile." },
          { code: "IR.V.A.S7", category: "S", description: "Recognize navigational system or facility failure, and when required, report the failure to ATC." },
          { code: "IR.V.A.S8", category: "S", description: "Use a multi-function display (MFD) and other graphical navigation displays, if installed, to monitor position, track wind drift, and to maintain situational awareness." },
          { code: "IR.V.A.S9", category: "S", description: "At the discretion of the evaluator, use the autopilot to make appropriate course intercepts, if installed." },
          { code: "IR.V.A.S10", category: "S", description: "Use single-pilot resource management (SRM) or crew resource management (CRM), as appropriate." }
        ]
      },
      {
        name: "Departure, En Route, and Arrival Operations",
        code: "IR.V.B",
        references: "14 CFR parts 91, 97; AC 90-100, AC 90-105, AC 91-74; AIM; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-15, FAA-H-8083-16, FAA-H-8083-25; POH/AFM",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with IFR departure, en route, and arrival operations solely by reference to instruments.",
        stds: [
          { code: "IR.V.B.K1", category: "K", description: "Elements related to ATC routes, including departure procedures (DPs) and associated climb gradients; standard terminal arrival (STAR) procedures and associated constraints." },
          { code: "IR.V.B.K2", category: "K", description: "Pilot and controller responsibilities, communication procedures, and ATC services available to pilots." },
          { code: "IR.V.B.R1", category: "R", description: "ATC communications and compliance with published procedures." },
          { code: "IR.V.B.R2", category: "R", description: "Limitations of traffic avoidance equipment." },
          { code: "IR.V.B.R3", category: "R", description: "Responsibility to use see and avoid techniques when possible." },
          { code: "IR.V.B.S1", category: "S", description: "Select, identify as necessary, and use the appropriate communication and navigation facilities associated with the proposed flight." },
          { code: "IR.V.B.S2", category: "S", description: "Perform the appropriate checklist items relative to the phase of flight." },
          { code: "IR.V.B.S3", category: "S", description: "Use the current and appropriate paper or electronic navigation publications." },
          { code: "IR.V.B.S4", category: "S", description: "Establish two-way communications with the proper controlling agency, use proper phraseology, and comply in a timely manner with all ATC instructions and airspace restrictions." },
          { code: "IR.V.B.S5", category: "S", description: "Intercept all courses, radials, and bearings appropriate to the procedure, route, or clearance in a timely manner." },
          { code: "IR.V.B.S6", category: "S", description: "Comply with all applicable charted procedures." },
          { code: "IR.V.B.S7", category: "S", description: "Maintain airspeed ±10 knots, altitude ±100 feet, and selected headings ±10°, and apply proper correction to maintain a course allowing no more than ¾-scale deflection of the CDI." },
          { code: "IR.V.B.S8", category: "S", description: "Update and interpret weather in flight." },
          { code: "IR.V.B.S9", category: "S", description: "Use displays of digital weather and aeronautical information, as applicable, to maintain situational awareness." },
          { code: "IR.V.B.S10", category: "S", description: "Use single-pilot resource management (SRM) or crew resource management (CRM), as appropriate." }
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
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with performing non-precision approach procedures solely by reference to instruments.",
        stds: [
          { code: "IR.VI.A.K1", category: "K", description: "Procedures and limitations associated with a non-precision approach, including the differences between Localizer Performance (LP) and Lateral Navigation (LNAV) approach guidance." },
          { code: "IR.VI.A.K2", category: "K", description: "Navigation system indications and annunciations expected during an area navigation (RNAV) approach." },
          { code: "IR.VI.A.K3", category: "K", description: "Ground-based and satellite-based navigation systems used for a non-precision approach." },
          { code: "IR.VI.A.K4", category: "K", description: "A stabilized approach, including energy management concepts." },
          { code: "IR.VI.A.R1", category: "R", description: "Deviating from the assigned approach procedure." },
          { code: "IR.VI.A.R2", category: "R", description: "Selecting a navigation frequency." },
          { code: "IR.VI.A.R3", category: "R", description: "Management of automated navigation and autoflight systems." },
          { code: "IR.VI.A.R4", category: "R", description: "Aircraft configuration during an approach and missed approach." },
          { code: "IR.VI.A.R5", category: "R", description: "An unstable approach, including excessive descent rates." },
          { code: "IR.VI.A.R6", category: "R", description: "Deteriorating weather conditions on approach." },
          { code: "IR.VI.A.R7", category: "R", description: "Operating below the minimum descent altitude (MDA) without proper visual references." },
          { code: "IR.VI.A.S1", category: "S", description: "Accomplish the non-precision instrument approaches selected by the evaluator." },
          { code: "IR.VI.A.S2", category: "S", description: "Establish two-way communications with ATC appropriate for the phase of flight or approach segment, and use proper communication phraseology." },
          { code: "IR.VI.A.S3", category: "S", description: "Select, tune, identify, and confirm the operational status of navigation equipment to be used for the approach." },
          { code: "IR.VI.A.S4", category: "S", description: "Comply with all clearances issued by ATC or the evaluator." },
          { code: "IR.VI.A.S5", category: "S", description: "Recognize if any flight instrumentation is inaccurate or inoperative, and take appropriate action." },
          { code: "IR.VI.A.S6", category: "S", description: "Advise ATC or the evaluator if unable to comply with a clearance." },
          { code: "IR.VI.A.S7", category: "S", description: "Complete the appropriate checklist(s)." },
          { code: "IR.VI.A.S8", category: "S", description: "Establish the appropriate aircraft configuration and airspeed considering meteorological and operating conditions." },
          { code: "IR.VI.A.S9", category: "S", description: "Maintain altitude ±100 feet, selected heading ±10°, airspeed ±10 knots, no more than ¾ scale CDI deflection, and accurately track radials, courses, or bearings, prior to beginning the final approach segment." },
          { code: "IR.VI.A.S10", category: "S", description: "Adjust the published MDA and visibility criteria for the aircraft approach category, as appropriate, for factors that include NOTAMs, inoperative aircraft or navigation equipment, or inoperative visual aids associated with the landing environment." },
          { code: "IR.VI.A.S11", category: "S", description: "Establish a stabilized descent to the appropriate altitude." },
          { code: "IR.VI.A.S12", category: "S", description: "For the final approach segment, maintain no more than ¾ scale CDI deflection, airspeed ±10 knots, and altitude above MDA +100/-0 feet to the VDP or MAP." },
          { code: "IR.VI.A.S13", category: "S", description: "Assess if the required visual references are available, and either initiate the missed approach procedure or continue for landing." },
          { code: "IR.VI.A.S14", category: "S", description: "Use a multi-function display (MFD) and other graphical navigation displays, if installed, to monitor position, track wind drift, and to maintain situational awareness." },
          { code: "IR.VI.A.S15", category: "S", description: "Use single-pilot resource management (SRM) or crew resource management (CRM), as appropriate." }
        ]
      },
      {
        name: "Precision Approach",
        code: "IR.VI.B",
        references: "14 CFR part 91; AC 90-105, AC 90-107; AIM; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-15, FAA-H-8083-16, FAA-H-8083-25; Terminal Procedures Publications",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with performing precision approach procedures solely by reference to instruments.",
        stds: [
          { code: "IR.VI.B.K1", category: "K", description: "Procedures and limitations associated with a precision approach, including determining required descent rates and adjusting minimums in the case of inoperative equipment." },
          { code: "IR.VI.B.K2", category: "K", description: "Navigation system displays, annunciations, and modes of operation." },
          { code: "IR.VI.B.K3", category: "K", description: "Ground-based and satellite-based navigation systems (orientation, course determination, equipment, tests and regulations, interference, appropriate use of navigation data, signal integrity)." },
          { code: "IR.VI.B.K4", category: "K", description: "A stabilized approach, including energy management concepts." },
          { code: "IR.VI.B.R1", category: "R", description: "Deviating from the assigned approach procedure." },
          { code: "IR.VI.B.R2", category: "R", description: "Selecting a navigation frequency." },
          { code: "IR.VI.B.R3", category: "R", description: "Management of automated navigation and autoflight systems." },
          { code: "IR.VI.B.R4", category: "R", description: "Aircraft configuration during an approach and missed approach." },
          { code: "IR.VI.B.R5", category: "R", description: "An unstable approach, including excessive descent rates." },
          { code: "IR.VI.B.R6", category: "R", description: "Deteriorating weather conditions on approach." },
          { code: "IR.VI.B.R7", category: "R", description: "Continuing to descend below the Decision Altitude (DA/DH) when the required visual references are not visible." },
          { code: "IR.VI.B.S1", category: "S", description: "Accomplish the precision instrument approach(es) selected by the evaluator." },
          { code: "IR.VI.B.S2", category: "S", description: "Establish two-way communications with ATC appropriate for the phase of flight or approach segment, and use proper communication phraseology." },
          { code: "IR.VI.B.S3", category: "S", description: "Select, tune, identify, and confirm the operational status of navigation equipment to be used for the approach." },
          { code: "IR.VI.B.S4", category: "S", description: "Comply with all clearances issued by ATC or the evaluator." },
          { code: "IR.VI.B.S5", category: "S", description: "Recognize if any flight instrumentation is inaccurate or inoperative, and take appropriate action." },
          { code: "IR.VI.B.S6", category: "S", description: "Advise ATC or the evaluator if unable to comply with a clearance." },
          { code: "IR.VI.B.S7", category: "S", description: "Complete the appropriate checklist(s)." },
          { code: "IR.VI.B.S8", category: "S", description: "Establish the appropriate aircraft configuration and airspeed considering meteorological and operating conditions." },
          { code: "IR.VI.B.S9", category: "S", description: "Maintain altitude ±100 feet, selected heading ±10°, airspeed ±10 knots, no more than ¾ scale CDI deflection, and accurately track radials, courses, or bearings, prior to beginning the final approach segment." },
          { code: "IR.VI.B.S10", category: "S", description: "Adjust the published DA/DH and visibility criteria for the aircraft approach category, as appropriate, to account for NOTAMS, inoperative aircraft or navigation equipment, or inoperative visual aids associated with the landing environment." },
          { code: "IR.VI.B.S11", category: "S", description: "Establish a predetermined rate of descent at the point where vertical guidance begins, which approximates that required for the aircraft to follow the vertical guidance." },
          { code: "IR.VI.B.S12", category: "S", description: "Maintain a stabilized final approach from the FAF to DA/DH allowing no more than ¾-scale deflection of either the vertical or lateral guidance indications, and maintain the desired airspeed ±10 knots." },
          { code: "IR.VI.B.S13", category: "S", description: "Immediately initiate the missed approach procedure when at the DA/DH, and the required visual references for the runway are not unmistakably visible and identifiable." },
          { code: "IR.VI.B.S14", category: "S", description: "Transition to a normal landing approach only when the airplane is in a position from which a descent to a landing on the runway can be made at a normal rate of descent using normal maneuvering." },
          { code: "IR.VI.B.S15", category: "S", description: "Maintain a stabilized visual flight path from the DA/DH to the runway aiming point where a normal landing may be accomplished within the touchdown zone." },
          { code: "IR.VI.B.S16", category: "S", description: "Use a multi-function display (MFD) and other graphical navigation displays, if installed, to monitor position, track wind drift, and to maintain situational awareness." },
          { code: "IR.VI.B.S17", category: "S", description: "Use single-pilot resource management (SRM) or crew resource management (CRM), as appropriate." }
        ]
      },
      {
        name: "Missed Approach",
        code: "IR.VI.C",
        references: "14 CFR parts 91, 97; AIM; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-15, FAA-H-8083-16, FAA-H-8083-25; Terminal Procedures Publications",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with performing a missed approach procedure solely by reference to instruments.",
        stds: [
          { code: "IR.VI.C.K1", category: "K", description: "Elements related to missed approach procedures and limitations associated with standard instrument approaches, including while using a flight management system (FMS) or autopilot, if equipped." },
          { code: "IR.VI.C.R1", category: "R", description: "Deviations from prescribed procedures or ATC instructions." },
          { code: "IR.VI.C.R2", category: "R", description: "Holding, diverting, or electing to fly the approach again." },
          { code: "IR.VI.C.R3", category: "R", description: "Aircraft configuration during an approach and missed approach." },
          { code: "IR.VI.C.R4", category: "R", description: "Factors that might lead to executing a missed approach before the MAP or to a go-around below DA, DH, or MDA, as applicable." },
          { code: "IR.VI.C.R5", category: "R", description: "Management of automated navigation and autoflight systems." },
          { code: "IR.VI.C.S1", category: "S", description: "Promptly initiate the missed approach procedure and report it to ATC." },
          { code: "IR.VI.C.S2", category: "S", description: "Apply the appropriate power setting for the flight condition and establish a pitch attitude necessary to obtain the desired performance." },
          { code: "IR.VI.C.S3", category: "S", description: "Configure the airplane in accordance with airplane manufacturer's instructions, establish a positive rate of climb, and accelerate to the appropriate airspeed ±10 knots." },
          { code: "IR.VI.C.S4", category: "S", description: "Follow the recommended checklist items appropriate to the missed approach and go-around procedure." },
          { code: "IR.VI.C.S5", category: "S", description: "Comply with the published or alternate missed approach procedure." },
          { code: "IR.VI.C.S6", category: "S", description: "Advise ATC or the evaluator if unable to comply with a clearance, restriction, or climb gradient." },
          { code: "IR.VI.C.S7", category: "S", description: "Maintain the recommended airspeed ±10 knots; heading, course, or bearing ±10°; and altitude(s) ±100 feet during the missed approach procedure." },
          { code: "IR.VI.C.S8", category: "S", description: "Use an MFD and other graphical navigation displays, if installed, to monitor position and track to help navigate the missed approach." },
          { code: "IR.VI.C.S9", category: "S", description: "Use single-pilot resource management (SRM) or crew resource management (CRM), as appropriate." },
          { code: "IR.VI.C.S10", category: "S", description: "Request ATC clearance to attempt another approach, proceed to the alternate airport, holding fix, or other clearance limit, as appropriate, or as directed by the evaluator." }
        ]
      },
      {
        name: "Circling Approach",
        code: "IR.VI.D",
        references: "14 CFR parts 91, 97; AIM; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-15, FAA-H-8083-16, FAA-H-8083-25; Terminal Procedures Publications",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with performing a circling approach procedure.",
        stds: [
          { code: "IR.VI.D.K1", category: "K", description: "Elements related to circling approach procedures and limitations, including approach categories and related airspeed restrictions." },
          { code: "IR.VI.D.R1", category: "R", description: "Prescribed circling approach procedures." },
          { code: "IR.VI.D.R2", category: "R", description: "Executing a circling approach at night or with marginal visibility." },
          { code: "IR.VI.D.R3", category: "R", description: "Losing visual contact with an identifiable part of the airport." },
          { code: "IR.VI.D.R4", category: "R", description: "Management of automated navigation and autoflight systems." },
          { code: "IR.VI.D.R5", category: "R", description: "Management of altitude, airspeed, or distance while circling." },
          { code: "IR.VI.D.R6", category: "R", description: "Low altitude maneuvering, including stall, spin, or controlled flight into terrain (CFIT)." },
          { code: "IR.VI.D.R7", category: "R", description: "Executing a missed approach after the MAP while circling." },
          { code: "IR.VI.D.S1", category: "S", description: "Comply with the circling approach procedure considering turbulence, windshear, and the maneuvering capability and approach category of the aircraft." },
          { code: "IR.VI.D.S2", category: "S", description: "Confirm the direction of traffic and adhere to all restrictions and instructions issued by ATC or the evaluator." },
          { code: "IR.VI.D.S3", category: "S", description: "Use single-pilot resource management (SRM) or crew resource management (CRM), as appropriate." },
          { code: "IR.VI.D.S4", category: "S", description: "Establish the approach and landing configuration. Maintain a stabilized approach and a descent rate that ensures arrival at the MDA prior to the missed approach point." },
          { code: "IR.VI.D.S5", category: "S", description: "Maintain airspeed ±10 knots, desired heading/track ±10°, and altitude +100/-0 feet until descending below the MDA or the preselected circling altitude above the MDA." },
          { code: "IR.VI.D.S6", category: "S", description: "Visually maneuver to a base or downwind leg appropriate for the landing runway and environmental conditions." },
          { code: "IR.VI.D.S7", category: "S", description: "If a missed approach occurs, turn in the appropriate direction using the correct procedure and appropriately configure the airplane." },
          { code: "IR.VI.D.S8", category: "S", description: "If landing, initiate a stabilized descent. Touch down on the first one-third of the selected runway without excessive maneuvering, without exceeding the normal operating limits of the airplane, and without exceeding 30° of bank." }
        ]
      },
      {
        name: "Landing from an Instrument Approach",
        code: "IR.VI.E",
        references: "14 CFR part 91; AIM; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-15, FAA-H-8083-16, FAA-H-8083-25; POH/AFM",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with performing procedures for a landing from an instrument approach.",
        stds: [
          { code: "IR.VI.E.K1", category: "K", description: "Elements related to the pilot's responsibilities, and the environmental, operational, and meteorological factors that affect landing from a straight-in or circling approach." },
          { code: "IR.VI.E.K2", category: "K", description: "Airport signs, markings, and lighting, including approach lighting systems." },
          { code: "IR.VI.E.K3", category: "K", description: "Appropriate landing profiles and aircraft configurations." },
          { code: "IR.VI.E.R1", category: "R", description: "Attempting to land from an unstable approach." },
          { code: "IR.VI.E.R2", category: "R", description: "Flying below the glidepath." },
          { code: "IR.VI.E.R3", category: "R", description: "Transitioning from instrument to visual references for landing." },
          { code: "IR.VI.E.R4", category: "R", description: "Aircraft configuration for landing." },
          { code: "IR.VI.E.S1", category: "S", description: "Transition at the DA/DH, MDA, or visual descent point (VDP) to a visual flight condition, allowing for safe visual maneuvering and a normal landing." },
          { code: "IR.VI.E.S2", category: "S", description: "Adhere to all ATC or evaluator advisories, such as NOTAMs, windshear, wake turbulence, runway surface, and other operational considerations." },
          { code: "IR.VI.E.S3", category: "S", description: "Complete the appropriate checklist(s)." },
          { code: "IR.VI.E.S4", category: "S", description: "Maintain positive airplane control throughout the landing maneuver." },
          { code: "IR.VI.E.S5", category: "S", description: "Use single-pilot resource management (SRM) or crew resource management (CRM), as appropriate." }
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
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with loss of communications while operating solely by reference to instruments.",
        stds: [
          { code: "IR.VII.A.K1", category: "K", description: "Procedures to follow in the event of lost communication during various phases of flight, including techniques for reestablishing communications, when it is acceptable to deviate from an IFR clearance, and when to begin an approach at the destination." },
          { code: "IR.VII.A.R1", category: "R", description: "Possible reasons for loss of communication." },
          { code: "IR.VII.A.R2", category: "R", description: "Deviation from procedures for lost communications." },
          { code: "IR.VII.A.S1", category: "S", description: "Recognize a simulated loss of communication." },
          { code: "IR.VII.A.S2", category: "S", description: "Simulate actions to re-establish communication." },
          { code: "IR.VII.A.S3", category: "S", description: "Determine whether to continue to flight plan destination or deviate." },
          { code: "IR.VII.A.S4", category: "S", description: "Determine appropriate time to begin an approach." },
          { code: "IR.VII.A.S5", category: "S", description: "Use single-pilot resource management (SRM) or crew resource management (CRM), as appropriate." }
        ]
      },
      {
        name: "Approach with Loss of Primary Flight Instrument Indicators",
        code: "IR.VII.D",
        references: "14 CFR part 91; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-15, FAA-H-8083-16, FAA-H-8083-25; POH/AFM; Terminal Procedures Publications",
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with performing an approach solely by reference to instruments with the loss of primary flight control instruments.",
        stds: [
          { code: "IR.VII.D.K1", category: "K", description: "Recognizing if primary flight instruments are inaccurate or inoperative, and advising ATC or the evaluator." },
          { code: "IR.VII.D.K2", category: "K", description: "Possible failure modes of primary instruments and how to correct or minimize the effect of the loss." },
          { code: "IR.VII.D.R1", category: "R", description: "Use of secondary flight displays when primary displays have failed." },
          { code: "IR.VII.D.R2", category: "R", description: "Maintaining aircraft control." },
          { code: "IR.VII.D.R3", category: "R", description: "Distractions, task prioritization, loss of situational awareness, or disorientation." },
          { code: "IR.VII.D.S1", category: "S", description: "Advise ATC or the evaluator if unable to comply with a clearance." },
          { code: "IR.VII.D.S2", category: "S", description: "Complete a non-precision instrument approach without the use of the primary flight instruments using the skill elements of the non-precision approach Task (see Area of Operation VI, Task A)." },
          { code: "IR.VII.D.S3", category: "S", description: "Use single-pilot resource management (SRM) or crew resource management (CRM), as appropriate." }
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
        objective: "To determine the applicant exhibits satisfactory knowledge, risk management, and skills associated with checking flight instruments and equipment during postflight.",
        stds: [
          { code: "IR.VIII.A.K1", category: "K", description: "Procedures for documenting in-flight and postflight discrepancies." },
          { code: "IR.VIII.A.R1", category: "R", description: "Performance and documentation of postflight inspection and aircraft discrepancies." },
          { code: "IR.VIII.A.S1", category: "S", description: "Conduct a postflight inspection and document discrepancies and servicing requirements, if any." }
        ]
      }
    ]
  }
];