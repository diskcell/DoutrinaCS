
export interface NavItem {
  label: string;
  href: string;
}

export interface Feature {
  id: number;
  text: string;
  highlight?: boolean;
}

export interface Milestone {
  level: number;
  label: string;
  description: string;
  icon: 'silver' | 'ak' | 'global' | 'pro';
}

export interface LessonStatus {
  id: string;
  title: string;
  duration: string;
  status: 'completed' | 'available' | 'locked';
  video_url?: string;
  video_id?: string;
  cover_url?: string;
  description?: string;
  module_id?: string;
  order?: number;
}

export interface ModuleStatus {
  id: string;
  title: string;
  progress: number;
  lessons: LessonStatus[];
  order?: number;
  isLocked?: boolean;
}

export interface Notice {
  id: number;
  text: string;
  date: string;
  type?: 'patch' | 'alert' | 'meta' | 'info';
  link?: string;
}

export interface UserProfile {
  id: string;
  role: 'student' | 'admin';
  has_purchased?: boolean; 
  name?: string;           
  email?: string;
  created_at?: string;
  accessible_modules?: string[];
  rank?: string;
  total_xp?: number;
}
