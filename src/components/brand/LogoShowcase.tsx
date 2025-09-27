import { BRAND_COLORS } from '@/theme/designSystem';
import type React from 'react';
import styled from 'styled-components';
import { SpendlessIcon } from './SpendlessIcon';
import { SpendlessLogo } from './SpendlessLogo';

const ShowcaseContainer = styled.div`
  padding: 2rem;
  background: #fafafa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Inter, sans-serif;
`;

const Section = styled.div`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${BRAND_COLORS.textPrimary};
  margin-bottom: 1.5rem;
`;

const LogoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const LogoCard = styled.div<{ darkBackground?: boolean }>`
  background: ${(props) => (props.darkBackground ? '#27272a' : '#ffffff')};
  border: 1px solid #e4e4e7;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const LogoDisplay = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
`;

const DarkLogoDisplay = styled(LogoDisplay)`
  background: #27272a;
`;

const CardTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${BRAND_COLORS.textPrimary};
  margin-bottom: 0.5rem;
`;

const CardDescription = styled.p<{ isDark?: boolean }>`
  color: ${(props) => (props.isDark ? '#a1a1aa' : BRAND_COLORS.textSecondary)};
  font-size: 0.9rem;
  line-height: 1.4;
`;

const SizeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const SizeDemo = styled.div`
  background: white;
  border: 1px solid #e4e4e7;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
`;

const SizeLabel = styled.div`
  font-size: 0.85rem;
  color: ${BRAND_COLORS.textSecondary};
  margin-top: 0.75rem;
  font-weight: 500;
`;

const IconGrid = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
`;

const CodeExample = styled.div`
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.85rem;
  color: #374151;
  overflow-x: auto;
`;

/**
 * LogoShowcase component demonstrates all Spendless logo variations
 * Useful for development, testing, and as a reference guide
 */
