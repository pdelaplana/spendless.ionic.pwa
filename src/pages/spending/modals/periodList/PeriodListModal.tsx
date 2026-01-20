import { CenterContainer } from '@/components/layouts';
import EmptyContent from '@/components/layouts/EmptyContent';
import ModalPageLayout from '@/components/layouts/ModalPageLayout';
import type { IPeriod } from '@/domain/Period';
import { isPeriodClosed } from '@/domain/Period';
import useFormatters from '@/hooks/ui/useFormatters';
import { StyledIonCard } from '@/styles/IonCard.styled';
import { StyledIonList, StyledItem } from '@/styles/IonList.styled';
import {
  IonButton,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonLabel,
  useIonModal,
} from '@ionic/react';
import type { OverlayEventDetail } from '@ionic/react/dist/types/components/react-component-lib/interfaces';
import { trashBin } from 'ionicons/icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface PeriodListModalProps {
  periods: (IPeriod & { actualSpend: number })[];
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  onDismiss: (data?: any, role?: string) => void;
  onDeletePeriod?: (periodId: string) => void;
}

const PeriodListModal: React.FC<PeriodListModalProps> = ({
  periods,
  onDismiss,
  onDeletePeriod,
}) => {
  const { t } = useTranslation();
  const { formatCurrency, formatDate } = useFormatters();

  const { currentPeriods, pastPeriods } = useMemo(() => {
    // Current period is any period that hasn't been closed
    const current = periods.filter((period) => !isPeriodClosed(period));
    // Past periods are those that have been closed
    const past = periods.filter((period) => isPeriodClosed(period));

    // Sort past periods by end date (most recent first)
    past.sort((a, b) => new Date(b.endAt).getTime() - new Date(a.endAt).getTime());

    return { currentPeriods: current, pastPeriods: past };
  }, [periods]);

  const renderPeriodItem = (
    period: IPeriod & { actualSpend: number },
    index: number,
    array: (IPeriod & { actualSpend: number })[],
  ) => {
    const handleDeleteClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent event bubbling to the parent item
      if (onDeletePeriod && period.id) {
        onDeletePeriod(period.id);
      }
    };

    const isLastItem = index === array.length - 1;

    return (
      <StyledItem
        key={period.id}
        lines={isLastItem ? 'none' : 'full'}
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
            Spent {formatCurrency(period.actualSpend)} of {formatCurrency(period.targetSpend)}
          </p>
        </IonLabel>
        {onDeletePeriod && isPeriodClosed(period) && (
          <IonButton fill='clear' shape='round' onClick={handleDeleteClick}>
            <IonIcon icon={trashBin} slot='icon-only' />
          </IonButton>
        )}
      </StyledItem>
    );
  };

  return (
    <ModalPageLayout onDismiss={onDismiss}>
      <CenterContainer>
        {periods.length === 0 && (
          <EmptyContent heading={t('periods.noPeriods')} content={t('periods.empty.description')} />
        )}

        {periods.length > 0 && (
          <>
            {/* Current Period Section */}
            {currentPeriods.length > 0 && (
              <StyledIonCard className='ion-margin-start ion-margin-end ion-margin-top'>
                <IonCardHeader>
                  <IonCardTitle style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                    {t('periods.currentPeriod')}
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent style={{ padding: 0 }}>
                  <StyledIonList>
                    {currentPeriods.map((period, index) =>
                      renderPeriodItem(period, index, currentPeriods),
                    )}
                  </StyledIonList>
                </IonCardContent>
              </StyledIonCard>
            )}

            {/* Past Periods Section */}
            {pastPeriods.length > 0 && (
              <StyledIonCard className='ion-margin-start ion-margin-end ion-margin-top'>
                <IonCardHeader>
                  <IonCardTitle style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                    {t('periods.pastPeriods')}
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent style={{ padding: 0 }}>
                  <StyledIonList>
                    {pastPeriods.map((period, index) =>
                      renderPeriodItem(period, index, pastPeriods),
                    )}
                  </StyledIonList>
                </IonCardContent>
              </StyledIonCard>
            )}

            {/* Empty states for sections */}
            {currentPeriods.length === 0 && pastPeriods.length === 0 && (
              <EmptyContent
                heading={t('periods.noPeriods')}
                content={t('periods.empty.description')}
              />
            )}
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
    onDeletePeriod?: (periodId: string) => void,
  ) => Promise<{ period: IPeriod; role: string }>;
  dismiss: () => void;
} => {
  const [periods, setPeriods] = useState<(IPeriod & { actualSpend: number })[]>([]);
  const [deletePeriodCallback, setDeletePeriodCallback] = useState<
    ((periodId: string) => void) | undefined
  >();

  // Use refs to store callbacks to avoid stale closures
  const onSelectRef = useRef<((period: IPeriod) => void) | undefined>(undefined);
  const onDeletePeriodRef = useRef<((periodId: string) => void) | undefined>(undefined);

  // Update ref when callback changes
  useEffect(() => {
    onDeletePeriodRef.current = deletePeriodCallback;
  }, [deletePeriodCallback]);

  const [present, dismiss] = useIonModal(PeriodListModal, {
    periods,
    onDeletePeriod: deletePeriodCallback,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    onDismiss: (data: any, role: string) => {
      // Use ref to get the latest callback
      if (role === 'select' && onSelectRef.current) {
        onSelectRef.current(data);
      }
      dismiss(data, role);
    },
  });

  const open = useCallback(
    (
      newPeriods: (IPeriod & { actualSpend: number })[],
      onSelect: (period: IPeriod) => void,
      onDeletePeriod?: (periodId: string) => void,
    ) => {
      return new Promise<{ period: IPeriod; role: string }>((resolve) => {
        // Update state and refs
        setPeriods(newPeriods);
        setDeletePeriodCallback(() => onDeletePeriod);
        onSelectRef.current = onSelect;

        // Wait for state updates
        setTimeout(() => {
          present({
            initialBreakpoint: 0.99,
            breakpoints: [0, 0.5, 0.99],
            onWillDismiss: (ev: CustomEvent<OverlayEventDetail>) => {
              if (ev.detail.role) {
                resolve({ period: ev.detail.data, role: ev.detail.role });
              }
            },
          });
        }, 50);
      });
    },
    [present],
  );

  return {
    open,
    dismiss,
  };
};

export default PeriodListModal;
