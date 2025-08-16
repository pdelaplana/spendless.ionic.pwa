import { CenterContainer } from '@/components/layouts';
import ModalPageLayout from '@/components/layouts/ModalPageLayout';
import type { IPeriod } from '@/domain/Period';
import { IonButton, IonIcon, IonLabel, useIonModal } from '@ionic/react';
import type { OverlayEventDetail } from '@ionic/react/dist/types/components/react-component-lib/interfaces';
import { useState } from 'react';
import useFormatters from '@/hooks/ui/useFormatters';
import { useTranslation } from 'react-i18next';
import { StyledIonList, StyledItem } from '@/styles/IonList.styled';
import { trashBin } from 'ionicons/icons';
import EmptyContent from '@/components/layouts/EmptyContent';

interface PeriodListModalProps {
  periods: (IPeriod & { actualSpend: number })[];
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  onDismiss: (data?: any, role?: string) => void;
}

const PeriodListModal: React.FC<PeriodListModalProps> = ({ periods, onDismiss }) => {
  const { t } = useTranslation();

  const { formatCurrency, formatDate } = useFormatters();

  return (
    <ModalPageLayout onDismiss={onDismiss}>
      <CenterContainer>
        {periods.length === 0 && (
          <EmptyContent heading={t('periods.noPeriods')} content={t('periods.empty.description')} />
        )}

        {periods.length > 0 && (
          <>
            <div className='ion-margin-start ion-margin-end'>{t('periods.title')}</div>

            <StyledIonList className='ion-margin-top ion-margin-start ion-margin-end'>
              {periods.map((period) => (
                <StyledItem
                  key={period.id}
                  lines='full'
                  button
                  onClick={() => onDismiss(period, 'select')}
                >
                  <IonLabel>
                    <h2>
                      {t('periods.description', {
                        startDate: formatDate(period.startAt),
                        endDate: formatDate(period.endAt),
                      })}
                    </h2>
                    <p>
                      Spent {formatCurrency(period.actualSpend)} of{' '}
                      {formatCurrency(period.targetSpend)}
                    </p>
                  </IonLabel>
                  <div>
                    <IonButton fill='clear' shape='round'>
                      <IonIcon icon={trashBin} slot='icon-only' />
                    </IonButton>
                  </div>
                </StyledItem>
              ))}
            </StyledIonList>
          </>
        )}
      </CenterContainer>
    </ModalPageLayout>
  );
};

export const usePeriodListModal = (): {
  open: (
    periods: (IPeriod & { actualSpend: number })[],
    onSelect: (period: IPeriod) => void,
  ) => Promise<{ period: IPeriod; role: string }>;
} => {
  const [inputs, setInputs] = useState<{
    periods: (IPeriod & { actualSpend: number })[];
    onSelect?: (period: IPeriod) => void;
  }>();

  const [present, dismiss] = useIonModal(PeriodListModal, {
    periods: inputs?.periods,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    onDismiss: (data: any, role: string) => {
      if (role === 'select') {
        inputs?.onSelect?.(data);
      }
      dismiss(data, role);
    },
  });

  return {
    open: (periods: (IPeriod & { actualSpend: number })[], onSelect: (period: IPeriod) => void) => {
      setInputs({
        periods,
        onSelect,
      });
      return new Promise((resolve) => {
        present({
          onWillDismiss: (ev: CustomEvent<OverlayEventDetail>) => {
            if (ev.detail.role) {
              resolve({ period: ev.detail.data, role: ev.detail.role });
            }
          },
        });
      });
    },
  };
};

export default PeriodListModal;
