import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

class DiagnosticErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("DiagnosticErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
        this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] p-8 bg-red-50 flex items-center justify-center">
            <Card className="w-full max-w-4xl border-red-200 shadow-lg">
                <CardHeader className="bg-red-100 border-b border-red-200">
                    <CardTitle className="flex items-center gap-2 text-red-800">
                        <AlertCircle className="w-6 h-6" />
                        Runtime Error Detected
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div>
                        <h3 className="font-bold text-red-900 mb-2">Error Message:</h3>
                        <pre className="bg-white p-4 rounded border border-red-200 text-red-700 text-sm overflow-auto">
                            {this.state.error && this.state.error.toString()}
                        </pre>
                    </div>
                    
                    <div>
                        <h3 className="font-bold text-slate-700 mb-2">Component Stack:</h3>
                        <pre className="bg-slate-900 text-slate-50 p-4 rounded text-xs font-mono overflow-auto max-h-96">
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </pre>
                    </div>

                    <div className="flex gap-4">
                        <Button 
                            onClick={() => window.location.reload()} 
                            variant="destructive"
                        >
                            Reload Page
                        </Button>
                        <Button 
                            onClick={this.handleReset}
                            variant="outline"
                            className="bg-white"
                        >
                            Try Again
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DiagnosticErrorBoundary;