import React, { useState, useRef, useEffect } from 'react';
import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Popover,
  Fade,
  styled,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Language as LanguageIcon,
  ExpandMore as ExpandMoreIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../stores/rootHook';
import { setLanguage, initializeLanguage } from '../../stores/i18nSlice';

// Language Configuration
export interface LanguageConfig {
  code: string;
  name: string;
  flag: string;
  nativeName: string;
}

const LANGUAGES: LanguageConfig[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷', nativeName: '한국어' },
];

// Component Props Interfaces
export interface LanguageSwitcherProps {
  variant?: 'button' | 'menu' | 'compact';
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  className?: string;
  onLanguageChange?: (language: string) => void;
}

export interface LanguageToggleProps {
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  className?: string;
  onLanguageChange?: (language: string) => void;
}

export interface MobileLanguageSwitcherProps {
  showLabel?: boolean;
  disabled?: boolean;
  className?: string;
  onLanguageChange?: (language: string) => void;
}

// Styled Components
const StyledLanguageButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'variant' && prop !== 'size',
})<{ variant?: string; size?: string }>(({ theme, variant, size }) => ({
  minWidth: variant === 'compact' ? '48px' : '80px',
  padding: theme.spacing(size === 'small' ? 0.5 : size === 'large' ? 1.5 : 1),
  borderRadius: theme.shape.borderRadius,
  textTransform: 'none',
  fontSize: size === 'small' ? '0.75rem' : size === 'large' ? '1rem' : '0.875rem',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const FlagIcon = styled(Box)(({ theme }) => ({
  fontSize: '1.2em',
  marginRight: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
}));

const LanguageMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: theme.shape.borderRadius,
    marginTop: theme.spacing(1),
    minWidth: 160,
    boxShadow: theme.shadows[8],
  },
}));

const LanguageMenuItem = styled(MenuItem)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

// Utility Functions
const getLanguageByCode = (code: string): LanguageConfig => {
  return LANGUAGES.find(lang => lang.code === code) || LANGUAGES[0];
};

const saveLanguageToStorage = (language: string) => {
  try {
    localStorage.setItem('app-language', language);
  } catch (error) {
    console.warn('Failed to save language preference:', error);
  }
};

const loadLanguageFromStorage = (): string => {
  try {
    return localStorage.getItem('app-language') || 'en';
  } catch (error) {
    console.warn('Failed to load language preference:', error);
    return 'en';
  }
};

// Custom Hook for Language Management
export const useLanguageManager = () => {
  const dispatch = useAppDispatch();
  const currentLanguage = useAppSelector((state) => state.i18n.currentLanguage);
  const isLoading = useAppSelector((state) => state.i18n.isLoading);

  const changeLanguage = (language: string) => {
    if (LANGUAGES.find(lang => lang.code === language)) {
      dispatch(setLanguage(language));
    }
  };

  useEffect(() => {
    dispatch(initializeLanguage());
  }, [dispatch]);

  return {
    currentLanguage,
    changeLanguage,
    languages: LANGUAGES,
    currentLanguageConfig: getLanguageByCode(currentLanguage),
    isLoading,
  };
};

