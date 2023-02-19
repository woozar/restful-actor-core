import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { NsError } from '../../../ns-error';
import { ApiSpecsService } from '../api-specs.service';
import { CallbackUrl } from './callback-url.model';
import { Callback } from './callback.model';
import { Method } from './method.model';

jest.mock('./callback-url.model');

describe('Callback', () => {
  let specService: DeepMockProxy<ApiSpecsService>;
  let parent: DeepMockProxy<Method>;

  beforeEach(() => {
    specService = mockDeep<ApiSpecsService>();
    parent = mockDeep<Method>({ namespace: ['test'] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('throws an error when creating with empty name', () => {
    expect(() => new Callback(parent, '', {}, specService)).toThrow(new NsError([], '[name] must be a string and not empty'));
  });

  it('throws an error when creating without rawData', () => {
    expect(() => new Callback(parent, 'name', null, specService)).toThrow(new NsError([], 'this is not based on an object'));
  });

  it('throws an error when creating with stringified rawData', () => {
    expect(() => new Callback(parent, 'name', 'null', specService)).toThrow(new NsError([], 'this is not based on an object'));
  });

  it('creates a new api callback', () => {
    const mockedUrl = mockDeep<CallbackUrl>();
    jest.mocked(CallbackUrl).mockReturnValueOnce(mockedUrl);

    const callback = new Callback(parent, 'name', { 'application/json;encoding=utf8': { test: 'json' } }, specService);

    expect(callback.namespace).toEqual(['test', 'callback: name']);
    expect(callback.parent).toEqual(parent);
    expect(callback.name).toEqual('name');
    expect(callback.urls).toEqual([mockedUrl]);
    expect(CallbackUrl).toBeCalledWith(callback, 'application/json;encoding=utf8', { test: 'json' }, specService);
  });

  it('follows $ref', () => {
    const mockedUrl = mockDeep<CallbackUrl>();
    jest.mocked(CallbackUrl).mockReturnValueOnce(mockedUrl);
    specService.followRef.mockReturnValueOnce({ 'application/json;encoding=utf8': { test: 'json' } });

    const callback = new Callback(parent, 'name', { $ref: '#/callback/foo' }, specService);

    expect(callback.namespace).toEqual(['test', 'callback: name']);
    expect(callback.parent).toEqual(parent);
    expect(callback.name).toEqual('name');
    expect(callback.urls).toEqual([mockedUrl]);
    expect(CallbackUrl).toBeCalledWith(callback, 'application/json;encoding=utf8', { test: 'json' }, specService);
    expect(specService.followRef).toBeCalledWith(callback, '#/callback/foo');
  });
});
