import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRefresh = () => {
    window.location.reload();
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full shadow-2xl">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                  <AlertTriangle className="w-10 h-10 text-red-600" />
                </div>
                
                <h1 className="text-3xl font-bold text-slate-900 mb-3">
                  Oops! Something went wrong
                </h1>
                
                <p className="text-lg text-slate-600 mb-8">
                  We encountered an unexpected error. Please try refreshing the page.
                </p>

                <Button
                  onClick={this.handleRefresh}
                  className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 mb-6"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Refresh Page
                </Button>

                <div className="w-full border-t pt-6">
                  <button
                    onClick={this.toggleDetails}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-medium mx-auto"
                  >
                    {this.state.showDetails ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Hide Technical Details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Show Technical Details (for developers)
                      </>
                    )}
                  </button>

                  {this.state.showDetails && (
                    <div className="mt-4 text-left">
                      <div className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96 text-xs font-mono">
                        <div className="mb-4">
                          <div className="text-red-400 font-bold mb-2">Error Message:</div>
                          <div>{this.state.error?.toString()}</div>
                        </div>
                        
                        {this.state.errorInfo && (
                          <div>
                            <div className="text-red-400 font-bold mb-2">Stack Trace:</div>
                            <pre className="whitespace-pre-wrap">
                              {this.state.errorInfo.componentStack}
                            </pre>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-xs text-slate-500 mt-3 text-center">
                        💡 Copy this error message and send it to your developer
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-slate-500">
                    If this problem persists, please contact{' '}
                    <a href="mailto:support@aroof.build" className="text-blue-600 hover:underline">
                      support@aroof.build
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;