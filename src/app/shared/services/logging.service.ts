import { Injectable } from '@angular/core';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  context: string;
  message: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  private logs: LogEntry[] = [];
  private isEnabled = true;

  log(level: LogLevel, context: string, message: string, data?: any): void {
    if (!this.isEnabled) return;

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      context,
      message,
      data
    };

    this.logs.push(entry);
    
    // Affichage console avec émojis et formatage
    const emoji = this.getEmojiForContext(context);
    const timestamp = entry.timestamp.toLocaleTimeString();
    
    console.log(
      `${emoji} [${timestamp}] [${level}] [${context}] ${message}`,
      data ? data : ''
    );
  }

  debug(context: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, context, message, data);
  }

  info(context: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, context, message, data);
  }

  warn(context: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, context, message, data);
  }

  error(context: string, message: string, data?: any): void {
    this.log(LogLevel.ERROR, context, message, data);
  }

  private getEmojiForContext(context: string): string {
    const contextMap: { [key: string]: string } = {
      'COMPONENT': '🚀',
      'APPLICATION': '🔄',
      'STORE': '⚡',
      'INFRASTRUCTURE': '🔧',
      'SUPABASE': '🌐',
      'API': '🌍',
      'ERROR': '❌',
      'SUCCESS': '✅'
    };

    for (const [key, emoji] of Object.entries(contextMap)) {
      if (context.includes(key)) {
        return emoji;
      }
    }
    return '📝';
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  enable(): void {
    this.isEnabled = true;
  }

  disable(): void {
    this.isEnabled = false;
  }
}
