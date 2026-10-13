import { useResumeStore } from '@/store/resume/useResumeStore';
import { useImportWarningsStore } from '@/store/ui/useImportWarningsStore';
import type { ResumeData } from '@/types/resume';
import { preProcessResumeData } from '@/utils/image-processing';
import { reencodeAsJpeg } from '@/utils/imageReencode';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The synchronous stripper fails open, so import routes every `data:`
 * photo it cannot parse through a canvas re-encode, and drops one the browser
 * cannot decode either. jsdom has no canvas, so the decode/encode boundary is
 * mocked; `image-processing.test.ts` covers the helper itself.
 */
vi.mock('@/utils/imageReencode', () => ({ reencodeAsJpeg: vi.fn() }));

const REENCODED = 'data:image/jpeg;base64,UkVFTkNPREVE';
const reencode = vi.mocked(reencodeAsJpeg);

/** 4x4 PNG carrying EXIF and a text chunk; the stripper parses it. */
const PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAEnRFWHRBdXRob3IAS2l3aVRlc3RDYW2XoywuAAAAmGVYSWZNTQAqAAAACAACAQ8AAgAAAAwAAAAmiCUABAAAAAEAAAAyAAAAAEtpd2lUZXN0Q2FtAAAEAAEAAgAAAAJOAAAAAAIABQAAAAMAAABoAAMAAgAAAAJFAAAAAAQABQAAAAMAAACAAAAAAAAAADQAAAABAAAAHwAAAAEAAAAMAAAAAQAAAA0AAAABAAAAGAAAAAEAAAASAAAAAY3HADIAAAATSURBVHicYzyRYsQAA0xwFl4OAEX2AWas9RX6AAAAAElFTkSuQmCC';
const toDataUrl = (mime: string, bytes: string) => `data:${mime};base64,${btoa(bytes)}`;
/** A GIF header followed by an XMP application extension. */
const GIF = toDataUrl('image/gif', 'GIF89a\x01\x00\x01\x00\x00\x00\x00!\xffXMP DataXMP');
/** An ISOBMFF `ftyp heic` box: HEIC, whatever its label says. */
const HEIC = toDataUrl('image/jpeg', '\x00\x00\x00\x18ftypheic\x00\x00\x00\x00mif1heic');
const SVG = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22/%3E';

const withImage = (image: string): Partial<ResumeData> => ({
  basics: { name: 'Ada', image } as ResumeData['basics'],
});

beforeEach(() => {
  reencode.mockReset();
  reencode.mockResolvedValue(REENCODED);
});

describe('preProcessResumeData — data: photos', () => {
  it('leaves a JPEG, PNG or WebP the stripper parses to the lossless strip', async () => {
    const input = withImage(PNG);

    expect(await preProcessResumeData(input)).toEqual({ data: input, warnings: [] });
    expect(reencode).not.toHaveBeenCalled();
  });

  it.each([
    ['a GIF', GIF],
    ['HEIC labelled as JPEG', HEIC],
    ['a PNG the stripper cannot parse', PNG.slice(0, 80)],
    ['a non-base64 SVG', SVG],
  ])('re-encodes %s as a JPEG', async (_label, image) => {
    const result = await preProcessResumeData(withImage(image));

    expect(reencode).toHaveBeenCalledWith(image);
    expect(result.data.basics?.image).toBe(REENCODED);
    expect(result.data.basics?.name).toBe('Ada');
    expect(result.warnings).toEqual([]);
  });

  it('drops a photo the browser cannot decode, with an import warning', async () => {
    reencode.mockResolvedValue(null);
    const result = await preProcessResumeData(withImage(GIF));

    expect(result.data.basics?.image).toBe('');
    expect(result.warnings).toEqual([
      { section: 'basics', field: 'image', message: 'editor.photo.conversion_failed' },
    ]);
  });
});

describe('setResume — warnings raised before it', () => {
  it('reports a dropped photo with its own warnings and shows it', async () => {
    reencode.mockResolvedValue(null);
    const { data, warnings: imageWarnings } = await preProcessResumeData(withImage(GIF));

    const { warnings } = useResumeStore.getState().setResume(data, { warnings: imageWarnings });

    expect(warnings).toContainEqual(imageWarnings[0]);
    expect(useImportWarningsStore.getState().warnings).toContainEqual(imageWarnings[0]);
  });
});
