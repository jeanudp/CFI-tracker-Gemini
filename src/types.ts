export type Grade = '' | '1' | '2' | '3' | '4' | 'S' | 'N';

export interface ACSStandard {
  code: string;
  category: string;
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

export interface LessonMeta {
  date: string;
  notes: string;
  rating_code?: string;
  rating_label?: string;
  overallGrade?: '' | 'S' | 'N';
  [key: string]: any;
}
