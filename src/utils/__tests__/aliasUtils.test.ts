import { describe, it, expect } from 'vitest';
import { 
  containsForbiddenWords, 
  replaceForbiddenWords, 
  processAlias, 
  getPigeonDisplayName 
} from '../aliasUtils';

describe('aliasUtils', () => {
  describe('containsForbiddenWords', () => {
    it('should detect forbidden words regardless of case', () => {
      expect(containsForbiddenWords('messi')).toBe(true);
      expect(containsForbiddenWords('MESSI')).toBe(true);
      expect(containsForbiddenWords('MeSsI')).toBe(true);
      expect(containsForbiddenWords('yamal')).toBe(true);
      expect(containsForbiddenWords('YAMAL')).toBe(true);
      expect(containsForbiddenWords('barcelona')).toBe(true);
      expect(containsForbiddenWords('BARCA')).toBe(true);
    });

    it('should detect forbidden words within other text', () => {
      expect(containsForbiddenWords('my pigeon messi is fast')).toBe(true);
      expect(containsForbiddenWords('barcelona fan')).toBe(true);
      expect(containsForbiddenWords('yamal123')).toBe(true);
      expect(containsForbiddenWords('123barca456')).toBe(true);
    });

    it('should not detect forbidden words in normal text', () => {
      expect(containsForbiddenWords('pigeon')).toBe(false);
      expect(containsForbiddenWords('racing')).toBe(false);
      expect(containsForbiddenWords('fast bird')).toBe(false);
      expect(containsForbiddenWords('')).toBe(false);
    });
  });

  describe('replaceForbiddenWords', () => {
    it('should replace words containing forbidden words with CR7', () => {
      expect(replaceForbiddenWords('messi')).toBe('CR7');
      expect(replaceForbiddenWords('MESSI')).toBe('CR7');
      expect(replaceForbiddenWords('yamal')).toBe('CR7');
      expect(replaceForbiddenWords('barcelona')).toBe('CR7');
      expect(replaceForbiddenWords('barca')).toBe('CR7');
    });

    it('should replace entire words that contain forbidden words', () => {
      expect(replaceForbiddenWords('pomessihjk')).toBe('CR7');
      expect(replaceForbiddenWords('messi123')).toBe('CR7');
      expect(replaceForbiddenWords('123messi')).toBe('CR7');
      expect(replaceForbiddenWords('barcelona_fan')).toBe('CR7');
      expect(replaceForbiddenWords('yamal2024')).toBe('CR7');
    });

    it('should replace multiple words containing forbidden words', () => {
      expect(replaceForbiddenWords('messi yamal')).toBe('CR7 CR7');
      expect(replaceForbiddenWords('barcelona barca')).toBe('CR7 CR7');
      expect(replaceForbiddenWords('pomessihjk myyamal')).toBe('CR7 CR7');
    });

    it('should replace words containing forbidden words within text', () => {
      expect(replaceForbiddenWords('my pigeon messi is fast')).toBe('my pigeon CR7 is fast');
      expect(replaceForbiddenWords('barcelona fan yamal')).toBe('CR7 fan CR7');
      expect(replaceForbiddenWords('my pomessihjk pigeon')).toBe('my CR7 pigeon');
      expect(replaceForbiddenWords('fast barcelona2024 bird')).toBe('fast CR7 bird');
    });

    it('should not change words without forbidden words', () => {
      expect(replaceForbiddenWords('pigeon')).toBe('pigeon');
      expect(replaceForbiddenWords('racing bird')).toBe('racing bird');
      expect(replaceForbiddenWords('fast123')).toBe('fast123');
      expect(replaceForbiddenWords('')).toBe('');
    });
  });

  describe('processAlias', () => {
    it('should return null for empty or whitespace input', () => {
      expect(processAlias('')).toBe(null);
      expect(processAlias('   ')).toBe(null);
      expect(processAlias('\t\n')).toBe(null);
    });

    it('should trim whitespace from valid aliases', () => {
      expect(processAlias('  pigeon  ')).toBe('pigeon');
      expect(processAlias('\tracing bird\n')).toBe('racing bird');
    });

    it('should replace forbidden words in aliases', () => {
      expect(processAlias('messi')).toBe('CR7');
      expect(processAlias('  yamal  ')).toBe('CR7');
      expect(processAlias('my barcelona pigeon')).toBe('my CR7 pigeon');
    });

    it('should return valid aliases unchanged', () => {
      expect(processAlias('pigeon')).toBe('pigeon');
      expect(processAlias('racing bird')).toBe('racing bird');
      expect(processAlias('fast123')).toBe('fast123');
    });
  });

  describe('getPigeonDisplayName', () => {
    it('should return alias when available', () => {
      const pigeon = { name: 'Original Name', alias: 'Custom Name' };
      expect(getPigeonDisplayName(pigeon)).toBe('Custom Name');
    });

    it('should return original name when no alias', () => {
      const pigeon = { name: 'Original Name', alias: null };
      expect(getPigeonDisplayName(pigeon)).toBe('Original Name');
    });

    it('should return original name when alias is empty string', () => {
      const pigeon = { name: 'Original Name', alias: '' };
      expect(getPigeonDisplayName(pigeon)).toBe('Original Name');
    });

    it('should return original name when alias is undefined', () => {
      const pigeon = { name: 'Original Name' };
      expect(getPigeonDisplayName(pigeon)).toBe('Original Name');
    });
  });
}); 