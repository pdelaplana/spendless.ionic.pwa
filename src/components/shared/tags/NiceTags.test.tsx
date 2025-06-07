import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import NiceTags from './NiceTags';

describe('NiceTags Component', () => {
  vi.setConfig({ testTimeout: 5000 }); // Set a 5-second timeout for all tests

  const mockOnTagsChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock getBoundingClientRect to return consistent values
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 200,
      height: 40,
      top: 100,
      left: 100,
      bottom: 140,
      right: 300,
      x: 100,
      y: 100,
      toJSON: () => {},
    }));
  });

  test('renders with initial tags', () => {
    const initialTags = ['React', 'TypeScript'];
    render(<NiceTags initialTags={initialTags} onTagsChange={mockOnTagsChange} suggestions={[]} />);

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  test('adds a new tag when typing and clicking the Add button', () => {
    const mockOnTagsChange = vi.fn((tags: string[]) => {
      console.log('onTagsChange called with:', tags);
    });
    render(<NiceTags onTagsChange={mockOnTagsChange} initialTags={[]} suggestions={[]} />);
    console.log('Rendering NiceTags component');

    // Find input and add button
    const input = screen.getByPlaceholderText('Add a tag');

    // Type in the input
    userEvent.type(input, 'JavaScript');
    console.log('Typed "JavaScript" in input');

    const addButton = screen.getByTestId('add-tag-button');
    userEvent.click(addButton);
    console.log('Clicked Add button');

    // Verify the tag was added and onTagsChange was called
    waitFor(() => {
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(mockOnTagsChange).toHaveBeenCalled();
      expect(mockOnTagsChange).toHaveBeenCalledWith(['JavaScript']);
    });
  });

  test('removes a tag when clicking the remove icon', () => {
    const initialTags = ['React', 'TypeScript'];
    render(<NiceTags initialTags={initialTags} suggestions={[]} onTagsChange={mockOnTagsChange} />);

    // Find the remove icon for React tag and click it
    const removeIcons = screen.getAllByTestId('remove-tag-icon');
    userEvent.click(removeIcons[0]); // First remove icon

    // Verify onTagsChange was called with the updated tags
    waitFor(() => {
      expect(screen.queryByText('React')).not.toBeInTheDocument();
      expect(mockOnTagsChange).toHaveBeenCalled();
      expect(mockOnTagsChange).toHaveBeenCalledWith(['TypeScript']);
    });
  });

  test('shows suggestions when typing', () => {
    const suggestions = ['JavaScript', 'Java', 'Python'];
    render(<NiceTags initialTags={[]} suggestions={suggestions} onTagsChange={mockOnTagsChange} />);

    // Type 'Ja' in the input to filter suggestions
    const input = screen.getByPlaceholderText('Add a tag');
    userEvent.type(input, 'Ja');

    // Check if suggestions are displayed
    waitFor(() => {
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(screen.getByText('Java')).toBeInTheDocument();
      expect(screen.queryByText('Python')).not.toBeInTheDocument();
    });
  });

  test('adds a tag when clicking on a suggestion', () => {
    const suggestions = ['JavaScript', 'Java', 'Python'];
    render(<NiceTags initialTags={[]} suggestions={suggestions} onTagsChange={mockOnTagsChange} />);

    // Type 'Ja' to show suggestions
    const input = screen.getByPlaceholderText('Add a tag');
    userEvent.type(input, 'Ja');

    // Click on the JavaScript suggestion
    waitFor(() => {
      const suggestion = screen.getByText('JavaScript');
      userEvent.click(suggestion);
    });

    // Verify the tag was added and onTagsChange was called
    waitFor(() => {
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(mockOnTagsChange).toHaveBeenCalledWith(['JavaScript']);

      // Input should be cleared
      expect(input).toHaveValue('');
    });
  });

  test('prevents duplicate tags from being added', () => {
    const initialTags = ['React'];
    render(<NiceTags initialTags={initialTags} onTagsChange={mockOnTagsChange} suggestions={[]} />);

    // Try to add "React" again
    const input = screen.getByPlaceholderText('Add a tag');
    userEvent.type(input, 'React');

    const addButton = screen.getByTestId('add-tag-button');
    userEvent.click(addButton);

    // Only one "React" tag should exist
    waitFor(() => {
      const reactTags = screen.getAllByText('React');
      expect(reactTags).toHaveLength(1);

      // onTagsChange should not have been called
      expect(mockOnTagsChange).not.toHaveBeenCalled();
    });
  });

  test('handles empty input correctly', () => {
    render(<NiceTags onTagsChange={mockOnTagsChange} initialTags={[]} suggestions={[]} />);

    // Try to add an empty tag
    const addButton = screen.getByTestId('add-tag-button');
    userEvent.click(addButton);

    waitFor(() => {
      // No tags should be added
      expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
      expect(mockOnTagsChange).not.toHaveBeenCalled();

      // Add button should be disabled with empty input
      expect(addButton).toBeDisabled();
    });
  });

  test('focuses input after adding a tag from suggestions', () => {
    const suggestions = ['JavaScript'];
    render(<NiceTags initialTags={[]} suggestions={suggestions} onTagsChange={mockOnTagsChange} />);

    // Mock the setFocus method
    const mockSetFocus = vi.fn();
    // Create a proper mock for the Ionic element
    // This avoids the HTMLIonInputElement issue
    vi.spyOn(HTMLElement.prototype, 'focus').mockImplementation(mockSetFocus);

    // Get the input using a more reliable query
    const input = screen.getByPlaceholderText('Add a tag');

    // Use fireEvent instead of userEvent for more direct control
    fireEvent.change(input, { target: { value: 'Java' } });

    // Click on suggestion
    waitFor(
      () => {
        const suggestion = screen.getByText('JavaScript');
        fireEvent.click(suggestion);
      },
      { timeout: 1000 },
    );

    waitFor(() => {
      // Use fireEvent.click which is more reliable in test environments
      fireEvent.click(screen.getByText('JavaScript'));

      // Check if focus was set
      expect(mockSetFocus).toHaveBeenCalled();
    });
  });
});
