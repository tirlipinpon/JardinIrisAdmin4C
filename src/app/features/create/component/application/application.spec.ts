import { TestBed } from '@angular/core/testing';
import { signal, provideZonelessChangeDetection } from '@angular/core';

import { Application } from './application';
import { SearchStore } from '../../store';
import { LoggingService } from '../../../../shared/services/logging.service';

describe('Application', () => {
  let service: Application;

  const createMockStore = (overrides?: Partial<any>) => {
    const stepSig = signal<number>(0);
    const postIdSig = signal<number | null>(null);
    const articleSig = signal<string | null>(null);
    const postTitreAndIdSig = signal<{ titre: string; id: number; new_href: string }[]>([]);

    const base = {
      // signals
      step: stepSig,
      postId: postIdSig,
      article: articleSig,
      postTitreAndId: postTitreAndIdSig,
      // methods spied
      getNextPostId: jasmine.createSpy('getNextPostId'),
      getLastPostTitreAndId: jasmine.createSpy('getLastPostTitreAndId'),
      setPost: jasmine.createSpy('setPost'),
      startGeneration: jasmine.createSpy('startGeneration'),
      setVideo: jasmine.createSpy('setVideo'),
      setFaq: jasmine.createSpy('setFaq'),
      internalImage: jasmine.createSpy('internalImage'),
      setImageUrl: jasmine.createSpy('setImageUrl'),
      setInternalLink: jasmine.createSpy('setInternalLink'),
      vegetal: jasmine.createSpy('vegetal')
    };

    return Object.assign(base, overrides);
  };

  const createMockLogger = () => ({
    info: jasmine.createSpy('info'),
    warn: jasmine.createSpy('warn'),
    error: jasmine.createSpy('error')
  });

  const setup = (storeOverrides?: Partial<any>) => {
    const mockStore = createMockStore(storeOverrides);
    const mockLogger = createMockLogger();
    TestBed.configureTestingModule({
      providers: [
        Application,
        { provide: SearchStore, useValue: mockStore },
        { provide: LoggingService, useValue: mockLogger },
        provideZonelessChangeDetection()
      ]
    });
    const svc = TestBed.inject(Application);
    return { svc, mockStore, mockLogger };
  };

  it('devrait créer le service', () => {
    ({ svc: service } = setup());
    expect(service).toBeTruthy();
  });

  it('generate() doit appeler getNextPostId, getLastPostTitreAndId et setPost', () => {
    const { svc, mockStore } = setup();
    svc.generate('idee');
    expect(mockStore.getNextPostId).toHaveBeenCalled();
    expect(mockStore.getLastPostTitreAndId).toHaveBeenCalled();
    expect(mockStore.setPost).toHaveBeenCalledWith('idee');
  });

  it('step 1: doit lancer setVideo, setFaq, internalImage, setImageUrl', (done) => {
    const mockStore = createMockStore();

    const mockLogger = createMockLogger();
    TestBed.configureTestingModule({
      providers: [
        Application,
        { provide: SearchStore, useValue: mockStore },
        { provide: LoggingService, useValue: mockLogger },
        provideZonelessChangeDetection()
      ]
    });
    TestBed.inject(Application);
    // déclencher l'effet après injection
    mockStore.postId.set(123);
    mockStore.article.set('contenu');
    mockStore.step.set(1);
    setTimeout(() => {
      expect(mockStore.setVideo).toHaveBeenCalled();
      expect(mockStore.setFaq).toHaveBeenCalled();
      expect(mockStore.internalImage).toHaveBeenCalled();
      expect(mockStore.setImageUrl).toHaveBeenCalled();
      done();
    }, 0);
  });

  it('step 2: doit lancer setInternalLink si postTitreAndId non vide', (done) => {
    const mockStore = createMockStore();

    const mockLogger = createMockLogger();
    TestBed.configureTestingModule({
      providers: [
        Application,
        { provide: SearchStore, useValue: mockStore },
        { provide: LoggingService, useValue: mockLogger },
        provideZonelessChangeDetection()
      ]
    });
    TestBed.inject(Application);
    // déclencher l'effet après injection
    mockStore.article.set('contenu');
    mockStore.postTitreAndId.set([{ titre: 't', id: 1, new_href: 'h' }]);
    mockStore.step.set(2);
    setTimeout(() => {
      expect(mockStore.setInternalLink).toHaveBeenCalled();
      expect(mockStore.setVideo).not.toHaveBeenCalled();
      expect(mockStore.setFaq).not.toHaveBeenCalled();
      expect(mockStore.internalImage).not.toHaveBeenCalled();
      expect(mockStore.setImageUrl).not.toHaveBeenCalled();
      done();
    }, 0);
  });

  it('step 3: doit lancer vegetal', (done) => {
    const mockStore = createMockStore();

    const mockLogger = createMockLogger();
    TestBed.configureTestingModule({
      providers: [
        Application,
        { provide: SearchStore, useValue: mockStore },
        { provide: LoggingService, useValue: mockLogger },
        provideZonelessChangeDetection()
      ]
    });
    TestBed.inject(Application);
    // déclencher l'effet après injection
    mockStore.article.set('contenu');
    mockStore.step.set(3);
    setTimeout(() => {
      expect(mockStore.vegetal).toHaveBeenCalled();
      expect(mockStore.setInternalLink).not.toHaveBeenCalled();
      done();
    }, 0);
  });

  it('step 4: ne doit lancer aucune action de store (simple log)', (done) => {
    const mockStore = createMockStore();

    const mockLogger = createMockLogger();
    TestBed.configureTestingModule({
      providers: [
        Application,
        { provide: SearchStore, useValue: mockStore },
        { provide: LoggingService, useValue: mockLogger },
        provideZonelessChangeDetection()
      ]
    });
    TestBed.inject(Application);
    // déclencher l'effet après injection
    mockStore.article.set('contenu');
    mockStore.step.set(4);
    setTimeout(() => {
      expect(mockStore.setVideo).not.toHaveBeenCalled();
      expect(mockStore.setFaq).not.toHaveBeenCalled();
      expect(mockStore.internalImage).not.toHaveBeenCalled();
      expect(mockStore.setImageUrl).not.toHaveBeenCalled();
      expect(mockStore.setInternalLink).not.toHaveBeenCalled();
      expect(mockStore.vegetal).not.toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalled();
      done();
    }, 0);
  });

  it('ne doit rien faire en step 1 si postId ou article manquants', (done) => {
    const mockStore = createMockStore();
    const mockLogger = createMockLogger();
    TestBed.configureTestingModule({
      providers: [
        Application,
        { provide: SearchStore, useValue: mockStore },
        { provide: LoggingService, useValue: mockLogger },
        provideZonelessChangeDetection()
      ]
    });
    TestBed.inject(Application);
    // step 1 sans postId/article
    mockStore.step.set(1);
    setTimeout(() => {
      expect(mockStore.setVideo).not.toHaveBeenCalled();
      expect(mockStore.setFaq).not.toHaveBeenCalled();
      expect(mockStore.internalImage).not.toHaveBeenCalled();
      expect(mockStore.setImageUrl).not.toHaveBeenCalled();
      done();
    }, 0);
  });
});
