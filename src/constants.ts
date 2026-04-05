import { ACSArea } from './types';

export const ALL_ACS: Record<string, ACSArea[]> = {
  ppl: [
    { area: "I. Preflight Preparation", tasks: ["A. Pilot Qualifications","B. Airworthiness Requirements","C. Weather Information","D. Cross-Country Flight Planning","E. National Airspace System","F. Performance and Limitations","G. Operation of Systems","H. Human Factors","I. Water and Seaplane Characteristics (N/A — ASEL)"] },
    { area: "II. Preflight Procedures", tasks: ["A. Preflight Assessment","B. Flight Deck Management","C. Engine Starting","D. Taxiing (ASEL)","E. Before Takeoff Check"] },
    { area: "III. Airport and Seaplane Base Operations", tasks: ["A. Communications","B. Traffic Patterns","C. Airport Markings / Signs / Lighting"] },
    { area: "IV. Takeoffs, Landings, and Go-Arounds", tasks: ["A. Normal Takeoff and Climb","B. Normal Approach and Landing","C. Soft-Field Takeoff and Climb","D. Soft-Field Approach and Landing","E. Short-Field Takeoff and Maximum Performance Climb","F. Short-Field Approach and Landing","G. Forward Slip to a Landing","H. Go-Around / Rejected Landing"] },
    { area: "V. Performance and Ground Reference Maneuvers", tasks: ["A. Steep Turns","B. Ground Reference Maneuvers"] },
    { area: "VI. Navigation", tasks: ["A. Pilotage and Dead Reckoning","B. Navigation Systems and Radar Services","C. Diversion","D. Lost Procedures"] },
    { area: "VII. Slow Flight and Stalls", tasks: ["A. Maneuvering During Slow Flight","B. Power-Off Stalls","C. Power-On Stalls","D. Spin Awareness"] },
    { area: "VIII. Basic Instrument Maneuvers", tasks: ["A. Straight-and-Level Flight","B. Constant Airspeed Climbs","C. Constant Airspeed Descents","D. Turns to Headings","E. Recovery from Unusual Flight Attitudes","F. Radio Communications / Navigation Systems / Radar Services"] },
    { area: "IX. Emergency Operations", tasks: ["A. Emergency Descent","B. Emergency Approach and Landing (Simulated)","C. Systems and Equipment Malfunctions","D. Emergency Equipment and Survival Gear"] },
    { area: "X. Multiengine Operations (N/A — ASEL)", tasks: [] },
    { area: "XI. Night Operations", tasks: ["A. Night Preparation"] },
    { area: "XII. Postflight Procedures", tasks: ["A. After Landing, Parking, and Securing"] },
  ],
  ir: [
    { area: "I. Preflight Preparation", tasks: ["A. Pilot Qualifications", "B. Weather Information", "C. Cross-Country Flight Planning"] },
    { area: "II. Preflight Procedures", tasks: ["A. Instrument Flight Deck Check"] },
    { area: "III. Air Traffic Control Clearances and Procedures", tasks: ["A. ATC Clearances", "B. Compliance with Departure, En Route, and Arrival Procedures and Clearances", "C. Holding Procedures"] },
    { area: "IV. Flight by Reference to Instruments", tasks: ["A. Basic Instrument Flight Maneuvers", "B. Unusual Attitude Recoveries"] },
    { area: "V. Navigation Systems", tasks: ["A. Intercepting and Tracking Navigational Systems and DME Arcs"] },
    { area: "VI. Instrument Approach Procedures", tasks: ["A. Non-precision Approach", "B. Precision Approach", "C. Missed Approach", "D. Circling Approach", "E. Landing from an Instrument Approach"] },
    { area: "VII. Emergency Operations", tasks: ["A. Loss of Communications", "B. One Engine Inoperative (Multiengine)", "C. Instrument Approach with One Engine Inoperative (Multiengine)", "D. Loss of Primary Flight Instrument Indicator"] },
    { area: "VIII. Postflight Procedures", tasks: ["A. Checking Instruments and Equipment"] }
  ],
  cpl: [
    { area: "I. Preflight Preparation", tasks: ["A. Pilot Qualifications", "B. Airworthiness Requirements", "C. Weather Information", "D. Performance and Limitations", "E. Operation of Systems", "F. Human Factors"] },
    { area: "II. Preflight Procedures", tasks: ["A. Preflight Assessment", "B. Flight Deck Management", "C. Engine Starting", "D. Taxiing", "E. Before Takeoff Check"] },
    { area: "III. Airport and Seaplane Base Operations", tasks: ["A. Communications", "B. Traffic Patterns", "C. Airport Markings / Signs / Lighting"] },
    { area: "IV. Takeoffs, Landings, and Go-Arounds", tasks: ["A. Normal Takeoff and Climb", "B. Normal Approach and Landing", "C. Soft-Field Takeoff and Climb", "D. Soft-Field Approach and Landing", "E. Short-Field Takeoff and Maximum Performance Climb", "F. Short-Field Approach and Landing", "G. Power-Off 180° Accuracy Approach and Landing", "H. Forward Slip to a Landing", "I. Go-Around / Rejected Landing"] },
    { area: "V. Performance Maneuvers", tasks: ["A. Steep Turns", "B. Steep Spirals", "C. Chandelles", "D. Lazy Eights"] },
    { area: "VI. Ground Reference Maneuvers", tasks: ["A. Eights on Pylons"] },
    { area: "VII. Navigation", tasks: ["A. Pilotage and Dead Reckoning", "B. Navigation Systems and Radar Services", "C. Diversion", "D. Lost Procedures"] },
    { area: "VIII. Slow Flight and Stalls", tasks: ["A. Maneuvering During Slow Flight", "B. Power-Off Stalls", "C. Power-On Stalls", "D. Accelerated Stalls", "E. Spin Awareness"] },
    { area: "IX. High Altitude Operations", tasks: ["A. Supplemental Oxygen", "B. Pressurization"] },
    { area: "X. Emergency Operations", tasks: ["A. Emergency Descent", "B. Emergency Approach and Landing (Simulated)", "C. Systems and Equipment Malfunctions", "D. Emergency Equipment and Survival Gear"] },
    { area: "XI. Postflight Procedures", tasks: ["A. After Landing, Parking, and Securing"] }
  ],
  cfi: [
    { area: "I. Fundamentals of Instructing", tasks: ["A. Learning Process", "B. Human Behavior and Effective Communication", "C. The Teaching Process", "D. Teaching Methods", "E. Critique and Evaluation", "F. Flight Instructor Characteristics and Responsibilities", "G. Planning Instructional Activity"] },
    { area: "II. Technical Subject Areas", tasks: ["A. Aeromedical Factors", "B. Visual Scanning and Collision Avoidance", "C. Principles of Flight", "D. Airplane Flight Controls", "E. Airplane Systems", "F. Magnetic Compass", "G. Navigation and Flight Planning", "H. Night Operations", "I. High Altitude Operations", "J. Federal Aviation Regulations and Publications", "K. Publications", "L. Logbook Entries and Certificate Endorsements"] },
    { area: "III. Preflight Preparation", tasks: ["A. Certificates and Documents", "B. Weather Information", "C. Operation of Systems", "D. Performance and Limitations", "E. Airworthiness Requirements"] },
    { area: "IV. Preflight Lesson on a Maneuver to be Performed in Flight", tasks: ["A. Maneuver Lesson"] },
    { area: "V. Preflight Procedures", tasks: ["A. Preflight Assessment", "B. Flight Deck Management", "C. Engine Starting", "D. Taxiing", "E. Before Takeoff Check"] },
    { area: "VI. Airport and Seaplane Base Operations", tasks: ["A. Communications", "B. Traffic Patterns", "C. Airport Markings / Signs / Lighting"] },
    { area: "VII. Takeoffs, Landings, and Go-Arounds", tasks: ["A. Normal Takeoff and Climb", "B. Normal Approach and Landing", "C. Soft-Field Takeoff and Climb", "D. Soft-Field Approach and Landing", "E. Short-Field Takeoff and Maximum Performance Climb", "F. Short-Field Approach and Landing", "G. Power-Off 180° Accuracy Approach and Landing", "H. Forward Slip to a Landing", "I. Go-Around / Rejected Landing"] },
    { area: "VIII. Fundamentals of Flight", tasks: ["A. Straight-and-Level Flight", "B. Level Turns", "C. Climbs and Climbing Turns", "D. Descents and Descending Turns"] },
    { area: "IX. Performance Maneuvers", tasks: ["A. Steep Turns", "B. Steep Spirals", "C. Chandelles", "D. Lazy Eights"] },
    { area: "X. Ground Reference Maneuvers", tasks: ["A. Rectangular Course", "B. S-Turns across a Road", "C. Turns Around a Point", "D. Eights on Pylons"] },
    { area: "XI. Slow Flight, Stalls, and Spins", tasks: ["A. Maneuvering During Slow Flight", "B. Power-Off Stalls", "C. Power-On Stalls", "D. Accelerated Stalls", "E. Crossed-control Stalls", "F. Elevator Trim Stalls", "G. Secondary Stalls", "H. Spin Awareness"] },
    { area: "XII. Basic Instrument Maneuvers", tasks: ["A. Straight-and-Level Flight", "B. Constant Airspeed Climbs", "C. Constant Airspeed Descents", "D. Turns to Headings", "E. Recovery from Unusual Flight Attitudes"] },
    { area: "XIII. Emergency Operations", tasks: ["A. Emergency Descent", "B. Emergency Approach and Landing (Simulated)", "C. Systems and Equipment Malfunctions", "D. Emergency Equipment and Survival Gear"] },
    { area: "XIV. Postflight Procedures", tasks: ["A. After Landing, Parking, and Securing"] }
  ],
  cfii: [
    { area: "I. Fundamentals of Instructing", tasks: ["A. Learning Process", "B. Human Behavior and Effective Communication", "C. The Teaching Process", "D. Teaching Methods", "E. Critique and Evaluation", "F. Flight Instructor Characteristics and Responsibilities", "G. Planning Instructional Activity"] },
    { area: "II. Technical Subject Areas", tasks: ["A. Instrument Flight Deck Check", "B. ATC Clearances", "C. Compliance with Departure, En Route, and Arrival Procedures and Clearances", "D. Holding Procedures", "E. Intercepting and Tracking Navigational Systems and DME Arcs", "F. Non-precision Approach", "G. Precision Approach", "H. Missed Approach", "I. Circling Approach", "J. Landing from an Instrument Approach", "K. Loss of Communications", "L. Loss of Primary Flight Instrument Indicator"] }
  ],
  mei: [
    { area: "I. Preflight Preparation", tasks: ["A. Pilot Qualifications", "B. Airworthiness Requirements", "C. Weather Information", "D. Performance and Limitations", "E. Operation of Systems", "F. Multiengine Aerodynamics", "G. Multiengine Systems and Emergencies", "H. Vmc Demonstration Theory"] },
    { area: "II. Preflight Procedures", tasks: ["A. Preflight Assessment", "B. Flight Deck Management", "C. Engine Starting", "D. Taxiing", "E. Before Takeoff Check"] },
    { area: "III. Airport and Seaplane Base Operations", tasks: ["A. Communications", "B. Traffic Patterns", "C. Airport Markings / Signs / Lighting"] },
    { area: "IV. Takeoffs, Landings, and Go-Arounds", tasks: ["A. Normal Takeoff and Climb", "B. Normal Approach and Landing", "C. Short-Field Takeoff and Maximum Performance Climb", "D. Short-Field Approach and Landing", "E. Go-Around / Rejected Landing"] },
    { area: "V. Multiengine Operations", tasks: ["A. Maneuvering with One Engine Inoperative", "B. Vmc Demonstration", "C. Engine Failure During Takeoff Before Vmc", "D. Engine Failure After Liftoff", "E. Approach and Landing with One Engine Inoperative"] },
    { area: "VI. Emergency Operations", tasks: ["A. Systems and Equipment Malfunctions", "B. Emergency Equipment and Survival Gear"] },
    { area: "VII. Postflight Procedures", tasks: ["A. After Landing, Parking, and Securing"] }
  ]
};

export const ACS_ELEMENTS: Record<string, string[]> = {
  'A. Preflight Assessment': [],
  'B. Flight Deck Management': [],
  'C. Engine Starting': [],
  'D. Taxiing (ASEL)': [
    'Safe taxi speed; correct aileron/elevator deflection for wind',
    'Comply with all hold short instructions',
  ],
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
  // IR Specific
  'A. Instrument Flight Deck Check': ['Check all instruments for proper operation during taxi'],
  'A. ATC Clearances': ['Correctly copy and read back clearances'],
  'C. Holding Procedures': ['Correct entry, timing, and wind correction'],
  'A. Non-precision Approach': ['Altitude ±100 ft, Heading ±10°, Course ±¾ scale'],
  'B. Precision Approach': ['Course and Glidepath ±¾ scale'],
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

