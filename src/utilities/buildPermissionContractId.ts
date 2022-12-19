export default function buildPermissionContractId(
	contractId: string,
	namespace?: string
): string {
	return `${namespace}.${contractId}`
}
