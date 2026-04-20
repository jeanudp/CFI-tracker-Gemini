import { ACSArea } from '../types';

export const CFI_GROUND_ACS: ACSArea[] = [
  {
    area: "I. Fundamentals of Instructing",
    tasks: [
      {
        name: "Effects of Human Behavior and Communication on the Learning Process",
        code: "FI.I.A",
        references: "FAA-H-8083-2, FAA-H-8083-9, FAA-H-8083-25",
        objective: "To determine the applicant understands human behavior and effective communication, can apply that knowledge, manage associated risks, demonstrate appropriate skills, and provide effective instruction.",
        stds: [
          { code: "FI.I.A.K1", category: "K", description: "Elements of human behavior (definitions, instructor-learner relationship, motivation, human needs, defense mechanisms)" },
          { code: "FI.I.A.K2", category: "K", description: "Learner emotional reactions (anxiety, impatience, worry, physical discomfort, apathy from poor instruction)" },
          { code: "FI.I.A.K3", category: "K", description: "Teaching the adult learner" },
          { code: "FI.I.A.K4", category: "K", description: "Effective communication (basic elements, barriers, developing skills)" },
          { code: "FI.I.A.R1", category: "R", description: "Recognizing and accommodating human behavior" },
          { code: "FI.I.A.R2", category: "R", description: "Barriers to communication" },
          { code: "FI.I.A.S1", category: "S", description: "Give examples of how human behavior affects motivation and learning" },
          { code: "FI.I.A.S2", category: "S", description: "Describe how to handle serious abnormal behavior and defense mechanisms" },
          { code: "FI.I.A.S3", category: "S", description: "Use effective communication in ground and flight instruction" }
        ]
      },
      {
        name: "Learning Process",
        code: "FI.I.B",
        references: "FAA-H-8083-2, FAA-H-8083-9, FAA-H-8083-25",
        objective: "To determine the applicant understands the learning process, can apply that knowledge, manage associated risks, demonstrate appropriate skills, and provide effective instruction.",
        stds: [
          { code: "FI.I.B.K1", category: "K", description: "Definitions of learning" },
          { code: "FI.I.B.K2", category: "K", description: "Learning theory (behaviorism and cognitive theory) as applied to flight instruction" },
          { code: "FI.I.B.K3", category: "K", description: "Perceptions and insight" },
          { code: "FI.I.B.K4", category: "K", description: "Acquiring knowledge" },
          { code: "FI.I.B.K5", category: "K", description: "Laws of learning" },
          { code: "FI.I.B.K6", category: "K", description: "Domains of learning (cognitive, affective, psychomotor)" },
          { code: "FI.I.B.K7", category: "K", description: "Characteristics of learning" },
          { code: "FI.I.B.K8", category: "K", description: "Scenario-based training (SBT)" },
          { code: "FI.I.B.K9", category: "K", description: "Acquiring skill knowledge (stages, knowledge of results, skill development, plateaus)" },
          { code: "FI.I.B.K10", category: "K", description: "Types of practice" },
          { code: "FI.I.B.K11", category: "K", description: "Evaluation versus critique" },
          { code: "FI.I.B.K12", category: "K", description: "Distractions, interruptions, fixation, and inattention" },
          { code: "FI.I.B.K13", category: "K", description: "Errors" },
          { code: "FI.I.B.K14", category: "K", description: "Memory (sensory, short-term/long-term, usage effects, forgetting)" },
          { code: "FI.I.B.K15", category: "K", description: "Retention of learning" },
          { code: "FI.I.B.K16", category: "K", description: "Transfer of learning" },
          { code: "FI.I.B.R1", category: "R", description: "Inadequate or incomplete instruction" },
          { code: "FI.I.B.R2", category: "R", description: "Lack of learner motivation" },
          { code: "FI.I.B.R3", category: "R", description: "Recognizing and correcting learner errors" },
          { code: "FI.I.B.S1", category: "S", description: "Apply educational theories to ground and flight instruction" },
          { code: "FI.I.B.S2", category: "S", description: "Recognize and correct conditions that undermine the learning process" },
          { code: "FI.I.B.S3", category: "S", description: "Plan and use techniques including realistic distractions to teach workload management" }
        ]
      },
      {
        name: "Course Development, Lesson Plans, and Classroom Training Techniques",
        code: "FI.I.C",
        references: "FAA-H-8083-2, FAA-H-8083-9, FAA-H-8083-25",
        objective: "To determine the applicant understands the teaching process, can apply that knowledge, manage associated risks, demonstrate appropriate skills, and provide effective instruction.",
        stds: [
          { code: "FI.I.C.K1", category: "K", description: "Teaching (process and essential skills)" },
          { code: "FI.I.C.K2", category: "K", description: "Course of training" },
          { code: "FI.I.C.K3", category: "K", description: "Lesson preparation (objectives, completion standards, ACS role, decision-based objectives)" },
          { code: "FI.I.C.K4", category: "K", description: "Organization of material" },
          { code: "FI.I.C.K5", category: "K", description: "Training delivery methods (lecture, discussion, guided discussion, group learning, demonstration-performance, drill and practice)" },
          { code: "FI.I.C.K6", category: "K", description: "Electronic learning (e-Learning)" },
          { code: "FI.I.C.K7", category: "K", description: "Instructional aids and training technologies (characteristics, reasons, guidelines, types)" },
          { code: "FI.I.C.K8", category: "K", description: "Integrated flight instruction" },
          { code: "FI.I.C.K9", category: "K", description: "Problem-based instruction" },
          { code: "FI.I.C.K10", category: "K", description: "Planning instructional activity (blocks of learning, syllabus, lesson plans)" },
          { code: "FI.I.C.R1", category: "R", description: "Selection of teaching method" },
          { code: "FI.I.C.S1", category: "S", description: "Prepare a lesson plan using appropriate methods for task and learner (ground lesson and maneuver introduction)" }
        ]
      },
      {
        name: "Student Evaluation, Assessment, and Testing",
        code: "FI.I.D",
        references: "FAA-H-8083-2, FAA-H-8083-9, FAA-H-8083-25",
        objective: "To determine the applicant understands evaluation and testing, can apply that knowledge, manage associated risks, demonstrate appropriate skills, and provide effective instruction.",
        stds: [
          { code: "FI.I.D.K1", category: "K", description: "Purpose and characteristics of effective assessment" },
          { code: "FI.I.D.K2", category: "K", description: "Traditional assessments" },
          { code: "FI.I.D.K3", category: "K", description: "Authentic assessments (learner-centered, maneuver grades, risk management assessment)" },
          { code: "FI.I.D.K4", category: "K", description: "Choosing an effective assessment method" },
          { code: "FI.I.D.K5", category: "K", description: "Purposes and types of critiques" },
          { code: "FI.I.D.K6", category: "K", description: "Oral assessment (effective questions, types to avoid, answering learner questions)" },
          { code: "FI.I.D.K7", category: "K", description: "Assessment of piloting ability" },
          { code: "FI.I.D.R1", category: "R", description: "Delivering an assessment" },
          { code: "FI.I.D.S1", category: "S", description: "Use appropriate methods to assess learner performance in ground or flight training" }
        ]
      },
      {
        name: "Elements of Effective Teaching in a Professional Environment",
        code: "FI.I.E",
        references: "FAA-H-8083-2, FAA-H-8083-9, FAA-H-8083-25",
        objective: "To determine the applicant understands effects of instructor behavior on effective teaching, can apply that knowledge, manage associated risks, demonstrate appropriate skills, and provide effective instruction.",
        stds: [
          { code: "FI.I.E.K1", category: "K", description: "Aviation instructor responsibilities (helping learners, adequate instruction, training to standards, emphasizing positive, minimizing frustration)" },
          { code: "FI.I.E.K2", category: "K", description: "Flight instructor responsibilities including supervision and surveillance during training" },
          { code: "FI.I.E.K3", category: "K", description: "Flight instructor qualifications and professionalism" },
          { code: "FI.I.E.K4", category: "K", description: "Professional development" },
          { code: "FI.I.E.K5", category: "K", description: "Instructor ethics and conduct" },
          { code: "FI.I.E.R1", category: "R", description: "Fulfilling instructor responsibilities" },
          { code: "FI.I.E.R2", category: "R", description: "Exhibiting professionalism" },
          { code: "FI.I.E.S1", category: "S", description: "Deliver ground or flight instruction consistent with instructor responsibilities and professional standards" }
        ]
      },
      {
        name: "Elements of Effective Teaching that Include Risk Management and Accident Prevention",
        code: "FI.I.F",
        references: "FAA-H-8083-2, FAA-H-8083-9, FAA-H-8083-25",
        objective: "To determine the applicant understands teaching practical risk management, can apply that knowledge, manage associated risks, demonstrate appropriate skills, and provide effective instruction.",
        stds: [
          { code: "FI.I.F.K1", category: "K", description: "Teaching risk identification, assessment, and mitigation" },
          { code: "FI.I.F.K2", category: "K", description: "Teaching risk management tools (PAVE checklist, FRATs)" },
          { code: "FI.I.F.K3", category: "K", description: "When and how to introduce risk management" },
          { code: "FI.I.F.K4", category: "K", description: "Risk management teaching techniques by phase of instruction" },
          { code: "FI.I.F.K5", category: "K", description: "Managing risk during flight instruction (common risks, best practices, special considerations for T/O and landing)" },
          { code: "FI.I.F.K6", category: "K", description: "ADM including CRM/SRM as appropriate" },
          { code: "FI.I.F.R1", category: "R", description: "Hazards associated with providing flight instruction" },
          { code: "FI.I.F.R2", category: "R", description: "Obstacles to maintaining situational awareness during instruction" },
          { code: "FI.I.F.R3", category: "R", description: "Recognizing and managing hazards from human behavior including hazardous attitudes" },
          { code: "FI.I.F.S1", category: "S", description: "Use SBT to demonstrate, teach, and assess risk management and ADM in an evaluator-assigned task" },
          { code: "FI.I.F.S2", category: "S", description: "Identify and mitigate flight instruction risks: oversight of learner actions, awareness of learner state, overall situational awareness" },
          { code: "FI.I.F.S3", category: "S", description: "Model safety practices: collision avoidance, avoid distractions, coordinated flight, positive control exchange, continuous NAS awareness" }
        ]
      }
    ]
  },
  {
    area: "II. Technical Subject Areas",
    tasks: [
      {
        name: "Human Factors",
        code: "AI.II.A",
        references: "AIM; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-9, FAA-H-8083-25",
        objective: "To determine the applicant understands personal health, flight physiology, aeromedical and human factors, can apply that knowledge, manage associated risks, demonstrate appropriate skills, and provide effective instruction.",
        stds: [
          { code: "AI.II.A.K1", category: "K", description: "Aeromedical issues: symptoms, causes, effects, corrections for hypoxia, hyperventilation, ear/sinus, spatial disorientation, motion sickness, CO poisoning, stress, fatigue, dehydration, hypothermia, optical illusions, scuba diving nitrogen" },
          { code: "AI.II.A.K2", category: "K", description: "Regulations for use of alcohol and drugs" },
          { code: "AI.II.A.K3", category: "K", description: "Effects of alcohol, drugs, and OTC medications" },
          { code: "AI.II.A.K4", category: "K", description: "ADM including CRM/SRM as appropriate" },
          { code: "AI.II.A.R1", category: "R", description: "Aeromedical and physiological issues" },
          { code: "AI.II.A.R2", category: "R", description: "Hazardous attitudes" },
          { code: "AI.II.A.R3", category: "R", description: "Distractions, task prioritization, loss of situational awareness, or disorientation" },
          { code: "AI.II.A.R4", category: "R", description: "Confirmation and expectation bias" },
          { code: "AI.II.A.S1", category: "S", description: "Associate symptoms and effects of at least three aeromedical conditions with causes and corrections" },
          { code: "AI.II.A.S2", category: "S", description: "Perform self-assessment including fitness for flight and personal minimums" }
        ]
      },
      {
        name: "Visual Scanning and Collision Avoidance",
        code: "AI.II.B",
        references: "AC 90-48; AIM; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-9, FAA-H-8083-25",
        objective: "To determine the applicant understands visual scanning and collision avoidance, can apply that knowledge, manage associated risks, demonstrate appropriate skills, and provide effective instruction.",
        stds: [
          { code: "AI.II.B.K1", category: "K", description: "Environmental conditions that degrade vision" },
          { code: "AI.II.B.K2", category: "K", description: "Vestibular and visual illusions" },
          { code: "AI.II.B.K3", category: "K", description: "See and Avoid responsibilities" },
          { code: "AI.II.B.K4", category: "K", description: "Visual scanning procedure and importance of peripheral vision" },
          { code: "AI.II.B.K5", category: "K", description: "Aircraft blind spots and clearing procedures" },
          { code: "AI.II.B.K6", category: "K", description: "Visual cues of an impending mid-air collision" },
          { code: "AI.II.B.K7", category: "K", description: "Situations creating greatest collision risk" },
          { code: "AI.II.B.K8", category: "K", description: "Division of attention inside and outside the aircraft" },
          { code: "AI.II.B.R1", category: "R", description: "Distractions to visual scanning" },
          { code: "AI.II.B.R2", category: "R", description: "Relaxed intermediate focal distance" },
          { code: "AI.II.B.R3", category: "R", description: "High volume operational environments" },
          { code: "AI.II.B.R4", category: "R", description: "Collision reaction time" },
          { code: "AI.II.B.R5", category: "R", description: "Use of a safety pilot" },
          { code: "AI.II.B.S1", category: "S", description: "Effectively scan using short, regularly spaced eye movements" },
          { code: "AI.II.B.S2", category: "S", description: "Scan around physical obstructions" },
          { code: "AI.II.B.S3", category: "S", description: "Use appropriate visual scanning techniques" },
          { code: "AI.II.B.S4", category: "S", description: "Use electronic traffic alert systems if available" }
        ]
      },
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
        name: "Principles of Flight",
        code: "AI.II.D",
        references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-9, FAA-H-8083-23, FAA-H-8083-25; POH/AFM",
        objective: "To determine the applicant understands aerodynamics appropriate to the desired instructor certificate, can apply that knowledge, manage associated risks, demonstrate appropriate skills, and provide effective instruction.",
        stds: [
          { code: "AI.II.D.K1", category: "K", description: "Airfoil design characteristics" },
          { code: "AI.II.D.K2", category: "K", description: "Airplane stability, maneuverability, and controllability" },
          { code: "AI.II.D.K3", category: "K", description: "Turning tendencies (torque, p-factor, spiraling slipstream, gyroscopic precession)" },
          { code: "AI.II.D.K4", category: "K", description: "Forces acting on an airplane" },
          { code: "AI.II.D.K5", category: "K", description: "Load factors in airplane design" },
          { code: "AI.II.D.K6", category: "K", description: "Wingtip vortices and appropriate precautions" },
          { code: "AI.II.D.R1", category: "R", description: "Basic aerodynamic principles of flight" },
          { code: "AI.II.D.S1", category: "S", description: "Deliver instruction on principles of flight including at least three elements from K1–K6" }
        ]
      },
      {
        name: "Aircraft Flight Controls and Operation of Systems",
        code: "AI.II.E",
        references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-9, FAA-H-8083-23, FAA-H-8083-25; POH/AFM",
        objective: "To determine the applicant understands flight controls and systems on the airplane, can apply that knowledge, manage associated risks, demonstrate appropriate skills, and provide effective instruction.",
        stds: [
          { code: "AI.II.E.K1", category: "K", description: "Airplane systems: primary/secondary flight controls, powerplant/propeller, landing gear, fuel/oil/hydraulic, electrical, avionics, pitot-static/vacuum/instruments, environmental, deicing/anti-icing, oxygen" },
          { code: "AI.II.E.K2", category: "K", description: "Indications of and procedures for managing system abnormalities or failures" },
          { code: "AI.II.E.R1", category: "R", description: "Detection of system malfunctions or failures" },
          { code: "AI.II.E.R2", category: "R", description: "Management of a system failure" },
          { code: "AI.II.E.R3", category: "R", description: "Monitoring and management of automated systems" },
          { code: "AI.II.E.R4", category: "R", description: "Providing instruction in unfamiliar aircraft or with unfamiliar avionics" },
          { code: "AI.II.E.S1", category: "S", description: "Operate at least three airplane systems and simultaneously explain them" }
        ]
      },
      {
        name: "Performance and Limitations",
        code: "AI.II.F",
        references: "FAA-H-8083-1, FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-9, FAA-H-8083-25; POH/AFM",
        objective: "To determine the applicant understands aircraft performance and limitations, can apply that knowledge, manage associated risks, demonstrate appropriate skills, and provide effective instruction.",
        stds: [
          { code: "AI.II.F.K1", category: "K", description: "Use of charts, tables, and data to determine performance" },
          { code: "AI.II.F.K2", category: "K", description: "Factors affecting performance: atmospheric conditions, pilot technique, airplane configuration, airport environment, loading/W&B" },
          { code: "AI.II.F.K3", category: "K", description: "W&B terms: basic empty weight, max gross weight, arm, moment, datum, CG/CG limits, useful load" },
          { code: "AI.II.F.K4", category: "K", description: "Methods for computing CG" },
          { code: "AI.II.F.K5", category: "K", description: "Aerodynamics as related to performance" },
          { code: "AI.II.F.R1", category: "R", description: "Use of performance charts, tables, and data" },
          { code: "AI.II.F.R2", category: "R", description: "Airplane limitations" },
          { code: "AI.II.F.R3", category: "R", description: "Differences between calculated and actual performance" },
          { code: "AI.II.F.R4", category: "R", description: "Exceeding weight limits" },
          { code: "AI.II.F.R5", category: "R", description: "Operating outside CG limits" },
          { code: "AI.II.F.R6", category: "R", description: "Shifting, adding, and removing weight" },
          { code: "AI.II.F.S1", category: "S", description: "Use appropriate airplane performance charts, tables, and data" },
          { code: "AI.II.F.S2", category: "S", description: "Compute W&B, correct out-of-CG errors, and verify limits throughout all flight phases" }
        ]
      },
      {
        name: "National Airspace System",
        code: "AI.II.G",
        references: "14 CFR parts 71, 91, 93; AIM; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-9, FAA-H-8083-25; VFR Navigation Charts",
        objective: "To determine the applicant understands the National Airspace System, can apply that knowledge, manage associated risks, demonstrate appropriate skills, and provide effective instruction.",
        stds: [
          { code: "AI.II.G.K1", category: "K", description: "Airspace classes and associated requirements and limitations" },
          { code: "AI.II.G.K2", category: "K", description: "Chart symbols" },
          { code: "AI.II.G.K3", category: "K", description: "SUA, SFRA, TFRs, and other airspace areas" },
          { code: "AI.II.G.K4", category: "K", description: "Currency of publications" },
          { code: "AI.II.G.K5", category: "K", description: "Special VFR requirements" },
          { code: "AI.II.G.R1", category: "R", description: "Various classes and types of airspace" },
          { code: "AI.II.G.S1", category: "S", description: "Identify and comply with VFR weather minimums and airspace requirements" },
          { code: "AI.II.G.S2", category: "S", description: "Correctly identify airspace and operate per communication and equipment requirements" },
          { code: "AI.II.G.S3", category: "S", description: "Identify requirements for SUA and TFR operations including SATR/SFRA if applicable" }
        ]
      },
      {
        name: "Navigation Systems and Radar Services",
        code: "AI.II.H",
        references: "AC 91-78; AIM; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-9, FAA-H-8083-25",
        objective: "To determine the applicant understands navigation systems and radar services, can apply that knowledge, manage associated risks, demonstrate appropriate skills, and provide effective instruction.",
        stds: [
          { code: "AI.II.H.K1", category: "K", description: "Ground-based navigation (identification, orientation, course determination, equipment, tests, regulations, signal integrity)" },
          { code: "AI.II.H.K2", category: "K", description: "Satellite-based navigation (equipment, regulations, authorized database use, RAIM)" },
          { code: "AI.II.H.K3", category: "K", description: "Radar assistance to VFR aircraft (operations, equipment, services, traffic advisories)" },
          { code: "AI.II.H.K4", category: "K", description: "Transponder (Mode A, C, S) and ADS-B" },
          { code: "AI.II.H.R1", category: "R", description: "Management of automated navigation and autoflight systems" },
          { code: "AI.II.H.R2", category: "R", description: "Distractions, task prioritization, loss of situational awareness, or disorientation" },
          { code: "AI.II.H.R3", category: "R", description: "Limitations of the navigation system in use" },
          { code: "AI.II.H.R4", category: "R", description: "Loss of a navigation signal" },
          { code: "AI.II.H.R5", category: "R", description: "Use of an EFB if applicable" },
          { code: "AI.II.H.S1", category: "S", description: "Use an airborne electronic navigation system" },
          { code: "AI.II.H.S2", category: "S", description: "Determine airplane position using navigation system" },
          { code: "AI.II.H.S3", category: "S", description: "Intercept and track a given course, radial, or bearing" },
          { code: "AI.II.H.S4", category: "S", description: "Recognize station or waypoint passage indication" },
          { code: "AI.II.H.S5", category: "S", description: "Use proper communication procedures when utilizing radar services" }
        ]
      },
      {
        name: "Navigation and Cross-Country Flight Planning",
        code: "AI.II.I",
        references: "14 CFR part 91; AIM; Chart Supplements; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-9, FAA-H-8083-25; VFR Navigation Charts",
        objective: "To determine the applicant understands navigation and cross-country flight planning, can apply that knowledge, manage associated risks, demonstrate appropriate skills, and provide effective instruction.",
        stds: [
          { code: "AI.II.I.K1", category: "K", description: "Route planning including airspace, SUA, and nav/comm system selection" },
          { code: "AI.II.I.K2", category: "K", description: "Altitude selection: terrain, obstacles, glide distance, VFR cruising altitudes, wind effect" },
          { code: "AI.II.I.K3", category: "K", description: "Plotting a course" },
          { code: "AI.II.I.K4", category: "K", description: "Power setting selection" },
          { code: "AI.II.I.K5", category: "K", description: "Calculating: time, climb/descent rates, course, distance, heading, TAS, groundspeed, ETA/UTC, fuel requirements" },
          { code: "AI.II.I.K6", category: "K", description: "Elements of a VFR flight plan" },
          { code: "AI.II.I.K7", category: "K", description: "Correlate weather information for go/no-go decision" },
          { code: "AI.II.I.K8", category: "K", description: "Procedures for activating and closing a VFR flight plan" },
          { code: "AI.II.I.K9", category: "K", description: "Magnetic compass errors" },
          { code: "AI.II.I.K10", category: "K", description: "Pilotage and dead reckoning" },
          { code: "AI.II.I.K11", category: "K", description: "Planned versus actual calculations and required corrections" },
          { code: "AI.II.I.K12", category: "K", description: "Diversion and lost procedures" },
          { code: "AI.II.I.K13", category: "K", description: "Inflight intercept procedures" },
          { code: "AI.II.I.K14", category: "K", description: "Use of an EFB if applicable" },
          { code: "AI.II.I.K15", category: "K", description: "Chart symbols" },
          { code: "AI.II.I.R1", category: "R", description: "Pilot" },
          { code: "AI.II.I.R2", category: "R", description: "Aircraft" },
          { code: "AI.II.I.R3", category: "R", description: "Environment (weather, airports, airspace, terrain, obstacles)" },
          { code: "AI.II.I.R4", category: "R", description: "External pressures" },
          { code: "AI.II.I.R5", category: "R", description: "Limitations of ATC services" },
          { code: "AI.II.I.R6", category: "R", description: "Fuel planning" },
          { code: "AI.II.I.S1", category: "S", description: "Prepare, present, and explain a cross-country flight plan with risk analysis to first fuel stop" },
          { code: "AI.II.I.S2", category: "S", description: "Apply information from current aeronautical charts, Chart Supplements, and NOTAMs" },
          { code: "AI.II.I.S3", category: "S", description: "Create a navigation plan and simulate filing a VFR flight plan" },
          { code: "AI.II.I.S4", category: "S", description: "Recalculate fuel reserves based on evaluator-assigned scenario" }
        ]
      },
      {
        name: "14 CFR and Publications",
        code: "AI.II.J",
        references: "14 CFR parts 1, 61, 91; 49 CFR part 830; AIM; Chart Supplements; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-25; POH/AFM",
        objective: "To determine the applicant understands the Code of Federal Regulations and other relevant publications, can apply that knowledge, manage associated risks, demonstrate appropriate skills, and provide effective instruction.",
        stds: [
          { code: "AI.II.J.K1", category: "K", description: "14 CFR parts 1, 61, and 91" },
          { code: "AI.II.J.K2", category: "K", description: "49 CFR part 830" },
          { code: "AI.II.J.K3", category: "K", description: "Advisory Circulars, INFOs, and SAFOs" },
          { code: "AI.II.J.K4", category: "K", description: "Airman Certification Standards or Practical Test Standards" },
          { code: "AI.II.J.K5", category: "K", description: "Pilot's Operating Handbooks and flight manuals" },
          { code: "AI.II.J.K6", category: "K", description: "Aeronautical Information Manual (AIM)" },
          { code: "AI.II.J.R1", category: "R", description: "Use of expired charts, manuals, or publications without current updates" },
          { code: "AI.II.J.S1", category: "S", description: "Teach at least one element from K1–K6" }
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
        name: "Night Operations",
        code: "AI.II.M",
        references: "AIM; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-9, FAA-H-8083-25; POH/AFM",
        objective: "To determine the applicant understands night operations, can apply that knowledge, manage associated risks, demonstrate appropriate skills, and provide effective instruction.",
        stds: [
          { code: "AI.II.M.K1", category: "K", description: "Physiological aspects of vision related to night flying" },
          { code: "AI.II.M.K2", category: "K", description: "Airport, runway, taxiway, and obstruction lighting including pilot-controlled lighting" },
          { code: "AI.II.M.K3", category: "K", description: "Airplane equipment and lighting requirements for night operations" },
          { code: "AI.II.M.K4", category: "K", description: "Personal equipment essential for night flight" },
          { code: "AI.II.M.K5", category: "K", description: "Night orientation, navigation, chart reading, and maintaining night vision" },
          { code: "AI.II.M.K6", category: "K", description: "Using instruments to verify aircraft attitude at night" },
          { code: "AI.II.M.K7", category: "K", description: "Visual illusions at night" },
          { code: "AI.II.M.K8", category: "K", description: "Night taxi operations" },
          { code: "AI.II.M.K9", category: "K", description: "Interpreting traffic position and direction from position lights only" },
          { code: "AI.II.M.R1", category: "R", description: "Inoperative equipment" },
          { code: "AI.II.M.R2", category: "R", description: "Weather considerations specific to night operations" },
          { code: "AI.II.M.R3", category: "R", description: "Collision hazards" },
          { code: "AI.II.M.R4", category: "R", description: "Distractions, task prioritization, loss of situational awareness, or disorientation" },
          { code: "AI.II.M.R5", category: "R", description: "Visual illusions and night adaptation during all phases of night flying" },
          { code: "AI.II.M.R6", category: "R", description: "Runway incursion" },
          { code: "AI.II.M.R7", category: "R", description: "Night currency versus proficiency" },
          { code: "AI.II.M.S1", category: "S", description: "Teach at least one element from K1–K9" }
        ]
      },
      {
        name: "High Altitude Operations - Supplemental Oxygen",
        code: "AI.II.N",
        references: "14 CFR part 91; AC 61-107; AIM; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-9, FAA-H-8083-25; POH/AFM",
        objective: "To determine the applicant understands flight at higher altitudes where supplemental oxygen is required or recommended, can apply that knowledge, manage associated risks, demonstrate appropriate skills, and provide effective instruction.",
        stds: [
          { code: "AI.II.N.K1", category: "K", description: "Regulatory requirements for supplemental oxygen use by crew and passengers" },
          { code: "AI.II.N.K2", category: "K", description: "Physiological factors: impairment, hypoxia symptoms, time of useful consciousness (TUC)" },
          { code: "AI.II.N.K3", category: "K", description: "Operational factors: oxygen system types, aviator's vs. other oxygen, precautions" },
          { code: "AI.II.N.R1", category: "R", description: "High altitude flight" },
          { code: "AI.II.N.R2", category: "R", description: "Use of supplemental oxygen" },
          { code: "AI.II.N.R3", category: "R", description: "Management of compressed gas containers" },
          { code: "AI.II.N.R4", category: "R", description: "Combustion hazards in an oxygen-rich environment" },
          { code: "AI.II.N.S1", category: "S", description: "Provide an adequate briefing on use of supplemental oxygen equipment" },
          { code: "AI.II.N.S2", category: "S", description: "Operate or simulate operation of installed or portable oxygen equipment" },
          { code: "AI.II.N.S3", category: "S", description: "Determine quantity of supplemental oxygen required in evaluator-assigned scenario" }
        ]
      },
      {
        name: "High Altitude Operations - Pressurization",
        code: "AI.II.O",
        references: "AC 61-107; AIM; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-9, FAA-H-8083-25; POH/AFM",
        objective: "To determine the applicant understands flight in pressurized aircraft at high altitudes, can apply that knowledge, manage associated risks, demonstrate appropriate skills, and provide effective instruction.",
        stds: [
          { code: "AI.II.O.K1", category: "K", description: "Fundamental concepts of aircraft pressurization including failure modes" },
          { code: "AI.II.O.K2", category: "K", description: "Physiological factors: impairment, hypoxia symptoms, TUC, effects of rapid decompression" },
          { code: "AI.II.O.R1", category: "R", description: "High altitude flight" },
          { code: "AI.II.O.R2", category: "R", description: "Malfunction of pressurization system if installed" },
          { code: "AI.II.O.S1", category: "S", description: "Operate the pressurization system if installed" },
          { code: "AI.II.O.S2", category: "S", description: "Respond appropriately to simulated pressurization malfunctions if installed" }
        ]
      }
    ]
  },
  {
    area: "III. Preflight Preparation",
    tasks: [
      {
        name: "Pilot Qualifications",
        code: "AI.III.A",
        references: "14 CFR parts 61, 68, 91; AC 60-28, AC 68-1; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-25; POH/AFM",
        objective: "To determine the applicant understands pilot training and qualification requirements for all levels of certification, can apply that knowledge, manage associated risks, demonstrate appropriate skills, and provide effective instruction.",
        stds: [
          { code: "AI.III.A.K1", category: "K", description: "Certification, currency, and recordkeeping requirements including training and logbook entries" },
          { code: "AI.III.A.K2", category: "K", description: "Privileges and limitations at student, sport, recreational, private, commercial, and CFI levels" },
          { code: "AI.III.A.K3", category: "K", description: "Medical certificates: class, expiration, privileges, temporary disqualifications, BasicMed" },
          { code: "AI.III.A.K4", category: "K", description: "Documents required to exercise certificate and rating privileges" },
          { code: "AI.III.A.R1", category: "R", description: "Proficiency versus currency" },
          { code: "AI.III.A.R2", category: "R", description: "Flying unfamiliar aircraft or with unfamiliar avionics" },
          { code: "AI.III.A.S1", category: "S", description: "Deliver instruction on at least two elements from K1–K4" }
        ]
      },
      {
        name: "Airworthiness Requirements",
        code: "AI.III.B",
        references: "14 CFR parts 23, 39, 43, 91; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-9, FAA-H-8083-25",
        objective: "To determine the applicant understands airworthiness requirements and aircraft certificates, can apply that knowledge, manage associated risks, demonstrate appropriate skills, and provide effective instruction.",
        stds: [
          { code: "AI.III.B.K1", category: "K", description: "General airworthiness requirements: certificate locations/dates, required inspections, ADs/SAIBs, special flight permits" },
          { code: "AI.III.B.K2", category: "K", description: "Pilot-performed preventive maintenance" },
          { code: "AI.III.B.K3", category: "K", description: "Equipment requirements for day/night VFR: inoperative equipment, MEL, KOEL, discrepancy records" },
          { code: "AI.III.B.K4", category: "K", description: "Standard and special airworthiness certificates and operational limitations" },
          { code: "AI.III.B.R1", category: "R", description: "Inoperative equipment discovered prior to flight" },
          { code: "AI.III.B.S1", category: "S", description: "Locate and describe airplane airworthiness and registration information" },
          { code: "AI.III.B.S2", category: "S", description: "Determine the airplane is airworthy in evaluator-assigned scenario" },
          { code: "AI.III.B.S3", category: "S", description: "Apply procedures for operating with inoperative equipment in evaluator-assigned scenario" }
        ]
      },
      {
        name: "Weather Information",
        code: "AI.III.C",
        references: "14 CFR part 91; AC 91-92; AIM; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-9, FAA-H-8083-25, FAA-H-8083-28",
        objective: "To determine the applicant understands weather information, can apply that knowledge, manage associated risks, demonstrate appropriate skills, and provide effective instruction.",
        stds: [
          { code: "AI.III.C.K1", category: "K", description: "Sources of weather data (NWS, Flight Service) for flight planning" },
          { code: "AI.III.C.K2", category: "K", description: "Weather products: METAR/SPECI/PIREP, Surface Analysis/CVA, TAF, GFA, FB winds, Convective Outlook, AIRMETs/SIGMETs/Convective SIGMETs" },
          { code: "AI.III.C.K3", category: "K", description: "VFR meteorology: atmospheric stability, wind/windshear/mountain wave, temperature, moisture/precip, air masses/fronts, clouds, turbulence, thunderstorms/microbursts, icing, fog/frost, visibility obstructions" },
          { code: "AI.III.C.K4", category: "K", description: "Flight deck displays of digital weather and aeronautical information" },
          { code: "AI.III.C.R1", category: "R", description: "Go/no-go and continue/divert decisions: diversion circumstances, personal minimums, known/forecast icing or turbulence" },
          { code: "AI.III.C.R2", category: "R", description: "Use and limitations of onboard weather equipment, aviation weather reports/forecasts, and inflight weather resources" },
          { code: "AI.III.C.S1", category: "S", description: "Use available weather resources to obtain an adequate weather briefing" },
          { code: "AI.III.C.S2", category: "S", description: "Analyze at least three meteorological conditions using actual or evaluator-provided weather" },
          { code: "AI.III.C.S3", category: "S", description: "Correlate weather information to make a go/no-go decision" }
        ]
      }
    ]
  },
  {
    area: "IV. Preflight Lesson on a Maneuver to be Performed in Flight",
    tasks: [
      {
        name: "Maneuver Lesson",
        code: "AI.IV.A",
        references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-9, FAA-H-8083-23, FAA-H-8083-25; POH/AFM",
        objective: "To determine the applicant understands elements of a maneuver Task selected from Areas VII–XII (ASEL) and applies that knowledge when delivering ground instruction.",
        stds: [
          { code: "AI.IV.A.K1", category: "K", description: "Purpose of the maneuver" },
          { code: "AI.IV.A.K2", category: "K", description: "Elements of the maneuver and associated common errors" },
          { code: "AI.IV.A.K3", category: "K", description: "Desired outcomes including completion standards" },
          { code: "AI.IV.A.R1", category: "R", description: "Risks associated with the selected maneuver task" },
          { code: "AI.IV.A.S1", category: "S", description: "Deliver instruction on the selected maneuver using a lesson plan, teaching methods, and aids incorporating K1–K3" }
        ]
      }
    ]
  },
  {
    area: "V. Preflight Procedures",
    tasks: [
      {
        name: "Preflight Assessment",
        code: "AI.V.A",
        references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-9, FAA-H-8083-23, FAA-H-8083-25, FAA-H-8083-28; POH/AFM",
        objective: "To determine the applicant understands preflight assessment, can apply that knowledge, manage associated risks, demonstrate appropriate skills, and provide effective instruction.",
        stds: [
          { code: "AI.V.A.K1", category: "K", description: "Pilot self-assessment" },
          { code: "AI.V.A.K2", category: "K", description: "Determining the airplane is appropriate and airworthy" },
          { code: "AI.V.A.K3", category: "K", description: "Preflight inspection: items to check, reasons for each, detecting defects, associated regulations" },
          { code: "AI.V.A.K4", category: "K", description: "Environmental factors: weather, terrain, route selection, obstructions" },
          { code: "AI.V.A.R1", category: "R", description: "Pilot" },
          { code: "AI.V.A.R2", category: "R", description: "Aircraft" },
          { code: "AI.V.A.R3", category: "R", description: "Environment (weather, airports, airspace, terrain, obstacles)" },
          { code: "AI.V.A.R4", category: "R", description: "External pressures" },
          { code: "AI.V.A.R5", category: "R", description: "Aviation security concerns" },
          { code: "AI.V.A.S1", category: "S", description: "Inspect the airplane with reference to appropriate checklist" },
          { code: "AI.V.A.S2", category: "S", description: "Verify airplane is in condition for safe flight and conforms to type design" },
          { code: "AI.V.A.S3", category: "S", description: "Perform self-assessment" },
          { code: "AI.V.A.S4", category: "S", description: "Continue to assess environment for safe flight" }
        ]
      },
      {
        name: "Flight Deck Management",
        code: "AI.V.B",
        references: "14 CFR part 91; AC 120-71; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-9, FAA-H-8083-25; POH/AFM",
        objective: "To determine the applicant understands flight deck management, can apply that knowledge, manage associated risks, demonstrate appropriate skills, and provide effective instruction.",
        stds: [
          { code: "AI.V.B.K1", category: "K", description: "Passenger briefing requirements including safety restraint systems" },
          { code: "AI.V.B.K2", category: "K", description: "Use of appropriate checklists" },
          { code: "AI.V.B.K3", category: "K", description: "Requirements for current and appropriate navigation data" },
          { code: "AI.V.B.K4", category: "K", description: "Securing items and cargo" },
          { code: "AI.V.B.R1", category: "R", description: "Use of systems, automation, and portable electronic devices" },
          { code: "AI.V.B.R2", category: "R", description: "Inoperative equipment" },
          { code: "AI.V.B.R3", category: "R", description: "Passenger distractions" },
          { code: "AI.V.B.S1", category: "S", description: "Secure all items in the aircraft" },
          { code: "AI.V.B.S2", category: "S", description: "Conduct passenger briefing: PIC identification, safety belts, doors, passenger conduct, propeller avoidance, emergency procedures" },
          { code: "AI.V.B.S3", category: "S", description: "Properly program and manage aircraft automation as applicable" },
          { code: "AI.V.B.S4", category: "S", description: "Manage risks using ADM including SRM/CRM" }
        ]
      },
      {
        name: "Engine Starting",
        code: "AI.V.C",
        references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-9, FAA-H-8083-23, FAA-H-8083-25; POH/AFM",
        objective: "To determine the applicant understands engine starting, can apply that knowledge, manage associated risks, demonstrate appropriate skills, and provide effective instruction.",
        stds: [
          { code: "AI.V.C.K1", category: "K", description: "Starting under various conditions" },
          { code: "AI.V.C.K2", category: "K", description: "Starting using external power" },
          { code: "AI.V.C.K3", category: "K", description: "Engine limitations related to starting" },
          { code: "AI.V.C.R1", category: "R", description: "Propeller safety" },
          { code: "AI.V.C.R2", category: "R", description: "Use of external power unit" },
          { code: "AI.V.C.R3", category: "R", description: "Limitations during starting" },
          { code: "AI.V.C.S1", category: "S", description: "Position airplane considering structures, other aircraft, wind, and safety of persons and property" },
          { code: "AI.V.C.S2", category: "S", description: "Complete the appropriate checklist(s)" }
        ]
      },
      {
        name: "Taxiing, Airport Signs, and Lighting",
        code: "AI.V.D",
        references: "AC 91-73; AIM; Chart Supplements; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-9, FAA-H-8083-25; POH/AFM",
        objective: "To determine the applicant understands taxiing an airplane, can apply that knowledge, manage associated risks, demonstrate appropriate skills, and provide effective instruction.",
        stds: [
          { code: "AI.V.D.K1", category: "K", description: "Elements of safe taxi operations" },
          { code: "AI.V.D.K2", category: "K", description: "Aeronautical references: Chart Supplement, airport diagram, NOTAMs" },
          { code: "AI.V.D.K3", category: "K", description: "Taxi instructions and clearances" },
          { code: "AI.V.D.K4", category: "K", description: "Airport markings, signs, and lights" },
          { code: "AI.V.D.K5", category: "K", description: "Visual indicators for wind" },
          { code: "AI.V.D.K6", category: "K", description: "Aircraft lighting as appropriate" },
          { code: "AI.V.D.K7", category: "K", description: "Taxi procedures: pre-taxi activities/Hot Spots, radio communications, crossing runways, night taxi, low visibility taxi" },
          { code: "AI.V.D.R1", category: "R", description: "Activities and distractions" },
          { code: "AI.V.D.R2", category: "R", description: "Confirmation or expectation bias related to taxi instructions" },
          { code: "AI.V.D.R3", category: "R", description: "Taxi route or departure runway change" },
          { code: "AI.V.D.R4", category: "R", description: "Runway incursion" },
          { code: "AI.V.D.S1", category: "S", description: "Receive and correctly read back clearances/instructions if applicable" },
          { code: "AI.V.D.S2", category: "S", description: "Use airport diagram or taxi chart and maintain situational awareness" },
          { code: "AI.V.D.S3", category: "S", description: "Position flight controls for existing wind if applicable" },
          { code: "AI.V.D.S4", category: "S", description: "Complete the appropriate checklist(s)" },
          { code: "AI.V.D.S5", category: "S", description: "Perform brake check immediately after airplane begins moving" },
          { code: "AI.V.D.S6", category: "S", description: "Maintain positive control: direction and speed without excessive braking" },
          { code: "AI.V.D.S7", category: "S", description: "Comply with airport/taxiway markings, signals, and ATC clearances" },
          { code: "AI.V.D.S8", category: "S", description: "Position airplane properly relative to hold lines" }
        ]
      },
      {
        name: "Before Takeoff Check",
        code: "AI.V.F",
        references: "FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-9, FAA-H-8083-23, FAA-H-8083-25; POH/AFM",
        objective: "To determine the applicant understands before takeoff checks, can apply that knowledge, manage associated risks, demonstrate appropriate skills, and provide effective instruction.",
        stds: [
          { code: "AI.V.F.K1", category: "K", description: "Purpose of before takeoff checklist items: reasons for each, detecting malfunctions, confirming safe operating condition" },
          { code: "AI.V.F.R1", category: "R", description: "Division of attention while conducting before takeoff checks" },
          { code: "AI.V.F.R2", category: "R", description: "Unexpected runway changes by ATC" },
          { code: "AI.V.F.R3", category: "R", description: "Wake turbulence" },
          { code: "AI.V.F.R4", category: "R", description: "Potential powerplant failure during takeoff considering aircraft characteristics, runway length, surface conditions, and obstructions" },
          { code: "AI.V.F.S1", category: "S", description: "Review takeoff performance" },
          { code: "AI.V.F.S2", category: "S", description: "Complete the appropriate checklist(s)" },
          { code: "AI.V.F.S3", category: "S", description: "Position airplane considering wind direction and proximity of aircraft, vessels, or buildings" },
          { code: "AI.V.F.S4", category: "S", description: "Divide attention inside and outside the flight deck" },
          { code: "AI.V.F.S5", category: "S", description: "Verify engine parameters and airplane configuration are suitable" }
        ]
      }
    ]
  },
  {
    area: "VI. Airport and Seaplane Base Operations",
    tasks: [
      {
        name: "Communications, Light Signals, and Runway Lighting Systems",
        code: "AI.VI.A",
        references: "14 CFR part 91; AIM; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-9, FAA-H-8083-25",
        objective: "To determine the applicant understands communications, ATC light signals, and runway lighting systems, can apply that knowledge, manage associated risks, demonstrate appropriate skills, and provide effective instruction.",
        stds: [
          { code: "AI.VI.A.K1", category: "K", description: "How to obtain appropriate radio frequencies" },
          { code: "AI.VI.A.K2", category: "K", description: "Proper radio communication procedures and ATC phraseology" },
          { code: "AI.VI.A.K3", category: "K", description: "ATC light signal recognition" },
          { code: "AI.VI.A.K4", category: "K", description: "Appropriate use of transponder(s)" },
          { code: "AI.VI.A.K5", category: "K", description: "Lost communication procedures" },
          { code: "AI.VI.A.K6", category: "K", description: "Equipment issues causing loss of communication" },
          { code: "AI.VI.A.K7", category: "K", description: "Radar assistance" },
          { code: "AI.VI.A.K8", category: "K", description: "Runway Status Lighting Systems" },
          { code: "AI.VI.A.K9", category: "K", description: "Common errors related to this task" },
          { code: "AI.VI.A.R1", category: "R", description: "Communication" },
          { code: "AI.VI.A.R2", category: "R", description: "Deciding if and when to declare an emergency" },
          { code: "AI.VI.A.S1", category: "S", description: "Select and activate appropriate frequencies" },
          { code: "AI.VI.A.S2", category: "S", description: "Transmit using standard AIM phraseology and procedures" },
          { code: "AI.VI.A.S3", category: "S", description: "Acknowledge radio communications and comply with ATC instructions" },
          { code: "AI.VI.A.S4", category: "S", description: "Analyze and correct common errors related to this task" }
        ]
      },
      {
        name: "Traffic Patterns",
        code: "AI.VI.B",
        references: "14 CFR part 91; AIM; FAA-H-8083-2, FAA-H-8083-3, FAA-H-8083-9, FAA-H-8083-25",
        objective: "To determine the applicant understands traffic patterns, can apply that knowledge, manage associated risks, demonstrate appropriate skills, and provide effective instruction.",
        stds: [
          { code: "AI.VI.B.K1", category: "K", description: "Towered and nontowered airport operations" },
          { code: "AI.VI.B.K2", category: "K", description: "Traffic pattern selection for current conditions" },
          { code: "AI.VI.B.K3", category: "K", description: "Right-of-way rules" },
          { code: "AI.VI.B.K4", category: "K", description: "Use of automated weather and airport information" },
          { code: "AI.VI.B.K5", category: "K", description: "Common errors related to this task" },
          { code: "AI.VI.B.R1", category: "R", description: "Collision hazards" },
          { code: "AI.VI.B.R2", category: "R", description: "Distractions, task prioritization, loss of situational awareness, or disorientation" },
          { code: "AI.VI.B.R3", category: "R", description: "Windshear and wake turbulence" },
          { code: "AI.VI.B.S1", category: "S", description: "Identify and interpret airport runways, taxiways, markings, signs, and lighting" },
          { code: "AI.VI.B.S2", category: "S", description: "Comply with recommended traffic pattern procedures" },
          { code: "AI.VI.B.S3", category: "S", description: "Correct for wind drift to maintain proper ground track" },
          { code: "AI.VI.B.S4", category: "S", description: "Maintain orientation with runway/landing area in use" },
          { code: "AI.VI.B.S5", category: "S", description: "Maintain traffic pattern altitude ±100 ft and appropriate airspeed ±10 kts" },
          { code: "AI.VI.B.S6", category: "S", description: "Maintain situational awareness and proper spacing from other aircraft" },
          { code: "AI.VI.B.S7", category: "S", description: "Analyze and correct common errors related to this task" }
        ]
      }
    ]
  }
];