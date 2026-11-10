import { OrganizerPayoutsView } from './OrganizerPayoutsView';

interface PayoutsSectionProps {
  organizationId?: string;
  availableBalanceCents?: number;
  reservedBalanceCents?: number;
  onBalanceUpdated?: () => void;
}

export function PayoutsSection(props: PayoutsSectionProps) {
  return <OrganizerPayoutsView {...props} />;
}
