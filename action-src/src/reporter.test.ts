import { type Issue, IssueType, type ReportIssueOptions } from '@cspell/cspell-types';
import { describe, expect, test } from 'vitest';

import { shouldReportIssue } from './reporter.js';

describe('reporter', () => {
    const issueBase: Issue = {
        uri: 'file://some/file.txt',
        row: 1,
        col: 1,
        line: { text: '', offset: 0 },
        offset: 0,
        text: 'teh',
        isFlagged: false,
        issueType: IssueType.spelling,
        hasPreferredSuggestions: false,
        hasSimpleSuggestions: false,
    };

    const optionsReportAll: ReportIssueOptions = {
        unknownWords: 'report-all',
    };

    const optionsReportTypos: ReportIssueOptions = {
        unknownWords: 'report-common-typos',
    };

    const optionsReportSimple: ReportIssueOptions = {
        unknownWords: 'report-simple',
    };

    const optionsReportFlagged: ReportIssueOptions = {
        unknownWords: 'report-flagged',
    };

    const optionsReportDirectives: ReportIssueOptions = {
        validateDirectives: true,
    };

    test.each`
        issue                                 | options                    | expected
        ${{}}                                 | ${undefined}               | ${true}
        ${{}}                                 | ${optionsReportFlagged}    | ${false}
        ${{}}                                 | ${optionsReportTypos}      | ${false}
        ${{}}                                 | ${optionsReportSimple}     | ${false}
        ${{}}                                 | ${optionsReportAll}        | ${true}
        ${{ isFlagged: true }}                | ${optionsReportFlagged}    | ${true}
        ${{ isFlagged: true }}                | ${optionsReportTypos}      | ${true}
        ${{ isFlagged: true }}                | ${optionsReportSimple}     | ${true}
        ${{ isFlagged: true }}                | ${optionsReportAll}        | ${true}
        ${{ hasPreferredSuggestions: true }}  | ${optionsReportFlagged}    | ${false}
        ${{ hasPreferredSuggestions: true }}  | ${optionsReportTypos}      | ${true}
        ${{ hasPreferredSuggestions: true }}  | ${optionsReportSimple}     | ${true}
        ${{ hasPreferredSuggestions: true }}  | ${optionsReportAll}        | ${true}
        ${{ hasSimpleSuggestions: true }}     | ${optionsReportFlagged}    | ${false}
        ${{ hasSimpleSuggestions: true }}     | ${optionsReportTypos}      | ${false}
        ${{ hasSimpleSuggestions: true }}     | ${optionsReportSimple}     | ${true}
        ${{ hasSimpleSuggestions: true }}     | ${optionsReportAll}        | ${true}
        ${{ issueType: IssueType.directive }} | ${optionsReportAll}        | ${false}
        ${{ issueType: IssueType.directive }} | ${optionsReportDirectives} | ${true}
    `('shouldReportIssue $issue, $options', ({ issue, options, expected }) => {
        issue = { ...issueBase, ...issue };
        const result = shouldReportIssue(issue, options);
        expect(result).toBe(expected);
    });
});
