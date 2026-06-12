import './HomePage.css';
import { BasePageLayout, CenterContainer } from '@/components/layouts';
import MainMenuContent from '@/components/menu/MainMenuContent';

const HomePage: React.FC = () => {
  return (
    <BasePageLayout
      title='Home'
      showHeader={true}
      showBackButton={false}
      showLogo={true}
      showMenu={true}
      menu={<MainMenuContent />}
    >
      <CenterContainer>
        <h1>Welcome to the Home Page!</h1>
      </CenterContainer>
    </BasePageLayout>
  );
};

export default HomePage;
