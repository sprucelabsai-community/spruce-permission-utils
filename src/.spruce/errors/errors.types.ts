/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable no-redeclare */

import { default as SchemaEntity } from '@sprucelabs/schema'
import * as SpruceSchema from '@sprucelabs/schema'





export declare namespace SpruceErrors.SprucePermissionUtils {

	
	export interface PermissionNotFound {
		
			
			'id': string
	}

	export interface PermissionNotFoundSchema extends SpruceSchema.Schema {
		id: 'permissionNotFound',
		namespace: 'SprucePermissionUtils',
		name: 'Permission not found',
		    fields: {
		            /** . */
		            'id': {
		                type: 'id',
		                isRequired: true,
		                options: undefined
		            },
		    }
	}

	export type PermissionNotFoundEntity = SchemaEntity<SpruceErrors.SprucePermissionUtils.PermissionNotFoundSchema>

}




