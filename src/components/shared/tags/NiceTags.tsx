import {
  IonButton,
  IonChip,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonText,
} from '@ionic/react';
import { addOutline, closeCircleOutline } from 'ionicons/icons';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { styled } from 'styled-components';

const TagsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.8rem;
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  padding: 0;
`;

const SuggestionsDropdown = styled(IonList)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 99999;
  max-height: 150px;
  overflow-y: auto;
  border: 1px solid #ccc;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
  margin-top: 1px;
  /* Force the dropdown to appear above everything */
  transform: translateZ(0);
  isolation: isolate;
  pointer-events: auto;
`;

const AddButton = styled(IonButton)`
  margin-left: 0.5rem;
`;

interface NiceTagsProps {
  initialTags?: string[];
  suggestions?: string[];
  onTagsChange?: (tags: string[]) => void;
}

const NiceTags: React.FC<NiceTagsProps> = ({
  initialTags = [],
  suggestions = [],
  onTagsChange,
}) => {
  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [suggestionsArray, setSuggestionsArray] = useState<string[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  const inputRef = useRef<HTMLIonInputElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  const addTag = (tag: string) => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      const updatedTags = [...tags, tag.trim()];
      setTags(updatedTags);
      onTagsChange?.(updatedTags);
      setInputValue('');
      setFilteredSuggestions([]);
      inputRef.current?.setFocus();
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(updatedTags);
    onTagsChange?.(updatedTags);
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (value.trim()) {
      const matches = suggestionsArray.filter((suggestion) =>
        suggestion.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredSuggestions(matches);
    } else {
      setFilteredSuggestions([]);
    }
  };

  useEffect(() => {
    setTags(initialTags);
    setSuggestionsArray(suggestions);
  }, [initialTags, suggestions]);

  // Update position when input changes or on component mount
  useEffect(() => {
    if (inputContainerRef.current && filteredSuggestions.length > 0) {
      const rect = inputContainerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [filteredSuggestions.length]);

  return (
    <>
      <TagsContainer>
        {tags.map((tag) => (
          <IonChip key={tag} color='primary'>
            <IonLabel>{tag}</IonLabel>
            <IonIcon
              icon={closeCircleOutline}
              onClick={() => removeTag(tag)}
              data-testid='remove-tag-icon'
            />
          </IonChip>
        ))}
      </TagsContainer>

      <InputContainer ref={inputContainerRef}>
        <IonInput
          ref={inputRef}
          placeholder='Add a tag'
          value={inputValue}
          onKeyUp={(e: React.KeyboardEvent<HTMLIonInputElement>) =>
            handleInputChange((e.target as HTMLInputElement).value)
          }
          fill='outline'
        />
        <AddButton
          onClick={() => addTag(inputValue)}
          color='secondary'
          fill='solid'
          disabled={!inputValue.trim()}
          data-testid='add-tag-button' // Add this line
        >
          <IonIcon icon={addOutline} slot='start' />
          Add
        </AddButton>
        {filteredSuggestions.length > 0 &&
          ReactDOM.createPortal(
            <div
              style={{
                position: 'fixed',
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                width: `${dropdownPosition.width}px`,
                zIndex: 99999,
              }}
            >
              <SuggestionsDropdown lines='none'>
                {filteredSuggestions.map((suggestion) => (
                  <IonItem
                    key={suggestion}
                    button
                    onClick={() => {
                      addTag(suggestion);
                    }}
                  >
                    <IonText>{suggestion}</IonText>
                  </IonItem>
                ))}
              </SuggestionsDropdown>
            </div>,
            document.body,
          )}
      </InputContainer>
    </>
  );
};

export default NiceTags;
