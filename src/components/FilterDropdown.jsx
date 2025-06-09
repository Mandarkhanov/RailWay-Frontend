import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const FilterContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const FilterButton = styled.button`
  padding: 8px 15px;
  border: 1px solid #3498db;
  background-color: #fff; color: #3498db; border-radius: 4px;
  cursor: pointer; transition: background-color 0.2s, color 0.2s;
  &:hover { background-color: #2980b9; color: #fff; }
`;

const DropdownContent = styled.div`
  display: ${props => (props.$isOpen ? 'block' : 'none')};
  position: absolute; background-color: #f1f1f1;
  min-width: 240px; box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1; border-radius: 4px; padding: 10px;
  right: 0; left: auto;
`;

export default function FilterDropdown({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(prev => !prev);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <FilterContainer ref={dropdownRef}>
      <FilterButton onClick={toggleDropdown}>Фильтр</FilterButton>
      <DropdownContent $isOpen={isOpen}>
        {children}
      </DropdownContent>
    </FilterContainer>
  );
}