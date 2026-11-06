import { Record } from '@servicenow/sdk/core'

// Knowledge articles in the existing knowledge base "IT" (user request 2026-11-06), in a new category
// "ServiceNow". The article bodies are the HTML files in docs/kb (BitHawk KB style); Now.include reads them
// at build time. Record() sets no platform defaults, so the flags the platform defaults are set explicitly.
const KB_IT = 'a7e8a78bff0221009b20ffffffffff17' // knowledge base "IT" (baseline demo data, same sys_id on every instance)

export const kbCategoryServiceNow = Record({
    $id: Now.ID['ih-kb-category-servicenow'],
    table: 'kb_category',
    data: {
        label: 'ServiceNow',
        value: 'servicenow',
        parent_table: 'kb_knowledge_base',
        parent_id: KB_IT,
        active: true,
    },
})

export const kbHowToUse = Record({
    $id: Now.ID['ih-kb-how-to-use'],
    table: 'kb_knowledge',
    data: {
        kb_knowledge_base: KB_IT,
        kb_category: kbCategoryServiceNow,
        short_description: 'How to use Instance Health',
        article_type: 'text',
        workflow_state: 'published',
        active: true,
        valid_to: '2100-01-01',
        text: Now.include('../../../docs/kb/kb-how-to-use-instance-health.html'),
    },
})

export const kbAllChecks = Record({
    $id: Now.ID['ih-kb-all-checks'],
    table: 'kb_knowledge',
    data: {
        kb_knowledge_base: KB_IT,
        kb_category: kbCategoryServiceNow,
        short_description: 'Instance Health: all scan checks',
        article_type: 'text',
        workflow_state: 'published',
        active: true,
        valid_to: '2100-01-01',
        text: Now.include('../../../docs/kb/kb-instance-health-all-checks.html'),
    },
})
