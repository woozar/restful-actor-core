import { mockDeep } from 'jest-mock-extended';
import { ApiSpecResolver } from './api-specs.resolver';
import { ApiSpecsService } from './api-specs.service';
import { ApiSpec } from './models/spec.model';

describe('api spec resolver', () => {
  it('returns all api specs', async () => {
    const apiServiceMock = mockDeep<ApiSpecsService>();
    const resolver = new ApiSpecResolver(apiServiceMock);

    const testSpecMock = mockDeep<ApiSpec>();
    apiServiceMock.getApiSpecs.mockReturnValueOnce([testSpecMock]);

    await expect(resolver.getApiSpecs()).resolves.toEqual([testSpecMock]);
    expect(apiServiceMock.getApiSpecs).toBeCalledWith();
  });

  it('returns one particular api spec', async () => {
    const apiServiceMock = mockDeep<ApiSpecsService>();
    const resolver = new ApiSpecResolver(apiServiceMock);

    const testSpecMock = mockDeep<ApiSpec>();
    apiServiceMock.getApiSpecById.mockReturnValueOnce(testSpecMock);

    await expect(resolver.getApiSpec('testid')).resolves.toEqual(testSpecMock);
    expect(apiServiceMock.getApiSpecById).toBeCalledWith('testid');
  });

  it('throws an error if the spec with the given id cannot be found', async () => {
    const apiServiceMock = mockDeep<ApiSpecsService>();
    const resolver = new ApiSpecResolver(apiServiceMock);

    apiServiceMock.getApiSpecById.mockReturnValueOnce(null);

    await expect(resolver.getApiSpec('testid2')).rejects.toEqual(new Error('Cannot find id testid2'));
    expect(apiServiceMock.getApiSpecById).toBeCalledWith('testid2');
  });
});
