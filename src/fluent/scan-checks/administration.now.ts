import { TableCheck } from '@servicenow/sdk/core'

// IH-001: every published report is a finding
export const ih001PublicReports = TableCheck({
    $id: Now.ID['ih-001-public-reports'],
    name: 'IH-001 Reports published to public',
    active: true,
    category: 'security',
    priority: '2',
    shortDescription: 'Finds reports that are published to public',
    description:
        'Published reports get a public URL and can be viewed without logging in. Ideal state: no report is published to public.',
    table: 'sys_report',
    conditions: 'is_published=true',
    resolutionDetails:
        'Unpublish the report, or share it with the required roles or groups instead of publishing it.',
})
