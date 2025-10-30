// src/hooks/useThemeMode.ts
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContextBase';

export const useThemeMode = () => useContext(ThemeContext);
