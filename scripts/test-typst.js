import { serializeToTypst } from '../src/components/preview/themes/oneColumn/plain/PlainSerializer.js';

const mockData = {
  meta: {
    theme: {
      name: 'plain',
      params: {
        palette: 'default',
        fontSizeScale: 1,
        imageShape: 'circle',
      },
    },
  },
  basics: {
    name: 'John Doe',
    label: 'Software Engineer',
    email: 'john@example.com',
    phone: '123-456-7890',
    url: 'example.com',
    summary: 'Experienced software engineer.',
    image: 'mock-image-data',
    location: {
      address: '123 Main St',
      postalCode: '12345',
      city: 'Berlin',
      countryCode: 'DE',
    },
    profiles: [],
  },
  work: [
    {
      name: 'Acme Corp',
      position: 'Senior Developer',
      startDate: '2020-01-01',
      endDate: '2023-01-01',
      summary: 'Developed cool stuff.',
      highlights: ['Led a team of 5', 'Improved speed by 50%'],
    },
  ],
  education: [
    {
      institution: 'University of Science',
      studyType: 'Bachelor',
      area: 'Computer Science',
      startDate: '2016-01-01',
      endDate: '2019-12-31',
      score: '1.3',
      courses: ['Algorithms', 'Data Structures'],
    },
  ],
  skills: [
    {
      name: 'TypeScript',
      level: 'advanced',
      keywords: ['React', 'Node'],
    },
  ],
  languages: [
    {
      language: 'English',
      level: 'fluent',
    },
  ],
  projects: [
    {
      name: 'Project Alpha',
      startDate: '2022-01-01',
      endDate: '2022-06-01',
      description: 'A great project.',
      highlights: ['React', 'Vite'],
    },
  ],
  interests: [],
  references: [],
};

try {
  const markup = serializeToTypst(mockData);
  console.log('--- GENERATED TYPST MARKUP ---');
  console.log(markup);
  console.log('------------------------------');
  console.log('Success generating markup!');
} catch (err) {
  console.error('Error generating markup:', err);
}
