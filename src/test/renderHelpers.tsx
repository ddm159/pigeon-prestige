import React, { type ReactElement } from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { AllTheProviders } from './providers';
import type { AuthContextType } from '../contexts/AuthContext';

// Simple render function without providers
export const simpleRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { ...options });

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authContextValue?: AuthContextType;
}

function makeWrapper(authContextValue?: AuthContextType) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <AllTheProviders authContextValue={authContextValue}>{children}</AllTheProviders>;
  };
}

export const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions,
) => {
  const { authContextValue, ...rest } = options || {};
  const Wrapper = makeWrapper(authContextValue);
  return render(ui, { wrapper: Wrapper, ...rest });
};

export { render } from '@testing-library/react'; 