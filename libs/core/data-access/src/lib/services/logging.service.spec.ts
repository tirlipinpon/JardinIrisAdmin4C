import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { LoggingService, LogLevel } from './logging.service';

describe('LoggingService', () => {
  let service: LoggingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LoggingService,
        provideZonelessChangeDetection()
      ]
    });

    service = TestBed.inject(LoggingService);
    
    spyOn(console, 'log');
    spyOn(console, 'error');
    spyOn(console, 'group');
    spyOn(console, 'groupEnd');
  });

  afterEach(() => {
    service.clearLogs();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('log()', () => {
    it('should create log entry with correct structure', () => {
      const level = LogLevel.INFO;
      const context = 'TEST_CONTEXT';
      const message = 'Test message';
      const data = { key: 'value' };

      service.log(level, context, message, data);

      const logs = service.getLogs();
      expect(logs.length).toBe(1);
      expect(logs[0].level).toBe(level);
      expect(logs[0].context).toBe(context);
      expect(logs[0].message).toBe(message);
      expect(logs[0].data).toBe(data);
      expect(logs[0].timestamp).toBeInstanceOf(Date);
    });

    it('should log to console with correct format', () => {
      const level = LogLevel.INFO;
      const context = 'TEST_CONTEXT';
      const message = 'Test message';
      const data = { key: 'value' };

      service.log(level, context, message, data);

      expect(console.log).toHaveBeenCalledWith(
        jasmine.stringMatching(/📝 \[.*\] \[INFO\] \[TEST_CONTEXT\] Test message/),
        data
      );
    });

    it('should not log when disabled', () => {
      service.disable();
      service.log(LogLevel.INFO, 'TEST', 'Message');
      
      expect(service.getLogs().length).toBe(0);
      expect(console.log).not.toHaveBeenCalled();
    });

    it('should log when re-enabled', () => {
      service.disable();
      service.enable();
      service.log(LogLevel.INFO, 'TEST', 'Message');
      
      expect(service.getLogs().length).toBe(1);
      expect(console.log).toHaveBeenCalled();
    });

    it('should handle log without data', () => {
      service.log(LogLevel.INFO, 'TEST', 'Message');

      expect(console.log).toHaveBeenCalledWith(
        jasmine.stringMatching(/📝 \[.*\] \[INFO\] \[TEST\] Message/),
        ''
      );
    });
  });

  describe('debug()', () => {
    it('should call log with DEBUG level', () => {
      spyOn(service, 'log');
      service.debug('TEST', 'Debug message');
      
      expect(service.log).toHaveBeenCalledWith(LogLevel.DEBUG, 'TEST', 'Debug message', undefined);
    });

    it('should create debug log entry', () => {
      service.debug('TEST', 'Debug message', { data: 'test' });
      
      const logs = service.getLogs();
      expect(logs[0].level).toBe(LogLevel.DEBUG);
      expect(logs[0].message).toBe('Debug message');
    });
  });

  describe('info()', () => {
    it('should call log with INFO level', () => {
      spyOn(service, 'log');
      service.info('TEST', 'Info message');
      
      expect(service.log).toHaveBeenCalledWith(LogLevel.INFO, 'TEST', 'Info message', undefined);
    });

    it('should create info log entry', () => {
      service.info('TEST', 'Info message', { data: 'test' });
      
      const logs = service.getLogs();
      expect(logs[0].level).toBe(LogLevel.INFO);
      expect(logs[0].message).toBe('Info message');
    });
  });

  describe('warn()', () => {
    it('should call log with WARN level', () => {
      spyOn(service, 'log');
      service.warn('TEST', 'Warning message');
      
      expect(service.log).toHaveBeenCalledWith(LogLevel.WARN, 'TEST', 'Warning message', undefined);
    });

    it('should create warning log entry', () => {
      service.warn('TEST', 'Warning message', { data: 'test' });
      
      const logs = service.getLogs();
      expect(logs[0].level).toBe(LogLevel.WARN);
      expect(logs[0].message).toBe('Warning message');
    });
  });

  describe('error()', () => {
    it('should call log with ERROR level', () => {
      spyOn(service, 'log');
      service.error('TEST', 'Error message');
      
      expect(service.log).toHaveBeenCalledWith(LogLevel.ERROR, 'TEST', 'Error message', undefined);
    });

    it('should create error log entry', () => {
      service.error('TEST', 'Error message', { data: 'test' });
      
      const logs = service.getLogs();
      expect(logs[0].level).toBe(LogLevel.ERROR);
      expect(logs[0].message).toBe('Error message');
    });
  });

  describe('getEmojiForContext()', () => {
    it('should return correct emojis for known contexts', () => {
      const testCases = [
        { context: 'COMPONENT_TEST', expected: '🚀' },
        { context: 'APPLICATION_TEST', expected: '🔄' },
        { context: 'STORE_TEST', expected: '⚡' },
        { context: 'INFRASTRUCTURE_TEST', expected: '🔧' },
        { context: 'SUPABASE_TEST', expected: '🌐' },
        { context: 'API_TEST', expected: '🌍' },
        { context: 'ERROR_TEST', expected: '❌' },
        { context: 'SUCCESS_TEST', expected: '✅' }
      ];

      testCases.forEach(({ context, expected }) => {
        service.info(context, 'Test message');
        const logs = service.getLogs();
        const logMessage = logs[logs.length - 1];
        expect(console.log).toHaveBeenCalledWith(
          jasmine.stringMatching(new RegExp(`^${expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`)),
          ''
        );
      });
    });

    it('should return default emoji for unknown contexts', () => {
      service.info('UNKNOWN_CONTEXT', 'Test message');
      
      expect(console.log).toHaveBeenCalledWith(
        jasmine.stringMatching(/^📝/),
        ''
      );
    });

    it('should match partial context names', () => {
      service.info('MY_COMPONENT_SERVICE', 'Test message');
      
      expect(console.log).toHaveBeenCalledWith(
        jasmine.stringMatching(/^🚀/),
        ''
      );
    });
  });

  describe('getLogs()', () => {
    it('should return copy of logs array', () => {
      service.info('TEST', 'Message 1');
      service.warn('TEST', 'Message 2');
      
      const logs1 = service.getLogs();
      const logs2 = service.getLogs();
      
      expect(logs1).not.toBe(service['logs']); // Should be a copy
      expect(logs1).toEqual(logs2);
      expect(logs1.length).toBe(2);
    });

    it('should return empty array when no logs', () => {
      const logs = service.getLogs();
      expect(logs).toEqual([]);
    });

    it('should maintain log order', () => {
      service.info('TEST', 'First');
      service.warn('TEST', 'Second');
      service.error('TEST', 'Third');
      
      const logs = service.getLogs();
      expect(logs[0].message).toBe('First');
      expect(logs[1].message).toBe('Second');
      expect(logs[2].message).toBe('Third');
    });
  });

  describe('clearLogs()', () => {
    it('should clear all logs', () => {
      service.info('TEST', 'Message 1');
      service.warn('TEST', 'Message 2');
      expect(service.getLogs().length).toBe(2);
      
      service.clearLogs();
      expect(service.getLogs().length).toBe(0);
    });

    it('should not affect logging after clearing', () => {
      service.info('TEST', 'Message 1');
      service.clearLogs();
      service.info('TEST', 'Message 2');
      
      const logs = service.getLogs();
      expect(logs.length).toBe(1);
      expect(logs[0].message).toBe('Message 2');
    });
  });

  describe('enable()', () => {
    it('should enable logging', () => {
      service.disable();
      expect(service.getLogs().length).toBe(0);
      
      service.enable();
      service.info('TEST', 'Message');
      expect(service.getLogs().length).toBe(1);
    });
  });

  describe('disable()', () => {
    it('should disable logging', () => {
      service.info('TEST', 'Message 1');
      expect(service.getLogs().length).toBe(1);
      
      service.disable();
      service.info('TEST', 'Message 2');
      expect(service.getLogs().length).toBe(1); // Should still be 1
    });
  });

  describe('LogLevel enum', () => {
    it('should have correct values', () => {
      expect(LogLevel.DEBUG).toBe('DEBUG');
      expect(LogLevel.INFO).toBe('INFO');
      expect(LogLevel.WARN).toBe('WARN');
      expect(LogLevel.ERROR).toBe('ERROR');
    });
  });

  describe('LogEntry interface', () => {
    it('should create entries with all required properties', () => {
      const data = { test: 'data' };
      service.info('TEST', 'Message', data);
      
      const log = service.getLogs()[0];
      expect(log.timestamp).toBeDefined();
      expect(log.level).toBeDefined();
      expect(log.context).toBeDefined();
      expect(log.message).toBeDefined();
      expect(log.data).toBe(data);
    });
  });

  describe('Console output format', () => {
    it('should format timestamp correctly', () => {
      const beforeTime = new Date();
      service.info('TEST', 'Message');
      const afterTime = new Date();
      
      expect(console.log).toHaveBeenCalledWith(
        jasmine.stringMatching(/📝 \[.*\] \[INFO\] \[TEST\] Message/),
        ''
      );
    });

    it('should include data in console output', () => {
      const data = { key: 'value', number: 123 };
      service.info('TEST', 'Message', data);
      
      expect(console.log).toHaveBeenCalledWith(
        jasmine.stringMatching(/📝 \[.*\] \[INFO\] \[TEST\] Message/),
        data
      );
    });
  });

  describe('Multiple log levels', () => {
    it('should handle all log levels correctly', () => {
      service.debug('TEST', 'Debug message');
      service.info('TEST', 'Info message');
      service.warn('TEST', 'Warning message');
      service.error('TEST', 'Error message');
      
      const logs = service.getLogs();
      expect(logs.length).toBe(4);
      expect(logs[0].level).toBe(LogLevel.DEBUG);
      expect(logs[1].level).toBe(LogLevel.INFO);
      expect(logs[2].level).toBe(LogLevel.WARN);
      expect(logs[3].level).toBe(LogLevel.ERROR);
    });
  });

  describe('Complex data logging', () => {
    it('should handle complex objects', () => {
      const complexData = {
        nested: { value: 123 },
        array: [1, 2, 3],
        nullValue: null,
        undefinedValue: undefined
      };
      
      service.info('TEST', 'Complex data', complexData);
      
      const logs = service.getLogs();
      expect(logs[0].data).toEqual(complexData);
    });

    it('should handle arrays', () => {
      const arrayData = [1, 2, 3, 'test'];
      service.info('TEST', 'Array data', arrayData);
      
      const logs = service.getLogs();
      expect(logs[0].data).toEqual(arrayData);
    });

    it('should handle null and undefined data', () => {
      service.info('TEST', 'Null data', null);
      service.info('TEST', 'Undefined data', undefined);
      
      const logs = service.getLogs();
      expect(logs[0].data).toBeNull();
      expect(logs[1].data).toBeUndefined();
    });
  });
});
