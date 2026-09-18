import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { AlertCircle, Clock, CalendarRange } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";

interface StudentViewProps {
  sectionId: string;
}

export default function StudentView({ sectionId }: StudentViewProps) {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'routine' | 'polls'>('routine');

  // Mock polling data based on PDF page 27
  const [polls, setPolls] = useState([
    {
      id: "poll_1",
      subject: "DBMS Makeup",
      options: [
        { id: "opt_1", time: "Monday 3–4", votes: 12 },
        { id: "opt_2", time: "Tuesday 2–3", votes: 41 },
        { id: "opt_3", time: "Wednesday 4–5", votes: 8 }
      ],
      recommended: "opt_2",
      voted: false
    }
  ]);

  const loadData = () => {
    fetch(`/api/dashboard/student/${sectionId}`)
      .then(res => res.json())
      .then(setData);
  }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [sectionId]);

  const handleVote = (pollId: string, optionId: string) => {
    setPolls(polls.map(poll => {
      if (poll.id === pollId && !poll.voted) {
        return {
          ...poll,
          voted: true,
          options: poll.options.map(opt => 
            opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
          )
        };
      }
      return poll;
    }));
  };

  if (!data) return <div className="p-8 text-slate-500">Loading Student Dashboard...</div>;

  const activeAlerts = data.routine.filter((s: any) => s.status === 'cancelled');
  const rescheduled = data.routine.filter((s: any) => s.status === 'rescheduled');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Student Dashboard: {sectionId.toUpperCase()}</h1>
      </div>

      <div className="flex space-x-2 border-b pb-4 mb-2">
        <Button 
          variant={activeTab === 'routine' ? 'default' : 'ghost'} 
          onClick={() => setActiveTab('routine')}
          className={activeTab === 'routine' ? 'bg-slate-900' : 'text-slate-600'}
        >
          My Schedule
        </Button>
        <Button 
          variant={activeTab === 'polls' ? 'default' : 'ghost'} 
          onClick={() => setActiveTab('polls')}
          className={activeTab === 'polls' ? 'bg-slate-900' : 'text-slate-600 relative'}
        >
          Class Polling
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center border-2 border-white">1</span>
        </Button>
      </div>
      
      {activeTab === 'routine' && (
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>My Schedule</CardTitle>
              <CardDescription>Your live timetable for the week.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.routine.map((slot: any) => (
                  <div key={slot.id} className={`flex justify-start items-center p-3 rounded-lg border transition-colors ${slot.status === 'cancelled' ? 'bg-red-50 border-red-100' : slot.status === 'rescheduled' ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                    <div className="w-32">
                      <div className="font-semibold text-sm text-slate-700">{slot.day}</div>
                      <div className="font-mono text-xs text-slate-500 flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" /> {slot.time}
                      </div>
                    </div>
                    <div className="flex-1 px-4 border-l ml-2">
                      <div className={`font-semibold ${slot.status === 'cancelled' ? 'line-through text-slate-500' : 'text-slate-900'}`}>{slot.subject}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        Room: {slot.room || 'TBD'}
                      </div>
                    </div>
                    <div>
                      {slot.status === 'cancelled' && <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100 border-0 shadow-none">Cancelled</Badge>}
                      {slot.status === 'rescheduled' && <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-100 border-0 shadow-none">Rescheduled</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Live Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeAlerts.length === 0 && rescheduled.length === 0 && (
                <div className="text-sm text-slate-500 text-center py-4">No active alerts.</div>
              )}
              
              {activeAlerts.map((alert: any) => (
                <div key={alert.id} className="flex items-start bg-red-50 text-red-900 p-4 rounded-lg border border-red-100">
                  <AlertCircle className="mr-3 h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-sm">Session Cancelled</div>
                    <div className="text-xs mt-1">{alert.subject} scheduled for {alert.day} has been cancelled.</div>
                  </div>
                </div>
              ))}
              
              {rescheduled.map((res: any) => (
                <div key={res.id} className="flex items-start bg-green-50 text-green-900 p-4 rounded-lg border border-green-100">
                  <div className="h-5 w-5 mr-3 flex items-center justify-center rounded-full bg-green-200 text-green-700 font-bold text-xs mt-0.5">!</div>
                  <div>
                    <div className="font-semibold text-sm">Session Rescheduled</div>
                    <div className="text-xs mt-1">{res.subject} makeup session scheduled for {res.day} {res.time}.</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
      )}

      {activeTab === 'polls' && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Class Representative Polling</CardTitle>
            <CardDescription>Vote on flexible makeup times proposed by the system.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {polls.map(poll => {
              const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
              
              return (
                <div key={poll.id} className="border rounded-lg p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg">{poll.subject}</h3>
                    {poll.voted && <Badge variant="outline" className="bg-slate-100">Vote Recorded</Badge>}
                  </div>
                  
                  <div className="space-y-3">
                    {poll.options.map(opt => {
                      const percentage = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);
                      const isRecommended = poll.recommended === opt.id;
                      
                      return (
                        <div key={opt.id} className="relative">
                          <button 
                            className={`w-full text-left p-3 rounded-md border flex items-center justify-between transition-colors z-10 relative bg-transparent ${poll.voted ? 'cursor-default' : 'hover:border-indigo-300 cursor-pointer'} ${isRecommended && !poll.voted ? 'border-indigo-200' : 'border-slate-200'}`}
                            onClick={() => handleVote(poll.id, opt.id)}
                            disabled={poll.voted}
                          >
                            <div className="flex items-center space-x-3">
                              <span className="font-medium text-sm">{opt.time}</span>
                              {isRecommended && <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-0 text-[10px] px-1.5 py-0">Recommended</Badge>}
                            </div>
                            {poll.voted && (
                              <span className="text-sm font-semibold text-slate-600">{opt.votes} votes ({percentage}%)</span>
                            )}
                          </button>
                          
                          {/* Progress bar background */}
                          {poll.voted && (
                            <div 
                              className="absolute top-0 left-0 h-full bg-slate-100 rounded-md -z-10 transition-all duration-1000 ease-out"
                              style={{ width: `${percentage}%` }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