// Main LanguageSwitcher Component
export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'button',
  showLabel = true,
  size = 'medium',
  disabled = false,
  className,
  onLanguageChange,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { currentLanguage, changeLanguage, languages, currentLanguageConfig } = useLanguageManager();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageSelect = (language: string) => {
    changeLanguage(language);
    onLanguageChange?.(language);
    handleClose();
  };

  const open = Boolean(anchorEl);

  if (variant === 'compact') {
    return (
      <Box className={className}>
        <StyledIconButton
          size={size}
          onClick={handleClick}
          disabled={disabled}
          aria-label="Change language"
        >
          <FlagIcon>{currentLanguageConfig.flag}</FlagIcon>
        </StyledIconButton>
        <LanguageMenu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          TransitionComponent={Fade}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          {languages.map((language) => (
            <LanguageMenuItem
              key={language.code}
              onClick={() => handleLanguageSelect(language.code)}
            >
              <ListItemIcon>
                <FlagIcon>{language.flag}</FlagIcon>
              </ListItemIcon>
              <ListItemText>
                <Typography variant="body2">
                  {language.nativeName}
                </Typography>
              </ListItemText>
              {currentLanguage === language.code && (
                <CheckIcon fontSize="small" color="primary" />
              )}
            </LanguageMenuItem>
          ))}
        </LanguageMenu>
      </Box>
    );
  }

  if (variant === 'menu') {
    return (
      <Box className={className}>
        <StyledLanguageButton
          variant="outlined"
          size={size}
          onClick={handleClick}
          disabled={disabled}
          startIcon={<Box>{currentLanguageConfig.flag}</Box>}
          endIcon={<ExpandMoreIcon />}
        >
          {showLabel && (
            <Typography variant="body2">
              {currentLanguageConfig.nativeName}
            </Typography>
          )}
        </StyledLanguageButton>
        <LanguageMenu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          TransitionComponent={Fade}
        >
          {languages.map((language) => (
            <LanguageMenuItem
              key={language.code}
              onClick={() => handleLanguageSelect(language.code)}
            >
              <ListItemIcon>
                <FlagIcon>{language.flag}</FlagIcon>
              </ListItemIcon>
              <ListItemText>
                <Typography variant="body2">
                  {language.nativeName}
                </Typography>
              </ListItemText>
              {currentLanguage === language.code && (
                <CheckIcon fontSize="small" color="primary" />
              )}
            </LanguageMenuItem>
          ))}
        </LanguageMenu>
      </Box>
    );
  }

  // Default button variant
  return (
    <Box className={className}>
      <StyledLanguageButton
        variant="text"
        size={size}
        onClick={handleClick}
        disabled={disabled}
        startIcon={<Box>{currentLanguageConfig.flag}</Box>}
      >
        {showLabel && (
          <Typography variant="body2">
            {currentLanguageConfig.nativeName}
          </Typography>
        )}
      </StyledLanguageButton>
      <LanguageMenu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
      >
        {languages.map((language) => (
          <LanguageMenuItem
            key={language.code}
            onClick={() => handleLanguageSelect(language.code)}
          >
            <ListItemIcon>
              <FlagIcon>{language.flag}</FlagIcon>
            </ListItemIcon>
            <ListItemText>
              <Typography variant="body2">
                {language.nativeName}
              </Typography>
            </ListItemText>
            {currentLanguage === language.code && (
              <CheckIcon fontSize="small" color="primary" />
            )}
          </LanguageMenuItem>
        ))}
      </LanguageMenu>
    </Box>
  );
};

// Language Toggle Component (Simple two-language toggle)
export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  showLabel = true,
  size = 'medium',
  disabled = false,
  className,
  onLanguageChange,
}) => {
  const { currentLanguage, changeLanguage, currentLanguageConfig } = useLanguageManager();

  const handleToggle = () => {
    const newLanguage = currentLanguage === 'en' ? 'ko' : 'en';
    changeLanguage(newLanguage);
    onLanguageChange?.(newLanguage);
  };

  return (
    <Box className={className}>
      <StyledLanguageButton
        variant="text"
        size={size}
        onClick={handleToggle}
        disabled={disabled}
        startIcon={<Box>{currentLanguageConfig.flag}</Box>}
      >
        {showLabel && (
          <Typography variant="body2">
            {currentLanguageConfig.nativeName}
          </Typography>
        )}
      </StyledLanguageButton>
    </Box>
  );
};

// Mobile Language Switcher Component
export const MobileLanguageSwitcher: React.FC<MobileLanguageSwitcherProps> = ({
  showLabel = true,
  disabled = false,
  className,
  onLanguageChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { currentLanguage, changeLanguage, languages, currentLanguageConfig } = useLanguageManager();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageSelect = (language: string) => {
    changeLanguage(language);
    onLanguageChange?.(language);
    handleClose();
  };

  const open = Boolean(anchorEl);

  if (isMobile) {
    return (
      <Box className={className}>
        <StyledIconButton
          size="small"
          onClick={handleClick}
          disabled={disabled}
          aria-label="Change language"
        >
          <FlagIcon sx={{ marginRight: 0 }}>
            {currentLanguageConfig.flag}
          </FlagIcon>
        </StyledIconButton>
        <LanguageMenu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          TransitionComponent={Fade}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          {languages.map((language) => (
            <LanguageMenuItem
              key={language.code}
              onClick={() => handleLanguageSelect(language.code)}
            >
              <ListItemIcon>
                <FlagIcon>{language.flag}</FlagIcon>
              </ListItemIcon>
              <ListItemText>
                <Typography variant="body2">
                  {language.nativeName}
                </Typography>
              </ListItemText>
              {currentLanguage === language.code && (
                <CheckIcon fontSize="small" color="primary" />
              )}
            </LanguageMenuItem>
          ))}
        </LanguageMenu>
      </Box>
    );
  }

  // Desktop fallback
  return (
    <LanguageSwitcher
      variant="compact"
      showLabel={showLabel}
      disabled={disabled}
      className={className}
      onLanguageChange={onLanguageChange}
    />
  );
};

export default LanguageSwitcher;