import { initialResumeState } from '@/types/resume';
import { stripImageMetadata } from '@/utils/imageMetadata';
import { sanitizeResumeData } from '@/utils/validation';
import { describe, expect, it } from 'vitest';

/**
 * A photo inside an imported file kept its EXIF — camera and GPS — byte for
 * byte, since only the editor's own upload re-encodes through a canvas.
 * Fixtures: 4x4 images written by Pillow with EXIF (camera "KiwiTestCam" and
 * GPS 52°31'12"N 13°24'18"E), plus a JPEG comment and a PNG text chunk. The
 * stripped files were checked to decode to identical pixels with no EXIF left.
 */
const FIXTURES = {
  jpeg: '/9j/4AAQSkZJRgABAQAAAQABAAD/4QCgRXhpZgAATU0AKgAAAAgAAgEPAAIAAAAMAAAAJoglAAQAAAABAAAAMgAAAABLaXdpVGVzdENhbQAABAABAAIAAAACTgAAAAACAAUAAAADAAAAaAADAAIAAAACRQAAAAAEAAUAAAADAAAAgAAAAAAAAAA0AAAAAQAAAB8AAAABAAAADAAAAAEAAAANAAAAAQAAABgAAAABAAAAEgAAAAH//gANS2l3aUNvbW1lbnT/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAEAAQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwCOiiivmj7A/9k=',
  png: 'iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAEnRFWHRBdXRob3IAS2l3aVRlc3RDYW2XoywuAAAAmGVYSWZNTQAqAAAACAACAQ8AAgAAAAwAAAAmiCUABAAAAAEAAAAyAAAAAEtpd2lUZXN0Q2FtAAAEAAEAAgAAAAJOAAAAAAIABQAAAAMAAABoAAMAAgAAAAJFAAAAAAQABQAAAAMAAACAAAAAAAAAADQAAAABAAAAHwAAAAEAAAAMAAAAAQAAAA0AAAABAAAAGAAAAAEAAAASAAAAAY3HADIAAAATSURBVHicYzyRYsQAA0xwFl4OAEX2AWas9RX6AAAAAElFTkSuQmCC',
  webp: 'UklGRtAAAABXRUJQVlA4WAoAAAAIAAAAAwAAAwAAVlA4TBEAAAAvA8AAAAdQsiJXpv+BiOh/AABFWElGmAAAAE1NACoAAAAIAAIBDwACAAAADAAAACaIJQAEAAAAAQAAADIAAAAAS2l3aVRlc3RDYW0AAAQAAQACAAAAAk4AAAAAAgAFAAAAAwAAAGgAAwACAAAAAkUAAAAABAAFAAAAAwAAAIAAAAAAAAAANAAAAAEAAAAfAAAAAQAAAAwAAAABAAAADQAAAAEAAAAYAAAAAQAAABIAAAAB',
};

/**
 * Review-found shapes (privacy review): a phone JPEG rotated by EXIF
 * Orientation 6, the same with a second EXIF-bearing JPEG appended after the
 * end of image (MPF / motion-photo trailers), and a JPEG with an APP11 (C2PA /
 * JUMBF) segment. Stripped, each decodes to identical pixels; the rotated ones
 * keep Orientation 6 and nothing else.
 */
const PHONE = {
  rotated:
    '/9j/4AAQSkZJRgABAQAAAQABAAD/4QCsRXhpZgAATU0AKgAAAAgAAwEPAAIAAAAMAAAAMgESAAMAAAABAAYAAIglAAQAAAABAAAAPgAAAABLaXdpVGVzdENhbQAABAABAAIAAAACTgAAAAACAAUAAAADAAAAdAADAAIAAAACRQAAAAAEAAUAAAADAAAAjAAAAAAAAAA0AAAAAQAAAB8AAAABAAAADAAAAAEAAAANAAAAAQAAABgAAAABAAAAEgAAAAH/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAACAAQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwCOiiivmj7A/9k=',
  trailer:
    '/9j/4AAQSkZJRgABAQAAAQABAAD/4QCsRXhpZgAATU0AKgAAAAgAAwEPAAIAAAAMAAAAMgESAAMAAAABAAYAAIglAAQAAAABAAAAPgAAAABLaXdpVGVzdENhbQAABAABAAIAAAACTgAAAAACAAUAAAADAAAAdAADAAIAAAACRQAAAAAEAAUAAAADAAAAjAAAAAAAAAA0AAAAAQAAAB8AAAABAAAADAAAAAEAAAANAAAAAQAAABgAAAABAAAAEgAAAAH/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAACAAQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwCOiiivmj7A/9n/2P/gABBKRklGAAEBAAABAAEAAP/hADJFeGlmAABNTQAqAAAACAABAQ8AAgAAAA8AAAAaAAAAAEtpd2lUcmFpbGVyQ2FtAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAACAAQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwCOiiivmj7A/9k=',
  app11:
    '/9j/6wAVSlAAAEtpd2lDMlBBLXNpZ25lcv/gABBKRklGAAEBAAABAAEAAP/bAEMACAYGBwYFCAcHBwkJCAoMFA0MCwsMGRITDxQdGh8eHRocHCAkLicgIiwjHBwoNyksMDE0NDQfJzk9ODI8LjM0Mv/bAEMBCQkJDAsMGA0NGDIhHCEyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMv/AABEIAAIABAMBIgACEQEDEQH/xAAfAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgv/xAC1EAACAQMDAgQDBQUEBAAAAX0BAgMABBEFEiExQQYTUWEHInEUMoGRoQgjQrHBFVLR8CQzYnKCCQoWFxgZGiUmJygpKjQ1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4eLj5OXm5+jp6vHy8/T19vf4+fr/xAAfAQADAQEBAQEBAQEBAAAAAAAAAQIDBAUGBwgJCgv/xAC1EQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/AI6KKK+aPsD/2Q==',
};

