import React from "react";
import { Route } from "wouter";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <>
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
    </>
  );
}
