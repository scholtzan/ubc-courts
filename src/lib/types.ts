export interface TennisCourt {
    id: string,
    name: string,
    imageUrl: string | undefined,
    availabilities: string[]
}

export interface RequestTokens {
    cookieVerificationToken: string | undefined,
    requestVerificationToken: string | undefined
}