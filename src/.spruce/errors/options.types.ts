import { ErrorOptions as ISpruceErrorOptions } from '@sprucelabs/error'
import { SpruceErrors } from '#spruce/errors/errors.types'

export interface PermissionNotFoundErrorOptions
    extends SpruceErrors.SprucePermissionUtils.PermissionNotFound,
        ISpruceErrorOptions {
    code: 'PERMISSION_NOT_FOUND'
}

type ErrorOptions = PermissionNotFoundErrorOptions

export default ErrorOptions
