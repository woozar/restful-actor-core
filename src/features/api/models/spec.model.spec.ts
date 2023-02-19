import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { NsError } from '../../../ns-error';
import { ApiSpecsService } from '../api-specs.service';
import { Path } from './path.model';
import { Server } from './server.model';
import { ApiSpec } from './spec.model';

jest.mock('./path.model');
jest.mock('./server.model');

describe('Spec', () => {
  let specService: DeepMockProxy<ApiSpecsService>;

  beforeEach(() => {
    specService = mockDeep<ApiSpecsService>();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('throws an error when creating without id', () => {
    expect(() => new ApiSpec(undefined as any, null, specService)).toThrow(new NsError([], '[id] must be a string and not empty'));
  });

  it('throws an error when creating with empty id', () => {
    expect(() => new ApiSpec('', null, specService)).toThrow(new NsError([], '[id] must be a string and not empty'));
  });

  it('throws an error when creating without rawData', () => {
    expect(() => new ApiSpec('test-v1', null, specService)).toThrow(new NsError([], 'this is not based on an object'));
  });

  it('throws an error when creating with stringified rawData', () => {
    expect(() => new ApiSpec('test-v1', 'null', specService)).toThrow(new NsError([], 'this is not based on an object'));
  });

  it('throws an error when creating without openapi', () => {
    expect(() => new ApiSpec('test-v1', {}, specService)).toThrow(new NsError([], '[openapi] mandatory property missing or empty'));
  });

  it('throws an error when creating without openapi', () => {
    expect(() => new ApiSpec('test-v1', { openapi: '1.0.0', info: { title: 'testapi' } }, specService)).toThrow(
      new NsError([], '[openapi] "1.0.0" is not a valid value for [openapi]. (Valid values: ["3.0.0", "3.0.1", "3.0.2", "3.0.3"])'),
    );
  });

  it('throws an error when creating without info', () => {
    expect(() => new ApiSpec('test-v1', { openapi: '3.0.0' }, specService)).toThrow(new NsError([], '[info] mandatory property missing or empty'));
  });

  it('throws an error when creating with info as string', () => {
    expect(() => new ApiSpec('test-v1', { openapi: '3.0.0', info: '' }, specService)).toThrow(new NsError([], '[info] mandatory property missing or empty'));
  });

  it('throws an error when creating with empty info', () => {
    expect(() => new ApiSpec('test-v1', { openapi: '3.0.0', info: {} }, specService)).toThrow(new NsError([], '[info.title] must be a string and not empty'));
  });

  it('throws an error when creating with info.title as object', () => {
    expect(() => new ApiSpec('test-v1', { openapi: '3.0.0', info: { title: {} } }, specService)).toThrow(
      new NsError([], '[info.title] must be a string and not empty'),
    );
  });

  it('throws an error when creating with missing paths', () => {
    expect(() => new ApiSpec('test-v1', { openapi: '3.0.0', info: { title: 'testapi' } }, specService)).toThrow(
      new NsError([], '[paths] mandatory property missing or empty'),
    );
  });

  it('throws an error when creating with empty paths', () => {
    expect(() => new ApiSpec('test-v1', { openapi: '3.0.0', info: { title: 'testapi' }, paths: {} }, specService)).toThrow(
      new NsError([], '[paths] mandatory property missing or empty'),
    );
  });

  it('throws an error when creating with paths array', () => {
    expect(() => new ApiSpec('test-v1', { openapi: '3.0.0', info: { title: 'testapi' }, paths: [] }, specService)).toThrow(
      new NsError([], '[paths] mandatory property missing or empty'),
    );
  });

  it('throws an error when creating with info.description as object', () => {
    expect(() => new ApiSpec('test-v1', { openapi: '3.0.0', info: { title: 'testapi', description: {} } }, specService)).toThrow(
      new NsError([], '[info.description] must be null or a string'),
    );
  });

  it('throws an error when creating with one path as string', () => {
    expect(
      () => new ApiSpec('test-v1', { openapi: '3.0.0', info: { title: 'testapi' }, paths: { '/': { path: 'root' }, '/info': 'info' } }, specService),
    ).toThrow(new NsError([], '[paths] must be a map string -> Object'));
  });

  it('creates a new spec', () => {
    const mockedPath = mockDeep<Path>();
    const mockedServer = mockDeep<Server>();
    jest.mocked(Path).mockReturnValueOnce(mockedPath);
    jest.mocked(Server).mockReturnValueOnce(mockedServer);

    const spec = new ApiSpec(
      'test-v1',
      {
        openapi: '3.0.0',
        info: { title: 'testapi', version: '1.0', description: '4 unit tests' },
        paths: { '/': { path: 'root' } },
        servers: [{ server: 'test' }],
      },
      specService,
    );

    expect(spec.openApi).toEqual('3.0.0');
    expect(spec.namespace).toEqual(['test-v1']);
    expect(spec.name).toEqual('testapi 1.0');
    expect(spec.description).toEqual('4 unit tests');
    expect(spec.paths).toEqual([mockedPath]);
    expect(spec.servers).toEqual([mockedServer]);
    expect(Path).toBeCalledWith(spec, '/', { path: 'root' }, specService);
    expect(Server).toBeCalledWith(spec, { server: 'test' }, specService);
  });

  it('follows $ref', () => {
    specService.followRef.mockReturnValueOnce({ openapi: '3.0.0', info: { title: 'testapi' }, paths: { '/': { path: 'root' } } });
    const mockedPath = mockDeep<Path>();
    jest.mocked(Path).mockReturnValueOnce(mockedPath);

    const spec = new ApiSpec('test-v1', { $ref: '#/paths/root' }, specService);

    expect(spec.openApi).toEqual('3.0.0');
    expect(spec.namespace).toEqual(['test-v1']);
    expect(spec.name).toEqual('testapi');
    expect(spec.description).toBeNull();
    expect(spec.paths).toEqual([mockedPath]);
    expect(spec.servers).toEqual([]);
    expect(Path).toBeCalledWith(spec, '/', { path: 'root' }, specService);
    expect(specService.followRef).toBeCalledWith(spec, '#/paths/root');
  });
});
