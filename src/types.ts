export type Grade = '' | '1' | '2' | '3' | '4' | 'S' | 'N';

export interface LessonMeta {
  date?: string;
  aircraft?: string;
  notes?: string;
  route?: string;
  ldgTotal?: string;
  ldgDay?: string;
  ldgNight?: string;
  night?: string;
  simInst?: string;
  imc?: string;
  groundSim?: string;
  dual?: string;
  cfi?: string;
  pic?: string;
  totalFlight?: string;
  solo?: string;
  soloXc?: string;
  atd?: string;
  xcDual?: string;
  xcSolo?: string;
  xcPic?: string;
  atdInst?: string;
  nightDual?: string;
  nightTakeoffs?: string;
  nightPic?: string;
  nightSolo?: string;
  simDeviceType?: string;
  ftd?: string;
  ffs?: string;
  ftdInst?: string;
  ffsInst?: string;
  atdSE?: string;
  studentFlewSolo?: boolean;
  rating_code?: string;
  rating_label?: string;
  aircraftModel?: string;
  aircraftIcao?: string;
  ratpSimInst?: string;
  ratpActualInst?: string;
  ratpXCEligible?: boolean;
  ratpXCTime?: string;
  approachCount?: string;
  approachTypes?: string;
  holdPerformed?: boolean;
  cfiFlewApproaches?: boolean;
  cfiApproachCount?: string;
  cfiApproachTypes?: string;
  cfiHoldPerformed?: boolean;
  cfiDidLandings?: boolean;
  cfiDayLandings?: string;
  cfiNightLandings?: string;
  aircraftClass?: 'ASEL' | 'AMEL';
  mePic?: string;
  meDual?: string;
  meNight?: string;
  overallGrade?: string;
  lessonType?: string;
  studentActedAsSafetyPilot?: boolean;
  safetyPilotPic?: string;
}

export interface Lesson {
  id: string;
  user_id: string;
  student_name: string;
  type: 'ground' | 'flight';
  lesson_num: number;
  label: string;
  instructor: string;
  meta: LessonMeta;
  grades: Record<string, Grade>;
  notes: Record<string, string>;
  saved_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
}

export interface PassedRating {
  code: string;
  label: string;
  date: string;
}

export interface Student {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  current_rating: string;
  current_rating_label: string;
  checkride_passed_ratings: PassedRating[];
  deleted_at: string | null;
  deleted_by: string | null;
}

export interface ManualHoursEntry {
  val: number;
  date: string;
  completedDate?: string;
}

export interface ManualHours {
  id: string;
  user_id: string;
  student_name: string;
  field_key: string;
  entries: ManualHoursEntry[];
  total: number;
  updated_at: string;
}

export interface Endorsement {
  id: string;
  user_id: string;
  student_name: string;
  rating: string;
  endorsement_key: string;
  endorsement_label: string;
  completed: boolean;
  completed_date: string | null;
  created_at: string;
}

export interface ACSStandard {
  code: string;
  category: 'K' | 'R' | 'S';
  description: string;
}

export interface ACSTask {
  name: string;
  code: string;
  references: string;
  objective: string;
  stds: ACSStandard[];
}

export interface ACSArea {
  area: string;
  tasks: ACSTask[];
}
