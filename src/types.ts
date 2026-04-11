export type Grade = '' | 'S' | 'N' | 'I';

export interface LessonMeta {
  date?: string;
  aircraft?: string;
  notes?: string;
  route?: string;
  ldgTotal?: string;
  ldgDay?: string;
  ldgNight?: string;
  xc?: string;
  night?: string;
  simInst?: string;
  imc?: string;
  groundSim?: string;
  dual?: string;
  cfi?: string;
  sic?: string;
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
  nightTakeoffsPic?: string;
  nightLandingsPic?: string;
  ftd?: string;
  ffs?: string;
  atdSE?: string;
  studentFlewSolo?: boolean;
  rating_code?: string;
  rating_label?: string;
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

export interface ACSTask {
  id: string;
  area: string;
  task: string;
  ai: number;
  ti: number;
  stds?: string[];
}

export interface ACSArea {
  area: string;
  tasks: string[];
}
