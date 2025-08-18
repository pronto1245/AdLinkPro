import React from 'react';
type State = { error: any };
export default class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: any) { return { error }; }
  componentDidCatch(error: any, info: any) { console.error('ErrorBoundary', error, info); }
  render() {
    if (this.state.error) {
      return (
        <div style={{padding:24,fontFamily:'sans-serif'}}>
          <h1>Ошибка приложения</h1>
          <pre style={{whiteSpace:'pre-wrap'}}>{String(this.state.error?.stack || this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children as any;
  }
}
