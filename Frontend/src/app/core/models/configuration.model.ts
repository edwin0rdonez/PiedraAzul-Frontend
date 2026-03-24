export interface SystemConfigurationRequest {
  ventanaSemanas: number;
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  timestamp: string;
  detail: string;
}
