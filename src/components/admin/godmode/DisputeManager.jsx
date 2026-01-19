import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Scale, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function DisputeManager() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Dispute.list('-created_date', 500);
      setDisputes(data || []);
    } catch (error) {
      console.error("Failed to load disputes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRefund = async (dispute) => {
    if (!confirm(`Approve refund of ${dispute.credits_amount} credits to ${dispute.roofer_name}?`)) {
      return;
    }

    try {
      // Update dispute status
      await base44.entities.Dispute.update(dispute.id, {
        status: "refunded"
      });

      // Refund credits to company
      if (dispute.company_id) {
        const companies = await base44.entities.Company.filter({ id: dispute.company_id });
        if (companies && companies.length > 0) {
          const company = companies[0];
          await base44.entities.Company.update(company.id, {
            lead_credits: (company.lead_credits || 0) + (dispute.credits_amount || 0)
          });
        }
      }

      toast.success("Refund approved and credits restored!");
      loadDisputes();
    } catch (error) {
      console.error("Failed to approve refund:", error);
      toast.error("Failed to approve refund");
    }
  };

  const handleDeny = async (dispute) => {
    if (!confirm(`Deny this dispute from ${dispute.roofer_name}?`)) {
      return;
    }

    try {
      await base44.entities.Dispute.update(dispute.id, {
        status: "rejected"
      });
      toast.success("Dispute rejected");
      loadDisputes();
    } catch (error) {
      console.error("Failed to reject dispute:", error);
      toast.error("Failed to reject dispute");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      refunded: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800"
    };
    return <Badge className={styles[status]}>{status.toUpperCase()}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-purple-600">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Scale className="w-6 h-6" />
            ⚖️ The Tribunal - Dispute Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b-2 border-slate-200">
                <tr>
                  <th className="text-left p-3 font-semibold text-sm">Roofer Name</th>
                  <th className="text-left p-3 font-semibold text-sm">Lead Address</th>
                  <th className="text-left p-3 font-semibold text-sm">Reason</th>
                  <th className="text-left p-3 font-semibold text-sm">Credits</th>
                  <th className="text-left p-3 font-semibold text-sm">Status</th>
                  <th className="text-left p-3 font-semibold text-sm">Date</th>
                  <th className="text-left p-3 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {disputes.map((dispute) => (
                  <tr key={dispute.id} className="border-b hover:bg-slate-50">
                    <td className="p-3 font-medium">{dispute.roofer_name}</td>
                    <td className="p-3 text-sm">{dispute.lead_address}</td>
                    <td className="p-3 text-sm max-w-xs truncate">{dispute.reason}</td>
                    <td className="p-3 text-sm font-bold">{dispute.credits_amount || 'N/A'}</td>
                    <td className="p-3">{getStatusBadge(dispute.status)}</td>
                    <td className="p-3 text-sm text-slate-600">
                      {format(new Date(dispute.created_date), 'MMM d, yyyy')}
                    </td>
                    <td className="p-3">
                      {dispute.status === "pending" ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApproveRefund(dispute)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve Refund
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeny(dispute)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Deny
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-500">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {disputes.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              No disputes filed
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {disputes.filter(d => d.status === "pending").length}
            </div>
            <div className="text-sm text-slate-600">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {disputes.filter(d => d.status === "refunded").length}
            </div>
            <div className="text-sm text-slate-600">Refunded</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {disputes.filter(d => d.status === "rejected").length}
            </div>
            <div className="text-sm text-slate-600">Rejected</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}