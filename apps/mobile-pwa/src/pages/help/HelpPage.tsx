import { BasePageLayout, CenterContainer, Content } from '@/components/layouts';
import { ROUTES } from '@/routes/routes.constants';
import { designSystem } from '@/theme/designSystem';
import { IonContent } from '@ionic/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styled from 'styled-components';
import userGuideContent from '../../../USER_GUIDE.md?raw';

const MarkdownContainer = styled.div`
  padding: ${designSystem.spacing.lg};
  max-width: 800px;
  margin: 0 auto;
  color: ${designSystem.colors.text.primary};
  line-height: 1.6;

  h1 {
    font-size: ${designSystem.typography.fontSize['2xl']};
    font-weight: ${designSystem.typography.fontWeight.bold};
    color: ${designSystem.colors.primary[600]};
    margin-top: ${designSystem.spacing.xl};
    margin-bottom: ${designSystem.spacing.lg};
    padding-bottom: ${designSystem.spacing.sm};
    border-bottom: 2px solid ${designSystem.colors.gray[200]};
  }

  h2 {
    font-size: ${designSystem.typography.fontSize.xl};
    font-weight: ${designSystem.typography.fontWeight.semibold};
    color: ${designSystem.colors.primary[500]};
    margin-top: ${designSystem.spacing.xl};
    margin-bottom: ${designSystem.spacing.md};
  }

  h3 {
    font-size: ${designSystem.typography.fontSize.lg};
    font-weight: ${designSystem.typography.fontWeight.semibold};
    color: ${designSystem.colors.text.primary};
    margin-top: ${designSystem.spacing.lg};
    margin-bottom: ${designSystem.spacing.sm};
  }

  h4 {
    font-size: ${designSystem.typography.fontSize.base};
    font-weight: ${designSystem.typography.fontWeight.semibold};
    color: ${designSystem.colors.text.primary};
    margin-top: ${designSystem.spacing.md};
    margin-bottom: ${designSystem.spacing.sm};
  }

  p {
    margin-bottom: ${designSystem.spacing.md};
    color: ${designSystem.colors.text.secondary};
  }

  ul,
  ol {
    margin-bottom: ${designSystem.spacing.md};
    padding-left: ${designSystem.spacing.xl};
    color: ${designSystem.colors.text.secondary};
  }

  li {
    margin-bottom: ${designSystem.spacing.xs};
  }

  strong {
    font-weight: ${designSystem.typography.fontWeight.semibold};
    color: ${designSystem.colors.text.primary};
  }

  em {
    font-style: italic;
  }

  code {
    background-color: ${designSystem.colors.gray[100]};
    padding: 2px 6px;
    border-radius: ${designSystem.borderRadius.sm};
    font-family: 'Courier New', monospace;
    font-size: ${designSystem.typography.fontSize.sm};
    color: ${designSystem.colors.primary[600]};
  }

  pre {
    background-color: ${designSystem.colors.gray[100]};
    padding: ${designSystem.spacing.md};
    border-radius: ${designSystem.borderRadius.md};
    overflow-x: auto;
    margin-bottom: ${designSystem.spacing.md};

    code {
      background-color: transparent;
      padding: 0;
    }
  }

  blockquote {
    border-left: 4px solid ${designSystem.colors.primary[400]};
    padding-left: ${designSystem.spacing.md};
    margin-left: 0;
    margin-bottom: ${designSystem.spacing.md};
    color: ${designSystem.colors.text.secondary};
    font-style: italic;
  }

  a {
    color: ${designSystem.colors.primary[500]};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  hr {
    border: none;
    border-top: 1px solid ${designSystem.colors.gray[200]};
    margin: ${designSystem.spacing.xl} 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: ${designSystem.spacing.md};
  }

  th,
  td {
    padding: ${designSystem.spacing.sm};
    text-align: left;
    border-bottom: 1px solid ${designSystem.colors.gray[200]};
  }

  th {
    font-weight: ${designSystem.typography.fontWeight.semibold};
    color: ${designSystem.colors.text.primary};
    background-color: ${designSystem.colors.gray[50]};
  }
`;

const HelpPage: React.FC = () => {
  return (
    <BasePageLayout
      title='Help & Support'
      showBackButton={true}
      showProfileIcon={false}
      defaultBackButtonHref={ROUTES.SPENDING}
    >
      <CenterContainer>
        <Content>
          <MarkdownContainer>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{userGuideContent}</ReactMarkdown>
          </MarkdownContainer>
        </Content>
      </CenterContainer>
    </BasePageLayout>
  );
};

export default HelpPage;
