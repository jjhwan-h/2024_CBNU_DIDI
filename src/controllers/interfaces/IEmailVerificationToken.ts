import crypto from 'crypto';

export interface IEmailVerificationToken{
    token:string
    expires:Date
}