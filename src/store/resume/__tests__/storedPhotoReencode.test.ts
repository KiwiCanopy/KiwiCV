// @vitest-environment jsdom
// Driven through the store's real load path, so `localStorage` has to exist.
import { useResumeStore } from '@/store/resume/useResumeStore';
import { buildSingleItemResume } from '@/test/singleItemResume';
import type { ResumeData } from '@/types/resume';
import { stripImageMetadata } from '@/utils/imageMetadata';
import { reencodeAsJpeg } from '@/utils/imageReencode';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/utils/imageReencode', () => ({ reencodeAsJpeg: vi.fn() }));

/**
 * A photo stored by an older build in a format the synchronous stripper cannot
 * parse kept its metadata in storage, backups and PDFs. Rehydrate now re-encodes
 * it once; an undecodable one is kept, never dropped on load.
 */

const STORAGE_KEY = 'resume-storage';
const PERSISTED_VERSION = useResumeStore.persist.getOptions().version as number;

const GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
/** 4x4 images with EXIF, as in `imageMetadata.test.ts`; the stripper parses both. */
const JPEG =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4QCgRXhpZgAATU0AKgAAAAgAAgEPAAIAAAAMAAAAJoglAAQAAAABAAAAMgAAAABLaXdpVGVzdENhbQAABAABAAIAAAACTgAAAAACAAUAAAADAAAAaAADAAIAAAACRQAAAAAEAAUAAAADAAAAgAAAAAAAAAA0AAAAAQAAAB8AAAABAAAADAAAAAEAAAANAAAAAQAAABgAAAABAAAAEgAAAAH//gANS2l3aUNvbW1lbnT/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAEAAQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwCOiiivmj7A/9k=';
const PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAEnRFWHRBdXRob3IAS2l3aVRlc3RDYW2XoywuAAAAmGVYSWZNTQAqAAAACAACAQ8AAgAAAAwAAAAmiCUABAAAAAEAAAAyAAAAAEtpd2lUZXN0Q2FtAAAEAAEAAgAAAAJOAAAAAAIABQAAAAMAAABoAAMAAgAAAAJFAAAAAAQABQAAAAMAAACAAAAAAAAAADQAAAABAAAAHwAAAAEAAAAMAAAAAQAAAA0AAAABAAAAGAAAAAEAAAASAAAAAY3HADIAAAATSURBVHicYzyRYsQAA0xwFl4OAEX2AWas9RX6AAAAAElFTkSuQmCC';

const mockedReencode = vi.mocked(reencodeAsJpeg);

function storePhoto(image: string) {
  const resume: ResumeData = buildSingleItemResume('lunar');
  resume.basics.image = image;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ state: { resume, ai: { suggestions: {} } }, version: PERSISTED_VERSION }),
  );
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
const photo = () => useResumeStore.getState().resume.basics.image;
const storedPhoto = () =>
  JSON.parse(localStorage.getItem(STORAGE_KEY) as string).state.resume.basics.image;

beforeEach(() => {
  localStorage.clear();
  mockedReencode.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('stored photo re-encode on rehydrate', () => {
  it('replaces a stored GIF with the re-encoded JPEG and persists it', async () => {
    mockedReencode.mockResolvedValue(JPEG);
    storePhoto(GIF);

    await useResumeStore.persist.rehydrate();
    await flush();

    expect(mockedReencode).toHaveBeenCalledWith(GIF);
    expect(photo()).toBe(JPEG);
    expect(storedPhoto()).toBe(JPEG);
  });

  it('leaves a stored PNG the stripper parses to the stripper', async () => {
    storePhoto(PNG);

    await useResumeStore.persist.rehydrate();
    await flush();

    expect(mockedReencode).not.toHaveBeenCalled();
    expect(photo()).toBe(stripImageMetadata(PNG));
  });

  it('keeps an undecodable photo and warns', async () => {
    mockedReencode.mockResolvedValue(null);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    storePhoto(GIF);

    await useResumeStore.persist.rehydrate();
    await flush();

    expect(photo()).toBe(GIF);
    expect(storedPhoto()).toBe(GIF);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('runs once: overlapping and later loads do not re-encode again', async () => {
    mockedReencode.mockResolvedValue(JPEG);
    storePhoto(GIF);

    await useResumeStore.persist.rehydrate();
    await useResumeStore.persist.rehydrate();
    await flush();
    await useResumeStore.persist.rehydrate();
    await flush();

    expect(mockedReencode).toHaveBeenCalledTimes(1);
    // The fixture carries EXIF, so the next load's synchronous strip still applies.
    expect(photo()).toBe(stripImageMetadata(JPEG));
  });

  it('does not overwrite a photo replaced while the re-encode ran', async () => {
    let settle: (value: string | null) => void = () => {};
    mockedReencode.mockReturnValue(new Promise((resolve) => (settle = resolve)));
    storePhoto(GIF);

    await useResumeStore.persist.rehydrate();
    useResumeStore.getState().updateBasics({ image: JPEG });
    settle('data:image/jpeg;base64,cmVlbmNvZGVk');
    await flush();

    expect(photo()).toBe(JPEG);
  });
});
