import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SchemaViewer } from './schema-viewer';

describe(SchemaViewer.name, () => {
  it('renders JSON schema content', () => {
    render(
      <SchemaViewer
        label="Request schema"
        value={{
          properties: {
            email: {
              type: 'string',
            },
          },
          type: 'object',
        }}
      />,
    );

    expect(screen.getByText('Request schema')).toBeInTheDocument();
    expect(screen.getByText(/email/u)).toBeInTheDocument();
  });
});
