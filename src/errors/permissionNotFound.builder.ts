import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'permissionNotFound',
    name: 'Permission not found',
    fields: {
        id: {
            type: 'id',
            isRequired: true,
        },
    },
})
