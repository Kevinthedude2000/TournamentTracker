export interface IIdentityService {
  generateJWT(username: string, password: string): Promise<string | undefined>;
}
