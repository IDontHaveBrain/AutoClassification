import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t } = useTranslation('common');

  return (
    <div>
      <h2>{t('home')}</h2>
    </div>
  );
};

export default Home;
