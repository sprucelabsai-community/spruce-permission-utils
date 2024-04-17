import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'

const permissionNotFoundSchema: SpruceErrors.SprucePermissionUtils.PermissionNotFoundSchema =
    {
        id: 'permissionNotFound',
        namespace: 'SprucePermissionUtils',
        name: 'Permission not found',
        fields: {
            /** . */
            id: {
                type: 'id',
                isRequired: true,
                options: undefined,
            },
        },
    }

SchemaRegistry.getInstance().trackSchema(permissionNotFoundSchema)

export default permissionNotFoundSchema
