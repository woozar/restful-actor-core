import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { NsError } from '../../../ns-error';
import { ApiSpecsService } from '../api-specs.service';
import { Method } from './method.model';
import { Parameter } from './parameter.model';
import { Path } from './path.model';
import { ApiSpec } from './spec.model';

jest.mock('./parameter.model');
jest.mock('./method.model');

describe('Path', () => {
  let specService: DeepMockProxy<ApiSpecsService>;
  let parent: DeepMockProxy<ApiSpec>;

  beforeEach(() => {
    specService = mockDeep<ApiSpecsService>();
    parent = mockDeep<ApiSpec>({ namespace: ['test'] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('throws an error when creating with empty path', () => {
    expect(() => new Path(parent, undefined as any, {}, specService)).toThrow(new NsError([], '[path] must be a string and not empty'));
  });

  it('throws an error when creating with empty path', () => {
    expect(() => new Path(parent, '', {}, specService)).toThrow(new NsError([], 'every path must start with a /'));
  });

  it('throws an error when creating with invalid path', () => {
    expect(() => new Path(parent, 'invalid', {}, specService)).toThrow(new NsError([], 'every path must start with a /'));
  });

  it('throws an error when creating without rawData', () => {
    expect(() => new Path(parent, '/', null, specService)).toThrow(new NsError([], 'this is not based on an object'));
  });

  it('throws an error when creating with stringified rawData', () => {
    expect(() => new Path(parent, '/', 'null', specService)).toThrow(new NsError([], 'this is not based on an object'));
  });

  it('throws an error when creating without method', () => {
    expect(() => new Path(parent, '/', {}, specService)).toThrow(new NsError([], 'every path needs to contain at least one method'));
  });

  it('throws an error when creating with parameters object', () => {
    expect(() => new Path(parent, '/', { parameters: {} }, specService)).toThrow(new NsError([], '[parameters] must be an array'));
  });

  it('throws an error when creating with parameters list of string', () => {
    expect(() => new Path(parent, '/', { parameters: [''] }, specService)).toThrow(
      new NsError([], '[parameters] at least one item of the array is a "string" instead of a "object"'),
    );
  });

  it('throws an error when creating without method', () => {
    expect(() => new Path(parent, '/', {}, specService)).toThrow(new NsError([], 'every path needs to contain at least one method'));
  });

  it('throws an error when creating with an unsupported method', () => {
    expect(() => new Path(parent, '/', { destroy: {} }, specService)).toThrow(new NsError([], '[destroy] unexpected property'));
  });

  it('throws an error when creating with description object', () => {
    jest.mocked(Method.isValidMethod).mockImplementation((m) => m === 'post');
    expect(() => new Path(parent, '/', { post: {}, description: {} }, specService)).toThrow(new NsError([], '[description] must be null or a string'));
  });

  it('throws an error when creating with summary object', () => {
    jest.mocked(Method.isValidMethod).mockImplementation((m) => m === 'post');
    expect(() => new Path(parent, '/', { post: {}, summary: {} }, specService)).toThrow(new NsError([], '[summary] must be null or a string'));
  });

  it('creates a new path', () => {
    jest.mocked(Method.isValidMethod).mockImplementation((m) => m === 'post');

    const mockedMethod = mockDeep<Method>();
    const mockedParameter = mockDeep<Parameter>();
    jest.mocked(Method).mockReturnValueOnce(mockedMethod);
    jest.mocked(Parameter).mockReturnValueOnce(mockedParameter);

    const path = new Path(
      parent,
      '/',
      {
        summary: 'the path to good',
        description: 'a long and narrow path',
        post: { method: 'pipapost' },
        parameters: [{ parameter: 'filter' }],
      },
      specService,
    );

    expect(path.namespace).toEqual(['test', 'path: /']);
    expect(path.parent).toEqual(parent);
    expect(path.summary).toEqual('the path to good');
    expect(path.description).toEqual('a long and narrow path');
    expect(path.methods).toEqual([mockedMethod]);
    expect(path.parameters).toEqual([mockedParameter]);
    expect(Method).toBeCalledWith(path, 'post', { method: 'pipapost' }, specService);
    expect(Parameter).toBeCalledWith(path, { parameter: 'filter' }, specService);
  });

  it('follows $ref', () => {
    specService.followRef.mockReturnValueOnce({ post: { method: 'pipapost' } });
    jest.mocked(Method.isValidMethod).mockImplementation((m) => m === 'post');

    const mockedMethod = mockDeep<Method>();
    jest.mocked(Method).mockReturnValueOnce(mockedMethod);

    const path = new Path(parent, '/', { $ref: '#/methods/long-and-narrow' }, specService);

    expect(path.namespace).toEqual(['test', 'path: /']);
    expect(path.parent).toEqual(parent);
    expect(path.summary).toBeNull();
    expect(path.description).toBeNull();
    expect(path.methods).toEqual([mockedMethod]);
    expect(path.parameters).toEqual([]);
    expect(Method).toBeCalledWith(path, 'post', { method: 'pipapost' }, specService);
    expect(specService.followRef).toBeCalledWith(path, '#/methods/long-and-narrow');
  });
});
