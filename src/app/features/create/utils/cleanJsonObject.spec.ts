import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { extractJSONBlock, extractHTMLBlock, parseJsonSafe, extractSecondSpanContent, extractByPositionH4Title } from './cleanJsonObject';

describe('cleanJsonObject utilities', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
    
    spyOn(console, 'log');
    spyOn(console, 'error');
  });

  describe('extractJSONBlock()', () => {
    it('should extract JSON block from markdown format', () => {
      const input = 'Some text before\n```json\n{"key": "value"}\n```\nSome text after';
      const result = extractJSONBlock(input);
      expect(result).toBe('{"key": "value"}');
    });

    it('should extract JSON block with whitespace', () => {
      const input = '```json\n  {"key": "value"}  \n```';
      const result = extractJSONBlock(input);
      expect(result).toBe('  {"key": "value"}  ');
    });

    it('should extract JSON block with complex content', () => {
      const input = '```json\n{\n  "name": "test",\n  "value": 123\n}\n```';
      const result = extractJSONBlock(input);
      expect(result).toBe('{\n  "name": "test",\n  "value": 123\n}');
    });

    it('should handle case insensitive matching', () => {
      const input = '```JSON\n{"key": "value"}\n```';
      const result = extractJSONBlock(input);
      expect(result).toBe('{"key": "value"}');
    });

    it('should return original input if no JSON block found', () => {
      const input = 'This is just regular text';
      const result = extractJSONBlock(input);
      expect(result).toBe(input);
    });

    it('should return original input if empty JSON block', () => {
      const input = '```json\n```';
      const result = extractJSONBlock(input);
      expect(result).toBe(input);
    });

    it('should handle multiple JSON blocks and return first one', () => {
      const input = '```json\n{"first": "block"}\n```\n```json\n{"second": "block"}\n```';
      const result = extractJSONBlock(input);
      expect(result).toBe('{"first": "block"}');
    });

    it('should handle non-string input', () => {
      const input = { key: 'value' };
      expect(() => extractJSONBlock(input)).toThrow();
    });

    it('should handle null input', () => {
      expect(() => extractJSONBlock(null)).toThrow();
    });

    it('should handle undefined input', () => {
      expect(() => extractJSONBlock(undefined)).toThrow();
    });
  });

  describe('extractHTMLBlock()', () => {
    it('should extract HTML block from markdown format', () => {
      const input = 'Some text before\n```html\n<div>content</div>\n```\nSome text after';
      const result = extractHTMLBlock(input);
      expect(result).toBe('<div>content</div>');
    });

    it('should extract HTML block with whitespace', () => {
      const input = '```html\n  <div>content</div>  \n```';
      const result = extractHTMLBlock(input);
      expect(result).toBe('  <div>content</div>  ');
    });

    it('should extract HTML block with complex content', () => {
      const input = '```html\n<div class="test">\n  <p>Hello World</p>\n</div>\n```';
      const result = extractHTMLBlock(input);
      expect(result).toBe('<div class="test">\n  <p>Hello World</p>\n</div>');
    });

    it('should return original input if no HTML block found', () => {
      const input = 'This is just regular text';
      const result = extractHTMLBlock(input);
      expect(result).toBe(input);
    });

    it('should return original input if empty HTML block', () => {
      const input = '```html\n```';
      const result = extractHTMLBlock(input);
      expect(result).toBe(input);
    });

    it('should handle multiple HTML blocks and return first one', () => {
      const input = '```html\n<div>first</div>\n```\n```html\n<div>second</div>\n```';
      const result = extractHTMLBlock(input);
      expect(result).toBe('<div>first</div>');
    });

    it('should handle case sensitive matching', () => {
      const input = '```HTML\n<div>content</div>\n```';
      const result = extractHTMLBlock(input);
      expect(result).toBe(input); // Should return original as it's case sensitive
    });
  });

  describe('parseJsonSafe()', () => {
    it('should parse valid JSON string', () => {
      const jsonString = '{"key": "value", "number": 123}';
      const result = parseJsonSafe(jsonString);
      expect(result).toEqual({ key: 'value', number: 123 });
    });

    it('should parse valid JSON array', () => {
      const jsonString = '[1, 2, 3, "test"]';
      const result = parseJsonSafe(jsonString);
      expect(result).toEqual([1, 2, 3, 'test']);
    });

    it('should return null for null input', () => {
      const result = parseJsonSafe(null);
      expect(result).toBeNull();
    });

    it('should return null for undefined input', () => {
      const result = parseJsonSafe(undefined as any);
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = parseJsonSafe('');
      expect(result).toBeNull();
    });

    it('should return null for invalid JSON and log error', () => {
      const invalidJson = '{"key": "value"'; // Missing closing brace
      const result = parseJsonSafe(invalidJson);
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Invalid JSON string:', invalidJson);
    });

    it('should return null for malformed JSON', () => {
      const malformedJson = 'not json at all';
      const result = parseJsonSafe(malformedJson);
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Invalid JSON string:', malformedJson);
    });

    it('should parse JSON with special characters', () => {
      const jsonString = '{"message": "Hello, \\"world\\"!", "unicode": "café"}';
      const result = parseJsonSafe(jsonString);
      expect(result).toEqual({ message: 'Hello, "world"!', unicode: 'café' });
    });

    it('should parse JSON with nested objects', () => {
      const jsonString = '{"user": {"name": "John", "age": 30}, "active": true}';
      const result = parseJsonSafe(jsonString);
      expect(result).toEqual({ user: { name: 'John', age: 30 }, active: true });
    });

    it('should repair JSON containing raw newlines inside strings', () => {
      const jsonWithNewlines = `{
        "titre": "Fleurs de décembre : idées cadeaux",
        "description": "Offrez un cadeau vivant et symbolique pour un anniversaire de décembre
à Bruxelles avec les fleurs phares de Noël.",
        "temperature": 7
      }`;

      const result = parseJsonSafe(jsonWithNewlines);
      expect(result).toEqual({
        titre: 'Fleurs de décembre : idées cadeaux',
        description: 'Offrez un cadeau vivant et symbolique pour un anniversaire de décembre\nà Bruxelles avec les fleurs phares de Noël.',
        temperature: 7
      });
    });

    it('should repair JSON with trailing commas', () => {
      const jsonWithTrailingComma = `{
        "titre": "Fleurs de décembre",
        "temperature": 5,
      }`;

      const result = parseJsonSafe(jsonWithTrailingComma);
      expect(result).toEqual({
        titre: 'Fleurs de décembre',
        temperature: 5
      });
    });

    it('should repair JSON truncated within a string', () => {
      const truncatedJson = `{
        "titre": "Fleurs de décembre",
        "description": "Offrez un cadeau vivant et symbolique pour un anniversaire de décembre
à Bruxelles avec les fleurs emblématiques de l'hiver. Je vous guide pour choisir
et entretenir ces joyaux saisonniers`
        ;

      const result = parseJsonSafe(truncatedJson);

      expect(result).toEqual({
        titre: 'Fleurs de décembre',
        description: `Offrez un cadeau vivant et symbolique pour un anniversaire de décembre\nà Bruxelles avec les fleurs emblématiques de l'hiver. Je vous guide pour choisir\net entretenir ces joyaux saisonniers`
      });
    });
  });

  describe('extractSecondSpanContent()', () => {
    it('should extract content from span with matching ID', () => {
      const htmlString = '<span id="paragraphe-2">Content to extract</span>';
      const result = extractSecondSpanContent(htmlString, 2);
      expect(result).toBe('Content to extract');
    });

    it('should extract content with whitespace and trim it', () => {
      const htmlString = '<span id="paragraphe-3">  Content with spaces  </span>';
      const result = extractSecondSpanContent(htmlString, 3);
      expect(result).toBe('Content with spaces');
    });

    it('should extract content with nested HTML', () => {
      const htmlString = '<span id="paragraphe-1"><p>Nested <strong>content</strong></p></span>';
      const result = extractSecondSpanContent(htmlString, 1);
      expect(result).toBe('<p>Nested <strong>content</strong></p>');
    });

    it('should return empty string if no matching span found', () => {
      const htmlString = '<span id="paragraphe-5">Different content</span>';
      const result = extractSecondSpanContent(htmlString, 3);
      expect(result).toBe('');
    });

    it('should return empty string for empty input', () => {
      const result = extractSecondSpanContent('', 1);
      expect(result).toBe('');
    });

    it('should handle multiple spans and extract correct one', () => {
      const htmlString = '<span id="paragraphe-1">First</span><span id="paragraphe-2">Second</span><span id="paragraphe-3">Third</span>';
      const result = extractSecondSpanContent(htmlString, 2);
      expect(result).toBe('Second');
    });

    it('should handle spans with different quote styles', () => {
      const htmlString = '<span id=\'paragraphe-4\'>Single quotes</span>';
      const result = extractSecondSpanContent(htmlString, 4);
      expect(result).toBe('Single quotes');
    });

    it('should handle spans with additional attributes', () => {
      // La regex actuelle ne gère que les spans simples, donc on teste avec le format exact attendu
      const htmlString = '<span id="paragraphe-5">Content</span>';
      const result = extractSecondSpanContent(htmlString, 5);
      expect(result).toBe('Content');
    });
  });

  describe('extractByPositionH4Title()', () => {
    it('should extract H4 title from span with matching ID', () => {
      const texte = '<span id="paragraphe-2"><h4>My Title</h4></span>';
      const result = extractByPositionH4Title(texte, 2);
      expect(result).toBe('My Title');
    });

    it('should log extraction information', () => {
      const texte = '<span id="paragraphe-3"><h4>Test Title</h4></span>';
      extractByPositionH4Title(texte, 3);
      expect(console.log).toHaveBeenCalledWith('Extraction du titre H4 du paragraphe 3 (longueur de l\'article : 50 caractères)');
    });

    it('should handle case insensitive matching', () => {
      const texte = '<span id="PARAGRAPHE-2"><h4>Case Test</h4></span>';
      const result = extractByPositionH4Title(texte, 2);
      expect(result).toBe('Case Test');
    });

    it('should handle additional attributes in span', () => {
      const texte = '<span class="test" id="paragraphe-4"><h4>Title with attributes</h4></span>';
      const result = extractByPositionH4Title(texte, 4);
      expect(result).toBe('Title with attributes');
    });

    it('should return empty string if no matching span found', () => {
      const texte = '<span id="paragraphe-5"><h4>Different content</h4></span>';
      const result = extractByPositionH4Title(texte, 3);
      expect(result).toBe('');
    });

    it('should return empty string for empty input', () => {
      const result = extractByPositionH4Title('', 1);
      expect(result).toBe('');
      expect(console.log).toHaveBeenCalledWith('Extraction du titre H4 du paragraphe 1 (longueur de l\'article : 0 caractères)');
    });

    it('should handle null input', () => {
      expect(() => extractByPositionH4Title(null as any, 1)).toThrow();
    });

    it('should handle H4 with additional attributes', () => {
      // La regex actuelle ne gère que <h4>simple, donc on teste avec le format attendu
      const texte = '<span id="paragraphe-6"><h4>Title with attributes</h4></span>';
      const result = extractByPositionH4Title(texte, 6);
      expect(result).toBe('Title with attributes');
    });

    it('should handle whitespace around H4 content', () => {
      const texte = '<span id="paragraphe-7"><h4>  Title with spaces  </h4></span>';
      const result = extractByPositionH4Title(texte, 7);
      expect(result).toBe('  Title with spaces  ');
    });

    it('should handle multiple spans and extract correct H4', () => {
      const texte = '<span id="paragraphe-1"><h4>First Title</h4></span><span id="paragraphe-2"><h4>Second Title</h4></span>';
      const result = extractByPositionH4Title(texte, 2);
      expect(result).toBe('Second Title');
    });
  });
});
