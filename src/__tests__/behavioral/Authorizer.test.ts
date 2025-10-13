import { Authorizer } from '@sprucelabs/heartwood-view-controllers'
import { MercuryClient, MercuryClientFactory } from '@sprucelabs/mercury-client'
import {
    coreEventContracts,
    SpruceSchemas,
} from '@sprucelabs/mercury-core-events'
import { PermissionContractId, PermissionId } from '@sprucelabs/mercury-types'
import AbstractSpruceTest, {
    test,
    generateId,
    assert,
} from '@sprucelabs/test-utils'
import AuthorizerFactory from '../../authorizer/AuthorizerFactory'

export default class AuthorizerTest extends AbstractSpruceTest {
    private static readonly connectToApi = () => MercuryClientFactory.Client()
    private static auth: Authorizer
    private static client: MercuryClient
    private static lastTargetAndPayload:
        | SavePermissionsTargetAndPayload
        | undefined
    private static personId: string
    private static contractId: PermissionContractId
    private static organizationId: string | undefined
    private static locationId: string | undefined
    private static skillId: string | undefined
    private static payload: {
        id: PermissionId<any>
        can: SpruceSchemas.Mercury.v2020_12_25.StatusFlags
    }[]
    private static roleId: string | undefined

    protected static async beforeEach(): Promise<void> {
        await super.beforeEach()

        MercuryClientFactory.reset()
        MercuryClientFactory.setIsTestMode(true)
        MercuryClientFactory.setDefaultContract(coreEventContracts[0])
        AuthorizerFactory.setConnectToApi(this.connectToApi)

        this.auth = AuthorizerFactory.getInstance()
        this.client = await this.connectToApi()
        this.contractId = 'events-contract'
        this.organizationId = undefined
        this.lastTargetAndPayload = undefined
        this.locationId = undefined
        this.skillId = undefined
        this.roleId = undefined
        this.payload = [
            {
                id: generateId(),
                can: {
                    default: true,
                },
            },
        ]

        await this.handleSaveEvent()

        this.personId = generateId()
    }

    @test('can save for person 1', 'events-contract')
    @test('can save for person 2', 'feed-contract')
    protected static async canSaveForPerson(contractId: PermissionContractId) {
        this.contractId = contractId
        await this.assertSavingMatchesTarget()
    }

    @test()
    protected static async savesWithOrganizationId() {
        this.organizationId = generateId()
        await this.assertSavingMatchesTarget()
    }

    @test()
    protected static async savesWithLocationId() {
        this.locationId = generateId()
        await this.assertSavingMatchesTarget()
    }

    @test()
    protected static async savesWithSkillId() {
        this.skillId = generateId()
        await this.assertSavingMatchesTarget()
    }

    @test()
    protected static async savesWithRoleId() {
        this.roleId = generateId()
        await this.assertSavingMatchesTarget()
    }

    @test()
    protected static async savesActualPermissions() {
        this.payload = [
            {
                id: 'can-do-a-thing',
                can: {
                    default: true,
                    offPrem: true,
                },
            },
            {
                id: 'can-do-another-thing',
                can: {
                    default: false,
                },
            },
        ]
        await this.assertSavingMatchesTarget()
    }

    @test()
    protected static async throwsIfEmitThrows() {
        const client = await this.connectToApi()
        await client.on('save-permissions::v2020_12_25', () => {
            assert.fail('should fail')
            return {
                success: true,
            }
        })

        await assert.doesThrowAsync(() => this.savePermissions())
    }

    @test()
    protected static async doesHonorEmitsExpectedEvent() {
        const contractId = generateId() as PermissionContractId
        const locationId = generateId()
        const organizationId = generateId()

        let passedPayload:
            | DoesHonorPermissionContractTargetAndPayload['payload']
            | undefined
        let passedTarget:
            | DoesHonorPermissionContractTargetAndPayload['target']
            | undefined

        const client = await this.connectToApi()
        await client.on(
            'does-honor-permission-contract::v2020_12_25',
            ({ payload, target }) => {
                passedPayload = payload
                passedTarget = target
                return {
                    doesHonor: true,
                }
            }
        )

        await this.auth.doesHonorPermissionContract({
            contractId,
            target: {
                locationId,
                organizationId,
            },
        })

        assert.isEqualDeep(passedPayload, {
            id: contractId,
        })

        assert.isEqualDeep(passedTarget, {
            locationId,
            organizationId,
        })
    }

    @test('does honor returns true', true)
    @test('does honor returns false', false)
    protected static async doesHonorReturnsResponseFromEvent(
        expected: boolean
    ) {
        const client = await this.connectToApi()
        await client.on('does-honor-permission-contract::v2020_12_25', () => {
            return {
                doesHonor: expected,
            }
        })

        const doesHonor = await this.auth.doesHonorPermissionContract({
            contractId: 'authorizer-contract',
            target: {},
        })

        assert.isEqual(doesHonor, expected, 'Response did not match')
    }

    private static async assertSavingMatchesTarget() {
        await this.savePermissions()

        assert.isEqualDeep(this.lastTargetAndPayload?.target, {
            permissionPersonId: this.personId,
            organizationId: this.organizationId,
            permissionContractId: this.contractId,
            locationId: this.locationId,
            permissionSkillId: this.skillId,
            roleId: this.roleId,
        })

        assert.isEqualDeep(this.lastTargetAndPayload?.payload, {
            permissions: this.payload,
        })
    }

    private static async savePermissions() {
        await this.auth.savePermissions({
            contractId: this.contractId,
            permissions: this.payload as any,
            target: {
                personId: this.personId,
                organizationId: this.organizationId,
                locationId: this.locationId,
                skillId: this.skillId,
                roleId: this.roleId,
            },
        })
    }

    private static async handleSaveEvent() {
        await this.client.on(
            'save-permissions::v2020_12_25',
            (targetAndPayload) => {
                this.lastTargetAndPayload = targetAndPayload
                return {
                    success: true,
                }
            }
        )
    }
}

type SavePermissionsTargetAndPayload =
    SpruceSchemas.Mercury.v2020_12_25.SavePermissionsEmitTargetAndPayload

type DoesHonorPermissionContractTargetAndPayload =
    SpruceSchemas.Mercury.v2020_12_25.DoesHonorPermissionContractEmitTargetAndPayload
