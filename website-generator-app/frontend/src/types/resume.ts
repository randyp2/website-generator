export interface ParsedExperience {
  rawBlock: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  location: string | null;
  bullets: string[];
}

export interface ParsedProject {
  rawBlock: string;
  header: string;
  bullets: string[] | null;
  link: string | null;
}

export interface ParsedEducation {
  institution: string;
  degree: string;
  startDate: string | null;
  endDate: string;
  gpa: string | null;
  awards: string | null;
  courseWork: string | null;
}

export interface ParsedResumeData {
  normalizedText: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string[];
  experiences: ParsedExperience[];
  projects: ParsedProject[];
  educations: ParsedEducation[];

  // Parsing metadata
  confidenceScore?: number;
  parsingMethod?: 'regex' | 'llm' | 'regex_low_confidence';
}
