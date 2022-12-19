import { Authorizer } from '@sprucelabs/heartwood-view-controllers'
import { MercuryConnectFactory } from '@sprucelabs/mercury-client'
import { assertOptions } from '@sprucelabs/schema'
import AuthorizerImpl from './Authorizer'

export default class AuthorizerFactory {
	private static Class: AuthorizerContructor = AuthorizerImpl
	private static connectToApi: MercuryConnectFactory
	private static instance?: Authorizer

	public static setClass(Class: AuthorizerContructor) {
		this.Class = Class
	}

	public static reset() {
		this.Class = AuthorizerImpl
		this.instance = undefined
	}

	public static Authorizer(connectToApi: MercuryConnectFactory) {
		assertOptions({ connectToApi }, ['connectToApi'])
		return new this.Class(connectToApi)
	}

	public static getInstance(): Authorizer {
		if (this.instance) {
			return this.instance
		}
		assertOptions({ connectToApi: this.connectToApi }, ['connectToApi'])
		this.instance = this.Authorizer(this.connectToApi)
		return this.instance
	}

	public static setConnectToApi(connectToApi: MercuryConnectFactory) {
		this.connectToApi = connectToApi
	}
}

type AuthorizerContructor = new (options?: any) => Authorizer
