import type { CVLocaleMetadata } from '@/components/preview/themes/shared';
import type { ResumeData } from '@/types/resume';
import { isOngoingEndDate } from '@/utils/ongoingDate';

/**
 * One entry's content, mapped once per section and read by every renderer of
 * that section, so no column or output picks different fields. Work, Projects
 * and Volunteer feed HTML `TimelineEntry`/`SideTimelineEntry` and Typst `mainTimelineRow`/`sideEntry`. Education, Awards, Certificates and
 * Publications are drawn as cards, so they share only the mapping: each row
 * builder feeds both HTML placements and its Typst `serialize*`. Skills,
 * Languages, Interests and References have no row: they read their item fields
 * directly, with levels and labels from `themes/shared`.
 */
export interface SkylineTimelineRow {
  title: string;
  subtitle?: string;
  location?: string;
  date: string;
  summary?: string;
  highlights?: string[];
  url?: string;
  isPresent: boolean;
}

/** The line under an entry's title: subtitle and location. */
export const subtitleLine = ({
  subtitle,
  location,
}: Pick<SkylineTimelineRow, 'subtitle' | 'location'>): string =>
  [subtitle, location].filter(Boolean).join(' · ');

type FormatDateRange = (start?: string, end?: string) => string;

export function workTimelineRow(
  job: ResumeData['work'][number],
  cvLocale: CVLocaleMetadata,
  formatCVDateRange: FormatDateRange,
): SkylineTimelineRow {
  const company = cvLocale.boldHeaderWork === 'company';
  return {
    title: company ? job.name : job.position,
    subtitle: company ? job.position : job.name,
    location: job.location,
    date: formatCVDateRange(job.startDate, job.endDate),
    summary: job.summary,
    highlights: job.highlights,
    url: job.url,
    isPresent: isOngoingEndDate(job.endDate),
  };
}

export function projectTimelineRow(
  project: ResumeData['projects'][number],
  formatCVDateRange: FormatDateRange,
): SkylineTimelineRow {
  return {
    title: project.name,
    subtitle: [project.entity, project.type].filter(Boolean).join(' — '),
    location: project.location,
    date: formatCVDateRange(project.startDate, project.endDate),
    summary: project.description,
    highlights: project.highlights,
    url: project.url,
    isPresent: isOngoingEndDate(project.endDate),
  };
}

export function volunteerTimelineRow(
  volunteer: ResumeData['volunteer'][number],
  formatCVDateRange: FormatDateRange,
): SkylineTimelineRow {
  return {
    title: volunteer.position,
    subtitle: volunteer.organization,
    location: volunteer.location,
    date: formatCVDateRange(volunteer.startDate, volunteer.endDate),
    summary: volunteer.summary,
    highlights: volunteer.highlights,
    url: volunteer.url,
    isPresent: isOngoingEndDate(volunteer.endDate),
  };
}

/** An education entry: no summary, highlights or ongoing dot; score and courses instead. */
export interface SkylineEducationRow extends Pick<
  SkylineTimelineRow,
  'title' | 'subtitle' | 'location' | 'date' | 'url'
> {
  score?: string;
  courses?: string[];
}

export function educationTimelineRow(
  edu: ResumeData['education'][number],
  cvLocale: CVLocaleMetadata,
  formatCVDateRange: FormatDateRange,
): SkylineEducationRow {
  const degree = (separator: string) => [edu.studyType, edu.area].filter(Boolean).join(separator);
  const company = cvLocale.boldHeaderEducation === 'company';
  return {
    title: company ? edu.institution : degree(' '),
    subtitle: company ? degree(' — ') : edu.institution,
    location: edu.location,
    date: formatCVDateRange(edu.startDate, edu.endDate),
    score: edu.score,
    courses: edu.courses,
    url: edu.url,
  };
}

/** An award, certificate or publication: one date, no highlights or ongoing dot. */
export type SkylineCompactRow = Pick<
  SkylineTimelineRow,
  'title' | 'subtitle' | 'location' | 'date' | 'summary' | 'url'
>;

type FormatDate = (date?: string) => string;

const singleDate = (date: string | undefined, formatCVDate: FormatDate) =>
  date ? formatCVDate(date) : '';

export function awardRow(
  award: ResumeData['awards'][number],
  formatCVDate: FormatDate,
): SkylineCompactRow {
  return {
    title: award.title,
    subtitle: award.awarder,
    location: award.location,
    date: singleDate(award.date, formatCVDate),
    summary: award.summary,
    url: award.url,
  };
}

export function certificateRow(
  cert: ResumeData['certificates'][number],
  formatCVDate: FormatDate,
): SkylineCompactRow {
  return {
    title: cert.name,
    subtitle: cert.issuer,
    date: singleDate(cert.date, formatCVDate),
    url: cert.url,
  };
}

export function publicationRow(
  pub: ResumeData['publications'][number],
  formatCVDate: FormatDate,
): SkylineCompactRow {
  return {
    title: pub.name,
    subtitle: pub.publisher,
    date: singleDate(pub.releaseDate, formatCVDate),
    summary: pub.summary,
    url: pub.url,
  };
}
