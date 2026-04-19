import { ACSArea } from '../types';

export const CFI_GROUND_ACS: ACSArea[] = [
  {
    area: "I. Fundamentals of Instructing",
    tasks: [
      {
        name: "The Learning Process",
        code: "FI.I.A",
        references: "FAA-H-8083-2, FAA-H-8083-9",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with the learning process.",
        stds: [
          { code: "FI.I.A.K1", category: "K", description: "Learning theory (e.g., behaviorism, cognitive theory, information processing theory, constructivism)." },
          { code: "FI.I.A.K2", category: "K", description: "Perceptions and insight (e.g., factors that affect perception, the role of insight in learning)." },
          { code: "FI.I.A.K3", category: "K", description: "Acquiring knowledge (e.g., memorization, understanding, concept learning)." },
          { code: "FI.I.A.K4", category: "K", description: "The laws of learning (e.g., readiness, effect, exercise, primacy, intensity, recency)." },
          { code: "FI.I.A.K5", category: "K", description: "Domains of learning (e.g., cognitive, affective, psychomotor)." },
          { code: "FI.I.A.K6", category: "K", description: "Levels of learning (e.g., rote, understanding, application, correlation)." },
          { code: "FI.I.A.K7", category: "K", description: "Characteristics of learning (e.g., purposeful, result of experience, multifaceted, active process)." },
          { code: "FI.I.A.K8", category: "K", description: "Acquiring skill (e.g., cognitive, associative, autonomous stages of learning)." },
          { code: "FI.I.A.K9", category: "K", description: "Types of practice (e.g., deliberate, blocked, random)." },
          { code: "FI.I.A.K10", category: "K", description: "Scenario-based training (SBT)." },
          { code: "FI.I.A.K11", category: "K", description: "Errors (e.g., slip, mistake)." },
          { code: "FI.I.A.K12", category: "K", description: "Memory and forgetting (e.g., sensory, short-term, long-term memory)." },
          { code: "FI.I.A.K13", category: "K", description: "Retention of learning." },
          { code: "FI.I.A.K14", category: "K", description: "Transfer of learning (e.g., positive, negative)." },
          { code: "FI.I.A.R1", category: "R", description: "Barriers to effective communication." },
          { code: "FI.I.A.R2", category: "R", description: "Barriers to effective learning." },
          { code: "FI.I.A.S1", category: "S", description: "Apply learning theory to a scenario given by the evaluator." }
        ]
      },
      {
        name: "Human Behavior and Effective Communication",
        code: "FI.I.B",
        references: "FAA-H-8083-2, FAA-H-8083-9",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with human behavior and effective communication.",
        stds: [
          { code: "FI.I.B.K1", category: "K", description: "Human behavior (e.g., hierarchy of human needs, defense mechanisms, student emotional reactions)." },
          { code: "FI.I.B.K2", category: "K", description: "Effective communication (e.g., source, symbols, receiver)." },
          { code: "FI.I.B.K3", category: "K", description: "Barriers to effective communication (e.g., lack of common experience, confusion, abstractions, interference)." },
          { code: "FI.I.B.K4", category: "K", description: "Developing communication skills (e.g., role playing, instructional communication, listening, questioning)." },
          { code: "FI.I.B.R1", category: "R", description: "Recognizing and mitigating student defense mechanisms." },
          { code: "FI.I.B.S1", category: "S", description: "Demonstrate effective communication in an instructional environment." }
        ]
      },
      {
        name: "The Teaching Process",
        code: "FI.I.C",
        references: "FAA-H-8083-2, FAA-H-8083-9",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with the teaching process.",
        stds: [
          { code: "FI.I.C.K1", category: "K", description: "Preparation of a lesson (e.g., objectives, standards, equipment, organization)." },
          { code: "FI.I.C.K2", category: "K", description: "Presentation of material (e.g., lecture, discussion, guided discussion, demonstration-performance)." },
          { code: "FI.I.C.K3", category: "K", description: "Application of learning." },
          { code: "FI.I.C.K4", category: "K", description: "Assessment and critique." },
          { code: "FI.I.C.R1", category: "R", description: "Inadequate preparation for a lesson." },
          { code: "FI.I.C.S1", category: "S", description: "Prepare a lesson plan on a technical subject area." }
        ]
      },
      {
        name: "Assessment and Critique",
        code: "FI.I.E",
        references: "FAA-H-8083-2, FAA-H-8083-9",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with assessment and critique in the teaching process.",
        stds: [
          { code: "FI.I.E.K1", category: "K", description: "Purpose of assessment." },
          { code: "FI.I.E.K2", category: "K", description: "Characteristics of effective assessment (e.g., objective, flexible, acceptable, comprehensive, constructive, organized, thoughtful, specific)." },
          { code: "FI.I.E.K3", category: "K", description: "Traditional, authentic, and oral assessment." },
          { code: "FI.I.E.K4", category: "K", description: "Characteristics of effective questions." },
          { code: "FI.I.E.K5", category: "K", description: "Types of questions to avoid." },
          { code: "FI.I.E.K6", category: "K", description: "Effective critique." },
          { code: "FI.I.E.R1", category: "R", description: "Bias in assessment." },
          { code: "FI.I.E.S1", category: "S", description: "Critique a student performance in a scenario given by the evaluator." }
        ]
      },
      {
        name: "Flight Instructor Responsibilities and Professionalism",
        code: "FI.I.F",
        references: "FAA-H-8083-2, FAA-H-8083-9",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with flight instructor responsibilities and professionalism.",
        stds: [
          { code: "FI.I.F.K1", category: "K", description: "Aviation instructor responsibilities (e.g., helping students learn, providing adequate instruction, demanding appropriate standards, emphasizing the positive)." },
          { code: "FI.I.F.K2", category: "K", description: "Flight instructor responsibilities (e.g., evaluation of student piloting ability, pilot supervision, practical test recommendations, flight instructor endorsements, pilot proficiency)." },
          { code: "FI.I.F.K3", category: "K", description: "Professionalism (e.g., sincerity, acceptance, personal appearance, demeanor, proper language)." },
          { code: "FI.I.F.K4", category: "K", description: "Evaluation of student ability." },
          { code: "FI.I.F.K5", category: "K", description: "Aviation instructor's role in safety." },
          { code: "FI.I.F.R1", category: "R", description: "Compromising standards." },
          { code: "FI.I.F.S1", category: "S", description: "Explain instructor responsibilities in a scenario given by the evaluator." }
        ]
      }
    ]
  },
  {
    area: "II. Technical Subject Areas",
    tasks: [
      {
        name: "Logbook Entries and Certificate Endorsements",
        code: "FI.II.L",
        references: "14 CFR part 61; AC 61-65",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with logbook entries and certificate endorsements.",
        stds: [
          { code: "FI.II.L.K1", category: "K", description: "Required logbook entries for pilot activities." },
          { code: "FI.II.L.K2", category: "K", description: "Required entries for instructor activities." },
          { code: "FI.II.L.K3", category: "K", description: "Endorsement requirements for student, private, and commercial pilots." },
          { code: "FI.II.L.K4", category: "K", description: "Endorsement requirements for flight instructor applicants." },
          { code: "FI.II.L.K5", category: "K", description: "Recordkeeping requirements for instructors." },
          { code: "FI.II.L.R1", category: "R", description: "Inaccurate or missing endorsements." },
          { code: "FI.II.L.S1", category: "S", description: "Complete a required endorsement in a scenario given by the evaluator." }
        ]
      },
      {
        name: "Federal Aviation Regulations and Publications",
        code: "FI.II.J",
        references: "14 CFR parts 1, 61, 91; AC 00-2, AC 61-65; AIM; FAA-G-8082-1",
        objective: "To determine that the applicant exhibits satisfactory knowledge, risk management, and skills associated with FARs and aviation publications.",
        stds: [
          { code: "FI.II.J.K1", category: "K", description: "14 CFR parts 1, 61, 91, and NTSB part 830." },
          { code: "FI.II.J.K2", category: "K", description: "Aviation publications (e.g., AIM, Chart Supplements)." },
          { code: "FI.II.J.K3", category: "K", description: "Advisory Circulars (ACs)." },
          { code: "FI.II.J.K4", category: "K", description: "Aeronautical Information Services." },
          { code: "FI.II.J.R1", category: "R", description: "Failure to keep current with regulations and publications." },
          { code: "FI.II.J.S1", category: "S", description: "Locate and explain a specific regulation or publication." }
        ]
      }
    ]
  }
];
