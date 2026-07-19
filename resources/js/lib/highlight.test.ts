import { describe, expect, it } from 'vitest';
import { highlightPhoneSegments, highlightSegments } from './highlight';

/** The matched parts, in order — what ends up inside a <mark>. */
function matched(segments: { text: string; match: boolean }[]): string[] {
    return segments.filter((segment) => segment.match).map(({ text }) => text);
}

describe('highlightSegments', () => {
    it('marks the matching part of the text', () => {
        expect(highlightSegments('Carla López', 'car')).toEqual([
            { text: 'Car', match: true },
            { text: 'la López', match: false },
        ]);
    });

    it('matches without accents, as the database collation does', () => {
        expect(matched(highlightSegments('Carla López', 'lopez'))).toEqual([
            'López',
        ]);
    });

    it('marks every occurrence', () => {
        expect(matched(highlightSegments('Ana Anabel', 'ana'))).toEqual([
            'Ana',
            'Ana',
        ]);
    });

    it('leaves the text untouched without a term', () => {
        expect(highlightSegments('Carla López', null)).toEqual([
            { text: 'Carla López', match: false },
        ]);
        expect(highlightSegments('Carla López', '  ')).toEqual([
            { text: 'Carla López', match: false },
        ]);
    });

    it('marks nothing when the term does not appear', () => {
        expect(matched(highlightSegments('Carla López', 'mateo'))).toEqual([]);
    });
});

describe('highlightPhoneSegments', () => {
    it('marks the matched digits inside a phone stored with separators', () => {
        expect(
            highlightPhoneSegments('380 400-0003', '+54 9 380 400-0003'),
        ).toEqual([{ text: '380 400-0003', match: true }]);
    });

    it('marks a partial match, spanning the separators it crosses', () => {
        expect(
            matched(highlightPhoneSegments('380 400-0003', '4000003')),
        ).toEqual(['400-0003']);
    });

    it('ignores the country code and the trunk zero, as the search does', () => {
        expect(
            matched(highlightPhoneSegments('3804000003', '03804000003')),
        ).toEqual(['3804000003']);
    });

    it('highlights a leading-zero fragment in full', () => {
        expect(matched(highlightPhoneSegments('3804000001', '0001'))).toEqual([
            '0001',
        ]);
    });

    it('marks nothing when the digits do not match', () => {
        expect(
            matched(highlightPhoneSegments('3804000003', '3804111111')),
        ).toEqual([]);
    });

    it('leaves the phone untouched without a term', () => {
        expect(highlightPhoneSegments('3804000003', '')).toEqual([
            { text: '3804000003', match: false },
        ]);
    });

    it('leaves the phone untouched when the term has no digits', () => {
        expect(highlightPhoneSegments('3804000003', 'carla')).toEqual([
            { text: '3804000003', match: false },
        ]);
    });
});
