import { useTranslation } from 'hooks/useTranslation';

export const Home = () => {
  const { t } = useTranslation('navigation');

  return (
    <div>
      <h2>{t('menu.home')}</h2>
    </div>
  );
};
