import React from 'react';
import Login from '@/pages/auth/login';
import RegisterUnified from '@/pages/auth/RegisterUnified';

export const LoginPartner = () => <Login role="partner" />;
export const LoginAdvertiser = () => <Login role="advertiser" />;
export const RegisterPartner = () => <RegisterUnified role="partner" />;
export const RegisterAdvertiser = () => <RegisterUnified role="advertiser" />;
