import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Card } from '../../ui/card';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    api.get('/audit').then((response) => setLogs(response.data)).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-semibold text-slate-900">Audit Logs</h2>
        <p className="mt-2 text-sm text-slate-500">View system audit events for security review, financial compliance, and internal review.</p>
      </Card>
      <div className="grid gap-4">
        {logs.map((log) => (
          <Card key={log.id}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-slate-900">{log.action}</p>
                <p className="text-sm text-slate-600">Entity: {log.entity} {log.entityId ? `#${log.entityId}` : ''}</p>
              </div>
              <span className="rounded-full bg-slate-200 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-600">{new Date(log.timestamp).toLocaleString()}</span>
            </div>
            <p className="mt-3 text-sm text-slate-500">{log.details}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
