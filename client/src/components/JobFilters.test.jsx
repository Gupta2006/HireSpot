import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import JobFilters from './JobFilters';

function FilterHarness({ onSearch }) {
  const [filters, setFilters] = useState({ role: '', location: '', skills: '', minExp: '', ctc: '', workMode: '' });
  const updateFilter = (event) => setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  return <JobFilters filters={filters} setFilters={updateFilter} onSearch={onSearch} />;
}

describe('JobFilters', () => {
  it('keeps the filter inputs controlled and submits the search form', () => {
    const onSearch = vi.fn();
    render(<FilterHarness onSearch={onSearch} />);

    const role = screen.getByLabelText('Role');
    fireEvent.change(role, { target: { name: 'role', value: 'Developer' } });
    expect(role).toHaveValue('Developer');

    fireEvent.submit(role.closest('form'));
    expect(onSearch).toHaveBeenCalledOnce();
  });
});
