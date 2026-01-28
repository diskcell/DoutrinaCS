
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
  id: string; // UUID agora
  title: string;
  duration: string;
  status: 'completed' | 'available' | 'locked';
  video_url?: string; // Alterado para snake_case para bater com o Supabase
  description?: string; // Descrição da aula
  module_id?: string;
  order?: number;
}

export interface ModuleStatus {
  id: string; // UUID agora
  title: string;
  progress: number;
  lessons: LessonStatus[];
  order?: number;
}

export interface Notice {
  id: number;
  text: string;
  date: string;
}

export interface UserProfile {
  id: string;
  role: 'student' | 'admin';
  has_purchased?: boolean; // Alterado de approved para has_purchased
  name?: string;           // Alterado de full_name para name
  email?: string;
  created_at?: string;
}