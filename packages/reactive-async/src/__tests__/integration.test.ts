import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { signal } from '@eficy/reactive';
import Eficy, { IViewData } from '@eficy/core';
import { asyncSignal } from '../core/asyncSignal';

beforeEach(() => {
  cleanup();
});

export const getEficy = () => {
  const eficy = new Eficy();

  return eficy;
};

const mockService = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('test');
    }, 10);
  });
};

describe('asyncSignal 与 Eficy 集成', () => {
  describe('基础集成', () => {
    it('should render a loading state', async () => {
      const request = asyncSignal(mockService);
      const eficy = getEficy();
      const element = await eficy.createElement({
        views: [
          {
            '#': 'test',
            '#view': 'div',
            '#content': request.computed((state) => (state.loading ? 'Loading...' : state.data)),
          },
        ],
      });

      render(element);

      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('test')).toBeInTheDocument();
      });
    });
  });
});
