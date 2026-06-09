import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ApiRiskBadge } from './api-risk-badge';

describe(ApiRiskBadge.name, () => {
  it('renders the severity label', () => {
    render(<ApiRiskBadge severity="HIGH" />);

    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });
});
