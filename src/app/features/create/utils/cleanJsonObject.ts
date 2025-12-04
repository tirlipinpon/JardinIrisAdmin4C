export function extractJSONBlock(input: unknown): string {
  if (typeof input !== 'string') {
    throw new TypeError('extractJSONBlock expects a string input');
  }

  const normalizedInput = input.trim();
  const regex = /```json\b\s*([\s\S]*?)\s*```/i;
  const match = normalizedInput.match(regex);

  if (match) {
    const captured = match[1];
    return captured ? captured : input;
  }

  if (normalizedInput.toLowerCase().startsWith('```json')) {
    return normalizedInput.replace(/^```json\b\s*/i, '');
  }

  return input;
}

export function extractHTMLBlock(input: string): string {
  const regex = /```html\s([\s\S]*?)\s```/;
  const match = input.match(regex);
  if (match && match[1]) {
    return match[1];
  }
  return input; // Si aucun bloc JSON trouvé,
}

export function parseJsonSafe(jsonString: string | null): any | null {
  if (!jsonString) {
    return null;
  }

  const trimmed = jsonString.trim();
  if (!trimmed) {
    return null;
  }

  const candidates = buildJsonCandidates(trimmed);

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      continue;
    }
  }

  console.error('Invalid JSON string:', jsonString);
  return null;
}

export function extractSecondSpanContent(htmlString: string, chapitreId: number): string {
  // Expression régulière pour capturer le contenu de <span> avec l'id correspondant
  const spanMatches = htmlString.match(new RegExp(`<span id=['"]paragraphe-${chapitreId}['"]>(.*?)<\/span>`, 's'));
  // Si une correspondance est trouvée, retourne le contenu sans les balises
  if (spanMatches && spanMatches.length >= 2) {
    return spanMatches[1].trim();
  } else {
    return ''; // Retourne une chaîne vide si aucune correspondance n'est trouvée
  }
}
export function extractByPositionH4Title(texte: string, x: number): string {
  console.log(`Extraction du titre H4 du paragraphe ${x} (longueur de l'article : ${texte?.length || 0} caractères)`);
  const regex = new RegExp(`<span[^>]*id=["']paragraphe-${x}["'][^>]*>\\s*<h4>(.*?)</h4>`, 'si');
  return texte.match(regex)?.[1] ?? '';
}

const buildJsonCandidates = (raw: string): string[] => {
  const sanitized = sanitizeJsonString(raw);
  const variants: string[] = [];

  variants.push(sanitized);

  const balanced = balanceBraces(sanitized);
  if (balanced !== sanitized) {
    variants.push(balanced);
  }

  return variants;
};

const sanitizeJsonString = (raw: string): string => {
  let result = raw;

  result = result.replace(/^```json\b/i, '').replace(/```$/i, '').trim();

  const firstBrace = result.indexOf('{');
  const firstBracket = result.indexOf('[');
  const start = [firstBrace, firstBracket].filter(index => index >= 0).sort((a, b) => a - b)[0] ?? -1;
  const lastBrace = result.lastIndexOf('}');
  const lastBracket = result.lastIndexOf(']');
  const end = Math.max(lastBrace, lastBracket);
  if (start >= 0 && end > start) {
    result = result.slice(start, end + 1);
  }

  result = escapeNewlinesInsideStrings(result);
  result = stripTrailingCommas(result);

  return result.replace(/\u2028|\u2029/g, '\\n');
};

const escapeNewlinesInsideStrings = (input: string): string => {
  let output = '';
  let inString = false;
  let escaped = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (escaped) {
      output += char;
      escaped = false;
      continue;
    }

    if (char === '\\') {
      output += char;
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      output += char;
      continue;
    }

    if (inString && (char === '\n' || char === '\r')) {
      output += '\\n';
      continue;
    }

    output += char;
  }

  return output;
};

const stripTrailingCommas = (input: string): string =>
  input.replace(/,\s*([}\]])/g, '$1');

const balanceBraces = (input: string): string => {
  let openCurly = 0;
  let openSquare = 0;
  let inString = false;
  let escaped = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === '{') {
      openCurly += 1;
    } else if (char === '}') {
      openCurly = Math.max(0, openCurly - 1);
    } else if (char === '[') {
      openSquare += 1;
    } else if (char === ']') {
      openSquare = Math.max(0, openSquare - 1);
    }
  }

  let output = input;

  if (openCurly > 0) {
    output += '}'.repeat(openCurly);
  }

  if (openSquare > 0) {
    output += ']'.repeat(openSquare);
  }

  return output;
};