const decoded = (dataUrl: string) => atob(dataUrl.split(',')[1]);

describe('stripImageMetadata', () => {
  it.each(Object.entries(FIXTURES))('removes EXIF, GPS and text from %s', (type, base64) => {
    const input = `data:image/${type};base64,${base64}`;
    expect(decoded(input)).toContain('KiwiTestCam');

    const output = stripImageMetadata(input);
    expect(output.startsWith(`data:image/${type};base64,`)).toBe(true);
    expect(decoded(output)).not.toContain('KiwiTestCam');
    expect(decoded(output)).not.toContain('Exif');
    expect(decoded(output).length).toBeLessThan(decoded(input).length);
  });

  it('keeps the JPEG image data byte for byte from the start of scan', () => {
    const input = decoded(`data:image/jpeg;base64,${FIXTURES.jpeg}`);
    const output = decoded(stripImageMetadata(`data:image/jpeg;base64,${FIXTURES.jpeg}`));
    expect(output.slice(output.indexOf('\xff\xda'))).toBe(input.slice(input.indexOf('\xff\xda')));
  });

  it('drops a trailer after the end of image and an APP11 block, by allow list', () => {
    const trailer = decoded(stripImageMetadata(`data:image/jpeg;base64,${PHONE.trailer}`));
    expect(decoded(`data:image/jpeg;base64,${PHONE.trailer}`)).toContain('KiwiTrailerCam');
    expect(trailer).not.toContain('KiwiTrailerCam');
    expect(trailer.endsWith('\xff\xd9')).toBe(true);

    const app11 = decoded(stripImageMetadata(`data:image/jpeg;base64,${PHONE.app11}`));
    expect(app11).not.toContain('KiwiC2PA');
  });

  it('keeps the orientation, and only the orientation, of a rotated photo', () => {
    const output = decoded(stripImageMetadata(`data:image/jpeg;base64,${PHONE.rotated}`));
    expect(output).not.toContain('KiwiTestCam');
    // A minimal EXIF: II*, one IFD0 entry, tag 0x0112 = 6.
    expect(output).toContain('Exif\0\0II*\0\x08\0\0\0\x01\0\x12\x01\x03\0\x01\0\0\0\x06\0');
  });

  it('reads the format from the bytes, whatever the label says', () => {
    const output = stripImageMetadata(`data:image/JPEG;name=me.jpg;base64,${FIXTURES.jpeg}`);
    expect(output.startsWith('data:image/jpeg;base64,')).toBe(true);
    expect(decoded(output)).not.toContain('KiwiTestCam');
    expect(decoded(stripImageMetadata(`data:image/png;base64,${FIXTURES.jpeg}`))).not.toContain(
      'KiwiTestCam',
    );
  });

  it('returns anything it cannot parse unchanged', () => {
    for (const value of [
      '',
      'https://example.com/me.jpg',
      'data:image/jpeg;base64,!!!',
      'data:image/png;base64,AAAA',
    ]) {
      expect(stripImageMetadata(value)).toBe(value);
    }
  });

  it('runs on import, so a stored photo carries no metadata', () => {
    const raw = structuredClone(initialResumeState) as unknown as Record<
      string,
      Record<string, unknown>
    >;
    raw.basics.image = `data:image/jpeg;base64,${FIXTURES.jpeg}`;
    const { image } = sanitizeResumeData(raw).sanitized.basics;
    expect(decoded(image)).not.toContain('KiwiTestCam');
  });
});
