import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ApiMethodBadge } from './api-method-badge';

describe(ApiMethodBadge.name, () => {
  it('renders the HTTP method label', () => {
    render(<ApiMethodBadge method="POST" />);

    expect(screen.getByText('POST')).toBeInTheDocument();
  });
});
