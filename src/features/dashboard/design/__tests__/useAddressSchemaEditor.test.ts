// @vitest-environment jsdom
import { useAddressSchemaEditor } from '@/features/dashboard/design/helpers/useAddressSchemaEditor';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const CUSTOM_FIELDS = [
  { field: 'address', separator: ',' },
  { field: 'postalCode', separator: ' ' },
  { field: 'city', separator: ',' },
] as const;

const fieldOrder = (fields: { field: string }[]) => fields.map((entry) => entry.field);

const storedFields = () =>
  useResumeStore.getState().resume.meta.theme.params?.addressSchema?.customFields ?? [];

describe('useAddressSchemaEditor drag cancellation', () => {
  let initialState: ReturnType<typeof useResumeStore.getState>;

  beforeEach(() => {
    initialState = useResumeStore.getState();
    const resume = initialState.resume;
    useResumeStore.setState({
      resume: {
        ...resume,
        meta: {
          ...resume.meta,
          theme: {
            ...resume.meta.theme,
            params: {
              ...resume.meta.theme.params,
              addressSchema: { mode: 'custom', customFields: [...CUSTOM_FIELDS] },
            },
          },
        },
      },
    });
  });

  afterEach(() => {
    useResumeStore.setState(initialState, true);
  });

  it('restores the mirror when a drag is cancelled', () => {
    const { result } = renderHook(() => useAddressSchemaEditor());

    expect(fieldOrder(result.current.localCustomFields)).toEqual(['address', 'postalCode', 'city']);

    // Dragging over reorders the mirror live, before anything is persisted.
    act(() => {
      result.current.handleDragOver({
        active: { id: 'address' },
        over: { id: 'city' },
      } as never);
    });

    expect(fieldOrder(result.current.localCustomFields)).toEqual(['postalCode', 'city', 'address']);
    expect(fieldOrder(storedFields())).toEqual(['address', 'postalCode', 'city']);

    // Escape fires onDragCancel, never onDragEnd.
    act(() => {
      result.current.handleDragCancel();
    });

    expect(fieldOrder(result.current.localCustomFields)).toEqual(['address', 'postalCode', 'city']);
  });

  it('does not let a cancelled drag leak into a later unrelated edit', async () => {
    const { result } = renderHook(() => useAddressSchemaEditor());

    act(() => {
      result.current.handleDragOver({
        active: { id: 'address' },
        over: { id: 'city' },
      } as never);
    });
    act(() => {
      result.current.handleDragCancel();
    });

    // A separator change rebuilds from the mirror and persists it. Before the
    // cancel handler existed, this committed the abandoned drag order.
    act(() => {
      result.current.handleUpdateSeparator(0, '-');
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(fieldOrder(storedFields())).toEqual(['address', 'postalCode', 'city']);
  });
});
