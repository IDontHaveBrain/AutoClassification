import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Check as CheckIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Fade,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  styled,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import { type LanguageInfo,useLanguage } from '../../hooks/useLanguage';
import { type SupportedLanguage } from '../../types/i18n';

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

const StyledLanguageButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'layoutVariant' && prop !== 'customSize',
})<{ layoutVariant?: 'button' | 'menu' | 'compact'; customSize?: string }>(({ theme, layoutVariant, customSize }) => ({
  minWidth: layoutVariant === 'compact' ? '48px' : '80px',
  padding: theme.spacing(getPaddingValue(customSize)),
  borderRadius: theme.shape.borderRadius,
  textTransform: 'none',
  fontSize: getFontSize(customSize),
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

const getLanguageByCode = (code: string, languages: LanguageInfo[]): LanguageInfo => {
  return languages.find(lang => lang.code === code) || languages[0];
};

const getPaddingValue = (customSize?: string) => {
  if (customSize === 'small') return 0.5;
  if (customSize === 'large') return 1.5;
  return 1;
};

const getFontSize = (customSize?: string) => {
  if (customSize === 'small') return '0.75rem';
  if (customSize === 'large') return '1rem';
  return '0.875rem';
};

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'button',
  showLabel = true,
  size = 'medium',
  disabled = false,
  className,
  onLanguageChange,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { currentLanguage, changeLanguage, availableLanguages, isLoading } = useLanguage();
  const { t } = useTranslation('common');

  const allLanguages = [
    ...availableLanguages,
    getLanguageByCode(currentLanguage, availableLanguages),
  ].filter((lang, index, arr) => arr.findIndex(l => l.code === lang.code) === index);

  const currentLanguageConfig = getLanguageByCode(currentLanguage, allLanguages);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageSelect = async (language: string) => {
    try {
      await changeLanguage(language as SupportedLanguage);
      onLanguageChange?.(language);
      handleClose();
    } catch (error) {
      handleClose();
    }
  };

  const open = Boolean(anchorEl);

  if (variant === 'compact') {
    return (
      <Box className={className}>
        <StyledIconButton
          size={size}
          onClick={handleClick}
          disabled={disabled || isLoading}
          aria-label={t('changeLanguage', 'Change Language')}
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
          {allLanguages.map((language) => (
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
          layoutVariant={variant}
          customSize={size}
          onClick={handleClick}
          disabled={disabled || isLoading}
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
          {allLanguages.map((language) => (
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

  return (
    <Box className={className}>
      <StyledLanguageButton
        variant="text"
        layoutVariant="button"
        customSize={size}
        onClick={handleClick}
        disabled={disabled || isLoading}
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
        {allLanguages.map((language) => (
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

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  showLabel = true,
  size = 'medium',
  disabled = false,
  className,
  onLanguageChange,
}) => {
  const { currentLanguage, changeLanguage, availableLanguages, isLoading } = useLanguage();
  const currentLanguageConfig = getLanguageByCode(currentLanguage, availableLanguages);

  const handleToggle = async () => {
    const newLanguage = currentLanguage === 'en' ? 'ko' : 'en';
    try {
      await changeLanguage(newLanguage);
      onLanguageChange?.(newLanguage);
    } catch (error) {
      // 언어 변경 실패 시 사용자 알림 없이 처리하여 UX 연속성 유지
    }
  };

  return (
    <Box className={className}>
      <StyledLanguageButton
        variant="text"
        layoutVariant="button"
        customSize={size}
        onClick={handleToggle}
        disabled={disabled || isLoading}
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

export const MobileLanguageSwitcher: React.FC<MobileLanguageSwitcherProps> = ({
  showLabel = true,
  disabled = false,
  className,
  onLanguageChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { currentLanguage, changeLanguage, availableLanguages, isLoading } = useLanguage();
  const { t } = useTranslation('common');

  const allLanguages = [
    ...availableLanguages,
    getLanguageByCode(currentLanguage, availableLanguages),
  ].filter((lang, index, arr) => arr.findIndex(l => l.code === lang.code) === index);

  const currentLanguageConfig = getLanguageByCode(currentLanguage, allLanguages);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageSelect = async (language: string) => {
    try {
      await changeLanguage(language as SupportedLanguage);
      onLanguageChange?.(language);
      handleClose();
    } catch (error) {
      handleClose();
    }
  };

  const open = Boolean(anchorEl);

  if (isMobile) {
    return (
      <Box className={className}>
        <StyledIconButton
          size="small"
          onClick={handleClick}
          disabled={disabled || isLoading}
          aria-label={t('changeLanguage', 'Change Language')}
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
          {allLanguages.map((language) => (
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