import React, { useState } from 'react';
import {
  Check as CheckIcon,
  ExpandMore as ExpandMoreIcon,
  Language as LanguageIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Popover,
  Tooltip,
  Typography,
} from '@mui/material';
import { useLanguage } from 'hooks';
import { useTranslation } from 'hooks/useTranslation';

interface LanguageSwitcherProps {
  variant?: 'button' | 'menu' | 'compact';
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  className?: string;
}

/**
 * Language switcher component with Material-UI integration
 * Provides a dropdown interface for language selection
 */
export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'button',
  showLabel = true,
  size = 'medium',
  disabled = false,
  className,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { currentLanguage, availableLanguages, changeLanguage, isLoading } = useLanguage();
  const { t } = useTranslation('common');

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = async (languageCode: string) => {
    if (languageCode !== currentLanguage) {
      await changeLanguage(languageCode);
    }
    handleClose();
  };

  const currentLanguageInfo = availableLanguages.find(
    (lang) => lang.code === currentLanguage,
  );

  // Fallback language data in case Redux store isn't properly initialized
  const fallbackLanguageData = {
    ko: { code: 'ko', name: '한국어', flag: '🇰🇷' },
    en: { code: 'en', name: 'English', flag: '🇺🇸' },
  };

  // Ensure we always have language info with flag
  const safeCurrentLanguageInfo = currentLanguageInfo || fallbackLanguageData[currentLanguage] || fallbackLanguageData.ko;

  // Ensure flag is always available
  const displayFlag = safeCurrentLanguageInfo?.flag || fallbackLanguageData[currentLanguage]?.flag || '🌐';

  if (variant === 'compact') {
    return (
      <Box className={className}>
        <Tooltip title={t('language')}>
          <IconButton
            color="inherit"
            onClick={handleClick}
            disabled={disabled || isLoading}
            aria-label={t('language')}
          >
            {isLoading ? (
              <CircularProgress size={20} />
            ) : (
              <Typography variant="body2" sx={{ fontSize: '1.4em' }}>
                {displayFlag}
              </Typography>
            )}
          </IconButton>
        </Tooltip>

        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 180,
            },
          }}
        >
          {availableLanguages.map((language) => (
            <MenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              selected={language.code === currentLanguage}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Typography variant="body2" sx={{ fontSize: '1.1em' }}>
                {language.flag}
              </Typography>
              <ListItemText
                primary={language.name}
                secondary={language.code.toUpperCase()}
              />
              {language.code === currentLanguage && (
                <ListItemIcon sx={{ minWidth: 'auto', ml: 1 }}>
                  <CheckIcon fontSize="small" color="primary" />
                </ListItemIcon>
              )}
            </MenuItem>
          ))}
        </Popover>
      </Box>
    );
  }

  return (
    <Box className={className}>
      <Button
        variant={variant === 'menu' ? 'text' : 'outlined'}
        size={size}
        onClick={handleClick}
        disabled={disabled || isLoading}
        startIcon={
          isLoading ? (
            <CircularProgress size={16} />
          ) : (
            <LanguageIcon />
          )
        }
        endIcon={<ExpandMoreIcon />}
        sx={{
          textTransform: 'none',
          borderRadius: 2,
          ...(variant === 'menu' && {
            color: 'inherit',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {displayFlag && (
            <Typography variant="body2" sx={{ fontSize: '1.1em' }}>
              {displayFlag}
            </Typography>
          )}
          {showLabel && (
            <Typography variant="body2">
              {safeCurrentLanguageInfo?.name || t('language')}
            </Typography>
          )}
        </Box>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            maxWidth: 300,
          },
        }}
      >
        <MenuItem disabled sx={{ opacity: 0.7 }}>
          <ListItemIcon>
            <LanguageIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={t('language')}
            primaryTypographyProps={{
              variant: 'subtitle2',
              color: 'text.secondary',
            }}
          />
        </MenuItem>
        <Divider />

        {availableLanguages.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            selected={language.code === currentLanguage}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              py: 1,
            }}
          >
            <Typography variant="body2" sx={{ fontSize: '1.1em' }}>
              {language.flag}
            </Typography>
            <ListItemText
              primary={language.name}
              secondary={language.code.toUpperCase()}
              primaryTypographyProps={{ variant: 'body2' }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
            {language.code === currentLanguage && (
              <ListItemIcon sx={{ minWidth: 'auto', ml: 1 }}>
                <CheckIcon fontSize="small" color="primary" />
              </ListItemIcon>
            )}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

/**
 * Simple language toggle component for two languages
 */
export const LanguageToggle: React.FC<{
  primaryLanguage: string;
  secondaryLanguage: string;
  disabled?: boolean;
  className?: string;
}> = ({
  primaryLanguage,
  secondaryLanguage,
  disabled = false,
  className,
}) => {
  const { currentLanguage, changeLanguage, isLoading, availableLanguages } = useLanguage();

  const primaryLang = availableLanguages.find(lang => lang.code === primaryLanguage);
  const secondaryLang = availableLanguages.find(lang => lang.code === secondaryLanguage);

  const handleToggle = () => {
    const newLanguage = currentLanguage === primaryLanguage ? secondaryLanguage : primaryLanguage;
    changeLanguage(newLanguage);
  };

  if (!primaryLang || !secondaryLang) {
    return null;
  }

  return (
    <Box className={className}>
      <Button
        variant="outlined"
        size="small"
        onClick={handleToggle}
        disabled={disabled || isLoading}
        sx={{
          textTransform: 'none',
          borderRadius: 2,
          minWidth: 80,
        }}
      >
        {isLoading ? (
          <CircularProgress size={16} />
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" sx={{ fontSize: '1.1em' }}>
              {currentLanguage === primaryLanguage ? primaryLang.flag : secondaryLang.flag}
            </Typography>
            <Typography variant="body2">
              {currentLanguage === primaryLanguage ? primaryLang.name : secondaryLang.name}
            </Typography>
          </Box>
        )}
      </Button>
    </Box>
  );
};

/**
 * Language switcher for mobile/responsive design
 */
export const MobileLanguageSwitcher: React.FC<{
  onLanguageChange?: (language: string) => void;
  className?: string;
}> = ({ onLanguageChange, className }) => {
  const { currentLanguage, availableLanguages, changeLanguage, isLoading } = useLanguage();
  const { t } = useTranslation('common');

  const handleLanguageChange = async (languageCode: string) => {
    await changeLanguage(languageCode);
    onLanguageChange?.(languageCode);
  };

  return (
    <Box className={className} sx={{ p: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
        {t('language')}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {availableLanguages.map((language) => (
          <Button
            key={language.code}
            variant={language.code === currentLanguage ? 'contained' : 'outlined'}
            size="medium"
            onClick={() => handleLanguageChange(language.code)}
            disabled={isLoading}
            sx={{
              justifyContent: 'flex-start',
              textTransform: 'none',
              borderRadius: 2,
              py: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <Typography variant="body2" sx={{ fontSize: '1.2em' }}>
                {language.flag}
              </Typography>
              <Typography variant="body2" sx={{ flexGrow: 1, textAlign: 'left' }}>
                {language.name}
              </Typography>
              {language.code === currentLanguage && (
                <CheckIcon fontSize="small" color="inherit" />
              )}
            </Box>
          </Button>
        ))}
      </Box>
    </Box>
  );
};

export default LanguageSwitcher;