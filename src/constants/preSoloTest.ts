export const PRE_SOLO_TEST_QUESTIONS = [

  // ============================================
  // SECTION 1 — APPLICABLE FARS (5 questions)
  // ============================================
  {
    id: 1,
    section: 'Section 1 — Applicable Federal Aviation Regulations',
    question: 'What is the minimum age to be eligible for a student pilot certificate?',
    options: {
      A: '14 years old',
      B: '15 years old',
      C: '16 years old',
      D: '17 years old'
    },
    correct: 'C',
    reference: '14 CFR §61.83'
  },
  {
    id: 2,
    section: 'Section 1 — Applicable Federal Aviation Regulations',
    question: 'A student pilot must have which of the following to conduct a solo flight?',
    options: {
      A: 'A valid student pilot certificate only',
      B: 'A valid student pilot certificate and a current medical certificate',
      C: 'A logbook endorsement from any certificated pilot',
      D: 'A valid student pilot certificate and a private pilot written test score'
    },
    correct: 'B',
    reference: '14 CFR §61.87(a)'
  },
  {
    id: 3,
    section: 'Section 1 — Applicable Federal Aviation Regulations',
    question: 'A student pilot certificate is valid for how long?',
    options: {
      A: '12 calendar months',
      B: '24 calendar months',
      C: '36 calendar months',
      D: '60 calendar months'
    },
    correct: 'D',
    reference: '14 CFR §61.89'
  },
  {
    id: 4,
    section: 'Section 1 — Applicable Federal Aviation Regulations',
    question: 'Which of the following is a limitation for student pilots?',
    options: {
      A: 'Student pilots may not fly at night under any circumstances',
      B: 'Student pilots may not carry passengers',
      C: 'Student pilots may not fly cross country flights',
      D: 'Student pilots may not fly in Class G airspace'
    },
    correct: 'B',
    reference: '14 CFR §61.89(a)'
  },
  {
    id: 5,
    section: 'Section 1 — Applicable Federal Aviation Regulations',
    question: 'When must a student pilot have their logbook available during a solo flight?',
    options: {
      A: 'Only when flying cross country',
      B: 'At all times during solo flight',
      C: 'Only when flying at night',
      D: 'Only when requested by ATC'
    },
    correct: 'B',
    reference: '14 CFR §61.51(i)'
  },

  // ============================================
  // SECTION 2 — AIRSPACE (5 questions)
  // ============================================
  {
    id: 6,
    section: 'Section 2 — Airspace Rules and Procedures',
    question: 'What are the VFR weather minimums in Class G airspace below 1200 feet AGL during the day?',
    options: {
      A: '3 statute miles visibility and 1000-500-2000 cloud clearance',
      B: '1 statute mile visibility and clear of clouds',
      C: '3 statute miles visibility and clear of clouds',
      D: '1 statute mile visibility and 500-1000-2000 cloud clearance'
    },
    correct: 'B',
    reference: '14 CFR §91.155'
  },
  {
    id: 7,
    section: 'Section 2 — Airspace Rules and Procedures',
    question: 'What equipment is required to operate in Class C airspace?',
    options: {
      A: 'Two-way radio and Mode C transponder',
      B: 'Two-way radio only',
      C: 'Mode C transponder only',
      D: 'Two-way radio, Mode C transponder, and GPS'
    },
    correct: 'A',
    reference: '14 CFR §91.130'
  },
  {
    id: 8,
    section: 'Section 2 — Airspace Rules and Procedures',
    question: 'What does a student pilot need to fly solo in Class B airspace?',
    options: {
      A: 'No special requirements beyond solo endorsement',
      B: 'A specific endorsement from their CFI for Class B operations',
      C: 'A private pilot certificate',
      D: 'ATC permission only'
    },
    correct: 'B',
    reference: '14 CFR §61.95'
  },
  {
    id: 9,
    section: 'Section 2 — Airspace Rules and Procedures',
    question: 'What are the visibility and cloud clearance requirements for Class E airspace above 1200 feet AGL during the day?',
    options: {
      A: '1 statute mile and clear of clouds',
      B: '3 statute miles and 500 below 1000 above 2000 horizontal',
      C: '5 statute miles and 1000 below 1000 above 1 mile horizontal',
      D: '3 statute miles and 1000 below 1000 above 1 mile horizontal'
    },
    correct: 'B',
    reference: '14 CFR §91.155'
  },
  {
    id: 10,
    section: 'Section 2 — Airspace Rules and Procedures',
    question: 'When approaching an uncontrolled airport with a standard traffic pattern, which direction is the traffic pattern flown?',
    options: {
      A: 'Right traffic unless otherwise indicated',
      B: 'Left traffic unless otherwise indicated',
      C: 'Either direction at pilot discretion',
      D: 'Determined by wind direction only'
    },
    correct: 'B',
    reference: 'AIM 4-3-3'
  },

  // ============================================
  // SECTION 3 — AIRCRAFT SYSTEMS (5 questions)
  // ============================================
  {
    id: 11,
    section: 'Section 3 — Aircraft Systems',
    question: 'What is the purpose of carburetor heat?',
    options: {
      A: 'To increase engine power during takeoff',
      B: 'To prevent or eliminate carburetor ice',
      C: 'To cool the carburetor during cruise flight',
      D: 'To improve fuel efficiency'
    },
    correct: 'B',
    reference: 'FAA-H-8083-25 Chapter 7'
  },
  {
    id: 12,
    section: 'Section 3 — Aircraft Systems',
    question: 'If the oil pressure gauge shows low oil pressure in flight, what should the pilot do?',
    options: {
      A: 'Continue to the destination and check oil on arrival',
      B: 'Increase engine RPM to build pressure',
      C: 'Land at the nearest suitable airport as soon as practical',
      D: 'Reduce power and monitor for the remainder of the flight'
    },
    correct: 'C',
    reference: 'FAA-H-8083-25 Chapter 7'
  },
  {
    id: 13,
    section: 'Section 3 — Aircraft Systems',
    question: 'What color is aviation gasoline AVGAS 100LL?',
    options: {
      A: 'Red',
      B: 'Green',
      C: 'Blue',
      D: 'Colorless'
    },
    correct: 'C',
    reference: 'FAA-H-8083-25 Chapter 7'
  },
  {
    id: 14,
    section: 'Section 3 — Aircraft Systems',
    question: 'What does the alternator do in a light aircraft electrical system?',
    options: {
      A: 'Starts the engine',
      B: 'Provides electrical power and charges the battery during flight',
      C: 'Controls the magnetos',
      D: 'Powers only the avionics'
    },
    correct: 'B',
    reference: 'FAA-H-8083-25 Chapter 7'
  },
  {
    id: 15,
    section: 'Section 3 — Aircraft Systems',
    question: 'During a magneto check at runup, a drop of more than how many RPM on one magneto indicates a problem?',
    options: {
      A: '50 RPM',
      B: '100 RPM',
      C: '125 RPM',
      D: '175 RPM'
    },
    correct: 'C',
    reference: 'POH/AFM — General Aircraft Operations'
  },

  // ============================================
  // SECTION 4 — AIRCRAFT PERFORMANCE (5 questions)
  // ============================================
  {
    id: 16,
    section: 'Section 4 — Aircraft Performance and Weight and Balance',
    question: 'What effect does high density altitude have on aircraft performance?',
    options: {
      A: 'Increased engine power and shorter takeoff roll',
      B: 'Decreased engine power and longer takeoff roll',
      C: 'No effect on performance',
      D: 'Increased lift and shorter takeoff roll'
    },
    correct: 'B',
    reference: 'FAA-H-8083-25 Chapter 11'
  },
  {
    id: 17,
    section: 'Section 4 — Aircraft Performance and Weight and Balance',
    question: 'What is the definition of Vso?',
    options: {
      A: 'Stall speed in clean configuration',
      B: 'Maximum flap extended speed',
      C: 'Stall speed in landing configuration',
      D: 'Best angle of climb speed'
    },
    correct: 'C',
    reference: 'FAA-H-8083-25 Chapter 11'
  },
  {
    id: 18,
    section: 'Section 4 — Aircraft Performance and Weight and Balance',
    question: 'What is the purpose of calculating weight and balance before flight?',
    options: {
      A: 'To comply with ATC requirements',
      B: 'To ensure the aircraft is within its certified weight and CG limits for safe flight',
      C: 'To determine fuel burn only',
      D: 'Only required for cross country flights'
    },
    correct: 'B',
    reference: 'FAA-H-8083-1'
  },
  {
    id: 19,
    section: 'Section 4 — Aircraft Performance and Weight and Balance',
    question: 'What is Vx used for?',
    options: {
      A: 'Best rate of climb to gain the most altitude in the least time',
      B: 'Best angle of climb to gain the most altitude over the shortest distance',
      C: 'Maximum structural cruising speed',
      D: 'Maneuvering speed'
    },
    correct: 'B',
    reference: 'FAA-H-8083-3 Chapter 5'
  },
  {
    id: 20,
    section: 'Section 4 — Aircraft Performance and Weight and Balance',
    question: 'Which color arc on the airspeed indicator represents the normal operating range?',
    options: {
      A: 'Yellow arc',
      B: 'Red arc',
      C: 'White arc',
      D: 'Green arc'
    },
    correct: 'D',
    reference: 'FAA-H-8083-25 Chapter 8'
  },

  // ============================================
  // SECTION 5 — WEATHER (5 questions)
  // ============================================
  {
    id: 21,
    section: 'Section 5 — Weather',
    question: 'What does METAR stand for?',
    options: {
      A: 'Meteorological Aerodrome Report',
      B: 'Meteorological Aviation Terminal Report',
      C: 'Meteorological Area Terminal Report',
      D: 'Measured Aerodrome Terminal Report'
    },
    correct: 'A',
    reference: 'FAA-H-8083-25 Chapter 13'
  },
  {
    id: 22,
    section: 'Section 5 — Weather',
    question: 'What is a TAF?',
    options: {
      A: 'Terminal Area Forecast — a weather forecast for the vicinity of an airport',
      B: 'Terminal Aerodrome Forecast — a weather forecast for the vicinity of an airport',
      C: 'Tactical Air Force weather report',
      D: 'Temperature and forecast report'
    },
    correct: 'B',
    reference: 'FAA-H-8083-25 Chapter 13'
  },
  {
    id: 23,
    section: 'Section 5 — Weather',
    question: 'What conditions are required for carburetor ice to form?',
    options: {
      A: 'Only in freezing temperatures below 0°C',
      B: 'Temperatures between -10°C and 30°C with high humidity',
      C: 'Only during rain and thunderstorms',
      D: 'Only at high altitude above 10000 feet'
    },
    correct: 'B',
    reference: 'FAA-H-8083-25 Chapter 7'
  },
  {
    id: 24,
    section: 'Section 5 — Weather',
    question: 'What does a wind shear warning mean for a student pilot preparing to solo?',
    options: {
      A: 'Fly higher to avoid the shear layer',
      B: 'Use more power during the approach',
      C: 'Postpone the flight as wind shear is hazardous especially during takeoff and landing',
      D: 'Wind shear only affects large aircraft'
    },
    correct: 'C',
    reference: 'AIM 7-1-24'
  },
  {
    id: 25,
    section: 'Section 5 — Weather',
    question: 'What is the standard temperature and pressure at sea level for performance calculations?',
    options: {
      A: '15°C and 29.92 inHg',
      B: '20°C and 29.92 inHg',
      C: '15°C and 30.00 inHg',
      D: '0°C and 29.92 inHg'
    },
    correct: 'A',
    reference: 'FAA-H-8083-25 Chapter 11'
  },

  // ============================================
  // SECTION 6 — AIRPORT OPERATIONS (5 questions)
  // ============================================
  {
    id: 26,
    section: 'Section 6 — Airport Operations',
    question: 'What does a solid yellow line on a taxiway mean?',
    options: {
      A: 'Hold short of runway',
      B: 'Edge of the taxiway',
      C: 'Centerline of the taxiway',
      D: 'No taxiing beyond this point'
    },
    correct: 'C',
    reference: 'AIM 2-3-3'
  },
  {
    id: 27,
    section: 'Section 6 — Airport Operations',
    question: 'What does a runway hold short marking look like?',
    options: {
      A: 'Two solid yellow lines',
      B: 'Two dashed yellow lines',
      C: 'Two solid and two dashed yellow lines',
      D: 'One solid red line'
    },
    correct: 'C',
    reference: 'AIM 2-3-5'
  },
  {
    id: 28,
    section: 'Section 6 — Airport Operations',
    question: 'At a non-towered airport what radio frequency should be used for traffic advisories?',
    options: {
      A: '121.5 MHz emergency frequency',
      B: 'The published CTAF frequency for that airport',
      C: '122.8 MHz universal CTAF',
      D: 'The nearest approach control frequency'
    },
    correct: 'B',
    reference: 'AIM 4-1-9'
  },
  {
    id: 29,
    section: 'Section 6 — Airport Operations',
    question: 'When should you make position reports at a non-towered airport?',
    options: {
      A: 'Only when other traffic is in the pattern',
      B: 'At 10 miles out, entering downwind, base, and final',
      C: 'Only on final approach',
      D: 'At 45 degree entry, downwind, base, and final'
    },
    correct: 'D',
    reference: 'AIM 4-1-9'
  },
  {
    id: 30,
    section: 'Section 6 — Airport Operations',
    question: 'What is the standard traffic pattern altitude for light aircraft?',
    options: {
      A: '500 feet AGL',
      B: '800 feet AGL',
      C: '1000 feet AGL',
      D: '1500 feet AGL'
    },
    correct: 'C',
    reference: 'AIM 4-3-3'
  },

  // ============================================
  // SECTION 7 — EMERGENCY PROCEDURES (5 questions)
  // ============================================
  {
    id: 31,
    section: 'Section 7 — Emergency Procedures',
    question: 'During an engine failure after takeoff what is the most important action?',
    options: {
      A: 'Immediately turn back to the runway',
      B: 'Establish best glide speed and land straight ahead or with minimal turns',
      C: 'Apply carburetor heat and increase throttle',
      D: 'Climb to gain altitude before turning back'
    },
    correct: 'B',
    reference: 'FAA-H-8083-3 Chapter 17'
  },
  {
    id: 32,
    section: 'Section 7 — Emergency Procedures',
    question: 'What is the best glide speed used for?',
    options: {
      A: 'Maximum distance glide with engine failure',
      B: 'Minimum sink rate',
      C: 'Best angle of climb',
      D: 'Maximum rate of descent'
    },
    correct: 'A',
    reference: 'FAA-H-8083-3 Chapter 17'
  },
  {
    id: 33,
    section: 'Section 7 — Emergency Procedures',
    question: 'If an engine fire occurs on the ground during start what should the pilot do first?',
    options: {
      A: 'Shut off the fuel and continue cranking to draw the fire into the engine',
      B: 'Immediately evacuate the aircraft',
      C: 'Use the fire extinguisher on the cockpit',
      D: 'Open the throttle fully to blow out the fire'
    },
    correct: 'A',
    reference: 'POH/AFM Emergency Procedures'
  },
  {
    id: 34,
    section: 'Section 7 — Emergency Procedures',
    question: 'What is the emergency frequency that should be monitored or used in an emergency?',
    options: {
      A: '121.5 MHz',
      B: '122.8 MHz',
      C: '123.45 MHz',
      D: '118.0 MHz'
    },
    correct: 'A',
    reference: '14 CFR §91.183 and AIM 6-3-1'
  },
  {
    id: 35,
    section: 'Section 7 — Emergency Procedures',
    question: 'What transponder code should be squawked in an emergency?',
    options: {
      A: '1200',
      B: '7500',
      C: '7600',
      D: '7700'
    },
    correct: 'D',
    reference: '14 CFR §91.185 and AIM 6-3-2'
  },

  // ============================================
  // SECTION 8 — COLLISION AVOIDANCE (5 questions)
  // ============================================
  {
    id: 36,
    section: 'Section 8 — Collision Avoidance and See and Avoid',
    question: 'When two aircraft are on a converging course at the same altitude which aircraft has the right of way?',
    options: {
      A: 'The aircraft on the left',
      B: 'The aircraft on the right',
      C: 'The faster aircraft',
      D: 'The aircraft with more engines'
    },
    correct: 'B',
    reference: '14 CFR §91.113(d)'
  },
  {
    id: 37,
    section: 'Section 8 — Collision Avoidance and See and Avoid',
    question: 'When an aircraft is overtaking another aircraft which way should the overtaking aircraft pass?',
    options: {
      A: 'To the left',
      B: 'Either side at pilot discretion',
      C: 'To the right',
      D: 'Above the other aircraft'
    },
    correct: 'C',
    reference: '14 CFR §91.113(f)'
  },
  {
    id: 38,
    section: 'Section 8 — Collision Avoidance and See and Avoid',
    question: 'What is the most effective scanning technique for collision avoidance?',
    options: {
      A: 'Continuous smooth sweep across the horizon',
      B: 'Focus on instruments and check outside periodically',
      C: 'Short regularly spaced eye movements across sectors of the sky',
      D: 'Focus on areas where traffic is most likely'
    },
    correct: 'C',
    reference: 'AIM 8-1-6'
  },
  {
    id: 39,
    section: 'Section 8 — Collision Avoidance and See and Avoid',
    question: 'An aircraft on final approach to land has right of way over which of the following?',
    options: {
      A: 'All other aircraft',
      B: 'Aircraft in the traffic pattern only',
      C: 'Aircraft taxiing only',
      D: 'Aircraft in flight and landing'
    },
    correct: 'A',
    reference: '14 CFR §91.113(g)'
  },
  {
    id: 40,
    section: 'Section 8 — Collision Avoidance and See and Avoid',
    question: 'What is the right of way rule when two aircraft are on final approach at the same time?',
    options: {
      A: 'The faster aircraft has right of way',
      B: 'The aircraft at the higher altitude has right of way',
      C: 'The aircraft that is lower on final has right of way',
      D: 'The aircraft that arrived first has right of way'
    },
    correct: 'C',
    reference: '14 CFR §91.113(g)'
  },

  // ============================================
  // SECTION 9 — NAVIGATION (5 questions)
  // ============================================
  {
    id: 41,
    section: 'Section 9 — Navigation and Magnetic Compass',
    question: 'What is magnetic variation?',
    options: {
      A: 'The difference between true north and magnetic north',
      B: 'The difference between compass heading and magnetic heading',
      C: 'The error caused by electrical equipment in the cockpit',
      D: 'The difference between indicated and true airspeed'
    },
    correct: 'A',
    reference: 'FAA-H-8083-25 Chapter 16'
  },
  {
    id: 42,
    section: 'Section 9 — Navigation and Magnetic Compass',
    question: 'What is compass deviation?',
    options: {
      A: 'The difference between true north and magnetic north',
      B: 'Error in the magnetic compass caused by magnetic fields within the aircraft',
      C: 'The difference between indicated and true airspeed',
      D: 'Error caused by turbulence'
    },
    correct: 'B',
    reference: 'FAA-H-8083-25 Chapter 8'
  },
  {
    id: 43,
    section: 'Section 9 — Navigation and Magnetic Compass',
    question: 'When turning from a northerly heading to the east using a magnetic compass in the northern hemisphere what should the pilot do?',
    options: {
      A: 'Roll out before reaching east because the compass leads on northerly headings',
      B: 'Roll out after passing east because the compass lags on northerly headings',
      C: 'Roll out exactly on east',
      D: 'The compass reads accurately on all headings'
    },
    correct: 'B',
    reference: 'FAA-H-8083-25 Chapter 8'
  },
  {
    id: 44,
    section: 'Section 9 — Navigation and Magnetic Compass',
    question: 'What does ATIS stand for?',
    options: {
      A: 'Automated Terminal Information Service',
      B: 'Automatic Terminal Information System',
      C: 'Automated Traffic Information Service',
      D: 'Aviation Terminal Information System'
    },
    correct: 'A',
    reference: 'AIM 4-1-13'
  },
  {
    id: 45,
    section: 'Section 9 — Navigation and Magnetic Compass',
    question: 'On a sectional chart what does a dashed blue line indicate?',
    options: {
      A: 'Class B airspace boundary',
      B: 'Class C airspace boundary',
      C: 'Class D airspace boundary',
      D: 'Class E airspace starting at surface'
    },
    correct: 'C',
    reference: 'FAA Sectional Chart Legend'
  },

  // ============================================
  // SECTION 10 — FLIGHT RULES AND REGULATIONS (5 questions)
  // ============================================
  {
    id: 46,
    section: 'Section 10 — General Flight Rules',
    question: 'What is the minimum safe altitude over other than congested areas?',
    options: {
      A: '300 feet AGL',
      B: '500 feet AGL',
      C: '700 feet AGL',
      D: '1000 feet AGL'
    },
    correct: 'B',
    reference: '14 CFR §91.119(c)'
  },
  {
    id: 47,
    section: 'Section 10 — General Flight Rules',
    question: 'How far from clouds must a VFR aircraft remain in Class E airspace above 1200 feet AGL?',
    options: {
      A: '500 feet below 1000 feet above and 1 mile horizontal',
      B: '500 feet below 1000 feet above and 2000 feet horizontal',
      C: '1000 feet below 1000 feet above and 1 mile horizontal',
      D: 'Clear of clouds'
    },
    correct: 'B',
    reference: '14 CFR §91.155'
  },
  {
    id: 48,
    section: 'Section 10 — General Flight Rules',
    question: 'What documents must be aboard the aircraft during flight?',
    options: {
      A: 'Airworthiness certificate only',
      B: 'Airworthiness certificate and registration only',
      C: 'Airworthiness certificate, registration, operating limitations, and weight and balance',
      D: 'Airworthiness certificate, registration, and pilot logbook'
    },
    correct: 'C',
    reference: '14 CFR §91.9 and §91.203'
  },
  {
    id: 49,
    section: 'Section 10 — General Flight Rules',
    question: 'What is the cruising altitude rule for VFR flight above 3000 feet AGL?',
    options: {
      A: 'Odd thousands plus 500 feet eastbound even thousands plus 500 feet westbound',
      B: 'Even thousands plus 500 feet eastbound odd thousands plus 500 feet westbound',
      C: 'Odd thousands eastbound even thousands westbound',
      D: 'No altitude rules apply in VFR conditions'
    },
    correct: 'A',
    reference: '14 CFR §91.159'
  },
  {
    id: 50,
    section: 'Section 10 — General Flight Rules',
    question: 'When is a pilot required to use supplemental oxygen?',
    options: {
      A: 'Above 10000 feet MSL at all times',
      B: 'Above 12500 feet MSL for more than 30 minutes and above 14000 feet MSL at all times',
      C: 'Above 15000 feet MSL only',
      D: 'Oxygen is never required in unpressurized aircraft'
    },
    correct: 'B',
    reference: '14 CFR §91.211'
  }
];

export const PRE_SOLO_TEST_CONFIG = {
  title: 'Pre-Solo Aeronautical Knowledge Test',
  regulation: '14 CFR §61.87(b)',
  passingScore: 80,
  totalQuestions: 50,
  sections: [
    'Section 1 — Applicable Federal Aviation Regulations',
    'Section 2 — Airspace Rules and Procedures',
    'Section 3 — Aircraft Systems',
    'Section 4 — Aircraft Performance and Weight and Balance',
    'Section 5 — Weather',
    'Section 6 — Airport Operations',
    'Section 7 — Emergency Procedures',
    'Section 8 — Collision Avoidance and See and Avoid',
    'Section 9 — Navigation and Magnetic Compass',
    'Section 10 — General Flight Rules'
  ]
};