import { ApiSpecsService } from './api-specs.service';
import { readdir, readFile } from 'fs/promises';
import { ApiSpec } from './models/spec.model';
import { mockDeep } from 'jest-mock-extended';

jest.mock('fs/promises');
jest.mock('./models/spec.model');

describe('api specs service', () => {
  let service: ApiSpecsService;
  beforeEach(() => {
    service = new ApiSpecsService();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('throws an error if it cannot load the list of files', async () => {
    jest.mocked(readdir).mockRejectedValueOnce(new Error('missing permissions'));
    expect(service.onModuleInit()).rejects.toEqual(new Error('missing permissions'));
  });

  it('throws an error if it cannot load one file', async () => {
    jest.mocked(readdir).mockResolvedValueOnce(['testconfig.yaml'] as any);
    jest.mocked(readFile).mockRejectedValueOnce(new Error('missing permissions'));
    const mockedSpec = mockDeep<ApiSpec>();
    jest.mocked(ApiSpec).mockReturnValue(mockedSpec);
    await expect(service.onModuleInit()).rejects.toEqual(new Error('Could not load spec file (missing permissions)'));
  });

  it('returns the list of all specs from the file system', async () => {
    jest.mocked(readdir).mockResolvedValueOnce(['testconfig.yaml'] as any);
    jest.mocked(readFile).mockResolvedValueOnce([Buffer.from('a: 1')] as any);
    const mockedSpec = mockDeep<ApiSpec>();
    jest.mocked(ApiSpec).mockReturnValue(mockedSpec);
    await service.onModuleInit();

    expect(service.getApiSpecs()).toEqual([mockedSpec]);
    expect(ApiSpec).toBeCalledWith('testconfig', { a: 1 }, service);
  });

  it('returns spec with the given id', async () => {
    jest.mocked(readdir).mockResolvedValueOnce(['testconfig.yaml'] as any);
    jest.mocked(readFile).mockResolvedValueOnce([Buffer.from('a: 1')] as any);
    const mockedSpec = mockDeep<ApiSpec>();
    jest.mocked(ApiSpec).mockReturnValue(mockedSpec);
    await service.onModuleInit();

    const spec = service.getApiSpecById('testconfig');
    expect(spec).toEqual(mockedSpec);
  });

  it('cannot find the spec with the given id', async () => {
    jest.mocked(readdir).mockResolvedValueOnce(['testconfig.yaml'] as any);
    jest.mocked(readFile).mockResolvedValueOnce([Buffer.from('a: 1')] as any);
    const mockedSpec = mockDeep<ApiSpec>();
    jest.mocked(ApiSpec).mockReturnValue(mockedSpec);
    await service.onModuleInit();

    expect(() => service.getApiSpecById('testconfig2')).toThrow(new Error('Cannot find api spec with id "testconfig2"'));
  });

  it('follows a given $ref', async () => {
    jest.mocked(readdir).mockResolvedValueOnce(['testconfig.yaml'] as any);
    jest.mocked(readFile).mockResolvedValueOnce([
      Buffer.from(`
    a:
      a1: 
        a11: 5
      a12: 7
    b:
      b1: 
        b2: 52`),
    ] as any);
    await service.onModuleInit();
    expect(service.followRef({ namespace: ['testconfig'] }, '#/a/a1/a11')).toEqual(5);
    expect(service.followRef({ namespace: ['testconfig'] }, '#/b/b1/b2')).toEqual(52);
  });

  it('follow $ref must be provided a string', async () => {
    jest.mocked(readdir).mockResolvedValueOnce(['testconfig.yaml'] as any);
    jest.mocked(readFile).mockResolvedValueOnce([
      Buffer.from(`
    a:
      a1: 
        a11: 5
      a12: 7
    b:
      b1: 
        b2: 52`),
    ] as any);
    await service.onModuleInit();
    expect(() => service.followRef({ namespace: ['testconfig'] }, {} as any)).toThrow(new Error('[LoadSpec][testconfig] $ref must always be a string'));
  });

  it('follow $ref must start with #/', async () => {
    jest.mocked(readdir).mockResolvedValueOnce(['testconfig.yaml'] as any);
    jest.mocked(readFile).mockResolvedValueOnce([
      Buffer.from(`
    a:
      a1: 
        a11: 5
      a12: 7
    b:
      b1: 
        b2: 52`),
    ] as any);
    await service.onModuleInit();
    expect(() => service.followRef({ namespace: ['testconfig'] }, '/a/a12')).toThrow(
      new Error('[LoadSpec][testconfig] Invalid $ref. /a/a12 ($ref must start with "#/")'),
    );
  });

  it('follow $ref must reference an existing spec', async () => {
    jest.mocked(readdir).mockResolvedValueOnce(['testconfig.yaml'] as any);
    jest.mocked(readFile).mockResolvedValueOnce([
      Buffer.from(`
    a:
      a1: 
        a11: 5
      a12: 7
    b:
      b1: 
        b2: 52`),
    ] as any);
    await service.onModuleInit();
    expect(() => service.followRef({ namespace: ['testconfig2'] }, '#/a/a12')).toThrow(
      new Error('[LoadSpec][testconfig2] Invalid $ref. #/a/a12 (unknown spec)'),
    );
  });

  it('follow $ref must reference an existing item', async () => {
    jest.mocked(readdir).mockResolvedValueOnce(['testconfig.yaml'] as any);
    jest.mocked(readFile).mockResolvedValueOnce([
      Buffer.from(`
    a:
      a1: 
        a11: 5
      a12: 7
    b:
      b1: 
        b2: 52`),
    ] as any);
    await service.onModuleInit();
    expect(() => service.followRef({ namespace: ['testconfig'] }, '#/a/a33')).toThrow(
      new Error('[LoadSpec][testconfig] Invalid $ref. #/a/a33 (Invalid path: Cannot find a33)'),
    );
  });
});
