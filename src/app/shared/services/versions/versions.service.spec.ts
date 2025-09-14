import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { VersionService } from './versions.service';

describe('VersionService', () => {
  let service: VersionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
    service = TestBed.inject(VersionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getBuildNumber', () => {
    it('should return build number', () => {
      const buildNumber = service.getBuildNumber();
      expect(buildNumber).toBeDefined();
      expect(typeof buildNumber).toBe('string');
      expect(buildNumber).toMatch(/^\d+\.\d+\.\d+$/); // Format: x.x.x
    });

    it('should return consistent build number', () => {
      const buildNumber1 = service.getBuildNumber();
      const buildNumber2 = service.getBuildNumber();
      expect(buildNumber1).toBe(buildNumber2);
    });
  });

  describe('getBuildDate', () => {
    it('should return build date', () => {
      const buildDate = service.getBuildDate();
      expect(buildDate).toBeDefined();
      expect(typeof buildDate).toBe('string');
      expect(buildDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/); // ISO format
    });

    it('should return valid ISO date string', () => {
      const buildDate = service.getBuildDate();
      const date = new Date(buildDate);
      expect(date instanceof Date).toBe(true);
      expect(isNaN(date.getTime())).toBe(false);
    });

    it('should return consistent build date', () => {
      const buildDate1 = service.getBuildDate();
      const buildDate2 = service.getBuildDate();
      expect(buildDate1).toBe(buildDate2);
    });
  });

  describe('getFullVersionInfo', () => {
    it('should return full version info object', () => {
      const versionInfo = service.getFullVersionInfo();
      expect(versionInfo).toBeDefined();
      expect(typeof versionInfo).toBe('object');
      expect(versionInfo.hasOwnProperty('buildNumber')).toBe(true);
      expect(versionInfo.hasOwnProperty('buildDate')).toBe(true);
    });

    it('should return copy of version info', () => {
      const versionInfo1 = service.getFullVersionInfo();
      const versionInfo2 = service.getFullVersionInfo();
      
      // Should be equal but not the same reference
      expect(versionInfo1).toEqual(versionInfo2);
      expect(versionInfo1).not.toBe(versionInfo2);
    });

    it('should have correct structure', () => {
      const versionInfo = service.getFullVersionInfo();
      expect(typeof versionInfo.buildNumber).toBe('string');
      expect(typeof versionInfo.buildDate).toBe('string');
      expect(versionInfo.buildNumber).toMatch(/^\d+\.\d+\.\d+$/);
      expect(versionInfo.buildDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('logToConsole', () => {
    let consoleSpy: jasmine.Spy;

    beforeEach(() => {
      consoleSpy = spyOn(console, 'group');
      spyOn(console, 'log');
      spyOn(console, 'groupEnd');
    });

    it('should log version info to console', () => {
      service.logToConsole();
      
      expect(consoleSpy).toHaveBeenCalledWith('🔧 Version Info');
      expect(console.log).toHaveBeenCalledWith('Build Number:', jasmine.any(String));
      expect(console.log).toHaveBeenCalledWith('Build Date:', jasmine.any(String));
      expect(console.groupEnd).toHaveBeenCalled();
    });

    it('should format build date correctly in console', () => {
      const buildDate = service.getBuildDate();
      const expectedFormattedDate = new Date(buildDate).toLocaleString();
      
      service.logToConsole();
      
      expect(console.log).toHaveBeenCalledWith('Build Date:', expectedFormattedDate);
    });

    it('should call console methods in correct order', () => {
      service.logToConsole();
      
      expect(consoleSpy).toHaveBeenCalledBefore(console.log as jasmine.Spy);
      expect(console.log).toHaveBeenCalledBefore(console.groupEnd as jasmine.Spy);
    });

    it('should handle console errors gracefully', () => {
      consoleSpy.and.throwError('Console error');
      
      expect(() => service.logToConsole()).toThrow();
    });
  });

  describe('setPageTitle', () => {
    let originalTitle: string;

    beforeEach(() => {
      originalTitle = document.title;
    });

    afterEach(() => {
      document.title = originalTitle;
    });

    it('should append build number to page title', () => {
      document.title = 'My App';
      const buildNumber = service.getBuildNumber();
      
      service.setPageTitle();
      
      expect(document.title).toBe(`My App - Build #${buildNumber}`);
    });

    it('should handle empty title', () => {
      document.title = '';
      const buildNumber = service.getBuildNumber();
      
      service.setPageTitle();
      
      expect(document.title).toBe(`- Build #${buildNumber}`);
    });

    it('should handle existing build number in title', () => {
      document.title = 'My App - Build #0.0.1';
      const buildNumber = service.getBuildNumber();
      
      service.setPageTitle();
      
      expect(document.title).toBe(`My App - Build #0.0.1 - Build #${buildNumber}`);
    });

    it('should preserve existing title content', () => {
      document.title = 'Complex App Title with Special Characters !@#$%';
      const buildNumber = service.getBuildNumber();
      
      service.setPageTitle();
      
      expect(document.title).toBe(`Complex App Title with Special Characters !@#$% - Build #${buildNumber}`);
    });

    it('should handle multiple calls', () => {
      document.title = 'My App';
      const buildNumber = service.getBuildNumber();
      
      service.setPageTitle();
      service.setPageTitle();
      
      expect(document.title).toBe(`My App - Build #${buildNumber} - Build #${buildNumber}`);
    });

    it('should work with different title lengths', () => {
      const titles = ['A', 'Very Long Application Title That Goes On And On', '🚀 Emoji Title 🎉'];
      
      titles.forEach(title => {
        document.title = title;
        const buildNumber = service.getBuildNumber();
        
        service.setPageTitle();
        
        expect(document.title).toBe(`${title} - Build #${buildNumber}`);
      });
    });
  });

  describe('integration tests', () => {
    it('should have consistent data across all methods', () => {
      const buildNumber = service.getBuildNumber();
      const buildDate = service.getBuildDate();
      const versionInfo = service.getFullVersionInfo();
      
      expect(versionInfo.buildNumber).toBe(buildNumber);
      expect(versionInfo.buildDate).toBe(buildDate);
    });

    it('should handle concurrent calls', () => {
      const results: Array<{
        buildNumber: string;
        buildDate: string;
        versionInfo: { buildNumber: string; buildDate: string };
      }> = [];
      
      // Simulate concurrent calls
      for (let i = 0; i < 10; i++) {
        results.push({
          buildNumber: service.getBuildNumber(),
          buildDate: service.getBuildDate(),
          versionInfo: service.getFullVersionInfo()
        });
      }
      
      // All results should be identical
      results.forEach(result => {
        expect(result.buildNumber).toBe(results[0].buildNumber);
        expect(result.buildDate).toBe(results[0].buildDate);
        expect(result.versionInfo).toEqual(results[0].versionInfo);
      });
    });
  });
});