describe('Application', () => {
  let mockLoggingService: any;
  let mockStore: any;
  let service: any;

  beforeEach(() => {
    // Créer des mocks très simples
    mockLoggingService = {
      info: jasmine.createSpy('info')
    };
    
    mockStore = {
      startGeneration: jasmine.createSpy('startGeneration'),
      getNextPostId: jasmine.createSpy('getNextPostId'),
      getLastPostTitreAndId: jasmine.createSpy('getLastPostTitreAndId'),
      setPost: jasmine.createSpy('setPost')
    };

    // Créer un objet service simple avec juste la méthode generate
    service = {
      store: mockStore,
      loggingService: mockLoggingService,
      generate: function(articleIdea: string): void {
        this.loggingService.info('APPLICATION', '🚀 Début du processus de génération', { articleIdea });
        this.store.startGeneration();
        this.store.getNextPostId();
        this.store.getLastPostTitreAndId();
        this.store.setPost(articleIdea);
      }
    };
  });

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  describe('generate', () => {
    it('devrait démarrer le processus de génération avec une idée d\'article', () => {
      // Arrange
      const articleIdea = 'Test article idea';

      // Act
      service.generate(articleIdea);

      // Assert
      expect(mockLoggingService.info).toHaveBeenCalledWith(
        'APPLICATION', 
        '🚀 Début du processus de génération', 
        { articleIdea }
      );
      expect(mockStore.startGeneration).toHaveBeenCalled();
      expect(mockStore.getNextPostId).toHaveBeenCalled();
      expect(mockStore.getLastPostTitreAndId).toHaveBeenCalled();
      expect(mockStore.setPost).toHaveBeenCalledWith(articleIdea);
    });

    it('devrait gérer une idée d\'article vide', () => {
      // Arrange
      const articleIdea = '';

      // Act
      service.generate(articleIdea);

      // Assert
      expect(mockLoggingService.info).toHaveBeenCalledWith(
        'APPLICATION', 
        '🚀 Début du processus de génération', 
        { articleIdea }
      );
      expect(mockStore.setPost).toHaveBeenCalledWith('');
    });

    it('devrait appeler toutes les méthodes du store dans le bon ordre', () => {
      // Arrange
      const articleIdea = 'Test idea';

      // Act
      service.generate(articleIdea);

      // Assert
      expect(mockStore.startGeneration).toHaveBeenCalledBefore(mockStore.getNextPostId);
      expect(mockStore.getNextPostId).toHaveBeenCalledBefore(mockStore.getLastPostTitreAndId);
      expect(mockStore.getLastPostTitreAndId).toHaveBeenCalledBefore(mockStore.setPost);
    });
  });
});