import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '../empty-state';
import '@testing-library/jest-dom';

describe('EmptyState', () => {
  const mockOnRefresh = jest.fn();
  const mockActionOnClick = jest.fn();

  const defaultProps = {
    title: 'No items found',
    description: 'There are no items to display',
    onRefresh: mockOnRefresh,
  };

  beforeEach(() => {
    mockOnRefresh.mockClear();
    mockActionOnClick.mockClear();
  });

  it('renders title and description', () => {
    render(<EmptyState {...defaultProps} />);
    
    expect(screen.getByText('No items found')).toBeInTheDocument();
    expect(screen.getByText('There are no items to display')).toBeInTheDocument();
  });

  it('renders refresh button when onRefresh is provided', () => {
    render(<EmptyState {...defaultProps} />);
    
    expect(screen.getByText('Обновить данные')).toBeInTheDocument();
  });

  it('calls onRefresh when refresh button is clicked', () => {
    render(<EmptyState {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Обновить данные'));
    expect(mockOnRefresh).toHaveBeenCalledTimes(1);
  });

  it('renders primary action when provided', () => {
    const action = {
      label: 'Create Item',
      onClick: mockActionOnClick,
    };
    
    render(<EmptyState {...defaultProps} action={action} />);
    
    expect(screen.getByText('Create Item')).toBeInTheDocument();
  });

  it('calls action onClick when action button is clicked', () => {
    const action = {
      label: 'Create Item',
      onClick: mockActionOnClick,
    };
    
    render(<EmptyState {...defaultProps} action={action} />);
    
    fireEvent.click(screen.getByText('Create Item'));
    expect(mockActionOnClick).toHaveBeenCalledTimes(1);
  });

  it('renders details when provided', () => {
    const details = {
      totalItems: 0,
      dataType: 'array',
      isArray: true,
      additionalInfo: 'loaded data',
    };
    
    render(<EmptyState {...defaultProps} details={details} />);
    
    expect(screen.getByText('Всего: 0')).toBeInTheDocument();
    expect(screen.getByText('Тип: array')).toBeInTheDocument();
    expect(screen.getByText('Массив')).toBeInTheDocument();
    expect(screen.getByText('loaded data')).toBeInTheDocument();
  });

  it('hides details when showDetails is false', () => {
    const details = {
      totalItems: 0,
      dataType: 'array',
      isArray: true,
    };
    
    render(<EmptyState {...defaultProps} details={details} showDetails={false} />);
    
    expect(screen.queryByText('Всего: 0')).not.toBeInTheDocument();
  });

  it('logs to console when refresh is triggered', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    render(<EmptyState {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Обновить данные'));
    
    expect(consoleSpy).toHaveBeenCalledWith(
      '🔄 EmptyState: Forced refresh triggered',
      expect.any(Object)
    );
    
    consoleSpy.mockRestore();
  });
});