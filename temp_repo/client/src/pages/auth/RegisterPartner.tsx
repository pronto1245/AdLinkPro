import UnifiedRegistration, { ROLE_CONFIGS } from '@/components/auth/UnifiedRegistration';

export default function RegisterPartner() {
  return <UnifiedRegistration config={ROLE_CONFIGS.PARTNER} />;
}