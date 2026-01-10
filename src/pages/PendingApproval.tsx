import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, LogOut, Star, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';

export default function PendingApproval() {
  const { userRole, signOut, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user's role is no longer pending, redirect to dashboard
    if (!loading && userRole && userRole.role !== 'pending') {
      navigate('/');
    }
  }, [userRole, loading, navigate]);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <Clock className="h-8 w-8 text-amber-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Pending Approval</CardTitle>
          <CardDescription>
            Your account has been created successfully. Please wait for an administrator to approve your access.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-2">What happens next?</p>
            <ul className="list-disc list-inside space-y-1">
              <li>An administrator will review your account</li>
              <li>You will be assigned an appropriate role</li>
              <li>You will receive access to the system</li>
            </ul>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button onClick={handleRefresh} variant="outline" className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Check Status
            </Button>
            <Button onClick={signOut} variant="ghost" className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
