import React from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { VagonDaraDashboard } from '../vagon-dara/vagon-dara-dashboard';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
  URL.createObjectURL = vi.fn(() => 'blob:test-image');
  URL.revokeObjectURL = vi.fn();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('reads wagon photo and immediately resolves canonical tare specs', async () => {
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({
      ok: true,
      warnings: [],
      wagons: [
        {
          rawText: '33 84 4796 100-8',
          regime: '3384',
          serial: '4796',
          wagonNo: '100-8',
          confidence: 0.78,
          confidenceWarning: 'Okumayı kontrol edin',
        },
      ],
    }),
  } as Response);

  render(
    <VagonDaraDashboard
      wagonLookup={{
        '4796': { seri: '4796', vagon: 'TEST-WAGON', dara: 20, dingil: 4, uzunluk: 14 },
      }}
    />
  );

  fireEvent.change(screen.getByLabelText('Vagon fotoğrafı seç'), {
    target: { files: [new File(['img'], 'wagon.png', { type: 'image/png' })] },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Numaraları Oku' }));

  // Automatically resolves canonical type and tare without blocking review
  await screen.findByText('TEST-WAGON');
  expect(screen.getByText('Okumayı kontrol edin')).toBeTruthy();
  expect((screen.getByLabelText('1. vagon numarası') as HTMLInputElement).value).toBe('100-8');

  // User edits wagon number
  fireEvent.change(screen.getByLabelText('1. vagon numarası'), { target: { value: '100-9' } });
  expect((screen.getByLabelText('1. vagon numarası') as HTMLInputElement).value).toBe('100-9');
  expect(screen.getByText('TEST-WAGON')).toBeTruthy();
});

it('does not invent a missing regime and populates parsed serial', async () => {
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: async () => ({
      ok: true,
      warnings: ['Bir satır okunamadı.'],
      wagons: [
        {
          rawText: '4796 100-8',
          regime: '',
          serial: '4796',
          wagonNo: '100-8',
          confidence: 0.95,
        },
      ],
    }),
  } as Response);

  render(<VagonDaraDashboard wagonLookup={{}} />);
  const dropzone = screen.getByRole('button', { name: /Görsel yüklemek/ });
  fireEvent.drop(dropzone, {
    dataTransfer: { files: [new File(['img'], 'wagon.png', { type: 'image/png' })] },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Numaraları Oku' }));

  await screen.findByText('Bir satır okunamadı.');
  expect((screen.getByLabelText('1. vagon serisi') as HTMLInputElement).value).toBe('4796');
});

it('reports service errors without adding rows, and releases image previews', async () => {
  vi.mocked(fetch).mockResolvedValue({
    ok: false,
    json: async () => ({ ok: false, error: 'Servis kapalı.' }),
  } as Response);

  const view = render(<VagonDaraDashboard wagonLookup={{}} />);
  fireEvent.change(screen.getByLabelText('Vagon fotoğrafı seç'), {
    target: { files: [new File(['img'], 'wagon.png', { type: 'image/png' })] },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Numaraları Oku' }));

  await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Servis kapalı.'));
  expect(screen.queryByLabelText('1. vagon rejimi')).toBeNull();
  view.unmount();
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-image');
});
