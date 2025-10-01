const LEET = { '0':'o','1':'i','3':'e','4':'a','5':'s','7':'t','@':'a','$':'s' };

const stripDiacritics = (s) => {
  try {
    return s.normalize('NFD').replace(/\p{Diacritic}/gu, '');
  } catch {
    return s
      .replace(/[áàäâ]/gi,'a').replace(/[éèëê]/gi,'e').replace(/[íìïî]/gi,'i')
      .replace(/[óòöô]/gi,'o').replace(/[úùüû]/gi,'u').replace(/ñ/gi,'n');
  }
};

export const fold = (input = '') => {
  let s = String(input).toLowerCase();
  s = stripDiacritics(s);
  s = s.replace(/[013457@$]/g, (c) => LEET[c] || c);
  s = s.replace(/[_\-–—.,;:(){}\[\]/\\|'"`~!?+*<>#%^&=]/g, ' ');
  s = s.replace(/([a-z])\1{2,}/g, '$1$1');
  s = s.replace(/\s+/g, ' ').trim();
  return s;
};

const SEP = '[^a-z0-9]{0,3}';
const RPT = (ch) => `${ch}${ch}?`;

const esc = (w) => w.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
const wordToFuzzy = (w) =>
  esc(w).split('').map(ch => /[a-z0-9]/i.test(ch) ? RPT(ch) : ch).join(SEP);
const altWords = (arr) => arr.map(wordToFuzzy).join('|');
const makeAltRegex = (arr, flags = 'i') => new RegExp(`\\b(?:${altWords(arr)})\\b`, flags);
const GROUPS = [
  'personas negras','personas blancas','personas asiaticas','personas indigenas',
  'migrantes','extranjeros','nicaraguenses','venezolanos','colombianos','haitianos',
  'mujeres','hombres','niñas','niños',
  'gays','lesbianas','personas lgbt','lgbt','trans','personas trans','no binarias','no binarios',
  'personas con discapacidad','discapacitados',
  'gordos','personas gordas','gorditas','gorditos',
  'judios','musulmanes','cristianos'
];

const HATE_VERBS = [
  'odio a','odiar a','muerte a','matar a','exterminar a','eliminar a',
  'echar a','sacar a','expulsar a','violencia contra','pegar a','golpear a',
  'humillar a','no son humanos','no son personas','no deberian existir',
  'discriminar a','burlarse de','reirse de'
];

const GENERIC_INSULTS = [
  'idiota','imbecil','estupido','inutil','escoria','basura','asqueroso','repugnante','subnormal'
];

const SLURS = [
  'nazi','zorra','perra','maricon','marica','mongolo','retrasado','retardado'
];

const RE_GENERIC = makeAltRegex(GENERIC_INSULTS);
const RE_SLURS = makeAltRegex(SLURS);
const RE_HATE_PLUS_GROUP = new RegExp(
  `\\b(?:${altWords(HATE_VERBS)})\\s+` +
  `(?:a\\s+)?(?:los\\s+|las\\s+|l[oa]s\\s+|l[oa]\\s+)?` +
  `(?:${altWords(GROUPS)})\\b`, 'i'
);
const RE_VERB_GROUP_SHORT = new RegExp(
  `\\b(?:${altWords(['matar','exterminar','eliminar','echar','sacar'])})\\s+` +
  `(?:${altWords(GROUPS)})\\b`, 'i'
);
let EXTENDED = [];             
let EXTENDED_RE = null;        
let LEXICON_READY = false;

const compileExtended = (words, blockSize = 80) => {
  const blocks = [];
  for (let i = 0; i < words.length; i += blockSize) {
    const chunk = words.slice(i, i + blockSize);
    blocks.push(new RegExp(`\\b(?:${altWords(chunk)})\\b`, 'i'));
  }
  return blocks;
};

export async function initHateLexicon({ url, words } = {}) {
  try {
    let terms = Array.isArray(words) ? words
      : url ? (await (await fetch(url, { cache: 'no-store' })).json()).terms
      : [];

    if (!Array.isArray(terms)) terms = [];
    const norm = new Set(terms.map(t => fold(String(t || ''))).filter(Boolean));
    EXTENDED = Array.from(norm);
    EXTENDED_RE = compileExtended(EXTENDED);
    LEXICON_READY = EXTENDED.length > 0;
  } catch (e) {
    console.warn('[blockedWords] initHateLexicon falló:', e);
    EXTENDED = [];
    EXTENDED_RE = null;
    LEXICON_READY = false;
  }
}

export const isLexiconReady = () => LEXICON_READY;
export function containsBlocked(text = '', opts = { includeGeneric: true, strict: true }) {
  const s = fold(text);
  if (!s) return false;
  if (RE_SLURS.test(s)) return true;
  if (RE_HATE_PLUS_GROUP.test(s)) return true;
  if (RE_VERB_GROUP_SHORT.test(s)) return true;
  if (opts?.includeGeneric && RE_GENERIC.test(s)) return true;
  if (opts?.strict && LEXICON_READY && EXTENDED_RE) {
    for (const re of EXTENDED_RE) {
      if (re.test(s)) return true;
    }
  }
  return false;
}

export function blockedReason(text = '', opts = { includeGeneric: true, strict: true }) {
  const s = fold(text);
  if (!s) return '';

  if (RE_SLURS.test(s)) return 'slur directo';
  if (RE_HATE_PLUS_GROUP.test(s)) return 'odio/violencia dirigido a grupo';
  if (RE_VERB_GROUP_SHORT.test(s)) return 'verbo violento dirigido a grupo';
  if (opts?.includeGeneric && RE_GENERIC.test(s)) return 'insulto genérico';

  if (opts?.strict && LEXICON_READY && EXTENDED_RE) {
    for (const re of EXTENDED_RE) {
      if (re.test(s)) return 'coincidencia en léxico ampliado';
    }
  }
  return '';
}

export function validateEntryContent(patua = '', es = '', opts) {
  if (containsBlocked(patua, opts) || containsBlocked(es, opts)) {
    return '⚠️ Contenido no permitido (odio/insultos/discriminación).';
  }
  return null;
}
