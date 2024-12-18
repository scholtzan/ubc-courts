export interface TennisCourt {
    id: string,
    name: string,
    shortName: string,
    imageUrl: string | undefined,
    availabilities: Map<string, boolean>
}

export interface RequestTokens {
    cookieVerificationToken: string | undefined,
    requestVerificationToken: string | undefined
}