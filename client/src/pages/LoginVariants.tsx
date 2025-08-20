import React from 'react';
import Login from '@/pages/auth/login';
import RegisterUnified from '@/pages/auth/RegisterUnified';

export const LoginPartner = () => <Login />;
export const LoginAdvertiser = () => <Login />;
export const RegisterPartnerComponent = () => <RegisterUnified role="PARTNER" />;
export const RegisterAdvertiserComponent = () => <RegisterUnified role="ADVERTISER" />;
