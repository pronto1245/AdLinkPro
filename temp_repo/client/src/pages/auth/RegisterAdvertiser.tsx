import UnifiedRegistration, { ROLE_CONFIGS } from '@/components/auth/UnifiedRegistration';

export default function RegisterAdvertiser() {
  return <UnifiedRegistration config={ROLE_CONFIGS.ADVERTISER} />;
}