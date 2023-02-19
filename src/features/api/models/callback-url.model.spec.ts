import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { NsError } from '../../../ns-error';
import { ApiSpecsService } from '../api-specs.service';
import { CallbackUrl } from './callback-url.model';
import { Callback } from './callback.model';
import { Method } from './method.model';

jest.mock('./method.model');

describe('Callback Url', () => {
  let specService: DeepMockProxy<ApiSpecsService>;
  let parent: DeepMockProxy<Callback>;

  beforeEach(() => {
    specService = mockDeep<ApiSpecsService>();
    parent = mockDeep<Callback>({ namespace: ['test'] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('throws an error when creating with empty url', () => {
    expect(() => new CallbackUrl(parent, '', {}, specService)).toThrow(new NsError([], '[url] must be a string and not empty'));
  });

  it('throws an error when creating without rawData', () => {
    expect(() => new CallbackUrl(parent, 'url', null, specService)).toThrow(new NsError([], 'this is not based on an object'));
  });

  it('throws an error when creating with stringified rawData', () => {
    expect(() => new CallbackUrl(parent, 'url', 'null', specService)).toThrow(new NsError([], 'this is not based on an object'));
  });

  it('creates a new api callback url', () => {
    const mockedMethod = mockDeep<Method>();
    jest.mocked(Method).mockReturnValueOnce(mockedMethod);
    jest.mocked(Method.isValidMethod).mockImplementation((method) => method === 'post');

    const callbackUrl = new CallbackUrl(parent, 'url', { post: { test: 'post' } }, specService);

    expect(callbackUrl.namespace).toEqual(['test', 'url: url']);
    expect(callbackUrl.parent).toEqual(parent);
    expect(callbackUrl.url).toEqual('url');
    expect(callbackUrl.methods).toEqual([mockedMethod]);
    expect(Method).toBeCalledWith(callbackUrl, 'post', { test: 'post' }, specService);
  });

  it('follows $ref', () => {
    const mockedMethod = mockDeep<Method>();
    jest.mocked(Method).mockReturnValueOnce(mockedMethod);
    jest.mocked(Method.isValidMethod).mockImplementation((method) => method === 'post');
    specService.followRef.mockReturnValueOnce({ post: { test: 'post' } });

    const callbackUrl = new CallbackUrl(parent, 'url', { $ref: '#/callback-url/something' }, specService);

    expect(callbackUrl.namespace).toEqual(['test', 'url: url']);
    expect(callbackUrl.parent).toEqual(parent);
    expect(callbackUrl.url).toEqual('url');
    expect(callbackUrl.methods).toEqual([mockedMethod]);
    expect(Method).toBeCalledWith(callbackUrl, 'post', { test: 'post' }, specService);
    expect(specService.followRef).toBeCalledWith(callbackUrl, '#/callback-url/something');
  });
});