export const LogoShowcase: React.FC = () => {
  return (
    <ShowcaseContainer>
      <h1
        style={{
          fontSize: '2.5rem',
          fontWeight: 900,
          color: BRAND_COLORS.textPrimary,
          marginBottom: '1rem',
          textAlign: 'center',
        }}
      >
        Spendless Logo System
      </h1>
      <p
        style={{
          color: BRAND_COLORS.textSecondary,
          textAlign: 'center',
          marginBottom: '3rem',
          fontSize: '1.1rem',
        }}
      >
        Complete brand identity components for the Spendless application
      </p>

      {/* Logo Variations */}
      <Section>
        <SectionTitle>Logo Variations</SectionTitle>
        <LogoGrid>
          <LogoCard>
            <LogoDisplay>
              <SpendlessLogo variant='primary' size='large' />
            </LogoDisplay>
            <CardTitle>Primary Logo</CardTitle>
            <CardDescription>
              Main wordmark with purple "p" accent. Use this as your primary brand identifier across
              all major touchpoints.
            </CardDescription>
            <CodeExample>{`<SpendlessLogo variant="primary" size="large" />`}</CodeExample>
          </LogoCard>

          <LogoCard>
            <LogoDisplay>
              <SpendlessLogo variant='horizontal' size='medium' />
            </LogoDisplay>
            <CardTitle>Horizontal Combo</CardTitle>
            <CardDescription>
              Icon + wordmark combination ideal for website headers, business cards, and marketing
              materials.
            </CardDescription>
            <CodeExample>{`<SpendlessLogo variant="horizontal" size="medium" />`}</CodeExample>
          </LogoCard>

          <LogoCard darkBackground>
            <DarkLogoDisplay>
              <SpendlessLogo variant='reverse' size='large' />
            </DarkLogoDisplay>
            <CardTitle>Reverse Logo</CardTitle>
            <CardDescription isDark>
              White version for dark backgrounds, maintaining the purple accent for brand
              consistency.
            </CardDescription>
            <CodeExample>{`<SpendlessLogo variant="reverse" size="large" />`}</CodeExample>
          </LogoCard>
        </LogoGrid>
      </Section>

      {/* Logo Sizes */}
      <Section>
        <SectionTitle>Size Variations</SectionTitle>
        <SizeGrid>
          <SizeDemo>
            <SpendlessLogo variant='primary' size='small' />
            <SizeLabel>Small (1.2rem)</SizeLabel>
          </SizeDemo>
          <SizeDemo>
            <SpendlessLogo variant='primary' size='medium' />
            <SizeLabel>Medium (2rem)</SizeLabel>
          </SizeDemo>
          <SizeDemo>
            <SpendlessLogo variant='primary' size='large' />
            <SizeLabel>Large (3rem)</SizeLabel>
          </SizeDemo>
          <SizeDemo>
            <SpendlessLogo variant='primary' size='xl' />
            <SizeLabel>XL (4rem)</SizeLabel>
          </SizeDemo>
        </SizeGrid>
      </Section>

      {/* Icon Mark */}
      <Section>
        <SectionTitle>Icon Mark Variations</SectionTitle>
        <LogoGrid>
          <LogoCard>
            <LogoDisplay>
              <SpendlessIcon size={80} />
            </LogoDisplay>
            <CardTitle>Brand Icon</CardTitle>
            <CardDescription>
              Standalone brand mark perfect for favicons, app icons, and compact spaces.
            </CardDescription>
            <CodeExample>{'<SpendlessIcon size={80} />'}</CodeExample>
          </LogoCard>

          <LogoCard>
            <LogoDisplay>
              <SpendlessIcon size={80} variant='reverse' />
            </LogoDisplay>
            <CardTitle>Reverse Icon</CardTitle>
            <CardDescription>
              White background version for use on dark surfaces or as a subtle variant.
            </CardDescription>
            <CodeExample>{`<SpendlessIcon size={80} variant="reverse" />`}</CodeExample>
          </LogoCard>

          <LogoCard>
            <LogoDisplay>
              <SpendlessIcon size={80} variant='outline' />
            </LogoDisplay>
            <CardTitle>Outline Icon</CardTitle>
            <CardDescription>
              Transparent background with purple outline, perfect for subtle branding.
            </CardDescription>
            <CodeExample>{`<SpendlessIcon size={80} variant="outline" />`}</CodeExample>
          </LogoCard>
        </LogoGrid>
      </Section>

      {/* Icon Sizes */}
      <Section>
        <SectionTitle>Icon Size Examples</SectionTitle>
        <LogoCard>
          <LogoDisplay>
            <IconGrid>
              <div style={{ textAlign: 'center' }}>
                <SpendlessIcon size={16} />
                <SizeLabel>16px (Favicon)</SizeLabel>
              </div>
              <div style={{ textAlign: 'center' }}>
                <SpendlessIcon size={24} />
                <SizeLabel>24px (Small UI)</SizeLabel>
              </div>
              <div style={{ textAlign: 'center' }}>
                <SpendlessIcon size={32} />
                <SizeLabel>32px (Standard)</SizeLabel>
              </div>
              <div style={{ textAlign: 'center' }}>
                <SpendlessIcon size={48} />
                <SizeLabel>48px (Large UI)</SizeLabel>
              </div>
              <div style={{ textAlign: 'center' }}>
                <SpendlessIcon size={64} />
                <SizeLabel>64px (Hero)</SizeLabel>
              </div>
            </IconGrid>
          </LogoDisplay>
          <CardTitle>Common Icon Sizes</CardTitle>
          <CardDescription>
            Various sizes for different use cases, from favicon to hero sections.
          </CardDescription>
        </LogoCard>
      </Section>

      {/* Interactive Examples */}
      <Section>
        <SectionTitle>Interactive Examples</SectionTitle>
        <LogoGrid>
          <LogoCard>
            <LogoDisplay>
              <SpendlessLogo
                variant='horizontal'
                size='medium'
                interactive
                onClick={() => alert('Logo clicked!')}
              />
            </LogoDisplay>
            <CardTitle>Interactive Logo</CardTitle>
            <CardDescription>
              Logo with hover effects and click handling for navigation.
            </CardDescription>
            <CodeExample>
              {`<SpendlessLogo 
  variant="horizontal" 
  size="medium" 
  interactive 
  onClick={handleClick} 
/>`}
            </CodeExample>
          </LogoCard>

          <LogoCard>
            <LogoDisplay>
              <SpendlessIcon size={60} interactive onClick={() => alert('Icon clicked!')} />
            </LogoDisplay>
            <CardTitle>Interactive Icon</CardTitle>
            <CardDescription>
              Icon with hover animation and click handling for compact navigation.
            </CardDescription>
            <CodeExample>
              {`<SpendlessIcon 
  size={60} 
  interactive 
  onClick={handleClick} 
/>`}
            </CodeExample>
          </LogoCard>
        </LogoGrid>
      </Section>
    </ShowcaseContainer>
  );
};

export default LogoShowcase;
