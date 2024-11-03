import {
    Authorizer,
    AuthorizerDoesHonorOptions,
} from '@sprucelabs/heartwood-view-controllers'
import { MercuryClientFactory } from '@sprucelabs/mercury-client'
import { PermissionContractId, PermissionId } from '@sprucelabs/mercury-types'
import AbstractSpruceTest, {
    test,
    assert,
    errorAssert,
} from '@sprucelabs/test-utils'
import AuthorizerFactory from '../../authorizer/AuthorizerFactory'
import AuthorizerImpl from '../../authorizer/AuthorizerImpl'

export default class AuthorizerFactoryTest extends AbstractSpruceTest {
    protected static async beforeEach(): Promise<void> {
        await super.beforeEach()
        AuthorizerFactory.reset()
    }

    @test()
    protected static async throwsWhenMissingRequired() {
        const err = await assert.doesThrowAsync(() =>
            //@ts-ignore
            AuthorizerFactory.Authorizer()
        )

        errorAssert.assertError(err, 'MISSING_PARAMETERS', {
            parameters: ['connectToApi'],
        })
    }

    @test()
    protected static async canSetAnyClassToTheFactory() {
        AuthorizerFactory.setClass(StubAuthorizer)
        const auth = AuthorizerFactory.Authorizer(() =>
            MercuryClientFactory.Client()
        )
        assert.isTrue(auth instanceof StubAuthorizer)
    }

    @test()
    protected static async cantGetSharedInstanceWithoutSettingConnectionFactory() {
        const err = assert.doesThrow(() => AuthorizerFactory.getInstance())
        errorAssert.assertError(err, 'MISSING_PARAMETERS', {
            parameters: ['connectToApi'],
        })
    }

    @test()
    protected static async canGetSharedInstanceWhenFactoryIsSet() {
        this.setupFactory()
        const auth1 = AuthorizerFactory.getInstance()
        assert.isTrue(auth1 instanceof AuthorizerImpl)
    }

    @test()
    protected static async returnsSameInstance() {
        const auth1 = AuthorizerFactory.getInstance()
        const auth2 = AuthorizerFactory.getInstance()
        assert.isEqual(auth1, auth2)
        AuthorizerFactory.reset()
        const auth3 = AuthorizerFactory.getInstance()
        assert.isNotEqual(auth2, auth3)
    }

    private static setupFactory() {
        AuthorizerFactory.setConnectToApi(() => MercuryClientFactory.Client())
    }
}

class StubAuthorizer implements Authorizer {
    public async doesHonorPermissionContract<
        ContractId extends PermissionContractId,
    >(_options: AuthorizerDoesHonorOptions<ContractId>): Promise<boolean> {
        return true
    }
    public async can<
        ContractId extends PermissionContractId,
        Ids extends PermissionId<ContractId>,
    >(): Promise<Record<Ids, boolean>> {
        return {} as any
    }

    public async savePermissions(): Promise<void> {}
}
