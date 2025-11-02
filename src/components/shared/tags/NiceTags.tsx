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

const DropdownContainer = styled.div<{ top: number; left: number; width: number }>`
  position: fixed;
  top: ${(props) => props.top}px;
  left: ${(props) => props.left}px;
  width: ${(props) => props.width}px;
  z-index: 99999;
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
  // Use initialTags directly instead of maintaining local state that syncs with it
  const [inputValue, setInputValue] = useState<string>('');
  const [suggestionsArray, setSuggestionsArray] = useState<string[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  const inputRef = useRef<HTMLIonInputElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  // Use initialTags directly as our source of truth
  const tags = initialTags || [];

  const handleInputFocus = () => {
    // Find the IonContent element and scroll it to top
    const ionContent = document.querySelector('ion-content');
    if (ionContent) {
      ionContent.scrollToTop(300); // 300ms smooth animation
    }
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      const updatedTags = [...tags, tag.trim()];
      onTagsChange?.(updatedTags);
      setInputValue('');
      setFilteredSuggestions([]);
      inputRef.current?.setFocus();
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
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
    setSuggestionsArray(suggestions || []);
  }, [suggestions]);

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
          onIonInput={(e) => handleInputChange(e.detail.value ?? '')}
          onIonFocus={handleInputFocus}
          onClick={handleInputFocus}
          onKeyUp={(e: React.KeyboardEvent<HTMLIonInputElement>) => {
            if (e.key === 'Enter') {
              addTag(inputValue);
            }
          }}
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
            <DropdownContainer
              top={dropdownPosition.top}
              left={dropdownPosition.left}
              width={dropdownPosition.width}
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
            </DropdownContainer>,
            document.body,
          )}
      </InputContainer>
    </>
  );
};

export default NiceTags;
