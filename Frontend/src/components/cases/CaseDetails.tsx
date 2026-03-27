import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  ChevronLeft, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Users, 
  Clock,
  Video 
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { cases } from "@/services/api";

import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export function CaseDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCaseDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await cases.getCaseById(id);
        
        // Map backend data to frontend format
        const mappedCase = {
          id: data._id,
          title: data.case?.subject || data.litigant?.name || "Unknown Case",
          caseNumber: data.caseNumber || "Pending",
          status: data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : "Pending",
          date: data.filingDate || data.createdAt || new Date().toISOString(),
          type: data.case?.caseType || "Unknown",
          description: data.case?.causeOfAction || "No description available.",
          judge: data.assignedJudge?.fullName || "Unassigned",
          plaintiffs: [data.litigant?.name].filter(Boolean),
          defendants: [data.case?.causeAgainstWhom].filter(Boolean),
          attorneys: [data.assignedLawyer?.fullName].filter(Boolean),
          hearings: [], // Meetings could be mapped here if available
          documents: (data.documents || []).map((doc: any) => ({
            id: doc._id,
            title: doc.title,
            date: doc.uploadedAt,
            author: doc.uploadedBy?.fullName || "Unknown",
            type: "Document"
          })),
          timeline: (data.timeline || []).map((item: any, index: number) => ({
            id: item._id || `t${index}`,
            event: item.action,
            date: item.date
          }))
        };
        
        setCaseData(mappedCase);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch case details:", err);
        setError("Failed to load case details.");
      } finally {
        setLoading(false);
      }
    };

    fetchCaseDetails();
  }, [id]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !id) return;

    try {
      setIsUploading(true);
      
      // Simulated upload progress toast
      toast.info(`Uploading ${file.name}...`);
      
      // In a real production app, you would use FormData to upload the file to S3/Cloudinary
      // For this hackathon demo, we'll store the filename as the title and a mock URL
      const fileUrl = `https://legal-ease-storage.s3.amazonaws.com/uploads/${id}/${encodeURIComponent(file.name)}`;
      
      await cases.addDocument(id, { 
        title: file.name, 
        fileUrl 
      });

      toast.success("Document uploaded successfully");
      
      // Refresh case details to show the new document
      const updatedData = await cases.getCaseById(id);
      // Map again (could refactor this to a function)
      setCaseData({
        ...caseData,
        documents: (updatedData.documents || []).map((doc: any) => ({
          id: doc._id,
          title: doc.title,
          date: doc.uploadedAt,
          author: doc.uploadedBy?.fullName || "Unknown",
          type: "Document"
        }))
      });
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Failed to upload document");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const [isActionLoading, setIsActionLoading] = useState(false);
  const [decision, setDecision] = useState({
    severity: 'medium',
    hearingType: 'online',
    description: ''
  });

  const handleJudgeAction = async (status: 'approved' | 'rejected') => {
    if (!id) return;
    try {
      setIsActionLoading(true);
      await cases.performAction(id, {
        status,
        ...decision
      });
      toast.success(`Case ${status === 'approved' ? 'accepted' : 'rejected'} successfully`);
      // Refresh
      window.location.reload();
    } catch (err) {
      console.error("Action failed:", err);
      toast.error("Failed to update case status");
    } finally {
      setIsActionLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading case details...</div>;
  }

  if (error || !caseData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Case not found</h2>
        <p className="text-muted-foreground mt-2">{error || "The case you're looking for doesn't exist or has been moved."}</p>
        <Button asChild className="mt-4">
          <Link to="/cases">Back to Cases</Link>
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "approved":
        return "bg-green-500/10 text-green-600 border-green-200";
      case "pending":
      case "processing":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-200";
      case "closed":
      case "rejected":
        return "bg-gray-500/10 text-gray-600 border-gray-200";
      case "archived":
        return "bg-red-500/10 text-red-600 border-red-200";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Judge Action Panel - Only visible to Judge for pending cases */}
      {user?.role === 'judge' && caseData.status.toLowerCase() === 'pending' && (
        <Card className="border-primary/50 bg-primary/5 mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Judge Decision Required</CardTitle>
            <CardDescription>Review this case filing and set initial parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Case Severity</Label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high'].map((sev) => (
                    <Button
                      key={sev}
                      variant={decision.severity === sev ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDecision({ ...decision, severity: sev })}
                      className="capitalize"
                    >
                      {sev}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Hearing Preference</Label>
                <div className="flex gap-2">
                  {['online', 'offline'].map((type) => (
                    <Button
                      key={type}
                      variant={decision.hearingType === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDecision({ ...decision, hearingType: type })}
                      className="capitalize"
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Remarks / Initial Instructions</Label>
              <textarea
                className="w-full min-h-[80px] p-2 rounded-md border bg-background text-sm"
                placeholder="Enter any initial instructions or reasons for the decision..."
                value={decision.description}
                onChange={(e) => setDecision({ ...decision, description: e.target.value })}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button 
              variant="destructive" 
              onClick={() => handleJudgeAction('rejected')}
              disabled={isActionLoading}
            >
              Reject Case
            </Button>
            <Button 
              onClick={() => handleJudgeAction('approved')}
              disabled={isActionLoading}
            >
              {isActionLoading ? 'Processing...' : 'Accept & Categorize'}
            </Button>
          </CardFooter>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/cases">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{caseData.title}</h1>
          <Badge variant="outline" className={`ml-2 ${getStatusColor(caseData.status)}`}>
            {caseData.status}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          {user?.role === 'lawyer' && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.png"
              />
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={handleUploadClick}
                disabled={isUploading}
              >
                <FileText className="h-4 w-4" /> {isUploading ? "Uploading..." : "Upload Proof"}
              </Button>
            </>
          )}
          {user?.role === 'judge' && (
            <Button onClick={() => navigate('/meeting')} className="flex items-center gap-2">
              <Video className="h-4 w-4" /> Schedule a Court Hearing
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Case Overview</CardTitle>
          <CardDescription>Case #{caseData.caseNumber} • {caseData.type}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>{caseData.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Judge</p>
                <p className="text-sm text-muted-foreground">{caseData.judge}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Filed On</p>
                <p className="text-sm text-muted-foreground">{new Date(caseData.date).toLocaleDateString()}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Plaintiff(s)</p>
                <p className="text-sm text-muted-foreground">{caseData.plaintiffs.length > 0 ? caseData.plaintiffs.join(", ") : "N/A"}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Defendant(s)</p>
                <p className="text-sm text-muted-foreground">{caseData.defendants.length > 0 ? caseData.defendants.join(", ") : "N/A"}</p>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <p className="text-sm font-medium">Attorneys</p>
                <p className="text-sm text-muted-foreground">{caseData.attorneys.length > 0 ? caseData.attorneys.join(", ") : "N/A"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="hearings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hearings">Hearings</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>
        
        <TabsContent value="hearings" className="space-y-4 mt-6">
          {caseData.hearings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No hearings scheduled yet.</div>
          ) : (
            caseData.hearings.map((hearing: any) => (
              <Card key={hearing.id} className="hover-card">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{hearing.title}</CardTitle>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      Upcoming
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{new Date(hearing.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{hearing.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Video className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{hearing.location}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button size="sm">Join Hearing</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="documents" className="mt-6">
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {caseData.documents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No documents available.
                    </TableCell>
                  </TableRow>
                ) : (
                  caseData.documents.map((doc: any) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.title}</TableCell>
                      <TableCell>{doc.type}</TableCell>
                      <TableCell>{new Date(doc.date).toLocaleDateString()}</TableCell>
                      <TableCell>{doc.author}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="timeline" className="space-y-4 mt-6">
          <div className="border-l-2 border-muted pl-6 space-y-6 ml-4">
            {caseData.timeline.length === 0 ? (
               <div className="text-muted-foreground py-4">No timeline events recorded.</div>
            ) : (
              caseData.timeline.map((item: any) => (
                <div key={item.id} className="relative">
                  <div className="absolute -left-[30px] h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-white"></div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{item.event}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
