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

  test.skip('adds a new tag when typing and clicking the Add button', async () => {
    const mockOnTagsChange = vi.fn((tags: string[]) => {
      console.log('onTagsChange called with:', tags);
    });
    render(<NiceTags onTagsChange={mockOnTagsChange} initialTags={[]} suggestions={[]} />);
    console.log('Rendering NiceTags component');

    // Find input and add button
    const input = screen.getByPlaceholderText('Add a tag');

    // Use fireEvent to trigger the Ionic input event directly
    fireEvent(input, new CustomEvent('ionInput', {
      detail: { value: 'JavaScript' }
    }));
    console.log('Typed "JavaScript" in input');

    const addButton = screen.getByTestId('add-tag-button');
    await userEvent.click(addButton);
    console.log('Clicked Add button');

    // Verify the tag was added and onTagsChange was called
    await waitFor(() => {
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(mockOnTagsChange).toHaveBeenCalled();
      expect(mockOnTagsChange).toHaveBeenCalledWith(['JavaScript']);
    });
  });

  test.skip('removes a tag when clicking the remove icon', async () => {
    const initialTags = ['React', 'TypeScript'];
    render(<NiceTags initialTags={initialTags} suggestions={[]} onTagsChange={mockOnTagsChange} />);

    // Find the remove icon for React tag and click it
    const removeIcons = screen.getAllByTestId('remove-tag-icon');
    await userEvent.click(removeIcons[0]); // First remove icon

    // Verify onTagsChange was called with the updated tags
    await waitFor(() => {
      expect(screen.queryByText('React')).not.toBeInTheDocument();
      expect(mockOnTagsChange).toHaveBeenCalled();
      expect(mockOnTagsChange).toHaveBeenCalledWith(['TypeScript']);
    });
  });

  test.skip('shows suggestions when typing', async () => {
    const suggestions = ['JavaScript', 'Java', 'Python'];
    render(<NiceTags initialTags={[]} suggestions={suggestions} onTagsChange={mockOnTagsChange} />);

    // Type 'Ja' in the input to filter suggestions
    const input = screen.getByPlaceholderText('Add a tag');
    fireEvent(input, new CustomEvent('ionInput', {
      detail: { value: 'Ja' }
    }));

    // Check if suggestions are displayed
    await waitFor(() => {
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(screen.getByText('Java')).toBeInTheDocument();
      expect(screen.queryByText('Python')).not.toBeInTheDocument();
    });
  });

  test.skip('adds a tag when clicking on a suggestion', async () => {
    const suggestions = ['JavaScript', 'Java', 'Python'];
    render(<NiceTags initialTags={[]} suggestions={suggestions} onTagsChange={mockOnTagsChange} />);

    // Type 'Ja' to show suggestions
    const input = screen.getByPlaceholderText('Add a tag');
    fireEvent(input, new CustomEvent('ionInput', {
      detail: { value: 'Ja' }
    }));

    // Click on the JavaScript suggestion
    await waitFor(async () => {
      const suggestion = screen.getByText('JavaScript');
      await userEvent.click(suggestion);
    });

    // Verify the tag was added and onTagsChange was called
    await waitFor(() => {
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(mockOnTagsChange).toHaveBeenCalledWith(['JavaScript']);

      // Input should be cleared
      expect(input).toHaveValue('');
    });
  });

  test.skip('prevents duplicate tags from being added', async () => {
    const initialTags = ['React'];
    render(<NiceTags initialTags={initialTags} onTagsChange={mockOnTagsChange} suggestions={[]} />);

    // Try to add "React" again
    const input = screen.getByPlaceholderText('Add a tag');
    fireEvent(input, new CustomEvent('ionInput', {
      detail: { value: 'React' }
    }));

    const addButton = screen.getByTestId('add-tag-button');
    await userEvent.click(addButton);

    // Only one "React" tag should exist
    await waitFor(() => {
      const reactTags = screen.getAllByText('React');
      expect(reactTags).toHaveLength(1);

      // onTagsChange should not have been called
      expect(mockOnTagsChange).not.toHaveBeenCalled();
    });
  });

  test('handles empty input correctly', async () => {
    render(<NiceTags onTagsChange={mockOnTagsChange} initialTags={[]} suggestions={[]} />);

    // Try to add an empty tag
    const addButton = screen.getByTestId('add-tag-button');
    await userEvent.click(addButton);

    await waitFor(() => {
      // No tags should be added
      expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
      expect(mockOnTagsChange).not.toHaveBeenCalled();

      // Add button should be disabled with empty input
      expect(addButton).toBeDisabled();
    });
  });

  test.skip('focuses input after adding a tag from suggestions', async () => {
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
    await waitFor(
      async () => {
        const suggestion = screen.getByText('JavaScript');
        fireEvent.click(suggestion);
      },
      { timeout: 1000 },
    );

    await waitFor(() => {
      // Check if focus was set
      expect(mockSetFocus).toHaveBeenCalled();
    });
  });
});
