import React from 'react';
import Login from '@/pages/auth/login';
import RegisterUnified from '@/pages/auth/RegisterUnified';

export const LoginPartner = () => <Login />;
export const LoginAdvertiser = () => <Login />;
export const RegisterPartner = () => <RegisterUnified role="partner" />;
export const RegisterAdvertiser = () => <RegisterUnified role="advertiser" />;
