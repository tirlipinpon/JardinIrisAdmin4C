import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { PerformanceDisplayComponent, PerformanceData } from './performance-display.component';

describe('PerformanceDisplayComponent', () => {
  let component: PerformanceDisplayComponent;
  let fixture: ComponentFixture<PerformanceDisplayComponent>;

  const mockPerformanceData: PerformanceData = {
    totalTime: 15.75,
    completedTasks: 8,
    totalTasks: 10,
    apiCalls: 12,
    dataProcessed: 2048
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PerformanceDisplayComponent,
        NoopAnimationsModule
      ],
      providers: [
        provideZonelessChangeDetection()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PerformanceDisplayComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default input values', () => {
    expect(component.performanceData()).toBeNull();
    expect(component.showChart()).toBeFalse();
  });

  describe('Template rendering', () => {
    it('should not render the card when performanceData is null', () => {
      fixture.detectChanges();
      
      const cardElement = fixture.nativeElement.querySelector('mat-card');
      expect(cardElement).toBeFalsy();
    });

    it('should render the card when performanceData is provided', () => {
      fixture.componentRef.setInput('performanceData', mockPerformanceData);
      fixture.detectChanges();
      
      const cardElement = fixture.nativeElement.querySelector('mat-card');
      expect(cardElement).toBeTruthy();
      expect(cardElement).toHaveClass('performance-card');
    });

    it('should display performance data correctly', () => {
      fixture.componentRef.setInput('performanceData', mockPerformanceData);
      fixture.detectChanges();
      
      // Vérifier le titre
      const titleElement = fixture.nativeElement.querySelector('mat-card-title');
      expect(titleElement.textContent.trim()).toBe('Performances');
      
      // Vérifier le sous-titre
      const subtitleElement = fixture.nativeElement.querySelector('mat-card-subtitle');
      expect(subtitleElement.textContent.trim()).toBe('Métriques de génération et traitement');
      
      // Vérifier les valeurs des performances
      const performanceValues = fixture.nativeElement.querySelectorAll('.performance-value');
      expect(performanceValues[0].textContent.trim()).toBe('15.75s'); // totalTime
      expect(performanceValues[1].textContent.trim()).toBe('8/10'); // completedTasks/totalTasks
      expect(performanceValues[2].textContent.trim()).toBe('12'); // apiCalls
      expect(performanceValues[3].textContent.trim()).toBe('2,048 KB'); // dataProcessed
    });

    it('should display performance labels correctly', () => {
      fixture.componentRef.setInput('performanceData', mockPerformanceData);
      fixture.detectChanges();
      
      const performanceLabels = fixture.nativeElement.querySelectorAll('.performance-label');
      expect(performanceLabels[0].textContent.trim()).toBe('Temps total');
      expect(performanceLabels[1].textContent.trim()).toBe('Tâches terminées');
      expect(performanceLabels[2].textContent.trim()).toBe('Requêtes API');
      expect(performanceLabels[3].textContent.trim()).toBe('Données traitées');
    });

    it('should display performance icons correctly', () => {
      fixture.componentRef.setInput('performanceData', mockPerformanceData);
      fixture.detectChanges();
      
      const performanceIcons = fixture.nativeElement.querySelectorAll('.performance-icon');
      expect(performanceIcons[0].textContent.trim()).toBe('⚡');
      expect(performanceIcons[1].textContent.trim()).toBe('📊');
      expect(performanceIcons[2].textContent.trim()).toBe('🔄');
      expect(performanceIcons[3].textContent.trim()).toBe('💾');
    });

    it('should not display chart when showChart is false', () => {
      fixture.componentRef.setInput('performanceData', mockPerformanceData);
      fixture.componentRef.setInput('showChart', false);
      fixture.detectChanges();
      
      const chartElement = fixture.nativeElement.querySelector('.performance-chart');
      expect(chartElement).toBeFalsy();
    });

    it('should display chart when showChart is true', () => {
      fixture.componentRef.setInput('performanceData', mockPerformanceData);
      fixture.componentRef.setInput('showChart', true);
      fixture.detectChanges();
      
      const chartElement = fixture.nativeElement.querySelector('.performance-chart');
      expect(chartElement).toBeTruthy();
      
      const chartPlaceholder = chartElement.querySelector('.chart-placeholder');
      expect(chartPlaceholder).toBeTruthy();
      
      const chartIcon = chartPlaceholder.querySelector('mat-icon');
      expect(chartIcon.textContent.trim()).toBe('show_chart');
      
      const chartText = chartPlaceholder.querySelector('span');
      expect(chartText.textContent.trim()).toBe('Graphique des performances');
    });

    it('should display speed icon in card header', () => {
      fixture.componentRef.setInput('performanceData', mockPerformanceData);
      fixture.detectChanges();
      
      const headerIcon = fixture.nativeElement.querySelector('mat-icon[mat-card-avatar]');
      expect(headerIcon).toBeTruthy();
      expect(headerIcon.textContent.trim()).toBe('speed');
    });
  });

  describe('Input changes', () => {
    it('should update display when performanceData changes', () => {
      fixture.detectChanges();
      
      // Initialement pas de carte
      let cardElement = fixture.nativeElement.querySelector('mat-card');
      expect(cardElement).toBeFalsy();
      
      // Ajouter des données de performance
      fixture.componentRef.setInput('performanceData', mockPerformanceData);
      fixture.detectChanges();
      
      cardElement = fixture.nativeElement.querySelector('mat-card');
      expect(cardElement).toBeTruthy();
      
      // Changer les données
      const newPerformanceData: PerformanceData = {
        totalTime: 25.50,
        completedTasks: 5,
        totalTasks: 8,
        apiCalls: 6,
        dataProcessed: 1024
      };
      
      fixture.componentRef.setInput('performanceData', newPerformanceData);
      fixture.detectChanges();
      
      const performanceValues = fixture.nativeElement.querySelectorAll('.performance-value');
      expect(performanceValues[0].textContent.trim()).toBe('25.50s');
      expect(performanceValues[1].textContent.trim()).toBe('5/8');
      expect(performanceValues[2].textContent.trim()).toBe('6');
      expect(performanceValues[3].textContent.trim()).toBe('1,024 KB');
    });

    it('should update chart visibility when showChart changes', () => {
      fixture.componentRef.setInput('performanceData', mockPerformanceData);
      fixture.detectChanges();
      
      // Initialement pas de graphique
      let chartElement = fixture.nativeElement.querySelector('.performance-chart');
      expect(chartElement).toBeFalsy();
      
      // Activer le graphique
      fixture.componentRef.setInput('showChart', true);
      fixture.detectChanges();
      
      chartElement = fixture.nativeElement.querySelector('.performance-chart');
      expect(chartElement).toBeTruthy();
      
      // Désactiver le graphique
      fixture.componentRef.setInput('showChart', false);
      fixture.detectChanges();
      
      chartElement = fixture.nativeElement.querySelector('.performance-chart');
      expect(chartElement).toBeFalsy();
    });
  });

  describe('Edge cases', () => {
    it('should handle zero values correctly', () => {
      const zeroPerformanceData: PerformanceData = {
        totalTime: 0,
        completedTasks: 0,
        totalTasks: 0,
        apiCalls: 0,
        dataProcessed: 0
      };
      
      fixture.componentRef.setInput('performanceData', zeroPerformanceData);
      fixture.detectChanges();
      
      const performanceValues = fixture.nativeElement.querySelectorAll('.performance-value');
      expect(performanceValues[0].textContent.trim()).toBe('0.00s');
      expect(performanceValues[1].textContent.trim()).toBe('0/0');
      expect(performanceValues[2].textContent.trim()).toBe('0');
      expect(performanceValues[3].textContent.trim()).toBe('0 KB');
    });

    it('should handle large numbers correctly', () => {
      const largePerformanceData: PerformanceData = {
        totalTime: 999.99,
        completedTasks: 999,
        totalTasks: 1000,
        apiCalls: 50000,
        dataProcessed: 1048576
      };
      
      fixture.componentRef.setInput('performanceData', largePerformanceData);
      fixture.detectChanges();
      
      const performanceValues = fixture.nativeElement.querySelectorAll('.performance-value');
      expect(performanceValues[0].textContent.trim()).toBe('999.99s');
      expect(performanceValues[1].textContent.trim()).toBe('999/1000');
      expect(performanceValues[2].textContent.trim()).toBe('50,000');
      expect(performanceValues[3].textContent.trim()).toBe('1,048,576 KB');
    });
  });
});
