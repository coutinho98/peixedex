export type JwtPayload = {
    sub: string;
    email: string;
    role: string;
    plan: string;
};

export type JwtPayloadWithRt = JwtPayload & { refreshToken: string };
