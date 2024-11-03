import {
    Authorizer,
    AuthorizerCanOptions,
    AuthorizerDoesHonorOptions,
    SavePermissionsOptions,
} from '@sprucelabs/heartwood-view-controllers'
import { MercuryConnectFactory } from '@sprucelabs/mercury-client'
import {
    PermissionContractId,
    PermissionId,
    SpruceSchemas,
} from '@sprucelabs/mercury-types'
import { assertOptions } from '@sprucelabs/schema'
import SpruceError from '../errors/SpruceError'

export default class AuthorizerImpl implements Authorizer {
    protected connectToApi: MercuryConnectFactory

    public constructor(connectToApi: MercuryConnectFactory) {
        this.connectToApi = connectToApi
    }

    public async savePermissions<
        ContractId extends PermissionContractId,
        Ids extends PermissionId<ContractId>,
    >(options: SavePermissionsOptions<ContractId, Ids>) {
        const { target, contractId, permissions } = options
        const { personId, organizationId, skillId, locationId } = target
        const client = await this.connectToApi()

        await client.emitAndFlattenResponses('save-permissions::v2020_12_25', {
            target: {
                permissionContractId: contractId,
                permissionSkillId: skillId,
                permissionPersonId: personId,
                organizationId,
                locationId,
            },
            payload: {
                permissions,
            },
        })
    }

    public async can<Id extends PermissionContractId>(
        options: AuthorizerCanOptions<Id>
    ): Promise<Record<PermissionId<Id>, boolean>> {
        const { contractId, permissionIds, target } = assertOptions(
            options as AuthorizerCanOptions<Id>,
            ['contractId', 'permissionIds']
        )

        const client = await this.connectToApi()
        const [{ resolvedContract }] = await client.emitAndFlattenResponses(
            'get-resolved-permissions-contract::v2020_12_25',
            {
                target,
                payload: {
                    contractId,
                },
            }
        )

        const { permissions } = resolvedContract
        const results: Record<string, boolean> = {}

        permissionIds.forEach((id) => {
            const match = permissions.find((p) => p.id === id)
            if (!match) {
                throw new SpruceError({ code: 'PERMISSION_NOT_FOUND', id })
            }
            results[id] = match?.can
        })

        return results
    }

    public async doesHonorPermissionContract<
        ContractId extends PermissionContractId,
    >(options: AuthorizerDoesHonorOptions<ContractId>): Promise<boolean> {
        const { contractId, target } = options

        const client = await this.connectToApi()
        const [{ doesHonor }] = await client.emitAndFlattenResponses(
            'does-honor-permission-contract::v2020_12_25',
            {
                target,
                payload: {
                    id: contractId,
                },
            }
        )

        return doesHonor
    }
}

export type GetResolvedContractTargetAndPayload =
    SpruceSchemas.Mercury.v2020_12_25.GetResolvedPermissionsContractEmitTargetAndPayload
